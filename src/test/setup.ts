import '@testing-library/jest-dom/vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';
import { afterEach, expect, vi } from 'vitest';
import { bundledHistoricalStateSource } from '../content/bundled-adapter';
import { setDefaultHistoricalStateSourceForTests } from '../domain/history-state';

expect.extend(matchers);

vi.mock('maplibre-gl', async () => {
  const { TestMap } = await import('./maplibre-mock');
  return { Map: TestMap, ScaleControl: class {}, setWorkerUrl:vi.fn() };
});
vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} });
setDefaultHistoricalStateSourceForTests(bundledHistoricalStateSource);

afterEach(() => cleanup());
