import { expect,test } from 'vitest';
import { makeRulerTicks } from './timeline-ruler';

test('keeps linear positions while enhancing the selected year and fading at 100 years',()=>{
  const ticks=makeRulerTicks([1,1001],500,400);
  expect(ticks.find(t=>t.year===500)).toMatchObject({position:49.9,current:true,scale:1.8,showLabel:true});
  expect(ticks.find(t=>t.year===400)?.scale).toBe(1);
  expect(ticks.find(t=>t.year===600)?.scale).toBe(1);
  expect(ticks.find(t=>t.year===450)?.scale).toBeCloseTo(1.2);
  expect(ticks.some(t=>t.year===350)).toBe(false);
});

test.each([320,1200])('keeps marks readable and prioritizes the current label at width %s',width=>{
  const ticks=makeRulerTicks([-2070,2026],-291,width);
  expect(ticks.some(t=>t.current&&t.showLabel)).toBe(true);
  for(let i=1;i<ticks.length;i++) expect((ticks[i].position-ticks[i-1].position)*width/100).toBeGreaterThanOrEqual(4-1e-8);
  const labels=ticks.filter(t=>t.showLabel).sort((a,b)=>a.labelCenter-b.labelCenter);
  for(const t of labels){expect(t.labelCenter-t.labelWidth/2).toBeGreaterThanOrEqual(0);expect(t.labelCenter+t.labelWidth/2).toBeLessThanOrEqual(width);}
  for(let i=1;i<labels.length;i++) expect(labels[i].labelCenter-labels[i-1].labelCenter).toBeGreaterThanOrEqual(48);
});

test('uses available width to add detail instead of stretching time positions',()=>{
  expect(makeRulerTicks([-2070,2026],800,1200).length).toBeGreaterThan(makeRulerTicks([-2070,2026],800,320).length);
});

test('counts a continuous 100-year radius across BCE and CE without year zero',()=>{
  const ticks=makeRulerTicks([-150,150],-1,1200);
  expect(ticks.some(t=>t.year===0)).toBe(false);
  expect(ticks.find(t=>t.year===-101)).toMatchObject({local:true,scale:1});
  expect(ticks.find(t=>t.year===100)).toMatchObject({local:true,scale:1});
  expect(ticks.find(t=>t.year===-1)).toMatchObject({current:true,scale:1.8});
});

test('does not enhance an out-of-view year or generate ticks beyond domain ends',()=>{
  const ordinary=makeRulerTicks([600,900],500,800);
  expect(ordinary.length).toBeGreaterThan(0);
  expect(ordinary.every(t=>!t.current&&t.scale===1)).toBe(true);
  for(const year of [-8000,2026]){
    const ticks=makeRulerTicks([-8000,2026],year,1200);
    expect(ticks.some(t=>t.year===year&&t.current&&t.showLabel)).toBe(true);
    expect(ticks.every(t=>t.year>=-8000&&t.year<=2026&&t.year!==0)).toBe(true);
  }
});
