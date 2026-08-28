import { AudioTrack, Playlist, TrackAnnotation, AudioSlice } from '../types';

const DB_NAME = 'AudioVisualizerStudioDB';
const DB_VERSION = 1;

const STORES = {
  TRACKS: 'tracks',
  AUDIO_BLOBS: 'audio_blobs',
  PLAYLISTS: 'playlists',
  ANNOTATIONS: 'annotations',
  SLICES: 'slices',
};

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORES.TRACKS)) {
        db.createObjectStore(STORES.TRACKS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.AUDIO_BLOBS)) {
        db.createObjectStore(STORES.AUDIO_BLOBS);
      }
      if (!db.objectStoreNames.contains(STORES.PLAYLISTS)) {
        db.createObjectStore(STORES.PLAYLISTS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.ANNOTATIONS)) {
        const store = db.createObjectStore(STORES.ANNOTATIONS, { keyPath: 'id' });
        store.createIndex('trackId', 'trackId', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORES.SLICES)) {
        db.createObjectStore(STORES.SLICES, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveTrack(track: AudioTrack, audioBlob?: Blob): Promise<void> {
  const db = await openDB();
  const tx = db.transaction([STORES.TRACKS, STORES.AUDIO_BLOBS], 'readwrite');
  
  // Track meta without raw blob in the metadata store
  const { blob, url, ...trackMeta } = track;
  tx.objectStore(STORES.TRACKS).put(trackMeta);

  if (audioBlob || blob) {
    tx.objectStore(STORES.AUDIO_BLOBS).put(audioBlob || blob, track.id);
  }

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getTrackBlob(trackId: string): Promise<Blob | null> {
  const db = await openDB();
  const tx = db.transaction(STORES.AUDIO_BLOBS, 'readonly');
  const req = tx.objectStore(STORES.AUDIO_BLOBS).get(trackId);

  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

export async function getAllTracks(): Promise<AudioTrack[]> {
  const db = await openDB();
  const tx = db.transaction([STORES.TRACKS, STORES.AUDIO_BLOBS], 'readonly');
  const tracksReq = tx.objectStore(STORES.TRACKS).getAll();

  return new Promise((resolve, reject) => {
    tracksReq.onsuccess = async () => {
      const tracks: AudioTrack[] = tracksReq.result || [];
      // Resolve blobs if available
      for (const t of tracks) {
        try {
          const blobReq = tx.objectStore(STORES.AUDIO_BLOBS).get(t.id);
          blobReq.onsuccess = () => {
            if (blobReq.result) {
              t.blob = blobReq.result;
              t.url = URL.createObjectURL(blobReq.result);
            }
          };
        } catch {
          // ignore
        }
      }
      resolve(tracks);
    };
    tracksReq.onerror = () => reject(tracksReq.error);
  });
}

export async function deleteTrack(trackId: string): Promise<void> {
  const db = await openDB();
  const tx = db.transaction([STORES.TRACKS, STORES.AUDIO_BLOBS, STORES.ANNOTATIONS], 'readwrite');
  tx.objectStore(STORES.TRACKS).delete(trackId);
  tx.objectStore(STORES.AUDIO_BLOBS).delete(trackId);

  // also delete annotations
  const annotStore = tx.objectStore(STORES.ANNOTATIONS);
  const index = annotStore.index('trackId');
  const req = index.getAllKeys(trackId);
  req.onsuccess = () => {
    const keys = req.result;
    for (const key of keys) {
      annotStore.delete(key);
    }
  };

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function savePlaylists(playlists: Playlist[]): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORES.PLAYLISTS, 'readwrite');
  const store = tx.objectStore(STORES.PLAYLISTS);
  for (const pl of playlists) {
    store.put(pl);
  }
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllPlaylists(): Promise<Playlist[]> {
  const db = await openDB();
  const tx = db.transaction(STORES.PLAYLISTS, 'readonly');
  const req = tx.objectStore(STORES.PLAYLISTS).getAll();
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function deletePlaylist(playlistId: string): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORES.PLAYLISTS, 'readwrite');
  tx.objectStore(STORES.PLAYLISTS).delete(playlistId);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function saveAnnotation(annotation: TrackAnnotation): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORES.ANNOTATIONS, 'readwrite');
  tx.objectStore(STORES.ANNOTATIONS).put(annotation);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAnnotationsForTrack(trackId: string): Promise<TrackAnnotation[]> {
  const db = await openDB();
  const tx = db.transaction(STORES.ANNOTATIONS, 'readonly');
  const index = tx.objectStore(STORES.ANNOTATIONS).index('trackId');
  const req = index.getAll(trackId);
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteAnnotation(annotationId: string): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORES.ANNOTATIONS, 'readwrite');
  tx.objectStore(STORES.ANNOTATIONS).delete(annotationId);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function saveAudioSlice(slice: AudioSlice): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORES.SLICES, 'readwrite');
  tx.objectStore(STORES.SLICES).put(slice);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllAudioSlices(): Promise<AudioSlice[]> {
  const db = await openDB();
  const tx = db.transaction(STORES.SLICES, 'readonly');
  const req = tx.objectStore(STORES.SLICES).getAll();
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}
