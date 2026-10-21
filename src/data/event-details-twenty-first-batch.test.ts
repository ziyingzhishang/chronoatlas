import { describe, expect, it } from 'vitest';
import { auditKnowledgeCoverage } from './knowledge-coverage';
import { eventDetails } from './event-details';
import { events } from './events';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceNotes } from './sources';

const targetEventIds = [
  'han-warring-founded-eighth-batch',
  'zhao-warring-founded-eighth-batch',
  'wei-warring-founded-eighth-batch',
  'chu-warring-founded-eighth-batch',
  'yan-warring-founded-eighth-batch',
  'qi-warring-founded-eighth-batch',
  'zhou-later-founded',
  'mongol-founded',
  'yuan-founded',
  'ming-founded',
] as const;

describe('twenty-first-batch event location closure', () => {
  it('closes the selected Warring States, Later Zhou, Mongol, Yuan and Ming location gaps', () => {
    const report = auditKnowledgeCoverage();
    const missingLocationIds = new Set(
      report.tasks
        .filter((task) => task.taskKind === 'event-location-missing')
        .map((task) => task.entityId),
    );

    targetEventIds.forEach((eventId) => {
      expect(missingLocationIds.has(eventId), eventId).toBe(false);
    });
  });

  it('keeps every twenty-first-batch location and evidence reference resolvable', () => {
    const eventIds = new Set(events.map((event) => event.id));
    const peopleIds = new Set(people.map((person) => person.id));
    const placeIds = new Set(places.map((place) => place.id));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));

    targetEventIds.forEach((eventId) => {
      const detail = eventDetails.find((candidate) => candidate.eventId === eventId);

      expect(detail, eventId).toBeDefined();
      expect(detail?.locationIds.length, eventId).toBeGreaterThan(0);
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
