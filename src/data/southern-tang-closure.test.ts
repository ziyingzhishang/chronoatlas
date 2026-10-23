import { describe, expect, it } from 'vitest';
import { claims } from './claims';
import { eventDetails } from './event-details';
import { events } from './events';
import { getPolityDetail } from './polity-details';
import { places } from './places';
import { sourceById } from './sources';
import { heritageAssets } from './heritage';
import { heritageDetails } from './heritage-details';
import { people } from './people';
import { personDetails } from './person-details';
import { capitalHistory } from './capital-history';

const eventById = (id: string) => events.find((event) => event.id === id);
const eventDetailById = (id: string) => eventDetails.find((detail) => detail.eventId === id);

describe('南唐三代君主与首都遗产闭环', () => {
  it('records the Jinling–Yuzhang–Jiankang capital transition', () => {
    expect(capitalHistory.filter((item) => item.polityId === 'southern_tang').map(({ placeId, validFrom, validTo }) => ({ placeId, validFrom, validTo }))).toEqual([
      { placeId: 'jiankang', validFrom: 937, validTo: 960 },
      { placeId: 'nanchang', validFrom: 961, validTo: 961 },
      { placeId: 'jiankang', validFrom: 961, validTo: 975 },
    ]);
    expect(places.find((place) => place.id === 'nanchang')).toEqual(expect.objectContaining({
      historicalName: '豫章／洪州',
      modernName: '南昌市',
    }));
  });

  it('connects Li Jing to people, events, office and kinship edges', () => {
    expect(people.find((person) => person.id === 'li-jing')?.polityIds).toContain('southern_tang');
    expect(personDetails.find((detail) => detail.personId === 'li-jing')?.keyEvents).toEqual(expect.arrayContaining([
      'southern-tang-li-jing-succeeds', 'southern-tang-conquers-min', 'southern-tang-conquers-chu', 'southern-tang-cedes-huainan', 'southern-tang-moves-nanchang',
    ]));
    expect(claims).toEqual(expect.arrayContaining([
      expect.objectContaining({ subjectId: 'li-bian', predicate: 'parent-of', objectId: 'li-jing' }),
      expect.objectContaining({ subjectId: 'li-jing', predicate: 'parent-of', objectId: 'li-yu' }),
      expect.objectContaining({ subjectId: 'li-jing', predicate: 'ruled', objectId: 'southern_tang' }),
    ]));
    expect(personDetails.find((detail) => detail.personId === 'li-jing')?.offices).toEqual(expect.arrayContaining([
      expect.objectContaining({ placeId: 'jiankang', validFrom: 943, validTo: 960 }),
      expect.objectContaining({ placeId: 'nanchang', validFrom: 961, validTo: 961 }),
    ]));
  });

  it('exposes the major middle and late Tang events with resolvable sources', () => {
    const ids = ['southern-tang-li-jing-succeeds', 'southern-tang-conquers-min', 'southern-tang-conquers-chu', 'southern-tang-cedes-huainan', 'southern-tang-moves-nanchang', 'southern-tang-falls'];
    for (const id of ids) {
      const event = eventById(id);
      const detail = eventDetailById(id);
      expect(event, id).toBeDefined();
      expect(detail?.polityIds, id).toContain('southern_tang');
      expect(event?.sourceIds.every((sourceId) => sourceById[sourceId]), id).toBe(true);
      expect(detail?.sourceIds.every((sourceId) => sourceById[sourceId]), id).toBe(true);
    }
    expect(eventById('southern-tang-falls')?.year).toBe(975);
  });

  it('separates the Southern Tang imperial tombs from the generic city layer', () => {
    const asset = heritageAssets.find((item) => item.id === 'southern-tang-er-ling');
    const detail = heritageDetails.find((item) => item.heritageId === 'southern-tang-er-ling');
    expect(asset?.placeId).toBe('jiankang');
    expect(asset?.sourceIds).toContain('southern-tang-er-ling-official');
    expect(detail?.associatedPeople).toEqual(expect.arrayContaining(['li-bian', 'li-jing']));
    expect(detail?.associatedEvents).toContain('southern-tang-moves-nanchang');
  });

  it('publishes the complete Southern Tang closure from polity detail', () => {
    const detail = getPolityDetail('southern_tang');
    expect(detail?.principalFigureIds).toEqual(expect.arrayContaining(['li-bian', 'li-jing', 'li-yu']));
    expect(detail?.eventIds).toContain('southern-tang-falls');
    expect(detail?.heritageIds).toContain('southern-tang-er-ling');
    expect(detail?.claimIds).toContain('claim-li-jing-ruled-southern-tang');
  });
});
