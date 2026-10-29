import { boundaryCatalog } from '../data/boundaries';
import { capitalHistory } from '../data/capital-history';
import { changanEvents } from '../data/changan-study';
import { claims } from '../data/claims';
import { coverageDecisions } from '../data/coverage-decisions';
import { eventDetails } from '../data/event-details';
import { events } from '../data/events';
import { eventTimeReview } from '../data/event-time-review';
import { heritageAssets } from '../data/heritage';
import { heritageDetails } from '../data/heritage-details';
import { people } from '../data/people';
import { personDetails } from '../data/person-details';
import { places } from '../data/places';
import { polities } from '../data/polities';
import { polityDetails } from '../data/polity-details';
import { sourceNotes } from '../data/sources';
import { modernSovereigntyFeatures } from '../data/modern-reference';
import { periods } from '../data/periods';
import { mappingNotes } from '../data/cliopatria-mapping';
import { taiwanSovereigntyNotice } from '../data/sovereignty';
import { buildPersonTimeCoverageReport } from '../data/person-time-review';
import { auditKnowledgeCoverage } from '../data/knowledge-coverage';
import type { HistoricalStateSource } from '../domain/history-state';
import worldManifest from '../../public/data/cliopatria-manifest.json';

const allEvents = [
  ...events,
  ...changanEvents.filter((event) => !events.some((catalogEvent) => catalogEvent.id === event.id)),
];

const eventDetailsById = new Map(eventDetails.map((detail) => [detail.eventId, detail]));
const eventTimeNotes = eventTimeReview.map((review) => ({
  eventId: review.eventId,
  dateDescription: review.status === 'confirmed'
    ? '年代记录较明确'
    : review.status === 'approximate'
      ? '约在该年前后'
      : '具体年代尚待核实',
  uncertainty: review.explanation,
  sourceIds: [...(eventDetailsById.get(review.eventId)?.sourceIds ?? [])],
}));

const personTimeNotes = buildPersonTimeCoverageReport({
  people,
  personDetails,
  claims,
}).records.map((review) => ({
  personId: review.personId,
  dateDescription: review.status === 'confirmed'
    ? '生卒年记录较明确'
    : review.status === 'approximate'
      ? '相关活动年代为约数'
      : '生卒年尚待核实',
  uncertainty: review.status === 'confirmed'
    ? '现有资料同时记录生年与卒年，可按完整生卒区间理解。'
    : review.status === 'approximate'
      ? `${review.personName}的生卒年尚不完整；现有任职或活动年代仅用于说明其活跃时期。`
      : `现有资料尚不足以确定${review.personName}更精确的生卒年。`,
  sourceIds: [...review.evidenceSourceIds],
}));

const coverageAudit = auditKnowledgeCoverage();
const knowledgeCoverageSummaries = [
  {
    id: 'global',
    perspective: 'global',
    contextId: 'global',
    label: '学习资料概览',
    entityCount: coverageAudit.entities.length,
    summary: `本版已关联${coverageAudit.entities.length}个历史对象；部分主题仍在持续校勘与补充。`,
  },
  ...Object.values(coverageAudit.byPolity).map((item) => ({
    id: `polity:${item.polityId}`,
    perspective: 'polity',
    contextId: item.polityId,
    label: item.polityName,
    entityCount: item.entityKeys.length,
    summary: item.entityKeys.length > 0
      ? `${item.polityName}已关联${item.entityKeys.length}个历史对象；相关史料与关系仍将持续校勘补充。`
      : `${item.polityName}相关资料尚待补充。`,
  })),
  ...Object.values(coverageAudit.byCity).map((item) => ({
    id: `city:${item.placeId}`,
    perspective: 'city',
    contextId: item.placeId,
    label: item.cityName,
    entityCount: item.entityKeys.length,
    summary: item.entityKeys.length > 0
      ? `${item.cityName}已关联${item.entityKeys.length}个历史对象；相关史料与关系仍将持续校勘补充。`
      : `${item.cityName}相关资料尚待补充。`,
  })),
];

/**
 * Temporary authoring adapter. Export/build code consumes this single boundary
 * until a future database exporter replaces the TypeScript catalogs.
 */
export const bundledPublicCollections = {
  polities,
  places,
  people,
  events,
  studyEvents: allEvents,
  claims,
  heritage: heritageAssets,
  capitalTerms: capitalHistory,
  personDetails,
  eventDetails,
  heritageDetails,
  polityDetails,
  sources: sourceNotes,
  eventTimeNotes,
  personTimeNotes,
  knowledgeCoverageSummaries,
  periods,
  mappingNotes: Object.entries(mappingNotes).map(([id, note]) => ({ id, note })),
  sovereigntyNotices: [taiwanSovereigntyNotice],
  mapReferences: [{
    id: 'modern-sovereignty',
    effectiveFrom: 1949,
    featureCollection: modernSovereigntyFeatures(1949),
  }],
} as const;

export const bundledAuthoringSnapshot = {
  coreCollections: bundledPublicCollections,
  territory: {
    boundaries: boundaryCatalog,
    coverageDecisions,
  },
  worldChunks: worldManifest.chunks,
} as const;

export const bundledHistoricalStateSource: HistoricalStateSource = {
  polities,
  boundaries: boundaryCatalog,
  places,
  events,
  capitalTerms: capitalHistory,
  modernSovereignty: bundledPublicCollections.mapReferences,
};
