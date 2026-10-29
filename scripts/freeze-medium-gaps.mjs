import { createHash } from 'node:crypto';
import { access, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const outputPath = `${root}src/data/frozen-medium-gaps.json`;
if (!process.argv.includes('--force')) {
  try {
    await access(outputPath);
    throw new Error('Medium-gap input is already frozen; pass --force only for a deliberately new batch.');
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
}
const auditText = await readFile(`${root}internal/audits/coverage-audit.json`, 'utf8');
const audit = JSON.parse(auditText);
const rows = audit.flatMap(polity => (polity.missingRanges ?? []).map(([from, to]) => ({
  id: `gap-${polity.id}-${from}-${to}`,
  polityId: polity.id,
  polityName: polity.name,
  from,
  to,
  civilYearLength: to - from + (from < 0 && to > 0 ? 0 : 1),
  initialDecision: polity.gapDecisions.find(decision => decision.from === from && decision.to === to),
}))).filter(row => row.civilYearLength >= 6 && row.civilYearLength <= 20);
if (rows.length !== 18) throw new Error(`Expected 18 medium gaps, found ${rows.length}`);
await writeFile(outputPath, `${JSON.stringify({
  frozenAt: '2026-10-20',
  auditSha256: createHash('sha256').update(auditText).digest('hex'),
  count: rows.length,
  rows,
}, null, 2)}\n`);
console.log(JSON.stringify({count: rows.length}));
