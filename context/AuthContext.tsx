import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Profile } from "@/types/database";
import { Session } from "@supabase/supabase-js";

interface AuthContextType {
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  isAnonymous: boolean;
  signInWithGoogle: () => Promise<{ success: boolean; error?: any }>;
  signInWithPhone: (
    phone: string
  ) => Promise<{ success: boolean; error?: any }>;
  verifyOtp: (
    phone: string,
    token: string
  ) => Promise<{ success: boolean; error?: any }>;
  signOut: () => Promise<void>;
  updateProfile: (
    updates: Partial<Profile>
  ) => Promise<{ success: boolean; error?: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state changed:", event);
        setSession(newSession);

        if (event === "SIGNED_IN" && newSession) {
          await loadProfile(newSession.user.id);
        } else if (event === "SIGNED_OUT") {
          await createAnonymousSession();
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const initializeAuth = async () => {
    try {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setSession(session);
        await loadProfile(session.user.id);
      } else {
        await createAnonymousSession();
      }
    } catch (error) {
      console.error("Error initializing auth:", error);
      await createAnonymousSession();
    } finally {
      setLoading(false);
    }
  };

  const createAnonymousSession = async () => {
    try {
      const { data: authData, error: authError } =
        await supabase.auth.signInAnonymously();

      if (authError) throw authError;

      if (authData.session && authData.user) {
        setSession(authData.session);

        // Check if profile exists
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", authData.user.id)
          .single();

        if (existingProfile) {
          setProfile(existingProfile);
        } else {
          // Create profile
          const { data: newProfile } = await supabase
            .from("profiles")
            .insert({
              user_id: authData.user.id,
              is_anonymous: true,
              display_name: "Usuário Anônimo",
            } as any)
            .select()
            .single();

          if (newProfile) {
            setProfile(newProfile);
          }
        }
      }
    } catch (error) {
      console.error("Error creating anonymous session:", error);
    }
  };

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      await createAuthenticatedProfile(userId);
    } else {
      setProfile(data);
    }
  };

  const createAuthenticatedProfile = async (userId: string) => {
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (existingProfile) {
      const { data: updatedProfile } = await supabase
        .from("profiles")
        .update({ is_anonymous: false })
        .eq("user_id", userId)
        .select()
        .single();

      if (updatedProfile) {
        setProfile(updatedProfile);
      }
    } else {
      const { data } = await supabase
        .from("profiles")
        .insert({
          user_id: userId,
          is_anonymous: false,
        } as any)
        .select()
        .single();

      if (data) {
        setProfile(data);
      }
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Error signing in with Google:", error);
      return { success: false, error };
    }
  };

  const signInWithPhone = async (phone: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({ phone });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Error signing in with phone:", error);
      return { success: false, error };
    }
  };

  const verifyOtp = async (phone: string, token: string) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: "sms",
      });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Error verifying OTP:", error);
      return { success: false, error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      await createAnonymousSession();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) return { success: false };

    try {
      const { data, error } = await supabase
        .from("profiles")
        .update(updates as any)
        .eq("id", profile.id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setProfile(data);
      }

      return { success: true };
    } catch (error) {
      console.error("Error updating profile:", error);
      return { success: false, error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        profile,
        session,
        loading,
        isAnonymous: profile?.is_anonymous ?? true,
        signInWithGoogle,
        signInWithPhone,
        verifyOtp,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
