import { registerSW } from 'virtual:pwa-register';
import {
  configurePwaUpdate,
  markPwaOfflineReady,
  markPwaUpdateAvailable,
} from './pwa-update-store';

export function registerAppServiceWorker() {
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      markPwaUpdateAvailable();
      window.dispatchEvent(new CustomEvent('wm:pwa-update-ready'));
    },
    onOfflineReady() {
      markPwaOfflineReady();
      window.dispatchEvent(new CustomEvent('wm:pwa-offline-ready'));
    },
  });

  configurePwaUpdate(updateSW);
}
