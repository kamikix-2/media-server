/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CandidaturasView } from './components/candidaturas/CandidaturasView';
import { CandidaturaModal } from './components/candidaturas/CandidaturaModal';
import { CVGeneratorView } from './components/cv-generator/CVGeneratorView';
import { JobsView } from './components/jobs/JobsView';
import { PhotoEditorModal } from './components/profile/PhotoEditorModal';
import { ProfileSwitcherModal } from './components/profile/ProfileSwitcherModal';
import { StorageBackupModal } from './components/storage/StorageBackupModal';
import {
  loadStoredProfiles,
  loadActiveProfileId,
  loadStoredCandidaturas,
  loadStoredOffers,
  loadLegacyAppState,
  mergeLegacyAppState,
  clearLegacyStorage,
} from './utils/storage';
import {
  ApiError,
  authenticate,
  fetchAppState,
  initializeAppState,
  saveAppState,
  AuthCredentials,
} from './utils/api';
import {
  defaultCVProfile,
  defaultDesignSettings,
  noemiCVProfile,
  noemiDesignSettings,
} from './data/initialData';
import { Candidatura, CVProfile, CVDesignSettings, JobOffer, UserProfileAccount } from './types';
import { CheckCircle2, Database, RefreshCw, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'candidaturas' | 'cv-generator' | 'jobs'>('candidaturas');

  // Multi-profile state
  const [profiles, setProfiles] = useState<UserProfileAccount[]>(loadStoredProfiles);
  const [activeProfileId, setActiveProfileId] = useState<string>(loadActiveProfileId);

  // Active profile reference
  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];

  // Working CV and settings for current active profile
  const [profile, setProfile] = useState<CVProfile>(activeProfile.cv);
  const [settings, setSettings] = useState<CVDesignSettings>(activeProfile.designSettings);

  // Candidaturas and Offers
  const [candidaturas, setCandidaturas] = useState<Candidatura[]>(loadStoredCandidaturas);
  const [offers, setOffers] = useState<JobOffer[]>(loadStoredOffers);
  const [credentials, setCredentials] = useState<AuthCredentials | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isStateLoaded, setIsStateLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Modals state
  const [isNewCandidaturaModalOpen, setIsNewCandidaturaModalOpen] = useState(false);
  const [isPhotoEditorOpen, setIsPhotoEditorOpen] = useState(false);
  const [isProfileSwitcherOpen, setIsProfileSwitcherOpen] = useState(false);
  const [isStorageModalOpen, setIsStorageModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (!credentials) return;
    const activeCredentials = credentials;
    let cancelled = false;

    async function loadFromPostgres() {
      setLoadError(null);
      try {
        const legacyState = await loadLegacyAppState();
        const remoteState = await fetchAppState(activeCredentials);
        let storedState = remoteState;
        if (!storedState) {
          storedState = await initializeAppState(activeCredentials, legacyState.state);
        } else if (legacyState.hasBrowserData) {
          const mergedState = mergeLegacyAppState(storedState, legacyState.state);
          if (
            mergedState.profiles.length !== storedState.profiles.length ||
            mergedState.candidaturas.length !== storedState.candidaturas.length ||
            mergedState.offers.length !== storedState.offers.length
          ) {
            await saveAppState(activeCredentials, mergedState);
          }
          storedState = mergedState;
        }
        if (cancelled) return;

        setProfiles(storedState.profiles);
        setActiveProfileId(storedState.activeProfileId);
        setCandidaturas(storedState.candidaturas);
        setOffers(storedState.offers);
        await clearLegacyStorage();
        if (!cancelled) setIsStateLoaded(true);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          setCredentials(null);
          setAuthError('La sesión no es válida. Vuelve a iniciar sesión.');
          return;
        }
        setLoadError(err instanceof Error ? err.message : 'No se pudo cargar la base de datos.');
      }
    }

    loadFromPostgres();
    return () => {
      cancelled = true;
    };
  }, [credentials, loadAttempt]);

  // When activeProfileId changes, sync the working CV and settings
  useEffect(() => {
    const found = profiles.find((p) => p.id === activeProfileId) || profiles[0];
    if (found) {
      setProfile(found.cv);
      setSettings(found.designSettings);
    }
  }, [activeProfileId, profiles]);

  useEffect(() => {
    if (!credentials || !isStateLoaded) return;
    void saveAppState(credentials, { profiles, activeProfileId, candidaturas, offers })
      .then(() => setSaveError(null))
      .catch((err: unknown) => {
        console.error('Could not save application state to PostgreSQL:', err);
        setSaveError('No se pudieron guardar los cambios en PostgreSQL. Reintenta el guardado.');
      });
  }, [credentials, isStateLoaded, profiles, activeProfileId, candidaturas, offers]);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsAuthenticating(true);
    setAuthError(null);
    const enteredCredentials = { username, password };
    try {
      await authenticate(enteredCredentials);
      setCredentials(enteredCredentials);
      setPassword('');
    } catch {
      setAuthError('Usuario o contraseña incorrectos, o el servidor no está disponible.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleRetrySave = async () => {
    if (!credentials) return;
    try {
      await saveAppState(credentials, { profiles, activeProfileId, candidaturas, offers });
      setSaveError(null);
    } catch {
      setSaveError('No se pudieron guardar los cambios en PostgreSQL. Reintenta el guardado.');
    }
  };

  // Switch Active Profile handler
  const handleSelectProfile = (newId: string) => {
    const target = profiles.find((p) => p.id === newId);
    if (!target) return;

    setActiveProfileId(newId);
    setProfile(target.cv);
    setSettings(target.designSettings);
    showNotification(`Perfil activo cambiado a: ${target.name}`);
  };

  // Add new Profile handler
  const handleAddNewProfile = (newProfile: UserProfileAccount) => {
    const updated = [...profiles, newProfile];
    setProfiles(updated);
    setActiveProfileId(newProfile.id);
    setProfile(newProfile.cv);
    setSettings(newProfile.designSettings);
    showNotification(`¡Nuevo perfil "${newProfile.name}" creado con éxito!`);
  };

  // Delete profile handler
  const handleDeleteProfile = (profileId: string) => {
    if (profiles.length <= 1) {
      alert('Debe mantenerse al menos un perfil activo.');
      return;
    }

    const remaining = profiles.filter((p) => p.id !== profileId);
    setProfiles(remaining);

    if (activeProfileId === profileId) {
      const fallback = remaining[0];
      setActiveProfileId(fallback.id);
      setProfile(fallback.cv);
      setSettings(fallback.designSettings);
    }

    showNotification('Perfil eliminado.');
  };

  // Update CV Profile for active profile
  const handleUpdateProfile = (updatedCV: CVProfile) => {
    setProfile(updatedCV);
    setProfiles((prev) =>
      prev.map((p) =>
        p.id === activeProfileId
          ? {
              ...p,
              name: updatedCV.personal.fullName,
              headline: updatedCV.personal.headline,
              avatarUrl: updatedCV.personal.photoUrl,
              cv: updatedCV,
            }
          : p
      )
    );
  };

  // Update Design Settings for active profile
  const handleUpdateSettings = (updatedSettings: CVDesignSettings) => {
    setSettings(updatedSettings);
    setProfiles((prev) =>
      prev.map((p) =>
        p.id === activeProfileId ? { ...p, designSettings: updatedSettings } : p
      )
    );
  };

  // Save profile photo
  const handleSavePhoto = (newPhotoUrl: string, showPhoto: boolean) => {
    const updatedCV: CVProfile = {
      ...profile,
      personal: {
        ...profile.personal,
        photoUrl: newPhotoUrl,
        showPhoto: showPhoto,
      },
    };
    const updatedSettings: CVDesignSettings = {
      ...settings,
      visibleSections: {
        ...settings.visibleSections,
        photo: showPhoto,
      },
    };

    handleUpdateProfile(updatedCV);
    handleUpdateSettings(updatedSettings);
    showNotification('Foto del perfil y currículum actualizada con éxito.');
  };

  // Reset to original PDF data depending on active profile
  const handleResetToOriginal = () => {
    if (activeProfile.id === 'profile-noemi') {
      handleUpdateProfile(noemiCVProfile);
      handleUpdateSettings(noemiDesignSettings);
      showNotification('Se han restaurado los datos originales del CV de Noemí Poveda.');
    } else {
      handleUpdateProfile(defaultCVProfile);
      handleUpdateSettings(defaultDesignSettings);
      showNotification('Se han restaurado los datos originales del CV de David Cortés Herrero.');
    }
  };

  // Convert job offer to candidatura
  const handleAddOfferToCandidaturas = (offer: JobOffer) => {
    // Check if offer is already registered for this profile
    const alreadyExists = candidaturas.some(
      (c) =>
        c.profileId === activeProfile.id &&
        ((c.jobUrl && c.jobUrl === offer.url) ||
          (c.company.toLowerCase() === offer.company.toLowerCase() &&
            c.role.toLowerCase() === offer.title.toLowerCase()))
    );

    if (alreadyExists) {
      showNotification(`Esta oferta de "${offer.company}" ya está en tus candidaturas.`);
      return;
    }

    const uniqueId = `cand-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const newCand: Candidatura = {
      id: uniqueId,
      profileId: activeProfile.id,
      company: offer.company,
      role: offer.title,
      location: `${offer.location} (${offer.zone})`,
      modality: offer.modality,
      portalSource: offer.portal,
      applicationDate: new Date().toISOString().split('T')[0],
      status: 'enviada',
      contactPerson: {
        name: '',
        role: 'Responsable Selección',
        email: '',
        phone: '',
      },
      salaryRange: offer.salary,
      contractModality: offer.contractType === 'autonomo_b2b' ? 'autonomo_b2b' : 'indefinido',
      jobUrl: offer.url,
      followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      generalNotes: `Inscripción realizada a través de ${offer.portal.toUpperCase()} para el perfil de ${activeProfile.name}. ${offer.description.slice(0, 180)}...`,
      interviews: [],
      tags: [...offer.keySkills.slice(0, 3), 'Les Corts'],
    };

    const updated = [newCand, ...candidaturas];
    setCandidaturas(updated);
    showNotification(`¡Oferta "${offer.title}" añadida como candidatura independiente!`);
  };

  // Quick action from top bar
  const handleTopQuickAction = () => {
    if (activeTab === 'cv-generator') {
      window.print();
    } else {
      setIsNewCandidaturaModalOpen(true);
    }
  };

  if (!credentials) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="w-full max-w-sm bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-sky-100 text-sky-700 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">CV Manager BCN</h1>
              <p className="text-sm text-slate-500">Acceso protegido</p>
            </div>
          </div>
          <label className="block text-sm font-medium text-slate-700">
            Usuario
            <input
              required
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Contraseña
            <input
              required
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100"
            />
          </label>
          {authError && <p role="alert" className="text-sm text-rose-700">{authError}</p>}
          <button
            type="submit"
            disabled={isAuthenticating}
            className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {isAuthenticating ? 'Verificando...' : 'Iniciar sesión'}
          </button>
        </form>
      </main>
    );
  }

  if (!isStateLoaded) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
          <Database className="mx-auto mb-3 h-8 w-8 text-sky-700" />
          <h1 className="font-semibold text-slate-900">Conectando con PostgreSQL</h1>
          {loadError ? (
            <>
              <p role="alert" className="mt-2 text-sm text-rose-700">{loadError}</p>
              <button
                type="button"
                onClick={() => setLoadAttempt((attempt) => attempt + 1)}
                className="mt-4 inline-flex items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <RefreshCw className="h-4 w-4" /> Reintentar
              </button>
            </>
          ) : (
            <p className="mt-2 text-sm text-slate-500">Cargando los datos guardados...</p>
          )}
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {saveError && (
        <div role="alert" className="fixed bottom-4 left-4 z-50 flex max-w-lg items-center gap-3 rounded-md border border-rose-300 bg-white p-3 text-sm text-rose-800 shadow-lg">
          <span>{saveError}</span>
          <button type="button" onClick={handleRetrySave} className="shrink-0 font-semibold underline">
            Reintentar
          </button>
        </div>
      )}
      {/* Top Navbar adhering to Top Bar Contract */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        candidaturasCount={
          candidaturas.filter((c) => !c.profileId || c.profileId === activeProfile.id).length
        }
        activeProfile={activeProfile}
        profilesCount={profiles.length}
        onQuickAction={handleTopQuickAction}
        onOpenPhotoEditor={() => setIsPhotoEditorOpen(true)}
        onOpenProfileSwitcher={() => setIsProfileSwitcherOpen(true)}
        onOpenStorageModal={() => setIsStorageModalOpen(true)}
      />

      {/* Floating Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-lg shadow-xl flex items-center gap-2.5 animate-in slide-in-from-bottom duration-200 border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'candidaturas' && (
          <CandidaturasView
            candidaturas={candidaturas}
            activeProfile={activeProfile}
            onUpdateCandidaturas={setCandidaturas}
            profiles={profiles}
          />
        )}

        {activeTab === 'cv-generator' && (
          <CVGeneratorView
            profile={profile}
            settings={settings}
            activeProfile={activeProfile}
            onUpdateProfile={handleUpdateProfile}
            onUpdateSettings={handleUpdateSettings}
            onResetToOriginal={handleResetToOriginal}
            onOpenPhotoEditor={() => setIsPhotoEditorOpen(true)}
            onOpenProfileSwitcher={() => setIsProfileSwitcherOpen(true)}
          />
        )}

        {activeTab === 'jobs' && (
          <JobsView
            offers={offers}
            candidaturas={candidaturas}
            activeProfile={activeProfile}
            onAddOfferToCandidaturas={handleAddOfferToCandidaturas}
            onAddNewCustomOffer={(newOff) => setOffers([newOff, ...offers])}
          />
        )}
      </main>

      {/* Global New Candidatura Modal */}
      <CandidaturaModal
        isOpen={isNewCandidaturaModalOpen}
        onClose={() => setIsNewCandidaturaModalOpen(false)}
        candidatura={null}
        activeProfile={activeProfile}
        profiles={profiles}
        onSave={(newCand) => {
          const withProfile: Candidatura = {
            ...newCand,
            id: newCand.id || `cand-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            profileId: newCand.profileId || activeProfile.id,
          };
          const exists = candidaturas.some((c) => c.id === withProfile.id);
          if (exists) {
            setCandidaturas((prev) =>
              prev.map((c) => (c.id === withProfile.id ? withProfile : c))
            );
          } else {
            setCandidaturas((prev) => [withProfile, ...prev]);
          }
          showNotification(`Candidatura independiente para "${newCand.company}" creada con éxito.`);
        }}
      />

      {/* Global Photo Editor Modal */}
      <PhotoEditorModal
        isOpen={isPhotoEditorOpen}
        onClose={() => setIsPhotoEditorOpen(false)}
        currentPhotoUrl={profile.personal.photoUrl}
        showPhoto={profile.personal.showPhoto}
        onSavePhoto={handleSavePhoto}
        onResetToOriginal={handleResetToOriginal}
      />

      {/* Global Profile Switcher & Creator Modal */}
      <ProfileSwitcherModal
        isOpen={isProfileSwitcherOpen}
        onClose={() => setIsProfileSwitcherOpen(false)}
        profiles={profiles}
        activeProfileId={activeProfileId}
        onSelectProfile={handleSelectProfile}
        onAddNewProfile={handleAddNewProfile}
        onDeleteProfile={handleDeleteProfile}
        onOpenStorageModal={() => setIsStorageModalOpen(true)}
      />

      {/* Global Storage & Backup Modal */}
      <StorageBackupModal
        isOpen={isStorageModalOpen}
        onClose={() => setIsStorageModalOpen(false)}
        profiles={profiles}
        candidaturas={candidaturas}
        offers={offers}
        activeProfileId={activeProfileId}
        onRestoreData={(restored) => {
          setProfiles(restored.profiles);
          setCandidaturas(restored.candidaturas);
          setOffers(restored.offers);
          setActiveProfileId(restored.activeProfileId);
          const active = restored.profiles.find((p) => p.id === restored.activeProfileId) || restored.profiles[0];
          if (active) {
            setProfile(active.cv);
            setSettings(active.designSettings);
          }
          showNotification('¡Datos restaurados con éxito desde la copia de seguridad!');
        }}
        onProfilesUpdated={(updated) => {
          setProfiles(updated);
          const active = updated.find((p) => p.id === activeProfileId) || updated[0];
          if (active) {
            setProfile(active.cv);
            setSettings(active.designSettings);
          }
          showNotification('¡Imágenes optimizadas y espacio liberado!');
        }}
      />
    </div>
  );
}
