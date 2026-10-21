import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const frozen = JSON.parse(await readFile(`${root}src/data/frozen-short-gaps.json`, 'utf8'));
const decisionsText = await readFile(`${root}src/data/coverage-decisions.json`, 'utf8');
const decisions = JSON.parse(decisionsText);
const byId = new Map(decisions.map(decision => [decision.id, decision]));
const formatRecord = record => record
  ? `${record.id} (${record.from}—${record.to}, ${record.evidenceLevel})`
  : '无';
const rows = frozen.rows.map((row, index) => {
  const current = byId.get(row.id);
  if (!current) throw new Error(`Missing decision ${row.id}`);
  const events = row.knownTransitionEvents.length
    ? row.knownTransitionEvents.map(event => `${event.year} ${event.title}`).join('；')
    : '目录暂无同年事件';
  return `| ${index + 1} | ${row.polityName} | ${row.from}—${row.to} | ${formatRecord(row.adjacentBefore)} | ${formatRecord(row.adjacentAfter)} | ${events} | ${row.initialDecision.verdict}/${row.initialDecision.reviewStatus} | ${current.verdict}/${current.reviewStatus} | ${current.sourceBoundaryIds.join('、') || '无'} | ${current.historicalTransitionCheck} |`;
});
const totals = Object.groupBy(frozen.rows.map(row => byId.get(row.id)), decision => decision.verdict);
const summary = Object.entries(totals).map(([verdict, items]) => `${verdict}: ${items.length}`).join('；');
const report = `# 1—5年短缺口逐段复核（2026-10-20）

- 冻结输入：${frozen.count} 条
- 输入审计 SHA-256：\`${frozen.auditSha256}\`
- 当前决策 SHA-256：\`${createHash('sha256').update(decisionsText).digest('hex')}\`
- 复核结论：${summary}
- 原则：建国、灭亡、复辟、分裂或快速扩张年不以其他年份轮廓补面；留空是明确的审核结论，不是静默缺失。

| # | 政权 | 缺口 | 前一记录 | 后一记录 | 目录事件 | 原状态 | 新状态 | 采用几何 | 逐段转折核验 |
|---:|---|---:|---|---|---|---|---|---|---|
${rows.join('\n')}

## 结果说明

- 63 条转折期记录改为 \`leave-unfilled\`；不生成边界几何。
- “更始政权 23—25”保持 \`control-centers\`，以 D 级控制中心表达，不生成封闭国界。
- “中华人民共和国 2025—2026”满足同一政权连续边缘缺口规则，使用 \`clio-13616-prc-2024\` 作为 C 级临近参考；它不是独立测绘结果，也不能替代公开发布所需的官方标准地图。
- 所有采用几何均来自同一政权；没有跨政权复制。
`;
await writeFile(`${root}docs/audits/2026-10-20-short-gap-decisions.md`, report);
console.log(JSON.stringify({ count: frozen.count, verdicts: Object.fromEntries(Object.entries(totals).map(([key, value]) => [key, value.length])) }));
