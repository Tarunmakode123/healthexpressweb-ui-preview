import crypto from 'crypto';

/**
 * SERVER-SIDE ONLY ENDPOINT: Verify Razorpay Payment Signature
 * Formula: HMAC_SHA256(razorpay_order_id + "|" + razorpay_payment_id, secret)
 */
export async function handleVerifyRazorpayPayment(reqBody) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = reqBody || {};

  if (!order_id) {
    return {
      status: 400,
      body: { isValid: false, error: 'Missing internal order_id.' }
    };
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  // In DEMO mode (when no live Razorpay key secret is set), allow demo payment verification with mode = DEMO
  if (!keySecret || (razorpay_order_id && razorpay_order_id.startsWith('demo_'))) {
    return {
      status: 200,
      body: {
        isValid: true,
        mode: 'DEMO',
        order_id,
        razorpay_order_id: razorpay_order_id || 'demo_rzp_ord',
        razorpay_payment_id: razorpay_payment_id || 'demo_rzp_pay_' + Date.now(),
        message: 'Demo Payment verified. Mode: DEMO.'
      }
    };
  }

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return {
      status: 400,
      body: { isValid: false, error: 'Missing required Razorpay payment verification parameters.' }
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
        body: { isValid: false, error: 'Invalid payment signature. Verification failed.' }
      };
    }

    return {
      status: 200,
      body: {
        isValid: true,
        mode: 'LIVE',
        order_id,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      }
    };
  } catch (err) {
    console.error('Signature verification exception:', err);
    return {
      status: 500,
      body: { isValid: false, error: 'Server error verifying payment signature.' }
    };
  }
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

