import { createHash } from 'node:crypto';
import { access, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const frozenPath = `${root}src/data/frozen-short-gaps.json`;
if (!process.argv.includes('--force')) {
  try {
    await access(frozenPath);
    throw new Error('Short-gap input is already frozen; pass --force only to create a deliberately new batch.');
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
}
const auditText = await readFile(`${root}internal/audits/coverage-audit.json`, 'utf8');
const audit = JSON.parse(auditText);
const imported = [
  ...JSON.parse(await readFile(`${root}src/data/generated/cliopatria-china.json`, 'utf8')),
  ...JSON.parse(await readFile(`${root}src/data/generated/boundaries.json`, 'utf8')),
];
const { events } = await import('../src/data/events.ts');

const civilYearLength = (from, to) => to - from + (from < 0 && to > 0 ? 0 : 1);
const recordFrom = record => record.temporalKind === 'interval' ? record.validFrom : record.snapshotYear;
const recordTo = record => record.temporalKind === 'interval' ? record.validTo : record.snapshotYear;
const summarize = record => record ? {
  id: record.id,
  from: recordFrom(record),
  to: recordTo(record),
  sourceIds: record.sourceIds,
  evidenceLevel: record.evidence.evidenceLevel,
} : null;

const rows = audit.flatMap(polity => (polity.missingRanges ?? []).map(([from, to]) => ({
  polity,
  from,
  to,
  length: civilYearLength(from, to),
}))).filter(row => row.length >= 1 && row.length <= 5).map(row => {
  const records = imported.filter(record => record.polityId === row.polity.id);
  const before = records.filter(record => recordTo(record) < row.from)
    .sort((a, b) => recordTo(b) - recordTo(a))[0];
  const after = records.filter(record => recordFrom(record) > row.to)
    .sort((a, b) => recordFrom(a) - recordFrom(b))[0];
  const transitionEvents = events.filter(event =>
    (event.endYear ?? event.year) >= row.from && event.year <= row.to);
  const decision = row.polity.gapDecisions?.find(item => item.from === row.from && item.to === row.to);
  return {
    id: `gap-${row.polity.id}-${row.from}-${row.to}`,
    polityId: row.polity.id,
    polityName: row.polity.name,
    from: row.from,
    to: row.to,
    civilYearLength: row.length,
    adjacentBefore: summarize(before),
    adjacentAfter: summarize(after),
    knownTransitionEvents: transitionEvents.map(event => ({
      id: event.id,
      year: event.year,
      endYear: event.endYear ?? event.year,
      title: event.title,
      verification: event.verification,
    })),
    initialDecision: decision ? {
      verdict: decision.verdict,
      reviewStatus: decision.reviewStatus,
      sourceBoundaryIds: decision.sourceBoundaryIds,
    } : null,
  };
});

if (rows.length !== 65) throw new Error(`Expected 65 short gaps, found ${rows.length}`);

const frozen = {
  frozenAt: '2026-10-20',
  auditSha256: createHash('sha256').update(auditText).digest('hex'),
  count: rows.length,
  rows,
};
await writeFile(frozenPath, `${JSON.stringify(frozen, null, 2)}\n`);
const formatRecord = record => record
  ? `${record.id} (${record.from}—${record.to}, ${record.evidenceLevel})`
  : '无';
const markdownRows = rows.map((row, index) => {
  const eventsText = row.knownTransitionEvents.length
    ? row.knownTransitionEvents.map(event => `${event.year} ${event.title}`).join('；')
    : '目录暂无同年转折事件';
  return `| ${index + 1} | ${row.polityName} | ${row.from}—${row.to} | ${row.civilYearLength} | ${formatRecord(row.adjacentBefore)} | ${formatRecord(row.adjacentAfter)} | ${eventsText} | ${row.initialDecision?.verdict ?? '无'} / ${row.initialDecision?.reviewStatus ?? '无'} |`;
});
const report = `# 1—5年短缺口冻结清单（2026-10-20）

- 冻结日期：2026-10-20
- 输入审计 SHA-256：\`${frozen.auditSha256}\`
- 条目数：${rows.length}
- 本表只冻结核验输入，不表示下列初始决策已获得史料复核。

| # | 政权 | 缺口 | 民用年数 | 前一来源记录 | 后一来源记录 | 已知转折事件 | 初始状态 |
|---:|---|---:|---:|---|---|---|---|
${markdownRows.join('\n')}

## 核验规则

每一行必须分别检查建国、灭亡、复辟、迁都和重大分裂；只允许引用同一政权的几何。没有足够证据时保留为空，不以最大版图冒充当年实况。复核结果写回决策账本后，本报告再补充新旧状态与采用的来源几何 ID。
`;
await writeFile(`${root}docs/audits/2026-10-20-short-gap-decisions.md`, report);
console.log(JSON.stringify({ count: rows.length, auditSha256: frozen.auditSha256 }));
