import { describe, expect, it } from 'vitest';
import { buildPolityStudyView } from '../domain/study-view';
import { claims } from './claims';
import { eventDetails } from './event-details';
import { events } from './events';
import { heritageAssets } from './heritage';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { capitalHistory } from './capital-history';
import { polityDetails } from './polity-details';

const studyEvents = events;

const data = {
  polities,
  places,
  people,
  heritage: heritageAssets,
  events: studyEvents,
  eventDetails,
  claims,
  capitalTerms: capitalHistory,
};

const ids = <T extends { id: string }>(items: readonly T[]) => new Set(items.map((item) => item.id));
const peopleById = ids(people);
const placesById = ids(places);
const eventsById = ids(events);
const eventDetailsById = ids(eventDetails.map((detail) => ({ id: detail.eventId })));
const heritageById = ids(heritageAssets);
const claimsById = ids(claims);
const detailById = new Map(polityDetails.map((detail) => [detail.polityId, detail]));

type LearningGap = {
  polityId: string;
  kind: 'person' | 'capital' | 'event' | 'heritage';
  id: string;
  year?: number;
};

function uniqueGaps(gaps: LearningGap[]): LearningGap[] {
  return [...new Map(gaps.map((gap) => [`${gap.polityId}:${gap.kind}:${gap.id}:${gap.year ?? ''}`, gap])).values()];
}

function buildAuditReport() {
  const unresolved = {
    people: [] as string[],
    capital: [] as string[],
    events: [] as string[],
    eventDetails: [] as string[],
    heritage: [] as string[],
    claims: [] as string[],
  };
  const directDrawerGaps: LearningGap[] = [];
  const learningGaps: LearningGap[] = [];

  for (const polity of polities) {
    const detail = detailById.get(polity.id);
    expect(detail, `${polity.id} must have a polity detail`).toBeDefined();
    if (!detail) continue;

    for (const personId of detail.principalFigureIds) {
      if (!peopleById.has(personId)) unresolved.people.push(`${polity.id}:${personId}`);
      if (!peopleById.has(personId)) directDrawerGaps.push({ polityId: polity.id, kind: 'person', id: personId });
      const view = buildPolityStudyView(polity.id, polity.startYear, data);
      if (!view?.people.some((person) => person.id === personId)) learningGaps.push({ polityId: polity.id, kind: 'person', id: personId, year: polity.startYear });
    }

    for (const phase of detail.capitalPhases) {
      const capitalRecord = capitalHistory.some((term) => (
        term.polityId === polity.id
        && term.placeId === phase.placeId
        && term.validFrom === phase.validFrom
        && term.validTo === phase.validTo
      ));
      if (!placesById.has(phase.placeId) || !capitalRecord) unresolved.capital.push(`${polity.id}:${phase.placeId}:${phase.validFrom}:${phase.validTo}`);
      if (!placesById.has(phase.placeId)) directDrawerGaps.push({ polityId: polity.id, kind: 'capital', id: phase.placeId });
      const view = buildPolityStudyView(polity.id, phase.validFrom, data);
      if (!view?.capitalPlaces.some((place) => place.id === phase.placeId)) learningGaps.push({ polityId: polity.id, kind: 'capital', id: phase.placeId, year: phase.validFrom });
    }

    for (const eventId of detail.eventIds) {
      if (!eventsById.has(eventId)) unresolved.events.push(`${polity.id}:${eventId}`);
      if (!eventDetailsById.has(eventId)) unresolved.eventDetails.push(`${polity.id}:${eventId}`);
      if (!eventsById.has(eventId)) directDrawerGaps.push({ polityId: polity.id, kind: 'event', id: eventId });
      const event = events.find((candidate) => candidate.id === eventId);
      const year = event?.year ?? polity.startYear;
      const view = buildPolityStudyView(polity.id, year, data);
      if (!view?.events.some((candidate) => candidate.id === eventId)) learningGaps.push({ polityId: polity.id, kind: 'event', id: eventId, year });
    }

    for (const heritageId of detail.heritageIds) {
      if (!heritageById.has(heritageId)) unresolved.heritage.push(`${polity.id}:${heritageId}`);
      if (!heritageById.has(heritageId)) directDrawerGaps.push({ polityId: polity.id, kind: 'heritage', id: heritageId });
      const asset = heritageAssets.find((candidate) => candidate.id === heritageId);
      const year = Math.max(polity.startYear, asset?.constructionFrom ?? polity.startYear);
      const view = buildPolityStudyView(polity.id, year, data);
      if (!view?.heritage.some((candidate) => candidate.id === heritageId)) learningGaps.push({ polityId: polity.id, kind: 'heritage', id: heritageId, year });
    }

    for (const claimId of detail.claimIds) {
      if (!claimsById.has(claimId)) unresolved.claims.push(`${polity.id}:${claimId}`);
    }
  }

  return {
    totalPolities: polities.length,
    detailCount: detailById.size,
    unresolved,
    directDrawerGaps: uniqueGaps(directDrawerGaps),
    learningGaps: uniqueGaps(learningGaps),
  };
}

describe('Round 109 政权详情学习入口审计', () => {
  it('covers all 87 polity details and resolves every five-field reference', () => {
    const report = buildAuditReport();

    expect(report.totalPolities).toBe(87);
    expect(report.detailCount).toBe(87);
    expect(report.unresolved).toEqual({ people: [], capital: [], events: [], eventDetails: [], heritage: [], claims: [] });
    expect(report.directDrawerGaps).toEqual([]);
  });

  it('keeps every detail-linked person, capital, foundation event and heritage learnable', () => {
    const report = buildAuditReport();
    const gapsByKind = report.learningGaps.reduce<Record<string, LearningGap[]>>((grouped, gap) => {
      (grouped[gap.kind] ??= []).push(gap);
      return grouped;
    }, {});

    expect(gapsByKind.capital ?? []).toEqual([]);
    expect(gapsByKind.event).toEqual([
      { polityId: 'wei_three', kind: 'event', id: 'jin-unification', year: 280 },
      { polityId: 'shu_three', kind: 'event', id: 'jin-unification', year: 280 },
      { polityId: 'jin_eastern', kind: 'event', id: 'jin-unification', year: 280 },
      { polityId: 'zhou_northern', kind: 'event', id: 'western-wei-founded', year: 535 },
      { polityId: 'zhou_northern', kind: 'event', id: 'sui-founded', year: 581 },
    ]);
    expect(gapsByKind.person).toEqual([
      { polityId: 'goguryeo', kind: 'person', id: 'dae-joyeong', year: -37 },
      { polityId: 'goguryeo', kind: 'person', id: 'xue-rengui', year: -37 },
      { polityId: 'turkic', kind: 'person', id: 'bayanchur', year: 552 },
      { polityId: 'qing', kind: 'person', id: 'nurhaci', year: 1636 },
    ]);
    expect(gapsByKind.heritage).toHaveLength(127);
  });
});
