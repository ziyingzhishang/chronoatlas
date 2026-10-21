import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

vi.mock('maplibre-gl', async () => {
  const { TestMap } = await import('./maplibre-mock');
  return { Map: TestMap, ScaleControl: class {}, setWorkerUrl:vi.fn() };
});
vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} });

afterEach(() => cleanup());
