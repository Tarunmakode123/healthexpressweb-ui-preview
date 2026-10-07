/**
 * MEMBER ACTIVITY CLASSIFIER SERVICE
 * Deterministically evaluates authenticated user activity stream, order history, 
 * prescription uploads, and interactions to compute dynamic 2D state:
 * - primaryStage: 'new_member' | 'explorer' | 'prescription_user' | 'active_customer'
 * - engagement: 'first_visit' | 'active' | 'returning'
 */

export function classifyMemberActivity({
  user = null,
  events = [],
  orders = [],
  prescriptions = [],
  enquiries = [],
  payments = [],
  walletCoins = 0
} = {}) {
  const prescriptionsCount = prescriptions?.length || 0;
  const enquiriesCount = enquiries?.length || 0;
  const ordersCount = orders?.length || 0;
  const paymentsCount = payments?.length || 0;
  const eventsCount = events?.length || 0;

  // Filter website exploration events
  const explorationEvents = events.filter(e => 
    e.event_type === 'PAGE_VIEW' || 
    e.event_type === 'SERVICE_VIEW' || 
    e.event_type === 'HEALTH_CALCULATOR_VIEW' ||
    e.event_type === 'HEALTH_CALCULATOR_USED' ||
    e.event_type === 'SURGERY_VIEW' ||
    e.event_type === 'SEARCH'
  );
  const visitsCount = Math.max(eventsCount, explorationEvents.length);

  // Determine Primary Stage
  let primaryStage = 'new_member';
  if (ordersCount > 0 || paymentsCount > 0) {
    primaryStage = 'active_customer';
  } else if (prescriptionsCount > 0 || enquiriesCount > 0) {
    primaryStage = 'prescription_user';
  } else if (visitsCount > 1 || explorationEvents.length > 0) {
    primaryStage = 'explorer';
  } else {
    primaryStage = 'new_member';
  }

  // Determine Engagement State & Activity Timestamps
  const timestamps = [
    user?.createdAt ? new Date(user.createdAt).getTime() : null,
    ...events.map(e => e.created_at ? new Date(e.created_at).getTime() : null),
    ...orders.map(o => o.created_at ? new Date(o.created_at).getTime() : null),
    ...prescriptions.map(p => p.created_at ? new Date(p.created_at).getTime() : null),
    ...enquiries.map(e => e.created_at ? new Date(e.created_at).getTime() : null)
  ].filter(Boolean).sort((a, b) => a - b);

  const firstActivityAt = timestamps.length > 0 ? new Date(timestamps[0]).toISOString() : (user?.createdAt || new Date().toISOString());
  const lastActivityAt = timestamps.length > 0 ? new Date(timestamps[timestamps.length - 1]).toISOString() : new Date().toISOString();

  const nowMs = Date.now();
  const firstActivityMs = new Date(firstActivityAt).getTime();
  const lastActivityMs = new Date(lastActivityAt).getTime();
  const totalDays = (nowMs - firstActivityMs) / (1000 * 60 * 60 * 24);

  let engagement = 'first_visit';
  if (totalDays <= 1 && eventsCount <= 3 && ordersCount === 0 && prescriptionsCount === 0) {
    engagement = 'first_visit';
  } else if (totalDays > 1 && (eventsCount > 3 || ordersCount > 0 || prescriptionsCount > 0)) {
    engagement = 'returning';
  } else {
    engagement = 'active';
  }

  // Milestones Progress Tracker
  const milestones = {
    accountCreated: true,
    exploredServices: explorationEvents.length > 0 || visitsCount > 1,
    prescriptionUploaded: prescriptionsCount > 0 || enquiriesCount > 0,
    orderPlaced: ordersCount > 0,
    careFulfillment: orders.some(o => o.order_status === 'completed' || o.order_status === 'delivered')
  };

  // Next Best Action Recommendation
  let nextBestAction = {
    title: 'Welcome to Health Express',
    description: 'Upload your prescription or explore our comprehensive diagnostic lab tests to get started.',
    primaryCTA: { label: 'Upload Prescription', action: 'open_upload_modal', type: 'primary' },
    secondaryCTA: { label: 'Explore Services', action: 'navigate_services', type: 'secondary' }
  };

  if (primaryStage === 'active_customer') {
    const latestOrder = orders[0];
    const orderCode = latestOrder?.order_code || (latestOrder?.id ? `HE-ORD-${latestOrder.id.slice(0, 6).toUpperCase()}` : 'Order');
    const orderStatus = (latestOrder?.order_status || 'processing').replace('_', ' ');

    nextBestAction = {
      title: `Order Status: ${orderStatus.toUpperCase()}`,
      description: `Your order ${orderCode} is currently ${orderStatus}. Need assistance or updates?`,
      primaryCTA: { label: 'View Order Details', action: 'filter_orders', type: 'primary' },
      secondaryCTA: { label: 'WhatsApp Support', action: 'open_whatsapp', type: 'secondary' }
    };
  } else if (primaryStage === 'prescription_user') {
    const latestPrescription = prescriptions[0] || enquiries[0];
    const presCode = latestPrescription?.enquiry_code || (latestPrescription?.id ? `HE-2026-${latestPrescription.id.slice(0, 6).toUpperCase()}` : 'Upload');
    const presStatus = (latestPrescription?.status || 'under_review').replace('_', ' ');

    nextBestAction = {
      title: `Prescription ${presCode}: ${presStatus.toUpperCase()}`,
      description: 'Our care team is reviewing your prescription to assign a dedicated coordinator.',
      primaryCTA: { label: 'Track Prescription', action: 'filter_prescriptions', type: 'primary' },
      secondaryCTA: { label: 'Browse Diagnostic Services', action: 'navigate_services', type: 'secondary' }
    };
  } else if (primaryStage === 'explorer') {
    nextBestAction = {
      title: 'Ready to Book your Diagnostics?',
      description: 'Upload your doctor prescription for quick processing, or select from our full body checkup packages.',
      primaryCTA: { label: 'Upload Prescription', action: 'open_upload_modal', type: 'primary' },
      secondaryCTA: { label: 'Browse All Services', action: 'navigate_services', type: 'secondary' }
    };
  }

  return {
    primaryStage,
    engagement,
    firstActivityAt,
    lastActivityAt,
    metrics: {
      visits: visitsCount,
      prescriptions: prescriptionsCount,
      orders: ordersCount,
      payments: paymentsCount,
      enquiries: enquiriesCount,
      walletCoins: walletCoins
    },
    nextBestAction,
    milestones
  };
}
