import type { CapitalTerm, HistoricalClaim, HistoricalEvent, HeritageAsset, Person, Place, Polity } from './types';

export interface StudyData {
  polities: Polity[];
  places: Place[];
  people: Person[];
  heritage: HeritageAsset[];
  events: HistoricalEvent[];
  claims: HistoricalClaim[];
  capitalTerms: CapitalTerm[];
}

export interface PolityStudyView {
  kind: 'polity';
  subject: Polity;
  year: number;
  capitalTerms: CapitalTerm[];
  events: HistoricalEvent[];
  people: Person[];
  heritage: HeritageAsset[];
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
}

const active = (from: number | undefined, to: number | undefined, year: number) =>
  (from === undefined || from <= year) && (to === undefined || year <= to);

const claimTouches = (claim: HistoricalClaim, id: string) => claim.subjectId === id || claim.objectId === id;

export function buildPolityStudyView(polityId: string, year: number, data: StudyData): PolityStudyView | undefined {
  const subject = data.polities.find((polity) => polity.id === polityId);
  if (!subject) return undefined;
  const capitalTerms = data.capitalTerms.filter((term) => term.polityId === polityId && active(term.validFrom, term.validTo, year));
  const claims = data.claims.filter((claim) => claimTouches(claim, polityId) && active(claim.validFrom, claim.validTo, year));
  const people = data.people.filter((person) => person.polityIds?.includes(polityId));
  const heritageIds = new Set(claims.filter((claim) => claim.predicate === 'left-heritage').map((claim) => claim.objectId));
  return {
    kind: 'polity', subject, year, capitalTerms,
    events: data.events.filter((event) => event.year <= year && (event.endYear === undefined || year <= event.endYear) && event.sourceIds.some((sourceId) => subject.sourceIds.includes(sourceId))),
    people, heritage: data.heritage.filter((asset) => heritageIds.has(asset.id)), claims,
  };
}

export function buildCityStudyView(cityId: string, year: number, data: StudyData): CityStudyView | undefined {
  const subject = data.places.find((place) => place.id === cityId);
  if (!subject) return undefined;
  // 城市视角需要保留截至该年已经发生过的全部政权连接；否则在650年
  // 只会看到唐，而看不到已经结束的隋等历史层。
  const capitalTerms = data.capitalTerms.filter((term) => term.placeId === cityId && term.validFrom <= year);
  const polityIds = new Set(capitalTerms.map((term) => term.polityId));
  const polities = data.polities.filter((polity) => polityIds.has(polity.id));
  const claims = data.claims.filter((claim) => claimTouches(claim, cityId) && active(claim.validFrom, claim.validTo, year));
  const people = data.people.filter((person) => person.polityIds?.some((polityId) => polityIds.has(polityId)));
  return {
    kind: 'city', subject, year, polities, capitalTerms,
    events: data.events.filter((event) => event.placeId === cityId && event.year <= year && (event.endYear === undefined || year <= event.endYear)),
    people, heritage: data.heritage.filter((asset) => asset.placeId === cityId), claims,
  };
}
