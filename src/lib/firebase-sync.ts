
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

// Hardcoded Firebase configuration to resolve initialization issues in the dev environment.
const firebaseConfig = {
  apiKey: "AIzaSyAhPT93VYqRHuuQMyOsuB2awR8qZQstimY",
  authDomain: "cinesync-uesa3.firebaseapp.com",
  databaseURL: "https://cinesync-uesa3.firebaseio.com",
  projectId: "cinesync-uesa3",
  storageBucket: "cinesync-uesa3.appspot.com",
  messagingSenderId: "942496756118",
  appId: "1:942496756118:web:b008a67be9e0d023de6db7"
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
    console.warn("Firebase config is missing. Real-time sync features will be disabled.");
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
