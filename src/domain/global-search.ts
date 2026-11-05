import type {
  CapitalTerm,
  HistoricalClaim,
  HistoricalEvent,
  HeritageAsset,
  Person,
  Place,
  Polity,
  SourceNote,
} from './types';
import type { DetailEntity } from './detail-entity';

export type GlobalSearchType = 'event' | 'person' | 'polity' | 'place' | 'heritage';
export type GlobalSearchRegion = 'china' | 'world';
export type GlobalSearchMatchKind = 'name' | 'alias' | 'prefix' | 'modern-name' | 'content' | 'related';

export interface GlobalSearchResult {
  key: string;
  type: GlobalSearchType;
  id: string;
  entity: DetailEntity;
  title: string;
  modernName?: string;
  year?: number;
  category?: string;
  categoryValue?: string;
  region?: GlobalSearchRegion;
  matchKind: GlobalSearchMatchKind;
}

export interface GlobalSearchCategory {
  value: string;
  type: GlobalSearchType;
  label: string;
}

export interface GlobalSearchFilters {
  region?: GlobalSearchRegion;
  category?: string;
}

export interface GlobalSearchData {
  events: readonly HistoricalEvent[];
  eventDetails: readonly Record<string, unknown>[];
  people: readonly Person[];
  personDetails: readonly Record<string, unknown>[];
  polities: readonly Polity[];
  polityDetails: readonly Record<string, unknown>[];
  places: readonly Place[];
  heritage: readonly HeritageAsset[];
  heritageDetails: readonly Record<string, unknown>[];
  claims: readonly HistoricalClaim[];
  sources: readonly SourceNote[];
  capitalTerms: readonly CapitalTerm[];
}

export interface GlobalSearchIndex {
  categories: GlobalSearchCategory[];
  search(query: string, filters?: GlobalSearchFilters): GlobalSearchResult[];
}

const typeOrder: GlobalSearchType[] = ['event', 'person', 'polity', 'place', 'heritage'];
const typeLabels: Record<GlobalSearchType, string> = {
  event: '事件', person: '人物', polity: '政权', place: '地点', heritage: '遗址遗产',
};
const knownCategoryLabels: Record<string, string> = {
  'ancient-city-site': '古城/都城遗址',
  'archaeological-site': '考古遗址',
  'modern-city-centre': '现代城市',
  'regional-reference': '区域参照',
  'mobile-centre': '移动中心',
  dynasty: '王朝', kingdom: '王国', regime: '政权', tribal_polity: '部族政权', local_rule: '地方政权',
  palace: '宫殿', 'city-site': '古城遗址', tomb: '陵墓', temple: '寺庙', inscription: '碑刻', museum: '博物馆', other: '其他',
};

const normalized = (value: string) => value.trim().toLocaleLowerCase();

function stringsIn(value: unknown, key = ''): string[] {
  if (/(id|ids|url|coordinates?)$/i.test(key)) return [];
  if (typeof value === 'string') return value.startsWith('http') ? [] : [value];
  if (Array.isArray(value)) return value.flatMap(item => stringsIn(item));
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([childKey, childValue]) => stringsIn(childValue, childKey));
  }
  return [];
}

function matchText(query: string, nameValues: string[], aliasValues: string[], modernValues: string[], contentValues: string[], relatedValues: string[], translate: (text: string) => string) {
  const needle = normalized(query);
  const variants = (values: string[]) => [...new Set(values.flatMap(value => [value, translate(value)]).map(normalized).filter(Boolean))];
  const names = variants(nameValues);
  const aliases = variants(aliasValues);
  const modernNames = variants(modernValues);
  const content = variants(contentValues);
  const related = variants(relatedValues);

  if (names.includes(needle)) return { matchKind: 'name' as const, rank: 0 };
  if (aliases.includes(needle)) return { matchKind: 'alias' as const, rank: 1 };
  if (modernNames.includes(needle)) return { matchKind: 'modern-name' as const, rank: 1 };
  if (names.some(value => value.startsWith(needle)) || aliases.some(value => value.startsWith(needle))) return { matchKind: 'prefix' as const, rank: 2 };
  if (modernNames.some(value => value.startsWith(needle))) return { matchKind: 'modern-name' as const, rank: 2 };
  if ([...content, ...modernNames].some(value => value.includes(needle))) return { matchKind: 'content' as const, rank: 3 };
  if (related.some(value => value.includes(needle))) return { matchKind: 'related' as const, rank: 4 };
  return undefined;
}

export function buildGlobalSearchIndex(data: GlobalSearchData, translate: (text: string) => string): GlobalSearchIndex {
  const politiesById = new Map(data.polities.map(polity => [polity.id, polity]));
  const peopleById = new Map(data.people.map(person => [person.id, person]));
  const placesById = new Map(data.places.map(place => [place.id, place]));
  const eventsById = new Map(data.events.map(event => [event.id, event]));
  const heritageById = new Map(data.heritage.map(asset => [asset.id, asset]));
  const sourcesById = new Map(data.sources.map(source => [source.id, source]));
  const polityIds = new Set(data.polities.map(polity => polity.id));

  const eventDetailsById = new Map(data.eventDetails.map(detail => [String(detail.eventId ?? ''), detail]));
  const personDetailsById = new Map(data.personDetails.map(detail => [String(detail.personId ?? ''), detail]));
  const polityDetailsById = new Map(data.polityDetails.map(detail => [String(detail.polityId ?? ''), detail]));
  const heritageDetailsById = new Map(data.heritageDetails.map(detail => [String(detail.heritageId ?? ''), detail]));
  const claimsByEntity = new Map<string, HistoricalClaim[]>();
  for (const claim of data.claims) {
    for (const id of [claim.subjectId, claim.objectId].filter((value): value is string => Boolean(value))) {
      claimsByEntity.set(id, [...(claimsByEntity.get(id) ?? []), claim]);
    }
  }

  const eventPlacesById = new Map<string, HistoricalEvent[]>();
  for (const event of data.events) if (event.placeId) eventPlacesById.set(event.placeId, [...(eventPlacesById.get(event.placeId) ?? []), event]);
  const regionsForPolities = (ids: Iterable<string>) => new Set([...ids].flatMap(id => {
    const polity = politiesById.get(id);
    return polity ? [polity.region === 'world' ? 'world' as const : 'china' as const] : [];
  }));
  const politiesForPerson = (person: Person) => new Set([
    ...(person.polityIds ?? []),
    ...(claimsByEntity.get(person.id) ?? []).filter(claim => claim.perspective === 'person').flatMap(claim =>
      [claim.subjectId, claim.objectId].filter((id): id is string => Boolean(id && polityIds.has(id)))),
  ]);
  const politiesForPlace = (place: Place) => new Set([
    ...data.capitalTerms.filter(term => term.placeId === place.id).map(term => term.polityId),
    ...(claimsByEntity.get(place.id) ?? []).flatMap(claim =>
      [claim.subjectId, claim.objectId].filter((id): id is string => Boolean(id && polityIds.has(id)))),
  ]);
  const regionsForPlace = (place: Place) => {
    const regions = regionsForPolities(politiesForPlace(place));
    for (const event of eventPlacesById.get(place.id) ?? []) regions.add(event.region === 'world' ? 'world' : 'china');
    return regions;
  };

  const categoryFor = (type: GlobalSearchType, value?: string | readonly string[]) => {
    const first = Array.isArray(value) ? value[0] : value;
    return first ? `${type}:${first}` : undefined;
  };
  const categoryOptions = new Map<string, GlobalSearchCategory>();
  const addCategory = (type: GlobalSearchType, value?: string) => {
    if (!value) return;
    const id = `${type}:${value}`;
    const categoryName = knownCategoryLabels[value] ?? value;
    categoryOptions.set(id, { value: id, type, label: `${translate(typeLabels[type])} · ${translate(categoryName)}` });
  };

  const records: Array<{
    type: GlobalSearchType;
    id: string;
    entity: DetailEntity;
    title: string;
    modernName?: string;
    year?: number;
    categories: string[];
    regions: Set<GlobalSearchRegion>;
    names: string[];
    aliases: string[];
    modernNames: string[];
    content: string[];
    related: string[];
  }> = [];
  const linkedSourceText = (sourceIds: string[]) => sourceIds.flatMap(id => {
    const source = sourcesById.get(id);
    return source ? stringsIn({ title: source.title, authorOrInstitution: source.authorOrInstitution, scope: source.scope, note: source.note }) : [];
  });
  const relatedClaimText = (id: string, relatedIds: string[] = []) => [...new Set([id, ...relatedIds])]
    .flatMap(entityId => claimsByEntity.get(entityId) ?? [])
    .flatMap(claim => stringsIn({ predicate: claim.predicate, uncertaintyNote: claim.uncertaintyNote, perspective: claim.perspective, evidenceType: claim.evidenceType }));
  const searchContent = (record: Record<string, unknown>, detailRecords: Record<string, unknown>[], claimIds: string[], linkedIds: string[] = []) => [
    ...stringsIn(record),
    ...detailRecords.flatMap(value => stringsIn(value)),
    ...claimIds.flatMap(id => {
      const claim = data.claims.find(item => item.id === id);
      return claim ? stringsIn({ predicate: claim.predicate, uncertaintyNote: claim.uncertaintyNote }) : [];
    }),
    ...relatedClaimText(String(record.id ?? ''), linkedIds),
  ];
  const relatedNames = (ids: string[], type: 'person' | 'polity' | 'place' | 'event' | 'heritage') => ids.flatMap(id => {
    const value = type === 'person' ? peopleById.get(id)?.name
      : type === 'polity' ? politiesById.get(id)?.name
      : type === 'place' ? placesById.get(id)?.historicalName
      : type === 'event' ? eventsById.get(id)?.title
      : heritageById.get(id)?.name;
    return value ? [value] : [];
  });

  for (const event of data.events) {
    const detail = eventDetailsById.get(event.id);
    const claims = claimsByEntity.get(event.id) ?? [];
    const detailIds = [
      ...((detail?.participants as Array<{ personId?: string }> | undefined) ?? []).flatMap(item => item.personId ? [item.personId] : []),
      ...((detail?.polityIds as string[] | undefined) ?? []),
      ...((detail?.locationIds as string[] | undefined) ?? []),
    ];
    const sources = [...event.sourceIds, ...((detail?.sourceIds as string[] | undefined) ?? []), ...claims.flatMap(claim => claim.sourceIds)];
    const category = categoryFor('event', event.category);
    addCategory('event', event.category);
    records.push({
      type: 'event', id: event.id, entity: { type: 'event', id: event.id }, title: event.title, year: event.year,
      categories: category ? [category] : [], regions: new Set(event.region ? [event.region] : []),
      names: [event.title], aliases: [], modernNames: [],
      content: searchContent(event as unknown as Record<string, unknown>, detail ? [detail] : [], [], detailIds)
        .concat(relatedNames(detailIds.filter(id => peopleById.has(id)), 'person'), relatedNames(detailIds.filter(id => politiesById.has(id)), 'polity'), relatedNames(detailIds.filter(id => placesById.has(id)), 'place')),
      related: [...linkedSourceText(sources), ...relatedClaimText(event.id, detailIds)],
    });
  }

  for (const person of data.people) {
    const detail = personDetailsById.get(person.id);
    const claims = claimsByEntity.get(person.id) ?? [];
    const relatedPolities = [...politiesForPerson(person)];
    const categoryValues = person.roles ?? [];
    const categories = categoryValues.map(value => categoryFor('person', value)).filter((value): value is string => Boolean(value));
    categoryValues.forEach(value => addCategory('person', value));
    const sources = [...person.sourceIds, ...((detail?.sourceIds as string[] | undefined) ?? []), ...claims.flatMap(claim => claim.sourceIds)];
    const officeTexts = ((detail?.offices as Array<Record<string, unknown>> | undefined) ?? []).flatMap(value => stringsIn(value));
    const linkedIds = relatedPolities.concat(officeTexts.flatMap(text => [...politiesById.values()].filter(polity => polity.id === text).map(polity => polity.id)));
    records.push({ type: 'person', id: person.id, entity: { type: 'person', id: person.id }, title: person.name,
      categories, regions: regionsForPolities(relatedPolities), names: [person.name], aliases: [...(person.aliases ?? []), ...((detail?.aliases as string[] | undefined) ?? [])], modernNames: [],
      content: searchContent(person as unknown as Record<string, unknown>, detail ? [detail] : [], [], linkedIds),
      related: [...linkedSourceText(sources), ...relatedClaimText(person.id, linkedIds), ...relatedNames(relatedPolities, 'polity')],
    });
  }

  for (const polity of data.polities) {
    const detail = polityDetailsById.get(polity.id);
    const linkedIds = [
      ...((detail?.principalFigureIds as string[] | undefined) ?? []),
      ...((detail?.eventIds as string[] | undefined) ?? []),
      ...((detail?.heritageIds as string[] | undefined) ?? []),
      ...((detail?.capitalPhases as Array<{ placeId?: string }> | undefined) ?? []).flatMap(item => item.placeId ? [item.placeId] : []),
    ];
    const sources = [...polity.sourceIds, ...((detail?.sourceIds as string[] | undefined) ?? []), ...(claimsByEntity.get(polity.id) ?? []).flatMap(claim => claim.sourceIds)];
    const category = categoryFor('polity', polity.type);
    addCategory('polity', polity.type);
    const eventIds = (detail?.eventIds as string[] | undefined) ?? [];
    const personIds = (detail?.principalFigureIds as string[] | undefined) ?? [];
    const placeIds = ((detail?.capitalPhases as Array<{ placeId?: string }> | undefined) ?? []).flatMap(item => item.placeId ? [item.placeId] : []);
    records.push({ type: 'polity', id: polity.id, entity: { type: 'polity', id: polity.id }, title: polity.name,
      categories: category ? [category] : [], regions: new Set([polity.region === 'world' ? 'world' : 'china']), names: [polity.name, polity.originalName ?? ''], aliases: [], modernNames: [],
      content: searchContent(polity as unknown as Record<string, unknown>, detail ? [detail] : [], (detail?.claimIds as string[] | undefined) ?? [], linkedIds)
        .concat(relatedNames(eventIds, 'event'), relatedNames(personIds, 'person'), relatedNames(placeIds, 'place')),
      related: [...linkedSourceText(sources), ...relatedClaimText(polity.id, linkedIds)],
    });
  }

  for (const place of data.places) {
    const placeClaims = claimsByEntity.get(place.id) ?? [];
    const linkedPolities = [...politiesForPlace(place)];
    const linkedEvents = eventPlacesById.get(place.id) ?? [];
    const eventDetailIds = data.eventDetails.filter(detail => ((detail.locationIds as string[] | undefined) ?? []).includes(place.id)).map(detail => String(detail.eventId ?? '')).filter(Boolean);
    const sources = [...place.sourceIds, ...placeClaims.flatMap(claim => claim.sourceIds), ...linkedEvents.flatMap(event => event.sourceIds)];
    const category = categoryFor('place', place.pointType);
    addCategory('place', place.pointType);
    const linkedHeritage = data.heritage.filter(asset => asset.placeId === place.id);
    const linkedPolityNames = relatedNames(linkedPolities, 'polity');
    const linkedEventNames = relatedNames([...new Set([...linkedEvents.map(event => event.id), ...eventDetailIds])], 'event');
    records.push({ type: 'place', id: place.id, entity: { type: 'place', id: place.id }, title: place.historicalName,
      modernName: place.modernName, categories: category ? [category] : [], regions: regionsForPlace(place),
      names: [place.historicalName], aliases: place.aliases, modernNames: [place.modernName ?? '', place.modernAdministrativeUnit ?? ''],
      content: searchContent(place as unknown as Record<string, unknown>, [], [], [...linkedPolities, ...linkedEvents.map(event => event.id), ...linkedHeritage.map(asset => asset.id)])
        .concat(linkedPolityNames, linkedEventNames, linkedHeritage.flatMap(asset => [asset.name, asset.description])),
      related: [...linkedSourceText(sources), ...relatedClaimText(place.id, [...linkedPolities, ...eventDetailIds])],
    });
  }

  for (const asset of data.heritage) {
    const detail = heritageDetailsById.get(asset.id);
    const place = placesById.get(asset.placeId);
    const associatedPolities = ((detail?.associatedPolities as string[] | undefined) ?? []);
    const associatedEvents = ((detail?.associatedEvents as string[] | undefined) ?? []);
    const associatedPeople = ((detail?.associatedPeople as string[] | undefined) ?? []);
    const category = categoryFor('heritage', asset.type);
    addCategory('heritage', asset.type);
    const claims = claimsByEntity.get(asset.id) ?? [];
    const sources = [...asset.sourceIds, ...((detail?.sourceIds as string[] | undefined) ?? []), ...claims.flatMap(claim => claim.sourceIds)];
    const linkedIds = [...associatedPolities, ...associatedEvents, ...associatedPeople, asset.placeId];
    records.push({ type: 'heritage', id: asset.id, entity: { type: 'heritage', id: asset.id }, title: asset.name,
      categories: category ? [category] : [], regions: new Set([...regionsForPolities(associatedPolities), ...(place ? regionsForPlace(place) : [])]), names: [asset.name], aliases: [], modernNames: [],
      content: searchContent(asset as unknown as Record<string, unknown>, detail ? [detail] : [], [], linkedIds)
        .concat(place ? [place.historicalName, place.modernName ?? '', place.modernAdministrativeUnit ?? ''] : [], relatedNames(associatedPeople, 'person'), relatedNames(associatedPolities, 'polity'), relatedNames(associatedEvents, 'event')),
      related: [...linkedSourceText(sources), ...relatedClaimText(asset.id, linkedIds)],
    });
  }

  const categories = [...categoryOptions.values()].sort((a, b) => typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type) || a.label.localeCompare(b.label, 'zh-Hans'));

  return {
    categories,
    search(query: string, filters: GlobalSearchFilters = {}) {
      const needle = query.trim();
      if (!needle) return [];
      return records.flatMap(record => {
        if (filters.region && !record.regions.has(filters.region)) return [];
        if (filters.category && !record.categories.includes(filters.category)) return [];
        const match = matchText(needle, record.names, record.aliases, record.modernNames, record.content, record.related, translate);
        if (!match) return [];
        return [{
          key: `${record.type}:${record.id}`,
          type: record.type,
          id: record.id,
          entity: record.entity,
          title: record.title,
          modernName: record.modernName,
          year: record.year,
          category: record.categories[0]?.slice(record.type.length + 1),
          categoryValue: record.categories[0],
          region: record.regions.has('china') ? 'china' as const : record.regions.has('world') ? 'world' as const : undefined,
          matchKind: match.matchKind,
          rank: match.rank,
        }];
      }).sort((a, b) => a.rank - b.rank || typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type) || a.title.localeCompare(b.title, 'zh-Hans'))
        .map(({ rank: _rank, ...result }) => result);
    },
  };
}
