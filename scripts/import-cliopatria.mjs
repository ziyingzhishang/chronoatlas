// Run with Node 24: node scripts/import-cliopatria.mjs /tmp/cliopatria-v0.2.1/cliopatria_polities_only_v021.geojson
// All geometry coordinates are preserved, without coastline snapping or interpolation.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { polities } from '../src/data/polities.ts';
import { cliopatriaNames, mappingNotes, worldChineseNames } from '../src/data/cliopatria-mapping.ts';

const root = fileURLToPath(new URL('../', import.meta.url));
const input = process.argv[2];
if (!input) throw Error('Pass the unzipped v0.2.1 GeoJSON file');
const bytes = await readFile(input);
const features = JSON.parse(bytes).features;
const sourceUrl = 'https://github.com/Seshat-Global-History-Databank/cliopatria/tree/v0.2.1';
const china = [], world = [], exclusions = [];
const worldPolities = new Map();
const colors = ['#a08b62', '#8d79a1', '#5f9995', '#b77a60', '#798eac', '#a57f91', '#8e9b67'];

function vertexCount(g) {
  if (!g || !['Polygon', 'MultiPolygon'].includes(g.type)) throw Error('Invalid geometry type');
  let count = 0;
  for (const polygon of g.type === 'Polygon' ? [g.coordinates] : g.coordinates) for (const ring of polygon) {
    if (ring.length < 4 || JSON.stringify(ring[0]) !== JSON.stringify(ring.at(-1))) throw Error('Unclosed polygon');
    for (const [x,y] of ring) { if (!Number.isFinite(x) || !Number.isFinite(y) || Math.abs(x)>180 || Math.abs(y)>90) throw Error('Invalid WGS84 coordinate'); count++; }
  }
  return count;
}
function base(f, index) {
  const p = f.properties;
  if (!Number.isInteger(p.FromYear) || !Number.isInteger(p.ToYear) || p.FromYear > p.ToYear || !Number.isFinite(p.Area) || p.Area <= 0) throw Error(`Invalid record ${index}`);
  // Intersect source integer intervals with selectable civil years, without shifting BCE dates.
  // Preserve raw zero endpoints in sourceFrom/sourceTo for inspection.
  return { id: `clio-${index}`, polityId: '', validFrom: p.FromYear===0?1:p.FromYear, validTo: p.ToYear===0?-1:p.ToYear,
    temporalKind: 'interval', snapshotYear: p.FromYear || 1, sourceFrom: p.FromYear, sourceTo: p.ToYear,
    sourceName: p.Name, sourceUrl, sourceRecord: index, areaKm2: p.Area,
    geometry: f.geometry, vertexCount: vertexCount(f.geometry), controlType: 'unspecified', confidence: 'low',
    sourceIds: ['cliopatria'], memberOf: p.MemberOf || undefined,
    evidence: {
      evidenceLevel: 'A', derivation: 'direct-source', reviewStatus: 'source-checked',
      citations: [{ title: 'Cliopatria', urlOrCitation: 'https://doi.org/10.1038/s41597-025-04516-9',
        version: 'v0.2.1', pageOrRecord: `record ${index}`, license: 'CC BY 4.0' }],
      uncertaintyNote: '来源直接提供该时段几何，但属于近似时段模型，不代表逐年测绘或逐界独立考证。',
    },
    notes: 'Cliopatria来源时段模型，非逐年独立考证；保留原始几何，古今海岸线可能不一致。' };
}
for (const [index, f] of features.entries()) {
  const p = f.properties;
  if (p.Type !== 'POLITY' || p.Components) continue; // Do not paint empires/alliances twice over their members.
  if (p.Name === 'Former Jin') {
    exclusions.push({index,name:p.Name,reason:'922—925年晋/后唐过渡别名跨改号；未逐年核定前暂隔离，避免从世界层与后唐重复叠置'});
    continue;
  }
  const names = cliopatriaNames[p.Name];
  if (names) {
    for (const id of names) {
      const polity = polities.find(x => x.id === id);
      if (!polity) throw Error(`Unknown polity ${id}`);
      let ranges = [[polity.startYear, polity.endYear]];
      if (id === 'tang') ranges = [[618,689],[705,907]];
      if (id === 'later_jin') ranges = [[1616,1635]];
      if (id === 'wu_zhou') ranges = [[690,704]]; // 705 is the restoration year: do not double-fill identical geometry.
      if (id === 'western_qin') ranges = [[385,400],[409,431]];
      if (id === 'ming_southern' && p.FromYear >= 1662) { exclusions.push({ index, name:p.Name, reason:'台湾/三藩时期不得混为南明本体' }); continue; }
      if (id === 'han_western' && p.Area < 1000) { exclusions.push({ index, name:p.Name, reason:'6—13年汉朝面积异常残片' }); continue; }
      for (const [start,end] of ranges) {
        const validFrom = Math.max(start, p.FromYear), validTo = Math.min(end, p.ToYear);
        if (validFrom > validTo) continue;
        china.push({ ...base(f,index), id:`clio-${index}-${id}-${validFrom}`, polityId:id, validFrom, validTo,
          snapshotYear: validFrom || 1, notes: `${baseNote()} ${mappingNotes[id] ?? '按目录存续期限制显示；区间边缘不代表已精确考证。'}` });
      }
    }
    continue; // Never reintroduce rejected Chinese records via the world layer.
  }
  const key = `world-${createHash('sha256').update(p.Name).digest('hex').slice(0,12)}`;
  const b = { ...base(f,index), polityId:key };
  world.push(b);
  const known = worldPolities.get(key);
  if (known) { known.startYear = Math.min(known.startYear,b.validFrom); known.endYear = Math.max(known.endYear,b.validTo); }
  else worldPolities.set(key,{ id:key, name:worldChineseNames[p.Name] ?? p.Name, originalName:p.Name,
    type:'regime', startYear:b.validFrom, endYear:b.validTo, region:'world',
    color:colors[worldPolities.size % colors.length], sourceIds:['cliopatria'],
    description:'同期世界来源记录；起止为数据观测范围，不一定是建国、灭亡的精确年份。未逐国独立校勘。',
    referenceUrl:p.Wikipedia ? `https://en.wikipedia.org/wiki/${encodeURIComponent(p.Wikipedia.replaceAll(' ','_'))}` : undefined });
}
function baseNote() { return '来源时段为近似模型，不是逐年测绘；原始轮廓完整保留，未作插值、现代省界拼接或海岸线裁切。'; }
await mkdir(`${root}public/data/world`,{recursive:true});
await mkdir(`${root}public/data/licenses`,{recursive:true});
await writeFile(`${root}src/data/generated/cliopatria-china.json`,JSON.stringify(china));
// Only the relevant century is downloaded by the browser. Shared geometries are deduplicated per chunk.
const chunks = [];
for (let start=-3400;start<=2000;start+=100) {
  const end=Math.min(start+99,2024);
  const records=world.filter(b=>b.validFrom<=end && b.validTo>=start);
  const ids=new Set(records.map(b=>b.polityId));
  const filename=`${start}.json`;
  const geometries=[], indices=new Map();
  const packed=records.map(({geometry,...b})=>{const key=JSON.stringify(geometry);let index=indices.get(key);if(index===undefined){index=geometries.length;indices.set(key,index);geometries.push(geometry);}return {...b,geometryIndex:index};});
  const content=JSON.stringify({start,end,polities:[...worldPolities.values()].filter(p=>ids.has(p.id)),records:packed,geometries});
  await writeFile(`${root}public/data/world/${filename}`,content);
  chunks.push({start,end,filename,records:records.length,bytes:Buffer.byteLength(content),sha256:createHash('sha256').update(content).digest('hex')});
}
const years=(a,b)=>Array.from({length:b-a+1},(_,i)=>a+i).filter(y=>y!==0);
const gaps=ys=>{const result=[];for(const y of ys){const last=result.at(-1);if(last && (y===last[1]+1 || last[1]===-1&&y===1))last[1]=y;else result.push([y,y]);}return result;};
const audit=polities.map(p=>{
  const rows=china.filter(b=>b.polityId===p.id);
  const missing=years(p.startYear,p.endYear).filter(y=>!(p.id==='tang'&&y>=690&&y<705)&&!(p.id==='western_qin'&&y>400&&y<409)&&!rows.some(b=>b.validFrom<=y&&y<=b.validTo));
  const maximum=rows.reduce((best,b)=>!best||b.areaKm2>best.areaKm2?b:best,undefined);
  return {id:p.id,name:p.name,records:rows.length,sourceNames:[...new Set(rows.map(b=>b.sourceName))],
    coveredYears:years(p.startYear,p.endYear).filter(y=>rows.some(b=>b.validFrom<=y&&y<=b.validTo)).length,
    missingRanges:gaps(missing),maximum:maximum?{id:maximum.id,from:maximum.validFrom,to:maximum.validTo,areaKm2:maximum.areaKm2}:null,
    review:'已核对标识、存续期和几何结构；非逐界史料复核',note:mappingNotes[p.id]??'来源日期与目录日期不一致处取交集，缺年另标最大参考，不外推为实况。'};
});
await writeFile(`${root}public/data/coverage-audit.json`,JSON.stringify(audit,null,2));
await writeFile(`${root}public/data/cliopatria-manifest.json`,JSON.stringify({version:'0.2.1',sourceUrl,license:'CC-BY-4.0',
  licenseUrl:'https://creativecommons.org/licenses/by/4.0/',attribution:'Bennett et al. (2025), Cliopatria, Seshat Global History Databank. DOI:10.1038/s41597-025-04516-9',
  inputSha256:createHash('sha256').update(bytes).digest('hex'),sourceRecords:features.length,chinaRecords:china.length,chinaPolities:new Set(china.map(b=>b.polityId)).size,
  worldRecords:world.length,worldEntities:worldPolities.size,transformations:'Original geometries retained. Explicit name/date mapping; Chinese intervals clipped to catalog; composites and RELATION records excluded; world geometries deduplicated per century. Maximum means largest available single source record, NOT verified historical maximum.',exclusions,chunks},null,2));
await writeFile(`${root}public/data/licenses/cliopatria-CC-BY-4.0.txt`, 'Cliopatria v0.2.1 — Bennett et al. / Seshat Global History Databank\nhttps://github.com/Seshat-Global-History-Databank/cliopatria/tree/v0.2.1\nhttps://doi.org/10.1038/s41597-025-04516-9\nLicensed under Creative Commons Attribution 4.0 International (CC BY 4.0).\nhttps://creativecommons.org/licenses/by/4.0/\nChanges: name mapping, temporal filtering and packaging. Original geometry coordinates unchanged.\n');
console.log(JSON.stringify({chinaRecords:china.length,chinaPolities:audit.filter(p=>p.records).length,missing:audit.filter(p=>!p.records).map(p=>p.name),worldRecords:world.length,worldEntities:worldPolities.size,maxChunkBytes:Math.max(...chunks.map(c=>c.bytes))}));
