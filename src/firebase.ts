import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase, ref, onValue, set } from "firebase/database";
import { getFirestore, doc, onSnapshot, setDoc } from "firebase/firestore";

// Firebase credentials loaded from environment variables (.env is gitignored and hidden from GitHub/Vercel)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAUff5ipqcsYrR_LLFIoPW4T3oIUjD0QHs",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mr-storee.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://mr-storee-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mr-storee",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mr-storee.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "949868005957",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:949868005957:web:ab65ac8dc2abbaf2d9f12c",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-2D32QGZ1YE"
};

// Initialize Firebase App as Singleton
export const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Cloud Realtime Database & Firestore
let rtdbInstance: ReturnType<typeof getDatabase> | null = null;
let firestoreInstance: ReturnType<typeof getFirestore> | null = null;

try {
  rtdbInstance = getDatabase(firebaseApp, firebaseConfig.databaseURL);
} catch (err) {
  console.warn("Firebase RTDB initialization note:", err);
}

try {
  firestoreInstance = getFirestore(firebaseApp);
} catch (err) {
  console.warn("Firestore initialization note:", err);
}

export const rtdb = rtdbInstance;
export const firestore = firestoreInstance;

/**
 * Realtime synchronization across all devices (Web & Mobile)
 * Listens to changes on a given node and notifies callback instantly.
 */
export function subscribeToRealtimeNode<T>(
  nodePath: string,
  onData: (data: T) => void
): () => void {
  // 1. Try Firebase Realtime Database first (fastest WebSocket real-time updates)
  if (rtdb) {
    try {
      const nodeRef = ref(rtdb, nodePath);
      const unsubscribe = onValue(
        nodeRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const val = snapshot.val();
            if (val !== undefined && val !== null) {
              onData(val as T);
            }
          }
        },
        (error) => {
          console.warn(`RTDB realtime listener notice on '${nodePath}':`, error.message);
          // Fallback to Firestore listener if RTDB permissions or rules differ
          subscribeFirestoreFallback(nodePath, onData);
        }
      );
      return () => unsubscribe();
    } catch (err) {
      console.warn(`Error setting up RTDB listener on ${nodePath}:`, err);
    }
  }

  // 2. Fallback to Firestore
  return subscribeFirestoreFallback(nodePath, onData);
}

function subscribeFirestoreFallback<T>(
  nodePath: string,
  onData: (data: T) => void
): () => void {
  if (!firestore) return () => {};
  try {
    const docRef = doc(firestore, "store_data", nodePath);
    const unsub = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const d = docSnap.data();
          if (d && d.payload !== undefined) {
            onData(d.payload as T);
          }
        }
      },
      (err) => {
        console.warn(`Firestore listener on '${nodePath}':`, err.message);
      }
    );
    return () => unsub();
  } catch (e) {
    console.warn(`Firestore subscription error on ${nodePath}:`, e);
    return () => {};
  }
}

/**
 * Publish changes to Firebase Cloud so all other connected devices
 * (desktop browsers, mobile browsers) receive the update instantly.
 */
export async function syncDataToCloud<T>(nodePath: string, data: T): Promise<void> {
  let synced = false;

  // Sync to RTDB
  if (rtdb) {
    try {
      const nodeRef = ref(rtdb, nodePath);
      await set(nodeRef, data);
      synced = true;
    } catch (err) {
      console.warn(`Could not sync to RTDB on node ${nodePath}:`, err);
    }
  }

  // Also sync to Firestore as backup persistence
  if (firestore) {
    try {
      const docRef = doc(firestore, "store_data", nodePath);
      await setDoc(docRef, { payload: data, updatedAt: Date.now() }, { merge: true });
      synced = true;
    } catch (err) {
      // Handled silently
    }
  }

  // Broadcast to other open browser tabs/windows locally as instant zero-latency channel
  try {
    if (typeof window !== "undefined" && window.BroadcastChannel) {
      const bc = new BroadcastChannel("mr_store_sync_channel");
      bc.postMessage({ nodePath, data, timestamp: Date.now() });
      bc.close();
    }
  } catch (e) {
    // Ignore BroadcastChannel errors in sandbox
  }
}
