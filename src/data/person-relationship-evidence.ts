export type PersonRelationshipEvidenceKind = 'claim' | 'event-detail' | 'role';

export interface PersonRelationshipEvidence {
  kind: PersonRelationshipEvidenceKind;
  id: string;
  evidenceId: string;
}

export function createPersonRelationshipEvidence(
  kind: PersonRelationshipEvidenceKind,
  id: string,
): PersonRelationshipEvidence {
  return { kind, id, evidenceId: `${kind}:${id}` };
}

export function uniquePersonRelationshipEvidence(
  evidence: readonly PersonRelationshipEvidence[],
): PersonRelationshipEvidence[] {
  return [...new Map(evidence.map((item) => [item.evidenceId, item])).values()]
    .sort((left, right) => left.evidenceId.localeCompare(right.evidenceId));
}
