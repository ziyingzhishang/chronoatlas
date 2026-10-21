import { describe, expect, it } from 'vitest';
import type { HistoricalClaim, HistoricalEvent, HeritageAsset, Person, Place, Polity } from './types';
import type { StudyData } from './study-view';
import { buildCityStudyView } from './study-view';
import { buildCityHistoryTimeline } from './city-timeline';

const city: Place = {
  id: 'test-city', historicalName: '测试城', modernName: '今测试市', aliases: [],
  longitude: 0, latitude: 0, sourceIds: ['test-source'],
};

const polity: Polity = {
  id: 'test-polity', name: '测试政权', type: 'dynasty', startYear: 0, endYear: 100,
  capitalPlaceId: city.id, color: '#000000', description: '测试政权', sourceIds: ['test-source'],
};

const person: Person = {
  id: 'test-person', name: '测试人物', polityIds: [polity.id], description: '测试人物', sourceIds: ['test-source'],
};

const earlyEvent: HistoricalEvent = {
  id: 'test-event-early', year: 10, title: '早期事件', summary: '城市中的早期事件', placeId: city.id, sourceIds: ['test-source'],
};

const futureEvent: HistoricalEvent = {
  id: 'test-event-future', year: 50, title: '后期事件', summary: '尚未发生的事件', placeId: city.id, sourceIds: ['test-source'],
};

const heritage: HeritageAsset = {
  id: 'test-heritage', name: '测试遗产', placeId: city.id, type: 'city-site', constructionFrom: 5,
  modernStatus: 'archaeological-site', description: '测试遗产', sourceIds: ['test-source'],
};

const claims: HistoricalClaim[] = [
  {
    id: 'test-capital-claim', subjectId: polity.id, predicate: 'capital-of', objectId: city.id,
    validFrom: 0, validTo: 100, datePrecision: 'range', perspective: 'city', evidenceType: 'explicit-record', confidence: 'high', sourceIds: ['test-source'],
  },
  {
    id: 'test-polity-event-claim', subjectId: polity.id, predicate: 'formed-in', objectId: earlyEvent.id,
    validFrom: 10, validTo: 10, datePrecision: 'year', perspective: 'city', evidenceType: 'explicit-record', confidence: 'high', sourceIds: ['test-source'],
  },
  {
    id: 'test-person-event-claim', subjectId: person.id, predicate: 'participated-in', objectId: earlyEvent.id,
    validFrom: 10, validTo: 10, datePrecision: 'year', perspective: 'city', evidenceType: 'explicit-record', confidence: 'high', sourceIds: ['test-source'],
  },
  {
    id: 'test-polity-heritage-claim', subjectId: polity.id, predicate: 'left-heritage', objectId: heritage.id,
    validFrom: 5, validTo: 100, datePrecision: 'range', perspective: 'city', evidenceType: 'archaeology', confidence: 'high', sourceIds: ['test-source'],
  },
];

const capitalTerms = [{
  polityId: polity.id, placeId: city.id, validFrom: 0, validTo: 100,
  role: 'primary' as const, status: 'formal' as const, confidence: 'high' as const, sourceIds: ['test-source'],
}];

const data: StudyData = {
  polities: [polity], places: [city], people: [person], heritage: [heritage],
  events: [earlyEvent, futureEvent], claims, capitalTerms,
};

describe('fifteenth batch city-perspective coverage', () => {
  it('filters future city layers and exposes a deduplicated polity-event-person-heritage relation chain', () => {
    const view = buildCityStudyView(city.id, 20, data);

    expect(view?.events.map((event) => event.id)).toEqual([earlyEvent.id]);
    expect(view?.heritage.map((asset) => asset.id)).toEqual([heritage.id]);
    expect(view?.relations).toEqual(expect.arrayContaining([
      expect.objectContaining({ from: { type: 'polity', id: polity.id }, to: { type: 'event', id: earlyEvent.id } }),
      expect.objectContaining({ from: { type: 'person', id: person.id }, to: { type: 'event', id: earlyEvent.id } }),
      expect.objectContaining({ from: { type: 'polity', id: polity.id }, to: { type: 'heritage', id: heritage.id } }),
    ]));
    expect(new Set(view?.relations?.map((relation) => relation.id)).size).toBe(view?.relations?.length);
  });

  it('deduplicates repeated city timeline entities while retaining historical relations', () => {
    const timeline = buildCityHistoryTimeline(city.id, {
      ...data,
      polities: [polity, polity], events: [earlyEvent, earlyEvent], heritage: [heritage, heritage], people: [person, person],
    });

    expect(timeline.nodes.filter((node) => node.entity.type === 'polity' && node.entity.id === polity.id)).toHaveLength(1);
    expect(timeline.nodes.filter((node) => node.entity.type === 'event' && node.entity.id === earlyEvent.id)).toHaveLength(1);
    expect(timeline.nodes.filter((node) => node.entity.type === 'heritage' && node.entity.id === heritage.id)).toHaveLength(1);
    expect(timeline.relations?.some((relation) => relation.to.id === earlyEvent.id)).toBe(true);
  });
});
