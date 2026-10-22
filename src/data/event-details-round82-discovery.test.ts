import { describe, expect, it } from 'vitest';
import { buildEventDetailCoverageReport } from './event-detail-coverage';
import { eventDetails } from './event-details';

const targets = {
  'cheng-han-founded': '形成、称帝与地方承接分层',
  'chu-han-contention': '战争结束与汉初秩序重建分层',
  'eastern-jin': '晋室名义与江南军政承接',
  'an-lushan-rebellion': '两京恢复与河北承接分层',
  'western-liao-founded': '迁徙政权与稳定中心分层',
  'southern-ming-founded': '南明总称与分阶段政权分层',
} as const;

describe('event details eighty-second batch', () => {
  it('adds bounded phases to six existing review-boundary events', () => {
    const report = buildEventDetailCoverageReport();
    const byId = new Map(eventDetails.map((detail) => [detail.eventId, detail]));

    Object.entries(targets).forEach(([eventId, phaseLabel]) => {
      const item = report.items.find((candidate) => candidate.eventId === eventId);
      const detail = byId.get(eventId);

      expect(item?.status, eventId).toBe('needs-review');
      expect(['approximate', 'range'], eventId).toContain(item?.timePrecision);
      expect(item?.sourceComplete, eventId).toBe(true);
      expect(item?.unresolvedReferenceIds, eventId).toEqual({
        people: [], places: [], polities: [], relatedEvents: [], sources: [],
      });
      expect(detail?.phases, eventId).toEqual(expect.arrayContaining([
        expect.objectContaining({ label: phaseLabel }),
      ]));
      expect(detail?.uncertaintyNote?.trim(), eventId).toBeTruthy();
    });
  });
});
