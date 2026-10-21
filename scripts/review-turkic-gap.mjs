import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const decisionPath = `${root}src/data/coverage-decisions.json`;
const decisions = JSON.parse(await readFile(decisionPath, 'utf8'));
const decision = decisions.find(item => item.id === 'gap-turkic-661-744');
if (!decision) throw new Error('Missing decision gap-turkic-661-744');

const phases = [
  [661, 681, '西突厥崩解后至后突厥复兴前', '661—681年处于西突厥余部、唐朝羁縻体系与草原部众重组期，不能把561—576年的第一突厥汗国轮廓延续到本段。'],
  [682, 691, '骨咄禄／颉跌利施可汗复兴', '后突厥重新建立并争夺漠北控制；起兵、迁牙与部众归附持续变化，没有逐年可重发布边界。'],
  [692, 715, '默啜可汗时期', '对唐、契丹、九姓铁勒等关系随战争与臣属变化，碑铭和编年可证明事件，不足以恢复每年直接控制线。'],
  [716, 716, '毗伽可汗即位与继承危机', '汗位更迭和内部冲突发生于年内，不能用前后稳定时期的轮廓替代。'],
  [717, 731, '毗伽可汗与阙特勤时期', '鄂尔浑碑铭和唐史可核对人物、战争与政治中心；影响圈、附属部落和直接统治区仍需分开，不能生成单一面。'],
  [732, 735, '阙特勤、毗伽可汗碑铭时期', '732、735年碑铭是重要一手遗存，但纪念碑地点和文字叙事不是年度边界数据；现代译文版权亦不作为复制材料。'],
  [736, 743, '毗伽可汗后期至乌苏米施可汗', '继承与部众关系恶化，后突厥控制范围持续收缩和分裂，不能用最大参考面覆盖。'],
  [744, 744, '后突厥覆亡与回鹘接替', '744年为政权终结和继承者更替年，突厥、拔悉密、回鹘的控制转换不适合绘制全年单一国界。'],
];

const years = [];
for (const [from, to, phase, finding] of phases) {
  for (let year = from; year <= to; year++) years.push({year, phase, finding});
}
if (years.length !== 84 || years[0].year !== 661 || years.at(-1).year !== 744) {
  throw new Error(`Unexpected annual ledger: ${years.length}`);
}

decision.verdict = 'leave-unfilled';
decision.sourceBoundaryIds = [];
decision.citationIds = [
  'turkic-history-db', 'turkic-orkhon-heritage', 'turkic-orkhon-collection',
  'cliopatria', 'zizhi-tongjian',
];
decision.historicalTransitionCheck = '突厥661—744年逐年核对84个民用年：先区分西突厥余部、唐朝羁縻体系与682年后突厥复兴，再核对汗位更迭、碑铭年代和744年覆亡；没有任何年份具备可重发布的直接控制边界，全部明确留空。';
decision.rationale = '本段逐年登记为已核查但无可重发布年度疆域：现有Cliopatria 561—576年第一突厥汗国最大轮廓不能跨越政权重组、后突厥复兴和744年继承转换回填；臣属、征伐、碑铭叙事与文化影响范围均不直接等于现代意义国界。法律与发布标注：仅保留来源与许可说明，不复制现代译文或受保护图件；项目当前仍为research-only，未取得审图号，不作为公开标准地图发布。';
decision.reviewStatus = 'reviewed';
decision.reviewedAt = '2026-10-21';
await writeFile(decisionPath, `${JSON.stringify(decisions, null, 2)}\n`);

const fmt = year => `${year}年`;
const rows = years.map((item, index) => `| ${index + 1} | ${fmt(item.year)} | ${item.phase} | 已核查·留空 | ${item.finding} |`);
const report = `# 突厥661—744年长缺口专题复核（2026-10-21）

## 结论

- 缺口：661—744年，共84个民用年。
- 政权身份：必须区分西突厥余部、唐朝羁縻体系、682年后突厥复兴及744年回鹘接替，不能把“突厥”作为连续不变的单一边界实体。
- 逐年结论：84/84年完成核对并明确留空；没有新增边界面，也没有使用561—576年最大轮廓桥接。
- 直接控制与影响：战争、朝贡、臣属、碑铭叙事和文化影响不自动转换为直接控制边界。

## 法律、许可与发布标注

- 本批不新增或重发布突厥几何，只有逐年校勘和缺口说明；因此不把无许可的历史地图、碑铭拓片或现代译文复制进项目。
- Cliopatria v0.2.1 的候选轮廓仍受 CC BY 4.0 署名、来源、版本和变更声明约束；本批明确拒绝使用该候选几何。
- UNESCO、数据库和博物馆页面只作事实核验来源；现代编译、译文、网页图件的版权与再利用条件不因历史年代而自动消失，正文只做短摘要并保留链接。
- 项目当前地图发布状态仍为 research-only，没有审图号和有效期；本专题不是官方标准地图，也不能替代地图审核、许可或其他适用资质。公开部署前必须重新核对底图、数据许可、署名和审图要求。
- 以上是项目合规标注，不构成针对具体发布行为的法律意见；如要公开运营，应由发布地的专业人员复核。

## 史料包

| 来源 | 用途 | 发布限制/注意 |
| --- | --- | --- |
| [《旧唐书》《新唐书》突厥传](https://db.history.go.kr/id/ko_034_1510_0070) | 唐与突厥关系、部落和政权转折 | 用于事实核验，不把史料叙事直接绘为边界 |
| [UNESCO鄂尔浑河谷文化景观资料](https://whc.unesco.org/uploads/nominations/1081rev.pdf) | 毗伽可汗、阙特勤及碑铭遗址年代 | 不复制现代译文、拓片或图件；遗址范围不是汗国疆域 |
| [University of Washington Silk Road资料](https://depts.washington.edu/silkroad/museums/ubhist/turk.html) | 突厥与回鹘遗址、继承关系交叉核验 | 仅作摘要与链接，不提取未明确许可的地图图件 |
| [Cliopatria v0.2.1](https://doi.org/10.1038/s41597-025-04516-9) | 现有候选轮廓与版本核查 | CC BY 4.0；561—576年轮廓被拒绝跨段回填 |

## 阶段核验

${phases.map(([from, to, phase, finding]) => `- ${fmt(from)}—${fmt(to)}，${phase}：${finding}`).join('\n')}

## 逐年登记

下表逐年记录身份、阶段、边界证据和发布结论；“留空”是审核结果，不是漏记。

| 序号 | 年份 | 校勘阶段 | 结论 | 年度核验摘要 |
| ---: | --- | --- | --- | --- |
${rows.join('\n')}
`;
await writeFile(`${root}docs/audits/topics/turkic-khaganates.md`, report);
console.log(JSON.stringify({id: decision.id, years: years.length, verdict: decision.verdict}));
