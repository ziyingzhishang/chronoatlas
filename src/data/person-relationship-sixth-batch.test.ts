import { describe, expect, it } from 'vitest';
import { claims } from './claims';
import { personDetails } from './person-details';
import { people } from './people';
import { polities } from './polities';

const targets = [
  { id: 'yu-the-great', polityId: 'xia_early', predicate: 'founded' },
  { id: 'wu-ding', polityId: 'shang', predicate: 'ruled' },
  { id: 'ji-chang', polityId: 'zhou_western', predicate: 'ruled' },
  { id: 'ji-yijiu', polityId: 'zhou_eastern', predicate: 'ruled' },
  { id: 'qin-mugong', polityId: 'qin_state', predicate: 'ruled' },
  { id: 'zhao-wuling', polityId: 'zhao_warring', predicate: 'ruled' },
  { id: 'modu-chanyu', polityId: 'xiongnu', predicate: 'founded' },
  { id: 'esen-taishi', polityId: 'northern_yuan', predicate: 'ruled' },
  { id: 'tuotuobuhua', polityId: 'northern_yuan', predicate: 'ruled' },
  { id: 'zhu-yousong', polityId: 'ming_southern', predicate: 'ruled' },
  { id: 'shi-kefa', polityId: 'ming_southern', predicate: 'served' },
] as const;

function relation(subjectId: string, predicate: string, objectId: string) {
  return claims.find((claim) => claim.subjectId === subjectId
    && claim.predicate === predicate
    && claim.objectId === objectId);
}

describe('sixth-batch historical people relationships', () => {
  it('adds each audited person once with a sourced summary, detail, and polity link', () => {
    const ids = people.map((person) => person.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const target of targets) {
      const person = people.find((item) => item.id === target.id);
      const detail = personDetails.find((item) => item.personId === target.id);

      expect(person, target.id).toBeDefined();
      expect(person?.polityIds, target.id).toContain(target.polityId);
      expect(polities.some((polity) => polity.id === target.polityId), target.polityId).toBe(true);
      expect(person?.description, target.id).toBeTruthy();
      expect(person?.sourceIds.length, target.id).toBeGreaterThan(0);
      expect(detail?.biography, target.id).toBeTruthy();
      expect(detail?.offices.length, target.id).toBeGreaterThan(0);
      expect(detail?.sourceIds.length, target.id).toBeGreaterThan(0);
      expect(detail?.uncertaintyNote, target.id).toBeTruthy();

      const polityClaim = relation(target.id, target.predicate, target.polityId);
      expect(polityClaim, `${target.id} -> ${target.polityId}`).toBeDefined();
      expect(polityClaim?.sourceIds.length, target.id).toBeGreaterThan(0);
      expect(polityClaim?.uncertaintyNote, target.id).toBeTruthy();
    }
  });

  it('keeps family, court, alliance, opposition, and uncertainty as explicit claims', () => {
    const expectedRelations = [
      ['ji-chang', 'parent-of', 'zhou-wu'],
      ['zhou-wu', 'child-of', 'ji-chang'],
      ['shi-kefa', 'served', 'zhu-yousong'],
      ['esen-taishi', 'appointed', 'tuotuobuhua'],
      ['tuotuobuhua', 'ally-of', 'esen-taishi'],
      ['modu-chanyu', 'enemy-of', 'liu-bang'],
    ] as const;

    for (const [subjectId, predicate, objectId] of expectedRelations) {
      const claim = relation(subjectId, predicate, objectId);
      expect(claim, `${subjectId} ${predicate} ${objectId}`).toBeDefined();
      expect(claim?.sourceIds.length, subjectId).toBeGreaterThan(0);
      expect(claim?.uncertaintyNote, subjectId).toBeTruthy();
    }
  });
});
