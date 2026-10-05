import { validateCartTotal } from '../src/services/catalogPriceValidator.js';
import { validatePromoCode } from '../src/services/promoService.js';

/**
 * SERVERLESS ENDPOINT: Validate Promo Code
 * Accepts: { promoCode, cartItems, cartSubtotal }
 * Returns: Structured promo validation response with server-verified discount
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { promoCode, cartItems, cartSubtotal } = req.body || {};

    if (!promoCode || typeof promoCode !== 'string') {
      return res.status(400).json({
        valid: false,
        error_code: 'EMPTY_CODE',
        message: 'Please enter a promo code.'
      });
    }

    // 1. Recalculate trusted cart subtotal if items are provided
    let calculatedSubtotal = Number(cartSubtotal || 0);

    if (cartItems && Array.isArray(cartItems) && cartItems.length > 0) {
      const cartValidation = validateCartTotal(cartItems);
      if (cartValidation.isValid) {
        calculatedSubtotal = cartValidation.verifiedSubtotal;
      }
    }

    // 2. Perform backend promo validation
    const result = await validatePromoCode({
      promoCode,
      cartSubtotal: calculatedSubtotal,
      cartItems
    });

    return res.status(200).json(result);

  } catch (err) {
    console.error('Validate promo API error:', err);
    return res.status(500).json({
      valid: false,
      error_code: 'SERVER_ERROR',
      message: 'Unable to validate promo code. Please try again.'
    });
  }
}
