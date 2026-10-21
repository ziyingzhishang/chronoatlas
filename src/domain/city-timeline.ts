import type { DetailEntity } from './detail-entity';
import type { Place } from './types';
import type { StudyData } from './study-view';

export type CityHistoryData = Partial<StudyData>;
export type CityHistoryTimelineNodeType = DetailEntity['type'];

export interface CityHistoryTimelineNode {
  id: string;
  year?: number;
  periodLabel?: string;
  label: string;
  type: CityHistoryTimelineNodeType;
  entity: DetailEntity;
}

export interface CityHistoryTimeline {
  cityId: string;
  city?: Place;
  nodes: CityHistoryTimelineNode[];
  missingData: string[];
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

export function buildCityHistoryTimeline(cityId: string, data: CityHistoryData): CityHistoryTimeline {
  const city = data.places?.find((place) => place.id === cityId);
  if (!city) return { cityId, nodes: [], missingData: [`城市不存在：${cityId}`] };

  const nodes: CityHistoryTimelineNode[] = [{
    id: `place:${city.id}`,
    label: city.modernName ?? city.historicalName,
    periodLabel: '现代参照',
    type: 'place',
    entity: { type: 'place', id: city.id },
  }];
  const missingData: string[] = [];
  const capitalTerms = data.capitalTerms?.filter((term) => term.placeId === cityId) ?? [];
  const polityIds = new Set(capitalTerms.map((term) => term.polityId));
  const cityPolities = (data.polities ?? []).filter((polity) => polityIds.has(polity.id) || polity.capitalPlaceId === cityId);

  cityPolities.forEach((polity) => {
    const terms = capitalTerms.filter((term) => term.polityId === polity.id);
    nodes.push({
      id: `polity:${polity.id}`,
      year: firstYear([polity.startYear, ...terms.map((term) => term.validFrom)]),
      label: polity.name,
      type: 'polity',
      entity: { type: 'polity', id: polity.id },
    });
    polityIds.add(polity.id);
  });

  (data.people ?? []).filter((person) => person.polityIds?.some((polityId) => polityIds.has(polityId))).forEach((person) => {
    const relatedPolities = (data.polities ?? []).filter((polity) => person.polityIds?.includes(polity.id));
    nodes.push({
      id: `person:${person.id}`,
      year: firstYear([person.birthYear, ...relatedPolities.map((polity) => polity.startYear)]),
      label: person.name,
      type: 'person',
      entity: { type: 'person', id: person.id },
    });
  });

  (data.events ?? []).filter((event) => event.placeId === cityId).forEach((event) => nodes.push({
    id: `event:${event.id}`,
    year: event.year,
    label: event.title,
    type: 'event',
    entity: { type: 'event', id: event.id },
  }));

  (data.heritage ?? []).filter((asset) => asset.placeId === cityId).forEach((asset) => nodes.push({
    id: `heritage:${asset.id}`,
    year: asset.constructionFrom,
    label: asset.name,
    type: 'heritage',
    entity: { type: 'heritage', id: asset.id },
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
  return { cityId, city, nodes, missingData };
}
