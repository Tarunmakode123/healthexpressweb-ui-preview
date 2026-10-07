import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

function getSessionId() {
  if (typeof window === 'undefined') return 'hex_sess_server';
  let sid = sessionStorage.getItem('hex_session_id');
  if (!sid) {
    sid = 'hex_sess_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
    sessionStorage.setItem('hex_session_id', sid);
  }
  return sid;
}

// In-memory deduplication cache map (key -> timestamp) to prevent duplicate event logging
const loggedEventsCache = new Map();

/**
 * Log user interaction & customer activity events to Supabase database.
 * Completely non-blocking, deduplicated, and fail-safe.
 */
export async function logAnalyticsEvent(eventType, { pagePath = null, metadata = {}, userId = null, patientId = null, deduplicate = false } = {}) {
  if (!eventType) return;

  const currentPath = pagePath || (typeof window !== 'undefined' ? window.location.pathname : '/');
  const session_id = getSessionId();

  // Automatic deduplication for PAGE_VIEW and LOGIN_SUCCESS to prevent React StrictMode & re-render duplicates
  const isAutoDeduplicated = deduplicate || eventType === 'PAGE_VIEW' || eventType === 'LOGIN_SUCCESS';

  if (isAutoDeduplicated) {
    const cacheKey = `${eventType}_${session_id}_${currentPath}_${JSON.stringify(metadata)}`;
    const lastLoggedAt = loggedEventsCache.get(cacheKey);
    const now = Date.now();

    // 10-second deduplication threshold
    if (lastLoggedAt && (now - lastLoggedAt) < 10000) {
      return;
    }
    loggedEventsCache.set(cacheKey, now);
  }

  // Automatically attach authenticated user_id if logged in
  let currentUserId = userId;
  if (!currentUserId && isSupabaseConfigured && supabase) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      currentUserId = session?.user?.id || null;
    } catch (e) {
      // Non-blocking
    }
  }

  const eventData = {
    event_id: 'evt_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now(),
    session_id: session_id,
    user_id: currentUserId,
    patient_id: patientId,
    event_type: eventType,
    page_path: currentPath,
    metadata: metadata
  };

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('analytics_events').insert(eventData);
    } catch (err) {
      console.warn('Analytics event logging notice:', err);
    }
  }
}
