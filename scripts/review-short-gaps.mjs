import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const decisionsPath = `${root}src/data/coverage-decisions.json`;
const decisions = JSON.parse(await readFile(decisionsPath, 'utf8'));
const frozen = JSON.parse(await readFile(`${root}src/data/frozen-short-gaps.json`, 'utf8'));

// Each note is an explicit chronology judgment for one frozen row. These are intentionally
// conservative: a founding/extinction/restoration year is not treated as a stable annual border.
const transitionNotes = {
  'gap-han_warring--230--230': '前230年为韩被秦灭亡之年，年内控制变化使前一年轮廓不能代表全年。',
  'gap-chu_warring--223--223': '前223年为楚被秦攻灭的转折年，不能把前224年的残存范围平移为全年疆域。',
  'gap-yan_warring--222--222': '前222年为燕最终灭亡阶段，辽东残余与秦接管过程不宜压成单一面。',
  'gap-qin--221--219': '前221年完成灭齐统一，随后仍在重组郡县并向南北扩展，三年并非稳定断面。',
  'gap-qin--208--206': '前208至前206年处在秦末战争和秦政权覆亡阶段，最大版图会严重夸大实际控制。',
  'gap-han_western--206--203': '前206至前203年处在受封汉王及楚汉战争阶段，不能反推后来的西汉统一疆域。',
  'gap-han_western-6-9': '6至9年包含西汉末期权力转移及新朝建立，前期轮廓不能覆盖整个区间。',
  'gap-han_eastern-25-29': '25至29年为东汉建立及逐步恢复控制阶段，30年轮廓不能倒推至建国初年。',
  'gap-wei_three-220-223': '220至223年包含曹魏建国、蜀汉与孙吴名号变化，三方控制仍在调整。',
  'gap-wei_three-265-265': '265年发生魏晋禅代，曹魏终年轮廓具有明显的年内时点歧义。',
  'gap-shu_three-221-223': '221至223年包含蜀汉建国、夷陵战争与刘备去世，不能用224年断面回填。',
  'gap-shu_three-263-263': '263年蜀汉在魏灭蜀战争中覆亡，上一年轮廓不代表该年持续变化的控制。',
  'gap-cheng_han-304-305': '304至305年为成汉政权草创期，306年的控制面不能直接回推。',
  'gap-cheng_han-347-347': '347年成汉被东晋桓温所灭，终结年不采用此前最大范围。',
  'gap-former_zhao-304-305': '304至305年为汉赵政权建立初期，名号与控制范围尚未形成稳定年度断面。',
  'gap-former_qin-351-352': '351至352年为前秦建立和称帝阶段，353年轮廓不反推至草创期。',
  'gap-former_qin-394-394': '394年为前秦灭亡年，末期据点变化不适合用此前疆域替代。',
  'gap-later_yan-384-386': '384至386年为后燕建立与扩张阶段，387年断面不能代表此前三年。',
  'gap-later_qin-384-386': '384至386年为后秦建立及早期战争阶段，后续轮廓不作逆向平移。',
  'gap-later_qin-417-417': '417年后秦被东晋刘裕所灭，灭亡年的实际控制不能用416年前轮廓代替。',
  'gap-xia-407-409': '407至409年为赫连氏夏政权建立初期；本条不是上古夏代，410年轮廓不回填。',
  'gap-wei_northern-386-386': '386年为北魏重建并改国号的起点，387年轮廓不足以证明建国当年边界。',
  'gap-wei_northern-534-534': '534年北魏分裂为东魏、西魏，旧政权终年没有可稳定表达的单一疆域。',
  'gap-qi_southern-479-479': '479年发生宋齐禅代，南齐建立当年的接管过程不等同于480年断面。',
  'gap-chen_southern-557-560': '557至560年为陈朝建立并应对周边战争的初期，561年轮廓不向前外推。',
  'gap-qi_northern-550-554': '550至554年为北齐建国初期及北方格局调整期，555年轮廓不回填。',
  'gap-qi_northern-577-577': '577年北齐被北周攻灭，灭亡年不能沿用576年的完整控制范围。',
  'gap-zhou_northern-557-560': '557至560年为北周建国初期，西魏旧制转换与对外战争使边界并不稳定。',
  'gap-tang-618-622': '618至622年为唐建立并逐步消灭各地割据势力的统一战争阶段。',
  'gap-liang_later-907-910': '907至910年为后梁代唐及五代格局形成期，911年断面不能倒推。',
  'gap-tang_later-923-925': '923至925年包含后唐建国、灭后梁及灭前蜀，控制范围快速变化。',
  'gap-tang_later-936-936': '936年后唐灭亡并由后晋取代，终结年不采用此前疆域。',
  'gap-jin_later-947-947': '947年后晋覆亡并出现契丹接管与中原政权重组，不宜画成固定面。',
  'gap-xiongnu--209--209': '前209年前后处在冒顿单于权力重组阶段，前208年断面不能证明起始年范围。',
  'gap-goguryeo--37--37': '前37年是高句丽传统建国纪年，后一年来源断面不足以证明建国当年疆域。',
  'gap-turkic-552-554': '552至554年为突厥汗国建立与快速扩张阶段，555年轮廓不作逆推。',
  'gap-tibetan_empire-618-622': '618至622年处在吐蕃早期整合阶段，同时期唐建国事件不构成吐蕃边界证据。',
  'gap-nanzhao-738-740': '738至740年为南诏受封和早期整合阶段，741年轮廓不能自动代表前三年。',
  'gap-zhou_eastern--256--256': '前256年秦灭东周王室，王畿终结年的范围不能由前257年前记录平移。',
  'gap-wu_zhou-705-705': '705年神龙政变后武周结束、唐复辟，政权更替年不保留旧朝完整疆域面。',
  'gap-western_qin-385-386': '385至386年为西秦建立初期，387年断面不足以支持向前回填。',
  'gap-western_qin-409-409': '409年为西秦复国节点，前后来源属于不同存续阶段，不能机械桥接。',
  'gap-later_liang-386-386': '386年为后凉政权形成初期，387年来源轮廓不证明起始年控制范围。',
  'gap-southern_liang-414-414': '414年南凉覆亡并归于西秦，终结年不采用此前完整控制面。',
  'gap-southern_yan-398-401': '398至401年为南燕建立和定都过程，402年断面不能回填草创阶段。',
  'gap-southern_yan-410-410': '410年南燕被东晋刘裕攻灭，灭亡年控制范围持续收缩。',
  'gap-northern_yan-407-409': '407至409年为北燕政权形成与内部更替阶段，410年断面不作逆推。',
  'gap-song_northern-960-960': '960年北宋建立但统一战争尚未完成，961年轮廓也不能等同于建国当日。',
  'gap-song_south-1279-1279': '1279年南宋在崖山战役后灭亡，上一年轮廓不能代表终结年实际控制。',
  'gap-western_xia-1227-1227': '1227年西夏在蒙古战争中灭亡，终结年不沿用1226年的完整疆域。',
  'gap-western_liao-1124-1125': '1124至1125年为西辽建立与向中亚迁移扩张阶段，1126年断面不回填。',
  'gap-ming_southern-1644-1644': '1644年南明建立且多方政权并立，1645年的来源面不能代表全年。',
  'gap-ming_southern-1659-1662': '1659至1662年为南明残余政权持续收缩并终结阶段，最大轮廓会夸大控制。',
  'gap-later_jin-1616-1618': '1616至1618年为后金建立和早期扩张阶段，1619年断面不向前平移。',
  'gap-later_jin-1636-1636': '1636年后金改国号为清，旧政权终年与新政权转换不能画作稳定旧疆域。',
  'gap-qing-1912-1912': '1912年清帝退位并建立共和政权，年内政权转换不采用1911年轮廓。',
  'gap-prc-1949-1949': '1949年中华人民共和国成立且全国控制格局仍在变化，1950年轮廓不回填建国年。',
  'gap-prc-2025-2026': '2025至2026年没有已知政权更替，采用同一政权2024年来源轮廓仅作C级临近参考。',
  'gap-wuyue-907-910': '907至910年处在唐亡后吴越政权名号与区域秩序重组期，911年断面不回填。',
  'gap-min-909-910': '909至910年为闽政权形成初期，911年来源面不足以证明此前控制范围。',
  'gap-chu_ten-907-910': '907至910年为马楚在唐亡后的政权形成期，911年断面不作逆推。',
  'gap-former_shu-907-910': '907至910年为前蜀称帝和制度建立阶段，911年轮廓不能自动代表建国初期。',
  'gap-later_shu-934-935': '934至935年为后蜀建立初期，936年来源轮廓不向前外推。',
  'gap-jingnan-924-925': '924至925年为荆南政权形成初期，926年断面不足以证明草创期疆域。',
};

const frozenIds = new Set(frozen.rows.map(row => row.id));
const alreadyReviewed = new Set(['gap-gengshi-23-25']);
const expectedOverrides = [...frozenIds].filter(id => !alreadyReviewed.has(id));
if (expectedOverrides.length !== Object.keys(transitionNotes).length ||
    expectedOverrides.some(id => !transitionNotes[id])) {
  throw new Error('Short-gap review notes do not exactly match the frozen batch');
}

for (const decision of decisions) {
  if (!frozenIds.has(decision.id) || alreadyReviewed.has(decision.id)) continue;
  const note = transitionNotes[decision.id];
  const isCurrentContinuation = decision.id === 'gap-prc-2025-2026';
  decision.verdict = isCurrentContinuation ? 'nearest-same-polity' : 'leave-unfilled';
  decision.sourceBoundaryIds = isCurrentContinuation ? ['clio-13616-prc-2024'] : [];
  decision.citationIds = [...new Set([
    ...decision.citationIds,
    'china-chronology',
    ...(decision.from >= -403 && decision.to <= 959 ? ['zizhi-tongjian'] : []),
  ])];
  decision.historicalTransitionCheck = `${decision.id}逐段复核：${note}`;
  decision.rationale = isCurrentContinuation
    ? `${note}该轮廓不是2025或2026年独立测绘结果，也不是公开发布所需的官方标准地图。`
    : `${note}因此本段明确留空，不以该政权其他年代的最大或最近轮廓冒充所选年份实况。`;
  decision.reviewStatus = 'reviewed';
  decision.reviewedAt = '2026-10-20';
}

await writeFile(decisionsPath, `${JSON.stringify(decisions, null, 2)}\n`);
console.log(JSON.stringify({ reviewedShortGaps: frozen.count, overrides: Object.keys(transitionNotes).length }));
