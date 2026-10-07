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
 * Resolve authentic patient.id (primary key UUID in public.patients) from either auth user.id or patient.id
 */
export async function getCurrentPatientId(userOrPatientId) {
  if (!userOrPatientId || !isSupabaseConfigured || !supabase) return null;

  // 1. Direct check: Check if userOrPatientId is already a valid primary key in public.patients
  try {
    const { data: directPatient } = await supabase
      .from('patients')
      .select('id')
      .eq('id', userOrPatientId)
      .maybeSingle();

    if (directPatient?.id) return directPatient.id;
  } catch (e) {
    // Non-blocking fallback
  }

  // 2. User ID resolution: Lookup public.patients where user_id = auth.uid()
  try {
    const { data: patient, error } = await supabase
      .from('patients')
      .select('id')
      .eq('user_id', userOrPatientId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && patient?.id) {
      return patient.id;
    }
  } catch (err) {
    console.error('[Wallet] Failed to resolve patient by user_id:', err);
  }

  return null;
}

/**
 * Fetch patient's wallet balance and transaction ledger.
 * Accepts auth user ID (user.id) or patient.id and resolves the authentic patients.id.
 */
export async function fetchWalletData(userOrPatientId) {
  if (!isSupabaseConfigured || !supabase || !userOrPatientId) {
    return {
      success: true,
      balance: 0,
      transactions: []
    };
  }

  try {
    // STAGE 1: Resolve authentic patients.id (primary key UUID)
    const patientId = await getCurrentPatientId(userOrPatientId);

    if (!patientId) {
      return {
        success: false,
        error: 'Patient profile not found',
        balance: 0,
        transactions: []
      };
    }

    // STAGE 2: Ensure wallet account exists
    let { data: account, error: accErr } = await supabase
      .from('wallet_accounts')
      .select('*')
      .eq('patient_id', patientId)
      .maybeSingle();

    if (!account) {
      // Create wallet if missing using resolved patients.id
      const { data: newAcc, error: rpcErr } = await supabase.rpc('get_or_create_wallet', { p_patient_id: patientId });
      if (rpcErr) {
        console.error('[Wallet] get_or_create_wallet RPC error:', rpcErr.message);
      }
      account = newAcc;
    }

    // STAGE 3: Atomically claim signup reward for patient (idempotent at DB level)
    const rewardResult = await claimSignupReward(patientId);
    if (!rewardResult?.success) {
      console.error('[Wallet] Signup reward claim notice:', rewardResult?.error || 'Claim failed');
    }

    // STAGE 4: Re-fetch updated wallet account to capture post-claim coin balance
    const { data: refreshedAccount } = await supabase
      .from('wallet_accounts')
      .select('coin_balance')
      .eq('patient_id', patientId)
      .maybeSingle();

    const coinBalance = refreshedAccount?.coin_balance ?? account?.coin_balance ?? 0;

    // STAGE 5: Fetch transaction history using resolved patients.id
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
 * Trigger idempotent signup reward RPC.
 * Accepts auth user ID (user.id) or patient.id and resolves the authentic patients.id.
 */
export async function claimSignupReward(userOrPatientId) {
  if (!isSupabaseConfigured || !supabase || !userOrPatientId) {
    return { success: true, already_claimed: true, balance: 0 };
  }

  try {
    const patientId = await getCurrentPatientId(userOrPatientId);

    if (!patientId) {
      return { success: false, error: 'Patient profile not found' };
    }

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
