import type {
  HistoricalClaim,
  HistoricalEvent,
  HistoricalEventDetail,
  HeritageAsset,
  Person,
  PersonDetail,
  Polity,
  SourceNote,
} from '../domain/types';
import { claims as defaultClaims } from './claims';
import { eventDetails as defaultEventDetails } from './event-details';
import { events as defaultEvents } from './events';
import { heritageAssets as defaultHeritageAssets } from './heritage';
import { heritageDetails as defaultHeritageDetails, type HeritageDetail } from './heritage-details';
import { people as defaultPeople } from './people';
import { personDetails as defaultPersonDetails } from './person-details';
import { polities as defaultPolities } from './polities';
import { sourceNotes as defaultSourceNotes } from './sources';

export type KnowledgeEntityType = 'polity' | 'person' | 'event' | 'heritage';
export type CoverageDimension = 'summary' | 'detail' | 'source' | 'relationship' | 'time';
export type CoverageGapKind =
  | 'data-missing'
  | 'relationship-missing'
  | 'source-missing'
  | 'uncertain'
  | 'not-applicable';
export type CoverageStatus = 'covered' | CoverageGapKind;

export interface KnowledgeCoverageAnnotation {
  entityType: KnowledgeEntityType;
  entityId: string;
  dimension: CoverageDimension;
  status: Exclude<CoverageGapKind, 'data-missing' | 'relationship-missing' | 'source-missing'>;
  note: string;
  evidenceIds?: string[];
}

export interface KnowledgeCoverageCatalog {
  polities: Polity[];
  people: Person[];
  events: HistoricalEvent[];
  eventDetails: HistoricalEventDetail[];
  heritageAssets: HeritageAsset[];
  heritageDetails: HeritageDetail[];
  personDetails: PersonDetail[];
  claims: HistoricalClaim[];
  sourceNotes: SourceNote[];
  annotations?: KnowledgeCoverageAnnotation[];
}

export interface KnowledgeCoverageCheck {
  dimension: CoverageDimension;
  status: CoverageStatus;
  evidenceIds: string[];
  relatedIds: string[];
  note: string;
  overridden?: boolean;
}

export interface KnowledgeCoverageEntity {
  entityType: KnowledgeEntityType;
  entityId: string;
  entityKey: string;
  label: string;
  polityIds: string[];
  checks: KnowledgeCoverageCheck[];
}

export interface KnowledgeCoverageGap {
  entityType: KnowledgeEntityType;
  entityId: string;
  entityKey: string;
  label: string;
  dimension: CoverageDimension;
  kind: Exclude<CoverageGapKind, 'not-applicable'>;
  polityIds: string[];
  evidenceIds: string[];
  relatedIds: string[];
  note: string;
}

export type CoverageStatusCounts = Record<CoverageStatus, number>;
export type CoverageGapCounts = Record<Exclude<CoverageGapKind, 'not-applicable'>, number>;

export interface KnowledgeCoverageTypeReport {
  totalEntities: number;
  statusCounts: CoverageStatusCounts;
  gapCounts: CoverageGapCounts;
  entitiesWithGaps: string[];
}

export interface KnowledgeCoveragePolityReport {
  polityId: string;
  polityName: string;
  entityKeys: string[];
  gaps: KnowledgeCoverageGap[];
}

export interface KnowledgeCoverageReport {
  entities: KnowledgeCoverageEntity[];
  gaps: KnowledgeCoverageGap[];
  byKey: Record<string, KnowledgeCoverageEntity>;
  byType: Record<KnowledgeEntityType, KnowledgeCoverageTypeReport>;
  byPolity: Record<string, KnowledgeCoveragePolityReport>;
}

const dimensions: CoverageDimension[] = ['summary', 'detail', 'source', 'relationship', 'time'];
const entityTypes: KnowledgeEntityType[] = ['polity', 'person', 'event', 'heritage'];

function unique(values: string[]): string[] {
  return [...new Set(values)].sort();
}

function present(value: string | undefined): boolean {
  return Boolean(value?.trim());
}

function emptyStatusCounts(): CoverageStatusCounts {
  return {
    covered: 0,
    'data-missing': 0,
    'relationship-missing': 0,
    'source-missing': 0,
    uncertain: 0,
    'not-applicable': 0,
  };
}

function emptyGapCounts(): CoverageGapCounts {
  return {
    'data-missing': 0,
    'relationship-missing': 0,
    'source-missing': 0,
    uncertain: 0,
  };
}

function check(
  dimension: CoverageDimension,
  status: CoverageStatus,
  note: string,
  evidenceIds: string[] = [],
  relatedIds: string[] = [],
): KnowledgeCoverageCheck {
  return {
    dimension,
    status,
    note,
    evidenceIds: unique(evidenceIds),
    relatedIds: unique(relatedIds),
  };
}

function sourceCheck(
  sourceIds: string[],
  knownSourceIds: Set<string>,
  detailSourceIds: string[] = [],
): KnowledgeCoverageCheck {
  const ids = unique([...sourceIds, ...detailSourceIds]);
  const unknownIds = ids.filter((sourceId) => !knownSourceIds.has(sourceId));
  if (ids.length === 0) {
    return check('source', 'source-missing', '实体及其详情都没有来源 ID。');
  }
  if (unknownIds.length > 0) {
    return check('source', 'source-missing', '实体引用了来源目录之外的来源 ID。', ids, unknownIds);
  }
  return check('source', 'covered', '实体及其详情至少有一个可解析的来源 ID。', ids);
}

function summaryCheck(summary: string): KnowledgeCoverageCheck {
  return present(summary)
    ? check('summary', 'covered', '摘要字段有内容。')
    : check('summary', 'data-missing', '摘要字段为空。');
}

function polityDetailCheck(): KnowledgeCoverageCheck {
  return check('detail', 'data-missing', '当前目录没有独立的政权详情记录，需由后续批次补充。');
}

function personDetailCheck(detail: PersonDetail | undefined): KnowledgeCoverageCheck {
  if (!detail || !present(detail.biography)) {
    return check('detail', 'data-missing', '人物详情记录不存在或缺少生平摘要。', detail ? [detail.personId] : []);
  }
  return check('detail', 'covered', '人物详情包含生平、任职、关键事件和不确定性字段。', [detail.personId]);
}

function eventDetailCheck(detail: HistoricalEventDetail | undefined): KnowledgeCoverageCheck {
  if (!detail) return check('detail', 'data-missing', '事件详情记录不存在。');
  const hasNarrative = detail.causes.length > 0 || detail.consequences.length > 0 || (detail.phases?.length ?? 0) > 0;
  return hasNarrative
    ? check('detail', 'covered', '事件详情包含因果、结果或阶段叙事。', [detail.eventId])
    : check('detail', 'data-missing', '事件详情存在但缺少因果、结果和阶段叙事。', [detail.eventId]);
}

function heritageDetailCheck(detail: HeritageDetail | undefined): KnowledgeCoverageCheck {
  if (!detail) return check('detail', 'data-missing', '遗产详情记录不存在。');
  const complete = present(detail.modernLocation)
    && detail.historicalAssociations.length > 0
    && detail.survivingFeatures.length > 0
    && present(detail.presentDayValue);
  return complete
    ? check('detail', 'covered', '遗产详情包含现代位置、历史关联、遗存和当代价值。', [detail.heritageId])
    : check('detail', 'data-missing', '遗产详情缺少现代位置、历史关联、遗存或当代价值。', [detail.heritageId]);
}

function timeCheck(entityType: KnowledgeEntityType, entity: Polity | Person | HistoricalEvent | HeritageAsset): KnowledgeCoverageCheck {
  if (entityType === 'polity') {
    const polity = entity as Polity;
    return Number.isFinite(polity.startYear) && Number.isFinite(polity.endYear)
      ? check('time', 'covered', '政权起止年代均为有限数值。')
      : check('time', 'data-missing', '政权缺少有效的起止年代。');
  }
  if (entityType === 'person') {
    const person = entity as Person;
    if (Number.isFinite(person.birthYear) && Number.isFinite(person.deathYear)) {
      return check('time', 'covered', '人物生卒年均有记录。');
    }
    return check('time', 'uncertain', '人物生卒年不完整，目录将其视为史料不确定而非自动补值。');
  }
  if (entityType === 'event') {
    const event = entity as HistoricalEvent;
    if (!Number.isFinite(event.year)) return check('time', 'data-missing', '事件缺少有效年份。');
    if (event.datePrecision === 'approximate' || event.datePrecision === 'range') {
      return check('time', 'uncertain', '事件年份存在，但目录明确标注为约年或时间范围。');
    }
    return check('time', 'covered', '事件有明确的编年字段。');
  }
  const heritage = entity as HeritageAsset;
  return Number.isFinite(heritage.constructionFrom)
    ? check('time', 'covered', '遗产有始建或形成起始年代。')
    : check('time', 'uncertain', '遗产始建年代未确定，保留为空而不推定年代。');
}

function relationCheck(
  entityType: KnowledgeEntityType,
  entityId: string,
  eventDetails: HistoricalEventDetail[],
  people: Person[],
  heritageDetails: HeritageDetail[],
  claims: HistoricalClaim[],
): KnowledgeCoverageCheck {
  const evidenceIds: string[] = [];
  const relatedIds: string[] = [];
  if (entityType === 'polity') {
    eventDetails.filter((detail) => detail.polityIds.includes(entityId)).forEach((detail) => {
      evidenceIds.push(`event-detail:${detail.eventId}`);
      relatedIds.push(detail.eventId);
    });
    people.filter((person) => person.polityIds?.includes(entityId)).forEach((person) => {
      evidenceIds.push(`person:${person.id}`);
      relatedIds.push(person.id);
    });
    heritageDetails.filter((detail) => detail.associatedPolities.includes(entityId)).forEach((detail) => {
      evidenceIds.push(`heritage-detail:${detail.heritageId}`);
      relatedIds.push(detail.heritageId);
    });
    claims.filter((claim) => claim.subjectId === entityId || claim.objectId === entityId).forEach((claim) => {
      evidenceIds.push(`claim:${claim.id}`);
      if (claim.subjectId !== entityId) relatedIds.push(claim.subjectId);
      if (claim.objectId && claim.objectId !== entityId) relatedIds.push(claim.objectId);
    });
  } else {
    claims.filter((claim) => claim.subjectId === entityId || claim.objectId === entityId).forEach((claim) => {
      evidenceIds.push(`claim:${claim.id}`);
      if (claim.subjectId !== entityId) relatedIds.push(claim.subjectId);
      if (claim.objectId && claim.objectId !== entityId) relatedIds.push(claim.objectId);
    });
  }
  if (entityType === 'person') {
    const person = people.find((candidate) => candidate.id === entityId);
    if (person?.polityIds?.length) {
      evidenceIds.push(...person.polityIds.map((polityId) => `person-polity:${entityId}:${polityId}`));
      relatedIds.push(...person.polityIds);
    }
    eventDetails.filter((detail) => detail.participants.some((participant) => participant.personId === entityId)).forEach((detail) => {
      evidenceIds.push(`event-detail:${detail.eventId}`);
      relatedIds.push(detail.eventId);
    });
  }
  if (entityType === 'event') {
    eventDetails.filter((detail) => detail.eventId === entityId).forEach((detail) => {
      evidenceIds.push(`event-detail:${detail.eventId}`);
      relatedIds.push(...detail.polityIds, ...detail.relatedEventIds, ...detail.participants.map((participant) => participant.personId));
    });
  }
  if (entityType === 'heritage') {
    heritageDetails.filter((detail) => detail.heritageId === entityId).forEach((detail) => {
      evidenceIds.push(`heritage-detail:${detail.heritageId}`);
      relatedIds.push(...detail.associatedPeople, ...detail.associatedPolities, ...detail.associatedEvents);
    });
  }
  return evidenceIds.length > 0
    ? check('relationship', 'covered', '至少存在一条可追踪的图谱关联。', evidenceIds, relatedIds)
    : check('relationship', 'relationship-missing', '当前目录没有可追踪的关系记录。');
}

function applyAnnotation(
  current: KnowledgeCoverageCheck,
  annotation: KnowledgeCoverageAnnotation | undefined,
): KnowledgeCoverageCheck {
  if (!annotation) return current;
  return {
    ...current,
    status: annotation.status,
    note: annotation.note,
    evidenceIds: unique(annotation.evidenceIds ?? current.evidenceIds),
    overridden: true,
  };
}

function polityIdsFor(
  entityType: KnowledgeEntityType,
  entityId: string,
  catalog: KnowledgeCoverageCatalog,
  eventDetail: HistoricalEventDetail | undefined,
  heritageDetail: HeritageDetail | undefined,
  claims: HistoricalClaim[],
): string[] {
  if (entityType === 'polity') return [entityId];
  if (entityType === 'person') return unique(catalog.people.find((person) => person.id === entityId)?.polityIds ?? []);
  if (entityType === 'event') {
    const participantIds = eventDetail?.participants.map((participant) => participant.personId) ?? [];
    const claimedParticipantIds = claims
      .filter((claim) => claim.objectId === entityId)
      .map((claim) => claim.subjectId);
    return unique([
      ...(eventDetail?.polityIds ?? []),
      ...[...participantIds, ...claimedParticipantIds].flatMap((personId) => catalog.people.find((person) => person.id === personId)?.polityIds ?? []),
    ]);
  }
  const personIds = heritageDetail?.associatedPeople ?? [];
  return unique([
    ...(heritageDetail?.associatedPolities ?? []),
    ...personIds.flatMap((personId) => catalog.people.find((person) => person.id === personId)?.polityIds ?? []),
  ]);
}

function buildEntity(
  entityType: KnowledgeEntityType,
  entity: Polity | Person | HistoricalEvent | HeritageAsset,
  catalog: KnowledgeCoverageCatalog,
  detailById: Map<string, HistoricalEventDetail>,
  personDetailById: Map<string, PersonDetail>,
  heritageDetailById: Map<string, HeritageDetail>,
  knownSourceIds: Set<string>,
  annotations: Map<string, KnowledgeCoverageAnnotation>,
): KnowledgeCoverageEntity {
  const entityId = entity.id;
  const eventDetail = entityType === 'event' ? detailById.get(entityId) : undefined;
  const personDetail = entityType === 'person' ? personDetailById.get(entityId) : undefined;
  const heritageDetail = entityType === 'heritage' ? heritageDetailById.get(entityId) : undefined;
  const detailSourceIds = personDetail?.sourceIds ?? eventDetail?.sourceIds ?? heritageDetail?.sourceIds ?? [];
  const checks = [
    summaryCheck(entityType === 'event' ? (entity as HistoricalEvent).summary : (entity as Polity | Person | HeritageAsset).description),
    entityType === 'polity'
      ? polityDetailCheck()
      : entityType === 'person'
        ? personDetailCheck(personDetail)
        : entityType === 'event'
          ? eventDetailCheck(eventDetail)
          : heritageDetailCheck(heritageDetail),
    sourceCheck(entity.sourceIds, knownSourceIds, detailSourceIds),
    relationCheck(entityType, entityId, catalog.eventDetails, catalog.people, catalog.heritageDetails, catalog.claims),
    timeCheck(entityType, entity),
  ].map((current) => applyAnnotation(
    current,
    annotations.get(`${entityType}:${entityId}:${current.dimension}`),
  ));
  const polityIds = polityIdsFor(entityType, entityId, catalog, eventDetail, heritageDetail, catalog.claims);
  const label = entityType === 'event'
    ? (entity as HistoricalEvent).title
    : entityType === 'heritage'
      ? (entity as HeritageAsset).name
      : (entity as Polity | Person).name;
  return {
    entityType,
    entityId,
    entityKey: `${entityType}:${entityId}`,
    label,
    polityIds,
    checks,
  };
}

function buildGaps(entity: KnowledgeCoverageEntity): KnowledgeCoverageGap[] {
  return entity.checks
    .filter((item): item is KnowledgeCoverageCheck & { status: Exclude<CoverageGapKind, 'not-applicable'> } => item.status !== 'covered' && item.status !== 'not-applicable')
    .map((item) => ({
      entityType: entity.entityType,
      entityId: entity.entityId,
      entityKey: entity.entityKey,
      label: entity.label,
      dimension: item.dimension,
      kind: item.status,
      polityIds: entity.polityIds,
      evidenceIds: item.evidenceIds,
      relatedIds: item.relatedIds,
      note: item.note,
    }));
}

function buildTypeReport(entities: KnowledgeCoverageEntity[], gaps: KnowledgeCoverageGap[]): KnowledgeCoverageTypeReport {
  const statusCounts = emptyStatusCounts();
  const gapCounts = emptyGapCounts();
  entities.forEach((entity) => entity.checks.forEach((item) => { statusCounts[item.status] += 1; }));
  gaps.filter((gap) => gap.kind in gapCounts).forEach((gap) => { gapCounts[gap.kind] += 1; });
  return {
    totalEntities: entities.length,
    statusCounts,
    gapCounts,
    entitiesWithGaps: unique(gaps.map((gap) => gap.entityKey)),
  };
}

export function auditKnowledgeCoverage(catalog: KnowledgeCoverageCatalog = {
  polities: defaultPolities,
  people: defaultPeople,
  events: defaultEvents,
  eventDetails: defaultEventDetails,
  heritageAssets: defaultHeritageAssets,
  heritageDetails: defaultHeritageDetails,
  personDetails: defaultPersonDetails,
  claims: defaultClaims,
  sourceNotes: defaultSourceNotes,
}): KnowledgeCoverageReport {
  const detailById = new Map(catalog.eventDetails.map((detail) => [detail.eventId, detail]));
  const personDetailById = new Map(catalog.personDetails.map((detail) => [detail.personId, detail]));
  const heritageDetailById = new Map(catalog.heritageDetails.map((detail) => [detail.heritageId, detail]));
  const knownSourceIds = new Set(catalog.sourceNotes.map((source) => source.id));
  const annotations = new Map((catalog.annotations ?? []).map((annotation) => [
    `${annotation.entityType}:${annotation.entityId}:${annotation.dimension}`,
    annotation,
  ]));
  const entities = [
    ...catalog.polities.map((entity) => buildEntity('polity', entity, catalog, detailById, personDetailById, heritageDetailById, knownSourceIds, annotations)),
    ...catalog.people.map((entity) => buildEntity('person', entity, catalog, detailById, personDetailById, heritageDetailById, knownSourceIds, annotations)),
    ...catalog.events.map((entity) => buildEntity('event', entity, catalog, detailById, personDetailById, heritageDetailById, knownSourceIds, annotations)),
    ...catalog.heritageAssets.map((entity) => buildEntity('heritage', entity, catalog, detailById, personDetailById, heritageDetailById, knownSourceIds, annotations)),
  ];
  const byKey = Object.fromEntries(entities.map((entity) => [entity.entityKey, entity]));
  const gaps = entities.flatMap(buildGaps);
  const byType = Object.fromEntries(entityTypes.map((entityType) => {
    const typeEntities = entities.filter((entity) => entity.entityType === entityType);
    return [entityType, buildTypeReport(typeEntities, gaps.filter((gap) => gap.entityType === entityType))];
  })) as Record<KnowledgeEntityType, KnowledgeCoverageTypeReport>;
  const byPolity = Object.fromEntries(catalog.polities.map((polity) => {
    const polityEntities = entities.filter((entity) => entity.polityIds.includes(polity.id));
    return [polity.id, {
      polityId: polity.id,
      polityName: polity.name,
      entityKeys: polityEntities.map((entity) => entity.entityKey).sort(),
      gaps: gaps.filter((gap) => gap.polityIds.includes(polity.id)),
    }];
  })) as Record<string, KnowledgeCoveragePolityReport>;
  return { entities, gaps, byKey, byType, byPolity };
}

export const knowledgeCoverageDimensions = dimensions;
