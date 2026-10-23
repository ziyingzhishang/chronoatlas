import { describe, expect, it } from 'vitest';
import { buildCityStudyView } from '../domain/study-view';
import { claims } from './claims';
import { capitalHistory } from './capital-history';
import { events } from './events';
import { heritageAssets } from './heritage';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';

const data = {
  polities,
  places,
  people,
  heritage: heritageAssets,
  events,
  claims,
  capitalTerms: capitalHistory,
};

describe('city historical-place alias closure', () => {
  it('includes an existing heritage layer attached to a related historical place ID', () => {
    const view = buildCityStudyView('wanyang', 23, data);

    expect(view?.heritage.map((asset) => asset.id)).toContain('gengshi-wanyang-city-layer');
  });

  it('keeps the Yangjumei city perspective connected to the later Dali city layer', () => {
    const view = buildCityStudyView('yangjumei', 1000, data);

    expect(view?.heritage.map((asset) => asset.id)).toContain('dali-city-site');
  });
});
