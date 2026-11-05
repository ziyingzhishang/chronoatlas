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
  it('closes supported links and retains the unlocated Later Qin founding place as an evidence gap', () => {
    const report = auditKnowledgeCoverage();
    const missingTaskKeys = new Set(
      report.tasks
        .filter((task) => task.taskKind === 'event-participant-missing' || task.taskKind === 'event-location-missing')
        .map((task) => `${task.taskKind}:${task.entityId}`),
    );

    targetEventIds.forEach((eventId) => {
      expect(missingTaskKeys.has(`event-participant-missing:${eventId}`)).toBe(false);
      expect(missingTaskKeys.has(`event-location-missing:${eventId}`)).toBe(
        eventId === 'later-qin-founded' || eventId === 'xia-sixteen-states-founded-eighth-batch',
      );
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
      if (eventId === 'later-qin-founded') {
        expect(detail?.locationIds).toEqual([]);
        expect(detail?.uncertaintyNote).toContain('渭北');
      } else if (eventId === 'xia-sixteen-states-founded-eighth-batch') {
        expect(detail?.locationIds).toEqual([]);
        expect(detail?.sourceIds).not.toContain('capital-history-reference');
      } else {
        expect(detail?.locationIds.length).toBeGreaterThan(0);
      }
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

  it('does not attach the later Tongwan capital site to Xia’s 407 founding event', () => {
    const founding = eventDetails.find((detail) => detail.eventId === 'xia-sixteen-states-founded-eighth-batch');
    const foundingEvent = events.find((event) => event.id === 'xia-sixteen-states-founded-eighth-batch');
    const capital = eventDetails.find((detail) => detail.eventId === 'xia-capital-tongwan-established');

    expect(founding?.locationIds).toEqual([]);
    expect(founding?.phases?.some((phase) => phase.label.includes('统万') && (phase.startYear ?? Infinity) < 413)).toBe(false);
    expect(foundingEvent?.summary).toContain('高平川');
    expect(foundingEvent?.mapNote).toContain('不显示地图点');
    expect(foundingEvent?.placeId).toBeUndefined();
    expect(capital?.locationIds).toEqual(['zhitong']);
    expect(capital?.phases?.some((phase) => phase.startYear === 413)).toBe(true);
  });
});
