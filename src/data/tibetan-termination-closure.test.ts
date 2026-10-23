import { describe, expect, it } from 'vitest';
import { claims } from './claims';
import { eventDetails } from './event-details';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { people } from './people';
import { getPersonDetail } from './person-details';
import { getPolityDetail } from './polity-details';

describe('吐蕃政权终结阶段闭环', () => {
  it('connects 842 termination, Langdarma, and Lhasa from the polity perspective', () => {
    const polity = getPolityDetail('tibetan_empire');
    const event = events.find((item) => item.id === 'tibetan-ended-842');
    const detail = eventDetails.find((item) => item.eventId === 'tibetan-ended-842');
    const person = people.find((item) => item.id === 'langdarma');

    expect(polity?.eventIds).toContain('tibetan-ended-842');
    expect(polity?.principalFigureIds).toContain('langdarma');
    expect(event).toMatchObject({ year: 842, placeId: 'luosie', datePrecision: 'approximate' });
    expect(detail).toMatchObject({ polityIds: ['tibetan_empire'], locationIds: ['luosie'] });
    expect(detail?.participants).toEqual(expect.arrayContaining([expect.objectContaining({ personId: 'langdarma' })]));
    expect(person).toMatchObject({ polityIds: ['tibetan_empire'], deathYear: 842 });
    expect(getPersonDetail('langdarma')?.keyEvents).toContain('tibetan-ended-842');
  });

  it('exposes the termination event and person through the Lhasa heritage drawer', () => {
    const detail = getHeritageDetail('tibetan-lhasa-city-site');
    expect(detail?.associatedPeople).toContain('langdarma');
    expect(detail?.associatedEvents).toEqual(expect.arrayContaining(['tibetan-founded', 'tibetan-ended-842']));
    expect(claims.find((claim) => claim.id === 'claim-langdarma-ruled-tibetan-empire')).toMatchObject({
      subjectId: 'langdarma', predicate: 'ruled', objectId: 'tibetan_empire', validFrom: 838, validTo: 842,
    });
  });
});
