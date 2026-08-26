import { usePwaUpdate } from './pwa-update-store';

export function PwaUpdateNotice() {
  const { offlineReady, updateAvailable, applyUpdate, clearOfflineReady } =
    usePwaUpdate();

  if (updateAvailable) {
    return (
      <div className="pwa-notice" role="status">
        <span>Versi baru tersedia.</span>
        <button type="button" onClick={applyUpdate}>
          Perbarui
        </button>
      </div>
    );
  }

  if (offlineReady) {
    return (
      <div className="pwa-notice subtle" role="status">
        <span>Aplikasi siap digunakan offline.</span>
        <button aria-label="Tutup notifikasi offline" type="button" onClick={clearOfflineReady}>
          Tutup
        </button>
      </div>
    );
  }

  return null;
}
