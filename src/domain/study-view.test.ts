import { describe, expect, it } from 'vitest';
import { capitalHistory } from '../data/capital-history';
import { claims } from '../data/claims';
import { changanEvents } from '../data/changan-study';
import { eventDetails } from '../data/event-details';
import { events } from '../data/events';
import { heritageAssets } from '../data/heritage';
import { people } from '../data/people';
import { places } from '../data/places';
import { polities } from '../data/polities';
import { polityDetails } from '../data/polity-details';
import { buildCityStudyView, buildPolityStudyView } from './study-view';

const data = { polities, places, people, heritage: heritageAssets, events: changanEvents, eventDetails, claims, capitalTerms: capitalHistory };
const detailEvents = events.filter((event) => [
  'ximing-temple-built',
  'xuanzang-at-ximing-658',
  'shangyang-palace-built',
  'shangyang-palace-completed-679',
].includes(event.id));

describe('study views', () => {
  it('builds a polity-perspective view at a historical year', () => {
    const view = buildPolityStudyView('tang', 650, data);
    expect(view?.subject.name).toBe('唐');
    expect(view?.capitalTerms.some((term) => term.placeId === 'changan')).toBe(true);
    expect(view?.people.some((person) => person.id === 'li-shimin')).toBe(true);
    expect(view?.claims.every((claim) => claim.validFrom === undefined || claim.validFrom <= 650)).toBe(true);
  });

  it('builds a city-perspective view across regimes', () => {
    const view = buildCityStudyView('changan', 650, data);
    expect(view?.subject.modernName).toBe('西安市');
    expect(view?.polities.map((polity) => polity.id)).toEqual(expect.arrayContaining(['sui', 'tang']));
    expect(view?.heritage.some((asset) => asset.id === 'daming-palace-site')).toBe(true);
    expect(view?.events.some((event) => event.id === 'daming-palace-built')).toBe(true);
  });

  it('prioritizes explicit polity links for Tang event visibility', () => {
    const view = buildPolityStudyView('tang', 658, {
      ...data,
      events: [...changanEvents, ...detailEvents, {
        id: 'sui-only-shared-source-event',
        year: 650,
        title: '测试隋事件',
        summary: '测试事件',
        sourceIds: ['zizhi-tongjian'],
      }],
      eventDetails: [...eventDetails, {
        eventId: 'sui-only-shared-source-event',
        participants: [],
        polityIds: ['sui'],
        causes: [],
        consequences: [],
        locationIds: [],
        relatedEventIds: [],
        sourceIds: ['zizhi-tongjian'],
      }],
    });
    expect(view?.events.some((event) => event.id === 'ximing-temple-built')).toBe(true);
    expect(view?.events.some((event) => event.id === 'sui-only-shared-source-event')).toBe(false);
  });

  it('includes Tang event details for Ximing Temple and Shangyang Palace', () => {
    const eventsData = { ...data, events: [...changanEvents, ...detailEvents] };
    const ximingView = buildPolityStudyView('tang', 658, eventsData);
    const shangyangConstructionView = buildPolityStudyView('tang', 676, eventsData);
    const shangyangView = buildPolityStudyView('tang', 679, eventsData);

    expect(ximingView?.events.map((event) => event.id)).toEqual(expect.arrayContaining([
      'ximing-temple-built',
      'xuanzang-at-ximing-658',
    ]));
    expect(shangyangConstructionView?.events.some((event) => event.id === 'shangyang-palace-built')).toBe(true);
    expect(shangyangView?.events.some((event) => event.id === 'shangyang-palace-completed-679')).toBe(true);
  });

  it('keeps detail-linked entries separate from current-year facts', () => {
    const qingView = buildPolityStudyView('qing', 1636, { ...data, polityDetails });
    expect(qingView?.people.some((person) => person.id === 'nurhaci')).toBe(false);
    expect(qingView?.detailLinkedPeople.some((person) => person.id === 'nurhaci')).toBe(true);

    const weiView = buildPolityStudyView('wei_three', 280, { ...data, polityDetails });
    expect(weiView?.events.some((event) => event.id === 'jin-unification')).toBe(false);
    expect(weiView?.detailLinkedEvents.some((event) => event.id === 'jin-unification')).toBe(false);
  });

  it('exposes detail-linked heritage only within its own construction window', () => {
    const tangView = buildPolityStudyView('tang', 650, { ...data, polityDetails });
    const lateTangView = buildPolityStudyView('tang', 950, { ...data, polityDetails });

    expect(tangView?.detailLinkedHeritage.some((asset) => asset.id === 'luoyang-sui-tang-city-site')).toBe(true);
    expect(lateTangView?.detailLinkedHeritage.some((asset) => asset.id === 'luoyang-sui-tang-city-site')).toBe(false);
  });
});
