import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  type Auth,
} from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from 'firebase/firestore';
import { getFirebaseConfig } from '../config/firebase-config';

let firebaseApp: FirebaseApp | null | undefined;
let firebaseAuth: Auth | null | undefined;
let firebaseDb: Firestore | null | undefined;
let cacheMode: 'persistent' | 'memory' | 'unconfigured' | undefined;

export function getFirebaseApp() {
  if (firebaseApp !== undefined) {
    return firebaseApp;
  }

  const config = getFirebaseConfig();
  if (!config) {
    firebaseApp = null;
    cacheMode = 'unconfigured';
    return firebaseApp;
  }

  firebaseApp = initializeApp(config);
  return firebaseApp;
}

export function getFirebaseAuth() {
  if (firebaseAuth !== undefined) {
    return firebaseAuth;
  }

  const app = getFirebaseApp();
  firebaseAuth = app ? getAuth(app) : null;
  return firebaseAuth;
}

export function getFirebaseDb() {
  if (firebaseDb !== undefined) {
    return firebaseDb;
  }

  const app = getFirebaseApp();
  if (!app) {
    firebaseDb = null;
    cacheMode = 'unconfigured';
    return firebaseDb;
  }

  try {
    firebaseDb = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });
    cacheMode = 'persistent';
  } catch {
    firebaseDb = getFirestore(app);
    cacheMode = 'memory';
  }

  return firebaseDb;
}

export function getFirestoreCacheMode() {
  if (!cacheMode) {
    getFirebaseDb();
  }
  return cacheMode ?? 'unconfigured';
}
