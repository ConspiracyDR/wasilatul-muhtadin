import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource/amiri/arabic-400.css';
import '@fontsource/noto-naskh-arabic/400.css';
import '@fontsource/noto-naskh-arabic/600.css';
import '@fontsource/scheherazade-new/arabic-400.css';
import './styles/global.css';
import { App } from './app/App';
import { registerAppServiceWorker } from './app/pwa-update';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

registerAppServiceWorker();
