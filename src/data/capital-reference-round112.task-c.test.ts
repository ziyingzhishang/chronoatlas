import { describe, expect, it } from 'vitest';
import { capitalHistory } from './capital-history';
import { getEventDetail } from './event-details';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { getPolityDetail } from './polity-details';
import { sourceById } from './sources';

const overlaps = (from: number | undefined, to: number | undefined, year: number | undefined) => (
  year !== undefined && (from === undefined || from <= year) && (to === undefined || year <= to)
);

describe('round 112 capital reference task C', () => {
  it('keeps the Later Liang transition on its existing polity-specific endpoint', () => {
    const shared = getEventDetail('five-dynasties');
    const dedicated = getEventDetail('later-liang-five-dynasties-founded');
    const polity = getPolityDetail('liang_later');
    const capital = capitalHistory.find((term) => (
      term.polityId === 'liang_later' && term.placeId === 'kaifeng'
    ));

    expect(shared?.polityIds).toEqual(['tang', 'liang_later']);
    expect(shared?.eventId).toBe('five-dynasties');
    expect(dedicated).toMatchObject({
      eventId: 'later-liang-five-dynasties-founded',
      polityIds: ['liang_later'],
      locationIds: ['kaifeng'],
    });
    expect(polity?.eventIds).toContain('later-liang-five-dynasties-founded');
    expect(polity?.eventIds).not.toContain('five-dynasties');
    expect(capital).toMatchObject({ validFrom: 907, validTo: 923 });
  });

  it('classifies the remaining five candidates without forced closure', () => {
    const easternZhouMigration = getEventDetail('zhou-eastward');
    expect(easternZhouMigration?.polityIds).toEqual(['zhou_western', 'zhou_eastern']);
    expect(easternZhouMigration?.eventId).toBe('zhou-eastward');
    expect(getPolityDetail('zhou_eastern')?.eventIds).not.toContain('zhou-eastward');

    const genericSong = getEventDetail('song-founded');
    const northernSong = getEventDetail('northern-song-founded');
    expect(genericSong).toMatchObject({
      eventId: 'song-founded',
      polityIds: ['song_northern'],
      locationIds: ['kaifeng'],
    });
    expect(northernSong).toMatchObject({
      eventId: 'northern-song-founded',
      polityIds: ['song_northern'],
      locationIds: ['kaifeng'],
    });
    expect(genericSong?.phases?.some((phase) => phase.startYear === 960 && phase.endYear === 960)).toBe(true);
    expect(northernSong?.phases?.some((phase) => phase.startYear === 960 && phase.endYear === 960)).toBe(true);
    expect(getPolityDetail('song_northern')?.eventIds).toContain('northern-song-founded');
    expect(getPolityDetail('song_northern')?.eventIds).not.toContain('song-founded');

    const guzang = getHeritageDetail('guzang-baita-temple-site');
    const guzangAsset = heritageAssets.find((item) => item.id === 'guzang-baita-temple-site');
    const laterLiangCapital = capitalHistory.find((term) => (
      term.polityId === 'later_liang' && term.placeId === 'guzang'
    ));
    expect(guzang?.associatedPolities).toEqual(['former_liang', 'northern_liang', 'later_liang']);
    expect(guzang?.sourceIds.every((sourceId) => sourceById[sourceId])).toBe(true);
    expect(guzangAsset?.sourceIds.every((sourceId) => sourceById[sourceId])).toBe(true);
    expect(overlaps(laterLiangCapital?.validFrom, laterLiangCapital?.validTo, guzangAsset?.constructionFrom)).toBe(true);
    expect(getPolityDetail('later_liang')?.heritageIds).not.toContain('guzang-baita-temple-site');

    const kaifeng = getHeritageDetail('kaifeng-northern-song-city-site');
    const kaifengAsset = heritageAssets.find((item) => item.id === 'kaifeng-northern-song-city-site');
    const laterZhouCapital = capitalHistory.find((term) => (
      term.polityId === 'zhou_later' && term.placeId === 'kaifeng'
    ));
    expect(kaifeng?.associatedPolities).toEqual(['liang_later', 'jin_later', 'han_later', 'zhou_later', 'song_northern']);
    expect(kaifeng?.sourceIds.every((sourceId) => sourceById[sourceId])).toBe(true);
    expect(kaifengAsset).toMatchObject({ constructionFrom: 960, constructionTo: 1127 });
    expect(laterZhouCapital?.validTo).toBe(kaifengAsset?.constructionFrom);
    expect(getPolityDetail('zhou_later')?.heritageIds).not.toContain('kaifeng-northern-song-city-site');
  });
});
