import { describe, expect, it } from 'vitest';

import { buildLocalMapData } from '../map/history-map';
import { getHistoricalState } from '../domain/history-state';
import { events } from './events';
import { getEventDetail } from './event-details';
import { polityDetails } from './polity-details';
import { places } from './places';

describe('modern territorial transition event locations', () => {
  it('renders the 507 Battle of Zhongli as an approximate regional event point only in its event year', () => {
    const event = events.find((item) => item.id === 'battle-zhongli-507');
    const detail = getEventDetail('battle-zhongli-507');
    const state = getHistoricalState(507);
    const mapData = buildLocalMapData(state);

    expect(event).toMatchObject({
      year: 507,
      coordinates: [117.64022, 32.90163],
      locationPrecision: 'approximate',
      sourceIds: expect.arrayContaining(['liang-zhongli-battle-507-primary', 'zhongli-site-fengyang-local', 'zhongli-chgis-location']),
    });
    expect(detail?.polityIds).toEqual(expect.arrayContaining(['liang_southern', 'wei_northern']));
    expect(detail?.participants).toContainEqual(expect.objectContaining({
      personId:'xiao-yan', role:expect.stringContaining('下诏命'), relationType:'direct',
    }));
    expect(detail?.uncertaintyNote).toMatch(/战场.*不.*边界|边界.*不.*战场/);
    expect(mapData.events.features).toContainEqual(expect.objectContaining({
      geometry: { type: 'Point', coordinates: [117.64022, 32.90163] },
      properties: expect.objectContaining({ entityId: 'battle-zhongli-507' }),
    }));
    expect(buildLocalMapData(getHistoricalState(506)).events.features.some(feature => feature.properties?.entityId === 'battle-zhongli-507')).toBe(false);
    expect(buildLocalMapData(getHistoricalState(508)).events.features.some(feature => feature.properties?.entityId === 'battle-zhongli-507')).toBe(false);
    expect(state.boundaries.filter(boundary => boundary.polityId === 'liang_southern' && boundary.evidence.derivation !== 'control-centers')).toEqual([]);
  });

  it('does not attach the sixth-century Liang emperor to the Later Shu revolt in 934', () => {
    const detail = getEventDetail('later-shu-suppresses-quzhou-revolt-934');
    expect(detail?.participants.some(participant => participant.personId === 'xiao-yan')).toBe(false);
  });

  it('renders the 923 Later Tang accession at Wei Prefecture separately from the later Luoyang center', () => {
    const event = events.find((item) => item.id === 'tang-later-founded');
    const mapData = buildLocalMapData(getHistoricalState(923));

    expect(event).toMatchObject({
      year: 923,
      coordinates: [115.11642, 36.41840],
      locationPrecision: 'approximate',
      sourceIds: expect.arrayContaining(['later-tang-founding-923-925-sources', 'weizhou-regional-location-chgis']),
    });
    expect(mapData.events.features).toContainEqual(expect.objectContaining({
      geometry: { type: 'Point', coordinates: [115.11642, 36.41840] },
      properties: expect.objectContaining({ entityId: 'tang-later-founded' }),
    }));
    expect(buildLocalMapData(getHistoricalState(922)).events.features.some(feature => (
      feature.properties?.entityId === 'tang-later-founded'
    ))).toBe(false);
    expect(buildLocalMapData(getHistoricalState(924)).events.features.some(feature => (
      feature.properties?.entityId === 'tang-later-founded'
    ))).toBe(false);
  });

  it('renders the 1928 Northeast Reflagging at Fengtian rather than the Qing-era Shengjing label', () => {
    const event = events.find((item) => item.id === 'northeast-reflag-1928');
    const detail = getEventDetail('northeast-reflag-1928');
    const fengtian = places.find((place) => place.id === 'fengtian');
    const mapData = buildLocalMapData(getHistoricalState(1928));

    expect(event?.placeId).toBe('fengtian');
    expect(detail?.locationIds).toContain('fengtian');
    expect(fengtian).toMatchObject({ historicalName: '奉天（今沈阳）', longitude: 123.43, latitude: 41.80 });
    expect(mapData.places.features.some((feature) => feature.properties?.entityId === 'fengtian'
      && feature.geometry.type === 'Point')).toBe(true);
  });

  it('links the 1912 Qing termination event to the ending polity and its Beijing capital record', () => {
    const detail = getEventDetail('qing-ended-1912');
    const qing = polityDetails.find((item) => item.polityId === 'qing');

    expect(detail?.polityIds).toEqual(['qing']);
    expect(detail?.locationIds).toContain('beijing');
    expect(qing?.eventIds).toContain('qing-ended-1912');
  });
});
