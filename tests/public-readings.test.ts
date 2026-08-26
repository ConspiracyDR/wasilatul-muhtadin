import { describe, expect, it } from 'vitest';
import type { ReadingDocument } from '../src/content/types';
import {
  filterPublishedReadingsByCategory,
  sortPublishedReadings,
} from '../src/firebase/public-readings';

const readings: ReadingDocument[] = [
  createReading('z-last', 'Zikir Z', 'doa', 30),
  createReading('b-same-order', 'Bacaan B', 'ratib', 10),
  createReading('a-same-order', 'Bacaan A', 'ratib', 10),
];

describe('public readings helpers', () => {
  it('orders Home readings by sortOrder with deterministic title/id fallback', () => {
    expect(sortPublishedReadings(readings).map((item) => item.id)).toEqual([
      'a-same-order',
      'b-same-order',
      'z-last',
    ]);
  });

  it('filters Category page content without exposing drafts', () => {
    expect(filterPublishedReadingsByCategory(readings, 'ratib').map((item) => item.id)).toEqual([
      'b-same-order',
      'a-same-order',
    ]);
  });
});

function createReading(
  id: string,
  title: string,
  category: ReadingDocument['category'],
  sortOrder: number,
): ReadingDocument {
  return {
    id,
    slug: id,
    title,
    category,
    description: null,
    sortOrder,
    version: 1,
    updatedAt: null,
    publishedAt: null,
    source_note: 'Firestore published content.',
    sections: [],
  };
}
