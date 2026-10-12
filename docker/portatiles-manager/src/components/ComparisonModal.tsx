import React from 'react';
import { Laptop } from '../types';
import { 
  X, 
  Scale, 
  Trash2, 
  Trophy, 
  Gamepad2, 
  Zap, 
  Flame, 
  Activity, 
  Cpu, 
  Sparkles,
  Layers,
  Monitor
} from 'lucide-react';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  comparedLaptops: Laptop[];
  onRemoveFromCompare: (id: string) => void;
  onClearComparison: () => void;
  onOpenHistory: (laptop: Laptop) => void;
  gamerMode?: boolean;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  isOpen,
  onClose,
  comparedLaptops,
  onRemoveFromCompare,
  onClearComparison,
  onOpenHistory,
  gamerMode = false,
}) => {
  if (!isOpen) return null;

  // Compute best values for comparison highlighting
  const lowestPrice = Math.min(...comparedLaptops.map(l => l.currentPrice));
  const highestRam = Math.max(...comparedLaptops.map(l => l.ram.amountGb));
  const highestVram = Math.max(...comparedLaptops.map(l => l.gpu.vramGb || 0));
  const highestTgp = Math.max(...comparedLaptops.map(l => l.gpu.tgpWatts || 0));
  const highestFps = Math.max(...comparedLaptops.map(l => l.gpu.benchmarkFps1440p || 0));
  const lowestWeight = Math.min(...comparedLaptops.map(l => l.weightKg));
  const highestBattery = Math.max(...comparedLaptops.map(l => l.battery.estimatedHours));
  const highestRefresh = Math.max(...comparedLaptops.map(l => l.screen.refreshRateHz));

  // Determine top gaming GPU
  const topGpuLaptopId = comparedLaptops.reduce((prev, curr) => {
    const prevFps = prev.gpu.benchmarkFps1440p || 0;
    const currFps = curr.gpu.benchmarkFps1440p || 0;
    return currFps > prevFps ? curr : prev;
  }, comparedLaptops[0])?.id;

  const bgModal = gamerMode ? 'bg-[#0b101b] border-emerald-500/30 text-slate-100' : 'bg-white border-slate-200 text-slate-900';
  const headerBg = gamerMode ? 'bg-[#0f172a]/90 border-slate-800' : 'bg-white border-slate-100';
  const stickyColBg = gamerMode ? 'bg-[#111827] border-slate-800' : 'bg-slate-50/50 border-slate-200';
  const cellBg = gamerMode ? 'bg-[#0d1322] border-slate-800/80 text-slate-200' : 'bg-white border-slate-200 text-slate-700';
  const rowLabelBg = gamerMode ? 'bg-[#0f172a]/80 text-slate-300' : 'bg-slate-50/40 text-slate-700';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className={`${bgModal} rounded-2xl border shadow-2xl max-w-6xl w-full max-h-[94vh] flex flex-col overflow-hidden transition-colors`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${headerBg}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${gamerMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-slate-100 text-slate-800 border-slate-200'}`}>
              {gamerMode ? <Gamepad2 className="w-5 h-5 text-emerald-400" /> : <Scale className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">
                  Comparador de Especificaciones y Tarjetas Gráficas
                </h2>
                {gamerMode && (
                  <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 px-2 py-0.5 rounded tracking-wider flex items-center gap-1">
                    <Zap className="w-3 h-3 text-emerald-400 animate-pulse" />
                    GAMER BENCHMARK
                  </span>
                )}
              </div>
              <div className={`text-xs ${gamerMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Comparativa exhaustiva con métricas GPU, VRAM, TGP, FPS 1440p y precio
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {comparedLaptops.length > 0 && (
              <button
                onClick={onClearComparison}
                className="px-3 py-1.5 text-xs font-medium text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors inline-flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpiar</span>
              </button>
            )}
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors ${gamerMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        {comparedLaptops.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${gamerMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>
              <Gamepad2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold">No hay portátiles seleccionados</h3>
            <p className={`text-xs max-w-sm ${gamerMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Marca portátiles con el botón de balanza para comparar tarjetas gráficas, TGP, rendimiento en FPS y componentes técnicos.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-x-auto overflow-y-auto">
            <div className="min-w-[760px]">
              {/* Product Header Row */}
              <div className={`grid grid-cols-[200px_repeat(auto-fit,minmax(230px,1fr))] border-b ${gamerMode ? 'border-slate-800' : 'border-slate-200'} sticky top-0 z-10 ${stickyColBg}`}>
                <div className={`p-4 flex flex-col justify-center text-xs font-bold uppercase tracking-wider ${gamerMode ? 'text-emerald-400 font-mono' : 'text-slate-500'}`}>
                  <span>Equipo / Modelo</span>
                  <span className={`text-[10px] font-normal normal-case ${gamerMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    {comparedLaptops.length} seleccionados
                  </span>
                </div>

                {comparedLaptops.map((laptop) => {
                  const isTopGpu = laptop.id === topGpuLaptopId && comparedLaptops.length > 1;
                  return (
                    <div 
                      key={laptop.id} 
                      className={`p-4 border-l relative flex flex-col items-center text-center ${cellBg} ${isTopGpu && gamerMode ? 'bg-gradient-to-b from-emerald-950/20 to-transparent' : ''}`}
                    >
                      <button
                        onClick={() => onRemoveFromCompare(laptop.id)}
                        className={`absolute top-2 right-2 p-1 rounded transition-colors ${gamerMode ? 'text-slate-400 hover:text-rose-400 hover:bg-slate-800' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'}`}
                        title="Quitar de comparativa"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      {isTopGpu && (
                        <div className="mb-1.5 inline-flex items-center gap-1 text-[10px] font-bold font-mono px-2 py-0.5 rounded text-emerald-400 bg-emerald-950/80 border border-emerald-500/40">
                          <Flame className="w-3 h-3 text-emerald-400" />
                          <span>MÁXIMA POTENCIA GPU</span>
                        </div>
                      )}
                      
                      <div className="w-28 h-20 flex items-center justify-center mb-2">
                        <img
                          src={laptop.imageUrl}
                          alt={laptop.model}
                          className="max-h-full max-w-full object-contain mix-blend-multiply brightness-95"
                        />
                      </div>
                      
                      <div className={`text-[11px] uppercase font-semibold ${gamerMode ? 'text-emerald-400/80 font-mono' : 'text-slate-500'}`}>
                        {laptop.brand} · {laptop.category}
                      </div>
                      <div className="text-xs font-bold line-clamp-2 mt-0.5 min-h-[32px]">
                        {laptop.model}
                      </div>

                      <div className="mt-2 flex items-baseline gap-1.5">
                        <span className={`text-lg font-bold font-mono tabular-nums ${gamerMode ? 'text-emerald-400' : 'text-slate-900'}`}>
                          {laptop.currentPrice.toLocaleString('es-ES')} €
                        </span>
                        {laptop.currentPrice === lowestPrice && comparedLaptops.length > 1 && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                            <Trophy className="w-2.5 h-2.5" />
                            Mejor precio
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => onOpenHistory(laptop)}
                        className={`mt-2 text-[11px] hover:underline font-medium ${gamerMode ? 'text-sky-400' : 'text-sky-600'}`}
                      >
                        Ver gráfico de precio
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Rows */}
              <div className={`divide-y text-xs ${gamerMode ? 'divide-slate-800/80' : 'divide-slate-100'}`}>
                {/* --- SECCIÓN DESTACADA: TARJETA GRÁFICA (GPU) --- */}
                <div className={`grid grid-cols-[200px_repeat(auto-fit,minmax(230px,1fr))] ${gamerMode ? 'bg-emerald-950/20' : 'bg-sky-50/50'}`}>
                  <div className={`p-4 font-bold flex items-center gap-1.5 ${gamerMode ? 'text-emerald-400 font-mono' : 'text-slate-900'}`}>
                    <Gamepad2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Tarjeta Gráfica (GPU)</span>
                  </div>
                  {comparedLaptops.map((laptop) => (
                    <div key={laptop.id} className={`p-4 border-l ${gamerMode ? 'border-slate-800' : 'border-slate-200'} space-y-1`}>
                      <div className="font-bold text-sm">
                        {laptop.gpu.name}
                      </div>
                      <div className="text-[11px] font-medium flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded font-mono text-[10px] ${
                          laptop.gpu.type === 'Dedicada'
                            ? gamerMode ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200/60 text-slate-700'
                        }`}>
                          {laptop.gpu.type}
                        </span>
                        <span className={gamerMode ? 'text-slate-400' : 'text-slate-500'}>
                          {laptop.gpu.vramGb ? `${laptop.gpu.vramGb} GB VRAM` : 'Memoria Compartida'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* VRAM y Tipo de Memoria Gráfica */}
                <div className={`grid grid-cols-[200px_repeat(auto-fit,minmax(230px,1fr))] hover:${gamerMode ? 'bg-slate-900/40' : 'bg-slate-50/50'}`}>
                  <div className={`p-3.5 font-semibold ${rowLabelBg}`}>Memoria VRAM</div>
                  {comparedLaptops.map((laptop) => {
                    const isMaxVram = (laptop.gpu.vramGb || 0) === highestVram && comparedLaptops.length > 1;
                    return (
                      <div key={laptop.id} className={`p-3.5 border-l ${gamerMode ? 'border-slate-800' : 'border-slate-200'}`}>
                        <div className="flex items-center gap-1.5 font-mono tabular-nums">
                          <span className="font-bold text-sm">
                            {laptop.gpu.vramGb ? `${laptop.gpu.vramGb} GB` : 'Compartida'}
                          </span>
                          {isMaxVram && (
                            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
                              Mayor VRAM
                            </span>
                          )}
                        </div>
                        <div className={`text-[11px] mt-0.5 ${gamerMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {laptop.gpu.type === 'Dedicada' ? 'GDDR6 ultrarrápida dedicada' : 'Unificada con sistema'}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Potencia TGP (Vatios) */}
                <div className={`grid grid-cols-[200px_repeat(auto-fit,minmax(230px,1fr))] hover:${gamerMode ? 'bg-slate-900/40' : 'bg-slate-50/50'}`}>
                  <div className={`p-3.5 font-semibold ${rowLabelBg}`}>Potencia TGP (Consumo GPU)</div>
                  {comparedLaptops.map((laptop) => {
                    const tgp = laptop.gpu.tgpWatts || 0;
                    const isMaxTgp = tgp === highestTgp && comparedLaptops.length > 1;
                    return (
                      <div key={laptop.id} className={`p-3.5 border-l ${gamerMode ? 'border-slate-800' : 'border-slate-200'}`}>
                        <div className="flex items-center gap-1.5 font-mono tabular-nums">
                          <span className="font-bold">
                            {tgp > 0 ? `${tgp} W` : 'Bajo consumo'}
                          </span>
                          {isMaxTgp && tgp > 50 && (
                            <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">
                              Full Power TGP
                            </span>
                          )}
                        </div>
                        <div className={`text-[11px] mt-0.5 ${gamerMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {tgp >= 120 ? 'Rendimiento gaming sin restricciones térmicas' : tgp >= 60 ? 'Equilibrio potencia / consumo' : 'Enfocado a portabilidad'}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Tecnologías Gaming (DLSS, Ray Tracing) */}
                <div className={`grid grid-cols-[200px_repeat(auto-fit,minmax(230px,1fr))] hover:${gamerMode ? 'bg-slate-900/40' : 'bg-slate-50/50'}`}>
                  <div className={`p-3.5 font-semibold ${rowLabelBg}`}>Tecnologías de Gráficos</div>
                  {comparedLaptops.map((laptop) => (
                    <div key={laptop.id} className={`p-3.5 border-l ${gamerMode ? 'border-slate-800' : 'border-slate-200'} space-y-1`}>
                      <div className="flex flex-wrap gap-1">
                        {laptop.gpu.dlssSupport && (
                          <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                            DLSS 3.5 Frame Gen
                          </span>
                        )}
                        {laptop.gpu.rayTracingHardware && (
                          <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-950/70 border border-sky-500/30 px-1.5 py-0.5 rounded">
                            Ray Tracing HW
                          </span>
                        )}
                        {!laptop.gpu.dlssSupport && !laptop.gpu.rayTracingHardware && (
                          <span className="text-[10px] text-slate-500">Rasterizado estándar</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Rendimiento Gaming Estimado (FPS 1440p) */}
                <div className={`grid grid-cols-[200px_repeat(auto-fit,minmax(230px,1fr))] hover:${gamerMode ? 'bg-slate-900/40' : 'bg-slate-50/50'}`}>
                  <div className={`p-3.5 font-semibold ${rowLabelBg}`}>
                    <div className="flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-emerald-500" />
                      <span>FPS 1440p Estimados (Juegos AAA)</span>
                    </div>
                  </div>
                  {comparedLaptops.map((laptop) => {
                    const fps = laptop.gpu.benchmarkFps1440p || 30;
                    const isMaxFps = fps === highestFps && comparedLaptops.length > 1;
                    return (
                      <div key={laptop.id} className={`p-3.5 border-l ${gamerMode ? 'border-slate-800' : 'border-slate-200'}`}>
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-sm text-emerald-400">
                            ~{fps} FPS
                          </span>
                          {isMaxFps && (
                            <span className="text-[10px] font-bold text-emerald-400">TOP 1</span>
                          )}
                        </div>
                        {/* Progress Bar of Performance */}
                        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                          <div 
                            className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(100, (fps / 175) * 100)}%` }}
                          />
                        </div>
                        <div className={`text-[10px] mt-1 ${gamerMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {fps >= 140 ? 'Rendimiento RTX Serie 50 extremo (165+ FPS en 1440p)' : fps >= 90 ? 'Ultra fluido a 1440p con Ray Tracing' : fps >= 60 ? '60+ FPS estables en Ultra' : 'Juego casual o esports a 1080p'}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* --- RESTO DE ESPECIFICACIONES --- */}

                {/* Procesador */}
                <div className={`grid grid-cols-[200px_repeat(auto-fit,minmax(230px,1fr))] hover:${gamerMode ? 'bg-slate-900/40' : 'bg-slate-50/50'}`}>
                  <div className={`p-3.5 font-semibold ${rowLabelBg}`}>Procesador (CPU)</div>
                  {comparedLaptops.map((laptop) => (
                    <div key={laptop.id} className={`p-3.5 border-l ${gamerMode ? 'border-slate-800' : 'border-slate-200'} space-y-0.5`}>
                      <div className="font-semibold">{laptop.processor.name}</div>
                      <div className={`text-[11px] font-mono ${gamerMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {laptop.processor.cores} núcleos · hasta {laptop.processor.boostGhz} GHz
                      </div>
                    </div>
                  ))}
                </div>

                {/* Memoria RAM */}
                <div className={`grid grid-cols-[200px_repeat(auto-fit,minmax(230px,1fr))] hover:${gamerMode ? 'bg-slate-900/40' : 'bg-slate-50/50'}`}>
                  <div className={`p-3.5 font-semibold ${rowLabelBg}`}>Memoria RAM</div>
                  {comparedLaptops.map((laptop) => {
                    const isMax = laptop.ram.amountGb === highestRam && comparedLaptops.length > 1;
                    return (
                      <div key={laptop.id} className={`p-3.5 border-l ${gamerMode ? 'border-slate-800' : 'border-slate-200'}`}>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold font-mono tabular-nums">
                            {laptop.ram.amountGb} GB
                          </span>
                          {isMax && (
                            <span className="text-[10px] font-semibold text-sky-400 bg-sky-950/60 border border-sky-500/30 px-1.5 py-0.5 rounded">
                              Mayor RAM
                            </span>
                          )}
                        </div>
                        <div className={`text-[11px] mt-0.5 ${gamerMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {laptop.ram.type} {laptop.ram.upgradable ? '(Slots ampliables)' : '(Integrada en placa)'}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pantalla y Tasa de Refresco */}
                <div className={`grid grid-cols-[200px_repeat(auto-fit,minmax(230px,1fr))] hover:${gamerMode ? 'bg-slate-900/40' : 'bg-slate-50/50'}`}>
                  <div className={`p-3.5 font-semibold ${rowLabelBg}`}>Pantalla y Refresco</div>
                  {comparedLaptops.map((laptop) => {
                    const isMaxHz = laptop.screen.refreshRateHz === highestRefresh && comparedLaptops.length > 1;
                    return (
                      <div key={laptop.id} className={`p-3.5 border-l ${gamerMode ? 'border-slate-800' : 'border-slate-200'} space-y-0.5`}>
                        <div className="font-semibold flex items-center gap-1.5">
                          <span>{laptop.screen.sizeInches}" {laptop.screen.panelType}</span>
                          {isMaxHz && (
                            <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/60 border border-amber-500/30 px-1.5 py-0.5 rounded">
                              {laptop.screen.refreshRateHz} Hz
                            </span>
                          )}
                        </div>
                        <div className={`text-[11px] font-mono ${gamerMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {laptop.screen.resolution} · {laptop.screen.refreshRateHz} Hz · {laptop.screen.brightnessNits} nits
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Almacenamiento */}
                <div className={`grid grid-cols-[200px_repeat(auto-fit,minmax(230px,1fr))] hover:${gamerMode ? 'bg-slate-900/40' : 'bg-slate-50/50'}`}>
                  <div className={`p-3.5 font-semibold ${rowLabelBg}`}>Almacenamiento SSD</div>
                  {comparedLaptops.map((laptop) => (
                    <div key={laptop.id} className={`p-3.5 border-l ${gamerMode ? 'border-slate-800' : 'border-slate-200'}`}>
                      <div className="font-bold font-mono">
                        {laptop.storage.amountGb >= 1000 ? `${laptop.storage.amountGb / 1000} TB` : `${laptop.storage.amountGb} GB`}
                      </div>
                      <div className={`text-[11px] mt-0.5 ${gamerMode ? 'text-slate-400' : 'text-slate-500'}`}>{laptop.storage.type}</div>
                    </div>
                  ))}
                </div>

                {/* Batería & Autonomía */}
                <div className={`grid grid-cols-[200px_repeat(auto-fit,minmax(230px,1fr))] hover:${gamerMode ? 'bg-slate-900/40' : 'bg-slate-50/50'}`}>
                  <div className={`p-3.5 font-semibold ${rowLabelBg}`}>Batería y Autonomía</div>
                  {comparedLaptops.map((laptop) => (
                    <div key={laptop.id} className={`p-3.5 border-l ${gamerMode ? 'border-slate-800' : 'border-slate-200'}`}>
                      <div className="font-bold font-mono">Hasta {laptop.battery.estimatedHours} horas</div>
                      <div className={`text-[11px] mt-0.5 ${gamerMode ? 'text-slate-400' : 'text-slate-500'}`}>{laptop.battery.capacityWh} Wh</div>
                    </div>
                  ))}
                </div>

                {/* Peso y Sistema Operativo */}
                <div className={`grid grid-cols-[200px_repeat(auto-fit,minmax(230px,1fr))] hover:${gamerMode ? 'bg-slate-900/40' : 'bg-slate-50/50'}`}>
                  <div className={`p-3.5 font-semibold ${rowLabelBg}`}>Peso y Sistema Operativo</div>
                  {comparedLaptops.map((laptop) => (
                    <div key={laptop.id} className={`p-3.5 border-l ${gamerMode ? 'border-slate-800' : 'border-slate-200'}`}>
                      <div className="font-bold font-mono">{laptop.weightKg.toFixed(2)} kg</div>
                      <div className={`text-[11px] mt-0.5 ${gamerMode ? 'text-slate-400' : 'text-slate-500'}`}>{laptop.os}</div>
                    </div>
                  ))}
                </div>

                {/* Mejor Precio y Tienda */}
                <div className={`grid grid-cols-[200px_repeat(auto-fit,minmax(230px,1fr))] hover:${gamerMode ? 'bg-slate-900/40' : 'bg-slate-50/50'}`}>
                  <div className={`p-3.5 font-semibold ${rowLabelBg}`}>Mejor Tienda y Recogida</div>
                  {comparedLaptops.map((laptop) => {
                    const best = laptop.storeOffers[0];
                    return (
                      <div key={laptop.id} className={`p-3.5 border-l ${gamerMode ? 'border-slate-800' : 'border-slate-200'}`}>
                        <div className="font-bold flex items-center gap-1.5">
                          <span>{best.store}</span>
                          {best.locationNote && (
                            <span className="text-[9px] font-mono uppercase bg-emerald-500/20 text-emerald-300 px-1 py-0.5 rounded border border-emerald-500/30">
                              Sepúlveda BCN
                            </span>
                          )}
                        </div>
                        <div className={`text-[11px] mt-0.5 ${gamerMode ? 'text-slate-400' : 'text-slate-500'}`}>{best.deliveryTime}</div>
                        {best.locationNote && (
                          <div className="text-[10px] text-slate-400 mt-0.5 font-mono">{best.locationNote}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className={`px-6 py-4 border-t flex items-center justify-between ${headerBg}`}>
          <div className={`text-xs ${gamerMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Las especificaciones de TGP y FPS se basan en pruebas de referencia oficiales y perfiles térmicos de cada fabricante.
          </div>
          <button
            onClick={onClose}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors ${
              gamerMode 
                ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700' 
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Cerrar comparador
          </button>
        </div>
      </div>
    </div>
  );
};
