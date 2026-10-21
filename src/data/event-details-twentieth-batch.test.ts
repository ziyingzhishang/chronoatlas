import { describe, expect, it } from 'vitest';
import { auditKnowledgeCoverage } from './knowledge-coverage';
import { eventDetails } from './event-details';
import { events } from './events';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceNotes } from './sources';

const targetEventIds = [
  'five-dynasties',
  'former-shu-founded',
  'later-shu-founded',
  'liao-founded',
  'northern-song-founded',
  'southern-song-founded',
  'han-later-founded',
  'jin-later-founded',
  'later-jin-founded',
  'qing-founded',
] as const;

describe('twentieth-batch event detail closure', () => {
  it('closes the selected five-dynasty, Song, Liao and Jin event gaps', () => {
    const report = auditKnowledgeCoverage();
    const missingTaskKeys = new Set(
      report.tasks
        .filter((task) => task.taskKind === 'event-participant-missing' || task.taskKind === 'event-location-missing')
        .map((task) => `${task.taskKind}:${task.entityId}`),
    );

    targetEventIds.forEach((eventId) => {
      expect(missingTaskKeys.has(`event-participant-missing:${eventId}`), eventId).toBe(false);
      expect(missingTaskKeys.has(`event-location-missing:${eventId}`), eventId).toBe(false);
    });
  });

  it('keeps every twentieth-batch reference resolvable and evidence-bearing', () => {
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
      detail?.locationIds.forEach((placeId) => expect(placeIds.has(placeId), `${eventId} -> ${placeId}`).toBe(true));
      detail?.polityIds.forEach((polityId) => expect(polityIds.has(polityId), `${eventId} -> ${polityId}`).toBe(true));
      detail?.sourceIds.forEach((sourceId) => expect(sourceIds.has(sourceId), `${eventId} -> ${sourceId}`).toBe(true));
      detail?.relatedEventIds.forEach((relatedEventId) => expect(eventIds.has(relatedEventId), `${eventId} -> ${relatedEventId}`).toBe(true));
    });
  });
});
