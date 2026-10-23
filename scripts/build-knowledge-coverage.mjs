import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { auditKnowledgeCoverage, serializeKnowledgeCoverageReport } from '../src/data/knowledge-coverage.ts';

const root = fileURLToPath(new URL('../', import.meta.url));
const report = serializeKnowledgeCoverageReport(auditKnowledgeCoverage());
const outputPath = `${root}public/data/knowledge-coverage.json`;

await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({
  outputPath,
  schemaVersion: report.schemaVersion,
  entities: report.entities.length,
  gaps: report.gaps.length,
  tasks: report.tasks.length,
  cities: Object.keys(report.byCity).length,
  polities: Object.keys(report.byPolity).length,
}));
