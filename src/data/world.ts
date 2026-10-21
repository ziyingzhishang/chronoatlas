import { useEffect, useState } from 'react';
import type { BoundaryState, Polity, WorldSlice } from '../domain/types';

interface PackedWorld {
  start:number; end:number; polities:Polity[];
  records:(Omit<BoundaryState,'geometry'> & {geometryIndex:number})[];
  geometries:GeoJSON.Geometry[];
}
type Status = 'off'|'loading'|'ready'|'error'|'unavailable';
const cache = new Map<number, WorldSlice>();
interface Pending { promise:Promise<WorldSlice>; controller:AbortController; consumers:number }
const pending = new Map<number, Pending>();

function acquireCentury(start:number) {
  const cached=cache.get(start);
  if(cached) {
    cache.delete(start);cache.set(start,cached);
    return {promise:Promise.resolve(cached),release:()=>{}};
  }
  let entry=pending.get(start);
  if(!entry) {
    const controller=new AbortController();
    const request=(async()=>{
    const response=await fetch(`/data/world/${start}.json`,{signal:controller.signal});
    if(!response.ok) throw Error(`World data HTTP ${response.status}`);
    const data=await response.json() as PackedWorld;
    if(data.start!==start || !Array.isArray(data.records) || !Array.isArray(data.geometries)) throw Error('Wrong world data chunk');
    const slice={start:data.start,end:data.end,polities:data.polities,boundaries:data.records.map(({geometryIndex,...b})=>{
      const geometry=data.geometries[geometryIndex];
      if(!geometry) throw Error('Missing geometry');
      return {...b,geometry};
    })};
    if(!controller.signal.aborted) {
      cache.set(start,slice);
      if(cache.size>4) cache.delete(cache.keys().next().value!);
    }
    return slice;
    })().finally(()=>{if(pending.get(start)?.controller===controller)pending.delete(start);});
    entry={promise:request,controller,consumers:0};
    pending.set(start,entry);
  }
  const held=entry;
  held.consumers++;
  return {promise:held.promise,release:()=>{
    held.consumers--;
    if(!held.consumers && pending.get(start)===held){pending.delete(start);held.controller.abort();}
  }};
}

export function useWorldSlice(year:number, enabled:boolean) {
  const century=Math.floor(year/100)*100;
  const available=year>=-3400 && year<=2024 && year!==0;
  const [attempt,setAttempt]=useState(0);
  const [result,setResult]=useState<{key:number;status:Status;slice?:WorldSlice}>({key:century,status:'off'});
  useEffect(()=>{
    if(!enabled||!available) return;
    let cancelled=false;
    setResult({key:century,status:'loading'});
    const request=acquireCentury(century);
    request.promise.then(slice=>{if(!cancelled)setResult({key:century,status:'ready',slice});})
      .catch(()=>{if(!cancelled)setResult({key:century,status:'error'});});
    return ()=>{cancelled=true;request.release();};
  },[century,enabled,available,attempt]);
  const status:Status=!enabled?'off':!available?'unavailable':result.key!==century?'loading':result.status;
  return {status,slice:status==='ready'?result.slice:undefined,retry:()=>setAttempt(n=>n+1)};
}
