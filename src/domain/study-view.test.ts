import { describe, expect, it } from 'vitest';
import { capitalHistory } from '../data/capital-history';
import { claims } from '../data/claims';
import { changanEvents } from '../data/changan-study';
import { heritageAssets } from '../data/heritage';
import { people } from '../data/people';
import { places } from '../data/places';
import { polities } from '../data/polities';
import { buildCityStudyView, buildPolityStudyView } from './study-view';

const data = { polities, places, people, heritage: heritageAssets, events: changanEvents, claims, capitalTerms: capitalHistory };

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
});
