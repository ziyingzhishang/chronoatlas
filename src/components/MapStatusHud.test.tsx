import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, test, vi } from 'vitest';
import { LocaleProvider } from '../i18n/locale';
import { MapStatusHud } from './MapStatusHud';

afterEach(() => localStorage.clear());

test('presents year, era, time range, and distance in reader order', async () => {
  const onToggle = vi.fn();
  render(<LocaleProvider><MapStatusHud
    yearLabel="800年"
    eraLabel="唐"
    viewLabel="王朝至今"
    distanceLabel="距今1226年"
    windowLabel="当前视窗 · 前2070年—2026年"
    expanded={false}
    onToggle={onToggle}
  /></LocaleProvider>);

  const button = screen.getByRole('button', { name: '当前历史状态' });
  expect(within(button).getByText('800年')).toHaveClass('map-status-year');
  expect(button.textContent).toBe('800年唐王朝至今距今1226年当前视窗 · 前2070年—2026年');
  expect(button).toHaveAttribute('aria-expanded', 'false');
  await userEvent.click(button);
  expect(onToggle).toHaveBeenCalledOnce();
});

test('omits the era element when no readable polity name is available', () => {
  const { container } = render(<LocaleProvider><MapStatusHud
    yearLabel="前1500年"
    viewLabel="王朝至今"
    distanceLabel="距今3525年"
    windowLabel="当前视窗 · 前2070年—2026年"
    expanded={false}
    onToggle={() => {}}
  /></LocaleProvider>);

  expect(container.querySelector('.map-status-era')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: '当前历史状态' })).not.toHaveTextContent(/undefined|polity-|unknown/i);
});
