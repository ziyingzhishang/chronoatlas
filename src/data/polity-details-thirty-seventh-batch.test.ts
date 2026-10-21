import { describe, expect, it } from 'vitest';
import { auditKnowledgeCoverage } from './knowledge-coverage';
import { buildPolityDetailCoverageReport } from './polity-detail-coverage';
import { capitalHistory } from './capital-history';
import { claims } from './claims';
import { eventDetails } from './event-details';
import { events } from './events';
import { heritageAssets } from './heritage';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { polityDetails, getPolityDetail } from './polity-details';
import { sourceNotes } from './sources';

const ids = (items: readonly { id: string }[]) => new Set(items.map((item) => item.id));
const targetIds = [
  'liang_later', 'tang_later', 'jin_later', 'han_later', 'zhou_later',
  'wu_ten', 'southern_tang', 'wuyue', 'min', 'southern_han',
  'chu_ten', 'former_shu', 'later_shu', 'jingnan', 'northern_han',
] as const;

describe('thirty-seventh-batch polity detail integrity', () => {
  it('resolves every existing detail association and keeps capital phases aligned', () => {
    const polityIds = ids(polities);
    const personIds = ids(people);
    const eventIds = ids(events);
    const eventDetailIds = new Set(eventDetails.map((detail) => detail.eventId));
    const heritageIds = ids(heritageAssets);
    const placeIds = ids(places);
    const claimById = new Map(claims.map((claim) => [claim.id, claim]));
    const sourceIds = ids(sourceNotes);
    const capitalTerms = capitalHistory;

    expect(new Set(polityDetails.map((detail) => detail.polityId)).size).toBe(polityDetails.length);

    polityDetails.forEach((detail) => {
      expect(polityIds.has(detail.polityId), `${detail.polityId} -> polity`).toBe(true);
      expect(detail.perspectiveSummary.trim(), `${detail.polityId} summary`).toBeTruthy();
      expect(detail.foundationProcess.length, `${detail.polityId} foundation`).toBeGreaterThan(0);
      expect(detail.turningPoints.length, `${detail.polityId} turning points`).toBeGreaterThan(0);
      expect(detail.capitalPhases.length, `${detail.polityId} capital phases`).toBeGreaterThan(0);
      expect(detail.uncertaintyNote.trim(), `${detail.polityId} uncertainty`).toBeTruthy();
      detail.principalFigureIds.forEach((personId) => expect(personIds.has(personId), `${detail.polityId} -> person ${personId}`).toBe(true));
      detail.eventIds.forEach((eventId) => {
        expect(eventIds.has(eventId), `${detail.polityId} -> event ${eventId}`).toBe(true);
        expect(eventDetailIds.has(eventId), `${detail.polityId} -> event detail ${eventId}`).toBe(true);
      });
      detail.heritageIds.forEach((heritageId) => expect(heritageIds.has(heritageId), `${detail.polityId} -> heritage ${heritageId}`).toBe(true));
      detail.claimIds.forEach((claimId) => {
        const claim = claimById.get(claimId);
        expect(claim, `${detail.polityId} -> claim ${claimId}`).toBeDefined();
        claim?.sourceIds.forEach((sourceId) => expect(sourceIds.has(sourceId), `${claimId} -> source ${sourceId}`).toBe(true));
      });
      detail.sourceIds.forEach((sourceId) => expect(sourceIds.has(sourceId), `${detail.polityId} -> source ${sourceId}`).toBe(true));
      detail.capitalPhases.forEach((phase) => {
        expect(phase.validFrom <= phase.validTo, `${detail.polityId} -> ${phase.placeId} has ordered years`).toBe(true);
        expect(placeIds.has(phase.placeId), `${detail.polityId} -> place ${phase.placeId}`).toBe(true);
        const matchingTerms = capitalTerms.filter((term) => term.polityId === detail.polityId && term.placeId === phase.placeId && term.validFrom === phase.validFrom && term.validTo === phase.validTo);
        expect(matchingTerms.length, `${detail.polityId} -> capital ${phase.placeId}`).toBeGreaterThan(0);
        matchingTerms.forEach((term) => term.sourceIds.forEach((sourceId) => expect(sourceIds.has(sourceId), `${detail.polityId} capital ${phase.placeId} -> source ${sourceId}`).toBe(true)));
      });
    });
  });

  it('keeps coverage status, uncovered IDs, and knowledge coverage aligned', () => {
    const report = buildPolityDetailCoverageReport();
    const knowledge = auditKnowledgeCoverage();
    const detailByPolityId = new Map(polityDetails.map((detail) => [detail.polityId, detail]));
    const reportByPolityId = new Map(report.items.map((item) => [item.polityId, item]));
    expect(report.items).toHaveLength(polities.length);
    expect(report.knowledgeStatusMismatches).toEqual([]);
    expect(report.uncoveredPolityIds).toEqual(report.items.filter((item) => item.detailStatus === 'data-missing').map((item) => item.polityId));
    expect(report.uncoveredPolityIds).toEqual(polities.filter((polity) => reportByPolityId.get(polity.id)?.detailStatus === 'data-missing').map((polity) => polity.id).sort());
    polities.forEach((polity) => {
      const item = reportByPolityId.get(polity.id);
      const knowledgeEntity = knowledge.byKey[`polity:${polity.id}`];
      const knowledgeDetailCheck = knowledgeEntity?.checks.find((check) => check.dimension === 'detail');
      expect(item, `${polity.id} report item`).toBeDefined();
      expect(knowledgeDetailCheck, `${polity.id} knowledge detail check`).toBeDefined();
      expect(item?.detailPresent).toBe(detailByPolityId.has(polity.id));
      expect(item?.detailStatus).toBe(knowledgeDetailCheck?.status);
      expect(item?.knowledgeDetailStatus).toBe(knowledgeDetailCheck?.status);
    });
  });

  it('provides sourced, resolvable records for all fifteen Five Dynasties and Ten Kingdoms polities', () => {
    const personIds = ids(people);
    const eventIds = ids(events);
    const eventDetailIds = new Set(eventDetails.map((detail) => detail.eventId));
    const heritageIds = ids(heritageAssets);
    const placeIds = ids(places);
    const sourceIds = ids(sourceNotes);
    const claimIds = ids(claims);
    expect(new Set(targetIds).size).toBe(15);
    targetIds.forEach((polityId) => {
      const detail = getPolityDetail(polityId);
      expect(detail, polityId).toBeDefined();
      expect(detail!.principalFigureIds.length, `${polityId} figures`).toBeGreaterThan(0);
      expect(detail!.eventIds.length, `${polityId} events`).toBeGreaterThan(0);
      expect(detail!.sourceIds.length, `${polityId} sources`).toBeGreaterThan(0);
      expect(detail!.uncertaintyNote.trim(), `${polityId} uncertainty`).toBeTruthy();
      detail!.principalFigureIds.forEach((id) => expect(personIds.has(id), `${polityId} -> person ${id}`).toBe(true));
      detail!.eventIds.forEach((id) => {
        expect(eventIds.has(id), `${polityId} -> event ${id}`).toBe(true);
        expect(eventDetailIds.has(id), `${polityId} -> event detail ${id}`).toBe(true);
      });
      detail!.heritageIds.forEach((id) => expect(heritageIds.has(id), `${polityId} -> heritage ${id}`).toBe(true));
      detail!.capitalPhases.forEach((phase) => expect(placeIds.has(phase.placeId), `${polityId} -> place ${phase.placeId}`).toBe(true));
      detail!.sourceIds.forEach((id) => expect(sourceIds.has(id), `${polityId} -> source ${id}`).toBe(true));
      detail!.claimIds.forEach((id) => expect(claimIds.has(id), `${polityId} -> claim ${id}`).toBe(true));
    });
  });

  it('does not invent heritage coverage for four polities without a defensible dedicated asset', () => {
    expect(getPolityDetail('liang_later')!.heritageIds).toEqual([]);
    expect(getPolityDetail('jin_later')!.heritageIds).toEqual([]);
    expect(getPolityDetail('han_later')!.heritageIds).toEqual([]);
    expect(getPolityDetail('zhou_later')!.heritageIds).toEqual([]);
  });
});
