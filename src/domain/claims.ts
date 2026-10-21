import type { HistoricalClaim, ClaimPerspective } from './types';

export interface ClaimQuery {
  year?: number;
  perspective?: ClaimPerspective;
  predicate?: string;
}

export interface ClaimValidationIssue {
  claimId: string;
  code: 'dangling-entity' | 'invalid-range' | 'missing-source' | 'missing-perspective';
  field: string;
  message: string;
}

const isActive = (claim: HistoricalClaim, year: number) =>
  (claim.validFrom === undefined || claim.validFrom <= year) &&
  (claim.validTo === undefined || year <= claim.validTo);

export function claimsAtYear(claims: HistoricalClaim[], year: number) {
  return claims.filter(claim => isActive(claim, year));
}

export function claimsForEntity(claims: HistoricalClaim[], entityId: string, query: ClaimQuery = {}) {
  return claims.filter(claim => (claim.subjectId === entityId || claim.objectId === entityId)
    && (query.year === undefined || isActive(claim, query.year))
    && (query.perspective === undefined || claim.perspective === query.perspective)
    && (query.predicate === undefined || claim.predicate === query.predicate));
}

export function validateClaims(claims: HistoricalClaim[], entityIds: Set<string>): ClaimValidationIssue[] {
  const issues: ClaimValidationIssue[] = [];
  for (const claim of claims) {
    if (!entityIds.has(claim.subjectId) || (claim.objectId !== undefined && !entityIds.has(claim.objectId))) {
      issues.push({ claimId: claim.id, code: 'dangling-entity', field: 'subjectId/objectId', message: '断言引用了不存在的实体。' });
    }
    if (claim.validFrom !== undefined && claim.validTo !== undefined && claim.validFrom > claim.validTo) {
      issues.push({ claimId: claim.id, code: 'invalid-range', field: 'validFrom/validTo', message: '断言时间区间反向。' });
    }
    if (claim.sourceIds.length === 0) {
      issues.push({ claimId: claim.id, code: 'missing-source', field: 'sourceIds', message: '断言缺少来源。' });
    }
    if (!claim.perspective) {
      issues.push({ claimId: claim.id, code: 'missing-perspective', field: 'perspective', message: '断言缺少观察视角。' });
    }
  }
  return issues;
}
