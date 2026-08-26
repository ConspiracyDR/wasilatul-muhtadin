import { collection, doc } from 'firebase/firestore';
import { getFirebaseDb } from './client';

export function getPublishedReadingsCollection() {
  const db = getFirebaseDb();
  return db ? collection(db, 'readings') : null;
}

export function getPublishedReadingBlocksCollection(readingId: string) {
  const db = getFirebaseDb();
  return db ? collection(doc(db, 'readings', readingId), 'blocks') : null;
}

export function getDraftsCollection() {
  const db = getFirebaseDb();
  return db ? collection(db, 'readingDrafts') : null;
}
