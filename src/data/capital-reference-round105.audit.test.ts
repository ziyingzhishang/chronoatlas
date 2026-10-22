import { describe, expect, it } from 'vitest';
import { capitalHistory } from './capital-history';
import { events } from './events';
import { getEventDetail } from './event-details';
import { heritageAssets } from './heritage';
import { getHeritageDetail } from './heritage-details';
import { getPolityDetail } from './polity-details';
import { polities } from './polities';
import { buildCityStudyView } from '../domain/study-view';
import { claims } from './claims';
import { people } from './people';
import { places } from './places';

const overlap = (from: number | undefined, to: number | undefined, year: number) => (
  from === undefined || from <= year
) && (to === undefined || year <= to);

describe('round 105 capital reference audit', () => {
  it('closes the high-evidence Zhangye Northern Liang heritage reference in both perspectives', () => {
    const detail = getPolityDetail('northern_liang');
    const study = buildCityStudyView('zhangye', Number.POSITIVE_INFINITY, {
      polities, places, people, heritage: heritageAssets, events, claims, capitalTerms: capitalHistory,
    });
    expect(detail?.heritageIds).toContain('zhangye-northern-liang-city-layer');
    expect(study?.heritage.map((asset) => asset.id)).toContain('zhangye-northern-liang-city-layer');
  });

  it('reports capital-stage nodes that have explicit polity evidence but are absent from polity detail', () => {
    const rows: Array<{ polityId: string; placeId: string; eventId?: string; heritageId?: string }> = [];
    for (const capital of capitalHistory) {
      const polity = polities.find((item) => item.id === capital.polityId);
      const detail = getPolityDetail(capital.polityId);
      if (!polity || !detail) continue;
      for (const event of events) {
        const eventDetail = getEventDetail(event.id);
        if (event.placeId !== capital.placeId || !overlap(capital.validFrom, capital.validTo, event.year)) continue;
        if (!eventDetail?.polityIds.includes(capital.polityId) || detail.eventIds.includes(event.id)) continue;
        rows.push({ polityId: capital.polityId, placeId: capital.placeId, eventId: event.id });
      }
      for (const asset of heritageAssets) {
        const heritageDetail = getHeritageDetail(asset.id);
        if (asset.placeId !== capital.placeId || !overlap(capital.validFrom, capital.validTo, asset.constructionFrom)) continue;
        if (!heritageDetail?.associatedPolities.includes(capital.polityId) || detail.heritageIds.includes(asset.id)) continue;
        rows.push({ polityId: capital.polityId, placeId: capital.placeId, heritageId: asset.id });
      }
    }
    console.table(rows);
    expect(rows.length).toBeGreaterThan(0);
    expect(rows).not.toContainEqual({
      polityId: 'northern_liang',
      placeId: 'zhangye',
      heritageId: 'zhangye-northern-liang-city-layer',
    });
  });
});
