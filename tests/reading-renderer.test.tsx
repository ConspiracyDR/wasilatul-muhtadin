import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReadingDocument } from '../src/content/types';
import { ReadingControls } from '../src/features/reading/ReadingControls';
import { ReadingPage } from '../src/features/reading/ReadingPage';
import {
  normalizeArabicForPresentation,
  ReadingSection,
} from '../src/features/reading/ReadingSection';

let root: Root | null = null;
let container: HTMLDivElement | null = null;

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  if (root) {
    act(() => root?.unmount());
  }
  container?.remove();
  root = null;
  container = null;
});

function render(element: React.ReactElement) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => root?.render(element));
  return container;
}

function changeValue(
  element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
  value: string,
) {
  const prototype =
    element instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : element instanceof HTMLSelectElement
        ? HTMLSelectElement.prototype
        : HTMLInputElement.prototype;
  const valueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;

  act(() => {
    valueSetter?.call(element, value);
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

describe('reading renderer', () => {
  it('renders Arabic with RTL semantics and repeat indicator separately', () => {
    const node = render(
      <ReadingSection
        section={{
          id: 'section-001',
          arabic: '[ARABIC APPROVED SOURCE WILL BE INSERTED HERE]',
          repeat: [3],
          review_status: 'needs_review',
        }}
        showLatin={false}
        showTranslation={false}
      />,
    );

    const arabic = node.querySelector('.arabic-text');
    const repeat = node.querySelector('.repeat-badge');

    expect(arabic?.getAttribute('dir')).toBe('rtl');
    expect(arabic?.getAttribute('lang')).toBe('ar');
    expect(repeat?.textContent).toBe('×3');
    expect(arabic?.textContent).not.toContain('×3');
  });

  it('collapses source Arabic newlines for responsive visual wrapping', () => {
    const section = {
      id: 'section-001',
      arabic: 'AAA\nBBB\r\nCCC   DDD',
      repeat: null,
      review_status: 'needs_review' as const,
    };
    const node = render(
      <ReadingSection
        section={section}
        showLatin={false}
        showTranslation={false}
      />,
    );
    const arabic = node.querySelector('.arabic-text') as HTMLElement | null;

    expect(normalizeArabicForPresentation(section.arabic)).toBe('AAA BBB CCC DDD');
    expect(arabic?.textContent).toBe('AAA BBB CCC DDD');
    expect(arabic?.style.whiteSpace).toBe('');
    expect(section.arabic).toBe('AAA\nBBB\r\nCCC   DDD');
  });

  it('renders repeat count whenever positive metadata exists, including one', () => {
    const node = render(
      <ReadingSection
        section={{
          id: 'section-001',
          arabic: '[ARABIC APPROVED SOURCE WILL BE INSERTED HERE]',
          repeat: [1],
          review_status: 'needs_review',
        }}
        showLatin={false}
        showTranslation={false}
      />,
    );

    expect(node.querySelector('.repeat-badge')?.textContent).toBe('×1');
  });

  it('renders multiple repeat values without changing order', () => {
    const node = render(
      <ReadingSection
        section={{
          id: 'section-001',
          arabic: '[ARABIC APPROVED SOURCE WILL BE INSERTED HERE]',
          repeat: [3, 6, 8],
          review_status: 'needs_review',
        }}
        showLatin={false}
        showTranslation={false}
      />,
    );

    expect(node.querySelector('.repeat-badge')?.textContent).toBe('×3 / ×6 / ×8');
  });

  it('keeps Latin and translation hidden until toggled on', () => {
    const section = {
      id: 'section-001',
      arabic: '[ARABIC APPROVED SOURCE WILL BE INSERTED HERE]',
      latin: '[LATIN APPROVED SOURCE WILL BE INSERTED HERE]',
      translation: '[TRANSLATION APPROVED SOURCE WILL BE INSERTED HERE]',
      review_status: 'needs_review' as const,
    };

    const node = render(
      <ReadingSection
        section={section}
        showLatin={false}
        showTranslation={false}
      />,
    );

    expect(node.querySelector('.latin-text')).toBeNull();
    expect(node.querySelector('.translation-text')).toBeNull();

    act(() =>
      root?.render(
        <ReadingSection section={section} showLatin={true} showTranslation={true} />,
      ),
    );

    expect(node.querySelector('.latin-text')?.textContent).toContain('LATIN');
    expect(node.querySelector('.translation-text')?.textContent).toContain(
      'TRANSLATION',
    );
  });

  it('uses accessible pressed state for Latin and translation controls', () => {
    const setShowLatin = vi.fn();
    const setShowTranslation = vi.fn();
    const node = render(
      <ReadingControls
        showLatin={false}
        showTranslation={true}
        setShowLatin={setShowLatin}
        setShowTranslation={setShowTranslation}
      />,
    );

    const buttons = node.querySelectorAll('button');
    expect(buttons[0]?.getAttribute('aria-pressed')).toBe('false');
    expect(buttons[1]?.getAttribute('aria-pressed')).toBe('true');

    act(() => buttons[0]?.click());
    act(() => buttons[1]?.click());

    expect(setShowLatin).toHaveBeenCalledWith(true);
    expect(setShowTranslation).toHaveBeenCalledWith(false);
  });

  it('opens and closes the reading settings bottom sheet', () => {
    const node = render(<ReadingPage content={readingDocument} onBack={vi.fn()} />);

    expect(node.querySelector('[role="dialog"]')).toBeNull();

    const settingsButton = node.querySelector(
      'button[aria-label="Buka pengaturan bacaan"]',
    ) as HTMLButtonElement | null;
    act(() => settingsButton?.click());

    expect(node.querySelector('[role="dialog"]')?.textContent).toContain(
      'Pengaturan',
    );

    const closeButton = node.querySelector(
      'button[aria-label="Tutup pengaturan"]',
    ) as HTMLButtonElement | null;
    act(() => closeButton?.click());

    expect(node.querySelector('[role="dialog"]')).toBeNull();
  });

  it('shows font size controls with sensible defaults and ranges', () => {
    window.localStorage.clear();
    const node = render(<ReadingPage content={readingDocument} onBack={vi.fn()} />);
    const article = node.querySelector('.reading-view') as HTMLElement;

    expect(article.style.getPropertyValue('--reading-arabic-size')).toBe('32px');

    const settingsButton = node.querySelector(
      'button[aria-label="Buka pengaturan bacaan"]',
    ) as HTMLButtonElement | null;
    act(() => settingsButton?.click());

    const arabicSlider = node.querySelector(
      'input[aria-label="Ukuran teks Arab"]',
    ) as HTMLInputElement | null;

    expect(arabicSlider?.value).toBe('32');
    expect(arabicSlider?.min).toBe('26');
    expect(arabicSlider?.max).toBe('44');
  });

  it('persists Arabic QA font selection from reading settings', () => {
    window.localStorage.clear();
    const node = render(<ReadingPage content={readingDocument} onBack={vi.fn()} />);

    const settingsButton = node.querySelector(
      'button[aria-label="Buka pengaturan bacaan"]',
    ) as HTMLButtonElement | null;
    act(() => settingsButton?.click());

    const fontSelect = node.querySelector(
      'select[aria-label="Font Arab QA"]',
    ) as HTMLSelectElement | null;

    expect(fontSelect?.value).toBe('Noto Naskh Arabic');
    changeValue(fontSelect as HTMLSelectElement, 'Amiri');

    const article = node.querySelector('.reading-view') as HTMLElement;
    expect(fontSelect?.value).toBe('Amiri');
    expect(article.style.getPropertyValue('--reading-arabic-font-family')).toContain('Amiri');
    expect(JSON.parse(window.localStorage.getItem('wm.preferences.v1') ?? '{}')).toMatchObject({
      arabicFontFamily: 'Amiri',
    });
  });

  it('renders public reading description before the first content block', () => {
    const node = render(
      <ReadingPage
        content={{
          ...readingDocument,
          description: 'Keterangan pengantar\nbaris kedua.',
        }}
        onBack={vi.fn()}
      />,
    );

    const description = node.querySelector('.reading-description');
    const firstSection = node.querySelector('.reading-section');

    expect(description).not.toBeNull();
    expect(firstSection).not.toBeNull();
    expect(description?.textContent).toBe('Keterangan pengantar\nbaris kedua.');
    expect(
      Boolean(
        (description as Element).compareDocumentPosition(firstSection as Node) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ),
    ).toBe(true);
  });

  it('does not render an empty description container', () => {
    const node = render(
      <ReadingPage
        content={{
          ...readingDocument,
          description: null,
        }}
        onBack={vi.fn()}
      />,
    );

    expect(node.querySelector('.reading-description')).toBeNull();
  });
});

const readingDocument: ReadingDocument = {
  id: 'demo-reading',
  slug: 'demo-reading',
  title: 'Ratib Al-Haddad Dengan Judul Panjang',
  category: 'ratib',
  version: 1,
  source_note: 'Test fixture.',
  sections: [
    {
      id: 'section-001',
      arabic: '[ARABIC APPROVED SOURCE WILL BE INSERTED HERE]',
      latin: '[LATIN APPROVED SOURCE WILL BE INSERTED HERE]',
      translation: '[TRANSLATION APPROVED SOURCE WILL BE INSERTED HERE]',
      repeat: [7],
      review_status: 'needs_review',
    },
  ],
};
