import { describe, expect, it } from 'vitest';
import { getHeritageDetail } from './heritage-details';

describe('heritage details', () => {
  it('returns a sourced, uncertainty-aware detail for Chang’an heritage', () => {
    const detail = getHeritageDetail('daming-palace-site');
    expect(detail?.modernLocation).toContain('西安');
    expect(detail?.historicalAssociations.length).toBeGreaterThan(0);
    expect(detail?.sourceIds.length).toBeGreaterThan(0);
    expect(detail?.uncertaintyNote).toBeTruthy();
  });

  it('returns undefined for an unknown heritage node', () => {
    expect(getHeritageDetail('missing-heritage')).toBeUndefined();
  });
});
