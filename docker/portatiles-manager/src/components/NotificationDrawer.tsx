import React from 'react';
import { NotificationItem, Laptop } from '../types';
import { X, Bell, CheckCheck, Trash2, ArrowDownRight, ExternalLink, Sparkles, AlertCircle } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  laptops: Laptop[];
  onMarkAllAsRead: () => void;
  onClearNotifications: () => void;
  onSelectLaptop: (laptop: Laptop) => void;
  onSimulatePriceDrop: () => void;
  isSimulating: boolean;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  laptops,
  onMarkAllAsRead,
  onClearNotifications,
  onSelectLaptop,
  onSimulatePriceDrop,
  isSimulating
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (notif: NotificationItem) => {
    const laptop = laptops.find(l => l.id === notif.laptopId);
    if (laptop) {
      onSelectLaptop(laptop);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-slate-100 rounded-lg text-slate-800">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Centro de Notificaciones</h3>
                <div className="text-xs text-slate-500">
                  {unreadCount > 0 ? `${unreadCount} nuevas alertas sin leer` : 'Todas las alertas al día'}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Actions Bar */}
          <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
            <button
              onClick={onMarkAllAsRead}
              disabled={unreadCount === 0}
              className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Marcar leídas</span>
            </button>

            <button
              onClick={onClearNotifications}
              disabled={notifications.length === 0}
              className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-800 font-medium disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Vaciar</span>
            </button>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <Bell className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-slate-900">No hay notificaciones</h4>
                <p className="text-xs text-slate-500 max-w-xs">
                  Crea alertas en tus portátiles favoritos para enterarte de cualquier bajada de precio o mínimo histórico en las tiendas online.
                </p>
                <button
                  onClick={onSimulatePriceDrop}
                  disabled={isSimulating}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                  <span>{isSimulating ? 'Comprobando precios...' : 'Simular bajada de precio'}</span>
                </button>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    notif.read 
                      ? 'bg-white border-slate-200 hover:border-slate-300' 
                      : 'bg-sky-50/50 border-sky-200 shadow-xs hover:border-sky-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                      <ArrowDownRight className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{notif.title}</span>
                    </div>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0 mt-1" />
                    )}
                  </div>

                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    {notif.message}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-slate-100/80 flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-700">{notif.store}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-emerald-700 font-semibold">
                        -{notif.discountAmount} €
                      </span>
                    </div>
                    <span className="font-mono">
                      {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer with Test Simulation */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600 font-medium">Probar motor de alertas:</span>
              <button
                onClick={onSimulatePriceDrop}
                disabled={isSimulating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-sky-300" />
                <span>{isSimulating ? 'Detectando ofertas...' : 'Comprobar bajada en vivo'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Genera una caída de precio inmediata en un portátil para comprobar las alertas emergentes y el sonido del sistema.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
