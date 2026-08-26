import type { CategoryId, ReadingDocument, ReadingSection } from '../../content/types';

export type DraftBlock = {
  id: string;
  order: number;
  title?: string | null;
  arabic: string;
  latin: string;
  translation: string;
  repeat: number[] | null;
  note: string;
};

export type DraftReading = {
  id: string;
  title: string;
  slug: string;
  category: CategoryId;
  description: string;
  sortOrder: number;
  updatedAt?: string | null;
  blocks: DraftBlock[];
};

export type DraftReadingSummary = {
  id: string;
  title: string;
  slug: string;
  category: CategoryId;
  sortOrder: number;
  updatedAt?: string | null;
  blockCount: number;
};

export type DraftValidationResult = {
  ok: boolean;
  errors: string[];
};

export const repeatPresets = [
  { id: 'none', label: 'Tidak Ada', values: null },
  { id: 'one', label: '1x', values: [1] },
  { id: 'three', label: '3x', values: [3] },
  { id: 'seven', label: '7x', values: [7] },
] as const;

export function createEmptyDraftReading(): DraftReading {
  return {
    id: createId('reading'),
    title: '',
    slug: '',
    category: 'ratib',
    description: '',
    sortOrder: 100,
    updatedAt: null,
    blocks: [createEmptyBlock(1)],
  };
}

export function createEmptyBlock(order: number): DraftBlock {
  return {
    id: createId('block'),
    order,
    title: null,
    arabic: '',
    latin: '',
    translation: '',
    repeat: null,
    note: '',
  };
}

export function normalizeBlocks(blocks: DraftBlock[]) {
  return blocks.map((block, index) => ({ ...block, order: index + 1 }));
}

export function addBlock(blocks: DraftBlock[]) {
  return normalizeBlocks([...blocks, createEmptyBlock(blocks.length + 1)]);
}

export function moveBlock(blocks: DraftBlock[], index: number, direction: 'up' | 'down') {
  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (index < 0 || targetIndex < 0 || index >= blocks.length || targetIndex >= blocks.length) {
    return blocks;
  }

  const nextBlocks = [...blocks];
  const current = nextBlocks[index];
  nextBlocks[index] = nextBlocks[targetIndex] as DraftBlock;
  nextBlocks[targetIndex] = current as DraftBlock;
  return normalizeBlocks(nextBlocks);
}

export function removeBlock(blocks: DraftBlock[], blockId: string) {
  return normalizeBlocks(blocks.filter((block) => block.id !== blockId));
}

export function normalizeRepeat(values: Array<number | string>): number[] | null {
  const normalized = values
    .map((value) => (typeof value === 'string' ? Number(value) : value))
    .filter((value) => Number.isInteger(value) && value > 0);

  return normalized.length > 0 ? normalized : null;
}

export function formatRepeat(repeat: number[] | null) {
  return repeat?.length ? repeat.map((value) => `${value}x`).join(' / ') : 'Tidak ada';
}

export function draftToReadingDocument(draft: DraftReading): ReadingDocument {
  return {
    id: draft.id,
    slug: draft.slug,
    title: draft.title || 'Preview Draft',
    category: draft.category,
    description: draft.description || null,
    sortOrder: draft.sortOrder,
    version: 1,
    updatedAt: draft.updatedAt ?? null,
    source_note: 'Admin draft preview. Not published content.',
    sections: draft.blocks.map(
      (block): ReadingSection => ({
        id: block.id,
        title: block.title || null,
        arabic: block.arabic,
        latin: block.latin || null,
        translation: block.translation || null,
        repeat: block.repeat,
        note: block.note || null,
        review_status: 'needs_review',
      }),
    ),
  };
}

export function validateDraftReading(draft: DraftReading): DraftValidationResult {
  const errors: string[] = [];

  if (!draft.title.trim()) errors.push('Judul wajib diisi.');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.slug)) {
    errors.push('Slug wajib kebab-case.');
  }
  if (!['ratib', 'tawasul', 'tahlil', 'doa'].includes(draft.category)) {
    errors.push('Kategori tidak valid.');
  }
  if (!Number.isInteger(draft.sortOrder)) {
    errors.push('Sort Order wajib integer.');
  }
  if (draft.blocks.length === 0) {
    errors.push('Minimal harus ada satu block.');
  }

  const blockIds = new Set<string>();
  draft.blocks.forEach((block, index) => {
    const prefix = `Block ${index + 1}`;
    if (blockIds.has(block.id)) errors.push(`${prefix}: id duplikat.`);
    blockIds.add(block.id);
    if (!Number.isInteger(block.order) || block.order < 1) {
      errors.push(`${prefix}: order tidak valid.`);
    }
    if (!block.arabic.trim()) {
      errors.push(`${prefix}: Arabic wajib diisi.`);
    }
    if (
      block.repeat !== null &&
      (!Array.isArray(block.repeat) ||
        block.repeat.length === 0 ||
        block.repeat.some((value) => !Number.isInteger(value) || value <= 0))
    ) {
      errors.push(`${prefix}: Repeat harus berisi integer positif.`);
    }
  });

  return { ok: errors.length === 0, errors };
}

export function generateSlug(title: string) {
  return title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }

  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
