import { describe, expect, it } from 'vitest';
import { groupPersonRelationships } from '../domain/relationships';
import { claims } from './claims';
import { getPersonDetail } from './person-details';
import { people } from './people';

const selectedPeople = [
  { id: 'gao-huan', polityId: 'wei_eastern', eventId: 'eastern-wei-founded', polityPredicate: 'ruled' },
  { id: 'gao-yang', polityId: 'qi_northern', eventId: 'northern-qi-founded', polityPredicate: 'founded' },
  { id: 'zhao-gou', polityId: 'song_south', eventId: 'southern-song-founded', polityPredicate: 'founded' },
  { id: 'yue-fei', polityId: 'song_south', eventId: 'song-southward', polityPredicate: undefined },
  { id: 'qin-hui', polityId: 'song_south', eventId: 'song-southward', polityPredicate: undefined },
  { id: 'liu-yu', polityId: 'song_southern', eventId: 'eastern-jin', polityPredicate: 'founded' },
  { id: 'murong-chui', polityId: 'later_yan', eventId: 'later-yan-founded', polityPredicate: 'founded' },
  { id: 'shi-hu', polityId: 'later_zhao', eventId: 'later-zhao-founded', polityPredicate: 'ruled' },
  { id: 'li-xiong', polityId: 'cheng_han', eventId: 'cheng-han-founded', polityPredicate: 'founded' },
  { id: 'xiao-yan', polityId: 'liang_southern', eventId: 'southern-liang-founded', polityPredicate: 'founded' },
  { id: 'tuoba-gui', polityId: 'wei_northern', eventId: 'northern-wei-founded', polityPredicate: 'founded' },
  { id: 'han-shizhong', polityId: 'song_south', eventId: 'song-southward', polityPredicate: undefined },
] as const;

describe('fourth-batch historical people relationships', () => {
  it('adds each selected person exactly once with a sourced detail record and event link', () => {
    const ids = people.map((person) => person.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const target of selectedPeople) {
      const person = people.find((item) => item.id === target.id);
      const detail = getPersonDetail(target.id);
      expect(person, target.id).toBeDefined();
      expect(person?.polityIds).toContain(target.polityId);
      expect(person?.sourceIds.length, target.id).toBeGreaterThan(0);
      expect(detail?.biography, target.id).toBeTruthy();
      expect(detail?.offices.length, target.id).toBeGreaterThan(0);
      expect(detail?.keyEvents, target.id).toContain(target.eventId);
      expect(detail?.sourceIds.length, target.id).toBeGreaterThan(0);
      expect(detail?.uncertaintyNote, target.id).toBeTruthy();
    }
  });

  it('exposes sourced polity and event relationships for every selected person', () => {
    for (const target of selectedPeople) {
      const polityRelationship = target.polityPredicate === undefined ? undefined : claims.find((claim) => claim.subjectId === target.id
        && claim.objectId === target.polityId
        && claim.predicate === target.polityPredicate);
      const eventRelationship = claims.find((claim) => claim.subjectId === target.id
        && claim.objectId === target.eventId
        && claim.predicate === 'participated-in');

      if (target.polityPredicate !== undefined) {
        expect(polityRelationship, `${target.id} -> ${target.polityId}`).toBeDefined();
      }
      expect(eventRelationship, `${target.id} -> ${target.eventId}`).toBeDefined();
      for (const relationship of [polityRelationship, eventRelationship].filter(Boolean)) {
        expect(relationship?.sourceIds.length).toBeGreaterThan(0);
        expect(relationship?.uncertaintyNote).toBeTruthy();
      }
    }
  });

  it('makes family, court, opposition, and alliance relations available to the graph runtime', () => {
    const gaoHuanRelations = groupPersonRelationships('gao-huan', 540, claims);
    const zhaoGouRelations = groupPersonRelationships('zhao-gou', 1140, claims);
    const yueFeiRelations = groupPersonRelationships('yue-fei', 1140, claims);
    const murongChuiRelations = groupPersonRelationships('murong-chui', 383, claims);

    expect(gaoHuanRelations['parent-of'].map((relation) => relation.claim.objectId)).toContain('gao-yang');
    expect(zhaoGouRelations.appointed.map((relation) => relation.claim.objectId)).toContain('yue-fei');
    expect(yueFeiRelations['enemy-of'].map((relation) => relation.claim.objectId)).toContain('qin-hui');
    expect(yueFeiRelations['ally-of'].map((relation) => relation.claim.objectId)).toContain('han-shizhong');
    expect(murongChuiRelations.served.map((relation) => relation.claim.objectId)).toContain('fu-jian');
    expect(groupPersonRelationships('murong-chui', 384, claims)['enemy-of'].map((relation) => relation.claim.objectId)).toContain('fu-jian');
  });
});
