import { describe, expect, it } from 'vitest';
import { buildCityStudyView } from '../domain/study-view';
import { capitalHistory } from './capital-history';
import { eventDetails } from './event-details';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { claims } from './claims';

const data = { polities, places, people, heritage: heritageAssets, events, claims, capitalTerms: capitalHistory };

describe('round 103 city perspective audit', () => {
  it('keeps every capital-history record connected to a modern place and polity layer', () => {
    for (const record of capitalHistory) {
      const place = places.find((item) => item.id === record.placeId);
      const city = buildCityStudyView(record.placeId, Number.POSITIVE_INFINITY, data);

      expect(place?.modernName, `${record.polityId} -> ${record.placeId} modern name`).toBeTruthy();
      expect(city?.polities.map((item) => item.id), `${record.polityId} -> ${record.placeId} polity layer`).toContain(record.polityId);

      const polityPeople = people.filter((person) => person.polityIds?.includes(record.polityId));
      if (polityPeople.length > 0) {
        expect(city?.people.map((person) => person.id), `${record.polityId} -> ${record.placeId} people layer`).toEqual(expect.arrayContaining(polityPeople.map((person) => person.id)));
      }
    }
  });

  it('closes the Pyongyang capital phase through event, heritage and people details', () => {
    const city = buildCityStudyView('pyongyang', Number.POSITIVE_INFINITY, data);
    const event = events.find((item) => item.id === 'goguryeo-moves-pyongyang');
    const eventDetail = eventDetails.find((item) => item.eventId === event?.id);
    const heritage = heritageAssets.find((item) => item.id === 'goguryeo-pyongyang-city-layer');
    const heritageDetail = getHeritageDetail(heritage?.id ?? '');

    expect(city?.subject.modernName).toBe('平壤市');
    expect(city?.capitalTerms).toEqual(expect.arrayContaining([
      expect.objectContaining({ polityId: 'goguryeo', placeId: 'pyongyang', validFrom: 427, validTo: 668 }),
    ]));
    expect(city?.polities.map((item) => item.id)).toContain('goguryeo');
    expect(city?.events.map((item) => item.id)).toContain('goguryeo-moves-pyongyang');
    expect(city?.heritage.map((item) => item.id)).toContain('goguryeo-pyongyang-city-layer');
    expect(city?.people.map((item) => item.id)).toEqual(expect.arrayContaining(['gwanggaeto', 'jangsu-goguryeo']));
    expect(event).toEqual(expect.objectContaining({ year: 427, placeId: 'pyongyang' }));
    expect(eventDetail).toEqual(expect.objectContaining({
      locationIds: expect.arrayContaining(['pyongyang']),
      polityIds: expect.arrayContaining(['goguryeo']),
      participants: expect.arrayContaining([
        expect.objectContaining({ personId: 'jangsu-goguryeo' }),
      ]),
    }));
    expect(heritage).toEqual(expect.objectContaining({ placeId: 'pyongyang', constructionFrom: 427, constructionTo: 668 }));
    expect(heritageDetail).toEqual(expect.objectContaining({
      associatedPeople: expect.arrayContaining(['jangsu-goguryeo']),
      associatedPolities: expect.arrayContaining(['goguryeo']),
      associatedEvents: expect.arrayContaining(['goguryeo-moves-pyongyang']),
    }));
  });
});
