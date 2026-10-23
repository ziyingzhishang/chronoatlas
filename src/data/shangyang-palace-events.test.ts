import { describe, expect, it } from 'vitest';

import { getEventDetail } from './event-details';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { getPolityDetail } from './polity-details';
import { sourceById } from './sources';

describe('Shangyang Palace event endpoints', () => {
  it('keeps Tang construction and completion/use as separate sourced endpoints', () => {
    const built = events.find((event) => event.id === 'shangyang-palace-built');
    const completed = events.find((event) => event.id === 'shangyang-palace-completed-679');
    const builtDetail = getEventDetail('shangyang-palace-built');
    const completedDetail = getEventDetail('shangyang-palace-completed-679');

    expect(built).toMatchObject({ year: 674, endYear: 676, placeId: 'luoyang', datePrecision: 'range', verification: 'partial' });
    expect(completed).toMatchObject({ year: 679, placeId: 'luoyang', datePrecision: 'year', verification: 'checked' });
    expect(builtDetail?.polityIds).toEqual(['tang']);
    expect(completedDetail?.polityIds).toEqual(['tang']);
    expect(builtDetail?.relatedEventIds).toEqual(['shangyang-palace-completed-679']);
    expect(completedDetail?.relatedEventIds).toEqual(['shangyang-palace-built']);
    expect([...new Set([...(built?.sourceIds ?? []), ...(completed?.sourceIds ?? [])])]
      .every((sourceId) => sourceById[sourceId])).toBe(true);
  });

  it('connects the heritage node to both Tang endpoints without inventing a Wuzhou construction event', () => {
    const heritage = getHeritageDetail('shangyang-palace-site');
    const tang = getPolityDetail('tang');
    const wuzhou = getPolityDetail('wu_zhou');

    expect(heritage?.associatedEvents).toEqual([
      'shangyang-palace-built',
      'shangyang-palace-completed-679',
      'tang-founded',
      'wu-zhou-founded',
    ]);
    expect(tang?.eventIds).toEqual(expect.arrayContaining(['shangyang-palace-built', 'shangyang-palace-completed-679']));
    expect(wuzhou?.eventIds).not.toContain('shangyang-palace-built');
    expect(wuzhou?.eventIds).not.toContain('shangyang-palace-completed-679');
  });
});
