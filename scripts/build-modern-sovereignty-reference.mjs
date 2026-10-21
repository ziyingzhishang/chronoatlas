import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { geoArea, geoContains } from 'd3-geo';
import { feature } from 'topojson-client';
import worldTopology from 'world-atlas/land-110m.json' with {type:'json'};

const root = fileURLToPath(new URL('../', import.meta.url));
const converted = feature(worldTopology, worldTopology.objects.land);
const land = converted.type === 'FeatureCollection' ? converted.features[0] : converted;
if (land.geometry.type !== 'MultiPolygon') throw Error('Expected Natural Earth land MultiPolygon');
const inTaiwanBox = ([lon, lat]) => lon >= 119 && lon <= 123 && lat >= 21 && lat <= 26.5;
const candidates = land.geometry.coordinates
  .map(coordinates => ({type:'Feature', properties:{}, geometry:{type:'Polygon', coordinates}}))
  .filter(candidate => candidate.geometry.coordinates.flat().every(inTaiwanBox))
  .filter(candidate => geoContains(candidate, [121, 23.7]))
  .sort((a, b) => geoArea(b) - geoArea(a));
if (candidates.length !== 1) throw Error(`Expected one Taiwan island polygon, found ${candidates.length}`);

const packageJson = JSON.parse(await readFile(`${root}node_modules/world-atlas/package.json`, 'utf8'));
const output = {
  type: 'FeatureCollection',
  features: [{
    ...candidates[0],
    properties: {
      id: 'taiwan-province-reference',
      sovereigntyGroup: 'china',
      administrativeLabel: '台湾省',
      effectiveFrom: 1949,
      sourceRole: 'physical-island-outline',
      source: `world-atlas ${packageJson.version} / Natural Earth land-110m`,
    },
  }],
};
const text = `${JSON.stringify(output)}\n`;
await writeFile(`${root}src/data/generated/modern-sovereignty-reference.json`, text);
console.log(JSON.stringify({features:1, worldAtlasVersion:packageJson.version,
  sha256:createHash('sha256').update(text).digest('hex')}));
