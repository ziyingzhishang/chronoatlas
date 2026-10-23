import { describe, expect, it } from 'vitest';
import { capitalHistory } from './capital-history';
import { eventDetails } from './event-details';
import { events } from './events';
import { getHeritageDetail } from './heritage-details';
import { heritageAssets } from './heritage';
import { personDetails } from './person-details';
import { places } from './places';
import { polityDetails } from './polity-details';
import { claims } from './claims';
import { sourceById } from './sources';

const sourceIds = [
  'liaoshi-vol30-yelu-dashi',
  'iranica-qara-ketay',
  'iranica-balasagun',
  'unesco-chui-balasagun',
];

describe('western Liao foundation closure', () => {
  it('keeps the 1124 formation anchor approximate and separates 1132 enthronement from the Balasagun center', () => {
    const event = events.find((candidate) => candidate.id === 'western-liao-founded');
    const detail = eventDetails.find((candidate) => candidate.eventId === 'western-liao-founded');

    expect(event).toMatchObject({ year: 1124, datePrecision: 'approximate' });
    expect(event?.sourceIds).toEqual(expect.arrayContaining(sourceIds));
    expect(event?.references?.some((reference) => reference.url.includes('/遼史/卷30'))).toBe(true);
    expect(detail?.sourceIds).toEqual(expect.arrayContaining(sourceIds));
    expect(detail?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '西行建政形成', startYear: 1124 }),
      expect.objectContaining({ label: '称帝与叶密立阶段', startYear: 1132, endYear: 1132 }),
      expect.objectContaining({ label: '巴拉沙衮政治中心', startYear: 1132 }),
      expect.objectContaining({ label: '巴拉沙衮政治中心稳定化', startYear: 1134 }),
    ]));
    expect(detail?.uncertaintyNote).toContain('1124');
    expect(detail?.uncertaintyNote).toContain('1132');
    expect(detail?.uncertaintyNote).toContain('1134');
  });

  it('connects the modern Balasagun location, capital slice, and surviving heritage detail', () => {
    const place = places.find((candidate) => candidate.id === 'balasagun');
    const capital = capitalHistory.filter((record) => record.polityId === 'western_liao');
    const asset = heritageAssets.find((candidate) => candidate.id === 'western-liao-balasagun-site');
    const heritageDetail = getHeritageDetail('western-liao-balasagun-site');
    const polityDetail = polityDetails.find((candidate) => candidate.polityId === 'western_liao');

    expect(place).toMatchObject({
      historicalName: '八剌沙衮',
      modernName: '布拉纳遗址附近',
      modernAdministrativeUnit: expect.stringContaining('吉尔吉斯斯坦楚河州托克马克附近'),
      mappingStatus: 'approximate',
    });
    expect(place?.sourceIds).toEqual(expect.arrayContaining(['iranica-balasagun', 'unesco-chui-balasagun']));
    expect(capital).toEqual([
      expect.objectContaining({
        placeId: 'balasagun',
        validFrom: 1134,
        validTo: 1218,
        role: 'de_facto',
        status: 'actual',
      }),
    ]);
    expect(asset).toMatchObject({ placeId: 'balasagun', constructionFrom: 1134 });
    expect(asset?.sourceIds).toEqual(expect.arrayContaining(['iranica-balasagun', 'unesco-chui-balasagun']));
    expect(heritageDetail?.sourceIds).toEqual(expect.arrayContaining(sourceIds));
    expect(heritageDetail?.modernLocation).toContain('托克马克');
    expect(polityDetail?.capitalPhases).toEqual(expect.arrayContaining([
      expect.objectContaining({ placeId: 'balasagun', validFrom: 1134, validTo: 1218 }),
    ]));
  });

  it('uses the same source chain for founder participation, governance, and person detail', () => {
    const founderParticipation = claims.find((claim) => claim.id === 'claim-yelu-dashi-participated-western-liao');
    const founderGovernance = claims.find((claim) => claim.id === 'claim-yelu-dashi-ruled-western-liao-sixtyfirst');
    const founderDetail = personDetails.find((detail) => detail.personId === 'yelu-dashi');
    const successorDetail = personDetails.find((detail) => detail.personId === 'yelu-yilie');

    expect(founderParticipation?.sourceIds).toEqual(expect.arrayContaining(sourceIds.slice(0, 2)));
    expect(founderParticipation?.datePrecision).toBe('approximate');
    expect(founderGovernance?.sourceIds).toEqual(expect.arrayContaining(sourceIds.slice(0, 2)));
    expect(founderDetail?.sourceIds).toEqual(expect.arrayContaining(sourceIds.slice(0, 2)));
    expect(founderDetail?.offices[0].placeId).toBe('balasagun');
    expect(successorDetail?.sourceIds).toEqual(expect.arrayContaining(sourceIds.slice(0, 2)));
    sourceIds.forEach((sourceId) => expect(sourceById[sourceId], sourceId).toBeDefined());
  });
});
