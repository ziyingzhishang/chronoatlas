import { expect,test } from 'vitest';
import type { HistoricalEvent } from './types';
import { clusterEvents } from './event-clusters';
const e=(id:string,year:number,endYear?:number):HistoricalEvent=>({id,year,endYear,title:id,summary:'',sourceIds:[]});
test('nearby markers are grouped by screen space without dropping events',()=>{
  const groups=clusterEvents([e('a',100),e('b',101),e('c',200)], [100,200], 300);
  expect(groups.map(g=>g.items.map(i=>i.id))).toEqual([['a','b'],['c']]);
});
test('clustering uses the final edge-inset button positions so hit areas do not overlap',()=>{
  const groups=clusterEvents([e('edge',100),e('near',114),e('middle',150),e('end',200)],[100,200],344);
  expect(groups.map(g=>g.items.map(i=>i.id))).toEqual([['edge','near'],['middle'],['end']]);
  expect(groups[0].position*344/100).toBeCloseTo(22);
  expect(groups.at(-1)!.position*344/100).toBeCloseTo(322);
});
test('ongoing events appear at the start of a window and out-of-window events are excluded',()=>{
  expect(clusterEvents([e('ongoing',755,763),e('old',700)], [760,770],400).map(g=>({year:g.year,ids:g.items.map(e=>e.id)}))).toEqual([{year:760,ids:['ongoing']}]);
});
