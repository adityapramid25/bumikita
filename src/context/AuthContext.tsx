'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured, UserProfile } from '@/src/lib/supabase/client';

export type { UserProfile };

export interface SignUpParams {
  email: string;
  password: string;
  fullName: string;
  nickname?: string;
  avatarUrl?: string;
  role?: 'student' | 'school' | 'creator';
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isConfigured: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'register';
  authNoticeMessage: string | null;
  setAuthNoticeMessage: (msg: string | null) => void;
  openAuthModal: (mode?: 'login' | 'register', notice?: string) => void;
  closeAuthModal: () => void;
  signUp: (params: SignUpParams) => Promise<{ success: boolean; error?: string; requiresEmailConfirmation?: boolean }>;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  uploadAvatar: (file: File) => Promise<{ success: boolean; url?: string; error?: string }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Local fallback user for prototype preview when Supabase env keys haven't been attached yet
const LOCAL_STORAGE_USER_KEY = 'bumikita_supabase_sim_user';
const LOCAL_STORAGE_PROFILE_KEY = 'bumikita_supabase_sim_profile';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [authNoticeMessage, setAuthNoticeMessage] = useState<string | null>(null);
  const configured = isSupabaseConfigured();

  const openAuthModal = useCallback((mode: 'login' | 'register' = 'login', notice?: string) => {
    setAuthModalMode(mode);
    setAuthNoticeMessage(notice ?? null);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setAuthNoticeMessage(null);
  }, []);

  // Fetch profile from Supabase profiles table
  const fetchProfile = useCallback(async (userId: string) => {
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching Supabase profile:', error.message);
      }

      if (data) {
        setProfile(data as UserProfile);
      } else {
        // Fallback: profile row might be slightly delayed if trigger just ran
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser) {
          const fallbackProfile: UserProfile = {
            id: currentUser.id,
            full_name: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || null,
            nickname: currentUser.user_metadata?.nickname || `eco_${currentUser.id.slice(0, 8)}`,
            avatar_url: currentUser.user_metadata?.avatar_url || null,
            phone_number: null,
            bio: null,
            daun_points: 100,
            trees_planted: 0,
            eco_role: 'citizen',
            province: null,
            city_district: null,
            subdistrict: null,
            village: null,
            postal_code: null,
            address_detail: null,
          };
          setProfile(fallbackProfile);
        }
      }
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    let isMounted = true;
    const supabase = getSupabase();

    const initializeAuth = async () => {
      if (!supabase) {
        // Offline/local simulated persistence when Supabase env keys are empty
        try {
          const savedUser = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
          const savedProfile = localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY);
          if (isMounted && savedUser && savedProfile) {
            setUser(JSON.parse(savedUser));
            setProfile(JSON.parse(savedProfile));
          }
        } catch {}
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      // Real Supabase session initialization
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (isMounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          if (currentSession?.user) {
            await fetchProfile(currentSession.user.id);
          }
        }
      } catch (err) {
        console.error('Error initializing session:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    if (!supabase) {
      return () => {
        isMounted = false;
      };
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (!isMounted) return;
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          await fetchProfile(newSession.user.id);
        } else {
          setProfile(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Sign Up with Supabase Auth & raw_user_meta_data
  const signUp = async ({ email, password, fullName, nickname, avatarUrl, role }: SignUpParams) => {
    const supabase = getSupabase();

    if (!supabase) {
      // Local simulated signup fallback
      const simId = 'sim-' + Math.random().toString(36).substring(2, 9);
      const simulatedUser = {
        id: simId,
        email,
        user_metadata: { full_name: fullName, nickname, avatar_url: avatarUrl, role },
      } as unknown as User;

      const mappedRole = role === 'creator' ? 'artisan' : 'citizen';
      const simulatedProfile: UserProfile = {
        id: simId,
        full_name: fullName,
        nickname: nickname || `eco_${simId.slice(4)}`,
        avatar_url: avatarUrl || null,
        phone_number: null,
        bio: 'Pelopor daur ulang BumiKita.',
        daun_points: 100, // Matches Supabase trigger welcome incentive
        trees_planted: 0,
        eco_role: mappedRole as UserProfile['eco_role'],
        province: null,
        city_district: null,
        subdistrict: null,
        village: null,
        postal_code: null,
        address_detail: null,
      };

      setUser(simulatedUser);
      setProfile(simulatedProfile);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(simulatedUser));
      localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(simulatedProfile));
      return { success: true };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            nickname: nickname || undefined,
            avatar_url: avatarUrl || undefined,
            role: role || 'student',
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        if (data.session) {
          await fetchProfile(data.user.id);
        }
        return { 
          success: true, 
          requiresEmailConfirmation: !data.session 
        };
      }

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mendaftar akun ke Supabase';
      return { success: false, error: msg };
    }
  };

  // Sign In with Supabase Auth
  const signIn = async (email: string, password: string, rememberMe = true) => {
    const supabase = getSupabase();

    if (!supabase) {
      // Local simulated login
      const simId = 'sim-' + Math.random().toString(36).substring(2, 9);
      const simulatedUser = {
        id: simId,
        email,
        user_metadata: { full_name: email.split('@')[0], nickname: email.split('@')[0] },
      } as unknown as User;

      const simulatedProfile: UserProfile = {
        id: simId,
        full_name: email.split('@')[0],
        nickname: email.split('@')[0],
        avatar_url: null,
        phone_number: null,
        bio: 'Pelopor daur ulang BumiKita.',
        daun_points: 480,
        trees_planted: 2,
        eco_role: 'citizen',
        province: 'DKI Jakarta',
        city_district: 'Jakarta Selatan',
        subdistrict: 'Kebayoran Baru',
        village: 'Senayan',
        postal_code: '12190',
        address_detail: 'Jl. Bumi Indah No. 42',
      };

      setUser(simulatedUser);
      setProfile(simulatedProfile);
      if (rememberMe) {
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(simulatedUser));
        localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(simulatedProfile));
      }
      return { success: true };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        await fetchProfile(data.user.id);
      }

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal masuk ke akun Supabase';
      return { success: false, error: msg };
    }
  };

  // Sign Out
  const signOut = async () => {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    setSession(null);
    try {
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
      localStorage.removeItem(LOCAL_STORAGE_PROFILE_KEY);
    } catch {}
  };

  // Update Profile (including Indonesian Address Hierarchy)
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      return { success: false, error: 'User belum masuk' };
    }

    const supabase = getSupabase();

    if (!supabase) {
      // Local update
      const updated = { ...profile, ...updates } as UserProfile;
      setProfile(updated);
      localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(updated));
      return { success: true };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        return { success: false, error: error.message };
      }

      await fetchProfile(user.id);
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memperbarui profil Supabase';
      return { success: false, error: msg };
    }
  };

  // Upload Avatar to Supabase Storage 'avatars' bucket
  const uploadAvatar = async (file: File) => {
    if (!user) {
      return { success: false, error: 'User belum masuk' };
    }

    const supabase = getSupabase();

    if (!supabase) {
      // Offline fallback: data URL
      return new Promise<{ success: boolean; url?: string; error?: string }>((resolve) => {
        const reader = new FileReader();
        reader.onload = async () => {
          const url = reader.result as string;
          await updateProfile({ avatar_url: url });
          resolve({ success: true, url });
        };
        reader.onerror = () => resolve({ success: false, error: 'Gagal membaca file gambar' });
        reader.readAsDataURL(file);
      });
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true,
        });

      if (uploadError) {
        return { success: false, error: uploadError.message };
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Append timestamp to break CDN cache on new uploads
      const finalUrl = `${publicUrl}?t=${Date.now()}`;
      await updateProfile({ avatar_url: finalUrl });

      return { success: true, url: finalUrl };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengunggah foto profil ke Supabase Storage';
      return { success: false, error: msg };
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        isConfigured: configured,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        authNoticeMessage,
        setAuthNoticeMessage,
        openAuthModal,
        closeAuthModal,
        signUp,
        signIn,
        signOut,
        updateProfile,
        uploadAvatar,
        refreshProfile,
      }}
    >
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
