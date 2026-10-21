import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const decisionsPath = `${root}src/data/coverage-decisions.json`;
const decisionsText = await readFile(decisionsPath, 'utf8');
const decisions = JSON.parse(decisionsText);
const frozen = JSON.parse(await readFile(`${root}src/data/frozen-medium-gaps.json`, 'utf8'));
const notes = {
  'gap-later_zhao-319-336': '319至336年覆盖后赵政权建立、迁都与兼并扩张阶段，337年来源断面不能代表十八年间的连续变化。',
  'gap-song_southern-420-425': '420至425年处在刘宋代晋建国及早期北方战事阶段，426年后的轮廓不宜回填。',
  'gap-liang_southern-502-509': '502至509年包含梁代齐建国及初期南北战争，后续最大范围会掩盖逐年控制变化。',
  'gap-sui-581-586': '581至586年为隋代周建国并整合北方阶段，灭陈统一尚未发生，不能使用后期最大版图。',
  'gap-zhou_later-951-959': '951至959年为后周建国、北伐与政权扩张阶段，且紧接960年宋代周，单一最大面不可靠。',
  'gap-zhou_eastern--770--751': '前770至前751年始于周王室东迁，早期王畿与诸侯关系处在重组阶段，后期轮廓无法回推。',
  'gap-qin_state--770--751': '前770至前751年为秦受封并经营关中早期，来源未提供足以重建这二十年逐界变化的几何。',
  'gap-former_liang-314-323': '314至323年处在前凉政权形成及西北局势重组期，后续来源面不代表草创十年。',
  'gap-western_liang-400-406': '400至406年为西凉建立及河西诸政权竞争阶段，不以其他年份最大轮廓替代。',
  'gap-western_liang-410-421': '410至421年西凉在河西战争中持续调整并最终覆亡，单一参考面会夸大稳定性。',
  'gap-song_south-1127-1138': '1127至1138年包括南宋建立、迁驻与宋金战争，政治中心和实际控制均多次变化。',
  'gap-jin_jurchen-1115-1125': '1115至1125年为金建国、灭辽并向宋推进的快速扩张期，不能以1126年以后轮廓倒推。',
  'gap-dali-937-946': '937至946年为大理政权建立与早期整合阶段，947年来源断面不足以覆盖此前十年。',
  'gap-northern_yuan-1368-1374': '1368至1374年为元廷退出大都后北迁重组阶段，控制范围与明军推进同步变化。',
  'gap-ming-1368-1374': '1368至1374年为明建国、北伐及全国整合阶段，后续轮廓不能代表每个起始年份。',
  'gap-republic-1916-1929': '1916至1929年经历中央权威分裂、军阀割据和北伐，名义疆域不能冒充统一实际控制。',
  'gap-wu_ten-902-910': '902至910年处在杨吴政权形成、唐亡和地方秩序重组期，911年断面不作逆推。',
  'gap-northern_han-951-959': '951至959年为北汉建立及与后周、辽关系调整阶段，960年后来源面不能回填。',
};
if (Object.keys(notes).length !== frozen.count || frozen.rows.some(row => !notes[row.id])) {
  throw new Error('Medium-gap review notes do not exactly match the frozen batch');
}
const byId = new Map(decisions.map(decision => [decision.id, decision]));
for (const row of frozen.rows) {
  const decision = byId.get(row.id);
  decision.verdict = 'leave-unfilled';
  decision.sourceBoundaryIds = [];
  decision.citationIds = [...new Set([...decision.citationIds, 'china-chronology',
    ...(decision.from >= -403 && decision.to <= 959 ? ['zizhi-tongjian'] : [])])];
  decision.historicalTransitionCheck = `${row.id}逐段复核：${notes[row.id]}`;
  decision.rationale = `${notes[row.id]}在没有可重发布的逐年直接几何前，本段明确留空，不把同政权最大断面当作实况。`;
  decision.reviewStatus = 'reviewed';
  decision.reviewedAt = '2026-10-20';
}
const output = `${JSON.stringify(decisions, null, 2)}\n`;
await writeFile(decisionsPath, output);
const reportRows = frozen.rows.map((row, index) => {
  const decision = byId.get(row.id);
  return `| ${index + 1} | ${row.polityName} | ${row.from}—${row.to} | ${row.initialDecision.sourceBoundaryIds.join('、') || '无'} | Cliopatria v0.2.1 / CC BY 4.0，可重发布但仅为候选断面 | ${row.initialDecision.verdict}/${row.initialDecision.reviewStatus} | ${decision.verdict}/${decision.reviewStatus} | 无 | 拒绝最大断面：转折期存在“名义疆域”与逐年实际控制不一致 | ${decision.historicalTransitionCheck} |`;
});
await writeFile(`${root}docs/audits/2026-10-20-medium-gap-decisions.md`, `# 6—20年中等缺口逐段复核（2026-10-20）

- 冻结条目：${frozen.count}
- 输入审计 SHA-256：\`${frozen.auditSha256}\`
- 当前决策 SHA-256：\`${createHash('sha256').update(output).digest('hex')}\`
- 结论：18段均处于建立、战争扩张、迁徙重组、分裂或覆亡阶段；全部明确留空，不作临近年份桥接。

| # | 政权 | 缺口 | 候选几何 | 许可/版本结果 | 原状态 | 新状态 | 采用几何 | 冲突与拒绝项 | 逐段转折核验 |
|---:|---|---:|---|---|---|---|---|---|---|
${reportRows.join('\n')}
`);
console.log(JSON.stringify({reviewedMediumGaps: frozen.count, verdict: 'leave-unfilled'}));
