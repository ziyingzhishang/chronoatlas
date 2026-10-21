import { describe, expect, it } from 'vitest';
import { auditKnowledgeCoverage } from './knowledge-coverage';
import { claims } from './claims';
import { people } from './people';

const priorityCandidates = [
  'li-xiong',
  'li-yuanhao',
  'wanyan-aguda',
  'wu-ding',
] as const;

const expectedRelations = [
  ['li-xiong', 'related-to', 'yao-xing'],
  ['li-yuanhao', 'related-to', 'zhao-kuangyin'],
  ['wanyan-aguda', 'ally-of', 'zhao-gou'],
  ['wu-ding', 'related-to', 'zhou-wu'],
] as const;

const batchClaimIds = new Set([
  'claim-li-xiong-related-yao-xing',
  'claim-li-yuanhao-related-zhao-kuangyin',
  'claim-wanyan-aguda-ally-zhao-gou',
  'claim-wu-ding-related-zhou-wu',
]);

function personPersonClaims(sourceClaims = claims) {
  const personIds = new Set(people.map((person) => person.id));
  return sourceClaims.filter((claim) => claim.perspective === 'person'
    && personIds.has(claim.subjectId)
    && personIds.has(claim.objectId ?? ''));
}

function personRelation(subjectId: string, predicate: string, objectId: string) {
  return claims.find((claim) => claim.subjectId === subjectId
    && claim.predicate === predicate
    && claim.objectId === objectId);
}

describe('twelfth-batch historical people relationship selection', () => {
  it('prioritizes currently isolated people and allows audited fallback selection', () => {
    const relationshipsBeforeBatch = personPersonClaims().filter((claim) => !batchClaimIds.has(claim.id));
    const connectedBeforeBatch = new Set(relationshipsBeforeBatch
      .flatMap((claim) => [claim.subjectId, claim.objectId ?? '']));
    const isolatedPriority = priorityCandidates.filter((personId) => !connectedBeforeBatch.has(personId));

    expect(priorityCandidates.every((personId) => people.some((person) => person.id === personId))).toBe(true);
    expect(isolatedPriority).toEqual(priorityCandidates);
  });

  it('adds a directed person relation for every selected priority person', () => {
    const relationships = personPersonClaims();

    for (const personId of priorityCandidates) {
      expect(relationships.some((claim) => claim.subjectId === personId || claim.objectId === personId), personId)
        .toBe(true);
    }
  });

  it('records direction, period, source, confidence, and uncertainty for every relation', () => {
    for (const [subjectId, predicate, objectId] of expectedRelations) {
      const claim = personRelation(subjectId, predicate, objectId);
      expect(claim, `${subjectId} ${predicate} ${objectId}`).toBeDefined();
      expect(claim?.perspective).toBe('person');
      expect(claim?.validFrom).toEqual(expect.any(Number));
      expect(claim?.validTo).toEqual(expect.any(Number));
      expect(claim?.validFrom).toBeLessThanOrEqual(claim?.validTo ?? Number.NaN);
      expect(['low', 'medium', 'high']).toContain(claim?.confidence);
      expect(claim?.sourceIds.length).toBeGreaterThan(0);
      expect(claim?.uncertaintyNote).toBeTruthy();
    }
  });

  it('removes the relationship-missing coverage gap for every selected person', () => {
    const report = auditKnowledgeCoverage();

    for (const personId of priorityCandidates) {
      expect(report.byKey[`person:${personId}`]?.checks).toEqual(expect.arrayContaining([
        expect.objectContaining({ dimension: 'relationship', status: 'covered' }),
      ]));
    }
  });

  it('uses distinct graph relation categories for the audited historical contexts', () => {
    expect(new Set(expectedRelations.map(([, predicate]) => predicate))).toEqual(
      new Set(['related-to', 'ally-of']),
    );
    expect(personRelation('wanyan-aguda', 'ally-of', 'zhao-gou')?.predicate).toBe('ally-of');
    expect(personRelation('wu-ding', 'related-to', 'zhou-wu')?.predicate).toBe('related-to');
  });
});
