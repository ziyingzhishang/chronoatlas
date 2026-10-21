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
  {
    personId: 'gao-huan', biography: '高欢在北魏末年掌握东部军政资源，控制邺城并拥立元善见，东魏由此形成。',
    aliases: ['齐神武帝'], offices: [{ title: '东魏权臣与军政核心', polityId: 'wei_eastern', placeId: 'ye', validFrom: 534, validTo: 547, datePrecision: 'range', sourceIds }],
    keyEvents: ['eastern-wei-founded'], sourceIds, uncertaintyNote: '高欢是东魏实际军政核心，但东魏皇帝仍为元善见；本详情区分名义皇统与实际权力结构。',
  },
  {
    personId: 'gao-yang', biography: '高洋承接高欢家族在东魏的军政基础，550年受禅建立北齐。',
    aliases: ['北齐文宣帝'], offices: [{ title: '北齐皇帝', polityId: 'qi_northern', placeId: 'ye', validFrom: 550, validTo: 559, datePrecision: 'range', sourceIds }],
    keyEvents: ['northern-qi-founded'], sourceIds, uncertaintyNote: '550年受禅是北齐建政节点，不把北齐后期控制范围回填到禅代当年。',
  },
  {
    personId: 'zhao-gou', biography: '赵构在靖康之变后于应天府即位，重建宋室中央并开启南宋阶段，政权随后经历多地迁驻。',
    aliases: ['宋高宗'], offices: [{ title: '南宋皇帝', polityId: 'song_south', placeId: 'yingtian', validFrom: 1127, validTo: 1162, datePrecision: 'range', sourceIds }],
    keyEvents: ['southern-song-founded', 'song-southward'], sourceIds, uncertaintyNote: '应天即位、南渡迁移与临安主要政治中心形成是连续但不同节点，不能将后来的临安定都提前到1127年。',
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
    keyEvents: [], sourceIds, uncertaintyNote: '项目当前没有单独的北周建政事件节点，本详情只链接北周政权和家族关系，不以其他政权事件替代。',
  },
  {
    personId: 'li-yu', biography: '李煜是南唐末代君主，南唐在其统治末期与北宋对峙并于975年覆亡，词作保留了政权末期的文化记忆。',
    aliases: ['南唐后主', '李后主'], offices: [{ title: '南唐国主', polityId: 'southern_tang', placeId: 'jiankang', validFrom: 961, validTo: 975, datePrecision: 'range', sourceIds }],
    keyEvents: ['southern-tang-founded'], sourceIds, uncertaintyNote: '南唐建政事件早于李煜即位，本处以事件作为政权导航，不把李煜个人统治期前移为南唐建立期。',
  },
  {
    personId: 'yang-xingmi', biography: '杨行密在唐末淮南军镇竞争中积累军政资源，受封吴王后杨吴进入独立发展的分期。',
    aliases: ['吴太祖'], offices: [{ title: '杨吴实际统治者', polityId: 'wu_ten', placeId: 'yangzhou', validFrom: 902, validTo: 905, datePrecision: 'range', sourceIds }],
    keyEvents: ['yang-wu-founded'], sourceIds, uncertaintyNote: '902年是受封与政权分期节点，不等同于正式称帝或完整主权独立；扬州是政治中心参照。',
  },
  {
    personId: 'qian-liu', biography: '钱镠控制两浙并以杭州为中心维持地方政权，吴越在中原册封和地方自治之间延续。',
    aliases: ['吴越武肃王'], offices: [{ title: '吴越国王', polityId: 'wuyue', placeId: 'hangzhou', validFrom: 907, validTo: 932, datePrecision: 'range', sourceIds }],
    keyEvents: ['wuyue-founded'], sourceIds, uncertaintyNote: '907年受封标记吴越政权分期，不把册封范围直接等同于两浙全部地区的稳定直接控制。',
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
    personId: 'sima-yan', biography: '司马炎承接司马氏在曹魏中枢形成的权力，受禅建立西晋，并在280年灭吴实现短暂统一。',
    aliases: ['晋武帝'], offices: [{ title: '西晋皇帝', polityId: 'jin_western', placeId: 'luoyang', validFrom: 265, validTo: 290, datePrecision: 'range', sourceIds }],
    keyEvents: ['western-jin-founded'], sourceIds, uncertaintyNote: '265年受禅建立西晋与280年灭吴分别是建政和统一节点，不能把后者的版图回填到建国当年。',
  },
  {
    personId: 'zhao-kuangyin', biography: '赵匡胤在后周军政体系中崛起，经陈桥兵变受禅建立北宋，开封继续作为中原政治中心。',
    aliases: ['宋太祖'], offices: [{ title: '北宋皇帝', polityId: 'song_northern', placeId: 'kaifeng', validFrom: 960, validTo: 976, datePrecision: 'range', sourceIds }],
    keyEvents: ['northern-song-founded'], sourceIds, uncertaintyNote: '960年受禅是北宋建政节点，统一南方诸国是后续过程，不由北宋后期范围倒推建国初期控制。',
  },
  {
    personId: 'wanyan-aguda', biography: '完颜阿骨打整合女真诸部，于1115年在会宁称帝建立金，随后与辽和北宋展开长期战争。',
    aliases: ['金太祖'], offices: [{ title: '金皇帝', polityId: 'jin_jurchen', placeId: 'huining', validFrom: 1115, validTo: 1123, datePrecision: 'range', sourceIds }],
    keyEvents: ['jurchen-jin-founded'], sourceIds, uncertaintyNote: '1115年是会宁建国节点，不以金灭辽和占领北宋后的范围倒推早期女真政权控制区。',
  },
  {
    personId: 'li-yuanhao', biography: '李元昊整合党项军政资源，于1038年称帝建立西夏，兴庆府成为其政权的政治中心。',
    aliases: ['西夏景宗'], offices: [{ title: '西夏皇帝', polityId: 'western_xia', placeId: 'xingqing', validFrom: 1038, validTo: 1048, datePrecision: 'range', sourceIds }],
    keyEvents: ['western-xia-founded'], sourceIds, uncertaintyNote: '1038年是称帝与国号形成节点，不把西夏后期的扩张范围提前回填到建国当年。',
  },
  {
    personId: 'yu-the-great', biography: '禹是传统夏代建政叙事中的核心人物，治水、受禅与夏王朝形成在后世文献中相互连接。',
    aliases: ['大禹', '夏禹'], offices: [{ title: '传统夏代先王', polityId: 'xia_early', datePrecision: 'unknown', sourceIds: ['china-chronology'] }],
    keyEvents: [], sourceIds: ['china-chronology'], uncertaintyNote: '夏代年代、禹的个人事迹及“建立夏”的具体历史过程存在文献与考古层面的争议，本详情不把传统叙事当作已证实的逐年编年。',
  },
  {
    personId: 'wu-ding', biography: '武丁是商代重要君主，甲骨文记录了其祭祀、战争和王室活动，反映出晚商国家组织的一部分面貌。',
    aliases: ['殷高宗'], offices: [{ title: '商王', polityId: 'shang', datePrecision: 'approximate', sourceIds: ['china-chronology'] }],
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
    aliases: ['秦穆公'], offices: [{ title: '秦国国君', polityId: 'qin_state', datePrecision: 'approximate', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: [], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '秦国早期年代与疆域需按诸侯国阶段核验，不能把秦穆公时期的影响范围提前等同于秦帝国版图。',
  },
  {
    personId: 'zhao-wuling', biography: '赵武灵王推行胡服骑射，推动赵国军事组织和边疆防务转型，是战国政治改革的重要案例。',
    aliases: ['赵武灵王'], offices: [{ title: '赵国国君', polityId: 'zhao_warring', datePrecision: 'range', sourceIds: ['zizhi-tongjian'] }],
    keyEvents: [], sourceIds: ['zizhi-tongjian'], uncertaintyNote: '胡服骑射的具体实施过程和年代按战国编年概括，改革成效不应直接推导为赵国全境同时改变。',
  },
  {
    personId: 'modu-chanyu', biography: '冒顿单于整合匈奴部众并建立强势草原政治秩序，汉初北方格局因此发生重要变化。',
    aliases: ['冒顿单于'], offices: [{ title: '匈奴单于', polityId: 'xiongnu', datePrecision: 'range', sourceIds: ['zizhi-tongjian'] }],
    keyEvents: ['xiongnu-founded'], sourceIds: ['zizhi-tongjian'], uncertaintyNote: '匈奴政治中心具有移动性，冒顿“建立”更多指部众整合和权力重组，不应套用固定都城或行政疆界概念。',
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
    aliases: ['弘光帝'], offices: [{ title: '南明弘光帝', polityId: 'ming_southern', placeId: 'jiankang', validFrom: 1644, validTo: 1645, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: [], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '南明是明室南迁后多个政权阶段的合称，朱由崧政权不能代表南明全部政权，也不能由南京名义控制推导完整疆域。',
  },
  {
    personId: 'shi-kefa', biography: '史可法是南明弘光时期的重要军政人物，负责扬州防务，与朱由崧朝廷存在阶段性君臣关系。',
    aliases: ['道邻'], offices: [{ title: '南明督师', polityId: 'ming_southern', validFrom: 1644, validTo: 1645, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: [], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '史可法与弘光朝廷的关系以任职和军事防务为核心，不把后世忠烈评价直接替代当时政治关系的史料核验。',
  },
  {
    personId: 'temujin', biography: '铁木真在草原部众竞争中逐步整合力量，1206年被推举为成吉思汗，蒙古汗国进入共同汗权阶段。',
    aliases: ['成吉思汗'], offices: [{ title: '蒙古大汗', polityId: 'mongol', validFrom: 1206, validTo: 1227, datePrecision: 'range', sourceIds: ['china-chronology'] }],
    keyEvents: ['mongol-founded'], sourceIds: ['china-chronology'], uncertaintyNote: '1206年大会标志共同汗权形成，但蒙古诸部的整合、扩张和后续帝国化是分阶段过程，不能把后期疆域回填到建政节点。',
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
    keyEvents: ['tibetan-founded'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '吐蕃形成不是单一年份完成的国家化过程，松赞干布时期的高原整合、拉萨中心和唐蕃关系需按不同阶段阅读。',
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
    personId: 'li-hao', biography: '李暠在河西西部经营敦煌、酒泉等地，400年前后建立西凉并维系地方政权与丝路交通。',
    aliases: ['西凉武昭王'], offices: [{ title: '西凉君主', polityId: 'western_liang', placeId: 'dunhuang', validFrom: 400, validTo: 417, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['western-liang-state-founded'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '400年前后为西凉形成约年，敦煌和酒泉之间的政治中心变化不能简化为固定单一都城。',
  },
  {
    personId: 'gao-jixing', biography: '高季兴在五代中原政权更替中经营江陵，924年前后形成荆南地方政权并维持其相对独立。',
    aliases: ['南平武信王'], offices: [{ title: '荆南节度使与国主', polityId: 'jingnan', placeId: 'jiangling', validFrom: 907, validTo: 929, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['jingnan-founded'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '高季兴早期受中原政权任命，924年前后才进入荆南政权分期；藩镇任职与地方独立不能混为一谈。',
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
    personId: 'liu-yan', biography: '刘龑承接兄长刘隐在广州经营的岭南军政资源，917年称帝，918年改国号为汉，南汉进入正式建政阶段。',
    aliases: ['刘岩', '南汉高祖'], offices: [{ title: '南汉皇帝', polityId: 'southern_han', placeId: 'guangzhou', validFrom: 917, validTo: 942, datePrecision: 'range', sourceIds: ['zizhi-tongjian', 'china-chronology'] }],
    keyEvents: ['southern-han-founded'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '917年国号为越、918年改称汉；“南汉”是后世通称，不能把刘龑称帝日与岭南全域整合混为一谈。',
  },
  {
    personId: 'yelu-dashi', biography: '耶律大石在辽亡后率契丹部众西行，重组政治与军事网络，西辽在七河流域及中亚逐步形成。',
    aliases: ['西辽德宗'], offices: [{ title: '西辽皇帝与西行部众领袖', polityId: 'western_liao', placeId: 'balasagun', validFrom: 1124, validTo: 1143, datePrecision: 'range', sourceIds: ['china-chronology'] }],
    keyEvents: ['western-liao-founded'], sourceIds: ['china-chronology'], uncertaintyNote: '1124年前后是西辽形成约年；西行路线、称帝、建都和七河流域整合属于不同阶段，不能把辽旧疆域直接移植为西辽边界。',
  },
  {
    personId: 'kublai', biography: '忽必烈在蒙古汗权和东亚战争体系基础上建立元朝，1271年定国号为大元，随后继续完成对南宋的军事与行政整合。',
    aliases: ['元世祖'], offices: [{ title: '蒙古大汗／元皇帝', polityId: 'yuan', placeId: 'dadu', validFrom: 1260, validTo: 1294, datePrecision: 'range', sourceIds: ['yuan-nationalities-history', 'yuan-li-bingzhong'] }],
    keyEvents: ['yuan-founded'], sourceIds: ['yuan-nationalities-history', 'yuan-li-bingzhong'], uncertaintyNote: '1260年汗位、1271年改国号和1279年南宋覆亡是连续但不同的节点；元朝国号不等于当年已经完成南方控制。',
  },
  {
    personId: 'liu-bingzhong', biography: '刘秉忠在忽必烈政权中参与国号、都城和制度设计，元初国家建构与大都政治空间均与其活动相连。',
    aliases: ['子聪'], offices: [{ title: '元初政治家与制度设计者', polityId: 'yuan', placeId: 'dadu', validFrom: 1260, validTo: 1274, datePrecision: 'range', sourceIds: ['yuan-li-bingzhong', 'yuan-nationalities-history'] }],
    keyEvents: ['yuan-founded'], sourceIds: ['yuan-li-bingzhong', 'yuan-nationalities-history'], uncertaintyNote: '刘秉忠参与元初制度建构，但国号、都城与行政整合是集体政治过程，不能归结为个人单独决定。',
  },
  {
    personId: 'zhu-yuanzhang', biography: '朱元璋在元末群雄竞争中以应天为基地建立明朝，1368年称帝并北伐攻取大都，明初政权转换由此展开。',
    aliases: ['明太祖'], offices: [{ title: '明皇帝', polityId: 'ming', placeId: 'yingtian', validFrom: 1368, validTo: 1398, datePrecision: 'range', sourceIds: ['china-chronology'] }],
    keyEvents: ['ming-founded'], sourceIds: ['china-chronology'], uncertaintyNote: '应天称帝与攻取大都是1368年的不同阶段；明建立不代表当年已稳定控制元旧境全部地区。',
  },
  {
    personId: 'toghon-temur', biography: '妥懽帖睦尔即元顺帝，元末在大都维持元廷统治；1368年明军攻取大都后北走，元廷北迁与北元阶段相连。',
    aliases: ['元顺帝', '惠宗'], offices: [{ title: '元皇帝／北元汗廷前期君主', polityId: 'northern_yuan', placeId: 'beiyuan_core', validFrom: 1333, validTo: 1370, datePrecision: 'range', sourceIds: ['northern-yuan-early-ming', 'china-chronology'] }],
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
    keyEvents: ['eastern-wei-founded'], sourceIds: ['zizhi-tongjian', 'china-chronology'], uncertaintyNote: '东魏名义皇统与高欢、高澄家族的实际权力需要分层记录；元善见即位不等于其独立掌握全部军政资源。',
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
];

const detailById = new Map(personDetails.map((detail) => [detail.personId, detail]));

export function getPersonDetail(personId: string): PersonDetail | undefined {
  return detailById.get(personId);
}
