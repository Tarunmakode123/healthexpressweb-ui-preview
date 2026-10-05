import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

/**
 * Fetch all health records (prescriptions & reports) for the authenticated customer
 */
export async function fetchCustomerHealthRecords() {
  if (!isSupabaseConfigured || !supabase) {
    return { success: true, data: [] };
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId) {
      return { success: true, data: [] };
    }

    // Query prescriptions table for records linked to user_id directly
    const { data: prescriptions, error } = await supabase
      .from('prescriptions')
      .select(`
        *,
        enquiries(enquiry_code, status, created_at)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch customer health records DB error:', error.message);
      return { success: false, error: `Failed to load health records: ${error.message}` };
    }

    // Generate signed preview/download URLs for private storage files
    const formattedRecords = await Promise.all(
      (prescriptions || []).map(async (item) => {
        let signedUrl = null;
        if (item.file_path) {
          const { data: urlData } = await supabase.storage
            .from('prescriptions')
            .createSignedUrl(item.file_path, 300); // 5 min expiry
          signedUrl = urlData?.signedUrl || null;
        }

        return {
          id: item.id,
          fileName: item.file_name || 'Prescription Document',
          filePath: item.file_path,
          fileType: item.file_type || 'document',
          fileSize: item.file_size || 0,
          signedUrl: signedUrl,
          uploadDate: item.created_at,
          enquiryCode: item.enquiries?.enquiry_code || 'HEX-ENQ-RECORD',
          status: item.enquiries?.status || 'pending_review'
        };
      })
    );

    return { success: true, data: formattedRecords };
  } catch (err) {
    console.error('Fetch health records exception:', err);
    return { success: false, error: err.message || 'Error retrieving health records.' };
  }
}

/**
 * Fetch prescription history for the authenticated customer
 */
export async function fetchCustomerPrescriptions() {
  if (!isSupabaseConfigured || !supabase) {
    return { success: true, data: [] };
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId) {
      return { success: true, data: [] };
    }

    const { data: prescriptions, error } = await supabase
      .from('prescriptions')
      .select(`
        *,
        enquiries(enquiry_code, status, created_at)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch customer prescriptions DB error:', error.message);
      return { success: false, error: `Failed to load prescription history: ${error.message}` };
    }

    return { success: true, data: prescriptions || [] };
  } catch (err) {
    console.error('Fetch prescriptions exception:', err);
    return { success: false, error: err.message || 'Error retrieving prescription history.' };
  }
}

/**
 * Fetch purchase / order history for the authenticated customer
 */
export async function fetchCustomerOrders() {
  if (!isSupabaseConfigured || !supabase) {
    return { success: true, data: [] };
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId) {
      return { success: true, data: [] };
    }

    // Clean PostgREST query: filter directly on orders.user_id = userId
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        payments(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch customer orders DB error:', error.message);
      return { success: false, error: `Failed to load order history: ${error.message}` };
    }

    return { success: true, data: orders || [] };
  } catch (err) {
    console.error('Fetch orders exception:', err);
    return { success: false, error: err.message || 'Error retrieving order history.' };
  }
}

/**
 * Fetch consolidated dashboard metrics for customer overview
 */
export async function fetchCustomerOverviewStats() {
  const [recRes, ordRes] = await Promise.all([
    fetchCustomerHealthRecords(),
    fetchCustomerOrders()
  ]);

  const records = recRes.data || [];
  const orders = ordRes.data || [];

  const totalFiles = records.length;
  const reportsCount = records.filter(r => r.fileType?.includes('pdf') || r.fileName?.toLowerCase().includes('report')).length;
  const prescriptionsCount = totalFiles - reportsCount > 0 ? totalFiles - reportsCount : totalFiles;
  
  const latestUpload = records.length > 0 ? records[0].uploadDate : null;

  return {
    success: true,
    stats: {
      totalFiles,
      reportsCount,
      prescriptionsCount,
      latestUpload,
      ordersCount: orders.length,
      paidOrdersCount: orders.filter(o => o.payment_status === 'PAID').length
    }
  };
}
