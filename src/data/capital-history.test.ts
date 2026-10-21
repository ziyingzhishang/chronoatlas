import { describe, expect, it } from 'vitest';
import { polities } from './polities';
import { places } from './places';
import { capitalHistory, activeCapitalRecords } from './capital-history';

describe('capital history', () => {
  it('covers every polity with at least one capital or political-center record', () => {
    const covered = new Set(capitalHistory.map(record => record.polityId));
    expect(polities.filter(polity => !covered.has(polity.id)).map(polity => polity.id)).toEqual([]);
    expect(capitalHistory.filter(record => record.notes?.includes('占位'))).toEqual([]);
  });

  it('uses resolvable places and valid date ranges', () => {
    const placeIds = new Set(places.map(place => place.id));
    for (const record of capitalHistory) {
      expect(placeIds.has(record.placeId), record.placeId).toBe(true);
      expect(record.validFrom).toBeLessThanOrEqual(record.validTo);
      const polity = polities.find(item => item.id === record.polityId);
      expect(polity).toBeDefined();
      expect(record.validFrom).toBeGreaterThanOrEqual(polity!.startYear);
      expect(record.validTo).toBeLessThanOrEqual(polity!.endYear);
      expect(record.sourceIds.length).toBeGreaterThan(0);
    }
  });

  it('resolves migrations and multi-capital systems by year', () => {
    expect(activeCapitalRecords(493, 'wei_northern').map(record => record.placeId)).toEqual(['pingcheng']);
    expect(activeCapitalRecords(495, 'wei_northern').map(record => record.placeId)).toEqual(['luoyang']);
    expect(activeCapitalRecords(1300, 'yuan').map(record => record.placeId).sort()).toEqual(['dadu', 'shangdu']);
  });
});
