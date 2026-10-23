import { describe, expect, it } from 'vitest';
import { auditKnowledgeCoverage } from './knowledge-coverage';
import { claims } from './claims';
import { people } from './people';
import { polities } from './polities';

const targets = [
  'zhou-gong-dan',
  'xiao-daocheng',
  'yelu-abaoji',
  'wang-jian',
  'qin-mugong',
  'ji-yijiu',
  'yu-the-great',
  'zhao-wuling',
] as const;

const expectedRelations = [
  ['zhou-gong-dan', 'served', 'zhou-wu'],
  ['xiao-daocheng', 'related-to', 'xiao-yan'],
  ['yelu-abaoji', 'enemy-of', 'li-cunxu'],
  ['wang-jian', 'enemy-of', 'zhu-wen'],
  ['qin-mugong', 'related-to', 'qin-shi-huang'],
  ['ji-yijiu', 'related-to', 'zhou-wu'],
  ['yu-the-great', 'related-to', 'zhou-wu'],
  ['zhao-wuling', 'related-to', 'qin-shi-huang'],
] as const;

const batchClaimIds = new Set([
  'claim-zhou-wu-sibling-zhou-gong-dan-fortythird',
  'claim-zhou-gong-dan-served-zhou-wu',
  'claim-xiao-daocheng-related-xiao-yan',
  'claim-yelu-abaoji-enemy-li-cunxu',
  'claim-wang-jian-enemy-zhu-wen',
  'claim-qin-mugong-related-qin-shi-huang',
  'claim-ji-yijiu-related-zhou-wu',
  'claim-yu-the-great-related-zhou-wu',
  'claim-zhao-wuling-related-qin-shi-huang',
  'claim-yelu-abaoji-parent-yelu-deguang-liao',
  'claim-yelu-deguang-child-yelu-abaoji-liao',
  'claim-shengzong-parent-xingzong-liao',
  'claim-xingzong-child-shengzong-liao',
  'claim-zhou-gong-dan-ally-zhou-wu-seventythird',
]);

function personRelation(subjectId: string, predicate: string, objectId: string) {
  return claims.find((claim) => claim.subjectId === subjectId
    && claim.predicate === predicate
    && claim.objectId === objectId);
}

describe('eleventh-batch historical people relationship selection', () => {
  it('selects eight currently isolated people from the audited catalog', () => {
    const personIds = new Set(people.map((person) => person.id));
    const connected = new Set(
      claims
        .filter((claim) => !batchClaimIds.has(claim.id)
          && claim.perspective === 'person'
          && personIds.has(claim.subjectId)
          && personIds.has(claim.objectId ?? ''))
        .flatMap((claim) => [claim.subjectId, claim.objectId ?? '']),
    );

    expect(targets).toHaveLength(8);
    expect(targets.every((personId) => personIds.has(personId))).toBe(true);
    expect(targets.filter((personId) => connected.has(personId)), 'already connected before batch').toEqual([]);
  });

  it('adds a directed person relation for every selected person', () => {
    const personIds = new Set(people.map((person) => person.id));
    const relationships = claims.filter((claim) => claim.perspective === 'person'
      && personIds.has(claim.subjectId)
      && personIds.has(claim.objectId ?? ''));

    for (const personId of targets) {
      expect(relationships.some((claim) => claim.subjectId === personId || claim.objectId === personId), personId)
        .toBe(true);
    }
  });

  it('records direction, time, source, and uncertainty for each audited relation', () => {
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

  it('removes the relationship-missing coverage gap for every selected person', () => {
    const report = auditKnowledgeCoverage();
    for (const personId of targets) {
      expect(report.byKey[`person:${personId}`]?.checks).toEqual(expect.arrayContaining([
        expect.objectContaining({ dimension: 'relationship', status: 'covered' }),
      ]));
    }
  });

  it('leaves no unconnected people after subsequent relationship batches', () => {
    const personIds = new Set(people.map((person) => person.id));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const connected = new Set(claims
      .filter((claim) => claim.perspective === 'person'
        && personIds.has(claim.subjectId)
        && (personIds.has(claim.objectId ?? '') || polityIds.has(claim.objectId ?? '')))
      .flatMap((claim) => [claim.subjectId, claim.objectId ?? '']));
    const isolated = people
      .filter((person) => !connected.has(person.id))
      .map((person) => person.id)
      .sort();

    expect(isolated).toEqual([]);
  });
});
