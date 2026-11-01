import { render, screen } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { LocaleProvider } from '../i18n/locale';
import { CollapsedTimeControls } from './CollapsedTimeControls';

afterEach(() => localStorage.clear());

test('expanded controls omit the duplicate year and year step actions', () => {
  const onYearChange = vi.fn();
  const onPlayToggle = vi.fn();
  render(<LocaleProvider><CollapsedTimeControls
    year={-1}
    showRail={false}
    isPlaying={false}
    onYearChange={onYearChange}
    onPlayToggle={onPlayToggle}
  /></LocaleProvider>);

  const controls = screen.getByRole('group', { name: '简明时间控制' });
  expect(controls).not.toHaveTextContent('前1年');
  expect(screen.queryByRole('button', { name: '上一年' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: '下一年' })).not.toBeInTheDocument();
  expect(onYearChange).not.toHaveBeenCalled();
  expect(screen.queryByRole('button', { name: '播放' })).not.toBeInTheDocument();
  expect(onPlayToggle).not.toHaveBeenCalled();
});

test('omits playback actions even while playback is active', () => {
  render(<LocaleProvider><CollapsedTimeControls
    year={2026}
    showRail={false}
    isPlaying
    onYearChange={() => {}}
    onPlayToggle={() => {}}
  /></LocaleProvider>);

  expect(screen.queryByRole('button', { name: '暂停' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: '下一年' })).not.toBeInTheDocument();
});
