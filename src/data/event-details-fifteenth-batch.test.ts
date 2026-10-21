import { describe, expect, it } from 'vitest';
import { events } from './events';
import { eventDetails } from './event-details';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceNotes } from './sources';
import { auditKnowledgeCoverage } from './knowledge-coverage';

const targetEventIds = [
  'qin-unification',
  'eastern-jin',
  'jin-unification',
  'an-lushan-rebellion',
  'han-eastern-founded',
  'sui-founded',
  'wu-zhou-founded',
  'tang-later-founded',
] as const;

describe('fifteenth-batch event detail closure', () => {
  it('closes participant and location coverage tasks for eight key events', () => {
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

  it('keeps every participant, place, source, polity, and related event reference resolvable', () => {
    const peopleById = new Map(people.map((person) => [person.id, person]));
    const placesById = new Map(places.map((place) => [place.id, place]));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));
    const eventIds = new Set(events.map((event) => event.id));
    const polityIds = new Set(polities.map((polity) => polity.id));

    targetEventIds.forEach((eventId) => {
      const event = events.find((candidate) => candidate.id === eventId);
      const detail = eventDetails.find((candidate) => candidate.eventId === eventId);

      expect(event).toBeDefined();
      expect(detail).toBeDefined();
      expect(detail?.participants.length).toBeGreaterThan(0);
      expect(detail?.locationIds.length).toBeGreaterThan(0);
      expect(detail?.sourceIds.length).toBeGreaterThan(0);
      expect(detail?.uncertaintyNote).toBeTruthy();

      detail?.participants.forEach((participant) => expect(peopleById.has(participant.personId)).toBe(true));
      detail?.locationIds.forEach((placeId) => expect(placesById.has(placeId)).toBe(true));
      detail?.sourceIds.forEach((sourceId) => expect(sourceIds.has(sourceId)).toBe(true));
      detail?.polityIds.forEach((polityId) => expect(polityIds.has(polityId)).toBe(true));
      detail?.relatedEventIds.forEach((relatedEventId) => expect(eventIds.has(relatedEventId)).toBe(true));
    });
  });

  it('preserves role-bearing participant records for each selected event', () => {
    targetEventIds.forEach((eventId) => {
      const detail = eventDetails.find((candidate) => candidate.eventId === eventId);
      detail?.participants.forEach((participant) => {
        expect(participant.role.trim()).not.toBe('');
      });
    });
  });
});
