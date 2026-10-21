import raw from './generated/boundaries.json';
import intervals from './generated/cliopatria-china.json';
import curated from './generated/curated-boundaries.json';
import type { BoundaryState } from '../domain/types';
import { specialHistoricalExtents } from './special-historical-extents';

type CuratedBoundaryRecord = Omit<BoundaryState, 'geometry'> & {geometrySourceId: string};
const importedBoundaries = [...intervals, ...raw] as BoundaryState[];
const importedById = new Map(importedBoundaries.map(boundary => [boundary.id, boundary]));
const curatedBoundaries = (curated as CuratedBoundaryRecord[]).map(record => {
  const source = importedById.get(record.geometrySourceId);
  if (!source) throw new Error(`Unknown curated geometry source: ${record.geometrySourceId}`);
  const {geometrySourceId: _geometrySourceId, ...boundary} = record;
  return {...boundary, geometry: source.geometry};
});
export const boundaryCatalog = [...importedBoundaries, ...curatedBoundaries, ...specialHistoricalExtents] as BoundaryState[];
export const boundariesByPolity = new Map<string, BoundaryState[]>();
for (const b of boundaryCatalog) {
  const records = boundariesByPolity.get(b.polityId) ?? [];
  records.push(b);
  boundariesByPolity.set(b.polityId, records);
}
export const boundaryYears = [...new Set(boundaryCatalog.flatMap(b => b.temporalKind==='interval'
  ? [b.validFrom, b.validTo===-1?1:b.validTo+1] : [b.snapshotYear]))].filter(y=>y<=2026&&y!==0).sort((a, b) => a - b);

export async function loadBoundaryGeometry(id: string): Promise<GeoJSON.Geometry | undefined> {
  return boundaryCatalog.find(b => b.id === id)?.geometry;
}
