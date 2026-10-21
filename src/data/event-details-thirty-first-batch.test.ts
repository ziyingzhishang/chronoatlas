import { describe, expect, it } from 'vitest';
import { eventDetails } from './event-details';
import { events } from './events';
import { people } from './people';
import { polities } from './polities';
import { sourceById } from './sources';

const targetParticipants = {
  'song-southward': ['zhao-gou', 'yue-fei', 'han-shizhong', 'qin-hui'],
  'southern-ming-founded': ['zhu-yousong', 'shi-kefa'],
} as const;

const peopleIds = new Set(people.map((person) => person.id));
const polityIds = new Set(polities.map((polity) => polity.id));
const eventIds = new Set([...events.map((event) => event.id), ...eventDetails.map((detail) => detail.eventId)]);

describe('event details thirty-first batch', () => {
  it('records the two non-frozen high-evidence event participant sets', () => {
    Object.entries(targetParticipants).forEach(([eventId, expectedPeople]) => {
      const detail = eventDetails.find((candidate) => candidate.eventId === eventId);

      expect(detail, eventId).toBeDefined();
      expect(detail?.participants.map((participant) => participant.personId), eventId).toEqual(expectedPeople);
    });
  });

  it('keeps participant metadata and graph references resolvable', () => {
    Object.keys(targetParticipants).forEach((eventId) => {
      const detail = eventDetails.find((candidate) => candidate.eventId === eventId);

      expect(detail?.phases?.length, eventId).toBeGreaterThan(0);
      expect(detail?.sourceIds.length, eventId).toBeGreaterThan(0);
      expect(detail?.sourceIds.every((sourceId) => sourceById[sourceId]), eventId).toBe(true);
      expect(detail?.uncertaintyNote?.trim(), eventId).toBeTruthy();

      detail?.participants.forEach((participant) => {
        expect(peopleIds.has(participant.personId), `${eventId} -> ${participant.personId}`).toBe(true);
        expect(participant.role.trim(), `${eventId} -> ${participant.personId}`).not.toBe('');
        expect(participant.note?.trim(), `${eventId} -> ${participant.personId}`).not.toBe('');
      });
      detail?.polityIds.forEach((polityId) => expect(polityIds.has(polityId), `${eventId} -> ${polityId}`).toBe(true));
      detail?.relatedEventIds.forEach((relatedEventId) => {
        expect(eventIds.has(relatedEventId), `${eventId} -> ${relatedEventId}`).toBe(true);
      });
    });
  });

  it('keeps the former Liang founder boundary while recording its stage-aware endpoints', () => {
    expect(eventDetails.find((detail) => detail.eventId === 'former-liang-founded')?.participants.map((participant) => participant.personId))
      .toEqual(['zhang-gui', 'zhang-shi']);
  });
});
