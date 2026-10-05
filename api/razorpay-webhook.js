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
 * SERVER-SIDE ONLY ENDPOINT: Razorpay Webhook Endpoint (/api/payments/webhook)
 * 1. Verifies X-Razorpay-Signature using RAZORPAY_WEBHOOK_SECRET
 * 2. Idempotently updates order & payment status in Supabase database using Service-Role client
 */
export async function handleRazorpayWebhook(rawBodyText, signatureHeader) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.warn('RAZORPAY_WEBHOOK_SECRET is not configured on server.');
    return { status: 400, body: { error: 'Webhook secret not configured on server.' } };
  }

  if (!signatureHeader) {
    return { status: 400, body: { error: 'Missing X-Razorpay-Signature header.' } };
  }

  // 1. Verify Webhook Signature using HMAC-SHA256
  try {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBodyText)
      .digest('hex');

    if (expectedSignature !== signatureHeader) {
      console.error('Razorpay Webhook Signature Mismatch!');
      return { status: 400, body: { error: 'Invalid webhook signature.' } };
    }
  } catch (err) {
    console.error('Webhook signature verification exception:', err);
    return { status: 500, body: { error: 'Signature verification error.' } };
  }

  // 2. Parse Event Body
  let payload;
  try {
    payload = JSON.parse(rawBodyText);
  } catch (err) {
    return { status: 400, body: { error: 'Invalid JSON payload.' } };
  }

  const event = payload.event;
  const paymentEntity = payload.payload?.payment?.entity;
  const razorpayOrderId = paymentEntity?.order_id;
  const razorpayPaymentId = paymentEntity?.id;
  const paymentMethod = paymentEntity?.method || 'unknown';

  if (!razorpayOrderId) {
    return { status: 200, body: { status: 'Ignored (No order_id in event)' } };
  }

  // 3. Process Events Idempotently via Service-Role Client
  const serviceRoleSupabase = getServiceRoleSupabase();

  if (event === 'payment.captured' || event === 'order.paid') {
    if (serviceRoleSupabase) {
      try {
        // Find matching payment record
        const { data: payments } = await serviceRoleSupabase
          .from('payments')
          .select('order_id, payment_status')
          .eq('razorpay_order_id', razorpayOrderId)
          .limit(1);

        if (payments && payments.length > 0) {
          const targetOrderId = payments[0].order_id;

          // Idempotent Check: If already PAID, return 200 OK without re-mutating
          if (payments[0].payment_status === 'PAID') {
            return { status: 200, body: { status: 'OK (Already processed idempotently)' } };
          }

          // Execute RPC using privileged Service-Role Supabase Client
          await serviceRoleSupabase.rpc('verify_and_confirm_order_payment', {
            p_order_id: targetOrderId,
            p_razorpay_order_id: razorpayOrderId,
            p_razorpay_payment_id: razorpayPaymentId,
            p_razorpay_signature: 'webhook_verified',
            p_payment_method: paymentMethod,
            p_payment_mode: 'LIVE'
          });
        }
      } catch (dbErr) {
        console.error('Webhook database update error via service-role:', dbErr);
        return { status: 500, body: { error: 'Failed to update database via webhook.' } };
      }
    }
  } else if (event === 'payment.failed') {
    if (serviceRoleSupabase) {
      try {
        const { data: payments } = await serviceRoleSupabase
          .from('payments')
          .select('order_id, payment_status')
          .eq('razorpay_order_id', razorpayOrderId)
          .limit(1);

        if (payments && payments.length > 0) {
          if (payments[0].payment_status === 'PAID') {
            return { status: 200, body: { status: 'Ignored payment.failed because payment is already PAID' } };
          }
          const targetOrderId = payments[0].order_id;
          const failureReason = paymentEntity?.error_description || 'Payment failed.';

          await serviceRoleSupabase
            .from('payments')
            .update({
              payment_status: 'FAILED',
              error_message: failureReason,
              updated_at: new Date().toISOString()
            })
            .eq('razorpay_order_id', razorpayOrderId);

          await serviceRoleSupabase
            .from('orders')
            .update({
              payment_status: 'FAILED',
              updated_at: new Date().toISOString()
            })
            .eq('id', targetOrderId);
        }
      } catch (dbErr) {
        console.error('Webhook failure handler error via service-role:', dbErr);
      }
    }
  }

  return { status: 200, body: { status: 'SUCCESS', event } };
}

/**
 * VERCEL SERVERLESS FUNCTION DEFAULT EXPORT
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  const signature = req.headers['x-razorpay-signature'];
  const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
  const result = await handleRazorpayWebhook(rawBody, signature);
  return res.status(result.status).json(result.body);
}
