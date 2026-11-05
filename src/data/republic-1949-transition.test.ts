import { describe, expect, it } from 'vitest';
import audit from '../../docs/audits/out-of-ledger/republic-1949.json';
import { buildLocalMapData } from '../map/history-map';
import { getHistoricalState } from '../domain/history-state';
import { sourceById } from './sources';

describe('Republic 1949 out-of-ledger annual audit', () => {
  it('records the year-end government center without treating an annual source outline as direct control', () => {
    expect(audit.yearCount).toBe(1);
    expect(audit.years).toHaveLength(1);
    expect(audit.years[0]).toMatchObject({
      year: 1949,
      mapExpression: 'year-end-control-center-point',
      centerPlaceId: 'taipei',
      territoryBoundary: null,
      sourceBoundaryIds: ['clio-13089-republic-1949'],
    });
    expect(audit.years[0].evidenceGap).toContain('不进入运行时');
    expect(audit.years[0].sourceIds.every(sourceId => sourceById[sourceId])).toBe(true);
    expect(audit.years[0].sourceIds).toContain('cliopatria-map-image-1949');
    expect(audit.years[0].sourceIds).toContain('prc-liberated-areas-map-1949-reference');
    expect(audit.sourceNotes).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'cliopatria-map-image-1949',
        use: expect.stringContaining('C382-1949.PNG'),
      }),
      expect.objectContaining({
        id: 'prc-liberated-areas-map-1949-reference',
        use: expect.stringContaining('不等同于全年疆界'),
      }),
    ]));
    expect(sourceById['cliopatria-map-image-1949']?.urlOrCitation).toContain(
      'original_map_images/C382-1949.PNG',
    );
    expect(audit.sourceImageReview).toMatchObject({
      image: 'C382-1949.PNG',
      dimensions: { width: 4800, height: 2400 },
      legendEntities: ['Republic of China', 'Communist Party of China'],
      temporalControlSemantics: 'not-specified',
      geometryAlignment: 'not-verified',
    });
    expect(audit.reviewLimitations.at(-1)).toContain('已人工核对C382-1949.PNG原图');
  });

  it('keeps the held 1949 outline out of the map while preserving the adjacent 1948 source frame', () => {
    const state1949 = getHistoricalState(1949);
    const state1948 = getHistoricalState(1948);
    const map1949 = buildLocalMapData(state1949);

    expect(state1949.boundaries.some(boundary => boundary.id === 'clio-13089-republic-1949')).toBe(false);
    expect(map1949.boundaries.features.some(feature => feature.properties?.id === 'clio-13089-republic-1949')).toBe(false);
    expect(map1949.capitalPlaces.features.some(feature => feature.properties?.placeId === 'taipei')).toBe(true);
    expect(state1948.boundaries.some(boundary => boundary.id === 'clio-13073-republic-1948')).toBe(true);
  });
});
