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
  xiongnu:[['xiongnu_core','龙城／单于庭',-209,93,'mobile_court','uncertain','low','游牧联盟政治中心候选，不视作固定城市首都。']],
  goguryeo:[['wunvshan','纥升骨城',-37,2],['guonei','国内城',3,426],['pyongyang','平壤',427,668]],
  silla:[['jincheng_silla','金城／徐罗伐',-57,935,'primary','formal','high']], tuyuhun:[['tuyuhun_core','伏俟城',313,663,'disputed','uncertain','low','王都候选，遗址比定有争议。']],
  turkic:[['uhtuken','于都斤／鄂尔浑政治核心',552,744,'mobile_court','actual','low','移动汗廷政治核心，不是固定城市。']], tibetan_empire:[['yalong','雅砻',618,629,'de_facto','actual','medium'],['luosie','逻些',630,842]],
  nanzhao:[['taihe','太和城',738,778],['yangjumei','羊苴咩城',779,902]], khitan:[['liao_shangjing','上京临潢府',916,1125,'primary','formal','high'],['liao_dongjing','东京辽阳府',916,1125,'secondary','formal','high'],['liao_nanjing','南京析津府',916,1125,'secondary','formal','high'],['liao_zhongjing','中京大定府',1007,1125,'secondary','formal','high'],['liao_xijing','西京大同府',916,1125,'secondary','formal','high']],
  xia_early:[['erlitou','二里头',-2070,-1600,'disputed','uncertain','low','夏代都城与年代存在争议，此点是考古文化核心参照。']], shang:[['erlitou','早期都城候选',-1600,-1300,'disputed','uncertain','low','商代多次迁都，现阶段只作早期候选参照。']],
  zhou_western:[['changan','镐京／宗周',-1046,-771],['luoyang','洛邑／成周',-1046,-771,'secondary','formal','medium','东周前的东都/成周体系。']], qin_state:[['xianyang','咸阳',-350,-222],['changan','雍',-770,-351,'secondary','formal','medium','秦早期中心以雍为主，现用长安坐标作关中近似参照。']],
  gengshi:[['wanyang','宛',23,23,'primary','actual','high'],['luoyang','洛阳',24,24,'primary','actual','medium'],['changan','长安',25,25,'primary','actual','medium']],
  former_liang:[['guzang','姑臧',314,376]], western_qin:[['jincheng','金城',385,400,'primary','actual','medium'],['guzang','枹罕／河西中心',409,431,'de_facto','actual','low']], later_liang:[['guzang','姑臧',386,403]], southern_liang:[['xiping','西平',397,401],['ledu','乐都',402,414]], southern_yan:[['guanggu','广固',398,410]], western_liang:[['dunhuang','敦煌',400,405],['jiuquan','酒泉',406,421]], northern_yan:[['longcheng','龙城',407,436]],
  song_south:[['linan','临安',1127,1279,'de_facto','actual','high','南渡初期政治中心形成有过程，此记录表达实际中心而非立即完成形式迁都。']], western_xia:[['xingqing','兴庆府',1038,1227]], jin_jurchen:[['huining','会宁府',1115,1153],['jin_zhongdu','中都大兴府',1153,1214],['kaifeng','南京／开封',1214,1234]], western_liao:[['balasagun','八剌沙衮／虎思斡耳朵',1124,1218,'de_facto','actual','medium','宫帐与城址性质需区分。']], dali:[['yangjumei','羊苴咩城',937,1253]], mongol:[['mongol_karakorum','和林',1206,1271,'de_facto','actual','medium','早期移动汗廷，后期固定中心。']], yuan:[['shangdu','上都',1271,1368,'seasonal','formal','high','元两都制中的夏都。'],['dadu','大都',1271,1368,'primary','formal','high','元两都制中的主要政治中心。']], northern_yuan:[['beiyuan_core','蒙古汗廷',1368,1635,'mobile_court','uncertain','low','全期没有单一固定都城。']], ming:[['yingtian','应天府',1368,1420],['beijing','北京',1421,1644],['yingtian','南京留都',1421,1644,'secondary','formal','high']], ming_southern:[['yingtian','南京',1644,1645,'primary','actual','medium'],['fuzhou','福州',1645,1646,'temporary','actual','medium'],['guangzhou','广州',1646,1647,'temporary','actual','low']], later_jin:[['heturnala','赫图阿拉',1616,1625],['shengjing','盛京',1626,1636]], qing:[['shengjing','盛京',1636,1644,'primary','formal','high'],['beijing','北京',1644,1912]],
  republic:[['beijing','北京',1912,1927],['yingtian','南京',1928,1937],['chongqing','重庆',1938,1945,'temporary','actual','high','战时陪都/中央驻地，不等同于永久迁都。'],['yingtian','南京',1946,1949]], prc:[['beijing','北京',1949,2026]],
  wu_ten:[['yangzhou','扬州',902,937]], southern_tang:[['yingtian','金陵／江宁',937,975]], wuyue:[['hangzhou','杭州',907,978]], min:[['fuzhou','福州',909,945]], southern_han:[['guangzhou','兴王府／广州',917,971]], chu_ten:[['changsha','潭州／长沙',907,951]], jingnan:[['jiangling','江陵',924,963]], northern_han:[['taiyuan','太原',951,979]],
  wei_northern:[['pingcheng','平城',386,494],['luoyang','洛阳',495,534]],
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
