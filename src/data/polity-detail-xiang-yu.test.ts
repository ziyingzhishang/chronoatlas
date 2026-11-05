import { describe, expect, it } from 'vitest';
import { polityDetails } from './polity-details';
import { capitalHistory } from './capital-history';
import { buildPolityDetailCoverageReport } from './polity-detail-coverage';
import { eventDetails } from './event-details';
import { claims } from './claims';

describe('项羽政权详情', () => {
  it('records the sourced Pengcheng center without claiming unsupported boundaries or heritage', () => {
    const detail = polityDetails.find((candidate) => candidate.polityId === 'xiang_yu');

    expect(detail).toBeDefined();
    expect(detail?.principalFigureIds).toContain('xiang-yu');
    expect(detail?.capitalPhases).toContainEqual(expect.objectContaining({
      placeId: 'pengcheng',
      validFrom: -206,
      validTo: -203,
    }));
    expect(capitalHistory).toContainEqual(expect.objectContaining({
      polityId: 'xiang_yu',
      placeId: 'pengcheng',
      validFrom: -206,
      validTo: -203,
    }));
    expect(detail?.eventIds).toContain('chu-han-contention');
    expect(detail?.eventIds).toContain('han-pengcheng-battle-205');
    expect(eventDetails.find((candidate) => candidate.eventId === 'han-pengcheng-battle-205')?.polityIds)
      .toContain('xiang_yu');
    expect(detail?.heritageIds).toEqual([]);
    expect(detail?.claimIds).toContain('claim-xiang-yu-ruled-xiang-yu-release-closure');
    expect(detail?.uncertaintyNote).toContain('不画疆域');
  });

  it('keeps the missing heritage and claim associations visible in the audit', () => {
    const item = buildPolityDetailCoverageReport().items.find((candidate) => candidate.polityId === 'xiang_yu');

    expect(claims).toContainEqual(expect.objectContaining({
      id: 'claim-xiang-yu-ruled-xiang-yu-release-closure',
      subjectId: 'xiang-yu',
      predicate: 'ruled',
      objectId: 'xiang_yu',
      validFrom: -206,
      validTo: -203,
    }));
    expect(item?.missingAssociationTypes).toEqual(['heritage']);
    expect(item?.unresolvedReferenceIds).toEqual({ people: [], events: [], heritage: [], capital: [], claims: [] });
  });
});
