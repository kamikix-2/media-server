import React, { useState } from 'react';
import { UserProfileAccount, ProfileCategory, CVProfile, CVDesignSettings } from '../../types';
import {
  davidAdministrativeCVProfile,
  davidAdminDesignSettings,
  noemiCVProfile,
  noemiDesignSettings,
} from '../../data/initialData';
import {
  X,
  Plus,
  Briefcase,
  Sparkles,
  FileText,
  Trash2,
  Copy,
  Layers,
  CheckCircle2,
  ArrowRight,
  UserCheck,
  Building2,
  Check,
  RotateCcw,
  Database,
  HardDrive,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profiles: UserProfileAccount[];
  activeProfileId: string;
  onSelectProfile: (profileId: string) => void;
  onAddNewProfile: (newProfile: UserProfileAccount) => void;
  onDeleteProfile: (profileId: string) => void;
  onOpenStorageModal?: () => void;
}

export const ProfileSwitcherModal: React.FC<Props> = ({
  isOpen,
  onClose,
  profiles,
  activeProfileId,
  onSelectProfile,
  onAddNewProfile,
  onDeleteProfile,
  onOpenStorageModal,
}) => {
  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];

  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [creationMode, setCreationMode] = useState<'adapt_current' | 'preset_noemi' | 'custom'>('adapt_current');

  // Form states
  const [newName, setNewName] = useState(activeProfile?.name || 'David Cortés Herrero');
  const [newHeadline, setNewHeadline] = useState('Responsable de Gestión Administrativa y Documental');
  const [newCategory, setNewCategory] = useState<ProfileCategory>('administrative');
  const [newCity, setNewCity] = useState(activeProfile?.cv?.personal?.city || 'Barcelona');
  const [newDistrict, setNewDistrict] = useState(activeProfile?.cv?.personal?.district || 'Les Corts');
  const [newTemplate, setNewTemplate] = useState<'catalan_minimal' | 'modern_tech' | 'executive' | 'compact_ats'>('catalan_minimal');

  if (!isOpen) return null;

  // Direct 1-Click Action: Add administrative profile based on current active CV
  const handleQuickAddAdministrativeBasedOnCurrent = () => {
    const newId = `profile-admin-${Date.now()}`;
    const baseCv = activeProfile?.cv || davidAdministrativeCVProfile;

    const adaptedCV: CVProfile = {
      ...davidAdministrativeCVProfile,
      personal: {
        ...davidAdministrativeCVProfile.personal,
        fullName: activeProfile?.name || baseCv.personal.fullName,
        photoUrl: activeProfile?.avatarUrl || baseCv.personal.photoUrl,
        showPhoto: true,
        street: baseCv.personal.street || 'Marqués de Sentmenat',
        district: baseCv.personal.district || 'Les Corts',
        city: baseCv.personal.city || 'Barcelona',
        postalCode: baseCv.personal.postalCode || '08029',
        phonePrimary: baseCv.personal.phonePrimary || '93 419 7152',
        phoneSecondary: baseCv.personal.phoneSecondary || '658 866 087',
        email: baseCv.personal.email || 'dcortesh@gmail.com',
        dni: baseCv.personal.dni || '46575821Q',
      },
    };

    const newProfile: UserProfileAccount = {
      id: newId,
      name: activeProfile?.name || 'David Cortés Herrero',
      headline: 'Responsable de Gestión Administrativa, Documental y Proyectos',
      category: 'administrative',
      avatarUrl: activeProfile?.avatarUrl || '/src/assets/images/david_avatar_1790503946966.jpg',
      cv: adaptedCV,
      designSettings: davidAdminDesignSettings,
    };

    onAddNewProfile(newProfile);
    onSelectProfile(newId);
    onClose();
  };

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newHeadline.trim()) {
      alert('Por favor introduce el nombre y el titular profesional.');
      return;
    }

    const newId = `profile-${Date.now()}`;

    let baseCV: CVProfile;
    let baseDesignSettings: CVDesignSettings;

    if (creationMode === 'preset_noemi') {
      baseCV = { ...noemiCVProfile };
      baseDesignSettings = { ...noemiDesignSettings };
    } else if (creationMode === 'adapt_current' && newCategory === 'administrative') {
      baseCV = {
        ...davidAdministrativeCVProfile,
        personal: {
          ...davidAdministrativeCVProfile.personal,
          fullName: newName.trim(),
          headline: newHeadline.trim(),
          photoUrl: activeProfile?.avatarUrl || '',
          city: newCity,
          district: newDistrict,
        },
      };
      baseDesignSettings = {
        ...davidAdminDesignSettings,
        template: newTemplate,
      };
    } else {
      // Custom based on active profile or generic
      baseCV = {
        ...activeProfile.cv,
        personal: {
          ...activeProfile.cv.personal,
          fullName: newName.trim(),
          headline: newHeadline.trim(),
          city: newCity,
          district: newDistrict,
        },
      };
      baseDesignSettings = {
        ...activeProfile.designSettings,
        template: newTemplate,
      };
    }

    const newProfile: UserProfileAccount = {
      id: newId,
      name: newName.trim(),
      headline: newHeadline.trim(),
      category: newCategory,
      avatarUrl: baseCV.personal.photoUrl || activeProfile?.avatarUrl || '',
      cv: baseCV,
      designSettings: baseDesignSettings,
    };

    onAddNewProfile(newProfile);
    onSelectProfile(newId);
    setIsCreatingNew(false);
    onClose();
  };

  const hasAdministrativeProfile = profiles.some((p) => p.category === 'administrative');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-150 border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Perfiles de Curriculum & Empleo</h2>
              <p className="text-[11px] text-slate-500">
                Gestiona varios perfiles profesionales (IT, Administrativo, Dirección) adaptados a cada proceso
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

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {!isCreatingNew ? (
            <>
              {/* Quick Hero Banner: Add Administrative Profile based on current CV */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50/60 border border-amber-200/80 rounded-xl p-4 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
                      <span className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                        Añadir Perfil Administrativo en base a este CV
                      </span>
                    </div>
                    <p className="text-xs text-amber-900/90 leading-relaxed">
                      Adapta automáticamente el CV de <strong>{activeProfile.name}</strong> a un perfil de <strong>Gestión Administrativa, Documental y Proyectos</strong>, reutilizando tus datos de contacto en Les Corts y orientando tu trayectoria a puestos administrativos.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleQuickAddAdministrativeBasedOnCurrent}
                    className="px-3.5 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap active:scale-98"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Crear Perfil Administrativo</span>
                  </button>
                </div>
              </div>

              {/* Profiles List Header */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-bold text-slate-800">
                  Perfiles configurados ({profiles.length})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingNew(true);
                    setCreationMode('adapt_current');
                    setNewCategory('administrative');
                    setNewHeadline('Responsable de Gestión Administrativa y Documental');
                    setNewName(activeProfile.name);
                  }}
                  className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir Otro Perfil</span>
                </button>
              </div>

              {/* Profiles Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {profiles.map((p) => {
                  const isActive = p.id === activeProfileId;
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        onSelectProfile(p.id);
                        onClose();
                      }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
                        isActive
                          ? 'border-sky-600 bg-sky-50/40 shadow-xs ring-2 ring-sky-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                      }`}
                    >
                      <div>
                        {/* Active Badge & Category Tag */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              p.category === 'administrative'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-sky-100 text-sky-800 border border-sky-200'
                            }`}
                          >
                            {p.category === 'administrative' ? 'Administrativo / Dirección' : 'IT / Desarrollo'}
                          </span>

                          {isActive ? (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-sky-700 bg-white px-2 py-0.5 rounded-full border border-sky-200 shadow-2xs">
                              <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                              Activo
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400 group-hover:text-sky-700 font-medium">
                              Seleccionar →
                            </span>
                          )}
                        </div>

                        {/* Profile Info */}
                        <div className="flex items-center gap-3">
                          {p.avatarUrl ? (
                            <img
                              src={p.avatarUrl}
                              alt={p.name}
                              referrerPolicy="no-referrer"
                              className="w-12 h-12 rounded-full object-cover border border-slate-300 shadow-2xs shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 font-bold text-base shrink-0">
                              {p.name.charAt(0)}
                            </div>
                          )}

                          <div className="overflow-hidden">
                            <h3 className="font-bold text-slate-900 text-sm truncate">
                              {p.name}
                            </h3>
                            <p className="text-xs text-slate-600 font-medium line-clamp-2">
                              {p.headline}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">
                              {p.cv.personal.district ? `${p.cv.personal.district}, ` : ''}{p.cv.personal.city}
                            </p>
                          </div>
                        </div>

                        {/* Highlights */}
                        <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                          <span>{p.cv.experiences.length} experiencias</span>
                          <span>{p.cv.languages.length} idiomas</span>
                          <span className="capitalize">{p.designSettings.template.replace('_', ' ')}</span>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                        {p.category === 'it_tech' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickAddAdministrativeBasedOnCurrent();
                            }}
                            className="text-[10.5px] text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1 hover:underline"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Adaptar a Administrativo</span>
                          </button>
                        )}

                        {profiles.length > 1 && !isActive && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`¿Seguro que deseas eliminar el perfil de "${p.name}"?`)) {
                                onDeleteProfile(p.id);
                              }
                            }}
                            className="text-[10.5px] text-red-500 hover:text-red-700 flex items-center gap-1 ml-auto p-1 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Eliminar</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* Create New Profile Form */
            <form onSubmit={handleCreateProfile} className="space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-sky-700" />
                  <h3 className="font-bold text-slate-900 text-sm">
                    Añadir Nuevo Perfil Profesional
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="text-slate-500 hover:underline text-xs"
                >
                  ← Volver a la lista
                </button>
              </div>

              {/* Mode selector */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1.5">
                  Base de partida para el nuevo perfil:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCreationMode('adapt_current');
                      setNewCategory('administrative');
                      setNewName(activeProfile.name);
                      setNewHeadline('Responsable de Gestión Administrativa, Documental y Proyectos');
                      setNewTemplate('catalan_minimal');
                    }}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      creationMode === 'adapt_current'
                        ? 'border-sky-600 bg-sky-50 text-sky-950 ring-1 ring-sky-500'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="block text-xs font-bold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                      En base a este CV
                    </span>
                    <span className="text-[10.5px] text-slate-500 block mt-0.5">
                      Reutiliza datos de {activeProfile.name} y adapta a administrativo
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCreationMode('preset_noemi');
                      setNewCategory('administrative');
                      setNewName('Noemí Poveda');
                      setNewHeadline('Asistente de Dirección / Administrativa (+20 Años)');
                      setNewTemplate('catalan_minimal');
                    }}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      creationMode === 'preset_noemi'
                        ? 'border-amber-600 bg-amber-50 text-amber-950 ring-1 ring-amber-500'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="block text-xs font-bold flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-amber-600" />
                      Noemí Poveda
                    </span>
                    <span className="text-[10.5px] text-slate-500 block mt-0.5">
                      Secretaría alta dirección, compras, facturación y CAE
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCreationMode('custom');
                      setNewName('');
                      setNewHeadline('');
                    }}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      creationMode === 'custom'
                        ? 'border-slate-800 bg-slate-100 text-slate-900 ring-1 ring-slate-700'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="block text-xs font-bold">Personalizado</span>
                    <span className="text-[10.5px] text-slate-500 block mt-0.5">
                      Crear desde cero con datos específicos
                    </span>
                  </button>
                </div>
              </div>

              {/* Area selector */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Categoría del Perfil *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewCategory('administrative');
                      if (!newHeadline || newHeadline.includes('Programador')) {
                        setNewHeadline('Responsable de Gestión Administrativa y Documental');
                      }
                    }}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      newCategory === 'administrative'
                        ? 'border-amber-600 bg-amber-50 text-amber-900 font-semibold ring-1 ring-amber-500'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="block text-xs font-bold">Administrativo / Dirección</span>
                    <span className="text-[10.5px] text-slate-500 block mt-0.5">
                      Secretaría, compras, facturación, soporte ejecutivo, documentación
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNewCategory('it_tech');
                      if (!newHeadline || newHeadline.includes('Administrativ')) {
                        setNewHeadline('Analista Programador / Desarrollador Senior');
                      }
                    }}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      newCategory === 'it_tech'
                        ? 'border-sky-600 bg-sky-50 text-sky-900 font-semibold ring-1 ring-sky-500'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="block text-xs font-bold">IT / Desarrollo Tecnológico</span>
                    <span className="text-[10.5px] text-slate-500 block mt-0.5">
                      Ingeniería de software, portales Liferay, Java, DevOps
                    </span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ej: David Cortés Herrero"
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-sky-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Titular Profesional *</label>
                  <input
                    type="text"
                    required
                    value={newHeadline}
                    onChange={(e) => setNewHeadline(e.target.value)}
                    placeholder="Ej: Responsable de Gestión Administrativa..."
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-sky-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Distrito / Barrio</label>
                  <input
                    type="text"
                    value={newDistrict}
                    onChange={(e) => setNewDistrict(e.target.value)}
                    placeholder="Les Corts"
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-sky-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Ciudad</label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="Barcelona"
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-sky-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Diseño CV Inicial</label>
                  <select
                    value={newTemplate}
                    onChange={(e) => setNewTemplate(e.target.value as any)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 bg-white focus:outline-sky-600"
                  >
                    <option value="catalan_minimal">Minimalista Barcelona (Ideal Administrativo)</option>
                    <option value="modern_tech">Barcelona Modern Tech (Ideal IT)</option>
                    <option value="executive">Ejecutivo Clásico Editorial</option>
                    <option value="compact_ats">ATS Compacto & Directo</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-300 rounded bg-white hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Crear y Activar Perfil</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline">
              Cada perfil mantiene su propio CV independiente y diseño visual.
            </span>
            {onOpenStorageModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenStorageModal();
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-sky-50 text-sky-700 hover:bg-sky-100 font-medium transition-colors border border-sky-200"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Almacenamiento & Copias (0€)</span>
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-100 transition-colors self-end sm:self-auto"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
