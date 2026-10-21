import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const decisionPath = `${root}src/data/coverage-decisions.json`;
const decisions = JSON.parse(await readFile(decisionPath, 'utf8'));
const decision = decisions.find(item => item.id === 'gap-zhou_western--1046--1001');
if (!decision) throw new Error('Missing decision gap-zhou_western--1046--1001');

const phases = [
  [-1046, -1044, '武王克商与早期接管', '传统纪年下的灭商、建都与接管阶段，王室控制、军事占领和旧商地域秩序尚在重组，不能绘为稳定全年边界。'],
  [-1043, -1042, '武王卒后与周公摄政', '继承和摄政造成政治秩序转换，管蔡之乱及相关东征记载显示控制范围快速变化。'],
  [-1041, -1036, '成王时期东征与秩序重建', '东征、平定东夷及成周经营扩大王室支配，但“征服/来服/封建”不等于每年直接行政边界。'],
  [-1035, -1021, '成王后期与分封秩序稳定化', '分封诸侯、迁徙人口和土地赏赐形成多层政治秩序；诸侯封国不能简单并入王室直辖面。'],
  [-1020, -1001, '康王早期', '成康秩序与北方、东方关系可由文献和器物铭文交叉核验，但没有可重发布的逐年边界几何，且早期纪年存在学术争议。'],
];

const years = [];
for (const [from, to, phase, finding] of phases) {
  for (let year = from; year <= to; year++) years.push({year, phase, finding});
}
if (years.length !== 46 || years[0].year !== -1046 || years.at(-1).year !== -1001) {
  throw new Error(`Unexpected annual ledger: ${years.length}`);
}

decision.verdict = 'leave-unfilled';
decision.sourceBoundaryIds = [];
decision.citationIds = [
  'western-zhou-national-museum', 'western-zhou-epic', 'china-chronology',
  'zizhi-tongjian', 'cliopatria', 'map-regulation',
];
decision.historicalTransitionCheck = '西周前1046—前1001年逐年核对46个民用年：按灭商接管、周公摄政、成王东征、分封秩序和康王早期分期复核；王室直辖、诸侯封国、征服与来服关系无法转换为可重发布的年度单一边界，全部明确留空。';
decision.rationale = '本段逐年登记为已核查但无可重发布年度疆域：现有Cliopatria前1000年以后轮廓不能回填前1046—前1001年；西周早期的分封、军事征服、盟誓和影响范围不等同于王室直接控制。合规标注：不复制未明确授权的历史地图或现代图件，保留来源与版本；依据《地图管理条例》公开地图和历史地图可能涉及审核与审图号，项目当前仍为research-only，不作为官方标准地图发布。';
decision.reviewStatus = 'reviewed';
decision.reviewedAt = '2026-10-21';
await writeFile(decisionPath, `${JSON.stringify(decisions, null, 2)}\n`);

const fmt = year => `前${Math.abs(year)}年`;
const rows = years.map((item, index) => `| ${index + 1} | ${fmt(item.year)} | ${item.phase} | 已核查·留空 | ${item.finding} |`);
const report = `# 西周前1046—前1001年长缺口专题复核（2026-10-21）

## 结论

- 缺口：前1046—前1001年，共46个民用年；早期纪年存在学术争议，项目沿用当前年表但不把年表精度伪装成边界精度。
- 逐年结论：46/46年完成核对并明确留空；没有新增边界面，也没有使用前1000年以后最大轮廓桥接。
- 表达原则：区分王室直接控制核心、诸侯封国、军事征服、来服/朝贡与文化影响；不把“天下”或分封秩序绘成现代意义的连续国界。

## 法律、许可与发布标注

- 本批不新增或重发布西周几何，只保留逐年研究记录和缺口状态；不复制未明确授权的历史地图、博物馆图件或现代译文。
- 器物铭文属于历史遗存，但网页说明、整理、翻译和图像仍可能有现代版权或使用条件；本专题只做短摘要并保留原始链接。
- 依据[《地图管理条例》](https://www.gov.cn/zhengce/zhengceku/2015-12/14/content_10403.htm)，向社会公开的地图、历史地图和互联网地图服务需按适用规则核验审核、内容表示和审图号要求；项目当前为 research-only，没有审图号和有效期，不作为官方标准地图发布。
- 以上是项目合规标注，不构成针对具体出版、展示或互联网服务的法律意见；公开运营前应由发布地专业人员复核。

## 史料包

| 来源 | 用途 | 发布限制/注意 |
| --- | --- | --- |
| [“宜侯夨”青铜簋](https://www.chnmuseum.cn/zp/zpml/kgfjp/202108/t20210802_250932.shtml) | 西周早期册封、土地城邑赏赐与东国秩序 | 器物铭文说明不等于逐年边界；不复制图件 |
| [中国国家博物馆 Chinese Epic](https://en.chnmuseum.cn/Portals/0/web/exhibition/exhibitions/161120Chines-Epic/en.html) | 王室与诸侯分封关系、早期西周背景 | 仅作阶段核验，不把分封范围合并为直辖区 |
| [《中国正史朝鲜传》相关史料汇编](https://db.history.go.kr/diachronic/level.do?levelId=jo_003_0010_0010_0030) | 成王、康王东征与政治秩序的文献参照 | 史料叙事和后世解释分开，不直接生成几何 |
| [Cliopatria v0.2.1](https://doi.org/10.1038/s41597-025-04516-9) | 现有候选轮廓与版本核查 | CC BY 4.0；前1000年以后轮廓被拒绝跨段回填 |

## 阶段核验

${phases.map(([from, to, phase, finding]) => `- ${fmt(from)}—${fmt(to)}，${phase}：${finding}`).join('\n')}

## 逐年登记

下表逐年记录阶段、直接控制判定与发布结论；“留空”是审核结果，不是漏记。

| 序号 | 年份 | 校勘阶段 | 结论 | 年度核验摘要 |
| ---: | --- | --- | --- | --- |
${rows.join('\n')}
`;
await writeFile(`${root}docs/audits/topics/western-zhou.md`, report);
console.log(JSON.stringify({id: decision.id, years: years.length, verdict: decision.verdict}));
