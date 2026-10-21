import { describe, expect, it } from 'vitest';
import { auditKnowledgeCoverage } from './knowledge-coverage';
import { claims } from './claims';
import { people } from './people';

const targets = [
  'han-xin',
  'xiao-he',
  'liu-xuan',
  'yao-chang',
  'yao-xing',
  'heliAN-bobo',
  'liu-yu',
  'wu-zhao',
  'li-zhi',
  'li-longji',
  'wei-zheng',
  'an-lushan',
] as const;

const expectedRelations = [
  ['han-xin', 'served', 'liu-bang'],
  ['xiao-he', 'served', 'liu-bang'],
  ['xiao-he', 'ally-of', 'han-xin'],
  ['liu-xiu', 'served', 'liu-xuan'],
  ['yao-chang', 'parent-of', 'yao-xing'],
  ['heliAN-bobo', 'enemy-of', 'yao-xing'],
  ['liu-yu', 'enemy-of', 'yao-xing'],
  ['li-zhi', 'appointed', 'wu-zhao'],
  ['wu-zhao', 'related-to', 'li-longji'],
  ['wei-zheng', 'served', 'li-shimin'],
  ['an-lushan', 'enemy-of', 'li-longji'],
] as const;

function personRelation(subjectId: string, predicate: string, objectId: string) {
  return claims.find((claim) => claim.subjectId === subjectId
    && claim.predicate === predicate
    && claim.objectId === objectId);
}

describe('seventh-batch historical people relationships', () => {
  it('connects the selected high-value people to at least one person directly', () => {
    const personIds = new Set(people.map((person) => person.id));

    for (const personId of targets) {
      expect(personIds.has(personId), personId).toBe(true);
      const relationships = claims.filter((claim) =>
        claim.perspective === 'person'
        && personIds.has(claim.subjectId)
        && personIds.has(claim.objectId ?? '')
        && (claim.subjectId === personId || claim.objectId === personId),
      );
      expect(relationships.length, `${personId} remains isolated`).toBeGreaterThan(0);
    }
  });

  it('records each audited relation with direction, time, source, and uncertainty', () => {
    for (const [subjectId, predicate, objectId] of expectedRelations) {
      const claim = personRelation(subjectId, predicate, objectId);
      expect(claim, `${subjectId} ${predicate} ${objectId}`).toBeDefined();
      expect(claim?.perspective).toBe('person');
      expect(claim?.validFrom, `${subjectId} ${predicate} ${objectId}`).toEqual(expect.any(Number));
      expect(claim?.validTo, `${subjectId} ${predicate} ${objectId}`).toEqual(expect.any(Number));
      expect(claim?.validFrom).toBeLessThanOrEqual(claim?.validTo ?? Number.NaN);
      expect(claim?.sourceIds.length, `${subjectId} source`).toBeGreaterThan(0);
      expect(claim?.uncertaintyNote, `${subjectId} uncertainty`).toBeTruthy();
    }
  });

  it('reduces relationship-missing coverage gaps for every selected person', () => {
    const report = auditKnowledgeCoverage();

    for (const personId of targets) {
      const entity = report.byKey[`person:${personId}`];
      const relationshipCheck = entity?.checks.find((check) => check.dimension === 'relationship');
      expect(relationshipCheck?.status, personId).toBe('covered');
    }
  });
});
