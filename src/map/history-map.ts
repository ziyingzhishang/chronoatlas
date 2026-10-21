import { geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import worldTopology from 'world-atlas/land-110m.json';
import type { StyleSpecification, SymbolLayerSpecification } from 'maplibre-gl';
import type { HistoricalState } from '../domain/types';
import { satelliteColor } from './presentation';
import { modernSovereigntyFeatures } from '../data/modern-reference';

export const allLayers = ['boundaries', 'places', 'modernReference', 'events'] as const;
export type MapLayer = (typeof allLayers)[number];
export type Basemap = 'relief' | 'satellite';
export type MapAction = 'zoomIn' | 'zoomOut' | 'rotateLeft' | 'rotateRight' | 'north' | 'pitch' | 'asia' | 'china' | 'world';
export interface CameraState { center: [number, number]; zoom: number; bearing: number; pitch: number }
export const ASIA_VIEW = { center: [105, 35] as [number, number], zoom: 2.8, bearing: 0, pitch: 0 };
export const BASEMAPS = {
  relief: {
    name: '地形晕渲', service: 'World_Shaded_Relief', maxzoom: 13,
    attribution: '地形 © Esri, USGS, NOAA',
  },
  satellite: {
    name: '卫星影像', service: 'World_Imagery', maxzoom: 19,
    attribution: '影像 © Esri, Maxar, Earthstar Geographics, GIS User Community',
  },
} as const;
export const basemapTiles = (basemap: Basemap) => [
  `https://services.arcgisonline.com/ArcGIS/rest/services/${BASEMAPS[basemap].service}/MapServer/tile/{z}/{y}/{x}`,
];

const collection = <G extends GeoJSON.Geometry>(features: GeoJSON.Feature<G>[]): GeoJSON.FeatureCollection<G> => ({ type: 'FeatureCollection', features });
const point = (coordinates: number[], properties: GeoJSON.GeoJsonProperties): GeoJSON.Feature<GeoJSON.Point> => ({ type: 'Feature', geometry: { type: 'Point', coordinates }, properties });

function buildBoundaryData(state:HistoricalState,region:'local'|'world',t:(text:string)=>string){
  const byId = new Map(state.activePolities.map(p => [p.id, p]));
  const opacity = { high: 0.40, medium: 0.28, low: 0.22 };
  const boundaryFeature=(boundary:HistoricalState['boundaries'][number])=>({
    type: 'Feature' as const, id: boundary.id, geometry: boundary.geometry,
    properties: { entityId: boundary.polityId, polityId: boundary.polityId,
      color: byId.get(boundary.polityId)?.color ?? '#a99572',
      satelliteColor: satelliteColor(byId.get(boundary.polityId)?.color ?? '#a99572'),
      opacity: boundary.presentation==='maximum' ? 0.08 : opacity[boundary.confidence], controlType: boundary.controlType,
      maximum: boundary.presentation==='maximum',
      confidence: boundary.confidence, evidenceLevel:boundary.evidence.evidenceLevel,
      derivation:boundary.evidence.derivation, reviewStatus:boundary.evidence.reviewStatus },
  });
  const matches=(boundary:HistoricalState['boundaries'][number])=>region==='world'
    ? byId.get(boundary.polityId)?.region==='world'
    : byId.get(boundary.polityId)?.region!=='world';
  const selected=state.boundaries.filter(matches)
    .sort((a,b)=>Number(b.presentation==='maximum')-Number(a.presentation==='maximum'));
  // Planar centroids avoid spherical winding conventions placing labels on the antipode.
  const labels=collection(selected.map(boundary => point(
    geoPath().centroid(boundary.geometry),
    { entityId: boundary.polityId, name: `${byId.get(boundary.polityId)?.localizedName?.mapLabel ?? byId.get(boundary.polityId)?.name ?? boundary.polityId}${boundary.presentation==='maximum'?t('〔最大参考〕'):''}` },
  )));
  return {boundaries:collection(selected.map(boundaryFeature)),labels};
}

export function buildLocalMapData(state:HistoricalState,t:(text:string)=>string=text=>text){
  const local=buildBoundaryData(state,'local',t);
  const places = collection(state.places.map(place => point([place.longitude, place.latitude], {
    entityId: place.id, name: place.historicalName, modernName: place.modernName ? `${t('今·')}${place.modernName}` : '',
  })));
  const events = collection(state.events.flatMap(event => {
    return event.coordinates && event.locationPrecision ? [point(event.coordinates, { entityId: event.id, name: event.title })] : [];
  }));
  const modernSovereignty = {
    ...modernSovereigntyFeatures(state.year),
    features: modernSovereigntyFeatures(state.year).features.map(feature => ({...feature, properties:{
      ...feature.properties, label:t(feature.properties.administrativeLabel), color:'#b76c5d',
      satelliteColor:satelliteColor('#b76c5d'),
    }})),
  };
  return {boundaries:local.boundaries,polityLabels:local.labels,places,events,modernSovereignty};
}

export function buildWorldMapData(state:HistoricalState,t:(text:string)=>string=text=>text){
  const world=buildBoundaryData(state,'world',t);
  return {worldBoundaries:world.boundaries,worldPolityLabels:world.labels};
}

export function buildMapData(state: HistoricalState, t:(text:string)=>string=text=>text) {
  return {...buildLocalMapData(state,t),...buildWorldMapData(state,t)};
}

const boundaryLayerIds=['boundary-fill', 'boundary-d-area', 'boundary-line', 'boundary-digitized', 'boundary-maximum', 'boundary-d-centers', 'boundary-indirect', 'boundary-disputed', 'boundary-influence', 'boundary-selected', 'boundary-digitized-selected', 'boundary-d-centers-selected', 'boundary-indirect-selected', 'boundary-disputed-selected', 'boundary-influence-selected', 'boundary-maximum-selected'] as const;
export const layerGroups: Record<MapLayer, string[]> = {
  boundaries: [...boundaryLayerIds,...boundaryLayerIds.map(id=>`world-${id}`),'polity-names','world-polity-names'],
  places: ['place-dots', 'place-selected', 'place-names'],
  modernReference: ['modern-names', 'modern-sovereignty-fill', 'modern-sovereignty-line', 'modern-sovereignty-label'],
  events: ['event-rings'],
};

const font = ['PingFang SC', 'Microsoft YaHei', 'sans-serif'];
const labelPaint: SymbolLayerSpecification['paint'] = {
  'text-color': '#253731', 'text-halo-color': '#fff7df', 'text-halo-width': 1.8,
};

export function createMapStyle(): StyleSpecification {
  const empty = collection([]);
  const land = feature(worldTopology as never, worldTopology.objects.land as never) as unknown as GeoJSON.FeatureCollection;
  const style:StyleSpecification={
    version: 8,
    // MapLibre renders glyphs locally when no glyph server is configured.
    sources: {
      land: { type: 'geojson', data: land, attribution: '陆地轮廓: Natural Earth' },
      relief: { type: 'raster', tiles: basemapTiles('relief'), tileSize: 256, maxzoom: BASEMAPS.relief.maxzoom },
      satellite: { type: 'raster', tiles: basemapTiles('satellite'), tileSize: 256, maxzoom: BASEMAPS.satellite.maxzoom },
      boundaries: { type: 'geojson', data: empty, tolerance: 0.1, attribution: 'Cliopatria / Seshat · CC BY 4.0; Historical Basemaps / André Ourednik · GPL-3.0' },
      worldBoundaries: { type: 'geojson', data: empty, tolerance: 0.1, attribution: 'Cliopatria / Seshat · CC BY 4.0; Historical Basemaps / André Ourednik · GPL-3.0' },
      places: { type: 'geojson', data: empty },
      polityLabels: { type: 'geojson', data: empty },
      worldPolityLabels: { type: 'geojson', data: empty },
      events: { type: 'geojson', data: empty },
      modernSovereignty: { type: 'geojson', data: empty, attribution: 'Physical island outline: Natural Earth / world-atlas' },
    },
    layers: [
      { id: 'ocean', type: 'background', paint: { 'background-color': '#b3ccd5' } },
      { id: 'land-fill', type: 'fill', source: 'land', paint: { 'fill-color': '#dedecd' } },
      { id: 'relief-raster', type: 'raster', source: 'relief', paint: { 'raster-fade-duration': 180 } },
      { id: 'satellite-raster', type: 'raster', source: 'satellite', layout: { visibility: 'none' }, paint: { 'raster-fade-duration': 180 } },
      { id: 'modern-sovereignty-fill', type: 'fill', source: 'modernSovereignty', paint: { 'fill-color': ['get','color'], 'fill-opacity': 0.34 } },
      { id: 'modern-sovereignty-line', type: 'line', source: 'modernSovereignty', paint: { 'line-color': ['get','color'], 'line-width': 2.2, 'line-opacity': 0.95 } },
      { id: 'boundary-fill', type: 'fill', source: 'boundaries', filter:['in',['get','evidenceLevel'],['literal',['A','B','C']]], paint: { 'fill-color': ['get', 'color'], 'fill-opacity': ['get', 'opacity'] } },
      { id: 'boundary-d-area', type:'fill', source:'boundaries', filter:['all',['==',['get','evidenceLevel'],'D'],['==',['geometry-type'],'Polygon']], paint:{'fill-color':['get','color'],'fill-opacity':0.16} },
      { id: 'boundary-line', type: 'line', source: 'boundaries', filter: ['all',['==',['get','evidenceLevel'],'A'],['in', ['get', 'controlType'], ['literal', ['direct', 'unspecified']]]], paint: { 'line-color': ['get', 'color'], 'line-width': ['interpolate', ['linear'], ['zoom'], 2, 1.1, 6, 2, 10, 2.5], 'line-opacity': 0.9 } },
      { id: 'boundary-digitized', type:'line', source:'boundaries', filter:['all',['==',['get','evidenceLevel'],'B'],['in',['get','controlType'],['literal',['direct','unspecified']]]], paint:{'line-color':['get','color'],'line-width':1.8,'line-dasharray':[8,2,2,2],'line-opacity':0.9} },
      { id: 'boundary-maximum', type:'line', source:'boundaries',filter:['==',['get','evidenceLevel'],'C'],paint:{'line-color':['get','color'],'line-width':1.8,'line-dasharray':[4,3],'line-opacity':0.8} },
      { id: 'boundary-d-centers', type:'circle', source:'boundaries', filter:['==',['get','evidenceLevel'],'D'], paint:{'circle-radius':12,'circle-color':['get','color'],'circle-opacity':0.22,'circle-stroke-color':['get','color'],'circle-stroke-width':2,'circle-blur':0.35} },
      { id: 'boundary-indirect', type: 'line', source: 'boundaries', filter: ['==', ['get', 'controlType'], 'indirect'], paint: { 'line-color': ['get', 'color'], 'line-width': 1.5, 'line-dasharray': [6, 3] } },
      { id: 'boundary-disputed', type: 'line', source: 'boundaries', filter: ['==', ['get', 'controlType'], 'disputed'], paint: { 'line-color': ['get', 'color'], 'line-width': 1.5, 'line-dasharray': [3, 3] } },
      { id: 'boundary-influence', type: 'line', source: 'boundaries', filter: ['==', ['get', 'controlType'], 'influence'], paint: { 'line-color': ['get', 'color'], 'line-width': 1.5, 'line-dasharray': [1, 2] } },
      { id: 'boundary-selected', type: 'line', source: 'boundaries', filter: ['all',['==',['get','evidenceLevel'],'A'],['in',['get','controlType'],['literal',['direct','unspecified']]],['==', ['get', 'entityId'], '']], paint: { 'line-color': '#8b382b', 'line-width': 3.5 } },
      { id: 'boundary-digitized-selected', type:'line',source:'boundaries',filter:['all',['==',['get','evidenceLevel'],'B'],['==',['get','entityId'],'']],paint:{'line-color':'#8b382b','line-width':3.5,'line-dasharray':[8,2,2,2]} },
      { id: 'boundary-d-centers-selected', type:'circle',source:'boundaries',filter:['all',['==',['get','evidenceLevel'],'D'],['==',['get','entityId'],'']],paint:{'circle-radius':16,'circle-color':'#c6a15b','circle-opacity':0.28,'circle-stroke-color':'#8b382b','circle-stroke-width':3,'circle-blur':0.25} },
      { id: 'boundary-indirect-selected', type:'line',source:'boundaries',filter:['all',['!=',['get','maximum'],true],['==',['get','controlType'],'indirect'],['==',['get','entityId'],'']],paint:{'line-color':'#8b382b','line-width':3.5,'line-dasharray':[6,3]} },
      { id: 'boundary-disputed-selected', type:'line',source:'boundaries',filter:['all',['!=',['get','maximum'],true],['==',['get','controlType'],'disputed'],['==',['get','entityId'],'']],paint:{'line-color':'#8b382b','line-width':3.5,'line-dasharray':[3,3]} },
      { id: 'boundary-influence-selected', type:'line',source:'boundaries',filter:['all',['!=',['get','maximum'],true],['==',['get','controlType'],'influence'],['==',['get','entityId'],'']],paint:{'line-color':'#8b382b','line-width':3.5,'line-dasharray':[1,2]} },
      { id: 'boundary-maximum-selected', type: 'line', source: 'boundaries', filter: ['all',['==',['get','evidenceLevel'],'C'],['==', ['get', 'entityId'], '']], paint: { 'line-color': '#8b382b', 'line-width': 3.5, 'line-dasharray':[4,3] } },
      { id: 'polity-names', type: 'symbol', source: 'polityLabels', layout: {
        'text-field': ['get', 'name'], 'text-font': font, 'text-size': 20,
        'text-letter-spacing': 0.15, 'text-padding': 10, 'text-max-width': 6,
      }, paint: labelPaint },
      { id: 'place-dots', type: 'circle', source: 'places', paint: { 'circle-radius': 4, 'circle-color': '#953f32', 'circle-stroke-color': '#fff5de', 'circle-stroke-width': 1.5 } },
      { id: 'place-selected', type: 'circle', source: 'places', filter: ['==', ['get', 'entityId'], ''], paint: { 'circle-radius': 9, 'circle-color': '#c6a15b', 'circle-opacity': 0.35, 'circle-stroke-color': '#703222', 'circle-stroke-width': 2 } },
      { id: 'event-rings', type: 'circle', source: 'events', paint: { 'circle-radius': 11, 'circle-color': '#ba4b3e', 'circle-opacity': 0.15, 'circle-stroke-color': '#ba4b3e', 'circle-stroke-width': 2 } },
      { id: 'place-names', type: 'symbol', source: 'places', layout: {
        'text-field': ['get', 'name'], 'text-font': font, 'text-size': 13,
        'text-variable-anchor': ['top', 'bottom', 'left', 'right'], 'text-radial-offset': 0.8,
        'text-padding': 3, 'text-max-width': 7,
      }, paint: labelPaint },
      { id: 'modern-names', type: 'symbol', source: 'places', minzoom: 4.5, layout: {
        'text-field': ['get', 'modernName'], 'text-font': font, 'text-size': 10,
        'text-anchor': 'top', 'text-offset': [0, 2.3], 'text-padding': 2,
      }, paint: { ...labelPaint, 'text-color': '#596555', 'text-halo-width': 1.5 } },
      { id: 'modern-sovereignty-label', type: 'symbol', source: 'modernSovereignty', layout: {
        'text-field': ['get','label'], 'text-font': font, 'text-size': 13, 'text-padding': 4,
      }, paint: labelPaint },
    ],
  };
  style.layers=style.layers.flatMap(layer=>
    'source' in layer&&layer.source==='boundaries'
      ? [layer,{...layer,id:`world-${layer.id}`,source:'worldBoundaries'} as typeof layer]
      : layer.id==='polity-names'
        ? [layer,{...layer,id:'world-polity-names',source:'worldPolityLabels'} as typeof layer]
      : [layer]
  );
  return style;
}
