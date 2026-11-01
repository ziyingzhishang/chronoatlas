import { useLocale } from '../i18n/locale';
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type SetStateAction } from 'react';
import { createPortal } from 'react-dom';
import type { HistoricalEvent } from '../domain/types';
import { clusterEvents } from '../domain/event-clusters';
import { useHistoricalContent } from '../content/ContentContext';
export interface HistoricalPeriod { id:string; name:string; start:number; end:number; color:string; lane:number; approximate?:boolean; intervals?:readonly (readonly [number,number])[]; }
import {
  TIMELINE_MAX_YEAR, TIMELINE_MIN_YEAR, TONGJIAN_RANGE, formatHistoricalYear,
  fitWindow, indexToYear, yearPosition, yearToIndex, type YearWindow,
} from '../domain/timeline';
import { localizeEvents } from '../i18n/content';
import { makeRulerTicks } from '../domain/timeline-ruler';
import { snapTimelineYear, timelineSnapCandidates } from '../domain/timeline-snap';
import { alignedSourceScroll, sliderThumbCenter } from './timeline-alignment';

export interface TimelineProps {
  annotationLayer?: 'none'|'events'|'changes';
  mode?: 'explore'|'analysis';
  year: number;
  onYearChange: (year: number) => void;
  onYearCommit?: (year:number)=>void;
  isPlaying?: boolean;
  onPlayToggle?: () => void;
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
export const FULL_TIMELINE_WINDOW: YearWindow = [TIMELINE_MIN_YEAR, TIMELINE_MAX_YEAR];
const fullRange: YearWindow = [TIMELINE_MIN_YEAR, TIMELINE_MAX_YEAR];
const dynastyRange: YearWindow = [-2070, TIMELINE_MAX_YEAR];
export const DEFAULT_TIMELINE_WINDOW: YearWindow = dynastyRange;
const sameRange = (a: YearWindow, b: YearWindow) => a[0] === b[0] && a[1] === b[1];
const shortYear = (y: number) => y < 0 ? `前${-y}` : `公元${y}`;

export function Timeline({ year, onYearChange, onYearCommit, isPlaying, onPlayToggle, density = 'expanded', showPrimaryControls = true, rangeControlsTarget, annotationLayer, onEventSelect, onEventGroup, viewWindow, onViewWindowChange, onSemanticViewChange, viewLabel, canGoBack, onBackView }: TimelineProps) {
  const { locale, t } = useLocale();
  const { catalog, historySource } = useHistoricalContent();
  const events = catalog.events;
  const periods: readonly HistoricalPeriod[] = catalog.periods;
  const periodBands = useMemo(() => periods.flatMap(period => (period.intervals ?? [[period.start, period.end]]).map(([start, end], index) => ({
    ...period,
    id: period.intervals ? `${period.id}-${index}` : period.id,
    start,
    end,
  }))), [periods]);
  const boundaryYears = useMemo(() => [...new Set(historySource.boundaries.flatMap(boundary => boundary.temporalKind === 'interval'
    ? [boundary.validFrom, boundary.validTo === -1 ? 1 : boundary.validTo + 1]
    : [boundary.snapshotYear]))].filter(candidate => candidate <= TIMELINE_MAX_YEAR && candidate !== 0).sort((a, b) => a - b), [historySource]);
  const periodAtYear = (target: number) => periodBands.filter(period => period.start <= target && target <= period.end);
  const root = useRef<HTMLElement>(null);
  const yearEntryFocused = useRef(false);
  const [controllerSize, setControllerSize] = useState<{width:number;height:number}|null>(null);
  const hideYearEntry = controllerSize !== null && controllerSize.width < 600;
  const hideSupplementary = controllerSize !== null && (globalThis.window.innerHeight < 700 || controllerSize.height < 400);
  useLayoutEffect(() => {
    const controller = root.current?.closest<HTMLElement>('.time-controller');
    if (!controller) return;
    const measure = () => {
      const rect = controller.getBoundingClientRect();
      const width = controller.clientWidth || rect.width;
      const height = rect.height;
      // Hidden or detached controllers have no usable layout to classify.
      if (width <= 0 || height <= 0) return;
      const active = document.activeElement;
      const form = controller.querySelector('.controller-range-navigation .year-form') ?? root.current?.querySelector('.year-form');
      if (width < 600 && (yearEntryFocused.current || (active && form?.contains(active)))) {
        (controller.querySelector<HTMLButtonElement>('.range-presets button[aria-pressed="true"]') ?? controller.querySelector<HTMLButtonElement>('.range-presets button'))?.focus();
        yearEntryFocused.current = false;
      }
      setControllerSize(previous => previous?.width === width && previous?.height === height ? previous : {width,height});
    };
    const clearYearFocus = (event: PointerEvent) => { if (!(event.target instanceof Element && event.target.closest('.year-form'))) yearEntryFocused.current = false; };
    document.addEventListener('pointerdown', clearYearFocus);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(controller);
    globalThis.window.addEventListener('resize', measure);
    return () => { observer.disconnect(); globalThis.window.removeEventListener('resize', measure); document.removeEventListener('pointerdown', clearYearFocus); };
  }, []);
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
  const [previewYear,setPreviewYear]=useState<number|null>(null);
  const [rulerWidth,setRulerWidth]=useState(600);
  const ruler=useRef<HTMLDivElement>(null);
  const focusYear=previewYear ?? year;
  const nodeTrack=useRef<HTMLDivElement>(null);
  const sourceDescriptionId = useId();
  const [localWindow, setLocalWindow] = useState<YearWindow>(dynastyRange);
  const window = viewWindow ?? localWindow;
  const [draft, setDraft] = useState(String(year));
  const [error, setError] = useState('');
  const startIndex = yearToIndex(window[0]), endIndex = yearToIndex(window[1]);
  const index = yearToIndex(year), span = endIndex - startIndex;
  const inView = index >= startIndex && index <= endIndex;
  const ticks = useMemo(() => makeRulerTicks(window,focusYear,rulerWidth), [window,focusYear,rulerWidth]);
  const currentPeriods = periodAtYear(year);
  const windowChanges = [...boundaryYears].filter(y=>y>=window[0]&&y<=window[1]).sort((a,b)=>a-b);
  const nearestChange = windowChanges.reduce<number|null>((nearest,candidate)=>nearest===null||Math.abs(yearToIndex(candidate)-index)<Math.abs(yearToIndex(nearest)-index)?candidate:nearest,null);
  const localizedEvents=useMemo(()=>localizeEvents(events,locale),[locale]);
  const snapCandidates=useMemo(()=>timelineSnapCandidates(periodBands, boundaryYears, localizedEvents),[localizedEvents, periodBands, boundaryYears]);
  const clusters=useMemo(()=>clusterEvents(localizedEvents,window,trackWidth),[localizedEvents,window,trackWidth]);
  function setWindow(value: SetStateAction<YearWindow>) {
    const next = typeof value === 'function' ? value(window) : value;
    if (sameRange(next, window)) return;
    if (viewWindow === undefined) setLocalWindow(next);
    onViewWindowChange?.(next);
  }
  useEffect(()=>{
    const element=markerTrack.current??track.current;
    if(!element||!ruler.current)return;
    const update=()=>{
      setTrackWidth(element.clientWidth||600);
      setRulerWidth(ruler.current?.clientWidth||600);
    };
    update();const observer=new ResizeObserver(update);
    observer.observe(element);observer.observe(ruler.current);
    return()=>observer.disconnect();
  },[annotationLayer]);
  useLayoutEffect(() => {
    const row = nodeTrack.current;
    const input = slider.current;
    const button = row?.querySelector<HTMLElement>(`button[data-year="${nearestChange}"]`);
    if (!row || !input || !button || nearestChange === null || hideSupplementary) return;
    let frame:number|undefined;
    let timer:ReturnType<typeof setTimeout>|undefined;
    let dragging = false;
    const align = () => {
      if (dragging || row.clientWidth <= 0) return;
      const focused = document.activeElement;
      if (focused && row.contains(focused) && focused !== button) return;
      row.style.setProperty('--source-edge-space', `${row.clientWidth}px`);
      const css = getComputedStyle(input);
      const rect = input.getBoundingClientRect();
      const center = sliderThumbCenter(Number(input.value), Number(input.min), Number(input.max),
        rect.left+(parseFloat(css.borderLeftWidth)||0), input.clientWidth,
        parseFloat(css.paddingLeft)||0, parseFloat(css.paddingRight)||0,
        parseFloat(css.getPropertyValue('--timeline-thumb-size'))||20);
      const active = button.getBoundingClientRect();
      const next = alignedSourceScroll(row.scrollLeft,active.left+active.width/2,center,row.scrollWidth-row.clientWidth);
      if (Math.abs(next-row.scrollLeft) > .25) row.scrollLeft = next;
    };
    const schedule = () => {
      if (frame !== undefined) return;
      frame = requestAnimationFrame(() => { frame=undefined; align(); });
    };
    const settle = () => { clearTimeout(timer); timer=setTimeout(schedule,150); };
    const begin = () => { dragging=true; clearTimeout(timer); };
    const end = () => { if (dragging) { dragging=false; settle(); } };
    row.addEventListener('scroll',settle,{passive:true});
    row.addEventListener('pointerdown',begin);
    row.addEventListener('focusout',schedule);
    globalThis.window.addEventListener('pointerup',end);
    globalThis.window.addEventListener('pointercancel',end);
    const observer = new ResizeObserver(schedule);
    observer.observe(row); observer.observe(input); observer.observe(button);
    schedule();
    return () => {
      observer.disconnect(); clearTimeout(timer);
      if (frame !== undefined) cancelAnimationFrame(frame);
      row.removeEventListener('scroll',settle); row.removeEventListener('pointerdown',begin); row.removeEventListener('focusout',schedule);
      globalThis.window.removeEventListener('pointerup',end); globalThis.window.removeEventListener('pointercancel',end);
    };
  }, [year,nearestChange,hideSupplementary,window[0],window[1],locale,annotationLayer]);
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
    setPreviewYear(null);
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
  const nodeTrackContent=<div id="snapshot-node-track" className="snapshot-node-track" ref={nodeTrack} aria-label={t('按年份排序的资料变化年份')}>
    {windowChanges.map(y => <button data-year={y} key={y} aria-label={t(`查看${formatHistoricalYear(y)}疆域断面`)} aria-pressed={nearestChange===y} aria-describedby={nearestChange===y && y!==year ? sourceDescriptionId : undefined} className={nearestChange===y?'is-nearest':''} onClick={() => onYearChange(y)}>{t(shortYear(y))}</button>)}
  </div>;
  const yearForm = <form className="year-form" hidden={hideYearEntry} onFocusCapture={() => { yearEntryFocused.current = true; }} onBlurCapture={event => { if (event.relatedTarget) yearEntryFocused.current = event.currentTarget.contains(event.relatedTarget as Node); }} noValidate onSubmit={e => { e.preventDefault(); commitYear(); }}>
      <label className="year-entry"><span>{t("精确跳转 · 公元前填负数")}</span>
        <input aria-label={t("输入历史年份")} type="number" step="1" value={draft} min={TIMELINE_MIN_YEAR} max={TIMELINE_MAX_YEAR} aria-invalid={!!error}
          onChange={e => { setDraft(e.target.value); setError(''); }} />
      </label><button type="submit">{t("前往")}</button>
    </form>;
  const rangeControls=<>
    <div className="range-presets" role="group" aria-label={t("历史范围")}>
      <button aria-pressed={sameRange(window, fullRange)} onClick={() => chooseRange(fullRange)}>{t("全历史")}</button>
      <button aria-pressed={sameRange(window, dynastyRange)} onClick={() => chooseRange(dynastyRange)}>{t("王朝至今")}</button>
      <button className="tongjian-button" aria-label={t("聚焦资治通鉴 前403年至959年")} aria-pressed={sameRange(window, TONGJIAN_RANGE)} onClick={() => chooseRange(TONGJIAN_RANGE)}>{t("《资治通鉴》")}<small>{t("前403—959")}</small></button>
    </div>
    {yearForm}
  </>;
  return <section ref={root} className={`timeline-panel density-${density}`} aria-label={t("历史时间轴")}>
    <div className="timeline-scroll-body"><div className="timeline-main-content">
    {annotationLayer === undefined && showPrimaryControls && <div className="section-heading">
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
    {expanded && annotationLayer === undefined && (rangeControlsTarget === undefined ? <div className="timeline-navigation">{rangeControls}</div> : rangeControlsTarget ? createPortal(<div className="timeline-navigation controller-range-navigation">{rangeControls}</div>,rangeControlsTarget) : null)}
    {annotationLayer !== undefined && <div className="timeline-analysis-tools">{yearForm}</div>}
    <div className="history-overview" aria-label={t("全历史概览")} hidden={!expanded}>
      {periods.filter(p => p.lane === 0).map(p => <span key={p.id} style={{ left: `${yearPosition(p.start, fullRange)}%`, width: `${yearPosition(p.end, fullRange) - yearPosition(p.start, fullRange)}%`, background: p.color }} />)}
      <button className="overview-tongjian" aria-label={t("在总览中聚焦资治通鉴")} title={t("《资治通鉴》前403—959年")} onClick={() => chooseRange(TONGJIAN_RANGE)} style={{ left: `${yearPosition(-403, fullRange)}%`, width: `${yearPosition(959, fullRange) - yearPosition(-403, fullRange)}%` }} />
      <i className="overview-window" style={{ left: `${yearPosition(window[0], fullRange)}%`, width: `${yearPosition(window[1], fullRange) - yearPosition(window[0], fullRange)}%` }} />
      <i className="overview-cursor" style={{ left: `${yearPosition(year, fullRange)}%` }} />
    </div>
    <div className="timeline-scale-heading" hidden={!expanded}>
      <span>{t(formatHistoricalYear(window[0]))} — {t(formatHistoricalYear(window[1]))}{annotationLayer === undefined && <small> {t("· 当前视窗")} {span + 1} {t("年")}</small>}</span>
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
      <div ref={ruler} className="year-ruler" aria-label={t("年份刻度")} data-focus-year={focusYear}>
      {ticks.map(tick => <span key={tick.year} data-year={tick.year} data-local={tick.local} className={`year-tick${tick.major?' major':''}${tick.current?' is-current':''}`} style={{left:`${tick.position}%`,'--tick-scale':tick.scale} as React.CSSProperties}>
        {tick.showLabel && <span className="year-tick-label" style={{left:`${tick.labelOffset}px`}}>{t(shortYear(tick.year))}</span>}
      </span>)}
      </div>
      {inView && <div className="year-cursor" style={{ left: `${yearPosition(year, window)}%` }} aria-hidden="true"><span>◆</span></div>}
    </div>
    <div className="timeline-bottom-line" hidden={!expanded}>
      <div className="year-steppers">
        {showPrimaryControls && <><button disabled={index === 0} onClick={() => onYearChange(indexToYear(index - 1))}>{t("上一年")}</button>
        <button disabled={year === TIMELINE_MAX_YEAR} onClick={() => onYearChange(indexToYear(index + 1))}>{t("下一年")}</button></>}
        {!inView && <><span className="timeline-out-of-view">{t("当前年份不在本视窗内")}</span><button onClick={() => setWindow(fitWindow(index, span))}>{t("回到所选年份")}</button></>}
      </div>
    </div>
    {(annotationLayer === 'events' || (annotationLayer === undefined && onEventGroup))&&<div ref={markerTrack} className="timeline-event-markers" aria-label={t("时间轴事件标记")}>{clusters.map(group=><button key={group.items[0].id} style={{left:`${group.position}%`}} title={group.items.map(e=>e.title).join(listSeparator)} aria-label={t(group.items.length===1?`事件：${group.items[0].title}`:`查看${formatHistoricalYear(group.year)}附近${group.items.length}个事件`)} onClick={()=>group.items.length===1?selectEvent(group.items[0]):onEventGroup?.(group.items.map(e=>e.id))}><span aria-hidden="true">◆</span>{group.items.length>1&&<small>{group.items.length}</small>}</button>)}</div>}

    </div></div>
    <div className="timeline-bottom-controls">
    {!hideSupplementary && (annotationLayer === undefined || annotationLayer === 'changes') && <div className="snapshot-nodes" aria-label={t("可用疆域断面")} role="group">
      {nearestChange !== null && nearestChange !== year && <small id={sourceDescriptionId} className="snapshot-nearest-note">{t('最近资料')}{locale==='en' ? ': ' : '：'}{t(formatHistoricalYear(nearestChange))}</small>}
      {nodeTrackContent}
      {!boundaryYears.some(y => y >= window[0] && y <= window[1]) && <small>{t("此视窗无疆域断面，可缩小时间轴查看其他资料")}</small>}
    </div>}
    <input ref={slider} hidden={density==='collapsed'} className="timeline-slider" data-snapped={snappedYear!==null} type="range" min={startIndex} max={endIndex} step={1} value={Math.max(startIndex, Math.min(endIndex, index))}
      aria-label={t("选择历史年份")} aria-valuetext={t(formatHistoricalYear(inView ? year : indexToYear(Math.max(startIndex, Math.min(endIndex, index)))))}
      onInput={e=>{const raw=indexToYear(Number(e.currentTarget.value));const snapped=snapTimelineYear(raw,snapCandidates,window,e.currentTarget.clientWidth||trackWidth);sliderSnappedYear.current=snapped===raw?null:snapped;setSnappedYear(sliderSnappedYear.current);setPreviewYear(snapped);onYearChange(snapped);}}
      onPointerUp={()=>{setSnappedYear(null);setPreviewYear(null);}} onKeyUp={()=>{setSnappedYear(null);setPreviewYear(null);}} />
    </div>
  </section>;
}
