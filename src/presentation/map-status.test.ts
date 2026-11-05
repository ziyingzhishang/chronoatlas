import { expect, test } from 'vitest';
import type { Polity } from '../domain/types';
import { getHistoricalState } from '../domain/history-state';
import { formatPresentDistance, primaryPolityName, polityDisplayName, yearsFromPresent } from './map-status';

test.each([
  [800, 2026, { relation: 'past', years: 1226 }],
  [-221, 2026, { relation: 'past', years: 2246 }],
  [2026, 2026, { relation: 'present', years: 0 }],
  [2027, 2026, { relation: 'future', years: 1 }],
] as const)('calculates historical year %s relative to %s without a year zero', (year, present, expected) => {
  expect(yearsFromPresent(year, present)).toEqual(expected);
});

test('formats reader-facing distance labels in Chinese and English', () => {
  expect(formatPresentDistance({ relation: 'past', years: 1226 }, 'zh-CN')).toBe('距今1226年');
  expect(formatPresentDistance({ relation: 'past', years: 1226 }, 'en')).toBe('1,226 years ago');
  expect(formatPresentDistance({ relation: 'present', years: 0 }, 'zh-CN')).toBe('今年');
  expect(formatPresentDistance({ relation: 'future', years: 1 }, 'zh-CN')).toBe('距今尚有1年');
});

test('labels the 256 BCE Zhou royal termination separately from the Eastern Zhou lordship', () => {
  const state = getHistoricalState(-256);
  expect(polityDisplayName(state.activePolities, -256)).toContain('周王室终止');
  expect(polityDisplayName(state.activePolities, -256)).toContain('东周君国');
});

test.each([402, 403, 404, 405, 406])('keeps Western Liang visible in the %s annual status', year => {
  const state = getHistoricalState(year);
  expect(state.activePolities.map(polity => polity.id)).toContain('western_liang');
  expect(polityDisplayName(state.activePolities, year)).toContain('西凉');
  expect(polityDisplayName(state.activePolities, year)).toContain(year <= 404 ? '敦煌' : '酒泉');
  expect(polityDisplayName(state.activePolities, year)).toContain('东晋');
});

test.each([
  [-57, ['silla', 'han_western'], '西汉—新罗传统建国年'],
  [-37, ['silla', 'han_western', 'goguryeo'], '西汉—高句丽、新罗并存；传统建国年；纥升骨城／五女山为早期中心候选；不确认建国仪式点；疆域未定'],
  [101, ['silla', 'han_eastern'], '东汉；新罗并存'],
  [200, ['silla', 'han_eastern'], '东汉；新罗并存'],
  [377, ['silla', 'jin_eastern'], '东晋；新罗并存'],
] as const)('includes Silla in the annual map status for %s', (year, ids, expected) => {
  const state = getHistoricalState(year);
  expect(state.activePolities.map(polity => polity.id)).toEqual(expect.arrayContaining([...ids]));
  expect(polityDisplayName(state.activePolities, state.year)).toBe(expected);
});

test('keeps Silla visible in every researched annual map status except the approved exact 25 CE transition title', () => {
  for (let year = -57; year <= 377; year += 1) {
    if (year === 0 || year === 25) continue;
    const state = getHistoricalState(year);
    expect(polityDisplayName(state.activePolities, state.year), `Silla should be named in ${year}`).toContain('新罗');
  }
  expect(polityDisplayName(getHistoricalState(25).activePolities, 25)).toBe('更始—东汉交替');
});

test('selects the first Chinese polity and never substitutes a world polity id', () => {
  const base = {
    type: 'regime', startYear: 618, endYear: 907, color: '#000', description: '', sourceIds: [],
  } satisfies Omit<Polity, 'id' | 'name'>;
  const polities: Polity[] = [
    { ...base, id: 'world-test', name: 'Rome', region: 'world' },
    { ...base, id: 'tang', name: '唐' },
  ];

  expect(primaryPolityName(polities)).toBe('唐');
  expect(primaryPolityName([{ ...base, id: 'world-test', name: 'Rome', region: 'world' }])).toBeUndefined();
});

test.each([
  [-2070, '夏（传统纪年）—现有证据不支持空间表达'],
  [-1751, '夏（传统纪年）—现有证据不支持空间表达'],
  [-1750, '夏（传统纪年）—二里头文化核心参照点；不代表夏疆界'],
  [-1700, '夏（传统纪年）—二里头文化核心参照点；不代表夏疆界'],
  [-1600, '夏（传统纪年）—二里头文化核心参照点；不代表夏疆界'],
] as const)('labels the evidence-limited Xia map expression in %s', (year, expected) => {
  const state = getHistoricalState(year);
  expect(state.activePolities.map(polity => polity.id)).toContain('xia_early');
  expect(polityDisplayName(state.activePolities, year)).toBe(expected);
});

test.each([
  [1916, '北京政府中心；袁世凯去世、黎元洪继任；地方军政分裂；疆域未定'],
  [1917, '北京政府—广州护法军政府并立；北京为中央中心；疆域未定'],
  [1918, '北京政府、广州南方政权并存；外交承认不等于全国控制；疆域未定'],
  [1919, '北京政府以北京为中心；南方反对派与区域军政势力并存；疆域未定'],
  [1920, '北京政府中心；直皖战争改变北洋权力；南方与地方势力并存；疆域未定'],
  [1921, '北京政府—广州非常大总统政权并立；北京、广州为政治中心；疆域未定'],
  [1922, '北京政府—南方政权并立；直奉等军系掌握区域军力；战事不作疆界'],
  [1923, '北京政府—广州南方政权并存；广州大元帅大本营；疆域未定'],
  [1924, '北京政府年内权力更迭；北京政变、段祺瑞执政；各方边界未定'],
  [1925, '北京、广州政治中心并立；地方军阀掌握区域行政；疆域未定'],
  [1926, '北京政府与广州国民政府并存；北伐启动，战线不作疆界'],
  [1927, '北京、武汉、南京国民政府阶段并存、争夺中央代表权；疆域未定'],
  [1928, '南京国民政府6月接收北平、12月东北易帜；形式统一不等于全年直接控制；疆域未定'],
  [1929, '南京为中央政治中心；地方实力派仍掌握军政；全国直辖疆域未定'],
] as const)('labels the Republic era annual political divisions in %s', (year, expected) => {
  const state = getHistoricalState(year);
  expect(state.activePolities.map(polity => polity.id)).toContain('republic');
  expect(polityDisplayName(state.activePolities, year)).toBe(expected);
});

test('labels the 1949 founding transition without implying a full-year national border', () => {
  const state = getHistoricalState(1949);
  expect(state.activePolities.map(polity => polity.id)).toEqual(expect.arrayContaining(['republic', 'prc']));
  expect(polityDisplayName(state.activePolities, 1949)).toBe(
    '中华民国—中华人民共和国交替；10月1日北京建政事件点；年内接收未完成；疆域未定',
  );
});

test.each([2025, 2026])('labels the %s PRC outline as a non-annual reference', year => {
  const state = getHistoricalState(year);
  expect(polityDisplayName(state.activePolities, year)).toBe(
    '中华人民共和国；显示2024年C级近邻参考面；非本年疆界核定',
  );
});

test('labels the Later Jin to Qing transition in 1636 without implying a territory', () => {
  const state = getHistoricalState(1636);
  expect(state.activePolities.map(polity => polity.id)).toEqual(expect.arrayContaining(['ming', 'later_jin', 'qing']));
  expect(polityDisplayName(state.activePolities, 1636)).toBe(
    '明并存；后金年内改国号为清、皇太极在盛京称帝；盛京为建政事件地点，不作疆域',
  );
});

test.each([
  [1616, '明、后金、北元并存；后金建政、都赫图阿拉；中心点不表示疆界'],
  [1617, '明、后金、北元并存；赫图阿拉为都；科尔沁来朝不推定臣属或疆域'],
  [1618, '明、后金、北元并存；赫图阿拉为都；七大恨后对明用兵，战事不作疆界'],
] as const)('labels the Later Jin founding context in %s', (year, expected) => {
  const state = getHistoricalState(year);
  expect(state.activePolities.map(polity => polity.id)).toEqual(expect.arrayContaining(['ming', 'later_jin', 'northern_yuan']));
  expect(polityDisplayName(state.activePolities, year)).toBe(expected);
});

test.each([
  [1659, '南明永历朝廷由云南撤入缅甸；流亡路线不作疆域；清并存'],
  [1660, '永历朝廷处于缅甸流亡；滇缅战事与朝廷驻留分开；疆域留空；清并存'],
  [1661, '永历朝廷仍在缅甸及滇缅交涉阶段；各方军事活动不作南明控制面；清并存'],
  [1662, '永历帝被执献、押回昆明并遇害；永历政权主要政治延续终止；事件点不作疆域；地方抗清力量另存；清并存'],
] as const)('labels the Southern Ming exile and termination stage in %s', (year, expected) => {
  const state = getHistoricalState(year);
  expect(state.activePolities.map(polity => polity.id)).toEqual(expect.arrayContaining(['ming_southern', 'qing']));
  expect(polityDisplayName(state.activePolities, year)).toBe(expected);
});

test.each([
  [1440, '也先承接脱欢后的瓦剌权力；蒙古诸部整合中；无可定位中心或疆界'],
  [1449, '瓦剌也先入明；土木堡事件点为近似位置；军事行动不作疆界；蒙古势力范围未定'],
  [1450, '也先送还英宗、与明议和；蒙古内部权力竞争；疆域留空'],
  [1454, '也先杀脱脱不花并称汗、当年被杀；蒙古势力再分裂；不绘疆域'],
  [1455, '蒙古诸部多集团并存；单一北元控制范围未明；疆域留空'],
  [1467, '明、朝鲜联合攻建州女真；此为东北邻接事件，不作北元疆界；蒙古诸部范围未定'],
] as const)('labels Northern Yuan evidence limits and coexisting powers in %s', (year, expected) => {
  const state = getHistoricalState(year);
  expect(state.activePolities.map(polity => polity.id)).toContain('northern_yuan');
  expect(polityDisplayName(state.activePolities, year)).toBe(expected);
});

test.each([
  [1271, '蒙古汗廷—元朝国号转换；上都中心参照；南宋并存；统一未完成，疆域未定'],
  [1272, '南宋—元并存；大都定名、上都并用；双都中心参照；疆域未定'],
  [1273, '南宋—元并存；襄樊战事转折、吕文焕降；大都、上都中心参照；疆域未定'],
  [1274, '南宋—元并存；大都营建、南征部署；大都、上都中心参照；疆域未定'],
  [1275, '南宋—元并存；元军南下、江淮战事推进；大都、上都中心参照；疆域未定'],
  [1276, '南宋朝廷临安降元、残余政权仍抵抗；大都、上都中心参照；疆域未定'],
  [1277, '南宋残余抵抗、元军接管分期继续；大都、上都中心参照；疆域未定'],
  [1278, '南宋残余军队在四川及南方抵抗；大都、上都中心参照；疆域未定'],
  [1279, '南宋终止—元统一；疆域仍未定；大都、上都中心参照'],
  [1280, '元以大都、上都为中心参照；对日远征计划不表示控制；疆域未定'],
  [1281, '元以大都、上都为中心参照；高丽关系与对日战争不等同直接疆界；疆域未定'],
  [1282, '元以大都、上都为中心参照；内乱与地方治理调整不作疆界；疆域未定'],
  [1283, '元以大都、上都为中心参照；西南军政、远征与朝贡不等同直接管辖；疆域未定'],
  [1284, '元以大都、上都为中心参照；地方行政与边疆事务不提供连续疆界；疆域未定'],
  [1285, '元以大都、上都为中心参照；与海都等蒙古诸王交战，不简化为稳定国界；疆域未定'],
  [1286, '元以大都、上都为中心参照；北方战事不覆盖全年控制状态；疆域未定'],
  [1287, '元以大都、上都为中心参照；乃颜之乱及东北战事不作疆界；疆域未定'],
  [1288, '元以大都、上都为中心参照；东北战事后续不作疆界；疆域未定'],
  [1289, '元以大都、上都为中心参照；政权延续，逐年边界未定'],
  [1290, '元以大都、上都为中心参照；边疆军政不等同同质直接控制面；疆域未定'],
  [1291, '元以大都、上都为中心参照；东川路建置不自动构成国家外界；疆域未定'],
  [1292, '元以大都、上都为中心参照；对外军事与地方行政并行；疆域未定'],
  [1293, '元以大都、上都为中心参照；不以后续成熟版图回推本年；疆域未定'],
] as const)('shows annual Yuan transition context and its evidence limits in %s', (year, expected) => {
  const state = getHistoricalState(year);
  expect(state.activePolities.map(polity => polity.id)).toContain('yuan');
  if (year === 1271) expect(state.activePolities.map(polity => polity.id)).toContain('mongol');
  if (year >= 1271 && year <= 1279) expect(state.activePolities.map(polity => polity.id)).toContain('song_south');
  expect(polityDisplayName(state.activePolities, year)).toBe(expected);
});

test('lists the coexisting regimes in the Western Xia termination year', () => {
  const state = getHistoricalState(1227);
  expect(state.activePolities.map(polity => polity.id)).toEqual(expect.arrayContaining([
    'song_south', 'western_xia', 'jin_jurchen', 'dali', 'mongol',
  ]));
  expect(polityDisplayName(state.activePolities, 1227)).toBe(
    '西夏终止；蒙古围攻中兴府；终局事件点不作疆界；南宋、金、大理并存',
  );
});

test.each([
  [-770, '东周迁洛（传统约年）；秦襄公列侯；洛邑、西犬丘中心参照；王畿未定'],
  [-769, '东周、秦国并存；洛邑、西犬丘中心参照；列国并立；王畿未定'],
  [-762, '东周、秦国并存；洛邑、汧渭之会中心参照；列国并立；王畿未定'],
  [-751, '东周、秦国并存；洛邑、汧渭之会中心参照；列国并立；王畿未定'],
] as const)('labels the Eastern Zhou and Qin state centers with annual boundary limits in %s', (year, expected) => {
  const state = getHistoricalState(year);
  expect(state.activePolities.map(polity => polity.id)).toEqual(expect.arrayContaining(['zhou_eastern', 'qin_state']));
  expect(polityDisplayName(state.activePolities, state.year)).toBe(expected);
});

test('labels both Eastern Zhou and Qin centers in all 20 annual map states without presenting boundaries', () => {
  for (let year = -770; year <= -751; year += 1) {
    const state = getHistoricalState(year);
    expect(state.activePolities.map(polity => polity.id), `Eastern Zhou should be active in ${year}`)
      .toContain('zhou_eastern');
    expect(state.activePolities.map(polity => polity.id), `Qin should be active in ${year}`)
      .toContain('qin_state');
    expect(polityDisplayName(state.activePolities, year), `annual title in ${year}`).toBe(
      year === -770
        ? '东周迁洛（传统约年）；秦襄公列侯；洛邑、西犬丘中心参照；王畿未定'
        : year <= -763
          ? '东周、秦国并存；洛邑、西犬丘中心参照；列国并立；王畿未定'
          : '东周、秦国并存；洛邑、汧渭之会中心参照；列国并立；王畿未定',
    );
  }
});

test.each([
  [-1046, '西周建政约年；克商日期有异说；丰镐王室中心参照；疆域未定'],
  [-1045, '西周早期；克商纪年存在分歧；丰镐王室中心参照；疆域未定'],
  [-1044, '有研究定为克商年；项目采用前1046约年；丰镐王室中心参照；疆域未定'],
  [-1043, '周武王卒；周公摄政与东国秩序动荡；丰镐王室中心参照；疆域未定'],
  [-1041, '成王时期东征与秩序重建；丰镐王室中心参照；疆域未定'],
  [-1035, '成王后期；分封秩序形成；丰镐王室中心参照；疆域未定'],
  [-1020, '康王早期；纪年仍有争议；丰镐王室中心参照；疆域未定'],
  [-1001, '康王早期；纪年仍有争议；丰镐王室中心参照；疆域未定'],
] as const)('labels Western Zhou phases and chronology uncertainty in %s', (year, expected) => {
  const state = getHistoricalState(year);
  expect(state.activePolities.map(polity => polity.id)).toContain('zhou_western');
  expect(polityDisplayName(state.activePolities, year)).toBe(expected);
});

test.each([
  [220, ['han_eastern', 'wei_three'], '东汉—魏交替；魏以洛阳为中心；疆域未定'],
  [265, ['wei_three', 'jin_western'], '魏—晋交替'],
] as const)('labels the %s annual regime transition explicitly', (year, ids, expected) => {
  const polities = ids.map((id, index) => ({
    id,
    name: id === 'han_eastern' ? '东汉' : id === 'wei_three' ? '魏' : '西晋',
    type: 'dynasty', startYear: year, endYear: year, color: '#000', description: '', sourceIds: [],
  })) as Polity[];
  expect(polityDisplayName(polities, year)).toBe(expected);
});

test.each([304, 305])('lists all coexisting regimes in the %s map status', year => {
  const state = getHistoricalState(year);
  expect(state.activePolities.map(polity => polity.id)).toEqual(expect.arrayContaining([
    'jin_western','cheng_han','former_zhao',
  ]));
  expect(polityDisplayName(state.activePolities, year)).toBe('西晋—成汉—前赵并存；新罗并存');
});

test.each([-206, -205, -204, -203])('includes the Xiang Yu regime in the coeval Chu-Han map state for %s', year => {
  const state = getHistoricalState(year);
  expect(state.activePolities.map(polity => polity.id)).toContain('xiang_yu');
  expect(state.activePolities.map(polity => polity.id)).toContain('xiongnu');
  expect(polityDisplayName(state.activePolities, year)).toContain('项羽政权');
  expect(state.boundaries.filter(boundary => boundary.polityId === 'xiang_yu').every(boundary =>
    boundary.geometry.type === 'Point' && boundary.mapRepresentation === 'control-centers')).toBe(true);
});

test('marks the 202 BCE Xiang Yu polity as a within-year termination with no annual center', () => {
  const state = getHistoricalState(-202);
  expect(state.activePolities.map(polity => polity.id)).toContain('xiang_yu');
  expect(state.activePolities.map(polity => polity.id)).toContain('xiongnu');
  expect(state.boundaries.some(boundary => boundary.polityId === 'xiang_yu')).toBe(false);
  expect(polityDisplayName(state.activePolities, -202)).toBe('楚汉战争终结；项羽政权年内终止，垓下败、乌江自刎；不以终止事件推定全年疆界；匈奴并存');
});

test.each([
  [263, ['wei_three', 'shu_three', 'wu_three'], '蜀汉年内终止；魏军攻取成都；成都为终止前中枢；接管分期、疆域未定；吴并存；新罗并存'],
  [265, ['wei_three', 'jin_western', 'wu_three'], '魏—晋交替；年初魏以洛阳为中心；吴冬迁武昌、此为年末中心；疆域未定；新罗并存'],
] as const)('keeps the coexisting Wu regime visible during the %s transition', (year, ids, expected) => {
  const state = getHistoricalState(year);
  expect(state.activePolities.map(polity => polity.id)).toEqual(expect.arrayContaining([...ids]));
  expect(polityDisplayName(state.activePolities, year)).toBe(expected);
});

test('labels the 221 BCE Qin unification and administrative phase', () => {
  const polities = [
    { id: 'qi_warring', name: '齐', type: 'kingdom', startYear: -403, endYear: -221, color: '#000', description: '', sourceIds: [] },
    { id: 'qin', name: '秦', type: 'dynasty', startYear: -221, endYear: -206, color: '#000', description: '', sourceIds: [] },
  ] as Polity[];
  expect(polityDisplayName(polities, -221)).toBe('齐—秦交替；秦灭齐、完成统一；咸阳为中央政治中心；三十六郡建制可确认，郡界未定');
});

test('labels the 221 Wei, Shu Han, and Wu King regime formation together', () => {
  const polities = [
    { id: 'wei_three', name: '魏', type: 'kingdom', startYear: 220, endYear: 265, color: '#000', description: '', sourceIds: [] },
    { id: 'shu_three', name: '蜀汉', type: 'kingdom', startYear: 221, endYear: 263, color: '#000', description: '', sourceIds: [] },
    { id: 'wu_three', name: '吴王政权', type: 'kingdom', startYear: 221, endYear: 280, color: '#000', description: '', sourceIds: [] },
  ] as Polity[];
  expect(polityDisplayName(polities, 221)).toBe('魏—蜀汉建政；吴王受魏封、迁都武昌；洛阳、成都、武昌为中心参照；各方疆域未定');
  const state = getHistoricalState(221);
  expect(state.activePolities.map(polity => polity.id)).toEqual(expect.arrayContaining(['wei_three','shu_three','wu_three']));
  expect(polityDisplayName(state.activePolities, state.year)).toBe('魏—蜀汉建政；吴王受魏封、迁都武昌；洛阳、成都、武昌为中心参照；各方疆域未定；新罗并存');
});

test.each([
  [304, '西晋—成汉—前赵并存；新罗并存'],
  [305, '西晋—成汉—前赵并存；新罗并存'],
] as const)('labels the Cheng Han and Han-Zhao coexistence in %s', (year, expected) => {
  const state = getHistoricalState(year);
  expect(state.activePolities.map(polity => polity.id)).toEqual(expect.arrayContaining([
    'jin_western', 'former_zhao', 'cheng_han',
  ]));
  expect(polityDisplayName(state.activePolities, year)).toBe(expected);
});

test('labels the 6 CE Wang Mang regency, failed Wan attack, and local unrest', () => {
  const state = getHistoricalState(6);
  expect(polityDisplayName(state.activePolities, state.year)).toBe('王莽居摄；刘崇攻宛未克（未占领）；西羌攻西海郡；长安为中央参照；疆域未定；新罗并存');
});

test.each([
  [7, '翟义于东郡、赵明霍鸿于槐里起兵；长安为中央政治中心；响应范围不等于占领区；疆域未定；新罗并存'],
  [8, '二月平定赵明、霍鸿；岁末王莽即真、定国号新并改正朔；长安为政权转换前中心；疆域未定；新罗并存'],
] as const)('labels the Han to Xin transition events in %s', (year, expectedLabel) => {
  const state = getHistoricalState(year);
  expect(polityDisplayName(state.activePolities, year)).toBe(expectedLabel);
});

test('labels the year 9 Han-Xin transition without implying the Xin interval outline is annual control', () => {
  const state = getHistoricalState(9);
  expect(state.activePolities.map(polity => polity.id)).toEqual(expect.arrayContaining(['han_western', 'xin']));
  expect(state.boundaries.some(boundary => boundary.id === 'clio-1120-xin-9')).toBe(false);
  expect(polityDisplayName(state.activePolities, 9)).toBe('公历9年按新正朔为始建国元年；西汉—新朝年内交替；新朝区间轮廓在本年待审、地图留空；新罗并存');
});

test.each([
  [26, ['han_eastern', 'xiongnu', 'goguryeo', 'silla'], '东汉以洛阳为中央政治中心；恢复制度并整合地方；疆域未定；匈奴、高句丽、新罗并存'],
  [27, ['han_eastern', 'xiongnu', 'goguryeo', 'silla'], '赤眉降汉；刘永、彭宠、张步等势力仍存；洛阳为中央中心；疆域未定；匈奴、高句丽、新罗并存'],
  [28, ['han_eastern', 'xiongnu', 'goguryeo', 'silla'], '东汉以洛阳为中央政治中心；地方征讨、政权整合继续；疆域未定；匈奴、高句丽、新罗并存'],
  [29, ['han_eastern', 'xiongnu', 'goguryeo', 'silla'], '东汉洛阳中心；军政整合逐步恢复；疆域未定；匈奴、高句丽、新罗并存'],
] as const)('labels the early Eastern Han year %s and coexisting polities', (year, expectedIds, expectedLabel) => {
  const state = getHistoricalState(year);
  expect(state.activePolities.map(polity => polity.id)).toEqual(expect.arrayContaining([...expectedIds]));
  expect(polityDisplayName(state.activePolities, year)).toBe(expectedLabel);
});

test('labels the 347 Chengdu military and local control transition without annualizing it', () => {
  const state = getHistoricalState(347);
  expect(state.activePolities.map(polity => polity.id)).toEqual(expect.arrayContaining(['jin_eastern', 'cheng_han']));
  expect(polityDisplayName(state.activePolities, state.year)).toBe('成汉终止年；桓温春季攻取成都后还江陵；四月邓定、隗文等复据成都；成都为控制转折参照；疆域未定；东晋、新罗并存');
});

test.each([
  [314, '张轨卒；张寔承摄凉州；姑臧为中心；疆域未定；新罗并存'],
  [315, '张寔奉晋命治理凉州；姑臧为中心；疆域未定；新罗并存'],
  [316, '西晋终止；张氏据守河西；姑臧为中心；疆域未定；新罗并存'],
  [317, '东晋建立；张氏仍以姑臧为中心治理河西；疆域未定；新罗并存'],
  [318, '张氏奉晋统治河西；姑臧为中心；疆域未定；新罗并存'],
  [319, '前凉、后赵、前赵、东晋并存；姑臧、襄国为中心；疆域未定；新罗并存'],
  [320, '张寔遇害、张茂接掌；前凉、后赵、前赵、东晋并存；姑臧、襄国为中心；疆域未定；新罗并存'],
  [321, '张茂继续治理凉州；前凉、后赵、前赵、东晋并存；姑臧、襄国为中心；疆域未定；新罗并存'],
  [322, '前凉置秦州、向陇西南安扩展；后赵、前赵、东晋并存；姑臧、襄国为中心；郡界未定；新罗并存'],
  [323, '前赵西击前凉、张茂称藩；前凉、后赵、东晋并存；疆域未定；新罗并存'],
] as const)('labels the annual Former Liang historical state in %s', (year, expected) => {
  const state = getHistoricalState(year);
  expect(state.activePolities.map(polity => polity.id)).toContain('former_liang');
  expect(polityDisplayName(state.activePolities, year)).toBe(expected);
});

test.each([
  [319, '前凉、后赵、前赵、东晋并存；姑臧、襄国为中心；疆域未定；新罗并存'],
  [320, '张寔遇害、张茂接掌；前凉、后赵、前赵、东晋并存；姑臧、襄国为中心；疆域未定；新罗并存'],
  [321, '张茂继续治理凉州；前凉、后赵、前赵、东晋并存；姑臧、襄国为中心；疆域未定；新罗并存'],
  [322, '前凉置秦州、向陇西南安扩展；后赵、前赵、东晋并存；姑臧、襄国为中心；郡界未定；新罗并存'],
  [323, '前赵西击前凉、张茂称藩；前凉、后赵、东晋并存；疆域未定；新罗并存'],
  [324, '后赵将领活动于下邳、彭城；与前赵交战；东晋并存；新罗并存'],
  [325, '后赵延续；前赵、东晋并存；襄国为中心；新罗并存'],
  [326, '后赵建邺宫、镇邺；前赵、东晋并存；襄国仍为中枢；新罗并存'],
  [327, '后赵延续；前赵、东晋并存；襄国为中心；新罗并存'],
  [328, '后赵—前赵战局转折；东晋并存；洛阳、关中方向；新罗并存'],
  [329, '后赵灭前赵；东晋并存；地方接管分期；新罗并存'],
  [330, '后赵称帝；东晋并存；襄国为中心；新罗并存'],
  [331, '后赵延续；东晋并存；襄国为中心；新罗并存'],
  [332, '后赵继承与权势转折；东晋并存；襄国为中心；新罗并存'],
  [333, '石勒死—石弘继位；石虎掌权；东晋并存；新罗并存'],
  [334, '石虎废石弘；后赵权力转移；东晋并存；新罗并存'],
  [335, '后赵迁都；襄国—邺年内转换；东晋并存；新罗并存'],
  [336, '后赵都邺；营建持续；东晋并存；新罗并存'],
] as const)('labels the annual Later Zhao historical state in %s', (year, expected) => {
  const state = getHistoricalState(year);
  expect(state.activePolities.map(polity => polity.id)).toEqual(expect.arrayContaining([
    'later_zhao', 'jin_eastern', ...(year <= 328 ? ['former_zhao'] : []),
    ...(year <= 323 ? ['former_liang'] : []),
  ]));
  expect(polityDisplayName(state.activePolities, year)).toBe(expected);
});

test.each([
  [351, ['former_qin', 'jin_eastern'], '前秦称天王；长安为政治中心；五丈原为区域战事参照；疆域未定；东晋、新罗并存'],
  [352, ['former_qin', 'jin_eastern', 'former_yan'], '前秦称帝；长安为政治中心；石安沿革记载有异说；疆域未定；前燕、东晋、新罗并存'],
] as const)('labels Former Qin regime formation and coexisting states in %s', (year, ids, expected) => {
  const state = getHistoricalState(year);
  expect(state.activePolities.map(polity => polity.id)).toEqual(expect.arrayContaining([...ids]));
  expect(polityDisplayName(state.activePolities, year)).toBe(expected);
});

test('labels Former Qin termination with Fu Deng and Fu Chong ending at different points in 394', () => {
  const state = getHistoricalState(394);
  expect(state.activePolities.map(polity => polity.id)).toEqual(expect.arrayContaining([
    'former_qin', 'later_qin', 'western_qin',
  ]));
  expect(polityDisplayName(state.activePolities, state.year))
    .toBe('西燕终止；台壁败、长子陷落；前秦亦年内终止');
});

test.each([
  [384, ['former_qin', 'jin_eastern', 'later_yan', 'later_qin', 'silla'], '后燕荥阳称王（事件区域点、非全年中心）；后秦在渭北马牧起兵、自称万年秦王（地望未定）；疆域未定；前秦、东晋、西燕、新罗并存'],
  [385, ['former_qin', 'jin_eastern', 'later_yan', 'later_qin', 'western_qin', 'silla'], '后燕围邺未下、四月撤围，年末定都中山（中心参照）；后秦多线征战；西秦九月建政、勇士城中心参照；疆域未定；前秦、东晋、西燕、新罗并存'],
  [386, ['former_qin', 'jin_eastern', 'later_yan', 'later_qin', 'wei_northern', 'later_liang', 'western_qin', 'silla'], '北魏（代）年初牛川即位，二月迁居盛乐、四月改称魏王；仅标盛乐阶段中心，年内迁贺兰部、再返牛川；疆域未定；后燕、后秦称帝；后燕中山、后秦长安中心参照，后秦向安定用兵；西秦勇士城区域中心参照；西燕、前秦、东晋、后凉、新罗并存'],
] as const)('labels the Later Yan, Later Qin, and concurrent founding states in %s', (year, ids, expected) => {
  const state = getHistoricalState(year);
  expect(state.activePolities.map(polity => polity.id)).toEqual(expect.arrayContaining([...ids]));
  expect(polityDisplayName(state.activePolities, year)).toBe(expected);
});

test('labels the 417 Eastern Jin capture of Chang’an and the Later Qin termination', () => {
  const state = getHistoricalState(417);
  expect(state.activePolities.map(polity => polity.id)).toEqual(expect.arrayContaining(['jin_eastern', 'later_qin', 'silla']));
  expect(polityDisplayName(state.activePolities, state.year)).toBe(
    '东晋刘裕攻取长安；姚泓出降，后秦中央政权终止；长安为年内交接参照（不代表全年稳定控制）；疆域未定；西凉以酒泉为中心；夏、北燕、北魏、北凉、西秦、新罗并存',
  );
});

test.each([
  [411, '西凉以酒泉为中心；疆域未定；东晋、夏、北燕、后秦、北魏、北凉、西秦并存'],
  [412, '西凉以酒泉为中心；疆域未定；东晋、夏、北燕、后秦、北魏、北凉、西秦并存'],
  [413, '西凉以酒泉为中心；疆域未定；东晋、夏、北燕、后秦、北魏、北凉、西秦并存'],
  [415, '西凉以酒泉为中心；疆域未定；东晋、后秦、夏、北燕、北魏、北凉、西秦并存'],
  [416, '西凉以酒泉为中心；疆域未定；东晋、后秦、夏、北燕、北魏、北凉、西秦并存'],
  [418, '西凉以酒泉为中心；疆域未定；东晋、夏、北燕、北魏、北凉、西秦并存'],
  [419, '西凉以酒泉为中心；疆域未定；东晋、夏、北燕、北魏、北凉、西秦并存'],
] as const)('lists the coexisting northern and southern regimes in %s', (year, expected) => {
  const state = getHistoricalState(year);
  expect(state.activePolities.map(polity => polity.id)).toEqual(expect.arrayContaining([
    'jin_eastern', 'xia', 'northern_yan', 'wei_northern', 'northern_liang', 'western_qin', 'western_liang',
    ...(year <= 416 ? ['later_qin'] : []),
  ]));
  expect(polityDisplayName(state.activePolities, year)).toBe(expected);
});

test('labels Southern Yan termination in 410 with its coexisting regimes', () => {
  const state = getHistoricalState(410);
  expect(state.activePolities.map(polity => polity.id)).toEqual(expect.arrayContaining([
    'southern_yan', 'jin_eastern', 'xia', 'northern_yan', 'later_qin', 'wei_northern',
    'northern_liang', 'southern_liang', 'western_qin', 'western_liang',
  ]));
  expect(polityDisplayName(state.activePolities, state.year)).toBe(
    '南燕二月终止；广固为覆亡前中心；疆域未定；西凉以酒泉为中心；东晋、夏、北燕、后秦、北魏、北凉、南凉、西秦并存',
  );
});

test('labels Southern Liang termination and the Ledu handoff in 414', () => {
  const state = getHistoricalState(414);
  expect(state.activePolities.map(polity => polity.id)).toEqual(expect.arrayContaining([
    'southern_liang', 'western_qin', 'jin_eastern', 'xia', 'northern_yan', 'later_qin',
    'wei_northern', 'northern_liang', 'western_liang',
  ]));
  expect(polityDisplayName(state.activePolities, state.year)).toBe(
    '南凉年内终止；西秦攻取乐都；乐都为覆亡前中心；疆域未定；西凉以酒泉为中心；东晋、夏、北燕、后秦、北魏、北凉并存',
  );
});

test.each([
  [407, ['xia', 'later_yan', 'northern_yan', 'jin_eastern', 'later_qin', 'wei_northern', 'northern_liang', 'southern_liang', 'southern_yan', 'western_liang', 'silla'], '夏建政；高平川地望有异说；疆域未定；后燕—北燕交替；东晋、后秦、北魏、北凉、南凉、南燕、西凉、新罗并存'],
  [408, ['xia', 'northern_yan', 'jin_eastern', 'later_qin', 'wei_northern', 'northern_liang', 'southern_liang', 'southern_yan', 'western_liang', 'silla'], '夏军退保河曲、追至木城擒齐难；地点与“大城”异文未决，不标战场点；疆域未定；东晋、后秦、北魏、北凉、南凉、南燕、北燕、西凉、新罗并存'],
  [409, ['xia', 'northern_yan', 'jin_eastern', 'later_qin', 'western_qin', 'wei_northern', 'northern_liang', 'southern_liang', 'southern_yan', 'western_liang', 'silla'], '夏军攻掠平凉七千余户、进屯依力川；不代表控制平凉全境；地点、疆域未定；西秦复立、度坚山区域事件点（非全年中心）；东晋、后秦、北魏、北凉、南凉、南燕、北燕、西凉、新罗并存'],
] as const)('labels Xia’s annual founding and battle record in %s without implying mapped territory', (year, polityIds, expected) => {
  const state = getHistoricalState(year);
  expect(state.activePolities.map(polity => polity.id)).toContain('xia');
  expect(state.activePolities.map(polity => polity.id)).toEqual(expect.arrayContaining([...polityIds]));
  expect(polityDisplayName(state.activePolities, year)).toBe(expected);
});

test('labels Southern Qi and Northern Wei as coexisting in the 479 founding year', () => {
  const state = getHistoricalState(479);
  expect(state.activePolities.map(polity => polity.id)).toEqual(expect.arrayContaining([
    'song_southern', 'qi_southern', 'wei_northern', 'silla',
  ]));
  expect(polityDisplayName(state.activePolities, state.year)).toBe('刘宋三月禅位—南齐五月建政；建康为建政中心参照，非全年连续控制；疆域未定；北魏、新罗并存');
});

test('labels Southern Liang and Northern Wei as coexisting in 509', () => {
  const state = getHistoricalState(509);
  expect(state.activePolities.map(polity => polity.id)).toEqual(expect.arrayContaining(['liang_southern', 'wei_northern', 'silla']));
  expect(polityDisplayName(state.activePolities, state.year)).toBe('南梁以建康为中心；疆域未定；北魏、新罗并存');
});

test('labels the Southern Qi to Southern Liang handoff alongside Northern Wei in 502', () => {
  const state = getHistoricalState(502);
  expect(state.activePolities.map(polity => polity.id)).toEqual(expect.arrayContaining([
    'qi_southern', 'liang_southern', 'wei_northern', 'silla',
  ]));
  expect(polityDisplayName(state.activePolities, state.year)).toBe('南齐—南梁交替；萧衍年中在建康受禅建梁；中心点仅表示建梁后阶段，疆域未定；北魏、新罗并存');
});

test.each([
  [503, '南梁以建康为中心；疆域未定；北魏、新罗并存'],
  [504, '南梁以建康为中心；疆域未定；北魏、新罗并存'],
  [505, '南梁以建康为中心；疆域未定；北魏、新罗并存'],
  [506, '南梁以建康为中心；疆域未定；北魏、新罗并存'],
  [507, '南梁以建康为中心；疆域未定；钟离及邵阳洲附近战事（钟离区域近似事件点）；南梁援军击退北魏军；北魏、新罗并存'],
  [508, '南梁以建康为中心；疆域未定；北魏、新罗并存'],
  [509, '南梁以建康为中心；疆域未定；北魏、新罗并存'],
] as const)('labels Southern Liang and Northern Wei in %s with the sourced 507 battle', (year, expected) => {
  const state = getHistoricalState(year);
  expect(state.activePolities.map(polity => polity.id)).toEqual(expect.arrayContaining(['liang_southern', 'wei_northern', 'silla']));
  expect(polityDisplayName(state.activePolities, year)).toBe(expected);
});

test('labels the Northern Wei split with Southern Liang still active in 534', () => {
  const state = getHistoricalState(534);
  expect(state.activePolities.map(polity => polity.id)).toEqual(expect.arrayContaining([
    'liang_southern', 'wei_northern', 'wei_eastern', 'silla',
  ]));
  expect(polityDisplayName(state.activePolities, state.year)).toBe('北魏分裂；孝武帝七月离洛入关中、东魏十月在邺建政；洛阳、邺仅为事件点；西魏于公历535年建政，疆域未定；南梁、新罗并存');
});

test.each([
  [398, ['southern_yan', 'jin_eastern', 'later_yan', 'later_qin', 'wei_northern', 'northern_liang', 'later_liang', 'western_qin', 'southern_liang'], '南燕建政于滑台；东晋、后燕、后秦、北魏、北凉、南凉、后凉、西秦并存'],
  [399, ['southern_yan', 'jin_eastern', 'later_yan', 'later_qin', 'wei_northern', 'northern_liang', 'later_liang', 'western_qin', 'southern_liang'], '南燕迁往广固；东晋、后燕、后秦、北魏、北凉、南凉、后凉、西秦并存'],
  [400, ['southern_yan', 'jin_eastern', 'later_yan', 'later_qin', 'wei_northern', 'northern_liang', 'later_liang', 'western_qin', 'southern_liang', 'western_liang'], '南燕在广固称帝；东晋、后燕、后秦、北魏、北凉、南凉、后凉、西秦、西凉并存'],
  [401, ['southern_yan', 'jin_eastern', 'later_yan', 'later_qin', 'wei_northern', 'northern_liang', 'later_liang', 'southern_liang', 'western_liang'], '南燕以广固为中心；东晋、后燕、后秦、北魏、北凉、南凉、后凉、西凉并存'],
] as const)('shows Southern Yan’s annual transition and coexisting polities in %s', (year, polityIds, expected) => {
  const state = getHistoricalState(year);
  expect(state.activePolities.map(polity => polity.id)).toEqual(expect.arrayContaining([...polityIds]));
  expect(polityDisplayName(state.activePolities, year)).toBe(expected);
});

test.each([
  [550, ['liang_southern', 'wei_eastern', 'wei_western', 'qi_northern'], '东魏—北齐交替；邺为北齐建政中心；北齐疆域未定；西魏、南梁并存'],
  [551, ['liang_southern', 'wei_western', 'qi_northern'], '北齐以邺为政治中心；疆域未定；西魏、南梁并存'],
  [552, ['liang_southern', 'wei_western', 'qi_northern', 'turkic'], '北齐以邺为政治中心；疆域未定；筑长城（线路待考、不作疆界）；土门击败柔然，突厥汗权形成（《周书》记于怀荒以北战事）；西魏、南梁并存'],
  [553, ['liang_southern', 'wei_western', 'qi_northern', 'turkic'], '北齐以邺为政治中心；疆域未定；突厥汗位承继记载有异文；西魏、南梁并存'],
  [554, ['liang_southern', 'wei_western', 'qi_northern', 'turkic'], '北齐以邺为政治中心；疆域未定；突厥十一月再攻柔然，柔然举国奔齐，北齐迎纳、突厥请降；战局不构成疆界；西魏、南梁并存'],
] as const)('labels the %s Northern Qi and Turkic coexistence snapshot', (year, ids, expected) => {
  const state = getHistoricalState(year);
  expect(state.activePolities.map(polity => polity.id)).toEqual(expect.arrayContaining([...ids]));
  expect(polityDisplayName(state.activePolities, year)).toBe(expected);
});

test.each([
  [557, ['liang_southern', 'chen_southern', 'wei_western', 'zhou_northern', 'qi_northern'], '南梁—南陈交替；西魏—北周交替；建康为南陈建政后中心、长安为西魏—北周承接中心；南陈、北周疆域未定；北齐并存；其来源范围仅为低置信时段参考，控制性质未定'],
  [558, ['chen_southern', 'zhou_northern', 'qi_northern'], '南陈以建康、北周以长安为政治中心；疆域未定；北齐并存；其来源范围仅为低置信时段参考，控制性质未定'],
  [559, ['chen_southern', 'zhou_northern', 'qi_northern'], '陈霸先卒—陈蒨继位；南陈以建康、北周以长安为政治中心；疆域未定；北齐并存；其来源范围仅为低置信时段参考，控制性质未定'],
  [560, ['chen_southern', 'zhou_northern', 'qi_northern'], '宇文邕继位；南陈以建康、北周以长安为政治中心；疆域未定；北齐并存；其来源范围仅为低置信时段参考，控制性质未定'],
] as const)('labels the %s Chen, Zhou, and Qi coexistence snapshot', (year, ids, expected) => {
  const state = getHistoricalState(year);
  expect(state.activePolities.map(polity => polity.id)).toEqual(expect.arrayContaining([...ids]));
  expect(polityDisplayName(state.activePolities, year)).toBe(expected);
});

test('labels Northern Qi ending and Northern Zhou taking Ye in 577 alongside Southern Chen', () => {
  const state = getHistoricalState(577);
  expect(state.activePolities.map(polity => polity.id)).toEqual(expect.arrayContaining([
    'chen_southern', 'qi_northern', 'zhou_northern',
  ]));
  expect(polityDisplayName(state.activePolities, state.year)).toBe('高恒即位；北周攻取邺、北齐终止；邺为年内转换中心；疆域未定；南陈并存');
});

test('labels Sui-to-Tang abdication in 618 instead of showing only the first active polity', () => {
  const polities = [
    { id: 'sui', name: '隋', type: 'dynasty', startYear: 581, endYear: 618, color: '#000', description: '', sourceIds: [] },
    { id: 'tang', name: '唐', type: 'dynasty', startYear: 618, endYear: 907, color: '#000', description: '', sourceIds: [] },
  ] as Polity[];
  expect(polityDisplayName(polities, 618)).toBe('隋—唐交替；唐以长安为政治中心；疆域未定');
});

test.each([
  [581, ['zhou_northern', 'sui', 'chen_southern'], '北周—隋交替；隋以长安为政治中心；疆域未定；南陈并存'],
  [582, ['sui', 'chen_southern'], '隋营建大兴新都；仍以长安为政治中心；疆域未定；南陈并存'],
  [583, ['sui', 'chen_southern'], '隋迁都大兴；大兴为低置信度区域参照；疆域未定；南陈并存'],
  [584, ['sui', 'chen_southern'], '隋以大兴为都；地图点为区域参照；疆域未定；南陈并存'],
  [585, ['sui', 'chen_southern'], '隋以大兴为都；地图点为区域参照；疆域未定；南陈并存'],
  [586, ['sui', 'chen_southern'], '隋以大兴为都；地图点为区域参照；疆域未定；南陈并存'],
] as const)('labels Sui establishment and Chen coexistence in %s', (year, ids, expected) => {
  const state = getHistoricalState(year);
  expect(state.activePolities.map(polity => polity.id)).toEqual(expect.arrayContaining([...ids]));
  expect(polityDisplayName(state.activePolities, year)).toBe(expected);
});

test.each([
  [618, ['sui', 'tang', 'goguryeo', 'silla', 'tuyuhun', 'turkic', 'tibetan_empire'], '隋—唐交替；唐以长安为政治中心；疆域未定；薛举、李轨、王世充等并存；高句丽、新罗、吐谷浑、突厥并存；吐蕃形成约年（年代有异说），雅砻核心参照'],
  [619, ['tang', 'goguryeo', 'silla', 'tuyuhun', 'turkic', 'tibetan_empire'], '唐初以长安为政治中心；疆域未定；刘武周、宋金刚、王世充、窦建德等并存；高句丽、新罗、吐谷浑、突厥并存；吐蕃雅砻核心参照'],
  [620, ['tang', 'goguryeo', 'silla', 'tuyuhun', 'turkic', 'tibetan_empire'], '唐初以长安为政治中心；疆域未定；刘武周等势力并存；高句丽、新罗、吐谷浑、突厥并存；吐蕃雅砻核心参照'],
  [621, ['tang', 'goguryeo', 'silla', 'tuyuhun', 'turkic', 'tibetan_empire'], '唐初以长安为政治中心；疆域未定；唐军攻取洛阳、击败窦建德（事件参照）；高句丽、新罗、吐谷浑、突厥并存；吐蕃雅砻核心参照'],
  [622, ['tang', 'goguryeo', 'silla', 'tuyuhun', 'turkic', 'tibetan_empire'], '唐初以长安为政治中心；疆域未定；刘黑闼据洺州（对手中心区域参照，不代表唐控）；高句丽、新罗、吐谷浑、突厥并存；吐蕃雅砻核心参照'],
] as const)('labels all recorded coexisting polities and early Tibetan core references in %s', (year, ids, expected) => {
  const state = getHistoricalState(year);
  expect(state.activePolities.map(polity => polity.id)).toEqual(expect.arrayContaining([...ids]));
  expect(polityDisplayName(state.activePolities, year)).toBe(expected);
});

test.each([
  [661, ['tang', 'goguryeo', 'silla', 'tuyuhun', 'turkic', 'tibetan_empire'], '唐—突厥余部—吐蕃并存；高句丽、新罗、吐谷浑并存'],
  [663, ['tang', 'goguryeo', 'silla', 'tuyuhun', 'turkic', 'tibetan_empire'], '唐—突厥余部—吐蕃并存；高句丽、新罗、吐谷浑并存'],
  [664, ['tang', 'goguryeo', 'silla', 'turkic', 'tibetan_empire'], '唐—突厥余部—吐蕃并存；高句丽、新罗并存'],
  [668, ['tang', 'goguryeo', 'silla', 'turkic', 'tibetan_empire'], '唐—突厥余部—吐蕃并存；高句丽、新罗并存'],
  [681, ['tang', 'silla', 'turkic', 'tibetan_empire'], '唐—突厥余部—吐蕃并存；新罗并存'],
  [682, ['tang', 'silla', 'turkic', 'tibetan_empire'], '唐—后突厥—吐蕃并存；新罗并存'],
  [690, ['wu_zhou', 'silla', 'turkic', 'tibetan_empire'], '武周—后突厥—吐蕃并存；新罗并存'],
  [704, ['wu_zhou', 'silla', 'turkic', 'tibetan_empire'], '武周—后突厥—吐蕃并存；新罗并存'],
  [705, ['tang', 'wu_zhou', 'silla', 'turkic', 'tibetan_empire'], '武周—唐交替；后突厥、吐蕃并存；新罗并存'],
  [706, ['tang', 'silla', 'turkic', 'tibetan_empire'], '唐—后突厥—吐蕃并存；新罗并存'],
  [737, ['tang', 'silla', 'turkic', 'tibetan_empire'], '唐—后突厥—吐蕃并存；新罗并存'],
  [738, ['tang', 'silla', 'turkic', 'tibetan_empire', 'nanzhao'], '唐—后突厥—吐蕃并存；南诏形成约年；新罗并存'],
  [739, ['tang', 'silla', 'turkic', 'tibetan_empire', 'nanzhao'], '唐—后突厥—吐蕃—南诏并存；新罗并存'],
  [740, ['tang', 'silla', 'turkic', 'tibetan_empire', 'nanzhao'], '唐—后突厥—吐蕃—南诏并存；新罗并存'],
  [742, ['tang', 'silla', 'turkic', 'tibetan_empire', 'nanzhao'], '三部攻杀骨咄叶护；乌苏米施继立；吐蕃并存；新罗、南诏并存'],
  [743, ['tang', 'silla', 'turkic', 'tibetan_empire', 'nanzhao'], '唐—后突厥—吐蕃并存；新罗、南诏并存'],
  [744, ['tang', 'silla', 'turkic', 'tibetan_empire', 'nanzhao'], '乌苏死、白眉继立；回纥怀仁可汗受册；吐蕃并存；新罗、南诏并存'],
] as const)('labels the Tang, Turkic, Tibetan, and Nanzhao period in %s', (year, ids, expected) => {
  const state = getHistoricalState(year);
  expect(state.activePolities.map(polity => polity.id)).toEqual(expect.arrayContaining([...ids]));
  expect(polityDisplayName(state.activePolities, year)).toBe(expected);
});

test('keeps Goguryeo, Silla, Tuyuhun, and Nanzhao visible throughout their recorded coexisting years', () => {
  for (let year = 661; year <= 744; year += 1) {
    const label = polityDisplayName(getHistoricalState(year).activePolities, year) ?? '';
    expect(label, `Silla should be listed in ${year}`).toContain('新罗');
    if (year <= 668) expect(label, `Goguryeo should be listed in ${year}`).toContain('高句丽');
    if (year <= 663) expect(label, `Tuyuhun should be listed in ${year}`).toContain('吐谷浑');
    if (year >= 738) expect(label, `Nanzhao should be listed in ${year}`).toContain('南诏');
  }
});

test.each([
  [902, ['tang', 'wu_ten'], '吴王受封；扬州为政治中心；封号不表示封域实控；唐末群雄并存；疆域未定'],
  [907, ['tang', 'liang_later', 'jin_hedong', 'wu_ten', 'wuyue', 'chu_ten', 'former_shu'], '唐—后梁交替；杨吴沿用天祐年号、以扬州为中心；疆域未定；河东晋、吴越、楚、前蜀并存'],
  [908, ['liang_later', 'jin_hedong', 'wu_ten', 'wuyue', 'chu_ten', 'former_shu'], '杨隆演继位、杨吴以扬州为中枢；后梁以大梁为中心；疆域未定；河东晋、吴越、楚、前蜀并存'],
  [909, ['liang_later', 'jin_hedong', 'wu_ten', 'wuyue', 'chu_ten', 'former_shu', 'min'], '杨吴向江西诸州扩张，接管时序与连续控制线未明；后梁年内迁都洛阳、秋还大梁；闽以福州为中心，五州沿革概述不作疆界；疆域未定；河东晋、吴越、楚、前蜀、闽并存'],
  [910, ['liang_later', 'jin_hedong', 'wu_ten', 'wuyue', 'chu_ten', 'former_shu', 'min'], '杨吴以扬州为中心；“尽有今江西”不回推为本年全年疆界；后梁以洛阳为主朝廷中心、大梁为东都；岐王求巴、剑二州，王建拒绝割让；州界未定；闽以福州为中心，五州沿革概述不作疆界；河东晋、吴越、楚、前蜀、闽并存'],
] as const)('labels the Tang to Five Dynasties and Ten Kingdoms snapshot in %s', (year, ids, expected) => {
  const state = getHistoricalState(year);
  expect(state.activePolities.map(polity => polity.id)).toEqual(expect.arrayContaining([...ids]));
  expect(polityDisplayName(state.activePolities, year)).toBe(expected);
});

test.each([
  [902, '吴王受封；扬州为政治中心；封号不表示封域实控；唐末群雄并存；疆域未定'],
  [903, '杨吴以扬州为政治中心；方镇名义辖区不作疆界；唐末群雄并存；疆域未定'],
  [904, '杨吴以扬州为政治中心；各州控制强弱未明；唐末群雄并存；疆域未定'],
  [905, '杨行密卒、杨渥继位；吴军西取鄂州；扬州为政治中心；战事不作疆界；疆域未定'],
  [906, '吴军取得江州、饶州、洪州州城；阶段性战事不等于全年直辖；扬州为中心；疆域未定'],
  [907, '唐—后梁交替；杨吴沿用天祐年号、以扬州为中心；疆域未定'],
  [908, '杨隆演继位、杨吴以扬州为中枢；后梁以大梁为中心；疆域未定'],
  [909, '杨吴向江西诸州扩张，接管时序与连续控制线未明；后梁年内迁都洛阳、秋还大梁；闽以福州为中心'],
  [910, '杨吴以扬州为中心；“尽有今江西”不回推为本年全年疆界'],
] as const)('shows the annual Yang Wu conclusion in the %s map status', (year, expected) => {
  const state = getHistoricalState(year);
  expect(polityDisplayName(state.activePolities, year)).toContain(expected);
});

test.each([
  [222, ['wei_three', 'shu_three', 'wu_three'], '魏、蜀汉、吴并存；吴自立改元黄武；洛阳、成都、武昌为中心；疆域未定；新罗并存'],
  [223, ['wei_three', 'shu_three', 'wu_three'], '魏、蜀汉、吴并存；刘备卒于永安、刘禅继位；洛阳、成都、武昌为中心；疆域未定；新罗并存'],
] as const)('names the three independent kingdoms on the map in %s', (year, ids, expected) => {
  const state = getHistoricalState(year);
  expect(state.activePolities.map(polity => polity.id)).toEqual(expect.arrayContaining([...ids]));
  expect(polityDisplayName(state.activePolities, year)).toBe(expected);
});

test('labels the 25 Gengshi to Eastern Han transition and keeps both annual centers visible', () => {
  const state = getHistoricalState(25);
  expect(state.activePolities.map(polity => polity.id)).toEqual(expect.arrayContaining(['gengshi', 'han_eastern']));
  expect(polityDisplayName(state.activePolities, state.year)).toBe('更始—东汉交替');
  expect(state.boundaries).toEqual(expect.arrayContaining([
    expect.objectContaining({
      polityId: 'gengshi',
      geometry: { type: 'Point', coordinates: [108.94, 34.34] },
    }),
    expect.objectContaining({
      polityId: 'han_eastern',
      geometry: { type: 'Point', coordinates: [112.45, 34.62] },
    }),
  ]));
});

test.each([
  [23, ['xin', 'gengshi', 'xiongnu', 'goguryeo', 'silla'], '新朝—更始交替；更始在宛形成、年内入长安；匈奴、高句丽、新罗并存'],
  [24, ['gengshi', 'xiongnu', 'goguryeo', 'silla'], '更始自洛阳迁都长安（年内转换）；匈奴、高句丽、新罗并存'],
] as const)('labels the annual Gengshi transition in %s', (year, ids, expected) => {
  const state = getHistoricalState(year);
  expect(state.activePolities.map(polity => polity.id)).toEqual(expect.arrayContaining([...ids]));
  expect(polityDisplayName(state.activePolities, year)).toBe(expected);
});

test('labels the Xiongnu and Qin coexistence in 209 BCE alongside the approximate Modu accession', () => {
  const state = getHistoricalState(-209);
  expect(state.activePolities.map(polity => polity.id)).toEqual(expect.arrayContaining(['xiongnu', 'qin']));
  expect(polityDisplayName(state.activePolities, state.year)).toBe('秦—匈奴并存；冒顿立单于（传统约年）；单于庭移动、龙城位置待考；疆域未定');
});

test('labels the Han termination year as a pre-surrender center reference with unresolved borders', () => {
  const state = getHistoricalState(-230);
  expect(state.activePolities.map(polity => polity.id)).toEqual(expect.arrayContaining([
    'han_warring', 'qin_state', 'zhao_warring', 'wei_warring', 'chu_warring', 'yan_warring', 'qi_warring',
  ]));
  expect(polityDisplayName(state.activePolities, state.year)).toBe('韩国年内终止；秦灭韩、置颍川郡；新郑为受降前中心；疆域未定；赵、魏、楚、燕、齐并存');
});

test.each([
  [-223, ['chu_warring', 'qin_state'], '楚王负刍被俘、楚政权终止；秦接收楚地（前224“荆王”与前223负刍节点关系未定）；不标寿春中心；疆域未定；秦、赵、魏、燕、齐并存'],
  [-222, ['yan_warring', 'qin_state'], '燕王喜被俘、燕政权终止；辽阳为低置信度末期中心区域参照（不定位襄平）；疆域未定；秦、赵、魏、齐并存'],
] as const)('labels the Warring States termination year %s with evidence limits', (year, expectedIds, expectedLabel) => {
  const state = getHistoricalState(year);
  expect(state.activePolities.map(polity => polity.id)).toEqual(expect.arrayContaining([...expectedIds]));
  expect(polityDisplayName(state.activePolities, year)).toBe(expectedLabel);
});

test.each([
  [-221, '齐—秦交替；秦灭齐、完成统一；咸阳为中央政治中心；三十六郡建制可确认，郡界未定'],
  [-220, '洞庭、巴、南等郡兵器输内史；秦简见行政资源联系，不代表连续控制面；咸阳为中央中心；疆界未定'],
  [-219, '秦始皇东巡郡县至邹峄、泰山、琅邪；巡行不作疆界；咸阳为中央中心；齐地郡制断代有异说'],
] as const)('labels Qin annual political and administrative evidence in %s', (year, expectedLabel) => {
  const state = getHistoricalState(year);
  expect(state.activePolities.map(polity => polity.id)).toContain('qin');
  expect(polityDisplayName(state.activePolities, year)).toBe(expectedLabel);
});

test.each([
  [-208, '李斯被杀；秦廷仍在咸阳；反秦战争、地方控制瓦解；疆域未定；匈奴并存'],
  [-207, '刘邦八月入武关；秦二世被逼自杀、子婴继位并诛赵高；秦廷中心仍在咸阳；疆域未定；匈奴并存'],
  [-206, '秦亡、项羽政权自立为西楚霸王并都彭城；封刘邦为汉王、都南郑；三秦分封；项羽九郡及各方实控县界未定；年度图不显示秦中心；匈奴并存'],
] as const)('labels Qin collapse milestones in %s without filling the annual extent', (year, expectedLabel) => {
  const state = getHistoricalState(year);
  expect(state.activePolities.map(polity => polity.id)).toEqual(expect.arrayContaining(['qin','xiongnu']));
  expect(polityDisplayName(state.activePolities, year)).toBe(expectedLabel);
});

test.each([
  [-206, '秦亡、项羽政权自立为西楚霸王并都彭城；封刘邦为汉王、都南郑；三秦分封；项羽九郡及各方实控县界未定；年度图不显示秦中心；匈奴并存'],
  [-205, '汉、项羽政权并存；楚军反击、汉军败退彭城；汉王年末还都栎阳；彭城为项羽都城及城市级战事参照；九郡边界未定；匈奴并存'],
  [-204, '汉、项羽政权并存；争夺荥阳、成皋与粮道；荥阳为前线参照、不代表全年控制；疆域未定；匈奴并存'],
  [-203, '汉、项羽政权并存；年末鸿沟约和、楚军暂退；汉方决定追击；荥阳为前线参照；不将鸿沟画作已执行全年边界；疆域未定；匈奴并存'],
] as const)('labels the Han King and Chu-Han year %s without annualizing its front line', (year, expectedLabel) => {
  const state = getHistoricalState(year);
  expect(state.activePolities.map(polity => polity.id)).toContain('han_western');
  expect(state.activePolities.map(polity => polity.id)).toContain('xiang_yu');
  expect(polityDisplayName(state.activePolities, year)).toBe(expectedLabel);
});

test('labels Goguryeo’s traditional founding year beside Western Han without asserting a precise founding date', () => {
  const state = getHistoricalState(-37);
  expect(state.activePolities.map(polity => polity.id)).toEqual(expect.arrayContaining(['goguryeo', 'silla', 'han_western']));
  expect(polityDisplayName(state.activePolities, state.year)).toBe('西汉—高句丽、新罗并存；传统建国年；纥升骨城／五女山为早期中心候选；不确认建国仪式点；疆域未定');
});

test.each([
  [420, ['jin_eastern', 'song_southern', 'wei_northern', 'xia', 'northern_liang', 'western_qin', 'western_liang', 'northern_yan', 'silla'], '东晋—刘宋交替；六月刘裕受禅后以建康为中心；东晋、刘宋疆域未定；西凉年内酒泉失守、李恂返敦煌，地图留空；北魏、夏、北凉、西秦、北燕、新罗并存'],
  [421, ['song_southern', 'wei_northern', 'xia', 'northern_liang', 'western_qin', 'western_liang', 'northern_yan', 'silla'], '西凉终止；敦煌为覆亡前中心；疆域未定；刘宋以建康为中心；疆域未定；北魏、夏、北凉、西秦、北燕、新罗并存'],
  [422, ['song_southern', 'wei_northern', 'xia', 'northern_liang', 'western_qin', 'northern_yan', 'silla'], '刘裕五月去世、刘义符即位；刘宋以建康为中心；疆域未定；北魏、夏、北凉、西秦、北燕、新罗并存'],
  [423, ['song_southern', 'wei_northern', 'xia', 'northern_liang', 'western_qin', 'northern_yan', 'silla'], '刘宋少帝刘义符在位；建康为中心；疆域未定；北魏、夏、北凉、西秦、北燕、新罗并存'],
  [424, ['song_southern', 'wei_northern', 'xia', 'northern_liang', 'western_qin', 'northern_yan', 'silla'], '刘义符年内被废、刘义隆八月即位；建康中心延续；疆域未定；北魏、夏、北凉、西秦、北燕、新罗并存'],
  [425, ['song_southern', 'wei_northern', 'xia', 'northern_liang', 'western_qin', 'northern_yan', 'silla'], '元嘉二年；文帝刘义隆开始亲理政务；建康为中心；疆域未定；北魏、夏、北凉、西秦、北燕、新罗并存'],
] as const)('labels the Liu Song founding-period snapshot in %s', (year, ids, expected) => {
  const state = getHistoricalState(year);
  expect(state.activePolities.map(polity => polity.id)).toEqual(expect.arrayContaining([...ids]));
  expect(polityDisplayName(state.activePolities, year)).toBe(expected);
});

test('labels the 9 Han to Xin annual handoff instead of showing only Western Han', () => {
  const state = getHistoricalState(9);
  expect(state.activePolities.map(polity => polity.id)).toEqual(expect.arrayContaining(['han_western', 'xin']));
  expect(polityDisplayName(state.activePolities, state.year)).toBe('公历9年按新正朔为始建国元年；西汉—新朝年内交替；新朝区间轮廓在本年待审、地图留空；新罗并存');
});

test('labels the runtime Later Zhou to Northern Song transition in 960', () => {
  const state = getHistoricalState(960);
  expect(state.activePolities.map(polity => polity.id)).toEqual(expect.arrayContaining(['zhou_later', 'song_northern']));
  expect(polityDisplayName(state.activePolities, state.year)).toBe('后周—北宋交替；北汉并存');
});

test.each([
  [1127, ['song_northern', 'song_south'], '北宋终止—南宋建政；应天—扬州迁驻'],
  [1279, ['song_south', 'yuan'], '南宋终止—元统一；疆域仍未定；大都、上都中心参照'],
  [1644, ['ming', 'qing', 'ming_southern'], '明亡—清入关；南京弘光政权年内形成、以南京为阶段中心；南明多中心并起；疆域未定'],
  [1912, ['qing', 'republic'], '中华民国1月1日在南京成立；清帝2月12日退位；南北交接非瞬时完成；北京终止事件点；疆域未定'],
] as const)('labels the %s annual transition with active regimes', (year, ids, expected) => {
  const state = getHistoricalState(year);
  expect(state.activePolities.map(polity => polity.id)).toEqual(expect.arrayContaining([...ids]));
  expect(polityDisplayName(state.activePolities, year)).toBe(expected);
});

test('labels Later Liang and the Hedong Jin princely regime together in 910', () => {
  const state = getHistoricalState(910);
  expect(state.activePolities.map(polity => polity.id)).toEqual(expect.arrayContaining(['liang_later','jin_hedong']));
  expect(polityDisplayName(state.activePolities, state.year)).toBe('杨吴以扬州为中心；“尽有今江西”不回推为本年全年疆界；后梁以洛阳为主朝廷中心、大梁为东都；岐王求巴、剑二州，王建拒绝割让；州界未定；闽以福州为中心，五州沿革概述不作疆界；河东晋、吴越、楚、前蜀、闽并存');
  const transition = getHistoricalState(923);
  expect(transition.activePolities.map(polity => polity.id)).toEqual(expect.arrayContaining(['liang_later','jin_hedong','tang_later']));
  expect(polityDisplayName(transition.activePolities, transition.year)).toBe('后唐魏州即位、攻取开封；后梁终止；迁入洛阳后为中央中心；疆域未定');
});

test.each([
  [923, ['liang_later', 'jin_hedong', 'tang_later'], '后唐魏州即位、攻取开封；后梁终止；迁入洛阳后为中央中心；疆域未定'],
  [924, ['tang_later', 'jingnan'], '后唐—荆南并存；后唐以洛阳为中心；南平王高季兴以江陵为中心；封爵不作疆界；疆域未定'],
  [925, ['tang_later', 'former_shu', 'jingnan'], '后唐—荆南并存；后唐以洛阳为中心；灭前蜀、蜀地接收分期；荆南以江陵为中心；邻国变化不作荆南疆界；疆域未定'],
] as const)('labels the Later Tang and Jingnan transition snapshot in %s', (year, ids, expected) => {
  const state = getHistoricalState(year);
  expect(state.activePolities.map(polity => polity.id)).toEqual(expect.arrayContaining([...ids]));
  expect(polityDisplayName(state.activePolities, year)).toBe(expected);
});

test.each([
  [934, ['tang_later', 'later_shu'], '后唐—后蜀并存；孟知祥在成都即帝位；渠州叛乱及平定是局部事件，不作疆界；疆域未定；荆南并存'],
  [935, ['tang_later', 'later_shu'], '后唐—后蜀并存；孟知祥以成都为中心；蜀大赦不作疆界；疆域未定；荆南并存'],
  [936, ['tang_later', 'jin_later', 'later_shu'], '石敬瑭太原起兵、契丹入援并受册；后唐十二月终止、后晋兴起；洛阳为终局转换中心；割十六州之约不作疆界；疆域未定；后蜀并存'],
  [937, ['jin_later', 'southern_tang', 'later_shu', 'dali'], '后晋、南唐、后蜀、大理并存；大理建政年937/938有异说；羊苴咩城D级中心参照；疆域未定'],
  [938, ['jin_later', 'southern_tang', 'later_shu', 'dali'], '后晋、南唐、后蜀、大理并存；羊苴咩城D级中心参照；段思平分封与整合不作疆界'],
  [939, ['jin_later', 'southern_tang', 'later_shu', 'dali'], '后晋、南唐、后蜀、大理并存；羊苴咩城D级中心参照；疆域未定'],
  [940, ['jin_later', 'southern_tang', 'later_shu', 'dali'], '后晋、南唐、后蜀、大理并存；羊苴咩城D级中心参照；疆域未定'],
  [941, ['jin_later', 'southern_tang', 'later_shu', 'dali'], '后晋、南唐、后蜀、大理并存；羊苴咩城D级中心参照；疆域未定'],
  [942, ['jin_later', 'southern_tang', 'later_shu', 'dali'], '后晋、南唐、后蜀、大理并存；羊苴咩城D级中心参照；疆域未定'],
  [943, ['jin_later', 'southern_tang', 'later_shu', 'dali'], '后晋、南唐、后蜀、大理并存；羊苴咩城D级中心参照；疆域未定'],
  [944, ['jin_later', 'southern_tang', 'later_shu', 'dali'], '后晋、南唐、后蜀、大理并存；段思平去世、段思英继位；羊苴咩城D级中心参照；疆域未定'],
  [945, ['jin_later', 'southern_tang', 'later_shu', 'dali', 'min'], '后晋、南唐、后蜀、大理并存；闽终止；段思英、段思良交接纪年有异说；羊苴咩城D级中心参照；疆域未定'],
  [946, ['jin_later', 'southern_tang', 'later_shu', 'dali'], '后晋、南唐、后蜀、大理并存；段思良继位纪年有异说；羊苴咩城D级中心参照；疆域未定'],
  [947, ['jin_later', 'han_later', 'southern_tang', 'later_shu', 'dali'], '契丹正月入汴、后晋终止；后汉二月在太原建政、五月入洛阳与开封；开封、太原为年内转换中心；疆域未定；南唐、后蜀、大理并存'],
] as const)('labels the 934–947 concurrent polity snapshot in %s', (year, ids, expected) => {
  const state = getHistoricalState(year);
  expect(state.activePolities.map(polity => polity.id)).toEqual(expect.arrayContaining([...ids]));
  expect(polityDisplayName(state.activePolities, year)).toBe(expected);
});

test.each([
  [948, '后汉以开封为中心；南唐以金陵为中枢；闽地地方军政关系不等于中央直辖；疆域未定'],
  [949, '后汉以开封为中心；南唐以金陵为中枢；泉州升清源军并兼领南州（漳州）；辖区自治不作疆界；疆域未定'],
  [950, '后汉以开封为中心；南唐以金陵为中枢；清源军等地方军政关系不作直辖边界；疆域未定'],
] as const)('shows the Southern Tang and concurrent regimes in %s', (year, expected) => {
  const state = getHistoricalState(year);
  expect(state.activePolities.map(polity => polity.id)).toEqual(expect.arrayContaining(['han_later', 'southern_tang']));
  const label = polityDisplayName(state.activePolities, year) ?? '';
  expect(label).toContain(expected);
  expect(label).toContain('并存');
});

test.each([909, 910])('keeps the Min capital and regional-range limitation visible in %s', year => {
  const state = getHistoricalState(year);
  expect(state.activePolities.map(polity => polity.id)).toContain('min');
  expect(polityDisplayName(state.activePolities, year)).toContain('闽以福州为中心，五州沿革概述不作疆界');
});

test('shows the Former Shu refusal to cede Ba and Jian in 910 without drawing their boundaries', () => {
  const state = getHistoricalState(910);
  expect(state.activePolities.map(polity => polity.id)).toContain('former_shu');
  expect(polityDisplayName(state.activePolities, 910)).toContain('岐王求巴、剑二州，王建拒绝割让；州界未定');
});

test.each([
  [934, '孟知祥在成都即帝位；渠州叛乱及平定是局部事件，不作疆界；疆域未定'],
  [935, '孟知祥以成都为中心；蜀大赦不作疆界；疆域未定'],
] as const)('shows the Later Shu annual conclusion in %s', (year, expected) => {
  const state = getHistoricalState(year);
  expect(state.activePolities.map(polity => polity.id)).toEqual(expect.arrayContaining(['tang_later', 'later_shu']));
  expect(polityDisplayName(state.activePolities, year)).toContain(expected);
});

test.each([
  [924, '南平王高季兴以江陵为中心；封爵不作疆界；疆域未定'],
  [925, '灭前蜀、蜀地接收分期；荆南以江陵为中心；邻国变化不作荆南疆界；疆域未定'],
] as const)('shows the Jingnan annual conclusion in %s', (year, expected) => {
  const state = getHistoricalState(year);
  expect(state.activePolities.map(polity => polity.id)).toContain('jingnan');
  expect(polityDisplayName(state.activePolities, year)).toContain(expected);
});

test.each([
  [951, ['han_later', 'zhou_later', 'northern_han', 'khitan', 'southern_tang', 'wuyue', 'southern_han', 'chu_ten', 'jingnan', 'later_shu', 'dali'], '后汉终止—后周、北汉建政；开封、太原为政治中心；疆域未定；辽、南唐、吴越、南汉、荆南、后蜀、大理并存；马楚终止'],
  [952, ['zhou_later', 'northern_han', 'khitan', 'southern_tang', 'wuyue', 'southern_han', 'jingnan', 'later_shu', 'dali'], '后周以开封为中央政治中心；疆域未定；辽、北汉、南唐、吴越、南汉、荆南、后蜀、大理并存'],
  [953, ['zhou_later', 'northern_han', 'khitan', 'southern_tang', 'wuyue', 'southern_han', 'jingnan', 'later_shu', 'dali'], '后周以开封为中央政治中心；疆域未定；辽、北汉、南唐、吴越、南汉、荆南、后蜀、大理并存'],
  [954, ['zhou_later', 'northern_han', 'khitan', 'southern_tang', 'wuyue', 'southern_han', 'jingnan', 'later_shu', 'dali'], '柴荣继位；后周高平战胜契丹—北汉联军；开封为中心；疆域未定；辽、北汉、南唐、吴越、南汉、荆南、后蜀、大理并存'],
  [955, ['zhou_later', 'northern_han', 'khitan', 'southern_tang', 'wuyue', 'southern_han', 'jingnan', 'later_shu', 'dali'], '后周进取秦、凤方向；开封为中心；州界未定；辽、北汉、南唐、吴越、南汉、荆南、后蜀、大理并存'],
  [956, ['zhou_later', 'northern_han', 'khitan', 'southern_tang', 'wuyue', 'southern_han', 'jingnan', 'later_shu', 'dali'], '后周南征淮南；战事不作疆界；开封为中心；疆域未定；辽、北汉、南唐、吴越、南汉、荆南、后蜀、大理并存'],
  [957, ['zhou_later', 'northern_han', 'khitan', 'southern_tang', 'wuyue', 'southern_han', 'jingnan', 'later_shu', 'dali'], '淮南战事及州郡控制转换；开封为中心；疆域未定；辽、北汉、南唐、吴越、南汉、荆南、后蜀、大理并存'],
  [958, ['zhou_later', 'northern_han', 'khitan', 'southern_tang', 'wuyue', 'southern_han', 'jingnan', 'later_shu', 'dali'], '南唐割江北地、奉后周正朔；不等于直辖江南；开封为中心；疆域未定；辽、北汉、南唐、吴越、南汉、荆南、后蜀、大理并存'],
  [959, ['zhou_later', 'northern_han', 'khitan', 'southern_tang', 'wuyue', 'southern_han', 'jingnan', 'later_shu', 'dali'], '后周北征取得关南部分地区；柴荣去世后停兵；不以单年战果回填疆界；开封为中心；疆域未定；辽、北汉、南唐、吴越、南汉、荆南、后蜀、大理并存'],
  [960, ['zhou_later', 'song_northern', 'northern_han'], '后周—北宋交替；北汉并存'],
] as const)('labels the Later Zhou and Northern Han snapshot in %s', (year, ids, expected) => {
  const state = getHistoricalState(year);
  expect(state.activePolities.map(polity => polity.id)).toEqual(expect.arrayContaining([...ids]));
  expect(polityDisplayName(state.activePolities, year)).toBe(expected);
});

test.each([
  [1115, ['khitan', 'jin_jurchen'], '辽—金并存；金建政'],
  [1118, ['khitan', 'jin_jurchen', 'song_northern'], '辽—金并存；宋金议伐辽'],
  [1120, ['khitan', 'jin_jurchen'], '辽—金并存；金取辽上京'],
  [1122, ['khitan', 'jin_jurchen', 'song_northern'], '辽—金并存；宋金议燕京分地'],
  [1123, ['khitan', 'jin_jurchen', 'song_northern'], '辽—金—宋并存；金太祖—太宗交替'],
  [1124, ['khitan', 'jin_jurchen', 'western_liao', 'song_northern', 'western_xia', 'dali'], '辽、金、北宋、西夏、大理并存；耶律大石西迁、可敦城驻留；西辽建政纪年有异说；疆域留空'],
  [1125, ['khitan', 'jin_jurchen', 'western_liao', 'song_northern', 'western_xia', 'dali'], '辽中央终止；金攻宋；耶律大石集团西迁，西辽形成纪年有异说；北宋、西夏、大理并存；疆域未定'],
] as const)('labels the Jurchen Jin founding and Liao transition snapshot in %s', (year, ids, expected) => {
  const state = getHistoricalState(year);
  expect(state.activePolities.map(polity => polity.id)).toEqual(expect.arrayContaining([...ids]));
  expect(polityDisplayName(state.activePolities, year)).toBe(expected);
});

test.each([
  [1127, ['song_northern', 'song_south', 'jin_jurchen'], '北宋终止—南宋建政；应天—扬州迁驻'],
  [1128, ['song_south', 'jin_jurchen'], '南宋—金并存；扬州行在'],
  [1129, ['song_south', 'jin_jurchen'], '南宋—金交战；行在多次迁驻'],
  [1130, ['song_south', 'jin_jurchen'], '南宋—金并存；绍兴行在'],
  [1131, ['song_south', 'jin_jurchen'], '南宋—金并存；绍兴—临安迁驻'],
  [1132, ['song_south', 'jin_jurchen'], '南宋—金并存；行在临安'],
  [1133, ['song_south', 'jin_jurchen'], '南宋—金并存；行在临安'],
  [1134, ['song_south', 'jin_jurchen'], '南宋—金并存；临安—平江驻跸'],
  [1135, ['song_south', 'jin_jurchen'], '南宋—金并存；平江—临安返驻'],
  [1136, ['song_south', 'jin_jurchen'], '南宋—金并存；临安—建康驻跸'],
  [1137, ['song_south', 'jin_jurchen'], '南宋—金并存；行在建康'],
  [1138, ['song_south', 'jin_jurchen'], '南宋—金并存；建康—临安返驻'],
] as const)('labels Southern Song court movement in %s', (year, ids, expected) => {
  const state = getHistoricalState(year);
  expect(state.activePolities.map(polity => polity.id)).toEqual(expect.arrayContaining([...ids]));
  expect(polityDisplayName(state.activePolities, year)).toBe(expected);
});

test('labels the 1368 Yuan, Ming, and Northern Yuan transition instead of showing only Yuan', () => {
  const polities = [
    { id: 'yuan', name: '元', type: 'dynasty', startYear: 1271, endYear: 1368, color: '#000', description: '', sourceIds: [] },
    { id: 'ming', name: '明', type: 'dynasty', startYear: 1368, endYear: 1644, color: '#000', description: '', sourceIds: [] },
    { id: 'northern_yuan', name: '北元', type: 'kingdom', startYear: 1368, endYear: 1635, color: '#000', description: '', sourceIds: [] },
  ] as Polity[];
  expect(polityDisplayName(polities, 1368)).toBe('元廷北撤、北元形成—明建政；应天、上都中心参照；双方疆域未定');
});

test.each([
  [1368, '元廷北撤、北元形成—明建政；应天、上都中心参照；双方疆域未定'],
  [1369, '明—北元并存；应天为明廷中心；上都失守后北元转驻应昌；两点为先后中心，不作路线或疆界'],
  [1370, '明—北元并存；应天为明廷中心；应昌陷落后北元汗廷转至和林；两点为先后中心，不作路线或疆界'],
  [1371, '明—北元并存；应天、和林中心参照；部众边界未定'],
  [1372, '明—北元并存；漠北战事不作疆界；应天、和林中心参照；疆域未定'],
  [1373, '明—北元并存；应天、和林中心参照；汗廷与部众关系不构成固定边界'],
  [1374, '明—北元并存；应天、和林中心参照；疆域未定'],
] as const)('labels the coexisting Ming and Northern Yuan snapshot in %s', (year, expected) => {
  const state = getHistoricalState(year);
  expect(state.activePolities.map(polity => polity.id)).toEqual(expect.arrayContaining(['ming', 'northern_yuan']));
  expect(polityDisplayName(state.activePolities, year)).toBe(expected);
});

test('rejects nonexistent year zero instead of silently changing its meaning', () => {
  expect(() => yearsFromPresent(0, 2026)).toThrow(/zero|0年/i);
});
