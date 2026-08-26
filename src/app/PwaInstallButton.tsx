import { useEffect, useState } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice?: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export function PwaInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(isInstalledPwa);
  const [fallbackSheet, setFallbackSheet] = useState<'ios' | 'unsupported' | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };
    const handleInstalled = () => {
      setDeferredPrompt(null);
      setFallbackSheet(null);
      setInstalled(true);
    };
    const standaloneQuery = window.matchMedia?.('(display-mode: standalone)');
    const handleDisplayModeChange = () => setInstalled(isInstalledPwa());

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);
    standaloneQuery?.addEventListener?.('change', handleDisplayModeChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
      standaloneQuery?.removeEventListener?.('change', handleDisplayModeChange);
    };
  }, []);

  if (installed) {
    return null;
  }

  const handleInstall = async () => {
    if (deferredPrompt) {
      const promptEvent = deferredPrompt;
      setDeferredPrompt(null);
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice?.catch(() => null);
      if (choice?.outcome === 'accepted') {
        setInstalled(true);
      }
      return;
    }

    setFallbackSheet(isIosSafari() ? 'ios' : 'unsupported');
  };

  return (
    <>
      <button
        aria-label="Install App"
        className="install-app-button"
        type="button"
        onClick={handleInstall}
      >
        <span aria-hidden="true">↓</span>
        <span>Install App</span>
      </button>

      {fallbackSheet ? (
        <div className="install-sheet-layer">
          <button
            aria-label="Tutup panduan install"
            className="install-sheet-backdrop"
            type="button"
            onClick={() => setFallbackSheet(null)}
          />
          <section
            aria-labelledby="install-sheet-title"
            aria-modal="true"
            className="install-sheet"
            role="dialog"
          >
            <div className="install-sheet-header">
              <h2 id="install-sheet-title">Install App</h2>
              <button
                aria-label="Tutup"
                className="reading-header-button"
                type="button"
                onClick={() => setFallbackSheet(null)}
              >
                ×
              </button>
            </div>
            {fallbackSheet === 'ios' ? (
              <ol>
                <li>Tap Share</li>
                <li>Pilih Add to Home Screen</li>
                <li>Tap Add</li>
              </ol>
            ) : (
              <p>
                Install aplikasi tersedia melalui browser yang mendukung PWA.
                Untuk hasil terbaik, buka aplikasi melalui Chrome di Android
                atau Safari di iPhone, lalu gunakan Add to Home Screen. Fitur
                install penuh biasanya tersedia setelah aplikasi dibuka lewat
                HTTPS.
              </p>
            )}
          </section>
        </div>
      ) : null}
    </>
  );
}

function isInstalledPwa() {
  return Boolean(
    window.matchMedia?.('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone,
  );
}

function isIosSafari() {
  const userAgent = navigator.userAgent;
  const isIos = /iPad|iPhone|iPod/.test(userAgent);
  const isWebKit = /Safari/.test(userAgent);
  const isOtherIosBrowser = /CriOS|FxiOS|EdgiOS|OPiOS/.test(userAgent);

  return isIos && isWebKit && !isOtherIosBrowser;
}
