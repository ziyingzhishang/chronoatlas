import { describe, expect, it } from 'vitest';
import { auditKnowledgeCoverage } from './knowledge-coverage';
import { claims } from './claims';
import { people } from './people';

const targets = [
  'yang-jian',
  'qin-shi-huang',
  'meng-tian',
  'huo-qubing',
  'zhang-qian',
  'ban-gu',
  'xuan-zang',
  'wang-wei',
  'du-fu',
  'chen-baxian',
] as const;

const expectedRelations = [
  ['yang-jian', 'related-to', 'li-yuan'],
  ['qin-shi-huang', 'appointed', 'meng-tian'],
  ['meng-tian', 'served', 'qin-shi-huang'],
  ['huo-qubing', 'ally-of', 'zhang-qian'],
  ['zhang-qian', 'ally-of', 'huo-qubing'],
  ['ban-gu', 'related-to', 'liu-xiu'],
  ['xuan-zang', 'related-to', 'li-shimin'],
  ['wang-wei', 'served', 'li-longji'],
  ['du-fu', 'related-to', 'li-longji'],
  ['chen-baxian', 'served', 'xiao-yan'],
] as const;

const batchClaimIds = new Set([
  'claim-yang-jian-related-li-yuan',
  'claim-qin-shi-huang-appointed-meng-tian',
  'claim-meng-tian-served-qin-shi-huang',
  'claim-huo-qubing-ally-zhang-qian',
  'claim-zhang-qian-ally-huo-qubing',
  'claim-ban-gu-related-liu-xiu',
  'claim-xuan-zang-related-li-shimin',
  'claim-wang-wei-served-li-longji',
  'claim-du-fu-related-li-longji',
  'claim-chen-baxian-served-xiao-yan',
]);

function personRelation(subjectId: string, predicate: string, objectId: string) {
  return claims.find((claim) => claim.subjectId === subjectId
    && claim.predicate === predicate
    && claim.objectId === objectId);
}

function personPersonClaims(sourceClaims = claims) {
  const personIds = new Set(people.map((person) => person.id));
  return sourceClaims.filter((claim) => claim.perspective === 'person'
    && personIds.has(claim.subjectId)
    && personIds.has(claim.objectId ?? ''));
}

describe('tenth-batch historical people relationships', () => {
  it('selects ten currently isolated people from the audited priority networks', () => {
    const baselineClaims = personPersonClaims(claims.filter((claim) => !batchClaimIds.has(claim.id)));
    const connected = new Set(baselineClaims.flatMap((claim) => [claim.subjectId, claim.objectId!].filter(Boolean)));

    expect(targets).toHaveLength(10);
    expect(targets.every((personId) => !connected.has(personId))).toBe(true);
  });

  it('connects every selected person through an explicit directed person relation', () => {
    const personIds = new Set(people.map((person) => person.id));
    const relationships = personPersonClaims();

    for (const personId of targets) {
      expect(relationships.some((claim) => claim.subjectId === personId || claim.objectId === personId), personId).toBe(true);
    }
    expect(relationships.filter((claim) => targets.includes(claim.subjectId as typeof targets[number])
      || targets.includes(claim.objectId as typeof targets[number]))).not.toHaveLength(0);
    expect(relationships.every((claim) => personIds.has(claim.subjectId) && personIds.has(claim.objectId ?? ''))).toBe(true);
  });

  it('records each relation with direction, time, source, and uncertainty', () => {
    for (const [subjectId, predicate, objectId] of expectedRelations) {
      const claim = personRelation(subjectId, predicate, objectId);
      expect(claim, `${subjectId} ${predicate} ${objectId}`).toBeDefined();
      expect(claim?.perspective).toBe('person');
      expect(claim?.validFrom, `${subjectId} validFrom`).toEqual(expect.any(Number));
      expect(claim?.validTo, `${subjectId} validTo`).toEqual(expect.any(Number));
      expect(claim?.validFrom).toBeLessThanOrEqual(claim?.validTo ?? Number.NaN);
      expect(claim?.sourceIds.length, `${subjectId} source`).toBeGreaterThan(0);
      expect(claim?.uncertaintyNote, `${subjectId} uncertainty`).toBeTruthy();
    }
  });

  it('reduces relationship-missing coverage gaps for all selected people', () => {
    const report = auditKnowledgeCoverage();
    const isolatedAfter = targets.filter((personId) => !personPersonClaims()
      .some((claim) => claim.subjectId === personId || claim.objectId === personId));

    expect(isolatedAfter).toEqual([]);
    for (const personId of targets) {
      expect(report.byKey[`person:${personId}`]).toBeDefined();
      expect(report.byKey[`person:${personId}`]?.checks).toEqual(expect.arrayContaining([
        expect.objectContaining({ dimension: 'relationship', status: 'covered' }),
      ]));
    }
  });
});
