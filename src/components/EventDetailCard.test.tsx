import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { LocaleProvider } from '../i18n/locale';
import { events } from '../data/events';
import { EventDetailCard } from './EventDetailCard';

const event = events.find(item => item.id === 'qin-unification')!;

test('renders event narrative and supports returning to the event list', async () => {
  const onBack = vi.fn();
  render(<LocaleProvider><EventDetailCard event={event} year={-221} onYearChange={vi.fn()} onBack={onBack} /></LocaleProvider>);
  expect(screen.getByRole('heading', { name: '秦统一六国' })).toBeInTheDocument();
  expect(screen.getByText('秦经过连续战争，已击败韩、赵、魏、楚、燕等国，齐成为最后的主要对手。')).toBeInTheDocument();
  expect(screen.queryByText('参与者')).not.toBeInTheDocument();
  expect(screen.queryByText('关联地点')).not.toBeInTheDocument();
  expect(screen.queryByText('不确定性')).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: /返回事件列表/ }));
  expect(onBack).toHaveBeenCalledOnce();
});

test('moves to the event year when stepping before or after the event', async () => {
  const onYearChange = vi.fn();
  render(<LocaleProvider><EventDetailCard event={event} year={-221} onYearChange={onYearChange} onBack={vi.fn()} /></LocaleProvider>);
  await userEvent.click(screen.getByRole('button', { name: '事件前一年' }));
  expect(onYearChange).toHaveBeenCalledWith(-222);
});
