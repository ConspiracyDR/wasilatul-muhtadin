import { doc, getDoc } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { getFirebaseDb } from './client';

export type AdminAuthorizationState =
  | { status: 'unconfigured'; active: false }
  | { status: 'checking'; active: false }
  | { status: 'authorized'; active: true }
  | { status: 'unauthorized'; active: false }
  | { status: 'error'; active: false; message: string };

export async function checkAdminAuthorization(
  user: User,
): Promise<AdminAuthorizationState> {
  const db = getFirebaseDb();
  if (!db) {
    return { status: 'unconfigured', active: false };
  }

  try {
    const snapshot = await getDoc(doc(db, 'admins', user.uid));
    if (snapshot.exists() && snapshot.data().active === true) {
      return { status: 'authorized', active: true };
    }

    return { status: 'unauthorized', active: false };
  } catch (error) {
    return {
      status: 'error',
      active: false,
      message: error instanceof Error ? error.message : 'Gagal memeriksa akses admin.',
    };
  }
}
