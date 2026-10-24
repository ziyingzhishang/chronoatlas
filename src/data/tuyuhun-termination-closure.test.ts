import { describe, expect, it } from 'vitest';

import { claims } from './claims';
import { events } from './events';
import { eventDetails } from './event-details';
import { heritageAssets } from './heritage';
import { heritageDetails } from './heritage-details';
import { people } from './people';
import { personDetails } from './person-details';
import { places } from './places';
import { polityDetails } from './polity-details';
import { polities } from './polities';
import { sourceById } from './sources';

const terminationEventId = 'tuyuhun-ended-663';
const closureClaimIds = [
  'claim-tuyuhun-ended-663',
  'claim-murong-nuohebo-ruled-tuyuhun-closure',
  'claim-murong-nuohebo-participated-tuyuhun-ended-663',
  'claim-murong-nuohebo-enemy-lushangzan-termination-663',
  'claim-tibetan-empire-succeeded-tuyuhun-663',
  'claim-tuyuhun-left-heritage-fuqisi-663',
];

describe('Tuyuhun termination closure', () => {
  it('records 663 as the central polity termination with bounded successor phases', () => {
    const event = events.find((item) => item.id === terminationEventId);
    const detail = eventDetails.find((item) => item.eventId === terminationEventId);
    const polity = polities.find((item) => item.id === 'tuyuhun');
    const polityDetail = polityDetails.find((item) => item.polityId === 'tuyuhun');

    expect(event).toMatchObject({ id: terminationEventId, year: 663, placeId: 'tuyuhun_core', datePrecision: 'year' });
    expect(detail?.polityIds).toEqual(expect.arrayContaining(['tuyuhun', 'tibetan_empire', 'tang']));
    expect(detail?.participants.map((item) => item.personId)).toEqual(expect.arrayContaining(['murong-nuohebo', 'lushangzan', 'li-zhi']));
    expect(detail?.phases).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: '吐蕃攻灭吐谷浑中央政权', startYear: 663, endYear: 663 }),
      expect.objectContaining({ label: '慕容诺曷钵率部投唐安置', startYear: 663, endYear: 672 }),
    ]));
    expect(polity?.endYear).toBe(663);
    expect(polityDetail?.eventIds).toContain(terminationEventId);
  });

  it('covers late figures, person details, relations, heritage, modern place and sources', () => {
    const event = events.find((item) => item.id === terminationEventId)!;
    const detail = eventDetails.find((item) => item.eventId === terminationEventId)!;
    const heritage = heritageAssets.find((item) => item.id === 'tuyuhun-fuqisi-city-candidate')!;
    const heritageDetail = heritageDetails.find((item) => item.heritageId === heritage.id)!;
    const place = places.find((item) => item.id === 'tuyuhun_core')!;

    expect(people.find((item) => item.id === 'murong-nuohebo')).toMatchObject({
      name: '慕容诺曷钵', deathYear: 688, polityIds: ['tuyuhun'],
    });
    expect(people.find((item) => item.id === 'lushangzan')).toMatchObject({ name: '禄东赞', polityIds: ['tibetan_empire'] });
    expect(personDetails.find((item) => item.personId === 'murong-nuohebo')?.keyEvents).toContain(terminationEventId);
    expect(detail.locationIds).toContain('tuyuhun_core');
    expect(place).toMatchObject({ modernName: '青海省海南藏族自治州共和县石乃亥镇铁卜加村一带', modernAdministrativeUnit: '青海省海南藏族自治州共和县' });
    expect(heritage).toMatchObject({ constructionFrom: 540, constructionTo: 663, modernStatus: 'archaeological-site' });
    expect(heritageDetail.associatedEvents).toContain(terminationEventId);
    expect(heritageDetail.associatedPeople).toEqual(expect.arrayContaining(['murong-nuohebo', 'lushangzan']));
    expect(event.sourceIds).toEqual(expect.arrayContaining(['tuyuhun-termination-663', 'tuyuhun-fuqisi-official']));
  });

  it('keeps every closure reference sourced, bounded and free of isolated references', () => {
    const peopleById = new Set(people.map((item) => item.id));
    const entityIds = new Set([
      ...polities.map((item) => item.id), ...events.map((item) => item.id), ...peopleById,
      ...heritageAssets.map((item) => item.id), ...places.map((item) => item.id), ...Object.keys(sourceById),
    ]);
    const closureClaims = claims.filter((claim) => closureClaimIds.includes(claim.id));
    expect(closureClaims.map((claim) => claim.id)).toEqual(expect.arrayContaining(closureClaimIds));

    for (const claim of closureClaims) {
      expect(entityIds.has(claim.subjectId)).toBe(true);
      if (claim.objectId) expect(entityIds.has(claim.objectId)).toBe(true);
      expect(claim.sourceIds.length).toBeGreaterThan(0);
      for (const sourceId of claim.sourceIds) expect(sourceById[sourceId]).toBeDefined();
      if (claim.validFrom !== undefined && claim.validTo !== undefined) expect(claim.validFrom).toBeLessThanOrEqual(claim.validTo);
    }

    expect(closureClaims.find((claim) => claim.id === 'claim-tuyuhun-ended-663')).toMatchObject({ validFrom: 663, validTo: 663, datePrecision: 'year' });
    expect(closureClaims.find((claim) => claim.id === 'claim-tuyuhun-left-heritage-fuqisi-663')).toMatchObject({ validFrom: 540, validTo: 663, datePrecision: 'range' });
    expect(closureClaims.some((claim) => claim.objectId === 'western_liang')).toBe(false);
  });
});
