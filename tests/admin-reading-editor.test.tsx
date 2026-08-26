import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminReadingEditorPage } from '../src/features/admin-content/AdminReadingEditorPage';
import { publishDraftReading } from '../src/firebase/publish';

vi.mock('../src/features/auth/useAdminAuth', () => ({
  useAdminSession: () => ({
    status: 'authorized',
    user: { uid: 'admin-test-user' },
    authorization: { status: 'authorized', active: true },
  }),
}));

vi.mock('../src/firebase/drafts', () => ({
  getDraftReading: vi.fn(),
  saveDraftReading: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../src/firebase/publish', () => ({
  getPublishedReadingMeta: vi.fn().mockResolvedValue(null),
  publishDraftReading: vi.fn().mockResolvedValue({
    id: 'reading-test',
    version: 1,
    publishedAt: null,
    updatedAt: null,
  }),
}));

let root: Root | null = null;
let container: HTMLDivElement | null = null;

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  if (root) {
    act(() => root?.unmount());
  }
  container?.remove();
  root = null;
  container = null;
});

async function renderEditor() {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => root?.render(<AdminReadingEditorPage readingId="new" navigate={vi.fn()} />));
  await act(async () => {
    await Promise.resolve();
  });
  return container;
}

function fieldByLabel(
  node: HTMLElement,
  text: string,
): HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement {
  const labels = Array.from(node.querySelectorAll('label'));
  const label = labels.find((item) => item.querySelector('span')?.textContent === text);
  const field = label?.querySelector('input, select, textarea');

  if (
    field instanceof HTMLInputElement ||
    field instanceof HTMLSelectElement ||
    field instanceof HTMLTextAreaElement
  ) {
    return field;
  }

  throw new Error(`Field not found: ${text}`);
}

function changeField(
  field: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
  value: string,
) {
  const prototype =
    field instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : field instanceof HTMLSelectElement
        ? HTMLSelectElement.prototype
        : HTMLInputElement.prototype;
  const valueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;

  act(() => {
    valueSetter?.call(field, value);
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

describe('admin reading editor', () => {
  it('keeps controlled text fields mounted and editable while typing', async () => {
    const node = await renderEditor();
    const firstBlock = node.querySelector('.block-editor') as HTMLElement | null;

    expect(firstBlock).not.toBeNull();

    const description = fieldByLabel(node, 'Description') as HTMLTextAreaElement;
    const arabic = fieldByLabel(firstBlock as HTMLElement, 'Arabic') as HTMLTextAreaElement;
    const latin = fieldByLabel(firstBlock as HTMLElement, 'Latin') as HTMLTextAreaElement;
    const translation = fieldByLabel(firstBlock as HTMLElement, 'Arti') as HTMLTextAreaElement;
    const note = fieldByLabel(firstBlock as HTMLElement, 'Note') as HTMLTextAreaElement;

    changeField(description, 'Deskripsi test admin');
    changeField(arabic, 'اللهم صل على سيدنا محمد');
    changeField(latin, 'Allaahumma shalli alaa Sayyidinaa Muhammad');
    changeField(translation, 'Ya Allah limpahkan shalawat kepada Nabi Muhammad');
    changeField(note, 'Catatan editor');

    expect(description.value).toBe('Deskripsi test admin');
    expect(arabic.value).toBe('اللهم صل على سيدنا محمد');
    expect(latin.value).toBe('Allaahumma shalli alaa Sayyidinaa Muhammad');
    expect(translation.value).toBe('Ya Allah limpahkan shalawat kepada Nabi Muhammad');
    expect(note.value).toBe('Catatan editor');
    expect(node.querySelector('.block-editor')).toBe(firstBlock);

    changeField(latin, 'Latin masih bisa diedit setelah field lain');

    expect(description.value).toBe('Deskripsi test admin');
    expect(arabic.value).toBe('اللهم صل على سيدنا محمد');
    expect(latin.value).toBe('Latin masih bisa diedit setelah field lain');
    expect(translation.value).toBe('Ya Allah limpahkan shalawat kepada Nabi Muhammad');
    expect(note.value).toBe('Catatan editor');
    expect(node.querySelector('.block-editor')).toBe(firstBlock);
  });

  it('requires explicit confirmation before publishing', async () => {
    const node = await renderEditor();
    const publishButton = Array.from(node.querySelectorAll('button')).find(
      (button) => button.textContent === 'Publish',
    ) as HTMLButtonElement | undefined;
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    await act(async () => {
      publishButton?.click();
    });

    expect(confirmSpy).toHaveBeenCalledWith('Publish draft ini ke public reader?');
    expect(publishDraftReading).not.toHaveBeenCalled();

    confirmSpy.mockReturnValue(true);
    await act(async () => {
      publishButton?.click();
      await Promise.resolve();
    });

    expect(publishDraftReading).toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it('shows publishing state and success feedback after Firestore publish resolves', async () => {
    const deferred = createDeferred<{
      id: string;
      version: number;
      publishedAt: null;
      updatedAt: null;
    }>();
    vi.mocked(publishDraftReading).mockReturnValueOnce(deferred.promise);
    const node = await renderEditor();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const publishButton = Array.from(node.querySelectorAll('button')).find(
      (button) => button.textContent === 'Publish',
    ) as HTMLButtonElement;

    await act(async () => {
      publishButton.click();
      await Promise.resolve();
    });

    expect(publishButton.disabled).toBe(true);
    expect(publishButton.textContent).toBe('Publishing...');
    expect(node.textContent).not.toContain('Berhasil dipublish');

    await act(async () => {
      deferred.resolve({
        id: 'reading-test',
        version: 7,
        publishedAt: null,
        updatedAt: null,
      });
      await deferred.promise;
    });

    expect(node.textContent).toContain('Berhasil dipublish. Version 7');
    expect(publishButton.disabled).toBe(false);
    confirmSpy.mockRestore();
  });

  it('shows publish failure feedback without relying on console errors', async () => {
    vi.mocked(publishDraftReading).mockRejectedValueOnce(new Error('Publish gagal dari test'));
    const node = await renderEditor();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const publishButton = Array.from(node.querySelectorAll('button')).find(
      (button) => button.textContent === 'Publish',
    ) as HTMLButtonElement;

    await act(async () => {
      publishButton.click();
      await Promise.resolve();
    });

    expect(node.querySelector('[role="alert"]')?.textContent).toContain('Publish gagal dari test');
    expect(node.textContent).not.toContain('Berhasil dipublish');
    confirmSpy.mockRestore();
  });
});

function createDeferred<T>() {
  let resolve: (value: T) => void = () => undefined;
  let reject: (reason?: unknown) => void = () => undefined;
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return { promise, reject, resolve };
}
