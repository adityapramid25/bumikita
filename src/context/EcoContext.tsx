'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Product,
  CartItem,
  EcoQuest,
  DailyMission,
  UserMissionLog,
  CommunityPost,
  CategoryType,
  TreeMilestone,
} from '@/src/types';
import {
  INITIAL_PRODUCTS,
  INITIAL_QUESTS,
  INITIAL_COMMUNITY_POSTS,
} from '@/src/data/mockData';
import { useAuth } from '@/src/context/AuthContext';
import { getSupabase } from '@/src/lib/supabase/client';

export const DEFAULT_DAILY_MISSIONS: DailyMission[] = [
  {
    id: 'daily_checkin',
    title: 'Absen Harian',
    description: 'Buka aplikasi dan klaim bonus harianmu',
    reward_points: 30,
    action_type: 'instant',
    target_count: 1,
    icon_name: 'CalendarCheck',
    is_active: true,
  },
  {
    id: 'share_friend',
    title: 'Ajak Teman Pilah Sampah',
    description: 'Bagikan tautan BumiKita ke WhatsApp / media sosial',
    reward_points: 50,
    action_type: 'share',
    target_count: 1,
    icon_name: 'Share2',
    is_active: true,
  },
  {
    id: 'explore_market',
    title: 'Jelajahi Green Market',
    description: 'Lihat minimal 2 karya kreasi upcycle mahasiswa',
    reward_points: 30,
    action_type: 'navigate',
    target_count: 2,
    icon_name: 'ShoppingBag',
    is_active: true,
  },
  {
    id: 'read_eco_tip',
    title: 'Edukasi 1 Menit',
    description: 'Baca tip daur ulang sampah polimer hari ini',
    reward_points: 20,
    action_type: 'instant',
    target_count: 1,
    icon_name: 'BookOpen',
    is_active: true,
  },
];

interface EcoContextType {
  activeTab: 'market' | 'scanner' | 'diy-studio' | 'quests-forest' | 'dropoff-map';
  setActiveTab: (tab: 'market' | 'scanner' | 'diy-studio' | 'quests-forest' | 'dropoff-map') => void;
  daunPoints: number;
  addDaunPoints: (amount: number, reason: string) => void;
  spendDaunPoints: (amount: number) => boolean;
  deductScanPoints: (cost?: number) => Promise<{
    success: boolean;
    code?: string;
    remaining_points?: number;
    deducted?: number;
    message?: string;
  }>;
  dailyMissions: DailyMission[];
  isDailyMissionsLoading: boolean;
  fetchDailyMissions: () => Promise<void>;
  claimDailyMission: (missionId: string) => Promise<{
    success: boolean;
    reward?: number;
    new_total_points?: number;
    message: string;
  }>;
  isInsufficientModalOpen: boolean;
  setIsInsufficientModalOpen: (open: boolean) => void;
  co2SavedKg: number;
  wasteDivertedKg: number;
  treesPlanted: number;
  plantedTreesList: TreeMilestone[];
  plantRealTree: () => boolean;
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  selectedProductModal: Product | null;
  setSelectedProductModal: (product: Product | null) => void;
  quests: EcoQuest[];
  completeQuest: (questId: string) => void;
  communityPosts: CommunityPost[];
  likePost: (postId: string) => void;
  addCommunityPost: (post: Omit<CommunityPost, 'id' | 'createdAt' | 'leavesCount' | 'commentsCount'>) => void;
  activeFilterCategory: CategoryType;
  setActiveFilterCategory: (cat: CategoryType) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isRewardModalOpen: boolean;
  setIsRewardModalOpen: (open: boolean) => void;
  notificationToast: { message: string; points?: number; icon?: string } | null;
  setNotificationToast: (toast: { message: string; points?: number; icon?: string } | null) => void;
}

const EcoContext = createContext<EcoContextType | undefined>(undefined);

const INITIAL_TREES: TreeMilestone[] = [
  {
    id: 'tree-1',
    species: 'Rhizophora Mucronata (Mangrove Bakau)',
    location: 'Konservasi Mangrove Pulau Pari, Kepulauan Seribu',
    plantedDate: '12 Juli 2026',
    coordinates: "5°51'24.8\"S 106°37'08.2\"E",
    certificateId: 'BK-MNG-2026-0842',
    co2AbsorbedPerYearKg: 12.3,
  },
  {
    id: 'tree-2',
    species: 'Dipterocarpus (Pohon Meranti Hijau)',
    location: 'Taman Hutan Hujan Bukit Soeharto, Kalimantan Timur',
    plantedDate: '04 Agustus 2026',
    coordinates: "0°58'12.4\"S 117°02'44.1\"E",
    certificateId: 'BK-KAL-2026-1194',
    co2AbsorbedPerYearKg: 22.5,
  },
];

export function EcoProvider({ children }: { children: React.ReactNode }) {
  const { user, profile, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'market' | 'scanner' | 'diy-studio' | 'quests-forest' | 'dropoff-map'>('market');
  
  const [daunPoints, setDaunPoints] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('bumikita_points');
        if (saved) return Number(saved);
      } catch {}
    }
    return 480;
  });

  // Daily missions state
  const [dailyMissions, setDailyMissions] = useState<DailyMission[]>(DEFAULT_DAILY_MISSIONS);
  const [isDailyMissionsLoading, setIsDailyMissionsLoading] = useState<boolean>(false);
  const [isInsufficientModalOpen, setIsInsufficientModalOpen] = useState<boolean>(false);

  // Sync with profile daun_points if available from Supabase / AuthContext
  useEffect(() => {
    if (profile && typeof profile.daun_points === 'number') {
      const pts = profile.daun_points;
      const timer = setTimeout(() => {
        setDaunPoints((prev) => (prev !== pts ? pts : prev));
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [profile]);

  const [co2SavedKg, setCo2SavedKg] = useState<number>(34.8);
  const [wasteDivertedKg, setWasteDivertedKg] = useState<number>(18.5);
  const [treesPlanted, setTreesPlanted] = useState<number>(2);
  const [plantedTreesList, setPlantedTreesList] = useState<TreeMilestone[]>(INITIAL_TREES);
  
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('bumikita_cart');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [
      {
        product: INITIAL_PRODUCTS[0],
        quantity: 1,
      },
    ];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProductModal, setSelectedProductModal] = useState<Product | null>(null);
  
  const [quests, setQuests] = useState<EcoQuest[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('bumikita_quests');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_QUESTS;
  });

  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(INITIAL_COMMUNITY_POSTS);
  const [activeFilterCategory, setActiveFilterCategory] = useState<CategoryType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [notificationToast, setNotificationToast] = useState<{ message: string; points?: number; icon?: string } | null>(null);

  // Fetch and sync daily missions from Supabase or localStorage
  const fetchDailyMissions = useCallback(async () => {
    setIsDailyMissionsLoading(true);
    const supabase = getSupabase();
    const today = new Date().toISOString().split('T')[0];

    let missionsList: DailyMission[] = DEFAULT_DAILY_MISSIONS;

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('daily_missions')
          .select('*')
          .eq('is_active', true);

        if (!error && data && data.length > 0) {
          missionsList = data as DailyMission[];
        }
      } catch (err) {
        console.warn('Could not load daily_missions from Supabase, using defaults', err);
      }
    }

    // Check claimed logs for current user
    if (supabase && user) {
      try {
        const { data: logs, error: logsErr } = await supabase
          .from('user_mission_logs')
          .select('mission_id, is_claimed, claimed_at')
          .eq('user_id', user.id)
          .eq('completed_date', today);

        if (!logsErr && logs) {
          const claimedMap = new Map<string, { is_claimed: boolean; claimed_at?: string }>();
          logs.forEach((l) => claimedMap.set(l.mission_id, { is_claimed: l.is_claimed, claimed_at: l.claimed_at }));

          missionsList = missionsList.map((m) => {
            const log = claimedMap.get(m.id);
            return {
              ...m,
              is_claimed: log?.is_claimed ?? false,
              claimed_at: log?.claimed_at,
            };
          });
        }
      } catch (logErr) {
        console.warn('Error fetching user_mission_logs:', logErr);
      }
    } else {
      // Local claimed logs check
      try {
        const claimedKey = `bumikita_claimed_missions_${today}`;
        const localClaimed: string[] = JSON.parse(localStorage.getItem(claimedKey) || '[]');
        missionsList = missionsList.map((m) => ({
          ...m,
          is_claimed: localClaimed.includes(m.id),
        }));
      } catch {}
    }

    setDailyMissions(missionsList);
    setIsDailyMissionsLoading(false);
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchDailyMissions();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchDailyMissions]);

  // Save changes
  useEffect(() => {
    try {
      localStorage.setItem('bumikita_points', String(daunPoints));
      localStorage.setItem('bumikita_cart', JSON.stringify(cart));
      localStorage.setItem('bumikita_quests', JSON.stringify(quests));
    } catch (e) {
      console.error('Failed to persist eco state', e);
    }
  }, [daunPoints, cart, quests]);

  // Atomic Deduction of 50 Daun for AI Scan
  const deductScanPoints = async (cost: number = 50): Promise<{
    success: boolean;
    code?: string;
    remaining_points?: number;
    deducted?: number;
    message?: string;
  }> => {
    const supabase = getSupabase();

    if (supabase && user) {
      try {
        const { data, error } = await supabase.rpc('deduct_scan_points', { cost });
        if (error) {
          console.error('Supabase RPC deduct_scan_points error:', error);
          if (daunPoints < cost) {
            setIsInsufficientModalOpen(true);
            return {
              success: false,
              code: 'INSUFFICIENT_POINTS',
              message: 'Daun Poin tidak cukup untuk memindai sampah (Butuh 50 Daun).',
            };
          }
        } else if (data) {
          if (!data.success) {
            if (data.code === 'INSUFFICIENT_POINTS' || data.current_points < cost) {
              setIsInsufficientModalOpen(true);
            }
            return {
              success: false,
              code: data.code || 'INSUFFICIENT_POINTS',
              remaining_points: data.current_points,
              message: data.message || 'Daun Poin tidak cukup untuk memindai sampah.',
            };
          }

          setDaunPoints(data.remaining_points);
          await refreshProfile();
          return {
            success: true,
            remaining_points: data.remaining_points,
            deducted: cost,
          };
        }
      } catch (rpcErr) {
        console.error('Unexpected RPC error:', rpcErr);
      }
    }

    // Local / Offline / Preview Fallback with Zero-Point Protection
    if (daunPoints < cost) {
      setIsInsufficientModalOpen(true);
      return {
        success: false,
        code: 'INSUFFICIENT_POINTS',
        remaining_points: daunPoints,
        message: 'Daun Poin tidak cukup untuk memindai sampah (Butuh 50 Daun).',
      };
    }

    const remaining = daunPoints - cost;
    setDaunPoints(remaining);

    try {
      localStorage.setItem('bumikita_points', String(remaining));
      const simProfileStr = localStorage.getItem('bumikita_supabase_sim_profile');
      if (simProfileStr) {
        const parsed = JSON.parse(simProfileStr);
        parsed.daun_points = remaining;
        localStorage.setItem('bumikita_supabase_sim_profile', JSON.stringify(parsed));
      }
    } catch {}

    return {
      success: true,
      remaining_points: remaining,
      deducted: cost,
    };
  };

  // Atomic Claim of Daily Mission Reward
  const claimDailyMission = async (missionId: string): Promise<{
    success: boolean;
    reward?: number;
    new_total_points?: number;
    message: string;
  }> => {
    const supabase = getSupabase();
    const today = new Date().toISOString().split('T')[0];

    if (supabase && user) {
      try {
        const { data, error } = await supabase.rpc('claim_daily_mission', { p_mission_id: missionId });
        if (error) {
          console.error('Supabase RPC claim_daily_mission error:', error);
        } else if (data) {
          if (!data.success) {
            setNotificationToast({
              message: data.message || 'Misi gagal diklaim',
              icon: '⚠️',
            });
            return {
              success: false,
              message: data.message || 'Misi gagal diklaim',
            };
          }

          // Successfully claimed via RPC
          setDaunPoints(data.new_total_points);
          setDailyMissions((prev) =>
            prev.map((m) =>
              m.id === missionId ? { ...m, is_claimed: true, claimed_at: new Date().toISOString() } : m
            )
          );
          await refreshProfile();

          setNotificationToast({
            message: data.message || `+${data.reward} Daun! 🍃`,
            points: data.reward,
            icon: '🍃',
          });
          try {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.7 },
              colors: ['#6DB677', '#357A59', '#FF9E20', '#FAF8F5'],
            });
          } catch {}

          return {
            success: true,
            reward: data.reward,
            new_total_points: data.new_total_points,
            message: data.message,
          };
        }
      } catch (rpcErr) {
        console.error('Unexpected RPC claim error:', rpcErr);
      }
    }

    // Local / Guest Fallback
    const claimedKey = `bumikita_claimed_missions_${today}`;
    let claimedIds: string[] = [];
    try {
      claimedIds = JSON.parse(localStorage.getItem(claimedKey) || '[]');
    } catch {}

    if (claimedIds.includes(missionId)) {
      return {
        success: false,
        message: 'Misi ini sudah diklaim hari ini',
      };
    }

    const mission = dailyMissions.find((m) => m.id === missionId) || DEFAULT_DAILY_MISSIONS.find((m) => m.id === missionId);
    if (!mission) {
      return {
        success: false,
        message: 'Misi tidak ditemukan',
      };
    }

    const newTotal = daunPoints + mission.reward_points;
    setDaunPoints(newTotal);
    setDailyMissions((prev) =>
      prev.map((m) =>
        m.id === missionId ? { ...m, is_claimed: true, claimed_at: new Date().toISOString() } : m
      )
    );

    try {
      localStorage.setItem(claimedKey, JSON.stringify([...claimedIds, missionId]));
      localStorage.setItem('bumikita_points', String(newTotal));
      const simProfileStr = localStorage.getItem('bumikita_supabase_sim_profile');
      if (simProfileStr) {
        const parsed = JSON.parse(simProfileStr);
        parsed.daun_points = newTotal;
        localStorage.setItem('bumikita_supabase_sim_profile', JSON.stringify(parsed));
      }
    } catch {}

    setNotificationToast({
      message: `Misi Selesai: +${mission.reward_points} Daun! 🍃`,
      points: mission.reward_points,
      icon: '🍃',
    });

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#6DB677', '#357A59', '#FF9E20', '#FAF8F5'],
      });
    } catch {}

    return {
      success: true,
      reward: mission.reward_points,
      new_total_points: newTotal,
      message: `Berhasil mendapatkan ${mission.reward_points} Daun!`,
    };
  };

  const addDaunPoints = (amount: number, reason: string) => {
    setDaunPoints((prev) => prev + amount);
    setNotificationToast({
      message: reason,
      points: amount,
      icon: '🍃',
    });
    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#6DB677', '#357A59', '#FF9E20', '#FAF8F5'],
      });
    } catch (e) {
      // safe fallback
    }
    setTimeout(() => {
      setNotificationToast(null);
    }, 4000);
  };

  const spendDaunPoints = (amount: number) => {
    if (daunPoints < amount) return false;
    setDaunPoints((prev) => prev - amount);
    return true;
  };

  const plantRealTree = () => {
    const cost = 400; // 400 Daun needed
    if (daunPoints < cost) return false;

    setDaunPoints((prev) => prev - cost);
    setTreesPlanted((prev) => prev + 1);
    setCo2SavedKg((prev) => Number((prev + 15.0).toFixed(1)));

    const newTree: TreeMilestone = {
      id: `tree-${Date.now()}`,
      species: 'Rhizophora Apiculata (Mangrove Karang)',
      location: 'Restorasi Pesisir Teluk Youtefa, Jayapura',
      plantedDate: 'Hari Ini',
      coordinates: "2°36'18.0\"S 140°42'54.2\"E",
      certificateId: `BK-RST-${Math.floor(1000 + Math.random() * 9000)}`,
      co2AbsorbedPerYearKg: 18.0,
    };

    setPlantedTreesList((prev) => [newTree, ...prev]);

    try {
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#6DB677', '#357A59', '#1A4D3A', '#FAF8F5'],
      });
    } catch (e) {
      // ignore
    }

    setNotificationToast({
      message: '🌱 Pohon Asli Berhasil Ditanam Atas Namamu di Pesisir Papua!',
      points: -cost,
      icon: '🌳',
    });

    setTimeout(() => {
      setNotificationToast(null);
    }, 5000);

    return true;
  };

  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });

    setNotificationToast({
      message: `"${product.name}" ditambahkan ke keranjang!`,
      icon: '🛒',
    });

    setTimeout(() => {
      setNotificationToast(null);
    }, 3000);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const completeQuest = (questId: string) => {
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === questId && !q.completed) {
          addDaunPoints(q.daunPoints, `Quest Selesai: ${q.title}`);
          setCo2SavedKg((c) => Number((c + q.co2ReducedKg).toFixed(2)));
          return { ...q, completed: true };
        }
        return q;
      })
    );
  };

  const likePost = (postId: string) => {
    setCommunityPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const isLiked = post.userLiked;
          return {
            ...post,
            leavesCount: isLiked ? post.leavesCount - 1 : post.leavesCount + 1,
            userLiked: !isLiked,
          };
        }
        return post;
      })
    );
  };

  const addCommunityPost = (
    post: Omit<CommunityPost, 'id' | 'createdAt' | 'leavesCount' | 'commentsCount'>
  ) => {
    const newPost: CommunityPost = {
      ...post,
      id: `post-${Date.now()}`,
      createdAt: 'Baru saja',
      leavesCount: 1,
      userLiked: true,
      commentsCount: 0,
    };
    setCommunityPosts((prev) => [newPost, ...prev]);
    addDaunPoints(75, 'Post Karya Upcycle Kamu Berhasil Dibagikan!');
  };

  return (
    <EcoContext.Provider
      value={{
        activeTab,
        setActiveTab,
        daunPoints,
        addDaunPoints,
        spendDaunPoints,
        deductScanPoints,
        dailyMissions,
        isDailyMissionsLoading,
        fetchDailyMissions,
        claimDailyMission,
        isInsufficientModalOpen,
        setIsInsufficientModalOpen,
        co2SavedKg,
        wasteDivertedKg,
        treesPlanted,
        plantedTreesList,
        plantRealTree,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        selectedProductModal,
        setSelectedProductModal,
        quests,
        completeQuest,
        communityPosts,
        likePost,
        addCommunityPost,
        activeFilterCategory,
        setActiveFilterCategory,
        searchQuery,
        setSearchQuery,
        isRewardModalOpen,
        setIsRewardModalOpen,
        notificationToast,
        setNotificationToast,
      }}
    >
      {children}
    </EcoContext.Provider>
  );
}

export function useEco() {
  const context = useContext(EcoContext);
  if (!context) {
    throw new Error('useEco must be used within an EcoProvider');
  }
  return context;
}
