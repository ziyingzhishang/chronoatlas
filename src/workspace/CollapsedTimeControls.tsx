import { TIMELINE_MAX_YEAR, formatHistoricalYear, indexToYear, yearPosition, yearToIndex, type YearWindow } from '../domain/timeline';
import { useLocale } from '../i18n/locale';
import { useEffect, useMemo, useRef } from 'react';
import { periodBands } from '../data/periods';
import { snapTimelineYear, timelineSnapCandidates } from '../domain/timeline-snap';
import { boundaryYears } from '../data/boundaries';
import { playMechanicalTick } from '../domain/mechanical-sound';

export interface CollapsedTimeControlsProps {
  year: number;
  viewWindow?: YearWindow;
  showRail?: boolean;
  isPlaying: boolean;
  onPlayToggle: () => void;
  onYearChange: (year: number) => void;
  onYearCommit?: (year:number) => void;
  rangeControlsRef?: (element: HTMLDivElement | null) => void;
}

const defaultWindow:YearWindow=[-2070,TIMELINE_MAX_YEAR];
const snapCandidates=timelineSnapCandidates();

export function CollapsedTimeControls({ year, viewWindow=defaultWindow, showRail=true, onYearChange, onYearCommit, rangeControlsRef }: CollapsedTimeControlsProps) {
  const { t } = useLocale();
  const input=useRef<HTMLInputElement>(null);
  const previewYear=useRef(year);
  const commitRef=useRef(onYearCommit);
  const audioContext=useRef<AudioContext|null>(null);
  const lastSoundNode=useRef<number|null>(null);
  const start=yearToIndex(viewWindow[0]);
  const end=yearToIndex(viewWindow[1]);
  const span=Math.max(1,end-start);
  const index = Math.max(start,Math.min(end,yearToIndex(year)));
  const position=yearPosition(indexToYear(index),viewWindow);
  const segments=useMemo(()=>periodBands.filter(period=>period.lane===0&&period.end>viewWindow[0]&&period.start<viewWindow[1]).map(period=>{
    const left=yearPosition(Math.max(viewWindow[0],period.start),viewWindow);
    const right=yearPosition(Math.min(viewWindow[1],period.end),viewWindow);
    const midpoint=(yearToIndex(Math.max(viewWindow[0],period.start))+yearToIndex(Math.min(viewWindow[1],period.end)))/2;
    const distance=Math.abs(yearToIndex(indexToYear(index))-midpoint)/span*100;
    const scale=1+Math.exp(-distance/3)*.65;
    return {...period,left,width:Math.max(0,right-left),scale};
  }),[index,span,viewWindow]);
  useEffect(()=>{previewYear.current=year;},[year]);
  commitRef.current=onYearCommit;
  useEffect(()=>{
    const element=input.current;
    if(!element)return;
    const commit=()=>commitRef.current?.(previewYear.current);
    element.addEventListener('change',commit);
    return()=>element.removeEventListener('change',commit);
  },[]);
  useEffect(()=>()=>{void audioContext.current?.close().catch(()=>{});},[]);
  function select(raw:number,width:number){
    const selected=snapTimelineYear(raw,snapCandidates,viewWindow,width||320);
    previewYear.current=selected;
    if(selected!==raw&&boundaryYears.includes(selected)){
      let soundEnabled=false;
      try{soundEnabled=localStorage.getItem('timeline-snap-sound')==='true';}catch{/* Optional preference. */}
      if(soundEnabled&&lastSoundNode.current!==selected){
        try{
          const Context=globalThis.AudioContext;
          if(Context){audioContext.current??=new Context();void audioContext.current.resume().catch(()=>{});playMechanicalTick(audioContext.current);}
        }catch{/* Sound is an optional enhancement. */}
        lastSoundNode.current=selected;
      }
    }else lastSoundNode.current=null;
    onYearChange(selected);
    return selected;
  }
  return <div className="collapsed-time-controls" role="group" aria-label={t('简明时间控制')}>
    {showRail&&<div className="collapsed-year-rail" data-year={year} style={{'--year-position':`${position}%`} as React.CSSProperties}>
      <div className="collapsed-year-segments" aria-hidden="true">
        {segments.map(period=><i key={period.id} title={t(period.name)} style={{left:`${period.left}%`,width:`${period.width}%`,backgroundColor:period.color,'--dock-scale':period.scale} as React.CSSProperties}/>) }
      </div>
      <i className="collapsed-year-cursor" aria-hidden="true"/>
      <input ref={input} className="collapsed-year-slider" type="range" min={start} max={end} step={1} value={index}
        aria-label={t('选择历史年份')} aria-valuetext={t(formatHistoricalYear(indexToYear(index)))}
        onInput={event=>select(indexToYear(Number(event.currentTarget.value)),event.currentTarget.clientWidth)}
        onPointerUp={()=>{lastSoundNode.current=null;}}
        onKeyUp={()=>{lastSoundNode.current=null;}} />
    </div>}
    {!showRail&&<div ref={rangeControlsRef} className="collapsed-range-controls" />}
  </div>;
}
