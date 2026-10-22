import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { getChanganStudyBundle } from '../data/changan-study';
import { capitalHistory } from '../data/capital-history';
import { claims } from '../data/claims';
import { events as historicalEvents } from '../data/events';
import { heritageAssets } from '../data/heritage';
import { people } from '../data/people';
import { places } from '../data/places';
import { polities } from '../data/polities';
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
});
