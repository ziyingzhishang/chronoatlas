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
    personId: 'wang-mang', biography: '王莽以外戚与辅政身份进入权力核心，代汉建立新朝，长安继续作为政治中心。',
    aliases: [], offices: [{ title: '新朝皇帝', polityId: 'xin', placeId: 'changan', validFrom: 9, validTo: 23, datePrecision: 'range', sourceIds }],
    keyEvents: ['changan-xin-founded'], sourceIds,
    uncertaintyNote: '王莽改制的制度评价与成败原因存在不同解释，页面只呈现可追溯的编年节点。',
  },
  {
    personId: 'liu-xiu', biography: '刘秀在新末动荡中起兵，重建汉室并成为东汉开国君主；其早期政治活动与长安权力更替相连。',
    aliases: ['汉光武帝'], offices: [{ title: '更始政权将领／东汉皇帝', polityId: 'han_eastern', validFrom: 25, validTo: 57, datePrecision: 'range', sourceIds }],
    keyEvents: ['changan-gengshi'], sourceIds,
    uncertaintyNote: '更始、刘秀与长安之间的控制转换按阶段记录，不由单个事件点推导连续疆域。',
  },
  {
    personId: 'liu-yao', biography: '刘曜是十六国时期前赵的重要君主，前赵经营关中时，长安成为北方政治竞争的关键节点。',
    aliases: [], offices: [{ title: '前赵皇帝', polityId: 'former_zhao', placeId: 'changan', validFrom: 318, validTo: 329, datePrecision: 'range', sourceIds }],
    keyEvents: ['changan-former-zhao'], sourceIds,
    uncertaintyNote: '十六国时期的政治中心和直接控制范围变化频繁，相关叙述保留阶段性而非连续边界判断。',
  },
  {
    personId: 'fu-jian', biography: '苻坚在前秦政治中整合关中并推动北方扩张，长安是其政权运作和军事动员的重要中心。',
    aliases: [], offices: [{ title: '前秦皇帝', polityId: 'former_qin', placeId: 'changan', validFrom: 357, validTo: 385, datePrecision: 'range', sourceIds }],
    keyEvents: ['changan-former-qin'], sourceIds,
    uncertaintyNote: '“统一北方”的概括与各地实际控制并不等价，详情保留前秦扩张叙事的范围限制。',
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
    keyEvents: ['daxing-built'], sourceIds,
    uncertaintyNote: '大兴城与汉长安城是相邻而有区别的城市空间，不能用现代西安边界替代历史城址。',
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
    aliases: [], offices: [{ title: '秦将', polityId: 'qin', datePrecision: 'unknown', sourceIds }],
    keyEvents: ['qin-unification'], sourceIds, uncertaintyNote: '生年未知；“秦将”是职能概括，不据此推导其具体驻地或与其他人物的关系。',
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
    aliases: [], offices: [{ title: '汉使者', polityId: 'han_western', datePrecision: 'unknown', sourceIds }],
    keyEvents: ['changan-han-capital'], sourceIds, uncertaintyNote: '生年未知；出使经历按传统编年叙述，不把交通路线等同于持续政治控制。',
  },
  {
    personId: 'liu-xuan', biography: '刘玄即更始帝，在新末动荡中建立更始政权，曾以长安为重要政治中心。',
    aliases: ['更始帝'], offices: [{ title: '更始皇帝', polityId: 'gengshi', placeId: 'changan', validFrom: 23, validTo: 25, datePrecision: 'range', sourceIds }],
    keyEvents: ['changan-gengshi'], sourceIds, uncertaintyNote: '生年未知；更始政权的名义统治与各地实际控制需分阶段理解。',
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
    personId: 'li-cunxu', biography: '李存勖建立后唐，五代时期长安的政治地位已不同于唐代帝国时期。',
    aliases: ['唐庄宗'], offices: [{ title: '后唐皇帝', polityId: 'tang_later', validFrom: 923, validTo: 926, datePrecision: 'range', sourceIds }],
    keyEvents: ['tang-changan-end', 'five-dynasties'], sourceIds, uncertaintyNote: '“唐庄宗”是后唐庙号称谓，与唐朝本身需区分；不据称谓虚构其与长安的直接任职关系。',
  },
  {
    personId: 'yuan-hong', biography: '元宏即北魏孝文帝，迁都洛阳并推动官制、礼制与族群身份表达的改革。',
    aliases: ['拓跋宏', '北魏孝文帝'], offices: [{ title: '北魏皇帝', polityId: 'wei_northern', placeId: 'luoyang', validFrom: 471, validTo: 499, datePrecision: 'range', sourceIds }],
    keyEvents: ['northern-wei-founded'], sourceIds, uncertaintyNote: '孝文帝改革涉及制度、语言和族群认同等多个层面，详情不把后世“汉化”标签当作单一政策结果。',
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
    personId: 'chen-baxian', biography: '陈霸先在侯景之乱后的江南军政重组中取得主导地位，受梁禅位建立南陈。',
    aliases: ['陈武帝'], offices: [{ title: '南陈皇帝', polityId: 'chen_southern', placeId: 'jiankang', validFrom: 557, validTo: 559, datePrecision: 'range', sourceIds }],
    keyEvents: ['southern-chen-founded'], sourceIds, uncertaintyNote: '南陈建立与其后统一江南部分地区有时间差，建康的都城身份不代表建国当年所有地区均已稳定归附。',
  },
  {
    personId: 'shi-jingtang', biography: '石敬瑭在后唐末年借助契丹军事力量受册立为帝，建立后晋并进入中原政治竞争。',
    aliases: ['晋高祖'], offices: [{ title: '后晋皇帝', polityId: 'jin_later', placeId: 'kaifeng', validFrom: 936, validTo: 942, datePrecision: 'range', sourceIds }],
    keyEvents: ['jin-later-founded'], sourceIds, uncertaintyNote: '后晋建立与契丹援助、燕云割让及中原控制分别属于不同层次的事实，不能合并为单一因果判断。',
  },
  {
    personId: 'liu-zhiyuan', biography: '刘知远在后晋覆亡后于太原即位，随后进入开封建立后汉的中原统治。',
    aliases: ['汉高祖'], offices: [{ title: '后汉皇帝', polityId: 'han_later', placeId: 'kaifeng', validFrom: 947, validTo: 948, datePrecision: 'range', sourceIds }],
    keyEvents: ['han-later-founded'], sourceIds, uncertaintyNote: '后汉建立经历太原即位与进入开封两个阶段，不能将单一即位地点等同于全政权即时控制范围。',
  },
  {
    personId: 'guo-wei', biography: '郭威是后汉禁军与中原军政体系中的关键将领，受禅建立后周。',
    aliases: ['周太祖'], offices: [{ title: '后周皇帝', polityId: 'zhou_later', placeId: 'kaifeng', validFrom: 951, validTo: 954, datePrecision: 'range', sourceIds }],
    keyEvents: ['zhou-later-founded'], sourceIds, uncertaintyNote: '后周受禅、军镇归附和后续制度整顿并非同一时点，详情按政权建立节点与任职阶段分开表达。',
  },
  {
    personId: 'yelu-abaoji', biography: '耶律阿保机整合契丹诸部并于916年称帝，辽上京及其后五京体系逐步成为政治空间。',
    aliases: ['辽太祖'], offices: [{ title: '契丹／辽皇帝', polityId: 'khitan', placeId: 'liao_shangjing', validFrom: 916, validTo: 926, datePrecision: 'range', sourceIds }],
    keyEvents: ['liao-founded'], sourceIds, uncertaintyNote: '契丹、辽的国号和政权分期存在不同叙述口径，本详情沿用项目目录并保留建国节点与后续国号变化的区别。',
  },
  {
    personId: 'wang-jian', biography: '王建在唐末经营巴蜀军政资源，907年在成都称帝，前蜀由此形成。',
    aliases: ['前蜀高祖'], offices: [{ title: '前蜀皇帝', polityId: 'former_shu', placeId: 'chengdu', validFrom: 907, validTo: 918, datePrecision: 'range', sourceIds }],
    keyEvents: ['former-shu-founded'], sourceIds, uncertaintyNote: '907年称帝标志前蜀政权形成，但巴蜀各地的实际控制仍需结合阶段性军事与行政资料。',
  },
  {
    personId: 'meng-zhixiang', biography: '孟知祥在后唐蜀地军政基础上取得独立地位，934年在成都称帝建立后蜀。',
    aliases: ['后蜀高祖'], offices: [{ title: '后蜀皇帝', polityId: 'later_shu', placeId: 'chengdu', validFrom: 934, validTo: 934, datePrecision: 'year', sourceIds }],
    keyEvents: ['later-shu-founded'], sourceIds, uncertaintyNote: '孟知祥称帝后不久去世，后蜀的长期统治由后继者延续；本详情不把个人在位期等同于政权存续期。',
  },
];

const detailById = new Map(personDetails.map((detail) => [detail.personId, detail]));

export function getPersonDetail(personId: string): PersonDetail | undefined {
  return detailById.get(personId);
}
