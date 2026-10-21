import { describe, expect, it } from 'vitest';
import { heritageAssets } from './heritage';
import { getHeritageDetail, heritageDetails } from './heritage-details';
import { sourceById } from './sources';

describe('Chang’an heritage detail archive', () => {
  it('covers the heritage catalog and the larger Chang’an detail set', () => {
    expect(heritageDetails.length).toBeGreaterThanOrEqual(20);

    for (const asset of heritageAssets) {
      expect(getHeritageDetail(asset.id)).toBeDefined();
    }
  });

  it('keeps construction phases distinct for representative sites', () => {
    const palace = getHeritageDetail('daming-palace-site');
    const citySite = getHeritageDetail('han-changan-city-site');
    const pagoda = getHeritageDetail('big-wild-goose-pagoda');

    expect(palace?.constructionHistory.map((phase) => phase.type)).toEqual(
      expect.arrayContaining(['original', 'site', 'reconstruction', 'restoration']),
    );
    expect(citySite?.constructionHistory.some((phase) => phase.type === 'site')).toBe(true);
    expect(pagoda?.constructionHistory.some((phase) => phase.type === 'original')).toBe(true);
    expect(pagoda?.constructionHistory.some((phase) => phase.type === 'reconstruction')).toBe(true);
    expect(pagoda?.constructionHistory.some((phase) => phase.type === 'restoration')).toBe(true);
  });

  it('keeps relationships, present-day location, sources, and uncertainty auditable', () => {
    for (const detail of heritageDetails) {
      expect(detail.modernLocation).toBeTruthy();
      expect(detail.associatedPeople.length).toBeGreaterThan(0);
      expect(detail.associatedPolities.length).toBeGreaterThan(0);
      expect(detail.associatedEvents.length).toBeGreaterThan(0);
      expect(detail.survivingFeatures.length).toBeGreaterThan(0);
      expect(detail.sourceIds.length).toBeGreaterThan(0);
      expect(detail.sourceIds.every((sourceId) => sourceById[sourceId])).toBe(true);
      expect(detail.uncertaintyNote).toBeTruthy();
    }
  });
});
