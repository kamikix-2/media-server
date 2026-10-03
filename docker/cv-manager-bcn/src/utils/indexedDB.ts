/**
 * Zero-dependency IndexedDB Client
 * Provides gigabyte-scale, 100% free local storage in the user's browser.
 * Eliminates localStorage 5MB quota errors permanently.
 */

const DB_NAME = 'CVManagerBCN_DB';
const DB_VERSION = 1;
const STORE_NAME = 'app_keyval_store';

let dbPromise: Promise<IDBDatabase> | null = null;

export function isIndexedDBSupported(): boolean {
  return typeof window !== 'undefined' && 'indexedDB' in window && window.indexedDB !== null;
}

export function openDatabase(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    if (!isIndexedDBSupported()) {
      reject(new Error('IndexedDB is not supported in this browser.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onerror = (event) => {
      console.error('IndexedDB open error:', (event.target as IDBOpenDBRequest).error);
      reject((event.target as IDBOpenDBRequest).error);
    };
  });

  return dbPromise;
}

export async function idbGet<T>(key: string): Promise<T | undefined> {
  try {
    const db = await openDatabase();
    return new Promise<T | undefined>((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result as T | undefined);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (err) {
    console.warn(`IndexedDB get error for key "${key}":`, err);
    return undefined;
  }
}

export async function idbSet<T>(key: string, value: T): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(value, key);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (err) {
    console.error(`IndexedDB set error for key "${key}":`, err);
  }
}

export async function idbDelete(key: string): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error(`IndexedDB delete error for key "${key}":`, err);
  }
}

export async function idbClear(): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('IndexedDB clear error:', err);
  }
}

export interface StorageQuotaInfo {
  supported: boolean;
  usedMB: number;
  quotaMB: number;
  percentageUsed: number;
  engine: 'IndexedDB (Nativo Ilimitado)' | 'LocalStorage (5MB)';
}

/**
 * Returns the estimated storage usage and total quota provided by the browser
 */
export async function getStorageQuotaEstimate(): Promise<StorageQuotaInfo> {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      const usedBytes = estimate.usage || 0;
      const quotaBytes = estimate.quota || 1024 * 1024 * 1000; // fallback ~1GB
      const usedMB = Number((usedBytes / (1024 * 1024)).toFixed(2));
      const quotaMB = Number((quotaBytes / (1024 * 1024)).toFixed(2));
      const percentageUsed = quotaBytes > 0 ? Number(((usedBytes / quotaBytes) * 100).toFixed(2)) : 0;

      return {
        supported: true,
        usedMB,
        quotaMB,
        percentageUsed,
        engine: 'IndexedDB (Nativo Ilimitado)',
      };
    } catch {
      // Fallback
    }
  }

  // Fallback estimation using localStorage
  let totalLocalChars = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k) {
        totalLocalChars += k.length + (localStorage.getItem(k)?.length || 0);
      }
    }
  } catch {
    // ignore
  }

  const usedMB = Number(((totalLocalChars * 2) / (1024 * 1024)).toFixed(2));

  return {
    supported: isIndexedDBSupported(),
    usedMB,
    quotaMB: 5,
    percentageUsed: Number(((usedMB / 5) * 100).toFixed(1)),
    engine: isIndexedDBSupported() ? 'IndexedDB (Nativo Ilimitado)' : 'LocalStorage (5MB)',
  };
}
