import { describe, expect, it } from 'vitest';
import { events } from './events';
import { eventDetails } from './event-details';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceNotes } from './sources';
import { auditKnowledgeCoverage } from './knowledge-coverage';

const targetEventIds = [
  'zhou-conquest',
  'zhou-eastward',
  'chu-han-contention',
  'xin-founded',
  'gengshi-founded',
  'eastern-wei-founded',
  'western-wei-founded',
  'southern-liang-founded',
  'former-qin-founded',
  'later-yan-founded',
  'jurchen-jin-founded',
  'western-xia-founded',
] as const;

describe('nineteenth-batch event detail closure', () => {
  it('closes participant and location coverage tasks for twelve audited events', () => {
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

  it('keeps all nineteenth-batch references resolvable and evidence-bearing', () => {
    const peopleIds = new Set(people.map((person) => person.id));
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
        expect(peopleIds.has(participant.personId), `${eventId} -> ${participant.personId}`).toBe(true);
        expect(participant.role.trim()).not.toBe('');
      });
      detail?.locationIds.forEach((placeId) => expect(placeIds.has(placeId)).toBe(true));
      detail?.polityIds.forEach((polityId) => expect(polityIds.has(polityId)).toBe(true));
      detail?.sourceIds.forEach((sourceId) => expect(sourceIds.has(sourceId)).toBe(true));
      detail?.relatedEventIds.forEach((relatedEventId) => expect(eventIds.has(relatedEventId), `${eventId} -> ${relatedEventId}`).toBe(true));
    });
  });
});
