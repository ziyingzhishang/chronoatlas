import type { HistoricalClaim, PersonRelationType } from './types';

export type PersonRelationshipKind = 'person-person' | 'person-polity' | 'person-event' | 'person-heritage';

export interface PersonRelationship {
  kind: PersonRelationshipKind;
  relationType: PersonRelationType;
  claim: HistoricalClaim;
  direction: 'outgoing' | 'incoming';
}

export type GroupedPersonRelationships = Record<PersonRelationshipKind, PersonRelationship[]> & Record<PersonRelationType, PersonRelationship[]>;

const predicateKinds: Record<string, PersonRelationshipKind> = {
  'parent-of': 'person-person', 'child-of': 'person-person', 'spouse-of': 'person-person',
  'grandparent-of': 'person-person', 'grandchild-of': 'person-person',
  'sibling-of': 'person-person', 'teacher-of': 'person-person', 'student-of': 'person-person',
  served: 'person-person', appointed: 'person-person', 'ally-of': 'person-person', 'enemy-of': 'person-person',
  founded: 'person-polity',
  ruled: 'person-polity',
  succeeded: 'person-polity',
  'related-to': 'person-person',
  'participated-in': 'person-event',
  commissioned: 'person-heritage',
};

const predicateRelationTypes: Record<string, PersonRelationType> = {
  'parent-of': 'parent-of', 'child-of': 'child-of', 'spouse-of': 'spouse-of', 'sibling-of': 'sibling-of',
  'grandparent-of': 'grandparent-of', 'grandchild-of': 'grandchild-of',
  'teacher-of': 'teacher-of', 'student-of': 'student-of', served: 'served', appointed: 'appointed',
  succeeded: 'succeeded', founded: 'founded', ruled: 'ruled', 'ally-of': 'ally-of', 'enemy-of': 'enemy-of',
  'related-to': 'related-to', 'participated-in': 'participated-in', commissioned: 'commissioned',
};

const inversePredicates: Partial<Record<PersonRelationType, PersonRelationType>> = {
  'parent-of': 'child-of',
  'child-of': 'parent-of',
  'grandparent-of': 'grandchild-of',
  'grandchild-of': 'grandparent-of',
  'teacher-of': 'student-of',
  'student-of': 'teacher-of',
};

const activeAt = (claim: HistoricalClaim, year: number) =>
  (claim.validFrom === undefined || claim.validFrom <= year) &&
  (claim.validTo === undefined || year <= claim.validTo);

export function findPersonRelationships(personId: string, year: number, sourceClaims: HistoricalClaim[]): PersonRelationship[] {
  return sourceClaims
    .filter((claim) => (claim.subjectId === personId || claim.objectId === personId) && activeAt(claim, year))
    .map((claim) => {
      const outgoing = claim.subjectId === personId;
      const relationType = predicateRelationTypes[claim.predicate];
      const normalizedPredicate = outgoing || !relationType
        ? claim.predicate
        : inversePredicates[relationType] ?? claim.predicate;
      const normalizedClaim = outgoing || claim.objectId === undefined
        ? claim
        : {
          ...claim,
          subjectId: personId,
          objectId: claim.subjectId,
          predicate: normalizedPredicate,
        };
      return {
        claim: normalizedClaim,
        kind: predicateKinds[normalizedPredicate],
        relationType: predicateRelationTypes[normalizedPredicate],
        direction: outgoing ? 'outgoing' : 'incoming',
      };
    })
    .filter((relation): relation is PersonRelationship => relation.kind !== undefined && relation.relationType !== undefined)
    .sort((left, right) => (left.claim.validFrom ?? Number.MAX_SAFE_INTEGER) - (right.claim.validFrom ?? Number.MAX_SAFE_INTEGER) || left.claim.id.localeCompare(right.claim.id));
}

export function groupPersonRelationships(personId: string, year: number, sourceClaims: HistoricalClaim[]): GroupedPersonRelationships {
  const grouped = {
    'person-person': [], 'person-polity': [], 'person-event': [], 'person-heritage': [],
  } as unknown as GroupedPersonRelationships;
  for (const relationType of Object.values(predicateRelationTypes) as PersonRelationType[]) {
    Object.defineProperty(grouped, relationType, { value: [], enumerable: false, writable: true });
  }
  for (const relation of findPersonRelationships(personId, year, sourceClaims)) {
    grouped[relation.kind].push(relation);
    grouped[relation.relationType]!.push(relation);
  }
  return grouped;
}
