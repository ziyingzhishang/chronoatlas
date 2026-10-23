import { describe, expect, it } from 'vitest';
import { claims } from './claims';
import { people } from './people';
import { personDetails } from './person-details';
import { auditKnowledgeCoverage } from './knowledge-coverage';

describe('Southern Liang Tufa relationship boundary', () => {
  it('models the two documented brothers and Wugu’s appointments without inventing alliances', () => {
    expect(people.map((person) => person.id)).toEqual(expect.arrayContaining(['tufa-lilugu', 'tufa-rutan']));
    expect(personDetails.map((detail) => detail.personId)).toEqual(expect.arrayContaining(['tufa-lilugu', 'tufa-rutan']));

    expect(claims).toEqual(expect.arrayContaining([
      expect.objectContaining({ subjectId: 'tufa-wugu', predicate: 'sibling-of', objectId: 'tufa-lilugu' }),
      expect.objectContaining({ subjectId: 'tufa-wugu', predicate: 'sibling-of', objectId: 'tufa-rutan' }),
      expect.objectContaining({ subjectId: 'tufa-lilugu', predicate: 'sibling-of', objectId: 'tufa-rutan' }),
      expect.objectContaining({ subjectId: 'tufa-wugu', predicate: 'appointed', objectId: 'tufa-lilugu', validFrom: 397, validTo: 399 }),
      expect.objectContaining({ subjectId: 'tufa-wugu', predicate: 'appointed', objectId: 'tufa-rutan', validFrom: 397, validTo: 399 }),
    ]));
    expect(claims.some((claim) => claim.subjectId === 'tufa-wugu' && claim.predicate === 'ally-of')).toBe(false);
    expect(auditKnowledgeCoverage().tasks).not.toEqual(expect.arrayContaining([
      expect.objectContaining({ taskKind: 'person-person-relationship-missing', entityId: 'tufa-wugu' }),
    ]));
  });
});
