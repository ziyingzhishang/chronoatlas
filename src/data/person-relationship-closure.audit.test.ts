import { describe, expect, it } from 'vitest';
import { validateClaims } from '../domain/claims';
import { auditKnowledgeCoverage } from './knowledge-coverage';
import { claims } from './claims';
import { people } from './people';
import { sourceNotes } from './sources';

const targetPeople = [
  'xiongnu-southern-chanyu-48',
  'zhizhi-chanyu',
  'xiongnu-northern-chanyu-91',
  'liu-yuan',
  'ilai-khagan',
  'kutlug-ilterish',
  'qapaghan',
  'bilge-khagan',
  'kul-tegin',
  'tonyukuk',
  'ozmish-khagan',
  'bayanchur',
] as const;

const expectedRelations = [
  ['claim-xiongnu-southern-chanyu-48-grandchild-huhanye', 'xiongnu-southern-chanyu-48', 'grandchild-of', 'huhanye'],
  ['claim-zhizhi-sibling-huhanye-closure', 'zhizhi-chanyu', 'sibling-of', 'huhanye'],
  ['claim-xiongnu-northern-chanyu-91-enemy-dou-xian', 'xiongnu-northern-chanyu-91', 'enemy-of', 'dou-xian'],
  ['claim-liu-yuan-related-liu-yao-closure', 'liu-yuan', 'related-to', 'liu-yao'],
  ['claim-ilai-khagan-enemy-li-shimin-closure', 'ilai-khagan', 'enemy-of', 'li-shimin'],
  ['claim-tonyukuk-served-kutlug-closure', 'tonyukuk', 'served', 'kutlug-ilterish'],
  ['claim-qapaghan-sibling-kutlug-closure', 'qapaghan', 'sibling-of', 'kutlug-ilterish'],
  ['claim-bilge-sibling-kul-tegin-closure', 'bilge-khagan', 'sibling-of', 'kul-tegin'],
  ['claim-kul-tegin-sibling-bilge-closure', 'kul-tegin', 'sibling-of', 'bilge-khagan'],
  ['claim-tonyukuk-served-bilge-closure', 'tonyukuk', 'served', 'bilge-khagan'],
  ['claim-ozmish-enemy-bayanchur-closure', 'ozmish-khagan', 'enemy-of', 'bayanchur'],
  ['claim-bayanchur-enemy-ozmish-closure', 'bayanchur', 'enemy-of', 'ozmish-khagan'],
] as const;

describe('current person relationship closure', () => {
  it('records the source-bounded relation for every current relationship task', () => {
    const peopleIds = new Set(people.map((person) => person.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));

    for (const [claimId, subjectId, predicate, objectId] of expectedRelations) {
      const matching = claims.filter((claim) => claim.id === claimId);
      expect(matching, claimId).toHaveLength(1);
      const claim = matching[0];
      expect(claim.subjectId).toBe(subjectId);
      expect(claim.predicate).toBe(predicate);
      expect(claim.objectId).toBe(objectId);
      expect(peopleIds.has(claim.subjectId)).toBe(true);
      expect(peopleIds.has(claim.objectId ?? '')).toBe(true);
      expect(claim.perspective).toBe('person');
      expect(claim.sourceIds.length).toBeGreaterThan(0);
      expect(claim.sourceIds.every((sourceId) => sourceIds.has(sourceId))).toBe(true);
      expect(claim.uncertaintyNote).toBeTruthy();
      if (claim.datePrecision === 'unknown') {
        expect(claim.validFrom).toBeUndefined();
        expect(claim.validTo).toBeUndefined();
      } else {
        expect(claim.validFrom).toEqual(expect.any(Number));
        expect(claim.validTo).toEqual(expect.any(Number));
        expect(claim.validFrom).toBeLessThanOrEqual(claim.validTo ?? Number.NaN);
      }
    }

    expect(validateClaims(claims.filter((claim) => expectedRelations.some(([claimId]) => claim.id === claimId)), peopleIds)).toEqual([]);
  });

  it('closes every current person-person relationship task without using polity co-membership', () => {
    const report = auditKnowledgeCoverage();
    const missingTasks = report.tasks.filter((task) => task.taskKind === 'person-person-relationship-missing');

    expect(missingTasks).toEqual([]);
    expect(targetPeople.every((personId) => expectedRelations.some(([, subjectId, , objectId]) => subjectId === personId || objectId === personId))).toBe(true);
  });
});
