import { useEffect, useSyncExternalStore } from 'react';

export type PwaUpdateSnapshot = {
  offlineReady: boolean;
  updateAvailable: boolean;
};

type Listener = () => void;
type UpdateSW = (reloadPage?: boolean) => Promise<void>;

const listeners = new Set<Listener>();
let snapshot: PwaUpdateSnapshot = {
  offlineReady: false,
  updateAvailable: false,
};
let updateSW: UpdateSW | null = null;

export function configurePwaUpdate(update: UpdateSW) {
  updateSW = update;
}

export function markPwaUpdateAvailable() {
  setSnapshot({ ...snapshot, updateAvailable: true });
}

export function markPwaOfflineReady() {
  setSnapshot({ ...snapshot, offlineReady: true });
}

export function clearPwaOfflineReady() {
  setSnapshot({ ...snapshot, offlineReady: false });
}

export async function applyPwaUpdate() {
  if (!updateSW) {
    return;
  }

  await updateSW(true);
}

export function getPwaUpdateSnapshot() {
  return snapshot;
}

export function subscribeToPwaUpdates(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function usePwaUpdate() {
  const current = useSyncExternalStore(
    subscribeToPwaUpdates,
    getPwaUpdateSnapshot,
    getPwaUpdateSnapshot,
  );

  useEffect(() => {
    const handleUpdateReady = () => markPwaUpdateAvailable();
    const handleOfflineReady = () => markPwaOfflineReady();

    window.addEventListener('wm:pwa-update-ready', handleUpdateReady);
    window.addEventListener('wm:pwa-offline-ready', handleOfflineReady);
    return () => {
      window.removeEventListener('wm:pwa-update-ready', handleUpdateReady);
      window.removeEventListener('wm:pwa-offline-ready', handleOfflineReady);
    };
  }, []);

  return {
    ...current,
    applyUpdate: applyPwaUpdate,
    clearOfflineReady: clearPwaOfflineReady,
  };
}

export function resetPwaUpdateStateForTest() {
  snapshot = {
    offlineReady: false,
    updateAvailable: false,
  };
  updateSW = null;
  listeners.clear();
}

function setSnapshot(nextSnapshot: PwaUpdateSnapshot) {
  snapshot = nextSnapshot;
  listeners.forEach((listener) => listener());
}
