import { describe, expect, it } from 'vitest';
import { validateClaims } from '../domain/claims';
import { claims } from './claims';
import { people } from './people';
import { sourceNotes } from './sources';

const expectedRelations = [
  ['yao-xing', 'succeeded', 'yao-chang', 394, 394],
  ['hongtaiji', 'succeeded', 'nurhaci', 1626, 1626],
  ['liu-yu', 'parent-of', 'liu-yilong', 407, 422],
  ['qifu-gangui', 'succeeded', 'qifu-guoren', 388, 388],
  ['qifu-chipan', 'succeeded', 'qifu-gangui', 412, 412],
  ['feng-hong', 'succeeded', 'feng-ba', 430, 430],
  ['yelu-dashi', 'parent-of', 'yelu-yilie', 1150, 1163],
  ['piluo-ge', 'parent-of', 'geluofeng', 728, 748],
  ['li-zhi', 'spouse-of', 'wu-zhao', 655, 683],
  ['wu-zhao', 'spouse-of', 'li-zhi', 655, 683],
] as const;

describe('fortieth batch high-confidence person relationships', () => {
  it('adds the selected sourced relationship edges with explicit time ranges', () => {
    const peopleIds = new Set(people.map((person) => person.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));

    for (const [subjectId, predicate, objectId, validFrom, validTo] of expectedRelations) {
      const relation = claims.find((claim) => claim.subjectId === subjectId
        && claim.predicate === predicate
        && claim.objectId === objectId);

      expect(relation, `${subjectId} ${predicate} ${objectId}`).toBeDefined();
      expect(relation?.validFrom, `${subjectId} ${predicate} ${objectId}`).toBe(validFrom);
      expect(relation?.validTo, `${subjectId} ${predicate} ${objectId}`).toBe(validTo);
      expect(relation?.datePrecision, `${subjectId} ${predicate} ${objectId}`).toMatch(/year|range/);
      expect(relation?.perspective, `${subjectId} ${predicate} ${objectId}`).toBe('person');
      expect(relation?.evidenceType, `${subjectId} ${predicate} ${objectId}`).toMatch(/explicit-record|cross-checked/);
      expect(relation?.confidence, `${subjectId} ${predicate} ${objectId}`).toBe('high');
      expect(relation?.sourceIds.length, `${subjectId} ${predicate} ${objectId}`).toBeGreaterThan(0);
      expect(relation?.sourceIds.every((sourceId) => sourceIds.has(sourceId)), relation?.id).toBe(true);
      expect(relation?.uncertaintyNote?.trim(), relation?.id).toBeTruthy();
      expect(peopleIds.has(subjectId), subjectId).toBe(true);
      expect(peopleIds.has(objectId), objectId).toBe(true);
    }
  });

  it('keeps the new relationship edges resolvable and valid', () => {
    const peopleIds = new Set(people.map((person) => person.id));
    const newClaims = claims.filter((claim) => claim.id.endsWith('-fortieth'));

    expect(newClaims).toHaveLength(expectedRelations.length);
    expect(validateClaims(newClaims, peopleIds)).toEqual([]);
  });
});
