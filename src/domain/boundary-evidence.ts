import type { BoundaryDerivation, BoundaryState, EvidenceLevel } from './types';

const allowedDerivations: Record<EvidenceLevel, readonly BoundaryDerivation[]> = {
  A: ['direct-source'],
  B: ['licensed-digitization', 'administrative-synthesis'],
  C: ['nearest-same-polity', 'maximum-record'],
  D: ['cultural-core', 'control-centers', 'influence-area'],
};

export function validateBoundaryEvidence(
  boundary: BoundaryState,
  sourceBoundaries: BoundaryState[] = [],
): string[] {
  const issues: string[] = [];
  const { evidence } = boundary;

  if (!allowedDerivations[evidence.evidenceLevel].includes(evidence.derivation)) {
    issues.push(`${evidence.derivation} is not valid for evidence level ${evidence.evidenceLevel}`);
  }
  if (!evidence.citations.length) issues.push('evidence requires at least one citation');
  if (!evidence.uncertaintyNote.trim()) issues.push('evidence requires an uncertainty note');

  const polygonal = boundary.geometry.type === 'Polygon' || boundary.geometry.type === 'MultiPolygon';
  if (evidence.evidenceLevel !== 'D' && !polygonal) {
    issues.push('non-D evidence must be polygonal');
  }
  if (evidence.evidenceLevel === 'C'
    && sourceBoundaries.some(source => source.polityId !== boundary.polityId)) {
    issues.push('C evidence must derive from the same polity');
  }

  return issues;
}

export function isDefiniteBoundary(boundary: BoundaryState): boolean {
  return (boundary.evidence.evidenceLevel === 'A' || boundary.evidence.evidenceLevel === 'B')
    && (boundary.geometry.type === 'Polygon' || boundary.geometry.type === 'MultiPolygon');
}
