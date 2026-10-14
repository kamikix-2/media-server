import { CVProfile, Candidatura, JobOffer, CVDesignSettings, UserProfileAccount } from '../types';
import {
  defaultCVProfile,
  defaultDesignSettings,
  initialCandidaturas,
  noemiCandidaturas,
  initialJobOffers,
  initialProfiles,
} from '../data/initialData';
import { idbClear, idbDeleteDatabase, idbGet, isIndexedDBSupported } from './indexedDB';
import { optimizeImage } from './imageOptimizer';
import type { AppState } from './api';

export const PROFILES_STORAGE_KEY = 'cv_manager_profiles_v3';
export const ACTIVE_PROFILE_ID_KEY = 'cv_manager_active_profile_id_v3';
export const CANDIDATURAS_STORAGE_KEY = 'cv_manager_candidaturas_v3';
export const OFFERS_STORAGE_KEY = 'cv_manager_offers_v3';
const LEGACY_MIGRATION_KEY = 'cv_manager_postgres_migrated_v1';

export interface LegacyAppState {
  state: AppState;
  hasBrowserData: boolean;
}

// Remove obsolete keys from previous browser-storage versions.
export function cleanObsoleteStorage(): void {
  try {
    const obsoleteKeys = [
      'cv_manager_profiles_v2',
      'cv_manager_candidaturas_v2',
      'cv_manager_offers_v2',
      'cv_manager_active_profile_id_v2',
      'cv_manager_profiles_v1',
      'cv_manager_candidaturas_v1',
    ];
    obsoleteKeys.forEach((key) => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
      }
    });
  } catch (e) {
    console.warn('Could not clean obsolete localStorage keys:', e);
  }
}

// Run cleanup immediately on script load
cleanObsoleteStorage();

/**
 * Reads old browser data only as a fallback for the PostgreSQL migration.
 */
export function loadStoredProfiles(): UserProfileAccount[] {
  try {
    const data = localStorage.getItem(PROFILES_STORAGE_KEY);
    if (data) {
      const parsed: UserProfileAccount[] = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const map = new Map<string, UserProfileAccount>();
        initialProfiles.forEach((p) => map.set(p.id, p));
        parsed.forEach((p) => {
          map.set(p.id, p);
        });
        return Array.from(map.values());
      }
    }
  } catch (e) {
    console.warn('Notice loading stored profiles from localStorage:', e);
  }
  return initialProfiles;
}

/** Reads profile data written by the old browser database for migration. */
export async function loadProfilesFromIndexedDB(): Promise<UserProfileAccount[] | null> {
  try {
    if (!isIndexedDBSupported()) return null;
    const dbProfiles = await idbGet<UserProfileAccount[]>(PROFILES_STORAGE_KEY);
    if (dbProfiles && Array.isArray(dbProfiles) && dbProfiles.length > 0) {
      const map = new Map<string, UserProfileAccount>();
      initialProfiles.forEach((p) => map.set(p.id, p));
      dbProfiles.forEach((p) => map.set(p.id, p));
      return Array.from(map.values());
    }
  } catch (err) {
    console.warn('Error reading profiles from IndexedDB:', err);
  }
  return null;
}

export function loadActiveProfileId(): string {
  try {
    const id = localStorage.getItem(ACTIVE_PROFILE_ID_KEY);
    if (id) {
      return id;
    }
  } catch (e) {
    console.warn('Notice loading active profile ID:', e);
  }
  return 'profile-david';
}

/**
 * Ensures all candidaturas have strictly unique IDs and complete objects.
 * Prevents any accidental record overwriting.
 */
export function sanitizeCandidaturas(cands: Candidatura[]): Candidatura[] {
  if (!Array.isArray(cands)) return [];
  const seenIds = new Set<string>();
  return cands.map((c, idx) => {
    let id = c.id;
    // If id is missing, invalid, or already encountered, generate a brand-new unique ID
    if (!id || seenIds.has(id)) {
      id = `cand-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`;
    }
    seenIds.add(id);

    return {
      ...c,
      id,
      profileId: c.profileId || 'profile-david',
      company: c.company || 'Empresa Confidencial',
      role: c.role || 'Puesto Sin Definir',
      location: c.location || 'Barcelona',
      modality: c.modality || 'hibrido',
      portalSource: c.portalSource || 'infojobs',
      applicationDate: c.applicationDate || new Date().toISOString().split('T')[0],
      status: c.status || 'enviada',
      contactPerson: c.contactPerson || {
        name: '',
        role: '',
        email: '',
        phone: '',
      },
      salaryRange: c.salaryRange || '',
      contractModality: c.contractModality || 'indiferente',
      generalNotes: c.generalNotes || '',
      interviews: Array.isArray(c.interviews) ? c.interviews : [],
      tags: Array.isArray(c.tags) ? c.tags : [],
    };
  });
}

export function loadStoredCandidaturas(): Candidatura[] {
  try {
    const data = localStorage.getItem(CANDIDATURAS_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return sanitizeCandidaturas(parsed);
      }
    }
  } catch (e) {
    console.warn('Notice loading stored candidaturas:', e);
  }
  const davidCands = initialCandidaturas.map((c) => ({ ...c, profileId: 'profile-david' }));
  return sanitizeCandidaturas([...davidCands, ...noemiCandidaturas]);
}

export async function loadCandidaturasFromIndexedDB(): Promise<Candidatura[] | null> {
  try {
    if (!isIndexedDBSupported()) return null;
    const dbCands = await idbGet<Candidatura[]>(CANDIDATURAS_STORAGE_KEY);
    if (dbCands && Array.isArray(dbCands) && dbCands.length > 0) {
      return sanitizeCandidaturas(dbCands);
    }
  } catch (err) {
    console.warn('Error reading candidaturas from IndexedDB:', err);
  }
  return null;
}

export function loadStoredOffers(): JobOffer[] {
  try {
    const data = localStorage.getItem(OFFERS_STORAGE_KEY);
    if (data) {
      const parsed: JobOffer[] = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const map = new Map<string, JobOffer>();
        initialJobOffers.forEach((job) => map.set(job.id, job));
        parsed.forEach((job) => {
          const initial = map.get(job.id);
          if (initial) {
            map.set(job.id, { ...initial, ...job, targetCategory: initial.targetCategory || job.targetCategory });
          } else {
            map.set(job.id, job);
          }
        });
        return Array.from(map.values());
      }
    }
  } catch (e) {
    console.warn('Notice loading stored job offers:', e);
  }
  return initialJobOffers;
}

export async function loadOffersFromIndexedDB(): Promise<JobOffer[] | null> {
  try {
    if (!isIndexedDBSupported()) return null;
    const dbOffers = await idbGet<JobOffer[]>(OFFERS_STORAGE_KEY);
    if (dbOffers && Array.isArray(dbOffers) && dbOffers.length > 0) {
      const map = new Map<string, JobOffer>();
      initialJobOffers.forEach((job) => map.set(job.id, job));
      dbOffers.forEach((job) => {
        const initial = map.get(job.id);
        if (initial) {
          map.set(job.id, { ...initial, ...job, targetCategory: initial.targetCategory || job.targetCategory });
        } else {
          map.set(job.id, job);
        }
      });
      return Array.from(map.values());
    }
  } catch (err) {
    console.warn('Error reading offers from IndexedDB:', err);
  }
  return null;
}

export async function loadLegacyAppState(): Promise<LegacyAppState> {
  const localState: AppState = {
    profiles: loadStoredProfiles(),
    activeProfileId: loadActiveProfileId(),
    candidaturas: loadStoredCandidaturas(),
    offers: loadStoredOffers(),
  };

  if (localStorage.getItem(LEGACY_MIGRATION_KEY) === '1') {
    return { state: localState, hasBrowserData: false };
  }

  const hasLocalData = [
    PROFILES_STORAGE_KEY,
    ACTIVE_PROFILE_ID_KEY,
    CANDIDATURAS_STORAGE_KEY,
    OFFERS_STORAGE_KEY,
  ].some((key) => localStorage.getItem(key) !== null);

  const [profiles, candidaturas, offers, activeProfileId] = await Promise.all([
    loadProfilesFromIndexedDB(),
    loadCandidaturasFromIndexedDB(),
    loadOffersFromIndexedDB(),
    idbGet<string>(ACTIVE_PROFILE_ID_KEY),
  ]);

  return {
    state: {
      profiles: profiles?.length ? profiles : localState.profiles,
      activeProfileId: activeProfileId || localState.activeProfileId,
      candidaturas: candidaturas?.length ? candidaturas : localState.candidaturas,
      offers: offers?.length ? offers : localState.offers,
    },
    hasBrowserData: hasLocalData || Boolean(
      profiles?.length || candidaturas?.length || offers?.length || activeProfileId
    ),
  };
}

export function mergeLegacyAppState(current: AppState, legacy: AppState): AppState {
  const mergeById = <T extends { id: string }>(primary: T[], secondary: T[]): T[] => {
    const records = new Map(primary.map((record) => [record.id, record]));
    secondary.forEach((record) => {
      if (!records.has(record.id)) records.set(record.id, record);
    });
    return Array.from(records.values());
  };

  return {
    profiles: mergeById(current.profiles, legacy.profiles),
    activeProfileId: current.activeProfileId,
    candidaturas: mergeById(current.candidaturas, legacy.candidaturas),
    offers: mergeById(current.offers, legacy.offers),
  };
}

export async function clearLegacyStorage(): Promise<void> {
  try {
    await idbClear();
    await idbDeleteDatabase();
  } catch (error) {
    console.warn('Could not remove legacy IndexedDB data:', error);
  }

  [
    PROFILES_STORAGE_KEY,
    ACTIVE_PROFILE_ID_KEY,
    CANDIDATURAS_STORAGE_KEY,
    OFFERS_STORAGE_KEY,
  ].forEach((key) => localStorage.removeItem(key));
  localStorage.setItem(LEGACY_MIGRATION_KEY, '1');
}

/**
 * Full Database Backup Export (100% Free, saves as a JSON file to your device)
 */
export function exportFullDatabaseJSON(
  profiles: UserProfileAccount[],
  candidaturas: Candidatura[],
  offers: JobOffer[],
  activeProfileId: string
): void {
  const exportPayload = {
    app: 'CVManagerBCN',
    version: '3.0.0',
    exportedAt: new Date().toISOString(),
    activeProfileId,
    profiles,
    candidaturas,
    offers,
  };

  const jsonString = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const dateStr = new Date().toISOString().slice(0, 10);

  const a = document.createElement('a');
  a.href = url;
  a.download = `cv_manager_backup_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Optimizes all profile images retroactively, freeing up massive amounts of storage space.
 */
export async function optimizeAllProfileImages(
  profiles: UserProfileAccount[]
): Promise<{ updatedProfiles: UserProfileAccount[]; savedKB: number }> {
  let initialTotalChars = JSON.stringify(profiles).length;

  const updatedProfiles: UserProfileAccount[] = await Promise.all(
    profiles.map(async (profile) => {
      let avatar = profile.avatarUrl;
      let cvPhoto = profile.cv.personal.photoUrl;

      if (avatar && avatar.startsWith('data:image/') && avatar.length > 50000) {
        avatar = await optimizeImage(avatar, 350, 350, 0.82);
      }

      if (cvPhoto && cvPhoto.startsWith('data:image/') && cvPhoto.length > 50000) {
        cvPhoto = await optimizeImage(cvPhoto, 350, 350, 0.82);
      }

      return {
        ...profile,
        avatarUrl: avatar,
        cv: {
          ...profile.cv,
          personal: {
            ...profile.cv.personal,
            photoUrl: cvPhoto,
          },
        },
      };
    })
  );

  let finalTotalChars = JSON.stringify(updatedProfiles).length;
  let savedKB = Math.max(0, Math.round(((initialTotalChars - finalTotalChars) * 2) / 1024));

  return { updatedProfiles, savedKB };
}
