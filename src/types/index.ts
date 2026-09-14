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

export interface UpcycleProjectBenefits {
  economic: string; // e.g. "Hemat pengeluaran Rp 75.000 untuk tas gadget baru"
  environmental: string; // e.g. "Mencegah 420g kain denim menumpuk 200+ tahun di TPA Bantar Gebang"
  practical: string; // e.g. "Memberikan kompartemen pelindung aman anti baret untuk HP dan TWS"
}

export interface UpcycleProjectResult {
  detectedItemName?: string;
  detectedMaterialType?: string;
  detectedCondition?: string; // e.g. "Kondisi kain tebal 90%, sedikit robek lutut"
  projectName: string;
  tagline: string;
  vibe: string; // e.g. "Y2K Gorpcore", "Cozy Cottagecore", "Minimalist Cyber-Green"
  productDescription: string; // Detail deskripsi produk apa yang dibuat & fungsinya
  difficulty: 'Super Easy (5 min)' | 'Moderate (Crafty)' | 'Pro Maker' | string;
  timeEstimate: string;
  estimatedValueIdr: number;
  co2SavedKg: number;
  landfillDivertedGrams: number;
  pointsRewarded: number;
  benefits?: UpcycleProjectBenefits;
  requiredMaterials: string[];
  toolsNeeded: string[];
  steps: UpcycleStep[];
  stylingTips: string;
  safetyNote?: string;
}

export interface DetectedWasteObject {
  label: string;
  material: string;
  dimension?: string;
  condition: string;
  estimatedScrapValue?: string;
  box2d?: [number, number, number, number]; // Deprecated coordinate format (no longer used)
}

export interface UpcycleRecommendation {
  id: string;
  title: string;
  difficulty: 'Mudah' | 'Sedang' | 'Menantang' | string;
  estimatedTime: string;
  benchmarkPrice: string;
  summary: string;
  materialsNeeded: string[];
  steps: string[];
  auxiliaryCost?: string;
  finishingTips?: string;
}

export interface WasteAnalysisResult {
  isDetected?: boolean;
  userFriendlyMessage?: string;
  detectedObject: DetectedWasteObject;
  recommendations: UpcycleRecommendation[];
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

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  reward_points: number;
  action_type: 'instant' | 'share' | 'navigate';
  target_count: number;
  icon_name: string;
  is_active: boolean;
  created_at?: string;
  is_claimed?: boolean;
  claimed_at?: string;
}

export interface UserMissionLog {
  id: string;
  user_id: string;
  mission_id: string;
  completed_date: string;
  is_claimed: boolean;
  claimed_at?: string;
  created_at?: string;
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
