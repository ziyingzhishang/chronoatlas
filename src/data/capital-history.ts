import type { CapitalRole, CapitalStatus, CapitalTerm } from '../domain/types';
import { polities } from './polities';

type Seed =
  | [string, string, number, number]
  | [string, string, number, number, CapitalRole, CapitalStatus, ('high'|'medium'|'low')?, string?];
const sourceIds = ['capital-history-reference'];
const seed = (polityId:string, [placeId, _name, validFrom, validTo, role='primary', status='formal', confidence='medium', notes]:Seed): CapitalTerm => ({
  polityId, placeId, validFrom, validTo, role, status, confidence, sourceIds, notes,
});

const explicit: Record<string, Seed[]> = {
  han_warring:[['xinzheng','新郑',-403,-230]], zhao_warring:[['handan','邯郸',-403,-228]],
  wei_warring:[['anyi','安邑',-403,-344],['kaifeng','大梁',-343,-225]],
  chu_warring:[['ying','郢',-403,-279],['shouchun','寿春',-278,-223]], yan_warring:[['ji','蓟',-403,-222]], qi_warring:[['linzi','临淄',-403,-221]],
  qin:[['xianyang','咸阳',-221,-206,'primary','formal','high','秦统一后以咸阳为正式都城，今陕西省咸阳市。']],
  xin:[['changan','长安',9,23,'primary','formal','high','新朝以长安为正式都城，今陕西省西安市；不将洛阳等临时驻地误写为正式迁都。']], xiongnu:[['xiongnu_core','龙城／单于庭',-209,93,'mobile_court','uncertain','low','游牧联盟政治中心候选，不视作固定城市首都。']],
  goguryeo:[['wunvshan','纥升骨城',-37,2],['guonei','国内城',3,426],['pyongyang','平壤',427,668]],
  silla:[['jincheng_silla','金城／徐罗伐',-57,935,'primary','formal','high']], tuyuhun:[['tuyuhun_core','伏俟城',313,663,'disputed','uncertain','low','王都候选，遗址比定有争议。']],
  turkic:[['uhtuken','于都斤／鄂尔浑政治核心',552,744,'mobile_court','actual','low','移动汗廷政治核心，不是固定城市。']], tibetan_empire:[['yalong','雅砻',618,629,'de_facto','actual','medium'],['luosie','逻些',630,842]],
  nanzhao:[['taihe','太和城',738,778],['yangjumei','羊苴咩城',779,902]], khitan:[['liao_shangjing','上京临潢府',916,1125,'primary','formal','high'],['liao_dongjing','东京辽阳府',916,1125,'secondary','formal','high'],['liao_nanjing','南京析津府',916,1125,'secondary','formal','high'],['liao_zhongjing','中京大定府',1007,1125,'secondary','formal','high'],['liao_xijing','西京大同府',916,1125,'secondary','formal','high']],
  xia_early:[['erlitou','二里头',-2070,-1600,'disputed','uncertain','low','夏代都城与年代存在争议，此点是考古文化核心参照。']], shang:[['erlitou','早期都城候选',-1600,-1300,'disputed','uncertain','low','商代多次迁都，现阶段只作早期候选参照。']],
  zhou_western:[['changan','镐京／宗周',-1046,-771],['luoyang','洛邑／成周',-1046,-771,'secondary','formal','medium','东周前的东都/成周体系。']], zhou_eastern:[['luoyang','洛邑／洛阳',-770,-256,'primary','formal','high','东周王室以洛邑（洛阳）为都，今河南省洛阳市；春秋战国诸侯并立，不将王都等同于周王室实际控制范围。']], qin_state:[['xianyang','咸阳',-350,-222],['changan','雍',-770,-351,'secondary','formal','medium','秦早期中心以雍为主，现用长安坐标作关中近似参照。']],
  gengshi:[['wanyang','宛',23,23,'primary','actual','high'],['luoyang','洛阳',24,24,'primary','actual','medium'],['changan','长安',25,25,'primary','actual','medium']],
  jin_western:[['luoyang','洛阳',265,311,'primary','formal','high','西晋正式都城；311年洛阳失守后，晋廷迁至长安。'],['changan','长安',312,316,'primary','actual','high','晋愍帝在长安继续维持西晋政权，属后期实际政治中心。']],
  cheng_han:[['chengdu','成都',304,347,'primary','formal','high','成汉以成都为正式都城，今成都市。']],
  former_liang:[['guzang','姑臧',314,376]], western_qin:[['jincheng','金城',385,400,'primary','actual','medium','西秦前期以金城为实际政治中心，今甘肃省兰州市一带；政权阶段和中心性质依史料口径保留实际中心表述。'],['guzang','枹罕／河西中心',409,431,'de_facto','actual','low','西秦复国后政治中心在枹罕及河湟区域活动，现以姑臧／武威区域作参照，固定都城与具体城址仍不宜确定。']], later_liang:[['guzang','姑臧',386,403]], southern_liang:[['xiping','西平',397,401],['ledu','乐都',402,414]], southern_yan:[['guanggu','广固',398,410]], western_liang:[['dunhuang','敦煌',400,405],['jiuquan','酒泉',406,421]], northern_yan:[['longcheng','龙城',407,436]],
  former_qin:[['changan','长安',351,394,'primary','formal','high','前秦以长安为正式都城，今西安市。']],
  later_qin:[['changan','长安',384,417,'primary','formal','high','后秦以长安为正式都城，今西安市。']],
  xia:[['zhitong','统万城',413,431,'primary','formal','high','统万城建成后成为夏的正式都城；407—412年建政初期中心不据此向前推定。']],
  northern_liang:[['zhangye','张掖',397,400,'primary','formal','high','北凉早期以张掖为都，今张掖市。'],['guzang','姑臧',401,439,'primary','formal','high','北凉后期迁都姑臧，今武威市城区一带。']],
  song_northern:[['kaifeng','开封',960,1127,'primary','formal','high','北宋定都开封，作为现有来源字段支持的正式都城时段。']], song_south:[['linan','临安',1127,1279,'de_facto','actual','high','南渡初期政治中心形成有过程，此记录表达实际中心而非立即完成形式迁都。']], western_xia:[['xingqing','兴庆府',1038,1227,'primary','formal','high','西夏都城兴庆府，时段与政权目录范围一致。']], jin_jurchen:[['huining','会宁府',1115,1153],['jin_zhongdu','中都大兴府',1153,1214],['kaifeng','南京／开封',1214,1234]], western_liao:[['balasagun','八剌沙衮／虎思斡耳朵',1124,1218,'de_facto','actual','medium','宫帐与城址性质需区分。']], dali:[['yangjumei','羊苴咩城',937,1253]], mongol:[['mongol_karakorum','和林',1206,1271,'de_facto','actual','medium','早期移动汗廷，后期固定中心。']], yuan:[['shangdu','上都',1271,1368,'seasonal','formal','high','元两都制中的夏都。'],['dadu','大都',1271,1368,'primary','formal','high','元两都制中的主要政治中心。']], northern_yuan:[['beiyuan_core','蒙古汗廷',1368,1635,'mobile_court','uncertain','low','全期没有单一固定都城。']], ming:[['yingtian','应天府',1368,1420],['beijing','北京',1421,1644],['yingtian','南京留都',1421,1644,'secondary','formal','high']], ming_southern:[['yingtian','南京',1644,1645,'primary','actual','medium','南明弘光政权以南京为实际政治中心，今江苏省南京市；南明为多个政权阶段的合称，不据此宣称全期单一首都。'],['fuzhou','福州',1645,1646,'temporary','actual','medium','隆武政权以福州为阶段性实际中心，今福建省福州市；属于南明诸政权之一。'],['guangzhou','广州',1646,1647,'temporary','actual','low','绍武政权以广州为短期阶段性中心，今广东省广州市；时间短且政权并立，保留低置信度。']], later_jin:[['heturnala','赫图阿拉',1616,1625],['shengjing','盛京',1626,1636]], qing:[['shengjing','盛京',1636,1644,'primary','formal','high'],['beijing','北京',1644,1912]],
  republic:[['beijing','北京',1912,1927],['yingtian','南京',1928,1937],['chongqing','重庆',1938,1945,'temporary','actual','high','战时陪都/中央驻地，不等同于永久迁都。'],['yingtian','南京',1946,1949]], prc:[['beijing','北京',1949,2026,'primary','formal','high','中华人民共和国首都，北京。']],
  liang_later:[['kaifeng','开封',907,923,'primary','formal','high','后梁以开封为正式都城，今开封市。']],
  tang_later:[['luoyang','洛阳',923,936,'primary','formal','high','后唐以洛阳为正式都城，今洛阳市。']],
  jin_later:[['kaifeng','开封',936,947,'primary','formal','high','后晋以开封为正式都城，今开封市。']], han_later:[['kaifeng','开封',947,951,'primary','formal','high','后汉正式都城开封，今河南省开封市。']], zhou_later:[['kaifeng','开封',951,960,'primary','formal','high','后周以开封为正式都城，今河南省开封市。']], wu_zhou:[['luoyang','神都／洛阳',690,705,'primary','formal','high','武周以洛阳为正式都城，号称神都，今河南省洛阳市。']],
  wu_ten:[['yangzhou','扬州',902,937]], southern_tang:[['yingtian','金陵／江宁',937,975]], wuyue:[['hangzhou','杭州',907,978]], min:[['fuzhou','福州',909,945]], southern_han:[['guangzhou','兴王府／广州',917,971]], chu_ten:[['changsha','潭州／长沙',907,951]], former_shu:[['chengdu','成都',907,925,'primary','formal','high','前蜀建都成都。']], later_shu:[['chengdu','成都',934,965,'primary','formal','high','后蜀建都成都。']], jingnan:[['jiangling','江陵',924,963]], northern_han:[['taiyuan','太原',951,979,'primary','formal','high','北汉建都太原。']],
  wei_northern:[['pingcheng','平城',386,494],['luoyang','洛阳',495,534]], qi_southern:[['jiankang','建康',479,502,'primary','formal','high','南齐建都建康。']], chen_southern:[['jiankang','建康',557,589,'primary','formal','high','南陈建都建康。']],
  jin_eastern:[['jiankang','建康',317,420,'primary','formal','high','东晋以建康为正式都城，今南京。']],
  liang_southern:[['jiankang','建康',502,551,'primary','formal','high','南梁前期正式都城；今南京。'],['jiangling','江陵',552,554,'primary','actual','medium','侯景之乱后梁元帝以江陵为实际政治中心；今荆州。'],['jiankang','建康',555,557,'primary','actual','medium','梁末政权在建康恢复实际政治中心，后为陈所代。']],
  wei_eastern:[['ye','邺',534,550,'primary','formal','high','东魏正式都城邺，今河北临漳一带。']], wei_western:[['changan','长安',535,557,'primary','formal','high','西魏正式都城长安，今陕西西安。']], qi_northern:[['ye','邺',550,577,'primary','formal','high','北齐正式都城邺，今河北临漳一带。']],
  han_eastern:[['luoyang','雒阳／洛阳',25,220,'primary','formal','high','东汉正式都城为雒阳，今河南省洛阳市；末期朝廷曾因战乱和权臣控制发生临时驻地变化，此处不将临时驻地误写为正式迁都。']],
  wei_three:[['luoyang','洛阳',220,265,'primary','formal','high','曹魏正式都城洛阳，今河南省洛阳市。']],
  shu_three:[['chengdu','成都',221,263,'primary','formal','high','蜀汉正式都城成都，今四川省成都市。']],
  wu_three:[['jiankang','建业／建康',222,280,'primary','formal','high','孙吴正式都城建业，后改名建邺；今南京市，数据统一映射至建康地点。']],
  song_southern:[['jiankang','建康',420,479,'primary','formal','high','刘宋正式都城建康，今江苏省南京市。']],
  zhou_northern:[['changan','长安',557,581,'primary','formal','high','北周正式都城长安，今陕西省西安市。']],
  han_western:[['luoyang','洛阳',-206,-202,'primary','formal','medium','汉初都洛阳阶段。'],['changan','长安',-201,9]],
  sui:[['changan','大兴／长安',581,604],['luoyang','东都洛阳',605,618,'primary','formal','high']],
  tang:[['changan','长安',618,907],['luoyang','东都洛阳',618,907,'secondary','formal','high']],
  former_zhao:[['changan','长安',304,329]], later_zhao:[['xiangguo','襄国',319,334],['ye','邺',335,351]], former_yan:[['longcheng','龙城',337,341],['ji','蓟',342,350,'de_facto','actual','medium'],['ye','邺',351,370]], later_yan:[['ye','邺',384,397],['longcheng','龙城',398,407]],
};

export const capitalHistory: CapitalTerm[] = polities.flatMap(polity => {
  const records = explicit[polity.id];
  if (records) return records.map(record => seed(polity.id, record));
  if (polity.capitalPlaceId) return [seed(polity.id, [polity.capitalPlaceId, '目录首都', polity.startYear, polity.endYear, 'primary', 'formal', 'medium', '沿用现有目录首都字段，待逐段补充迁都史。'])];
  return [seed(polity.id, ['changan', '未细分政治中心', polity.startYear, polity.endYear, 'disputed', 'uncertain', 'low', '目录暂缺固定首都资料，使用关中参照点仅为数据覆盖占位，需后续来源核验。'])];
});

export function activeCapitalRecords(year:number, polityId?:string) {
  return capitalHistory.filter(record => record.validFrom <= year && year <= record.validTo && (!polityId || record.polityId === polityId));
}
