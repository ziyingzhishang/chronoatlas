import type { HistoricalClaim } from './types';

export type PersonRelationshipKind = 'person-person' | 'person-polity' | 'person-event' | 'person-heritage';

export interface PersonRelationship {
  kind: PersonRelationshipKind;
  claim: HistoricalClaim;
}

const predicateKinds: Record<string, PersonRelationshipKind> = {
  founded: 'person-polity',
  ruled: 'person-polity',
  succeeded: 'person-polity',
  'related-to': 'person-person',
  'participated-in': 'person-event',
  commissioned: 'person-heritage',
};

const activeAt = (claim: HistoricalClaim, year: number) =>
  (claim.validFrom === undefined || claim.validFrom <= year) &&
  (claim.validTo === undefined || year <= claim.validTo);

export function findPersonRelationships(personId: string, year: number, sourceClaims: HistoricalClaim[]): PersonRelationship[] {
  return sourceClaims
    .filter((claim) => claim.subjectId === personId && activeAt(claim, year))
    .map((claim) => ({ claim, kind: predicateKinds[claim.predicate] }))
    .filter((relation): relation is PersonRelationship => relation.kind !== undefined);
}

export function groupPersonRelationships(personId: string, year: number, sourceClaims: HistoricalClaim[]) {
  const grouped: Record<PersonRelationshipKind, PersonRelationship[]> = {
    'person-person': [], 'person-polity': [], 'person-event': [], 'person-heritage': [],
  };
  for (const relation of findPersonRelationships(personId, year, sourceClaims)) grouped[relation.kind].push(relation);
  return grouped;
}
