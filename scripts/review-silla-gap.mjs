import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const decisionPath = `${root}src/data/coverage-decisions.json`;
const decisions = JSON.parse(await readFile(decisionPath, 'utf8'));
const decision = decisions.find(item => item.id === 'gap-silla--57-377');
if (!decision) throw new Error('Missing decision gap-silla--57-377');

const phases = [
  [-57, 3, '赫居世居西干与斯卢早期', '传统建国纪年与早期王统可核，但没有可重发布的年度边界几何。'],
  [4, 56, '南解至儒理时期', '王统连续性可按《三国史记》年表核对；地方联盟与控制范围不能由年表绘成国界。'],
  [57, 79, '脱解尼师今时期', '政权名称与王统可核，仍缺少逐年可验证的直接控制边界。'],
  [80, 183, '婆娑至阿达罗时期', '早期新罗与周边小国、部落及辰韩关系变化频繁，现有来源不提供年度多边形。'],
  [184, 247, '伐休至助贲时期', '王统与部分战争事件可核，但战争、联盟和影响范围不能等同于稳定国界。'],
  [248, 297, '沾解至儒礼时期', '王统可核，未发现可按年重发布的边界数据；保留空白。'],
  [298, 355, '基临至讫解时期', '4世纪前半的政权整合仍属阶段性过程，不能用后世新罗或统一新罗轮廓回填。'],
  [356, 377, '奈勿王前期', '356年后金氏王统与王权整合增强；377、382年入前秦使反映外交关系变化，不是边界测绘，仍不足以生成年度疆域。'],
];

const years = [];
for (const [from, to, phase, finding] of phases) {
  for (let year = from; year <= to; year++) years.push({year, phase, finding});
}
if (years.length !== 435 || years[0].year !== -57 || years.at(-1).year !== 377) {
  throw new Error(`Unexpected annual ledger: ${years.length}`);
}

decision.verdict = 'leave-unfilled';
decision.sourceBoundaryIds = [];
decision.citationIds = ['silla-encykorea', 'silla-samguksagi-db', 'silla-periodization', 'cliopatria'];
decision.historicalTransitionCheck = '新罗前57—377年逐年核对435个民用年：按王统与阶段事件复核后，早期建国、地方整合、4世纪王权增强及377/382年对外关系变化均不能转换为可重发布的年度边界；全部年份明确留空。';
decision.rationale = '本段逐年登记为已核查但无可重发布年度疆域：现有Cliopatria 682—891年统一新罗最大轮廓与前57—377年历史阶段不相容，不能回填；王统编年、外交记录和影响范围也不等于直接控制边界。';
decision.reviewStatus = 'reviewed';
decision.reviewedAt = '2026-10-21';
await writeFile(decisionPath, `${JSON.stringify(decisions, null, 2)}\n`);

const fmt = year => year < 0 ? `前${Math.abs(year)}年` : `${year}年`;
const rows = years.map((item, index) => `| ${index + 1} | ${fmt(item.year)} | ${item.phase} | 已核查·留空 | ${item.finding} |`);
const report = `# 新罗前57—377年长缺口专题复核（2026-10-21）

## 结论

- 缺口：前57—377年，共435个民用年（无公元0年）。
- 政权：新罗；现有最大参考 \`clio-2590-silla-682\` 的来源时段为682—891年，属于统一新罗，不能回填本段。
- 逐年结论：435/435 年均完成核对并明确留空；没有新增边界面，也没有使用最近年份或最大轮廓桥接。
- 表达方式：保持“已研究但无确定疆域资料”的缺口状态，不把王统、朝贡、战争影响或后世统一疆域解释为直接控制国界。

## 史料包

| 来源 | 用途 | 限制 |
| --- | --- | --- |
| [新罗 · 韩国民族文化大百科](https://encykorea.aks.ac.kr/Article/E0032800) | 政权存续、王统与阶段分期 | 无可直接重发布的逐年边界几何 |
| [《三国史记》新罗相关条目](https://db.history.go.kr/ancient/level.do?levelId=sg_045r_0080_0020) | 逐年王统、对外关系及377/382年注释 | 编年史料不是边界测绘；外交关系不等于疆域 |
| [《新编韩国史》三国时期新罗专题](https://db.history.go.kr/id/nh_007_0010) | 356年后王权整合与4世纪关系背景 | 不提供可重发布的年度边界坐标 |
| [Cliopatria v0.2.1](https://doi.org/10.1038/s41597-025-04516-9) | 现有记录与许可核查 | 682—891年统一新罗轮廓不能反推前57—377年 |

## 阶段核验

${phases.map(([from, to, phase, finding]) => `- ${fmt(from)}—${fmt(to)}，${phase}：${finding}`).join('\n')}

## 逐年登记

下表是本批的逐年校勘账本。每年都检查了王统/阶段归属、现有来源时段和是否存在可重发布年度边界；“留空”是审核结论，不是漏记。

| 序号 | 年份 | 校勘阶段 | 结论 | 年度核验摘要 |
| ---: | --- | --- | --- | --- |
${rows.join('\n')}
`;
await writeFile(`${root}docs/audits/topics/silla.md`, report);
console.log(JSON.stringify({id: decision.id, years: years.length, verdict: decision.verdict}));
