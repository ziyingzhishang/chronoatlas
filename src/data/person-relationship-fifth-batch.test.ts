import { describe, expect, it } from 'vitest';
import { claims } from './claims';
import { eventDetails } from './event-details';
import { personDetails } from './person-details';
import { people } from './people';
import { polities } from './polities';

const selectedPeople = [
  { id: 'sima-rui', polityId: 'jin_eastern', eventId: 'eastern-jin', predicate: 'ruled' },
  { id: 'yuwen-yong', polityId: 'zhou_northern', eventId: undefined, predicate: 'ruled' },
  { id: 'li-yu', polityId: 'southern_tang', eventId: 'southern-tang-founded', predicate: 'ruled' },
  { id: 'yang-xingmi', polityId: 'wu_ten', eventId: 'yang-wu-founded', predicate: 'founded' },
  { id: 'qian-liu', polityId: 'wuyue', eventId: 'wuyue-founded', predicate: 'founded' },
  { id: 'wang-shenzhi', polityId: 'min', eventId: 'min-founded', predicate: 'ruled' },
  { id: 'liu-yin', polityId: 'southern_han', eventId: 'southern-han-founded', predicate: 'ruled' },
  { id: 'ma-yin', polityId: 'chu_ten', eventId: 'ma-chu-founded', predicate: 'ruled' },
  { id: 'sima-yan', polityId: 'jin_western', eventId: 'western-jin-founded', predicate: 'founded' },
  { id: 'zhao-kuangyin', polityId: 'song_northern', eventId: 'northern-song-founded', predicate: 'founded' },
  { id: 'wanyan-aguda', polityId: 'jin_jurchen', eventId: 'jurchen-jin-founded', predicate: 'founded' },
  { id: 'li-yuanhao', polityId: 'western_xia', eventId: 'western-xia-founded', predicate: 'founded' },
] as const;

describe('fifth-batch historical people relationships', () => {
  it('adds each audited person once with a sourced detail, polity, and event link when one exists', () => {
    const ids = people.map((person) => person.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const target of selectedPeople) {
      const person = people.find((item) => item.id === target.id);
      const detail = personDetails.find((item) => item.personId === target.id);
      expect(person, target.id).toBeDefined();
      expect(person?.polityIds).toContain(target.polityId);
      expect(polities.some((polity) => polity.id === target.polityId), target.polityId).toBe(true);
      expect(person?.sourceIds.length, target.id).toBeGreaterThan(0);
      expect(detail?.biography, target.id).toBeTruthy();
      expect(detail?.offices.length, target.id).toBeGreaterThan(0);
      expect(detail?.sourceIds.length, target.id).toBeGreaterThan(0);
      expect(detail?.uncertaintyNote, target.id).toBeTruthy();

      if (target.eventId) {
        expect(detail?.keyEvents, target.id).toContain(target.eventId);
        expect(eventDetails.some((event) => event.eventId === target.eventId), target.eventId).toBe(true);
        expect(claims.some((claim) => claim.subjectId === target.id
          && claim.objectId === target.eventId
          && claim.predicate === 'participated-in'), `${target.id} -> ${target.eventId}`).toBe(true);
      }
    }
  });

  it('adds sourced polity claims for every audited person', () => {
    for (const target of selectedPeople) {
      const relationship = claims.find((claim) => claim.subjectId === target.id
        && claim.objectId === target.polityId
        && claim.predicate === target.predicate);
      expect(relationship, `${target.id} -> ${target.polityId}`).toBeDefined();
      expect(relationship?.sourceIds.length).toBeGreaterThan(0);
      expect(relationship?.uncertaintyNote).toBeTruthy();
    }
  });

  it('exposes family, court, and rivalry relations for the graph runtime', () => {
    const expectedRelations = [
      ['yu-wen-tai', 'parent-of', 'yuwen-yong'],
      ['yuwen-yong', 'child-of', 'yu-wen-tai'],
      ['sima-yan', 'related-to', 'sima-rui'],
      ['sima-rui', 'related-to', 'sima-yan'],
      ['zhao-kuangyin', 'served', 'guo-wei'],
      ['yang-xingmi', 'enemy-of', 'qian-liu'],
      ['qian-liu', 'enemy-of', 'yang-xingmi'],
      ['ma-yin', 'served', 'zhu-wen'],
    ] as const;

    for (const [subjectId, predicate, objectId] of expectedRelations) {
      const relation = claims.find((claim) => claim.subjectId === subjectId
        && claim.predicate === predicate
        && claim.objectId === objectId);
      expect(relation, `${subjectId} ${predicate} ${objectId}`).toBeDefined();
      expect(relation?.sourceIds.length).toBeGreaterThan(0);
      expect(relation?.uncertaintyNote).toBeTruthy();
    }
  });
});
