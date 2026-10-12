import React, { useState } from 'react';
import { CloudSyncState, Laptop } from '../types';
import { 
  X, 
  Cloud, 
  RefreshCw, 
  Copy, 
  Check, 
  Download, 
  Upload, 
  Smartphone, 
  Laptop as LaptopIcon, 
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncState: CloudSyncState;
  isSyncing: boolean;
  onManualSync: () => Promise<void>;
  onConnectKey: (key: string) => Promise<boolean>;
  onExportBackup: () => void;
  onImportBackup: (importedData: any) => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  syncState,
  isSyncing,
  onManualSync,
  onConnectKey,
  onExportBackup,
  onImportBackup
}) => {
  if (!isOpen) return null;

  const [inputKey, setInputKey] = useState('');
  const [copied, setCopied] = useState(false);
  const [connectError, setConnectError] = useState('');
  const [connectSuccess, setConnectSuccess] = useState(false);

  const handleCopyKey = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(syncState.syncKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConnectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputKey.trim()) return;
    setConnectError('');
    setConnectSuccess(false);

    const success = await onConnectKey(inputKey.trim().toUpperCase());
    if (success) {
      setConnectSuccess(true);
      setInputKey('');
      setTimeout(() => {
        setConnectSuccess(false);
      }, 3000);
    } else {
      setConnectError('Código de sincronización no encontrado o no válido en la nube.');
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        onImportBackup(json);
      } catch (err) {
        alert('Archivo JSON no válido');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-50 text-sky-700 border border-sky-100 rounded-lg">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Sincronización en la Nube</h2>
              <div className="text-xs text-slate-500">
                Mantén tus alertas, favoritos y comparativas sincronizadas en móvil y escritorio
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

        <div className="p-6 space-y-6">
          {/* Active Cloud Sync Key Box */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Tu Clave de Nube Personal</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <ShieldCheck className="w-3 h-3" />
                Cifrado y Activo
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-lg text-slate-900 tracking-wider">
                {syncState.syncKey}
              </div>
              <button
                onClick={handleCopyKey}
                className="px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
                title="Copiar clave"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>
                Última sincronización: {new Date(syncState.lastUpdated).toLocaleTimeString()}
              </span>
              <button
                onClick={onManualSync}
                disabled={isSyncing}
                className="text-sky-600 hover:text-sky-700 font-medium inline-flex items-center gap-1 disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar ahora'}</span>
              </button>
            </div>
          </div>

          {/* Connect Another Device / Cross-Device Link */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-slate-500" />
              <span>Vincular con otro dispositivo (móvil, tablet u ordenador)</span>
            </h4>
            <p className="text-xs text-slate-500">
              Introduce la clave de tu otro dispositivo para sincronizar tus alertas y portátiles guardados en tiempo real.
            </p>

            <form onSubmit={handleConnectSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Ej. VP-DEMO1"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value.toUpperCase())}
                className="flex-1 px-3 py-2 text-xs font-mono font-semibold bg-white border border-slate-300 rounded-lg uppercase placeholder:normal-case placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <button
                type="submit"
                disabled={!inputKey.trim() || isSyncing}
                className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50 inline-flex items-center gap-1"
              >
                <span>Vincular</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {connectError && (
              <div className="text-xs text-rose-600 font-medium">{connectError}</div>
            )}
            {connectSuccess && (
              <div className="text-xs text-emerald-600 font-medium">¡Dispositivo vinculado con éxito en la nube!</div>
            )}
          </div>

          {/* Sync Stats */}
          <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-center text-xs">
            <div>
              <div className="text-slate-400">Favoritos</div>
              <div className="font-bold font-mono text-slate-900 text-sm mt-0.5">
                {syncState.favorites.length}
              </div>
            </div>
            <div>
              <div className="text-slate-400">Alertas Activas</div>
              <div className="font-bold font-mono text-slate-900 text-sm mt-0.5">
                {syncState.alerts.filter(a => a.active).length}
              </div>
            </div>
            <div>
              <div className="text-slate-400">Notificaciones</div>
              <div className="font-bold font-mono text-slate-900 text-sm mt-0.5">
                {syncState.notifications.length}
              </div>
            </div>
          </div>

          {/* Manual Backup Export / Import */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Copia de seguridad local:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={onExportBackup}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg transition-colors"
                title="Exportar archivo JSON"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Exportar JSON</span>
              </button>

              <label className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>Importar</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-lg transition-colors"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};
