import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Laptop, 
  PriceAlert, 
  NotificationItem, 
  CloudSyncState, 
  FilterState, 
  LaptopBrand, 
  ProcessorFamily,
  GpuTier
} from './types';
import { INITIAL_LAPTOPS } from './data/laptops';
import { Navbar } from './components/Navbar';
import { FilterBar } from './components/FilterBar';
import { LaptopCard } from './components/LaptopCard';
import { PriceHistoryModal } from './components/PriceHistoryModal';
import { AlertModal } from './components/AlertModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { ComparisonModal } from './components/ComparisonModal';
import { ComparisonDock } from './components/ComparisonDock';
import { CloudSyncModal } from './components/CloudSyncModal';
import { RealDataSearchModal } from './components/RealDataSearchModal';
import { AlertsView } from './components/AlertsView';
import { FavoritesView } from './components/FavoritesView';
import { playPriceDropChime, triggerSystemNotification } from './utils/audio';
import { 
  Sparkles, 
  Gamepad2, 
  Zap, 
  Activity, 
  Search, 
  Flame,
  ShieldCheck, 
  RefreshCw, 
  Scale,
  Globe
} from 'lucide-react';

const INITIAL_FILTERS: FilterState = {
  searchQuery: '',
  selectedBrands: [],
  selectedFamilies: [],
  selectedRam: [],
  selectedGpuTiers: [],
  minPrice: 0,
  maxPrice: 5000,
  selectedStore: 'all',
  category: 'all',
  onlyDeals: false,
  sortBy: 'discount-desc',
};

const SYNC_STORAGE_KEY = 'voltprice_cloud_sync_key';

export default function App() {
  const [laptops, setLaptops] = useState<Laptop[]>(INITIAL_LAPTOPS);
  const [favorites, setFavorites] = useState<string[]>(['acer-nitro-v16-rtx5050', 'gigabyte-aorus-16x-rtx5070', 'msi-titan-18-hx-dragon-rtx5090']);
  const [comparedIds, setComparedIds] = useState<string[]>([
    'hp-victus-15-rtx5050',
    'acer-nitro-v16-rtx5050',
    'gigabyte-aorus-16x-rtx5070',
    'msi-titan-18-hx-dragon-rtx5090'
  ]);
  const [alerts, setAlerts] = useState<PriceAlert[]>([
    {
      id: 'alert-initial-1',
      laptopId: 'lenovo-legion-pro-5-gen-8',
      laptopModel: 'Lenovo Legion Pro 5 Gen 8 16"',
      targetPrice: 1350,
      initialPrice: 1399,
      active: true,
      createdAt: '2026-09-20T10:00:00Z',
      notificationChannels: { browser: true, appBell: true }
    }
  ]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-welcome',
      laptopId: 'lenovo-legion-pro-5-gen-8',
      laptopModel: 'Lenovo Legion Pro 5 Gen 8 16"',
      title: '¡Mínimo histórico en equipo Gaming!',
      message: 'El portátil con RTX 4070 (140W TGP) ha caído a 1.399 € en PcComponentes.',
      oldPrice: 1459,
      newPrice: 1399,
      discountAmount: 60,
      store: 'PcComponentes',
      timestamp: new Date().toISOString(),
      read: false
    }
  ]);

  const [activeTab, setActiveTab] = useState<'deals' | 'comparison' | 'alerts' | 'favorites'>('deals');
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);

  // Gamer Style Toggle (enabled by default as user requested estilo gamer)
  const [gamerMode, setGamerMode] = useState<boolean>(true);

  // Cloud Sync State
  const [syncKey, setSyncKey] = useState<string>('VP-DEMO1');
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toISOString());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Simulation Status
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string } | null>(null);

  // Modals & Panels
  const [historyLaptop, setHistoryLaptop] = useState<Laptop | null>(null);
  const [alertLaptop, setAlertLaptop] = useState<Laptop | null>(null);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState<boolean>(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState<boolean>(false);
  const [isCloudSyncModalOpen, setIsCloudSyncModalOpen] = useState<boolean>(false);
  const [isRealDataModalOpen, setIsRealDataModalOpen] = useState<boolean>(false);
  const [realDataSearchQuery, setRealDataSearchQuery] = useState<string>('');

  const handleOpenRealDataSearch = (initialQ?: string) => {
    setRealDataSearchQuery(initialQ || '');
    setIsRealDataModalOpen(true);
  };

  const handleImportRealLaptop = async () => {
    // Re-fetch catalog from server to sync the newly added/updated laptop
    try {
      const res = await fetch('/api/laptops');
      if (res.ok) {
        const data = await res.json();
        if (data.laptops && Array.isArray(data.laptops)) {
          setLaptops(data.laptops);
        }
      }
      setToastMessage({
        title: '¡Estudio de portátiles actualizado!',
        desc: 'Se han incorporado los datos reales y contrastados del mercado al catálogo.'
      });
      setTimeout(() => setToastMessage(null), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch initial laptops catalog from server
  useEffect(() => {
    async function loadCatalog() {
      try {
        const res = await fetch('/api/laptops');
        if (res.ok) {
          const data = await res.json();
          if (data.laptops && Array.isArray(data.laptops)) {
            setLaptops(data.laptops);
          }
        }
      } catch (e) {
        // Uses INITIAL_LAPTOPS fallback
      }
    }
    loadCatalog();
  }, []);

  // Initialize or fetch Cloud Sync state
  useEffect(() => {
    const savedKey = localStorage.getItem(SYNC_STORAGE_KEY) || 'VP-DEMO1';
    setSyncKey(savedKey);

    async function fetchCloudData(key: string) {
      try {
        const res = await fetch(`/api/sync/${key}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            if (json.data.favorites) setFavorites(json.data.favorites);
            if (json.data.comparisonIds) setComparedIds(json.data.comparisonIds);
            if (json.data.alerts) setAlerts(json.data.alerts);
            if (json.data.notifications) setNotifications(json.data.notifications);
            setLastSyncTime(json.data.lastUpdated || new Date().toISOString());
          }
        }
      } catch (err) {
        // local state remains
      }
    }

    fetchCloudData(savedKey);
  }, []);

  // Sync to Cloud function
  const pushToCloud = useCallback(async (currentKey: string = syncKey) => {
    setIsSyncing(true);
    try {
      const payload: Partial<CloudSyncState> = {
        syncKey: currentKey,
        lastUpdated: new Date().toISOString(),
        favorites,
        comparisonIds: comparedIds,
        alerts,
        notifications,
      };

      const res = await fetch(`/api/sync/${currentKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setLastSyncTime(new Date().toISOString());
      }
    } catch (e) {
      console.warn('Sync failed:', e);
    } finally {
      setIsSyncing(false);
    }
  }, [syncKey, favorites, comparedIds, alerts, notifications]);

  // Connect to an existing Sync Key
  const handleConnectSyncKey = async (newKey: string): Promise<boolean> => {
    setIsSyncing(true);
    try {
      const res = await fetch(`/api/sync/${newKey}`);
      if (!res.ok) {
        setIsSyncing(false);
        return false;
      }
      const json = await res.json();
      if (json.data) {
        setSyncKey(newKey);
        localStorage.setItem(SYNC_STORAGE_KEY, newKey);
        if (json.data.favorites) setFavorites(json.data.favorites);
        if (json.data.comparisonIds) setComparedIds(json.data.comparisonIds);
        if (json.data.alerts) setAlerts(json.data.alerts);
        if (json.data.notifications) setNotifications(json.data.notifications);
        setLastSyncTime(new Date().toISOString());
        setIsSyncing(false);
        return true;
      }
      setIsSyncing(false);
      return false;
    } catch (e) {
      setIsSyncing(false);
      return false;
    }
  };

  // Export JSON backup
  const handleExportBackup = () => {
    const data = {
      syncKey,
      exportedAt: new Date().toISOString(),
      favorites,
      comparisonIds: comparedIds,
      alerts,
      notifications,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voltprice-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON backup
  const handleImportBackup = (importedData: any) => {
    if (importedData && typeof importedData === 'object') {
      if (Array.isArray(importedData.favorites)) setFavorites(importedData.favorites);
      if (Array.isArray(importedData.comparisonIds)) setComparedIds(importedData.comparisonIds);
      if (Array.isArray(importedData.alerts)) setAlerts(importedData.alerts);
      if (Array.isArray(importedData.notifications)) setNotifications(importedData.notifications);
      if (importedData.syncKey) {
        setSyncKey(importedData.syncKey);
        localStorage.setItem(SYNC_STORAGE_KEY, importedData.syncKey);
      }
      alert('¡Datos importados correctamente!');
    }
  };

  // Toggle favorite
  const handleToggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id];
      return next;
    });
  };

  // Toggle compare
  const handleToggleCompare = (id: string) => {
    setComparedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        if (prev.length >= 4) {
          setToastMessage({
            title: 'Límite de comparación',
            desc: 'Puedes comparar un máximo de 4 portátiles a la vez.'
          });
          setTimeout(() => setToastMessage(null), 3000);
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  // Save or update alert
  const handleSaveAlert = (newAlert: PriceAlert) => {
    setAlerts(prev => {
      const exists = prev.some(a => a.id === newAlert.id);
      if (exists) {
        return prev.map(a => a.id === newAlert.id ? newAlert : a);
      }
      return [newAlert, ...prev];
    });
  };

  // Toggle alert active
  const handleToggleAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, active: !a.active } : a));
  };

  // Delete alert
  const handleDeleteAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  // Simulate price drop to test notifications
  const handleSimulatePriceDrop = async (preferredLaptopId?: string) => {
    setIsSimulating(true);
    try {
      let targetId = preferredLaptopId;
      if (!targetId && alerts.length > 0) {
        targetId = alerts[0].laptopId;
      }
      if (!targetId) {
        targetId = laptops[Math.floor(Math.random() * laptops.length)].id;
      }

      const res = await fetch('/api/laptops/simulate-drop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ laptopId: targetId, dropAmount: 90 })
      });

      if (res.ok) {
        const data = await res.json();
        const updatedLaptop: Laptop = data.laptop;
        const newNotif: NotificationItem = data.notification;

        setLaptops(prev => prev.map(l => l.id === updatedLaptop.id ? updatedLaptop : l));
        setNotifications(prev => [newNotif, ...prev]);

        playPriceDropChime();
        triggerSystemNotification(newNotif.title, newNotif.message);

        setToastMessage({
          title: newNotif.title,
          desc: newNotif.message
        });
        setTimeout(() => setToastMessage(null), 4500);

        setAlerts(prev => prev.map(a => {
          if (a.laptopId === updatedLaptop.id && updatedLaptop.currentPrice <= a.targetPrice) {
            return { ...a, triggeredAt: new Date().toISOString() };
          }
          return a;
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulating(false);
    }
  };

  // Notification actions
  const handleMarkAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  // Filtered and Sorted Laptops
  const filteredLaptops = useMemo(() => {
    return laptops.filter(laptop => {
      // Search Query
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchesModel = laptop.model.toLowerCase().includes(q);
        const matchesBrand = laptop.brand.toLowerCase().includes(q);
        const matchesCpu = laptop.processor.name.toLowerCase().includes(q);
        const matchesGpu = laptop.gpu.name.toLowerCase().includes(q);
        const matchesStore = laptop.storeOffers.some(s => s.store.toLowerCase().includes(q));
        if (!matchesModel && !matchesBrand && !matchesCpu && !matchesGpu && !matchesStore) {
          return false;
        }
      }

      // Brand Filter
      if (filters.selectedBrands.length > 0) {
        if (!filters.selectedBrands.includes(laptop.brand)) {
          return false;
        }
      }

      // Processor Family Filter
      if (filters.selectedFamilies.length > 0) {
        if (!filters.selectedFamilies.includes(laptop.processor.family)) {
          return false;
        }
      }

      // RAM Filter
      if (filters.selectedRam.length > 0) {
        if (!filters.selectedRam.includes(laptop.ram.amountGb)) {
          return false;
        }
      }

      // GPU Tier Filter
      if (filters.selectedGpuTiers && filters.selectedGpuTiers.length > 0) {
        const matchesGpu = filters.selectedGpuTiers.some(tier => {
          const gpuName = laptop.gpu.name.toLowerCase();
          if (tier === 'RTX 5090') return gpuName.includes('5090');
          if (tier === 'RTX 5070') return gpuName.includes('5070');
          if (tier === 'RTX 5060') return gpuName.includes('5060');
          if (tier === 'RTX 5050') return gpuName.includes('5050');
          if (tier === 'RTX 4080/4090') return gpuName.includes('4080') || (gpuName.includes('4090') && !gpuName.includes('5090'));
          if (tier === 'RTX 4070') return gpuName.includes('4070') && !gpuName.includes('5070');
          if (tier === 'RTX 4060') return gpuName.includes('4060') && !gpuName.includes('5060');
          if (tier === 'Apple GPU') return gpuName.includes('apple');
          if (tier === 'Gráficos Integrados') return laptop.gpu.type === 'Integrada' && !gpuName.includes('apple');
          return false;
        });
        if (!matchesGpu) return false;
      }

      // Max Price Filter
      if (laptop.currentPrice > filters.maxPrice) {
        return false;
      }

      // Specific Store Filter
      if (filters.selectedStore !== 'all') {
        const hasStore = laptop.storeOffers.some(s => s.store === filters.selectedStore);
        if (!hasStore) return false;
      }

      // Only Deals & Historic Lows
      if (filters.onlyDeals) {
        const isLow = laptop.currentPrice <= laptop.historicLow;
        const hasBigDiscount = (laptop.originalPrice - laptop.currentPrice) / laptop.originalPrice >= 0.2;
        if (!isLow && !hasBigDiscount) return false;
      }

      return true;
    }).sort((a, b) => {
      switch (filters.sortBy) {
        case 'gpu-power':
          return (b.gpu.benchmarkFps1440p || 0) - (a.gpu.benchmarkFps1440p || 0);
        case 'price-asc':
          return a.currentPrice - b.currentPrice;
        case 'price-desc':
          return b.currentPrice - a.currentPrice;
        case 'discount-desc': {
          const discA = (a.originalPrice - a.currentPrice) / a.originalPrice;
          const discB = (b.originalPrice - b.currentPrice) / b.originalPrice;
          return discB - discA;
        }
        case 'historic-low': {
          const aIsLow = a.currentPrice <= a.historicLow ? 1 : 0;
          const bIsLow = b.currentPrice <= b.historicLow ? 1 : 0;
          return bIsLow - aIsLow;
        }
        case 'ram-desc':
          return b.ram.amountGb - a.ram.amountGb;
        default:
          return 0;
      }
    });
  }, [laptops, filters]);

  // Derived compared and favorite laptop objects
  const comparedLaptops = useMemo(() => {
    return laptops.filter(l => comparedIds.includes(l.id));
  }, [laptops, comparedIds]);

  const favoriteLaptops = useMemo(() => {
    return laptops.filter(l => favorites.includes(l.id));
  }, [laptops, favorites]);

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${
      gamerMode 
        ? 'bg-[#070b12] text-slate-100 selection:bg-emerald-500 selection:text-slate-950' 
        : 'bg-slate-50/60 text-slate-900 selection:bg-slate-900 selection:text-white'
    }`}>
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className={`fixed top-20 right-4 z-50 max-w-sm w-full p-4 rounded-xl shadow-2xl border flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-200 ${
          gamerMode 
            ? 'bg-[#0f172a] text-white border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
            : 'bg-slate-900 text-white border-slate-800'
        }`}>
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg shrink-0 mt-0.5">
            <Zap className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-white">{toastMessage.title}</h4>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">{toastMessage.desc}</p>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        unreadCount={unreadNotificationsCount}
        comparedCount={comparedIds.length}
        favoritesCount={favorites.length}
        activeAlertsCount={alerts.filter(a => a.active).length}
        onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
        onOpenCloudSync={() => setIsCloudSyncModalOpen(true)}
        onSimulatePriceDrop={() => handleSimulatePriceDrop()}
        isSimulating={isSimulating}
        gamerMode={gamerMode}
        onToggleGamerMode={() => setGamerMode(!gamerMode)}
        onOpenRealDataSearch={() => handleOpenRealDataSearch()}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* TAB 1: DEALS CATALOG */}
        {activeTab === 'deals' && (
          <>
            {/* Storefront Hero with Gamer/Clean Mode Adaptive Visual */}
            <div className={`rounded-2xl border p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all ${
              gamerMode 
                ? 'bg-gradient-to-r from-[#0d1322] via-[#0f172a] to-[#0d1927] border-emerald-500/20 shadow-[0_4px_30px_rgba(0,0,0,0.6)]' 
                : 'bg-white border-slate-200/80 shadow-xs'
            }`}>
              <div className="max-w-2xl space-y-2">
                <div className={`flex flex-wrap items-center gap-2 text-xs font-semibold ${gamerMode ? 'text-emerald-400 font-mono' : 'text-slate-500'}`}>
                  <span className="flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    <span>NVIDIA RTX 5090 / 5070 / 5060 / 5050 BLACKWELL</span>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>El Corte Inglés & C/ Sepúlveda (Barcelona)</span>
                  <span aria-hidden="true">·</span>
                  <span>Hasta 175W TGP</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
                  {gamerMode 
                    ? 'Comparador de Portátiles Gaming: RTX Serie 50 y Tiendas de Barcelona' 
                    : 'Comparador de Ofertas de Portátiles, RTX Serie 50 y Alertas de Precio'}
                </h1>
                <p className={`text-xs sm:text-sm leading-relaxed ${gamerMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Estudio exhaustivo de ofertas en tiendas de la calle Sepúlveda de Barcelona (RED Computer, Life Informàtica, Modular Technology), El Corte Inglés y comercios online. Incluye las principales marcas, con Medion (Erazer/Akoya), Chuwi y Alurin, y las nuevas tarjetas gráficas RTX Serie 50 (5090, 5070, 5060 y 5050).
                </p>

                {/* Primary Action Button: Real Data Search */}
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleOpenRealDataSearch()}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md cursor-pointer ${
                      gamerMode
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                    }`}
                    title="Buscar datos reales de portátiles y precios en El Corte Inglés, Sepúlveda BCN y tiendas online"
                  >
                    <Globe className="w-4 h-4 animate-pulse" />
                    <span>Buscar datos reales en tiendas</span>
                  </button>
                </div>

                {/* Quick Shortcuts */}
                <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
                  <span className={`text-[11px] ${gamerMode ? 'text-slate-400 font-mono' : 'text-slate-500'}`}>Atajos:</span>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, selectedBrands: ['Medion', 'Chuwi', 'Alurin'] }))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                      filters.selectedBrands?.some(b => ['Medion', 'Chuwi', 'Alurin'].includes(b))
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                        : gamerMode
                          ? 'bg-amber-950/60 text-amber-300 border border-amber-500/40 hover:bg-amber-900/60'
                          : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Medion / Chuwi / Alurin (10 nuevos)</span>
                  </button>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, selectedGpuTiers: ['RTX 5050'] }))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                      filters.selectedGpuTiers?.includes('RTX 5050')
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                        : gamerMode
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/60'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    <Zap className="w-3 h-3 text-emerald-400" />
                    <span>Solo RTX 5050 (8 modelos)</span>
                  </button>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, selectedGpuTiers: ['RTX 5090', 'RTX 5070', 'RTX 5060', 'RTX 5050'] }))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      gamerMode
                        ? 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Toda la Serie RTX 50
                  </button>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, selectedStore: 'El Corte Inglés' }))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      filters.selectedStore === 'El Corte Inglés'
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                        : gamerMode
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/60'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    El Corte Inglés
                  </button>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, selectedStore: 'RED Computer' }))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      filters.selectedStore === 'RED Computer'
                        ? 'bg-rose-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(244,63,94,0.5)]'
                        : gamerMode
                          ? 'bg-rose-950/60 text-rose-300 border border-rose-500/40 hover:bg-rose-900/60'
                          : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    Sepúlveda 178 (RED Computer)
                  </button>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, selectedStore: 'Life Informàtica' }))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      filters.selectedStore === 'Life Informàtica'
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                        : gamerMode
                          ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-900/60'
                          : 'bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100'
                    }`}
                  >
                    Sepúlveda 173 (Life Informàtica)
                  </button>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, selectedStore: 'Modular Technology' }))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      filters.selectedStore === 'Modular Technology'
                        ? 'bg-violet-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(139,92,246,0.5)]'
                        : gamerMode
                          ? 'bg-violet-950/60 text-violet-300 border border-violet-500/40 hover:bg-violet-900/60'
                          : 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100'
                    }`}
                  >
                    Sepúlveda 168 (Modular)
                  </button>
                </div>
              </div>

              {/* Live Tracking Metrics */}
              <div className={`grid grid-cols-3 gap-3 shrink-0 p-4 rounded-xl border ${
                gamerMode 
                  ? 'bg-slate-900/80 border-slate-800' 
                  : 'bg-slate-50 border-slate-100'
              }`}>
                <div className="text-center">
                  <div className={`text-lg sm:text-xl font-bold font-mono tabular-nums ${gamerMode ? 'text-emerald-400' : 'text-slate-900'}`}>
                    {laptops.length}
                  </div>
                  <div className={`text-[11px] mt-0.5 ${gamerMode ? 'text-slate-400 font-mono' : 'text-slate-500'}`}>En Estudio</div>
                </div>
                <div className={`text-center border-x px-3 ${gamerMode ? 'border-slate-800' : 'border-slate-200'}`}>
                  <div className="text-lg sm:text-xl font-bold font-mono text-emerald-400 tabular-nums">
                    779 €
                  </div>
                  <div className={`text-[11px] mt-0.5 ${gamerMode ? 'text-slate-400 font-mono' : 'text-slate-500'}`}>RTX 5050 desde</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg sm:text-xl font-bold font-mono tabular-nums ${gamerMode ? 'text-sky-400' : 'text-slate-900'}`}>
                    {alerts.length}
                  </div>
                  <div className={`text-[11px] mt-0.5 ${gamerMode ? 'text-slate-400 font-mono' : 'text-slate-500'}`}>Alertas Activas</div>
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <FilterBar
              filters={filters}
              onChangeFilters={(updated) => setFilters(prev => ({ ...prev, ...updated }))}
              onResetFilters={() => setFilters(INITIAL_FILTERS)}
              totalResults={filteredLaptops.length}
              gamerMode={gamerMode}
              onOpenRealDataSearch={handleOpenRealDataSearch}
            />

            {/* Product Cards Grid */}
            {filteredLaptops.length === 0 ? (
              <div className={`p-12 text-center rounded-2xl border flex flex-col items-center justify-center space-y-3 ${
                gamerMode ? 'bg-[#0f172a] border-slate-800 text-white' : 'bg-white border-slate-200'
              }`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${gamerMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-400'}`}>
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold">No hay portátiles que coincidan con estos filtros</h3>
                <p className={`text-xs max-w-sm ${gamerMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Prueba a relajar los filtros de tarjeta gráfica, procesador o memoria RAM para ver más resultados.
                </p>
                <button
                  onClick={() => setFilters(INITIAL_FILTERS)}
                  className={`mt-2 px-4 py-2 text-xs font-medium rounded-xl transition-colors ${
                    gamerMode ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-900 text-white'
                  }`}
                >
                  Restablecer todos los filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLaptops.map((laptop) => (
                  <LaptopCard
                    key={laptop.id}
                    laptop={laptop}
                    isCompared={comparedIds.includes(laptop.id)}
                    isFavorite={favorites.includes(laptop.id)}
                    onToggleCompare={handleToggleCompare}
                    onToggleFavorite={handleToggleFavorite}
                    onOpenHistory={(l) => setHistoryLaptop(l)}
                    onOpenAlert={(l) => setAlertLaptop(l)}
                    onSearchRealData={(l) => handleOpenRealDataSearch(l.model)}
                    gamerMode={gamerMode}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* TAB 2: COMPARISON VIEW */}
        {activeTab === 'comparison' && (
          <div className="space-y-6">
            <div className={`p-6 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              gamerMode ? 'bg-[#0f172a] border-slate-800 text-white' : 'bg-white border-slate-200/80'
            }`}>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">Comparativa de Tarjetas Gráficas y Portátiles</h2>
                  {gamerMode && (
                    <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded">
                      GPU BENCHMARK MODE
                    </span>
                  )}
                </div>
                <p className={`text-xs mt-1 ${gamerMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Compara la tarjeta gráfica (VRAM, TGP en vatios, FPS estimados a 1440p), procesador, RAM y pantalla lado a lado.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsComparisonModalOpen(true)}
                  disabled={comparedLaptops.length === 0}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all disabled:opacity-40 ${
                    gamerMode 
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:bg-emerald-400' 
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  Abrir comparador completo
                </button>
              </div>
            </div>

            {comparedLaptops.length === 0 ? (
              <div className={`p-12 text-center rounded-2xl border flex flex-col items-center justify-center space-y-3 ${
                gamerMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${gamerMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-400'}`}>
                  <Scale className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold">No hay portátiles añadidos al comparador</h3>
                <p className={`text-xs max-w-sm ${gamerMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Explora las ofertas y pulsa el icono de la balanza en las tarjetas para comparar tarjetas gráficas y componentes cara a cara.
                </p>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      setComparedIds(['lenovo-legion-pro-5-gen-8', 'msi-stealth-16-studio-rtx4080', 'asus-tuf-gaming-a15-ryzen7']);
                    }}
                    className={`px-3.5 py-2 text-xs font-medium rounded-xl transition-colors ${
                      gamerMode ? 'bg-slate-800 text-emerald-400 border border-slate-700 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Comparar 3 modelos gaming con RTX
                  </button>
                  <button
                    onClick={() => setActiveTab('deals')}
                    className={`px-3.5 py-2 text-xs font-medium rounded-xl transition-colors ${
                      gamerMode ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    Ir a ofertas
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {comparedLaptops.map((laptop) => (
                  <LaptopCard
                    key={laptop.id}
                    laptop={laptop}
                    isCompared={true}
                    isFavorite={favorites.includes(laptop.id)}
                    onToggleCompare={handleToggleCompare}
                    onToggleFavorite={handleToggleFavorite}
                    onOpenHistory={(l) => setHistoryLaptop(l)}
                    onOpenAlert={(l) => setAlertLaptop(l)}
                    gamerMode={gamerMode}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ALERTS VIEW */}
        {activeTab === 'alerts' && (
          <AlertsView
            alerts={alerts}
            laptops={laptops}
            onToggleAlert={handleToggleAlert}
            onDeleteAlert={handleDeleteAlert}
            onOpenHistory={(l) => setHistoryLaptop(l)}
            onGoToDeals={() => setActiveTab('deals')}
            onSimulatePriceDrop={() => handleSimulatePriceDrop()}
            isSimulating={isSimulating}
          />
        )}

        {/* TAB 4: FAVORITES VIEW */}
        {activeTab === 'favorites' && (
          <FavoritesView
            favoriteLaptops={favoriteLaptops}
            comparedIds={comparedIds}
            onToggleCompare={handleToggleCompare}
            onToggleFavorite={handleToggleFavorite}
            onOpenHistory={(l) => setHistoryLaptop(l)}
            onOpenAlert={(l) => setAlertLaptop(l)}
            onGoToDeals={() => setActiveTab('deals')}
          />
        )}
      </main>

      {/* Persistent Bottom Comparison Dock */}
      {comparedLaptops.length > 0 && activeTab !== 'comparison' && (
        <ComparisonDock
          comparedLaptops={comparedLaptops}
          onOpenComparison={() => setIsComparisonModalOpen(true)}
          onRemove={handleToggleCompare}
          onClear={() => setComparedIds([])}
          gamerMode={gamerMode}
        />
      )}

      {/* Modals */}
      <PriceHistoryModal
        laptop={historyLaptop}
        onClose={() => setHistoryLaptop(null)}
        onCreateAlert={(laptop) => {
          setHistoryLaptop(null);
          setAlertLaptop(laptop);
        }}
      />

      <AlertModal
        laptop={alertLaptop}
        existingAlert={alerts.find(a => a.laptopId === alertLaptop?.id)}
        onClose={() => setAlertLaptop(null)}
        onSaveAlert={handleSaveAlert}
      />

      <ComparisonModal
        isOpen={isComparisonModalOpen}
        onClose={() => setIsComparisonModalOpen(false)}
        comparedLaptops={comparedLaptops}
        onRemoveFromCompare={handleToggleCompare}
        onClearComparison={() => setComparedIds([])}
        onOpenHistory={(l) => {
          setIsComparisonModalOpen(false);
          setHistoryLaptop(l);
        }}
        gamerMode={gamerMode}
      />

      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        notifications={notifications}
        laptops={laptops}
        onMarkAllAsRead={handleMarkAllNotificationsAsRead}
        onClearNotifications={handleClearNotifications}
        onSelectLaptop={(laptop) => setHistoryLaptop(laptop)}
        onSimulatePriceDrop={() => handleSimulatePriceDrop()}
        isSimulating={isSimulating}
      />

      <CloudSyncModal
        isOpen={isCloudSyncModalOpen}
        onClose={() => setIsCloudSyncModalOpen(false)}
        syncState={{
          syncKey,
          lastUpdated: lastSyncTime,
          deviceId: 'client-browser',
          favorites,
          comparisonIds: comparedIds,
          alerts,
          notifications,
        }}
        isSyncing={isSyncing}
        onManualSync={() => pushToCloud()}
        onConnectKey={handleConnectSyncKey}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
      />

      <RealDataSearchModal
        isOpen={isRealDataModalOpen}
        onClose={() => setIsRealDataModalOpen(false)}
        initialQuery={realDataSearchQuery}
        gamerMode={gamerMode}
        onImportLaptop={handleImportRealLaptop}
        onAddToCompare={(id) => {
          if (!comparedIds.includes(id)) {
            setComparedIds(prev => [...prev, id]);
          }
        }}
      />

      {/* Minimalist Quiet Footer */}
      <footer className={`mt-auto border-t py-6 transition-colors ${
        gamerMode ? 'bg-[#0b101b] border-slate-800 text-slate-400' : 'bg-white border-slate-200/80 text-slate-500'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className={`font-semibold ${gamerMode ? 'text-emerald-400 font-mono' : 'text-slate-800'}`}>
              VoltPrice {gamerMode ? 'Gaming Edition' : ''}
            </span>
            <span aria-hidden="true">·</span>
            <span>Comparador de GPU, especificaciones técnicas y ofertas en directo</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Tarjetas gráficas NVIDIA GeForce RTX, Apple Silicon y AMD Radeon</span>
            <span aria-hidden="true">·</span>
            <span className={gamerMode ? 'text-emerald-400' : ''}>Sincronización en la nube activa</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
