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
export async function createRazorpayOrderServer({ items, promoCode = null, coinsToUse = 0, walletBalance = 1000, walletSettings = null, customerName, customerPhone, customerEmail }) {
  try {
    const response = await fetch('/api/create-razorpay-order', {
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
export async function createInternalOrder({ customerName, customerPhone, customerEmail, city = 'Bengaluru', items, promoCode = null, coinsToUse = 0, walletBalance = 1000, walletSettings = null, userId = null, paymentMethod = 'ONLINE', razorpayOrderId = null }) {
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
  const cartValidation = validateCartTotal(items, promoCode, coinsToUse, walletBalance, walletSettings);
  if (!cartValidation.isValid) {
    return { success: false, error: cartValidation.error };
  }

  const { verifiedTotal, verifiedSubtotal, promoDiscount, coinDiscount, coinsUsed, promoCodeApplied, validatedItems } = cartValidation;
  const isCod = paymentMethod.toUpperCase() === 'COD';
  const paymentMode = isCod ? 'COD' : (isRazorpayLiveConfigured() ? 'LIVE' : 'DEMO');

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

      // If payment is COD (instantly confirmed order), trigger atomic coin deduction immediately
      if (isCod && coinsUsed > 0 && data.patient_id) {
        try {
          await supabase.rpc('deduct_wallet_coins_atomic', {
            p_patient_id: data.patient_id,
            p_coins_to_use: coinsUsed,
            p_order_id: data.order_id,
            p_description: `Redeemed on COD Order #${data.order_code}`
          });
        } catch (coinErr) {
          console.warn('COD coin deduction notice:', coinErr);
        }
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
      const { data, error } = await supabase.rpc('verify_and_confirm_order_payment', {
        p_order_id: orderId,
        p_razorpay_order_id: razorpayOrderId || 'demo_rzp_order',
        p_razorpay_payment_id: razorpayPaymentId || 'demo_rzp_pay_' + Date.now(),
        p_razorpay_signature: razorpaySignature || 'demo_sig_' + Date.now(),
        p_payment_method: paymentMethod,
        p_payment_mode: paymentMode
      });

      if (error) {
        console.error('Supabase RPC verify_and_confirm_order_payment error:', error);
        return {
          success: false,
          error: `[Verification Error ${error.code || 'VERIFY_ERR'}] ${error.message || 'Payment signature verification failed.'}`
        };
      }

      // Record atomic promo code usage if promo code was applied
      if (promoCodeId) {
        try {
          await supabase.rpc('record_promo_code_usage_atomic', {
            p_code_id: promoCodeId,
            p_order_id: orderId,
            p_patient_id: patientId,
            p_discount_applied: promoDiscount
          });
        } catch (promoErr) {
          console.warn('Failed to record atomic promo usage:', promoErr);
        }
      }

      // Deduct coins atomically if coins were used
      if (coinsUsed > 0 && patientId) {
        try {
          await supabase.rpc('deduct_wallet_coins_atomic', {
            p_patient_id: patientId,
            p_coins_to_use: coinsUsed,
            p_order_id: orderId,
            p_description: `Redeemed on Order #${data.order_code || orderId}`
          });
        } catch (coinErr) {
          console.warn('Failed to record atomic coin deduction:', coinErr);
        }
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
