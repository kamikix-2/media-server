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
  loadProfilesFromIndexedDB,
  saveStoredProfiles,
  loadActiveProfileId,
  saveActiveProfileId,
  loadStoredCandidaturas,
  loadCandidaturasFromIndexedDB,
  saveStoredCandidaturas,
  loadStoredOffers,
  loadOffersFromIndexedDB,
  saveStoredOffers,
} from './utils/storage';
import {
  defaultCVProfile,
  defaultDesignSettings,
  noemiCVProfile,
  noemiDesignSettings,
} from './data/initialData';
import { Candidatura, CVProfile, CVDesignSettings, JobOffer, UserProfileAccount } from './types';
import { CheckCircle2, Sparkles } from 'lucide-react';

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

  // Modals state
  const [isNewCandidaturaModalOpen, setIsNewCandidaturaModalOpen] = useState(false);
  const [isPhotoEditorOpen, setIsPhotoEditorOpen] = useState(false);
  const [isProfileSwitcherOpen, setIsProfileSwitcherOpen] = useState(false);
  const [isStorageModalOpen, setIsStorageModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Background IndexedDB sync: ensures gigabyte-scale storage without 5MB quota errors
  useEffect(() => {
    async function syncFromIndexedDB() {
      try {
        const [dbProfiles, dbCandidaturas, dbOffers] = await Promise.all([
          loadProfilesFromIndexedDB(),
          loadCandidaturasFromIndexedDB(),
          loadOffersFromIndexedDB(),
        ]);
        if (dbProfiles && dbProfiles.length > 0) {
          setProfiles(dbProfiles);
        }
        if (dbCandidaturas && dbCandidaturas.length > 0) {
          setCandidaturas(dbCandidaturas);
        }
        if (dbOffers && dbOffers.length > 0) {
          setOffers(dbOffers);
        }
      } catch (err) {
        console.warn('Notice syncing with IndexedDB on mount:', err);
      }
    }
    syncFromIndexedDB();
  }, []);

  // When activeProfileId changes, sync the working CV and settings
  useEffect(() => {
    const found = profiles.find((p) => p.id === activeProfileId) || profiles[0];
    if (found) {
      setProfile(found.cv);
      setSettings(found.designSettings);
    }
  }, [activeProfileId]);

  // Persist profiles whenever profiles state updates
  useEffect(() => {
    saveStoredProfiles(profiles);
  }, [profiles]);

  useEffect(() => {
    saveActiveProfileId(activeProfileId);
  }, [activeProfileId]);

  useEffect(() => {
    saveStoredCandidaturas(candidaturas);
  }, [candidaturas]);

  useEffect(() => {
    saveStoredOffers(offers);
  }, [offers]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
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

      {/* Global Storage & Backup Modal (100% Free, IndexedDB & JSON backup) */}
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
