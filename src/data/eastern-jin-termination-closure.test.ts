import { describe, expect, it } from 'vitest';
import { claims } from './claims';
import { eventDetails } from './event-details';
import { eventTimeReview } from './event-time-review';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { getPersonDetail } from './person-details';
import { getPolityDetail } from './polity-details';
import { people } from './people';

describe('Eastern Jin termination closure', () => {
  it('records the 420 abdication separately from Eastern Jin foundation and Liu Song files', () => {
    const event = events.find((item) => item.id === 'eastern-jin-ended-420');
    const detail = eventDetails.find((item) => item.eventId === 'eastern-jin-ended-420');

    expect(event).toMatchObject({
      year: 420,
      placeId: 'jiankang',
      datePrecision: 'year',
      category: '政权终结／政权承接',
    });
    expect(detail).toMatchObject({
      eventId: 'eastern-jin-ended-420',
      polityIds: expect.arrayContaining(['jin_eastern', 'song_southern']),
      locationIds: ['jiankang'],
    });
    expect(detail?.participants.map((participant) => participant.personId)).toEqual(
      expect.arrayContaining(['sima-dewen', 'liu-yu']),
    );
    expect(eventTimeReview.find((item) => item.eventId === 'eastern-jin-ended-420')).toMatchObject({
      status: 'confirmed',
      expectedPrecision: 'year',
    });
  });

  it('connects Eastern Jin’s Jiankang capital and layered heritage', () => {
    const polity = getPolityDetail('jin_eastern');
    const heritage = getHeritageDetail('jiankang-taicheng-site');

    expect(polity?.capitalPhases).toEqual(expect.arrayContaining([
      expect.objectContaining({ placeId: 'jiankang', validFrom: 317, validTo: 420, role: 'primary' }),
    ]));
    expect(polity?.eventIds).toContain('eastern-jin-ended-420');
    expect(polity?.heritageIds).toContain('jiankang-taicheng-site');
    expect(heritage?.associatedEvents).toContain('eastern-jin-ended-420');
    expect(heritage?.associatedPolities).toEqual(expect.arrayContaining(['jin_eastern', 'song_southern']));
  });

  it('exposes the abdicated ruler and Liu Yu succession relationships', () => {
    expect(people.find((person) => person.id === 'sima-dewen')).toMatchObject({
      polityIds: ['jin_eastern'],
      roles: expect.arrayContaining(['末代君主']),
    });
    expect(getPersonDetail('sima-dewen')?.keyEvents).toContain('eastern-jin-ended-420');
    expect(getPersonDetail('liu-yu')?.keyEvents).toContain('eastern-jin-ended-420');
    expect(claims).toEqual(expect.arrayContaining([
      expect.objectContaining({ subjectId: 'sima-dewen', predicate: 'participated-in', objectId: 'eastern-jin-ended-420' }),
      expect.objectContaining({ subjectId: 'sima-dewen', predicate: 'succeeded-by', objectId: 'liu-yu' }),
      expect.objectContaining({ subjectId: 'liu-yu', predicate: 'participated-in', objectId: 'eastern-jin-ended-420' }),
    ]));
  });
});
