import { describe, expect, it } from 'vitest';
import { createPublishPlan } from '../src/firebase/publish';
import {
  createEmptyDraftReading,
  type DraftReading,
} from '../src/features/admin-content/admin-content-model';

function createValidDraft(): DraftReading {
  return {
    ...createEmptyDraftReading(),
    id: 'ratib-test',
    title: 'Ratib Test',
    slug: 'ratib-test',
    description: 'Keterangan admin\nbaris kedua.',
    sortOrder: 20,
    blocks: [
      {
        id: 'block-b',
        order: 9,
        title: null,
        arabic: 'ب',
        latin: 'Ba',
        translation: 'Huruf ba',
        repeat: [3, 6, 8],
        note: 'Note preserved',
      },
      {
        id: 'block-a',
        order: 4,
        title: null,
        arabic: 'ا',
        latin: 'Alif',
        translation: 'Huruf alif',
        repeat: [1],
        note: '',
      },
    ],
  };
}

describe('publish model', () => {
  it('creates first published version and preserves description exactly', () => {
    const draft = createValidDraft();
    const plan = createPublishPlan(draft, 0, []);

    expect(plan.reading.version).toBe(1);
    expect(plan.reading.description).toBe('Keterangan admin\nbaris kedua.');
    expect(plan.reading.slug).toBe('ratib-test');
    expect(plan.reading.blockCount).toBe(2);
  });

  it('increments published version and preserves repeat arrays', () => {
    const plan = createPublishPlan(createValidDraft(), 4, []);

    expect(plan.reading.version).toBe(5);
    expect(plan.blocks[0]?.repeat).toEqual([3, 6, 8]);
    expect(plan.blocks[1]?.repeat).toEqual([1]);
  });

  it('normalizes explicit published block order without relying on ids', () => {
    const plan = createPublishPlan(createValidDraft(), 0, []);

    expect(plan.blocks.map((block) => block.id)).toEqual(['block-b', 'block-a']);
    expect(plan.blocks.map((block) => block.order)).toEqual([1, 2]);
  });

  it('plans stale published block cleanup in the same publish operation', () => {
    const plan = createPublishPlan(createValidDraft(), 2, [
      'block-a',
      'block-b',
      'old-block',
    ]);

    expect(plan.staleBlockIds).toEqual(['old-block']);
  });
});
