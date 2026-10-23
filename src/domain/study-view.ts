import type { CapitalTerm, HistoricalClaim, HistoricalEvent, HistoricalEventDetail, HeritageAsset, Person, Place, Polity, PolityDetail } from './types';

export interface StudyData {
  polities: Polity[];
  places: Place[];
  people: Person[];
  heritage: HeritageAsset[];
  events: HistoricalEvent[];
  eventDetails?: HistoricalEventDetail[];
  claims: HistoricalClaim[];
  capitalTerms: CapitalTerm[];
  polityDetails?: PolityDetail[];
}

export interface PolityStudyView {
  kind: 'polity';
  subject: Polity;
  year: number;
  capitalTerms: CapitalTerm[];
  capitalPlaces: Place[];
  events: HistoricalEvent[];
  people: Person[];
  heritage: HeritageAsset[];
  detailLinkedPeople: Person[];
  detailLinkedEvents: HistoricalEvent[];
  detailLinkedTransitionEvents: HistoricalEvent[];
  detailLinkedHeritage: HeritageAsset[];
  detailLinkedClaims: HistoricalClaim[];
  claims: HistoricalClaim[];
}

export interface CityStudyView {
  kind: 'city';
  subject: Place;
  year: number;
  polities: Polity[];
  capitalTerms: CapitalTerm[];
  events: HistoricalEvent[];
  people: Person[];
  heritage: HeritageAsset[];
  claims: HistoricalClaim[];
  relations?: CityStudyRelation[];
}

export interface CityStudyRelation {
  id: string;
  from: CityStudyEntity;
  to: CityStudyEntity;
  predicate: string;
  claimId: string;
  validFrom?: number;
  validTo?: number;
  sourceIds: string[];
  confidence: HistoricalClaim['confidence'];
  uncertaintyNote?: string;
}

type CityStudyEntity =
  | { type: 'polity'; id: string }
  | { type: 'place'; id: string }
  | { type: 'person'; id: string }
  | { type: 'event'; id: string }
  | { type: 'heritage'; id: string };

const active = (from: number | undefined, to: number | undefined, year: number) =>
  (from === undefined || from <= year) && (to === undefined || year <= to);

const claimTouches = (claim: HistoricalClaim, id: string) => claim.subjectId === id || claim.objectId === id;

const uniqueById = <T extends { id: string }>(items: T[]) => [...new Map(items.map((item) => [item.id, item])).values()];

const historicalUntil = (from: number | undefined, year: number) => from === undefined || from <= year;

const cityEntity = (id: string, data: {
  polities: Polity[];
  places: Place[];
  people: Person[];
  events: HistoricalEvent[];
  heritage: HeritageAsset[];
}): CityStudyEntity | undefined => {
  if (data.polities.some((item) => item.id === id)) return { type: 'polity', id };
  if (data.places.some((item) => item.id === id)) return { type: 'place', id };
  if (data.people.some((item) => item.id === id)) return { type: 'person', id };
  if (data.events.some((item) => item.id === id)) return { type: 'event', id };
  if (data.heritage.some((item) => item.id === id)) return { type: 'heritage', id };
  return undefined;
};

const buildCityRelations = (
  cityId: string,
  year: number,
  data: StudyData,
  entities: CityStudyEntity[],
  includeHistoricalClaims = false,
): CityStudyRelation[] => {
  const entityIds = new Set(entities.map((entity) => entity.id));
  entityIds.add(cityId);
  const resolvedData = {
    polities: uniqueById(data.polities),
    places: uniqueById(data.places),
    people: uniqueById(data.people),
    events: uniqueById(data.events),
    heritage: uniqueById(data.heritage),
  };
  const relations = data.claims
    .filter((claim) => includeHistoricalClaims || active(claim.validFrom, claim.validTo, year))
    .filter((claim) => claim.objectId !== undefined && entityIds.has(claim.subjectId) && entityIds.has(claim.objectId))
    .map((claim): CityStudyRelation | undefined => {
      const from = cityEntity(claim.subjectId, resolvedData);
      const to = cityEntity(claim.objectId!, resolvedData);
      if (!from || !to) return undefined;
      return {
        id: `claim:${claim.id}`,
        from,
        to,
        predicate: claim.predicate,
        claimId: claim.id,
        validFrom: claim.validFrom,
        validTo: claim.validTo,
        sourceIds: claim.sourceIds,
        confidence: claim.confidence,
        uncertaintyNote: claim.uncertaintyNote,
      } satisfies CityStudyRelation;
    })
    .filter((relation) => relation !== undefined) as CityStudyRelation[];
  return [...new Map(relations.map((relation) => [relation.id, relation])).values()];
};

export function buildPolityStudyView(polityId: string, year: number, data: StudyData): PolityStudyView | undefined {
  const subject = data.polities.find((polity) => polity.id === polityId);
  if (!subject) return undefined;
  const capitalTerms = data.capitalTerms.filter((term) => term.polityId === polityId && active(term.validFrom, term.validTo, year));
  const capitalPlaceIds = new Set(capitalTerms.map((term) => term.placeId));
  const capitalPlaces = uniqueById(data.places.filter((place) => capitalPlaceIds.has(place.id)));
  const people = data.people.filter((person) => person.polityIds?.includes(polityId));
  const polityDetail = data.polityDetails?.find((detail) => detail.polityId === polityId);
  const detailLinkedPeople = uniqueById((polityDetail?.principalFigureIds ?? [])
    .map((personId) => data.people.find((person) => person.id === personId))
    .filter((person): person is Person => person !== undefined));
  const explicitPolityIdsByEventId = new Map((data.eventDetails ?? [])
    .map((detail) => [detail.eventId, new Set(detail.polityIds)] as const));
  const events = data.events.filter((event) => event.year <= year && (event.endYear === undefined || year <= event.endYear)
    && (explicitPolityIdsByEventId.get(event.id)?.has(polityId)
      ?? event.sourceIds.some((sourceId) => subject.sourceIds.includes(sourceId))));
  const detailLinkedEvents = uniqueById((polityDetail?.eventIds ?? [])
    .map((eventId) => data.events.find((event) => event.id === eventId))
    .filter((event): event is HistoricalEvent => event !== undefined)
    .filter((event) => {
      const explicitPolityIds = explicitPolityIdsByEventId.get(event.id);
      return explicitPolityIds === undefined || explicitPolityIds.has(polityId);
    }));
  const detailLinkedTransitionEvents = uniqueById((polityDetail?.eventIds ?? [])
    .map((eventId) => data.events.find((event) => event.id === eventId))
    .filter((event): event is HistoricalEvent => event !== undefined)
    .filter((event) => !events.some((current) => current.id === event.id))
    .filter((event) => {
      const explicitPolityIds = explicitPolityIdsByEventId.get(event.id);
      return explicitPolityIds !== undefined && !explicitPolityIds.has(polityId);
    }));
  const transitionEventIds = new Set(detailLinkedTransitionEvents.map((event) => event.id));
  const polityClaims = data.claims.filter((claim) => claimTouches(claim, polityId) && active(claim.validFrom, claim.validTo, year));
  const detailLinkedClaims = uniqueById((polityDetail?.claimIds ?? [])
    .map((claimId) => data.claims.find((claim) => claim.id === claimId))
    .filter((claim): claim is HistoricalClaim => claim !== undefined));
  const heritageIds = new Set(polityClaims.filter((claim) => claim.predicate === 'left-heritage').map((claim) => claim.objectId));
  const detailLinkedHeritage = uniqueById((polityDetail?.heritageIds ?? [])
    .map((heritageId) => data.heritage.find((asset) => asset.id === heritageId))
    .filter((asset): asset is HeritageAsset => asset !== undefined));
  const entityIds = new Set([
    polityId,
    ...people.map((person) => person.id),
    ...events.map((event) => event.id),
    ...heritageIds,
  ]);
  const claims = data.claims.filter((claim) => active(claim.validFrom, claim.validTo, year)
    && !transitionEventIds.has(claim.subjectId)
    && !transitionEventIds.has(claim.objectId ?? '')
    && (claimTouches(claim, polityId) || (claim.objectId !== undefined && entityIds.has(claim.subjectId) && entityIds.has(claim.objectId))));
  return {
    kind: 'polity', subject, year, capitalTerms, capitalPlaces,
    events,
    people, heritage: data.heritage.filter((asset) => heritageIds.has(asset.id)),
    detailLinkedPeople, detailLinkedEvents, detailLinkedTransitionEvents, detailLinkedHeritage, detailLinkedClaims, claims,
  };
}

export function buildCityStudyView(
  cityId: string,
  year: number,
  data: StudyData,
  options: { includeHistoricalClaims?: boolean } = {},
): CityStudyView | undefined {
  const subject = data.places.find((place) => place.id === cityId);
  if (!subject) return undefined;
  // 城市视角需要保留截至该年已经发生过的全部政权连接；否则在650年
  // 只会看到唐，而看不到已经结束的隋等历史层。
  const capitalTerms = [...new Map(data.capitalTerms
    .filter((term) => term.placeId === cityId && term.validFrom <= year)
    .map((term) => [`${term.polityId}:${term.placeId}:${term.validFrom}:${term.validTo}:${term.role}:${term.status}`, term])).values()];
  const polityIds = new Set(capitalTerms.map((term) => term.polityId));
  data.polities.filter((polity) => polity.capitalPlaceId === cityId).forEach((polity) => polityIds.add(polity.id));
  const polities = uniqueById(data.polities.filter((polity) => polityIds.has(polity.id)));
  const events = uniqueById(data.events.filter((event) => event.placeId === cityId && historicalUntil(event.year, year)));
  const heritage = uniqueById(data.heritage.filter((asset) => asset.placeId === cityId && historicalUntil(asset.constructionFrom, year)));
  const people = uniqueById(data.people.filter((person) => person.polityIds?.some((polityId) => polityIds.has(polityId))));
  const entities: CityStudyEntity[] = [
    { type: 'place', id: cityId },
    ...polities.map((polity) => ({ type: 'polity' as const, id: polity.id })),
    ...events.map((event) => ({ type: 'event' as const, id: event.id })),
    ...people.map((person) => ({ type: 'person' as const, id: person.id })),
    ...heritage.map((asset) => ({ type: 'heritage' as const, id: asset.id })),
  ];
  const entityIds = new Set(entities.map((entity) => entity.id));
  const claims = [...new Map(data.claims
    .filter((claim) => options.includeHistoricalClaims || active(claim.validFrom, claim.validTo, year))
    .filter((claim) => claimTouches(claim, cityId) || (entityIds.has(claim.subjectId) && claim.objectId !== undefined && entityIds.has(claim.objectId)))
    .map((claim) => [claim.id, claim])).values()];
  return {
    kind: 'city', subject, year, polities, capitalTerms,
    events, people, heritage, claims, relations: buildCityRelations(cityId, year, data, entities, options.includeHistoricalClaims),
  };
}
