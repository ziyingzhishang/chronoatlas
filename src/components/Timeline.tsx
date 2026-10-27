import { useLocale } from '../i18n/locale';
import { useEffect, useMemo, useRef, useState, type SetStateAction } from 'react';
import type { HistoricalEvent } from '../domain/types';
import { clusterEvents } from '../domain/event-clusters';
import {
  TIMELINE_MAX_YEAR, TIMELINE_MIN_YEAR, TONGJIAN_RANGE, formatHistoricalYear,
  fitWindow, indexToYear, makeTicks, yearPosition, yearToIndex, type YearWindow,
} from '../domain/timeline';
import { localizeEvents } from '../i18n/content';
import { useHistoricalContent } from '../content/ContentContext';
import type { TimelineAnnotationLayer } from '../workspace/time-navigation-state';

export interface HistoricalPeriod {
  id: string;
  name: string;
  start: number;
  end: number;
  color: string;
  lane: number;
  approximate?: boolean;
  intervals?: readonly (readonly [number, number])[];
}

export interface TimelineProps {
  year: number;
  onYearChange: (year: number) => void;
  onYearCommit?: (year:number)=>void;
  annotationLayer?: TimelineAnnotationLayer;
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
const dynastyRange: YearWindow = [-2070, TIMELINE_MAX_YEAR];
export const DEFAULT_TIMELINE_WINDOW: YearWindow = dynastyRange;
const sameRange = (a: YearWindow, b: YearWindow) => a[0] === b[0] && a[1] === b[1];
const shortYear = (y: number) => y < 0 ? `前${-y}` : `公元${y}`;

export function Timeline({ year, onYearChange, onYearCommit, annotationLayer = 'none', onEventSelect, onEventGroup, viewWindow, onViewWindowChange, onSemanticViewChange }: TimelineProps) {
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
  const listSeparator=locale==='en' ? ', ' : '、';
  const track = useRef<HTMLDivElement>(null);
  const markerTrack=useRef<HTMLDivElement>(null);
  const slider=useRef<HTMLInputElement>(null);
  const yearChangeRef=useRef(onYearChange);
  const yearCommitRef=useRef(onYearCommit);
  yearChangeRef.current=onYearChange;
  yearCommitRef.current=onYearCommit;
  const [trackWidth,setTrackWidth]=useState(600);
  const [localWindow, setLocalWindow] = useState<YearWindow>(dynastyRange);
  const window = viewWindow ?? localWindow;
  const [draft, setDraft] = useState(String(year));
  const [error, setError] = useState('');
  const startIndex = yearToIndex(window[0]), endIndex = yearToIndex(window[1]);
  const index = yearToIndex(year), span = endIndex - startIndex;
  const inView = index >= startIndex && index <= endIndex;
  const ticks = useMemo(() => makeTicks(window), [window]);
  const windowChanges = boundaryYears.filter(y=>y>=window[0]&&y<=window[1]);
  const nearbyChanges = [...windowChanges].sort((a,b)=>Math.abs(a-year)-Math.abs(b-year)).slice(0,20).sort((a,b)=>a-b);
  const localizedEvents=useMemo(()=>localizeEvents(events,locale),[locale]);
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
    const input=slider.current;
    if(!input)return;
    const commit=()=>{
      const finalYear=indexToYear(Number(input.value));
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
    const label = sameRange(range, TONGJIAN_RANGE) ? '《资治通鉴》' : sameRange(range, FULL_TIMELINE_WINDOW) ? '全历史' : '王朝至今';
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

  return <section className="timeline-panel" aria-label={t("历史时间轴")}>
      <div className="timeline-analysis-tools">
        <form className="year-form" noValidate onSubmit={e => { e.preventDefault(); commitYear(); }}>
          <label className="year-entry"><span>{t("精确跳转 · 公元前填负数")}</span>
            <input aria-label={t("输入历史年份")} type="number" step="1" value={draft} min={TIMELINE_MIN_YEAR} max={TIMELINE_MAX_YEAR} aria-invalid={!!error}
              onChange={e => { setDraft(e.target.value); setError(''); }} />
          </label><button type="submit">{t("前往")}</button>
        </form>
      </div>
    {error && <p className="year-error" role="alert">{t(error)}</p>}
    <div className="history-overview" aria-label={t("全历史概览")}>
      {periods.filter(p => p.lane === 0).map(p => <span key={p.id} style={{ left: `${yearPosition(p.start, FULL_TIMELINE_WINDOW)}%`, width: `${yearPosition(p.end, FULL_TIMELINE_WINDOW) - yearPosition(p.start, FULL_TIMELINE_WINDOW)}%`, background: p.color }} />)}
      <button className="overview-tongjian" aria-label={t("在总览中聚焦资治通鉴")} title={t("《资治通鉴》前403—959年")} onClick={() => chooseRange(TONGJIAN_RANGE)} style={{ left: `${yearPosition(-403, FULL_TIMELINE_WINDOW)}%`, width: `${yearPosition(959, FULL_TIMELINE_WINDOW) - yearPosition(-403, FULL_TIMELINE_WINDOW)}%` }} />
      <i className="overview-window" style={{ left: `${yearPosition(window[0], FULL_TIMELINE_WINDOW)}%`, width: `${yearPosition(window[1], FULL_TIMELINE_WINDOW) - yearPosition(window[0], FULL_TIMELINE_WINDOW)}%` }} />
      <i className="overview-cursor" style={{ left: `${yearPosition(year, FULL_TIMELINE_WINDOW)}%` }} />
    </div>
    <div className="timeline-scale-heading">
      <span>{t(formatHistoricalYear(window[0]))} — {t(formatHistoricalYear(window[1]))}<small> {span + 1} {t("年")}</small></span>
      <div className="scale-controls">
        <button aria-label={t("时间轴向前平移")} disabled={startIndex === 0} onClick={() => setWindow(fitWindow((startIndex + endIndex) / 2 - span * .6, span))}>←</button>
        <button aria-label={t("缩小时间轴")} disabled={span >= yearToIndex(TIMELINE_MAX_YEAR)} onClick={() => setWindow(fitWindow(index, span * 2))}>−</button>
        <button aria-label={t("放大时间轴")} disabled={span <= 10} onClick={() => setWindow(fitWindow(index, Math.max(10, span / 2)))}>＋</button>
        <button onClick={() => setWindow(fitWindow(index, 10))}>{t("逐年")}</button>
        <button aria-label={t("时间轴向后平移")} disabled={endIndex === yearToIndex(TIMELINE_MAX_YEAR)} onClick={() => setWindow(fitWindow((startIndex + endIndex) / 2 + span * .6, span))}>→</button>
      </div>
    </div>
    <div className="chronology-chart" ref={track}>
      <div className="dynasty-bands" aria-label={t("按实际时长排列的朝代")} style={{ height: `${Math.max(1, laneEnds.length) * 32}px` }}>
        {bands.map(p => <button key={p.id} className={p.start <= year && year <= p.end ? 'dynasty-band is-current' : 'dynasty-band'}
          aria-label={t(`聚焦${p.name} ${formatHistoricalYear(p.start)}至${formatHistoricalYear(p.end)}`)}
          title={t(`${p.name}${p.approximate ? '（约年）' : ''} · ${formatHistoricalYear(p.start)}—${formatHistoricalYear(p.end)}；点击放大`)}
          style={{ left: `${p.left}%`, width: `${p.width}%`, top: `${p.lane * 32}px`, background: `${p.color}55`, borderColor: p.color }}
          onClick={() => focusPeriod(p)}><span>{p.width > 2.3 ? t(p.name) : ''}</span></button>)}
      </div>
      <div className="year-ruler" aria-label={t("年份刻度")}>
        {ticks.map(tick => <span key={tick.year} className={tick.major ? 'year-tick major' : 'year-tick'} style={{ left: `${tick.position}%` }}>
          {tick.major && <span>{t(shortYear(tick.year))}</span>}
        </span>)}
      </div>
      {inView && <div className="year-cursor" style={{ left: `${yearPosition(year, window)}%` }} aria-hidden="true"><span>◆</span></div>}
    </div>
    <input ref={slider} className="timeline-slider" type="range" min={startIndex} max={endIndex} step={1} value={Math.max(startIndex, Math.min(endIndex, index))}
      aria-label={t("选择历史年份")} aria-valuetext={t(formatHistoricalYear(inView ? year : indexToYear(Math.max(startIndex, Math.min(endIndex, index)))))}
      onInput={e=>onYearChange(indexToYear(Number(e.currentTarget.value)))} />
    <div className="timeline-bottom-line">
      <div className="year-steppers">
        {!inView && <><span className="timeline-out-of-view">{t("当前年份不在本视窗内")}</span><button onClick={() => setWindow(fitWindow(index, span))}>{t("回到所选年份")}</button></>}
      </div>
      <span>{t("色带按时长排列 · 重叠表示并立 · 点击朝代放大")}</span>
    </div>
    {annotationLayer === 'changes' && <div className="snapshot-nodes" aria-label={t("可用疆域断面")}>
      <span>{t("资料变化节点")}</span>
      {nearbyChanges.map(y => <button key={y} aria-label={t(`查看${formatHistoricalYear(y)}疆域断面`)} aria-pressed={year === y} onClick={() => onYearChange(y)}>{t(shortYear(y))}</button>)}
      {windowChanges.length>20 && <small>{t("显示所选年前后20个节点 / 本视窗共")}{windowChanges.length}{t("个；可用“上一/下一资料变化”继续比较")}</small>}
      {!boundaryYears.some(y => y >= window[0] && y <= window[1]) && <small>{t("此视窗无疆域断面，可缩小时间轴查看其他资料")}</small>}
    </div>}
    {annotationLayer === 'events' && <div ref={markerTrack} className="timeline-event-markers" aria-label={t("时间轴事件标记")}>{clusters.map(group=><button key={group.items[0].id} style={{left:`${group.position}%`}} title={group.items.map(e=>e.title).join(listSeparator)} aria-label={t(group.items.length===1?`事件：${group.items[0].title}`:`查看${formatHistoricalYear(group.year)}附近${group.items.length}个事件`)} onClick={()=>group.items.length===1?selectEvent(group.items[0]):onEventGroup?onEventGroup(group.items.map(e=>e.id)):onYearChange(group.year)}><span aria-hidden="true">◆</span>{group.items.length>1&&<small>{group.items.length}</small>}</button>)}</div>}
  </section>;
}
