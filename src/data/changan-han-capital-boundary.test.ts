import { describe, expect, it } from 'vitest';
import { capitalHistory } from './capital-history';
import { changanEvents } from './changan-study';
import { getEventDetail } from './event-details';
import { events } from './events';
import { getPolityDetail } from './polity-details';
import { claims } from './claims';

describe('Han Chang’an capital stage boundary', () => {
  it('keeps the 202 BCE imperial accession stage separate from the later documented move to Chang’an', () => {
    const event = events.find((item) => item.id === 'changan-han-capital');
    const detail = getEventDetail('changan-han-capital');

    expect(event?.year).toBe(-200);
    expect(changanEvents.find((item) => item.id === 'changan-han-capital')?.year).toBe(-200);
    expect(detail?.participants).toEqual(expect.arrayContaining([
      expect.objectContaining({ personId: 'liu-bang', relationType: 'direct' }),
      expect.objectContaining({ personId: 'xiao-he', relationType: 'contextual' }),
    ]));
    expect(detail?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ startYear: -200 }),
    ]));
    expect(detail?.sourceIds).toContain('zizhi-tongjian-vol11-han-capital');
    expect(detail?.uncertaintyNote).toContain('前200年');

    expect(capitalHistory.find((term) => term.polityId === 'han_western' && term.placeId === 'changan'))
      .toMatchObject({ validFrom: -200 });
    expect(claims.find((claim) => claim.id === 'claim-han-changan-capital'))
      .toMatchObject({ validFrom: -200 });
    expect(getPolityDetail('han_western')?.turningPoints)
      .toEqual(expect.arrayContaining([expect.objectContaining({ year: -200, title: '迁都长安' })]));
  });
});
