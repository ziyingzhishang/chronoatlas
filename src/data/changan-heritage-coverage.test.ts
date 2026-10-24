import { describe, expect, it } from 'vitest';
import { events } from './events';
import { heritageAssets } from './heritage';
import { getHeritageDetail, heritageDetails } from './heritage-details';
import { people } from './people';
import { polities } from './polities';
import { places } from './places';
import { sourceById } from './sources';

const changanStageTargets = [
  { heritageId: 'han-changan-city-site', polityId: 'han_western', eventId: 'han-imperial-accession', personId: 'liu-bang', from: -202, to: 23 },
  { heritageId: 'former-qin-changan-city-layer', polityId: 'former_qin', eventId: 'former-qin-founded', personId: 'fu-jian-founder', from: 351, to: 394 },
  { heritageId: 'northern-zhou-changan-city-layer', polityId: 'zhou_northern', eventId: 'northern-zhou-ended-581', personId: 'yuwen-chan', from: 557, to: 581 },
  { heritageId: 'tang-changan-city-site', polityId: 'sui', eventId: 'sui-unification', personId: 'yang-jian', from: 582, to: 907 },
  { heritageId: 'tang-changan-city-site', polityId: 'tang', eventId: 'tang-founded', personId: 'li-yuan', from: 582, to: 907 },
] as const;

describe('Chang’an heritage asset coverage', () => {
  it('contains at least 20 complete heritage assets with matching details', () => {
    const changanAssets = heritageAssets.filter((asset) => asset.placeId === 'changan');

    expect(changanAssets.length).toBeGreaterThanOrEqual(20);
    expect(changanAssets.every((asset) => {
      const detail = getHeritageDetail(asset.id);

      return Boolean(
        asset.placeId
        && asset.type
        && asset.constructionFrom !== undefined
        && asset.modernStatus
        && asset.description
        && asset.sourceIds.length > 0
        && detail
        && detail.constructionHistory.length > 0
        && detail.historicalAssociations.length > 0
        && detail.survivingFeatures.length > 0
        && detail.presentDayValue
        && detail.uncertaintyNote
        && detail.sourceIds.length > 0,
      );
    })).toBe(true);
  });

  it('audits the high-confidence Chang’an stage nodes for learning-drawer traceability', () => {
    const assetById = new Map(heritageAssets.map((asset) => [asset.id, asset]));
    const detailById = new Map(heritageDetails.map((detail) => [detail.heritageId, detail]));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const eventIds = new Set(events.map((event) => event.id));
    const personIds = new Set(people.map((person) => person.id));
    const sourceIds = new Set(Object.keys(sourceById));
    const placeIds = new Set(places.map((place) => place.id));

    for (const target of changanStageTargets) {
      const asset = assetById.get(target.heritageId);
      const detail = detailById.get(target.heritageId);

      expect(asset, target.heritageId).toMatchObject({ placeId: 'changan' });
      expect(asset?.constructionFrom, target.heritageId).toBe(target.from);
      expect(asset?.constructionTo, target.heritageId).toBe(target.to);
      expect(asset?.sourceIds.every((sourceId) => sourceIds.has(sourceId)), target.heritageId).toBe(true);
      expect(placeIds.has(asset?.placeId ?? ''), target.heritageId).toBe(true);
      expect(detail, target.heritageId).toBeDefined();
      expect(detail?.modernLocation, target.heritageId).toContain('西安');
      expect(detail?.associatedPolities, target.heritageId).toContain(target.polityId);
      expect(detail?.associatedEvents, target.heritageId).toContain(target.eventId);
      expect(detail?.associatedPeople, target.heritageId).toContain(target.personId);
      expect(polityIds.has(target.polityId), target.heritageId).toBe(true);
      expect(eventIds.has(target.eventId), target.heritageId).toBe(true);
      expect(personIds.has(target.personId), target.heritageId).toBe(true);
      expect(detail?.constructionHistory.some((phase) => phase.type === 'original'), target.heritageId).toBe(true);
      expect(detail?.constructionHistory.some((phase) => phase.type === 'site'), target.heritageId).toBe(true);
      expect(detail?.historicalAssociations.length, target.heritageId).toBeGreaterThanOrEqual(2);
      expect(detail?.survivingFeatures.length, target.heritageId).toBeGreaterThanOrEqual(2);
      expect(detail?.presentDayValue, target.heritageId).toBeTruthy();
      expect(detail?.uncertaintyNote, target.heritageId).toBeTruthy();
      expect(detail?.sourceIds.every((sourceId) => sourceIds.has(sourceId)), target.heritageId).toBe(true);
      expect(detail?.constructionHistory.every((phase) => phase.sourceIds.every((sourceId) => sourceIds.has(sourceId))), target.heritageId).toBe(true);
    }
  });
});
