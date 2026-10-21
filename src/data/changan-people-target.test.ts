import { describe, expect, it } from 'vitest';
import { people } from './people';
import { personDetails } from './person-details';

describe('Chang’an pilot people target', () => {
  it('contains at least 30 people and a detail record for every person', () => {
    expect(people.length).toBeGreaterThanOrEqual(30);
    expect(new Set(personDetails.map((detail) => detail.personId)).size).toBe(personDetails.length);
    expect(people.every((person) => personDetails.some((detail) => detail.personId === person.id))).toBe(true);
  });
});
