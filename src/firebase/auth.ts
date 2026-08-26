import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import { getFirebaseAuth } from './client';

export type AuthState =
  | { status: 'unconfigured'; user: null }
  | { status: 'loading'; user: null }
  | { status: 'signed-out'; user: null }
  | { status: 'signed-in'; user: User };

export function observeAuthState(onChange: (state: AuthState) => void) {
  const auth = getFirebaseAuth();
  if (!auth) {
    onChange({ status: 'unconfigured', user: null });
    return () => {};
  }

  onChange({ status: 'loading', user: null });
  return onAuthStateChanged(auth, (user) => {
    onChange(user ? { status: 'signed-in', user } : { status: 'signed-out', user: null });
  });
}

export async function signInAdmin(email: string, password: string) {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error('Firebase belum dikonfigurasi.');
  }

  await signInWithEmailAndPassword(auth, email, password);
}

export async function signOutAdmin() {
  const auth = getFirebaseAuth();
  if (!auth) {
    return;
  }

  await signOut(auth);
}
