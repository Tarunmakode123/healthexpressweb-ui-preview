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

// In-memory deduplication cache to prevent duplicate events on React re-renders
const loggedEventsCache = new Set();

/**
 * Log non-PII user interaction & customer activity events to Supabase database.
 * Completely non-blocking and fail-safe (main app flow will never crash if logging fails).
 */
export async function logAnalyticsEvent(eventType, { pagePath = null, metadata = {}, userId = null, patientId = null, deduplicate = false } = {}) {
  if (!eventType) return;

  const currentPath = pagePath || (typeof window !== 'undefined' ? window.location.pathname : '/');

  if (deduplicate) {
    const cacheKey = `${eventType}_${currentPath}_${JSON.stringify(metadata)}`;
    if (loggedEventsCache.has(cacheKey)) return;
    loggedEventsCache.add(cacheKey);
    setTimeout(() => loggedEventsCache.delete(cacheKey), 3000); // 3s deduplication window
  }

  const session_id = getSessionId();

  // Automatically attach authenticated user_id if logged in
  let currentUserId = userId;
  if (!currentUserId && isSupabaseConfigured && supabase) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      currentUserId = session?.user?.id || null;
    } catch (e) {
      // Ignore auth fetch failure
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
