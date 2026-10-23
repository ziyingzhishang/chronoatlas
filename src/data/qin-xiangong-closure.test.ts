import { describe, expect, it } from 'vitest';

import { claims } from './claims';
import { eventDetails } from './event-details';
import { events } from './events';
import { people } from './people';
import { personDetails } from './person-details';
import { polityDetails } from './polity-details';
import { sourceById } from './sources';

describe('秦襄公与秦国前770年形成节点闭环', () => {
  it('exposes Qin Xiangong as the direct historical endpoint without projecting Xianyang backward', () => {
    const person = people.find((item) => item.id === 'qin-xiangong');
    const detail = personDetails.find((item) => item.personId === 'qin-xiangong');
    const event = events.find((item) => item.id === 'qin-state-founded-eighth-batch');
    const eventDetail = eventDetails.find((item) => item.eventId === event?.id);
    const qin = polityDetails.find((item) => item.polityId === 'qin_state');

    expect(person).toMatchObject({ id: 'qin-xiangong', polityIds: ['qin_state'] });
    expect(person?.sourceIds).toContain('shiji-qin-benji');
    expect(detail).toMatchObject({ personId: 'qin-xiangong', keyEvents: ['qin-state-founded-eighth-batch'] });
    expect(detail?.offices).toEqual(expect.arrayContaining([
      expect.objectContaining({ polityId: 'qin_state', datePrecision: 'range' }),
    ]));
    expect(event?.placeId).toBeUndefined();
    expect(eventDetail?.locationIds).not.toContain('xianyang');
    expect(eventDetail?.participants).toEqual(expect.arrayContaining([
      expect.objectContaining({ personId: 'qin-xiangong', relationType: 'direct' }),
      expect.objectContaining({ personId: 'qin-mugong', relationType: 'contextual' }),
      expect.objectContaining({ personId: 'qin-xiaogong', relationType: 'contextual' }),
    ]));
    expect(qin?.principalFigureIds).toContain('qin-xiangong');
    expect(sourceById['shiji-qin-benji']).toBeDefined();
  });

  it('records Qin Xiangong participation and rule while removing the false direct participation claim', () => {
    expect(claims).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'claim-qin-xiangong-participated-qin-state-founded-eighth-batch',
        subjectId: 'qin-xiangong',
        predicate: 'participated-in',
        objectId: 'qin-state-founded-eighth-batch',
        datePrecision: 'approximate',
      }),
      expect.objectContaining({
        id: 'claim-qin-xiangong-ruled-qin-state',
        subjectId: 'qin-xiangong',
        predicate: 'ruled',
        objectId: 'qin_state',
        datePrecision: 'range',
      }),
    ]));
    expect(claims.find((claim) => claim.id === 'claim-qin-xiaogong-participated-qin-state-founded')).toBeUndefined();
  });
});
