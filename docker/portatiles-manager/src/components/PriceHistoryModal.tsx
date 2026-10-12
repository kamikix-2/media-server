import React, { useState } from 'react';
import { Laptop, PricePoint } from '../types';
import { X, TrendingDown, TrendingUp, Calendar, ShoppingBag, ArrowDownRight, Bell, Sparkles } from 'lucide-react';

interface PriceHistoryModalProps {
  laptop: Laptop | null;
  onClose: () => void;
  onCreateAlert: (laptop: Laptop) => void;
}

export const PriceHistoryModal: React.FC<PriceHistoryModalProps> = ({
  laptop,
  onClose,
  onCreateAlert
}) => {
  if (!laptop) return null;

  const [timeRange, setTimeRange] = useState<'30d' | '90d' | 'all'>('90d');
  const [hoveredPoint, setHoveredPoint] = useState<PricePoint | null>(null);

  const history = laptop.priceHistory;
  const prices = history.map(h => h.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
  const currentPrice = laptop.currentPrice;
  const isAllTimeLow = currentPrice <= minPrice;

  // SVG Chart Geometry
  const chartWidth = 600;
  const chartHeight = 220;
  const paddingX = 40;
  const paddingY = 30;

  const priceRange = maxPrice - minPrice || 1;
  const getY = (price: number) => {
    const ratio = (price - minPrice) / priceRange;
    // Invert Y axis for SVG (higher price = higher on chart = lower Y coordinate)
    return chartHeight - paddingY - ratio * (chartHeight - paddingY * 2);
  };

  const getX = (index: number, total: number) => {
    if (total <= 1) return paddingX;
    return paddingX + (index / (total - 1)) * (chartWidth - paddingX * 2);
  };

  const points = history.map((p, idx) => ({
    ...p,
    x: getX(idx, history.length),
    y: getY(p.price)
  }));

  const svgPathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, '');

  const areaPathD = points.length > 0
    ? `${svgPathD} L ${points[points.length - 1].x},${chartHeight - paddingY} L ${points[0].x},${chartHeight - paddingY} Z`
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span className="font-semibold text-slate-700">{laptop.brand}</span>
              <span aria-hidden="true">·</span>
              <span>Historial de fluctuación de precios</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 leading-snug">
              {laptop.model}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Key Metric Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <div className="text-xs text-slate-500 font-medium">Precio Actual</div>
              <div className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                {currentPrice.toLocaleString('es-ES')} €
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">En tienda online</div>
            </div>

            <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-100">
              <div className="flex items-center justify-between text-xs text-emerald-800 font-medium">
                <span>Mínimo Histórico</span>
                {isAllTimeLow && <Sparkles className="w-3.5 h-3.5 text-emerald-600" />}
              </div>
              <div className="text-xl font-bold font-mono tabular-nums text-emerald-700 mt-1">
                {minPrice.toLocaleString('es-ES')} €
              </div>
              <div className="text-[11px] text-emerald-700/80 mt-0.5">
                {isAllTimeLow ? '¡Precio actual más bajo!' : `${laptop.historicLow} € récord`}
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <div className="text-xs text-slate-500 font-medium">Precio Medio</div>
              <div className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                {avgPrice.toLocaleString('es-ES')} €
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Últimos 90 días</div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <div className="text-xs text-slate-500 font-medium">Máximo Histórico</div>
              <div className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                {maxPrice.toLocaleString('es-ES')} €
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Precio de salida</div>
            </div>
          </div>

          {/* Interactive Chart Container */}
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Evolución de Precio (€)</h4>
                <p className="text-xs text-slate-500">Pasa el cursor por los puntos para ver detalles</p>
              </div>

              {/* Time Range Selector */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
                <button
                  onClick={() => setTimeRange('30d')}
                  className={`px-2.5 py-1 rounded transition-colors ${timeRange === '30d' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  30 días
                </button>
                <button
                  onClick={() => setTimeRange('90d')}
                  className={`px-2.5 py-1 rounded transition-colors ${timeRange === '90d' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  90 días
                </button>
                <button
                  onClick={() => setTimeRange('all')}
                  className={`px-2.5 py-1 rounded transition-colors ${timeRange === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Todo
                </button>
              </div>
            </div>

            {/* SVG Chart Graphic */}
            <div className="relative w-full aspect-[600/220] select-none">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0284c7" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal reference grid lines */}
                {[minPrice, avgPrice, maxPrice].map((val, idx) => {
                  const y = getY(val);
                  return (
                    <g key={idx}>
                      <line
                        x1={paddingX}
                        y1={y}
                        x2={chartWidth - paddingX}
                        y2={y}
                        stroke="#e2e8f0"
                        strokeDasharray="4 4"
                        strokeWidth="1"
                      />
                      <text
                        x={paddingX - 6}
                        y={y + 3}
                        fontSize="10"
                        textAnchor="end"
                        fill="#94a3b8"
                        className="font-mono tabular-nums"
                      >
                        {val}€
                      </text>
                    </g>
                  );
                })}

                {/* Area under curve */}
                {areaPathD && (
                  <path d={areaPathD} fill="url(#priceGradient)" />
                )}

                {/* Main Price Line */}
                <path
                  d={svgPathD}
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Interactive Points */}
                {points.map((pt, idx) => {
                  const isHovered = hoveredPoint?.date === pt.date;
                  const isLowest = pt.price === minPrice;
                  return (
                    <g key={idx} className="cursor-pointer">
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isHovered ? 7 : isLowest ? 5 : 4}
                        fill={isLowest ? '#10b981' : isHovered ? '#0369a1' : '#ffffff'}
                        stroke={isLowest ? '#059669' : '#0284c7'}
                        strokeWidth={isHovered ? 2.5 : 2}
                        onMouseEnter={() => setHoveredPoint(pt)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                      {/* Date label at bottom for first, middle, last */}
                      {(idx === 0 || idx === Math.floor(points.length / 2) || idx === points.length - 1) && (
                        <text
                          x={pt.x}
                          y={chartHeight - 10}
                          fontSize="10"
                          textAnchor="middle"
                          fill="#64748b"
                          className="font-mono"
                        >
                          {pt.date.slice(5)}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Active Hover Tooltip */}
              {hoveredPoint && (
                <div 
                  className="absolute z-10 pointer-events-none bg-slate-900 text-white p-2.5 rounded-lg shadow-xl text-xs space-y-0.5 -translate-x-1/2 -translate-y-full mb-2"
                  style={{
                    left: `${(points.find(p => p.date === hoveredPoint.date)?.x || 0) / chartWidth * 100}%`,
                    top: `${(points.find(p => p.date === hoveredPoint.date)?.y || 0) / chartHeight * 100}%`
                  }}
                >
                  <div className="font-bold font-mono text-sm text-sky-300">
                    {hoveredPoint.price.toLocaleString('es-ES')} €
                  </div>
                  <div className="text-slate-300 flex items-center gap-1.5 text-[11px]">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{hoveredPoint.date}</span>
                    <span aria-hidden="true">·</span>
                    <span>{hoveredPoint.store}</span>
                  </div>
                  {hoveredPoint.note && (
                    <div className="text-[11px] text-emerald-400 font-medium pt-0.5 border-t border-slate-700">
                      {hoveredPoint.note}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Chronological Price Changes Log Table */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-900">Registro de fluctuaciones detectadas</h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                  <tr>
                    <th className="py-2.5 px-4">Fecha</th>
                    <th className="py-2.5 px-4">Tienda</th>
                    <th className="py-2.5 px-4">Precio Registrado</th>
                    <th className="py-2.5 px-4">Diferencia</th>
                    <th className="py-2.5 px-4">Anotación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.slice().reverse().map((item, idx, arr) => {
                    const prevInChronology = arr[idx + 1];
                    const diff = prevInChronology ? item.price - prevInChronology.price : 0;
                    return (
                      <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-4 font-mono text-slate-600">{item.date}</td>
                        <td className="py-2.5 px-4 font-medium text-slate-800">{item.store}</td>
                        <td className="py-2.5 px-4 font-mono font-semibold tabular-nums text-slate-900">
                          {item.price.toLocaleString('es-ES')} €
                        </td>
                        <td className="py-2.5 px-4 font-mono tabular-nums">
                          {diff < 0 ? (
                            <span className="inline-flex items-center text-emerald-600 font-semibold gap-0.5">
                              <TrendingDown className="w-3 h-3" />
                              {diff} €
                            </span>
                          ) : diff > 0 ? (
                            <span className="inline-flex items-center text-rose-500 font-semibold gap-0.5">
                              <TrendingUp className="w-3 h-3" />
                              +{diff} €
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-slate-500">
                          {item.note ? (
                            <span className="text-emerald-700 font-medium">{item.note}</span>
                          ) : (
                            'Chequeo rutinario de catálogo'
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Monitorizamos precios automáticamente cada 15 minutos en las principales tiendas online.
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onCreateAlert(laptop);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Avisarme si vuelve a bajar</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
