import { describe, expect, it } from 'vitest';
import { claims } from './claims';
import { eventDetails } from './event-details';
import { eventTimeReview } from './event-time-review';
import { events } from './events';
import { heritageAssets } from './heritage';
import { heritageDetails, getHeritageDetail } from './heritage-details';
import { people } from './people';
import { personDetails, getPersonDetail } from './person-details';
import { places } from './places';
import { polities } from './polities';
import { getPolityDetail } from './polity-details';
import { sourceNotes, sourceById } from './sources';

describe('高句丽终止链闭环', () => {
  it('区分668年平壤失守、中央政权终止与后续承接', () => {
    const polity = polities.find((item) => item.id === 'goguryeo');
    const event = events.find((item) => item.id === 'silla-tang-goguryeo-668');
    const detail = eventDetails.find((item) => item.eventId === 'silla-tang-goguryeo-668');
    const timing = eventTimeReview.find((item) => item.eventId === 'silla-tang-goguryeo-668');

    expect(polity).toMatchObject({ id: 'goguryeo', startYear: -37, endYear: 668 });
    expect(event).toMatchObject({ year: 668, endYear: 668, placeId: 'pyongyang', datePrecision: 'year' });
    expect(detail).toMatchObject({
      polityIds: expect.arrayContaining(['goguryeo', 'tang', 'silla']),
      locationIds: expect.arrayContaining(['pyongyang']),
      relatedEventIds: expect.arrayContaining(['silla-tang-war-670-676']),
    });
    expect(detail?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '平壤失守', startYear: 668, endYear: 668 }),
      expect.objectContaining({ label: '高句丽中央政权终止', startYear: 668, endYear: 668 }),
      expect.objectContaining({ label: '唐设安东都护府', startYear: 668, endYear: 669 }),
      expect.objectContaining({ label: '遗民复兴与后续渤海', startYear: 669, endYear: 698 }),
    ]));
    expect(timing).toMatchObject({ status: 'confirmed', expectedPrecision: 'year', timelineStrategy: 'year-marker' });
  });

  it('覆盖末代君主、末期人物与关系', () => {
    const latePeople = ['bojang-goguryeo', 'yeon-gaesomun', 'yeon-namsaeng', 'yeon-namgeon', 'go-yeonmu', 'dae-joyeong'];
    for (const personId of latePeople) {
      expect(people.find((person) => person.id === personId), personId).toBeDefined();
      expect(getPersonDetail(personId), personId).toBeDefined();
    }
    expect(people.find((person) => person.id === 'bojang-goguryeo')).toMatchObject({ deathYear: 682, polityIds: ['goguryeo'] });
    expect(getPersonDetail('bojang-goguryeo')?.keyEvents).toContain('silla-tang-goguryeo-668');
    expect(claims).toEqual(expect.arrayContaining([
      expect.objectContaining({ subjectId: 'bojang-goguryeo', predicate: 'ruled', objectId: 'goguryeo', validFrom: 642, validTo: 668, datePrecision: 'range' }),
      expect.objectContaining({ subjectId: 'bojang-goguryeo', predicate: 'participated-in', objectId: 'silla-tang-goguryeo-668', validFrom: 668, validTo: 668 }),
      expect.objectContaining({ subjectId: 'yeon-namsaeng', predicate: 'related-to', objectId: 'yeon-gaesomun' }),
      expect.objectContaining({ subjectId: 'yeon-namgeon', predicate: 'related-to', objectId: 'yeon-gaesomun' }),
      expect.objectContaining({ subjectId: 'go-yeonmu', predicate: 'participated-in', objectId: 'silla-tang-goguryeo-668' }),
      expect.objectContaining({ subjectId: 'dae-joyeong', predicate: 'related-to', objectId: 'silla-tang-goguryeo-668' }),
    ]));
  });

  it('连接平壤王都、现代地点、遗产与来源，并拒绝孤立引用', () => {
    const polityDetail = getPolityDetail('goguryeo');
    const pyongyang = places.find((place) => place.id === 'pyongyang');
    const heritage = heritageAssets.find((item) => item.id === 'goguryeo-pyongyang-city-layer');
    const heritageDetail = getHeritageDetail('goguryeo-pyongyang-city-layer');

    expect(pyongyang).toMatchObject({ historicalName: '平壤', modernName: '平壤市', modernAdministrativeUnit: '朝鲜民主主义人民共和国平壤市' });
    expect(heritage).toMatchObject({ placeId: 'pyongyang', constructionFrom: 427, constructionTo: 668 });
    expect(heritageDetail).toMatchObject({
      associatedEvents: expect.arrayContaining(['goguryeo-moves-pyongyang', 'silla-tang-goguryeo-668']),
      associatedPolities: expect.arrayContaining(['goguryeo', 'tang', 'silla']),
      associatedPeople: expect.arrayContaining(['bojang-goguryeo', 'yeon-gaesomun']),
    });
    expect(polityDetail).toMatchObject({
      principalFigureIds: expect.arrayContaining(['bojang-goguryeo', 'yeon-gaesomun']),
      eventIds: expect.arrayContaining(['silla-tang-goguryeo-668']),
      heritageIds: expect.arrayContaining(['goguryeo-pyongyang-city-layer']),
    });

    const referencedSourceIds = new Set([
      ...(events.find((item) => item.id === 'silla-tang-goguryeo-668')?.sourceIds ?? []),
      ...(eventDetails.find((item) => item.eventId === 'silla-tang-goguryeo-668')?.sourceIds ?? []),
      ...(heritage?.sourceIds ?? []),
      ...(heritageDetail?.sourceIds ?? []),
    ]);
    for (const sourceId of referencedSourceIds) expect(sourceById[sourceId], sourceId).toBeDefined();
    expect(sourceNotes.some((source) => source.id === 'goguryeo-termination-official')).toBe(true);

    const referencedPersonIds = new Set([
      ...(eventDetails.find((item) => item.eventId === 'silla-tang-goguryeo-668')?.participants.map((participant) => participant.personId) ?? []),
      ...(heritageDetail?.associatedPeople ?? []),
    ]);
    for (const personId of referencedPersonIds) expect(getPersonDetail(personId), personId).toBeDefined();
    for (const detail of eventDetails.filter((item) => item.eventId === 'silla-tang-goguryeo-668')) {
      for (const relatedEventId of detail.relatedEventIds) expect(events.some((item) => item.id === relatedEventId), relatedEventId).toBe(true);
    }
    expect(heritageDetails.some((detail) => detail.heritageId === 'goguryeo-pyongyang-city-layer')).toBe(true);
    expect(personDetails.some((detail) => detail.personId === 'bojang-goguryeo')).toBe(true);
  });
});
