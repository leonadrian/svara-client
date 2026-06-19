import { RecordingSessionStoredLocally } from './types/index';

const DB_NAME = 'SvaraLocalDB';
const DB_VERSION = 2; // Incremented for schema overhaul
const STORE_RECORDINGS = 'recordings';
const STORE_AUDIO = 'audio_blobs';

export function initDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_RECORDINGS)) {
        db.createObjectStore(STORE_RECORDINGS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_AUDIO)) {
        db.createObjectStore(STORE_AUDIO);
      }
    };
  });
}

export async function saveLocalRecording(metadata: RecordingSessionStoredLocally, audioBlob?: Blob): Promise<void> {
  const db = await initDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_RECORDINGS, STORE_AUDIO], 'readwrite');
    
    transaction.onerror = () => reject(transaction.error);
    transaction.oncomplete = () => resolve();

    const recStore = transaction.objectStore(STORE_RECORDINGS);
    recStore.put(metadata);

    if (audioBlob) {
      const audioStore = transaction.objectStore(STORE_AUDIO);
      audioStore.put(audioBlob, metadata.id);
    }
  });
}

export async function getLocalRecordings(): Promise<RecordingSessionStoredLocally[]> {
  const db = await initDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_RECORDINGS], 'readonly');
    const store = transaction.objectStore(STORE_RECORDINGS);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      // Sort newest local recordings first
      const sorted = (request.result || []).sort((a, b) => {
        const timeA = a.audioMetaData?.createdAt ? new Date(a.audioMetaData.createdAt).getTime() : 0;
        const timeB = b.audioMetaData?.createdAt ? new Date(b.audioMetaData.createdAt).getTime() : 0;
        return timeB - timeA;
      });
      resolve(sorted);
    };
  });
}

export async function getLocalRecordingAudio(id: string): Promise<Blob | null> {
  const db = await initDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_AUDIO], 'readonly');
    const store = transaction.objectStore(STORE_AUDIO);
    const request = store.get(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
}

export async function updateLocalRecording(id: string, updates: Partial<RecordingSessionStoredLocally>): Promise<RecordingSessionStoredLocally> {
  const db = await initDb();
  const recordings = await getLocalRecordings();
  const found = recordings.find(r => r.id === id);
  if (!found) {
    throw new Error(`Local recording with ID ${id} not found.`);
  }

  const updated = { ...found, ...updates };
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_RECORDINGS], 'readwrite');
    transaction.onerror = () => reject(transaction.error);
    transaction.oncomplete = () => resolve(updated);

    const store = transaction.objectStore(STORE_RECORDINGS);
    store.put(updated);
  });
}

export async function deleteLocalRecording(id: string): Promise<void> {
  const db = await initDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_RECORDINGS, STORE_AUDIO], 'readwrite');
    transaction.onerror = () => reject(transaction.error);
    transaction.oncomplete = () => resolve();

    transaction.objectStore(STORE_RECORDINGS).delete(id);
    transaction.objectStore(STORE_AUDIO).delete(id);
  });
}
