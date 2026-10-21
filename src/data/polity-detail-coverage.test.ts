import { describe, expect, it } from 'vitest';
import type { KnowledgeCoverageCatalog } from './knowledge-coverage';
import { buildPolityDetailCoverageReport } from './polity-detail-coverage';
import { claims } from './claims';
import { eventDetails } from './event-details';
import { events } from './events';
import { heritageAssets } from './heritage';
import { heritageDetails } from './heritage-details';
import { people } from './people';
import { personDetails } from './person-details';
import { places } from './places';
import { polities } from './polities';
import { polityDetails } from './polity-details';
import { sourceNotes } from './sources';
import { capitalHistory } from './capital-history';

const qin = polities.find((polity) => polity.id === 'qin')!;
const qinDetail = polityDetails.find((detail) => detail.polityId === 'qin')!;

const baseCatalog: KnowledgeCoverageCatalog & { capitalHistory: typeof capitalHistory } = {
  polities,
  people,
  events,
  eventDetails,
  heritageAssets,
  heritageDetails,
  personDetails,
  polityDetails,
  claims,
  sourceNotes,
  places,
  capitalHistory,
};

describe('polity detail coverage audit', () => {
  it('audits every polity and exposes explicit covered and uncovered IDs', () => {
    const report = buildPolityDetailCoverageReport({ catalog: baseCatalog });

    expect(report.totalPolities).toBe(87);
    expect(report.items).toHaveLength(87);
    expect(report.coveredPolityIds).toContain('qin');
    expect(report.uncoveredPolityIds).toContain('han_warring');
    expect(report.uncoveredPolityIds.length).toBeGreaterThan(0);
    expect(report.detailCoverageRate).toBeLessThan(1);
    expect(report.items.find((item) => item.polityId === 'qin')?.knowledgeDetailStatus)
      .toBe(report.items.find((item) => item.polityId === 'qin')?.detailStatus);
  });

  it('counts a polity without a detail record as uncovered against the full catalog', () => {
    const catalog = {
      ...baseCatalog,
      polities: [qin],
      polityDetails: [],
    };
    const report = buildPolityDetailCoverageReport({ catalog });
    const item = report.items[0];

    expect(report.totalPolities).toBe(1);
    expect(report.coveredPolityIds).toEqual([]);
    expect(report.uncoveredPolityIds).toEqual(['qin']);
    expect(report.detailCoverageRate).toBe(0);
    expect(item.detailStatus).toBe('data-missing');
    expect(item.missingFields).toContain('detail');
    expect(item.missingAssociationTypes).toEqual(['capital', 'claims', 'events', 'heritage', 'people']);
  });

  it('reports unresolved associations and incomplete sources without silently treating them as covered', () => {
    const source = sourceNotes[0];
    const catalog = {
      ...baseCatalog,
      polities: [qin],
      polityDetails: [{
        ...qinDetail,
        principalFigureIds: ['missing-person'],
        eventIds: ['missing-event'],
        heritageIds: ['missing-heritage'],
        capitalPhases: [{ ...qinDetail.capitalPhases[0], placeId: 'missing-place' }],
        claimIds: ['missing-claim'],
        sourceIds: [source.id, 'missing-source'],
      }],
      sourceNotes: sourceNotes.filter((candidate) => qin.sourceIds.includes(candidate.id)),
    };
    const report = buildPolityDetailCoverageReport({ catalog });
    const item = report.items[0];

    expect(item.missingAssociationTypes).toEqual(['capital', 'claims', 'events', 'heritage', 'people']);
    expect(item.unresolvedReferenceIds).toEqual({
      capital: ['missing-place'],
      claims: ['missing-claim'],
      events: ['missing-event'],
      heritage: ['missing-heritage'],
      people: ['missing-person'],
    });
    expect(item.sourceComplete).toBe(false);
    expect(item.unknownSourceIds).toContain('missing-source');
    expect(item.detailStatus).toBe('covered');
    expect(item.knowledgeDetailStatus).toBe('covered');
  });

  it('records any mismatch between the independent detail check and knowledge coverage', () => {
    const catalog = {
      ...baseCatalog,
      polities: [qin],
      annotations: [{
        entityType: 'polity' as const,
        entityId: qin.id,
        dimension: 'detail' as const,
        status: 'uncertain' as const,
        note: '专项审计要求人工复核。',
      }],
    };
    const report = buildPolityDetailCoverageReport({ catalog });

    expect(report.knowledgeStatusMismatches).toEqual(['qin']);
    expect(report.items[0].detailStatus).toBe('covered');
    expect(report.items[0].knowledgeDetailStatus).toBe('uncertain');
  });
});
