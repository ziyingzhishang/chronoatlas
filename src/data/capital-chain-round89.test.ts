import { describe, expect, it } from 'vitest';
import { getCapitalCoverageReport } from './capital-coverage';
import { capitalHistory } from './capital-history';
import { events } from './events';
import { getEventDetail } from './event-details';
import { getHeritageDetail } from './heritage-details';
import { heritageById } from './heritage';
import { polityDetails } from './polity-details';
import { sourceById } from './sources';

const auditedPolityIds = ['jin_later', 'han_later'] as const;
const evidenceBoundaryPolityIds = [
  'yan_warring',
  'later_yan',
  'western_yan',
  'jin_hedong',
  'xiongnu',
  'silla',
  'tuyuhun',
  'turkic',
  'xia_early',
  'shang',
  'qin_state',
  'western_qin',
  'western_liang',
  'northern_yuan',
  'ming_southern',
] as const;

describe('eighty-ninth capital chain audit', () => {
  it('keeps all fourteen evidence-boundary polities outside qualified coverage', () => {
    const report = getCapitalCoverageReport();

    expect(report.summary.qualifiedPolities).toBe(75);
    expect(report.summary.gapPolityIds).toEqual([...evidenceBoundaryPolityIds]);
    for (const polityId of evidenceBoundaryPolityIds) {
      const item = report.polities.find((polity) => polity.polityId === polityId);
      expect(item?.qualified, polityId).toBe(false);
      expect(item?.uncertainRecordIds.length, polityId).toBeGreaterThan(0);
    }
  });

  it('connects the two high-confidence capital records to foundation events and a modern heritage layer', () => {
    const report = getCapitalCoverageReport();
    const heritageId = 'kaifeng-later-jin-han-city-layer';
    const heritage = heritageById[heritageId];
    const heritageDetail = getHeritageDetail(heritageId);

    expect(heritage).toBeDefined();
    expect(heritage?.placeId).toBe('kaifeng');
    expect(heritage?.sourceIds.every((sourceId) => sourceById[sourceId])).toBe(true);
    expect(heritageDetail).toBeDefined();
    expect(heritageDetail?.associatedPolities).toEqual(['jin_later', 'han_later', 'zhou_later']);
    expect(heritageDetail?.associatedEvents).toEqual(['jin-later-founded', 'later-jin-ended-947', 'han-later-founded', 'later-han-ended-951']);
    expect(heritageDetail?.sourceIds.every((sourceId) => sourceById[sourceId])).toBe(true);

    for (const polityId of auditedPolityIds) {
      const coverage = report.polities.find((polity) => polity.polityId === polityId);
      const detail = polityDetails.find((item) => item.polityId === polityId);
      const eventId = polityId === 'jin_later' ? 'later-jin-ended-947' : 'han-later-founded';
      const event = events.find((item) => item.id === eventId);
      const eventDetail = getEventDetail(eventId);
      const capital = capitalHistory.find((item) => item.polityId === polityId);

      expect(coverage?.qualified, polityId).toBe(true);
      expect(capital, polityId).toMatchObject({ placeId: 'kaifeng', role: 'primary', status: 'formal' });
      expect(detail?.heritageIds, polityId).toContain(heritageId);
      expect(detail?.eventIds, polityId).toContain(eventId);
      const requiredEventSource = polityId === 'jin_later' || polityId === 'han_later'
        ? 'later-jin-termination-947-primary-sources'
        : 'zizhi-tongjian';
      expect(event, polityId).toMatchObject({ sourceIds: expect.arrayContaining([requiredEventSource]) });
      expect(eventDetail?.locationIds, polityId).toContain('kaifeng');
      expect(eventDetail?.sourceIds, polityId).toEqual(expect.arrayContaining([requiredEventSource]));
      expect(heritageDetail?.associatedPeople, polityId).toContain(polityId === 'jin_later' ? 'shi-jingtang' : 'liu-zhiyuan');
    }
  });
});
