import { describe, expect, it } from 'vitest';

import { buildCityStudyView } from '../domain/study-view';
import { capitalHistory } from './capital-history';
import { eventDetails } from './event-details';
import { events } from './events';
import { heritageAssets } from './heritage';
import { getHeritageDetail } from './heritage-details';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { claims } from './claims';

const data = { polities, places, people, heritage: heritageAssets, events, claims, capitalTerms: capitalHistory };

describe('更始宛阳城市视角闭环', () => {
  it('uses the existing formation event and heritage layer for both historical place IDs', () => {
    const event = events.find((item) => item.id === 'gengshi-founded');
    const detail = eventDetails.find((item) => item.eventId === event?.id);
    const heritage = heritageAssets.find((item) => item.id === 'gengshi-wanyang-city-layer');

    expect(event).toMatchObject({ placeId: 'wan_nanyang', year: 23 });
    expect(detail?.locationIds).toEqual(expect.arrayContaining(['wan_nanyang', 'wanyang', 'luoyang', 'changan']));
    expect(detail?.participants).toEqual(expect.arrayContaining([
      expect.objectContaining({ personId: 'liu-xuan' }),
      expect.objectContaining({ personId: 'liu-xiu' }),
    ]));
    expect(heritage).toMatchObject({ placeId: 'wan_nanyang', constructionFrom: 23, constructionTo: 23 });
    expect(getHeritageDetail('gengshi-wanyang-city-layer')?.associatedEvents).toContain('gengshi-founded');
  });

  it('exposes the same non-duplicated chain from Wanyang and Wan Nanyang', () => {
    for (const cityId of ['wanyang', 'wan_nanyang']) {
      const study = buildCityStudyView(cityId, 23, data);
      expect(study?.events.map((item) => item.id)).toContain('gengshi-founded');
      expect(study?.heritage.map((item) => item.id)).toContain('gengshi-wanyang-city-layer');
    }
    expect(events.filter((item) => item.id === 'gengshi-founded')).toHaveLength(1);
  });
});
