import { describe, expect, it } from 'vitest';

import { auditKnowledgeCoverage } from './knowledge-coverage';
import { people } from './people';
import { personDetails } from './person-details';
import { sourceNotes } from './sources';

const candidates = [
  {
    personId: 'meng-tian',
    sourceId: 'shiji-meng-tian',
    deathYear: -210,
    windows: [{ from: -215, to: -210, datePrecision: 'approximate' as const }],
  },
  {
    personId: 'zhang-qian',
    sourceId: 'shiji-zhang-qian-dawan',
    deathYear: -114,
    windows: [
      { from: -138, to: -126, datePrecision: 'approximate' as const },
      { from: -119, to: -115, datePrecision: 'approximate' as const },
    ],
  },
  {
    personId: 'modu-chanyu',
    sourceId: 'shiji-xiongnu-modu',
    deathYear: -174,
    windows: [{ from: -209, to: -174, datePrecision: 'approximate' as const }],
  },
] as const;

describe('round 133 person time evidence', () => {
  it('keeps selected people time-uncertain while exposing sourced activity windows', () => {
    const coverage = auditKnowledgeCoverage();
    const peopleById = new Map(people.map((person) => [person.id, person]));
    const detailsById = new Map(personDetails.map((detail) => [detail.personId, detail]));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));

    candidates.forEach(({ personId, sourceId, windows }) => {
      const person = peopleById.get(personId);
      const detail = detailsById.get(personId);
      const timeCheck = coverage.byKey[`person:${personId}`]?.checks.find((check) => check.dimension === 'time');

      expect(person, personId).toBeDefined();
      expect(detail, personId).toBeDefined();
      expect(timeCheck, personId).toMatchObject({ status: 'uncertain' });
      expect(person?.sourceIds, personId).toContain(sourceId);
      expect(sourceIds, sourceId).toContain(sourceId);
      expect(person?.birthYear, personId).toBeUndefined();
      expect(person?.deathYear, personId).toBe(candidates.find((candidate) => candidate.personId === personId)?.deathYear);

      windows.forEach((window) => {
        expect(detail?.offices, `${personId}:${window.from}`).toEqual(expect.arrayContaining([
          expect.objectContaining({
            validFrom: window.from,
            validTo: window.to,
            datePrecision: window.datePrecision,
            sourceIds: expect.arrayContaining([sourceId]),
          }),
        ]));
      });
    });
  });

  it('does not promote activity windows to complete life dates', () => {
    const selectedIds = new Set<string>(candidates.map(({ personId }) => personId));
    const selected = people.filter((person) => selectedIds.has(person.id));

    expect(selected).toHaveLength(candidates.length);
    expect(selected.every((person) => !(person.birthYear !== undefined && person.deathYear !== undefined))).toBe(true);
  });
});
