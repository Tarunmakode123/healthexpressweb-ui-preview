import { supabase } from '../lib/supabase.js';

/**
 * HEALTH EXPRESS — REALTIME SYNCHRONIZATION SERVICE
 * 
 * Provides unified helper functions for Admin Ops and User Dashboard
 * Supabase Realtime subscriptions across public.orders, public.prescriptions,
 * and public.enquiries.
 */

/**
 * Subscribe Admin Dashboard to live changes on orders, prescriptions, and enquiries.
 * Channel: admin-ops-realtime
 */
export function subscribeAdminOps({
  onOrderChange,
  onPrescriptionChange,
  onEnquiryChange,
  onStatusChange,
}) {
  if (!supabase) return null;

  const channelName = 'admin-ops-realtime';

  // Clean up any pre-existing channel with the same name before subscribing
  const existingChannel = supabase.getChannels().find((ch) => ch.name === channelName);
  if (existingChannel) {
    supabase.removeChannel(existingChannel);
  }

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'orders' },
      (payload) => {
        onOrderChange?.({ eventType: 'INSERT', record: payload.new, oldRecord: payload.old });
      }
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'orders' },
      (payload) => {
        onOrderChange?.({ eventType: 'UPDATE', record: payload.new, oldRecord: payload.old });
      }
    )
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'prescriptions' },
      (payload) => {
        onPrescriptionChange?.({ eventType: 'INSERT', record: payload.new, oldRecord: payload.old });
      }
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'prescriptions' },
      (payload) => {
        onPrescriptionChange?.({ eventType: 'UPDATE', record: payload.new, oldRecord: payload.old });
      }
    )
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'enquiries' },
      (payload) => {
        onEnquiryChange?.({ eventType: 'INSERT', record: payload.new, oldRecord: payload.old });
      }
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'enquiries' },
      (payload) => {
        onEnquiryChange?.({ eventType: 'UPDATE', record: payload.new, oldRecord: payload.old });
      }
    )
    .subscribe((status, err) => {
      if (onStatusChange) onStatusChange(status, err);
    });

  return channel;
}

/**
 * Subscribe User Dashboard to live status updates on their own orders and prescriptions.
 * Channel: user-dashboard-{userId}
 * Filter: user_id=eq.{userId}
 */
export function subscribeUserDashboard({
  userId,
  onOrderChange,
  onPrescriptionChange,
  onStatusChange,
}) {
  if (!supabase || !userId) return null;

  const channelName = `user-dashboard-${userId}`;

  // Clean up any pre-existing channel with the same name before subscribing
  const existingChannel = supabase.getChannels().find((ch) => ch.name === channelName);
  if (existingChannel) {
    supabase.removeChannel(existingChannel);
  }

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onOrderChange?.({ eventType: 'UPDATE', record: payload.new, oldRecord: payload.old });
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'prescriptions',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onPrescriptionChange?.({ eventType: 'UPDATE', record: payload.new, oldRecord: payload.old });
      }
    )
    .subscribe((status, err) => {
      if (onStatusChange) onStatusChange(status, err);
    });

  return channel;
}

/**
 * Cleanly remove a Supabase Realtime channel
 */
export function unsubscribeChannel(channel) {
  if (!supabase || !channel) return;
  try {
    supabase.removeChannel(channel);
  } catch (e) {
    console.warn('Realtime cleanup warning:', e?.message || e);
  }
}
