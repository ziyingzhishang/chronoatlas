import { describe, expect, it } from 'vitest';

import { claims } from './claims';
import { changanEvents } from './changan-study';
import { eventDetails } from './event-details';
import { events } from './events';
import { people } from './people';
import { sourceNotes } from './sources';

const eventId = 'han-wudi-expands-changan';
const personId = 'liu-che';

describe('event participant round 132', () => {
  it('closes the Han Wudi Chang’an expansion participant with exact-year evidence', () => {
    const event = [...events, ...changanEvents].find((candidate) => candidate.id === eventId);
    const person = people.find((candidate) => candidate.id === personId);
    const detail = eventDetails.find((candidate) => candidate.eventId === eventId);
    const claim = claims.find((candidate) => (
      candidate.subjectId === personId
      && candidate.predicate === 'participated-in'
      && candidate.objectId === eventId
    ));

    expect(event?.year).toBe(-138);
    expect(person?.birthYear).toBe(-156);
    expect(person?.deathYear).toBe(-87);
    expect(detail?.participants).toEqual([
      expect.objectContaining({
        personId,
        relationType: 'direct',
        role: expect.stringContaining('汉武帝'),
      }),
    ]);
    expect(claim).toEqual(expect.objectContaining({
      subjectId: personId,
      predicate: 'participated-in',
      objectId: eventId,
      validFrom: -138,
      validTo: -138,
      datePrecision: 'year',
      confidence: 'high',
    }));
    expect(claim?.sourceIds).toEqual(['zizhi-tongjian']);
    expect(sourceNotes.some((source) => source.id === 'zizhi-tongjian')).toBe(true);
  });

  it('does not promote adjacent Chang’an stages or city background into participants', () => {
    const expansion = eventDetails.find((candidate) => candidate.eventId === eventId);
    const adjacent = eventDetails.find((candidate) => candidate.eventId === 'han-changan-new-city');

    expect(expansion?.participants.map((participant) => participant.personId)).toEqual([personId]);
    expect(adjacent?.participants).toEqual([]);
    expect(claims.some((candidate) => (
      candidate.subjectId === personId
      && candidate.predicate === 'participated-in'
      && candidate.objectId === 'han-changan-new-city'
    ))).toBe(false);
  });
});
