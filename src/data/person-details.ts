import type { PersonDetail } from '../domain/types';

const sourceIds = ['zizhi-tongjian'];

export const personDetails: PersonDetail[] = [
  {
    personId: 'liu-bang', biography: '刘邦出身平民，经历秦末战争与楚汉竞争，最终建立汉朝，并以长安作为帝国政治中心。',
    aliases: ['汉高祖'], offices: [{ title: '汉王', polityId: 'han_western', validFrom: -206, validTo: -202, datePrecision: 'range', sourceIds }],
    keyEvents: ['changan-han-capital', 'han-imperial-accession'], sourceIds,
    uncertaintyNote: '汉的建立可按受封汉王与称帝两个节点叙述，本详情不把二者合并为单一日期。',
  },
  {
    personId: 'liu-che', biography: '刘彻即汉武帝，是西汉中期君主。建元二年（前139年）作寿陵，茂陵由此进入长期营建与陵区发展的阶段。',
    aliases: ['汉武帝'], offices: [{ title: '西汉皇帝', polityId: 'han_western', placeId: 'changan', validFrom: -141, validTo: -87, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'xian-local-chronicle-western-han-mausoleums'] }],
    keyEvents: ['maoling-built'], sourceIds: ['zizhi-tongjian', 'xian-local-chronicle-western-han-mausoleums'],
    uncertaintyNote: '前139年是作寿陵和开始营建的节点，不代表茂陵全部陵园、陪葬和陵邑空间在同年完成。',
  },
  {
    personId: 'liu-xun', biography: '刘询即汉宣帝，是西汉晚期君主。元康元年（前65年）在杜东原择址营建杜陵，形成长安南部帝陵空间的重要层次。',
    aliases: ['汉宣帝'], offices: [{ title: '西汉皇帝', polityId: 'han_western', placeId: 'changan', validFrom: -74, validTo: -49, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'xian-local-chronicle-duling'] }],
    keyEvents: ['du-ling-built'], sourceIds: ['zizhi-tongjian', 'xian-local-chronicle-duling'],
    uncertaintyNote: '前74年是刘询即位年；杜陵营建节点采用前65年，二者不合并。',
  },
  {
    personId: 'wang-mang', biography: '王莽以外戚与辅政身份进入权力核心，代汉建立新朝，长安继续作为政治中心。',
    aliases: [], offices: [{ title: '新朝皇帝', polityId: 'xin', placeId: 'changan', validFrom: 9, validTo: 23, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'wang-mang-life-chronology'] }],
    keyEvents: ['changan-xin-founded'], sourceIds: ['zizhi-tongjian', 'wang-mang-life-chronology'],
    uncertaintyNote: '王莽生卒年采用专门编年资料；改制的制度评价与成败原因仍存在不同解释，页面只呈现可追溯的编年节点。',
  },
  {
    personId: 'liu-xiu', biography: '刘秀在新末动荡中起兵，重建汉室并成为东汉开国君主；其早期政治活动与长安权力更替相连。',
    aliases: ['汉光武帝'], offices: [{ title: '更始政权将领／东汉皇帝', polityId: 'han_eastern', validFrom: 25, validTo: 57, datePrecision: 'range', sourceIds }],
    keyEvents: ['gengshi-founded', 'changan-gengshi'], sourceIds,
    uncertaintyNote: '更始、刘秀与长安之间的控制转换按阶段记录，不由单个事件点推导连续疆域。',
  },
  {
    personId: 'liu-zhuang', biography: '刘庄即汉明帝。白马寺创建传统将其与永平十一年洛阳官方佛教传播和寺院营造联系起来。',
    aliases: ['汉明帝'], offices: [{ title: '东汉皇帝', polityId: 'han_eastern', placeId: 'luoyang', validFrom: 57, validTo: 75, datePrecision: 'range', sourceIds: ['luoyang-baimasi-official', 'houhanshu-vol2-liuzhuang'] }],
    keyEvents: ['white-horse-temple-founded'], sourceIds: ['luoyang-baimasi-official', 'houhanshu-vol2-liuzhuang'],
    uncertaintyNote: '白马寺创建传统中的求法、译经和营寺叙事存在不同文献层次；本条只确认刘庄作为官方营建与传播传统中的直接人物，不将传说细节全部视为同等强度的史实。',
  },
  {
    personId: 'liu-yao', biography: '刘曜是十六国时期前赵的重要君主，前赵经营关中时，长安成为北方政治竞争的关键节点。',
    aliases: [], offices: [{ title: '前赵皇帝', polityId: 'former_zhao', placeId: 'changan', validFrom: 318, validTo: 329, datePrecision: 'range', sourceIds }],
    keyEvents: ['changan-former-zhao', 'former-zhao-ended-329'], sourceIds,
    uncertaintyNote: '十六国时期的政治中心和直接控制范围变化频繁；刘曜与329年长安失守、前赵终止相关，但不能据此把前赵全期简化为单一都城或连续边界。',
  },
  {
    personId: 'fu-jian', biography: '苻坚在前秦政治中整合关中并推动北方扩张，长安是其政权运作和军事动员的重要中心。',
    aliases: [], offices: [{ title: '前秦皇帝', polityId: 'former_qin', placeId: 'changan', validFrom: 357, validTo: 385, datePrecision: 'range', sourceIds }],
    keyEvents: ['changan-former-qin'], sourceIds,
    uncertaintyNote: '“统一北方”的概括与各地实际控制并不等价，详情保留前秦扩张叙事的范围限制。',
  },
  {
    personId: 'fu-deng', biography: '苻登是前秦后期君主。淝水之战后，他在关中与后秦长期争夺，394年在马嵬败亡，前秦统一政治结构随之终止。',
    aliases: ['前秦高帝', '前秦末帝'], offices: [{ title: '前秦皇帝', polityId: 'former_qin', placeId: 'changan', validFrom: 386, validTo: 394, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['former-qin-ended-394'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '苻登的称号、活动范围与马嵬终局属于前秦后期连续过程；本详情不把其个人败亡等同于长安城市遗产消失。',
  },
  {
    personId: 'fu-jian-founder', biography: '苻健是前秦早期建立者。351年，他在关中建立秦政权并以长安为早期政治中心；其后苻坚的统治与北方扩张属于另一阶段。',
    aliases: ['前秦景明帝'], offices: [{ title: '前秦皇帝', polityId: 'former_qin', placeId: 'changan', validFrom: 351, validTo: 355, datePrecision: 'range', sourceIds: ['jinshu-vol112-fu-jian'] }],
    keyEvents: ['former-qin-founded', 'changan-former-qin'], sourceIds: ['jinshu-vol112-fu-jian', 'zizhi-tongjian'],
    uncertaintyNote: '苻健与苻坚为不同人物；本详情只连接苻健的建政和早期长安节点，不把苻坚时期的前秦全盛疆域回填到351年。',
  },
  {
    personId: 'tufa-wugu', biography: '秃发乌孤在河湟地区建立南凉，南凉的后续统治由秃发利鹿孤与秃发傉檀承接。',
    aliases: ['南凉武王'], offices: [{ title: '南凉君主', polityId: 'southern_liang', validFrom: 397, validTo: 399, datePrecision: 'range', sourceIds }],
    keyEvents: ['southern-liang-founded-397', 'southern-liang-moves-ledu'], sourceIds,
    uncertaintyNote: '397年是南凉形成节点；秃发氏政权的后续继承与414年覆亡不能归并为秃发乌孤个人统治期。',
  },
  {
    personId: 'tufa-lilugu', biography: '秃发利鹿孤是秃发乌孤之弟，399年继承南凉，在河湟政权延续中承接乌孤的统治。',
    aliases: ['南凉康王'], offices: [{ title: '南凉君主', polityId: 'southern_liang', validFrom: 399, validTo: 402, datePrecision: 'range', sourceIds: ['jinshu-vol126-tufa-wugu'] }],
    keyEvents: [], sourceIds: ['jinshu-vol126-tufa-wugu'],
    uncertaintyNote: '《晋书》明确记载其继立与兄弟关系；具体任用地点和河湟各城控制范围不由人物关系 claim 单独推导。',
  },
  {
    personId: 'tufa-rutan', biography: '秃发傉檀是秃发乌孤、秃发利鹿孤之弟，402年继承南凉，成为南凉后期君主。',
    aliases: ['南凉景王'], offices: [{ title: '南凉君主', polityId: 'southern_liang', validFrom: 402, validTo: 414, datePrecision: 'range', sourceIds: ['jinshu-vol126-tufa-wugu'] }],
    keyEvents: ['southern-liang-ended-414'], sourceIds: ['jinshu-vol126-tufa-wugu', 'zizhi-tongjian'],
    uncertaintyNote: '《晋书》明确记载其作为利鹿孤之弟承继南凉；414年乐都失守是政权终止节点，不据继承关系推导其全期疆域或单一固定首都。',
  },
  {
    personId: 'yao-chang', biography: '姚苌在十六国后期建立后秦，后秦以长安为都，长安再次成为关中政权更替的中心。',
    aliases: [], offices: [{ title: '后秦皇帝', polityId: 'later_qin', placeId: 'changan', validFrom: 384, validTo: 393, datePrecision: 'range', sourceIds }],
    keyEvents: ['changan-later-qin'], sourceIds,
    uncertaintyNote: '后秦建立与占据长安是相关但不同层次的历史过程，按事件和任职分别记录。',
  },
  {
    personId: 'yang-jian', biography: '杨坚建立隋朝，并在汉长安城东南营建大兴城，开启隋唐长安城市空间的新阶段。',
    aliases: ['隋文帝'], offices: [{ title: '隋皇帝', polityId: 'sui', placeId: 'changan', validFrom: 581, validTo: 604, datePrecision: 'range', sourceIds }],
    keyEvents: ['northern-zhou-ended-581', 'daxing-built'], sourceIds,
    uncertaintyNote: '杨坚受北周禅让、建立隋与大兴城营建属于不同节点；大兴城与汉长安城是相邻而有区别的城市空间，不能用现代西安边界替代历史城址。',
  },
  {
    personId: 'li-yuan', biography: '李渊控制长安后建立唐朝，唐初长安成为新的帝国政治中心。',
    aliases: ['唐高祖'], offices: [{ title: '唐皇帝', polityId: 'tang', placeId: 'changan', validFrom: 618, validTo: 626, datePrecision: 'range', sourceIds }],
    keyEvents: ['tang-founded-changan'], sourceIds,
    uncertaintyNote: '618年是唐建立的关键节点，不代表唐在当年已经完成对所有地区的整合。',
  },
  {
    personId: 'li-shimin', biography: '李世民是唐初军事与政治核心，继位后以长安为帝国政治和文化中心之一。',
    aliases: ['唐太宗'], offices: [{ title: '秦王／唐皇帝', polityId: 'tang', placeId: 'changan', validFrom: 618, validTo: 649, datePrecision: 'range', sourceIds }],
    keyEvents: ['tang-founded-changan'], sourceIds,
    uncertaintyNote: '早年秦王经历、626年继位与其后皇帝时期属于不同政治阶段，本详情将其合并为可读的任职段落。',
  },
  {
    personId: 'zhou-wu', biography: '姬发即周武王，联合诸侯灭商并建立西周。关中地区是周早期政治资源与宗庙传统的重要空间。',
    aliases: ['周武王'], offices: [{ title: '西周王', polityId: 'zhou_western', validFrom: -1046, validTo: -1043, datePrecision: 'range', sourceIds }],
    keyEvents: ['zhou-conquest'], sourceIds, uncertaintyNote: '周初封建秩序的实际控制层次不能简单等同于后世统一王朝的行政边界。',
  },
  {
    personId: 'zhou-gong-dan', biography: '姬旦即周公旦，参与周初王室秩序与礼制建设，生年缺乏可靠的精确记载。',
    aliases: ['周公旦'], offices: [{ title: '周王室宗室与辅政者', polityId: 'zhou_western', datePrecision: 'unknown', sourceIds }],
    keyEvents: ['zhou-conquest'], sourceIds, uncertaintyNote: '生年未知，详情只记录可核验的角色，不补写精确出生年或未经史料确认的个人关系。',
  },
  {
    personId: 'qin-shi-huang', biography: '嬴政统一六国后称皇帝，建立秦帝国，咸阳是其政治中心；长安位于关中同一历史区域。',
    aliases: ['秦始皇'], offices: [{ title: '秦皇帝', polityId: 'qin', validFrom: -221, validTo: -210, datePrecision: 'range', sourceIds }],
    keyEvents: ['qin-unification'], sourceIds, uncertaintyNote: '秦帝国都城为咸阳，本详情不把咸阳与汉长安城混为同一城址。',
  },
  {
    personId: 'meng-tian', biography: '蒙恬是秦代将领，参与北方防务和秦帝国军事体系建设，生年史料不详。',
    aliases: [], offices: [{ title: '秦将与北方防务统帅', polityId: 'qin', validFrom: -215, validTo: -210, datePrecision: 'approximate', sourceIds: ['zizhi-tongjian', 'shiji-meng-tian'] }],
    keyEvents: ['qin-unification'], sourceIds: ['zizhi-tongjian', 'shiji-meng-tian'], uncertaintyNote: '生年未知；“秦将”是职能概括，不据此推导其具体驻地或与其他人物的关系。',
  },
  {
    personId: 'han-xin', biography: '韩信是楚汉战争中的重要将领，参与汉初军事格局形成并在关中政权建立后继续发挥作用。',
    aliases: [], offices: [{ title: '汉军将领', polityId: 'han_western', validFrom: -206, validTo: -196, datePrecision: 'range', sourceIds }],
    keyEvents: ['chu-han-contention', 'han-imperial-accession'], sourceIds, uncertaintyNote: '将领任职区间按楚汉战争与汉初阶段概括，不虚构具体官职起止日。',
  },
  {
    personId: 'xiao-he', biography: '萧何是汉初重要官员，参与关中行政与汉朝早期制度建设。',
    aliases: [], offices: [{ title: '汉丞相', polityId: 'han_western', validFrom: -202, validTo: -193, datePrecision: 'range', sourceIds }],
    keyEvents: ['changan-han-capital', 'han-imperial-accession'], sourceIds, uncertaintyNote: '详情强调任职与制度角色，不把后世评价当作可量化的行政事实。',
  },
  {
    personId: 'huo-qubing', biography: '霍去病是西汉对匈奴战争中的重要将领，活动连接汉帝国的关中动员与北方战场。',
    aliases: [], offices: [{ title: '汉骠骑将军', polityId: 'han_western', validFrom: -123, validTo: -117, datePrecision: 'range', sourceIds }],
    keyEvents: ['changan-han-capital'], sourceIds, uncertaintyNote: '相关军事行动的路线与控制范围不由长安节点单独推导。',
  },
  {
    personId: 'zhang-qian', biography: '张骞出使西域并带回关于中亚与西域的政治、地理信息，生年史料不详。',
    aliases: [], offices: [
      { title: '汉使者／第一次出使西域', polityId: 'han_western', validFrom: -138, validTo: -126, datePrecision: 'approximate', sourceIds: ['zizhi-tongjian', 'shiji-zhang-qian-dawan'] },
      { title: '汉使者／第二次出使西域', polityId: 'han_western', validFrom: -119, validTo: -115, datePrecision: 'approximate', sourceIds: ['zizhi-tongjian', 'shiji-zhang-qian-dawan'] },
    ],
    keyEvents: ['changan-han-capital'], sourceIds: ['zizhi-tongjian', 'shiji-zhang-qian-dawan'], uncertaintyNote: '生年未知；出使经历按传统编年叙述，不把交通路线等同于持续政治控制。',
  },
  {
    personId: 'liu-xuan', biography: '刘玄即更始帝，在新末动荡中建立更始政权，曾以长安为重要政治中心。',
    aliases: ['更始帝'], offices: [{ title: '更始皇帝', polityId: 'gengshi', placeId: 'changan', validFrom: 23, validTo: 25, datePrecision: 'range', sourceIds }],
    keyEvents: ['gengshi-founded', 'changan-gengshi'], sourceIds, uncertaintyNote: '生年未知；更始政权的名义统治与各地实际控制需分阶段理解。',
  },
  {
    personId: 'ban-gu', biography: '班固是东汉史家与官员，编撰《汉书》，其活动反映了汉代长安历史记忆与史学传统。',
    aliases: [], offices: [{ title: '东汉史家与官员', polityId: 'han_eastern', datePrecision: 'approximate', sourceIds }],
    keyEvents: ['changan-han-capital'], sourceIds, uncertaintyNote: '“长安文化传统”是历史语境概括，不据此断言班固长期居住或任职于单一地点。',
  },
  {
    personId: 'yao-xing', biography: '姚兴是后秦君主，统治时期长安是后秦的重要政治与宗教中心。',
    aliases: [], offices: [{ title: '后秦皇帝', polityId: 'later_qin', placeId: 'changan', validFrom: 394, validTo: 416, datePrecision: 'range', sourceIds }],
    keyEvents: ['changan-later-qin'], sourceIds, uncertaintyNote: '后秦控制范围随战争变化，长安政治中心地位不代表全域稳定控制。',
  },
  {
    personId: 'yao-hong', biography: '姚泓是后秦末帝。417年东晋刘裕攻取长安，姚泓出降，后秦统一政治结构终止；长安城市遗产继续承接后续政权。',
    aliases: ['后秦末帝'], offices: [{ title: '后秦皇帝', polityId: 'later_qin', placeId: 'changan', validFrom: 416, validTo: 417, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['later-qin-falls-changan'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '姚泓出降、长安失守和东晋接收属于417年连续过程，不将末帝结局等同于长安城市或地方社会消失。',
  },
  {
    personId: 'heliAN-bobo', biography: '赫连勃勃建立夏政权，曾在十六国后期与后秦争夺关中和长安。',
    aliases: ['刘勃勃'], offices: [{ title: '夏皇帝', polityId: 'xia', validFrom: 407, validTo: 425, datePrecision: 'range', sourceIds }],
    keyEvents: ['changan-later-qin'], sourceIds, uncertaintyNote: '其与长安的关系主要表现为区域战争和争夺，不虚构其长期定都长安。',
  },
  {
    personId: 'yu-wen-tai', biography: '宇文泰掌握关中军政，奠定西魏和北周的政治与军事基础，长安是其核心活动区域。',
    aliases: [], offices: [{ title: '西魏关中军政核心', polityId: 'wei_western', placeId: 'changan', validFrom: 535, validTo: 556, datePrecision: 'range', sourceIds }],
    keyEvents: ['daxing-built'], sourceIds, uncertaintyNote: '宇文泰并非隋大兴城营建者，关键事件只用于长安—关中政治连续性的导航，不能替代具体任职记录。',
  },
  {
    personId: 'yuan-kuo', biography: '元廓是西魏末代皇帝。557年在长安禅位于宇文觉，西魏中央政权转入北周；个人退位、北周建立和长安城市层延续是相互关联但可区分的事实。',
    aliases: ['魏恭帝', '西魏恭帝', '拓跋廓', '西魏末帝'], offices: [{ title: '西魏末代皇帝', polityId: 'wei_western', placeId: 'changan', validFrom: 554, validTo: 557, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['western-wei-ended-557'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '557年禅代是西魏中央政权终止节点；元廓的退位、宇文觉受禅和地方承接不等于长安城市或地方社会在同年消失。',
  },
  {
    personId: 'yuwen-jue', biography: '宇文觉是北周初代皇帝，557年在长安受魏恭帝元廓禅位，承接宇文氏关中军政资源建立北周。',
    aliases: ['北周孝闵帝', '北周初代皇帝'], offices: [{ title: '北周皇帝', polityId: 'zhou_northern', placeId: 'changan', validFrom: 557, validTo: 557, datePrecision: 'year', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['western-wei-ended-557'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '宇文觉受禅与北周后续制度整合、宇文毓继位及581年北周终止属于不同阶段；本详情不把其短暂在位压缩为北周全期。',
  },
  {
    personId: 'li-zhi', biography: '李治即唐高宗，继承唐初帝国体系，长安继续作为唐代宫廷与行政中心。',
    aliases: ['唐高宗'], offices: [{ title: '唐皇帝', polityId: 'tang', placeId: 'changan', validFrom: 649, validTo: 683, datePrecision: 'range', sourceIds }],
    keyEvents: ['daming-palace-built'], sourceIds, uncertaintyNote: '唐代长安与洛阳存在多中心格局，不把单一城市概括为全部政治活动地点。',
  },
  {
    personId: 'wu-zhao', biography: '武曌即武则天，先后处于唐与武周政治阶段，长安和洛阳均是重要政治中心。',
    aliases: ['武则天'], offices: [{ title: '唐皇后／武周皇帝', polityId: 'wu_zhou', validFrom: 690, validTo: 705, datePrecision: 'range', sourceIds }],
    keyEvents: ['daming-palace-built'], sourceIds, uncertaintyNote: '武周时期都城与政治中心呈现长安、洛阳并重及阶段性变化，不能简化为单一城市。',
  },
  {
    personId: 'li-longji', biography: '李隆基即唐玄宗，前期长安文化与宫廷政治高度繁盛，安史之乱后政治秩序发生重大变化。',
    aliases: ['唐玄宗'], offices: [{ title: '唐皇帝', polityId: 'tang', placeId: 'changan', validFrom: 712, validTo: 756, datePrecision: 'range', sourceIds }],
    keyEvents: ['an-lushan-rebellion'], sourceIds, uncertaintyNote: '“开元盛世”等评价不替代具体史料；安史之乱前后需区分不同政治阶段。',
  },
  {
    personId: 'wei-zheng', biography: '魏征是唐初谏臣与官员，参与贞观时期的政治讨论和制度治理。',
    aliases: [], offices: [{ title: '唐谏议与官员', polityId: 'tang', placeId: 'changan', validFrom: 626, validTo: 643, datePrecision: 'range', sourceIds }],
    keyEvents: ['tang-founded-changan'], sourceIds, uncertaintyNote: '详情只说明其在唐初朝廷任职，不把“直谏”扩展为未经来源支持的私人关系。',
  },
  {
    personId: 'xuan-zang', biography: '玄奘是唐代僧侣与译经家，往返西域后在长安译经，推动佛教知识传播。',
    aliases: [], offices: [{ title: '唐代僧侣与译经家', polityId: 'tang', placeId: 'changan', validFrom: 645, validTo: 664, datePrecision: 'range', sourceIds }],
    keyEvents: ['daming-palace-built'], sourceIds, uncertaintyNote: '译经活动与寺院归属需要专门宗教史料，本详情只保留与长安相关的稳妥概括。',
  },
  {
    personId: 'wang-wei', biography: '王维是盛唐诗人、画家与官员，长安是其仕途和文人交往的重要空间。',
    aliases: [], offices: [{ title: '唐代官员', polityId: 'tang', placeId: 'changan', datePrecision: 'approximate', sourceIds }],
    keyEvents: ['daming-palace-built'], sourceIds, uncertaintyNote: '文学活动地点存在阶段性变化，详情不据单首诗作推断精确居所。',
  },
  {
    personId: 'du-fu', biography: '杜甫是唐代诗人，曾在长安求仕和任职，其作品记录了唐代政治与社会动荡。',
    aliases: [], offices: [{ title: '唐代官员', polityId: 'tang', placeId: 'changan', validFrom: 757, validTo: 759, datePrecision: 'range', sourceIds }],
    keyEvents: ['an-lushan-rebellion'], sourceIds, uncertaintyNote: '诗歌文本与生平行迹需要互证；不把文学描写直接当作逐日地理记录。',
  },
  {
    personId: 'an-lushan', biography: '安禄山是唐代将领，发动安史之乱，战争使长安及唐帝国政治秩序受到重大冲击。',
    aliases: [], offices: [{ title: '唐将', polityId: 'tang', validFrom: 742, validTo: 755, datePrecision: 'range', sourceIds }],
    keyEvents: ['an-lushan-rebellion'], sourceIds, uncertaintyNote: '叛乱集团的控制范围随战事变化，不能由安禄山个人身份推导稳定政权边界。',
  },
  {
    personId: 'zhu-wen', biography: '朱温建立后梁，唐亡后长安不再是中原王朝持续稳定的首都。',
    aliases: ['朱全忠'], offices: [{ title: '后梁皇帝', polityId: 'liang_later', validFrom: 907, validTo: 912, datePrecision: 'range', sourceIds }],
    keyEvents: ['tang-changan-end', 'five-dynasties'], sourceIds, uncertaintyNote: '后梁都城并非长安，本详情将其作为长安政治中心转移后的对照人物。',
  },
  {
    personId: 'zhu-youzhen', biography: '朱友贞是后梁末帝。923年后唐军攻入开封后，朱友贞自尽，后梁统一政治结构终止；开封城市遗产则继续进入后唐及后续五代城市层。',
    aliases: ['后梁末帝', '朱瑱'], offices: [{ title: '后梁皇帝', polityId: 'liang_later', placeId: 'kaifeng', validFrom: 913, validTo: 923, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['later-liang-ended-923'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '923年开封失守、朱友贞自尽和后唐接收属于连续终局过程；本详情不把末帝结局等同于开封城市或地方社会消失。',
  },
  {
    personId: 'li-cunxu', biography: '李存勖建立后唐，五代时期长安的政治地位已不同于唐代帝国时期。',
    aliases: ['唐庄宗'], offices: [{ title: '后唐皇帝', polityId: 'tang_later', validFrom: 923, validTo: 926, datePrecision: 'range', sourceIds }],
    keyEvents: ['tang-changan-end', 'five-dynasties'], sourceIds, uncertaintyNote: '“唐庄宗”是后唐庙号称谓，与唐朝本身需区分；不据称谓虚构其与长安的直接任职关系。',
  },
  {
    personId: 'li-congke', biography: '李从珂是后唐末帝。936年后晋军队在契丹支持下推进至洛阳，后唐中央政权在洛阳终局中结束；其个人结局与洛阳城市历史、后晋地方接收分开记录。',
    aliases: ['唐末帝', '后唐末帝'], offices: [{ title: '后唐皇帝', polityId: 'tang_later', placeId: 'luoyang', validFrom: 934, validTo: 936, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['later-tang-ended-936'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '936年洛阳失守、李从珂个人结局和后晋对地方的接收属于连续终局过程；本详情不把末帝结局等同于洛阳城市或地方社会消失。',
  },
  {
    personId: 'yuan-hong', biography: '元宏即北魏孝文帝，迁都洛阳并推动官制、礼制与族群身份表达的改革。',
    aliases: ['拓跋宏', '北魏孝文帝'], offices: [{ title: '北魏皇帝', polityId: 'wei_northern', placeId: 'luoyang', validFrom: 471, validTo: 499, datePrecision: 'range', sourceIds }],
    keyEvents: ['northern-wei-founded'], sourceIds, uncertaintyNote: '孝文帝改革涉及制度、语言和族群认同等多个层面，详情不把后世“汉化”标签当作单一政策结果。',
  },
  {
    personId: 'yuan-xiu', biography: '元修即北魏孝武帝与末代君主。534年前后北魏中央秩序在洛阳瓦解，元修西奔长安，东魏与西魏分别承接魏室和地方政治资源；其个人结局与两个继承政权的建立分开记录。',
    aliases: ['北魏孝武帝', '北魏末帝'], offices: [{ title: '北魏末代皇帝', polityId: 'wei_northern', placeId: 'luoyang', validFrom: 532, validTo: 534, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['northern-wei-ended-534'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '534年前后元修西奔、东魏形成与西魏建政是连续过程；本详情不把元修个人结局直接等同于洛阳城市或北魏全部地方秩序消失。',
  },
  {
    personId: 'tuoba-tao', biography: '拓跋焘即北魏太武帝，长期以平城为核心推进北魏的军事整合与北方扩张。',
    aliases: ['北魏太武帝'], offices: [{ title: '北魏皇帝', polityId: 'wei_northern', placeId: 'pingcheng', validFrom: 423, validTo: 452, datePrecision: 'range', sourceIds }],
    keyEvents: ['northern-wei-founded'], sourceIds, uncertaintyNote: '建政事件节点早于拓跋焘即位，本处用于时间轴导航；其具体军事控制范围需按战事阶段区分。',
  },
  {
    personId: 'xiao-daocheng', biography: '萧道成在刘宋末年掌握军政要务，受禅建立南齐，建康仍是南朝核心都城。',
    aliases: ['齐高帝'], offices: [{ title: '南齐皇帝', polityId: 'qi_southern', placeId: 'jiankang', validFrom: 479, validTo: 482, datePrecision: 'range', sourceIds }],
    keyEvents: ['southern-qi-founded'], sourceIds, uncertaintyNote: '479年受禅与南齐对各地的实际整合是不同过程，详情不从称帝节点推导完整疆域。',
  },
  {
    personId: 'xiao-baorong', biography: '萧宝融是南齐和帝与末代君主。南齐末年萧衍控制建康朝廷，502年萧宝融在建康禅位，南齐政权终止并转入南梁阶段。',
    aliases: ['齐和帝', '南齐末帝'], offices: [{ title: '南齐末帝', polityId: 'qi_southern', placeId: 'jiankang', validFrom: 501, validTo: 502, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['southern-qi-ended-502'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '萧宝融对应南齐末年建康禅代节点；502年是政权转换年，萧衍受禅与南梁地方整合不应视为同日完成。',
  },
  {
    personId: 'chen-baxian', biography: '陈霸先在侯景之乱后的江南军政重组中取得主导地位，受梁禅位建立南陈。',
    aliases: ['陈武帝'], offices: [{ title: '南陈皇帝', polityId: 'chen_southern', placeId: 'jiankang', validFrom: 557, validTo: 559, datePrecision: 'range', sourceIds }],
    keyEvents: ['southern-chen-founded'], sourceIds, uncertaintyNote: '南陈建立与其后统一江南部分地区有时间差，建康的都城身份不代表建国当年所有地区均已稳定归附。',
  },
  {
    personId: 'chen-shubao', biography: '陈叔宝是南陈末帝，589年隋军攻取建康后出降，南陈中央政权由此终止。',
    aliases: ['陈后主', '南陈末帝'], offices: [{ title: '南陈末帝', polityId: 'chen_southern', placeId: 'jiankang', validFrom: 582, validTo: 589, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['southern-chen-ended-589'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '589年建康失守是南陈中央政权终止节点；陈叔宝的个人结局、隋的行政接收与建康城市遗产分别记录。',
  },
  {
    personId: 'shi-jingtang', biography: '石敬瑭在后唐末年借助契丹军事力量受册立为帝，建立后晋并进入中原政治竞争。',
    aliases: ['晋高祖'], offices: [{ title: '后晋皇帝', polityId: 'jin_later', placeId: 'kaifeng', validFrom: 936, validTo: 942, datePrecision: 'range', sourceIds }],
    keyEvents: ['jin-later-founded'], sourceIds, uncertaintyNote: '后晋建立与契丹援助、燕云割让及中原控制分别属于不同层次的事实，不能合并为单一因果判断。',
  },
  {
    personId: 'shi-chonggui', biography: '石重贵是后晋末帝。后晋末期契丹南下，947年开封失守，石重贵出降，后晋中央政权终止。',
    aliases: ['出帝', '后晋末帝'], offices: [{ title: '后晋末帝', polityId: 'jin_later', placeId: 'kaifeng', validFrom: 942, validTo: 947, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['later-jin-ended-947'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '石重贵的在位、开封失守与出降是后晋中央政权终止的末帝端点；契丹占领、后汉承接和开封城市遗产分别记录。',
  },
  {
    personId: 'liu-zhiyuan', biography: '刘知远在后晋覆亡后于太原即位，随后进入开封建立后汉的中原统治。',
    aliases: ['汉高祖'], offices: [{ title: '后汉皇帝', polityId: 'han_later', placeId: 'kaifeng', validFrom: 947, validTo: 948, datePrecision: 'range', sourceIds }],
    keyEvents: ['han-later-founded'], sourceIds, uncertaintyNote: '后汉建立经历太原即位与进入开封两个阶段，不能将单一即位地点等同于全政权即时控制范围。',
  },
  {
    personId: 'liu-chengyou', biography: '刘承祐是后汉末帝。950年前后后汉禁军与朝廷矛盾升级，951年郭威受禅建立后周，后汉中央政权终止。',
    aliases: ['后汉隐帝', '隐帝'], offices: [{ title: '后汉末帝', polityId: 'han_later', placeId: 'kaifeng', validFrom: 948, validTo: 951, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['later-han-ended-951'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '刘承祐个人结局、950年前后禁军冲突、951年郭威受禅和后汉中央政权终止分别表达；刘氏旧部在太原的延续不等同于后汉中央政权继续存在。',
  },
  {
    personId: 'guo-wei', biography: '郭威是后汉禁军与中原军政体系中的关键将领，受禅建立后周。',
    aliases: ['周太祖'], offices: [{ title: '后周皇帝', polityId: 'zhou_later', placeId: 'kaifeng', validFrom: 951, validTo: 954, datePrecision: 'range', sourceIds }],
    keyEvents: ['zhou-later-founded'], sourceIds, uncertaintyNote: '后周受禅、军镇归附和后续制度整顿并非同一时点，详情按政权建立节点与任职阶段分开表达。',
  },
  {
    personId: 'chai-rong', biography: '柴荣（郭荣）是郭威的养子，954年继承后周皇位，推动军政整顿、南征北伐与开封都城秩序建设；959年去世后，幼主柴宗训即位，后周进入末期。',
    aliases: ['郭荣', '周世宗'], offices: [{ title: '后周皇帝', polityId: 'zhou_later', placeId: 'kaifeng', validFrom: 954, validTo: 959, datePrecision: 'range', sourceIds }],
    keyEvents: ['zhou-later-founded'], sourceIds, uncertaintyNote: '柴荣是后周第二位皇帝；其军政整顿和959年去世与960年陈桥兵变、后周终止分别表达，不把其本人写成960年现场人物。',
  },
  {
    personId: 'chai-zongxun', biography: '柴宗训是柴荣之子，959年继位为后周末帝。960年赵匡胤在陈桥被拥立并回师开封受禅，后周中央政权终止。',
    aliases: ['周恭帝'], offices: [{ title: '后周末帝', polityId: 'zhou_later', placeId: 'kaifeng', validFrom: 959, validTo: 960, datePrecision: 'range', sourceIds }],
    keyEvents: ['later-zhou-ended-960'], sourceIds, uncertaintyNote: '柴宗训对应后周末帝与960年禅代节点；陈桥拥立、回师开封和北宋建立是连续阶段，不等于后周遗产或地方秩序同日消失。',
  },
  {
    personId: 'yelu-abaoji', biography: '耶律阿保机整合契丹诸部并于916年称帝，辽上京及其后五京体系逐步成为政治空间。',
    aliases: ['辽太祖'], offices: [{ title: '契丹／辽皇帝', polityId: 'khitan', placeId: 'liao_shangjing', validFrom: 916, validTo: 926, datePrecision: 'range', sourceIds }],
    keyEvents: ['liao-founded'], sourceIds, uncertaintyNote: '契丹、辽的国号和政权分期存在不同叙述口径，本详情沿用项目目录并保留建国节点与后续国号变化的区别。',
  },
  {
    personId: 'yelu-deguang', biography: '耶律德光即辽太宗，承接辽太祖政权并推动辽阳南京、幽州南京及五京制度重排等城市政治阶段。',
    aliases: ['辽太宗'], offices: [{ title: '辽皇帝', polityId: 'khitan', validFrom: 926, validTo: 947, datePrecision: 'range', sourceIds: ['liao-history-geography'] }],
    keyEvents: ['liao-dongdan-nanjing', 'liao-dongjing-established', 'liao-nanjing-established'], sourceIds: ['liao-history-geography'], uncertaintyNote: '928年辽阳升南京、938年辽阳改东京与幽州升南京是城市制度阶段，不等同于辽唯一首都迁移。',
  },
  {
    personId: 'shengzong-liao', biography: '耶律隆绪即辽圣宗，长期统治辽朝。统和二十五年营建中京、置大定府，辽五京体系进一步制度化。',
    aliases: ['辽圣宗'], offices: [{ title: '辽皇帝', polityId: 'khitan', validFrom: 982, validTo: 1031, datePrecision: 'range', sourceIds: ['liao-zhongjing-palace-museum'] }],
    keyEvents: ['liao-zhongjing-built'], sourceIds: ['liao-zhongjing-palace-museum'], uncertaintyNote: '中京作为五京和区域中心的事实较稳妥，但辽后期是否正式迁都中京仍存在研究分歧。',
  },
  {
    personId: 'xingzong-liao', biography: '耶律宗真即辽兴宗。重熙十三年将云州升为西京府，辽西京大同由此进入制度化的京府阶段。',
    aliases: ['辽兴宗'], offices: [{ title: '辽皇帝', polityId: 'khitan', validFrom: 1031, validTo: 1055, datePrecision: 'range', sourceIds: ['datong-liao-xijing-official'] }],
    keyEvents: ['liao-xijing-established'], sourceIds: ['datong-liao-xijing-official'], uncertaintyNote: '1044年是云州升西京府的城市制度节点，西京城市层与北魏平城及后世大同分层理解。',
  },
  {
    personId: 'yelu-yanxi', biography: '耶律延禧即辽天祚帝，承接辽末皇位并面对金军持续进攻。1125年前后辽中央政权终止；其出奔、被俘和辽亡后的个人结局需与政权终止及西辽形成分别记录。',
    aliases: ['辽天祚帝', '天祚帝'], offices: [{ title: '辽末代皇帝', polityId: 'khitan', placeId: 'liao_shangjing', validFrom: 1101, validTo: 1125, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology', 'liao-imperial-genealogy'] }],
    keyEvents: ['liao-ended-1125'], sourceIds: ['zizhi-tongjian', 'china-chronology', 'liao-imperial-genealogy'], uncertaintyNote: '耶律延禧是辽末代君主；1125年是中央政权终止的年份级节点，出奔、被俘和其后个人命运不等同于辽五京城市遗产同时消失。',
  },
  {
    personId: 'wang-jian', biography: '王建在唐末经营巴蜀军政资源，907年在成都称帝，前蜀由此形成。',
    aliases: ['前蜀高祖'], offices: [{ title: '前蜀皇帝', polityId: 'former_shu', placeId: 'chengdu', validFrom: 907, validTo: 918, datePrecision: 'range', sourceIds }],
    keyEvents: ['former-shu-founded'], sourceIds, uncertaintyNote: '907年称帝标志前蜀政权形成，但巴蜀各地的实际控制仍需结合阶段性军事与行政资料。',
  },
  {
    personId: 'wang-yan', biography: '王衍是前蜀末帝。前蜀后期宫廷与军政关系趋于脆弱，925年后唐攻取成都，王衍出降，前蜀政权终止。',
    aliases: ['前蜀后主', '前蜀末帝'], offices: [{ title: '前蜀末帝', polityId: 'former_shu', placeId: 'chengdu', validFrom: 918, validTo: 925, datePrecision: 'range', sourceIds }],
    keyEvents: ['former-shu-ended-925'], sourceIds, uncertaintyNote: '王衍对应前蜀末期统治与925年成都失守节点；出降与后唐接收、后蜀934年建政属于不同阶段，不能合并。',
  },
  {
    personId: 'meng-zhixiang', biography: '孟知祥在后唐蜀地军政基础上取得独立地位，934年在成都称帝建立后蜀。',
    aliases: ['后蜀高祖'], offices: [{ title: '后蜀皇帝', polityId: 'later_shu', placeId: 'chengdu', validFrom: 934, validTo: 934, datePrecision: 'year', sourceIds }],
    keyEvents: ['later-shu-founded'], sourceIds, uncertaintyNote: '孟知祥称帝后不久去世，后蜀的长期统治由后继者延续；本详情不把个人在位期等同于政权存续期。',
  },
  {
    personId: 'meng-chang', biography: '孟昶承接孟知祥后的后蜀政权，长期以成都为政治中心。965年北宋军队攻取成都，孟昶出降，后蜀中央政权终止。',
    aliases: ['后蜀后主', '后蜀末主'], offices: [{ title: '后蜀末主', polityId: 'later_shu', placeId: 'chengdu', validFrom: 934, validTo: 965, datePrecision: 'range', sourceIds }],
    keyEvents: ['later-shu-ended-965'], sourceIds, uncertaintyNote: '孟昶承接后蜀皇位并统治至965年成都失守；出降、北宋接收与巴蜀地方行政重组属于连续但不同阶段。',
  },
  {
    personId: 'gao-huan', biography: '高欢在北魏末年掌握东部军政资源，控制邺城并拥立元善见，东魏由此形成。',
    aliases: ['齐神武帝'], offices: [{ title: '东魏权臣与军政核心', polityId: 'wei_eastern', placeId: 'ye', validFrom: 534, validTo: 547, datePrecision: 'range', sourceIds }],
    keyEvents: ['eastern-wei-founded'], sourceIds, uncertaintyNote: '高欢是东魏实际军政核心，但东魏皇帝仍为元善见；本详情区分名义皇统与实际权力结构。',
  },
  {
    personId: 'gao-yang', biography: '高洋承接高欢家族在东魏的军政基础，550年受禅建立北齐。',
    aliases: ['北齐文宣帝'], offices: [{ title: '北齐皇帝', polityId: 'qi_northern', placeId: 'ye', validFrom: 550, validTo: 559, datePrecision: 'range', sourceIds }],
    keyEvents: ['eastern-wei-ended-550', 'northern-qi-founded'], sourceIds, uncertaintyNote: '550年受禅同时构成东魏中央政权终止与北齐建政节点；不把北齐后期控制范围回填到禅代当年。',
  },
  {
    personId: 'gao-heng', biography: '高恒是北齐末代君主，577年北周攻取邺城后出奔并在北齐终局过程中被俘。',
    aliases: ['北齐幼主', '北齐末主'], offices: [{ title: '北齐末代皇帝', polityId: 'qi_northern', placeId: 'ye', validFrom: 576, validTo: 577, datePrecision: 'range', sourceIds }],
    keyEvents: ['northern-qi-ended-577'], sourceIds, uncertaintyNote: '高恒即位、出奔与被俘发生在北齐终末连续阶段；具体行踪、被俘地点与后续处置不压缩为邺城单一时刻。',
  },
  {
    personId: 'zhao-gou', biography: '赵构在靖康之变后于应天府即位，重建宋室中央并开启南宋阶段，政权随后经历多地迁驻。',
    aliases: ['宋高宗'], offices: [{ title: '南宋皇帝', polityId: 'song_south', placeId: 'yingtian', validFrom: 1127, validTo: 1162, datePrecision: 'range', sourceIds }],
    keyEvents: ['southern-song-founded', 'song-southward'], sourceIds, uncertaintyNote: '应天即位、南渡迁移与临安主要政治中心形成是连续但不同节点，不能将后来的临安定都提前到1127年。',
  },
  {
    personId: 'zhao-bing', biography: '赵昺是南宋末帝，1279年前后在崖门终局阶段承接南宋末期皇统；其政权终止与临安城市遗产的延续属于不同层次。',
    aliases: ['宋末帝'], offices: [{ title: '南宋末帝', polityId: 'song_south', validFrom: 1278, validTo: 1279, datePrecision: 'range', sourceIds: ['yuan-nationalities-history', 'china-chronology'] }],
    keyEvents: ['southern-song-ended-1279'], sourceIds: ['yuan-nationalities-history', 'china-chronology'], uncertaintyNote: '赵昺的末帝阶段、崖门战事、人物结局和地方接收是连续过程，不能以单一地点或单一日期替代。',
  },
  {
    personId: 'lu-xiufu', biography: '陆秀夫是南宋末期宰辅，参与末帝赵昺阶段的朝廷维系与崖门终局，代表南宋末期军政与皇统承接。',
    aliases: ['陆君实'], offices: [{ title: '南宋末期宰辅', polityId: 'song_south', validFrom: 1278, validTo: 1279, datePrecision: 'range', sourceIds: ['yuan-nationalities-history', 'china-chronology'] }],
    keyEvents: ['southern-song-ended-1279'], sourceIds: ['yuan-nationalities-history', 'china-chronology'], uncertaintyNote: '陆秀夫的具体军政行动和人物结局需与崖门区域战事分层，不将其个人行为替代南宋末期整体政治过程。',
  },
  {
    personId: 'yue-fei', biography: '岳飞是南宋抗金战争中的重要将领，活动连接南宋政权重建、北方防御与宋金军事竞争。',
    aliases: ['岳鹏举'], offices: [{ title: '南宋将领', polityId: 'song_south', validFrom: 1127, validTo: 1142, datePrecision: 'range', sourceIds }],
    keyEvents: ['song-southward'], sourceIds, uncertaintyNote: '岳飞的军事行动需按具体战役与阶段核验；“抗金”不等于由单一人物代表南宋全部对外政策。',
  },
  {
    personId: 'qin-hui', biography: '秦桧是南宋宰相，任相期间参与宋金和议与朝廷权力运作，并与岳飞形成重大政治冲突。',
    aliases: ['秦会之'], offices: [{ title: '南宋宰相', polityId: 'song_south', validFrom: 1138, validTo: 1155, datePrecision: 'range', sourceIds }],
    keyEvents: ['song-southward'], sourceIds, uncertaintyNote: '秦桧与岳飞的关系包含制度、军事和政治评价多个层面，本详情保留可核验的任相与政策冲突，不把后世评价当作单一事实。',
  },
  {
    personId: 'liu-yu', biography: '刘裕在东晋末年通过北伐与军政整合取得权力，最终受禅建立刘宋，开启南朝新阶段。',
    aliases: ['宋武帝'], offices: [{ title: '刘宋皇帝', polityId: 'song_southern', placeId: 'jiankang', validFrom: 420, validTo: 422, datePrecision: 'range', sourceIds }],
    keyEvents: ['eastern-jin'], sourceIds, uncertaintyNote: '东晋末年掌权、北伐和420年受禅建宋是连续过程；本详情用东晋政权节点导航，不把其等同于单一战役。',
  },
  {
    personId: 'murong-chui', biography: '慕容垂曾在前秦体系中任职，淝水之战后重建慕容氏政权，后燕由此形成。',
    aliases: ['后燕成武帝'], offices: [{ title: '后燕皇帝', polityId: 'later_yan', validFrom: 384, validTo: 396, datePrecision: 'range', sourceIds }],
    keyEvents: ['later-yan-founded'], sourceIds, uncertaintyNote: '384年前后是后燕形成阶段，386年称帝是后续节点；其与前秦既有阶段性效力也有后续对立，不能简化为单一关系。',
  },
  {
    personId: 'murong-xi', biography: '慕容熙是后燕末帝。后燕失去河北后退守龙城，407年高云取代慕容熙，后燕政权终止，龙城政治中心转入新的燕政权阶段。',
    aliases: ['后燕昭文帝', '后燕末帝'], offices: [{ title: '后燕末帝', polityId: 'later_yan', placeId: 'longcheng', validFrom: 401, validTo: 407, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['later-yan-ended-407'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '慕容熙对应后燕末期统治与407年龙城政权转换；高云取代后燕并不等于409年冯跋掌权已在同日完成，北燕起点和称谓需分期理解。',
  },
  {
    personId: 'shi-hu', biography: '石虎是后赵重要军事人物，石勒时期已参与核心军事事务，后期进一步掌握后赵朝政。',
    aliases: ['后赵武帝'], offices: [{ title: '后赵皇帝', polityId: 'later_zhao', placeId: 'ye', validFrom: 334, validTo: 349, datePrecision: 'range', sourceIds }],
    keyEvents: ['later-zhao-founded'], sourceIds, uncertaintyNote: '后赵建立早于石虎即位，本详情以建政节点作为政权导航，不把石虎个人统治期回填为后赵建国期。',
  },
  {
    personId: 'li-xiong', biography: '李雄在巴蜀军政动荡中建立成汉，成都成为其政权形成与持续运作的核心城市。',
    aliases: ['成汉武帝'], offices: [{ title: '成汉皇帝', polityId: 'cheng_han', placeId: 'chengdu', validFrom: 304, validTo: 334, datePrecision: 'range', sourceIds }],
    keyEvents: ['cheng-han-founded'], sourceIds, uncertaintyNote: '304年前后是成汉形成阶段，306年称帝是后续节点；不能将形成阶段和正式称帝压缩为同一年。',
  },
  {
    personId: 'li-shi', biography: '李势是成汉末代君主，347年东晋桓温攻取成都后出降，成汉政权终止。',
    aliases: ['成汉末帝'], offices: [{ title: '成汉皇帝', polityId: 'cheng_han', placeId: 'chengdu', validFrom: 343, validTo: 347, datePrecision: 'range', sourceIds }],
    keyEvents: ['cheng-han-ended-347'], sourceIds, uncertaintyNote: '李势代表成汉末期统治阶段；347年出降与成都城市继续承接是不同历史层次。',
  },
  {
    personId: 'huan-wen', biography: '桓温是东晋重要将领与政治人物，347年西征攻取成都，结束成汉的独立政权阶段。',
    aliases: ['桓宣武'], offices: [{ title: '东晋将领', polityId: 'jin_eastern', placeId: 'jiankang', validFrom: 346, validTo: 347, datePrecision: 'range', sourceIds }],
    keyEvents: ['cheng-han-ended-347'], sourceIds, uncertaintyNote: '桓温在347年成都战事中的军事角色与其后东晋朝廷政治活动分开记录。',
  },
  {
    personId: 'xiao-yan', biography: '萧衍在南齐末年掌握建康朝廷与江南军政资源，502年受禅建立南梁。',
    aliases: ['梁武帝'], offices: [{ title: '南梁皇帝', polityId: 'liang_southern', placeId: 'jiankang', validFrom: 502, validTo: 549, datePrecision: 'range', sourceIds }],
    keyEvents: ['southern-liang-founded'], sourceIds, uncertaintyNote: '502年受禅与南梁对各地的实际整合是不同过程，建康政治中心身份不代表建国当年已完成全域控制。',
  },
  {
    personId: 'tuoba-gui', biography: '拓跋珪在前秦崩溃后的北方重建部众，复代改魏，北魏政权由此形成。',
    aliases: ['魏道武帝'], offices: [{ title: '北魏皇帝', polityId: 'wei_northern', placeId: 'pingcheng', validFrom: 386, validTo: 409, datePrecision: 'range', sourceIds }],
    keyEvents: ['northern-wei-founded'], sourceIds, uncertaintyNote: '386年复代、改国号与随后北魏制度和控制范围扩展分属不同阶段；平城是早期政治中心参照。',
  },
  {
    personId: 'han-shizhong', biography: '韩世忠是南宋重要将领，参与宋金战争并与岳飞共同构成南宋军事网络。',
    aliases: ['韩良臣'], offices: [{ title: '南宋将领', polityId: 'song_south', validFrom: 1127, validTo: 1151, datePrecision: 'range', sourceIds }],
    keyEvents: ['song-southward'], sourceIds, uncertaintyNote: '韩世忠与岳飞的同僚和协同关系需按具体战役核验，本详情不把二人的关系简化为持续无变化的政治联盟。',
  },
  {
    personId: 'sima-rui', biography: '司马睿是西晋宗室，北方秩序崩解后在江东士族支持下于建康重建晋室，东晋由此展开。',
    aliases: ['晋元帝'], offices: [{ title: '东晋皇帝', polityId: 'jin_eastern', placeId: 'jiankang', validFrom: 317, validTo: 323, datePrecision: 'range', sourceIds }],
    keyEvents: ['eastern-jin'], sourceIds, uncertaintyNote: '317年称晋王、318年称帝是连续但不同的建政节点；建康政治中心身份不代表东晋当年已恢复西晋旧境。',
  },
  {
    personId: 'yuwen-yong', biography: '宇文邕是北周武帝，在宇文泰建立的关中军政基础上推进制度和军事整合，北周由此具备继续北伐的能力。',
    aliases: ['北周武帝'], offices: [{ title: '北周皇帝', polityId: 'zhou_northern', placeId: 'changan', validFrom: 560, validTo: 578, datePrecision: 'range', sourceIds }],
    keyEvents: ['northern-qi-ended-577'], sourceIds, uncertaintyNote: '宇文邕主持北周灭北齐与北方东部承接；577年战争、邺城接收和北周后续行政整合属于连续但可区分的阶段。',
  },
  {
    personId: 'yuwen-chan', biography: '宇文阐是北周静帝与末代君主。581年杨坚掌握朝廷与关中军政资源后，宇文阐在长安禅位，北周中央政权终止，隋由此承接；个人退位与隋后续统一分开表达。',
    aliases: ['北周静帝', '北周末帝'], offices: [{ title: '北周末代皇帝', polityId: 'zhou_northern', placeId: 'changan', validFrom: 579, validTo: 581, datePrecision: 'range', sourceIds }],
    keyEvents: ['northern-zhou-ended-581'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '581年禅让是北周中央政权终止节点；宇文阐的个人退位、杨坚受禅和隋完成南北统一不是同一事实，589年灭陈另行记录。',
  },
  {
    personId: 'li-yu', biography: '李煜是南唐末代君主，南唐在其统治末期与北宋对峙并于975年覆亡，词作保留了政权末期的文化记忆。',
    aliases: ['南唐后主', '李后主'], offices: [{ title: '南唐国主', polityId: 'southern_tang', placeId: 'jiankang', validFrom: 961, validTo: 975, datePrecision: 'range', sourceIds }],
    keyEvents: ['southern-tang-founded', 'southern-tang-ended-975'], sourceIds, uncertaintyNote: '南唐建政事件早于李煜即位；本处同时连接975年南唐终局，但不把李煜个人统治期前移为南唐建立期，也不把出降后的经历等同于地方行政承接。',
  },
  {
    personId: 'yang-xingmi', biography: '杨行密在唐末淮南军镇竞争中积累军政资源，受封吴王后杨吴进入独立发展的分期。',
    aliases: ['吴太祖'], offices: [{ title: '杨吴实际统治者', polityId: 'wu_ten', placeId: 'yangzhou', validFrom: 902, validTo: 905, datePrecision: 'range', sourceIds }],
    keyEvents: ['yang-wu-founded'], sourceIds, uncertaintyNote: '902年是受封与政权分期节点，不等同于正式称帝或完整主权独立；扬州是政治中心参照。',
  },
  {
    personId: 'yang-pu', biography: '杨溥是杨吴末代君主，在徐知诰掌握核心权力的背景下维持吴廷名义；937年禅让使杨吴中央政权终止，扬州地方接收另属后续承接层次。',
    aliases: ['吴睿帝', '杨吴末帝'], offices: [{ title: '杨吴末代君主', polityId: 'wu_ten', placeId: 'yangzhou', validFrom: 920, validTo: 937, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['yang-wu-ended-937'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '937年禅让是杨吴中央政权终止节点；杨溥个人退位、徐知诰受禅和扬州地方行政接收不能压缩为同一事实。',
  },
  {
    personId: 'qian-liu', biography: '钱镠控制两浙并以杭州为中心维持地方政权，吴越在中原册封和地方自治之间延续。',
    aliases: ['吴越武肃王'], offices: [{ title: '吴越国王', polityId: 'wuyue', placeId: 'hangzhou', validFrom: 907, validTo: 932, datePrecision: 'range', sourceIds }],
    keyEvents: ['wuyue-founded'], sourceIds, uncertaintyNote: '907年受封标记吴越政权分期，不把册封范围直接等同于两浙全部地区的稳定直接控制。',
  },
  {
    personId: 'qian-chu', biography: '钱俶是吴越末王，承接钱氏在杭州及两浙的地方统治。978年向北宋纳土后，吴越中央政权终止，钱氏王室与杭州城市遗产进入北宋及后续历史层。',
    aliases: ['钱弘俶', '吴越忠懿王', '吴越末王'], offices: [{ title: '吴越末王', polityId: 'wuyue', placeId: 'hangzhou', validFrom: 947, validTo: 978, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['wuyue-ended-978'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '钱俶的纳土归宋是978年吴越中央政权终止节点；其入朝、北宋地方接收和钱氏后续待遇属于不同事实层次。',
  },
  {
    personId: 'wang-shenzhi', biography: '王审知与兄长在福建经营军政资源，受封闽王后以福州为中心维持闽地地方政权。',
    aliases: ['闽太祖'], offices: [{ title: '闽王', polityId: 'min', placeId: 'fuzhou', validFrom: 909, validTo: 925, datePrecision: 'range', sourceIds }],
    keyEvents: ['min-founded'], sourceIds, uncertaintyNote: '909年是受封与政权分期节点，福建各地的实际归属仍需按阶段核验；王审知并非以称帝节点定义全部闽国史。',
  },
  {
    personId: 'liu-yin', biography: '刘隐在岭南经营广州及周边军政资源，为刘龑后来称帝和南汉国号形成提供了政治基础。',
    aliases: ['南汉奠基者'], offices: [{ title: '清海军政核心', polityId: 'southern_han', placeId: 'guangzhou', validFrom: 904, validTo: 911, datePrecision: 'range', sourceIds }],
    keyEvents: ['southern-han-founded'], sourceIds, uncertaintyNote: '刘隐是南汉形成的奠基者而非917年称帝者；事件链接用于呈现政权前史，不把兄弟继承关系简化为同一建国行为。',
  },
  {
    personId: 'ma-yin', biography: '马殷在潭州及湖湘地区扩张势力，受封楚王后建立相对稳定的地方政治秩序。',
    aliases: ['楚武穆王'], offices: [{ title: '楚王', polityId: 'chu_ten', placeId: 'changsha', validFrom: 907, validTo: 930, datePrecision: 'range', sourceIds }],
    keyEvents: ['ma-chu-founded'], sourceIds, uncertaintyNote: '907年受封标记马楚政权分期，不把中原册封直接等同于湖湘所有地区同日完成直接控制。',
  },
  {
    personId: 'ma-xiguang', biography: '马希广是马楚末期君主，马希萼进攻长沙与兄弟争位使马楚中央秩序走向终局。',
    aliases: ['楚废王'], offices: [{ title: '楚王', polityId: 'chu_ten', placeId: 'changsha', validFrom: 947, validTo: 951, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['ma-chu-ended-951'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '马希广之死属于951年马楚终结前的内乱阶段，不能把其死亡、长沙失守和湖南全域接收视为同一时刻。',
  },
  {
    personId: 'ma-xie', biography: '马希萼是马楚末期宗室竞争者，曾控制长沙并在951年后退守衡山，后续归附南唐。',
    aliases: ['楚恭孝王'], offices: [{ title: '楚王', polityId: 'chu_ten', placeId: 'changsha', validFrom: 950, validTo: 951, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['ma-chu-ended-951'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '马希萼的长沙、衡山和南唐处置属于马楚终结期不同阶段，不能把衡山阶段直接等同于长沙中央政权控制。',
  },
  {
    personId: 'ma-xichong', biography: '马希崇在马希萼控制长沙后参与楚末政局，951年政变后被推为武安留后并向南唐求援，长沙被边镐军接收后降服。',
    aliases: ['马楚末主', '武安留后'], offices: [{ title: '武安留后', polityId: 'chu_ten', placeId: 'changsha', validFrom: 951, validTo: 951, datePrecision: 'year', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['ma-chu-ended-951'], sourceIds: ['zizhi-tongjian', 'china-chronology', 'song-history-nantang'], uncertaintyNote: '马希崇降服标记马楚中央政权终止，不代表湖南各地和朗州同日完成南唐行政接收。',
  },
  {
    personId: 'sima-yan', biography: '司马炎承接司马氏在曹魏中枢形成的权力，受禅建立西晋，并在280年灭吴实现短暂统一。',
    aliases: ['晋武帝'], offices: [{ title: '西晋皇帝', polityId: 'jin_western', placeId: 'luoyang', validFrom: 265, validTo: 290, datePrecision: 'range', sourceIds }],
    keyEvents: ['western-jin-founded'], sourceIds, uncertaintyNote: '265年受禅建立西晋与280年灭吴分别是建政和统一节点，不能把后者的版图回填到建国当年。',
  },
  {
    personId: 'zhao-kuangyin', biography: '赵匡胤在后周军政体系中崛起，经陈桥兵变受禅建立北宋，开封继续作为中原政治中心。',
    aliases: ['宋太祖'], offices: [{ title: '北宋皇帝', polityId: 'song_northern', placeId: 'kaifeng', validFrom: 960, validTo: 976, datePrecision: 'range', sourceIds }],
    keyEvents: ['northern-song-founded', 'later-shu-ended-965'], sourceIds, uncertaintyNote: '960年受禅是北宋建政节点，965年成都接收属于后续统一过程，不由北宋后期范围倒推建国初期控制。',
  },
  {
    personId: 'taizong-song', biography: '赵光义即宋太宗，承接赵匡胤后的北宋皇位。979年亲征太原，接受刘继元出降，北汉中央政权由此结束；太原及河东地方行政的后续接收另作阶段表达。',
    aliases: ['宋太宗', '赵炅'], offices: [{ title: '北宋皇帝', polityId: 'song_northern', placeId: 'kaifeng', validFrom: 976, validTo: 997, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['northern-han-ended-979'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '979年太原终局是北汉中央政权终止节点；宋对太原、河东的地方接收和辽宋边境关系属于后续过程，不等同于一日完成全面统一。',
  },
  {
    personId: 'wanyan-aguda', biography: '完颜阿骨打整合女真诸部，于1115年在会宁称帝建立金，随后与辽和北宋展开长期战争。',
    aliases: ['金太祖'], offices: [{ title: '金皇帝', polityId: 'jin_jurchen', placeId: 'huining', validFrom: 1115, validTo: 1123, datePrecision: 'range', sourceIds }],
    keyEvents: ['jurchen-jin-founded'], sourceIds, uncertaintyNote: '1115年是会宁建国节点，不以金灭辽和占领北宋后的范围倒推早期女真政权控制区。',
  },
  {
    personId: 'wanyan-liang', biography: '完颜亮即海陵王，是金代中期君主。1151—1153年推动中都营建，1153年将金的主要政治中心由上京会宁府迁至中都。',
    aliases: ['海陵王'], offices: [{ title: '金皇帝', polityId: 'jin_jurchen', placeId: 'jin_zhongdu', validFrom: 1149, validTo: 1161, datePrecision: 'range', sourceIds: ['beijing-jin-zhongdu-archaeology', 'capital-history-reference'] }],
    keyEvents: ['jurchen-jin-moves-zhongdu'], sourceIds: ['beijing-jin-zhongdu-archaeology', 'capital-history-reference'], uncertaintyNote: '1151—1153年为中都营建与迁都阶段；营建者、迁都决定和完整城市建设不是同一日完成。',
  },
  {
    personId: 'wanyan-shouxu', biography: '完颜守绪即金哀宗，是金末帝。金末政治中心在战争压力下由中都转向开封，1234年前后金政权覆亡，开封城市历史和金代首都遗产则继续进入后续层次。',
    aliases: ['金哀宗'], offices: [{ title: '金末皇帝', polityId: 'jin_jurchen', placeId: 'kaifeng', validFrom: 1224, validTo: 1234, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['jin-ended-1234'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '完颜守绪的末代统治、迁居开封、蒙古军事推进和1234年政权覆亡属于连续终末阶段的不同层次；政权终止不等于开封城市遗产终止。',
  },
  {
    personId: 'li-yuanhao', biography: '李元昊整合党项军政资源，于1038年称帝建立西夏，兴庆府成为其政权的政治中心。',
    aliases: ['西夏景宗'], offices: [{ title: '西夏皇帝', polityId: 'western_xia', placeId: 'xingqing', validFrom: 1038, validTo: 1048, datePrecision: 'range', sourceIds }],
    keyEvents: ['western-xia-founded'], sourceIds, uncertaintyNote: '1038年是称帝与国号形成节点，不把西夏后期的扩张范围提前回填到建国当年。',
  },
  {
    personId: 'li-xian-western-xia', biography: '李睍是西夏末代君主，活动于西夏面对蒙古持续进攻的末期。1227年前后西夏政治结构覆亡、兴庆府城市层转入后续历史，不能写成城市与遗产在同日消失。',
    aliases: ['西夏末帝'], offices: [{ title: '西夏末代皇帝', polityId: 'western_xia', placeId: 'xingqing', validFrom: 1226, validTo: 1227, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['western-xia-ended-1227'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '李睍的末代统治、蒙古军事推进与西夏地方秩序重组属于同一终末阶段的不同层次；1227作为项目采用的政权覆亡节点，不等于兴庆府城市遗产终止。',
  },
  {
    personId: 'yu-the-great', biography: '禹是传统夏代建政叙事中的核心人物，治水、受禅与夏王朝形成在后世文献中相互连接。',
    aliases: ['大禹', '夏禹'], offices: [{ title: '传统夏代先王', polityId: 'xia_early', datePrecision: 'unknown', sourceIds: ['china-chronology'] }],
    keyEvents: [], sourceIds: ['china-chronology'], uncertaintyNote: '夏代年代、禹的个人事迹及“建立夏”的具体历史过程存在文献与考古层面的争议，本详情不把传统叙事当作已证实的逐年编年。',
  },
  {
    personId: 'wu-ding', biography: '武丁是商代重要君主，甲骨文记录了其祭祀、战争和王室活动，反映出晚商国家组织的一部分面貌。',
    aliases: ['殷高宗'], offices: [{ title: '商王', polityId: 'shang', validFrom: -1250, validTo: -1192, datePrecision: 'approximate', sourceIds: ['china-chronology'] }],
    keyEvents: [], sourceIds: ['china-chronology'], uncertaintyNote: '武丁在位年代采用商代分期的约年范围；甲骨卜辞的纪事性质与后世王年换算不能简单等同。',
  },
  {
    personId: 'ji-chang', biography: '姬昌即周文王，在商周更替前整合周人政治资源，为周武王克商和西周王室秩序奠定基础。',
    aliases: ['周文王'], offices: [{ title: '周方伯与先王', polityId: 'zhou_western', datePrecision: 'approximate', sourceIds: ['china-chronology', 'western-zhou-national-museum'] }],
    keyEvents: ['zhou-conquest'], sourceIds: ['china-chronology', 'western-zhou-national-museum'], uncertaintyNote: '文王生卒与“文王时期周人势力范围”存在不同重建，本详情只将其与周克商叙事建立阶段性导航。',
  },
  {
    personId: 'ji-yijiu', biography: '姬宜臼即周平王，周室东迁后以洛邑为政治中心，东周王室由此进入新的历史阶段。',
    aliases: ['周平王'], offices: [{ title: '东周王室国王', polityId: 'zhou_eastern', placeId: 'luoyang', validFrom: -770, validTo: -720, datePrecision: 'range', sourceIds: ['china-chronology'] }],
    keyEvents: ['zhou-eastward'], sourceIds: ['china-chronology'], uncertaintyNote: '东迁涉及周王室、诸侯与军事保护等多重过程；洛邑作为王室中心不等同于对诸侯地区的直接行政控制。',
  },
  {
    personId: 'qin-mugong', biography: '秦穆公时期秦国在西部诸侯格局中扩展影响，秦国的崛起为后来的统一提供了长期政治与军事积累。',
    aliases: ['秦穆公'], offices: [{ title: '秦国国君', polityId: 'qin_state', validFrom: -659, validTo: -621, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology', 'qin-mugong-chronology'] }],
    keyEvents: [], sourceIds: ['zizhi-tongjian', 'china-chronology', 'qin-mugong-chronology'], uncertaintyNote: '卒年有传统编年依据，但生年并非《秦本纪》直接记载；秦国早期年代与疆域仍需按诸侯国阶段核验，不能把秦穆公时期的影响范围提前等同于秦帝国版图。',
  },
  {
    personId: 'qin-xiangong', biography: '秦襄公护送周平王东迁并获列为诸侯，是秦国进入东周诸侯分期的关键人物。',
    aliases: ['秦襄公'], offices: [{ title: '秦国国君', polityId: 'qin_state', validFrom: -777, validTo: -766, datePrecision: 'range', sourceIds: ['shiji-qin-benji', 'zizhi-tongjian'] }],
    keyEvents: ['qin-state-founded-eighth-batch'], sourceIds: ['shiji-qin-benji', 'zizhi-tongjian'], uncertaintyNote: '前770年表达护送东迁与列侯名义节点，不等于秦国此时已完成关中整合，也不将咸阳前推为秦襄公活动地点。',
  },
  {
    personId: 'zhao-wuling', biography: '赵武灵王推行胡服骑射，推动赵国军事组织和边疆防务转型，是战国政治改革的重要案例。',
    aliases: ['赵武灵王'], offices: [{ title: '赵国国君', polityId: 'zhao_warring', datePrecision: 'range', sourceIds: ['zizhi-tongjian'] }],
    keyEvents: ['zhao-wuling-reforms-307'], sourceIds: ['zizhi-tongjian'], uncertaintyNote: '胡服骑射的具体实施过程和年代按战国编年概括，改革成效不应直接推导为赵国全境同时改变；前403年赵国分期与前307年改革是不同节点。',
  },
  {
    personId: 'modu-chanyu', biography: '冒顿单于整合匈奴部众并建立强势草原政治秩序，汉初北方格局因此发生重要变化。',
    aliases: ['冒顿单于'], offices: [{ title: '匈奴单于', polityId: 'xiongnu', validFrom: -209, validTo: -174, datePrecision: 'approximate', sourceIds: ['zizhi-tongjian', 'shiji-xiongnu-modu'] }],
    keyEvents: ['xiongnu-founded'], sourceIds: ['zizhi-tongjian', 'shiji-xiongnu-modu'], uncertaintyNote: '匈奴政治中心具有移动性，冒顿“建立”更多指部众整合和权力重组，不应套用固定都城或行政疆界概念。',
  },
  {
    personId: 'esen-taishi', biography: '也先是北元中期蒙古政治中的重要军事与权力人物，曾拥立脱脱不花并在其后争夺汗权。',
    aliases: ['也先太师'], offices: [{ title: '瓦剌太师与北元军政核心', polityId: 'northern_yuan', datePrecision: 'range', sourceIds: ['northern-yuan-yesen'] }],
    keyEvents: [], sourceIds: ['northern-yuan-yesen'], uncertaintyNote: '也先与脱脱不花的关系在拥立、共治和争夺汗权之间变化，不能用单一“辅臣”标签覆盖全部阶段。',
  },
  {
    personId: 'tuotuobuhua', biography: '脱脱不花是北元中期被拥立的蒙古大汗，其汗位与也先的军事权力并存。',
    aliases: ['脱脱不花汗'], offices: [{ title: '北元大汗', polityId: 'northern_yuan', datePrecision: 'range', sourceIds: ['northern-yuan-early-ming', 'northern-yuan-yesen'] }],
    keyEvents: [], sourceIds: ['northern-yuan-early-ming', 'northern-yuan-yesen'], uncertaintyNote: '北元作为元室北迁后的历史称谓存在分期和定义差异；脱脱不花的汗位、实际控制与也先权力需分层展示。',
  },
  {
    personId: 'zhu-yousong', biography: '朱由崧即弘光帝，是南明诸政权中的重要君主之一；其政权以南京为主要政治中心，存续时间较短。',
    aliases: ['弘光帝'], offices: [{ title: '南明弘光帝', polityId: 'ming_southern', placeId: 'yingtian', validFrom: 1644, validTo: 1645, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology', 'southern-ming-hongguang'] }],
    keyEvents: ['southern-ming-founded', 'hongguang-nanjing-founded'], sourceIds: ['zizhi-tongjian', 'china-chronology', 'southern-ming-overview', 'southern-ming-hongguang'], uncertaintyNote: '南明是明室南迁后多个政权阶段的合称，朱由崧政权不能代表南明全部政权，也不能由南京名义控制推导完整疆域；本详情将弘光南京阶段与南明合称分开。',
  },
  {
    personId: 'zhu-yujian', biography: '朱聿键即隆武帝，弘光南京阶段覆亡后在福州即位，成为南明东南阶段的君主。',
    aliases: ['隆武帝'], offices: [{ title: '南明隆武帝', polityId: 'ming_southern', placeId: 'fuzhou', validFrom: 1645, validTo: 1646, datePrecision: 'range', sourceIds: ['southern-ming-longwu', 'fuzhou-longwu-site'] }],
    keyEvents: ['southern-ming-founded', 'longwu-fuzhou-founded'], sourceIds: ['southern-ming-overview', 'southern-ming-longwu', 'ming-shi-vol120-southern-ming'], uncertaintyNote: '朱聿键仅代表隆武阶段；福州朝廷名义、郑芝龙军镇实际控制和隆武覆亡后的南明承接不能合并为单一疆域。',
  },
  {
    personId: 'zheng-zhi-long', biography: '郑芝龙是隆武福州阶段的重要东南军政人物，掌握海上与福建地方网络，在朝廷名义和军镇自主性之间发挥关键作用。',
    aliases: ['一官'], offices: [{ title: '隆武朝廷军政人物', polityId: 'ming_southern', placeId: 'fuzhou', validFrom: 1645, validTo: 1646, datePrecision: 'range', sourceIds: ['southern-ming-longwu', 'fuzhou-longwu-site'] }],
    keyEvents: ['longwu-fuzhou-founded'], sourceIds: ['southern-ming-longwu', 'fuzhou-longwu-site'], uncertaintyNote: '郑芝龙的军镇、海上网络与隆武朝廷的关系具有阶段性，不能只用现代国家官僚体系解释。',
  },
  {
    personId: 'huang-daozhou', biography: '黄道周是隆武朝廷的重要文臣与抗清人物，参与福州阶段的政治组织和军事动员。',
    aliases: ['幼玄'], offices: [{ title: '隆武朝廷大臣', polityId: 'ming_southern', placeId: 'fuzhou', validFrom: 1645, validTo: 1646, datePrecision: 'range', sourceIds: ['southern-ming-longwu', 'ming-shi-vol120-southern-ming'] }],
    keyEvents: ['longwu-fuzhou-founded'], sourceIds: ['southern-ming-longwu', 'ming-shi-vol120-southern-ming'], uncertaintyNote: '黄道周的任职、出征与殉难属于隆武阶段的具体政治过程，不据此推断南明各阶段存在连续中央。',
  },
  {
    personId: 'zhu-yuyue', biography: '朱聿鐭即绍武帝，隆武覆亡后在广州即位，与肇庆永历政权形成同期并立的短期阶段。',
    aliases: ['绍武帝'], offices: [{ title: '南明绍武帝', polityId: 'ming_southern', placeId: 'guangzhou', validFrom: 1646, validTo: 1646, datePrecision: 'range', sourceIds: ['southern-ming-shaowu', 'guangzhou-shaowu-tomb'] }],
    keyEvents: ['shaowu-guangzhou-founded'], sourceIds: ['southern-ming-overview', 'southern-ming-shaowu', 'ming-shi-vol120-southern-ming'], uncertaintyNote: '绍武阶段在1646年内迅速建立并覆亡，且与永历并立；广州不能被表述为南明全期唯一首都。',
  },
  {
    personId: 'su-guansheng', biography: '苏观生是广州绍武朝廷的重要军政大臣，参与短期朝廷的组织与广州防务。',
    aliases: [], offices: [{ title: '绍武朝廷大臣', polityId: 'ming_southern', placeId: 'guangzhou', validFrom: 1646, validTo: 1646, datePrecision: 'range', sourceIds: ['southern-ming-shaowu', 'guangzhou-shaowu-tomb'] }],
    keyEvents: ['shaowu-guangzhou-founded'], sourceIds: ['southern-ming-shaowu', 'guangzhou-shaowu-tomb'], uncertaintyNote: '苏观生的政治关系限于绍武广州阶段，相关墓葬材料可支持人物群体与遗产关联，但不能替代完整传记史料。',
  },
  {
    personId: 'zhu-youlang', biography: '朱由榔即永历帝，1646年在肇庆即位，随后率南明政治中心向桂林、昆明等西南空间迁移。',
    aliases: ['永历帝', '桂王'], offices: [{ title: '南明永历帝', polityId: 'ming_southern', placeId: 'zhaoqing', validFrom: 1646, validTo: 1662, datePrecision: 'range', sourceIds: ['southern-ming-yongli', 'zhaoqing-yongli-heritage'] }],
    keyEvents: ['southern-ming-founded', 'yongli-zhaoqing-founded', 'yongli-regime-ended-1662'], sourceIds: ['southern-ming-overview', 'southern-ming-yongli', 'ming-shi-vol120-southern-ming'], uncertaintyNote: '肇庆仅是永历初期中心；朱由榔后续迁移、与大西军合作及西南控制范围必须按阶段展示。',
  },
  {
    personId: 'wu-sangui', biography: '吴三桂在清初经营云南并参与清军进缅、接收和押解永历帝的过程；其具体责任应按追捕、交付、押解和昆明处置等层次区分。',
    aliases: ['平西王'], offices: [{ title: '清平西王', polityId: 'qing', placeId: 'kunming', validFrom: 1659, validTo: 1678, datePrecision: 'range', sourceIds: ['southern-ming-yongli', 'ming-shi-vol120-southern-ming'] }],
    keyEvents: ['yongli-regime-ended-1662'], sourceIds: ['southern-ming-yongli', 'ming-shi-vol120-southern-ming'], uncertaintyNote: '吴三桂在永历终结过程中的角色可确认到清方云南军政与进缅接收押解链条，但不将所有具体处置细节视为同等确定。',
  },
  {
    personId: 'qu-shisi', biography: '瞿式耜是拥立并辅佐永历政权的重要大臣，连接肇庆初期、广西经营与后续抗清网络。',
    aliases: ['起田'], offices: [{ title: '永历朝廷大臣', polityId: 'ming_southern', placeId: 'zhaoqing', validFrom: 1646, validTo: 1650, datePrecision: 'range', sourceIds: ['southern-ming-yongli', 'ming-shi-vol120-southern-ming'] }],
    keyEvents: ['yongli-zhaoqing-founded'], sourceIds: ['southern-ming-yongli', 'ming-shi-vol120-southern-ming'], uncertaintyNote: '瞿式耜的活动跨越肇庆与广西阶段，本详情用肇庆作为永历初期关联地点，不把其任职范围扩展为永历全期固定朝廷。',
  },
  {
    personId: 'shi-kefa', biography: '史可法是南明弘光时期的重要军政人物，负责扬州防务，与朱由崧朝廷存在阶段性君臣关系。',
    aliases: ['道邻'], offices: [{ title: '南明督师', polityId: 'ming_southern', validFrom: 1644, validTo: 1645, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['southern-ming-founded', 'hongguang-nanjing-founded'], sourceIds: ['zizhi-tongjian', 'china-chronology', 'southern-ming-overview', 'southern-ming-hongguang'], uncertaintyNote: '史可法与弘光朝廷的关系以任职和军事防务为核心，不把后世忠烈评价直接替代当时政治关系的史料核验；本详情将弘光南京阶段与南明合称分开。',
  },
  {
    personId: 'temujin', biography: '铁木真在草原部众竞争中逐步整合力量，1206年被推举为成吉思汗，蒙古汗国进入共同汗权阶段。',
    aliases: ['成吉思汗'], offices: [{ title: '蒙古大汗', polityId: 'mongol', validFrom: 1206, validTo: 1227, datePrecision: 'range', sourceIds: ['china-chronology'] }],
    keyEvents: ['mongol-founded'], sourceIds: ['china-chronology'], uncertaintyNote: '1206年大会标志共同汗权形成，但蒙古诸部的整合、扩张和后续帝国化是分阶段过程，不能把后期疆域回填到建政节点。',
  },
  {
    personId: 'ogedei', biography: '窝阔台承接成吉思汗家族的蒙古汗权，推动蒙古对金、西夏及欧亚多地的战争与行政扩张；1234年金政权覆亡属于其统治时期的区域政权转折。',
    aliases: ['元太宗', '窝阔台汗'], offices: [{ title: '蒙古大汗', polityId: 'mongol', validFrom: 1229, validTo: 1241, datePrecision: 'range', sourceIds: ['china-chronology', 'yuan-nationalities-history'] }],
    keyEvents: ['jin-ended-1234'], sourceIds: ['china-chronology', 'yuan-nationalities-history'], uncertaintyNote: '窝阔台代表蒙古汗权体系，1234年灭金涉及多线军事行动、地方接收与金末帝结局，不能简化为单一统帅个人行为。',
  },
  {
    personId: 'jamukha', biography: '札木合曾与铁木真结为安答并共同活动，后因部众、联盟和汗权竞争与铁木真分裂，成为蒙古统一前的重要对手。',
    aliases: ['札答阑部首领'], offices: [{ title: '草原部落联盟首领', polityId: 'mongol', datePrecision: 'approximate', sourceIds: ['china-chronology'] }],
    keyEvents: ['mongol-founded'], sourceIds: ['china-chronology'], uncertaintyNote: '札木合与铁木真的结盟、分裂和对立经历多个阶段，具体年份与部众构成应结合蒙古史料分别核验。',
  },
  {
    personId: 'nurhaci', biography: '努尔哈赤整合女真诸部，1616年建立后金，早期以赫图阿拉为政治中心，后迁辽阳与沈阳。',
    aliases: ['清太祖'], offices: [{ title: '后金汗', polityId: 'later_jin', validFrom: 1616, validTo: 1626, datePrecision: 'range', sourceIds: ['china-chronology'] }],
    keyEvents: ['later-jin-founded'], sourceIds: ['china-chronology'], uncertaintyNote: '后金建立、女真部众整合与都城迁移是不同阶段；赫图阿拉、辽阳和沈阳不能合并为同一时期的首都。',
  },
  {
    personId: 'hongtaiji', biography: '皇太极继承努尔哈赤的后金政治基础，在盛京推进制度重组，1636年改国号为清。',
    aliases: ['清太宗'], offices: [{ title: '后金汗', polityId: 'later_jin', validFrom: 1626, validTo: 1636, datePrecision: 'range', sourceIds: ['china-chronology'] }, { title: '清皇帝', polityId: 'qing', validFrom: 1636, validTo: 1643, datePrecision: 'range', sourceIds: ['china-chronology'] }],
    keyEvents: ['qing-founded'], sourceIds: ['china-chronology'], uncertaintyNote: '1636年改国号为清与1644年入关属于不同历史阶段，本详情不把入关后的北京政治中心提前到盛京时期。',
  },
  {
    personId: 'shunzhi', biography: '福临即顺治帝，在多尔衮等辅政力量支持下承继清朝，1644年入关并迁入北京，清廷政治中心随之转移。',
    aliases: ['顺治帝'], offices: [{ title: '清皇帝', polityId: 'qing', validFrom: 1643, validTo: 1661, datePrecision: 'range', sourceIds: ['china-chronology'] }],
    keyEvents: ['qing-enters-pass'], sourceIds: ['china-chronology'], uncertaintyNote: '顺治即位、清军入关和迁入北京是连续但不同的节点，入关不等于当年已经完成对各地的稳定控制。',
  },
  {
    personId: 'sun-yat-sen', biography: '孙中山是近代中国革命家，1912年在南京就任临时大总统，中华民国临时政府由此成立。',
    aliases: ['孙文'], offices: [{ title: '中华民国临时大总统', polityId: 'republic', placeId: 'yingtian', validFrom: 1912, validTo: 1912, datePrecision: 'year', sourceIds: ['china-chronology'] }],
    keyEvents: ['republic-founded'], sourceIds: ['china-chronology'], uncertaintyNote: '1912年南京临时政府成立与其后政权迁都、政治权力转移属于不同节点，本详情不把临时政府等同于整个大陆时期民国的持续控制。',
  },
  {
    personId: 'chiang-kai-shek', biography: '蒋介石是抗战时期国民政府军事与政治核心人物。1937年后国民政府迁驻重庆，重庆承担战时中央驻地和国家政治、军事运作中心功能。',
    aliases: ['蒋中正'], offices: [{ title: '国民政府军事与政治核心人物', polityId: 'republic', placeId: 'chongqing', validFrom: 1938, validTo: 1945, datePrecision: 'range', sourceIds: ['republic-chongqing-wartime-center-official'] }],
    keyEvents: ['republic-chongqing-wartime-center'], sourceIds: ['republic-chongqing-wartime-center-official'], uncertaintyNote: '本详情只连接蒋介石与重庆战时政治、军事中心阶段，不将其个人角色等同于全部国民政府机关或重庆全部抗战遗产。',
  },
  {
    personId: 'mao-zedong', biography: '毛泽东是中国共产党和中华人民共和国历史中的重要政治人物，1949年在北京成立典礼上宣告中央人民政府成立。',
    aliases: [], offices: [{ title: '中华人民共和国中央人民政府主要领导人', polityId: 'prc', placeId: 'beijing', validFrom: 1949, validTo: 1976, datePrecision: 'range', sourceIds: ['china-chronology'] }],
    keyEvents: ['prc-founded'], sourceIds: ['china-chronology'], uncertaintyNote: '1949年建国典礼是政权成立节点，毛泽东后续政治角色和政策阶段需要结合不同事件、制度与史料分别展示。',
  },
  {
    personId: 'cao-cao', biography: '曹操在东汉末年掌握朝廷与北方军政资源，官渡之战后逐步形成北方核心势力；赤壁之战失利后，曹魏仍以其政治与制度基础为重要来源。',
    aliases: ['魏武帝', '曹孟德'], offices: [
      { title: '东汉丞相', polityId: 'han_eastern', validFrom: 208, validTo: 216, datePrecision: 'range', sourceIds: ['zizhi-tongjian'] },
      { title: '魏王与曹魏奠基者', polityId: 'wei_three', validFrom: 216, validTo: 220, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] },
    ], keyEvents: ['red-cliffs', 'three-kingdoms'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '曹操生前以东汉丞相、魏王身份掌权，曹魏作为正式帝国政权通常以曹丕220年代汉为节点；本详情不把追尊与生前称帝混为一谈。',
  },
  {
    personId: 'liu-bei', biography: '刘备以汉室宗亲身份参与群雄竞争，在荆州、益州经营政治与军事基础；赤壁后与孙权合作，最终于成都建立蜀汉。',
    aliases: ['汉昭烈帝', '刘玄德'], offices: [
      { title: '东汉左将军与益州牧', polityId: 'han_eastern', placeId: 'chengdu', validFrom: 214, validTo: 220, datePrecision: 'range', sourceIds: ['zizhi-tongjian'] },
      { title: '蜀汉皇帝', polityId: 'shu_three', placeId: 'chengdu', validFrom: 221, validTo: 223, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] },
    ], keyEvents: ['red-cliffs', 'three-kingdoms'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '刘备的汉室宗亲身份、政治合法性主张与蜀汉称帝分别属于不同层次；赤壁联盟是阶段性军事合作，不等同于长期同盟。',
  },
  {
    personId: 'sun-quan', biography: '孙权继承孙氏在江东的军政基础，赤壁之战中与刘备共同抵抗曹操，随后在建业经营孙吴并完成称帝建国。',
    aliases: ['吴大帝', '孙仲谋'], offices: [
      { title: '东汉讨虏将军与江东统治者', polityId: 'han_eastern', placeId: 'jiankang', validFrom: 200, validTo: 220, datePrecision: 'range', sourceIds: ['zizhi-tongjian'] },
      { title: '孙吴皇帝', polityId: 'wu_three', placeId: 'jiankang', validFrom: 222, validTo: 252, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] },
    ], keyEvents: ['red-cliffs', 'three-kingdoms'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '孙权在称帝前长期以汉臣和江东实际统治者身份活动，222年吴王阶段与229年正式称帝应与孙吴全期分层展示。',
  },
  {
    personId: 'han-qian', biography: '韩虔即韩景侯，三家分晋后韩在前403年获周王室承认，韩作为战国诸侯国进入传统编年。',
    aliases: ['韩景侯'], offices: [{ title: '韩国诸侯', polityId: 'han_warring', validFrom: -403, validTo: -400, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['han-warring-founded-eighth-batch'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '前403年是周王室册命与战国分期的传统节点，不等同于韩在此前没有独立政治活动，也不据此推导完整疆域。',
  },
  {
    personId: 'wei-wenhou', biography: '魏斯即魏文侯，三家分晋后成为魏国早期君主，通过任用李悝等人和经营河东奠定魏国发展基础。',
    aliases: ['魏文侯'], offices: [{ title: '魏国诸侯', polityId: 'wei_warring', validFrom: -403, validTo: -396, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['wei-warring-founded-eighth-batch'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '魏文侯改革与三家分晋是相互关联但不同的历史层次；改革内容和年代以传统文献叙述为主，不能简化为单一诏令。',
  },
  {
    personId: 'zhao-liehou', biography: '赵籍即赵烈侯，三家分晋后赵在前403年获周王室承认，赵国由此进入战国诸侯的传统分期。',
    aliases: ['赵烈侯'], offices: [{ title: '赵国诸侯', polityId: 'zhao_warring', validFrom: -403, validTo: -400, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['zhao-warring-founded-eighth-batch'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '前403年只标记周王室承认和传统编年节点，不把后来的赵武灵王改革或赵国疆域提前归入赵烈侯时期。',
  },
  {
    personId: 'jumong', biography: '朱蒙是高句丽建国叙事中的核心人物，传统纪年以公元前37年作为其在东北亚建立高句丽的节点。',
    aliases: ['高朱蒙', '东明圣王'], offices: [{ title: '高句丽国王', polityId: 'goguryeo', validFrom: -37, validTo: -19, datePrecision: 'approximate', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['goguryeo-founded'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '高句丽早期建国年代、都城迁移和国家形态具有传统纪年与考古年代差异，朱蒙的建国叙事不能直接推导后期疆域。',
  },
  {
    personId: 'park-hyeokgeose', biography: '朴赫居世是新罗早期王权传统中的开国君主，传统纪年以公元前57年即位作为新罗起始节点。',
    aliases: ['赫居世居西干'], offices: [{ title: '新罗早期君主', polityId: 'silla', validFrom: -57, validTo: 4, datePrecision: 'approximate', sourceIds: ['silla-encykorea', 'silla-samguksagi-db'] }],
    keyEvents: ['silla-founded'], sourceIds: ['silla-encykorea', 'silla-samguksagi-db'], uncertaintyNote: '前57年是新罗传统起始纪年，早期辰韩诸部整合是持续过程；王统记载与考古年代不应机械等同。',
  },
  {
    personId: 'murong-tuyuhun', biography: '慕容吐谷浑率部众向西迁徙，吐谷浑名称和河湟—青海区域政治共同体在其后逐步形成。',
    aliases: ['吐谷浑'], offices: [{ title: '吐谷浑部众首领', polityId: 'tuyuhun', validFrom: 296, validTo: 317, datePrecision: 'approximate', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['tuyuhun-founded'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '313年前后是吐谷浑形成阶段的约年，迁徙过程、首领体系与后续政权建制不能全部归结为慕容吐谷浑个人完成。',
  },
  {
    personId: 'songtsen-gampo', biography: '松赞干布继承并扩大吐蕃高原政治基础，推动诸部整合、对外关系和王权中心建设，吐蕃由此进入帝国形成阶段。',
    aliases: ['弃宗弄赞'], offices: [{ title: '吐蕃赞普', polityId: 'tibetan_empire', validFrom: 629, validTo: 650, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['tibetan-founded', 'tibetan-yalong-center'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '吐蕃形成不是单一年份完成的国家化过程，松赞干布时期的雅砻早期中心、拉萨中心和唐蕃关系需按不同阶段阅读。',
  },
  {
    personId: 'piluo-ge', biography: '皮罗阁在洱海区域经营蒙舍诏并整合六诏力量，南诏在唐廷册封和地方扩张的交错过程中形成。',
    aliases: ['阁罗凤之父'], offices: [{ title: '南诏王', polityId: 'nanzhao', validFrom: 728, validTo: 748, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['nanzhao-founded'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '738年册封与南诏地方整合是相关但不同的节点；唐廷承认不等同于南诏当年已完成对西南全部地区的直接控制。',
  },
  {
    personId: 'duan-siping', biography: '段思平在后南诏时期的洱海政治格局中取得主导地位，建立大理并延续西南地方王国的制度与文化传统。',
    aliases: ['大理太祖'], offices: [{ title: '大理国王', polityId: 'dali', validFrom: 937, validTo: 944, datePrecision: 'range', sourceIds: ['china-chronology'] }],
    keyEvents: ['dali-founded'], sourceIds: ['china-chronology'], uncertaintyNote: '大理建立年代和段思平事迹主要依赖后世编年与地方传统，937年作为政权形成节点使用，不据此恢复全域边界。',
  },
  {
    personId: 'duan-xingzhi', biography: '段兴智是大理末期国王，连接1253年前后蒙古进入洱海核心、大理政权终止与羊苴咩城历史层的延续。',
    aliases: ['大理末主'], offices: [{ title: '大理末期国王', polityId: 'dali', validFrom: 1244, validTo: 1253, datePrecision: 'range', sourceIds: ['china-chronology', 'dali-history-research-nopss'] }],
    keyEvents: ['dali-ended-1253'], sourceIds: ['china-chronology', 'dali-history-research-nopss'], uncertaintyNote: '段兴智在1253年前后大理政权终止阶段的具体行动、归附过程与后续处置需与蒙古入滇和元代行政接收分层阅读。',
  },
  {
    personId: 'duan-ye', biography: '段业在后凉衰乱后的河西张掖被推立为君，北凉由此进入形成阶段；其统治随后被沮渠蒙逊等力量改造。',
    aliases: ['北凉君主'], offices: [{ title: '北凉君主', polityId: 'northern_liang', placeId: 'zhangye', validFrom: 397, validTo: 401, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['northern-liang-founded'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '397年是段业被推立与北凉分期的形成节点，北凉后续由沮渠氏掌政，不能把段业个人统治等同于北凉全期。',
  },
  {
    personId: 'qifu-guoren', biography: '乞伏国仁在前秦衰乱后于陇右建立西秦，西秦的政治中心和控制范围随与前秦、后秦的战争而多次变化。',
    aliases: ['西秦宣烈王'], offices: [{ title: '西秦君主', polityId: 'western_qin', validFrom: 385, validTo: 388, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['western-qin-founded'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '385年是西秦形成阶段的起点，乞伏国仁称王、政权迁徙和后续复立属于连续但不同的历史节点。',
  },
  {
    personId: 'murong-huang', biography: '慕容皝在辽东与河北重建慕容氏势力，337年称燕王，前燕随后发展为十六国时期的重要政权。',
    aliases: ['前燕文明帝'], offices: [{ title: '前燕君主', polityId: 'former_yan', placeId: 'ye', validFrom: 337, validTo: 348, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['former-yan-founded'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '337年称燕王是前燕形成的重要节点，前燕在辽东、河北的控制范围随战争变化，不能回填为固定疆域。',
  },
  {
    personId: 'murong-wei', biography: '慕容暐是前燕末帝，前燕后期以邺为主要中心，370年前秦攻取邺后被俘，政权由此终止。',
    aliases: ['前燕幽帝', '前燕末帝'], offices: [{ title: '前燕皇帝', polityId: 'former_yan', placeId: 'ye', validFrom: 360, validTo: 370, datePrecision: 'range', sourceIds }],
    keyEvents: ['former-yan-ended-370'], sourceIds, uncertaintyNote: '慕容暐代表前燕末期统治阶段；370年被俘与邺城及地方社会继续承接是不同历史层次。',
  },
  {
    personId: 'shi-le', biography: '石勒在西晋末年北方战争中积累军政资源，脱离前赵控制后于319年建立后赵，并以襄国为重要政治中心。',
    aliases: ['后赵高祖'], offices: [{ title: '后赵皇帝', polityId: 'later_zhao', placeId: 'xiangguo', validFrom: 319, validTo: 333, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['later-zhao-founded'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '319年称赵王是后赵形成节点，石勒此前的依附、战争和政权整合不能压缩为单一建国日。',
  },
  {
    personId: 'murong-de', biography: '慕容德是慕容氏宗室，在后燕失去河北后率部南下，于398年在广固重建燕政权，史称南燕。',
    aliases: ['南燕献武帝'], offices: [{ title: '南燕皇帝', polityId: 'southern_yan', placeId: 'guanggu', validFrom: 398, validTo: 405, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['southern-yan-founded'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '398年是南燕形成节点，南迁、建都广固和后续对山东地区的控制属于连续但不同的阶段。',
  },
  {
    personId: 'lv-guang', biography: '吕光奉前秦之命经营西域，淝水之战后控制河西并在386年前后建立后凉。',
    aliases: ['后凉懿武帝'], offices: [{ title: '后凉君主', polityId: 'later_liang', placeId: 'guzang', validFrom: 386, validTo: 399, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['later-liang-founded'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '386年前后是吕光在河西建立独立政权的形成阶段，前秦西征军身份与后凉君主身份需分开叙述。',
  },
  {
    personId: 'juqu-mengxun', biography: '沮渠蒙逊在北凉内部竞争中于401年取代段业，随后长期经营河西，使北凉进入稳定发展阶段。',
    aliases: ['北凉武宣王'], offices: [{ title: '北凉君主', polityId: 'northern_liang', placeId: 'zhangye', validFrom: 401, validTo: 433, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['northern-liang-founded'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '北凉建政事件覆盖397年段业被推立至后续政权重组，本详情将沮渠蒙逊的401年掌权单独标出。',
  },
  {
    personId: 'juqu-mujian', biography: '沮渠牧犍是北凉末主，连接439年前后北魏攻取姑臧、北凉政权终止与姑臧城市遗产的延续。',
    aliases: ['北凉末主'], offices: [{ title: '北凉末主', polityId: 'northern_liang', placeId: 'guzang', validFrom: 433, validTo: 439, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['northern-liang-ended-439'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '沮渠牧犍末期统治、北魏进入姑臧和后续处置属于连续过程，不用单一日期或地点替代。',
  },
  {
    personId: 'li-hao', biography: '李暠在397—399年经营敦煌并取得军政基础，400年建立西凉，405年迁治酒泉，维系河西西部政权与丝路交通。',
    aliases: ['西凉武昭王'], offices: [{ title: '西凉君主', polityId: 'western_liang', placeId: 'dunhuang', validFrom: 400, validTo: 404, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology', 'jinshu-vol87-li-hao', 'zizhi-tongjian-vol111-western-liang'] }, { title: '西凉君主', polityId: 'western_liang', placeId: 'jiuquan', validFrom: 405, validTo: 417, datePrecision: 'range', sourceIds: ['jinshu-vol87-li-hao'] }],
    keyEvents: ['western-liang-state-founded'], sourceIds: ['zizhi-tongjian', 'china-chronology', 'jinshu-vol87-li-hao', 'zizhi-tongjian-vol111-western-liang'], uncertaintyNote: '400年为西凉建政确定年；397—399年受命敦煌与405年迁治酒泉分别是前置和后续阶段，不能压成固定单一都城。',
  },
  {
    personId: 'gao-jixing', biography: '高季兴在五代中原政权更替中经营江陵，924年前后形成荆南地方政权并维持其相对独立。',
    aliases: ['南平武信王'], offices: [{ title: '荆南节度使与国主', polityId: 'jingnan', placeId: 'jiangling', validFrom: 907, validTo: 929, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['jingnan-founded'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '高季兴早期受中原政权任命，924年前后才进入荆南政权分期；藩镇任职与地方独立不能混为一谈。',
  },
  {
    personId: 'gao-baorong', biography: '高保融承接高季兴之后的荆南政权，以江陵为中心维持地方自治；其统治连接荆南中期与北宋统一前的继承阶段。',
    aliases: ['南平贞懿王'], offices: [{ title: '荆南国主', polityId: 'jingnan', placeId: 'jiangling', validFrom: 948, validTo: 960, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['jingnan-founded'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '高保融属于荆南中后期继承阶段，不能由其统治期反推924年政权形成或963年纳土当日的全部地方接收。',
  },
  {
    personId: 'gao-baoxu', biography: '高保勖承接高保融后的荆南高氏政权，短期主持江陵地方事务，处于高继冲纳土归宋前的过渡阶段。',
    aliases: ['荆南末期国主'], offices: [{ title: '荆南国主', polityId: 'jingnan', placeId: 'jiangling', validFrom: 960, validTo: 962, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['jingnan-founded'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '高保勖在位时间较短，人物端点用于补全荆南继承链，不把其短期统治与963年高继冲纳土合并。',
  },
  {
    personId: 'gao-jichong', biography: '高继冲是荆南末主。963年，他向北宋纳土，江陵政治中心转入北宋承接阶段，荆南政权身份由此终止。',
    aliases: ['荆南末主'], offices: [{ title: '荆南国主', polityId: 'jingnan', placeId: 'jiangling', validFrom: 962, validTo: 963, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['jingnan-ended-963'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '963年纳土归宋是荆南中央政权身份终止的年份级节点；江陵地方行政接收、军镇调整与城市遗产延续按过程分层。',
  },
  {
    personId: 'feng-ba', biography: '冯跋在后燕末年于辽西拥立高云并最终掌握政权，409年前后建立北燕，延续东北地区的燕政权传统。',
    aliases: ['北燕文成帝'], offices: [{ title: '北燕皇帝', polityId: 'northern_yan', placeId: 'longcheng', validFrom: 409, validTo: 430, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['northern-yan-founded'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '北燕形成涉及高云被拥立、冯跋掌权等连续阶段，本详情不把后燕末期与北燕正式分期压缩为单一事件。',
  },
  {
    personId: 'li-bian', biography: '李昪原名徐知诰，在杨吴政治体系中逐步掌握权力，937年受禅建立齐，939年改国号为唐，后世称南唐。',
    aliases: ['徐知诰'], offices: [{ title: '杨吴权臣／南唐皇帝', polityId: 'southern_tang', placeId: 'jiankang', validFrom: 927, validTo: 943, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['southern-tang-founded'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '937年受禅建齐与939年改国号为唐是两个制度节点；本详情保留徐知诰、李昪两个姓名阶段。',
  },
  {
    personId: 'li-jing', biography: '李璟是李昪之子，942年继位为南唐中主，先后灭闽、楚，后周南征后割地称臣并迁居豫章，961年去世后由李煜继位。',
    aliases: ['李景通', '南唐中主', '元宗'], offices: [{ title: '南唐皇帝', polityId: 'southern_tang', placeId: 'jiankang', validFrom: 943, validTo: 960, datePrecision: 'range', sourceIds: ['song-history-nantang', 'palace-museum-li-jing'] }, { title: '南唐后期君主／豫章政治中心', polityId: 'southern_tang', placeId: 'nanchang', validFrom: 961, validTo: 961, datePrecision: 'year', sourceIds: ['song-history-nantang', 'palace-museum-li-jing'], uncertaintyNote: '《宋史》记为迁于豫章，属于李璟去世前的短时段中心，不代表南唐长期正式迁都。' }],
    keyEvents: ['southern-tang-li-jing-succeeds', 'southern-tang-conquers-min', 'min-ended-945', 'southern-tang-conquers-chu', 'southern-tang-cedes-huainan', 'southern-tang-moves-nanchang'], sourceIds: ['song-history-nantang', 'palace-museum-li-jing'], uncertaintyNote: '《宋史》记李璟942年袭位；项目事件以943年作为政权承接目录节点，保留史料纪年与事件分期差异；945年攻闽与福州承接仍按过程性约年展示。'
  },
  {
    personId: 'liu-yan', biography: '刘龑承接兄长刘隐在广州经营的岭南军政资源，917年称帝，918年改国号为汉，南汉进入正式建政阶段。',
    aliases: ['刘岩', '南汉高祖'], offices: [{ title: '南汉皇帝', polityId: 'southern_han', placeId: 'guangzhou', validFrom: 917, validTo: 942, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['southern-han-founded'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '917年国号为越、918年改称汉；“南汉”是后世通称，不能把刘龑称帝日与岭南全域整合混为一谈。',
  },
  {
    personId: 'liu-sheng', biography: '刘晟承接刘龑后的南汉皇位，广州继续作为政治中心。其统治阶段连接南汉王室谱系与刘鋹971年面对北宋攻势的终局。',
    aliases: ['南汉中宗'], offices: [{ title: '南汉皇帝', polityId: 'southern_han', placeId: 'guangzhou', validFrom: 943, validTo: 958, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['southern-han-founded'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '刘晟个人统治阶段晚于南汉917年建政节点；广州政治中心的延续不等同于南汉对岭南各地的控制始终一致。',
  },
  {
    personId: 'liu-chang', biography: '刘鋹承接刘晟后的南汉皇位，971年北宋军队攻取广州后出降，南汉中央政权终止。其个人结局、北宋接收与广州城市及南汉王陵遗产延续属于不同事实层次。',
    aliases: ['刘继兴', '南汉后主', '南汉末主'], offices: [{ title: '南汉末主', polityId: 'southern_han', placeId: 'guangzhou', validFrom: 958, validTo: 971, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['southern-han-ended-971'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '971年广州失守、刘鋹出降和岭南地方行政接收是连续但可分层的过程；末主结局不能代替城市遗产的消失。',
  },
  {
    personId: 'yelu-dashi', biography: '耶律大石在辽亡危机中自立为王并率契丹部众西行，1124年前后形成西辽政治集团，1132年称帝，1134年建都虎思斡耳朵（八剌沙衮）后进入稳定中心阶段。',
    aliases: ['西辽德宗'], offices: [{ title: '西辽皇帝与西行部众领袖', polityId: 'western_liao', placeId: 'balasagun', validFrom: 1124, validTo: 1143, datePrecision: 'range', sourceIds: ['china-chronology', 'liaoshi-vol30-yelu-dashi', 'iranica-qara-ketay'] }],
    keyEvents: ['western-liao-founded'], sourceIds: ['china-chronology', 'liaoshi-vol30-yelu-dashi', 'iranica-qara-ketay'], uncertaintyNote: '1124年前后是西辽西行建政约年；1132年称帝与1134年建都虎思斡耳朵（八剌沙衮）属于不同阶段，人物任职地点用八剌沙衮作后续政治中心参照，不能把辽旧疆域直接移植为西辽边界。',
  },
  {
    personId: 'kublai', biography: '忽必烈在蒙古汗权和东亚战争体系基础上建立元朝，1271年定国号为大元，随后继续完成对南宋的军事与行政整合。',
    aliases: ['元世祖'], offices: [{ title: '蒙古大汗与元初政治中心', polityId: 'yuan', placeId: 'shangdu', validFrom: 1260, validTo: 1266, datePrecision: 'range', sourceIds: ['yuan-nationalities-history', 'yuan-li-bingzhong'] }, { title: '元皇帝与大都营建时期君主', polityId: 'yuan', placeId: 'dadu', validFrom: 1267, validTo: 1294, datePrecision: 'range', sourceIds: ['yuan-nationalities-history', 'yuan-li-bingzhong', 'yuan-dadu-beijing-heritage'] }],
    keyEvents: ['yuan-founded', 'yuan-dadu-built', 'mongol-karakorum-fixed-center'], sourceIds: ['yuan-nationalities-history', 'yuan-li-bingzhong', 'yuan-dadu-beijing-heritage'], uncertaintyNote: '1260年汗位、1267年大都营建、1271年改国号和1279年南宋覆亡是连续但不同的节点；元朝国号不等于当年已经完成南方控制；忽必烈与哈拉和林的关联属于后续承接而非1235年现场参与。',
  },
  {
    personId: 'liu-bingzhong', biography: '刘秉忠在忽必烈政权中参与国号、都城和制度设计，元初国家建构与大都政治空间均与其活动相连。',
    aliases: ['子聪'], offices: [{ title: '元初政治家与制度设计者', polityId: 'yuan', placeId: 'shangdu', validFrom: 1260, validTo: 1266, datePrecision: 'range', sourceIds: ['yuan-li-bingzhong', 'yuan-nationalities-history'] }, { title: '大都营建与制度设计者', polityId: 'yuan', placeId: 'dadu', validFrom: 1267, validTo: 1274, datePrecision: 'range', sourceIds: ['yuan-li-bingzhong', 'yuan-nationalities-history', 'yuan-dadu-beijing-heritage'] }],
    keyEvents: ['yuan-founded', 'yuan-dadu-built'], sourceIds: ['yuan-li-bingzhong', 'yuan-nationalities-history', 'yuan-dadu-beijing-heritage'], uncertaintyNote: '刘秉忠参与元初制度建构和大都规划，但国号、都城与行政整合是集体政治过程，不能归结为个人单独决定。',
  },
  {
    personId: 'zhu-yuanzhang', biography: '朱元璋在元末群雄竞争中以应天为基地建立明朝，1368年称帝并北伐攻取大都，明初政权转换由此展开。',
    aliases: ['明太祖'], offices: [{ title: '明皇帝', polityId: 'ming', placeId: 'yingtian', validFrom: 1368, validTo: 1398, datePrecision: 'range', sourceIds: ['china-chronology'] }],
    keyEvents: ['ming-founded'], sourceIds: ['china-chronology'], uncertaintyNote: '应天称帝与攻取大都是1368年的不同阶段；明建立不代表当年已稳定控制元旧境全部地区。',
  },
  {
    personId: 'toghon-temur', biography: '妥懽帖睦尔即元顺帝，元末在大都维持元廷统治；1368年明军攻取大都后北走，元廷北迁与北元阶段相连。',
    aliases: ['元顺帝', '惠宗'], offices: [{ title: '元皇帝', polityId: 'yuan', placeId: 'dadu', validFrom: 1333, validTo: 1368, datePrecision: 'range', sourceIds: ['northern-yuan-early-ming', 'china-chronology'] }, { title: '北元汗廷前期君主', polityId: 'northern_yuan', placeId: 'beiyuan_core', validFrom: 1368, validTo: 1370, datePrecision: 'range', sourceIds: ['northern-yuan-early-ming', 'china-chronology'] }],
    keyEvents: ['northern-yuan-founded'], sourceIds: ['northern-yuan-early-ming', 'china-chronology'], uncertaintyNote: '1368年表示元廷失去大都并向北迁移的阶段转折，不是另立新朝的单日；北元称谓和政治中心存在分期差异。',
  },
  {
    personId: 'bayan', biography: '伯颜是元世祖时期的重要将领与宰相，负责推进元军南下和宋元政权转换，南宋覆亡属于其军政活动的关键背景。',
    aliases: ['丞相伯颜'], offices: [{ title: '元军统帅与中书右丞相', polityId: 'yuan', validFrom: 1274, validTo: 1295, datePrecision: 'range', sourceIds: ['yuan-nationalities-history', 'yuan-goryeo-records'] }],
    keyEvents: ['song-southward'], sourceIds: ['yuan-nationalities-history', 'yuan-goryeo-records'], uncertaintyNote: '伯颜参与的是1270年代后期元宋战争与行政接收，不把其军事活动简化为元朝1271年建国本身。',
  },
  {
    personId: 'han-kangzi', biography: '韩康子是晋国韩氏后期领袖。韩氏与赵、魏共同削弱晋国公室和智氏势力，前403年周王室册命三家是其政治谱系进入战国诸侯分期的制度节点。',
    aliases: ['韩虎'], offices: [{ title: '晋国韩氏领袖／韩国早期政治人物', polityId: 'han_warring', validFrom: -453, validTo: -403, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['partition-jin'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '韩康子活动跨越晋国卿族分权与周王室册命两个层次；前403年是制度确认节点，不等于韩康子个人在当日完成建国。',
  },
  {
    personId: 'zhao-xiangzi', biography: '赵襄子在晋国卿族竞争中领导赵氏，参与消灭智氏并扩大赵氏在晋北的政治与军事基础，三家分晋由此具备现实权力前提。',
    aliases: ['赵毋恤'], offices: [{ title: '晋国赵氏领袖／赵国先导', polityId: 'zhao_warring', validFrom: -453, validTo: -425, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['partition-jin'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '赵襄子主要对应晋国权力重组阶段；前403年周王室册命晚于其活动高峰，不能把正式册命与其个人生前称号混为一谈。',
  },
  {
    personId: 'wei-huanzi', biography: '魏桓子是晋国魏氏后期领袖，与韩、赵共同参与晋国权力重组。魏氏获得周王室承认后，魏国进入战国诸侯分期并继续发展。',
    aliases: ['魏驹'], offices: [{ title: '晋国魏氏领袖／魏国早期政治人物', polityId: 'wei_warring', validFrom: -424, validTo: -396, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['partition-jin'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '魏桓子与魏文侯之间存在继承和分期问题，传统纪年并非所有年份都能精确对应个人任期；本条只标记其在晋国解体与魏国形成链路中的位置。',
  },
  {
    personId: 'qi-we-wang', biography: '齐威王整顿齐国政治，重用能臣并加强军事组织，使齐在战国诸侯格局中成为东方强国。',
    aliases: ['田因齐'], offices: [{ title: '齐国诸侯', polityId: 'qi_warring', validFrom: -356, validTo: -320, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['qi-warring-founded-eighth-batch'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '齐威王生活年代晚于前403年战国分期入口；本条把他作为齐国后续强国化阶段的代表人物，不将其活动前推为齐国首次出现。',
  },
  {
    personId: 'chu-we-wang', biography: '楚威王统治时期楚国继续经营江汉、江淮和长江中下游网络，在战国大国竞争中保持南方强国地位。',
    aliases: ['熊商'], offices: [{ title: '楚国诸侯', polityId: 'chu_warring', validFrom: -339, validTo: -329, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['chu-warring-founded-eighth-batch'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '楚威王是楚国战国中期君主；前403年条目是战国分期入口，不应被理解为楚威王个人建国或楚国绝对起源。',
  },
  {
    personId: 'yan-zhaowang', biography: '燕昭王在燕国政治危机后重建君臣秩序，招纳乐毅等人才，推动燕国在北方诸侯竞争中恢复力量。',
    aliases: ['姬职'], offices: [{ title: '燕国诸侯', polityId: 'yan_warring', validFrom: -311, validTo: -279, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['yan-warring-founded-eighth-batch'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '燕昭王属于燕国后续复兴阶段；蓟和北方交通网络的早期形成与其统治不能压缩为同一建国年份。',
  },
  {
    personId: 'qin-xiaogong', biography: '秦孝公任用商鞅变法，推动秦国军功、户籍和财政制度重组，为秦国后来完成统一提供制度与资源基础。',
    aliases: ['嬴渠梁'], offices: [{ title: '秦国诸侯', polityId: 'qin_state', validFrom: -361, validTo: -338, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['qin-state-founded-eighth-batch'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '秦孝公改革属于秦国发展阶段，前770年是秦列为诸侯的传统导航约年；不能把变法、秦国建政与前221年帝国建立混为一事。',
  },
  {
    personId: 'asina-tumen', biography: '阿史那土门在柔然秩序中崛起，552年前后击败柔然并建立突厥汗国，开启突厥在欧亚草原的共同汗权阶段。',
    aliases: ['土门', '伊利可汗'], offices: [{ title: '突厥可汗', polityId: 'turkic', validFrom: 552, validTo: 553, datePrecision: 'approximate', sourceIds: ['turkic-history-db', 'china-chronology'] }],
    keyEvents: ['turkic-founded'], sourceIds: ['turkic-history-db', 'china-chronology'], uncertaintyNote: '突厥建国年代、土门与伊利可汗称号的译写及早期汗廷位置存在史料和译名差异；本条不把草原部众网络压缩成固定国界。',
  },
  {
    personId: 'gao-yun', biography: '高云在后燕末年被拥立于龙城，北燕由此从后燕政治危机中形成；409年后冯跋掌握政权，北燕分期不能只归于单一人物。',
    aliases: ['北燕惠懿帝'], offices: [{ title: '北燕君主', polityId: 'northern_yan', validFrom: 407, validTo: 409, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['northern-yan-founded'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '高云被拥立与冯跋掌权属于连续的政权转换阶段；本详情区分高云名义君位、冯跋实际权力与后续北燕统治。',
  },
  {
    personId: 'dorgon', biography: '多尔衮是清初摄政王与军事领袖，1644年主持入关及顺治朝早期政务，清廷政治中心遂由盛京转向北京。',
    aliases: ['睿亲王'], offices: [{ title: '清摄政王', polityId: 'qing', placeId: 'beijing', validFrom: 1644, validTo: 1650, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['qing-enters-pass'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '入关、进京、顺治亲政及各地战争整合并非同一时点；多尔衮的摄政权力与顺治帝的名义皇权需分层表达。',
  },
  {
    personId: 'mongke', biography: '蒙哥承接蒙古共同汗权，1251年即大汗并推动对宋、南亚和西亚方向的军事行动，是蒙古汗国与忽必烈元朝之间的关键承接人物。',
    aliases: ['蒙哥汗'], offices: [{ title: '蒙古大汗', polityId: 'mongol', validFrom: 1251, validTo: 1259, datePrecision: 'range', sourceIds: ['china-chronology', 'yuan-nationalities-history'] }],
    keyEvents: ['mongol-founded'], sourceIds: ['china-chronology', 'yuan-nationalities-history'], uncertaintyNote: '蒙哥生于1206年统一大会之后，故“蒙古汗国形成”仅作为其政治继承的前置历史阶段导航，不把蒙哥写成1206年建国事件参与者。',
  },
  {
    personId: 'geluofeng', biography: '阁罗凤继承皮罗阁经营的南诏，扩大洱海—滇西军政网络，并在唐天宝以后南诏与唐关系恶化及重组中成为核心君主。',
    aliases: ['南诏王'], offices: [{ title: '南诏王', polityId: 'nanzhao', validFrom: 748, validTo: 779, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['nanzhao-founded'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '阁罗凤即位晚于738年南诏形成节点；本条把南诏建立作为承接性历史阶段，不把其误写为南诏开国者或把唐南诏战争简化为个人关系。',
  },
  {
    personId: 'liu-min', biography: '刘旻初名刘崇，是后汉建立者刘知远的弟弟。后汉覆亡后，他据太原称帝建立北汉，河东成为北汉与后周竞争的核心区域。',
    aliases: ['刘崇', '北汉世祖'], offices: [{ title: '北汉皇帝', polityId: 'northern_han', placeId: 'taiyuan', validFrom: 951, validTo: 954, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['northern-han-founded'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '刘旻的早期姓名、后汉宗室身份和北汉建立可按不同阶段阅读；951年建政不等于北汉立即控制河东以外的全部区域，契丹援助也不能替代其自身政权建构。',
  },
  {
    personId: 'liu-jiyuan', biography: '刘继元是北汉末代君主，968年继位后继续以太原为政治中心。979年北宋攻取太原、刘继元出降，北汉中央政权终止；太原和河东地方秩序的后续接收另按过程展示。',
    aliases: ['北汉末帝'], offices: [{ title: '北汉皇帝', polityId: 'northern_han', placeId: 'taiyuan', validFrom: 968, validTo: 979, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['northern-han-ended-979'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '刘继元是北汉末代统治者；979年出降是中央政权终止节点，不等同于太原城市遗产消失或河东所有地方行政在同日完成转换。',
  },
  {
    personId: 'daemusin', biography: '大武神王是高句丽早期君主，承接朱蒙建立的王权并推动高句丽向鸭绿江、辽东方向扩展。',
    aliases: ['无恤王'], offices: [{ title: '高句丽国王', polityId: 'goguryeo', validFrom: 18, validTo: 44, datePrecision: 'range', sourceIds: ['china-chronology'] }],
    keyEvents: ['goguryeo-founded'], sourceIds: ['china-chronology'], uncertaintyNote: '高句丽建国节点早于大武神王即位，本详情把其作为早期王权承接与扩展阶段人物，不将其写成前37年开国者。',
  },
  {
    personId: 'namhae-chachaung', biography: '南解次次雄承接朴赫居世之后的新罗王统，早期统治围绕辰韩诸部关系、王权继承与对外防御展开。',
    aliases: ['南解王'], offices: [{ title: '新罗国王', polityId: 'silla', validFrom: -4, validTo: 24, datePrecision: 'range', sourceIds: ['silla-encykorea', 'silla-samguksagi-db'] }],
    keyEvents: ['silla-founded'], sourceIds: ['silla-encykorea', 'silla-samguksagi-db'], uncertaintyNote: '新罗前57年建国为传统纪年，南解次次雄属于其后王统承接阶段；早期王号、年代与国家化过程需与考古材料交叉理解。',
  },
  {
    personId: 'huhanye', biography: '呼韩邪单于在匈奴内部竞争中取得南匈奴一支的领导地位，并通过与汉朝建立和亲、朝贡与册立关系维持政治空间。',
    aliases: ['郅支单于之兄'], offices: [{ title: '匈奴单于', polityId: 'xiongnu', validFrom: -58, validTo: -31, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['xiongnu-founded'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '匈奴形成节点早于呼韩邪单于数百年；本详情表达其在分裂后阶段的政治继承与重组，不将其写成匈奴开国者或固定首都君主。',
  },
  {
    personId: 'namri-songtsen', biography: '朗日松赞是松赞干布之父，推动悉补野部在雅砻及高原东部扩张，为吐蕃进入帝国形成阶段积累政治与军事基础。',
    aliases: ['南日松赞'], offices: [{ title: '吐蕃赞普', polityId: 'tibetan_empire', validFrom: 600, validTo: 629, datePrecision: 'range', sourceIds: ['china-chronology'] }],
    keyEvents: ['tibetan-founded'], sourceIds: ['china-chronology'], uncertaintyNote: '吐蕃形成是多代王权整合过程；朗日松赞是前置积累阶段人物，不能把其活动单独等同于松赞干布时期的完整国家化。',
  },
  {
    personId: 'tuoba-si', biography: '拓跋嗣即北魏明元帝，继承拓跋珪建立的政权，在平城巩固北魏早期王权与北方军政秩序。',
    aliases: ['北魏明元帝'], offices: [{ title: '北魏皇帝', polityId: 'wei_northern', placeId: 'pingcheng', validFrom: 409, validTo: 423, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['northern-wei-founded'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '北魏建立节点为386年，拓跋嗣属于建政后的继承与巩固阶段；其在位期不能替代北魏早期形成过程。',
  },
  {
    personId: 'yuan-shanjian', biography: '元善见即东魏孝静帝，534年在邺即位，东魏由此形成；高欢及其集团掌握主要实际军政权力。',
    aliases: ['东魏孝静帝'], offices: [{ title: '东魏皇帝', polityId: 'wei_eastern', placeId: 'ye', validFrom: 534, validTo: 550, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['eastern-wei-founded', 'eastern-wei-ended-550'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '元善见连接534年东魏形成与550年禅代终止；东魏名义皇统与高欢、高澄家族的实际权力需要分层记录。',
  },
  {
    personId: 'liu-yilong', biography: '刘义隆即宋文帝，继承刘裕建立的刘宋，在元嘉时期整顿江南政权并参与南北军事与外交竞争。',
    aliases: ['宋文帝'], offices: [{ title: '刘宋皇帝', polityId: 'song_southern', placeId: 'jiankang', validFrom: 424, validTo: 453, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['liu-song-founded'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '刘宋建立节点为420年，刘义隆属于其后继承与治理阶段；元嘉北伐和南北对峙不能回填为建国当年的事实。',
  },
  {
    personId: 'chen-xu', biography: '陈顼即陈宣帝，是南陈后期君主，承接陈霸先建立的建康政权并在南北对峙中维持江南政治秩序。',
    aliases: ['陈宣帝'], offices: [{ title: '南陈皇帝', polityId: 'chen_southern', placeId: 'jiankang', validFrom: 569, validTo: 582, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['southern-chen-founded'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '南陈建立节点为557年，陈顼属于后续继承与整合阶段；其统治不应被写成陈霸先建国事件的直接替代。',
  },
  {
    personId: 'yuri-goguryeo', biography: '琉璃明王承接朱蒙建立的高句丽王权，并迁都国内城，国内城与初期王权整合成为高句丽早期国家化的重要阶段。',
    aliases: ['朱留王', '高句丽琉璃王'], offices: [{ title: '高句丽国王', polityId: 'goguryeo', validFrom: -19, validTo: 18, datePrecision: 'range', sourceIds: ['china-chronology'] }],
    keyEvents: ['goguryeo-founded'], sourceIds: ['china-chronology'], uncertaintyNote: '高句丽建国传统节点为前37年，琉璃明王属于朱蒙之后的继承与迁都阶段；早期年代与城址对应需结合文献和考古材料阅读。',
  },
  {
    personId: 'gwanggaeto', biography: '广开土王是高句丽国内城阶段的重要君主，推动东北亚方向的政治与军事扩展，属于427年迁都平壤前的王权承接阶段。',
    aliases: ['好太王', '安王'], offices: [{ title: '高句丽国王', polityId: 'goguryeo', placeId: 'guonei', validFrom: 391, validTo: 413, datePrecision: 'range', sourceIds: ['china-chronology', 'capital-history-reference'] }],
    keyEvents: ['goguryeo-moves-pyongyang'], sourceIds: ['china-chronology', 'capital-history-reference'], uncertaintyNote: '广开土王于427年迁都之前去世，本详情将其作为迁都前国内城阶段人物与城市视角关联，不写成427年迁都现场参与者。',
  },
  {
    personId: 'jangsu-goguryeo', biography: '长寿王承接高句丽王权，427年将政治中心迁至平壤，开启高句丽后期都城与国家空间的新阶段。',
    aliases: ['高琏'], offices: [{ title: '高句丽国王', polityId: 'goguryeo', placeId: 'pyongyang', validFrom: 413, validTo: 491, datePrecision: 'range', sourceIds: ['china-chronology', 'capital-history-reference'] }],
    keyEvents: ['goguryeo-moves-pyongyang'], sourceIds: ['china-chronology', 'capital-history-reference'], uncertaintyNote: '427年作为迁都平壤的编年节点；平壤古城边界、城市营建过程和后期疆域不能由迁都年份直接推定。',
  },
  {
    personId: 'naemul-isageum', biography: '内物王是新罗早期王权整合的重要君主，三国时期新罗在其统治阶段面对高句丽影响、倭寇压力与王统延续问题。',
    aliases: ['奈勿尼师今', '奈勿王'], offices: [{ title: '新罗国王', polityId: 'silla', validFrom: 356, validTo: 402, datePrecision: 'range', sourceIds: ['silla-encykorea', 'silla-samguksagi-db', 'silla-periodization'] }],
    keyEvents: ['silla-founded'], sourceIds: ['silla-encykorea', 'silla-samguksagi-db', 'silla-periodization'], uncertaintyNote: '新罗前57年为传统建国纪年，内物王属于数百年后的王权整合阶段；王统年代与早期国家化过程需区分传统编年与考古证据。',
  },
  {
    personId: 'seondeok-silla', biography: '善德女王是新罗中期君主，处于百济、高句丽压力和新罗—唐外交关系逐步加强的阶段。',
    aliases: ['新罗善德女王'], offices: [{ title: '新罗女王', polityId: 'silla', placeId: 'jincheng_silla', validFrom: 632, validTo: 647, datePrecision: 'range', sourceIds: ['silla-encykorea', 'silla-kim-chunchu-official'] }],
    keyEvents: [], sourceIds: ['silla-encykorea', 'silla-kim-chunchu-official'], uncertaintyNote: '善德女王于648年联盟形成前去世；其人物详情通过王权与外交网络阅读，不将其写成648年出使现场人物。',
  },
  {
    personId: 'jindeok-silla', biography: '真德女王承接善德女王后的新罗王位，延续对唐外交并为金春秋继位前的政治承接提供背景。',
    aliases: ['新罗真德女王'], offices: [{ title: '新罗女王', polityId: 'silla', placeId: 'jincheng_silla', validFrom: 647, validTo: 654, datePrecision: 'range', sourceIds: ['silla-encykorea', 'silla-kim-chunchu-official'] }],
    keyEvents: ['silla-tang-alliance-648'], sourceIds: ['silla-encykorea', 'silla-kim-chunchu-official'], uncertaintyNote: '真德女王与648年外交合作处于同一政治承接阶段；事件参与者只登记金春秋，不把所有王权背景人物写成出使者。',
  },
  {
    personId: 'kim-chunchu', biography: '金春秋出使唐并推动新罗—唐军事合作，后即位为武烈王，连接外交、王位承接和三国统一战争。',
    aliases: ['新罗武烈王', '太宗武烈王'], offices: [{ title: '新罗外交使者与王族', polityId: 'silla', placeId: 'jincheng_silla', validFrom: 642, validTo: 654, datePrecision: 'range', sourceIds: ['silla-kim-chunchu-official'] }, { title: '新罗国王', polityId: 'silla', placeId: 'jincheng_silla', validFrom: 654, validTo: 661, datePrecision: 'range', sourceIds: ['silla-unification-wars-official'] }],
    keyEvents: ['silla-tang-alliance-648', 'silla-tang-baekje-660'], sourceIds: ['silla-kim-chunchu-official', 'silla-unification-wars-official'], uncertaintyNote: '648年外交合作与660年百济灭亡是不同节点；金春秋的王权、外交和军事决策角色分别展示。',
  },
  {
    personId: 'kim-yushin', biography: '金庾信是新罗统一战争时期的核心将领，与金春秋家族和新罗王权形成政治、军事合作网络。',
    aliases: ['金庾信将军'], offices: [{ title: '新罗将领', polityId: 'silla', placeId: 'jincheng_silla', validFrom: 642, validTo: 673, datePrecision: 'range', sourceIds: ['silla-kim-chunchu-official', 'silla-unification-wars-official'] }],
    keyEvents: ['silla-tang-baekje-660', 'silla-tang-goguryeo-668', 'silla-tang-war-670-676'], sourceIds: ['silla-kim-chunchu-official', 'silla-unification-wars-official'], uncertaintyNote: '金庾信的具体战役指挥、政治合作和家族关系需按事件分别核验，不将其概括为唯一“统一者”。',
  },
  {
    personId: 'munmu-silla', biography: '文武王承接武烈王，在百济、高句丽灭亡后处理新罗与唐的战争，统一新罗阶段由此展开。',
    aliases: ['新罗文武王'], offices: [{ title: '新罗国王', polityId: 'silla', placeId: 'jincheng_silla', validFrom: 661, validTo: 681, datePrecision: 'range', sourceIds: ['silla-unification-wars-official', 'silla-encykorea'] }],
    keyEvents: ['silla-tang-goguryeo-668', 'silla-tang-war-670-676'], sourceIds: ['silla-unification-wars-official', 'silla-encykorea'], uncertaintyNote: '668年高句丽灭亡与670—676年对唐战争必须分层；统一新罗不是668年单日完成的国家形态。',
  },
  {
    personId: 'sinmun-silla', biography: '神文王在统一新罗早期整顿中央和地方秩序，承接文武王后的国家制度建设。',
    aliases: ['新罗神文王'], offices: [{ title: '新罗国王', polityId: 'silla', placeId: 'jincheng_silla', validFrom: 681, validTo: 692, datePrecision: 'range', sourceIds: ['silla-encykorea', 'silla-periodization'] }],
    keyEvents: [], sourceIds: ['silla-encykorea', 'silla-periodization'], uncertaintyNote: '神文王属于对唐战争结束后的制度整合阶段，不作为670—676年战场参与者直接列入事件。',
  },
  {
    personId: 'gyeongsun-silla', biography: '敬顺王是新罗末代君主，935年向高丽归降，新罗王统结束而庆州王京转入高丽承接阶段。',
    aliases: ['新罗敬顺王'], offices: [{ title: '新罗末代国王', polityId: 'silla', placeId: 'jincheng_silla', validFrom: 927, validTo: 935, datePrecision: 'range', sourceIds: ['silla-encykorea', 'silla-samguksagi-db'] }],
    keyEvents: ['silla-ended-935'], sourceIds: ['silla-encykorea', 'silla-samguksagi-db'], uncertaintyNote: '935年是政权归降节点，不是庆州城市历史和新罗文化遗产的终止。',
  },
  {
    personId: 'istemi', biography: '室点密在突厥早期汗权形成后经营西部部众，参与突厥向中亚扩展并与萨珊、拜占庭等势力建立外交和军事联系。',
    aliases: ['瑟帝米'], offices: [{ title: '突厥西部统治者', polityId: 'turkic', validFrom: 552, validTo: 576, datePrecision: 'range', sourceIds: ['turkic-history-db', 'turkic-orkhon-collection'] }],
    keyEvents: ['turkic-founded'], sourceIds: ['turkic-history-db', 'turkic-orkhon-collection'], uncertaintyNote: '突厥汗国建立节点为552年，室点密是其后西部扩张与分工阶段人物；称号译写、年代和其与土门的具体亲属关系存在史料差异。',
  },
  {
    personId: 'tridu-songtsen', biography: '赤松德赞是吐蕃中期赞普，强化王权并推动佛教制度化，使吐蕃帝国在松赞干布时代形成的基础上进入成熟阶段。',
    aliases: ['乞黎苏笼猎赞'], offices: [{ title: '吐蕃赞普', polityId: 'tibetan_empire', validFrom: 755, validTo: 797, datePrecision: 'range', sourceIds: ['china-chronology'] }],
    keyEvents: ['tibetan-founded'], sourceIds: ['china-chronology'], uncertaintyNote: '吐蕃形成是多代王权整合过程，赤松德赞属于后续成熟阶段；本详情不把其活动前推为618年前后的建政节点。',
  },
  {
    personId: 'langdarma', biography: '朗达玛是吐蕃末期赞普，活动连接842年前后的王权危机与帝国解体阶段；其个人统治、宫廷冲突和后续地方化过程需要分开阅读。',
    aliases: ['达磨赞普'], offices: [{ title: '吐蕃赞普', polityId: 'tibetan_empire', placeId: 'luosie', validFrom: 838, validTo: 842, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['tibetan-ended-842'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '842年采用吐蕃解体阶段约年；朗达玛是末期王权节点，不将帝国解体归因于单一人物，也不把逻些城市历史视为同时终止。',
  },
  {
    personId: 'feng-hong', biography: '冯弘承接冯跋后的北燕王位，在辽西维持燕室统治，并在北魏压力下迁徙与寻求外援，最终见证北燕政权终结。',
    aliases: ['北燕昭成帝'], offices: [{ title: '北燕皇帝', polityId: 'northern_yan', validFrom: 430, validTo: 436, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['northern-yan-founded'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '北燕形成节点为407年，冯弘属于其后期统治者；北燕建立、冯氏继承和436年灭亡应按连续但不同阶段叙述。',
  },
  {
    personId: 'murong-chao', biography: '慕容超是南燕末代君主，统治中心在广固，410年刘裕北伐攻灭南燕，南燕由此结束。',
    aliases: ['南燕末主'], offices: [{ title: '南燕皇帝', polityId: 'southern_yan', placeId: 'guanggu', validFrom: 405, validTo: 410, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['southern-yan-founded', 'southern-yan-ended-410'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '南燕形成节点为398年，慕容超属于末期防御阶段；410年广固失守是政权终止节点，其统治不能替代慕容德建政，也不代表南燕全期控制范围。',
  },
  {
    personId: 'yelu-yilie', biography: '耶律夷列承接耶律大石建立的西辽，在八剌沙衮及七河流域维持契丹政权的继承秩序与行政运作；其属于后续继承阶段，不是1124年西行建政现场人物。',
    aliases: ['西辽仁宗'], offices: [{ title: '西辽皇帝', polityId: 'western_liao', placeId: 'balasagun', validFrom: 1150, validTo: 1163, datePrecision: 'range', sourceIds: ['china-chronology', 'liaoshi-vol30-yelu-dashi', 'iranica-qara-ketay'] }],
    keyEvents: ['western-liao-founded'], sourceIds: ['china-chronology', 'liaoshi-vol30-yelu-dashi', 'iranica-qara-ketay'], uncertaintyNote: '西辽形成节点为1124年前后，1134年八剌沙衮稳定政治中心和耶律夷列的继承阶段分开记录；中亚政权的迁徙性与多族群治理不能简化为单一王朝疆域。',
  },
  {
    personId: 'kuchlug', biography: '屈出律是西辽末期掌权者，活动连接乃蛮部众进入七河流域、西辽末期政治与1218年前后蒙古征服；其末期统治不能代表耶律大石时期的完整西辽制度。',
    aliases: ['屈出律汗'], offices: [{ title: '西辽末期统治者', polityId: 'western_liao', placeId: 'balasagun', validFrom: 1211, validTo: 1218, datePrecision: 'range', sourceIds: ['china-chronology', 'iranica-qara-ketay'] }],
    keyEvents: ['western-liao-ended-1218'], sourceIds: ['china-chronology', 'iranica-qara-ketay'], uncertaintyNote: '屈出律属于西辽末期权力承接阶段；1218年政权覆亡、蒙古军事推进和地方政治变化不是同一层面的单一事件。',
  },
  {
    personId: 'liu-muzi', biography: '刘穆之是刘裕北伐、平定内乱和建宋前夕的重要谋臣与行政组织者，承担军政协调和后勤制度建设。',
    aliases: ['刘道和'], offices: [{ title: '东晋中书监与军政谋臣', polityId: 'jin_eastern', validFrom: 400, validTo: 417, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }, { title: '刘宋建政前的军政谋臣', polityId: 'song_southern', validFrom: 416, validTo: 417, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['liu-song-founded'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '刘宋正式建立于420年，刘穆之卒于417年，故本条表达建宋前的军政准备与权力网络，不把他写成420年受禅现场人物。',
  },
  {
    personId: 'zhang-gui', biography: '张轨是西晋凉州刺史，在中央秩序衰落时维持河西军政与交通，张氏地方政权由此获得连续的政治基础。',
    aliases: ['前凉武公'], offices: [{ title: '西晋凉州刺史', polityId: 'former_liang', placeId: 'guzang', validFrom: 301, validTo: 314, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['former-liang-founded'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '张轨以晋臣名义经营凉州，前凉形成是地方军政延续与后续独立化过程，不能简单等同于一次正式受禅建国。',
  },
  {
    personId: 'zhang-shi', biography: '张寔承继张轨的凉州军政资源，在河西延续张氏统治并加强姑臧等地的行政与军事组织。',
    aliases: ['前凉昭公'], offices: [{ title: '前凉继承者与凉州刺史', polityId: 'former_liang', placeId: 'guzang', validFrom: 314, validTo: 320, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['former-liang-founded'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '张寔属于张轨之后的延续阶段；本详情不把其写成314年张氏政权最初形成的唯一创建者。',
  },
  {
    personId: 'qifu-gangui', biography: '乞伏乾归是西秦后续阶段的核心君主，经历称王、降附后秦与复立等过程，体现陇右政权的阶段性和迁徙性。',
    aliases: ['西秦武元王'], offices: [{ title: '西秦君主', polityId: 'western_qin', validFrom: 388, validTo: 400, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }, { title: '西秦复立后的君主', polityId: 'western_qin', validFrom: 409, validTo: 412, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['western-qin-founded'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '西秦形成节点为385年，乞伏乾归主要对应其后的继承、降附与复立阶段，不能把所有阶段压缩为连续稳定的早期建政。',
  },
  {
    personId: 'wang-sengbian', biography: '王僧辩是梁末江南军政重建的重要将领，与陈霸先共同平定侯景之乱，后因陈梁政权安排发生政治冲突。',
    aliases: ['王僧辨'], offices: [{ title: '南梁军政将领', polityId: 'liang_southern', placeId: 'jiankang', validFrom: 552, validTo: 555, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['southern-chen-founded'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '王僧辩参与的是南陈建立前的江南重建和梁陈权力转换，不是557年陈霸先受禅时的南陈君主。',
  },
  {
    personId: 'li-gang', biography: '李纲在靖康之变前后参与宋廷危局处置并主张整军御敌，连接北宋覆亡前后的中枢决策与南宋重建。',
    aliases: ['李伯纪'], offices: [{ title: '北宋尚书右丞与抗金主张者', polityId: 'song_northern', validFrom: 1126, validTo: 1127, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['song-southward'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '李纲与南渡事件的关系主要在靖康危局和宋廷军政决策阶段，不将其写成主持全部南迁路线的单一人物。',
  },
  {
    personId: 'zong-ze', biography: '宗泽在汴梁失守后留守开封、组织防务并主张迎回二帝，活动连接北宋覆亡与南宋初年军事重建。',
    aliases: ['宗汝霖'], offices: [{ title: '东京留守', polityId: 'song_northern', placeId: 'kaifeng', validFrom: 1127, validTo: 1128, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }, { title: '南宋初年军政将领', polityId: 'song_south', validFrom: 1127, validTo: 1128, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['song-southward'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '宗泽主要对应汴梁失守后的留守和北方防务阶段；南宋南渡的朝廷迁驻与其军政活动不能混为同一行动。',
  },
  {
    personId: 'zhang-jun', biography: '张浚是南宋初年重要军政官员，参与朝廷重建、抗金部署和将帅协调，体现南渡后中央与战区的互动。',
    aliases: ['张德远'], offices: [{ title: '南宋宰执与军事统筹者', polityId: 'song_south', validFrom: 1127, validTo: 1135, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['song-southward'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '张浚主要属于南宋初年南渡后的军政重建阶段，不能把其后续抗金部署倒推为1127年南迁现场决策。',
  },
  {
    personId: 'gao-hongtu', biography: '高弘图是弘光政权时期的内阁大臣，参与南京朝廷政务，代表南明多中心体系中的一个阶段性政治角色。',
    aliases: ['高文斗'], offices: [{ title: '弘光朝内阁大学士', polityId: 'ming_southern', placeId: 'yingtian', validFrom: 1644, validTo: 1645, datePrecision: 'range', sourceIds: ['china-chronology'] }],
    keyEvents: ['southern-ming-founded'], sourceIds: ['china-chronology'], uncertaintyNote: '高弘图只对应弘光阶段，南明是多个政权和政治中心的后世总称，不能由其任职推导南明全期制度。',
  },
  {
    personId: 'zhang-mao', biography: '张茂承接张氏在河西的军政基础，在前凉形成后的延续阶段维持凉州秩序与张氏政权。',
    aliases: ['前凉成王'], offices: [{ title: '凉州刺史与前凉继承者', polityId: 'former_liang', placeId: 'guzang', validFrom: 320, validTo: 324, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['former-liang-founded'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '张茂属于张轨、张寔之后的前凉延续阶段；前凉形成是地方军政逐步独立化过程，不把其写成314年最初建政者。',
  },
  {
    personId: 'qifu-chipan', biography: '乞伏炽磐在乞伏乾归之后统治西秦，完成复立后的政权整合并维持陇右、河湟地区的政治网络。',
    aliases: ['西秦文昭王'], offices: [{ title: '西秦君主', polityId: 'western_qin', validFrom: 412, validTo: 428, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['western-qin-founded'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '西秦形成节点为385年，乞伏炽磐属于乞伏乾归之后的复立与整合阶段，不能替代乞伏国仁的早期建政位置。',
  },
  {
    personId: 'feng-sufo', biography: '冯素弗是北燕建立初期的关键军政人物，与兄冯跋共同维持辽西政权的军事与行政运作。',
    aliases: ['北燕重臣'], offices: [{ title: '北燕军政大臣', polityId: 'northern_yan', placeId: 'longcheng', validFrom: 409, validTo: 415, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['northern-yan-founded'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '冯素弗主要对应冯跋掌权后的北燕早期治理阶段；北燕407年高云被拥立与409年冯氏掌权需分期表达。',
  },
  {
    personId: 'hou-andu', biography: '侯安都是梁陈之际的重要将领，参与陈霸先集团的军事行动，并在南陈建立初期承担江南军政任务。',
    aliases: ['侯安都侯'], offices: [{ title: '南陈将领', polityId: 'chen_southern', placeId: 'jiankang', validFrom: 552, validTo: 563, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['southern-chen-founded'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '侯安都参与的是梁陈转换及南陈早期军政阶段，不把将领活动等同于557年陈霸先受禅的单一建国仪式。',
  },
  {
    personId: 'chen-qian', biography: '陈蒨承接陈霸先建立的南陈，在即位后整顿江南政权并处理南北对峙，代表南陈早期继承阶段。',
    aliases: ['陈文帝'], offices: [{ title: '南陈皇帝', polityId: 'chen_southern', placeId: 'jiankang', validFrom: 559, validTo: 566, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['southern-chen-founded'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '陈蒨属于557年建陈后的继承阶段；本详情不把其即位前的宗室与军政活动前推为南陈建立者。',
  },
  {
    personId: 'yimouxun', biography: '异牟寻承接阁罗凤之后的南诏政权，通过与唐重新建立册封与外交关系，调整洱海及滇西的政治秩序。',
    aliases: ['南诏孝惠王'], offices: [{ title: '南诏王', polityId: 'nanzhao', placeId: 'tahe-city', validFrom: 779, validTo: 808, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology', 'nanzhao-lineage-chronology'] }],
    keyEvents: ['nanzhao-founded'], sourceIds: ['zizhi-tongjian', 'china-chronology', 'nanzhao-lineage-chronology'], uncertaintyNote: '后出综合年表提供约754年的出生说法，但项目不将其写入确定生年；展示时应与779—808年在位区间分层，南诏形成节点为738年。',
  },
  {
    personId: 'quanfengyou', biography: '劝丰祐延续异牟寻之后的南诏王权，在唐末前维持洱海区域的地方政权与对外关系。',
    aliases: ['南诏王'], offices: [{ title: '南诏王', polityId: 'nanzhao', placeId: 'tahe-city', validFrom: 824, validTo: 859, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['nanzhao-founded'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '劝丰祐属于南诏中后期继承阶段；其统治只能作为南诏长期政权的后续节点，不能倒推为738年建政参与者。',
  },
  {
    personId: 'shun-huazhen', biography: '舜化贞是南诏末代君主，897—902年在位。902年前后郑买嗣夺取蒙氏王室政权，南诏中央政权终止；其死亡原因在后出材料中有异说。',
    aliases: ['舜化真', '南诏孝哀帝'], offices: [{ title: '南诏末代君主', polityId: 'nanzhao', placeId: 'yangjumei', validFrom: 897, validTo: 902, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['nanzhao-ended-902'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '舜化贞与902年南诏终局相连，但“卒于自然原因”与“为郑买嗣所杀”的记载不能在当前数据层面强行合并；人物详情只确认其处于末代政权终止节点。',
  },
  {
    personId: 'zheng-maisi', biography: '郑买嗣是南诏晚期清平官，902年前后利用蒙氏王室危机夺取政权并建立大长和，羊苴咩城继续作为洱海政治中心。',
    aliases: ['郑昶', '大长和建立者'], offices: [{ title: '南诏晚期清平官', polityId: 'nanzhao', placeId: 'yangjumei', validFrom: 897, validTo: 902, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['nanzhao-ended-902'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '郑买嗣在902年政权转换中是夺权方和承接方人物；本条不把其902年后的大长和统治整体回填为南诏人物经历。',
  },
  {
    personId: 'octavian', biography: '屋大维在罗马共和国晚期内战中胜出，前27年由元老院授予奥古斯都称号，成为元首制形成阶段的核心人物。',
    aliases: ['奥古斯都'], offices: [{ title: '罗马政治主导者', validFrom: -31, validTo: 14, datePrecision: 'range', sourceIds: ['augustus-metmuseum'] }],
    keyEvents: ['augustus-principate'], sourceIds: ['augustus-metmuseum'], uncertaintyNote: '前27年是称号与政治形式转折的标志节点；元首制的形成是长期过程，不把该年写成共和制度瞬时消失或疆域突然改变。',
  },
  {
    personId: 'mark-antony', biography: '马克·安东尼是罗马共和国晚期的将领与政治家，曾与屋大维共同处于内战后的权力重组网络，后转为竞争关系。',
    aliases: ['Marcus Antonius', '安东尼'], offices: [{ title: '罗马将领与政治家', validFrom: -44, validTo: -30, datePrecision: 'range', sourceIds: ['augustus-metmuseum'] }],
    keyEvents: ['augustus-principate'], sourceIds: ['augustus-metmuseum'], uncertaintyNote: '本详情只用于解释前27年制度转折的前置权力竞争，不把安东尼写成前27年称号授予现场人物。',
  },
  {
    personId: 'constantine-xi', biography: '君士坦丁十一世是拜占庭末代皇帝，在1453年奥斯曼围攻中守卫君士坦丁堡，最终与城市一同进入帝国终结的历史阶段。',
    aliases: ['君士坦丁十一世·巴列奥略'], offices: [{ title: '拜占庭皇帝', validFrom: 1449, validTo: 1453, datePrecision: 'range', sourceIds: ['constantinople-metmuseum'] }],
    keyEvents: ['constantinople-1453'], sourceIds: ['constantinople-metmuseum'], uncertaintyNote: '其“末代皇帝”身份只对应君士坦丁堡的拜占庭统治终结，不等同于所有拜占庭传统、东正教网络或希腊文化在1453年消失。',
  },
  {
    personId: 'mehmed-ii', biography: '穆罕默德二世率奥斯曼军队攻占君士坦丁堡，使城市控制权从拜占庭转入奥斯曼阶段。',
    aliases: ['征服者穆罕默德'], offices: [{ title: '奥斯曼苏丹', validFrom: 1451, validTo: 1481, datePrecision: 'range', sourceIds: ['constantinople-metmuseum'] }],
    keyEvents: ['constantinople-1453'], sourceIds: ['constantinople-metmuseum'], uncertaintyNote: '本详情只表达1453年城市攻陷与统治转折，不把攻城结果外推为奥斯曼在同年完成全部相关地区的征服。',
  },
  {
    personId: 'christopher-columbus', biography: '哥伦布率领西班牙资助的航队跨越大西洋，于1492年抵达加勒比并与泰诺社会接触，开启持续的殖民与跨大西洋交换阶段。',
    aliases: ['哥伦布'], offices: [{ title: '远洋航行组织者', validFrom: 1492, validTo: 1493, datePrecision: 'range', sourceIds: ['columbus-library-congress'] }],
    keyEvents: ['columbus-caribbean'], sourceIds: ['columbus-library-congress'], uncertaintyNote: '“抵达”不等于发现无人之地；加勒比已有泰诺等原住民社会，瓜纳哈尼的现代岛屿对应也不在本详情中强行确定。',
  },
  {
    personId: 'guacanagari', biography: '瓜卡纳加里克斯是伊斯帕尼奥拉岛泰诺政治领袖，在哥伦布抵达后的接触阶段出现于欧洲航海记录，代表原住民社会的地方政治主体。',
    aliases: ['Guacanagaríx', '瓜卡纳加里'], offices: [{ title: '泰诺地方政治领袖', datePrecision: 'unknown', sourceIds: ['columbus-library-congress'] }],
    keyEvents: ['columbus-caribbean'], sourceIds: ['columbus-library-congress'], uncertaintyNote: '该人物与哥伦布的接触属于1492年首次抵达后的后续阶段，不能把伊斯帕尼奥拉岛的接触地点冒充瓜纳哈尼的确切登陆点，也不能代表全部泰诺社会。',
  },
  {
    personId: 'oxenstierna', biography: '奥克森谢纳代表瑞典参与威斯特伐利亚和约谈判，体现多国、多文本和平协商中的一方外交角色。',
    aliases: ['Johan Oxenstierna'], offices: [{ title: '瑞典谈判代表', datePrecision: 'range', sourceIds: ['westphalia-osnabruck', 'westphalia-lwl'] }],
    keyEvents: ['peace-westphalia'], sourceIds: ['westphalia-osnabruck', 'westphalia-lwl'], uncertaintyNote: '其角色是瑞典代表之一，不把其写成全部战争缔约方或唯一和平缔造者。',
  },
  {
    personId: 'trauttmansdorff', biography: '特劳特曼斯多夫代表哈布斯堡方面参与威斯特伐利亚和约谈判，处理帝国战争、多方利益和宗教政治安排。',
    aliases: ['Maximilian von Trauttmansdorff'], offices: [{ title: '哈布斯堡谈判代表', datePrecision: 'range', sourceIds: ['westphalia-osnabruck', 'westphalia-lwl'] }],
    keyEvents: ['peace-westphalia'], sourceIds: ['westphalia-osnabruck', 'westphalia-lwl'], uncertaintyNote: '条约是多方、多文本协商结果；本详情不将哈布斯堡代表的角色扩展为全部签署方的立场。',
  },
  {
    personId: 'chigi', biography: '基吉作为教廷使节参与威斯特伐利亚和平谈判，体现教廷调停与欧洲宗教政治在条约过程中的角色。',
    aliases: ['Fabio Chigi'], offices: [{ title: '教廷调停代表', datePrecision: 'range', sourceIds: ['westphalia-osnabruck', 'westphalia-lwl'] }],
    keyEvents: ['peace-westphalia'], sourceIds: ['westphalia-osnabruck', 'westphalia-lwl'], uncertaintyNote: '教廷代表参与谈判不等于所有缔约文本都由其签署；其角色与各国正式签约代表分开记录。',
  },
  {
    personId: 'franklin-roosevelt', biography: '罗斯福在二战时期推动战后国际合作框架，并在联合国宪章签署前去世，因此属于倡议与政治命名阶段的人物。',
    aliases: ['罗斯福'], offices: [{ title: '美国总统与国际组织倡议者', validFrom: 1933, validTo: 1945, datePrecision: 'range', sourceIds: ['un-history-official'] }],
    keyEvents: ['un-founded'], sourceIds: ['un-history-official'], uncertaintyNote: '罗斯福不是1945年旧金山宪章签署现场人物；本条明确区分倡议阶段与签署、生效阶段。',
  },
  {
    personId: 'harry-truman', biography: '杜鲁门承接美国政府在战后国际组织建设中的政治责任，并在旧金山会议结束阶段代表美国发表讲话。',
    aliases: ['杜鲁门'], offices: [{ title: '美国总统', validFrom: 1945, validTo: 1953, datePrecision: 'range', sourceIds: ['un-charter-treaty', 'un-history-official'] }],
    keyEvents: ['un-founded'], sourceIds: ['un-charter-treaty', 'un-history-official'], uncertaintyNote: '联合国成立是多国共同缔结与批准的结果；杜鲁门的美国总统身份不能代表全部创始成员。',
  },
  {
    personId: 'edward-stettinius', biography: '斯退丁纽斯主持美国方面的旧金山会议组织工作，是联合国宪章形成、谈判与签署阶段的关键代表。',
    aliases: ['Edward Stettinius Jr.'], offices: [{ title: '美国国务卿与旧金山会议主席', validFrom: 1944, validTo: 1945, datePrecision: 'range', sourceIds: ['un-charter-treaty', 'un-history-official'] }],
    keyEvents: ['un-founded'], sourceIds: ['un-charter-treaty', 'un-history-official'], uncertaintyNote: '其角色是美国代表与会议组织者，不等于个人代表所有国家的批准行为；签署与10月24日生效仍是不同节点。',
  },
  {
    personId: 'wang-yanzheng', biography: '王延政是闽末代君主。闽末继承冲突和南唐军事介入后，福州在945年前后失守，王延政降服，闽政权终止。',
    aliases: ['闽末代君主', '大殷末主'], offices: [{ title: '闽王／大殷末主', polityId: 'min', placeId: 'fuzhou', validFrom: 943, validTo: 945, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['min-ended-945'], sourceIds: ['zizhi-tongjian', 'china-chronology', 'song-history-nantang'], uncertaintyNote: '王延政在位与福州失守采用945年前后的阶段表达；南唐攻闽、王延政降服及福建各地后续接收不是同一日期完成。',
  },
  {
    personId: 'wang-yenxi', biography: '王延羲是王审知之后的闽王，闽末宫廷继承与权力冲突的重要人物；其统治阶段为945年闽政权终止前的前置背景。',
    aliases: ['闽康宗'], offices: [{ title: '闽王', polityId: 'min', placeId: 'fuzhou', validFrom: 939, validTo: 944, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['min-ended-945'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '王延羲用于连接闽末继承危机与终局，不将其个人统治等同于945年终止事件的直接发动者。',
  },
];

const detailById = new Map(personDetails.map((detail) => [detail.personId, detail]));

export function getPersonDetail(personId: string): PersonDetail | undefined {
  return detailById.get(personId);
}
