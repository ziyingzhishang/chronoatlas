import type { CapitalRole, CapitalStatus, CapitalTerm } from '../domain/types';
import { polities } from './polities';
import { places } from './places';

type Seed =
  | [string, string, number, number]
  | [string, string, number, number, CapitalRole, CapitalStatus, ('high'|'medium'|'low')?, string?];
const sourceIds = ['capital-history-reference'];
const additionalSourceIds: Record<string, string[]> = {
  republic: ['taiwan-archives-government-relocation-1949', 'academy-chinese-studies-republic-retreat-1949', 'taipei-city-geographical-location'],
  yan_warring: ['yan-capital-relocation-liaoyang-2011', 'modern-geography-reference'],
  sui: ['sui-tang-changan-gis-study', 'modern-geography-reference'],
  later_jin: ['dpm-nurhaci-chronology', 'dpm-hetu-ala', 'dpm-hongtaiji-biography'],
  western_liang: ['jinshu-vol87-li-hao', 'zizhi-tongjian-vol111-western-liang', 'zizhi-tongjian-vol118-western-liang', 'zizhi-tongjian-vol119-western-liang'],
  jin_hedong: ['hedong-jin-907-923-primary-sources', 'modern-geography-reference'],
  liang_later: ['later-liang-capital-timeline-primary', 'modern-geography-reference'],
  southern_yan: ['southern-yan-formation-primary-sources', 'southern-yan-termination-410-primary-sources'],
  former_zhao: ['former-zhao-capital-timeline-primary-sources', 'modern-geography-reference'],
  later_yan: ['later-yan-zhongshan-location-gazetteer', 'modern-geography-reference'],
  western_yan: ['chgis-changzi-western-yan-center', 'zizhi-tongjian-vol105-western-yan-384-394', 'zizhi-tongjian-vol106-western-yan-384-394', 'zizhi-tongjian-vol108-western-yan-384-394'],
  wu_three: ['wuchang-wu-capital-location', 'three-kingdoms-formation-220-223-primary-sources', 'wei-jin-transition-265-primary-sources'],
  later_liang: ['later-liang-founding-386-primary'],
  southern_liang: ['southern-liang-termination-414-primary'],
  zhou_eastern: ['shiji-zhou-benji-eastward', 'eastern-zhou-luoyang-royal-center'],
  qin: ['zizhi-tongjian', 'modern-geography-reference'],
  qin_state: ['zizhi-tongjian', 'modern-geography-reference', 'qin-early-capital-sites-archaeology', 'qin-state-capital-sequence-archaeology'],
  western_qin: ['western-qin-early-center-jinshu-106', 'western-qin-restoration-jinshu-125'],
  song_south: ['southern-song-court-route-study', 'southern-song-linan-academic-study', 'modern-geography-reference'],
  western_liao: ['liaoshi-vol30-yelu-dashi', 'iranica-balasagun', 'unesco-chui-balasagun'],
  wei_northern: ['northern-wei-founding-386-primary-source', 'shengle-site-archaeology-reference'],
  ming_southern: ['southern-ming-overview', 'southern-ming-hongguang', 'southern-ming-longwu', 'southern-ming-shaowu', 'southern-ming-yongli', 'modern-geography-reference'],
};
const twelfthBatchAuditNotes: Record<string, string> = {
  xiongnu: '最终证据复核：保留移动汗廷；龙城／单于庭仅作今蒙古国南部至杭爱地区的候选区域参照，来源为 capital-history-reference。',
  tuyuhun: '最终证据复核：保留候选王都；伏俟城对应今青海省共和县一带，不能据此确认全期固定首都，来源为 capital-history-reference。',
  xia_early: '最终证据复核：保留考古候选；二里头对应今河南省洛阳市偃师区二里头村附近，不能等同为已证实的夏代固定首都，来源为 capital-history-reference 与 erlitou-official。',
  shang: '最终证据复核：保留早期候选；二里头对应今河南省洛阳市偃师区，商代多次迁都且现有地点不能代替晚商殷墟（今河南省安阳市）独立地点实体，来源为 capital-history-reference。',
  western_qin: '最终证据复核：保留阶段性中心；金城及河湟／河西参照对应今兰州市、武威市一带，不能合并推定为全期固定首都，来源为 capital-history-reference。',
  northern_yuan: '最终证据复核：保留移动汗廷；蒙古汗廷仅对应今蒙古高原中部的阶段性区域，多个汗廷阶段不能压缩为单一固定首都，来源为 capital-history-reference 与 northern-yuan-early-ming。',
  ming_southern: '最终证据复核：保留阶段性中心；南京、福州、广州、肇庆分别对应今江苏省南京市、福建省福州市、广东省广州市、广东省肇庆市，南明诸政权并立，不能宣称全期单一固定首都，来源为阶段专门来源与 capital-history-reference。',
  turkic: '最终证据复核：保留移动汗廷；于都斤／鄂尔浑政治核心对应今蒙古国中部，两个汗国阶段均为移动性汗廷，不是固定城市首都，来源为 capital-history-reference、turkic-history-db 与 turkic-orkhon-heritage。',
};
const twelfthBatchSourceIds: Record<string, string[]> = {
  xia_early: ['erlitou-official'],
  northern_yuan: ['northern-yuan-early-ming'],
  turkic: ['turkic-history-db', 'turkic-orkhon-heritage', 'turkic-otuken-second-khaganate-study'],
};
const thirteenthBatchAuditNotes: Record<string, string> = {
  xiongnu: '保留龙城／单于庭的候选区域参照，不将会聚中心解释为固定城市首都；位置与汗廷移动性仍有争议。',
  tuyuhun: '保留伏俟城后期王都候选，不将候选遗址扩展为全期固定首都；遗址比定与阶段对应仍不充分。',
  xia_early: '保留二里头考古文化候选，不把文化核心直接等同为夏代国家都城；年代与政权对应仍属研究问题。',
  shang: '保留早期都城候选，不以二里头替代商代多次迁都传统或晚商殷墟地点；本轮不新增未经地点目录支持的阶段记录。',
  western_qin: '保留金城及河湟／河西阶段性中心，区分实际政治中心与固定正式都城；现有时段不足以支持全期单一都城。',
  northern_yuan: '保留蒙古汗廷区域参照，区分移动汗廷与固定城市；北元多阶段政治核心不能压缩为单一都城。',
  ming_southern: '保留南京、福州、广州、肇庆的阶段性实际中心，区分南明并立政权与单一国家首都；不做全期固定都城判断。',
  turkic: '保留两个突厥汗国阶段的于都斤／鄂尔浑区域政治核心，区分汗廷网络与固定城市；不升级为正式固定首都。',
};
const fourteenthBatchAuditNotes: Record<string, string> = {
  xia_early: '第十四轮首都证据复核：补充晚期二里头文化核心的近似阶段说明；二里头都邑可作为夏文化与早期王权形成的候选中心，但不能把考古文化直接等同为已证实的夏代固定首都，继续保留 disputed／uncertain／low。',
  shang: '第十四轮首都证据复核：补充早期二里头相关候选的证据边界；二里头遗址可用于夏晚期至早商文化传承研究，但商代存在多次迁都，不能以该遗址代表商代固定都城，继续保留 disputed／uncertain／low。',
  western_qin: '第十四轮首都证据复核：补充西秦复国后河湟／枹罕阶段的区域性政治中心说明；现有地点目录没有枹罕独立地点实体，姑臧仅作河西参照，不能把代理坐标当作枹罕精确定位或全期固定首都。',
};
const seed = (polityId:string, [placeId, _name, validFrom, validTo, role='primary', status='formal', confidence='medium', notes]:Seed): CapitalTerm => ({
  polityId,
  placeId,
  validFrom,
  validTo,
  role,
  status,
  confidence,
  sourceIds: [...new Set([...sourceIds, ...(twelfthBatchSourceIds[polityId] ?? []), ...(additionalSourceIds[polityId] ?? [])])],
  notes: (() => {
    const resolvedSourceIds = [...new Set([...sourceIds, ...(twelfthBatchSourceIds[polityId] ?? []), ...(additionalSourceIds[polityId] ?? [])])];
    const modernName = places.find((place) => place.id === placeId)?.modernName ?? '现代位置待核';
    const auditNote = thirteenthBatchAuditNotes[polityId]
      ? `第十三轮证据复核：现代对应：${modernName}；角色：${role}；来源ID：${resolvedSourceIds.join('、')}。${thirteenthBatchAuditNotes[polityId]}`
      : undefined;
    return [notes, twelfthBatchAuditNotes[polityId], auditNote, fourteenthBatchAuditNotes[polityId]].filter(Boolean).join(' ');
  })(),
});

const explicit: Record<string, Seed[]> = {
  xiang_yu:[['pengcheng','彭城（政权中心参照）',-206,-203,'primary','actual','medium','史书记项羽自立为西楚霸王、都彭城。此处仅表示有来源支持的城市级中心参照；前202年为政权年内终止转换年，不以该点覆盖全年，也不表示封域或疆界。']],
  jin_hedong:[['taiyuan','晋阳政治军事中心（非正式都城）',895,922,'de_facto','actual','low','晋阳（今太原一带）为李克用、李存勖河东军政集团的重要政治军事根据地；本记录仅作区域中心参照，不称正式都城，不指认具体古城点位，也不表示河东边界。895—906年处于唐廷册封晋王的制度背景，907年后承唐名义与区域自主并存；923年称帝建后唐，为政权形态转换年，不以此点覆盖全年。']],
  han_warring:[['xinzheng','新郑',-403,-230]], zhao_warring:[['handan','邯郸',-403,-228]],
  wei_warring:[['anyi','安邑',-403,-344],['kaifeng','大梁',-343,-225]],
  chu_warring:[['ying','郢',-403,-279],['shouchun','寿春',-278,-223]], yan_warring:[
    ['ji','蓟',-403,-227,'primary','formal','high','秦军于前226年攻取蓟后，燕王喜退保辽东；蓟的都城阶段止于失守前。'],
    ['liaoyang','辽阳（区域级参照）',-226,-222,'primary','actual','low','薛兰霞、杨玉生2011年将辽阳列为燕最后都城，称约五年后燕王喜被俘；这是有分歧的都城研究结论。此项仅作低置信度区域中心参照，不表示襄平城址精确位置、辽东全域或燕国边界。'],
  ], qi_warring:[['linzi','临淄',-403,-221]],
  qin:[['xianyang','咸阳',-221,-206,'primary','formal','high','秦统一后以咸阳为正式都城，今陕西省咸阳市。']],
  xin:[['changan','长安',9,23,'primary','formal','high','新朝以长安为正式都城，今陕西省西安市；不将洛阳等临时驻地误写为正式迁都。']], xiongnu:[['xiongnu_core','龙城／单于庭',-209,93,'mobile_court','uncertain','low','匈奴采用单于庭、龙城等会聚中心，政治核心随部众和季节移动；现代参照为蒙古高原中部候选区域，龙城具体位置存在争议，不将其视作固定城市首都。']],
  goguryeo:[['wunvshan','纥升骨城',-37,2],['guonei','国内城',3,426],['pyongyang','平壤',427,585],['pyongyang','长安城（平壤历史区域）',586,668,'primary','formal','medium','586年后高句丽政治中心转入长安城；地点实体仍以平壤历史区域作现代城市参照，不能把别称当作现代独立城市。']],
  silla:[['jincheng_silla','金城／徐罗伐',-57,377,'primary','formal','medium','新罗王都可定位于庆州区域；此点表示宽泛王京区域，不确认金城／徐罗伐与月城的具体对应，也不表示某一固定宫城或疆界。'],['wolseong_silla','月城／半月城',101,377,'disputed','uncertain','low','传统纪年记载101年筑月城并迁居；早期纪年可靠性及金城与月城关系有争议，考古研究将西城墙营建起点约置于4世纪中叶、主体墙体约在4世纪末至5世纪初。仅列候选遗址，不据此确认101年迁都。'],['wolseong_silla','月城／半月城',378,935,'primary','formal','medium','月城是后期新罗王京的重要宫城遗址层；其与金城、徐罗伐等名称的关系需要结合文献与考古分期。']], tuyuhun:[['tuyuhun_core','伏俟城',313,663,'disputed','uncertain','low','伏俟城是吐谷浑后期王都候选，现代参照为今青海共和县一带；遗址与各阶段政治中心的对应仍有争议，不能确认全期固定首都。']],
  turkic:[
    ['uhtuken','于都斤／鄂尔浑政治核心',552,630,'mobile_court','actual','low','第一突厥汗国阶段以于都斤／鄂尔浑作为汗廷与草原政治核心的区域参照，现代对应为今蒙古国中部；汗廷随季节和军事活动移动，不是可唯一定位的固定城市首都。'],
    ['uhtuken','于都斤／鄂尔浑政治核心',682,743,'mobile_court','actual','low','后突厥复兴后至末期阶段以于都斤／鄂尔浑为政治核心区域参照，现代对应为今蒙古国中部；汗廷、营地和部众网络具有移动性，不是可唯一定位的固定城市首都。744年为汗权终止与继承转换年，不以该点覆盖全年。'],
  ], tibetan_empire:[['yalong','雅砻',618,629,'de_facto','actual','medium'],['luosie','逻些',630,842]],
  nanzhao:[['taihe','太和城',738,778],['yangjumei','羊苴咩城',779,902]], khitan:[['liao_shangjing','上京临潢府',916,1125,'primary','formal','high'],['liao_dongjing','东京辽阳府',938,1125,'secondary','formal','high','928年升南京，938年改东京；919年东平郡为前置城市经营阶段'],['liao_nanjing','南京析津府',938,1122,'secondary','formal','high','938年幽州升南京；1122年辽控制阶段结束，后续金中都另行记录'],['liao_zhongjing','中京大定府',1007,1125,'secondary','formal','high'],['liao_xijing','西京大同府',1044,1125,'secondary','formal','high']],
  xia_early:[['erlitou','二里头',-1750,-1600,'disputed','uncertain','low','二里头可作夏代早期考古文化参照，现代对应为今河南偃师一带；考古文化与夏王朝及都城的对应仍未获一致证明，不据此确认固定首都。']], shang:[['erlitou','早期都城候选',-1600,-1300,'disputed','uncertain','low','商代有多次迁都传统，现代参照为今河南偃师二里头遗址一带；早期地点与考古文化的对应不能由单一遗址确认，现有地点仅作候选参照，不把二里头视为商代固定首都。']],
  zhou_western:[['fenghao','镐京／宗周',-1046,-771],['luoyang','洛邑／成周',-1046,-771,'secondary','formal','medium','东周前的东都/成周体系。']], zhou_eastern:[['luoyang','洛邑／洛阳',-770,-256,'primary','formal','high','东周王室以洛邑（洛阳）为都，今河南省洛阳市；春秋战国诸侯并立，不将王都等同于周王室实际控制范围。']], qin_state:[['xiquanquiu','西犬丘（礼县区域参照）',-770,-763,'primary','formal','low','前770—前763年仅以今甘肃礼县城关镇西山遗址及早期秦活动区域作低置信度中心参照；西犬丘、西垂等名称与遗址对应仍有讨论。点位不表示精确古城位置、秦国边界或“岐以西”封授范围。'],['qianwei','汧渭之会（魏家崖区域参照）',-762,-715,'primary','formal','low','传统纪年以秦文公四年（前762）东迁至汧渭之会；魏家崖遗址被考古研究基本确认为相关都邑区域。本点为今宝鸡陈仓区千河镇级区域近似参照，不是遗址测绘点、城垣或疆界。'],['pingyang_qin','平阳（区域参照）',-714,-678,'primary','formal','low','传统纪年记秦宪公二年（前714）迁居平阳，地望有眉县、陈仓东部等说法；仅作低置信度区域中心，不指认唯一城址或疆界。'],['yongcheng_qin','雍城',-677,-384,'primary','formal','medium','秦德公元年（前677）居雍，后续秦国长期经营雍城；以今凤翔雍城遗址区域作城市级参照，不等同于遗址边界或秦国疆界。'],['liyang_qin','栎阳（区域参照）',-383,-351,'primary','formal','low','秦献公迁都栎阳后至前350年迁都咸阳前的阶段；点位为今西安市阎良区栎阳城遗址区域参照，不表示城垣或疆界。'],['xianyang','咸阳',-350,-222,'primary','formal','high','秦迁都咸阳后，咸阳为秦国正式都城，今陕西省咸阳市；前221年秦帝国建立后另行记录，不把两个政权阶段合并。']],
  gengshi:[['wanyang','宛',23,23,'primary','actual','high'],['luoyang','洛阳',24,24,'primary','actual','medium'],['changan','长安',25,25,'primary','actual','medium']],
  jin_western:[['luoyang','洛阳',265,311,'primary','formal','high','西晋正式都城；311年洛阳失守后，晋廷迁至长安。'],['changan','长安',312,316,'primary','actual','high','晋愍帝在长安继续维持西晋政权，属后期实际政治中心。']],
  cheng_han:[['chengdu','成都',304,347,'primary','formal','high','成汉以成都为正式都城，今成都市。']],
  former_liang:[['guzang','姑臧',314,376]], western_qin:[['yongshi_western_qin','勇士城',385,387,'primary','actual','low','第十四轮首都证据复核：《晋书》记太元十年（385）九月乞伏国仁建政并筑勇士城而居，故385年地图点只表示年后段中心；《榆中县志》考在今夏官营一带，但具体古城对应仍有异说，地图仅标榆中区域参考点，不能作为精确城址、疆界或固定首都断言。与金城阶段及后期河湟／枹罕阶段分开记录。'],['jincheng','金城',388,400,'primary','actual','medium','388年乞伏乾归继位后迁都金城，现代对应为今甘肃省兰州市一带；与385—387年勇士城阶段及后续复国阶段分开，不代表西秦全期固定首都。'],['fuhan','枹罕',412,431,'primary','actual','low','412年乞伏炽磐继位后迁都枹罕；409年复国初期度坚山、410年苑川等中心迁移另行区分，不能用枹罕点回填。']], later_liang:[['guzang','姑臧',386,403]], southern_liang:[['xiping','西平',397,401],['ledu','乐都',402,414,'primary','actual','medium','414年乐都在南凉覆亡前仍为都城；西秦于年内攻取乐都并接收相关人口，中心点表示年内阶段性政治中心，不代表南凉独立政权全年延续。']], southern_yan:[['huatai','滑台（建政中心）',398,398,'primary','actual','medium','《晋书》卷127与《资治通鉴》卷110记398年慕容德率户四万南迁滑台并称燕王；仅作滑台区域性中心参照。'],['guanggu','广固',400,410,'primary','actual','medium','《晋书》卷127与《资治通鉴》卷111将慕容德在广固称帝记于400年；不把广固向前回填至399年。']], western_liang:[['dunhuang','敦煌',400,404,'primary','actual','medium','400年建政后敦煌为西凉前期政治中心；《晋书》以405年迁居酒泉明确其中心转移。'],['jiuquan','酒泉',405,420,'primary','actual','high','《晋书》卷87明确记载义熙元年李暠由敦煌迁居酒泉；420年沮渠蒙逊进入酒泉后西凉残余政权转据敦煌。'],['dunhuang','敦煌（李恂终局中心）',421,421,'primary','actual','low','《资治通鉴》卷118记李恂于420年冬返回敦煌，卷119记421年北凉围攻并水灌敦煌；只表示西凉残余政权的终局中心，不代表全年独立控制或疆域。']], northern_yan:[['longcheng','龙城',407,436]],
  former_qin:[['changan','长安',351,385,'primary','formal','high','前秦早期至淝水战后前期以长安为正式都城。385年长安失守后，苻登后期在胡空堡、雍、平凉及关中战场间转移；末期政治中心不再用长安一地代表，具体据点不作单点首都绘制。']],
  later_qin:[['changan','长安',386,417,'primary','formal','high','386年姚苌取得长安并称帝后，以长安为正式都城；384—385年后秦形成及军事据点阶段另行区分。']],
  xia:[['zhitong','统万城',413,431,'primary','formal','high','统万城建成后成为夏的正式都城；407—412年建政初期中心不据此向前推定。']],
  northern_liang:[['zhangye','张掖',397,400,'primary','formal','high','北凉早期以张掖为都，今张掖市。'],['guzang','姑臧',401,439,'primary','formal','high','北凉后期迁都姑臧，今武威市城区一带。']],
  song_northern:[['kaifeng','开封',960,1127,'primary','formal','high','北宋定都开封，作为现有来源字段支持的正式都城时段。']], song_south:[
    ['song_yingtian','应天府（商丘）',1127,1127,'temporary','actual','medium','1127年五月赵构在应天即位；现代商丘定位为近似中心。'],
    ['yangzhou','扬州',1127,1129,'temporary','actual','medium','1127年十月移居扬州，至1129年金军南下前后离开；年份粒度不能表达具体月日。'],
    ['jiankang','建康',1129,1129,'temporary','actual','medium','仅列南渡路线经过的阶段性中心，未据到访地点推定长期首都。'],
    ['shaoxing','越州／绍兴府',1129,1132,'temporary','actual','medium','1129—1132年间暂居越州／绍兴府；绍兴二年正月迁往临安，年度粒度使1132仍可同时出现两个先后阶段。'],
    ['mingzhou_song','明州',1129,1129,'temporary','actual','medium','1129—1130年南渡路线中的短暂停驻节点，非固定首都。'],
    ['wenzhou_song','温州',1129,1129,'temporary','actual','medium','南渡期间海上转徙中的阶段性驻跸地，非固定首都。'],
    ['taizhou_song','台州',1129,1129,'temporary','actual','medium','南渡期间海上转徙中的阶段性驻跸地，非固定首都。'],
    ['linan','临安（阶段行在）',1129,1129,'temporary','actual','medium','1129年金军南下期间曾以杭州为阶段性行在；不表示南宋当年已定都。'],
    ['pingjiang','平江府',1134,1135,'temporary','actual','medium','绍兴四年九月至五年二月为应对金、齐军队侵袭而阶段驻跸。'],
    ['linan','临安（长期行在）',1131,1136,'primary','actual','high','绍兴元年末筹备移跸，绍兴二年正月高宗抵达；1134—1135年短暂移驻平江，故本项表示长期行在阶段而非每年唯一驻地。'],
    ['jiankang','建康（行在）',1136,1138,'temporary','actual','medium','绍兴六年九月至八年二月为筹划北伐而驻跸建康；1138年二月回临安。'],
    ['linan','临安（正式行都）',1138,1279,'primary','formal','high','绍兴八年（1138）临安成为南宋长期正式政治中心；不把该节点提前为1127年建政时事实。'],
  ], western_xia:[['xingqing','兴庆府',1038,1227,'primary','formal','high','西夏都城兴庆府，时段与政权目录范围一致。']], jin_jurchen:[['huining','会宁府',1115,1153],['jin_zhongdu','中都大兴府',1153,1214],['kaifeng','南京／开封',1214,1234]], western_liao:[['balasagun','八剌沙衮／虎思斡耳朵',1134,1218,'de_facto','actual','medium','《辽史》记延庆三年建都城、号虎思斡耳朵；今对应吉尔吉斯斯坦楚河州托克马克附近布拉纳遗址。宫帐、军营与城址性质需区分，1132年称帝地点不等同于1134年稳定中心。']], dali:[['yangjumei','羊苴咩城',937,1253]], mongol:[['mongol_karakorum','和林',1206,1271,'de_facto','actual','medium','早期移动汗廷，后期固定中心。']], yuan:[['shangdu','开平／上都',1263,1273,'primary','formal','high','上都在1263—1273年承担元初主要政治中心功能；1256年营建启动另见城市事件。'],['shangdu','上都夏都',1274,1364,'secondary','seasonal','high','1274—1364年作为元代夏都，与大都构成两都体系。'],['dadu','大都营建阶段',1267,1271,'primary','actual','high','1267年启动营建，1272年定名大都；早期政治中心与完整城市建成分开表达。'],['dadu','大都',1272,1368,'primary','formal','high','元代主要政治中心，今北京市元大都城址及其城市叠压空间。']], northern_yuan:[['beiyuan_core','蒙古汗廷',1368,1635,'mobile_court','uncertain','low','北元由元室北迁后的多个汗廷阶段构成，政治核心随部众迁徙；现代参照为蒙古高原中部区域，现记录不指向单一城址，没有单一固定都城。']], ming:[['yingtian','应天府',1368,1420],['beijing','北京',1421,1644],['yingtian','南京留都',1421,1644,'secondary','formal','high']], ming_southern:[['yingtian','南京',1644,1645,'primary','actual','medium','南明是明室南迁后多个政权阶段构成的合称；弘光政权以南京为阶段性实际中心，现代对应为今江苏省南京市，不能据此宣称南明全期单一首都。'],['fuzhou','福州',1645,1646,'temporary','actual','medium','南明隆武政权以福州为阶段性实际中心，现代对应为今福建省福州市；属于南明多个并立阶段之一，不能据此宣称全期固定首都。'],['guangzhou','广州',1646,1647,'temporary','actual','low','南明绍武政权以广州为短期阶段性中心，现代对应为今广东省广州市；时间短且政权并立，只能作为可靠现代地点对应的阶段中心，保留低置信度。'],['zhaoqing','肇庆',1646,1647,'temporary','actual','medium','南明永历政权初期以肇庆为阶段性实际中心，现代对应为今广东省肇庆市；与绍武政权同期并立，不能据此宣称南明全期固定首都。']], later_jin:[['heturnala','赫图阿拉',1616,1625],['shengjing','盛京',1626,1636]], qing:[['shengjing','盛京',1636,1644,'primary','formal','high'],['beijing','北京',1644,1912]],
  republic:[['beijing','北京',1912,1927],['yingtian','南京',1928,1937],['chongqing','重庆',1938,1945,'temporary','actual','high','战时陪都/中央驻地，不等同于永久迁都。'],['yingtian','南京',1946,1948,'primary','formal','medium','1946—1948年中央政治中心在南京；1949年内政府迁移另按年末阶段记录。'],['taipei','台北（年末中央政府所在地）',1949,1949,'de_facto','actual','high','台湾档案资料记载中央政府于1949年12月迁台；台北为年末城市级政府所在地参照。此点表示迁台后的年末中心，不代表1949年全年唯一中心或疆界。']], prc:[['beijing','北京',1949,2026,'primary','formal','high','中华人民共和国首都，北京。']],
  liang_later:[
    ['kaifeng','大梁／开封',907,908,'primary','formal','high','907年后梁建都大梁（汴州，改置开封府）；908年仍为主要都城。'],
    ['kaifeng','大梁东都',909,912,'secondary','formal','high','909年迁都洛阳后，大梁仍称东都并设留守，作为次级首都延续。'],
    ['luoyang','西都洛阳',909,912,'primary','formal','high','909年正月迁都洛阳，秋季皇帝还大梁；洛阳继续为主要朝廷中心至912年，年内转换另由909年事件记录。'],
    ['kaifeng','大梁／开封',913,923,'primary','formal','high','913年朱友贞在大梁即位，后梁主要中心回到大梁，延续至亡国。'],
  ],
  tang_later:[['luoyang','洛阳',923,936,'primary','formal','high','后唐以洛阳为正式都城，今洛阳市。']],
  jin_later:[['kaifeng','开封',936,947,'primary','formal','high','后晋以开封为正式都城，今开封市。']], han_later:[['kaifeng','开封',947,951,'primary','formal','high','后汉正式都城开封，今河南省开封市。']], zhou_later:[['kaifeng','开封',951,960,'primary','formal','high','后周以开封为正式都城，今河南省开封市。']], wu_zhou:[['luoyang','神都／洛阳',690,705,'primary','formal','high','武周以洛阳为正式都城，号称神都，今河南省洛阳市。']],
  wu_ten:[['yangzhou','扬州',902,937]], southern_tang:[['jiankang','金陵／建康',937,960,'primary','formal','high','南唐前期以金陵为正式政治中心，今南京市。'],['nanchang','豫章／洪州',961,961,'primary','actual','high','李璟末期迁居豫章，961年前后形成短时段政治中心；今南昌市。'],['jiankang','金陵／建康',961,975,'primary','actual','high','李煜即位后居建康，南唐末期政治中心回到今南京市。']], wuyue:[['hangzhou','杭州',907,978]], min:[['fuzhou','福州',909,942,'primary','formal','high','闽国前期政治中心。943年王延政以建州为殷国都，中心迁移；福州点不延伸代表闽末全境。'],['jianzhou','建州／殷都',943,945,'primary','actual','medium','CHGIS记943年王延政以建州为殷国都；建州治所区域点仅表示政治中心，不表示闽国边界。']], southern_han:[['guangzhou','兴王府／广州',917,971]], chu_ten:[['changsha','潭州／长沙',907,951]], former_shu:[['chengdu','成都',907,925,'primary','formal','high','前蜀建都成都。']], later_shu:[['chengdu','成都',934,965,'primary','formal','high','后蜀建都成都。']], jingnan:[['jiangling','江陵',924,963]], northern_han:[['taiyuan','太原',951,979,'primary','formal','high','北汉建都太原。']],
  wei_northern:[['shengle','盛乐',386,397,'primary','actual','medium','386年正月拓跋珪于牛川即代王位，随后迁居定襄之盛乐并改称魏王；盛乐为北魏平城阶段前的政治中心。386年点表示迁入盛乐后的阶段，不能代表牛川即位或全年所有活动。'],['pingcheng','平城',398,494,'primary','formal','high','398年七月迁都平城，正式营建宫室、宗庙与社稷；494年迁都洛阳。'],['luoyang','洛阳',495,534,'primary','formal','high','孝文帝迁都洛阳后的北魏正式都城阶段。']], qi_southern:[['jiankang','建康',479,502,'primary','formal','high','南齐建都建康。']], chen_southern:[['jiankang','建康',557,589,'primary','formal','high','南陈建都建康。']],
  jin_eastern:[['jiankang','建康',317,420,'primary','formal','high','东晋以建康为正式都城，今南京。']],
  liang_southern:[['jiankang','建康',502,551,'primary','formal','high','南梁前期正式都城；今南京。'],['jiangling','江陵',552,554,'primary','actual','medium','侯景之乱后梁元帝以江陵为实际政治中心；今荆州。'],['jiankang','建康',555,557,'primary','actual','medium','梁末政权在建康恢复实际政治中心，后为陈所代。']],
  wei_eastern:[['ye','邺',534,550,'primary','formal','high','东魏正式都城邺，今河北临漳一带。']], wei_western:[['changan','长安',535,557,'primary','formal','high','西魏正式都城长安，今陕西西安。']], qi_northern:[['ye','邺',550,577,'primary','formal','high','北齐正式都城邺，今河北临漳一带。']],
  han_eastern:[['luoyang','雒阳／洛阳',25,220,'primary','formal','high','东汉正式都城为雒阳，今河南省洛阳市；末期朝廷曾因战乱和权臣控制发生临时驻地变化，此处不将临时驻地误写为正式迁都。']],
  wei_three:[['luoyang','洛阳',220,265,'primary','formal','high','曹魏正式都城洛阳，今河南省洛阳市。']],
  shu_three:[['chengdu','成都',221,263,'primary','formal','high','蜀汉正式都城成都，今四川省成都市。']],
  wu_three:[
    ['wuchang','武昌（吴王政权中心）',221,229,'primary','actual','medium','221年孙权自公安徙都鄂并改名武昌；229年九月迁都建业。221年受魏封王与222年自立、229年称帝分开记录。武昌点使用今鄂州市城市级近似位置，不表示古城边界。'],
    ['jiankang','建业／建康',229,264,'primary','formal','high','229年孙权称帝后迁都建业，后改名建邺；今南京市，项目统一映射至建康地点。229年年内武昌迁都建业，年度图可显示迁出前后中心。'],
    ['wuchang','武昌（孙皓迁都）',265,265,'primary','actual','medium','265年冬孙皓由建业迁都武昌；年值采用迁都后的年末政治中心。点位为今鄂州市城市级近似位置，不表示全年都城或疆界。'],
    ['jiankang','建业／建康',266,280,'primary','formal','high','266年末孙皓还都建业，此后至吴亡以建业为主要都城；后改名建邺，项目统一映射至建康地点。'],
  ],
  song_southern:[['jiankang','建康',420,479,'primary','formal','high','刘宋正式都城建康，今江苏省南京市。']],
  zhou_northern:[['changan','长安',557,581,'primary','formal','high','北周正式都城长安，今陕西省西安市。']],
  han_western:[['luoyang','洛阳',-206,-202,'primary','formal','medium','汉初都洛阳阶段。'],['changan','长安',-200,9,'primary','formal','high','高帝七年迁都长安；前202年为汉初帝国秩序形成节点，不与正式迁都混同。']],
  sui:[['changan','长安',581,582],['daxing','大兴城',583,604,'primary','formal','high','583年迁都大兴城；地点记录为城区范围推算的低置信度区域参照，不指认宫城中心或城垣。'],['luoyang','东都洛阳',605,618,'primary','formal','high']],
  tang:[['changan','长安',618,907],['luoyang','东都洛阳',618,907,'secondary','formal','high']],
  former_zhao:[
    ['pingyang','平阳',309,318,'primary','formal','medium','《资治通鉴》卷八十七记永嘉三年（309）迁都平阳。304—307年与308年分别涉及左国城、蒲子，左国城遗址缺可复核点位，蒲子古址仍待核；不以平阳点回填早期年份。318年为政权交替年，次年迁都长安。'],
    ['changan','长安',319,329,'primary','formal','medium','《资治通鉴》及《晋书》记刘曜迁都长安在319年；不将318年镇长安或政变节点等同正式迁都。'],
  ], later_zhao:[['xiangguo','襄国',319,334],['ye','邺',335,351]], former_yan:[['longcheng','龙城',337,341],['ji','蓟',342,350,'de_facto','actual','medium'],['ye','邺',351,370]], later_yan:[['zhongshan_lunu','中山（卢奴）',385,396,'primary','actual','low','《资治通鉴》记385年末始定都中山；《晋书》记386年慕容垂于中山即帝位。今定州城区仅作低置信度区域参照，不表示中山城址边界。'],['longcheng','龙城',398,407,'primary','actual','medium','后燕后期退守龙城的政治中心阶段；今朝阳龙城遗址仅作区域参照，不表示城址边界或后燕全年直接控制范围。']],
  western_yan:[['changan','长安（西燕阶段中心）',385,385,'primary','actual','medium','385年慕容冲称帝并以长安为阶段性中心。本年仍有战争和控制变化；点位只表示城市级中心参照，不表示控制关中全域或全年疆界。'],['changzi_western_yan','长子（西燕阶段中心）',386,393,'primary','actual','low','《资治通鉴》记386年十月慕容永进据长子并即帝位；386年点代表年末阶段，387—393年代表延续的政治中心。CHGIS长子县点及地方志将旧城定位于今县城西南一带，具体城址仍有考证差异；点位不表示城垣、遗址界址或疆域。']],
};

const tenthBatchOverrides: Record<string, Seed[]> = {
  yuan: [
    ['shangdu', '开平／上都', 1271, 1273, 'primary', 'formal', 'high', '1271—1273年承担元初主要政治中心功能；上都1263年前后的前置阶段由城市事件和遗产记录。'],
    ['shangdu', '上都夏都', 1274, 1364, 'secondary', 'seasonal', 'high', '1274—1364年作为元代夏都，与大都构成两都体系。'],
    ['dadu', '大都', 1272, 1368, 'primary', 'formal', 'high', '元代主要政治中心，今北京市元大都城址及其城市叠压空间。'],
  ],
  turkic: [
    ['uhtuken','于都斤／鄂尔浑政治核心',552,630,'mobile_court','actual','low','第一突厥汗国阶段以于都斤／鄂尔浑作为汗廷与草原政治核心的区域参照，今蒙古国中部；汗廷随季节和军事活动移动，不是可唯一定位的固定城市首都。'],
    ['uhtuken','于都斤／鄂尔浑政治核心',682,743,'mobile_court','actual','low','后突厥复兴后至末期阶段以于都斤／鄂尔浑为政治核心区域参照，今蒙古国中部；汗廷、营地和部众网络具有移动性，不是可唯一定位的固定城市首都。744年为汗权终止与继承转换年，不以该点覆盖全年。'],
  ],
};

const sixteenthBatchOverrides: Record<string, Seed[]> = {
  mongol: [
    ['mongol_karakorum', '和林', 1206, 1234, 'de_facto', 'actual', 'medium', '第十六轮首都证据复核：蒙古汗国建立初期仍以移动汗廷和阶段性政治中心为主，不能把后来建成的和林城反推为1206年即已存在的固定正式都城。'],
    ['mongol_karakorum', '和林', 1235, 1260, 'primary', 'formal', 'high', '第十六轮首都证据复核：和林城建成并被确立为蒙古帝国都城的阶段，现代对应今蒙古国前杭爱省哈拉和林遗址；1260年后不以和林单独推断后续固定都城。'],
  ],
};

export const capitalHistory: CapitalTerm[] = polities.flatMap(polity => {
  const records = sixteenthBatchOverrides[polity.id] ?? tenthBatchOverrides[polity.id] ?? explicit[polity.id];
  if (records) return records.map(record => seed(polity.id, record));
  if (polity.capitalPlaceId) return [seed(polity.id, [polity.capitalPlaceId, '目录首都', polity.startYear, polity.endYear, 'primary', 'formal', 'medium', '沿用现有目录首都字段，待逐段补充迁都史。'])];
  return [seed(polity.id, ['changan', '未细分政治中心', polity.startYear, polity.endYear, 'disputed', 'uncertain', 'low', '目录暂缺固定首都资料，使用关中参照点仅为数据覆盖占位，需后续来源核验。'])];
});

export function activeCapitalRecords(year:number, polityId?:string) {
  return capitalHistory.filter(record => record.validFrom <= year && year <= record.validTo && (!polityId || record.polityId === polityId));
}
