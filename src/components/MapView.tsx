import { useLocale } from '../i18n/locale';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { PanelName } from '../workspace/WorkspacePanel';
import type { HistoricalState, SelectedEntity } from '../domain/types';
import { ASIA_VIEW, allLayers, type Basemap, type CameraState, type MapAction, type MapLayer } from '../map/history-map';
import { HistoricalMapCanvas, type MapHandle } from './HistoricalMapCanvas';
import { formatHistoricalYear } from '../domain/timeline';

export { allLayers, type MapLayer } from '../map/history-map';
interface MapViewProps {
  state: HistoricalState;
  refreshToken?:number;
  selectedEntity: SelectedEntity;
  visibleLayers: Set<MapLayer>;
  onLayerChange?: (layer:MapLayer, visible:boolean)=>void;
  showWorld?: boolean;
  onShowWorldChange?: (visible:boolean)=>void;
  onSelectEntity: (entity: Exclude<SelectedEntity, undefined>) => void;
  onClearSelection?: () => void;
  workspacePanel?: PanelName|null;
  panelTarget?: HTMLDivElement|null;
  focusRequest?: {id:string;nonce:number};
}

export function MapView(props: MapViewProps) {
  const { t } = useLocale();
  const { state, selectedEntity, visibleLayers, onSelectEntity } = props;
  const [basemap, setBasemap] = useState<Basemap>('relief');
  const [projection, setProjection] = useState<'mercator' | 'globe'>('mercator');
  const [camera, setCamera] = useState<CameraState>(ASIA_VIEW);
  const [showReference, setShowReference] = useState(true);
  const [worldSearch, setWorldSearch] = useState('');
  const [renderedYear,setRenderedYear]=useState<number>();
  const [canGoBackCamera,setCanGoBackCamera]=useState(false);
  const map = useRef<MapHandle>(null);
  useEffect(()=>{if(props.focusRequest)map.current?.focus({type:'event',id:props.focusRequest.id});},[props.focusRequest]);
  const act = (action: MapAction) => map.current?.perform(action);
  const workspace = props.workspacePanel !== undefined;
  const auxiliary = (name:PanelName,children:ReactNode) => !workspace ? children : props.panelTarget && props.workspacePanel===name ? createPortal(children,props.panelTarget) : null;
  const localPolities = state.activePolities.filter(p=>p.region!=='world');
  const worldPolities = state.activePolities.filter(p=>p.region==='world');
  const matches = worldPolities.filter(p=>`${p.name} ${p.originalName}`.toLocaleLowerCase().includes(worldSearch.toLocaleLowerCase()));
  const displayed = useMemo(()=>showReference ? state : {...state,boundaries:state.boundaries.filter(b=>b.presentation!=='maximum')},[state,showReference]);
  const worldIds=new Set(worldPolities.map(p=>p.id));
  const worldCount=state.boundaries.filter(b=>worldIds.has(b.polityId)).length;

  return <section className="map-view" aria-label={t("历史地图")} data-year={state.year} data-rendered-year={renderedYear} aria-busy={renderedYear!==state.year}>
    {!workspace && <div className="map-heading"><div><span className="eyebrow">{t("山川与形势")}</span><h2>{state.displayLabel} {t("· 政权与地域")}</h2></div><span className="map-note">{t("来源矢量 · 历史范围参考")}</span></div>}
    {!workspace&&<div className={`boundary-coverage ${state.coverage.mode}`} role="status" aria-label={t("疆域资料状态")}>
      <div><strong>{t(state.coverage.mode==='missing' ? '中国及周边目录本年暂无可用疆域资料' : `中国及周边目录 · 按${state.displayLabel}查询 · ${state.coverage.intervalCount ?? 0} 个来源时段图形${state.coverage.maximumCount ? ` · ${state.coverage.maximumCount} 个最大范围参考${showReference?'':'（已隐藏）'}` : ''}`)}{worldCount>0 && t(`；同期世界：${worldCount} 个来源时段图形`)}</strong>
        {!workspace&&<p>{t("实线为来源时段模型，不代表逐年独立考证。虚线“最大参考”取本政权已收录记录中面积最大的单个轮廓，并非本年实况或已证实的历史极大值；不同年代参考可能重叠。点击政权查看年代与来源。")}</p>}</div>
      {!workspace&&!!state.coverage.maximumCount && <label><input type="checkbox" checked={showReference} onChange={e => setShowReference(e.target.checked)} />{t("显示最大范围参考")}</label>}
    </div>}
    {auxiliary('layers',<>
    {workspace&&<><p className="detail-note">{t("实线为来源时段模型，非逐年独立考证。虚线是已收录的最大单条范围参考，非本年实况。")}</p><label className="reference-toggle"><input type="checkbox" checked={showReference} onChange={e=>setShowReference(e.target.checked)}/>{t("显示最大范围参考")}</label></>}
    <div className="map-toolbar">
      <div className="basemap-switch" role="group" aria-label={t("地图底图")}>
        <button aria-pressed={basemap === 'relief'} onClick={() => setBasemap('relief')}><span aria-hidden="true">▱</span> {t("地形晕渲")}</button>
        <button aria-pressed={basemap === 'satellite'} onClick={() => setBasemap('satellite')}><span aria-hidden="true">◉</span> {t("卫星影像")}</button>
      </div>
      <div className="map-scope" role="group" aria-label={t("地图范围")}>
        <button onClick={() => act('asia')}>{t("亚洲复位")}</button><button onClick={() => act('china')}>{t("中原放大")}</button><button onClick={() => act('world')}>{t("全球")}</button>
      </div>
    </div>
    </>)}
    <div className="map-stage">
      <HistoricalMapCanvas ref={map} {...props} state={displayed} basemap={basemap} projection={projection} refreshToken={props.refreshToken??0} onCameraChange={setCamera} onRenderedYearChange={setRenderedYear} onCameraHistoryChange={setCanGoBackCamera} />
      <div className="map-navigation" role="group" aria-label={t("地图视角操作")}>
        <button aria-label={t("放大地图")} title={t("放大")} onClick={() => act('zoomIn')}>＋</button>
        <button aria-label={t("缩小地图")} title={t("缩小")} onClick={() => act('zoomOut')}>−</button>
        <button className="projection-button" aria-label={t(projection === 'globe' ? '切换平铺视图' : '切换球形视图')} aria-pressed={projection === 'globe'} title={t(projection === 'globe' ? '切换平铺视图' : '切换球形视图')} onClick={() => setProjection(value => value === 'globe' ? 'mercator' : 'globe')}>{projection === 'globe' ? '◉' : '◌'}</button>
        {workspace&&props.workspacePanel!=='layers'&&<details className="quick-layer-control">
          <summary aria-label={t('地图图层')} title={t('地图图层')}>◈</summary>
          <fieldset className="quick-layer-popover" aria-label={t('快捷图层')}>
            <legend>{t('地图图层')}</legend>
            {allLayers.map(layer=><label key={layer}><input type="checkbox" checked={visibleLayers.has(layer)} onChange={event=>props.onLayerChange?.(layer,event.target.checked)}/>{t(({boundaries:'历史疆域',places:'历史地名',modernReference:'现代参照',events:'历史事件'} as const)[layer])}</label>)}
            <div className="quick-basemap"><span>{t('地图底图')}</span><button type="button" aria-pressed={basemap==='relief'} onClick={()=>setBasemap('relief')}>{t('地形晕渲')}</button><button type="button" aria-pressed={basemap==='satellite'} onClick={()=>setBasemap('satellite')}>{t('卫星影像')}</button></div>
            {props.onShowWorldChange&&<label><input type="checkbox" checked={props.showWorld??false} onChange={event=>props.onShowWorldChange?.(event.target.checked)}/>{t('同期世界疆域')}</label>}
          </fieldset>
        </details>}
        {workspace&&<button className="map-reset" onClick={()=>act('asia')}>{t("复位")}</button>}
        {canGoBackCamera&&<button className="map-back" aria-label={t("返回上个视角")} title={t("返回上个视角")} onClick={()=>map.current?.restorePrevious()}>{t("返回")}</button>}
        <details className="map-angle" open={workspace?undefined:true}><summary>{t("视角")}</summary>
        <span className="nav-divider" />
        <button aria-label={t("向左旋转30度")} title={t("向左旋转 30°")} onClick={() => act('rotateLeft')}>↶</button>
        <button aria-label={t("向右旋转30度")} title={t("向右旋转 30°")} onClick={() => act('rotateRight')}>↷</button>
        <button className="north-button" aria-label={t("恢复正北和平视")} title={t("恢复正北和平视")} onClick={() => act('north')}><span style={{ transform: `rotate(${-camera.bearing}deg)` }}>↑</span><small>{t("北")}</small></button>
        <span className="nav-divider" />
        <button className="pitch-button" aria-label={t("切换俯仰视角")} aria-pressed={camera.pitch > 5} title={t("切换俯仰视角")} onClick={() => act('pitch')}>{t(camera.pitch > 5 ? '俯视' : '倾斜')}</button>
        </details>
      </div>
    </div>
    {auxiliary('more',<>
    <div className="map-footer"><output aria-label={t("当前地图视角")}>{t(`缩放 ${camera.zoom.toFixed(1)} · 方位 ${Math.round(camera.bearing)}° · 俯仰 ${Math.round(camera.pitch)}°`)}</output><span>{t(`${state.activePolities.length} 个政权 · ${state.places.length} 个地点`)}</span></div>
    <div className="coverage-footer"><span>{t('地图范围为历史研究表达，不等同于测绘边界。')}</span><a href="https://github.com/Seshat-Global-History-Databank/cliopatria/tree/v0.2.1" target="_blank" rel="noreferrer">Cliopatria · CC BY 4.0 ↗</a></div>
    <details className="map-help"><summary>{t("地图操作指南")}</summary><p>{t("鼠标拖动平移，滚轮或双击缩放；右键拖动旋转及俯仰。触屏单指拖动，双指捏合缩放、旋转，双指上下拖动调整俯仰。地图获得焦点后，方向键平移，＋/− 缩放，Shift＋方向键旋转或俯仰。")}</p><p>{t("“亚洲复位”回到起始视角；“北”恢复正北和平视。现代地名在放大后显示。倾斜用于调整观察角度。")}</p></details>
    </>)}
    {auxiliary('details',<>
    {visibleLayers.has('boundaries') && <div className="polity-shortcuts" role="group" aria-label={t("政权目录")}>{localPolities.map(polity => <button key={polity.id} aria-label={`${t('选择')}${polity.name}${t('疆域')}`} aria-pressed={selectedEntity?.type === 'polity' && selectedEntity.id === polity.id} onClick={() => onSelectEntity({ type: 'polity', id: polity.id })}><i style={{ background: polity.color }} />{polity.name}</button>)}</div>}
    {!!worldPolities.length && <details className="world-directory"><summary>{t("同期世界目录 ·")} {worldPolities.length} {t("个来源实体")}</summary>
      <label>{t("查找政权")}<input aria-label={t("查找同期世界政权")} placeholder={t("中文或来源原名")} value={worldSearch} onChange={e=>setWorldSearch(e.target.value)} /></label>
      <div>{matches.map(p=><button key={p.id} onClick={()=>{const entity={type:'polity' as const,id:p.id};onSelectEntity(entity);map.current?.focus(entity);}}><i style={{background:p.color}} />{p.name}</button>)}</div>
      {!matches.length && <p>{t("未找到匹配的来源记录。")}</p>}
    </details>}
    {visibleLayers.has('places') && <details className="place-directory"><summary>{t("地点目录 · 点击定位")}</summary><div>{state.places.map(place => <button key={place.id} aria-label={t(`查看${place.historicalName}`)} aria-pressed={selectedEntity?.type === 'place' && selectedEntity.id === place.id} onClick={() => { const entity = { type: 'place' as const, id: place.id }; onSelectEntity(entity); map.current?.focus(entity); }}>{t(place.historicalName)}</button>)}</div></details>}
    </>)}
  </section>;
}
