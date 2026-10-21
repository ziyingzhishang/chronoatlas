import type { HistoricalEvent } from './types';
import { yearPosition, type YearWindow } from './timeline';
export function clusterEvents(items:HistoricalEvent[],range:YearWindow,width:number) {
  const groups:{year:number;position:number;items:HistoricalEvent[]}[]=[];
  const visible=items.filter(e=>e.year<=range[1]&&(e.endYear??e.year)>=range[0]).sort((a,b)=>a.year-b.year);
  for(const event of visible){
    const year=Math.max(range[0],event.year);
    const actualWidth=Math.max(44,width);
    const center=Math.max(22,Math.min(actualWidth-22,yearPosition(year,range)/100*actualWidth));
    const position=center/actualWidth*100;
    const previous=groups.at(-1);
    if(previous&&(position-previous.position)/100*actualWidth<48) previous.items.push(event);
    else groups.push({year,position,items:[event]});
  }
  return groups;
}
