import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const ANONYMOUS_PROFILE_KEY = 'anonymous_profile_id';

export function useAuth() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  // Initialize profile (anonymous or authenticated)
  useEffect(() => {
    initializeProfile();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (event === 'SIGNED_IN' && session) {
          await handleSignIn(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          await createAnonymousProfile();
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const initializeProfile = async () => {
    try {
      setLoading(true);
      
      // Check if user is already authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setSession(session);
        await loadProfile(session.user.id);
      } else {
        // Load or create anonymous profile
        const anonymousProfileId = await AsyncStorage.getItem(ANONYMOUS_PROFILE_KEY);
        
        if (anonymousProfileId) {
          await loadProfileById(anonymousProfileId);
        } else {
          await createAnonymousProfile();
        }
      }
    } catch (error) {
      console.error('Error initializing profile:', error);
      await createAnonymousProfile();
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      // Create profile for authenticated user
      await createAuthenticatedProfile(userId);
    } else {
      setProfile(data);
    }
  };

  const loadProfileById = async (profileId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single();

    if (!error && data) {
      setProfile(data);
    } else {
      await createAnonymousProfile();
    }
  };

  const createAnonymousProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      // @ts-ignore - Supabase type inference limitation
      .insert({
        user_id: null,
        is_anonymous: true,
        display_name: 'Usuário Anônimo',
      } as any)
      .select()
      .single();

    if (!error && data) {
      setProfile(data);
      // @ts-ignore - data.id type inference
      await AsyncStorage.setItem(ANONYMOUS_PROFILE_KEY, data.id);
    }
  };

  const createAuthenticatedProfile = async (userId: string) => {
    // Check if there's an anonymous profile to migrate
    const anonymousProfileId = await AsyncStorage.getItem(ANONYMOUS_PROFILE_KEY);
    
    const { data, error } = await supabase
      .from('profiles')
      // @ts-ignore - Supabase type inference limitation
      .insert({
        user_id: userId,
        is_anonymous: false,
      } as any)
      .select()
      .single();

    if (!error && data) {
      // If there was an anonymous profile, migrate data
      if (anonymousProfileId) {
        // @ts-ignore - data.id type inference
        await migrateAnonymousData(anonymousProfileId, data.id);
        await AsyncStorage.removeItem(ANONYMOUS_PROFILE_KEY);
      }
      setProfile(data);
    }
  };

  const migrateAnonymousData = async (fromProfileId: string, toProfileId: string) => {
    try {
      // Migrate contacts
      await supabase
        .from('contacts')
        // @ts-ignore - Supabase type inference limitation
        .update({ profile_id: toProfileId } as any)
        .eq('profile_id', fromProfileId);

      // Migrate contact events
      await supabase
        .from('contact_events')
        // @ts-ignore - Supabase type inference limitation
        .update({ profile_id: toProfileId } as any)
        .eq('profile_id', fromProfileId);

      // Migrate gift ideas
      await supabase
        .from('gift_ideas')
        // @ts-ignore - Supabase type inference limitation
        .update({ profile_id: toProfileId } as any)
        .eq('profile_id', fromProfileId);

      // Migrate reminders
      await supabase
        .from('reminders')
        // @ts-ignore - Supabase type inference limitation
        .update({ profile_id: toProfileId } as any)
        .eq('profile_id', fromProfileId);

      // Delete old anonymous profile
      await supabase
        .from('profiles')
        .delete()
        .eq('id', fromProfileId);
    } catch (error) {
      console.error('Error migrating anonymous data:', error);
    }
  };

  const handleSignIn = async (userId: string) => {
    await loadProfile(userId);
  };

  const signInWithGoogle = useCallback(async () => {
    try {
      // This is a placeholder - you'll need to configure Google OAuth in Supabase
      // and add proper client IDs in app.json
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error signing in with Google:', error);
      return { success: false, error };
    }
  }, []);

  const signInWithPhone = useCallback(async (phone: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        phone,
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error signing in with phone:', error);
      return { success: false, error };
    }
  }, []);

  const verifyOtp = useCallback(async (phone: string, token: string) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms',
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return { success: false, error };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      await createAnonymousProfile();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!profile) return { success: false };

    try {
      const { data, error } = await supabase
        .from('profiles')
        // @ts-ignore - Supabase type inference limitation
        .update(updates as any)
        .eq('id', profile.id)
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        setProfile(data);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, error };
    }
  }, [profile]);

  return {
    profile,
    session,
    loading,
    isAnonymous: profile?.is_anonymous ?? true,
    signInWithGoogle,
    signInWithPhone,
    verifyOtp,
    signOut,
    updateProfile,
  };
}
