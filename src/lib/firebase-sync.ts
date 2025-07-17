
import { initializeApp, getApp, type FirebaseApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, type Database } from 'firebase/database';

export interface PlayerState {
    isPlaying: boolean;
    isMuted: boolean;
    isFullscreen: boolean;
    videoSrc: string | null;
    stream: MediaStream | null; // This cannot be synced over RTDB
    duration: number;
    currentTime: number;
    videoTitle: string;
}

let firebaseApp: FirebaseApp | null = null;
let database: Database | null = null;
let partyRef: any;

// Firebase configuration is read from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Only initialize Firebase if the necessary config is provided
if (firebaseConfig.projectId && firebaseConfig.databaseURL) {
    try {
      firebaseApp = getApp();
    } catch (e) {
      firebaseApp = initializeApp(firebaseConfig);
    }
    
    if(firebaseApp) {
        database = getDatabase(firebaseApp);
    }
} else {
    console.warn("Firebase config is missing. Real-time sync features will be disabled. Please update your environment variables.");
}


export const initializeSync = (partyId: string) => {
  if (!database) return;
  partyRef = ref(database, `parties/${partyId}`);
};

export const syncState = (state: PlayerState) => {
  if (!partyRef || !database) return;
  // We don't sync the stream object as it's not serializable
  const { stream, ...syncableState } = state;
  
  // Firebase doesn't allow 'undefined' values. Convert to 'null'.
  if (syncableState.videoSrc === undefined) {
    syncableState.videoSrc = null;
  }

  set(partyRef, syncableState);
};

export const onStateChange = (callback: (state: PlayerState) => void) => {
  if (!partyRef || !database) return () => {};
  
  const unsubscribe = onValue(partyRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      callback(data);
    }
  });

  return unsubscribe;
};
