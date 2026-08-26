import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import type {
  DraftBlock,
  DraftReading,
  DraftReadingSummary,
} from '../features/admin-content/admin-content-model';
import { getFirebaseDb } from './client';

type DraftReadingDoc = Omit<DraftReading, 'blocks' | 'updatedAt'> & {
  updatedAt?: { toDate?: () => Date } | string | null;
  blockCount?: number;
};

export async function listDraftReadings(): Promise<DraftReadingSummary[]> {
  const db = getFirebaseDb();
  if (!db) {
    return [];
  }

  const snapshot = await getDocs(query(collection(db, 'readingDrafts'), orderBy('sortOrder')));
  return snapshot.docs.map((item) => {
    const data = item.data() as DraftReadingDoc;
    return {
      id: item.id,
      title: data.title ?? '',
      slug: data.slug ?? item.id,
      category: data.category ?? 'ratib',
      sortOrder: data.sortOrder ?? 100,
      updatedAt: serializeTimestamp(data.updatedAt),
      blockCount: data.blockCount ?? 0,
    };
  });
}

export async function getDraftReading(readingId: string): Promise<DraftReading | null> {
  const db = getFirebaseDb();
  if (!db) {
    return null;
  }

  const readingSnapshot = await getDoc(doc(db, 'readingDrafts', readingId));
  if (!readingSnapshot.exists()) {
    return null;
  }

  const blocksSnapshot = await getDocs(
    query(collection(db, 'readingDrafts', readingId, 'blocks'), orderBy('order')),
  );
  const data = readingSnapshot.data() as DraftReadingDoc;

  return {
    id: readingSnapshot.id,
    title: data.title ?? '',
    slug: data.slug ?? '',
    category: data.category ?? 'ratib',
    description: data.description ?? '',
    sortOrder: data.sortOrder ?? 100,
    updatedAt: serializeTimestamp(data.updatedAt),
    blocks: blocksSnapshot.docs.map((block): DraftBlock => {
      const blockData = block.data() as DraftBlock;
      return {
        id: block.id,
        order: blockData.order,
        title: blockData.title ?? null,
        arabic: blockData.arabic ?? '',
        latin: blockData.latin ?? '',
        translation: blockData.translation ?? '',
        repeat: blockData.repeat ?? null,
        note: blockData.note ?? '',
      };
    }),
  };
}

export async function saveDraftReading(draft: DraftReading) {
  const db = getFirebaseDb();
  if (!db) {
    throw new Error('Firebase belum dikonfigurasi.');
  }

  const batch = writeBatch(db);
  const readingRef = doc(db, 'readingDrafts', draft.id);
  const existingBlocks = await getDocs(collection(readingRef, 'blocks'));
  const nextBlockIds = new Set(draft.blocks.map((block) => block.id));

  batch.set(readingRef, {
    id: draft.id,
    title: draft.title,
    slug: draft.slug,
    category: draft.category,
    description: draft.description,
    sortOrder: draft.sortOrder,
    blockCount: draft.blocks.length,
    updatedAt: serverTimestamp(),
  });

  draft.blocks.forEach((block) => {
    batch.set(doc(readingRef, 'blocks', block.id), {
      id: block.id,
      order: block.order,
      title: block.title ?? null,
      arabic: block.arabic,
      latin: block.latin,
      translation: block.translation,
      repeat: block.repeat,
      note: block.note,
    });
  });

  existingBlocks.docs.forEach((block) => {
    if (!nextBlockIds.has(block.id)) {
      batch.delete(block.ref);
    }
  });

  await batch.commit();
}

function serializeTimestamp(value: DraftReadingDoc['updatedAt']) {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (typeof value.toDate === 'function') return value.toDate().toISOString();
  return null;
}
