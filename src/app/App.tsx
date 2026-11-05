import { useEffect, useMemo, useRef, useState } from 'react';
import { getHistoricalState } from '../domain/history-state';
import { formatHistoricalYear, getTimelineYears, indexToYear, yearToIndex, type YearWindow } from '../domain/timeline';
import type { HistoricalEvent, SelectedEntity } from '../domain/types';
import { EventDetailCard } from '../components/EventDetailCard';
import { DirectoryPopover } from '../components/DirectoryPopover';
import { eventYear, eventsAtYear } from '../domain/events';
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
import { localizeEvents } from '../i18n/content';
import { queryEvents } from '../domain/events';
import { MapReadingGuide } from '../components/MapReadingGuide';
import { EntityDrawer } from '../components/EntityDrawer';
import { PersonDetail } from '../components/PersonDetail';
import { EventDetail } from '../components/EventDetail';
import { HeritageDetail } from '../components/HeritageDetail';
import type { DetailEntity, DetailHistoryEntry } from '../domain/detail-entity';
import { ContentProvider, useHistoricalContent } from '../content/ContentContext';
import type { HistoricalContentRepository, ReleaseSnapshotRepository } from '../content/repository';
import { useSingleTopicView } from '../workspace/useSingleTopicView';
import { WorkspaceShell } from '../workspace/WorkspaceShell';
import { MapStatusHud } from '../components/MapStatusHud';
import { formatPresentDistance, polityDisplayName, yearsFromPresent } from '../presentation/map-status';
import { OfflineDataManager, type OfflineManager } from '../components/OfflineDataManager';
import type { ReleaseManifest } from '../content/release-types';
import { MapReleaseStatus } from '../components/MapReleaseStatus';
import type { MapReleaseCompliance } from '../compliance/map-release';
import mapReleaseCompliance from '../../public/data/map-release-compliance.json';
import { buildGlobalSearchIndex, type GlobalSearchType } from '../domain/global-search';

export interface OfflineRuntimeView {
  availableManifest: ReleaseManifest;
  manager: OfflineManager;
}

export function App({ contentRepository, offlineRuntime, mapReleaseCompliance: compliance = mapReleaseCompliance as MapReleaseCompliance }: {
  contentRepository?: HistoricalContentRepository | ReleaseSnapshotRepository;
  offlineRuntime?: OfflineRuntimeView;
  mapReleaseCompliance?: MapReleaseCompliance;
} = {}) {
  return <LocaleProvider><ContentProvider repository={contentRepository}><HistoryWorkspace offlineRuntime={offlineRuntime} mapReleaseCompliance={compliance}/></ContentProvider></LocaleProvider>;
}

function HistoryWorkspace({ offlineRuntime, mapReleaseCompliance: compliance }: { offlineRuntime?: OfflineRuntimeView; mapReleaseCompliance: MapReleaseCompliance }) {
  const {locale,setLocale,t}=useLocale();
  const { catalog, historySource, release } = useHistoricalContent();
  const { claims, events, heritage, heritageDetails, people, personDetails, places, polities, studyEvents: detailEvents } = catalog;
  const heritageById = useMemo(() => new Map(heritage.map((asset) => [asset.id, asset])), [heritage]);
  const heritageDetailById = useMemo(() => new Map(heritageDetails.map((detail) => [detail.heritageId, detail])), [heritageDetails]);
  const personDetailById = useMemo(() => new Map(personDetails.map((detail) => [detail.personId, detail])), [personDetails]);
  const singleTopicView = useSingleTopicView();
  const [currentYear, setCurrentYear] = useState(800);
  const [selectedEntity, setSelectedEntity] = useState<SelectedEntity>(undefined);
  const [visibleLayers, setVisibleLayers] = useState<Set<MapLayer>>(() => new Set(allLayers.filter(l=>l!=='events')));
  const [isPlaying, setIsPlaying] = useState(false);
  const [showWorld, setShowWorld] = useState(false);
  const [panel,setPanel]=useState<PanelName|null>(null);
  const [panelTarget,setPanelTarget]=useState<HTMLDivElement|null>(null);
  const [eventGroup,setEventGroup]=useState<string[]|undefined>();
  const [eventSearchQuery,setEventSearchQuery]=useState('');
  const [eventSearchRegion,setEventSearchRegion]=useState('');
  const [eventSearchCategory,setEventSearchCategory]=useState('');
  const [eventSearchOpen,setEventSearchOpen]=useState(false);
  const [expandedSearchGroups,setExpandedSearchGroups]=useState<Set<GlobalSearchType>>(()=>new Set());
  const eventSearchInput=useRef<HTMLInputElement>(null);
  const eventSearchPopover=useRef<HTMLDivElement>(null);
  const eventSearchScrollTop=useRef(0);
  const restoreEventSearch=useRef(false);
  const [directoryOpen,setDirectoryOpen]=useState(false);
  const [focusRequest,setFocusRequest]=useState<{type:'event'|'place';id:string;nonce:number}|undefined>();
  const [mapRefreshToken,setMapRefreshToken]=useState(0);
  const [panelResizeDeferred,setPanelResizeDeferred]=useState(false);
  const [timelineWindow,setTimelineWindow]=useState<YearWindow>(DEFAULT_TIMELINE_WINDOW);
  const [timelineViewLabel,setTimelineViewLabel]=useState('王朝至今');
  const [timelineHistory,setTimelineHistory]=useState<Array<{window:YearWindow;label:string}>>([]);
  const [detailEntity, setDetailEntity] = useState<DetailEntity>();
  const [detailHistory, setDetailHistory] = useState<DetailHistoryEntry[]>([]);
  const [detailOrigin, setDetailOrigin] = useState({ directoryOpen: false, eventSearchOpen: false });
  const [topicWidth, setTopicWidth] = useState(44);
  const world = useWorldSlice(currentYear, showWorld, release);
  const historicalState = useMemo(
    () => localizeState(getHistoricalState(historySource, currentYear, { world: world.slice }), locale),
    [currentYear, historySource, world.slice, locale],
  );
  const eraLabel = polityDisplayName(historicalState.activePolities, historicalState.year);
  const distanceLabel = formatPresentDistance(yearsFromPresent(currentYear, new Date().getFullYear()), locale);
  const timelineWindowLabel = `${t('当前视窗')} · ${formatHistoricalYear(timelineWindow[0])}—${formatHistoricalYear(timelineWindow[1])}`;
  const localizedEvents=useMemo(()=>localizeEvents(events,locale),[locale]);
  const searchableEvents=useMemo(()=>[...new Map([...events,...detailEvents].map(event=>[event.id,event])).values()],[events,detailEvents]);
  const localizedDetailEvents=useMemo(()=>localizeEvents(detailEvents,locale),[detailEvents,locale]);
  const localizedSearchEvents=useMemo(()=>localizeEvents(searchableEvents,locale),[searchableEvents,locale]);
  const globalSearchIndex=useMemo(()=>buildGlobalSearchIndex({events:searchableEvents,eventDetails:catalog.eventDetails as unknown as Record<string,unknown>[],people,personDetails:personDetails as unknown as Record<string,unknown>[],polities,polityDetails:catalog.polityDetails as unknown as Record<string,unknown>[],places,heritage,heritageDetails:heritageDetails as unknown as Record<string,unknown>[],claims,sources:catalog.sources,capitalTerms:catalog.capitalTerms},value=>t(value)),[searchableEvents,catalog.eventDetails,catalog.polityDetails,catalog.sources,catalog.capitalTerms,people,personDetails,polities,places,heritage,heritageDetails,claims,t]);
  const categoryOptions=globalSearchIndex.categories;
  const globalResults=useMemo(()=>globalSearchIndex.search(eventSearchQuery,{region:(eventSearchRegion||undefined) as 'china'|'world'|undefined,category:eventSearchCategory||undefined}),[globalSearchIndex,eventSearchQuery,eventSearchRegion,eventSearchCategory]);
  const timelineEvents=useMemo(()=>{
    if(eventSearchCategory&&!eventSearchCategory.startsWith('event:'))return [];
    const eventCategory=eventSearchCategory.startsWith('event:')?eventSearchCategory.slice('event:'.length):'';
    const filtered=queryEvents(localizedEvents,{region:eventSearchRegion,category:eventCategory}).filter(event=>event.year <= timelineWindow[1] && (event.endYear ?? event.year) >= timelineWindow[0]);
    if(eventGroup?.length)return filtered.filter(event=>eventGroup.includes(event.id));
    return eventsAtYear(filtered,currentYear).slice(0,6);
  },[localizedEvents,currentYear,eventSearchRegion,eventSearchCategory,timelineWindow,eventGroup]);

  useEffect(()=>{
    if(!eventSearchOpen||detailEntity||!restoreEventSearch.current)return;
    if(eventSearchPopover.current)eventSearchPopover.current.scrollTop=eventSearchScrollTop.current;
    eventSearchInput.current?.focus({preventScroll:true});
    restoreEventSearch.current=false;
  },[eventSearchOpen,detailEntity]);

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
  function viewEventYear(year:number,eventId:string){setCurrentYear(year);setEventGroup(undefined);setIsPlaying(false);setSelectedEntity({type:'event',id:eventId});setEventSearchOpen(true);}
  function commitYear(year:number){changeYear(year);setMapRefreshToken(token=>token+1);}
  function togglePlayback(){
    if(isPlaying){setIsPlaying(false);setMapRefreshToken(token=>token+1);return;}
    setIsPlaying(true);
  }
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
    setSelectedEntity(entity);setPanel(null);setEventSearchOpen(false);setDirectoryOpen(true);
  }
  function previewEvent(event:HistoricalEvent){setIsPlaying(false);setEventGroup(undefined);setSelectedEntity({type:'event',id:event.id});setPanel(null);setEventSearchOpen(true);}
  function selectEvent(event:HistoricalEvent){viewEventYear(eventYear(event,currentYear),event.id);setPanel(null);}
  function openDetail(entity: DetailEntity) {
    if (detailEntity?.type === entity.type && detailEntity.id === entity.id) return;
    if (!detailEntity) {
      setDetailOrigin({ directoryOpen, eventSearchOpen });
      if(eventSearchOpen){eventSearchScrollTop.current=eventSearchPopover.current?.scrollTop??0;restoreEventSearch.current=true;}
    }
    if (detailEntity && (detailEntity.type !== entity.type || detailEntity.id !== entity.id)) {
      const title = detailTitle(detailEntity, catalog);
      setDetailHistory((history) => [...history, { entity: detailEntity, title }].slice(-12));
    }
    setDirectoryOpen(false);
    setEventSearchOpen(false);
    setPanel(null);
    setDetailEntity(entity);
  }
  function closeDetail() {
    setDetailEntity(undefined);
    setDetailHistory([]);
    setDirectoryOpen(detailOrigin.directoryOpen);
    setEventSearchOpen(detailOrigin.eventSearchOpen);
  }
  function backDetail() {
    const previous = detailHistory.at(-1);
    if (!previous) return;
    setDetailHistory((history) => history.slice(0, -1));
    setDetailEntity(previous.entity);
  }
  function clearMapSelection(){
    if(selectedEntity?.type==='event'){
      setSelectedEntity(undefined);
      return;
    }
    if(selectedEntity?.type==='polity'||selectedEntity?.type==='place'){
      setSelectedEntity(undefined);
      setDirectoryOpen(false);
      if(panel==='details')setPanel(null);
    }
  }
  const worldMessage=!showWorld?'开启后随所选年份显示全球政权。':world.status==='loading'?'正在加载本世纪世界资料…':world.status==='error'?'世界资料加载失败；中国图层不受影响。':world.status==='unavailable'?'世界来源仅覆盖前3400—2024年，本年不沿用旧图。':`世界 ${historicalState.activePolities.filter(p=>p.region==='world').length} 个来源实体 · 未逐国独立校勘`;
  const visibleSearchEvents=timelineEvents;
  const selectedSearchEvent=selectedEntity?.type==='event'&&(
    eventSearchQuery.trim()?globalResults.some(result=>result.type==='event'&&result.id===selectedEntity.id):visibleSearchEvents.some(event=>event.id===selectedEntity.id)
  )?localizedSearchEvents.find(event=>event.id===selectedEntity.id):undefined;
  const groupedGlobalResults=useMemo(()=>{
    const groups:GlobalSearchType[]=['event','person','polity','place','heritage'];
    return groups.map(type=>({type,results:globalResults.filter(result=>result.type===type)})).filter(group=>group.results.length>0);
  },[globalResults]);
  function openSearchResult(type:GlobalSearchType,id:string){
    if(type==='event'){
      const event=localizedSearchEvents.find(item=>item.id===id);
      if(event)previewEvent(event);
      return;
    }
    openDetail({type,id});
  }
  function locateSearchPlace(id:string){
    setSelectedEntity({type:'place',id});setEventSearchOpen(false);setDirectoryOpen(true);
    setFocusRequest(previous=>({type:'place',id,nonce:(previous?.nonce??0)+1}));
  }
  const titles:Record<PanelName,string>={layers:'图层与底图',events:'历史转折',details:'地域与政权',more:'阅读说明与来源'};
  return <main className="workspace">
    <WorkspaceShell
      topicWidthPercent={topicWidth}
      onTopicWidthChange={setTopicWidth}
      singleTopicView={singleTopicView}
      mapPane={<>
    <header className="workspace-header">
      <div className="workspace-header-left">
        <MapStatusHud yearLabel={historicalState.displayLabel} eraLabel={eraLabel} viewLabel={timelineViewLabel}
          distanceLabel={distanceLabel} windowLabel={timelineWindowLabel} expanded={directoryOpen}
          onToggle={()=>{setSelectedEntity(undefined);setPanel(null);setEventSearchOpen(false);setDirectoryOpen(value=>!value);}} />
        <div className="event-search-dock-wrap" onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node|null))setEventSearchOpen(false);}}>
          <label className="event-search-dock"><span className="sr-only">{t('搜索历史内容')}</span><input ref={eventSearchInput} type="search" aria-label={t('搜索历史内容')} placeholder={t('搜索事件、人物、政权、古今地名与遗址')} value={eventSearchQuery} onFocus={()=>{setDirectoryOpen(false);setEventSearchOpen(true);}} onChange={e=>{setEventSearchQuery(e.target.value);setExpandedSearchGroups(new Set());}}/></label>
          {directoryOpen&&!eventSearchOpen&&(
              <DirectoryPopover id="directory-popover" state={historicalState} selectedEntity={selectedEntity} onSelectEntity={selectEntity} onBackToDirectory={()=>setSelectedEntity(undefined)} onClose={()=>{setSelectedEntity(undefined);setDirectoryOpen(false);}} onYearChange={changeYear} onOpenEntity={openDetail}/>
          )}
          {eventSearchOpen&&<div ref={eventSearchPopover} className="event-search-popover">
            <div className="event-search-filters"><select aria-label={t('搜索地域')} value={eventSearchRegion} onChange={e=>setEventSearchRegion(e.target.value)}><option value="">{t('全部地域')}</option><option value="china">{t('中国历史')}</option><option value="world">{t('同期世界')}</option></select><select aria-label={t('搜索类别')} value={eventSearchCategory} onChange={e=>setEventSearchCategory(e.target.value)}><option value="">{t('全部类别')}</option>{categoryOptions.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}</select></div>
            {!eventSearchQuery.trim()?<div className="event-search-results" role="listbox" aria-label={t('本年历史事件')}>
              {visibleSearchEvents.map((event:HistoricalEvent)=><button key={event.id} type="button" role="option" aria-selected={selectedEntity?.type==='event'&&selectedEntity.id===event.id} onClick={()=>previewEvent(event)}><strong>{t(event.title)}</strong><span>{t(event.category??'历史转折')} · {t(event.region==='world'?'同期世界':'中国历史')}</span></button>)}
              {!visibleSearchEvents.length&&<p className="detail-note">{t('本年暂无已收录事件')}</p>}
            </div>:<div className="event-search-results global-search-groups" aria-label={t('搜索历史内容')}>
              {groupedGlobalResults.map(group=>{const expanded=expandedSearchGroups.has(group.type);const shown=expanded?group.results:group.results.slice(0,5);return <section key={group.type} className="global-search-group" role="group" aria-label={`${t(({event:'事件',person:'人物',polity:'政权',place:'地点',heritage:'遗址遗产'} as Record<GlobalSearchType,string>)[group.type])} · ${group.results.length}`}>
                <h3>{t(({event:'事件',person:'人物',polity:'政权',place:'地点',heritage:'遗址遗产'} as Record<GlobalSearchType,string>)[group.type])}<span>{group.results.length}</span></h3>
                <ul className="global-search-list">{shown.map(result=>{const detail=result.type==='event'?localizedSearchEvents.find(item=>item.id===result.id):undefined;const caption=result.type==='event'?`${formatHistoricalYear(result.year??detail?.year??currentYear)} · ${t(result.category??'历史转折')}`:result.type==='place'?[result.modernName?`${t('今名')} ${t(result.modernName)}`:'',result.matchKind==='modern-name'?t('今名命中'):t('历史地名')].filter(Boolean).join(' · '):result.category?t(categoryOptions.find(option=>option.value===result.categoryValue)?.label??result.category):t(result.matchKind==='related'?'关联资料命中':result.matchKind==='content'?'正文命中':result.matchKind==='alias'?'别名命中':'名称命中');const selected=selectedEntity?.type===result.type&&selectedEntity.id===result.id;return <li className="global-search-result" key={result.key}><button type="button" aria-pressed={selected} onClick={()=>openSearchResult(result.type,result.id)}><strong>{t(result.title)}</strong><span>{caption}</span></button>{result.type==='place'&&<button type="button" className="global-search-locate" aria-label={`${t('定位到地点')}：${t(result.title)}`} onClick={()=>locateSearchPlace(result.id)}>{t('定位')}</button>}</li>})}</ul>
                {group.results.length>5&&<button type="button" className="global-search-more" onClick={()=>setExpandedSearchGroups(previous=>{const next=new Set(previous);if(next.has(group.type))next.delete(group.type);else next.add(group.type);return next;})}>{t(expanded?'收起结果':'更多结果')} · {group.results.length}</button>}
              </section>})}
              {!globalResults.length&&<p className="detail-note">{t('没有符合搜索条件的历史内容')}</p>}
            </div>}
            {selectedSearchEvent&&<EventDetailCard event={selectedSearchEvent} year={currentYear} onYearChange={year=>viewEventYear(year,selectedSearchEvent.id)} onBack={()=>setSelectedEntity(undefined)} onOpenEntity={openDetail} onLocate={event=>{
              viewEventYear(eventYear(event,currentYear),event.id);
              setVisibleLayers(layers=>new Set([...layers,'events']));
              setFocusRequest(previous=>({type:'event',id:event.id,nonce:(previous?.nonce??0)+1}));
            }}/>}
          </div>}
        </div>
      </div>
      <nav className="workspace-tool-nav" aria-label={t('工作台工具')}>
        <button className="workspace-tool-icon" aria-label={t('更多')} title={t('更多')} aria-expanded={panel==='more'} aria-controls="workspace-panel" onClick={()=>{setEventGroup(undefined);setPanel(p=>p==='more'?null:'more');}}>⋯</button>
      </nav>
    </header>
      <div className="workspace-map-area">
      <MapView state={historicalState} deferResize={panelResizeDeferred} worldDataPending={showWorld&&world.status==='loading'} selectedEntity={selectedEntity} visibleLayers={visibleLayers} onLayerChange={updateLayer} showWorld={showWorld} onShowWorldChange={value=>{setShowWorld(value);setSelectedEntity(undefined);}} onSelectEntity={selectEntity} onClearSelection={clearMapSelection} workspacePanel={panel} panelTarget={panelTarget} focusRequest={focusRequest} refreshToken={mapRefreshToken}/>
      {showWorld && <div className={`world-status ${world.status}`} role="status">{t(worldMessage)}{world.status==='error'&&<button onClick={world.retry}>{t('重试世界资料')}</button>}</div>}
      {panel && <WorkspacePanel variant={panel==='more'?'hud':'panel'} title={t(titles[panel])} onClose={()=>setPanel(null)}>
        {panel==='details'&&<InfoPanel state={historicalState} selectedEntity={selectedEntity} onYearChange={changeYear} onOpenEntity={openDetail}/>}
        {panel==='more'&&<><label className="language-setting">{t('显示语言')}<select aria-label={t('显示语言')} value={locale} onChange={e=>setLocale(readLocale(e.target.value))}>{Object.entries(localeNames).map(([value,name])=><option key={value} value={value}>{name}</option>)}</select></label><MapReleaseStatus compliance={compliance} releaseId={release.releaseId}/><OfflineDataManager manifest={offlineRuntime?.availableManifest ?? release} manager={offlineRuntime?.manager}/><MapReadingGuide year={currentYear}/><Legend/><p className="detail-note">{t('时间导航：前8000—2026年。史前文化不是国家疆域；朝代目录并非穷尽名录。按年查询来源时段不等于逐年考证，最大已收录范围不是本年实况。古今海岸线与河道可能不同。地名仍为精选参照，尚未逐年校勘。现代底图和历史轮廓不作为历史实际控制的独立依据。')}</p><p className="detail-note">{t('桌面可停靠或悬浮时间控制器；手机可连续拖动调节高度，收起后可拖动年份轨道。拖动年份不会改变地图视角。独立网页应用试用版，尚未公开发布。')}</p></>}
        <div ref={setPanelTarget}/>
      </WorkspacePanel>}
      </div>

      </>}
      timeNavigationPane={<TimeController mode={panel ? 'analysis' : 'explore'} year={currentYear} onResizeInteractionChange={setPanelResizeDeferred} onYearChange={changeYear} onYearCommit={commitYear} isPlaying={isPlaying} onPlayToggle={togglePlayback} onEventSelect={selectEvent} onEventGroup={ids=>{setEventGroup(ids);setPanel(null);setSelectedEntity(undefined);setEventSearchOpen(true);}} viewWindow={timelineWindow} onViewWindowChange={setTimelineWindow} onSemanticViewChange={navigateTimelineView} viewLabel={timelineViewLabel} canGoBack={timelineHistory.length>0} onBackView={backTimelineView}/>}
      topicPane={detailEntity ? <EntityDrawer title={detailTitle(detailEntity, catalog)} entityType={detailEntity.type} mapYear={currentYear} onClose={closeDetail} onBack={detailHistory.length ? backDetail : undefined} canGoBack={detailHistory.length > 0} singleView={singleTopicView}>
        {detailEntity.type === 'person' && (() => { const person = people.find((item) => item.id === detailEntity.id); return person ? <PersonDetail person={person} detail={personDetailById.get(person.id)} year={currentYear} claims={claims} people={people} polities={polities} events={events} onOpenEntity={openDetail} /> : <p className="detail-note">{t('暂无已收录人物详情')}</p>; })()}
        {detailEntity.type === 'event' && (() => { const event = detailEvents.find((item) => item.id === detailEntity.id); return event ? <EventDetail event={event} onOpenEntity={openDetail} /> : <p className="detail-note">{t('暂无已收录事件详情')}</p>; })()}
        {detailEntity.type === 'heritage' && (() => { const asset = heritageById.get(detailEntity.id); const detail = heritageDetailById.get(detailEntity.id); return asset && detail ? <HeritageDetail detail={detail} heritageName={asset.name} placeId={asset.placeId} onNavigate={openDetail} /> : <p className="detail-note">{t('暂无已收录遗产详情')}</p>; })()}
        {(detailEntity.type === 'polity' || detailEntity.type === 'place') && (
          <InfoPanel state={historicalState} selectedEntity={detailEntity} onYearChange={changeYear} onOpenEntity={openDetail} polityDetailMode={detailEntity.type === 'polity' ? 'drawer' : 'summary'}/>
        )}
      </EntityDrawer> : undefined}
    />
  </main>;
}

function detailTitle(entity: DetailEntity, catalog: ReturnType<typeof useHistoricalContent>['catalog']): string {
  const { people, studyEvents: detailEvents, heritage, polities, places } = catalog;
  const heritageById = new Map(heritage.map((item) => [item.id, item]));
  if (entity.type === 'person') return people.find((item) => item.id === entity.id)?.name ?? '人物详情';
  if (entity.type === 'event') return detailEvents.find((item) => item.id === entity.id)?.title ?? '事件详情';
  if (entity.type === 'heritage') return heritageById.get(entity.id)?.name ?? '遗产详情';
  if (entity.type === 'polity') return polities.find((item) => item.id === entity.id)?.name ?? '政权详情';
  return places.find((item) => item.id === entity.id)?.historicalName ?? '地点详情';
}
