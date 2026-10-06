/**
 * IndexedDB persistent storage tier for Football Career save slots.
 * Provides high-capacity (hundreds of MBs) storage that survives LocalStorage quota exhaustion
 * on mobile browsers (iOS Safari, Android Chrome, WebViews).
 */

import { UniqueCareerSaveState } from './careerSaveSystem';

const DB_NAME = 'footballer_career_idb_v1';
const DB_VERSION = 1;
const STORE_NAME = 'career_save_slots';

let dbPromise: Promise<IDBDatabase | null> | null = null;

function getIndexedDB(): IDBFactory | null {
  try {
    if (typeof window !== 'undefined' && 'indexedDB' in window && window.indexedDB) {
      return window.indexedDB;
    }
  } catch {
    return null;
  }
  return null;
}

function openDatabase(): Promise<IDBDatabase | null> {
  if (dbPromise) return dbPromise;

  const idb = getIndexedDB();
  if (!idb) {
    dbPromise = Promise.resolve(null);
    return dbPromise;
  }

  dbPromise = new Promise((resolve) => {
    try {
      const request = idb.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        try {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'slotId' });
          }
        } catch (e) {
          console.warn('[IndexedDB] Upgrade error:', e);
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = (e) => {
        console.warn('[IndexedDB] Open error:', e);
        resolve(null);
      };

      request.onblocked = () => {
        console.warn('[IndexedDB] Open blocked');
        resolve(null);
      };
    } catch (err) {
      console.warn('[IndexedDB] Initialization exception:', err);
      resolve(null);
    }
  });

  return dbPromise;
}

/**
 * Persists a career save slot state into IndexedDB.
 */
export async function saveSlotToIDB(
  slotId: number,
  saveState: UniqueCareerSaveState
): Promise<boolean> {
  try {
    const db = await openDatabase();
    if (!db) return false;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const record = {
          slotId,
          save: saveState,
          updatedAt: new Date().toISOString(),
        };
        const req = store.put(record);

        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
        tx.onerror = () => resolve(false);
      } catch (err) {
        console.warn(`[IndexedDB] Failed to save slot ${slotId}:`, err);
        resolve(false);
      }
    });
  } catch (err) {
    console.warn(`[IndexedDB] Save exception for slot ${slotId}:`, err);
    return false;
  }
}

/**
 * Loads a career save slot from IndexedDB.
 */
export async function loadSlotFromIDB(
  slotId: number
): Promise<UniqueCareerSaveState | null> {
  try {
    const db = await openDatabase();
    if (!db) return null;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(slotId);

        req.onsuccess = () => {
          if (req.result && req.result.save) {
            resolve(req.result.save as UniqueCareerSaveState);
          } else {
            resolve(null);
          }
        };

        req.onerror = () => resolve(null);
        tx.onerror = () => resolve(null);
      } catch (err) {
        console.warn(`[IndexedDB] Failed to load slot ${slotId}:`, err);
        resolve(null);
      }
    });
  } catch (err) {
    console.warn(`[IndexedDB] Load exception for slot ${slotId}:`, err);
    return null;
  }
}

/**
 * Deletes a save slot from IndexedDB.
 */
export async function deleteSlotFromIDB(slotId: number): Promise<boolean> {
  try {
    const db = await openDatabase();
    if (!db) return false;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(slotId);

        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
        tx.onerror = () => resolve(false);
      } catch (err) {
        console.warn(`[IndexedDB] Failed to delete slot ${slotId}:`, err);
        resolve(false);
      }
    });
  } catch (err) {
    console.warn(`[IndexedDB] Delete exception for slot ${slotId}:`, err);
    return false;
  }
}

/**
 * Retrieves all saved slots currently in IndexedDB.
 */
export async function getAllSlotsFromIDB(): Promise<Map<number, UniqueCareerSaveState>> {
  const result = new Map<number, UniqueCareerSaveState>();
  try {
    const db = await openDatabase();
    if (!db) return result;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();

        req.onsuccess = () => {
          if (Array.isArray(req.result)) {
            req.result.forEach((item) => {
              if (item && item.slotId && item.save) {
                result.set(item.slotId, item.save);
              }
            });
          }
          resolve(result);
        };

        req.onerror = () => resolve(result);
        tx.onerror = () => resolve(result);
      } catch (err) {
        console.warn('[IndexedDB] Failed to get all slots:', err);
        resolve(result);
      }
    });
  } catch (err) {
    console.warn('[IndexedDB] GetAll exception:', err);
    return result;
  }
}
