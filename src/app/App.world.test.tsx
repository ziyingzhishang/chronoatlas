import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, test, vi } from 'vitest';
import { bundledReleaseManifest } from '../content/bundled-content';

const useWorldSlice = vi.hoisted(() => vi.fn());
vi.mock('../data/world', () => ({ useWorldSlice }));

import { App } from './App';

beforeEach(() => {
  useWorldSlice.mockReset();
  useWorldSlice.mockImplementation((_year: number, enabled: boolean, release: typeof bundledReleaseManifest | undefined) => ({
    status: !enabled ? 'off' : release?.releaseId === bundledReleaseManifest.releaseId ? 'ready' : 'error',
    slice: undefined,
    retry: vi.fn(),
  }));
});

test('binds world loading to the release currently supplied by content context', async () => {
  render(<App/>);

  await userEvent.click(screen.getByRole('checkbox', { name: '同期世界疆域' }));

  expect(await screen.findByText(/^世界 0 个来源实体/)).toBeInTheDocument();
  expect(screen.queryByText(/世界资料加载失败/)).not.toBeInTheDocument();
});
