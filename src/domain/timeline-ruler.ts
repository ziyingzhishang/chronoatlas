import { indexToYear, TIMELINE_MAX_YEAR, TIMELINE_MIN_YEAR, yearToIndex, type YearWindow } from './timeline';

export interface RulerTick {
  year:number; position:number; major:boolean; local:boolean; current:boolean;
  scale:number; showLabel:boolean; labelOffset:number; labelCenter:number; labelWidth:number;
}

function niceStep(target:number):number {
  const value=Math.max(1,target);
  const base=10**Math.floor(Math.log10(value));
  return ([1,2,5,10].find(multiplier=>multiplier*base>=value) ?? 10)*base;
}

/** Readable linear ruler marks, with a continuous-year focus radius and collision-free labels. */
export function makeRulerTicks(window:YearWindow, year:number, availableWidth:number):RulerTick[] {
  const width=Math.max(1,availableWidth);
  const first=yearToIndex(window[0]), last=yearToIndex(window[1]);
  const span=Math.max(1,last-first), focus=yearToIndex(year);
  const inView=focus>=first&&focus<=last;
  const minorStep=niceStep(span*5/width), majorStep=niceStep(span*80/width);
  const localStep=niceStep(span*4/width), localLabelStep=niceStep(span*48/width);
  const candidates=new Map<number,RulerTick>();
  const labelYears=new Set<number>();
  const add=(candidate:number,major:boolean,label:boolean) => {
    if(candidate===0||candidate<window[0]||candidate>window[1])return;
    const index=yearToIndex(candidate),distance=Math.abs(index-focus);
    const local=inView&&distance<=100, current=inView&&candidate===year;
    const previous=candidates.get(candidate);
    const tick:RulerTick={year:candidate,position:(index-first)/span*100,major:major||current||!!previous?.major,
      local,current,scale:local ? 1+.8*(1-distance/100)**2 : 1,
      showLabel:false,labelOffset:0,labelCenter:0,labelWidth:0};
    candidates.set(candidate,tick);
    if(label||current)labelYears.add(candidate);
  };
  for(let y=Math.ceil(window[0]/minorStep)*minorStep;y<=window[1];y+=minorStep) add(y,y%majorStep===0,y%majorStep===0);
  if(window[0]<0&&window[1]>0)add(1,true,true);
  if(inView){
    const low=indexToYear(Math.max(first,focus-100,yearToIndex(TIMELINE_MIN_YEAR)));
    const high=indexToYear(Math.min(last,focus+100,yearToIndex(TIMELINE_MAX_YEAR)));
    for(let y=Math.ceil(low/localStep)*localStep;y<=high;y+=localStep) add(y,false,y%localLabelStep===0);
    add(year,true,true);
  }
  // Keep the selected mark first; filter adjacent marks instead of moving their time positions.
  const priority=(tick:RulerTick)=>tick.current?3:tick.major?2:tick.local?1:0;
  const marks:RulerTick[]=[];
  for(const tick of [...candidates.values()].sort((a,b)=>priority(b)-priority(a)||a.year-b.year)) {
    if(marks.every(other=>Math.abs(tick.position-other.position)*width/100>=(tick.local&&other.local?4:5)-1e-8))marks.push(tick);
  }
  const labels:RulerTick[]=[];
  for(const tick of marks.filter(t=>labelYears.has(t.year)).sort((a,b)=>priority(b)-priority(a)||a.year-b.year)){
    // Conservative widths cover both Chinese and English labels, including a larger current label.
    tick.labelWidth=Math.min(width,String(Math.abs(tick.year)).length*(tick.current?8:7)+(tick.year<0?32:24));
    const x=tick.position*width/100;
    tick.labelCenter=Math.max(tick.labelWidth/2,Math.min(width-tick.labelWidth/2,x));
    tick.labelOffset=tick.labelCenter-x;
    if(labels.every(other=>Math.abs(tick.labelCenter-other.labelCenter)>=Math.max(
      tick.major&&other.major&&!tick.current&&!other.current?80:48,(tick.labelWidth+other.labelWidth)/2+8))) {
      tick.showLabel=true;labels.push(tick);
    }
  }
  return marks.sort((a,b)=>a.year-b.year);
}
