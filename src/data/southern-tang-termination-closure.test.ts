import { describe, expect, it } from 'vitest';
import { auditKnowledgeCoverage } from './knowledge-coverage';
import { claims } from './claims';
import { eventDetails } from './event-details';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { getPolityDetail } from './polity-details';
import { people } from './people';
import { personDetails } from './person-details';
import { places } from './places';
import { polities } from './polities';
import { heritageAssets } from './heritage';
import { sourceNotes } from './sources';

describe('南唐终结闭环', () => {
  it('publishes a canonical 975 Jiankang termination node with successor context', () => {
    const event = events.find((item) => item.id === 'southern-tang-ended-975');
    const detail = eventDetails.find((item) => item.eventId === 'southern-tang-ended-975');

    expect(event).toEqual(expect.objectContaining({
      year: 975,
      placeId: 'jiankang',
      category: '政权终结／政权承接',
    }));
    expect(detail).toEqual(expect.objectContaining({
      polityIds: expect.arrayContaining(['southern_tang', 'song_northern']),
      locationIds: expect.arrayContaining(['jiankang']),
      relatedEventIds: expect.arrayContaining(['southern-tang-falls']),
      participants: expect.arrayContaining([
        expect.objectContaining({ personId: 'li-yu' }),
        expect.objectContaining({ personId: 'zhao-kuangyin' }),
      ]),
    }));
    expect(event?.sourceIds.every((sourceId) => sourceNotes.some((source) => source.id === sourceId))).toBe(true);
    expect(detail?.sourceIds.every((sourceId) => sourceNotes.some((source) => source.id === sourceId))).toBe(true);
  });

  it('connects Li Yu, the Song successor and Jinling heritage to the canonical node', () => {
    expect(personDetails.find((item) => item.personId === 'li-yu')?.keyEvents).toContain('southern-tang-ended-975');
    expect(claims).toEqual(expect.arrayContaining([
      expect.objectContaining({ subjectId: 'li-yu', predicate: 'participated-in', objectId: 'southern-tang-ended-975' }),
      expect.objectContaining({ subjectId: 'zhao-kuangyin', predicate: 'participated-in', objectId: 'southern-tang-ended-975' }),
    ]));
    expect(getPolityDetail('southern_tang')?.eventIds).toContain('southern-tang-ended-975');
    expect(places.find((place) => place.id === 'jiankang')).toEqual(expect.objectContaining({ modernName: '南京市' }));
    expect(heritageAssets.find((item) => item.id === 'southern-tang-jiankang-city-site')).toBeDefined();
    expect(getHeritageDetail('southern-tang-jiankang-city-site')?.associatedEvents).toContain('southern-tang-ended-975');
  });

  it('keeps the canonical node fully covered in the knowledge graph', () => {
    const report = auditKnowledgeCoverage({
      polities,
      people,
      events,
      eventDetails,
      heritageAssets,
      heritageDetails: [],
      personDetails,
      claims,
      sourceNotes,
      places,
    });
    const item = report.byKey['event:southern-tang-ended-975'];
    expect(item).toBeDefined();
    expect(item?.checks.find((check) => check.dimension === 'detail')?.status).toBe('covered');
    expect(item?.checks.find((check) => check.dimension === 'relationship')?.status).toBe('covered');
  });
});
