import { describe, expect, it } from 'vitest';
import { changanEvents } from './changan-study';
import { eventDetails } from './event-details';
import { events } from './events';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';

const detailEvents = [...events, ...changanEvents.filter((event) => !events.some((catalogEvent) => catalogEvent.id === event.id))];

describe('event detail navigation round one hundred audit', () => {
  it('resolves every participant, location, polity, and related event to a catalog entity', () => {
    const peopleIds = new Set(people.map((person) => person.id));
    const placeIds = new Set(places.map((place) => place.id));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const eventIds = new Set(detailEvents.map((event) => event.id));
    const unresolved = eventDetails.flatMap((detail) => [
      ...detail.participants.filter((participant) => !peopleIds.has(participant.personId)).map((participant) => `${detail.eventId}:participant:${participant.personId}`),
      ...detail.locationIds.filter((placeId) => !placeIds.has(placeId)).map((placeId) => `${detail.eventId}:location:${placeId}`),
      ...detail.polityIds.filter((polityId) => !polityIds.has(polityId)).map((polityId) => `${detail.eventId}:polity:${polityId}`),
      ...detail.relatedEventIds.filter((eventId) => !eventIds.has(eventId)).map((eventId) => `${detail.eventId}:relatedEvent:${eventId}`),
    ]);

    expect(unresolved).toEqual([]);
  });
});
