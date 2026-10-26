import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, test, vi } from 'vitest';
import { LocaleProvider } from '../i18n/locale';
import { CollapsedTimeControls } from './CollapsedTimeControls';

afterEach(() => localStorage.clear());

test('shows the current historical reading and steps across the absent year zero', async () => {
  const onYearChange = vi.fn();
  const onPlayToggle = vi.fn();
  render(<LocaleProvider><CollapsedTimeControls
    year={-1}
    eraLabel="西汉"
    isPlaying={false}
    onYearChange={onYearChange}
    onPlayToggle={onPlayToggle}
  /></LocaleProvider>);

  const controls = screen.getByRole('group', { name: '简明时间控制' });
  expect(controls).toHaveTextContent('前1年');
  expect(controls).toHaveTextContent('西汉');
  await userEvent.click(screen.getByRole('button', { name: '下一年' }));
  expect(onYearChange).toHaveBeenCalledWith(1);
  await userEvent.click(screen.getByRole('button', { name: '播放' }));
  expect(onPlayToggle).toHaveBeenCalledOnce();
});

test('exposes pause while playback is active and disables the upper timeline boundary', () => {
  render(<LocaleProvider><CollapsedTimeControls
    year={2026}
    eraLabel="中华人民共和国"
    isPlaying
    onYearChange={() => {}}
    onPlayToggle={() => {}}
  /></LocaleProvider>);

  expect(screen.getByRole('button', { name: '暂停' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '下一年' })).toBeDisabled();
});
