import { useEffect, useState } from 'react';
import type { ReleaseFile, ReleaseManifest } from '../content/release-types';
import type { BoundaryState, Polity, WorldSlice } from '../domain/types';
import { verifySha256 } from '../offline/hash';
import { publicAssetUrl } from '../runtime/asset-url';

interface PackedWorld {
  start:number; end:number; polities:Polity[];
  records:(Omit<BoundaryState,'geometry'> & {geometryIndex:number})[];
  geometries:GeoJSON.Geometry[];
}
type Status = 'off'|'loading'|'ready'|'error'|'unavailable';
const cache = new Map<string, WorldSlice>();
interface Pending { promise:Promise<WorldSlice>; controller:AbortController; consumers:number }
const pending = new Map<string, Pending>();

interface WorldRequest { key:string; start:number; file?:ReleaseFile }

function acquireCentury({key,start,file}:WorldRequest) {
  const cached=cache.get(key);
  if(cached) {
    cache.delete(key);cache.set(key,cached);
    return {promise:Promise.resolve(cached),release:()=>{}};
  }
  let entry=pending.get(key);
  if(!entry) {
    const controller=new AbortController();
    const request=(async()=>{
      const uri=file?.uri ?? `data/world/${start}.json`;
      const response=await fetch(publicAssetUrl(uri),{signal:controller.signal});
      if(!response.ok) throw Error(`World data HTTP ${response.status}`);
      let data:PackedWorld;
      if(file) {
        const bytes=new Uint8Array(await response.arrayBuffer());
        if(bytes.byteLength!==file.bytes) throw Error(`World data byte length mismatch for ${uri}`);
        await verifySha256(bytes,file.sha256);
        data=JSON.parse(new TextDecoder().decode(bytes)) as PackedWorld;
      } else data=await response.json() as PackedWorld;
      if(data.start!==start || !Array.isArray(data.records) || !Array.isArray(data.geometries)) throw Error('Wrong world data chunk');
      const slice={start:data.start,end:data.end,polities:data.polities,boundaries:data.records.map(({geometryIndex,...boundary})=>{
        const geometry=data.geometries[geometryIndex];
        if(!geometry) throw Error('Missing geometry');
        return {...boundary,geometry};
      })};
      if(!controller.signal.aborted) {
        cache.set(key,slice);
        if(cache.size>4) cache.delete(cache.keys().next().value!);
      }
      return slice;
    })().finally(()=>{if(pending.get(key)?.controller===controller)pending.delete(key);});
    entry={promise:request,controller,consumers:0};
    pending.set(key,entry);
  }
  const held=entry;
  held.consumers++;
  return {promise:held.promise,release:()=>{
    held.consumers--;
    if(!held.consumers && pending.get(key)===held){pending.delete(key);held.controller.abort();}
  }};
}

function requestForYear(year:number, release?:ReleaseManifest):WorldRequest|undefined {
  const century=Math.floor(year/100)*100;
  if(!release) return {key:`legacy:${century}`,start:century};
  const releasePackage=release.packages.find((candidate)=>(
    candidate.kind==='world'
    && candidate.yearRange?.length===2
    && year>=candidate.yearRange[0]
    && year<=candidate.yearRange[1]
    && candidate.files.length===1
  ));
  if(!releasePackage) return undefined;
  const file=releasePackage.files[0];
  return {key:`${release.releaseId}:${file.uri}`,start:releasePackage.yearRange![0],file};
}

export function useWorldSlice(year:number, enabled:boolean, release?:ReleaseManifest) {
  const requestSpec=requestForYear(year,release);
  const resultKey=requestSpec?.key ?? `${release?.releaseId ?? 'legacy'}:unavailable:${year}`;
  const available=Boolean(requestSpec) && year!==0 && (release ? true : year>=-3400 && year<=2024);
  const [attempt,setAttempt]=useState(0);
  const [result,setResult]=useState<{key:string;status:Status;slice?:WorldSlice}>({key:resultKey,status:'off'});
  useEffect(()=>{
    if(!enabled||!available||!requestSpec) return;
    let cancelled=false;
    setResult({key:resultKey,status:'loading'});
    const request=acquireCentury(requestSpec);
    request.promise.then(slice=>{if(!cancelled)setResult({key:resultKey,status:'ready',slice});})
      .catch(()=>{if(!cancelled)setResult({key:resultKey,status:'error'});});
    return ()=>{cancelled=true;request.release();};
  },[resultKey,enabled,available,attempt]);
  const status:Status=!enabled?'off':!available?'unavailable':result.key!==resultKey?'loading':result.status;
  return {status,slice:status==='ready'?result.slice:undefined,retry:()=>setAttempt(n=>n+1)};
}
