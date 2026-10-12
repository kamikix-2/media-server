import React, { useState } from 'react';
import { Laptop, PriceAlert } from '../types';
import { X, Bell, BellRing, Check, Sparkles, AlertCircle, Info, Mail } from 'lucide-react';

interface AlertModalProps {
  laptop: Laptop | null;
  existingAlert?: PriceAlert;
  onClose: () => void;
  onSaveAlert: (alert: PriceAlert) => void;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  laptop,
  existingAlert,
  onClose,
  onSaveAlert,
}) => {
  if (!laptop) return null;

  const currentPrice = laptop.currentPrice;
  const historicLow = laptop.historicLow;

  const [targetPrice, setTargetPrice] = useState<number>(
    existingAlert ? existingAlert.targetPrice : Math.min(currentPrice - 50, historicLow)
  );
  const [browserNotification, setBrowserNotification] = useState<boolean>(
    existingAlert ? existingAlert.notificationChannels.browser : true
  );
  const [emailInput, setEmailInput] = useState<string>(
    existingAlert?.notificationChannels.email || ''
  );
  const [hasPermission, setHasPermission] = useState<boolean>(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  );
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const requestBrowserPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      setHasPermission(permission === 'granted');
    }
  };

  const handleQuickPreset = (value: number) => {
    setTargetPrice(Math.max(100, Math.round(value)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const alertData: PriceAlert = {
      id: existingAlert ? existingAlert.id : `alert-${Date.now()}`,
      laptopId: laptop.id,
      laptopModel: laptop.model,
      targetPrice: Number(targetPrice),
      initialPrice: currentPrice,
      active: true,
      createdAt: existingAlert ? existingAlert.createdAt : new Date().toISOString(),
      notificationChannels: {
        browser: browserNotification,
        appBell: true,
        email: emailInput.trim() || undefined,
      }
    };

    onSaveAlert(alertData);
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const discountFromCurrent = currentPrice - targetPrice;
  const discountPercent = Math.round((discountFromCurrent / currentPrice) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-slate-100 text-slate-800 rounded-lg">
              <BellRing className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Alerta de bajada de precio</h3>
              <p className="text-xs text-slate-500">Te avisamos al instante en cuanto baje</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {savedSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <h4 className="text-base font-bold text-slate-900">¡Alerta configurada con éxito!</h4>
            <p className="text-xs text-slate-500">
              Te notificaremos en cuanto el precio de <span className="font-semibold text-slate-700">{laptop.model}</span> caiga a {targetPrice.toLocaleString('es-ES')} € o menos.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Product Summary */}
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <img
                src={laptop.imageUrl}
                alt={laptop.model}
                className="w-12 h-12 object-contain mix-blend-multiply"
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-slate-500 truncate">{laptop.brand}</div>
                <div className="text-sm font-semibold text-slate-900 truncate">{laptop.model}</div>
                <div className="text-xs font-mono text-slate-700 mt-0.5">
                  Precio actual: <span className="font-bold">{currentPrice.toLocaleString('es-ES')} €</span>
                  <span className="text-slate-400 mx-1.5">|</span>
                  Mínimo: <span className="text-emerald-700 font-semibold">{historicLow.toLocaleString('es-ES')} €</span>
                </div>
              </div>
            </div>

            {/* Target Price Configuration */}
            <div>
              <label htmlFor="target-price-input" className="block text-xs font-medium text-slate-700 mb-1.5">
                Avisarme cuando el precio baje a:
              </label>
              <div className="relative">
                <input
                  id="target-price-input"
                  type="number"
                  min="50"
                  max={currentPrice - 1}
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(Number(e.target.value))}
                  className="w-full pl-4 pr-12 py-2.5 bg-white border border-slate-300 rounded-xl text-lg font-bold font-mono tabular-nums text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
                  €
                </span>
              </div>

              {discountFromCurrent > 0 && (
                <div className="flex items-center justify-between text-xs text-slate-500 mt-1.5">
                  <span>Rebaja esperada:</span>
                  <span className="font-mono text-emerald-700 font-semibold">
                    -{discountFromCurrent.toLocaleString('es-ES')} € ({discountPercent}%)
                  </span>
                </div>
              )}
            </div>

            {/* Quick Preset Buttons */}
            <div>
              <div className="text-[11px] font-medium text-slate-500 mb-1.5">Sugerencias rápidas:</div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickPreset(currentPrice - 50)}
                  className="px-2 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                >
                  -50 € ({currentPrice - 50}€)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset(currentPrice * 0.9)}
                  className="px-2 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                >
                  -10% ({Math.round(currentPrice * 0.9)}€)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset(historicLow)}
                  className="px-2 py-1.5 text-xs font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg transition-colors"
                >
                  Mínimo ({historicLow}€)
                </button>
              </div>
            </div>

            {/* Notification Channels */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="text-xs font-semibold text-slate-900">Canales de notificación:</div>

              {/* In-app bell notification (always on) */}
              <div className="flex items-center justify-between text-xs text-slate-700">
                <span className="flex items-center gap-2">
                  <Bell className="w-3.5 h-3.5 text-slate-500" />
                  Notificación dentro de la app (Campana)
                </span>
                <span className="text-xs font-semibold text-slate-500">Activo</span>
              </div>

              {/* Browser push notifications */}
              <div className="flex items-center justify-between text-xs text-slate-700">
                <label htmlFor="browser-push-checkbox" className="flex items-center gap-2 cursor-pointer">
                  <input
                    id="browser-push-checkbox"
                    type="checkbox"
                    checked={browserNotification}
                    onChange={(e) => setBrowserNotification(e.target.checked)}
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <span>Notificaciones del navegador</span>
                </label>
                {browserNotification && !hasPermission && (
                  <button
                    type="button"
                    onClick={requestBrowserPermission}
                    className="text-[11px] text-sky-600 hover:underline font-medium"
                  >
                    Permitir permisos
                  </button>
                )}
              </div>

              {/* Optional Email Channel */}
              <div>
                <label htmlFor="alert-email-input" className="block text-[11px] font-medium text-slate-600 mb-1">
                  Correo electrónico (opcional):
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="alert-email-input"
                    type="email"
                    placeholder="tu-correo@ejemplo.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Submit & Cancel */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
              >
                {existingAlert ? 'Actualizar alerta' : 'Crear alerta de precio'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
