import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { LocaleProvider } from '../i18n/locale';
import { events } from '../data/events';
import { changanEvents } from '../data/changan-study';
import { EventDetail } from './EventDetail';

const event = events.find((item) => item.id === 'tang-founded')!;

test('renders the event narrative, relationships, evidence, and uncertainty', () => {
  render(<LocaleProvider><EventDetail event={event} onNavigate={vi.fn()} /></LocaleProvider>);

  expect(screen.getByRole('article', { name: '事件详情' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: '唐建立' })).toBeInTheDocument();
  expect(screen.getAllByText(/618年/).length).toBeGreaterThan(0);
  expect(screen.getByText('李渊')).toBeInTheDocument();
  expect(screen.getByText('参与政权')).toBeInTheDocument();
  expect(screen.getByText('长安')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '隋统一南北' })).toBeInTheDocument();
  expect(screen.getByText('《资治通鉴》')).toBeInTheDocument();
  expect(screen.getByText('现代地理位置参照')).toBeInTheDocument();
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
  expect(screen.getByText('937年前后表示大理政权形成；《滇载记》按后晋天福二年记937年，而国家社科成果摘要采用938年，杨干贞改国号、段氏承接和高氏阶段不能混为精确建国日，因此保留约年。')).toBeInTheDocument();
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

test('resolves and navigates a related city-history event by its catalog title', async () => {
  const onNavigate = vi.fn();
  const event = changanEvents.find((item) => item.id === 'han-changan-new-city')!;
  render(<LocaleProvider><EventDetail event={event} onNavigate={onNavigate} /></LocaleProvider>);

  const relatedEvent = screen.getByRole('button', { name: '汉定都长安' });
  await userEvent.click(relatedEvent);

  expect(onNavigate).toHaveBeenCalledWith({ type: 'event', id: 'changan-han-capital' });
});

test('navigates every event detail relationship category', async () => {
  const onNavigate = vi.fn();
  render(<LocaleProvider><EventDetail event={event} onNavigate={onNavigate} /></LocaleProvider>);

  await userEvent.click(screen.getByRole('button', { name: '李渊' }));
  await userEvent.click(screen.getByRole('button', { name: '唐' }));
  await userEvent.click(screen.getByRole('button', { name: '长安' }));
  await userEvent.click(screen.getByRole('button', { name: '隋统一南北' }));

  expect(onNavigate.mock.calls).toEqual([
    [{ type: 'person', id: 'li-yuan' }],
    [{ type: 'polity', id: 'tang' }],
    [{ type: 'place', id: 'changan' }],
    [{ type: 'event', id: 'sui-unification' }],
  ]);
});

test('accepts the shared onOpenEntity callback for related entities', async () => {
  const onOpenEntity = vi.fn();
  render(<LocaleProvider><EventDetail event={event} onOpenEntity={onOpenEntity} /></LocaleProvider>);

  await userEvent.click(screen.getByRole('button', { name: '李渊' }));

  expect(onOpenEntity).toHaveBeenCalledWith({ type: 'person', id: 'li-yuan' });
});

test('keeps bibliographic citations as text instead of invalid links', () => {
  render(<LocaleProvider><EventDetail event={event} detail={{
    eventId: event.id,
    causes: [],
    consequences: [],
    participants: [],
    polityIds: [],
    locationIds: [],
    relatedEventIds: [],
    sourceIds: ['zizhi-tongjian'],
  }} /></LocaleProvider>);

  expect(screen.getByText('《资治通鉴》')).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: '《资治通鉴》' })).not.toBeInTheDocument();
});

test('splits multi-link citations and exposes source resolution status', () => {
  render(<LocaleProvider><EventDetail event={event} detail={{
    eventId: event.id,
    causes: [],
    consequences: [],
    participants: [],
    polityIds: [],
    locationIds: [],
    relatedEventIds: [],
    sourceIds: ['luoyang-baimasi-official', 'missing-source'],
  }} /></LocaleProvider>);

  expect(screen.getAllByRole('link', { name: '洛阳白马寺官方历史与保护资料' })).toHaveLength(2);
  expect(screen.getAllByRole('link', { name: '洛阳白马寺官方历史与保护资料' })[0]).toHaveAttribute('href', 'https://www.mct.gov.cn/preview/special/3578/3597/201203/t20120330_235404.html');
  expect(screen.getByText(/来源未解析/)).toBeInTheDocument();
});
