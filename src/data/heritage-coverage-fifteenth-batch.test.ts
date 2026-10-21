import { describe, expect, it } from 'vitest';
import { auditKnowledgeCoverage } from './knowledge-coverage';
import { events } from './events';
import { heritageAssets } from './heritage';
import { heritageDetails } from './heritage-details';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceById } from './sources';

const targets = [
  { polityId: 'mongol', heritageId: 'mongol-karakorum-city-site', placeId: 'mongol_karakorum', eventIds: ['mongol-founded'], personIds: ['temujin'] },
  { polityId: 'later_jin', heritageId: 'later-jin-hetu-ala-city-site', placeId: 'heturnala', eventIds: ['later-jin-founded'], personIds: ['nurhaci'] },
  { polityId: 'qing', heritageId: 'qing-shengjing-palace-city-site', placeId: 'shengjing', eventIds: ['qing-founded', 'qing-enters-pass'], personIds: ['hongtaiji', 'shunzhi'] },
  { polityId: 'republic', heritageId: 'republic-nanjing-presidential-palace-site', placeId: 'yingtian', eventIds: ['republic-founded'], personIds: ['sun-yat-sen'] },
  { polityId: 'prc', heritageId: 'prc-tiananmen-ceremony-site', placeId: 'beijing', eventIds: ['prc-founded'], personIds: ['mao-zedong'] },
] as const;

describe('heritage coverage fifteenth batch', () => {
  it('closes the five remaining polity-to-heritage gaps', () => {
    const report = auditKnowledgeCoverage();
    for (const target of targets) {
      expect(report.byPolity[target.polityId]?.entityKeys, target.polityId).toContain(`heritage:${target.heritageId}`);
    }
  });

  it('provides complete, source-backed, place-aware and relationship-aware details', () => {
    const assetIds = new Set(heritageAssets.map((asset) => asset.id));
    const placeIds = new Set(places.map((place) => place.id));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const eventIds = new Set(events.map((event) => event.id));
    const personIds = new Set(people.map((person) => person.id));

    for (const target of targets) {
      const asset = heritageAssets.find((item) => item.id === target.heritageId);
      const detail = heritageDetails.find((item) => item.heritageId === target.heritageId);
      expect(assetIds.has(target.heritageId), target.heritageId).toBe(true);
      expect(asset?.placeId, target.heritageId).toBe(target.placeId);
      expect(placeIds.has(target.placeId), target.heritageId).toBe(true);
      expect(Number.isFinite(asset?.constructionFrom), target.heritageId).toBe(true);
      expect(asset?.description, target.heritageId).toBeTruthy();
      expect(asset?.sourceIds.length, target.heritageId).toBeGreaterThan(0);
      expect(asset?.sourceIds.every((sourceId) => sourceById[sourceId]), target.heritageId).toBe(true);
      expect(detail, target.heritageId).toBeDefined();
      expect(detail?.modernLocation, target.heritageId).toBeTruthy();
      expect(detail?.historicalAssociations.length, target.heritageId).toBeGreaterThanOrEqual(2);
      expect(detail?.constructionHistory.some((phase) => phase.type === 'original'), target.heritageId).toBe(true);
      expect(detail?.constructionHistory.some((phase) => ['site', 'reconstruction', 'restoration'].includes(phase.type)), target.heritageId).toBe(true);
      expect(detail?.associatedPolities, target.heritageId).toEqual(expect.arrayContaining([target.polityId]));
      expect(detail?.associatedPolities.every((id) => polityIds.has(id)), target.heritageId).toBe(true);
      expect(detail?.associatedEvents, target.heritageId).toEqual(expect.arrayContaining([...target.eventIds]));
      expect(detail?.associatedEvents.every((id) => eventIds.has(id)), target.heritageId).toBe(true);
      expect(detail?.associatedPeople, target.heritageId).toEqual(expect.arrayContaining([...target.personIds]));
      expect(detail?.associatedPeople.every((id) => personIds.has(id)), target.heritageId).toBe(true);
      expect(detail?.survivingFeatures.length, target.heritageId).toBeGreaterThan(0);
      expect(detail?.presentDayValue, target.heritageId).toBeTruthy();
      expect(detail?.sourceIds.length, target.heritageId).toBeGreaterThan(0);
      expect(detail?.sourceIds.every((sourceId) => sourceById[sourceId]), target.heritageId).toBe(true);
      expect(detail?.uncertaintyNote, target.heritageId).toBeTruthy();
    }
  });

  it('leaves no unlinked polity after this batch', () => {
    const report = auditKnowledgeCoverage();
    const remaining = Object.values(report.byPolity).filter((polity) => !polity.entityKeys.some((key) => key.startsWith('heritage:')));
    expect(remaining).toEqual([]);
  });
});
