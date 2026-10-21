import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const decisions = JSON.parse(await readFile(`${root}src/data/coverage-decisions.json`, 'utf8'));
const sources = [
  ...JSON.parse(await readFile(`${root}src/data/generated/cliopatria-china.json`, 'utf8')),
  ...JSON.parse(await readFile(`${root}src/data/generated/boundaries.json`, 'utf8')),
];
const byId = new Map(sources.map(boundary => [boundary.id, boundary]));
const curated = [];

for (const decision of decisions) {
  if (decision.verdict !== 'maximum-record' && decision.verdict !== 'nearest-same-polity') continue;
  if (decision.sourceBoundaryIds.length !== 1) throw Error(`${decision.id} must name one source boundary`);
  const source = byId.get(decision.sourceBoundaryIds[0]);
  if (!source) throw Error(`${decision.id} names an unknown source boundary`);
  if (source.polityId !== decision.polityId) throw Error(`${decision.id} crosses polity identities`);
  const maximum = decision.verdict === 'maximum-record';
  const {geometry: _geometry, ...sourceWithoutGeometry} = source;
  curated.push({
    ...sourceWithoutGeometry,
    id: `curated-${maximum ? 'maximum' : 'transition'}-${decision.polityId}-${decision.from}-${decision.to}`,
    geometrySourceId: source.id,
    validFrom: decision.from,
    validTo: decision.to,
    snapshotYear: decision.from,
    presentation: maximum ? 'maximum' : 'reference',
    sourceFrom: source.sourceFrom ?? source.validFrom,
    sourceTo: source.sourceTo ?? source.validTo,
    evidence: {
      evidenceLevel: 'C',
      derivation: decision.verdict,
      reviewStatus: decision.reviewStatus === 'reviewed' ? 'source-checked' : 'pending',
      citations: source.evidence.citations,
      uncertaintyNote: decision.rationale,
    },
    notes: decision.rationale,
  });
}

await writeFile(`${root}src/data/generated/curated-boundaries.json`, `${JSON.stringify(curated)}\n`);
console.log(JSON.stringify({curated: curated.length}));
