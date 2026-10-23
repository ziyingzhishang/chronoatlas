import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { getChanganStudyBundle } from '../data/changan-study';
import { capitalHistory } from '../data/capital-history';
import { claims } from '../data/claims';
import { events as historicalEvents } from '../data/events';
import { eventDetails } from '../data/event-details';
import { heritageAssets } from '../data/heritage';
import { people } from '../data/people';
import { places } from '../data/places';
import { polities } from '../data/polities';
import { polityDetails } from '../data/polity-details';
import { buildCityStudyView, buildPolityStudyView } from '../domain/study-view';
import { groupPersonRelationships } from '../domain/relationships';
import { LocaleProvider } from '../i18n/locale';
import { StudyRelationsPanel } from './StudyRelationsPanel';

const data = { polities, places, people, heritage: heritageAssets, events: getChanganStudyBundle().events, claims, capitalTerms: capitalHistory };
const completeData = { polities, places, people, heritage: heritageAssets, events: historicalEvents, claims, capitalTerms: capitalHistory };

describe('StudyRelationsPanel integration', () => {
  it('renders the polity perspective and its people', () => {
    const view = buildPolityStudyView('tang', 640, data);
    expect(view?.claims.map((claim) => claim.id)).toContain('claim-li-shimin-ruled-tang');
    expect(groupPersonRelationships('li-shimin', 640, view?.claims ?? [])['person-polity']).toHaveLength(1);
    render(<StudyRelationsPanel view={view!} />);

    expect(screen.getByText('政权视角')).toBeInTheDocument();
    expect(screen.getAllByText(/李世民/).length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText(/统治/).length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('唐在长安建立').length).toBeGreaterThanOrEqual(1);
  });

  it('renders new study labels in English', () => {
    localStorage.setItem('history-locale', 'en');
    const view = buildCityStudyView('changan', 650, data);
    render(<LocaleProvider><StudyRelationsPanel view={view!} /></LocaleProvider>);

    expect(screen.getByText('City perspective')).toBeInTheDocument();
    expect(screen.getByText('Related events')).toBeInTheDocument();
    expect(screen.getByText('Heritage and city memory')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sui' })).toBeInTheDocument();
    expect(screen.getAllByText(/Daming Palace Site|大明宫遗址/).length).toBeGreaterThanOrEqual(1);
    localStorage.removeItem('history-locale');
  });

  it('opens a capital place from the polity perspective summary', async () => {
    const view = buildPolityStudyView('tang', 640, data);
    const onOpenEntity = vi.fn();
    render(<StudyRelationsPanel view={view!} onOpenEntity={onOpenEntity} />);

    await userEvent.click(screen.getByRole('button', { name: '长安' }));

    expect(onOpenEntity).toHaveBeenCalledWith({ type: 'place', id: 'changan' });
  });

  it('keeps all four polity-summary entry points navigable for a non-Changan polity', async () => {
    const view = buildPolityStudyView('qin', -221, completeData);
    const onOpenEntity = vi.fn();
    render(<StudyRelationsPanel view={view!} onOpenEntity={onOpenEntity} />);
    const panel = screen.getByRole('region', { name: '历史关系研究视图' });

    expect(view?.people.some((person) => person.id === 'qin-shi-huang')).toBe(true);
    expect(view?.capitalPlaces.some((place) => place.id === 'xianyang')).toBe(true);
    expect(view?.events.some((event) => event.id === 'qin-unification')).toBe(true);
    expect(view?.heritage.some((asset) => asset.id === 'qin-xianyang-imperial-palace-site')).toBe(true);

    await userEvent.click(screen.getByRole('button', { name: '嬴政' }));
    await userEvent.click(screen.getByRole('button', { name: '咸阳' }));
    await userEvent.click(screen.getByRole('button', { name: '秦统一六国' }));
    await userEvent.click(screen.getByRole('button', { name: '秦帝国咸阳宫殿与都城遗址层' }));

    expect(onOpenEntity.mock.calls).toEqual(expect.arrayContaining([
      [{ type: 'person', id: 'qin-shi-huang' }],
      [{ type: 'place', id: 'xianyang' }],
      [{ type: 'event', id: 'qin-unification' }],
      [{ type: 'heritage', id: 'qin-xianyang-imperial-palace-site' }],
    ]));
    expect(panel).toBeInTheDocument();
  });

  it('shows detail-linked entries with an explicit non-current-fact boundary', async () => {
    const view = buildPolityStudyView('qing', 1636, { ...completeData, polityDetails });
    const onOpenEntity = vi.fn();
    render(<LocaleProvider><StudyRelationsPanel view={view!} onOpenEntity={onOpenEntity} /></LocaleProvider>);

    expect(screen.getByText('详情关联入口')).toBeInTheDocument();
    expect(screen.getByText(/仅表示详情关联，不等同于本年事实/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '努尔哈赤' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '努尔哈赤' }));
    expect(onOpenEntity).toHaveBeenCalledWith({ type: 'person', id: 'nurhaci' });
  });

  it('shows and opens transition references without promoting them to current facts', async () => {
    const view = buildPolityStudyView('zhou_northern', 581, { ...completeData, eventDetails, polityDetails });
    const onOpenEntity = vi.fn();
    render(<StudyRelationsPanel view={view!} onOpenEntity={onOpenEntity} />);

    expect(screen.getByText('详情关联过渡事件')).toBeInTheDocument();
    expect(screen.getByText('关联但非本年事实；政权归属以事件证据为准。')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '西魏建立' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '隋建立' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '西魏建立' }));
    await userEvent.click(screen.getByRole('button', { name: '隋建立' }));
    expect(onOpenEntity.mock.calls).toEqual(expect.arrayContaining([
      [{ type: 'event', id: 'western-wei-founded' }],
      [{ type: 'event', id: 'sui-founded' }],
    ]));
  });

  it('keeps every transition reference navigable from its owning polity view', async () => {
    const cases = [
      ['wei_three', 280, '西晋灭吴'],
      ['shu_three', 280, '西晋灭吴'],
      ['jin_eastern', 317, '西晋灭吴'],
      ['zhou_northern', 581, '西魏建立'],
      ['zhou_northern', 581, '隋建立'],
    ] as const;
    const onOpenEntity = vi.fn();

    for (const [polityId, year, eventTitle] of cases) {
      const view = buildPolityStudyView(polityId, year, { ...completeData, eventDetails, polityDetails });
      const rendered = render(<StudyRelationsPanel view={view!} onOpenEntity={onOpenEntity} />);
      await userEvent.click(screen.getByRole('button', { name: eventTitle }));
      expect(onOpenEntity).toHaveBeenCalledWith({
        type: 'event',
        id: eventTitle === '西晋灭吴' ? 'jin-unification' : eventTitle === '西魏建立' ? 'western-wei-founded' : 'sui-founded',
      });
      rendered.unmount();
    }
  });

  it('labels transition references in English', () => {
    localStorage.setItem('history-locale', 'en');
    const view = buildPolityStudyView('zhou_northern', 581, { ...completeData, eventDetails, polityDetails });
    render(<LocaleProvider><StudyRelationsPanel view={view!} /></LocaleProvider>);

    expect(screen.getByText('Related transition events')).toBeInTheDocument();
    expect(screen.getByText('Associated reference, not a fact of the selected year; polity attribution follows the event evidence.')).toBeInTheDocument();
    localStorage.removeItem('history-locale');
  });
});
