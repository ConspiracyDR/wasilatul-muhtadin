import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PwaInstallButton } from '../src/app/PwaInstallButton';

let root: Root | null = null;
let container: HTMLDivElement | null = null;

beforeEach(() => {
  Object.defineProperty(window.navigator, 'userAgent', {
    configurable: true,
    value: 'Mozilla/5.0 Chrome/120.0.0.0 Safari/537.36',
  });
  Object.defineProperty(window.navigator, 'standalone', {
    configurable: true,
    value: false,
  });
  window.matchMedia = vi.fn().mockReturnValue({
    addEventListener: vi.fn(),
    matches: false,
    removeEventListener: vi.fn(),
  });
});

afterEach(() => {
  if (root) {
    act(() => root?.unmount());
  }
  container?.remove();
  root = null;
  container = null;
  vi.restoreAllMocks();
});

function renderInstallButton() {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => root?.render(<PwaInstallButton />));
  return container;
}

function dispatchBeforeInstallPrompt({
  outcome = 'accepted',
}: {
  outcome?: 'accepted' | 'dismissed';
}) {
  const event = new Event('beforeinstallprompt', { cancelable: true }) as Event & {
    prompt: ReturnType<typeof vi.fn>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
  };
  event.prompt = vi.fn().mockResolvedValue(undefined);
  event.userChoice = Promise.resolve({ outcome });

  act(() => {
    window.dispatchEvent(event);
  });

  return event;
}

describe('PwaInstallButton', () => {
  it('stays visible when the browser has not reported installability', () => {
    const node = renderInstallButton();

    expect(node.textContent).toContain('Install App');
  });

  it('opens a helpful fallback sheet when native install is unavailable', () => {
    const node = renderInstallButton();
    const button = node.querySelector('button[aria-label="Install App"]') as HTMLButtonElement | null;

    act(() => {
      button?.click();
    });

    const dialog = node.querySelector('[role="dialog"]');
    expect(dialog?.textContent).toContain('browser yang mendukung PWA');
    expect(dialog?.textContent).toContain('Chrome di Android');
    expect(dialog?.textContent).toContain('Safari di iPhone');
    expect(dialog?.textContent).toContain('HTTPS');
    expect(dialog?.textContent).not.toMatch(/beforeinstallprompt|service worker|secure context/i);
  });

  it('appears after beforeinstallprompt and triggers the native prompt on click', async () => {
    const node = renderInstallButton();
    const event = dispatchBeforeInstallPrompt({});
    const button = node.querySelector('button[aria-label="Install App"]') as HTMLButtonElement | null;

    expect(button).not.toBeNull();

    await act(async () => {
      button?.click();
      await event.userChoice;
    });

    expect(event.defaultPrevented).toBe(true);
    expect(event.prompt).toHaveBeenCalled();
    expect(node.textContent).not.toContain('Install App');
  });

  it('hides the CTA when the app is already running standalone', () => {
    window.matchMedia = vi.fn().mockReturnValue({
      addEventListener: vi.fn(),
      matches: true,
      removeEventListener: vi.fn(),
    });
    const node = renderInstallButton();

    expect(node.textContent).not.toContain('Install App');
  });

  it('hides the CTA after appinstalled event', () => {
    const node = renderInstallButton();
    dispatchBeforeInstallPrompt({});

    expect(node.textContent).toContain('Install App');

    act(() => {
      window.dispatchEvent(new Event('appinstalled'));
    });

    expect(node.textContent).not.toContain('Install App');
  });

  it('shows concise iOS Safari fallback instructions', () => {
    Object.defineProperty(window.navigator, 'userAgent', {
      configurable: true,
      value:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1',
    });
    const node = renderInstallButton();
    const button = node.querySelector('button[aria-label="Install App"]') as HTMLButtonElement | null;

    act(() => {
      button?.click();
    });

    expect(node.querySelector('[role="dialog"]')?.textContent).toContain('Tap Share');
    expect(node.querySelector('[role="dialog"]')?.textContent).toContain('Add to Home Screen');
    expect(node.querySelector('[role="dialog"]')?.textContent).toContain('Tap Add');
  });
});
