import React from 'react';
import { Bell, Cloud, Scale, Sparkles, Heart, Gamepad2, Zap, Globe } from 'lucide-react';

interface NavbarProps {
  activeTab: 'deals' | 'comparison' | 'alerts' | 'favorites';
  onSelectTab: (tab: 'deals' | 'comparison' | 'alerts' | 'favorites') => void;
  unreadCount: number;
  comparedCount: number;
  favoritesCount: number;
  activeAlertsCount: number;
  onOpenNotifications: () => void;
  onOpenCloudSync: () => void;
  onSimulatePriceDrop: () => void;
  isSimulating: boolean;
  gamerMode: boolean;
  onToggleGamerMode: () => void;
  onOpenRealDataSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  unreadCount,
  comparedCount,
  favoritesCount,
  activeAlertsCount,
  onOpenNotifications,
  onOpenCloudSync,
  onSimulatePriceDrop,
  isSimulating,
  gamerMode,
  onToggleGamerMode,
  onOpenRealDataSearch,
}) => {
  const headerBg = gamerMode 
    ? 'bg-[#0b101b]/95 border-emerald-500/20 text-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.6)]' 
    : 'bg-white/95 border-slate-200/80 text-slate-900';
  const navLinkActive = gamerMode 
    ? 'text-emerald-400 border-b-2 border-emerald-400 font-bold' 
    : 'text-slate-900 border-b-2 border-slate-900 font-bold';
  const navLinkInactive = gamerMode 
    ? 'text-slate-400 hover:text-emerald-300' 
    : 'text-slate-600 hover:text-slate-900';

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors ${headerBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <a 
          href="#" 
          onClick={(e) => { e.preventDefault(); onSelectTab('deals'); }}
          className="text-lg font-bold tracking-tight flex items-center gap-1.5"
        >
          {gamerMode ? (
            <span className="font-mono tracking-wider flex items-center gap-1.5 text-emerald-400">
              <Zap className="w-5 h-5 text-emerald-400 fill-emerald-400 animate-pulse" />
              <span>VOLTPRICE <span className="text-white text-xs font-sans font-semibold tracking-normal bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/40">GAMING</span></span>
            </span>
          ) : (
            <span className="text-slate-900">VoltPrice</span>
          )}
        </a>

        {/* Zone 2: 4-5 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold">
          <button
            onClick={() => onSelectTab('deals')}
            className={`transition-colors pb-0.5 ${
              activeTab === 'deals' ? navLinkActive : navLinkInactive
            }`}
          >
            Ofertas
          </button>

          <button
            onClick={() => onSelectTab('comparison')}
            className={`transition-colors pb-0.5 inline-flex items-center gap-1.5 ${
              activeTab === 'comparison' ? navLinkActive : navLinkInactive
            }`}
          >
            <span>Comparador</span>
            {comparedCount > 0 && (
              <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-mono ${
                gamerMode ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-900 text-white'
              }`}>
                {comparedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('alerts')}
            className={`transition-colors pb-0.5 inline-flex items-center gap-1.5 ${
              activeTab === 'alerts' ? navLinkActive : navLinkInactive
            }`}
          >
            <span>Alertas</span>
            {activeAlertsCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 font-bold text-[10px] flex items-center justify-center font-mono">
                {activeAlertsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('favorites')}
            className={`transition-colors pb-0.5 inline-flex items-center gap-1.5 ${
              activeTab === 'favorites' ? navLinkActive : navLinkInactive
            }`}
          >
            <span>Favoritos</span>
            {favoritesCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-mono">
                {favoritesCount}
              </span>
            )}
          </button>
        </nav>

        {/* Zone 3: Primary actions + Gamer Mode Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Action to search real market data */}
          <button
            onClick={onOpenRealDataSearch}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
              gamerMode 
                ? 'bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-300 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.3)]' 
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300 shadow-xs'
            }`}
            title="Buscar datos y precios reales con Google Search (El Corte Inglés, Sepúlveda BCN, etc.)"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="font-bold">Buscar datos reales</span>
          </button>

          {/* Gamer Style Switch Button */}
          <button
            onClick={onToggleGamerMode}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
              gamerMode 
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)] font-bold' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
            title={gamerMode ? 'Desactivar estilo gamer' : 'Activar estilo gamer (modo oscuro con benchmarks GPU)'}
          >
            <Gamepad2 className={`w-3.5 h-3.5 ${gamerMode ? 'text-slate-950' : 'text-slate-600'}`} />
            <span className="hidden sm:inline">{gamerMode ? 'Modo Gamer Activo' : 'Estilo Gamer'}</span>
          </button>

          {/* Quick test price drop action button */}
          <button
            onClick={onSimulatePriceDrop}
            disabled={isSimulating}
            className={`hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 ${
              gamerMode 
                ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            title="Simular una caída de precio inmediata para probar notificaciones"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>{isSimulating ? 'Comprobando...' : 'Comprobar bajadas'}</span>
          </button>

          {/* Cloud Sync trigger */}
          <button
            onClick={onOpenCloudSync}
            className={`p-2 rounded-lg transition-colors relative ${
              gamerMode 
                ? 'text-slate-300 hover:text-white hover:bg-slate-800' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Sincronización en la nube"
            aria-label="Abrir sincronización en la nube"
          >
            <Cloud className="w-4 h-4" />
          </button>

          {/* Notification Bell with Badge */}
          <button
            onClick={onOpenNotifications}
            className={`p-2 rounded-lg transition-colors relative ${
              gamerMode 
                ? 'text-slate-300 hover:text-white hover:bg-slate-800' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Notificaciones de bajadas de precio"
            aria-label="Abrir centro de notificaciones"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center font-mono">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Tab Navigation Bar */}
      <div className={`md:hidden flex items-center justify-around border-t py-2 px-2 text-xs font-medium ${
        gamerMode ? 'bg-[#0f172a] border-slate-800' : 'bg-slate-50/50 border-slate-100'
      }`}>
        <button
          onClick={() => onSelectTab('deals')}
          className={`px-3 py-1 rounded-md transition-colors ${
            activeTab === 'deals' 
              ? gamerMode ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-white text-slate-900 font-bold shadow-xs' 
              : gamerMode ? 'text-slate-400' : 'text-slate-600'
          }`}
        >
          Ofertas
        </button>

        <button
          onClick={() => onSelectTab('comparison')}
          className={`px-3 py-1 rounded-md transition-colors inline-flex items-center gap-1 ${
            activeTab === 'comparison' 
              ? gamerMode ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-white text-slate-900 font-bold shadow-xs' 
              : gamerMode ? 'text-slate-400' : 'text-slate-600'
          }`}
        >
          <span>Comparar</span>
          {comparedCount > 0 && (
            <span className={`w-3.5 h-3.5 rounded-full text-[9px] flex items-center justify-center font-mono ${
              gamerMode ? 'bg-slate-900 text-emerald-400' : 'bg-slate-900 text-white'
            }`}>
              {comparedCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onSelectTab('alerts')}
          className={`px-3 py-1 rounded-md transition-colors inline-flex items-center gap-1 ${
            activeTab === 'alerts' 
              ? gamerMode ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-white text-slate-900 font-bold shadow-xs' 
              : gamerMode ? 'text-slate-400' : 'text-slate-600'
          }`}
        >
          <span>Alertas</span>
          {activeAlertsCount > 0 && (
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-slate-950 text-[9px] flex items-center justify-center font-mono font-bold">
              {activeAlertsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onSelectTab('favorites')}
          className={`px-3 py-1 rounded-md transition-colors inline-flex items-center gap-1 ${
            activeTab === 'favorites' 
              ? gamerMode ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-white text-slate-900 font-bold shadow-xs' 
              : gamerMode ? 'text-slate-400' : 'text-slate-600'
          }`}
        >
          <span>Favoritos</span>
          {favoritesCount > 0 && (
            <span className="w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[9px] flex items-center justify-center font-mono">
              {favoritesCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
