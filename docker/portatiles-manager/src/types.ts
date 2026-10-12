export type LaptopBrand = 'Apple' | 'Lenovo' | 'ASUS' | 'HP' | 'Dell' | 'MSI' | 'Acer' | 'Gigabyte' | 'Medion' | 'Chuwi' | 'Alurin';

export type ProcessorFamily = 
  | 'Apple M-Series' 
  | 'Intel Core i7/i9' 
  | 'Intel Core i3/i5'
  | 'Intel Core Ultra' 
  | 'AMD Ryzen 7/9' 
  | 'AMD Ryzen 5'
  | 'Intel Celeron / N-Series'
  | 'Snapdragon X';

export type StoreName = 
  | 'PcComponentes' 
  | 'Amazon' 
  | 'MediaMarkt' 
  | 'Coolmod' 
  | 'El Corte Inglés' 
  | 'FNAC'
  | 'Dell'
  | 'Life Informàtica'
  | 'RED Computer'
  | 'Modular Technology';

export interface StoreOffer {
  store: StoreName;
  price: number;
  originalPrice: number;
  inStock: boolean;
  deliveryTime: string;
  storeUrl: string;
  locationNote?: string;
}

export interface PricePoint {
  date: string; // YYYY-MM-DD
  price: number;
  store: StoreName;
  note?: string;
}

export interface Laptop {
  id: string;
  model: string;
  brand: LaptopBrand;
  category: 'Ultrabook' | 'Gaming' | 'Productividad' | 'Creadores';
  imageUrl: string;
  processor: {
    name: string;
    family: ProcessorFamily;
    cores: number;
    baseGhz: number;
    boostGhz: number;
  };
  ram: {
    amountGb: number;
    type: string;
    speedMhz?: number;
    upgradable: boolean;
  };
  storage: {
    amountGb: number;
    type: string;
  };
  gpu: {
    name: string;
    type: 'Dedicada' | 'Integrada' | 'SoC Unificada';
    vramGb?: number;
    tgpWatts?: number;
    dlssSupport?: boolean;
    rayTracingHardware?: boolean;
    benchmarkFps1440p?: number;
  };
  screen: {
    sizeInches: number;
    resolution: string;
    refreshRateHz: number;
    panelType: 'OLED' | 'IPS' | 'Mini-LED';
    brightnessNits: number;
  };
  battery: {
    capacityWh: number;
    estimatedHours: number;
  };
  weightKg: number;
  os: string;
  currentPrice: number;
  originalPrice: number;
  historicLow: number;
  historicHigh: number;
  storeOffers: StoreOffer[];
  priceHistory: PricePoint[];
  dealRating: 'Chollo brutal' | 'Gran oferta' | 'Buen precio' | 'Precio habitual';
  isPriceDroppedRecently?: boolean;
}

export interface PriceAlert {
  id: string;
  laptopId: string;
  laptopModel: string;
  targetPrice: number;
  initialPrice: number;
  active: boolean;
  createdAt: string;
  triggeredAt?: string;
  notificationChannels: {
    browser: boolean;
    appBell: boolean;
    email?: string;
  };
}

export interface NotificationItem {
  id: string;
  alertId?: string;
  laptopId: string;
  laptopModel: string;
  title: string;
  message: string;
  oldPrice: number;
  newPrice: number;
  discountAmount: number;
  store: StoreName;
  timestamp: string;
  read: boolean;
}

export interface CloudSyncState {
  syncKey: string;
  lastUpdated: string;
  deviceId: string;
  favorites: string[];
  comparisonIds: string[];
  alerts: PriceAlert[];
  notifications: NotificationItem[];
}

export type GpuTier = 
  | 'RTX 5090'
  | 'RTX 5070'
  | 'RTX 5060'
  | 'RTX 5050'
  | 'RTX 4080/4090' 
  | 'RTX 4070' 
  | 'RTX 4060' 
  | 'Apple GPU' 
  | 'Gráficos Integrados';

export interface FilterState {
  searchQuery: string;
  selectedBrands: LaptopBrand[];
  selectedFamilies: ProcessorFamily[];
  selectedRam: number[];
  selectedGpuTiers: GpuTier[];
  minPrice: number;
  maxPrice: number;
  selectedStore: StoreName | 'all';
  category: string;
  onlyDeals: boolean;
  sortBy: 'price-asc' | 'price-desc' | 'discount-desc' | 'historic-low' | 'ram-desc' | 'gpu-power';
}

export interface RealStorePrice {
  store: StoreName;
  price: number;
  originalPrice?: number;
  inStock: boolean;
  deliveryTime: string;
  storeUrl: string;
  locationNote?: string;
  isBestPrice?: boolean;
}

export interface RealDataSearchResult {
  query: string;
  model: string;
  brand: LaptopBrand;
  category: 'Ultrabook' | 'Gaming' | 'Productividad' | 'Creadores';
  specs: {
    cpu: string;
    gpu: string;
    vramGb?: number;
    tgpWatts?: number;
    ramGb: number;
    storageGb: number;
    screen: string;
  };
  stores: RealStorePrice[];
  lowestPrice: number;
  averagePrice: number;
  marketVerdict: string;
  searchSources?: { title: string; url: string }[];
  searchQueries?: string[];
  groundedWithGoogleSearch: boolean;
  searchedAt: string;
}
