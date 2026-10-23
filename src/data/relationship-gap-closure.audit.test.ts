import { describe, expect, it } from 'vitest';
import { auditPolityCoverage } from './polity-coverage';
import { buildPolityDetailCoverageReport } from './polity-detail-coverage';
import { getPersonDetail } from './person-details';

const currentExplicitRelationshipGapPolityIds = [
  'chu_warring',
  'yan_warring',
  'qi_warring',
  'qin',
  'han_eastern',
  'wei_three',
  'shu_three',
  'former_qin',
  'tang_later',
  'tuyuhun',
  'turkic',
  'wu_zhou',
  'later_liang',
  'southern_liang',
  'western_liang',
  'yuan',
  'jingnan',
] as const;

describe('relationship gap closure evidence audit', () => {
  it('keeps the 17 audited polity targets closed only when the audit finds sourced person endpoints', () => {
    const report = auditPolityCoverage();
    const targetItems = currentExplicitRelationshipGapPolityIds.map((polityId) => report.byPolity(polityId));
    const stillOpen = targetItems
      .filter((item) => item.gaps.some((gap) => gap.code === 'missing-explicit-relationship'))
      .map((item) => item.polityId);

    expect(stillOpen, `仍未闭合的目标政权：${stillOpen.join('、') || '无'}`).toEqual([]);
    for (const item of targetItems) {
      expect(item.hasEstablishmentNode, item.polityId).toBe(true);
      expect(item.relationships.some((relationship) => (
        relationship.personId !== undefined
        && ['founded', 'ruled'].includes(relationship.predicate)
        && relationship.sourceIds.length > 0
      )), item.polityId).toBe(true);
    }
  });

  it('records the Southern Liang person linkage as a resolvable local endpoint', () => {
    const report = auditPolityCoverage();
    const southernLiang = report.byPolity('southern_liang');
    const detail = getPersonDetail('tufa-wugu');

    expect(southernLiang.personIds).toContain('tufa-wugu');
    expect(southernLiang.gaps).not.toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'missing-associated-person' }),
    ]));
    expect(southernLiang.gaps).not.toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'missing-explicit-relationship' }),
    ]));
    expect(detail?.personId).toBe('tufa-wugu');
    expect(detail?.offices).toEqual(expect.arrayContaining([
      expect.objectContaining({ polityId: 'southern_liang', validFrom: 397, validTo: 399 }),
    ]));
    expect(southernLiang.relationships).toEqual(expect.arrayContaining([
      expect.objectContaining({ claimId: 'claim-tufa-wugu-founded-southern-liang-closure', personId: 'tufa-wugu' }),
    ]));
  });

  it('confirms that the previously audited directory-out event references are now resolvable', () => {
    const report = auditPolityCoverage();
    const detailReport = buildPolityDetailCoverageReport();

    expect(report.polities.flatMap((item) => item.gaps)
      .filter((gap) => gap.code === 'unresolved-event-reference')).toEqual([]);
    expect(detailReport.items.filter((item) => item.unresolvedReferenceIds.events.length > 0)).toEqual([]);
    expect(detailReport.uncoveredPolityIds).toEqual([]);
  });
});
