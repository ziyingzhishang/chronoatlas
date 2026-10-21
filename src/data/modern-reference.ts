import raw from './generated/modern-sovereignty-reference.json';

export interface ModernSovereigntyFeatureProperties {
  id: 'taiwan-province-reference';
  sovereigntyGroup: 'china';
  administrativeLabel: '台湾省';
  effectiveFrom: 1949;
  sourceRole: 'physical-island-outline';
  source: string;
}

const reference = raw as GeoJSON.FeatureCollection<GeoJSON.Polygon, ModernSovereigntyFeatureProperties>;
const empty: GeoJSON.FeatureCollection<GeoJSON.Polygon, ModernSovereigntyFeatureProperties> = {
  type: 'FeatureCollection', features: [],
};

export function modernSovereigntyFeatures(year: number) {
  return year >= 1949 ? reference : empty;
}
