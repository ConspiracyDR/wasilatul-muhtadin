import { appConfig } from '../config/app-config';

export function AppHeader({ onHome }: { onHome: () => void }) {
  return (
    <header className="app-header">
      <button
        aria-label="Buka beranda"
        className="brand-button"
        type="button"
        onClick={onHome}
      >
        <img alt="" height="40" src={appConfig.logoPath} width="40" />
        <span>
          <strong>{appConfig.shortName}</strong>
          <small>{appConfig.majelisName}</small>
        </span>
      </button>
    </header>
  );
}
