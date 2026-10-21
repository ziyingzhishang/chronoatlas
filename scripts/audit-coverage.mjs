import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const audit = JSON.parse(await readFile(`${root}public/data/coverage-audit.json`, 'utf8'));
const decisionsText = await readFile(`${root}src/data/coverage-decisions.json`, 'utf8');
const decisions = JSON.parse(decisionsText);
const { specialHistoricalExtents } = await import('../src/data/special-historical-extents.ts');
const byPolity = new Map();
for (const decision of decisions) {
  const rows = byPolity.get(decision.polityId) ?? [];
  rows.push(decision);
  byPolity.set(decision.polityId, rows);
}
const enriched = audit.map(polity => {
  const nonBoundary = specialHistoricalExtents.filter(boundary => boundary.polityId === polity.id);
  return {...polity,
    visualRecords: polity.records + nonBoundary.length,
    definiteBoundaryRecords: polity.records,
    nonBoundaryRepresentations: [...new Set(nonBoundary.map(boundary => boundary.evidence.derivation))],
    gapDecisions: byPolity.get(polity.id) ?? [],
  };
});
await writeFile(`${root}public/data/coverage-audit.json`, `${JSON.stringify(enriched, null, 2)}\n`);
console.log(JSON.stringify({polities: enriched.length, decisions: decisions.length,
  decisionsSha256: createHash('sha256').update(decisionsText).digest('hex')}));
