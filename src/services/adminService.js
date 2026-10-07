import { supabase, isSupabaseConfigured } from '../lib/supabase.js';
import { DEFAULT_WALLET_SETTINGS } from './walletService.js';

/**
 * Verifies Admin login credentials against Supabase Auth & Database RBAC
 */
export async function verifyAdminAuth(email, password) {
  if (!email || !password) {
    return { success: false, error: 'Please enter both email and password.' };
  }

  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase environment variables (VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY) are not configured.' };
  }

  try {
    // 1. Supabase Auth sign in
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password
    });

    if (authError) {
      return { success: false, error: authError.message || 'Invalid email or password.' };
    }

    const cleanEmail = (authData.user?.email || email).toLowerCase().trim();

    // 2. Database RBAC check via SECURITY DEFINER check_is_admin() RPC
    let { data: isAdmin, error: rpcError } = await supabase.rpc('check_is_admin');

    if (rpcError) {
      console.warn('RPC check_is_admin warning:', rpcError.message);
    }

    // 3. Auto-link & grant for primary admin account if check_is_admin is false or unlinked
    if (isAdmin !== true && cleanEmail === 'admin@healthexpress.in') {
      try {
        await supabase.rpc('sync_admin_user');
        const { data: recheck } = await supabase.rpc('check_is_admin');
        isAdmin = recheck === true || cleanEmail === 'admin@healthexpress.in';
      } catch (e) {
        console.warn('Auto admin patient link error:', e);
        isAdmin = cleanEmail === 'admin@healthexpress.in';
      }
    }

    // Strictly enforce database is_admin = true or primary admin account
    if (isAdmin !== true && cleanEmail !== 'admin@healthexpress.in') {
      await supabase.auth.signOut();
      return { 
        success: false, 
        error: 'You do not have permission to access the Health Express Admin Portal.' 
      };
    }

    return {
      success: true,
      user: authData.user,
      token: authData.session?.access_token
    };
  } catch (err) {
    console.error('Admin Auth Exception:', err);
    return { success: false, error: err.message || 'Authentication error.' };
  }
}

/**
 * Fetch all orders and payments for Admin Panel from Supabase
 */
export async function fetchAdminOrders() {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase connection is not configured.' };
  }

  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        payments (*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch admin orders database error:', error.message);
      return { success: false, error: `Failed to load orders: ${error.message}` };
    }

    return { success: true, data: orders || [] };
  } catch (err) {
    console.error('Fetch admin orders exception:', err);
    return { success: false, error: err.message || 'Database connection error.' };
  }
}

/**
 * Fetch a single order with joined payments by ID
 */
export async function fetchAdminSingleOrder(orderId) {
  if (!orderId || !isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase configuration missing or invalid Order ID.' };
  }

  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        payments (*)
      `)
      .eq('id', orderId)
      .maybeSingle();

    if (error) {
      console.error('Fetch admin single order error:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data: order };
  } catch (err) {
    console.error('Fetch admin single order exception:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Fetch all payment records for dedicated Admin Payments module
 */
export async function fetchAdminPayments() {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase connection is not configured.' };
  }

  try {
    const { data: payments, error } = await supabase
      .from('payments')
      .select(`
        *,
        orders (*),
        patients (*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch admin payments database error:', error.message);
      return { success: false, error: `Failed to load payments: ${error.message}` };
    }

    return { success: true, data: payments || [] };
  } catch (err) {
    console.error('Fetch admin payments exception:', err);
    return { success: false, error: err.message || 'Database connection error.' };
  }
}

/**
 * Update Order status in database
 */
export async function updateAdminOrderStatus(orderId, nextStatus) {
  if (!orderId || !nextStatus) return { success: false, error: 'Missing order parameters.' };
  if (!isSupabaseConfigured || !supabase) return { success: false, error: 'Supabase configuration missing.' };

  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ order_status: nextStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select();

    if (error) return { success: false, error: error.message };

    const updatedOrder = data && data[0] ? data[0] : null;

    if (updatedOrder && nextStatus.toUpperCase() === 'CANCELLED') {
      if (updatedOrder.patient_id) {
        await supabase.rpc('restore_wallet_coins_atomic', {
          p_patient_id: updatedOrder.patient_id,
          p_order_id: updatedOrder.id,
          p_description: `Restored Health Coins from Cancelled Order #${updatedOrder.order_code || updatedOrder.id}`
        }).catch(() => {});
      }
      await supabase.rpc('restore_promo_usage_atomic', {
        p_order_id: updatedOrder.id,
        p_patient_id: updatedOrder.patient_id || null
      }).catch(() => {});
    }

    return { success: true, data: updatedOrder };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Collect COD Payment from Admin Panel
 */
export async function markCodPaymentCollected(orderId) {
  if (!orderId) return { success: false, error: 'Missing Order ID.' };
  if (!isSupabaseConfigured || !supabase) return { success: false, error: 'Supabase configuration missing.' };

  try {
    const { data, error } = await supabase.rpc('mark_cod_payment_collected', {
      p_order_id: orderId
    });

    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Fetch all prescription uploads for Admin Panel
 */
export async function fetchAdminPrescriptions() {
  if (!isSupabaseConfigured || !supabase) return { success: false, error: 'Supabase connection is not configured.' };

  try {
    // 1. Primary query: Fetch enquiries with linked patients and attached prescription files
    const { data: enquiriesData, error: enqError } = await supabase
      .from('enquiries')
      .select(`
        *,
        patients (*),
        prescriptions (*)
      `)
      .order('created_at', { ascending: false });

    if (!enqError && enquiriesData && enquiriesData.length > 0) {
      return { success: true, data: enquiriesData };
    }

    // 2. Fallback query: Fetch directly from prescriptions table and group files by enquiry
    const { data: presData, error: presError } = await supabase
      .from('prescriptions')
      .select(`
        *,
        enquiries (*),
        patients (*)
      `)
      .order('created_at', { ascending: false });

    if (presError && (!enquiriesData || enquiriesData.length === 0)) {
      return { success: false, error: `Failed to load prescriptions: ${presError.message}` };
    }

    if (enquiriesData && enquiriesData.length > 0) {
      return { success: true, data: enquiriesData };
    }

    // Group standalone prescription records by enquiry_id
    const enquiryMap = {};
    (presData || []).forEach((p) => {
      const enqKey = p.enquiry_id || p.id;
      if (!enquiryMap[enqKey]) {
        enquiryMap[enqKey] = {
          id: enqKey,
          enquiry_code: p.enquiries?.enquiry_code || 'HEX-ENQ-' + (p.id ? p.id.slice(0, 6).toUpperCase() : '000'),
          created_at: p.created_at,
          notes: p.enquiries?.notes || null,
          status: p.enquiries?.status || 'pending_review',
          patients: p.patients || p.enquiries?.patients || {},
          prescriptions: []
        };
      }
      enquiryMap[enqKey].prescriptions.push({
        id: p.id,
        file_name: p.file_name,
        file_path: p.file_path,
        file_type: p.file_type,
        file_size: p.file_size
      });
    });

    return { success: true, data: Object.values(enquiryMap) };
  } catch (err) {
    console.error('Fetch admin prescriptions exception:', err);
    return { success: false, error: err.message || 'Database connection error.' };
  }
}

/**
 * Update enquiry status
 */
export async function updateAdminEnquiryStatus(enquiryId, nextStatus) {
  if (!enquiryId || !nextStatus) return { success: false, error: 'Missing parameters.' };
  if (!isSupabaseConfigured || !supabase) return { success: false, error: 'Supabase configuration missing.' };

  try {
    const { data, error } = await supabase
      .from('enquiries')
      .update({ status: nextStatus, updated_at: new Date().toISOString() })
      .eq('id', enquiryId)
      .select();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data[0] };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Fetch all patients for Admin Patient Directory
 */
export async function fetchAdminPatients() {
  if (!isSupabaseConfigured || !supabase) return { success: false, error: 'Supabase connection is not configured.' };

  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return { success: false, error: `Failed to load patients: ${error.message}` };
    return { success: true, data: data || [] };
  } catch (err) {
    return { success: false, error: err.message || 'Database connection error.' };
  }
}

/**
 * Get signed download URL for private prescription file in storage
 */
export async function getPrescriptionSignedUrl(filePath) {
  if (!filePath || !isSupabaseConfigured || !supabase) return null;

  try {
    const { data, error } = await supabase
      .storage
      .from('prescriptions')
      .createSignedUrl(filePath, 3600); // 1 hour expiration

    if (error) return null;
    return data.signedUrl;
  } catch (e) {
    return null;
  }
}

/**
 * Fetch Customer 360 Unified Profile
 */
export async function fetchCustomerDetails(patientId) {
  if (!patientId || !isSupabaseConfigured || !supabase) return { success: false, error: 'Invalid parameters.' };

  try {
    const [patRes, ordRes, enqRes, payRes, evtRes] = await Promise.all([
      supabase.from('patients').select('*').eq('id', patientId).single(),
      supabase.from('orders').select('*, payments(*)').eq('patient_id', patientId).order('created_at', { ascending: false }),
      supabase.from('enquiries').select('*, prescriptions(*)').eq('patient_id', patientId).order('created_at', { ascending: false }),
      supabase.from('payments').select('*').eq('patient_id', patientId).order('created_at', { ascending: false }),
      supabase.from('analytics_events').select('*').eq('patient_id', patientId).order('created_at', { ascending: false }).limit(50)
    ]);

    return {
      success: true,
      data: {
        profile: patRes.data || null,
        orders: ordRes.data || [],
        enquiries: enqRes.data || [],
        payments: payRes.data || [],
        events: evtRes.data || []
      }
    };
  } catch (err) {
    console.error('Fetch customer details exception:', err);
    return { success: false, error: err.message || 'Error fetching customer profile.' };
  }
}

/**
 * Fetch user interaction analytics events for Admin Event Viewer
 */
export async function fetchAnalyticsEvents(limit = 100) {
  if (!isSupabaseConfigured || !supabase) return { success: false, error: 'Supabase connection is not configured.' };

  try {
    const { data: events, error } = await supabase
      .from('analytics_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.warn('Fetch analytics events warning:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data: events || [] };
  } catch (err) {
    console.warn('Fetch analytics events exception:', err);
    return { success: false, error: err.message || 'Database connection error.' };
  }
}

// ============================================================
// ADMIN PROMO CODE / COUPON MANAGEMENT SERVICES WITH SCOPE
// ============================================================

/**
 * Fetch all promo codes for Admin Panel Data Table
 */
export async function fetchAdminPromoCodes() {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase connection is not configured.' };
  }

  try {
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Fetch admin promo codes warning:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (err) {
    console.error('Fetch admin promo codes exception:', err);
    return { success: false, error: err.message || 'Database connection error.' };
  }
}

/**
 * Create new Promo Code from Admin Panel
 */
export async function createAdminPromoCode(promoData) {
  const normalizedCode = (promoData.code || '').trim().toUpperCase();

  if (!normalizedCode) return { success: false, error: 'Promo code is required.' };
  if (!promoData.discount_value || Number(promoData.discount_value) <= 0) {
    return { success: false, error: 'Discount value must be greater than 0.' };
  }

  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase connection is not configured.' };
  }

  const payload = {
    code: normalizedCode,
    discount_type: promoData.discount_type || 'flat',
    discount_value: Number(promoData.discount_value),
    min_order_amount: Number(promoData.min_order_amount || 0),
    max_discount: promoData.max_discount ? Number(promoData.max_discount) : null,
    applicable_scope: promoData.applicable_scope || 'all',
    applicable_categories: Array.isArray(promoData.applicable_categories) ? promoData.applicable_categories : [],
    applicable_items: Array.isArray(promoData.applicable_items) ? promoData.applicable_items : [],
    valid_from: promoData.valid_from || new Date().toISOString(),
    valid_until: promoData.valid_until || null,
    usage_limit: promoData.usage_limit ? parseInt(promoData.usage_limit, 10) : null,
    is_active: promoData.is_active !== undefined ? Boolean(promoData.is_active) : true,
    used_count: 0
  };

  try {
    const { data, error } = await supabase
      .from('promo_codes')
      .insert([payload])
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message || 'Failed to create promo code.' };
    }

    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message || 'Database connection error.' };
  }
}

/**
 * Update existing Promo Code from Admin Panel
 */
export async function updateAdminPromoCode(id, promoData) {
  if (!id) return { success: false, error: 'Missing promo code ID.' };
  if (!isSupabaseConfigured || !supabase) return { success: false, error: 'Supabase configuration missing.' };

  const normalizedCode = (promoData.code || '').trim().toUpperCase();

  const payload = {
    code: normalizedCode,
    discount_type: promoData.discount_type || 'flat',
    discount_value: Number(promoData.discount_value),
    min_order_amount: Number(promoData.min_order_amount || 0),
    max_discount: promoData.max_discount ? Number(promoData.max_discount) : null,
    applicable_scope: promoData.applicable_scope || 'all',
    applicable_categories: Array.isArray(promoData.applicable_categories) ? promoData.applicable_categories : [],
    applicable_items: Array.isArray(promoData.applicable_items) ? promoData.applicable_items : [],
    valid_from: promoData.valid_from || new Date().toISOString(),
    valid_until: promoData.valid_until || null,
    usage_limit: promoData.usage_limit ? parseInt(promoData.usage_limit, 10) : null,
    is_active: Boolean(promoData.is_active),
    updated_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from('promo_codes')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Toggle Active / Inactive status for a Promo Code from Admin Panel
 */
export async function toggleAdminPromoCodeStatus(id, isActive) {
  if (!id) return { success: false, error: 'Missing promo code ID.' };
  if (!isSupabaseConfigured || !supabase) return { success: false, error: 'Supabase configuration missing.' };

  try {
    const { error } = await supabase
      .from('promo_codes')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Delete Promo Code from Admin Panel
 */
export async function deleteAdminPromoCode(id) {
  if (!id) return { success: false, error: 'Missing promo code ID.' };
  if (!isSupabaseConfigured || !supabase) return { success: false, error: 'Supabase configuration missing.' };

  try {
    const { error } = await supabase
      .from('promo_codes')
      .delete()
      .eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ============================================================
// HEALTH COINS & REWARDS — ADMIN MANAGEMENT SERVICES
// ============================================================

/**
 * Fetch Wallet Settings for Admin Configuration Form
 */
export async function fetchAdminWalletSettings() {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase connection is not configured.' };
  }

  try {
    const { data, error } = await supabase
      .from('wallet_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) {
      return { success: false, error: error.message };
    }

    const rawCats = Array.isArray(data?.applicable_categories) ? data.applicable_categories : (typeof data?.applicable_categories === 'string' ? JSON.parse(data.applicable_categories || '[]') : []);
    const rawItems = Array.isArray(data?.applicable_items) ? data.applicable_items : (typeof data?.applicable_items === 'string' ? JSON.parse(data.applicable_items || '[]') : []);

    return {
      success: true,
      data: {
        ...DEFAULT_WALLET_SETTINGS,
        ...(data || {}),
        applicable_categories: rawCats,
        applicable_items: rawItems
      }
    };
  } catch (err) {
    console.error('Fetch admin wallet settings exception:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Update global Wallet Configuration Settings from Admin Panel
 */
export async function updateAdminWalletSettings(settingsData) {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase connection is not configured.' };
  }

  const payload = {
    signup_reward_enabled: Boolean(settingsData.signup_reward_enabled),
    signup_reward_coins: Number(settingsData.signup_reward_coins || 1000),
    coins_per_rupee: Number(settingsData.coins_per_rupee || 10),
    minimum_coins_to_redeem: Number(settingsData.minimum_coins_to_redeem || 100),
    maximum_coins_per_order: Number(settingsData.maximum_coins_per_order || 500),
    minimum_order_amount: Number(settingsData.minimum_order_amount || 299),
    allow_stacking_with_promo: Boolean(settingsData.allow_stacking_with_promo),
    coin_expiry_enabled: Boolean(settingsData.coin_expiry_enabled),
    default_expiry_days: Number(settingsData.default_expiry_days || 90),
    redemption_enabled: Boolean(settingsData.redemption_enabled),
    applicable_scope: settingsData.applicable_scope || 'all',
    applicable_categories: Array.isArray(settingsData.applicable_categories) ? settingsData.applicable_categories : [],
    applicable_items: Array.isArray(settingsData.applicable_items) ? settingsData.applicable_items : [],
    updated_at: new Date().toISOString()
  };

  try {
    const { data: existing } = await supabase.from('wallet_settings').select('id').limit(1).maybeSingle();

    let result;
    if (existing?.id) {
      result = await supabase.from('wallet_settings').update(payload).eq('id', existing.id).select().single();
    } else {
      result = await supabase.from('wallet_settings').insert([payload]).select().single();
    }

    if (result.error) return { success: false, error: result.error.message };
    return { success: true, data: result.data };
  } catch (err) {
    console.error('Update admin wallet settings exception:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Fetch all Customer Wallet Accounts for Admin Management
 */
export async function fetchAdminWalletAccounts() {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase connection is not configured.' };
  }

  try {
    const { data, error } = await supabase
      .from('wallet_accounts')
      .select('*, patients(*)')
      .order('coin_balance', { ascending: false });

    if (error) return { success: false, error: error.message };
    return { success: true, data: data || [] };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Fetch all Wallet Transaction Ledgers for Admin Audit
 */
export async function fetchAdminWalletTransactions() {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase connection is not configured.' };
  }

  try {
    const { data, error } = await supabase
      .from('wallet_transactions')
      .select('*, patients(*)')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) return { success: false, error: error.message };
    return { success: true, data: data || [] };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Perform manual +Add or -Deduct Health Coins adjustment for a customer
 */
export async function adjustCustomerCoins({ patientId, coins, type, description }) {
  if (!patientId || !coins || !type || !description) {
    return { success: false, error: 'Patient ID, coins amount, type, and reason are required.' };
  }

  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase connection is not configured.' };
  }

  try {
    const { data, error } = await supabase.rpc('admin_adjust_wallet_coins_atomic', {
      p_patient_id: patientId,
      p_coins: Number(coins),
      p_type: type,
      p_description: description.trim()
    });

    if (error) return { success: false, error: error.message };
    return { success: true, ...data };
  } catch (err) {
    console.error('adjustCustomerCoins exception:', err);
    return { success: false, error: err.message };
  }
}

// ============================================================
// SERVICE CATALOG — ADMIN MANAGEMENT SERVICES
// ============================================================

/**
 * Fetch catalog services for Admin Panel with server-side pagination, search, & filtering
 */
export async function fetchAdminServices({
  search = '',
  category = 'all',
  activeStatus = 'all',
  provider = 'all',
  serviceType = 'all',
  page = 1,
  pageSize = 25
} = {}) {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase connection is not configured.' };
  }

  const validPage = Math.max(1, parseInt(page, 10) || 1);
  const offset = (validPage - 1) * pageSize;

  try {
    let query = supabase
      .from('services')
      .select('*', { count: 'exact' });

    // Active status filter
    if (activeStatus === 'active') {
      query = query.eq('active', true);
    } else if (activeStatus === 'inactive') {
      query = query.eq('active', false);
    }

    // Category filter
    if (category && category !== 'all') {
      query = query.eq('category_id', category);
    }

    // Provider filter
    if (provider && provider !== 'all') {
      query = query.eq('provider', provider);
    }

    // Service type filter
    if (serviceType && serviceType !== 'all') {
      query = query.eq('service_type', serviceType);
    }

    // Search query across service_name, service_code, slug, provider
    const q = (search || '').trim();
    if (q) {
      query = query.or(`service_name.ilike.%${q}%,service_code.ilike.%${q}%,slug.ilike.%${q}%,provider.ilike.%${q}%`);
    }

    // Sort by updated_at / created_at desc
    query = query.order('updated_at', { ascending: false }).range(offset, offset + pageSize - 1);

    const { data, count, error } = await query;

    if (error) {
      console.error('Fetch admin services DB error:', error.message);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      services: data || [],
      totalMatches: count || 0,
      totalPages: Math.ceil((count || 0) / pageSize) || 1,
      page: validPage,
      pageSize
    };
  } catch (err) {
    console.error('fetchAdminServices exception:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Add a new Service to the public.services database catalog
 */
export async function createAdminService(serviceData) {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase connection is not configured.' };
  }

  const slug = (serviceData.slug || '').trim().toLowerCase();
  const serviceName = (serviceData.service_name || serviceData.name || '').trim();
  const categoryId = (serviceData.category_id || '').trim();
  const categoryName = (serviceData.category_name || '').trim();
  const sellingPrice = Number(serviceData.selling_price);

  if (!slug || !serviceName || !categoryId || !categoryName || isNaN(sellingPrice) || sellingPrice < 0) {
    return {
      success: false,
      error: 'Service Name, Slug, Category ID, Category Name, and a valid Selling Price (>= 0) are required.'
    };
  }

  const mrp = serviceData.mrp !== undefined && serviceData.mrp !== null && serviceData.mrp !== '' ? Number(serviceData.mrp) : sellingPrice;
  if (isNaN(mrp) || mrp < 0) {
    return { success: false, error: 'MRP must be a valid non-negative number.' };
  }

  const b2bPrice = serviceData.b2b_price !== undefined && serviceData.b2b_price !== null && serviceData.b2b_price !== '' ? Number(serviceData.b2b_price) : null;
  if (b2bPrice !== null && (isNaN(b2bPrice) || b2bPrice < 0)) {
    return { success: false, error: 'B2B Price must be a valid non-negative number.' };
  }

  let parsedParams = [];
  if (Array.isArray(serviceData.parameters)) {
    parsedParams = serviceData.parameters;
  } else if (typeof serviceData.parameters === 'string' && serviceData.parameters.trim()) {
    try {
      parsedParams = JSON.parse(serviceData.parameters);
    } catch (e) {
      return { success: false, error: 'Invalid JSON format for parameters field.' };
    }
  }

  const payload = {
    slug,
    service_code: serviceData.service_code ? serviceData.service_code.trim() : null,
    service_name: serviceName,
    category_id: categoryId,
    category_name: categoryName,
    subcategory: serviceData.subcategory ? serviceData.subcategory.trim() : null,
    provider: serviceData.provider ? serviceData.provider.trim() : 'Health Express Care Team',
    description: serviceData.description ? serviceData.description.trim() : null,
    overview: serviceData.overview ? serviceData.overview.trim() : null,
    mrp: mrp,
    selling_price: sellingPrice,
    b2b_price: b2bPrice,
    discount_percentage: serviceData.discount_percentage ? serviceData.discount_percentage.trim() : null,
    turnaround_time: serviceData.turnaround_time ? serviceData.turnaround_time.trim() : 'Contact for TAT',
    patient_preparation: serviceData.patient_preparation ? serviceData.patient_preparation.trim() : null,
    specimen_type: serviceData.specimen_type ? serviceData.specimen_type.trim() : null,
    home_collection_available: Boolean(serviceData.home_collection_available),
    centre_visit_required: Boolean(serviceData.centre_visit_required),
    parameters: parsedParams,
    parameters_count: parsedParams.length,
    service_type: serviceData.service_type || 'lab',
    source: serviceData.source || 'admin',
    active: serviceData.active !== undefined ? Boolean(serviceData.active) : true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from('services')
      .insert([payload])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: `A service with the slug "${slug}" already exists. Please enter a unique slug.` };
      }
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.error('createAdminService exception:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Update an existing Service record in public.services database catalog
 */
export async function updateAdminService(id, serviceData) {
  if (!id) return { success: false, error: 'Missing service ID.' };
  if (!isSupabaseConfigured || !supabase) return { success: false, error: 'Supabase connection is not configured.' };

  const sellingPrice = Number(serviceData.selling_price);
  if (isNaN(sellingPrice) || sellingPrice < 0) {
    return { success: false, error: 'Selling price must be a valid non-negative number.' };
  }

  const mrp = serviceData.mrp !== undefined && serviceData.mrp !== null && serviceData.mrp !== '' ? Number(serviceData.mrp) : sellingPrice;
  if (isNaN(mrp) || mrp < 0) {
    return { success: false, error: 'MRP must be a valid non-negative number.' };
  }

  const b2bPrice = serviceData.b2b_price !== undefined && serviceData.b2b_price !== null && serviceData.b2b_price !== '' ? Number(serviceData.b2b_price) : null;
  if (b2bPrice !== null && (isNaN(b2bPrice) || b2bPrice < 0)) {
    return { success: false, error: 'B2B Price must be a valid non-negative number.' };
  }

  let parsedParams = [];
  if (Array.isArray(serviceData.parameters)) {
    parsedParams = serviceData.parameters;
  } else if (typeof serviceData.parameters === 'string' && serviceData.parameters.trim()) {
    try {
      parsedParams = JSON.parse(serviceData.parameters);
    } catch (e) {
      return { success: false, error: 'Invalid JSON format for parameters field.' };
    }
  }

  const payload = {
    service_name: (serviceData.service_name || serviceData.name || '').trim(),
    service_code: serviceData.service_code ? serviceData.service_code.trim() : null,
    category_id: (serviceData.category_id || '').trim(),
    category_name: (serviceData.category_name || '').trim(),
    subcategory: serviceData.subcategory ? serviceData.subcategory.trim() : null,
    provider: serviceData.provider ? serviceData.provider.trim() : 'Health Express Care Team',
    description: serviceData.description ? serviceData.description.trim() : null,
    overview: serviceData.overview ? serviceData.overview.trim() : null,
    mrp: mrp,
    selling_price: sellingPrice,
    b2b_price: b2bPrice,
    discount_percentage: serviceData.discount_percentage ? serviceData.discount_percentage.trim() : null,
    turnaround_time: serviceData.turnaround_time ? serviceData.turnaround_time.trim() : 'Contact for TAT',
    patient_preparation: serviceData.patient_preparation ? serviceData.patient_preparation.trim() : null,
    specimen_type: serviceData.specimen_type ? serviceData.specimen_type.trim() : null,
    home_collection_available: Boolean(serviceData.home_collection_available),
    centre_visit_required: Boolean(serviceData.centre_visit_required),
    parameters: parsedParams,
    parameters_count: parsedParams.length,
    service_type: serviceData.service_type || 'lab',
    active: serviceData.active !== undefined ? Boolean(serviceData.active) : true,
    updated_at: new Date().toISOString()
  };

  if (serviceData.slug && serviceData.slug.trim()) {
    payload.slug = serviceData.slug.trim().toLowerCase();
  }

  try {
    const { data, error } = await supabase
      .from('services')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: `A service with the slug "${payload.slug}" already exists.` };
      }
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.error('updateAdminService exception:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Toggle Active / Inactive status of a Service
 */
export async function toggleAdminServiceStatus(id, activeStatus) {
  if (!id) return { success: false, error: 'Missing service ID.' };
  if (!isSupabaseConfigured || !supabase) return { success: false, error: 'Supabase connection is not configured.' };

  try {
    const { error } = await supabase
      .from('services')
      .update({ active: Boolean(activeStatus), updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
