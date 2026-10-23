import { describe, expect, it } from 'vitest';
import { getEventDetail } from './event-details';

describe('Daming Palace construction participant boundary', () => {
  it('records Taizong as the direct initiator and Gaozu as the contextual beneficiary', () => {
    const detail = getEventDetail('daming-palace-built');

    expect(detail?.participants).toEqual(expect.arrayContaining([
      expect.objectContaining({ personId: 'li-shimin', relationType: 'direct' }),
      expect.objectContaining({ personId: 'li-yuan', relationType: 'contextual' }),
    ]));
    expect(detail?.sourceIds).toContain('tanghuiyao-vol30-daming-palace');
  });
});
