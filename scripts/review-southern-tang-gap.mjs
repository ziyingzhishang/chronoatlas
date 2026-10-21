import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const decisionPath = `${root}src/data/coverage-decisions.json`;
const decisions = JSON.parse(await readFile(decisionPath, 'utf8'));
const decision = decisions.find(item => item.id === 'gap-southern_tang-937-959');
if (!decision) throw new Error('Missing decision gap-southern_tang-937-959');

const phases = [
  [937, 939, '杨吴禅代、南唐建国与改国号', '937年政权更替、建国与金陵建都，939年改国号为唐；年内身份转换不适合用960年轮廓回填。'],
  [940, 944, '烈祖后期与江淮整合', '南唐经营江淮、地方节度和邻国关系仍在调整，行政沿革记录不能直接生成全境边界。'],
  [945, 947, '南唐介入闽地与区域战争', '闽亡及相关军事行动造成控制范围变化，战争占领、附属关系和稳定直辖区不能压成单一年度面。'],
  [948, 951, '中主时期与南方政权竞争', '南唐、南汉、楚及后周等关系持续变化；951年楚亡进一步改变区域格局，不能使用后期最大轮廓。'],
  [952, 955, '内外整合与后周压力上升', '地方军政体系、边境防务和中原压力并行，来源不足以重建逐年直接控制线。'],
  [956, 958, '后周南征与南唐割地称臣', '后周进攻导致南唐重大收缩，958年去帝号、奉后周正朔等政治变化使名义与实际控制不一致。'],
  [959, 959, '后周末期的依附状态与再转折', '959年后周政局变化临近宋代周，南唐的外交依附和江南实际控制不能用稳定单一疆域表达。'],
];

const years = [];
for (const [from, to, phase, finding] of phases) {
  for (let year = from; year <= to; year++) years.push({year, phase, finding});
}
if (years.length !== 23 || years[0].year !== 937 || years.at(-1).year !== 959) {
  throw new Error(`Unexpected annual ledger: ${years.length}`);
}

decision.verdict = 'leave-unfilled';
decision.sourceBoundaryIds = [];
decision.citationIds = [
  'southern-tang-nanjing', 'southern-tang-periods', 'southern-tang-local-administration',
  'cliopatria', 'zizhi-tongjian', 'map-regulation',
];
decision.historicalTransitionCheck = '南唐937—959年逐年核对23个民用年：按杨吴禅代、南唐建国、939年改国号、闽地战争、楚亡、后周南征、958年割地称臣及959年政局转折复核；没有任何年份具备可重发布的直接控制边界，全部明确留空。';
decision.rationale = '本段逐年登记为已核查但无可重发布年度疆域：现有Cliopatria 960年轮廓不能回填937—959年的建国、区域战争、行政整合和后周南征收缩；节度辖区、战争占领、奉正朔和臣属关系不自动等于南唐逐年直接控制边界。合规标注：不复制未明确授权的历史地图或现代译文，保留来源与版本；依据《地图管理条例》公开历史地图和互联网地图服务需核验审核与审图号，项目当前仍为research-only。';
decision.reviewStatus = 'reviewed';
decision.reviewedAt = '2026-10-21';
await writeFile(decisionPath, `${JSON.stringify(decisions, null, 2)}\n`);

const fmt = year => `${year}年`;
const rows = years.map((item, index) => `| ${index + 1} | ${fmt(item.year)} | ${item.phase} | 已核查·留空 | ${item.finding} |`);
const report = `# 南唐937—959年长缺口专题复核（2026-10-21）

## 结论

- 缺口：937—959年，共23个民用年。
- 关键转折：杨吴禅代与南唐建国、939年改国号、闽地战争、楚亡、后周南征、958年割地称臣，以及959年后周末期再转折。
- 逐年结论：23/23年完成核对并明确留空；没有新增边界面，也没有使用960年最大轮廓桥接。
- 表达原则：区分节度辖区、战争占领、奉正朔/臣属关系和稳定直接控制，不把名义秩序绘成连续国界。

## 法律、许可与发布标注

- 本批不新增或重发布南唐几何，只保留逐年研究记录和缺口状态；不复制未明确授权的历史地图、博物馆图件或现代译文。
- 地方志网页、现代整理和图像的版权/使用条件分别处理；正文只做短摘要并保留来源链接。
- 依据[《地图管理条例》](https://www.gov.cn/zhengce/zhengceku/2015-12/14/content_10403.htm)，公开历史地图和互联网地图服务需按适用规则核验审核、内容表示和审图号；项目当前为 research-only，没有审图号和有效期，不作为官方标准地图发布。
- 以上是项目合规标注，不构成针对具体出版、展示或互联网服务的法律意见；公开运营前应由发布地专业人员复核。

## 史料包

| 来源 | 用途 | 发布限制/注意 |
| --- | --- | --- |
| [南唐建国与金陵都城资料](https://dfz.nanjing.gov.cn/ztzl/njzj/szcs/201003/P020210517531284843988.pdf) | 937年建国、建都与地方背景 | 不提供全境逐年边界；不复制图件 |
| [五代十国分期与南唐背景](https://db.history.go.kr/diachronic/level.do?levelId=oh_004_0020_0010_0010) | 五代政权更替、后周与南唐关系 | 名义秩序与直接控制分开 |
| [南唐地方行政沿革](https://www.jxln.gov.cn/lnzf/c103681/202204/84b6e20b0bfb40f8b611722e1ec9f976.shtml) | 937—953年局部节度和行政沿革 | 局部资料不外推为全境国界 |
| [Cliopatria v0.2.1](https://doi.org/10.1038/s41597-025-04516-9) | 现有候选轮廓与版本核查 | CC BY 4.0；960年轮廓被拒绝跨段回填 |

## 阶段核验

${phases.map(([from, to, phase, finding]) => `- ${fmt(from)}—${fmt(to)}，${phase}：${finding}`).join('\n')}

## 逐年登记

下表逐年记录政权阶段、直接控制判断与发布结论；“留空”是审核结果，不是漏记。

| 序号 | 年份 | 校勘阶段 | 结论 | 年度核验摘要 |
| ---: | --- | --- | --- | --- |
${rows.join('\n')}
`;
await writeFile(`${root}docs/audits/topics/southern-tang.md`, report);
console.log(JSON.stringify({id: decision.id, years: years.length, verdict: decision.verdict}));
