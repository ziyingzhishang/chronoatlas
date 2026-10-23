import { describe, expect, it } from 'vitest';
import { buildPolityStudyView } from '../domain/study-view';
import { capitalHistory } from './capital-history';
import { claims } from './claims';
import { eventDetails } from './event-details';
import { events } from './events';
import { heritageAssets } from './heritage';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { polityDetails } from './polity-details';

const data = {
  polities, places, people, heritage: heritageAssets, events, eventDetails, claims,
  capitalTerms: capitalHistory, polityDetails,
};

describe('Round 110 政权学习视图详情关联集成', () => {
  it('reclassifies 111 of 116 legacy gaps as learnable detail links', () => {
    const detailById = new Map(polityDetails.map((detail) => [detail.polityId, detail]));
    const closed: string[] = [];
    const retained: string[] = [];

    for (const polity of polities) {
      const detail = detailById.get(polity.id);
      if (!detail) continue;

      for (const personId of detail.principalFigureIds) {
        const view = buildPolityStudyView(polity.id, polity.startYear, data);
        if (!view?.people.some((person) => person.id === personId)) {
          if (view?.detailLinkedPeople.some((person) => person.id === personId)) closed.push(`${polity.id}:person:${personId}`);
        }
      }

      for (const eventId of detail.eventIds) {
        const event = events.find((candidate) => candidate.id === eventId);
        const year = event?.year ?? polity.startYear;
        const view = buildPolityStudyView(polity.id, year, data);
        if (!view?.events.some((candidate) => candidate.id === eventId)) {
          if (view?.detailLinkedEvents.some((candidate) => candidate.id === eventId)) closed.push(`${polity.id}:event:${eventId}`);
          else retained.push(`${polity.id}:event:${eventId}`);
        }
      }

      for (const heritageId of detail.heritageIds) {
        const asset = heritageAssets.find((candidate) => candidate.id === heritageId);
        const year = Math.max(polity.startYear, asset?.constructionFrom ?? polity.startYear);
        const view = buildPolityStudyView(polity.id, year, data);
        if (!view?.heritage.some((candidate) => candidate.id === heritageId)
          && view?.detailLinkedHeritage.some((candidate) => candidate.id === heritageId)) {
          closed.push(`${polity.id}:heritage:${heritageId}`);
        } else if (!view?.heritage.some((candidate) => candidate.id === heritageId)) {
          retained.push(`${polity.id}:heritage:${heritageId}`);
        }
      }
    }

    expect(closed).toHaveLength(110);
    expect(retained).toEqual([
      'wei_three:event:jin-unification',
      'shu_three:event:jin-unification',
      'jin_eastern:event:jin-unification',
      'zhou_northern:event:western-wei-founded',
      'zhou_northern:event:sui-founded',
      'wu_zhou:heritage:shangyang-palace-site',
    ]);
  });

  it('does not promote detail links into current facts or bypass explicit event polity boundaries', () => {
    const qingView = buildPolityStudyView('qing', 1636, data)!;
    const weiView = buildPolityStudyView('wei_three', 280, data)!;

    expect(qingView.people.some((person) => person.id === 'nurhaci')).toBe(false);
    expect(qingView.detailLinkedPeople.some((person) => person.id === 'nurhaci')).toBe(true);
    expect(weiView.events.some((event) => event.id === 'jin-unification')).toBe(false);
    expect(weiView.detailLinkedEvents.some((event) => event.id === 'jin-unification')).toBe(false);
    expect(weiView.claims.every((claim) => claim.validFrom === undefined || claim.validFrom <= 280)).toBe(true);
  });
});
