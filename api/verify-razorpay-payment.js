import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

/**
 * Helper: Instantiate Server-Side Supabase Client with SUPABASE_SERVICE_ROLE_KEY
 * NEVER EXPOSE SERVICE ROLE KEY TO BROWSER CLIENTS
 */
function getServiceRoleSupabase() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (url && serviceKey) {
    return createClient(url, serviceKey, {
      auth: { persistSession: false }
    });
  }
  return null;
}

/**
 * SERVER-SIDE ONLY ENDPOINT: Verify Razorpay Payment Signature & Execute Service-Role Payment Confirmation
 * Formula: HMAC_SHA256(razorpay_order_id + "|" + razorpay_payment_id, secret)
 */
export async function handleVerifyRazorpayPayment(reqBody) {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    order_id,
    payment_method = 'unknown',
    payment_mode = 'DEMO',
    promo_code_id = null,
    patient_id = null,
    promo_discount = 0
  } = reqBody || {};

  if (!order_id) {
    return {
      status: 400,
      body: { isValid: false, success: false, error: 'Missing internal order_id.' }
    };
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  // 1. HMAC Signature Verification (or DEMO mode fallback)
  let isVerified = false;
  let effectiveMode = upper(payment_mode || 'DEMO');

  if (!keySecret || (razorpay_order_id && razorpay_order_id.startsWith('demo_'))) {
    isVerified = true;
    effectiveMode = 'DEMO';
  } else {
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return {
        status: 400,
        body: { isValid: false, success: false, error: 'Missing required Razorpay payment verification parameters.' }
      };
    }

    try {
      const text = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(text)
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        console.error('Razorpay Signature Mismatch!', { expectedSignature, razorpay_signature });
        return {
          status: 400,
          body: { isValid: false, success: false, error: 'Invalid payment signature. Verification failed.' }
        };
      }
      isVerified = true;
      effectiveMode = 'LIVE';
    } catch (err) {
      console.error('Signature verification exception:', err);
      return {
        status: 500,
        body: { isValid: false, success: false, error: 'Server error verifying payment signature.' }
      };
    }
  }

  if (!isVerified) {
    return {
      status: 400,
      body: { isValid: false, success: false, error: 'Signature verification failed.' }
    };
  }

  // 2. Execute Privileged Payment Confirmation via Server-Side Service-Role Supabase Client
  const serviceRoleSupabase = getServiceRoleSupabase();

  if (serviceRoleSupabase) {
    try {
      const { data: rpcData, error: rpcError } = await serviceRoleSupabase.rpc('verify_and_confirm_order_payment', {
        p_order_id: order_id,
        p_razorpay_order_id: razorpay_order_id || 'demo_rzp_ord',
        p_razorpay_payment_id: razorpay_payment_id || 'demo_rzp_pay_' + Date.now(),
        p_razorpay_signature: razorpay_signature || 'demo_sig',
        p_payment_method: payment_method,
        p_payment_mode: effectiveMode
      });

      if (rpcError) {
        console.error('Service-Role RPC verify_and_confirm_order_payment error:', rpcError);
        return {
          status: 400,
          body: {
            isValid: true,
            success: false,
            error: `[Payment Confirmation Failed] ${rpcError.message}`
          }
        };
      }

      // Record atomic promo code usage if promo code was applied
      if (promo_code_id) {
        try {
          await serviceRoleSupabase.rpc('record_promo_code_usage_atomic', {
            p_code_id: promo_code_id,
            p_order_id: order_id,
            p_patient_id: patient_id,
            p_discount_applied: promo_discount
          });
        } catch (promoErr) {
          console.warn('Failed to record promo usage via service-role:', promoErr);
        }
      }

      return {
        status: 200,
        body: {
          isValid: true,
          success: true,
          already_verified: rpcData?.already_verified || false,
          order_id: rpcData?.order_id || order_id,
          order_code: rpcData?.order_code,
          customer_name: rpcData?.customer_name,
          customer_phone: rpcData?.customer_phone,
          total_amount: rpcData?.total_amount,
          payment_status: 'PAID',
          order_status: 'CONFIRMED',
          payment_mode: effectiveMode
        }
      };
    } catch (dbErr) {
      console.error('Service-Role DB update exception:', dbErr);
      return {
        status: 500,
        body: { isValid: true, success: false, error: 'Failed to update order state in database.' }
      };
    }
  }

  // Fallback demo response if Supabase URL/key not set
  return {
    status: 200,
    body: {
      isValid: true,
      success: true,
      mode: effectiveMode,
      order_id,
      payment_status: 'PAID',
      order_status: 'CONFIRMED',
      message: 'Payment verified in local demo mode.'
    }
  };
}

function upper(val) {
  return typeof val === 'string' ? val.toUpperCase() : val;
}

/**
 * VERCEL SERVERLESS FUNCTION DEFAULT EXPORT
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  const result = await handleVerifyRazorpayPayment(req.body);
  return res.status(result.status).json(result.body);
}
