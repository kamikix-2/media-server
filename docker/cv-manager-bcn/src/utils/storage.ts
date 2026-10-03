import { CVProfile, Candidatura, JobOffer, CVDesignSettings, UserProfileAccount } from '../types';
import {
  defaultCVProfile,
  defaultDesignSettings,
  initialCandidaturas,
  noemiCandidaturas,
  initialJobOffers,
  initialProfiles,
} from '../data/initialData';
import { idbGet, idbSet, isIndexedDBSupported } from './indexedDB';
import { optimizeImage } from './imageOptimizer';

export const PROFILES_STORAGE_KEY = 'cv_manager_profiles_v3';
export const ACTIVE_PROFILE_ID_KEY = 'cv_manager_active_profile_id_v3';
export const CANDIDATURAS_STORAGE_KEY = 'cv_manager_candidaturas_v3';
export const OFFERS_STORAGE_KEY = 'cv_manager_offers_v3';

// Remove legacy v2 keys to immediately recover up to 5MB of browser space
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
 * Synchronous initial load of Profiles from localStorage with fallback to initialProfiles.
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

/**
 * Asynchronously checks IndexedDB for the most up-to-date and complete profiles.
 * IndexedDB has gigabytes of storage and avoids the 5MB localStorage quota limit.
 */
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

/**
 * Saves profiles into both IndexedDB (unlimited, 100% free) and localStorage cache.
 * If localStorage hits the 5MB browser quota, IndexedDB guarantees no data is lost.
 */
export function saveStoredProfiles(profiles: UserProfileAccount[]): void {
  // 1. Primary permanent store: IndexedDB (Unlimited, 0€, native)
  idbSet(PROFILES_STORAGE_KEY, profiles).catch((err) => {
    console.warn('IndexedDB write warning:', err);
  });

  // 2. Fast synchronous cache: LocalStorage
  try {
    localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles));
  } catch (e) {
    console.warn(
      'LocalStorage 5MB quota reached. Data is safely preserved in IndexedDB database without quota limits.',
      e
    );
    // Attempt emergency cleanup of old keys to see if cache can be saved
    cleanObsoleteStorage();
    try {
      // Create a lightweight cache version where huge base64 strings (>100KB) are truncated or replaced
      const lightweight = profiles.map((p) => ({
        ...p,
        avatarUrl: p.avatarUrl?.startsWith('data:image/') && p.avatarUrl.length > 100000
          ? '' // Strip huge raw base64 from localStorage cache (retained in IndexedDB)
          : p.avatarUrl,
        cv: {
          ...p.cv,
          personal: {
            ...p.cv.personal,
            photoUrl: p.cv.personal.photoUrl?.startsWith('data:image/') && p.cv.personal.photoUrl.length > 100000
              ? ''
              : p.cv.personal.photoUrl,
          },
        },
      }));
      localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(lightweight));
    } catch {
      // If even lightweight fails, IndexedDB already holds the full data
    }
  }
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

export function saveActiveProfileId(id: string): void {
  idbSet(ACTIVE_PROFILE_ID_KEY, id).catch(() => {});
  try {
    localStorage.setItem(ACTIVE_PROFILE_ID_KEY, id);
  } catch (e) {
    console.warn('Notice saving active profile ID:', e);
  }
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

export function saveStoredCandidaturas(candidaturas: Candidatura[]): void {
  const sanitized = sanitizeCandidaturas(candidaturas);
  idbSet(CANDIDATURAS_STORAGE_KEY, sanitized).catch(() => {});
  try {
    localStorage.setItem(CANDIDATURAS_STORAGE_KEY, JSON.stringify(sanitized));
  } catch (e) {
    console.warn('LocalStorage quota on candidaturas, safely preserved in IndexedDB.', e);
  }
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

export function saveStoredOffers(offers: JobOffer[]): void {
  idbSet(OFFERS_STORAGE_KEY, offers).catch(() => {});
  try {
    localStorage.setItem(OFFERS_STORAGE_KEY, JSON.stringify(offers));
  } catch (e) {
    console.warn('LocalStorage quota on offers, safely preserved in IndexedDB.', e);
  }
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
