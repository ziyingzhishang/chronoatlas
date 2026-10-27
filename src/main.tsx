import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import './styles/theme.css';
import { registerOfflineServiceWorker } from './offline/register-service-worker';

void registerOfflineServiceWorker().catch((error) => {
  console.warn('Offline service worker registration failed', error);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
