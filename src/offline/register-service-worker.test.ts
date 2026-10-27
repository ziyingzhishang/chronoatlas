import { describe, expect, it, vi } from 'vitest';
import { registerOfflineServiceWorker } from './register-service-worker';

describe('registerOfflineServiceWorker', () => {
  it('registers the base-aware worker only in a production secure context', async () => {
    const register = vi.fn().mockResolvedValue({});

    await registerOfflineServiceWorker({
      production: true,
      secureContext: true,
      baseUrl: '/chronoatlas/',
      serviceWorker: { register } as unknown as ServiceWorkerContainer,
    });

    expect(register).toHaveBeenCalledWith('/chronoatlas/sw.js', { scope: '/chronoatlas/' });
  });

  it.each([
    { production: false, secureContext: true },
    { production: true, secureContext: false },
  ])('does not register outside a secure production context: %o', async ({ production, secureContext }) => {
    const register = vi.fn();

    await registerOfflineServiceWorker({
      production,
      secureContext,
      baseUrl: '/',
      serviceWorker: { register } as unknown as ServiceWorkerContainer,
    });

    expect(register).not.toHaveBeenCalled();
  });

  it.each(['https://evil.example/', '//evil.example/', '/../escape/', '/atlas?debug/'])('rejects an unsafe service worker base: %s', async (baseUrl) => {
    await expect(registerOfflineServiceWorker({
      production: true,
      secureContext: true,
      baseUrl,
      serviceWorker: { register: vi.fn() } as unknown as ServiceWorkerContainer,
    })).rejects.toThrow(/safe root-relative/i);
  });
});
