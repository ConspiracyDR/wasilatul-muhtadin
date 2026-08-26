import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '../src/app/App';
import type { ReadingDocument } from '../src/content/types';

const publicReadingsMock = vi.hoisted(() => ({
  getBySlug: vi.fn(),
  list: vi.fn(),
}));

vi.mock('../src/firebase/public-readings', () => ({
  filterPublishedReadingsByCategory: (
    readings: ReadingDocument[],
    categoryId: ReadingDocument['category'],
  ) => readings.filter((item) => item.category === categoryId),
  getPublishedReadingBySlug: publicReadingsMock.getBySlug,
  listPublishedReadingSummaries: publicReadingsMock.list,
  PublicContentUnavailableError: class PublicContentUnavailableError extends Error {},
  sortPublishedReadings: (readings: ReadingDocument[]) =>
    [...readings].sort((a, b) => {
      const orderA = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB || a.title.localeCompare(b.title, 'id') || a.id.localeCompare(b.id, 'id');
    }),
}));

let root: Root | null = null;
let container: HTMLDivElement | null = null;

beforeEach(() => {
  window.history.replaceState({}, '', '/');
  publicReadingsMock.list.mockReset();
  publicReadingsMock.getBySlug.mockReset();
  publicReadingsMock.list.mockResolvedValue([doaSummary, ratibSummary]);
  publicReadingsMock.getBySlug.mockResolvedValue(null);
  Object.defineProperty(window.navigator, 'onLine', {
    configurable: true,
    value: true,
  });
});

afterEach(() => {
  if (root) {
    act(() => root?.unmount());
  }
  container?.remove();
  root = null;
  container = null;
});

async function renderApp() {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => {
    root?.render(<App />);
  });
  await act(async () => {
    await Promise.resolve();
  });
  return container;
}

describe('public Firestore reader app', () => {
  it('loads published Home content without exposing drafts', async () => {
    const node = await renderApp();

    expect(publicReadingsMock.list).toHaveBeenCalled();
    expect(node.textContent).toContain('Ratib Al-Haddad');
    expect(node.textContent).toContain('Doa Harian');
    expect(node.textContent).not.toContain('Draft Only');
  });

  it('filters Category page content from published readings', async () => {
    window.history.replaceState({}, '', '/kategori/ratib');
    const node = await renderApp();

    expect(node.textContent).toContain('Ratib Al-Haddad');
    expect(node.textContent).not.toContain('Doa Harian');
  });

  it('does not leak technical labels to public Home or Category UI', async () => {
    const home = await renderApp();

    expect(home.textContent).not.toMatch(/approved|needs_review|review_status|fixture|phase|debug|Firestore|cache/i);

    act(() => root?.unmount());
    home.remove();
    root = null;
    container = null;

    window.history.replaceState({}, '', '/kategori/ratib');
    const category = await renderApp();

    expect(category.textContent).not.toMatch(/approved|needs_review|review_status|fixture|phase|debug|Firestore|cache/i);
  });

  it('fetches a published reading by slug and renders description', async () => {
    publicReadingsMock.getBySlug.mockResolvedValue(ratibFull);
    window.history.replaceState({}, '', '/bacaan/ratib-published');
    const node = await renderApp();

    expect(publicReadingsMock.getBySlug).toHaveBeenCalledWith('ratib-published');
    expect(node.querySelector('.reading-description')?.textContent).toBe(
      'Description dari Firestore.',
    );
    expect(node.querySelector('.arabic-text')?.textContent).toContain('اَللّٰهُ');
  });

  it('shows offline first-load state when no cached content is available', async () => {
    publicReadingsMock.list.mockRejectedValue(new Error('network unavailable'));
    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      value: false,
    });
    const node = await renderApp();

    expect(node.textContent).toContain('Butuh koneksi untuk memuat pertama kali');
  });
});

const ratibSummary = createReading('ratib-published', 'Ratib Al-Haddad', 'ratib', 10);
const doaSummary = createReading('doa-published', 'Doa Harian', 'doa', 20);
const ratibFull: ReadingDocument = {
  ...ratibSummary,
  description: 'Description dari Firestore.',
  sections: [
    {
      id: 'block-001',
      arabic: 'اَللّٰهُ',
      latin: 'Allaah',
      translation: 'Allah',
      repeat: [3],
      note: 'Catatan',
      review_status: 'approved',
    },
  ],
};

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
