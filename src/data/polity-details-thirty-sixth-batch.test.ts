import { describe, expect, it } from 'vitest';
import { capitalHistory } from './capital-history';
import { claims } from './claims';
import { eventDetails } from './event-details';
import { events } from './events';
import { heritageAssets } from './heritage';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceNotes } from './sources';
import { getPolityDetail } from './polity-details';

const targetIds = [
  'cheng_han', 'western_qin', 'later_liang', 'southern_liang', 'western_liang', 'northern_yan',
  'tuyuhun', 'turkic', 'tibetan_empire', 'nanzhao', 'khitan', 'western_xia', 'jin_jurchen',
  'western_liao', 'dali',
] as const;

const intentionalHeritageBoundary = new Set(['southern_liang']);

describe('thirty-sixth-batch polity details', () => {
  it('provides complete, resolvable and evidence-bearing detail records', () => {
    const polityIds = new Set(polities.map((item) => item.id));
    const personIds = new Set(people.map((item) => item.id));
    const eventIds = new Set(events.map((item) => item.id));
    const detailEventIds = new Set(eventDetails.map((item) => item.eventId));
    const heritageIds = new Set(heritageAssets.map((item) => item.id));
    const placeIds = new Set(places.map((item) => item.id));
    const claimIds = new Set(claims.map((item) => item.id));
    const sourceIds = new Set(sourceNotes.map((item) => item.id));

    targetIds.forEach((polityId) => {
      const detail = getPolityDetail(polityId);
      expect(detail, polityId).toBeDefined();
      expect(polityIds.has(polityId), `${polityId} polity`).toBe(true);
      expect(detail!.perspectiveSummary.trim(), `${polityId} summary`).toBeTruthy();
      expect(detail!.foundationProcess.length, `${polityId} foundation`).toBeGreaterThanOrEqual(2);
      expect(detail!.turningPoints.length, `${polityId} turning points`).toBeGreaterThanOrEqual(2);
      expect(detail!.principalFigureIds.length, `${polityId} figures`).toBeGreaterThanOrEqual(0);
      expect(detail!.capitalPhases.length, `${polityId} capitals`).toBeGreaterThan(0);
      if (intentionalHeritageBoundary.has(polityId)) {
        expect(detail!.heritageIds, `${polityId} heritage boundary`).toEqual([]);
      } else {
        expect(detail!.heritageIds.length, `${polityId} heritage`).toBeGreaterThan(0);
      }
      expect(detail!.eventIds.length, `${polityId} events`).toBeGreaterThan(0);
      expect(detail!.sourceIds.length, `${polityId} sources`).toBeGreaterThan(0);
      expect(detail!.uncertaintyNote.trim(), `${polityId} uncertainty`).toBeTruthy();
      detail!.principalFigureIds.forEach((id) => expect(personIds.has(id), `${polityId} -> person ${id}`).toBe(true));
      detail!.eventIds.forEach((id) => {
        expect(eventIds.has(id), `${polityId} -> event ${id}`).toBe(true);
        expect(detailEventIds.has(id), `${polityId} -> event detail ${id}`).toBe(true);
      });
      detail!.heritageIds.forEach((id) => expect(heritageIds.has(id), `${polityId} -> heritage ${id}`).toBe(true));
      detail!.capitalPhases.forEach((phase) => {
        expect(placeIds.has(phase.placeId), `${polityId} -> place ${phase.placeId}`).toBe(true);
        expect(capitalHistory.some((term) => term.polityId === polityId && term.placeId === phase.placeId && term.validFrom === phase.validFrom && term.validTo === phase.validTo), `${polityId} -> capital ${phase.placeId}`).toBe(true);
      });
      detail!.claimIds.forEach((id) => expect(claimIds.has(id), `${polityId} -> claim ${id}`).toBe(true));
      detail!.sourceIds.forEach((id) => expect(sourceIds.has(id), `${polityId} -> source ${id}`).toBe(true));
    });
  });
});
