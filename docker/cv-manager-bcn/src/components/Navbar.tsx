import React from 'react';
import { UserProfileAccount } from '../types';
import { Printer, Plus, Users, ChevronDown, Camera, Database } from 'lucide-react';

interface Props {
  activeTab: 'candidaturas' | 'cv-generator' | 'jobs';
  onSelectTab: (tab: 'candidaturas' | 'cv-generator' | 'jobs') => void;
  candidaturasCount: number;
  activeProfile: UserProfileAccount;
  profilesCount: number;
  onQuickAction: () => void;
  onOpenPhotoEditor: () => void;
  onOpenProfileSwitcher: () => void;
  onOpenStorageModal: () => void;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  candidaturasCount,
  activeProfile,
  profilesCount,
  onQuickAction,
  onOpenPhotoEditor,
  onOpenProfileSwitcher,
  onOpenStorageModal,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 no-print shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark + Profile Switcher Badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectTab('candidaturas')}
            className="text-left group cursor-pointer"
          >
            <span className="text-lg font-extrabold tracking-tight text-slate-900 group-hover:text-sky-700 transition-colors">
              CV Manager BCN
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation links */}
        <nav className="hidden md:flex items-center gap-2 sm:gap-6 text-xs sm:text-sm font-medium">
          <button
            onClick={() => onSelectTab('candidaturas')}
            className={`py-2 px-1 transition-colors relative flex items-center gap-1.5 ${
              activeTab === 'candidaturas'
                ? 'text-slate-900 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Candidaturas</span>
            <span className="font-mono text-[11px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded-full tabular-nums">
              {candidaturasCount}
            </span>
            {activeTab === 'candidaturas' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full" />
            )}
          </button>

          <button
            onClick={() => onSelectTab('cv-generator')}
            className={`py-2 px-1 transition-colors relative flex items-center gap-1.5 ${
              activeTab === 'cv-generator'
                ? 'text-slate-900 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Generador de CV (PDF)</span>
            {activeTab === 'cv-generator' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full" />
            )}
          </button>

          <button
            onClick={() => onSelectTab('jobs')}
            className={`py-2 px-1 transition-colors relative flex items-center gap-1.5 ${
              activeTab === 'jobs'
                ? 'text-slate-900 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Ofertas Barcelona</span>
            {activeTab === 'jobs' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full" />
            )}
          </button>
        </nav>

        {/* Zone 3: Profile Switcher & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Profile Pill with Switcher */}
          <button
            onClick={onOpenProfileSwitcher}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 transition-all text-left group"
            title="Haz clic para cambiar de perfil o añadir uno nuevo"
          >
            <div className="relative">
              {activeProfile.avatarUrl ? (
                <img
                  src={activeProfile.avatarUrl}
                  alt={activeProfile.name}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full object-cover border border-slate-300"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 text-xs font-bold">
                  {activeProfile.name.charAt(0)}
                </div>
              )}
            </div>

            <div className="hidden sm:block">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-slate-800 leading-none group-hover:text-sky-700 transition-colors">
                  {activeProfile.name.split(' ')[0]}
                </span>
                <span
                  className={`text-[9.5px] px-1 py-0.2 rounded font-medium ${
                    activeProfile.category === 'administrative'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-sky-100 text-sky-800'
                  }`}
                >
                  {activeProfile.category === 'administrative' ? 'Admin' : 'IT'}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block leading-tight mt-0.5 flex items-center gap-0.5">
                <span>Cambiar perfil ({profilesCount})</span>
                <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
              </span>
            </div>
          </button>

          {/* Quick Context Action */}
          {activeTab === 'cv-generator' ? (
            <button
              onClick={onQuickAction}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimir / PDF</span>
            </button>
          ) : (
            <button
              onClick={onQuickAction}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nueva Candidatura</span>
            </button>
          )}

          {/* Direct Photo Edit Icon */}
          <button
            onClick={onOpenPhotoEditor}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
            title="Cambiar la foto del perfil activo"
          >
            <Camera className="w-4 h-4" />
          </button>

          {/* Storage & Backup Icon */}
          <button
            onClick={onOpenStorageModal}
            className="p-2 text-slate-500 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-colors border border-transparent hover:border-sky-200 flex items-center gap-1"
            title="Almacenamiento Local Gratuito (IndexedDB 0€) & Copias de Seguridad"
          >
            <Database className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile navigation tab row */}
      <div className="md:hidden flex border-t border-slate-200 px-4 py-2 bg-white justify-around text-xs font-medium text-slate-600">
        <button
          onClick={() => onSelectTab('candidaturas')}
          className={`py-1 ${activeTab === 'candidaturas' ? 'text-sky-700 font-bold' : ''}`}
        >
          Candidaturas ({candidaturasCount})
        </button>
        <button
          onClick={() => onSelectTab('cv-generator')}
          className={`py-1 ${activeTab === 'cv-generator' ? 'text-sky-700 font-bold' : ''}`}
        >
          Generador CV
        </button>
        <button
          onClick={() => onSelectTab('jobs')}
          className={`py-1 ${activeTab === 'jobs' ? 'text-sky-700 font-bold' : ''}`}
        >
          Ofertas BCN
        </button>
      </div>
    </header>
  );
};
