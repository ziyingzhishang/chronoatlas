import { describe, expect, it } from 'vitest';
import { groupPersonRelationships } from '../domain/relationships';
import { claims } from './claims';
import { people } from './people';
import { getPersonDetail } from './person-details';

const targetPeople = [
  { id: 'yang-jian', polityId: 'sui', predicate: 'founded' },
  { id: 'yuan-hong', polityId: 'wei_northern', predicate: 'ruled' },
  { id: 'tuoba-tao', polityId: 'wei_northern', predicate: 'ruled' },
  { id: 'xiao-daocheng', polityId: 'qi_southern', predicate: 'founded' },
  { id: 'chen-baxian', polityId: 'chen_southern', predicate: 'founded' },
  { id: 'shi-jingtang', polityId: 'jin_later', predicate: 'founded' },
  { id: 'liu-zhiyuan', polityId: 'han_later', predicate: 'founded' },
  { id: 'guo-wei', polityId: 'zhou_later', predicate: 'founded' },
  { id: 'yelu-abaoji', polityId: 'khitan', predicate: 'founded' },
  { id: 'wang-jian', polityId: 'former_shu', predicate: 'founded' },
  { id: 'meng-zhixiang', polityId: 'later_shu', predicate: 'founded' },
] as const;

describe('third-batch historical people relationships', () => {
  it('contains sourced detail records for every selected person', () => {
    for (const target of targetPeople) {
      const person = people.find((item) => item.id === target.id);
      const detail = getPersonDetail(target.id);
      expect(person, target.id).toBeDefined();
      expect(person?.sourceIds.length, target.id).toBeGreaterThan(0);
      expect(detail?.biography, target.id).toBeTruthy();
      expect(detail?.offices.length, target.id).toBeGreaterThan(0);
      expect(detail?.sourceIds.length, target.id).toBeGreaterThan(0);
      expect(detail?.uncertaintyNote, target.id).toBeTruthy();
    }
  });

  it('exposes a sourced polity relationship for every selected person', () => {
    for (const target of targetPeople) {
      const relationship = claims.find((claim) => claim.subjectId === target.id
        && claim.objectId === target.polityId
        && claim.predicate === target.predicate);
      expect(relationship, `${target.id} -> ${target.polityId}`).toBeDefined();
      expect(relationship?.sourceIds.length).toBeGreaterThan(0);
      expect(relationship?.uncertaintyNote).toBeTruthy();
    }
  });

  it('makes the family and court relationships available to the runtime graph', () => {
    const yuanHongRelations = groupPersonRelationships('yuan-hong', 480, claims);
    const liuZhiyuanRelations = groupPersonRelationships('liu-zhiyuan', 940, claims);
    const guoWeiRelations = groupPersonRelationships('guo-wei', 948, claims);

    expect(yuanHongRelations['related-to'].map((relation) => relation.claim.objectId)).toContain('tuoba-tao');
    expect(liuZhiyuanRelations.served.map((relation) => relation.claim.objectId)).toContain('shi-jingtang');
    expect(guoWeiRelations.served.map((relation) => relation.claim.objectId)).toContain('liu-zhiyuan');
  });
});
