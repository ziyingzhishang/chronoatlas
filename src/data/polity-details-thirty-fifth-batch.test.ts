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
  'former_zhao', 'later_zhao', 'former_yan', 'later_yan', 'later_qin', 'xia', 'northern_liang',
  'song_southern', 'qi_southern', 'liang_southern', 'chen_southern', 'wei_eastern', 'wei_western',
  'qi_northern', 'zhou_northern',
] as const;

describe('thirty-fifth-batch polity details', () => {
  it('provides complete sourced references for the second polity-detail batch', () => {
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
      expect(detail!.principalFigureIds.length, `${polityId} figures`).toBeGreaterThan(0);
      expect(detail!.capitalPhases.length, `${polityId} capitals`).toBeGreaterThan(0);
      expect(detail!.heritageIds.length, `${polityId} heritage`).toBeGreaterThan(0);
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
