import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { LocaleProvider } from '../i18n/locale';
import { events } from '../data/events';
import { EventDetail } from './EventDetail';

const event = events.find((item) => item.id === 'tang-founded')!;

test('renders the event narrative, relationships, evidence, and uncertainty', () => {
  render(<LocaleProvider><EventDetail event={event} onNavigate={vi.fn()} /></LocaleProvider>);

  expect(screen.getByRole('article', { name: '事件详情' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: '唐建立' })).toBeInTheDocument();
  expect(screen.getByText('李渊')).toBeInTheDocument();
  expect(screen.getByText('参与政权')).toBeInTheDocument();
  expect(screen.getByText('长安')).toBeInTheDocument();
  expect(screen.getByText('《资治通鉴》')).toBeInTheDocument();
  expect(screen.getByText(/不确定性/)).toBeInTheDocument();
});

test('renders a clear empty state when no detail record exists', () => {
  render(<LocaleProvider><EventDetail event={{ ...event, id: 'missing-event' }} /></LocaleProvider>);

  expect(screen.getByText('暂无已收录事件详情')).toBeInTheDocument();
});
