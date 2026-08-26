import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import type {
  DraftBlock,
  DraftReading,
} from '../features/admin-content/admin-content-model';
import {
  getDraftReading,
} from './drafts';
import {
  normalizeBlocks,
  validateDraftReading,
} from '../features/admin-content/admin-content-model';
import { getFirebaseDb } from './client';

export type PublishedReadingMeta = {
  id: string;
  version: number;
  publishedAt: string | null;
  updatedAt: string | null;
};

type PublishedReadingDoc = {
  version?: number | null;
  publishedAt?: FirestoreTimestamp | string | null;
  updatedAt?: FirestoreTimestamp | string | null;
};

type FirestoreTimestamp = {
  toDate?: () => Date;
};

export type PublishPlan = {
  reading: Omit<DraftReading, 'blocks' | 'updatedAt'> & {
    blockCount: number;
    publishedAt: ReturnType<typeof serverTimestamp>;
    updatedAt: ReturnType<typeof serverTimestamp>;
    version: number;
  };
  blocks: DraftBlock[];
  staleBlockIds: string[];
};

export async function getPublishedReadingMeta(
  readingId: string,
): Promise<PublishedReadingMeta | null> {
  const db = getFirebaseDb();
  if (!db) {
    return null;
  }

  const snapshot = await getDoc(doc(db, 'readings', readingId));
  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data() as PublishedReadingDoc;
  return {
    id: snapshot.id,
    version: data.version ?? 0,
    publishedAt: serializeTimestamp(data.publishedAt),
    updatedAt: serializeTimestamp(data.updatedAt),
  };
}

export async function publishDraftReading(readingId: string): Promise<PublishedReadingMeta> {
  const db = getFirebaseDb();
  if (!db) {
    throw new Error('Firebase belum dikonfigurasi.');
  }

  const draft = await getDraftReading(readingId);
  if (!draft) {
    throw new Error('Draft tidak ditemukan. Simpan draft terlebih dahulu.');
  }

  const validation = validateDraftReading(draft);
  if (!validation.ok) {
    throw new Error(validation.errors.join('\n'));
  }

  const readingRef = doc(db, 'readings', draft.id);
  const [publishedSnapshot, existingBlocksSnapshot] = await Promise.all([
    getDoc(readingRef),
    getDocs(collection(readingRef, 'blocks')),
  ]);
  const previousData = publishedSnapshot.exists()
    ? (publishedSnapshot.data() as PublishedReadingDoc)
    : null;
  const previousVersion = previousData?.version ?? 0;
  const plan = createPublishPlan(
    draft,
    previousVersion,
    existingBlocksSnapshot.docs.map((item) => item.id),
  );
  const batch = writeBatch(db);

  batch.set(readingRef, plan.reading);
  plan.blocks.forEach((block) => {
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
  plan.staleBlockIds.forEach((blockId) => {
    batch.delete(doc(readingRef, 'blocks', blockId));
  });

  await batch.commit();

  return (await getPublishedReadingMeta(draft.id)) ?? {
    id: draft.id,
    version: plan.reading.version,
    publishedAt: null,
    updatedAt: null,
  };
}

export function createPublishPlan(
  draft: DraftReading,
  previousVersion: number,
  existingBlockIds: string[],
): PublishPlan {
  const blocks = normalizeBlocks(draft.blocks);
  const nextBlockIds = new Set(blocks.map((block) => block.id));
  const timestamp = serverTimestamp();

  return {
    reading: {
      id: draft.id,
      slug: draft.slug,
      title: draft.title,
      category: draft.category,
      description: draft.description,
      sortOrder: draft.sortOrder,
      blockCount: blocks.length,
      version: previousVersion + 1,
      publishedAt: timestamp,
      updatedAt: timestamp,
    },
    blocks,
    staleBlockIds: existingBlockIds.filter((blockId) => !nextBlockIds.has(blockId)),
  };
}

function serializeTimestamp(value: PublishedReadingDoc['publishedAt']) {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (typeof value.toDate === 'function') return value.toDate().toISOString();
  return null;
}
