import React from 'react';
import { PriceAlert, Laptop } from '../types';
import { Bell, BellOff, Trash2, ArrowRight, Check, ExternalLink, LineChart, Sparkles } from 'lucide-react';

interface AlertsViewProps {
  alerts: PriceAlert[];
  laptops: Laptop[];
  onToggleAlert: (alertId: string) => void;
  onDeleteAlert: (alertId: string) => void;
  onOpenHistory: (laptop: Laptop) => void;
  onGoToDeals: () => void;
  onSimulatePriceDrop: () => void;
  isSimulating: boolean;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  laptops,
  onToggleAlert,
  onDeleteAlert,
  onOpenHistory,
  onGoToDeals,
  onSimulatePriceDrop,
  isSimulating,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Tus Alertas de Bajada de Precio</h2>
          <p className="text-xs text-slate-500 mt-1">
            Rastreamos las tiendas cada hora. Si el precio alcanza tu objetivo, recibirás una notificación de inmediato.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSimulatePriceDrop}
            disabled={isSimulating}
            className="px-3.5 py-2 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>{isSimulating ? 'Comprobando...' : 'Comprobar bajadas ahora'}</span>
          </button>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No tienes alertas de precio activas</h3>
          <p className="text-xs text-slate-500 max-w-sm">
            Navega por las ofertas y haz clic en el botón "Alerta" en cualquier portátil para recibir un aviso en cuanto baje de precio.
          </p>
          <button
            onClick={onGoToDeals}
            className="mt-2 px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
          >
            Ver catálogo de ofertas
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alerts.map((alert) => {
            const laptop = laptops.find(l => l.id === alert.laptopId);
            const currentPrice = laptop ? laptop.currentPrice : alert.initialPrice;
            const diff = currentPrice - alert.targetPrice;
            const reachedTarget = currentPrice <= alert.targetPrice;

            return (
              <div 
                key={alert.id}
                className={`bg-white rounded-xl border p-5 flex flex-col justify-between transition-all ${
                  reachedTarget
                    ? 'border-emerald-300 bg-emerald-50/20 shadow-xs'
                    : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {laptop && (
                        <div className="w-12 h-12 bg-slate-50 rounded-lg p-1 flex items-center justify-center border border-slate-100 shrink-0">
                          <img
                            src={laptop.imageUrl}
                            alt={laptop.model}
                            className="max-h-full max-w-full object-contain mix-blend-multiply"
                          />
                        </div>
                      )}
                      <div>
                        <div className="text-xs text-slate-500 font-semibold">{laptop?.brand || 'Portátil'}</div>
                        <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{alert.laptopModel}</h4>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Creada el {new Date(alert.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteAlert(alert.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Eliminar alerta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Pricing Comparison Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <div className="text-slate-500 text-[11px]">Precio Actual</div>
                      <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
                        {currentPrice.toLocaleString('es-ES')} €
                      </div>
                    </div>

                    <div className={`p-2.5 rounded-lg border ${reachedTarget ? 'bg-emerald-100/50 border-emerald-200' : 'bg-slate-50 border-slate-100'}`}>
                      <div className="text-slate-500 text-[11px]">Precio Objetivo</div>
                      <div className="text-base font-bold font-mono text-emerald-700 mt-0.5">
                        {alert.targetPrice.toLocaleString('es-ES')} €
                      </div>
                    </div>
                  </div>

                  {/* Status Banner */}
                  <div className="mt-3">
                    {reachedTarget ? (
                      <div className="p-2.5 bg-emerald-100/60 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-800 font-medium">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>¡Objetivo cumplido! Ya puedes comprarlo a este precio.</span>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 flex items-center justify-between">
                        <span>Faltan por bajar:</span>
                        <span className="font-mono font-semibold text-slate-700">
                          {diff.toLocaleString('es-ES')} € más
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${alert.active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      {alert.active ? 'Monitoreando' : 'Pausada'}
                    </span>
                    {alert.notificationChannels.browser && (
                      <span className="text-slate-400">· Push web</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {laptop && (
                      <button
                        onClick={() => onOpenHistory(laptop)}
                        className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        <LineChart className="w-3 h-3" />
                        <span>Historial</span>
                      </button>
                    )}

                    <button
                      onClick={() => onToggleAlert(alert.id)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                        alert.active 
                          ? 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200' 
                          : 'text-white bg-slate-900 hover:bg-slate-800'
                      }`}
                    >
                      {alert.active ? 'Pausar' : 'Reanudar'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
