import { describe, expect, it } from 'vitest';
import { auditKnowledgeCoverage } from './knowledge-coverage';
import { eventDetails } from './event-details';
import { events } from './events';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceNotes } from './sources';

const targetLocations = {
  'nanzhao-founded': ['taihe'],
  'goguryeo-founded': ['wunvshan'],
  'silla-founded': ['jincheng_silla'],
  'tuyuhun-founded': ['tuyuhun_core'],
  'turkic-founded': ['uhtuken'],
  'tibetan-founded': ['yalong'],
  'western-qin-founded': ['jincheng'],
  'northern-yan-founded': ['longcheng'],
  'southern-yan-founded': ['guanggu'],
  'xiongnu-founded': ['xiongnu_core'],
} as const;

describe('twenty-second-batch event location closure', () => {
  it('closes ten selected location gaps without changing the participant-gap boundary', () => {
    const report = auditKnowledgeCoverage();
    const missingLocationIds = new Set(
      report.tasks
        .filter((task) => task.taskKind === 'event-location-missing')
        .map((task) => task.entityId),
    );
    const missingParticipantIds = new Set(
      report.tasks
        .filter((task) => task.taskKind === 'event-participant-missing')
        .map((task) => task.entityId),
    );

    Object.keys(targetLocations).forEach((eventId) => {
      expect(missingLocationIds.has(eventId), eventId).toBe(false);
      expect(missingParticipantIds.has(eventId), eventId).toBe(true);
    });
  });

  it('resolves each location, polity, event, source, and preserves empty participant endpoints', () => {
    const eventIds = new Set(events.map((event) => event.id));
    const peopleIds = new Set(people.map((person) => person.id));
    const placeIds = new Set(places.map((place) => place.id));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));

    Object.entries(targetLocations).forEach(([eventId, expectedPlaceIds]) => {
      const detail = eventDetails.find((candidate) => candidate.eventId === eventId);

      expect(detail, eventId).toBeDefined();
      expect(detail?.participants, eventId).toEqual([]);
      expect(detail?.locationIds, eventId).toEqual(expectedPlaceIds);
      expect(detail?.sourceIds.length, eventId).toBeGreaterThan(0);
      expect(detail?.uncertaintyNote, eventId).toBeTruthy();

      detail?.participants.forEach((participant) => {
        expect(peopleIds.has(participant.personId), `${eventId} -> ${participant.personId}`).toBe(true);
      });
      detail?.locationIds.forEach((placeId) => {
        expect(placeIds.has(placeId), `${eventId} -> ${placeId}`).toBe(true);
      });
      detail?.polityIds.forEach((polityId) => {
        expect(polityIds.has(polityId), `${eventId} -> ${polityId}`).toBe(true);
      });
      detail?.relatedEventIds.forEach((relatedEventId) => {
        expect(eventIds.has(relatedEventId), `${eventId} -> ${relatedEventId}`).toBe(true);
      });
      detail?.sourceIds.forEach((sourceId) => {
        expect(sourceIds.has(sourceId), `${eventId} -> ${sourceId}`).toBe(true);
      });
    });
  });
});
