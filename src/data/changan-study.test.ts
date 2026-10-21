import { describe, expect, it } from 'vitest';
import { getChanganStudyBundle } from './changan-study';
import { validateClaims } from '../domain/claims';

describe('Chang’an city study bundle', () => {
  it('connects multiple historical regimes to one modern city view', () => {
    const bundle = getChanganStudyBundle();

    expect(bundle.city.modernName).toBe('西安市');
    expect(bundle.polities.length).toBeGreaterThanOrEqual(5);
    expect(bundle.events.length).toBeGreaterThanOrEqual(10);
    expect(bundle.people.length).toBeGreaterThanOrEqual(8);
    expect(bundle.heritage.length).toBeGreaterThanOrEqual(10);
    expect(bundle.claims.length).toBeGreaterThanOrEqual(15);
  });

  it('keeps the pilot graph free of dangling or unsupported claims', () => {
    const bundle = getChanganStudyBundle();
    const entityIds = new Set([
      bundle.city.id,
      ...bundle.polities.map((polity) => polity.id),
      ...bundle.people.map((person) => person.id),
      ...bundle.heritage.map((asset) => asset.id),
    ]);

    expect(validateClaims(bundle.claims, entityIds)).toEqual([]);
  });
});
