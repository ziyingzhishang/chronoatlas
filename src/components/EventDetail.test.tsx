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

test('renders the audited approximate time evidence and timeline permission', () => {
  const event = events.find((item) => item.id === 'dali-founded')!;
  render(<LocaleProvider><EventDetail event={event} onNavigate={vi.fn()} /></LocaleProvider>);

  expect(screen.getByText('约年')).toBeInTheDocument();
  expect(screen.getByText(/可定位到时间轴/)).toBeInTheDocument();
  expect(screen.getByText('937年前后表示大理政权形成，杨干贞改国号与段氏承接等节点不能混为精确建国日。')).toBeInTheDocument();
  expect(screen.getAllByText(/中国历史分期与朝代年表/)).toHaveLength(2);
});

test('renders confirmed and unknown event time review states separately', () => {
  const confirmedEvent = events.find((item) => item.id === 'an-lushan-rebellion')!;
  render(<LocaleProvider><EventDetail event={confirmedEvent} onNavigate={vi.fn()} /></LocaleProvider>);
  expect(screen.getByText('已确证')).toBeInTheDocument();
  expect(screen.getByText(/可定位到时间轴/)).toBeInTheDocument();

  const unreviewedEvent = events.find((item) => item.id === 'tang-founded')!;
  render(<LocaleProvider><EventDetail event={unreviewedEvent} onNavigate={vi.fn()} /></LocaleProvider>);
  expect(screen.getByText('未知')).toBeInTheDocument();
  expect(screen.getByText(/暂不允许时间轴定位/)).toBeInTheDocument();
});
