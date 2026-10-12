import React, { useState, useEffect } from 'react';
import { RealDataSearchResult, StoreName } from '../types';
import { 
  X, 
  Search, 
  Globe, 
  ExternalLink, 
  Check, 
  Sparkles, 
  Zap, 
  Cpu, 
  HardDrive, 
  Layers, 
  Building2, 
  Store, 
  CheckCircle2, 
  ArrowRight,
  TrendingDown,
  Activity,
  ShieldCheck,
  Radar
} from 'lucide-react';

interface RealDataSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  gamerMode?: boolean;
  onImportLaptop?: (data: RealDataSearchResult) => void;
  onAddToCompare?: (laptopId: string) => void;
}

const QUICK_SUGGESTIONS = [
  'RTX 5050 El Corte Inglés',
  'Medion Erazer Defender RTX 5060',
  'HP Victus 15 RTX 5050 Sepúlveda',
  'Alurin Flex Advance Core i5',
  'Chuwi CoreBook X 2K',
  'Lenovo LOQ 15 RTX 5050',
  'MacBook Pro 16 M4 Max'
];

export const RealDataSearchModal: React.FC<RealDataSearchModalProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
  gamerMode = false,
  onImportLaptop,
  onAddToCompare,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RealDataSearchResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [importedSuccess, setImportedSuccess] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  if (!isOpen) return null;

  const handleSearch = async (searchTerm?: string) => {
    const q = (searchTerm !== undefined ? searchTerm : query).trim();
    if (!q) return;

    setIsLoading(true);
    setErrorMsg(null);
    setImportedSuccess(false);

    try {
      const res = await fetch('/api/laptops/live-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Error al rastrear datos reales');
      }

      setResult(json.data);
    } catch (err: any) {
      console.error('Search real data error:', err);
      setErrorMsg(err.message || 'No se pudieron recuperar datos en vivo. Comprueba la conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportToStudy = async () => {
    if (!result) return;
    try {
      const res = await fetch('/api/laptops/import-real', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ realData: result })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setImportedSuccess(true);
        if (onImportLaptop) {
          onImportLaptop(result);
        }
      }
    } catch (err) {
      console.error('Import error:', err);
    }
  };

  const getStoreBadgeColor = (store: StoreName) => {
    switch (store) {
      case 'El Corte Inglés':
        return gamerMode ? 'text-emerald-400 bg-emerald-950/70 border-emerald-500/40' : 'text-emerald-800 bg-emerald-50 border-emerald-200';
      case 'RED Computer':
        return gamerMode ? 'text-rose-400 bg-rose-950/70 border-rose-500/40' : 'text-rose-800 bg-rose-50 border-rose-200';
      case 'Life Informàtica':
        return gamerMode ? 'text-cyan-400 bg-cyan-950/70 border-cyan-500/40' : 'text-sky-800 bg-sky-50 border-sky-200';
      case 'Modular Technology':
        return gamerMode ? 'text-violet-400 bg-violet-950/70 border-violet-500/40' : 'text-purple-800 bg-purple-50 border-purple-200';
      case 'PcComponentes':
        return gamerMode ? 'text-orange-400 bg-orange-950/70 border-orange-500/40' : 'text-orange-800 bg-orange-50 border-orange-200';
      case 'Amazon':
        return gamerMode ? 'text-amber-400 bg-amber-950/70 border-amber-500/40' : 'text-amber-800 bg-amber-50 border-amber-200';
      default:
        return gamerMode ? 'text-slate-300 bg-slate-800 border-slate-700' : 'text-slate-700 bg-slate-100 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div 
        className={`w-full max-w-4xl rounded-2xl border shadow-2xl overflow-hidden my-auto transition-all ${
          gamerMode 
            ? 'bg-[#0b101b] border-emerald-500/30 text-slate-100 shadow-[0_0_50px_rgba(16,185,129,0.15)]' 
            : 'bg-white border-slate-200 text-slate-900 shadow-xl'
        }`}
      >
        {/* Modal Header */}
        <div className={`p-5 sm:p-6 border-b flex items-start justify-between gap-4 ${
          gamerMode ? 'bg-[#0f172a]/90 border-slate-800' : 'bg-slate-50/80 border-slate-100'
        }`}>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold font-mono ${
                gamerMode ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40' : 'bg-emerald-100 text-emerald-800'
              }`}>
                <Globe className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
                <span>Rastreo de Datos Reales en Vivo</span>
              </span>
              <span className={`text-[11px] font-mono hidden sm:inline ${gamerMode ? 'text-slate-400' : 'text-slate-500'}`}>
                El Corte Inglés · Sepúlveda BCN · PcComp · Amazon
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Búsqueda y Verificación de Mercado en Tiempo Real
            </h2>
            <p className={`text-xs sm:text-sm ${gamerMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Consulta precios reales contrastados con Google Search en tiendas especializadas de España y Barcelona.
            </p>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl border transition-colors ${
              gamerMode 
                ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border-slate-700' 
                : 'bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 border-slate-200 shadow-xs'
            }`}
            aria-label="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Box */}
        <div className={`p-5 sm:p-6 border-b space-y-3 ${gamerMode ? 'bg-[#0e1626] border-slate-800' : 'bg-white border-slate-100'}`}>
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
            className="flex flex-col sm:flex-row items-stretch gap-2.5"
          >
            <div className="relative flex-1">
              <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${gamerMode ? 'text-emerald-400' : 'text-slate-400'}`} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Escribe un modelo o búsqueda (ej: RTX 5050 El Corte Inglés, Medion Erazer, Alurin...)"
                className={`w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl focus:outline-none focus:ring-2 font-medium ${
                  gamerMode 
                    ? 'bg-[#152033] border-slate-700 text-white placeholder:text-slate-500 focus:ring-emerald-500' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-slate-900 border'
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 shrink-0 ${
                gamerMode
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-[0_0_15px_rgba(16,185,129,0.4)] disabled:opacity-50'
                  : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs disabled:opacity-50'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Rastreando tiendas...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Buscar Datos Reales</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Suggestions Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className={`text-[11px] font-mono mr-1 ${gamerMode ? 'text-slate-400' : 'text-slate-500'}`}>Sugerencias:</span>
            {QUICK_SUGGESTIONS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setQuery(item);
                  handleSearch(item);
                }}
                className={`px-2 py-0.5 text-[11px] rounded-lg border transition-all ${
                  gamerMode 
                    ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 max-h-[60vh] overflow-y-auto space-y-6">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <span className="font-bold">Error:</span> {errorMsg}
            </div>
          )}

          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
              <div className="relative">
                <div className={`w-16 h-16 rounded-full border-4 border-dashed animate-spin ${
                  gamerMode ? 'border-emerald-400 border-t-transparent' : 'border-slate-800 border-t-transparent'
                }`} />
                <Globe className={`w-8 h-8 absolute inset-0 m-auto ${gamerMode ? 'text-emerald-400' : 'text-slate-800'}`} />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold">Consultando Google Search y Tiendas Españolas</h3>
                <p className={`text-xs max-w-md ${gamerMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Rastreando El Corte Inglés, Life Informàtica (C/ Sepúlveda 173), RED Computer (C/ Sepúlveda 178), Modular Technology, PcComponentes y Amazon...
                </p>
              </div>
            </div>
          )}

          {!isLoading && result && (
            <div className="space-y-6 animate-fade-in">
              {/* Product Header & Key Stats */}
              <div className={`p-5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                gamerMode ? 'bg-[#0f172a] border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                    <span className={`px-2 py-0.5 rounded font-mono ${gamerMode ? 'bg-emerald-950 text-emerald-400' : 'bg-emerald-100 text-emerald-800'}`}>
                      {result.brand}
                    </span>
                    <span className={`px-2 py-0.5 rounded font-mono ${gamerMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'}`}>
                      {result.category}
                    </span>
                    {result.groundedWithGoogleSearch && (
                      <span className="flex items-center gap-1 text-[11px] text-sky-400 font-mono">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Google Search Grounding Activo</span>
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold leading-tight">
                    {result.model}
                  </h3>
                  <p className={`text-xs leading-relaxed ${gamerMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    {result.marketVerdict}
                  </p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l pt-3 sm:pt-0 sm:pl-6 border-slate-700/50 shrink-0">
                  <span className={`text-xs font-mono ${gamerMode ? 'text-slate-400' : 'text-slate-500'}`}>Mejor precio real:</span>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-2xl sm:text-3xl font-bold font-mono tabular-nums ${gamerMode ? 'text-emerald-400' : 'text-slate-900'}`}>
                      {result.lowestPrice.toLocaleString('es-ES')} €
                    </span>
                  </div>
                  <span className={`text-[11px] ${gamerMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Precio medio: {result.averagePrice.toLocaleString('es-ES')} €
                  </span>
                </div>
              </div>

              {/* Technical Specifications Summary */}
              <div>
                <h4 className={`text-xs font-mono font-semibold uppercase tracking-wider mb-2.5 ${gamerMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Especificaciones Contrastadas
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className={`p-3 rounded-xl border space-y-1 ${gamerMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Zap className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Tarjeta Gráfica</span>
                    </div>
                    <div className="font-semibold text-xs truncate" title={result.specs.gpu}>
                      {result.specs.gpu}
                    </div>
                    {result.specs.tgpWatts && (
                      <div className="text-[11px] font-mono text-emerald-400">
                        {result.specs.tgpWatts}W TGP {result.specs.vramGb ? `· ${result.specs.vramGb}GB VRAM` : ''}
                      </div>
                    )}
                  </div>

                  <div className={`p-3 rounded-xl border space-y-1 ${gamerMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Cpu className="w-3.5 h-3.5 text-sky-400" />
                      <span>Procesador</span>
                    </div>
                    <div className="font-semibold text-xs truncate" title={result.specs.cpu}>
                      {result.specs.cpu}
                    </div>
                    <div className={`text-[11px] font-mono ${gamerMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      CPU alto rendimiento
                    </div>
                  </div>

                  <div className={`p-3 rounded-xl border space-y-1 ${gamerMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Layers className="w-3.5 h-3.5 text-amber-400" />
                      <span>Memoria RAM</span>
                    </div>
                    <div className="font-semibold text-xs font-mono">
                      {result.specs.ramGb} GB RAM
                    </div>
                    <div className={`text-[11px] font-mono ${gamerMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {result.specs.storageGb >= 1000 ? `${result.specs.storageGb / 1000} TB` : `${result.specs.storageGb} GB`} SSD NVMe
                    </div>
                  </div>

                  <div className={`p-3 rounded-xl border space-y-1 ${gamerMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <HardDrive className="w-3.5 h-3.5 text-purple-400" />
                      <span>Pantalla</span>
                    </div>
                    <div className="font-semibold text-xs truncate" title={result.specs.screen}>
                      {result.specs.screen}
                    </div>
                    <div className={`text-[11px] font-mono ${gamerMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Panel IPS Antirreflejo
                    </div>
                  </div>
                </div>
              </div>

              {/* Stores Breakdown Matrix */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h4 className={`text-xs font-mono font-semibold uppercase tracking-wider ${gamerMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Ofertas Reales Detectadas por Tienda
                  </h4>
                  <span className={`text-[11px] font-mono ${gamerMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {result.stores.length} comercios verificados
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.stores.map((storeOffer) => (
                    <div
                      key={storeOffer.store}
                      className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                        storeOffer.isBestPrice
                          ? gamerMode 
                            ? 'bg-emerald-950/40 border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                            : 'bg-emerald-50/50 border-emerald-300'
                          : gamerMode
                            ? 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getStoreBadgeColor(storeOffer.store)}`}>
                            {storeOffer.store}
                          </span>
                          {storeOffer.isBestPrice && (
                            <span className="text-[10px] font-bold uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950">
                              Mejor precio
                            </span>
                          )}
                        </div>

                        <div className="flex items-baseline justify-between pt-1">
                          <div className="flex items-baseline gap-2">
                            <span className={`text-xl font-bold font-mono tabular-nums ${storeOffer.isBestPrice ? 'text-emerald-400' : ''}`}>
                              {storeOffer.price.toLocaleString('es-ES')} €
                            </span>
                            {storeOffer.originalPrice && storeOffer.originalPrice > storeOffer.price && (
                              <span className="text-xs text-slate-500 line-through font-mono">
                                {storeOffer.originalPrice.toLocaleString('es-ES')} €
                              </span>
                            )}
                          </div>
                          {storeOffer.originalPrice && storeOffer.originalPrice > storeOffer.price && (
                            <span className="text-xs font-semibold font-mono text-emerald-400">
                              -{storeOffer.originalPrice - storeOffer.price} €
                            </span>
                          )}
                        </div>

                        <p className={`text-xs ${gamerMode ? 'text-slate-300' : 'text-slate-600'}`}>
                          {storeOffer.deliveryTime}
                        </p>

                        {storeOffer.locationNote && (
                          <div className={`text-[11px] font-mono flex items-center gap-1 ${gamerMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            <Store className="w-3 h-3" />
                            <span>{storeOffer.locationNote}</span>
                          </div>
                        )}
                      </div>

                      <a
                        href={storeOffer.storeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                          storeOffer.isBestPrice
                            ? gamerMode
                              ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : gamerMode
                              ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 border-slate-700'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                        }`}
                      >
                        <span>Visitar tienda</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real Web Grounding Sources */}
              {result.searchSources && result.searchSources.length > 0 && (
                <div className={`p-4 rounded-xl border text-xs space-y-2 ${gamerMode ? 'bg-[#090e18] border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Fuentes y Enlaces Contrastados en Internet:</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {result.searchSources.map((source, idx) => (
                      <a
                        key={idx}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] border transition-colors ${
                          gamerMode ? 'bg-slate-900 border-slate-800 hover:border-emerald-500/50 text-slate-300' : 'bg-white border-slate-200 hover:border-slate-400 text-slate-700'
                        }`}
                      >
                        <span className="truncate max-w-[200px]">{source.title}</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!isLoading && !result && (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-800/60 border border-slate-700 flex items-center justify-center mx-auto text-emerald-400">
                <Radar className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-base font-semibold">Busca cualquier portátil o tienda en tiempo real</h3>
              <p className={`text-xs max-w-sm mx-auto ${gamerMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Introduce el modelo que desees rastrear o pulsa sobre una de las sugerencias para ver ofertas reales en El Corte Inglés y las tiendas de la calle Sepúlveda.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className={`p-4 sm:p-5 border-t flex flex-col sm:flex-row items-center justify-between gap-3 ${
          gamerMode ? 'bg-[#0f172a] border-slate-800' : 'bg-slate-50 border-slate-100'
        }`}>
          <div className="flex items-center gap-2 text-xs font-mono">
            {importedSuccess ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>¡Incorporado al estudio de portátiles con éxito!</span>
              </span>
            ) : (
              <span className={gamerMode ? 'text-slate-400' : 'text-slate-500'}>
                Actualización instantánea en local y catálogo
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className={`flex-1 sm:flex-none px-4 py-2 text-xs font-semibold rounded-xl border transition-colors ${
                gamerMode 
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' 
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              Cerrar
            </button>

            {result && (
              <button
                onClick={handleImportToStudy}
                disabled={importedSuccess}
                className={`flex-1 sm:flex-none px-5 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                  importedSuccess
                    ? 'bg-emerald-600/80 text-white cursor-default'
                    : gamerMode
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                      : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                }`}
              >
                {importedSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Portátil en el Estudio</span>
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4" />
                    <span>Incorporar al Estudio</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
