import React, { useState, useRef } from 'react';
import {
  X,
  Database,
  Download,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { UserProfileAccount, Candidatura, JobOffer } from '../../types';
import {
  exportFullDatabaseJSON,
  optimizeAllProfileImages,
} from '../../utils/storage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profiles: UserProfileAccount[];
  candidaturas: Candidatura[];
  offers: JobOffer[];
  activeProfileId: string;
  onRestoreData: (data: {
    profiles: UserProfileAccount[];
    candidaturas: Candidatura[];
    offers: JobOffer[];
    activeProfileId: string;
  }) => void;
  onProfilesUpdated: (profiles: UserProfileAccount[]) => void;
}

export const StorageBackupModal: React.FC<Props> = ({
  isOpen,
  onClose,
  profiles,
  candidaturas,
  offers,
  activeProfileId,
  onRestoreData,
  onProfilesUpdated,
}) => {
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [activeFaq, setActiveFaq] = useState<string | null>('quota');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // 1. Export Data to JSON
  const handleExportJSON = () => {
    try {
      exportFullDatabaseJSON(profiles, candidaturas, offers, activeProfileId);
      setStatusMessage({
        type: 'success',
        text: '¡Copia de seguridad descargada con éxito! Guárdala gratis en tu PC o Google Drive.',
      });
      setTimeout(() => setStatusMessage(null), 6000);
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: 'Error al exportar los datos. Por favor inténtalo de nuevo.',
      });
    }
  };

  // 2. Import Data from JSON
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.profiles && Array.isArray(parsed.profiles)) {
          const restoredProfiles = parsed.profiles;
          const restoredCandidaturas = Array.isArray(parsed.candidaturas) ? parsed.candidaturas : candidaturas;
          const restoredOffers = Array.isArray(parsed.offers) ? parsed.offers : offers;
          const restoredActiveId = parsed.activeProfileId || restoredProfiles[0]?.id || activeProfileId;

          onRestoreData({
            profiles: restoredProfiles,
            candidaturas: restoredCandidaturas,
            offers: restoredOffers,
            activeProfileId: restoredActiveId,
          });

          setStatusMessage({
            type: 'success',
            text: `¡Restauración completada! Se han cargado ${restoredProfiles.length} perfiles y ${restoredCandidaturas.length} candidaturas.`,
          });
        } else {
          setStatusMessage({
            type: 'error',
            text: 'El archivo JSON no tiene el formato de copia de seguridad de CV Manager.',
          });
        }
      } catch {
        setStatusMessage({
          type: 'error',
          text: 'Error al leer el archivo JSON. Verifica que sea un archivo válido.',
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // 3. Optimize and compress all profile images
  const handleOptimizeImages = async () => {
    try {
      setIsOptimizing(true);
      setStatusMessage({
        type: 'info',
        text: 'Optimizando fotos de todos los perfiles...',
      });

      const { updatedProfiles, savedKB } = await optimizeAllProfileImages(profiles);
      onProfilesUpdated(updatedProfiles);

      setStatusMessage({
        type: 'success',
        text: `¡Optimización completada! Se han reducido y optimizado todas las fotos (ahorro aproximado: ${savedKB} KB).`,
      });
      setTimeout(() => setStatusMessage(null), 6000);
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: 'Ocurrió un error durante la optimización.',
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  // Calculate total profiles size summary
  const profilesSizeKB = Math.round((JSON.stringify(profiles).length * 2) / 1024);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-150 border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Almacenamiento & Copias Gratuitas</h2>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  100% GRATIS (0 €)
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Tus datos se guardan en PostgreSQL en el servidor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* Status notification */}
          {statusMessage && (
            <div
              className={`p-3 rounded-lg border flex items-center gap-2.5 animate-in fade-in text-xs ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : statusMessage.type === 'info'
                  ? 'bg-sky-50 border-sky-200 text-sky-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : statusMessage.type === 'info' ? (
                <RefreshCw className="w-4 h-4 text-sky-600 animate-spin shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span className="font-medium">{statusMessage.text}</span>
            </div>
          )}

          {/* Core System Status Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl p-4 sm:p-5 shadow-sm space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-300 flex items-center justify-center border border-sky-400/30">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-300 uppercase tracking-wider block font-semibold">
                    Motor de Almacenamiento Activo
                  </span>
                  <span className="text-sm font-bold text-white flex items-center gap-1.5">
                    PostgreSQL · immich
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-right">
                <div>
                  <span className="text-[10px] text-slate-400 block">Estado actual</span>
                  <span className="text-sm font-bold text-sky-300 font-mono">
                    {profilesSizeKB} KB · {profiles.length} perfiles
                  </span>
                </div>
                <div className="border-l border-slate-700 pl-4">
                  <span className="text-[10px] text-slate-400 block">Datos guardados</span>
                  <span className="text-sm font-bold text-emerald-400">
                    {candidaturas.length} candidaturas · {offers.length} ofertas
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              Perfiles, currículums, fotos, candidaturas y ofertas se guardan en la base PostgreSQL del servidor y se comparten entre los navegadores que inicien sesión.
            </p>
          </div>

          {/* Free Action Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Action 1: Export JSON */}
            <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/70 hover:bg-slate-50 transition-all flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
                  <Download className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-bold text-slate-900 text-xs">Descargar Copia (.json)</h3>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Descarga un archivo con todos tus CVs, fotos y candidaturas a tu ordenador o Google Drive.
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportJSON}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar Gratis</span>
              </button>
            </div>

            {/* Action 2: Import JSON */}
            <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/70 hover:bg-slate-50 transition-all flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Upload className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-bold text-slate-900 text-xs">Restaurar Copia</h3>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Carga un archivo de respaldo previo para sincronizar tus perfiles en cualquier navegador.
                </p>
              </div>
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImportFile}
                  accept=".json,application/json"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Cargar Archivo</span>
                </button>
              </div>
            </div>

            {/* Action 3: Compress Photos */}
            <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/70 hover:bg-slate-50 transition-all flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-bold text-slate-900 text-xs">Optimizar Imágenes</h3>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Reduce el tamaño de las fotos almacenadas junto a los perfiles.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOptimizeImages}
                disabled={isOptimizing}
                className="w-full py-2 bg-amber-700 hover:bg-amber-800 disabled:opacity-60 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                {isOptimizing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>{isOptimizing ? 'Comprimiendo...' : 'Optimizar Fotos'}</span>
              </button>
            </div>
          </div>

          {/* Interactive Explanations FAQ */}
          <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200">
            {/* Question 1: What does the quota error mean? */}
            <div className="p-3.5 bg-white">
              <button
                type="button"
                onClick={() => setActiveFaq(activeFaq === 'quota' ? null : 'quota')}
                className="w-full flex items-center justify-between text-left font-bold text-slate-900 text-xs"
              >
                <span className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-sky-600 shrink-0" />
                  ¿Dónde se guardan mis datos?
                </span>
                <span className="text-slate-400 font-mono text-sm">{activeFaq === 'quota' ? '−' : '+'}</span>
              </button>
              {activeFaq === 'quota' && (
                <div className="mt-2.5 text-[11.5px] text-slate-600 space-y-1.5 pl-6 border-l-2 border-sky-400">
                  <p>
                    La app guarda el estado completo en la tabla <code>cv_manager_state</code> de la base <code>immich</code> en PostgreSQL. El servidor mantiene una copia compartida; puedes descargar o restaurar una copia JSON desde aquí.
                  </p>
                </div>
              )}
            </div>

            {/* Question 2: Can it be stored without paying money? */}
            <div className="p-3.5 bg-white">
              <button
                type="button"
                onClick={() => setActiveFaq(activeFaq === 'free' ? null : 'free')}
                className="w-full flex items-center justify-between text-left font-bold text-slate-900 text-xs"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  ¿Cómo se protege el acceso?
                </span>
                <span className="text-slate-400 font-mono text-sm">{activeFaq === 'free' ? '−' : '+'}</span>
              </button>
              {activeFaq === 'free' && (
                <div className="mt-2.5 text-[11.5px] text-slate-600 space-y-2 pl-6 border-l-2 border-emerald-400">
                  <p>
                    <strong>La app solicita credenciales propias antes de cargar o guardar datos.</strong>
                  </p>
                  <ol className="list-decimal pl-4 space-y-1.5">
                    <li>
                      El usuario y la contraseña se configuran en el archivo de entorno del servidor, no en el código de la app.
                    </li>
                    <li>
                      La conexión externa debe usarse por HTTPS; la contraseña no se conserva al cerrar o recargar la pestaña.
                    </li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>PostgreSQL conectado · Base de datos compartida</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors shadow-xs"
          >
            Entendido / Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
