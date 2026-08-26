import { describe, expect, it, vi } from 'vitest';
import {
  addBlock,
  createEmptyDraftReading,
  draftToReadingDocument,
  formatRepeat,
  generateSlug,
  moveBlock,
  normalizeRepeat,
  removeBlock,
  validateDraftReading,
} from '../src/features/admin-content/admin-content-model';

describe('admin content model', () => {
  it('creates a draft reading and auto slug helper without generating content', () => {
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('12345678-1234-1234-1234-123456789abc');

    const draft = createEmptyDraftReading();

    expect(draft.blocks).toHaveLength(1);
    expect(draft.blocks[0]?.arabic).toBe('');
    expect(generateSlug('Ratib Al-Haddad')).toBe('ratib-al-haddad');
  });

  it('preserves Arabic, Latin, and translation text for preview', () => {
    const draft = {
      ...createEmptyDraftReading(),
      title: 'Draft',
      slug: 'draft',
      blocks: [
        {
          ...createEmptyDraftReading().blocks[0]!,
          arabic: 'اَللّٰهُ\nمُحَمَّد',
          latin: "Allaah, shallallaahu 'alaihi",
          translation: 'Teks arti admin, apa adanya.',
          repeat: [3, 6, 8],
        },
      ],
    };

    const preview = draftToReadingDocument(draft);

    expect(preview.sections[0]?.arabic).toBe('اَللّٰهُ\nمُحَمَّد');
    expect(preview.sections[0]?.latin).toBe("Allaah, shallallaahu 'alaihi");
    expect(preview.sections[0]?.translation).toBe('Teks arti admin, apa adanya.');
    expect(preview.sections[0]?.repeat).toEqual([3, 6, 8]);
  });

  it('supports single and multiple repeat values', () => {
    expect(normalizeRepeat([3])).toEqual([3]);
    expect(normalizeRepeat([3, 6, 8])).toEqual([3, 6, 8]);
    expect(formatRepeat([10, 20, 30, 100, 500])).toBe('10x / 20x / 30x / 100x / 500x');
  });

  it('rejects invalid repeat values during validation', () => {
    const draft = {
      ...createEmptyDraftReading(),
      title: 'Draft',
      slug: 'draft',
      blocks: [
        {
          ...createEmptyDraftReading().blocks[0]!,
          arabic: 'placeholder',
          repeat: [3, 0],
        },
      ],
    };

    const result = validateDraftReading(draft);

    expect(result.ok).toBe(false);
    expect(result.errors.join('\n')).toContain('Repeat harus berisi integer positif');
  });

  it('adds, moves, and removes blocks while keeping order explicit', () => {
    const first = { ...createEmptyDraftReading().blocks[0]!, id: 'first', order: 1 };
    const second = { ...createEmptyDraftReading().blocks[0]!, id: 'second', order: 2 };
    const third = { ...createEmptyDraftReading().blocks[0]!, id: 'third', order: 3 };

    const movedDown = moveBlock([first, second, third], 0, 'down');
    expect(movedDown.map((block) => block.id)).toEqual(['second', 'first', 'third']);
    expect(movedDown.map((block) => block.order)).toEqual([1, 2, 3]);

    const movedUp = moveBlock(movedDown, 2, 'up');
    expect(movedUp.map((block) => block.id)).toEqual(['second', 'third', 'first']);

    const removed = removeBlock(movedUp, 'third');
    expect(removed.map((block) => block.id)).toEqual(['second', 'first']);
    expect(removed.map((block) => block.order)).toEqual([1, 2]);

    expect(addBlock(removed)).toHaveLength(3);
  });
});
