import { describe, expect, it } from 'vitest';
import { capitalHistory } from '../data/capital-history';
import { claims } from '../data/claims';
import { changanEvents } from '../data/changan-study';
import { heritageAssets } from '../data/heritage';
import { people } from '../data/people';
import { places } from '../data/places';
import { polities } from '../data/polities';
import { buildCityHistoryTimeline, type CityHistoryData } from './city-timeline';

const data: CityHistoryData = { polities, places, people, heritage: heritageAssets, events: changanEvents, claims, capitalTerms: capitalHistory };

describe('buildCityHistoryTimeline', () => {
  it('keeps Changan historical layers and sorts nodes by era', () => {
    const timeline = buildCityHistoryTimeline('changan', data);
    const years = timeline.nodes.map((node) => node.year).filter((year): year is number => year !== undefined);

    expect(years).toEqual([...years].sort((left, right) => left - right));
    expect(timeline.nodes.some((node) => node.entity.type === 'polity' && node.entity.id === 'han_western')).toBe(true);
    expect(timeline.nodes.some((node) => node.entity.type === 'polity' && node.entity.id === 'tang')).toBe(true);
    expect(timeline.nodes.some((node) => node.entity.type === 'place' && node.label === '西安市')).toBe(true);
    expect(timeline.missingData).toEqual([]);
  });

  it('keeps multiple entity nodes that share the same year', () => {
    const timeline = buildCityHistoryTimeline('changan', data);
    const sameYearNodes = timeline.nodes.filter((node) => node.year === 634);

    expect(sameYearNodes.map((node) => node.entity.type)).toEqual(expect.arrayContaining(['event', 'heritage']));
    expect(sameYearNodes.length).toBeGreaterThanOrEqual(2);
  });

  it('projects existing relation and entity evidence status onto timeline nodes without inventing facts', () => {
    const timeline = buildCityHistoryTimeline('changan', data);
    const tang = timeline.nodes.find((node) => node.entity.type === 'polity' && node.entity.id === 'tang');
    const event = timeline.nodes.find((node) => node.entity.type === 'event' && node.entity.id === 'daming-palace-built');
    const heritage = timeline.nodes.find((node) => node.entity.type === 'heritage' && node.entity.id === 'daming-palace-site');

    expect(tang?.evidence).toMatchObject({
      relationCount: expect.any(Number),
      sourceStatus: 'available',
      datePrecisions: expect.arrayContaining(['range']),
      uncertaintyStatus: 'not-recorded',
    });
    expect(event?.evidence).toMatchObject({
      sourceStatus: 'available',
      datePrecisions: [],
    });
    expect(heritage?.evidence).toMatchObject({
      sourceStatus: 'available',
      relationCount: expect.any(Number),
    });
  });

  it('keeps evidence status unresolved when the existing record has no sources or precision', () => {
    const timeline = buildCityHistoryTimeline('test-city', {
      places: [{ id: 'test-city', historicalName: '测试城', aliases: [], longitude: 0, latitude: 0, sourceIds: [] }],
      polities: [], people: [], events: [], heritage: [], capitalTerms: [], claims: [],
    });
    const place = timeline.nodes.find((node) => node.entity.type === 'place');

    expect(place?.evidence).toEqual({
      relationCount: 0,
      sourceStatus: 'unresolved',
      sourceCount: 0,
      datePrecisions: [],
      uncertaintyStatus: 'not-recorded',
      uncertaintyNotes: [],
    });
  });

  it('reports missing city and incomplete historical data instead of returning a blank timeline', () => {
    expect(buildCityHistoryTimeline('unknown-city', data).missingData).toContain('城市不存在：unknown-city');

    const incomplete = buildCityHistoryTimeline('changan', { places, polities: [], people: [], heritage: [], events: [], capitalTerms: [], claims: [] });
    expect(incomplete.nodes).toEqual(expect.arrayContaining([expect.objectContaining({ entity: { type: 'place', id: 'changan' } })]));
    expect(incomplete.missingData).toEqual(expect.arrayContaining(['暂无已收录政权历史层', '暂无已收录人物', '暂无已收录事件', '暂无已收录遗产']));
  });
});
