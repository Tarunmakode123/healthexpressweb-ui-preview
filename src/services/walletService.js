import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

export const DEFAULT_WALLET_SETTINGS = {
  signup_reward_enabled: true,
  signup_reward_coins: 1000,
  coins_per_rupee: 10,
  minimum_coins_to_redeem: 100,
  maximum_coins_per_order: 500,
  minimum_order_amount: 299,
  allow_stacking_with_promo: true,
  coin_expiry_enabled: false,
  default_expiry_days: 90,
  redemption_enabled: true,
  applicable_scope: 'all',
  applicable_categories: [],
  applicable_items: []
};

/**
 * Fetch active global wallet configuration settings from Supabase
 */
export async function fetchWalletSettings() {
  if (!isSupabaseConfigured || !supabase) {
    return { success: true, settings: DEFAULT_WALLET_SETTINGS };
  }

  try {
    const { data, error } = await supabase
      .from('wallet_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return { success: true, settings: DEFAULT_WALLET_SETTINGS };
    }

    const rawCats = Array.isArray(data.applicable_categories)
      ? data.applicable_categories
      : (typeof data.applicable_categories === 'string' ? JSON.parse(data.applicable_categories || '[]') : []);
    const rawItems = Array.isArray(data.applicable_items)
      ? data.applicable_items
      : (typeof data.applicable_items === 'string' ? JSON.parse(data.applicable_items || '[]') : []);

    return {
      success: true,
      settings: {
        ...DEFAULT_WALLET_SETTINGS,
        ...data,
        applicable_categories: rawCats,
        applicable_items: rawItems
      }
    };
  } catch (err) {
    console.warn('Failed to fetch wallet settings:', err);
    return { success: true, settings: DEFAULT_WALLET_SETTINGS };
  }
}

/**
 * Fetch patient's wallet balance and transaction ledger
 */
export async function fetchWalletData(patientId) {
  if (!isSupabaseConfigured || !supabase || !patientId) {
    return {
      success: true,
      balance: 1000, // Demo fallback balance for unlinked offline sessions
      transactions: [
        {
          id: 'demo-tx-1',
          transaction_type: 'signup_reward',
          coins: 1000,
          balance_before: 0,
          balance_after: 1000,
          description: '🎁 Welcome Reward — Health Express Signup',
          created_at: new Date().toISOString()
        }
      ]
    };
  }

  try {
    // 1. Fetch wallet account
    const { data: account, error: accErr } = await supabase
      .from('wallet_accounts')
      .select('*')
      .eq('patient_id', patientId)
      .maybeSingle();

    let coinBalance = 0;

    if (!account) {
      // Create wallet if missing
      const { data: newAcc } = await supabase.rpc('get_or_create_wallet', { p_patient_id: patientId });
      coinBalance = newAcc?.coin_balance || 0;
    } else {
      coinBalance = account.coin_balance || 0;
    }

    // 2. Fetch transaction history
    const { data: transactions } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
      .limit(50);

    return {
      success: true,
      balance: Number(coinBalance),
      transactions: transactions || []
    };
  } catch (err) {
    console.error('fetchWalletData exception:', err);
    return { success: false, error: err.message, balance: 0, transactions: [] };
  }
}

/**
 * Trigger idempotent signup reward RPC
 */
export async function claimSignupReward(patientId) {
  if (!isSupabaseConfigured || !supabase || !patientId) {
    return { success: true, already_claimed: true, balance: 1000 };
  }

  try {
    const { data, error } = await supabase.rpc('claim_signup_reward_atomic', { p_patient_id: patientId });

    if (error) {
      console.warn('claimSignupReward error:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, ...data };
  } catch (err) {
    console.error('claimSignupReward exception:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Calculates dynamic scope eligibility and Health Coins discount amount
 */
export function calculateCoinDiscount({ subtotal, coinsRequested, walletBalance, settings = DEFAULT_WALLET_SETTINGS, promoDiscount = 0, cartItems = [] }) {
  if (!settings.redemption_enabled) {
    return { isValid: false, error: 'Health Coins redemption is currently disabled by Admin.', coinDiscount: 0, coinsUsed: 0 };
  }

  const reqCoins = Number(coinsRequested || 0);
  if (reqCoins <= 0) {
    return { isValid: true, error: null, coinDiscount: 0, coinsUsed: 0 };
  }

  const minOrder = Number(settings.minimum_order_amount || 0);
  if (subtotal < minOrder) {
    return {
      isValid: false,
      error: `Minimum order amount to redeem Health Coins is ₹${minOrder}. Add ₹${minOrder - subtotal} more items.`,
      coinDiscount: 0,
      coinsUsed: 0
    };
  }

  const minCoins = Number(settings.minimum_coins_to_redeem || 100);
  if (reqCoins < minCoins) {
    return {
      isValid: false,
      error: `Minimum ${minCoins} Health Coins required to redeem a discount.`,
      coinDiscount: 0,
      coinsUsed: 0
    };
  }

  if (reqCoins > walletBalance) {
    return {
      isValid: false,
      error: `Requested ${reqCoins} coins exceed your available balance of ${walletBalance} Health Coins.`,
      coinDiscount: 0,
      coinsUsed: 0
    };
  }

  const maxCoinsPerOrder = Number(settings.maximum_coins_per_order || 500);
  const usableCoins = Math.min(reqCoins, walletBalance, maxCoinsPerOrder);

  // Dynamic Scope Matching across cart items
  let eligibleSubtotal = subtotal;
  const scope = settings.applicable_scope || 'all';

  if (scope !== 'all' && cartItems && cartItems.length > 0) {
    const categories = settings.applicable_categories || [];
    const items = settings.applicable_items || [];

    eligibleSubtotal = cartItems.reduce((acc, item) => {
      const cat = (item.category || item.item_type || '').toLowerCase();
      const itemId = (item.id || item.product_id || item.slug || '').toString();

      let matched = false;
      if (scope === 'categories') {
        matched = categories.some((c) => c.toLowerCase() === cat);
      } else if (scope === 'items') {
        matched = items.some((i) => i.toString() === itemId);
      }

      if (matched) {
        return acc + (Number(item.price || item.unit_price || 0) * Number(item.quantity || 1));
      }
      return acc;
    }, 0);
  }

  if (eligibleSubtotal <= 0) {
    return {
      isValid: false,
      error: 'Health Coins are not applicable to the items currently in your cart.',
      coinDiscount: 0,
      coinsUsed: 0
    };
  }

  const coinsPerRupee = Number(settings.coins_per_rupee || 10);
  let grossDiscount = Math.floor(usableCoins / coinsPerRupee);

  // Ensure discounts don't make payable amount negative
  const remainingPayableAfterPromo = Math.max(0, eligibleSubtotal - promoDiscount);
  const finalCoinDiscount = Math.min(grossDiscount, remainingPayableAfterPromo);
  const actualCoinsUsed = Math.min(usableCoins, finalCoinDiscount * coinsPerRupee);

  return {
    isValid: true,
    error: null,
    coinDiscount: finalCoinDiscount,
    coinsUsed: actualCoinsUsed,
    usableCoins
  };
}
