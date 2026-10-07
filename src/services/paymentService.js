import { supabase, isSupabaseConfigured } from '../lib/supabase.js';
import { validateCartTotal } from './catalogPriceValidator.js';
import { validateAndNormalizeInternationalPhone } from '../utils/phone.js';

const getEnvVar = (name) => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[name]) {
      return import.meta.env[name];
    }
  } catch (e) {
    // Ignore
  }
  try {
    if (typeof process !== 'undefined' && process.env && process.env[name]) {
      return process.env[name];
    }
  } catch (e) {
    // Ignore
  }
  return null;
};

// Backend API Base URL for Hostinger Static Deployment (defaults to relative URL if omitted)
const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) || '';

// Razorpay Public Key ID (Front-end safe)
export const VITE_RAZORPAY_KEY_ID = getEnvVar('VITE_RAZORPAY_KEY_ID');

/**
 * Checks if live/test Razorpay API credentials are configured
 */
export function isRazorpayLiveConfigured() {
  return Boolean(VITE_RAZORPAY_KEY_ID && VITE_RAZORPAY_KEY_ID.startsWith('rzp_'));
}

/**
 * Dynamically loads Razorpay checkout SDK
 */
export function loadRazorpaySDK() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay Checkout SDK');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

/**
 * Calls server-side endpoint /api/create-razorpay-order to generate an official Razorpay Order ID (order_...)
 */
export async function createRazorpayOrderServer({ items, promoCode = null, coinsToUse = 0, walletBalance = 0, walletSettings = null, customerName, customerPhone, customerEmail }) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/create-razorpay-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, promoCode, coinsToUse, walletBalance, walletSettings, customerName, customerPhone, customerEmail })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return { success: false, error: errData.error || `Server API error (${response.status})` };
    }

    const data = await response.json();
    return { success: true, ...data };
  } catch (err) {
    console.error('Fetch create-razorpay-order exception:', err);
    return { success: false, error: err.message || 'Failed to call Razorpay order API.' };
  }
}

/**
 * Creates internal order in database for either COD or ONLINE payment method
 */
export async function createInternalOrder({ customerName, customerPhone, customerEmail, city = 'Bengaluru', items, promoCode = null, coinsToUse = 0, walletBalance = 0, walletSettings = null, userId = null, paymentMethod = 'ONLINE', razorpayOrderId = null }) {
  // 1. Validate inputs
  if (!customerName || customerName.trim().length < 2) {
    return { success: false, error: 'Please enter your full name (minimum 2 characters).' };
  }

  const phoneValidation = validateAndNormalizeInternationalPhone(customerPhone);
  if (!phoneValidation.isValid) {
    return { success: false, error: phoneValidation.error };
  }
  const phone_e164 = phoneValidation.phone_e164;

  // 2. Validate Cart & Recalculate trusted total amount on server/backend logic
  const cartValidation = await validateCartTotal(items, promoCode, coinsToUse, walletBalance, walletSettings);
  if (!cartValidation.isValid) {
    return { success: false, error: cartValidation.error };
  }

  const { verifiedTotal, verifiedSubtotal, promoDiscount, coinDiscount, coinsUsed, promoCodeApplied, validatedItems } = cartValidation;
  const isCod = paymentMethod.toUpperCase() === 'COD';
  const paymentMode = isRazorpayLiveConfigured() ? 'LIVE' : 'DEMO';

  // 3. Database persistence via Supabase RPC
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.rpc('create_checkout_order', {
        p_customer_name: customerName.trim(),
        p_customer_phone: phone_e164,
        p_customer_email: customerEmail ? customerEmail.trim() : null,
        p_city: city,
        p_items: validatedItems,
        p_total_amount: verifiedTotal,
        p_razorpay_order_id: isCod ? `cod_ord_${Date.now()}` : (razorpayOrderId || null),
        p_payment_mode: paymentMode,
        p_user_id: userId,
        p_payment_method: isCod ? 'COD' : 'ONLINE',
        p_coins_used: coinsUsed,
        p_coin_discount: coinDiscount,
        p_promo_code: promoCodeApplied?.code || null,
        p_promo_discount: promoDiscount
      });

      if (error) {
        console.error('Supabase RPC create_checkout_order error:', error);
        return {
          success: false,
          error: `[Database Error ${error.code || 'DB_ERR'}] ${error.message || 'Failed to initialize order.'}`
        };
      }

      return {
        success: true,
        order_id: data.order_id,
        order_code: data.order_code,
        patient_id: data.patient_id,
        razorpay_order_id: data.razorpay_order_id,
        subtotal: verifiedSubtotal,
        promo_discount: promoDiscount,
        promo_code: promoCodeApplied?.code || null,
        promo_code_id: promoCodeApplied?.id || null,
        coin_discount: coinDiscount,
        coins_used: coinsUsed,
        total_amount: verifiedTotal,
        currency: 'INR',
        payment_method: isCod ? 'COD' : 'ONLINE',
        payment_mode: paymentMode,
        payment_status: 'PENDING',
        order_status: isCod ? 'CONFIRMED' : 'PENDING',
        items: validatedItems,
        customer_name: customerName.trim(),
        customer_phone: phone_e164
      };
    } catch (err) {
      console.error('Order creation exception:', err);
      return { success: false, error: `[Error EXCEPTION] ${err.message || 'Could not process order.'}` };
    }
  }

  // Fallback demo object if Supabase env is not connected
  const demoOrderId = (isCod ? 'cod_ord_' : 'demo_ord_') + Date.now();
  const demoOrderCode = 'HEX-ORD-' + Math.floor(Math.random() * 8999 + 1000);
  return {
    success: true,
    order_id: demoOrderId,
    order_code: demoOrderCode,
    patient_id: 'demo_patient_' + Date.now(),
    razorpay_order_id: isCod ? 'cod_no_rzp' : 'demo_rzp_ord_' + Date.now(),
    subtotal: verifiedSubtotal,
    promo_discount: promoDiscount,
    promo_code: promoCodeApplied?.code || null,
    promo_code_id: promoCodeApplied?.id || null,
    coin_discount: coinDiscount,
    coins_used: coinsUsed,
    total_amount: verifiedTotal,
    currency: 'INR',
    payment_method: isCod ? 'COD' : 'ONLINE',
    payment_mode: paymentMode,
    payment_status: 'PENDING',
    order_status: isCod ? 'CONFIRMED' : 'PENDING',
    items: validatedItems,
    customer_name: customerName.trim(),
    customer_phone: phone_e164
  };
}

/**
 * Verifies payment signature and updates database state to PAID / CONFIRMED.
 * Atomic promo code usage and Health Coins deduction are executed from server-side order confirmation.
 */
export async function verifyAndConfirmPayment({ orderId, promoCodeId = null, patientId = null, promoDiscount = 0, coinsUsed = 0, razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentMethod = 'unknown', paymentMode = 'DEMO' }) {
  if (!orderId) {
    return { success: false, error: 'Missing internal Order ID.' };
  }

  if (isSupabaseConfigured) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/verify-razorpay-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: razorpayPaymentId,
          razorpay_signature: razorpaySignature,
          payment_method: paymentMethod,
          payment_mode: paymentMode,
          promo_code_id: promoCodeId,
          patient_id: patientId,
          promo_discount: promoDiscount,
          coins_used: coinsUsed
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || (data.isValid === false && data.success === false)) {
        return {
          success: false,
          error: data.error || 'Payment signature verification failed on server.'
        };
      }

      return {
        success: true,
        already_verified: data.already_verified || false,
        order_code: data.order_code,
        customer_name: data.customer_name,
        customer_phone: data.customer_phone,
        total_amount: data.total_amount,
        payment_status: 'PAID',
        order_status: 'CONFIRMED',
        payment_mode: paymentMode
      };
    } catch (err) {
      console.error('Verification exception:', err);
      return { success: false, error: `[Error EXCEPTION] ${err.message || 'Failed to verify payment.'}` };
    }
  }

  // Fallback demo verification response
  return {
    success: true,
    already_verified: false,
    order_code: 'HEX-ORD-DEMO',
    total_amount: 299,
    payment_status: 'PAID',
    order_status: 'CONFIRMED',
    payment_mode: 'DEMO'
  };
}
