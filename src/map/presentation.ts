import type { ExpressionSpecification } from 'maplibre-gl';
import type { Basemap } from './history-map';
import type { BoundaryState, EvidenceLevel } from '../domain/types';

export interface EvidenceStyle {
  lineDasharray?: number[];
  fillOpacity: number;
  lineOpacity: number;
  renderKind: 'territory' | 'soft-area' | 'centers';
}

export function evidenceStyle(level: EvidenceLevel, basemap: Basemap): EvidenceStyle {
  const satellite = basemap === 'satellite';
  if (level === 'A') return {fillOpacity:satellite ? 0.50 : 0.40, lineOpacity:0.95, renderKind:'territory'};
  if (level === 'B') return {fillOpacity:satellite ? 0.42 : 0.30, lineOpacity:0.9, lineDasharray:[8,2,2,2], renderKind:'territory'};
  if (level === 'C') return {fillOpacity:satellite ? 0.16 : 0.10, lineOpacity:0.8, lineDasharray:[4,3], renderKind:'territory'};
  return {fillOpacity:satellite ? 0.20 : 0.16, lineOpacity:0.55, lineDasharray:[1,3], renderKind:'soft-area'};
}

export function boundaryStatusLabel(boundary: BoundaryState): string {
  const {evidenceLevel, derivation} = boundary.evidence;
  if (evidenceLevel === 'A') return '直接来源';
  if (evidenceLevel === 'B') return '数字化参考';
  if (derivation === 'nearest-same-polity') return '使用过渡参考';
  if (derivation === 'maximum-record') return '使用最大参考';
  if (derivation === 'cultural-core') return '展示文化核心区';
  if (derivation === 'control-centers' || derivation === 'influence-area') return '展示控制中心／影响范围';
  return '暂无国家边界资料';
}

export function satelliteColor(color: string): string {
  if (!/^#[\da-f]{6}$/i.test(color)) return '#a99572';
  const [r,g,b]=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16)/255);
  const max=Math.max(r,g,b),min=Math.min(r,g,b),delta=max-min;
  const lightness=(max+min)/2;
  const saturation=delta===0?0:delta/(1-Math.abs(2*lightness-1));
  const hue=delta===0?0:max===r?((g-b)/delta+6)%6:max===g?(b-r)/delta+2:(r-g)/delta+4;
  return `hsl(${Math.round(hue*60)}, ${Math.round(Math.min(0.85,saturation*1.25)*100)}%, ${Math.round(Math.max(0.58,Math.min(0.7,lightness))*100)}%)`;
}

/** Presentation only: never changes the underlying boundary confidence. */
export function boundaryOpacity(basemap: Basemap): ExpressionSpecification {
  return basemap === 'satellite'
    ? ['case', ['==', ['get', 'maximum'], true], 0.14,
      ['match', ['get', 'confidence'], 'high', 0.50, 'medium', 0.42, 0.34]]
    : ['get', 'opacity'];
}
