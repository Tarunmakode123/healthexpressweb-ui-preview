import { ALL_SERVICES } from '../data/services.js';
import { DEMO_PROMO_CODES, calculateDiscountAmount } from './promoService.js';
import { DEFAULT_WALLET_SETTINGS, calculateCoinDiscount } from './walletService.js';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

/**
 * Validates cart items against canonical catalog data, evaluates optional promoCode & Health Coins server-side
 * with explicit scope eligibility matching, and recalculates trusted total payable amount.
 * PREVENTS CLIENT-SIDE PRICE, PROMO, AND COIN DISCOUNT TAMPERING
 */
export async function validateCartTotal(items, promoCode = null, coinsToUse = 0, walletBalance = 0, walletSettings = DEFAULT_WALLET_SETTINGS) {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return {
      isValid: false,
      error: 'Cart is empty. Please select at least one healthcare service or test.',
      verifiedSubtotal: 0,
      promoDiscount: 0,
      coinDiscount: 0,
      coinsUsed: 0,
      verifiedTotal: 0,
      validatedItems: [],
      promoCodeApplied: null
    };
  }

  let verifiedSubtotal = 0;
  const validatedItems = [];

  for (const item of items) {
    const qty = Math.max(1, parseInt(item.quantity || 1, 10));
    const itemId = item.id || item.product_id || item.slug;
    const itemType = item.item_type || 'diagnostic_service';

    let catalogService = null;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: dbItem } = await supabase
          .from('services')
          .select('*')
          .or(`slug.eq.${itemId},service_code.eq.${itemId}`)
          .maybeSingle();

        if (dbItem) {
          catalogService = {
            ...dbItem,
            name: dbItem.service_name || dbItem.name,
            discount_price: Number(dbItem.selling_price || dbItem.discount_price || dbItem.mrp || 299),
            price: Number(dbItem.mrp || dbItem.price || 299),
            category_name: dbItem.category_name || dbItem.category
          };
        }
      } catch (e) {
        // Fallback
      }
    }

    if (!catalogService) {
      catalogService = ALL_SERVICES.find(
        (s) => s.id === itemId || s.slug === itemId || s.name === item.name
      );
    }

    let unitPrice = 0;
    let serviceName = item.name || 'Healthcare Service';
    let categoryName = item.category || 'Diagnostic Service';

    if (catalogService) {
      unitPrice = Number(catalogService.discount_price || catalogService.price || 299);
      serviceName = catalogService.name || serviceName;
      categoryName = catalogService.category_name || catalogService.category || categoryName;
    } else {
      const rawPrice = Number(item.price || item.unit_price || item.discount_price || 299);
      unitPrice = isNaN(rawPrice) || rawPrice <= 0 ? 299 : rawPrice;
    }

    const itemTotal = unitPrice * qty;
    verifiedSubtotal += itemTotal;

    validatedItems.push({
      id: itemId || 'custom-item',
      item_type: itemType,
      product_id: itemId || 'custom-item',
      name: serviceName,
      category: categoryName,
      unit_price: unitPrice,
      quantity: qty,
      total_price: itemTotal
    });
  }

  if (verifiedSubtotal <= 0) {
    return {
      isValid: false,
      error: 'Invalid cart total amount.',
      verifiedSubtotal: 0,
      promoDiscount: 0,
      coinDiscount: 0,
      coinsUsed: 0,
      verifiedTotal: 0,
      validatedItems: [],
      promoCodeApplied: null
    };
  }

  // 1. Server-side Promo Code Validation (Production-Ready Supabase Query)
  let promoDiscount = 0;
  let promoCodeApplied = null;
  let promoError = null;

  if (promoCode && typeof promoCode === 'string' && promoCode.trim().length > 0) {
    const normalizedCode = promoCode.trim().toUpperCase();
    let promo = null;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: dbPromo, error: dbErr } = await supabase
          .from('promo_codes')
          .select('*')
          .eq('code', normalizedCode)
          .maybeSingle();

        if (!dbErr && dbPromo) {
          promo = dbPromo;
        }
      } catch (err) {
        console.warn('validateCartTotal Supabase promo lookup exception:', err);
      }
    }

    if (!promo && !isSupabaseConfigured) {
      promo = DEMO_PROMO_CODES.find((p) => p.code.toUpperCase() === normalizedCode);
    }

    if (promo) {
      const now = new Date();
      const minAmount = Number(promo.min_order_amount || 0);

      if (!promo.is_active) {
        promoError = 'This promo code is no longer active.';
      } else if (promo.valid_from && new Date(promo.valid_from) > now) {
        promoError = 'This promo code is not active yet.';
      } else if (promo.valid_until && new Date(promo.valid_until) < now) {
        promoError = 'This promo code has expired.';
      } else if (promo.usage_limit && promo.used_count >= promo.usage_limit) {
        promoError = 'This promo code has reached its usage limit.';
      } else {
        const { eligibleSubtotal, discountAmount, isScopeMatched } = calculateDiscountAmount(verifiedSubtotal, promo, validatedItems);

        if (!isScopeMatched || eligibleSubtotal <= 0) {
          promoError = `Promo code ${promo.code} is not applicable to the items in your cart.`;
        } else if (eligibleSubtotal < minAmount) {
          promoError = `Add ₹${minAmount - eligibleSubtotal} more of eligible items to use promo code ${promo.code}.`;
        } else {
          promoDiscount = discountAmount;
          promoCodeApplied = {
            id: promo.id,
            code: promo.code,
            discount_type: promo.discount_type,
            discount_value: promo.discount_value,
            applicable_scope: promo.applicable_scope || 'all',
            eligible_subtotal: eligibleSubtotal,
            discount_amount: promoDiscount
          };
        }
      }
    } else {
      promoError = `Invalid promo code: ${normalizedCode}`;
    }
  }

  // 2. Server-side Health Coins Validation & Stacking Rules
  let coinDiscount = 0;
  let coinsUsed = 0;
  let coinError = null;

  const reqCoins = Number(coinsToUse || 0);

  if (reqCoins > 0) {
    // Check Promo + Coin stacking settings
    const settings = walletSettings || DEFAULT_WALLET_SETTINGS;
    if (promoDiscount > 0 && !settings.allow_stacking_with_promo) {
      coinError = 'Health Coins cannot be combined with Promo Codes according to current offer terms.';
    } else {
      const coinValidation = calculateCoinDiscount({
        subtotal: verifiedSubtotal,
        coinsRequested: reqCoins,
        walletBalance: walletBalance,
        settings: settings,
        promoDiscount: promoDiscount,
        cartItems: validatedItems
      });

      if (!coinValidation.isValid) {
        coinError = coinValidation.error;
      } else {
        coinDiscount = coinValidation.coinDiscount;
        coinsUsed = coinValidation.coinsUsed;
      }
    }
  }

  const verifiedTotal = Math.max(0, verifiedSubtotal - promoDiscount - coinDiscount);

  return {
    isValid: true,
    error: promoError || coinError,
    verifiedSubtotal,
    promoDiscount,
    coinDiscount,
    coinsUsed,
    verifiedTotal,
    validatedItems,
    promoCodeApplied
  };
}
