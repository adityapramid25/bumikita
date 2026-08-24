export type CategoryType = 
  | 'all' 
  | 'upcycled-fashion' 
  | 'campus-zero-waste' 
  | 'solid-toiletries' 
  | 'recycled-tech' 
  | 'vintage-thrift';

export type EcoTag = 
  | '100% Upcycled'
  | 'Plastic-Free'
  | 'Vegan'
  | 'Campus Made'
  | 'Zero-Carbon'
  | 'Locally Sourced'
  | 'Compostable Pack';

export interface Product {
  id: string;
  name: string;
  category: CategoryType;
  price: number; // in IDR (e.g. 85000)
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  seller: {
    name: string;
    avatar: string;
    campusOrCity: string;
    isVerifiedStudent: boolean;
  };
  image: string;
  galleryImages: string[];
  description: string;
  ecoTags: EcoTag[];
  impactStats: {
    waterSavedLiters: number;
    co2SavedKg: number;
    plasticBottlesDiverted?: number;
    fabricWasteSavedKg?: number;
  };
  materialBreakdown: string[];
  stock: number;
  featured?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: string;
}

export interface UpcycleStep {
  stepNumber: number;
  title: string;
  instruction: string;
  tip?: string;
  timeMinutes: number;
}

export interface UpcycleProjectResult {
  projectName: string;
  tagline: string;
  vibe: string; // e.g. "Y2K Gorpcore", "Cozy Cottagecore", "Minimalist Cyber-Green"
  difficulty: 'Super Easy (5 min)' | 'Moderate (Crafty)' | 'Pro Maker';
  timeEstimate: string;
  estimatedValueIdr: number;
  co2SavedKg: number;
  landfillDivertedGrams: number;
  pointsRewarded: number;
  requiredMaterials: string[];
  toolsNeeded: string[];
  steps: UpcycleStep[];
  stylingTips: string;
  safetyNote?: string;
}

export interface EcoQuest {
  id: string;
  title: string;
  description: string;
  category: 'daily' | 'weekly' | 'campus-action' | 'special';
  daunPoints: number;
  co2ReducedKg: number;
  icon: string;
  completed: boolean;
  progress?: {
    current: number;
    total: number;
    unit: string;
  };
}

export interface TreeMilestone {
  id: string;
  species: string;
  location: string;
  plantedDate: string;
  coordinates: string;
  certificateId: string;
  co2AbsorbedPerYearKg: number;
}

export interface CommunityPost {
  id: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
    badge: string;
    campus: string;
  };
  title: string;
  description: string;
  beforeImage: string;
  afterImage: string;
  originalTrashItem: string;
  leavesCount: number;
  userLiked?: boolean;
  commentsCount: number;
  tags: string[];
  createdAt: string;
}

export interface Workshop {
  id: string;
  title: string;
  mentor: string;
  mentorRole: string;
  date: string;
  time: string;
  mode: 'Online (Zoom)' | 'Offline (Campus Hub)';
  locationName: string;
  seatsLeft: number;
  daunPointsCost: number;
  image: string;
  level: 'Beginner' | 'Intermediate' | 'All Welcome';
}

export interface DropoffLocation {
  id: string;
  name: string;
  type: 'Campus Drop Box' | 'Smart Reverse Vending' | 'Community Waste Hub' | 'Refill Station';
  address: string;
  city: 'Jakarta' | 'Bandung' | 'Yogyakarta' | 'Surabaya' | 'Bali';
  distanceKm: number;
  acceptedMaterials: string[];
  hours: string;
  pointsPerKg: number;
  verifiedPartner: boolean;
  status: 'Open' | 'Crowded' | 'Full Today';
}
