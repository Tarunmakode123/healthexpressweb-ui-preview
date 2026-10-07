import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

// Backend API Base URL for Hostinger Static Deployment (defaults to relative URL if omitted)
const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) || '';

/**
 * DEMO / FALLBACK PROMO CODES
 * Used when operating in local development demo mode without Supabase
 */
export const DEMO_PROMO_CODES = [
  {
    id: 'demo_promo_1',
    code: 'HEALTH50',
    discount_type: 'flat',
    discount_value: 50,
    min_order_amount: 299,
    max_discount: null,
    applicable_scope: 'all',
    applicable_categories: [],
    applicable_items: [],
    valid_from: new Date(Date.now() - 86400000).toISOString(),
    valid_until: new Date(Date.now() + 90 * 86400000).toISOString(),
    usage_limit: 500,
    used_count: 12,
    is_active: true
  },
  {
    id: 'demo_promo_2',
    code: 'WELCOME10',
    discount_type: 'percentage',
    discount_value: 10,
    min_order_amount: 199,
    max_discount: 150,
    applicable_scope: 'all',
    applicable_categories: [],
    applicable_items: [],
    valid_from: new Date(Date.now() - 86400000).toISOString(),
    valid_until: new Date(Date.now() + 90 * 86400000).toISOString(),
    usage_limit: 1000,
    used_count: 45,
    is_active: true
  },
  {
    id: 'demo_promo_3',
    code: 'LABTEST20',
    discount_type: 'percentage',
    discount_value: 20,
    min_order_amount: 399,
    max_discount: 200,
    applicable_scope: 'categories',
    applicable_categories: ['Lab Tests', 'lab-tests', 'Diagnostic Service'],
    applicable_items: [],
    valid_from: new Date(Date.now() - 86400000).toISOString(),
    valid_until: new Date(Date.now() + 90 * 86400000).toISOString(),
    usage_limit: 300,
    used_count: 5,
    is_active: true
  }
];

/**
 * Determines item eligibility and calculates scope-restricted discount amount
 */
export function calculateDiscountAmount(subtotal, promo, items = []) {
  if (!promo || !subtotal || subtotal <= 0) {
    return { eligibleSubtotal: 0, discountAmount: 0, isScopeMatched: false };
  }

  const scope = (promo.applicable_scope || 'all').toLowerCase();
  const rawCategories = Array.isArray(promo.applicable_categories)
    ? promo.applicable_categories
    : typeof promo.applicable_categories === 'string'
      ? JSON.parse(promo.applicable_categories || '[]')
      : [];
  const rawItems = Array.isArray(promo.applicable_items)
    ? promo.applicable_items
    : typeof promo.applicable_items === 'string'
      ? JSON.parse(promo.applicable_items || '[]')
      : [];

  const appCategories = rawCategories.map((c) => String(c).toLowerCase().trim());
  const appItems = rawItems.map((i) => String(i).toLowerCase().trim());

  let eligibleSubtotal = 0;
  let isScopeMatched = false;

  if (scope === 'all' || (appCategories.length === 0 && appItems.length === 0 && scope !== 'categories' && scope !== 'items')) {
    eligibleSubtotal = subtotal;
    isScopeMatched = true;
  } else if (!items || items.length === 0) {
    // If no individual item breakdown is provided, fall back to subtotal
    eligibleSubtotal = subtotal;
    isScopeMatched = true;
  } else {
    for (const item of items) {
      const itemPrice = Number(item.unit_price || item.price || 0);
      const qty = Math.max(1, parseInt(item.quantity || 1, 10));
      const itemSubtotal = itemPrice * qty;

      const catName = String(item.category || item.category_name || item.item_type || '').toLowerCase().trim();
      const itemId = String(item.id || item.product_id || item.slug || '').toLowerCase().trim();
      const itemName = String(item.name || '').toLowerCase().trim();

      let isEligible = false;

      if (scope === 'categories') {
        isEligible = appCategories.some((cat) => catName.includes(cat) || cat.includes(catName));
      } else if (scope === 'items') {
        isEligible = appItems.some((target) => itemId === target || itemName.includes(target) || target.includes(itemName));
      }

      if (isEligible) {
        eligibleSubtotal += itemSubtotal;
        isScopeMatched = true;
      }
    }
  }

  if (eligibleSubtotal <= 0 || !isScopeMatched) {
    return { eligibleSubtotal: 0, discountAmount: 0, isScopeMatched: false };
  }

  const type = (promo.discount_type || 'flat').toLowerCase();
  const value = Number(promo.discount_value || 0);
  let discount = 0;

  if (type === 'flat') {
    discount = Math.min(value, eligibleSubtotal);
  } else if (type === 'percentage') {
    discount = (eligibleSubtotal * value) / 100;
    if (promo.max_discount && Number(promo.max_discount) > 0) {
      discount = Math.min(discount, Number(promo.max_discount));
    }
  }

  const finalDiscount = Math.min(subtotal, Math.max(0, Math.round(discount)));

  return {
    eligibleSubtotal,
    discountAmount: finalDiscount,
    isScopeMatched: true
  };
}

/**
 * Fetches active public promotions for customer display in "Available Offers"
 */
export async function fetchActivePromotions() {
  if (!isSupabaseConfigured) {
    return {
      success: true,
      promotions: DEMO_PROMO_CODES.filter((p) => p.is_active)
    };
  }

  try {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('promo_codes')
      .select('id, code, discount_type, discount_value, min_order_amount, max_discount, applicable_scope, applicable_categories, applicable_items, valid_until')
      .eq('is_active', true)
      .lte('valid_from', now)
      .order('discount_value', { ascending: false });

    if (error) {
      console.warn('Fetch active promotions error:', error.message);
      return { success: true, promotions: DEMO_PROMO_CODES.filter((p) => p.is_active) };
    }

    const filtered = (data || []).filter(
      (p) => !p.valid_until || new Date(p.valid_until) >= new Date()
    );

    return { success: true, promotions: filtered };
  } catch (err) {
    console.error('Fetch active promotions exception:', err);
    return { success: true, promotions: DEMO_PROMO_CODES.filter((p) => p.is_active) };
  }
}

/**
 * Validates promo code on client or calls backend endpoint
 */
export async function validatePromoCode({ promoCode, cartSubtotal, cartItems = [] }) {
  const normalizedCode = (promoCode || '').trim().toUpperCase();

  if (!normalizedCode) {
    return {
      valid: false,
      error_code: 'EMPTY_CODE',
      message: 'Please enter a promo code.'
    };
  }

  // Try calling serverless API endpoint first
  try {
    const response = await fetch(`${API_BASE_URL}/api/validate-promo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ promoCode: normalizedCode, cartItems, cartSubtotal })
    });

    if (response.ok) {
      const result = await response.json();
      return result;
    }
  } catch (e) {
    // Fall back to client-side database/in-memory validation if server API is unavailable
  }

  // Database / Fallback Validation
  let promo = null;

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', normalizedCode)
        .maybeSingle();

      if (!error && data) {
        promo = data;
      }
    } catch (e) {
      console.warn('Supabase promo lookup warning:', e);
    }
  }

  if (!promo) {
    promo = DEMO_PROMO_CODES.find((p) => p.code.toUpperCase() === normalizedCode);
  }

  if (!promo) {
    return {
      valid: false,
      error_code: 'PROMO_NOT_FOUND',
      message: "That promo code isn't valid."
    };
  }

  if (!promo.is_active) {
    return {
      valid: false,
      error_code: 'PROMO_INACTIVE',
      message: 'This promo code is no longer active.'
    };
  }

  const now = new Date();
  if (promo.valid_from && new Date(promo.valid_from) > now) {
    return {
      valid: false,
      error_code: 'PROMO_NOT_STARTED',
      message: 'This promo code is not active yet.'
    };
  }

  if (promo.valid_until && new Date(promo.valid_until) < now) {
    return {
      valid: false,
      error_code: 'PROMO_EXPIRED',
      message: 'This promo code has expired.'
    };
  }

  if (promo.usage_limit && promo.used_count >= promo.usage_limit) {
    return {
      valid: false,
      error_code: 'USAGE_LIMIT_REACHED',
      message: 'This promo code has reached its usage limit.'
    };
  }

  // Evaluate Scope Eligibility
  const { eligibleSubtotal, discountAmount, isScopeMatched } = calculateDiscountAmount(cartSubtotal, promo, cartItems);

  if (!isScopeMatched || eligibleSubtotal <= 0) {
    const scopeName = promo.applicable_scope === 'categories' ? 'the selected category' : 'the items in your cart';
    return {
      valid: false,
      error_code: 'INELIGIBLE_ITEMS',
      message: `Promo code ${promo.code} is not applicable to ${scopeName}.`
    };
  }

  const minAmount = Number(promo.min_order_amount || 0);
  if (eligibleSubtotal < minAmount) {
    const needed = minAmount - eligibleSubtotal;
    return {
      valid: false,
      error_code: 'MIN_ORDER_NOT_MET',
      message: `Add ₹${needed} more of eligible items to use promo code ${promo.code}.`
    };
  }

  const payableAmount = Math.max(0, cartSubtotal - discountAmount);

  return {
    valid: true,
    code: promo.code,
    promo_id: promo.id,
    discount_type: promo.discount_type,
    discount_value: promo.discount_value,
    max_discount: promo.max_discount,
    applicable_scope: promo.applicable_scope || 'all',
    eligible_subtotal: eligibleSubtotal,
    discount_amount: discountAmount,
    subtotal: cartSubtotal,
    payable_amount: payableAmount,
    message: `✓ ${promo.code} applied successfully! You saved ₹${discountAmount}.`
  };
}
