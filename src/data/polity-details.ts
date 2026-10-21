import type { PolityCapitalPhase, PolityDetail, PolityTurningPoint } from '../domain/types';

const sourceIds = ['zizhi-tongjian', 'china-chronology'];
const modernSources = [...sourceIds, 'modern-geography-reference'];

const capital = (placeId: string, validFrom: number, validTo: number, role: PolityCapitalPhase['role'] = 'primary', status: PolityCapitalPhase['status'] = 'formal', note?: string): PolityCapitalPhase => ({ placeId, validFrom, validTo, role, status, note });
const turn = (year: number, title: string, summary: string, eventId?: string): PolityTurningPoint => ({ year, title, summary, eventId });
const detail = (record: PolityDetail): PolityDetail => record;

export const polityDetails: PolityDetail[] = [
  detail({
    polityId: 'qin', perspectiveSummary: '秦帝国以统一战争结束战国列国并建立皇帝—郡县式中央政权；本条从秦帝国自身的建制、整合与短促崩解理解其历史。',
    foundationProcess: ['秦王政完成统一六国，前221年建立帝国。', '咸阳承接秦国晚期都城，成为帝国的正式政治中心。', '统一后的制度、交通与军事整合并未在建国节点瞬间完成。'],
    turningPoints: [turn(-221, '统一六国', '统一完成，秦帝国进入新的中央集权阶段。', 'qin-unification'), turn(-214, '北方经营', '北方军事防务与交通建设加强，但具体控制范围须按来源时段理解。'), turn(-209, '末年危机', '徭役、战争与地方反抗叠加，中央政权迅速失去稳定。')],
    principalFigureIds: ['qin-shi-huang', 'meng-tian'], capitalPhases: [capital('xianyang', -221, -206)],
    heritageIds: ['qin-xianyang-imperial-palace-site'], eventIds: ['qin-unification'], claimIds: ['claim-qin-imperial-heritage'], sourceIds: modernSources,
    uncertaintyNote: '秦帝国边界和地方控制具有阶段差异；遗址层只关联咸阳宫城与都城空间，不据此还原完整帝国疆域。',
  }),
  detail({
    polityId: 'han_western', perspectiveSummary: '西汉在楚汉战争后重建统一帝国秩序，经历洛阳短期建都、长安定都、诸侯治理与对外扩展。',
    foundationProcess: ['刘邦在楚汉战争中取得胜利，前202年即皇帝位。', '汉初先都洛阳，前201年后迁都长安。', '中央与诸侯王并存，统一秩序是一个持续整合过程。'],
    turningPoints: [turn(-202, '刘邦称帝', '汉帝国进入重建秩序阶段。', 'han-imperial-accession'), turn(-201, '迁都长安', '长安成为西汉长期政治中心。'), turn(-141, '武帝时期', '对外战争、郡国关系和帝国制度进入扩展阶段。')],
    principalFigureIds: ['liu-bang', 'xiao-he', 'han-xin', 'huo-qubing', 'zhang-qian'], capitalPhases: [capital('luoyang', -206, -202, 'primary', 'formal', '汉初阶段性都城'), capital('changan', -201, 9)],
    heritageIds: ['han-changan-city-site', 'weiyang-palace-site', 'han-changling'], eventIds: ['han-imperial-accession', 'chu-han-contention'], claimIds: ['claim-han-changan-capital', 'claim-liu-bang-founded-han', 'claim-han-city-heritage', 'claim-weiyang-heritage'], sourceIds: modernSources,
    uncertaintyNote: '前206年受封汉王与前202年称帝是不同起算口径；本详情采用政权重建节点，不把西汉全期的实际控制范围压缩成单一时点。',
  }),
  detail({
    polityId: 'han_eastern', perspectiveSummary: '东汉是汉室在新莽末年重新建立的政权，先经历战争与行政恢复，后以洛阳为中心维持帝国秩序。',
    foundationProcess: ['刘秀在新末群雄竞争中取得河北及更广泛政治军事基础。', '25年即皇帝位，汉政权重新进入中央建制。', '洛阳成为正式都城，但各地整合持续多年。'],
    turningPoints: [turn(25, '东汉建立', '刘秀即位，东汉政权进入形成阶段。', 'han-eastern-founded'), turn(36, '统一完成', '光武帝时期的战争与招抚逐步恢复汉帝国秩序。'), turn(184, '黄巾起义', '地方军事化与中央权威危机加深，东汉末局势改变。')],
    principalFigureIds: ['liu-xiu', 'ban-gu', 'cao-cao'], capitalPhases: [capital('luoyang', 25, 220)],
    heritageIds: ['luoyang-han-wei-city-site'], eventIds: ['han-eastern-founded', 'three-kingdoms'], claimIds: [], sourceIds: modernSources,
    uncertaintyNote: '25年建政不等于当年已控制汉旧地全部区域；东汉末期的政治中心、军镇与实际控制须和正式都城分层展示。',
  }),
  detail({
    polityId: 'wei_three', perspectiveSummary: '曹魏从东汉末年权臣集团和北方军政整合中形成，以禅代取得帝国名号，并在三国竞争中维持北方核心。',
    foundationProcess: ['曹操控制北方重要军政资源并奉汉献帝。', '220年曹丕受禅称帝，魏政权正式建立。', '洛阳成为曹魏正式都城，三国并立格局并未立即结束战争。'],
    turningPoints: [turn(220, '曹魏建立', '代汉建魏，三国分期进入新阶段。', 'three-kingdoms'), turn(227, '北伐与防线', '魏蜀军事竞争成为西部战略主线。'), turn(249, '高平陵之变', '司马氏在魏廷的权力上升，政权内部结构发生变化。')],
    principalFigureIds: ['cao-cao'], capitalPhases: [capital('luoyang', 220, 265)],
    heritageIds: ['luoyang-han-wei-city-site'], eventIds: ['three-kingdoms', 'jin-unification'], claimIds: [], sourceIds: modernSources,
    uncertaintyNote: '曹魏继承汉廷名义秩序但不等于自动继承汉末所有实际控制区域；三国边界应按阶段事件和疆域资料分别阅读。',
  }),
  detail({
    polityId: 'shu_three', perspectiveSummary: '蜀汉以汉室延续和成都盆地为政治基础，在三国竞争中形成相对独立的西南政权。',
    foundationProcess: ['刘备以汉室宗亲和军政联盟为政治资源。', '221年在成都称帝，蜀汉政权形成。', '成都兼具宫城、行政与连接蜀地交通网络的中心功能。'],
    turningPoints: [turn(221, '蜀汉建立', '刘备称帝，蜀汉进入正式建政阶段。'), turn(223, '夷陵之后', '刘备去世后，诸葛亮主持政权重建与对外战略。'), turn(263, '蜀汉灭亡', '魏军进入成都，蜀汉政权结束。')],
    principalFigureIds: ['liu-bei'], capitalPhases: [capital('chengdu', 221, 263)],
    heritageIds: ['shu-han-chengdu-city-site'], eventIds: ['three-kingdoms', 'jin-unification'], claimIds: [], sourceIds: modernSources,
    uncertaintyNote: '蜀汉对汉统的政治主张与实际控制范围是不同层次；成都遗产节点表达城市历史层，不等于完整蜀汉疆域。',
  }),
  detail({
    polityId: 'wu_three', perspectiveSummary: '孙吴以江东军政网络和长江防线为基础，在三国竞争中形成长期政权，建业／建康是其政治中心。',
    foundationProcess: ['孙氏承接江东地方军政资源并经营长江中下游。', '222年孙吴进入独立政权阶段，229年孙权称帝。', '建业后改名建邺，统一映射至建康地点。'],
    turningPoints: [turn(208, '赤壁之战', '孙权与刘备联盟阻止曹操迅速南下。', 'red-cliffs'), turn(222, '孙吴形成', '江东政权进入长期独立阶段。'), turn(280, '西晋灭吴', '孙吴向晋军投降，三国鼎立结束。', 'jin-unification')],
    principalFigureIds: ['sun-quan'], capitalPhases: [capital('jiankang', 222, 280)],
    heritageIds: ['jiankang-six-dynasties-city-site'], eventIds: ['red-cliffs', 'jin-unification'], claimIds: [], sourceIds: modernSources,
    uncertaintyNote: '赤壁战场具体位置仍需与传统地域参照区分；建康城市遗产覆盖六朝叠压层，不能单独还原孙吴城市全貌。',
  }),
  detail({
    polityId: 'jin_western', perspectiveSummary: '西晋承接曹魏禅代并完成短暂统一，洛阳失守后晋廷迁往长安，政权在内乱与外部压力下迅速瓦解。',
    foundationProcess: ['司马氏在魏廷掌握军政权力。', '265年司马炎受禅建立西晋。', '280年灭吴完成短暂统一，但八王之乱及北方战争随后改变政权结构。'],
    turningPoints: [turn(265, '西晋建立', '司马炎受魏禅建立晋朝。', 'western-jin-founded'), turn(280, '灭吴统一', '三国鼎立结束。', 'jin-unification'), turn(311, '洛阳失守', '正式都城失守，晋廷政治中心转向长安。')],
    principalFigureIds: ['sima-yan'], capitalPhases: [capital('luoyang', 265, 311), capital('changan', 312, 316, 'primary', 'actual', '末期实际政治中心')],
    heritageIds: ['luoyang-han-wei-city-site'], eventIds: ['western-jin-founded', 'jin-unification'], claimIds: ['claim-sima-yan-founded-western-jin'], sourceIds: modernSources,
    uncertaintyNote: '280年统一与265年建政不可合并为一个疆域节点；311年后的长安是后期实际中心，不应反写成全期正式首都。',
  }),
  detail({
    polityId: 'jin_eastern', perspectiveSummary: '东晋是晋室南渡后在江南重建的延续政权，以建康为都，依靠士族、侨民与江南军政网络维持南方秩序。',
    foundationProcess: ['西晋北方秩序崩解后，司马睿在江东成为晋室重建核心。', '317年称晋王，318年称帝，两个节点共同构成东晋建立过程。', '建康成为东晋正式都城和南朝政治中心的前身。'],
    turningPoints: [turn(317, '晋室南渡建政', '司马睿在建康重建晋朝。', 'eastern-jin'), turn(383, '淝水前后', '北方统一尝试失败，东晋南方格局得到延续。'), turn(420, '刘裕受禅', '东晋结束，南朝刘宋开始。')],
    principalFigureIds: ['sima-rui'], capitalPhases: [capital('jiankang', 317, 420)],
    heritageIds: ['jiankang-taicheng-site', 'jiankang-six-dynasties-city-site'], eventIds: ['eastern-jin', 'jin-unification'], claimIds: ['claim-sima-rui-ruled-eastern-jin'], sourceIds: modernSources,
    uncertaintyNote: '“南渡”是政治与人口过程，不应简化为一次性迁移；建康遗产存在六朝叠压，具体宫城层次需分别标注。',
  }),
  detail({
    polityId: 'wei_northern', perspectiveSummary: '北魏由拓跋部重建而成，经历平城时期的扩张与国家化，迁都洛阳后制度和文化方向发生显著转折。',
    foundationProcess: ['前秦崩解后拓跋部重新聚合。', '386年拓跋珪复代并改国号为魏。', '平城与洛阳分别代表早期和后期首都阶段。'],
    turningPoints: [turn(386, '北魏建立', '北魏政权进入形成阶段。', 'northern-wei-founded'), turn(439, '统一北方', '北魏成为北方主要统一政权。'), turn(494, '迁都洛阳', '孝文帝迁都与改革改变国家制度与文化空间。')],
    principalFigureIds: ['tuoba-gui', 'tuoba-tao', 'yuan-hong'], capitalPhases: [capital('pingcheng', 386, 494), capital('luoyang', 495, 534)],
    heritageIds: ['luoyang-han-wei-city-site'], eventIds: ['northern-wei-founded'], claimIds: ['claim-tuoba-gui-founded-northern-wei', 'claim-tuoba-tao-ruled-northern-wei', 'claim-yuan-hong-ruled-northern-wei'], sourceIds: modernSources,
    uncertaintyNote: '北魏疆域变化很大，首都迁移不等于控制范围同步变化；平城、洛阳的遗存与政治阶段需要分开说明。',
  }),
  detail({
    polityId: 'sui', perspectiveSummary: '隋以北周政治资源为基础重新统一南北，长安与洛阳形成双都格局，隋的统一为唐代国家结构提供前置条件。',
    foundationProcess: ['杨坚在北周末年取得中央权力。', '581年受禅建立隋朝。', '589年灭陈完成南北统一，605年后东都洛阳的地位增强。'],
    turningPoints: [turn(581, '隋建立', '杨坚受禅建立隋朝。', 'sui-founded'), turn(589, '统一南北', '隋灭陈，长期分裂结束。', 'sui-unification'), turn(605, '营建东都', '洛阳成为隋唐多中心首都体系的重要一环。')],
    principalFigureIds: ['yang-jian'], capitalPhases: [capital('changan', 581, 604), capital('luoyang', 605, 618)],
    heritageIds: ['tang-changan-city-site', 'luoyang-sui-tang-city-site'], eventIds: ['sui-founded', 'sui-unification'], claimIds: ['claim-sui-changan-capital', 'claim-yang-jian-founded-sui'], sourceIds: modernSources,
    uncertaintyNote: '581年建国与589年统一是不同历史节点；隋代首都体系包含长安、洛阳及工程阶段，不能只用单一都城概括。',
  }),
  detail({
    polityId: 'tang', perspectiveSummary: '唐在隋末重建统一帝国，长安为主要都城、洛阳为东都，政治制度、城市文化与跨区域交流共同构成唐的历史遗产。',
    foundationProcess: ['李渊控制长安并承接隋末政治资源。', '618年受禅建立唐朝。', '唐初仍经历地方战争与制度整合，后形成长安—洛阳双中心。'],
    turningPoints: [turn(618, '唐建立', '李渊在长安即位建唐。', 'tang-founded'), turn(626, '玄武门之变', '皇位继承与中央权力重新排列。'), turn(755, '安史之乱', '长安、洛阳与中央—地方关系受到重大冲击。', 'an-lushan-rebellion')],
    principalFigureIds: ['li-yuan', 'li-shimin', 'li-longji', 'wu-zhao', 'xuan-zang'], capitalPhases: [capital('changan', 618, 907), capital('luoyang', 618, 907, 'secondary', 'formal', '东都与阶段性政治中心')],
    heritageIds: ['tang-changan-city-site', 'daming-palace-site', 'xingqing-palace-site', 'luoyang-sui-tang-city-site'], eventIds: ['tang-founded', 'an-lushan-rebellion'], claimIds: ['claim-tang-changan-capital', 'claim-li-yuan-founded-tang', 'claim-li-shimin-ruled-tang', 'claim-tang-city-heritage', 'claim-daming-palace-heritage'], sourceIds: modernSources,
    uncertaintyNote: '双都制度、行幸与战乱中的临时中心不能混写为正式迁都；遗产节点展示城市和建筑层，不直接证明帝国疆域。',
  }),
  detail({
    polityId: 'yuan', perspectiveSummary: '元从蒙古汗权与征服秩序转入以“大元”为国号的王朝国家，形成上都—大都两都体系，1271年建号与1279年灭宋需分开理解。',
    foundationProcess: ['忽必烈在蒙古汗权基础上推动制度与都城建设。', '1271年定国号为大元。', '1279年南宋覆亡后，元对中原和江南的统治整合进入新的阶段。'],
    turningPoints: [turn(1260, '汗位与制度重组', '忽必烈取得汗位后推进新的国家制度。'), turn(1271, '元建立', '国号改为大元。', 'yuan-founded'), turn(1279, '南宋覆亡', '元完成对南宋主要政权的征服。')],
    principalFigureIds: ['kublai', 'liu-bingzhong', 'bayan'], capitalPhases: [capital('shangdu', 1271, 1368, 'secondary', 'formal', '夏都'), capital('dadu', 1271, 1368, 'primary', 'formal', '主要政治中心')],
    heritageIds: ['yuan-shangdu-site'], eventIds: ['yuan-founded'], claimIds: [], sourceIds: [...modernSources, 'yuan-nationalities-history', 'yuan-li-bingzhong'],
    uncertaintyNote: '蒙古帝国各汗国不能整体等同元朝；1271年是国号节点，1279年是南宋覆亡节点，两者不应合并为一次性建国。',
  }),
  detail({
    polityId: 'ming', perspectiveSummary: '明由朱元璋在元末战争中建立，以应天为初期首都，1421年后北京成为主要首都；南明另作为后续政权体系处理。',
    foundationProcess: ['朱元璋以应天为军事与行政中心击败主要竞争者。', '1368年称帝建立明朝。', '明军北取大都后，明廷仍在应天经营国家制度，后迁北京。'],
    turningPoints: [turn(1368, '明建立', '朱元璋在应天称帝，明朝形成。', 'ming-founded'), turn(1368, '北取大都', '元廷北撤，元明政权转换进入新阶段。'), turn(1421, '迁都北京', '北京成为主要首都，应天保留留都地位。')],
    principalFigureIds: ['zhu-yuanzhang'], capitalPhases: [capital('yingtian', 1368, 1420), capital('beijing', 1421, 1644), capital('yingtian', 1421, 1644, 'secondary', 'formal', '南京留都')],
    heritageIds: ['ming-yingtian-imperial-city-site'], eventIds: ['ming-founded'], claimIds: [], sourceIds: modernSources,
    uncertaintyNote: '1368年建国、北取大都和1421年迁都为不同节点；明后期与南明的政权连续性不能用一条首都记录替代。',
  }),
  detail({
    polityId: 'qing', perspectiveSummary: '清先在关外以盛京为中心完成国号与制度转换，1644年入关后转移到北京，形成新的全国性统治阶段。',
    foundationProcess: ['后金时期的军政体系和关外都城为清建立提供基础。', '1636年皇太极改国号为清。', '1644年入关并迁入北京，关内统治与关外阶段应分层叙述。'],
    turningPoints: [turn(1636, '清建立', '皇太极改国号为清。', 'qing-founded'), turn(1644, '清入关', '清廷政治中心由盛京转向北京。', 'qing-enters-pass'), turn(1683, '台湾纳入清统治', '清的全国性统治进一步扩展，但具体边疆控制仍须按阶段核验。')],
    principalFigureIds: ['nurhaci', 'dorgon'], capitalPhases: [capital('shengjing', 1636, 1644), capital('beijing', 1644, 1912)],
    heritageIds: ['qing-shengjing-palace-city-site'], eventIds: ['qing-founded', 'qing-enters-pass'], claimIds: [], sourceIds: modernSources,
    uncertaintyNote: '1636年改国号不等于已控制明朝全境；入关、迁京与后续各地归属是不同阶段，盛京遗产也需与后金赫图阿拉分开。',
  }),
];

const byPolityId = new Map(polityDetails.map((detail) => [detail.polityId, detail]));

export function getPolityDetail(polityId: string): PolityDetail | undefined {
  return byPolityId.get(polityId);
}
