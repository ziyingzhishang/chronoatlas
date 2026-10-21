import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Map as GLMap, setWorkerUrl, type GeoJSONSource, type RasterTileSource } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import 'maplibre-gl/dist/maplibre-gl.css';
import { geoStream } from 'd3-geo';
import { createLatestFrameUpdater } from '../workspace/frame-updates';
import { boundaryOpacity } from '../map/presentation';
import { metricScale } from '../map/scale';
import { useLocale } from '../i18n/locale';
import type { HistoricalState, SelectedEntity } from '../domain/types';
import { ASIA_VIEW, BASEMAPS, basemapTiles, buildLocalMapData, buildWorldMapData, createMapStyle, layerGroups,
  type Basemap, type CameraState, type MapAction, type MapLayer } from '../map/history-map';
import { formatSourceField } from '../i18n/source-display';

export interface MapHandle {
  perform: (action: MapAction) => void;
  focus: (entity: Exclude<SelectedEntity, undefined>) => void;
  restorePrevious: () => void;
}
interface Props {
  state: HistoricalState;
  selectedEntity: SelectedEntity;
  visibleLayers: Set<MapLayer>;
  basemap: Basemap;
  projection: 'mercator' | 'globe';
  refreshToken:number;
  onSelectEntity: (entity: Exclude<SelectedEntity, undefined>) => void;
  onClearSelection?: () => void;
  onCameraChange: (camera: CameraState) => void;
  onRenderedYearChange:(year:number|undefined)=>void;
  onCameraHistoryChange?: (canBack:boolean)=>void;
}

function updateLocalHistory(map:GLMap,state:HistoricalState,t:(text:string)=>string){
  const data=buildLocalMapData(state,t);
  const sourceOrder=['boundaries','polityLabels','places','capitalPlaces','events','modernSovereignty'] as const;
  for (const id of sourceOrder) {
    (map.getSource(id) as GeoJSONSource).setData(data[id]);
  }
}
const mapDuration = (duration:number) => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 0 : duration;

const emptyFeatures:GeoJSON.FeatureCollection={type:'FeatureCollection',features:[]};
function clearWorldHistory(map:GLMap){
  (map.getSource('worldBoundaries') as GeoJSONSource).setData(emptyFeatures);
  (map.getSource('worldPolityLabels') as GeoJSONSource).setData(emptyFeatures);
}

function updateWorldHistory(map:GLMap,state:HistoricalState,t:(text:string)=>string){
  const data=buildWorldMapData(state,t);
  (map.getSource('worldBoundaries') as GeoJSONSource).setData(data.worldBoundaries);
  (map.getSource('worldPolityLabels') as GeoJSONSource).setData(data.worldPolityLabels);
}

const boundaryLayerVariants=(id:string)=>[id,`world-${id}`];
const interactiveMapLayers=['place-dots','place-names','capital-dots','capital-names','event-rings',...[
  'boundary-fill','boundary-d-area','boundary-line','boundary-digitized','boundary-maximum','boundary-d-centers',
  'boundary-indirect','boundary-disputed','boundary-influence','boundary-selected','boundary-digitized-selected',
  'boundary-d-centers-selected','boundary-indirect-selected','boundary-disputed-selected','boundary-influence-selected','boundary-maximum-selected',
].flatMap(boundaryLayerVariants),'polity-names','world-polity-names'];

function updatePresentation(map: GLMap, props: Props) {
  for (const id of ['relief', 'satellite']) {
    map.setLayoutProperty(`${id}-raster`, 'visibility', props.basemap === id ? 'visible' : 'none');
  }
  for (const [group, ids] of Object.entries(layerGroups)) {
    for (const id of ids) map.setLayoutProperty(id, 'visibility', props.visibleLayers.has(group as MapLayer) ? 'visible' : 'none');
  }
  const selectedPolity=props.selectedEntity?.type === 'polity' ? props.selectedEntity.id : '';
  for(const id of boundaryLayerVariants('boundary-selected'))map.setFilter(id, ['all',['==',['get','evidenceLevel'],'A'],['in',['get','controlType'],['literal',['direct','unspecified']]],['==', ['get', 'entityId'], selectedPolity]]);
  for(const id of boundaryLayerVariants('boundary-digitized-selected'))map.setFilter(id,['all',['==',['get','evidenceLevel'],'B'],['==',['get','entityId'],selectedPolity]]);
  for(const id of boundaryLayerVariants('boundary-d-centers-selected'))map.setFilter(id,['all',['==',['get','evidenceLevel'],'D'],['==',['get','entityId'],selectedPolity]]);
  for (const type of ['indirect','disputed','influence']) {
    for(const id of boundaryLayerVariants(`boundary-${type}-selected`)){
      map.setFilter(id,['all',['!=',['get','maximum'],true],['==',['get','controlType'],type],['==',['get','entityId'],selectedPolity]]);
      map.setPaintProperty(id,'line-color',props.basemap==='satellite'?'#ffdf8c':'#8b382b');
    }
  }
  for(const id of boundaryLayerVariants('boundary-maximum-selected'))map.setFilter(id, ['all',['==',['get','evidenceLevel'],'C'],['==', ['get', 'entityId'], selectedPolity]]);
  map.setFilter('place-selected', ['==', ['get', 'entityId'], props.selectedEntity?.type === 'place' ? props.selectedEntity.id : '']);
  const dark = props.basemap === 'satellite';
  for(const id of boundaryLayerVariants('boundary-fill'))map.setPaintProperty(id, 'fill-opacity', boundaryOpacity(props.basemap));
  for (const id of ['boundary-fill', 'boundary-d-area', 'boundary-line', 'boundary-digitized', 'boundary-maximum', 'boundary-indirect', 'boundary-disputed', 'boundary-influence']) {
    for(const variant of boundaryLayerVariants(id))map.setPaintProperty(variant, id === 'boundary-fill'||id === 'boundary-d-area' ? 'fill-color' : 'line-color', ['get', dark ? 'satelliteColor' : 'color']);
  }
  for(const id of boundaryLayerVariants('boundary-line')){
    map.setPaintProperty(id, 'line-width', ['interpolate', ['linear'], ['zoom'], 2, dark ? 1.8 : 1.1, 6, dark ? 2.8 : 2, 10, dark ? 3.2 : 2.5]);
    map.setPaintProperty(id, 'line-opacity', dark ? 1 : 0.9);
  }
  for(const id of boundaryLayerVariants('boundary-maximum'))map.setPaintProperty(id, 'line-width', dark ? 2.2 : 1.8);
  for(const id of boundaryLayerVariants('boundary-digitized'))map.setPaintProperty(id, 'line-width', dark ? 2.2 : 1.8);
  for (const id of ['boundary-indirect', 'boundary-disputed', 'boundary-influence']) {
    for(const variant of boundaryLayerVariants(id))map.setPaintProperty(variant, 'line-width', dark ? 2.2 : 1.5);
  }
  map.setPaintProperty('modern-sovereignty-fill', 'fill-color', ['get', dark ? 'satelliteColor' : 'color']);
  map.setPaintProperty('modern-sovereignty-line', 'line-color', ['get', dark ? 'satelliteColor' : 'color']);
  for (const id of ['polity-names','world-polity-names', 'place-names', 'capital-names', 'modern-names', 'modern-sovereignty-label']) {
    map.setPaintProperty(id, 'text-color', dark ? '#fff4d8' : id === 'modern-names' ? '#596555' : '#253731');
    map.setPaintProperty(id, 'text-halo-color', dark ? '#182b27' : '#fff7df');
  }
  for(const id of boundaryLayerVariants('boundary-selected'))map.setPaintProperty(id, 'line-color', dark ? '#ffdf8c' : '#8b382b');
  for(const id of boundaryLayerVariants('boundary-maximum-selected'))map.setPaintProperty(id, 'line-color', dark ? '#ffdf8c' : '#8b382b');
}

export const HistoricalMapCanvas = forwardRef<MapHandle, Props>(function HistoricalMapCanvas(props, ref) {
  const {locale,t}=useLocale();
  const translator=useRef(t);
  translator.current=t;
  const [scale,setScale]=useState<ReturnType<typeof metricScale>>(null);
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<GLMap>();
  const previousCamera = useRef<CameraState>();
  const readyMap = useRef<GLMap>();
  const historyUpdater=useRef<ReturnType<typeof createLatestFrameUpdater<HistoricalState>>>();
  const worldUpdater=useRef<ReturnType<typeof createLatestFrameUpdater<{state:HistoricalState;revision:number}>>>();
  const lastAppliedRevision=useRef(0);
  const lastRefreshToken=useRef(props.refreshToken);
  const latest = useRef(props);
  latest.current = props;
  const failedSources = useRef(new Set<string>());
  const [ready, setReady] = useState(false);
  const [fatal, setFatal] = useState(false);
  const [tileStatus, setTileStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!container.current) return;
    previousCamera.current = undefined;
    latest.current.onCameraHistoryChange?.(false);
    latest.current.onRenderedYearChange(undefined);
    readyMap.current = undefined;
    lastAppliedRevision.current=0;
    setReady(false);
    setFatal(false);
    setTileStatus('loading');
    failedSources.current.clear();
    let map: GLMap;
    try {
      // Vite relocates the main module; explicitly emit the matching worker asset.
      setWorkerUrl(workerUrl);
      map = new GLMap({
        container: container.current, style: createMapStyle(), ...ASIA_VIEW,
        minZoom: 0, maxZoom: 12, maxPitch: 60, renderWorldCopies: true,
        attributionControl: false, localIdeographFontFamily: 'sans-serif',
        dragRotate: true, touchZoomRotate: true, touchPitch: true,
        locale: { 'Map.Title': translator.current('可交互历史地图') },
      });
    } catch {
      setFatal(true);
      return;
    }
    mapRef.current = map;
    worldUpdater.current=createLatestFrameUpdater(({state,revision})=>{
      if(readyMap.current!==map||revision!==lastAppliedRevision.current)return;
      updateWorldHistory(map,state,translator.current);
    });
    historyUpdater.current=createLatestFrameUpdater((state,revision)=>{
      if(readyMap.current!==map||revision<lastAppliedRevision.current)return;
      lastAppliedRevision.current=revision;
      updateLocalHistory(map,state,translator.current);
      clearWorldHistory(map);
      latest.current.onRenderedYearChange(state.year);
      worldUpdater.current?.push({state,revision});
    });
    const canvas = map.getCanvas();
    canvas.setAttribute('aria-label', translator.current('可交互历史地图，方向键平移，加减键缩放，Shift 加方向键旋转或俯仰'));
    const updateScale=()=>{
      const {clientWidth:width,clientHeight:height}=map.getContainer();
      const pixels=Math.min(100,width/3);
      if(pixels<=0||height<=0){setScale(null);return;}
      const left=map.unproject([width/2-pixels/2,height/2]);
      const right=map.unproject([width/2+pixels/2,height/2]);
      setScale(left&&right?metricScale(left.distanceTo(right),pixels):null);
    };
    const reportCamera = () => latest.current.onCameraChange({ center: map.getCenter().toArray() as [number,number], zoom: map.getZoom(), bearing: map.getBearing(), pitch: map.getPitch() });
    map.on('style.load', () => {
      readyMap.current = map;
      historyUpdater.current?.flush(latest.current.state);
      map.setProjection({ type: latest.current.projection });
      updatePresentation(map, latest.current);
      updateScale();
      setReady(true);
      reportCamera();
    });
    map.on('moveend', reportCamera);
    map.on('move',updateScale);
    map.on('error', event => {
      if (/worker/i.test(event.error?.message ?? '')) setFatal(true);
      const sourceId = 'sourceId' in event ? String(event.sourceId) : '';
      if (sourceId === 'relief' || sourceId === 'satellite') {
        failedSources.current.add(sourceId);
        if (sourceId === latest.current.basemap) setTileStatus('error');
      }
    });
    map.on('sourcedata', event => {
      if (event.sourceId === latest.current.basemap && event.isSourceLoaded && !failedSources.current.has(event.sourceId)) setTileStatus('ready');
    });
    map.on('click', event => {
      if (!map.getLayer('place-dots')) { latest.current.onClearSelection?.(); return; }
      const hits = map.queryRenderedFeatures(event.point, { layers: interactiveMapLayers });
      const hit = hits.find(f => f.layer.id === 'place-dots' || f.layer.id === 'place-names' || f.layer.id === 'capital-dots' || f.layer.id === 'capital-names') ?? hits[0];
      if (!hit?.properties?.entityId) { latest.current.onClearSelection?.(); return; }
      const type = hit.layer.id.startsWith('place-') || hit.layer.id.startsWith('capital-') ? 'place' : hit.layer.id === 'event-rings' ? 'event' : 'polity';
      latest.current.onSelectEntity({ type, id: String(hit.properties.entityId) });
    });
    const observer = new ResizeObserver(() => {map.resize();updateScale();});
    observer.observe(container.current);
    const contextLost = () => setFatal(true);
    canvas.addEventListener('webglcontextlost', contextLost);
    return () => {
      observer.disconnect();
      historyUpdater.current?.dispose();
      historyUpdater.current=undefined;
      worldUpdater.current?.dispose();
      worldUpdater.current=undefined;
      canvas.removeEventListener('webglcontextlost', contextLost);
      mapRef.current = undefined;
      readyMap.current = undefined;
      map.remove();
    };
  }, [attempt]);

  useEffect(() => {
    if (ready && mapRef.current && readyMap.current === mapRef.current) historyUpdater.current?.push(props.state);
  }, [ready, props.state,t]);

  useEffect(() => {
    if (ready && mapRef.current && readyMap.current === mapRef.current) mapRef.current.setProjection({ type: props.projection });
  }, [ready, props.projection]);

  useEffect(()=>{
    if(lastRefreshToken.current===props.refreshToken)return;
    lastRefreshToken.current=props.refreshToken;
    if(ready&&mapRef.current&&readyMap.current===mapRef.current)historyUpdater.current?.flush(latest.current.state);
  },[ready,props.refreshToken]);

  useEffect(()=>{mapRef.current?.getCanvas().setAttribute('aria-label',t('可交互历史地图，方向键平移，加减键缩放，Shift 加方向键旋转或俯仰'));},[t,ready]);

  useEffect(() => {
    if (ready && mapRef.current && readyMap.current === mapRef.current) updatePresentation(mapRef.current, props);
  }, [ready, props.basemap, props.visibleLayers, props.selectedEntity]);

  useEffect(() => {
    const map = mapRef.current;
    if (ready && map && readyMap.current === map) setTileStatus(failedSources.current.has(props.basemap) ? 'error' : map.isSourceLoaded(props.basemap) ? 'ready' : 'loading');
  }, [ready, props.basemap]);

  useImperativeHandle(ref, () => ({
    restorePrevious() {
      const map = mapRef.current;
      const previous = previousCamera.current;
      if (!map || !previous || fatal) return;
      previousCamera.current = undefined;
      latest.current.onCameraHistoryChange?.(false);
      map.flyTo({ center: previous.center, zoom: previous.zoom, bearing: previous.bearing, pitch: previous.pitch, duration: mapDuration(500) });
    },
    perform(action) {
      const map = mapRef.current;
      if (!map || fatal) return;
      switch (action) {
        case 'zoomIn': map.zoomIn({ duration: mapDuration(280) }); break;
        case 'zoomOut': map.zoomOut({ duration: mapDuration(280) }); break;
        case 'rotateLeft': map.rotateTo(map.getBearing() - 30, { duration: mapDuration(280) }); break;
        case 'rotateRight': map.rotateTo(map.getBearing() + 30, { duration: mapDuration(280) }); break;
        case 'north': map.resetNorthPitch({ duration: mapDuration(350) }); break;
        case 'pitch': map.easeTo({ pitch: map.getPitch() > 5 ? 0 : 45, duration: mapDuration(400) }); break;
        case 'asia': map.flyTo({ ...ASIA_VIEW, duration: mapDuration(700) }); break;
        case 'china': map.flyTo({ center: [110, 34], zoom: 4.3, bearing: 0, pitch: 0, duration: mapDuration(700) }); break;
        case 'world': map.fitBounds([[-175, -60], [175, 75]], { padding: 25, bearing: 0, pitch: 0, duration: mapDuration(700) }); break;
      }
    },
    focus(entity) {
      const map = mapRef.current;
      if (!map || fatal) return;
      const checkpoint = () => {
        previousCamera.current = { center: map.getCenter().toArray() as [number,number], zoom: map.getZoom(), bearing: map.getBearing(), pitch: map.getPitch() };
        latest.current.onCameraHistoryChange?.(true);
      };
      if (entity.type === 'place') {
        const place = latest.current.state.places.find(p => p.id === entity.id);
        if (place) { checkpoint(); map.flyTo({ center: [place.longitude, place.latitude], zoom: Math.max(5.5, map.getZoom()), duration: mapDuration(650) }); }
      } else if(entity.type==='event') {
        const event=latest.current.state.events.find(e=>e.id===entity.id);
        if(event?.coordinates&&event.locationPrecision) { checkpoint(); map.flyTo({center:event.coordinates,zoom:Math.max(5,map.getZoom()),duration:mapDuration(650)}); }
      } else if (entity.type === 'polity') {
        const features=latest.current.state.boundaries.filter(b=>b.polityId===entity.id).map(b=>({type:'Feature' as const,properties:{},geometry:b.geometry}));
        if(features.length) {
          // Remove the largest empty longitude gap, not the whole antimeridian-spanning extent.
          const longitudes:number[]=[];
          let south=Infinity,north=-Infinity;
          geoStream({type:'FeatureCollection',features},{point(lon,lat){longitudes.push(lon);south=Math.min(south,lat);north=Math.max(north,lat);},lineStart(){},lineEnd(){},polygonStart(){},polygonEnd(){},sphere(){}});
          longitudes.sort((a,b)=>a-b);
          let gap=-1,west=0,east=0;
          longitudes.forEach((lon,i)=>{
            const next=longitudes[(i+1)%longitudes.length];
            const distance=(i===longitudes.length-1?next+360:next)-lon;
            if(distance>gap){gap=distance;west=next;east=lon+(lon<next?360:0);}
          });
          if([west,south,east,north].every(Number.isFinite)) { checkpoint(); map.fitBounds([[west,south],[east,north]],{padding:70,maxZoom:6,bearing:0,pitch:0,duration:mapDuration(700)}); }
        }
      }
    },
  }), [fatal]);

  function retry() {
    if (fatal) { setAttempt(a => a + 1); return; }
    failedSources.current.delete(props.basemap);
    setTileStatus('loading');
    (mapRef.current?.getSource(props.basemap) as RasterTileSource | undefined)?.setTiles(basemapTiles(props.basemap));
  }

  return <div className="interactive-map-wrap" data-basemap={props.basemap}>
    <div ref={container} className="interactive-map" />
    {scale&&<div className="localized-map-scale" style={{width:scale.width}}>{scale.distance} {t(scale.unit)}</div>}
    <div className="map-caption">{t(BASEMAPS[props.basemap].name)}<span>{t('现代地貌参照')}</span></div>
    {(fatal || tileStatus !== 'ready') && <div className={`map-load-status ${fatal || tileStatus === 'error' ? 'has-error' : ''}`} role="status">
      {t(fatal ? '地图渲染未能启动，请重试或检查浏览器环境。' : tileStatus === 'error' ? '部分底图未能加载，历史图层仍可阅读。' : '正在加载地貌…')}
      {(fatal || tileStatus === 'error') && <button onClick={retry}>{t('重试')}</button>}
    </div>}
    <div className="terrain-attribution">{formatSourceField('attribution','',locale).label}<a href={`https://services.arcgisonline.com/ArcGIS/rest/services/${BASEMAPS[props.basemap].service}/MapServer`} target="_blank" rel="noreferrer">{t(BASEMAPS[props.basemap].attribution)}</a> · Natural Earth</div>
  </div>;
});
