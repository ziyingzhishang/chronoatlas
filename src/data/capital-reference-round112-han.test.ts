import { describe, expect, it } from 'vitest';
import { capitalHistory } from './capital-history';
import { getEventDetail } from './event-details';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { getPolityDetail } from './polity-details';

const heritageCandidates = [
  'changle-palace-site',
  'maoling',
  'du-ling',
  'white-horse-temple',
] as const;

const overlaps = (from: number | undefined, to: number | undefined, year: number | undefined) => (
  year !== undefined && (from === undefined || from <= year) && (to === undefined || year <= to)
);

function hasIndependentConstructionEndpoint(heritageId: typeof heritageCandidates[number]) {
  const asset = heritageAssets.find((item) => item.id === heritageId);
  const detail = getHeritageDetail(heritageId);
  if (!asset || !detail) return false;

  return detail.associatedEvents.some((eventId) => {
    const event = getEventDetail(eventId);
    return Boolean(
      event
      && detail.associatedPolities.some((polityId) => event.polityIds.includes(polityId))
      && event.locationIds.includes(asset.placeId)
      && event.phases?.some((phase) => (
        overlaps(phase.startYear, phase.endYear, asset.constructionFrom)
        || overlaps(phase.startYear, phase.endYear, asset.constructionTo)
      )),
    );
  });
}

describe('round 112 Qin-Han capital boundary', () => {
  it('keeps the Qin-Chu-Han transition event out of the Qin capital chain', () => {
    const event = getEventDetail('chu-han-contention');
    const qin = getPolityDetail('qin');
    const capital = capitalHistory.find((term) => (
      term.polityId === 'qin' && term.placeId === 'xianyang'
    ));

    expect(event).toMatchObject({
      eventId: 'chu-han-contention',
      polityIds: expect.arrayContaining(['qin', 'han_western']),
      locationIds: expect.arrayContaining(['xianyang']),
    });
    expect(capital).toBeDefined();
    expect(overlaps(capital?.validFrom, capital?.validTo, event?.phases?.[0]?.startYear)).toBe(true);
    expect(qin?.eventIds).not.toContain('chu-han-contention');
  });

  it('keeps the four Han heritage candidates outside a single-polity closure', () => {
    expect(heritageCandidates.filter(hasIndependentConstructionEndpoint)).toEqual([]);

    expect(getHeritageDetail('changle-palace-site')?.associatedPolities).toEqual(['han_western', 'xin']);
    expect(getHeritageDetail('white-horse-temple')?.associatedPolities).toEqual(['han_eastern', 'tang']);
    expect(getPolityDetail('han_western')?.heritageIds).not.toEqual(
      expect.arrayContaining(['changle-palace-site', 'maoling', 'du-ling']),
    );
    expect(getPolityDetail('han_eastern')?.heritageIds).not.toContain('white-horse-temple');
  });

  it('does not promote nearby or background events into palace or tomb construction endpoints', () => {
    const changle = getHeritageDetail('changle-palace-site')!;
    const maoling = getHeritageDetail('maoling')!;
    const duLing = getHeritageDetail('du-ling')!;
    const whiteHorse = getHeritageDetail('white-horse-temple')!;

    expect(changle.associatedEvents).not.toContain('han-changan-new-city');
    expect(getEventDetail('han-changan-new-city')).toMatchObject({
      eventId: 'han-changan-new-city',
      polityIds: ['han_western'],
      locationIds: expect.arrayContaining(['changan']),
    });
    expect(getEventDetail('han-changan-new-city')?.phases).toEqual([
      expect.objectContaining({ startYear: -200, endYear: -200 }),
    ]);

    for (const detail of [maoling, duLing]) {
      expect(detail.associatedEvents).toEqual(['han-imperial-accession']);
      expect(getEventDetail('han-imperial-accession')?.locationIds).not.toContain('changan');
    }

    expect(whiteHorse.associatedEvents).not.toContain('eastern-han-moves-luoyang');
  });
});
