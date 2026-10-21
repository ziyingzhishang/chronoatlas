import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const decisionPath = `${root}src/data/coverage-decisions.json`;
const decisions = JSON.parse(await readFile(decisionPath, 'utf8'));
const decision = decisions.find(item => item.id === 'gap-northern_yuan-1440-1467');
if (!decision) throw new Error('Missing decision gap-northern_yuan-1440-1467');

const phases = [
  [1440, 1443, '也先势力扩张与蒙古诸部整合', '瓦剌、鞑靼及东蒙古诸部关系持续调整，联盟和军事控制不能压成统一年度边界。'],
  [1444, 1448, '明蒙战争与北方边疆重组', '明方边防、蒙古诸部和贸易使团关系变化频繁；明朝防御设施不等于北元控制线。'],
  [1449, 1449, '土木之变与政治重构', '年内发生战争、皇帝被俘和权力重组，不能使用前后任一稳定轮廓代表全年。'],
  [1450, 1453, '也先与脱脱不花并立', '汗权、瓦剌军事权力和东蒙古部众之间存在竞争，名义汗统与实际控制需分开。'],
  [1454, 1454, '也先被杀与分裂', '也先死后政权迅速分化，单一“北元”面无法表达年内转折。'],
  [1455, 1467, '瓦剌与鞑靼等势力分立', '后续部族联盟和汗统不断变化，现有1519年北元轮廓不能向前外推。'],
];

const years = [];
for (const [from, to, phase, finding] of phases) {
  for (let year = from; year <= to; year++) years.push({year, phase, finding});
}
if (years.length !== 28 || years[0].year !== 1440 || years.at(-1).year !== 1467) {
  throw new Error(`Unexpected annual ledger: ${years.length}`);
}

decision.verdict = 'leave-unfilled';
decision.sourceBoundaryIds = [];
decision.citationIds = [
  'northern-yuan-early-ming', 'northern-yuan-yesen', 'cliopatria',
  'china-chronology', 'map-regulation',
];
decision.historicalTransitionCheck = '北元1440—1467年逐年核对28个民用年：按也先扩张、明蒙战争、1449年土木之变、也先与脱脱不花并立、1454年分裂及其后瓦剌与鞑靼重组复核；政权身份和直接控制均不稳定，没有可重发布的年度单一边界，全部明确留空。';
decision.rationale = '本段逐年登记为已核查但无可重发布年度疆域：现有Cliopatria 1519年北元轮廓不能回填1440—1467年的部族联盟、汗权竞争和明蒙边疆战争；明方防御线、蒙古名义汗统、瓦剌军事权力和部众影响范围不自动等于北元直接控制边界。合规标注：不复制未明确授权的历史地图或现代译文，保留来源与版本；依据《地图管理条例》公开历史地图和互联网地图服务需核验审核与审图号，项目当前仍为research-only。';
decision.reviewStatus = 'reviewed';
decision.reviewedAt = '2026-10-21';
await writeFile(decisionPath, `${JSON.stringify(decisions, null, 2)}\n`);

const fmt = year => `${year}年`;
const rows = years.map((item, index) => `| ${index + 1} | ${fmt(item.year)} | ${item.phase} | 已核查·留空 | ${item.finding} |`);
const report = `# 北元1440—1467年长缺口专题复核（2026-10-21）

## 结论

- 缺口：1440—1467年，共28个民用年。
- 关键转折：也先势力扩张、明蒙战争、1449年土木之变、也先与脱脱不花并立、1454年也先被杀及其后瓦剌/鞑靼分立。
- 逐年结论：28/28年完成核对并明确留空；没有新增边界面，也没有使用1519年最大轮廓桥接。
- 表达原则：区分元室汗统、瓦剌军事权力、东蒙古部众、明方防御线和实际直接控制，不以“北元”标签覆盖所有蒙古势力。

## 法律、许可与发布标注

- 本批不新增或重发布北元几何，只保留逐年研究记录和缺口状态；不复制未明确授权的历史地图、博物馆图件或现代译文。
- 明代官文书、现代整理和网页图像的版权/使用条件分别处理；历史称谓中的贬义或敌对用语只作为史料现象说明，不作为项目标签或现实政治判断。
- 依据[《地图管理条例》](https://www.gov.cn/zhengce/zhengceku/2015-12/14/content_10403.htm)，公开历史地图和互联网地图服务需按适用规则核验审核、内容表示和审图号；项目当前为 research-only，没有审图号和有效期，不作为官方标准地图发布。
- 以上是项目合规标注，不构成针对具体出版、展示或互联网服务的法律意见；公开运营前应由发布地专业人员复核。

## 史料包

| 来源 | 用途 | 发布限制/注意 |
| --- | --- | --- |
| [明代北方边疆与蒙元余部资料](https://www.chnmuseum.cn/zp/zpml/csp/202008/t20200826_247448.shtml) | 明方防御体系与蒙元余部背景 | 防御线不等于蒙古直接控制边界 |
| [也先与脱脱不花关系资料](https://db.history.go.kr/diachronic/level.do?levelId=oh_009_0020_0010_0030) | 1449—1454年汗权与政权重组 | 明代叙述与政权身份、控制关系分开 |
| [Cliopatria v0.2.1](https://doi.org/10.1038/s41597-025-04516-9) | 现有候选轮廓与版本核查 | CC BY 4.0；1519年轮廓被拒绝跨段回填 |

## 阶段核验

${phases.map(([from, to, phase, finding]) => `- ${fmt(from)}—${fmt(to)}，${phase}：${finding}`).join('\n')}

## 逐年登记

下表逐年记录政权身份、直接控制判断与发布结论；“留空”是审核结果，不是漏记。

| 序号 | 年份 | 校勘阶段 | 结论 | 年度核验摘要 |
| ---: | --- | --- | --- | --- |
${rows.join('\n')}
`;
await writeFile(`${root}docs/audits/topics/northern-yuan.md`, report);
console.log(JSON.stringify({id: decision.id, years: years.length, verdict: decision.verdict}));
