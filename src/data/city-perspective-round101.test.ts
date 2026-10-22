import { describe, expect, it } from 'vitest';
import { events } from './events';
import { heritageAssets } from './heritage';
import { getHeritageDetail } from './heritage-details';
import { buildEventDetailCoverageReport } from './event-detail-coverage';
import { claims } from './claims';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { capitalHistory } from './capital-history';
import { buildCityStudyView } from '../domain/study-view';

describe('第101轮城市视角审计：临安历史层', () => {
  it('为临安补齐南宋长期政治中心形成事件，并保持四层城市链可导航', () => {
    const view = buildCityStudyView('linan', 2026, {
      polities, places, people, heritage: heritageAssets, events, claims, capitalTerms: capitalHistory,
    });

    expect(view?.polities.map((polity) => polity.id)).toContain('song_south');
    expect(view?.events.map((event) => event.id)).toContain('song-linan-center-formed');
    expect(view?.heritage.map((asset) => asset.id)).toContain('linan-southern-song-imperial-city-site');
    expect(view?.capitalTerms.some((term) => term.polityId === 'song_south' && term.placeId === 'linan')).toBe(true);

    const detail = getHeritageDetail('linan-southern-song-imperial-city-site');
    expect(detail?.associatedEvents).toContain('song-linan-center-formed');
  });

  it('新事件具备完整详情、地点与来源引用', () => {
    const report = buildEventDetailCoverageReport();
    const item = report.items.find((entry) => entry.eventId === 'song-linan-center-formed');

    expect(item?.status).toBe('covered');
    expect(item?.locationIds).toEqual(expect.arrayContaining(['linan', 'yingtian', 'jiankang']));
    expect(item?.polityIds).toContain('song_south');
    expect(item?.sourceComplete).toBe(true);
  });
});
