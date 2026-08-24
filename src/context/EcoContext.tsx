'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Product,
  CartItem,
  EcoQuest,
  CommunityPost,
  CategoryType,
  TreeMilestone,
} from '@/src/types';
import {
  INITIAL_PRODUCTS,
  INITIAL_QUESTS,
  INITIAL_COMMUNITY_POSTS,
} from '@/src/data/mockData';

interface EcoContextType {
  activeTab: 'market' | 'scanner' | 'diy-studio' | 'quests-forest' | 'dropoff-map';
  setActiveTab: (tab: 'market' | 'scanner' | 'diy-studio' | 'quests-forest' | 'dropoff-map') => void;
  daunPoints: number;
  addDaunPoints: (amount: number, reason: string) => void;
  spendDaunPoints: (amount: number) => boolean;
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
