import { describe, expect, it } from 'vitest';
import type { HeritageDetail } from './heritage-details';
import type { HeritageAsset } from '../domain/types';
import { buildHeritageDetailCoverageReport } from './heritage-detail-coverage';
import { events } from './events';
import { heritageAssets } from './heritage';
import { heritageDetails } from './heritage-details';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceNotes } from './sources';

const baseCatalog = {
  heritageAssets,
  heritageDetails,
  people,
  polities,
  events,
  places,
  sourceNotes,
};

const sampleAsset: HeritageAsset = {
  id: 'sample-heritage',
  name: '示例遗产',
  placeId: 'changan',
  type: 'city-site',
  modernStatus: 'archaeological-site',
  description: '用于审计测试的遗产节点。',
  sourceIds: ['zizhi-tongjian'],
};

const sampleDetail: HeritageDetail = {
  heritageId: sampleAsset.id,
  modernLocation: '今西安市。',
  historicalAssociations: ['示例历史关联'],
  constructionHistory: [{
    type: 'site',
    label: '遗址',
    period: '当代',
    description: '示例存续阶段。',
    sourceIds: ['zizhi-tongjian'],
  }],
  associatedPeople: ['liu-bang'],
  associatedPolities: ['han_western'],
  associatedEvents: ['han-imperial-accession'],
  survivingFeatures: ['城址遗迹'],
  presentDayValue: '历史教育节点。',
  sourceIds: ['zizhi-tongjian'],
  uncertaintyNote: '示例不确定性说明。',
};

const roundSeventySecondHeritageIds = [
  'big-wild-goose-pagoda',
  'qinglong-temple-site',
  'xian-beilin',
  'xiao-yan-ta',
] as const;

const roundSeventySecondDisplayMarkers: Record<typeof roundSeventySecondHeritageIds[number], string> = {
  'big-wild-goose-pagoda': '玄奘译经传统与大慈恩寺空间',
  'qinglong-temple-site': '唐代密教传播',
  'xian-beilin': '后世碑刻保存与展示',
  'xiao-yan-ta': '唐代荐福寺佛教建筑',
};

describe('heritage detail coverage audit', () => {
  it('audits every heritage asset and exposes complete, review, and missing IDs', () => {
    const report = buildHeritageDetailCoverageReport({ catalog: baseCatalog });

    expect(report.totalHeritageAssets).toBe(heritageAssets.length);
    expect(report.items).toHaveLength(heritageAssets.length);
    expect(report.completeHeritageIds.length + report.needsReviewHeritageIds.length
      + report.uncoveredHeritageIds.length).toBe(report.totalHeritageAssets);
    expect(report.items.every((item) => item.heritageId)).toBe(true);
    expect(report.detailCoverageRate).toBeGreaterThanOrEqual(0);
    expect(report.detailCoverageRate).toBeLessThanOrEqual(1);
  });

  it('keeps unresolved event endpoints explicit after normalizing existing person references', () => {
    const report = buildHeritageDetailCoverageReport();

    expect(report.totalHeritageAssets).toBe(121);
    expect(report.completeHeritageIds).toHaveLength(117);
    expect(report.needsReviewHeritageIds).toEqual([
      'big-wild-goose-pagoda',
      'qinglong-temple-site',
      'xian-beilin',
      'xiao-yan-ta',
    ]);
    expect(report.uncoveredHeritageIds).toEqual([]);
    expect(report.sourceCompleteHeritageIds).toHaveLength(121);
    expect(report.sourceCoverageRate).toBe(1);
    const reviewItems = report.items.filter((item) => [
      'big-wild-goose-pagoda',
      'qinglong-temple-site',
      'xian-beilin',
      'xiao-yan-ta',
    ].includes(item.heritageId));
    expect(reviewItems.every((item) => item.unresolvedReferenceIds.people.length === 0)).toBe(true);
    expect(reviewItems.map((item) => item.unresolvedReferenceIds.events)).toEqual([
      ['xuanzang-translations'],
      ['xuanzang-translations'],
      ['xuanzang-translations'],
      ['xuanzang-translations'],
    ]);
    expect(reviewItems.map((item) => item.reviewNotes)).toEqual([
      ['关联事件端点未收录：xuanzang-translations；暂不新增或推断事件端点。'],
      ['关联事件端点未收录：xuanzang-translations；暂不新增或推断事件端点。'],
      ['关联事件端点未收录：xuanzang-translations；暂不新增或推断事件端点。'],
      ['关联事件端点未收录：xuanzang-translations；暂不新增或推断事件端点。'],
    ]);
  });

  it('marks a fully sourced and resolvable detail as complete', () => {
    const report = buildHeritageDetailCoverageReport({
      catalog: {
        ...baseCatalog,
        heritageAssets: [sampleAsset],
        heritageDetails: [sampleDetail],
      },
    });

    expect(report.completeHeritageIds).toEqual([sampleAsset.id]);
    expect(report.needsReviewHeritageIds).toEqual([]);
    expect(report.uncoveredHeritageIds).toEqual([]);
    expect(report.items[0].status).toBe('complete');
    expect(report.items[0].unresolvedReferenceIds).toEqual({
      people: [], polities: [], events: [], place: [], sources: [],
    });
  });

  it('reports missing fields, unresolved endpoints, and unknown sources separately', () => {
    const brokenDetail: HeritageDetail = {
      ...sampleDetail,
      associatedPeople: ['missing-person'],
      associatedPolities: ['missing-polity'],
      associatedEvents: ['missing-event'],
      sourceIds: ['missing-source'],
      constructionHistory: [],
      survivingFeatures: [],
      presentDayValue: '',
    };
    const report = buildHeritageDetailCoverageReport({
      catalog: {
        ...baseCatalog,
        heritageAssets: [{ ...sampleAsset, placeId: 'missing-place' }],
        heritageDetails: [brokenDetail],
      },
    });
    const item = report.items[0];

    expect(item.status).toBe('data-missing');
    expect(item.missingFields).toEqual(expect.arrayContaining([
      'constructionHistory', 'survivingFeatures', 'presentDayValue',
    ]));
    expect(item.unresolvedReferenceIds).toEqual({
      people: ['missing-person'],
      polities: ['missing-polity'],
      events: ['missing-event'],
      place: ['missing-place'],
      sources: ['missing-source'],
    });
    expect(item.unknownSourceIds).toEqual(['missing-source']);
  });

  it('marks an otherwise complete detail for review when a phase source is unresolved', () => {
    const reviewDetail: HeritageDetail = {
      ...sampleDetail,
      constructionHistory: [{ ...sampleDetail.constructionHistory[0], sourceIds: ['missing-phase-source'] }],
    };
    const report = buildHeritageDetailCoverageReport({
      catalog: {
        ...baseCatalog,
        heritageAssets: [sampleAsset],
        heritageDetails: [reviewDetail],
      },
    });

    expect(report.items[0].status).toBe('needs-review');
    expect(report.needsReviewHeritageIds).toEqual([sampleAsset.id]);
    expect(report.items[0].unknownSourceIds).toEqual(['missing-phase-source']);
  });

  it('audits the four review-boundary details while keeping the missing event boundary explicit', () => {
    const report = buildHeritageDetailCoverageReport({ catalog: baseCatalog });
    const sourceIds = new Set(sourceNotes.map((source) => source.id));
    const eventIds = new Set(events.map((event) => event.id));

    expect(eventIds.has('xuanzang-translations')).toBe(false);

    for (const heritageId of roundSeventySecondHeritageIds) {
      const detail = heritageDetails.find((item) => item.heritageId === heritageId);
      const item = report.items.find((coverageItem) => coverageItem.heritageId === heritageId);

      expect(detail, heritageId).toBeDefined();
      expect(item, heritageId).toBeDefined();
      expect(detail?.historicalAssociations, heritageId).toEqual(
        expect.arrayContaining([roundSeventySecondDisplayMarkers[heritageId]]),
      );
      expect(detail?.constructionHistory.length, heritageId).toBeGreaterThanOrEqual(3);
      expect(detail?.survivingFeatures.length, heritageId).toBeGreaterThanOrEqual(3);
      expect(detail?.presentDayValue.length, heritageId).toBeGreaterThan(8);
      expect(detail?.sourceIds.every((sourceId) => sourceIds.has(sourceId)), heritageId).toBe(true);
      expect(detail?.constructionHistory.every((phase) => phase.sourceIds.every((sourceId) => sourceIds.has(sourceId))), heritageId).toBe(true);
      expect(detail?.associatedEvents, heritageId).toContain('xuanzang-translations');
      expect(item?.status, heritageId).toBe('needs-review');
      expect(item?.unresolvedReferenceIds.events, heritageId).toEqual(['xuanzang-translations']);
    }
  });

  it('treats Ximing Temple as complete when its dedicated event endpoints are used', () => {
    const report = buildHeritageDetailCoverageReport({ catalog: baseCatalog });
    const item = report.items.find((coverageItem) => coverageItem.heritageId === 'ximing-temple-site');

    expect(item?.status).toBe('complete');
    expect(item?.unresolvedReferenceIds.events).toEqual([]);
  });

  it('keeps the round seventy-second review details source-backed and time-bounded', () => {
    const report = buildHeritageDetailCoverageReport({ catalog: baseCatalog });
    const sourceIds = new Set(sourceNotes.map((source) => source.id));

    for (const heritageId of roundSeventySecondHeritageIds) {
      const detail = heritageDetails.find((item) => item.heritageId === heritageId);
      const item = report.items.find((coverageItem) => coverageItem.heritageId === heritageId);

      expect(detail?.sourceIds, heritageId).toEqual(expect.arrayContaining([
        'zizhi-tongjian',
        'modern-geography-reference',
      ]));
      expect(detail?.sourceIds.every((sourceId) => sourceIds.has(sourceId)), heritageId).toBe(true);
      expect(detail?.constructionHistory.every((phase) => (
        phase.sourceIds.includes('zizhi-tongjian')
        && phase.sourceIds.includes('modern-geography-reference')
        && phase.sourceIds.every((sourceId) => sourceIds.has(sourceId))
      )), heritageId).toBe(true);
      expect(detail?.constructionHistory.every((phase) => (
        phase.from === undefined || phase.to === undefined || phase.from <= phase.to
      )), heritageId).toBe(true);
      expect(item?.unknownSourceIds, heritageId).toEqual([]);
      expect(item?.unresolvedReferenceIds.events, heritageId).toEqual(['xuanzang-translations']);
    }
  });

  it('does not treat an unresolved event or explicit uncertainty as complete', () => {
    const report = buildHeritageDetailCoverageReport({ catalog: baseCatalog });

    for (const heritageId of roundSeventySecondHeritageIds) {
      const detail = heritageDetails.find((item) => item.heritageId === heritageId);
      const item = report.items.find((coverageItem) => coverageItem.heritageId === heritageId);

      expect(detail?.uncertaintyNote, heritageId).toContain('待核关联');
      expect(item?.unresolvedReferenceIds.events, heritageId).toEqual(['xuanzang-translations']);
      expect(item?.status, heritageId).toBe('needs-review');
    }
  });
});
