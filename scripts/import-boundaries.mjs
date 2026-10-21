// Reproducible data conversion, not historical boundary reconstruction.
// Source geometry is retained; no smoothing, interpolation, coastline clipping or modern-province union.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const upstream = 'https://raw.githubusercontent.com/aourednik/historical-basemaps/master/';
// Explicit whitelist. Known misdated layers (500 Jin, 700 Sui, 1400 Great Khanate,
// 900 Tibetan Empire, 1000+ Nan Chao, 1914 Manchu) are deliberately NOT relabelled.
const slices = [
  [-200, { 'Han Empire': 'han_western', Xiongnu: 'xiongnu' }],
  [-100, { 'Han Empire': 'han_western', Xiongnu: 'xiongnu' }],
  [-1, { Han: 'han_western', Xiongnu: 'xiongnu', Koguryo: 'goguryeo', Silla: 'silla' }],
  [100, { Han: 'han_eastern', Koguryo: 'goguryeo', Silla: 'silla' }],
  [200, { Han: 'han_eastern', Koguryo: 'goguryeo', Silla: 'silla' }],
  [300, { Jin: 'jin_western', Koguryo: 'goguryeo', Silla: 'silla' }],
  [400, { Jin: 'jin_eastern', 'Northern Liang': 'northern_liang', Koguryo: 'goguryeo', Silla: 'silla' }],
  [500, { 'Toba Wei': 'wei_northern', Koguryo: 'goguryeo', Silla: 'silla' }],
  [600, { 'Sui Empire': 'sui', Koguryo: 'goguryeo', Silla: 'silla' }],
  [800, { 'Tang Empire': 'tang', 'Tibetan Empire': 'tibetan_empire', 'Nan Chao': 'nanzhao' }],
  [900, { 'Tang Empire': 'tang', 'Nan Chao': 'nanzhao', Silla: 'silla' }],
  [1000, { 'Song Empire': 'song_northern', Liao: 'khitan' }],
  [1100, { 'Song Empire': 'song_northern', Liao: 'khitan', Xixia: 'western_xia' }],
  [1200, { 'Song Empire': 'song_south', Xixia: 'western_xia' }],
  [1279, { 'Great Khanate': 'yuan' }],
  [1300, { 'Great Khanate': 'yuan' }],
  [1492, { 'Ming Empire': 'ming' }],
  [1500, { 'Ming Chinese Empire': 'ming' }],
  [1530, { 'Ming Chinese Empire': 'ming' }],
  [1600, { 'Ming Chinese Empire': 'ming' }],
  [1650, { 'Manchu Empire': 'qing' }],
  [1783, { 'Qing Empire': 'qing' }],
  [1800, { 'Qing Empire': 'qing' }],
  [1900, { 'Manchu Empire': 'qing' }],
];

const cache = '/tmp/china-history-boundaries-source';
await mkdir(cache, { recursive: true });
await mkdir(`${root}src/data/generated`, { recursive: true });
await mkdir(`${root}public/data/licenses`, { recursive: true });
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
async function download(path) {
  const file = `${cache}/${path.split('/').at(-1)}`;
  try { return await readFile(file); } catch { /* first import */ }
  execFileSync('curl', ['--fail', '-sSL', '--retry', '2', '--max-time', '45', `${upstream}${path}`, '-o', file]);
  return readFile(file);
}
function validate(geometry) {
  if (!['Polygon', 'MultiPolygon'].includes(geometry.type)) throw Error('Expected polygon');
  const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  let vertices = 0;
  for (const polygon of polygons) for (const ring of polygon) {
    if (ring.length < 4 || JSON.stringify(ring[0]) !== JSON.stringify(ring.at(-1))) throw Error('Unclosed ring');
    for (const [x, y] of ring) {
      if (!Number.isFinite(x) || !Number.isFinite(y) || Math.abs(x) > 180 || Math.abs(y) > 90) throw Error('Invalid WGS84 coordinate');
      vertices++;
    }
  }
  return vertices;
}
const boundaries = [], files = [];
for (const [year, names] of slices) {
  const filename = `geojson/world_${year < 0 ? `bc${-year}` : year}.geojson`;
  const raw = await download(filename);
  const collection = JSON.parse(raw);
  const found = new Set();
  for (const [index, feature] of collection.features.entries()) {
    const originalName = feature.properties.NAME?.trim();
    const polityId = names[originalName];
    if (!polityId) continue;
    found.add(originalName);
    const vertexCount = validate(feature.geometry);
    boundaries.push({ id: `hb-${year}-${polityId}-${index}`, polityId, validFrom: year, validTo: year,
      snapshotYear: year, sourceName: originalName, geometry: feature.geometry, vertexCount,
      controlType: 'unspecified', confidence: 'low', sourceIds: ['historical-basemaps'],
      sourceUrl: `https://github.com/aourednik/historical-basemaps/blob/master/${filename}`,
      evidence: {
        evidenceLevel: 'B', derivation: 'licensed-digitization', reviewStatus: 'source-checked',
        citations: [{ title: 'Historical Basemaps',
          urlOrCitation: `https://github.com/aourednik/historical-basemaps/blob/master/${filename}`,
          version: filename, pageOrRecord: `${originalName} feature ${index}`, license: 'GPL-3.0' }],
        uncertaintyNote: '开源数字化历史轮廓，仅作大陆尺度参考；尚未完成逐界史料校勘。',
      },
      notes: '保留开源资料原始轮廓；大陆尺度参考，未经逐界校勘。资料未细分直辖、羁縻及争议，不作逐年插值。' });
  }
  for (const name of Object.keys(names)) if (!found.has(name)) throw Error(`Missing ${year}: ${name}`);
  files.push({ year, filename, sha256: hash(raw) });
  console.log(year, [...found].join(', '));
}
await writeFile(`${root}src/data/generated/boundaries.json`, JSON.stringify(boundaries));
await writeFile(`${root}public/data/boundary-manifest.json`, JSON.stringify({
  upstream: 'https://github.com/aourednik/historical-basemaps', retrieved: new Date().toISOString(),
  license: 'GPL-3.0', transformations: 'Exact-name whitelist and Chinese polity ID mapping only. Geometry unchanged.',
  exclusions: 'Misdated or ambiguous polities excluded; unavailable Qin/Three Kingdoms/prehistory/modern boundaries are not fabricated.', files,
}, null, 2));
await writeFile(`${root}public/data/licenses/historical-basemaps-GPL-3.0.txt`, await download('LICENSE'));
console.log(`${boundaries.length} features, ${boundaries.reduce((n,b)=>n+b.vertexCount,0)} original vertices`);
