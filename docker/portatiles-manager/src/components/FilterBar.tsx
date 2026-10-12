import React, { useState } from 'react';
import { FilterState, LaptopBrand, ProcessorFamily, StoreName, GpuTier } from '../types';
import { Search, SlidersHorizontal, X, RotateCcw, Sparkles, Gamepad2, Zap, Globe } from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  onChangeFilters: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  totalResults: number;
  gamerMode?: boolean;
  onOpenRealDataSearch?: (query?: string) => void;
}

const BRANDS: LaptopBrand[] = [
  'Apple', 
  'Lenovo', 
  'ASUS', 
  'HP', 
  'Dell', 
  'MSI', 
  'Acer', 
  'Gigabyte', 
  'Medion', 
  'Chuwi', 
  'Alurin'
];
const PROCESSOR_FAMILIES: ProcessorFamily[] = [
  'Intel Core Ultra',
  'Apple M-Series',
  'AMD Ryzen 7/9',
  'Intel Core i7/i9',
  'Intel Core i3/i5',
  'AMD Ryzen 5',
  'Intel Celeron / N-Series',
  'Snapdragon X'
];
const RAM_OPTIONS: number[] = [8, 16, 32, 64];
const GPU_TIERS: GpuTier[] = [
  'RTX 5090',
  'RTX 5070',
  'RTX 5060',
  'RTX 5050',
  'RTX 4080/4090',
  'RTX 4070',
  'RTX 4060',
  'Apple GPU',
  'Gráficos Integrados'
];
const STORES: StoreName[] = [
  'RED Computer',
  'Life Informàtica',
  'Modular Technology',
  'Amazon',
  'PcComponentes',
  'MediaMarkt',
  'Coolmod',
  'El Corte Inglés',
  'FNAC',
  'Dell'
];

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onChangeFilters,
  onResetFilters,
  totalResults,
  gamerMode = false,
  onOpenRealDataSearch,
}) => {
  const [mobileExpanded, setMobileExpanded] = useState(false);

  const toggleBrand = (brand: LaptopBrand) => {
    const current = filters.selectedBrands;
    if (current.includes(brand)) {
      onChangeFilters({ selectedBrands: current.filter(b => b !== brand) });
    } else {
      onChangeFilters({ selectedBrands: [...current, brand] });
    }
  };

  const toggleFamily = (family: ProcessorFamily) => {
    const current = filters.selectedFamilies;
    if (current.includes(family)) {
      onChangeFilters({ selectedFamilies: current.filter(f => f !== family) });
    } else {
      onChangeFilters({ selectedFamilies: [...current, family] });
    }
  };

  const toggleRam = (ram: number) => {
    const current = filters.selectedRam;
    if (current.includes(ram)) {
      onChangeFilters({ selectedRam: current.filter(r => r !== ram) });
    } else {
      onChangeFilters({ selectedRam: [...current, ram] });
    }
  };

  const toggleGpuTier = (gpu: GpuTier) => {
    const current = filters.selectedGpuTiers || [];
    if (current.includes(gpu)) {
      onChangeFilters({ selectedGpuTiers: current.filter(g => g !== gpu) });
    } else {
      onChangeFilters({ selectedGpuTiers: [...current, gpu] });
    }
  };

  const activeFiltersCount = 
    filters.selectedBrands.length +
    filters.selectedFamilies.length +
    filters.selectedRam.length +
    (filters.selectedGpuTiers?.length || 0) +
    (filters.selectedStore !== 'all' ? 1 : 0) +
    (filters.onlyDeals ? 1 : 0) +
    (filters.maxPrice < 3500 ? 1 : 0);

  const containerBg = gamerMode 
    ? 'bg-[#0f172a] border-emerald-500/20 text-slate-200 shadow-[0_4px_25px_rgba(0,0,0,0.5)]' 
    : 'bg-white border-slate-200/80 text-slate-800 shadow-xs';
  const inputBg = gamerMode 
    ? 'bg-[#1e293b] border-slate-700 text-white placeholder:text-slate-500 focus:ring-emerald-500 focus:border-emerald-500' 
    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-slate-900';
  const labelColor = gamerMode ? 'text-slate-300 font-mono text-[11px]' : 'text-slate-700 font-semibold text-xs';
  const btnActive = gamerMode 
    ? 'bg-emerald-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(16,185,129,0.4)]' 
    : 'bg-slate-900 text-white shadow-xs';
  const btnInactive = gamerMode 
    ? 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700/60' 
    : 'bg-slate-100 text-slate-600 hover:text-slate-900';

  return (
    <section className={`border-y sm:border sm:rounded-2xl p-4 sm:p-5 space-y-4 transition-colors ${containerBg}`}>
      {/* Top Search & High-Level Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${gamerMode ? 'text-emerald-400' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="Buscar por modelo, marca (Medion, Chuwi, Alurin...), GPU (RTX 5050, 5060...), tienda Sepúlveda..."
            value={filters.searchQuery}
            onChange={(e) => onChangeFilters({ searchQuery: e.target.value })}
            className={`w-full pl-10 pr-9 py-2 text-xs rounded-xl focus:outline-none focus:ring-2 ${inputBg}`}
          />
          {filters.searchQuery && (
            <button
              onClick={() => onChangeFilters({ searchQuery: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Action button to search real data */}
        {onOpenRealDataSearch && (
          <button
            type="button"
            onClick={() => onOpenRealDataSearch(filters.searchQuery)}
            className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all flex items-center justify-center gap-1.5 shrink-0 ${
              gamerMode
                ? 'bg-emerald-950/70 hover:bg-emerald-900/90 text-emerald-300 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.25)]'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300 shadow-xs'
            }`}
            title="Buscar datos y precios reales en El Corte Inglés, Sepúlveda y tiendas online con Google Search"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="font-bold">Buscar datos reales</span>
          </button>
        )}

        {/* Sort & Mobile Filter Toggle */}
        <div className="flex items-center gap-2">
          {/* Sorting */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className={`${gamerMode ? 'text-slate-400 font-mono text-[11px]' : 'text-slate-500 font-medium'} hidden sm:inline`}>
              Ordenar:
            </span>
            <select
              value={filters.sortBy}
              onChange={(e) => onChangeFilters({ sortBy: e.target.value as any })}
              className={`px-3 py-2 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 cursor-pointer ${inputBg}`}
            >
              <option value="discount-desc">Mayor Descuento (%)</option>
              <option value="gpu-power">Mayor potencia gráfica (GPU / FPS)</option>
              <option value="price-asc">Precio más bajo (€)</option>
              <option value="price-desc">Precio más alto (€)</option>
              <option value="historic-low">Mínimos históricos primero</option>
              <option value="ram-desc">Mayor memoria RAM</option>
            </select>
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileExpanded(!mobileExpanded)}
            className={`sm:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${btnInactive}`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filtros</span>
            {activeFiltersCount > 0 && (
              <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-mono ${gamerMode ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-900 text-white'}`}>
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filter Options (Desktop always visible, Mobile collapsible) */}
      <div className={`space-y-4 ${mobileExpanded ? 'block' : 'hidden sm:block'}`}>
        {/* GPU Tier Filter (TARJETA GRÁFICA) */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className={`w-28 shrink-0 flex items-center gap-1.5 ${labelColor}`}>
            <Gamepad2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Tarjeta Gráfica:</span>
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => onChangeFilters({ selectedGpuTiers: [] })}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                (filters.selectedGpuTiers?.length || 0) === 0 ? btnActive : btnInactive
              }`}
            >
              Todas
            </button>
            {GPU_TIERS.map((tier) => {
              const selected = filters.selectedGpuTiers?.includes(tier);
              return (
                <button
                  key={tier}
                  onClick={() => toggleGpuTier(tier)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                    selected ? btnActive : btnInactive
                  }`}
                >
                  {tier}
                </button>
              );
            })}
          </div>
        </div>

        {/* Brand Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className={`w-28 shrink-0 ${labelColor}`}>Marca:</span>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => onChangeFilters({ selectedBrands: [] })}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                filters.selectedBrands.length === 0 ? btnActive : btnInactive
              }`}
            >
              Todas
            </button>
            {BRANDS.map((brand) => {
              const selected = filters.selectedBrands.includes(brand);
              return (
                <button
                  key={brand}
                  onClick={() => toggleBrand(brand)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                    selected ? btnActive : btnInactive
                  }`}
                >
                  {brand}
                </button>
              );
            })}
          </div>
        </div>

        {/* Processor Family Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className={`w-28 shrink-0 ${labelColor}`}>Procesador:</span>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => onChangeFilters({ selectedFamilies: [] })}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                filters.selectedFamilies.length === 0 ? btnActive : btnInactive
              }`}
            >
              Todos
            </button>
            {PROCESSOR_FAMILIES.map((family) => {
              const selected = filters.selectedFamilies.includes(family);
              return (
                <button
                  key={family}
                  onClick={() => toggleFamily(family)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                    selected ? btnActive : btnInactive
                  }`}
                >
                  {family}
                </button>
              );
            })}
          </div>
        </div>

        {/* RAM Available Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className={`w-28 shrink-0 ${labelColor}`}>Memoria RAM:</span>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => onChangeFilters({ selectedRam: [] })}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                filters.selectedRam.length === 0 ? btnActive : btnInactive
              }`}
            >
              Cualquiera
            </button>
            {RAM_OPTIONS.map((ram) => {
              const selected = filters.selectedRam.includes(ram);
              return (
                <button
                  key={ram}
                  onClick={() => toggleRam(ram)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg font-mono tabular-nums transition-colors ${
                    selected ? btnActive : btnInactive
                  }`}
                >
                  {ram} GB
                </button>
              );
            })}
          </div>
        </div>

        {/* Store & Price Range Row */}
        <div className={`pt-2 border-t flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs ${gamerMode ? 'border-slate-800' : 'border-slate-100'}`}>
          {/* Store select */}
          <div className="flex items-center gap-2">
            <span className={gamerMode ? 'text-slate-400 font-mono text-[11px]' : 'text-slate-500 font-medium'}>
              Tienda:
            </span>
            <select
              value={filters.selectedStore}
              onChange={(e) => onChangeFilters({ selectedStore: e.target.value as any })}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium focus:outline-none ${inputBg}`}
            >
              <option value="all">Todas las tiendas (online + Sepúlveda BCN)</option>
              <optgroup label="Tiendas C/ Sepúlveda (Barcelona)">
                <option value="RED Computer">RED Computer (C/ Sepúlveda 178)</option>
                <option value="Life Informàtica">Life Informàtica (C/ Sepúlveda 173)</option>
                <option value="Modular Technology">Modular Technology (C/ Sepúlveda 168)</option>
              </optgroup>
              <optgroup label="Otras tiendas online">
                <option value="Amazon">Amazon</option>
                <option value="PcComponentes">PcComponentes</option>
                <option value="MediaMarkt">MediaMarkt</option>
                <option value="Coolmod">Coolmod</option>
                <option value="El Corte Inglés">El Corte Inglés</option>
                <option value="FNAC">FNAC</option>
                <option value="Dell">Dell</option>
              </optgroup>
            </select>
          </div>

          {/* Max Price Slider */}
          <div className="flex items-center gap-3">
            <span className={`whitespace-nowrap ${gamerMode ? 'text-slate-400 font-mono text-[11px]' : 'text-slate-500 font-medium'}`}>
              Precio máx: <strong className={`font-mono ${gamerMode ? 'text-emerald-400' : 'text-slate-900'}`}>{filters.maxPrice} €</strong>
            </span>
            <input
              type="range"
              min="500"
              max="5000"
              step="50"
              value={filters.maxPrice}
              onChange={(e) => onChangeFilters({ maxPrice: Number(e.target.value) })}
              className={`w-32 cursor-pointer ${gamerMode ? 'accent-emerald-500' : 'accent-slate-900'}`}
            />
          </div>

          {/* Quick Only Deals Toggle */}
          <label htmlFor="only-deals-checkbox" className="flex items-center gap-2 cursor-pointer select-none">
            <input
              id="only-deals-checkbox"
              type="checkbox"
              checked={filters.onlyDeals}
              onChange={(e) => onChangeFilters({ onlyDeals: e.target.checked })}
              className={`rounded border-slate-700 ${gamerMode ? 'text-emerald-500 focus:ring-emerald-500' : 'text-slate-900 focus:ring-slate-900'}`}
            />
            <span className={`font-medium inline-flex items-center gap-1 ${gamerMode ? 'text-emerald-300' : 'text-slate-700'}`}>
              <Sparkles className="w-3 h-3 text-emerald-500" />
              Solo chollos y bajadas
            </span>
          </label>

          {/* Reset Filters */}
          {activeFiltersCount > 0 && (
            <button
              onClick={onResetFilters}
              className={`text-xs font-medium inline-flex items-center gap-1 transition-colors self-start md:self-auto ${gamerMode ? 'text-slate-400 hover:text-rose-400' : 'text-slate-500 hover:text-rose-600'}`}
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restablecer ({activeFiltersCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Results Count Bar */}
      <div className={`pt-2 border-t flex items-center justify-between text-xs ${gamerMode ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'}`}>
        <span>
          Mostrando <strong className={`font-mono ${gamerMode ? 'text-emerald-400 font-bold' : 'text-slate-900'}`}>{totalResults}</strong> ofertas con GPU y especificaciones verificadas
        </span>
        <span className="hidden sm:inline font-mono text-[11px]">
          Filtro avanzado de gráficos NVIDIA RTX, Apple y Radeon
        </span>
      </div>
    </section>
  );
};
