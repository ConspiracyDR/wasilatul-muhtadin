import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  applyPwaUpdate,
  clearPwaOfflineReady,
  configurePwaUpdate,
  getPwaUpdateSnapshot,
  markPwaOfflineReady,
  markPwaUpdateAvailable,
  resetPwaUpdateStateForTest,
  subscribeToPwaUpdates,
} from '../src/app/pwa-update-store';

describe('pwa update store', () => {
  beforeEach(() => {
    resetPwaUpdateStateForTest();
  });

  it('tracks update availability without applying it automatically', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToPwaUpdates(listener);

    markPwaUpdateAvailable();

    expect(getPwaUpdateSnapshot().updateAvailable).toBe(true);
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
  });

  it('tracks and clears offline-ready state', () => {
    markPwaOfflineReady();
    expect(getPwaUpdateSnapshot().offlineReady).toBe(true);

    clearPwaOfflineReady();
    expect(getPwaUpdateSnapshot().offlineReady).toBe(false);
  });

  it('triggers service worker update only through explicit action', async () => {
    const updateSW = vi.fn().mockResolvedValue(undefined);
    configurePwaUpdate(updateSW);

    expect(updateSW).not.toHaveBeenCalled();

    await applyPwaUpdate();

    expect(updateSW).toHaveBeenCalledWith(true);
  });
});
