import { describe, expect, it } from 'vitest';
import { people } from './people';
import { personDetails } from './person-details';
import { eventDetails } from './event-details';
import { sourceNotes } from './sources';

describe('round 127 expert time intervals', () => {
  it('keeps life dates separate from evidence-backed activity intervals', () => {
    const detailByPerson = new Map(personDetails.map((detail) => [detail.personId, detail]));
    const expected = [
      ['qin-mugong', -659, -621, 'range'],
      ['modu-chanyu', -209, -174, 'approximate'],
      ['zhang-qian', -138, -126, 'approximate'],
      ['meng-tian', -215, -210, 'approximate'],
      ['wu-ding', -1250, -1192, 'approximate'],
    ] as const;

    for (const [personId, from, to, precision] of expected) {
      const office = detailByPerson.get(personId)?.offices.find((item) => item.validFrom === from && item.validTo === to);
      expect(office, personId).toMatchObject({ validFrom: from, validTo: to, datePrecision: precision });
      expect(office?.sourceIds.length).toBeGreaterThan(0);
      for (const sourceId of office?.sourceIds ?? []) {
        expect(sourceNotes.find((source) => source.id === sourceId), `${personId} -> ${sourceId}`).toBeTruthy();
      }
    }

    for (const personId of ['qin-mugong', 'modu-chanyu', 'zhang-qian', 'meng-tian', 'wu-ding']) {
      expect(people.find((person) => person.id === personId)?.birthYear).toBeUndefined();
    }
    expect(people.find((person) => person.id === 'qin-mugong')?.deathYear).toBe(-621);
    expect(people.find((person) => person.id === 'modu-chanyu')?.deathYear).toBe(-174);
    expect(people.find((person) => person.id === 'zhang-qian')?.deathYear).toBe(-114);
    expect(people.find((person) => person.id === 'meng-tian')?.deathYear).toBe(-210);
    expect(people.find((person) => person.id === 'wu-ding')?.deathYear).toBeUndefined();
  });

  it('records reliable death endpoints without inventing births', () => {
    expect(people.find((person) => person.id === 'liu-yao')).toMatchObject({ deathYear: 329 });
    expect(people.find((person) => person.id === 'huhanye')).toMatchObject({ deathYear: -31 });
    expect(people.find((person) => person.id === 'liu-yao')?.birthYear).toBeUndefined();
    expect(people.find((person) => person.id === 'huhanye')?.birthYear).toBeUndefined();
  });

  it('splits the Pyongyang capital phase at the 586 move to Chang’an Fortress', () => {
    const detail = eventDetails.find((item) => item.eventId === 'goguryeo-moves-pyongyang');
    expect(detail?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '平壤都城阶段', startYear: 427, endYear: 585 }),
      expect.objectContaining({ label: '长安城阶段', startYear: 586, endYear: 668 }),
    ]));
  });
});
