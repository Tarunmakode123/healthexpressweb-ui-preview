import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Invoke zero-argument SECURITY DEFINER RPC to securely link guest records using server-derived phone
  const linkGuestRecords = async () => {
    if (!isSupabaseConfigured || !supabase) return;

    try {
      const { data: { session: activeSession } } = await supabase.auth.getSession();
      if (!activeSession?.user) return;

      // Zero-argument call: Server derives verified phone number from auth.users for auth.uid()
      const { error } = await supabase.rpc('link_guest_records_on_otp_login');

      if (error) {
        console.warn('Guest record linking notice:', error.message);
      }

      // Automatically claim idempotent signup reward for patient
      const { data: patient } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', activeSession.user.id)
        .maybeSingle();

      if (patient?.id) {
        await supabase.rpc('claim_signup_reward_atomic', { p_patient_id: patient.id });
      }
    } catch (err) {
      console.warn('Guest record linking exception:', err);
    }
  };

  useEffect(() => {
    let subscription = null;

    async function initAuth() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          setSession(currentSession);
          if (currentSession?.user) {
            const authUser = currentSession.user;
            await linkGuestRecords();

            // Fetch patient record for authentic full_name
            const { data: patRec } = await supabase
              .from('patients')
              .select('full_name, phone_e164')
              .eq('user_id', authUser.id)
              .maybeSingle();

            const resolvedName = patRec?.full_name || authUser.user_metadata?.full_name || authUser.user_metadata?.name || null;

            const mappedUser = {
              id: authUser.id,
              name: resolvedName,
              email: authUser.email || '',
              phone: authUser.phone || patRec?.phone_e164 || authUser.user_metadata?.phone || '',
              authType: authUser.phone ? 'phone' : 'email',
              createdAt: authUser.created_at
            };
            setUser(mappedUser);
          }
        } catch (e) {
          console.error('Error fetching Supabase auth session:', e);
        }

        // Listen for realtime auth state changes
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
          setSession(newSession);
          if (newSession?.user) {
            const authUser = newSession.user;
            if (event === 'SIGNED_IN') {
              await linkGuestRecords();
            }

            const { data: patRec } = await supabase
              .from('patients')
              .select('full_name, phone_e164')
              .eq('user_id', authUser.id)
              .maybeSingle();

            const resolvedName = patRec?.full_name || authUser.user_metadata?.full_name || authUser.user_metadata?.name || null;

            const mappedUser = {
              id: authUser.id,
              name: resolvedName,
              email: authUser.email || '',
              phone: authUser.phone || patRec?.phone_e164 || authUser.user_metadata?.phone || '',
              authType: authUser.phone ? 'phone' : 'email',
              createdAt: authUser.created_at
            };
            setUser(mappedUser);
            localStorage.setItem('health_express_user', JSON.stringify(mappedUser));
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
            setSession(null);
            localStorage.removeItem('health_express_user');
          }
        });
        subscription = authListener.subscription;
      } else {
        // Local Demo fallback
        try {
          const savedUser = localStorage.getItem('health_express_user');
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          }
        } catch (e) {
          console.error('Failed to parse local auth state:', e);
        }
      }
      setIsLoading(false);
    }

    initAuth();

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('health_express_user', JSON.stringify(userData));
    linkGuestRecords();
  };

  const signup = (userData) => {
    setUser(userData);
    localStorage.setItem('health_express_user', JSON.stringify(userData));
    linkGuestRecords();
  };

  const logout = async () => {
    try {
      const { logAnalyticsEvent } = await import('../utils/analytics.js');
      await logAnalyticsEvent('LOGOUT', { userId: user?.id || null });
    } catch (e) {
      // Non-blocking catch
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.error('Error signing out from Supabase Auth:', e);
      }
    }
    setUser(null);
    setSession(null);
    localStorage.removeItem('health_express_user');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session,
      isLoggedIn: !!user, 
      isLoading, 
      login, 
      signup, 
      logout,
      linkGuestRecords 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
