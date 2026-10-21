import { describe, expect, it } from 'vitest';
import { claims } from './claims';
import { eventDetails } from './event-details';
import { events } from './events';
import { heritageAssets } from './heritage';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { sourceNotes } from './sources';
import { capitalHistory } from './capital-history';
import { getPolityDetail, polityDetails } from './polity-details';
import { auditKnowledgeCoverage } from './knowledge-coverage';

const targetIds = [
  'qin', 'han_western', 'han_eastern', 'wei_three', 'shu_three', 'wu_three',
  'jin_western', 'jin_eastern', 'wei_northern', 'sui', 'tang', 'yuan', 'ming', 'qing',
] as const;

describe('thirty-fourth-batch polity details', () => {
  it('provides a sourced polity-perspective record for every core polity', () => {
    const polityIds = new Set(polities.map((polity) => polity.id));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));
    const peopleIds = new Set(people.map((person) => person.id));
    const eventIds = new Set(events.map((event) => event.id));
    const heritageIds = new Set(heritageAssets.map((heritage) => heritage.id));
    const placeIds = new Set(places.map((place) => place.id));
    const claimIds = new Set(claims.map((claim) => claim.id));
    const detailEventIds = new Set(eventDetails.map((detail) => detail.eventId));

    expect(polityDetails.length).toBeGreaterThanOrEqual(targetIds.length);
    targetIds.forEach((polityId) => {
      const detail = getPolityDetail(polityId);
      expect(detail, polityId).toBeDefined();
      expect(polityIds.has(detail!.polityId), `${polityId} polity`).toBe(true);
      expect(detail!.perspectiveSummary.trim(), `${polityId} summary`).toBeTruthy();
      expect(detail!.foundationProcess.length, `${polityId} foundation`).toBeGreaterThan(0);
      expect(detail!.turningPoints.length, `${polityId} turning points`).toBeGreaterThan(0);
      expect(detail!.principalFigureIds.length, `${polityId} figures`).toBeGreaterThan(0);
      expect(detail!.capitalPhases.length, `${polityId} capitals`).toBeGreaterThan(0);
      expect(detail!.eventIds.length, `${polityId} events`).toBeGreaterThan(0);
      expect(detail!.sourceIds.length, `${polityId} sources`).toBeGreaterThan(0);
      expect(detail!.uncertaintyNote.trim(), `${polityId} uncertainty`).toBeTruthy();
      detail!.principalFigureIds.forEach((id) => expect(peopleIds.has(id), `${polityId} -> person ${id}`).toBe(true));
      detail!.eventIds.forEach((id) => expect(eventIds.has(id), `${polityId} -> event ${id}`).toBe(true));
      detail!.eventIds.forEach((id) => expect(detailEventIds.has(id), `${polityId} -> event detail ${id}`).toBe(true));
      detail!.heritageIds.forEach((id) => expect(heritageIds.has(id), `${polityId} -> heritage ${id}`).toBe(true));
      detail!.capitalPhases.forEach((phase) => expect(placeIds.has(phase.placeId), `${polityId} -> place ${phase.placeId}`).toBe(true));
      detail!.sourceIds.forEach((id) => expect(sourceIds.has(id), `${polityId} -> source ${id}`).toBe(true));
      detail!.claimIds.forEach((id) => expect(claimIds.has(id), `${polityId} -> claim ${id}`).toBe(true));
    });
  });

  it('marks detailed core polities as covered in the knowledge audit', () => {
    const report = auditKnowledgeCoverage();
    targetIds.forEach((polityId) => {
      const detailCheck = report.byKey[`polity:${polityId}`].checks.find((check) => check.dimension === 'detail');
      expect(detailCheck, polityId).toMatchObject({ status: 'covered' });
    });
  });

  it('keeps the capital phases aligned with existing capital records', () => {
    const capitalKeys = new Set(capitalHistory.map((term) => `${term.polityId}:${term.placeId}:${term.validFrom}:${term.validTo}`));
    polityDetails.forEach((detail) => detail.capitalPhases.forEach((phase) => {
      expect(capitalKeys.has(`${detail.polityId}:${phase.placeId}:${phase.validFrom}:${phase.validTo}`), `${detail.polityId} ${phase.placeId}`).toBe(true);
    }));
  });
});
