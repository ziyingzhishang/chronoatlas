import { useEffect, useMemo, useState } from 'react';
import { getHistoricalState } from '../domain/history-state';
import { formatHistoricalYear, getTimelineYears, indexToYear, yearToIndex, type YearWindow } from '../domain/timeline';
import type { HistoricalEvent, SelectedEntity } from '../domain/types';
import { EventExplorer } from '../components/EventExplorer';
import { eventYear } from '../domain/events';
import { events } from '../data/events';
import { InfoPanel } from '../components/InfoPanel';
import { Legend } from '../components/Legend';
import { MapView, allLayers, type MapLayer } from '../components/MapView';
import { TimeController } from '../workspace/TimeController';
import { DEFAULT_TIMELINE_WINDOW } from '../components/Timeline';
import { WorkspacePanel, type PanelName } from '../workspace/WorkspacePanel';
import '../styles/workspace.css';
import { useWorldSlice } from '../data/world';
import { LocaleProvider, localeNames, readLocale, useLocale } from '../i18n/locale';
import { localizeState } from '../i18n/content';
import { MapReadingGuide } from '../components/MapReadingGuide';

export function App() {
  return <LocaleProvider><HistoryWorkspace/></LocaleProvider>;
}

function HistoryWorkspace() {
  const {locale,setLocale,t}=useLocale();
  const [currentYear, setCurrentYear] = useState(800);
  const [selectedEntity, setSelectedEntity] = useState<SelectedEntity>(undefined);
  const [visibleLayers, setVisibleLayers] = useState<Set<MapLayer>>(() => new Set(allLayers.filter(l=>l!=='events')));
  const [isPlaying, setIsPlaying] = useState(false);
  const [showWorld, setShowWorld] = useState(false);
  const [panel,setPanel]=useState<PanelName|null>(null);
  const [panelTarget,setPanelTarget]=useState<HTMLDivElement|null>(null);
  const [eventGroup,setEventGroup]=useState<string[]|undefined>();
  const [focusRequest,setFocusRequest]=useState<{id:string;nonce:number}|undefined>();
  const [mapRefreshToken,setMapRefreshToken]=useState(0);
  const [timelineWindow,setTimelineWindow]=useState<YearWindow>(DEFAULT_TIMELINE_WINDOW);
  const [timelineViewLabel,setTimelineViewLabel]=useState('王朝至今');
  const [timelineHistory,setTimelineHistory]=useState<Array<{window:YearWindow;label:string}>>([]);
  const world = useWorldSlice(currentYear, showWorld);
  const historicalState = useMemo(() => localizeState(getHistoricalState(currentYear, {world:world.slice}),locale), [currentYear,world.slice,locale]);

  useEffect(() => {
    if (!isPlaying) return undefined;
    const years = getTimelineYears();
    const timer = window.setInterval(() => {
      setSelectedEntity(undefined);
      setEventGroup(undefined);
      setCurrentYear((year) => {
        const nextIndex = yearToIndex(year) + 1;
        if (nextIndex >= years.length) {
          setIsPlaying(false);
          return years.at(-1) ?? 959;
        }
        return indexToYear(nextIndex);
      });
    }, 650);
    return () => window.clearInterval(timer);
  }, [isPlaying]);

  function updateLayer(layer: MapLayer, visible: boolean) {
    setVisibleLayers((previous) => {
      const next = new Set(previous);
      if (visible) next.add(layer);
      else next.delete(layer);
      return next;
    });
  }

  function changeYear(year:number){setCurrentYear(year);setSelectedEntity(undefined);setEventGroup(undefined);setIsPlaying(false);}
  function commitYear(year:number){changeYear(year);setMapRefreshToken(token=>token+1);}
  function navigateTimelineView(next:YearWindow,label:string){
    setTimelineHistory(previous=>[...previous,{window:timelineWindow,label:timelineViewLabel}].slice(-20));
    setTimelineWindow(next);
    setTimelineViewLabel(label);
  }
  function backTimelineView(){
    const previous=timelineHistory.at(-1);
    if(!previous)return;
    setTimelineHistory(history=>history.slice(0,-1));
    setTimelineWindow(previous.window);
    setTimelineViewLabel(previous.label);
  }
  function selectEntity(entity:Exclude<SelectedEntity,undefined>){
    if(entity.type==='event'){const event=events.find(e=>e.id===entity.id);if(event)selectEvent(event);return;}
    setSelectedEntity(entity);setPanel('details');
  }
  function selectEvent(event:HistoricalEvent){setCurrentYear(eventYear(event,currentYear));setIsPlaying(false);setSelectedEntity({type:'event',id:event.id});setPanel('events');}
  const worldMessage=!showWorld?'开启后随所选年份显示全球政权。':world.status==='loading'?'正在加载本世纪世界资料…':world.status==='error'?'世界资料加载失败；中国图层不受影响。':world.status==='unavailable'?'世界来源仅覆盖前3400—2024年，本年不沿用旧图。':`世界 ${historicalState.activePolities.filter(p=>p.region==='world').length} 个来源实体 · 未逐国独立校勘`;
  const titles:Record<PanelName,string>={layers:'图层与底图',events:'历史转折',details:'地域与政权',more:'阅读说明与来源'};
  return <main className="workspace">
    <header className="workspace-header">
      <div className="map-status-hud" role="status" aria-label={t('当前历史状态')}>
        <strong>{t(historicalState.displayLabel)} · {t(timelineViewLabel)}</strong>
        <span>{t('当前视窗')} · {formatHistoricalYear(timelineWindow[0])}—{formatHistoricalYear(timelineWindow[1])}</span>
      </div>
      <nav className="workspace-tool-nav" aria-label={t('工作台工具')}>
        {(['events','details','more'] as const).map((name,i)=><button className="workspace-tool-icon" key={name} aria-label={t(['事件','详情','更多'][i])} title={t(['事件','详情','更多'][i])} aria-expanded={panel===name} aria-controls="workspace-panel" onClick={()=>{setEventGroup(undefined);setPanel(p=>p===name?null:name);}}>{['◆','ⓘ','⋯'][i]}</button>)}
      </nav>
    </header>
    <div className="workspace-map-area">
      <MapView state={historicalState} selectedEntity={selectedEntity} visibleLayers={visibleLayers} onLayerChange={updateLayer} showWorld={showWorld} onShowWorldChange={value=>{setShowWorld(value);setSelectedEntity(undefined);}} onSelectEntity={selectEntity} workspacePanel={panel} panelTarget={panelTarget} focusRequest={focusRequest} refreshToken={mapRefreshToken}/>
      {showWorld && <div className={`world-status ${world.status}`} role="status">{t(worldMessage)}{world.status==='error'&&<button onClick={world.retry}>{t('重试世界资料')}</button>}</div>}
      {panel && <WorkspacePanel title={t(titles[panel])} onClose={()=>setPanel(null)}>
        {panel==='details'&&<InfoPanel state={historicalState} selectedEntity={selectedEntity} onYearChange={changeYear}/>}
        {panel==='events'&&<EventExplorer year={currentYear} selectedId={selectedEntity?.type==='event'?selectedEntity.id:undefined} onSelect={selectEvent} onYearChange={changeYear} groupIds={eventGroup} onClearGroup={()=>setEventGroup(undefined)} onBackToList={()=>setSelectedEntity(undefined)} onLocate={event=>{
          setVisibleLayers(layers=>new Set([...layers,'events']));
          setFocusRequest(previous=>({id:event.id,nonce:(previous?.nonce??0)+1}));
        }}/>}
        {panel==='more'&&<><label className="language-setting">{t('显示语言')}<select aria-label={t('显示语言')} value={locale} onChange={e=>setLocale(readLocale(e.target.value))}>{Object.entries(localeNames).map(([value,name])=><option key={value} value={value}>{name}</option>)}</select></label><MapReadingGuide year={currentYear}/><Legend/><p className="detail-note">{t('时间导航：前8000—2026年。史前文化不是国家疆域；朝代目录并非穷尽名录。按年查询来源时段不等于逐年考证，最大已收录范围不是本年实况。古今海岸线与河道可能不同。地名仍为精选参照，尚未逐年校勘。现代底图和历史轮廓不作为历史实际控制的独立依据。')}</p><p className="detail-note">{t('桌面可停靠或悬浮时间控制器；手机使用收起、紧凑和展开三档。拖动年份不会改变地图视角。独立网页应用试用版，尚未公开发布。')}</p></>}
        <div ref={setPanelTarget}/>
      </WorkspacePanel>}
    </div>
    <TimeController mode={panel ? 'analysis' : 'explore'} year={currentYear} onYearChange={changeYear} onYearCommit={commitYear} isPlaying={isPlaying} onPlayToggle={()=>setIsPlaying(v=>!v)} onEventSelect={selectEvent} onEventGroup={ids=>{setEventGroup(ids);setPanel('events');setSelectedEntity(undefined);}} viewWindow={timelineWindow} onViewWindowChange={setTimelineWindow} onSemanticViewChange={navigateTimelineView} viewLabel={timelineViewLabel} canGoBack={timelineHistory.length>0} onBackView={backTimelineView}/>
  </main>;
}
