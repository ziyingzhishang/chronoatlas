import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const decisionPath = `${root}src/data/coverage-decisions.json`;
const decisions = JSON.parse(await readFile(decisionPath, 'utf8'));
const decision = decisions.find(item => item.id === 'gap-yuan-1271-1293');
if (!decision) throw new Error('Missing decision gap-yuan-1271-1293');

const phases = [
  [1271, 1275, '建国号与南宋战争延续', '1271年改国号为大元，但南宋战争、蒙古诸王和各地旧政权关系仍在变化，不能用后期统一轮廓回填。'],
  [1276, 1279, '临安受降至南宋覆亡', '南宋核心区域的接管、残余政权和战事持续至1279年；名义建国与实际控制转换不同步。'],
  [1280, 1281, '统一后整合与对日战争', '全国统合、行省建置和海外军事行动并行，控制强度和行政覆盖不等于稳定边界。'],
  [1282, 1287, '内乱、行政整合与地方重组', '中央权力、行省和地方反抗关系持续调整；以成熟期最大面覆盖会掩盖逐年变化。'],
  [1288, 1293, '边疆军事行动与行省化加深', '北方、西北及东北边疆的军政建置和部族关系仍有差异；行政名义、军镇和实际控制不能压成一条年度边界。'],
];

const years = [];
for (const [from, to, phase, finding] of phases) {
  for (let year = from; year <= to; year++) years.push({year, phase, finding});
}
if (years.length !== 23 || years[0].year !== 1271 || years.at(-1).year !== 1293) {
  throw new Error(`Unexpected annual ledger: ${years.length}`);
}

decision.verdict = 'leave-unfilled';
decision.sourceBoundaryIds = [];
decision.citationIds = [
  'yuan-nationalities-history', 'yuan-li-bingzhong', 'yuan-goryeo-records',
  'cliopatria', 'zizhi-tongjian', 'map-regulation',
];
decision.historicalTransitionCheck = '元1271—1293年逐年核对23个民用年：按改国号、南宋接管、1279年覆亡、统一后整合、对日战争、行省建置与边疆军政变化复核；没有任何年份具备可重发布的直接控制边界，全部明确留空。';
decision.rationale = '本段逐年登记为已核查但无可重发布年度疆域：现有Cliopatria 1352年轮廓不能回填1271—1293年的建国、战争、接管和行政整合过程；元朝名义疆域、行省范围、军镇和属国关系不自动等于逐年直接控制边界。合规标注：不复制未明确授权的历史地图或现代译文，保留来源与版本；依据《地图管理条例》公开历史地图和互联网地图服务需核验审核与审图号，项目当前仍为research-only。';
decision.reviewStatus = 'reviewed';
decision.reviewedAt = '2026-10-21';
await writeFile(decisionPath, `${JSON.stringify(decisions, null, 2)}\n`);

const fmt = year => `${year}年`;
const rows = years.map((item, index) => `| ${index + 1} | ${fmt(item.year)} | ${item.phase} | 已核查·留空 | ${item.finding} |`);
const report = `# 元1271—1293年长缺口专题复核（2026-10-21）

## 结论

- 缺口：1271—1293年，共23个民用年。
- 关键转折：1271年改国号、1276—1279年南宋核心区域接管与覆亡、1280—1281年统一后整合和对日战争，以及1282—1293年的行政与边疆重组。
- 逐年结论：23/23年完成核对并明确留空；没有新增边界面，也没有使用1352年最大轮廓桥接。
- 表达原则：区分名义疆域、行省/军政建置、属国关系、战争控制和稳定直接行政控制，不把它们自动合并为连续国界。

## 法律、许可与发布标注

- 本批不新增或重发布元代几何，只保留逐年研究记录和缺口状态；不复制未明确授权的历史地图、博物馆图件或现代译文。
- 历史原典进入公版并不意味着现代整理、翻译、网页图片或数据集没有版权条件；本专题只做短摘要并保留来源链接。
- 依据[《地图管理条例》](https://www.gov.cn/zhengce/zhengceku/2015-12/14/content_10403.htm)，公开历史地图和互联网地图服务需按适用规则核验审核、内容表示和审图号；项目当前为 research-only，没有审图号和有效期，不作为官方标准地图发布。
- 以上是项目合规标注，不构成针对具体出版、展示或互联网服务的法律意见；公开运营前应由发布地专业人员复核。

## 史料包

| 来源 | 用途 | 发布限制/注意 |
| --- | --- | --- |
| [元代历史沿革与行政建置资料](https://www.neac.gov.cn/seac/c103391/201806/1066616.shtml) | 1271年建国号、1279年统一与行省关系 | 概述不等于逐年边界测绘 |
| [刘秉忠与元初建国制度资料](https://www.neac.gov.cn/seac/c103391/202302/1161231.shtml) | 国号、大都和制度转折 | 不提供可重发布的年度边界坐标 |
| [《元史》《高丽史》编年资料](https://db.history.go.kr/ancient/level.do?levelId=jo_016r) | 元与高丽关系、战争和边疆变化 | 军役、外交和属国关系不直接生成国界 |
| [Cliopatria v0.2.1](https://doi.org/10.1038/s41597-025-04516-9) | 现有候选轮廓与版本核查 | CC BY 4.0；1352年轮廓被拒绝跨段回填 |

## 阶段核验

${phases.map(([from, to, phase, finding]) => `- ${fmt(from)}—${fmt(to)}，${phase}：${finding}`).join('\n')}

## 逐年登记

下表逐年记录政权阶段、实际控制判断与发布结论；“留空”是审核结果，不是漏记。

| 序号 | 年份 | 校勘阶段 | 结论 | 年度核验摘要 |
| ---: | --- | --- | --- | --- |
${rows.join('\n')}
`;
await writeFile(`${root}docs/audits/topics/yuan.md`, report);
console.log(JSON.stringify({id: decision.id, years: years.length, verdict: decision.verdict}));
