import { describe, expect, it } from 'vitest';
import { events } from './events';
import { eventDetails } from './event-details';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceNotes } from './sources';
import { auditKnowledgeCoverage } from './knowledge-coverage';

const targetEventIds = [
  'xia-early-founded-eighth-batch',
  'shang-founded-eighth-batch',
  'western-zhou-founded-eighth-batch',
  'eastern-zhou-founded-eighth-batch',
  'qin-state-founded-eighth-batch',
  'qin-unification',
  'han-eastern-founded',
  'western-jin-founded',
  'former-zhao-founded',
  'cheng-han-founded',
  'xia-sixteen-states-founded-eighth-batch',
  'later-qin-founded',
] as const;

describe('sixteenth-batch event detail closure', () => {
  it('closes participant and location coverage tasks for twelve priority events', () => {
    const report = auditKnowledgeCoverage();
    const missingTaskKeys = new Set(
      report.tasks
        .filter((task) => task.taskKind === 'event-participant-missing' || task.taskKind === 'event-location-missing')
        .map((task) => `${task.taskKind}:${task.entityId}`),
    );

    targetEventIds.forEach((eventId) => {
      expect(missingTaskKeys.has(`event-participant-missing:${eventId}`)).toBe(false);
      expect(missingTaskKeys.has(`event-location-missing:${eventId}`)).toBe(false);
    });
  });

  it('keeps every participant, place, polity, source, and related event reference resolvable', () => {
    const peopleById = new Set(people.map((person) => person.id));
    const placeIds = new Set(places.map((place) => place.id));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));
    const eventIds = new Set(events.map((event) => event.id));

    targetEventIds.forEach((eventId) => {
      const event = events.find((candidate) => candidate.id === eventId);
      const detail = eventDetails.find((candidate) => candidate.eventId === eventId);

      expect(event).toBeDefined();
      expect(detail).toBeDefined();
      expect(detail?.participants.length).toBeGreaterThan(0);
      expect(detail?.locationIds.length).toBeGreaterThan(0);
      expect(detail?.sourceIds.length).toBeGreaterThan(0);
      expect(detail?.uncertaintyNote).toBeTruthy();

      detail?.participants.forEach((participant) => {
        expect(peopleById.has(participant.personId)).toBe(true);
        expect(participant.role.trim()).not.toBe('');
      });
      detail?.locationIds.forEach((placeId) => expect(placeIds.has(placeId)).toBe(true));
      detail?.polityIds.forEach((polityId) => expect(polityIds.has(polityId)).toBe(true));
      detail?.sourceIds.forEach((sourceId) => expect(sourceIds.has(sourceId)).toBe(true));
      detail?.relatedEventIds.forEach((relatedEventId) => expect(eventIds.has(relatedEventId)).toBe(true));
    });
  });
});
