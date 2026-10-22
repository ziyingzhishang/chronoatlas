import { describe, expect, it } from 'vitest';
import { capitalHistory } from './capital-history';
import { events } from './events';
import { getEventDetail } from './event-details';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { getPolityDetail } from './polity-details';

type AuditCandidate = {
  label: string;
  targetPolityId: string;
  placeId: string;
  endpointId: string;
  kind: 'event' | 'heritage';
  category:
    | 'shared-transition-event'
    | 'foundation-stage-boundary'
    | 'duplicate-event-node'
    | 'cross-polity-heritage'
    | 'cross-stage-city-layer';
  blockingEvidence: string;
  nextAction: string;
};

const candidates: readonly AuditCandidate[] = [
  {
    label: '秦—楚汉之争',
    targetPolityId: 'qin',
    placeId: 'xianyang',
    endpointId: 'chu-han-contention',
    kind: 'event',
    category: 'shared-transition-event',
    blockingEvidence: '事件详情同时归属秦与西汉，且咸阳只是秦亡与分封背景，不是秦首都专属事件端点。',
    nextAction: '只有新增带有明确秦方阶段、咸阳地点、参与者与独立来源的事件端点，才可重新评估。',
  },
  {
    label: '唐—洛阳行幸',
    targetPolityId: 'tang',
    placeId: 'luoyang',
    endpointId: 'court-moves-luoyang',
    kind: 'event',
    category: 'shared-transition-event',
    blockingEvidence: '904年迁廷同时关联唐与后梁，并同时涉及长安、洛阳，是唐末权力转移节点。',
    nextAction: '补录前必须取得唐首都阶段内、语义独立且不把后梁承接混入的迁都事实端点。',
  },
  {
    label: '后梁五代转折',
    targetPolityId: 'liang_later',
    placeId: 'kaifeng',
    endpointId: 'five-dynasties',
    kind: 'event',
    category: 'shared-transition-event',
    blockingEvidence: '五代开始事件同时归属唐与后梁；后梁已有独立的 later-liang-five-dynasties-founded 端点。',
    nextAction: '保持五代分期与后梁建政双层展示，除非发现不同事实且具独立事件 ID。',
  },
  {
    label: '东周东迁',
    targetPolityId: 'zhou_eastern',
    placeId: 'luoyang',
    endpointId: 'zhou-eastward',
    kind: 'event',
    category: 'foundation-stage-boundary',
    blockingEvidence: '前770年事件同时归属西周与东周，表达王室迁徙及分期转换，不能脱离西周背景解释为重复建政。',
    nextAction: '若补录，必须新增明确的东周洛邑建政/定都端点，并与西周东迁事件保持不同语义。',
  },
  {
    label: '北宋建政重复节点',
    targetPolityId: 'song_northern',
    placeId: 'kaifeng',
    endpointId: 'song-founded',
    kind: 'event',
    category: 'duplicate-event-node',
    blockingEvidence: 'song-founded 与 northern-song-founded 均表达960年北宋建政，已有规范事件链，重复引用会造成双重叙事。',
    nextAction: '保留 song-founded 作为交叉导航候选；只有确认其承载不同事实时才拆分事件语义。',
  },
  {
    label: '后凉姑臧遗产',
    targetPolityId: 'later_liang',
    placeId: 'guzang',
    endpointId: 'guzang-baita-temple-site',
    kind: 'heritage',
    category: 'cross-polity-heritage',
    blockingEvidence: '白塔寺遗产同时关联前凉、北凉、后凉，主要遗产阶段为401—439年，不能据同城关系归入386—403年的后凉。',
    nextAction: '需要有后凉时期、姑臧地点、独立考古/文献来源且不与北凉层混淆的遗产子层。',
  },
  {
    label: '后周开封遗产',
    targetPolityId: 'zhou_later',
    placeId: 'kaifeng',
    endpointId: 'kaifeng-northern-song-city-site',
    kind: 'heritage',
    category: 'cross-stage-city-layer',
    blockingEvidence: '开封城遗产同时覆盖后梁、后晋、后汉、后周、北宋，现有主体阶段从960年进入北宋城市层。',
    nextAction: '需要独立后周951—960年考古分期或建筑端点，不能以跨朝城市考古层反推后周专属遗产。',
  },
] as const;

const overlaps = (from: number | undefined, to: number | undefined, year: number | undefined) => (
  year !== undefined && (from === undefined || from <= year) && (to === undefined || year <= to)
);

describe('round 110 capital reference task C', () => {
  it('keeps the seven requested candidates in an executable audit queue', () => {
    expect(candidates).toHaveLength(7);
    expect(candidates.filter((candidate) => candidate.kind === 'event')).toHaveLength(5);
    expect(candidates.filter((candidate) => candidate.kind === 'heritage')).toHaveLength(2);
    expect(candidates.every((candidate) => candidate.blockingEvidence && candidate.nextAction)).toBe(true);
  });

  it('proves event candidates have evidence, but fail exclusivity or duplication gates', () => {
    const eventCandidates = candidates.filter((candidate) => candidate.kind === 'event');

    for (const candidate of eventCandidates) {
      const capital = capitalHistory.find((term) => (
        term.polityId === candidate.targetPolityId && term.placeId === candidate.placeId
      ));
      const event = events.find((item) => item.id === candidate.endpointId);
      const detail = getEventDetail(candidate.endpointId);
      const polityDetail = getPolityDetail(candidate.targetPolityId);

      expect(capital, candidate.label).toBeDefined();
      expect(event, candidate.label).toMatchObject({ id: candidate.endpointId, placeId: candidate.placeId });
      expect(detail?.polityIds, candidate.label).toContain(candidate.targetPolityId);
      expect(detail?.locationIds, candidate.label).toContain(candidate.placeId);
      expect(overlaps(capital?.validFrom, capital?.validTo, event?.year), candidate.label).toBe(true);

      if (candidate.category === 'duplicate-event-node') {
        expect(polityDetail?.eventIds, candidate.label).toContain('northern-song-founded');
      }
      expect(polityDetail?.eventIds, candidate.label).not.toContain(candidate.endpointId);
    }

    expect(getEventDetail('chu-han-contention')?.polityIds).toEqual(
      expect.arrayContaining(['qin', 'han_western']),
    );
    expect(getEventDetail('court-moves-luoyang')?.polityIds).toEqual(
      expect.arrayContaining(['tang', 'liang_later']),
    );
    expect(getEventDetail('five-dynasties')?.polityIds).toEqual(
      expect.arrayContaining(['tang', 'liang_later']),
    );
    expect(getEventDetail('zhou-eastward')?.polityIds).toEqual(
      expect.arrayContaining(['zhou_western', 'zhou_eastern']),
    );
  });

  it('proves heritage candidates remain shared or cross-stage and are not assigned to one polity', () => {
    for (const candidate of candidates.filter((item) => item.kind === 'heritage')) {
      const asset = heritageAssets.find((item) => item.id === candidate.endpointId);
      const detail = getHeritageDetail(candidate.endpointId);
      const polityDetail = getPolityDetail(candidate.targetPolityId);

      expect(asset, candidate.label).toMatchObject({ id: candidate.endpointId, placeId: candidate.placeId });
      expect(detail?.associatedPolities.length, candidate.label).toBeGreaterThan(1);
      expect(detail?.constructionHistory.length, candidate.label).toBeGreaterThan(0);
      expect(polityDetail?.heritageIds, candidate.label).not.toContain(candidate.endpointId);
    }
  });

  it('does not close any candidate without a new exclusive endpoint', () => {
    const safeClosures = candidates.filter((candidate) => {
      if (candidate.category === 'duplicate-event-node') return false;
      if (candidate.kind === 'event') {
        const detail = getEventDetail(candidate.endpointId);
        return detail !== undefined && detail.polityIds.length === 1;
      }
      const detail = getHeritageDetail(candidate.endpointId);
      return detail !== undefined && detail.associatedPolities.length === 1;
    });

    expect(safeClosures).toHaveLength(0);
  });
});
