import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import type {
  CategoryId,
  ReadingDocument,
  ReadingSection,
} from '../content/types';
import { getFirebaseDb } from './client';

export class PublicContentUnavailableError extends Error {
  constructor() {
    super('Firebase belum dikonfigurasi.');
  }
}

type PublishedReadingDoc = {
  id?: string;
  slug?: string;
  title?: string;
  category?: CategoryId;
  description?: string | null;
  sortOrder?: number | null;
  version?: number | null;
  publishedAt?: FirestoreTimestamp | string | null;
  updatedAt?: FirestoreTimestamp | string | null;
};

type PublishedBlockDoc = {
  id?: string;
  order?: number;
  title?: string | null;
  arabic?: string | null;
  latin?: string | null;
  translation?: string | null;
  repeat?: number[] | null;
  note?: string | null;
};

type FirestoreTimestamp = {
  toDate?: () => Date;
};

export async function listPublishedReadingSummaries(): Promise<ReadingDocument[] | null> {
  const db = getFirebaseDb();
  if (!db) {
    throw new PublicContentUnavailableError();
  }

  const snapshot = await getDocs(query(collection(db, 'readings'), orderBy('sortOrder')));
  return sortPublishedReadings(
    snapshot.docs.map((item) => mapReadingDoc(item.id, item.data() as PublishedReadingDoc, [])),
  );
}

export async function getPublishedReadingBySlug(
  slug: string,
): Promise<ReadingDocument | null> {
  const db = getFirebaseDb();
  if (!db) {
    throw new PublicContentUnavailableError();
  }

  const readingsSnapshot = await getDocs(
    query(collection(db, 'readings'), where('slug', '==', slug)),
  );
  const readingSnapshot = sortPublishedReadings(
    readingsSnapshot.docs.map((item) => mapReadingDoc(item.id, item.data() as PublishedReadingDoc, [])),
  )[0];

  if (!readingSnapshot) {
    return null;
  }

  const blocksSnapshot = await getDocs(
    query(collection(doc(db, 'readings', readingSnapshot.id), 'blocks'), orderBy('order')),
  );
  const sections = blocksSnapshot.docs
    .map((item) => {
      const data = item.data() as PublishedBlockDoc;
      return {
        order: data.order ?? Number.MAX_SAFE_INTEGER,
        section: mapBlockDoc(item.id, data),
      };
    })
    .sort((a, b) => a.order - b.order || a.section.id.localeCompare(b.section.id, 'id'))
    .map((item) => item.section);

  return {
    ...readingSnapshot,
    sections,
  };
}

export function filterPublishedReadingsByCategory(
  readings: ReadingDocument[],
  categoryId: CategoryId,
) {
  return readings.filter((item) => item.category === categoryId);
}

export function sortPublishedReadings(readings: ReadingDocument[]) {
  return [...readings].sort((a, b) => {
    const orderA = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
    return orderA - orderB || a.title.localeCompare(b.title, 'id') || a.id.localeCompare(b.id, 'id');
  });
}

function mapReadingDoc(
  id: string,
  data: PublishedReadingDoc,
  sections: ReadingSection[],
): ReadingDocument {
  return {
    id,
    slug: data.slug ?? id,
    title: data.title ?? 'Bacaan',
    category: data.category ?? 'ratib',
    description: data.description ?? null,
    sortOrder: data.sortOrder ?? null,
    version: data.version ?? 0,
    updatedAt: serializeTimestamp(data.updatedAt),
    publishedAt: serializeTimestamp(data.publishedAt),
    source_note: 'Firestore published content.',
    sections,
  };
}

function mapBlockDoc(id: string, data: PublishedBlockDoc): ReadingSection {
  return {
    id,
    title: data.title ?? null,
    arabic: data.arabic ?? '',
    latin: data.latin ?? null,
    translation: data.translation ?? null,
    repeat: data.repeat ?? null,
    note: data.note ?? null,
    review_status: 'approved',
  };
}

function serializeTimestamp(value: PublishedReadingDoc['publishedAt']) {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (typeof value.toDate === 'function') return value.toDate().toISOString();
  return null;
}
