import type { DetailEntity } from './detail-entity';
import type { HistoricalClaim, Place } from './types';
import { buildCityStudyView, type CityStudyRelation, type StudyData } from './study-view';

export type CityHistoryData = Partial<StudyData>;
export type CityHistoryTimelineNodeType = DetailEntity['type'];
export type CityHistoryTimelineDatePrecision = HistoricalClaim['datePrecision'];

export interface CityHistoryTimelineEvidence {
  relationCount: number;
  sourceStatus: 'available' | 'unresolved';
  sourceCount: number;
  datePrecisions: CityHistoryTimelineDatePrecision[];
  uncertaintyStatus: 'recorded' | 'not-recorded';
  uncertaintyNotes: string[];
}

export interface CityHistoryTimelineNode {
  id: string;
  year?: number;
  periodLabel?: string;
  label: string;
  type: CityHistoryTimelineNodeType;
  entity: DetailEntity;
  evidence: CityHistoryTimelineEvidence;
}

export interface CityHistoryTimeline {
  cityId: string;
  city?: Place;
  nodes: CityHistoryTimelineNode[];
  missingData: string[];
  relations?: CityStudyRelation[];
}

const nodeOrder: Record<CityHistoryTimelineNodeType, number> = {
  polity: 0,
  person: 1,
  event: 2,
  heritage: 3,
  place: 4,
};

const firstYear = (years: Array<number | undefined>): number | undefined => {
  const available = years.filter((year): year is number => year !== undefined);
  return available.length > 0 ? Math.min(...available) : undefined;
};

const uniqueById = <T extends { id: string }>(items: T[] | undefined): T[] =>
  [...new Map((items ?? []).map((item) => [item.id, item])).values()];

const uniqueStrings = <T extends string>(items: T[]): T[] => [...new Set(items)];

function evidenceForNode(
  node: Pick<CityHistoryTimelineNode, 'entity'>,
  data: CityHistoryData,
  relations: CityStudyRelation[],
): CityHistoryTimelineEvidence {
  const entityId = node.entity.id;
  const nodeRelations = relations.filter((relation) => relation.from.id === entityId || relation.to.id === entityId);
  const claimsById = new Map((data.claims ?? []).map((claim) => [claim.id, claim]));
  const relationClaims = nodeRelations.map((relation) => claimsById.get(relation.claimId)).filter((claim): claim is HistoricalClaim => claim !== undefined);
  const sourceIds = [...nodeRelations.flatMap((relation) => relation.sourceIds)];
  const datePrecisions = relationClaims.map((claim) => claim.datePrecision);
  const uncertaintyNotes = relationClaims.flatMap((claim) => claim.uncertaintyNote ? [claim.uncertaintyNote] : []);

  if (node.entity.type === 'place') {
    sourceIds.push(...(data.places?.find((place) => place.id === entityId)?.sourceIds ?? []));
  } else if (node.entity.type === 'polity') {
    const polity = data.polities?.find((item) => item.id === entityId);
    sourceIds.push(...(polity?.sourceIds ?? []));
    sourceIds.push(...(data.capitalTerms ?? []).filter((term) => term.polityId === entityId).flatMap((term) => term.sourceIds));
  } else if (node.entity.type === 'person') {
    sourceIds.push(...(data.people?.find((person) => person.id === entityId)?.sourceIds ?? []));
  } else if (node.entity.type === 'event') {
    const event = data.events?.find((item) => item.id === entityId);
    sourceIds.push(...(event?.sourceIds ?? []));
    if (event?.datePrecision) datePrecisions.push(event.datePrecision);
    const detail = data.eventDetails?.find((item) => item.eventId === entityId);
    sourceIds.push(...(detail?.sourceIds ?? []));
    if (detail?.uncertaintyNote) uncertaintyNotes.push(detail.uncertaintyNote);
  } else if (node.entity.type === 'heritage') {
    sourceIds.push(...(data.heritage?.find((asset) => asset.id === entityId)?.sourceIds ?? []));
  }

  const distinctSourceIds = uniqueStrings(sourceIds);
  return {
    relationCount: nodeRelations.length,
    sourceStatus: distinctSourceIds.length > 0 ? 'available' : 'unresolved',
    sourceCount: distinctSourceIds.length,
    datePrecisions: uniqueStrings(datePrecisions),
    uncertaintyStatus: uncertaintyNotes.length > 0 ? 'recorded' : 'not-recorded',
    uncertaintyNotes: uniqueStrings(uncertaintyNotes),
  };
}

export function buildCityHistoryTimeline(cityId: string, data: CityHistoryData): CityHistoryTimeline {
  const city = data.places?.find((place) => place.id === cityId);
  if (!city) return { cityId, nodes: [], missingData: [`城市不存在：${cityId}`] };

  const nodes: CityHistoryTimelineNode[] = [{
    id: `place:${city.id}`,
    label: city.modernName ?? city.historicalName,
    periodLabel: '现代参照',
    type: 'place',
    entity: { type: 'place', id: city.id },
    evidence: { relationCount: 0, sourceStatus: 'unresolved', sourceCount: 0, datePrecisions: [], uncertaintyStatus: 'not-recorded', uncertaintyNotes: [] },
  }];
  const missingData: string[] = [];
  const capitalTerms = [...new Map((data.capitalTerms ?? [])
    .filter((term) => term.placeId === cityId)
    .map((term) => [`${term.polityId}:${term.placeId}:${term.validFrom}:${term.validTo}:${term.role}:${term.status}`, term])).values()];
  const polityIds = new Set(capitalTerms.map((term) => term.polityId));
  const cityPolities = uniqueById((data.polities ?? []).filter((polity) => polityIds.has(polity.id) || polity.capitalPlaceId === cityId));

  cityPolities.forEach((polity) => {
    const terms = capitalTerms.filter((term) => term.polityId === polity.id);
    nodes.push({
      id: `polity:${polity.id}`,
      year: firstYear([polity.startYear, ...terms.map((term) => term.validFrom)]),
      label: polity.name,
      type: 'polity',
      entity: { type: 'polity', id: polity.id },
      evidence: { relationCount: 0, sourceStatus: 'unresolved', sourceCount: 0, datePrecisions: [], uncertaintyStatus: 'not-recorded', uncertaintyNotes: [] },
    });
    polityIds.add(polity.id);
  });

  uniqueById((data.people ?? []).filter((person) => person.polityIds?.some((polityId) => polityIds.has(polityId)))).forEach((person) => {
    const relatedPolities = cityPolities.filter((polity) => person.polityIds?.includes(polity.id));
    nodes.push({
      id: `person:${person.id}`,
      year: firstYear([person.birthYear, ...relatedPolities.map((polity) => polity.startYear)]),
      label: person.name,
      type: 'person',
      entity: { type: 'person', id: person.id },
      evidence: { relationCount: 0, sourceStatus: 'unresolved', sourceCount: 0, datePrecisions: [], uncertaintyStatus: 'not-recorded', uncertaintyNotes: [] },
    });
  });

  uniqueById((data.events ?? []).filter((event) => event.placeId === cityId)).forEach((event) => nodes.push({
    id: `event:${event.id}`,
    year: event.year,
    label: event.title,
    type: 'event',
    entity: { type: 'event', id: event.id },
    evidence: { relationCount: 0, sourceStatus: 'unresolved', sourceCount: 0, datePrecisions: [], uncertaintyStatus: 'not-recorded', uncertaintyNotes: [] },
  }));

  uniqueById((data.heritage ?? []).filter((asset) => asset.placeId === cityId)).forEach((asset) => nodes.push({
    id: `heritage:${asset.id}`,
    year: asset.constructionFrom,
    label: asset.name,
    type: 'heritage',
    entity: { type: 'heritage', id: asset.id },
    evidence: { relationCount: 0, sourceStatus: 'unresolved', sourceCount: 0, datePrecisions: [], uncertaintyStatus: 'not-recorded', uncertaintyNotes: [] },
  }));

  if (cityPolities.length === 0) missingData.push('暂无已收录政权历史层');
  if (!nodes.some((node) => node.type === 'person')) missingData.push('暂无已收录人物');
  if (!nodes.some((node) => node.type === 'event')) missingData.push('暂无已收录事件');
  if (!nodes.some((node) => node.type === 'heritage')) missingData.push('暂无已收录遗产');

  nodes.sort((left, right) => {
    const leftYear = left.year ?? Number.POSITIVE_INFINITY;
    const rightYear = right.year ?? Number.POSITIVE_INFINITY;
    return leftYear - rightYear || nodeOrder[left.type] - nodeOrder[right.type];
  });
  const studyData: StudyData = {
    polities: uniqueById(data.polities),
    places: uniqueById(data.places),
    people: uniqueById(data.people),
    heritage: uniqueById(data.heritage),
    events: uniqueById(data.events),
    claims: uniqueById(data.claims),
    capitalTerms: data.capitalTerms ?? [],
  };
  const cityStudy = buildCityStudyView(cityId, Number.POSITIVE_INFINITY, studyData);
  const relations = cityStudy?.relations ?? [];
  return {
    cityId,
    city,
    nodes: nodes.map((node) => ({ ...node, evidence: evidenceForNode(node, data, relations) })),
    missingData,
    relations,
  };
}
