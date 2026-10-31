import { useLocale } from '../i18n/locale';
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type SetStateAction } from 'react';
import { createPortal } from 'react-dom';
import { events } from '../data/events';
import type { HistoricalEvent } from '../domain/types';
import { clusterEvents } from '../domain/event-clusters';
import { periods, periodBands, periodAtYear, type HistoricalPeriod } from '../data/periods';
import { boundaryYears } from '../data/boundaries';
import {
  TIMELINE_MAX_YEAR, TIMELINE_MIN_YEAR, TONGJIAN_RANGE, formatHistoricalYear,
  fitWindow, indexToYear, makeTicks, yearPosition, yearToIndex, type YearWindow,
} from '../domain/timeline';
import { localizeEvents } from '../i18n/content';
import { snapTimelineYear, timelineSnapCandidates } from '../domain/timeline-snap';
import { playMechanicalTick } from '../domain/mechanical-sound';

interface TimelineProps {
  mode?: 'explore'|'analysis';
  year: number;
  onYearChange: (year: number) => void;
  onYearCommit?: (year:number)=>void;
  isPlaying: boolean;
  onPlayToggle: () => void;
  density?: 'collapsed'|'compact'|'expanded';
  showPrimaryControls?: boolean;
  rangeControlsTarget?: HTMLElement | null;
  onEventSelect?: (event:HistoricalEvent)=>void;
  onEventGroup?: (ids:string[])=>void;
  viewWindow?: YearWindow;
  onViewWindowChange?: (window:YearWindow)=>void;
  onSemanticViewChange?: (window:YearWindow,label:string)=>void;
  viewLabel?: string;
  canGoBack?: boolean;
  onBackView?: ()=>void;
}
const fullRange: YearWindow = [TIMELINE_MIN_YEAR, TIMELINE_MAX_YEAR];
const dynastyRange: YearWindow = [-2070, TIMELINE_MAX_YEAR];
export const DEFAULT_TIMELINE_WINDOW: YearWindow = dynastyRange;
const sameRange = (a: YearWindow, b: YearWindow) => a[0] === b[0] && a[1] === b[1];
const shortYear = (y: number) => y < 0 ? `前${-y}` : `公元${y}`;

export function Timeline({ year, onYearChange, onYearCommit, isPlaying, onPlayToggle, density = 'expanded', showPrimaryControls = true, rangeControlsTarget, onEventSelect, onEventGroup, viewWindow, onViewWindowChange, onSemanticViewChange, viewLabel, canGoBack, onBackView }: TimelineProps) {
  const { locale, t } = useLocale();
  const listSeparator=locale==='en' ? ', ' : '、';
  const expanded = density === 'expanded';
  const track = useRef<HTMLDivElement>(null);
  const markerTrack=useRef<HTMLDivElement>(null);
  const slider=useRef<HTMLInputElement>(null);
  const sliderSnappedYear=useRef<number|null>(null);
  const yearChangeRef=useRef(onYearChange);
  const yearCommitRef=useRef(onYearCommit);
  yearChangeRef.current=onYearChange;
  yearCommitRef.current=onYearCommit;
  const [trackWidth,setTrackWidth]=useState(600);
  const [snappedYear,setSnappedYear]=useState<number|null>(null);
  const [nodesExpanded,setNodesExpanded]=useState(false);
  const [soundEnabled,setSoundEnabled]=useState(()=>{try{return localStorage.getItem('timeline-snap-sound')==='true';}catch{return false;}});
  const [waveYear,setWaveYear]=useState<number|null>(null);
  const reducedMotion=globalThis.window.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false;
  const nodeTrack=useRef<HTMLDivElement>(null);
  const nodeToggle=useRef<HTMLButtonElement>(null);
  const nodeGroup=useRef<HTMLDivElement>(null);
  const [nodePopoverPosition,setNodePopoverPosition]=useState<{left:number;top:number;width:number;maxHeight:number}>();
  const audioContext=useRef<AudioContext|null>(null);
  const lastSoundNode=useRef<number|null>(null);
  const [localWindow, setLocalWindow] = useState<YearWindow>(dynastyRange);
  const window = viewWindow ?? localWindow;
  const [draft, setDraft] = useState(String(year));
  const [error, setError] = useState('');
  const startIndex = yearToIndex(window[0]), endIndex = yearToIndex(window[1]);
  const index = yearToIndex(year), span = endIndex - startIndex;
  const inView = index >= startIndex && index <= endIndex;
  const ticks = useMemo(() => makeTicks(window), [window]);
  const currentPeriods = periodAtYear(year);
  const previousChange = boundaryYears.filter(y=>y<year).at(-1);
  const nextChange = boundaryYears.find(y=>y>year);
  const windowChanges = [...boundaryYears].filter(y=>y>=window[0]&&y<=window[1]).sort((a,b)=>a-b);
  const nearestChange = windowChanges.reduce<number|null>((nearest,candidate)=>nearest===null||Math.abs(yearToIndex(candidate)-index)<Math.abs(yearToIndex(nearest)-index)?candidate:nearest,null);
  const localizedEvents=useMemo(()=>localizeEvents(events,locale),[locale]);
  const snapCandidates=useMemo(()=>timelineSnapCandidates(localizedEvents),[localizedEvents]);
  const clusters=useMemo(()=>clusterEvents(localizedEvents,window,trackWidth),[localizedEvents,window,trackWidth]);
  function setWindow(value: SetStateAction<YearWindow>) {
    const next = typeof value === 'function' ? value(window) : value;
    if (sameRange(next, window)) return;
    if (viewWindow === undefined) setLocalWindow(next);
    onViewWindowChange?.(next);
  }
  useEffect(()=>{
    const element=markerTrack.current??track.current;
    if(!element)return;
    const update=()=>setTrackWidth(element.clientWidth||600);
    update();const observer=new ResizeObserver(update);observer.observe(element);
    return ()=>observer.disconnect();
  },[]);
  useEffect(()=>{
    if(nearestChange===null)return;
    const active=nodeTrack.current?.querySelector<HTMLElement>(`[data-year="${nearestChange}"]`);
    const trackRect=nodeTrack.current?.getBoundingClientRect();
    const activeRect=active?.getBoundingClientRect();
    if(!trackRect||!activeRect||activeRect.left<trackRect.left||activeRect.right>trackRect.right){
      active?.scrollIntoView?.({behavior:globalThis.window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'nearest',inline:'center'});
    }
  },[nearestChange,nodesExpanded]);
  useLayoutEffect(()=>{
    if(!nodesExpanded)return;
    const reposition=()=>{
      const anchor=nodeToggle.current?.getBoundingClientRect();
      if(!anchor)return;
      const margin=8;
      const maxHeight=Math.min(globalThis.window.innerHeight*.3,320);
      const width=Math.min(380,globalThis.window.innerWidth-24);
      const left=Math.max(12,Math.min(anchor.right-width,globalThis.window.innerWidth-width-12));
      const below=globalThis.window.innerHeight-anchor.bottom-margin;
      const top=below>=Math.min(180,maxHeight)||anchor.top<maxHeight+margin
        ?Math.min(anchor.bottom+margin,globalThis.window.innerHeight-maxHeight-margin)
        :Math.max(margin,anchor.top-maxHeight-margin);
      setNodePopoverPosition(previous=>previous&&previous.left===left&&previous.top===top&&previous.width===width&&previous.maxHeight===maxHeight
        ?previous:{left,top,width,maxHeight});
    };
    reposition();
    globalThis.window.addEventListener('resize',reposition);
    document.addEventListener('scroll',reposition,true);
    return()=>{globalThis.window.removeEventListener('resize',reposition);document.removeEventListener('scroll',reposition,true);};
  },[nodesExpanded]);
  useEffect(()=>{
    if(!nodesExpanded)return;
    const closeOutside=(event:PointerEvent)=>{
      const target=event.target as Node;
      if(!nodeTrack.current?.contains(target)&&!nodeGroup.current?.contains(target))setNodesExpanded(false);
    };
    document.addEventListener('pointerdown',closeOutside);
    return()=>document.removeEventListener('pointerdown',closeOutside);
  },[nodesExpanded]);
  useEffect(()=>{try{localStorage.setItem('timeline-snap-sound',String(soundEnabled));}catch{/* Optional preference. */}},[soundEnabled]);
  useEffect(()=>()=>{void audioContext.current?.close().catch(()=>{});},[]);
  useEffect(()=>{
    const input=slider.current;
    if(!input)return;
    const commit=()=>{
      const finalYear=sliderSnappedYear.current ?? indexToYear(Number(input.value));
      sliderSnappedYear.current=null;
      yearChangeRef.current(finalYear);
      yearCommitRef.current?.(finalYear);
    };
    input.addEventListener('change',commit);
    return ()=>input.removeEventListener('change',commit);
  },[]);
  const selectEvent=(event:HistoricalEvent)=>onEventSelect?onEventSelect(event):onYearChange(event.year);

  useEffect(() => {
    setDraft(String(year));
    setError('');
  }, [year]);

  function chooseRange(range: YearWindow) {
    const label = sameRange(range, TONGJIAN_RANGE) ? '《资治通鉴》' : sameRange(range, fullRange) ? '全历史' : '王朝至今';
    onSemanticViewChange?.(range, label);
    setWindow(range);
  }
  function focusPeriod(p: Pick<HistoricalPeriod, 'start' | 'end' | 'name'>) {
    onSemanticViewChange?.([p.start, p.end], p.name);
    setWindow([p.start, p.end]);
  }
  function commitYear() {
    const next = Number(draft);
    if (draft.trim() === '' || !Number.isInteger(next)) { setError('请输入完整的整数年份；公元前使用负数。'); return; }
    if (next === 0) { setError('没有公元0年；前1年之后是公元1年。'); return; }
    if (next < TIMELINE_MIN_YEAR || next > TIMELINE_MAX_YEAR) { setError('支持前8000年至2026年。'); return; }
    setError('');
    if (next < window[0] || next > window[1]) setWindow(fitWindow(yearToIndex(next), span));
    onYearChange(next);
  }
  const displayedPeriods = periodBands.filter(p => p.start <= window[1] && p.end >= window[0]).sort((a, b) => a.start - b.start || a.lane - b.lane);
  // Allocate overlapping periods to separate rows rather than painting one over another.
  const laneEnds: number[] = [];
  const bands = displayedPeriods.map(p => {
    let lane = laneEnds.findIndex(end => end <= p.start);
    if (lane < 0) lane = laneEnds.length;
    laneEnds[lane] = p.end;
    const left = Math.max(0, yearPosition(p.start, window));
    const right = Math.min(100, yearPosition(p.end, window));
    return { ...p, lane, left, width: Math.max(.2, right - left) };
  });

  const displayedViewLabel = viewLabel ?? `${formatHistoricalYear(window[0])}—${formatHistoricalYear(window[1])}`;
  const nodeTrackContent=<div id="snapshot-node-track" className="snapshot-node-track" data-expanded={nodesExpanded} ref={nodeTrack} aria-label={t('按年份排序的资料变化年份')}
    style={nodesExpanded?{position:'fixed',left:nodePopoverPosition?.left??12,top:nodePopoverPosition?.top??12,width:nodePopoverPosition?.width??Math.min(380,globalThis.window.innerWidth-24),maxHeight:'min(30dvh, 320px)',overflowY:'auto',overflowX:'hidden',zIndex:20}:undefined}
    onKeyDown={event=>{if(event.key==='Escape'){setNodesExpanded(false);nodeToggle.current?.focus();}}}>
    {windowChanges.map(y => <button data-year={y} key={y} aria-label={t(`查看${formatHistoricalYear(y)}疆域断面`)} aria-pressed={nearestChange===y} className={nearestChange===y?'is-nearest':''} onClick={() => {onYearChange(y);setNodesExpanded(false);}}>{t(shortYear(y))}</button>)}
  </div>;
  const rangeControls=<>
    <div className="range-presets" role="group" aria-label={t("历史范围")}>
      <button aria-pressed={sameRange(window, fullRange)} onClick={() => chooseRange(fullRange)}>{t("全历史")}</button>
      <button aria-pressed={sameRange(window, dynastyRange)} onClick={() => chooseRange(dynastyRange)}>{t("王朝至今")}</button>
      <button className="tongjian-button" aria-label={t("聚焦资治通鉴 前403年至959年")} aria-pressed={sameRange(window, TONGJIAN_RANGE)} onClick={() => chooseRange(TONGJIAN_RANGE)}>{t("《资治通鉴》")}<small>{t("前403—959")}</small></button>
    </div>
    <form className="year-form" noValidate onSubmit={e => { e.preventDefault(); commitYear(); }}>
      <label className="year-entry"><span>{t("精确跳转 · 公元前填负数")}</span>
        <input aria-label={t("输入历史年份")} type="number" step="1" value={draft} min={TIMELINE_MIN_YEAR} max={TIMELINE_MAX_YEAR} aria-invalid={!!error}
          onChange={e => { setDraft(e.target.value); setError(''); }} />
      </label><button type="submit">{t("前往")}</button>
    </form>
  </>;
  return <section className={`timeline-panel density-${density}`} aria-label={t("历史时间轴")}>
    {showPrimaryControls && <div className="section-heading">
      <div>
        {expanded && showPrimaryControls && <span className="eyebrow">{t("中国历史 · 编年导航")}</span>}
        {showPrimaryControls && <div className="year-heading"><h2>{t(formatHistoricalYear(year))}</h2><span>{currentPeriods.length ? currentPeriods.map(p => t(p.name)).join(' · ') : t('历史过渡时期')}{currentPeriods.some(p => p.approximate) ? t(' / 约年分期') : ''}</span></div>}
        {expanded && <div className="timeline-view-context"><span>{t('当前视窗')}：{t(displayedViewLabel)}</span>{canGoBack && <button type="button" onClick={onBackView}>{t('返回上一级')}</button>}</div>}
      </div>
      <div className="timeline-actions">
        {showPrimaryControls && !expanded && <><button aria-label={t("上一年")} disabled={index===0} onClick={()=>onYearChange(indexToYear(index-1))}>{t("−1年")}</button><button aria-label={t("下一年")} disabled={year===TIMELINE_MAX_YEAR} onClick={()=>onYearChange(indexToYear(index+1))}>{t("＋1年")}</button></>}
        {showPrimaryControls && <button type="button" className="play-button" onClick={onPlayToggle}>{t(isPlaying ? '暂停' : '播放')}</button>}
      </div>
    </div>}
    {expanded && error && <p className="year-error" role="alert">{t(error)}</p>}
    {expanded && (rangeControlsTarget === undefined ? <div className="timeline-navigation">{rangeControls}</div> : rangeControlsTarget ? createPortal(<div className="timeline-navigation controller-range-navigation">{rangeControls}</div>,rangeControlsTarget) : null)}
    <div className="history-overview" aria-label={t("全历史概览")} hidden={!expanded}>
      {periods.filter(p => p.lane === 0).map(p => <span key={p.id} style={{ left: `${yearPosition(p.start, fullRange)}%`, width: `${yearPosition(p.end, fullRange) - yearPosition(p.start, fullRange)}%`, background: p.color }} />)}
      <button className="overview-tongjian" aria-label={t("在总览中聚焦资治通鉴")} title={t("《资治通鉴》前403—959年")} onClick={() => chooseRange(TONGJIAN_RANGE)} style={{ left: `${yearPosition(-403, fullRange)}%`, width: `${yearPosition(959, fullRange) - yearPosition(-403, fullRange)}%` }} />
      <i className="overview-window" style={{ left: `${yearPosition(window[0], fullRange)}%`, width: `${yearPosition(window[1], fullRange) - yearPosition(window[0], fullRange)}%` }} />
      <i className="overview-cursor" style={{ left: `${yearPosition(year, fullRange)}%` }} />
    </div>
    <div className="timeline-scale-heading" hidden={!expanded}>
      <span>{t(formatHistoricalYear(window[0]))} — {t(formatHistoricalYear(window[1]))}<small> {t("· 当前视窗")} {span + 1} {t("年")}</small></span>
      <div className="scale-controls">
        <button className="timeline-glyph-button pan-back" aria-label={t("时间轴向前平移")} disabled={startIndex === 0} onClick={() => setWindow(fitWindow((startIndex + endIndex) / 2 - span * .6, span))}><span aria-hidden="true">◀<i>│</i></span></button>
        <button className="timeline-glyph-button zoom-out" aria-label={t("缩小时间轴")} disabled={span >= yearToIndex(TIMELINE_MAX_YEAR)} onClick={() => setWindow(fitWindow(index, span * 2))}><span aria-hidden="true">−<i>┼</i></span></button>
        <button className="timeline-glyph-button zoom-in" aria-label={t("放大时间轴")} disabled={span <= 10} onClick={() => setWindow(fitWindow(index, Math.max(10, span / 2)))}><span aria-hidden="true">＋<i>┼</i></span></button>
        <button onClick={() => setWindow(fitWindow(index, 10))}>{t("逐年")}</button>
        <button aria-label={t("时间轴向后平移")} disabled={endIndex === yearToIndex(TIMELINE_MAX_YEAR)} onClick={() => setWindow(fitWindow((startIndex + endIndex) / 2 + span * .6, span))}>→</button>
      </div>
    </div>
    <div className="chronology-chart" ref={track} hidden={density==='collapsed'}>
      <div className="dynasty-bands" hidden={!expanded} aria-label={t("按实际时长排列的朝代")} style={{ height: `${Math.max(1, laneEnds.length) * 32}px` }}>
        {bands.map(p => <button key={p.id} className={p.start <= year && year <= p.end ? 'dynasty-band is-current' : 'dynasty-band'}
          aria-label={t(`聚焦${p.name} ${formatHistoricalYear(p.start)}至${formatHistoricalYear(p.end)}`)}
          title={t(`${p.name}${p.approximate ? '（约年）' : ''} · ${formatHistoricalYear(p.start)}—${formatHistoricalYear(p.end)}；点击放大`)}
          style={{ left: `${p.left}%`, width: `${p.width}%`, top: `${p.lane * 32}px`, background: `${p.color}55`, borderColor: p.color }}
          onClick={() => focusPeriod(p)}><span>{p.width > 2.3 ? t(p.name) : ''}</span></button>)}
      </div>
      <div className="year-ruler" aria-label={t("年份刻度")} data-wave-active={waveYear!==null}>
      {ticks.map(tick => {const distance=waveYear===null||reducedMotion?Infinity:Math.abs(yearPosition(tick.year,window)-yearPosition(waveYear,window))*trackWidth;const waveScale=waveYear===null||reducedMotion?1:1+Math.exp(-distance/70)*.55*(.65+.35*Math.cos(distance/13));return <span key={tick.year} className={tick.major ? 'year-tick major' : 'year-tick'} style={{ left: `${tick.position}%`, '--wave-scale':waveScale } as React.CSSProperties}>
          {tick.major && <span>{t(shortYear(tick.year))}</span>}
        </span>;})}
      </div>
      {inView && <div className="year-cursor" style={{ left: `${yearPosition(year, window)}%` }} aria-hidden="true"><span>◆</span></div>}
    </div>
    <input ref={slider} hidden={density==='collapsed'} className="timeline-slider" data-snapped={snappedYear!==null} type="range" min={startIndex} max={endIndex} step={1} value={Math.max(startIndex, Math.min(endIndex, index))}
      aria-label={t("选择历史年份")} aria-valuetext={t(formatHistoricalYear(inView ? year : indexToYear(Math.max(startIndex, Math.min(endIndex, index)))))}
      onInput={e=>{const raw=indexToYear(Number(e.currentTarget.value));const snapped=snapTimelineYear(raw,snapCandidates,window,e.currentTarget.clientWidth||trackWidth);sliderSnappedYear.current=snapped===raw?null:snapped;setSnappedYear(sliderSnappedYear.current);setWaveYear(snapped);if(sliderSnappedYear.current!==null&&boundaryYears.includes(snapped)){if(soundEnabled&&lastSoundNode.current!==snapped){playMechanicalTick(audioContext.current);lastSoundNode.current=snapped;}}else lastSoundNode.current=null;onYearChange(snapped);}}
      onPointerUp={()=>{setSnappedYear(null);setWaveYear(null);lastSoundNode.current=null;}} onKeyUp={()=>{setSnappedYear(null);setWaveYear(null);lastSoundNode.current=null;}} />
    <div className="timeline-bottom-line" hidden={!expanded}>
      <div className="year-steppers">
        {showPrimaryControls && <><button disabled={index === 0} onClick={() => onYearChange(indexToYear(index - 1))}>{t("上一年")}</button>
        <button disabled={year === TIMELINE_MAX_YEAR} onClick={() => onYearChange(indexToYear(index + 1))}>{t("下一年")}</button></>}
        {!inView && <><span className="timeline-out-of-view">{t("当前年份不在本视窗内")}</span><button onClick={() => setWindow(fitWindow(index, span))}>{t("回到所选年份")}</button></>}
      </div>
    </div>
    <div ref={nodeGroup} className="snapshot-nodes" aria-label={t("可用疆域断面")} data-expanded={nodesExpanded} role="group">
    <div className="snapshot-nodes-heading"><span>{t("资料变化节点")}</span><button ref={nodeToggle} type="button" className="nodes-toggle" aria-expanded={nodesExpanded} aria-controls="snapshot-node-track" aria-label={t(nodesExpanded?'收起资料变化节点':'展开资料变化节点')} onClick={()=>setNodesExpanded(value=>!value)}>{t(nodesExpanded?'收起':'展开')}</button>
      <div className="snapshot-node-navigation">
        <button disabled={previousChange===undefined} onClick={()=>previousChange!==undefined&&onYearChange(previousChange)}>{t("上一资料变化")}</button>
        <button disabled={nextChange===undefined} onClick={()=>nextChange!==undefined&&onYearChange(nextChange)}>{t("下一资料变化")}</button>
        <span>{t("色带按时长排列 · 重叠表示并立 · 点击朝代放大")}</span>
      </div>
    </div>
      {nodesExpanded&&<div className="snapshot-node-options"><button type="button" className="sound-toggle" aria-pressed={soundEnabled} aria-label={t(soundEnabled?'关闭吸附提示音':'开启吸附提示音')} onClick={()=>{setSoundEnabled(value=>{const next=!value;if(next){try{const Context=globalThis.AudioContext;if(Context){audioContext.current??=new Context();const context=audioContext.current;void context.resume().catch(()=>{});}}catch{/* Optional audio enhancement. */}}return next;})}}><span aria-hidden="true">{soundEnabled?'♫':'♪̸'}</span>{t(soundEnabled?'提示音开':'提示音关')}</button></div>}
      {nodesExpanded?createPortal(nodeTrackContent,document.body):nodeTrackContent}
      {!boundaryYears.some(y => y >= window[0] && y <= window[1]) && <small>{t("此视窗无疆域断面，可缩小时间轴查看其他资料")}</small>}
    </div>
    {onEventGroup&&<div ref={markerTrack} className="timeline-event-markers" aria-label={t("时间轴事件标记")}>{clusters.map(group=><button key={group.items[0].id} style={{left:`${group.position}%`}} title={group.items.map(e=>e.title).join(listSeparator)} aria-label={t(group.items.length===1?`事件：${group.items[0].title}`:`查看${formatHistoricalYear(group.year)}附近${group.items.length}个事件`)} onClick={()=>group.items.length===1?selectEvent(group.items[0]):onEventGroup(group.items.map(e=>e.id))}><span aria-hidden="true">◆</span>{group.items.length>1&&<small>{group.items.length}</small>}</button>)}</div>}
    <details className="timeline-events" hidden={!expanded}><summary>{t("历史转折快捷跳转")}</summary><div className="key-nodes" aria-label={t("关键历史节点")}>
      {localizedEvents.map(node => <button key={node.id} className="key-node" aria-label={t(`跳转到${node.title}`)} onClick={() => selectEvent(node)}>{node.title}<small>{t(shortYear(node.year))}</small></button>)}
    </div></details>
  </section>;
}
