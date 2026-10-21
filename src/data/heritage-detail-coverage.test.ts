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

  it('keeps the current global audit explicit and does not hide unresolved historical endpoints', () => {
    const report = buildHeritageDetailCoverageReport();

    expect(report.totalHeritageAssets).toBe(99);
    expect(report.completeHeritageIds).toHaveLength(94);
    expect(report.needsReviewHeritageIds).toEqual([
      'big-wild-goose-pagoda',
      'qinglong-temple-site',
      'xian-beilin',
      'xiao-yan-ta',
      'ximing-temple-site',
    ]);
    expect(report.uncoveredHeritageIds).toEqual([]);
    expect(report.sourceCompleteHeritageIds).toHaveLength(99);
    expect(report.sourceCoverageRate).toBe(1);
    expect(report.items.find((item) => item.heritageId === 'big-wild-goose-pagoda')
      ?.unresolvedReferenceIds.people).toEqual(['xuanzang']);
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
});
