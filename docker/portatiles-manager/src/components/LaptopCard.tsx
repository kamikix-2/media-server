import React from 'react';
import { Laptop, StoreName } from '../types';
import { 
  LineChart, 
  Scale, 
  Bell, 
  Heart, 
  ExternalLink, 
  Check, 
  Cpu, 
  HardDrive, 
  Layers,
  Sparkles,
  Gamepad2,
  Zap,
  Activity,
  Globe
} from 'lucide-react';

interface LaptopCardProps {
  laptop: Laptop;
  isCompared: boolean;
  isFavorite: boolean;
  onToggleCompare: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onOpenHistory: (laptop: Laptop) => void;
  onOpenAlert: (laptop: Laptop) => void;
  onSearchRealData?: (laptop: Laptop) => void;
  gamerMode?: boolean;
}

export const LaptopCard: React.FC<LaptopCardProps> = ({
  laptop,
  isCompared,
  isFavorite,
  onToggleCompare,
  onToggleFavorite,
  onOpenHistory,
  onOpenAlert,
  onSearchRealData,
  gamerMode = false,
}) => {
  const discountAmount = laptop.originalPrice - laptop.currentPrice;
  const discountPercent = Math.round((discountAmount / laptop.originalPrice) * 100);
  const isHistoricLow = laptop.currentPrice <= laptop.historicLow;

  const getStoreBadgeColor = (store: StoreName) => {
    if (gamerMode) {
      switch (store) {
        case 'RED Computer': return 'bg-rose-950/70 text-rose-300 border-rose-500/50 hover:border-rose-400';
        case 'Life Informàtica': return 'bg-cyan-950/70 text-cyan-300 border-cyan-500/50 hover:border-cyan-400';
        case 'Modular Technology': return 'bg-violet-950/70 text-violet-300 border-violet-500/50 hover:border-violet-400';
        default: return 'bg-slate-800 text-slate-300 border-slate-700 hover:border-emerald-500/50';
      }
    }
    switch (store) {
      case 'RED Computer': return 'bg-rose-50 text-rose-900 border-rose-200 hover:border-rose-300';
      case 'Life Informàtica': return 'bg-sky-50 text-sky-900 border-sky-200 hover:border-sky-300';
      case 'Modular Technology': return 'bg-purple-50 text-purple-900 border-purple-200 hover:border-purple-300';
      case 'Amazon': return 'bg-amber-50 text-amber-900 border-amber-200';
      case 'PcComponentes': return 'bg-orange-50 text-orange-900 border-orange-200';
      case 'MediaMarkt': return 'bg-red-50 text-red-900 border-red-200';
      case 'Coolmod': return 'bg-blue-50 text-blue-900 border-blue-200';
      case 'El Corte Inglés': return 'bg-emerald-50 text-emerald-900 border-emerald-200';
      default: return 'bg-slate-50 text-slate-900 border-slate-200';
    }
  };

  const bestOffer = laptop.storeOffers.slice().sort((a, b) => a.price - b.price)[0] || {
    store: 'Amazon',
    price: laptop.currentPrice,
    deliveryTime: 'Envío estándar',
    storeUrl: '#'
  };

  const isDedicatedGpu = laptop.gpu.type === 'Dedicada';
  const fps = laptop.gpu.benchmarkFps1440p || 35;

  return (
    <article 
      className={`group flex flex-col rounded-xl overflow-hidden transition-all duration-200 ${
        gamerMode 
          ? 'bg-[#0f172a] border border-slate-800 hover:border-emerald-500/60 hover:shadow-[0_4px_25px_rgba(16,185,129,0.15)] text-slate-100' 
          : 'bg-white border border-slate-200/80 hover:shadow-md hover:border-slate-300 text-slate-900'
      }`}
    >
      {/* Top Media & Quick Actions */}
      <div className={`relative aspect-[4/3] overflow-hidden flex items-center justify-center p-6 border-b ${gamerMode ? 'bg-[#0b101b] border-slate-800/80' : 'bg-slate-50 border-slate-100'}`}>
        <img
          src={laptop.imageUrl}
          alt={laptop.model}
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain mix-blend-multiply brightness-95 transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        
        {/* Deal Tag - Minimalist inline label */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
          {isHistoricLow && (
            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded backdrop-blur-sm border ${
              gamerMode 
                ? 'text-emerald-400 bg-emerald-950/80 border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.3)]' 
                : 'text-emerald-700 bg-emerald-50/90 border-emerald-200/80'
            }`}>
              <Sparkles className="w-3 h-3 text-emerald-500" />
              Mínimo histórico
            </span>
          )}
          {discountPercent >= 20 && !isHistoricLow && (
            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded backdrop-blur-sm border ${
              gamerMode 
                ? 'text-white bg-slate-800/90 border-slate-700' 
                : 'text-slate-900 bg-white/90 border-slate-200'
            }`}>
              -{discountPercent}% rebaja
            </span>
          )}

          {/* Gamer Highlight Tag */}
          {gamerMode && isDedicatedGpu && (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-sky-400 bg-sky-950/80 border border-sky-500/40 px-1.5 py-0.5 rounded">
              <Zap className="w-2.5 h-2.5 text-sky-400" />
              {laptop.gpu.tgpWatts ? `${laptop.gpu.tgpWatts}W TGP` : 'GPU GAMING'}
            </span>
          )}
        </div>

        {/* Favorite Action */}
        <button
          onClick={() => onToggleFavorite(laptop.id)}
          aria-label={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
          className={`absolute top-3 right-3 p-2 rounded-lg backdrop-blur-sm transition-colors ${
            isFavorite 
              ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30' 
              : gamerMode
                ? 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-700'
                : 'bg-white/80 text-slate-500 hover:text-slate-900 border border-slate-200/80'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>
      </div>

      {/* Card Body */}
      <div className="flex flex-col flex-1 p-5">
        {/* Zero-Pill Metadata Header */}
        <div className={`flex items-center gap-2 text-xs mb-1.5 ${gamerMode ? 'text-slate-400 font-mono' : 'text-slate-500'}`}>
          <span className={`font-semibold ${gamerMode ? 'text-emerald-400' : 'text-slate-700'}`}>{laptop.brand}</span>
          <span aria-hidden="true">·</span>
          <span>{laptop.category}</span>
          <span aria-hidden="true">·</span>
          <span>{laptop.screen.sizeInches}" {laptop.screen.refreshRateHz}Hz</span>
        </div>

        {/* Product Title */}
        <h3 className="text-base font-semibold leading-snug line-clamp-2 min-h-[44px]">
          {laptop.model}
        </h3>

        {/* GPU Performance Strip (Gamer Highlight) */}
        <div className={`mt-2.5 p-2 rounded-lg border flex items-center justify-between text-xs ${
          gamerMode 
            ? 'bg-slate-900/90 border-slate-800' 
            : 'bg-slate-50 border-slate-100'
        }`}>
          <div className="flex items-center gap-1.5 min-w-0">
            <Gamepad2 className={`w-3.5 h-3.5 shrink-0 ${isDedicatedGpu ? 'text-emerald-500' : 'text-slate-400'}`} />
            <span className="font-semibold truncate text-[11px]">{laptop.gpu.name}</span>
          </div>
          <div className="shrink-0 flex items-center gap-1 text-[11px] font-mono">
            <span className={gamerMode ? 'text-emerald-400 font-bold' : 'text-slate-700 font-semibold'}>
              ~{fps} FPS
            </span>
          </div>
        </div>

        {/* Technical Specs Summary */}
        <div className={`mt-2.5 grid grid-cols-2 gap-2 text-xs p-2.5 rounded-lg border ${
          gamerMode 
            ? 'bg-slate-900/60 border-slate-800 text-slate-300' 
            : 'bg-slate-50/70 border-slate-100 text-slate-600'
        }`}>
          <div className="flex items-center gap-1.5 truncate" title={laptop.processor.name}>
            <Cpu className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{laptop.processor.name.split('(')[0]}</span>
          </div>
          <div className="flex items-center gap-1.5" title={`${laptop.ram.amountGb} GB ${laptop.ram.type}`}>
            <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-mono tabular-nums">{laptop.ram.amountGb} GB RAM</span>
          </div>
          <div className="flex items-center gap-1.5" title={laptop.storage.type}>
            <HardDrive className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-mono tabular-nums">{laptop.storage.amountGb >= 1000 ? `${laptop.storage.amountGb / 1000} TB` : `${laptop.storage.amountGb} GB`} SSD</span>
          </div>
          <div className="flex items-center gap-1.5 truncate" title={`VRAM: ${laptop.gpu.vramGb || 'Integrada'} GB`}>
            <span className={`text-[10px] uppercase font-mono px-1 rounded ${gamerMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-200/70 text-slate-600'}`}>
              VRAM
            </span>
            <span className="truncate font-mono">{laptop.gpu.vramGb ? `${laptop.gpu.vramGb} GB` : 'Compartida'}</span>
          </div>
        </div>

        {/* Pricing Module */}
        <div className={`mt-4 pt-3 border-t flex items-baseline justify-between ${gamerMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <div>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold font-mono tabular-nums ${gamerMode ? 'text-emerald-400' : 'text-slate-900'}`}>
                {laptop.currentPrice.toLocaleString('es-ES')} €
              </span>
              {laptop.originalPrice > laptop.currentPrice && (
                <span className="text-xs text-slate-500 line-through font-mono tabular-nums">
                  {laptop.originalPrice.toLocaleString('es-ES')} €
                </span>
              )}
            </div>
            <div className={`text-[11px] mt-0.5 ${gamerMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Mejor precio en <span className="font-medium text-slate-300">{bestOffer.store}</span> ({bestOffer.deliveryTime})
            </div>
          </div>

          <div className="text-right">
            {discountAmount > 0 && (
              <span className={`text-xs font-semibold font-mono ${gamerMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
                -{discountAmount.toLocaleString('es-ES')} €
              </span>
            )}
          </div>
        </div>

        {/* Store Comparison Strip */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px]">
          {laptop.storeOffers.slice(0, 3).map((offer) => (
            <a
              key={offer.store}
              href={offer.storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border transition-colors ${getStoreBadgeColor(offer.store)}`}
              title={`${offer.store} - ${offer.locationNote || offer.deliveryTime}`}
            >
              <span>{offer.store}:</span>
              <span className="font-mono tabular-nums font-semibold">{offer.price} €</span>
              {offer.locationNote && (
                <span className="text-[9px] uppercase font-mono opacity-80 bg-black/20 px-1 rounded">
                  Sepúlveda BCN
                </span>
              )}
              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
            </a>
          ))}
          {laptop.storeOffers.length > 3 && (
            <span className={`text-[10px] font-mono ${gamerMode ? 'text-slate-500' : 'text-slate-400'}`}>
              +{laptop.storeOffers.length - 3} tiendas
            </span>
          )}
        </div>

        {/* Actions Footer */}
        <div className={`mt-4 pt-3 border-t flex items-center justify-between gap-2 ${gamerMode ? 'border-slate-800' : 'border-slate-100'}`}>
          {/* History Chart Button */}
          <button
            onClick={() => onOpenHistory(laptop)}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
              gamerMode 
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700' 
                : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
            }`}
          >
            <LineChart className="w-3.5 h-3.5 text-slate-400" />
            <span>Historial</span>
          </button>

          {/* Set Price Alert Button */}
          <button
            onClick={() => onOpenAlert(laptop)}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
              gamerMode 
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700' 
                : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
            }`}
          >
            <Bell className="w-3.5 h-3.5 text-slate-400" />
            <span>Alerta</span>
          </button>

          {/* Search Real Data Live Action */}
          {onSearchRealData && (
            <button
              onClick={() => onSearchRealData(laptop)}
              className={`p-2 rounded-lg border transition-colors ${
                gamerMode 
                  ? 'bg-slate-800 text-emerald-400 border-slate-700 hover:bg-slate-700 hover:border-emerald-500/60 shadow-[0_0_8px_rgba(16,185,129,0.2)]' 
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              }`}
              title="Buscar datos y precios reales de este portátil (El Corte Inglés, Sepúlveda BCN, etc.)"
            >
              <Globe className="w-4 h-4" />
            </button>
          )}

          {/* Compare Checkbox Button */}
          <button
            onClick={() => onToggleCompare(laptop.id)}
            className={`p-2 rounded-lg border transition-colors ${
              isCompared 
                ? gamerMode 
                  ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' 
                  : 'bg-slate-900 text-white border-slate-900' 
                : gamerMode
                  ? 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:border-slate-600'
                  : 'bg-white text-slate-500 border-slate-200 hover:text-slate-900 hover:border-slate-300'
            }`}
            title={isCompared ? 'Quitar del comparador' : 'Añadir al comparador'}
          >
            {isCompared ? <Check className="w-4 h-4 stroke-[2.5]" /> : <Scale className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </article>
  );
};
