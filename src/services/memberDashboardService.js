import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

/**
 * MEMBER DASHBOARD SERVICE
 * Centralized data service fetching 100% real Supabase records for authenticated members.
 * Strictly scoped to auth.uid() and associated patient records.
 */

/**
 * Fetch patient profile linked to authenticated user ID
 */
export async function getMemberPatientProfile(userId) {
  if (!userId || !isSupabaseConfigured || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data[0];
    }

    // Fallback tier 2: Lookup by session user phone canonical 10-digit suffix if direct user_id link is still null
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userPhone = session?.user?.phone || session?.user?.user_metadata?.phone || '';
      const cleanDigits = userPhone.replace(/\D/g, '');
      const last10 = cleanDigits.slice(-10);
      if (last10.length >= 10) {
        const { data: fbPatients } = await supabase
          .from('patients')
          .select('*')
          .is('user_id', null)
          .ilike('phone_e164', `%${last10}%`)
          .order('created_at', { ascending: false })
          .limit(1);

        if (fbPatients && fbPatients.length > 0) {
          const matchedPatient = fbPatients[0];
          await supabase
            .from('patients')
            .update({ user_id: userId, is_verified: true })
            .eq('id', matchedPatient.id);
          return { ...matchedPatient, user_id: userId };
        }
      }
    } catch (e) {
      console.warn('getMemberPatientProfile fallback tier 2 notice:', e);
    }

    return null;
  } catch (e) {
    console.warn('getMemberPatientProfile exception:', e);
    return null;
  }
}

/**
 * Fetch complete overview statistics for member from Supabase database
 */
export async function getMemberOverview(userId) {
  if (!isSupabaseConfigured || !supabase) {
    console.warn('[HEALTH FORENSIC] Supabase is not configured!');
    return {
      success: false,
      patient: null,
      orders: [],
      prescriptions: [],
      enquiries: [],
      payments: [],
      events: [],
      walletCoins: 0
    };
  }

  // Active Session Resolution
  let activeUserId = userId;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    console.info('[HEALTH FORENSIC] SESSION USER_ID:', session?.user?.id || 'none');
    
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId || '');
    if (!activeUserId || !isUuid) {
      if (session?.user?.id) {
        activeUserId = session.user.id;
      }
    }
  } catch (e) {
    console.warn('[HEALTH FORENSIC] Error resolving active auth session:', e);
  }

  console.info('[HEALTH FORENSIC] RESOLVED ACTIVE_USER_ID:', activeUserId || 'none');

  if (!activeUserId) {
    console.warn('[HEALTH FORENSIC] No authenticated user ID available for getMemberOverview');
    return {
      success: false,
      patient: null,
      orders: [],
      prescriptions: [],
      enquiries: [],
      payments: [],
      events: [],
      walletCoins: 0
    };
  }

  // 1. ISOLATED OPTIONAL GUEST LINKING RPC (Failure must NEVER block prescription loading)
  try {
    const { data: linkData, error: linkErr } = await supabase.rpc('link_guest_records_on_otp_login');
    if (linkErr) {
      console.warn('[HEALTH FORENSIC] LINK RPC ERROR:', {
        message: linkErr.message,
        code: linkErr.code,
        details: linkErr.details,
        hint: linkErr.hint
      });
    } else {
      console.info('[HEALTH FORENSIC] LINK RPC SUCCESS:', linkData);
    }
  } catch (linkEx) {
    console.warn('[HEALTH FORENSIC] LINK RPC EXCEPTION:', linkEx);
  }

  // 2. PATIENT PROFILE RESOLUTION
  let patient = null;
  let patientIds = [];
  try {
    patient = await getMemberPatientProfile(activeUserId);

    const { data: allUserPatients, error: userPatErr } = await supabase
      .from('patients')
      .select('id')
      .eq('user_id', activeUserId);

    if (userPatErr) {
      console.error('[HEALTH FORENSIC] PATIENTS QUERY ERROR:', {
        code: userPatErr.code,
        message: userPatErr.message,
        details: userPatErr.details,
        hint: userPatErr.hint
      });
    }

    const patientIdSet = new Set();
    if (patient?.id) patientIdSet.add(patient.id);
    if (allUserPatients && Array.isArray(allUserPatients)) {
      allUserPatients.forEach(p => { if (p.id) patientIdSet.add(p.id); });
    }
    patientIds = Array.from(patientIdSet);
  } catch (patEx) {
    console.error('[HEALTH FORENSIC] PATIENT RESOLUTION EXCEPTION:', patEx);
  }

  const primaryPatientId = patient?.id || (patientIds.length > 0 ? patientIds[0] : null);
  console.info('[HEALTH FORENSIC] PATIENT_IDS:', patientIds);

  // Build PostgREST clauses
  let rxOrClause = `user_id.eq.${activeUserId}`;
  if (patientIds.length > 0) {
    rxOrClause += `,patient_id.in.(${patientIds.join(',')})`;
  }

  let ordOrClause = `user_id.eq.${activeUserId}`;
  if (patientIds.length > 0) {
    ordOrClause += `,patient_id.in.(${patientIds.join(',')})`;
  }

  let enqClause = patientIds.length > 0 ? `patient_id.in.(${patientIds.join(',')})` : null;

  // 3. EXECUTE INDEPENDENT DATA QUERIES VIA Promise.allSettled
  const queryResults = await Promise.allSettled([
    // 0: Prescriptions
    supabase.from('prescriptions').select('*').or(rxOrClause).order('created_at', { ascending: false }),
    // 1: Orders
    supabase.from('orders').select('*').or(ordOrClause).order('created_at', { ascending: false }),
    // 2: Enquiries
    enqClause ? supabase.from('enquiries').select('*').or(enqClause).order('created_at', { ascending: false }) : Promise.resolve({ data: [] }),
    // 3: Payments
    patientIds.length > 0 ? supabase.from('payments').select('*').in('patient_id', patientIds).order('created_at', { ascending: false }) : Promise.resolve({ data: [] }),
    // 4: Analytics Events
    supabase.from('analytics_events').select('*').eq('user_id', activeUserId).order('created_at', { ascending: false }).limit(100),
    // 5: Wallet Balance
    primaryPatientId ? supabase.from('wallet_accounts').select('coin_balance').eq('patient_id', primaryPatientId).maybeSingle() : Promise.resolve({ data: null })
  ]);

  // Unpack results safely
  const presSettled = queryResults[0].status === 'fulfilled' ? queryResults[0].value : { data: [], error: queryResults[0].reason };
  const ordSettled = queryResults[1].status === 'fulfilled' ? queryResults[1].value : { data: [], error: queryResults[1].reason };
  const enqSettled = queryResults[2].status === 'fulfilled' ? queryResults[2].value : { data: [], error: queryResults[2].reason };
  const paySettled = queryResults[3].status === 'fulfilled' ? queryResults[3].value : { data: [], error: queryResults[3].reason };
  const evtSettled = queryResults[4].status === 'fulfilled' ? queryResults[4].value : { data: [], error: queryResults[4].reason };
  const walSettled = queryResults[5].status === 'fulfilled' ? queryResults[5].value : { data: null, error: queryResults[5].reason };

  // Forensic logging for each data source
  console.info('[HEALTH FORENSIC] DATA-SOURCE: PRESCRIPTIONS', {
    count: presSettled.data ? presSettled.data.length : 0,
    error: presSettled.error || null,
    code: presSettled.error?.code,
    message: presSettled.error?.message,
    details: presSettled.error?.details,
    hint: presSettled.error?.hint
  });

  console.info('[HEALTH FORENSIC] DATA-SOURCE: ORDERS', {
    count: ordSettled.data ? ordSettled.data.length : 0,
    error: ordSettled.error || null
  });

  console.info('[HEALTH FORENSIC] DATA-SOURCE: ENQUIRIES', {
    count: enqSettled.data ? enqSettled.data.length : 0,
    error: enqSettled.error || null
  });

  console.info('[HEALTH FORENSIC] DATA-SOURCE: PAYMENTS', {
    count: paySettled.data ? paySettled.data.length : 0,
    error: paySettled.error || null
  });

  console.info('[HEALTH FORENSIC] DATA-SOURCE: EVENTS', {
    count: evtSettled.data ? evtSettled.data.length : 0,
    error: evtSettled.error || null
  });

  console.info('[HEALTH FORENSIC] DATA-SOURCE: WALLET', {
    value: walSettled.data?.coin_balance || 0,
    error: walSettled.error || null
  });

  // STEP A: Raw Prescriptions Count
  const rawPrescriptions = presSettled.data || [];
  console.info('[HEALTH FORENSIC] PRESCRIPTIONS STEP A (raw count):', rawPrescriptions.length);

  // STEP B: Mapped Prescriptions Count
  const mappedPrescriptions = rawPrescriptions.map(rx => ({ ...rx }));
  console.info('[HEALTH FORENSIC] PRESCRIPTIONS STEP B (mapped count):', mappedPrescriptions.length);

  // STEP C: Signed URL Processing (Failure does NOT drop records)
  const prescriptionsWithSignedUrls = await Promise.all(
    mappedPrescriptions.map(async (rx) => {
      if (!rx.file_path) return rx;
      try {
        const { data: signedData, error: signErr } = await supabase.storage
          .from('prescriptions')
          .createSignedUrl(rx.file_path, 300);

        if (signErr) {
          console.warn(`[HEALTH FORENSIC] SIGNED URL NOTICE for rx ${rx.id}:`, {
            message: signErr.message,
            name: signErr.name
          });
        }

        return {
          ...rx,
          public_url: signedData?.signedUrl || rx.public_url || null,
          signed_url: signedData?.signedUrl || rx.signed_url || null
        };
      } catch (e) {
        console.warn(`[HEALTH FORENSIC] SIGNED URL EXCEPTION for rx ${rx.id}:`, e);
        return rx;
      }
    })
  );

  console.info('[HEALTH FORENSIC] PRESCRIPTIONS STEP C (final count):', prescriptionsWithSignedUrls.length);

  console.info('[HEALTH FORENSIC] OVERVIEW RETURN', {
    prescriptions: prescriptionsWithSignedUrls.length,
    orders: (ordSettled.data || []).length,
    enquiries: (enqSettled.data || []).length,
    walletCoins: typeof walSettled.data?.coin_balance === 'number' ? Number(walSettled.data.coin_balance) : 0,
    events: (evtSettled.data || []).length
  });

  return {
    success: true,
    patient,
    orders: ordSettled.data || [],
    prescriptions: prescriptionsWithSignedUrls,
    enquiries: enqSettled.data || [],
    payments: paySettled.data || [],
    events: evtSettled.data || [],
    walletCoins: typeof walSettled.data?.coin_balance === 'number'
      ? Number(walSettled.data.coin_balance)
      : 0
  };
}

/**
 * Formats date into readable group string in IST (TODAY • SEP 30, 2026, YESTERDAY • SEP 29, 2026, SEP 27, 2026)
 */
export function formatTimelineDateGroup(dateStr) {
  if (!dateStr) return 'EARLIER';
  const eventDate = new Date(dateStr);
  if (isNaN(eventDate.getTime())) return 'EARLIER';

  const now = new Date();
  const optionsIST = { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' };
  
  const eventIST = new Intl.DateTimeFormat('en-CA', optionsIST).format(eventDate); // YYYY-MM-DD in IST
  const nowIST = new Intl.DateTimeFormat('en-CA', optionsIST).format(now);

  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayIST = new Intl.DateTimeFormat('en-CA', optionsIST).format(yesterday);

  // Format calendar date in IST: e.g. "SEP 30, 2026"
  const dateFormatted = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(eventDate).toUpperCase(); // "SEP 30, 2026"

  if (eventIST === nowIST) return `TODAY • ${dateFormatted}`;
  if (eventIST === yesterdayIST) return `YESTERDAY • ${dateFormatted}`;

  return dateFormatted; // "SEP 27, 2026"
}

/**
 * Formats exact event date and 12-hour time in IST format (e.g. Sep 30, 12:35 PM)
 */
export function formatTimelineTimeIST(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';

  const datePart = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    month: 'short',
    day: 'numeric'
  }).format(date); // e.g. "Sep 30"

  const timePart = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date); // e.g. "12:35 PM"

  return `${datePart}, ${timePart}`; // e.g. "Sep 30, 12:35 PM"
}

/**
 * CENTRALIZED EVENT PRESENTATION FORMATTER
 * Translates technical analytics events into human-readable titles and descriptions.
 */
export function formatActivityEvent(evt) {
  const path = evt.page_path || '';
  let title = 'Website Interaction';
  let description = 'Explored Health Express portal';
  let category = 'website';
  let iconType = 'globe';

  switch (evt.event_type) {
    case 'OTP_REQUESTED':
      title = 'OTP Verification Requested';
      description = 'Requested SMS OTP code for phone login.';
      category = 'account';
      iconType = 'phone';
      break;

    case 'OTP_VERIFIED':
    case 'LOGIN_SUCCESS':
      title = 'Account Sign In';
      description = 'Successfully authenticated via SMS OTP.';
      category = 'account';
      iconType = 'shield';
      break;

    case 'PAGE_VIEW':
      if (path === '/' || path === '') {
        title = 'Visited Health Express';
        description = 'Explored the main Health Express homepage.';
      } else if (path.includes('/services')) {
        title = 'Explored Diagnostic Services';
        description = 'Viewed the Diagnostic Services section.';
      } else if (path.includes('/health-calculators')) {
        title = 'Used Health Calculator';
        description = 'Opened the Health Calculator section.';
      } else if (path.includes('/surgeries')) {
        title = 'Viewed Surgery Packages';
        description = 'Explored surgical procedures and care packages.';
      } else if (path.includes('/about')) {
        title = 'Viewed About Health Express';
        description = 'Learned about Health Express care coordinators.';
      } else if (path.includes('/contact')) {
        title = 'Visited Contact Support';
        description = 'Navigated to Health Express care manager support.';
      } else if (path.includes('/dashboard')) {
        title = 'Opened Member Dashboard';
        description = 'Accessed your personal Health Express dashboard.';
      } else {
        title = 'Page View';
        description = `Visited ${path}`;
      }
      category = 'website';
      iconType = 'eye';
      break;

    case 'SERVICE_VIEW':
      title = 'Explored Diagnostic Service';
      description = evt.metadata?.service_name ? `Viewed ${evt.metadata.service_name}` : `Viewed service details on ${path}`;
      category = 'website';
      iconType = 'activity';
      break;

    case 'HEALTH_CALCULATOR_USED':
    case 'HEALTH_CALCULATOR_VIEW':
      title = 'Used Health Calculator';
      description = evt.metadata?.calculator_name ? `Ran ${evt.metadata.calculator_name}` : 'Calculated personal health assessment metrics.';
      category = 'website';
      iconType = 'calculator';
      break;

    case 'SURGERY_VIEW':
      title = 'Viewed Surgery Care Package';
      description = evt.metadata?.surgery_name ? `Explored ${evt.metadata.surgery_name}` : `Explored surgical options on ${path}`;
      category = 'website';
      iconType = 'hospital';
      break;

    case 'PRESCRIPTION_UPLOADED':
      title = 'Prescription Uploaded';
      description = evt.metadata?.file_name ? `Submitted prescription file ${evt.metadata.file_name}` : 'Prescription submitted successfully.';
      category = 'prescriptions';
      iconType = 'file-text';
      break;

    case 'ORDER_CREATED':
      title = 'Order Placed';
      description = evt.metadata?.order_code ? `Order ${evt.metadata.order_code} created successfully.` : 'Your order has been created.';
      category = 'orders';
      iconType = 'shopping-bag';
      break;

    case 'PAYMENT_SUCCESS':
      title = 'Payment Successful';
      description = evt.metadata?.amount ? `Payment of ₹${evt.metadata.amount} completed successfully.` : 'Payment received for diagnostic order.';
      category = 'payments';
      iconType = 'credit-card';
      break;

    case 'LOGOUT':
      title = 'Signed Out';
      description = 'Logged out of Health Express session.';
      category = 'account';
      iconType = 'log-out';
      break;

    default:
      title = evt.event_type.replace(/_/g, ' ');
      description = `Recorded event on ${path}`;
      category = 'website';
  }

  return { title, description, category, iconType };
}

/**
 * Builds unified, chronological activity timeline stream with source deduplication
 */
export function buildUnifiedTimelineStream({ events = [], orders = [], prescriptions = [], enquiries = [], payments = [] } = {}) {
  const unifiedItems = [];

  // 1. Process Analytics Events (using centralized formatter)
  events.forEach(evt => {
    const formatted = formatActivityEvent(evt);
    unifiedItems.push({
      id: evt.event_id || `evt_${evt.id}`,
      type: evt.event_type,
      category: formatted.category,
      title: formatted.title,
      description: formatted.description,
      iconType: formatted.iconType,
      timestamp: evt.created_at || new Date().toISOString(),
      raw: evt
    });
  });

  // 2. Process Prescriptions & Enquiries
  prescriptions.forEach(p => {
    const code = p.enquiries?.enquiry_code || (p.id ? `HE-2026-${p.id.slice(0, 6).toUpperCase()}` : 'UPLOAD');
    unifiedItems.push({
      id: `pres_${p.id}`,
      type: 'PRESCRIPTION_RECORD',
      category: 'prescriptions',
      title: 'Prescription Uploaded',
      description: `Prescription ${code} submitted successfully. File: ${p.file_name || 'Medical Document'}`,
      iconType: 'file-text',
      timestamp: p.created_at,
      raw: p
    });
  });

  enquiries.forEach(e => {
    const code = e.enquiry_code || (e.id ? `HEX-ENQ-${e.id.slice(0, 6).toUpperCase()}` : 'ENQUIRY');
    unifiedItems.push({
      id: `enq_${e.id}`,
      type: 'ENQUIRY_RECORD',
      category: 'prescriptions',
      title: 'Care Enquiry Submitted',
      description: `Enquiry ${code} received. Status: ${(e.status || 'pending').replace(/_/g, ' ')}`,
      iconType: 'message-square',
      timestamp: e.created_at,
      raw: e
    });
  });

  // 3. Process Orders
  orders.forEach(o => {
    const code = o.order_code || (o.id ? `HE-ORD-${o.id.slice(0, 6).toUpperCase()}` : 'ORDER');
    unifiedItems.push({
      id: `ord_${o.id}`,
      type: 'ORDER_RECORD',
      category: 'orders',
      title: 'Order Placed',
      description: `Order ${code} created successfully. Amount: ₹${o.final_amount || o.subtotal || 0}`,
      iconType: 'shopping-bag',
      timestamp: o.created_at,
      raw: o
    });
  });

  // 4. Process Payments
  payments.forEach(pay => {
    unifiedItems.push({
      id: `pay_${pay.id}`,
      type: 'PAYMENT_RECORD',
      category: 'payments',
      title: 'Payment Completed',
      description: `Payment of ₹${pay.amount || 0} completed via ${pay.payment_method || 'Online'}.`,
      iconType: 'credit-card',
      timestamp: pay.created_at,
      raw: pay
    });
  });

  // Sort unified items strictly descending (newest first)
  unifiedItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Source-level Timeline Deduplication: collapse identical items logged within 10 seconds of each other
  const deduplicatedItems = [];
  unifiedItems.forEach((item, index) => {
    if (index === 0) {
      deduplicatedItems.push(item);
      return;
    }

    const prev = deduplicatedItems[deduplicatedItems.length - 1];
    const timeDiff = Math.abs(new Date(item.timestamp).getTime() - new Date(prev.timestamp).getTime());

    // If title and category match and timestamps are within 10 seconds, skip duplicate
    if (item.title === prev.title && item.category === prev.category && timeDiff < 10000) {
      return;
    }

    deduplicatedItems.push(item);
  });

  return {
    allItems: deduplicatedItems
  };
}
