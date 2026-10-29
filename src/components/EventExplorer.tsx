import { useLocale } from '../i18n/locale';
import type { HistoricalEvent } from '../domain/types';
import { useEffect, useMemo, useRef, useState } from 'react';
import { eventsAtYear, queryEvents } from '../domain/events';
import { formatHistoricalYear, yearToIndex } from '../domain/timeline';
import { contentSearchText, localizeEvents } from '../i18n/content';
import { EventDetailCard } from './EventDetailCard';
import { useHistoricalContent } from '../content/ContentContext';
export interface EventExplorerProps { items?:HistoricalEvent[]; year:number;selectedId?:string;onSelect:(event:HistoricalEvent)=>void;onYearChange:(year:number)=>void;onLocate?:(event:HistoricalEvent)=>void;groupIds?:string[];onClearGroup?:()=>void;onBackToList?:()=>void;queryValue?:string;onQueryChange?:(query:string)=>void;regionValue?:string;onRegionChange?:(region:string)=>void;categoryValue?:string;onCategoryChange?:(category:string)=>void;hideSearch?:boolean }
export function eventDate(event:HistoricalEvent){
  return `${event.datePrecision==='approximate'?'约 ':''}${formatHistoricalYear(event.year)}${event.endYear&&event.endYear!==event.year?`—${formatHistoricalYear(event.endYear)}`:''}`;
}
export function EventExplorer({items: suppliedItems,year,selectedId,onSelect,onYearChange,onLocate,groupIds,onClearGroup,onBackToList,queryValue,onQueryChange,regionValue,onRegionChange,categoryValue,onCategoryChange,hideSearch}:EventExplorerProps){
  const { locale, t } = useLocale();
  const { catalog } = useHistoricalContent();
  const items = suppliedItems ?? catalog.events;
  const [localQuery,setLocalQuery]=useState('');
  const [localRegion,setLocalRegion]=useState('');
  const [localCategory,setLocalCategory]=useState('');
  const [showFilters,setShowFilters]=useState(false);
  const [view,setView]=useState<'current'|'nearby'|'all'>('current');
  const detail=useRef<HTMLElement>(null);
  const listScrollTop=useRef(0);
  useEffect(()=>{
    const pane=detail.current?.closest('.workspace-panel-scroll');
    if(!pane)return;
    if(selectedId){ listScrollTop.current=pane.scrollTop; pane.scrollTop=0; }
    else pane.scrollTop=listScrollTop.current;
  },[selectedId]);
  const localizedItems=useMemo(()=>localizeEvents(items,locale),[items,locale]);
  const query=queryValue??localQuery;
  const setQuery=onQueryChange??setLocalQuery;
  const region=regionValue??localRegion;
  const setRegion=onRegionChange??setLocalRegion;
  const category=categoryValue??localCategory;
  const setCategory=onCategoryChange??setLocalCategory;
  const filtered=queryEvents(localizedItems,{region,category}).filter(event=>!query.trim()||contentSearchText(event).includes(query.trim().toLocaleLowerCase()));
  const searching=!!(query.trim()||region||category);
  const selected=localizedItems.find(e=>e.id===selectedId);
  const inYear=eventsAtYear(filtered,year);
  const distance=(e:HistoricalEvent)=>year<e.year?yearToIndex(e.year)-yearToIndex(year):year>(e.endYear??e.year)?yearToIndex(year)-yearToIndex(e.endYear??e.year):0;
  const listed=groupIds&&!searching?filtered.filter(e=>groupIds.includes(e.id)):searching||view==='all'?filtered:view==='current'?inYear:[...filtered].sort((a,b)=>distance(a)-distance(b)||a.year-b.year).slice(0,8);
  const filterControls=<div className="event-filters"><select aria-label={t("事件地域")} value={region} onChange={e=>setRegion(e.target.value)}><option value="">{t("全部地域")}</option><option value="china">{t("中国历史")}</option><option value="world">{t("同期世界")}</option></select>
    <select aria-label={t("事件类别")} value={category} onChange={e=>setCategory(e.target.value)}><option value="">{t("全部类别")}</option>{[...new Set(items.map(e=>e.category).filter((value): value is string=>Boolean(value)))].map(c=><option key={c} value={c}>{t(c)}</option>)}</select></div>;
  return <div className="event-explorer">
    {selected&&<EventDetailCard event={selected} year={year} onYearChange={onYearChange} onBack={onBackToList} onLocate={onLocate}/>}
    {!hideSearch&&<div className="event-search"><label>{t("查找历史转折")}<input type="search" aria-label={t("搜索历史事件")} placeholder={t("搜索事件、背景或影响")} value={query} onChange={e=>setQuery(e.target.value)}/></label>
      <button className="event-filter-toggle" type="button" aria-expanded={showFilters} onClick={()=>setShowFilters(value=>!value)}>{t(showFilters ? "收起筛选" : "筛选")}</button>
      {showFilters&&filterControls}
    </div>}
    {hideSearch&&<div className="event-filter-bar"><button className="event-filter-toggle" type="button" aria-expanded={showFilters} onClick={()=>setShowFilters(value=>!value)}>{t(showFilters ? "收起筛选" : "筛选")}</button>{showFilters&&filterControls}</div>}
    {groupIds&&!searching?<div className="event-view-tabs">{t("时间轴选中")} {listed.length} {t("个事件")} <button onClick={onClearGroup}>{t("返回全部")}</button></div>:!searching&&<div className="event-view-tabs" role="group" aria-label={t("事件时间范围")}>{(['current','nearby','all'] as const).map((v,i)=><button key={v} aria-pressed={view===v} onClick={()=>setView(v)}>{t(['本年','附近','全部'][i])}</button>)}</div>}
    <p className="event-list-caption">{t(searching?'全历史检索':groupIds?'时间轴分组 · 各条日期见下方':view==='nearby'?'附近事件 · 按时间距离排序':view==='all'?'精选事件目录':`${formatHistoricalYear(year)} · 已收录事件`)} · {listed.length} {t("条")}</p>
    {!listed.length&&<p className="detail-note">{t(searching||groupIds?'没有符合筛选条件的事件':view==='current'?'本年暂无已收录事件':'暂无已收录事件')}</p>}
    <div className="event-list">{listed.map(event=><button key={event.id} aria-pressed={selectedId===event.id} onClick={()=>onSelect(event)}><span className="event-list-date">{t(eventDate(event))}</span><strong>{event.title}</strong><small>{t(event.category??'历史转折')} · {t(event.region==='world'?'世界':'中国')}</small></button>)}</div>
    <p className="detail-note">{t("精选目录，不是完整历史年表；未收录不等于没有事件。")}</p>
  </div>;
}
