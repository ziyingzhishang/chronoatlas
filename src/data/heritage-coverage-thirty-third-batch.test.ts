import { describe, expect, it } from 'vitest';
import { auditKnowledgeCoverage } from './knowledge-coverage';
import { events } from './events';
import { heritageAssets } from './heritage';
import { getHeritageDetail } from './heritage-details';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceById } from './sources';

const targets = [
  { polityId: 'qin', heritageId: 'qin-xianyang-imperial-palace-site', placeId: 'xianyang', eventIds: ['qin-unification'], personIds: ['qin-shi-huang'] },
  { polityId: 'former_qin', heritageId: 'former-qin-changan-city-layer', placeId: 'changan', eventIds: ['former-qin-founded'], personIds: ['fu-jian-founder'] },
  { polityId: 'later_qin', heritageId: 'later-qin-changan-city-layer', placeId: 'changan', eventIds: ['later-qin-founded'], personIds: ['yao-chang'] },
  { polityId: 'gengshi', heritageId: 'gengshi-wanyang-city-layer', placeId: 'wan_nanyang', eventIds: ['gengshi-founded'], personIds: ['liu-xuan'] },
] as const;

describe('heritage coverage thirty-third batch', () => {
  it('closes the four audited polity-to-heritage gaps', () => {
    const report = auditKnowledgeCoverage();
    for (const target of targets) {
      expect(report.byPolity[target.polityId]?.entityKeys, target.polityId).toContain(`heritage:${target.heritageId}`);
    }
  });

  it('provides modern locations, surviving remains, historical links, present value and uncertainty', () => {
    const placeIds = new Set(places.map((place) => place.id));
    const polityIds = new Set(polities.map((polity) => polity.id));
    const eventIds = new Set(events.map((event) => event.id));
    const personIds = new Set(people.map((person) => person.id));

    for (const target of targets) {
      const asset = heritageAssets.find((item) => item.id === target.heritageId);
      const detail = getHeritageDetail(target.heritageId);
      expect(asset, target.heritageId).toBeDefined();
      expect(asset?.placeId, target.heritageId).toBe(target.placeId);
      expect(placeIds.has(target.placeId), target.heritageId).toBe(true);
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
});
