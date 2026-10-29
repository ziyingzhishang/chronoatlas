import { access, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const outputPath = `${root}src/data/coverage-decisions.json`;
if (!process.argv.includes('--force')) {
  try {
    await access(outputPath);
    throw new Error('Refusing to overwrite the existing reviewed decision ledger; pass --force only when intentionally reseeding it.');
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
}
const audit = JSON.parse(await readFile(`${root}internal/audits/coverage-audit.json`, 'utf8'));
const sources = [
  ...JSON.parse(await readFile(`${root}src/data/generated/cliopatria-china.json`, 'utf8')),
  ...JSON.parse(await readFile(`${root}src/data/generated/boundaries.json`, 'utf8')),
];

const decisions = audit.flatMap(polity => polity.missingRanges.map(([from, to]) => {
  const records = sources.filter(boundary => boundary.polityId === polity.id
    && boundary.temporalKind === 'interval' && boundary.areaKm2);
  const maximum = records.reduce((best, boundary) =>
    !best || boundary.areaKm2 > best.areaKm2 ? boundary : best, undefined);
  const gap = `${from}—${to}`;
  return {
    id: `gap-${polity.id}-${from}-${to}`,
    polityId: polity.id,
    from,
    to,
    verdict: maximum ? 'maximum-record' : 'leave-unfilled',
    sourceBoundaryIds: maximum ? [maximum.id] : [],
    citationIds: maximum ? maximum.sourceIds : polity.sourceIds ?? [],
    historicalTransitionCheck: `${polity.name}${gap}尚未完成逐段历史转折复核；当前记录明确保持待复核状态。`,
    rationale: maximum
      ? `${polity.name}${gap}暂以同一政权已收录的最大单条来源轮廓作为C级参考，不解释为所选年份实况。`
      : `${polity.name}${gap}没有可复用的同政权来源几何，保持无国界图形，等待对应专题批次核验。`,
    reviewStatus: 'pending',
    reviewedAt: null,
  };
}));

await writeFile(outputPath, `${JSON.stringify(decisions, null, 2)}\n`);
console.log(JSON.stringify({decisions: decisions.length,
  maximum: decisions.filter(item => item.verdict === 'maximum-record').length,
  unfilled: decisions.filter(item => item.verdict === 'leave-unfilled').length}));
