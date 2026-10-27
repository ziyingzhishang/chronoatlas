export interface ServiceWorkerRegistrationOptions {
  production?: boolean;
  secureContext?: boolean;
  baseUrl?: string;
  serviceWorker?: ServiceWorkerContainer;
}

export async function registerOfflineServiceWorker(options: ServiceWorkerRegistrationOptions = {}) {
  const production = options.production ?? import.meta.env.PROD;
  const secureContext = options.secureContext ?? globalThis.isSecureContext;
  const serviceWorker = options.serviceWorker ?? globalThis.navigator?.serviceWorker;
  if (!production || !secureContext || !serviceWorker) return undefined;

  const baseUrl = normalizeBase(options.baseUrl ?? import.meta.env.BASE_URL);
  return serviceWorker.register(`${baseUrl}sw.js`, { scope: baseUrl });
}

function normalizeBase(value: string) {
  if (!value.startsWith('/') || value.startsWith('//') || /[\\?#\u0000-\u0020]/.test(value)) {
    throw new Error('Service worker base must be a safe root-relative path');
  }
  let decoded = value;
  for (let pass = 0; pass < 4; pass += 1) {
    const next = decodeURIComponent(decoded);
    if (next === decoded) break;
    decoded = next;
  }
  if (decoded.startsWith('//') || /[\\?#\u0000-\u0020]/.test(decoded)
    || decoded.split('/').some((segment) => segment === '.' || segment === '..')) {
    throw new Error('Service worker base must be a safe root-relative path');
  }
  const base = decoded;
  return base.endsWith('/') ? base : `${base}/`;
}
