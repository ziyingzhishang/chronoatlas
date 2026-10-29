import { StrictMode, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import './styles/theme.css';
import { registerOfflineServiceWorker } from './offline/register-service-worker';
import { IndexedDbPackageStore } from './offline/indexeddb-package-store';
import { HistoricalDataRepository } from './content/repository';
import { bundledHistoricalSnapshot } from './content/bundled-content';
import { createReleaseRuntime } from './offline/browser-release-runtime';

void registerOfflineServiceWorker().catch((error) => {
  console.warn('Offline service worker registration failed', error);
});

const root = createRoot(document.getElementById('root')!);

void renderApplication();

async function renderApplication() {
  if (!import.meta.env.PROD) {
    render(<App/>);
    return;
  }
  try {
    const store = await IndexedDbPackageStore.open();
    await store.cleanupAbandonedStaging();
    const runtime = await createReleaseRuntime({
      store,
      remote: new HistoricalDataRepository(),
      fallback: bundledHistoricalSnapshot,
    });
    render(<App contentRepository={runtime.repository} offlineRuntime={runtime}/>);
  } catch (error) {
    console.warn('Versioned historical data runtime is unavailable; using bundled content', error);
    render(<App/>);
  }
}

function render(app: ReactNode) {
  root.render(<StrictMode>{app}</StrictMode>);
}
