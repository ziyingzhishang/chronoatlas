import { describe, expect, it } from 'vitest';
import { eventDetails } from './event-details';
import { events } from './events';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceNotes } from './sources';

const targetEventIds = ['red-cliffs', 'three-kingdoms'] as const;

describe('eighteenth-batch Three Kingdoms event detail closure', () => {
  it('closes Red Cliffs and the Three Kingdoms transition with existing people only', () => {
    const peopleById = new Set(people.map((person) => person.id));
    const expectedPeople = new Set(['cao-cao', 'liu-bei', 'sun-quan']);

    targetEventIds.forEach((eventId) => {
      const detail = eventDetails.find((candidate) => candidate.eventId === eventId);

      expect(detail).toBeDefined();
      expect(detail?.participants.length).toBeGreaterThan(0);
      expect(new Set(detail?.participants.map((participant) => participant.personId))).toEqual(expectedPeople);
      detail?.participants.forEach((participant) => {
        expect(peopleById.has(participant.personId)).toBe(true);
        expect(participant.role.trim()).not.toBe('');
      });
    });
  });

  it('keeps every event detail reference resolvable and links the formation sequence', () => {
    const eventIds = new Set(events.map((event) => event.id));
    const placeIds = new Set(places.map((place) => place.id));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));

    targetEventIds.forEach((eventId) => {
      const detail = eventDetails.find((candidate) => candidate.eventId === eventId);

      expect(detail?.causes.length).toBeGreaterThan(0);
      expect(detail?.consequences.length).toBeGreaterThan(0);
      expect(detail?.phases?.length).toBeGreaterThan(0);
      expect(detail?.locationIds.length).toBeGreaterThan(0);
      expect(detail?.polityIds).toEqual(expect.arrayContaining(['han_eastern', 'wei_three', 'shu_three', 'wu_three']));
      expect(detail?.sourceIds.length).toBeGreaterThan(0);
      expect(detail?.uncertaintyNote).toBeTruthy();

      detail?.locationIds.forEach((placeId) => expect(placeIds.has(placeId)).toBe(true));
      detail?.polityIds.forEach((polityId) => expect(polityIds.has(polityId)).toBe(true));
      detail?.sourceIds.forEach((sourceId) => expect(sourceIds.has(sourceId)).toBe(true));
      detail?.relatedEventIds.forEach((relatedEventId) => expect(eventIds.has(relatedEventId)).toBe(true));
    });

    const redCliffs = eventDetails.find((detail) => detail.eventId === 'red-cliffs');
    const threeKingdoms = eventDetails.find((detail) => detail.eventId === 'three-kingdoms');
    expect(redCliffs?.relatedEventIds).toContain('three-kingdoms');
    expect(threeKingdoms?.relatedEventIds).toContain('red-cliffs');
  });
});
