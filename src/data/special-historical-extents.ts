import type { BoundaryState } from '../domain/types';
import { places } from './places';

const erlitouCitation = {
  title: '国家发展改革委：二里头文化',
  urlOrCitation: 'https://www.ndrc.gov.cn/xwdt/ztzl/dyhgjwhgy/202209/t20220920_1335799_ext.html',
  pageOrRecord: '二里头遗址位于河南偃师二里头村附近',
};
const erlitouResearchCitation = {
  title: '洛阳市人民政府：二里头遗址考古',
  urlOrCitation: 'https://www.ly.gov.cn/2024/12-27/499371.html',
  pageOrRecord: '遗址中心区与夏代晚期都邑研究',
};
const gengshiWanCitation = {
  title: '湖北省文化和旅游厅：南阳宛城',
  urlOrCitation: 'https://wlt.hubei.gov.cn/bmdt/ztzl/zshb/201912/t20191226_1799409.shtml',
  pageOrRecord: '更始政权建都宛城、迁洛阳',
};
const gengshiChanganCitation = {
  title: '陕西地方志：更始帝迁都长安',
  urlOrCitation: 'https://dfz.shaanxi.gov.cn/zslm/fzzlk/xbsxsxz/xbsxz/xas_16198/201405/P020240923622533021818.pdf',
  pageOrRecord: '更始二年二月由洛阳迁都长安',
};
const gengshiYear25Citation = {
  title: '《资治通鉴》卷四十·汉纪三十二',
  urlOrCitation: 'https://zh.wikisource.org/zh-hans/資治通鑑/卷040',
  pageOrRecord: '建武元年：六月刘秀于鄗南即位；九月赤眉入长安、更始出走；十月刘秀入洛阳并定都。',
};
const qinUnificationCitation = {
  title: '《史记·秦始皇本纪》：秦初并天下、二十八年东行郡县',
  urlOrCitation: 'https://ctext.org/shiji/qin-shi-huang-ben-ji/zhs',
  pageOrRecord: '秦初并天下及始皇二十八年条；用于确认统一帝国与巡行郡县背景，不用于推定边界',
};
const qinCollapseCitations = [
  {
    title:'《史记·秦楚之际月表》',
    urlOrCitation:'https://ctext.org/shiji/qin-chu-zhi-ji-yue-biao/zhs',
    version:'中国哲学书电子化计划数字文本',
    pageOrRecord:'表内以汉元年十月记沛公先诸侯至霸上、秦王子婴降；并按楚汉纪年列出秦亡后诸侯分封。纪年与公历换算须与秦历、汉历口径并读。',
  },
  {
    title:'《史记·项羽本纪》',
    urlOrCitation:'https://ctext.org/shiji/xiang-yu-ben-ji/zhs',
    version:'中国哲学书电子化计划数字文本',
    pageOrRecord:'记沛公先入关、子婴降、项羽入咸阳及三分关中；可确认政权转移与年内连续变化，不能推导稳定疆界。',
  },
  {
    title:'《咸阳市秦都区志》·秦末年表',
    urlOrCitation:'https://dfz.shaanxi.gov.cn/zslm/fzzlk/xbsxsxz/xbsxz/xys_16200/201405/P020240923610537178923.pdf',
    version:'陕西地方志数字化文本',
    pageOrRecord:'第534—571行：分列前208年秦二世二年、前207年子婴元年刘邦入武关和子婴继位、前206年子婴迎降及项羽焚秦宫，随后列出三分关中及刘邦取咸阳。地方志纪年作为一套换算口径，与《史记》纪年并列记录。',
  },
  {
    title:'Brian Lander, “Making Use of the Land: The Political Ecology of China’s First Empire”',
    urlOrCitation:'https://doi.org/10.1017/jch.2022.19',
    version:'Journal of Chinese History, 2023',
    pageOrRecord:'正文及图1说明东部、南部新征区为约前230—前206年的累计征服范围，并指出秦对这些区域的控制较弱。作为秦末控制力的区域背景；不能证明前208、前207年仍由秦直接控制的具体县域，也不是逐年边界。',
  },
];
const xianyangPlaceCitation = {
  title: '山河年轮地点资料：咸阳',
  urlOrCitation: 'src/data/places.ts#xianyang',
  pageOrRecord: '秦都城地点记录；坐标为近似现代定位，不代表古城边界',
};
const hanKingCitation = {
  title: '《史记·项羽本纪》与《高祖本纪》：汉王受封巴蜀、汉中，都南郑',
  urlOrCitation: 'https://ctext.org/shiji/gao-zu-ben-ji/zhs',
  pageOrRecord: '项羽分封汉王及南郑为都；不作为巴蜀、汉中连续边界的几何依据',
};
const xiangYuRegimeCitation = {
  title: '《史记·项羽本纪》《高祖本纪》与《资治通鉴》卷九',
  urlOrCitation: 'https://ctext.org/shiji/xiang-yu-ben-ji/zhs；https://ctext.org/shiji/gao-zu-ben-ji/zhs；https://zh.wikisource.org/zh-hans/資治通鑑/卷009',
  pageOrRecord: '记项羽自立为西楚霸王、王梁楚九郡、都彭城，并记前205年汉军进据彭城及楚军反击；九郡具体范围有异说，不作为疆域几何依据',
};
const hanNanzhengLocationCitation = {
  title: '汉中博物馆：《汉中博物馆简介》',
  urlOrCitation: 'https://qinshuroads.org/docs/PDF/HZBWG_Intro_Preface_Baoxie_Road.pdf',
  pageOrRecord: '南郑故址与今汉中市汉台区位置关系；坐标为近似展示定位',
};
const hanLiyangCitation = {
  title: '《资治通鉴》卷九·汉纪一及陕西地方志：汉王还都栎阳',
  urlOrCitation: 'https://zh.wikisource.org/wiki/資治通鑑/卷009',
  pageOrRecord: '前205年汉王还都栎阳；栎阳城址以西安市文物局公布的阎良区遗址定位为参考',
};
const liyangLocationCitation = {
  title: '西安市文物局：西安市国家重点文物保护单位名录',
  urlOrCitation: 'https://wwj.xa.gov.cn/xxgk/wbxx/5fbb551ff8fd1c59664b3711.html',
  pageOrRecord: '栎阳城遗址位于西安市阎良区；点坐标取遗址范围近似中心',
};
const hanXingyangCitation = {
  title: '《资治通鉴》卷十·汉纪二与《史记·高祖本纪》：荥阳、成皋战事',
  urlOrCitation: 'https://zizhitongjian.5000yan.com/54295.html',
  pageOrRecord: '前204—前203年荥阳、成皋相持；前203年末洪沟约和、楚军东归及汉方追击决策；不能直接视为稳定国界',
};
const hanXinTransitionCitations = [
  {
    title:'《资治通鉴》卷三十六·汉纪二十八',
    urlOrCitation:'https://zh.wikisource.org/zh-hans/資治通鑑/卷036',
    pageOrRecord:'居摄元年（6）、居摄二年（7）、初始元年（8）；用于核对汉室名义延续、地方起兵和王莽摄政阶段，不推导疆界。',
  },
  {
    title:'《资治通鉴》卷三十七·汉纪二十九',
    urlOrCitation:'https://zh.wikisource.org/zh-hans/資治通鑑/卷037',
    pageOrRecord:'始建国元年（9）王莽即真、去汉号并立国号为新；用于核对年内政权更替，不推导疆界。',
  },
  {
    title:'《汉书》卷九十九中·王莽传',
    urlOrCitation:'https://zh.wikisource.org/zh-hans/漢書/卷099中',
    pageOrRecord:'始建国元年正月朔记王莽奉玺、去汉号并建新；用于确认9年政权转换，不将该年作为稳定全年疆界。',
  },
];
const easternHanFoundingCitations = [
  {
    title:'《后汉书》卷一上·光武帝纪',
    urlOrCitation:'https://zh.wikisource.org/zh-hans/後漢書/卷1',
    pageOrRecord:'建武元年六月己未于鄗南即位；冬十月癸丑入洛阳、幸南宫却非殿并定都。只支持年内转折和都城中心，不推导疆界。',
  },
  {
    title:'《资治通鉴》卷四十·汉纪三十二',
    urlOrCitation:'https://zh.wikisource.org/zh-hans/資治通鑑/卷040',
    pageOrRecord:'建武元年（25）及二年（26）；载赤眉等势力、洛阳被围与入洛定都等事件，支持年内转折，不提供稳定疆界。',
  },
  {
    title:'《资治通鉴》卷四十一·汉纪三十三',
    urlOrCitation:'https://zh.wikisource.org/zh-hans/資治通鑑/卷041',
    pageOrRecord:'建武三年（27）至五年（29）；记录赤眉、刘永、彭宠、张步等势力与汉军逐年战事，说明建武初年控制整合未完成，不提供稳定疆界。',
  },
  {
    title:'秦进才：《汉光武帝刘秀鄗南即位处文献述论》',
    urlOrCitation:'https://sszk.cbpt.cnki.net/portal/journal/portal/client/paper/9b2ee0856e595a5d46d1909cdd614393',
    version:'《石家庄学院学报》2016年第5期，35—48页，DOI 10.13573/j.cnki.sjzxyxb.2016.05.006',
    pageOrRecord:'结合文献与考古指出鄗南千秋亭在今河北柏乡县龙华乡十五里铺一带，并梳理历代地点说法差异。仅用于解释地点尚未映射成点，不取替代坐标。',
  },
];
const xingyangLocationCitation = {
  title: '郑州市文物局：荥阳故城',
  urlOrCitation: 'https://wwj.zhengzhou.gov.cn/country/3176154.jhtml',
  pageOrRecord: '公布荥阳故城位于今古荥镇并介绍汉代城址；点坐标取遗址区域近似中心，不代表前204—前203年控制边界',
};
const honggouCourseCitation = {
  title: '肖冉、何凡能、刘浩龙：《鸿沟引水口与渠首段经流考辩》',
  urlOrCitation: 'https://doi.org/10.11821/dlxb201704012',
  pageOrRecord: '《地理学报》2017年第72卷第4期，711—722页；梳理鸿沟渠首河道迁移及地望歧见，不将运河河道等同前203年控制线',
};
const weiFormationCitation = {
  title: '《资治通鉴》卷六十九·魏纪一、卷七十·魏纪二',
  urlOrCitation: 'https://zh.wikisource.org/wiki/資治通鑑/卷069',
  pageOrRecord: '220年曹丕受禅建魏及前223年魏纪；洛阳为魏都，不据都城推定疆域',
};
const wuFormationCitation = {
  title:'《资治通鉴》卷六十九·魏纪一：孙权徙都鄂、改名武昌',
  urlOrCitation:'https://zh.wikisource.org/zh-hans/資治通鑑/卷069',
  pageOrRecord:'黄初二年（221）条：孙权自公安徙都鄂，改鄂曰武昌；曹魏册封吴王与其江东军政中心并存，不据此推导疆界。',
};
const northernWeiFoundingCitation = {
  title:'《资治通鉴》卷一〇六·晋纪二十八与《魏书》卷二·太祖纪',
  urlOrCitation:'https://zh.wikisource.org/zh-hans/資治通鑑/卷106；https://zh.wikisource.org/zh-hans/魏書/卷2',
  pageOrRecord:'386年正月拓跋珪在牛川即代王位，二月迁居定襄盛乐，四月改称魏王；年内又迁往贺兰部并在十月返回牛川。398年迁都平城，区分牛川建政、盛乐阶段和后来的平城首都阶段。',
};
const weiJinTransitionCitation = {
  title:'《资治通鉴》卷七十九·晋纪一：魏晋禅代与吴迁都武昌',
  urlOrCitation:'https://zh.wikisource.org/zh-hans/資治通鑑/卷079',
  pageOrRecord:'景元六年（265）条：八月司马昭卒；冬吴徙都武昌；十二月魏帝禅位、晋受禅，曹奂先至金墉，后封陈留王于邺。用于确认年内政权交接及吴仍存续，不推导全年疆界。',
};
const wuchangLocationCitation = {
  title:'鄂州市人民政府：吴王城遗址',
  urlOrCitation:'https://www.ezhou.gov.cn/zjez/ezgk/lyzy/202107/t20210716_412276.html',
  pageOrRecord:'吴王城遗址位于今鄂州市鄂城区，是三国东吴都城遗址；城市级近似点仅表示武昌古城所在区域，不代表遗址边界或城垣中心。',
};
const shuFormationCitation = {
  title: '《资治通鉴》卷六十九·魏纪一',
  urlOrCitation: 'https://zh.wikisource.org/wiki/資治通鑑/卷069',
  pageOrRecord: '221年刘备在成都即帝位；卷内续载222年夷陵战事及223年先主去世',
};
const shuFallCitation = {
  title:'《资治通鉴》卷七十八·魏纪十：魏伐蜀及刘禅降',
  urlOrCitation:'https://zh.wikisource.org/zh-hans/資治通鑑/卷078',
  pageOrRecord:'景元四年（263）记魏军分路伐蜀，邓艾由阴平趋成都，刘禅降；姜维、钟会后续事件跨入264年。只支持年内战事、成都政治中心与政权终止判断，不提供全年边界。',
};
const chengHanFoundingCitations = [
  {
    title:'《晋书》卷四·惠帝纪',
    urlOrCitation:'https://zh.wikisource.org/zh-hans/晉書/卷004',
    pageOrRecord:'太安二年（304）十一月李雄攻成都、罗尚弃城；同卷永兴元年（304）冬李雄称成都王；永兴二年（305）六月称帝、国号蜀，八月遣李骧攻汉安。纪年按史书年号换算；不据其“尽有成都之地”等概括语推导边界。',
  },
  {
    title:'《晋书》卷一二一·李雄载记',
    urlOrCitation:'https://zh.wikisource.org/zh-hans/晉書/卷121',
    pageOrRecord:'记李雄都郫、攻克成都及称成都王；并记军队饥馑、蜀人流散等建政背景。支撑成都政治中心及政权草创判断，不提供304—305年可直接绘制的疆域线。',
  },
];
const chengHanFallCitation = {
  title:'《晋书》卷九十八·桓温传与卷一二一·李势载记',
  urlOrCitation:'https://zh.wikisource.org/zh-hans/晉書/卷121',
  pageOrRecord:'永和三年（347）春桓温攻取成都、李势降；桓温留成都三十日后还江陵。四月丁巳邓定、隗文等入据成都。用于标示年内战事与控制转折，不推导东晋四月仍据成都或全年疆界。',
};
const formerQinFoundingCitations = [
  {
    title:'《资治通鉴》卷九十八、九十九·晋纪二十至二十一',
    urlOrCitation:'https://zh.wikisource.org/zh-hans/資治通鑑/卷098；https://zh.wikisource.org/zh-hans/資治通鑑/卷099',
    pageOrRecord:'卷九十八永和六年（350）十月记苻健至长安、杜洪与张琚出奔，十一月苻健入城；卷九十九记351年称天王、改元及五丈原战事，352年即皇帝位。分别记录入城、称王和称帝，不用后期最大疆域回填。',
  },
  {
    title:'《晋书》卷一一二·苻健载记',
    urlOrCitation:'https://zh.wikisource.org/zh-hans/晉書/卷112',
    pageOrRecord:'记苻健入长安定都，随后明确标出永和七年（351）称天王、改元、置官，永和八年（352）即皇帝位。交叉核对《资治通鉴》卷九十八所记350年十月、十一月事件；称号变化不表示疆域变化。',
  },
];
const laterZhaoAnnualCitations = [
  {
    title:'《资治通鉴》卷九十一至九十五·晋纪十三至十七',
    urlOrCitation:'https://zh.wikisource.org/zh-hans/資治通鑑/卷091',
    pageOrRecord:'逐年核对319—336年：卷九十一（319—321）、卷九十二（322—323）、卷九十三（324—327）、卷九十四（328—331）、卷九十五（332—337）。用于建政、与前赵战争、石勒/石弘/石虎交替、邺与襄国中心转换及建武二年工程背景；不据分散战事推导每年的完整疆界。',
  },
  {
    title:'《晋书》卷一〇四至一〇六·石勒、石弘、石虎载记',
    urlOrCitation:'https://zh.wikisource.org/zh-hans/晉書/卷104',
    pageOrRecord:'补核后赵建政、政权继承与石虎建武元年迁都邺等传记信息；不替代编年资料的年份核对，也不提供逐年边界几何。',
  },
];
const laterYanQinFoundingCitations = [
  {
    title:'《资治通鉴》卷一百五至一百六·晋纪二十七至二十八',
    urlOrCitation:'https://zh.wikisource.org/zh-hans/資治通鑑/卷105',
    pageOrRecord:'逐年核对384—386年：慕容垂在荥阳称燕王；385年燕军围邺未下、四月撤围，年末北至中山并始定都，386年在中山称帝；姚苌在渭北马牧起兵称万年秦王，386年取得长安后称帝并于年内出兵安定。战线和实际控制随年内战事变化，不据中心点推导边界。',
  },
  {
    title:'《晋书》卷一一一·慕容垂载记与卷一一六·姚苌载记',
    urlOrCitation:'https://zh.wikisource.org/zh-hans/晉書/卷111；https://zh.wikisource.org/zh-hans/晉書/卷116',
    pageOrRecord:'补核慕容垂复燕、姚苌早期称号及长安阶段；各版本纪年与都城用语需与《资治通鉴》编年条互校，不将后续阶段倒推至384年。',
  },
];
const laterQinTerminationCitation = {
  title:'《资治通鉴》卷一一八·晋纪四十与《晋书》卷一一九·姚泓载记',
  urlOrCitation:'https://zh.wikisource.org/zh-hans/資治通鑑/卷118；https://zh.wikisource.org/zh-hans/晉書/卷119',
  pageOrRecord:'417年刘裕北伐军入关、攻取长安，姚泓出降及后秦终止；区分当年先后军事占领、君主降附和政权终止，不据此推导东晋对关中全年稳定控制。',
};
const luoyangPlaceCitation = {
  title: '山河年轮地点资料：洛阳',
  urlOrCitation: 'src/data/places.ts#luoyang',
  pageOrRecord: '魏都洛阳地点坐标；按现代洛阳市近似定位，不表示古城边界',
};
const chengduPlaceCitation = {
  title: '山河年轮地点资料：成都',
  urlOrCitation: 'src/data/places.ts#chengdu',
  pageOrRecord: '蜀汉都城成都地点坐标；按现代成都市近似定位，不表示古城边界',
};
const suiFoundingCitation = {
  title: '《资治通鉴》卷一七五·陈纪九：隋受禅及陈仍存',
  urlOrCitation: 'https://zh.wikisource.org/wiki/資治通鑑/卷175',
  version: '胡三省音注本（维基文库数字文本）',
  pageOrRecord: '太建十三年（581）二月，隋受禅、遣代太子镇洛阳；条内另载陈朝政事，证明陈仍存。用于政治中心和政权并存判断，不推定疆界。',
};
const suiCapitalCitation = {
  title: '西安市地方志办公室：隋大兴城、唐长安城遗址',
  urlOrCitation: 'https://xadfz.xa.gov.cn/xadq/rwxa/1960625284585664514.html',
  pageOrRecord: '开皇二年（582）营建新都大兴城，开皇三年（583）迁都；遗址格局与范围来自考古勘探。本文仅用以确定都城阶段和近似城市中心，不复制城垣边界。',
};
const suiTangChanganGisCitation = {
  title: 'Analysis of the Characteristics and Ideas of Ancient Urban Land-Use Based on GIS and an Algorithm: A Case Study of Chang’an City in the Sui and Tang Dynasties',
  urlOrCitation: 'https://doi.org/10.3390/rs15122962',
  version: 'Remote Sensing 15(12), 2962 (2023)',
  pageOrRecord: '报告隋唐长安城区范围约108.88–108.99°E、34.19–34.31°N；本项目只用范围边界框中点作大兴城低置信度区域参照，不用作宫城中心或城垣边界。',
};
const changanCenterCitation = {
  title: '山河年轮地点资料：长安',
  urlOrCitation: 'src/data/places.ts#changan',
  pageOrRecord: '长安／大兴都城中心近似定位；不是隋大兴城或汉长安城的城墙范围。',
};
const tangEarlyChronicleCitations = [
  {title:'《资治通鉴》卷一八五·唐纪一',urlOrCitation:'https://zh.wikisource.org/wiki/資治通鑑/卷185',version:'胡三省音注本（维基文库数字文本）',pageOrRecord:'武德元年（618）正月至七月；李渊受禅、长安建唐及地方势力并存。'},
  {title:'《资治通鉴》卷一八六·唐纪二',urlOrCitation:'https://zh.wikisource.org/wiki/資治通鑑/卷186',version:'胡三省音注本（维基文库数字文本）',pageOrRecord:'武德元年（618）八月至十二月；载薛仁杲、李轨、王世充等势力及唐军进取。'},
  {title:'《资治通鉴》卷一八七·唐纪三',urlOrCitation:'https://zh.wikisource.org/wiki/資治通鑑/卷187',version:'胡三省音注本（维基文库数字文本）',pageOrRecord:'武德二年（619）相关条目；唐廷仍处于并立政权与军事整合阶段。'},
  {title:'《资治通鉴》卷一八八·唐纪四',urlOrCitation:'https://zh.wikisource.org/wiki/資治通鑑/卷188',version:'胡三省音注本（维基文库数字文本）',pageOrRecord:'武德二年（619）至武德四年（621）二月；记刘武周、宋金刚、王世充、窦建德及唐军战事。'},
  {title:'《资治通鉴》卷一八九·唐纪五',urlOrCitation:'https://zh.wikisource.org/wiki/資治通鑑/卷189',version:'胡三省音注本（维基文库数字文本）',pageOrRecord:'武德四年（621）三月至十二月；记唐与窦建德、王世充等军事冲突及河北、河南等地归附变化。'},
  {title:'《资治通鉴》卷一九〇·唐纪六',urlOrCitation:'https://zh.wikisource.org/wiki/資治通鑑/卷190',version:'胡三省音注本（维基文库数字文本）',pageOrRecord:'武德五年（622）；卷首记刘黑闼称汉东王、定都洺州及唐军交战，显示唐的统一战争仍在继续。'},
];
const laterLiangChronicleCitations = [
  {title:'《资治通鉴》卷二六六·后梁纪一',urlOrCitation:'https://zh.wikisource.org/wiki/資治通鑑/卷266',version:'胡三省音注本（维基文库数字文本）',pageOrRecord:'开平元年（907）建梁；卷内开平二年（908）条继续记大梁及周边政权互动。'},
  {title:'《资治通鉴》卷二六七·后梁纪二',urlOrCitation:'https://zh.wikisource.org/wiki/資治通鑑/卷267',version:'胡三省音注本（维基文库数字文本）',pageOrRecord:'开平三年（909）正月迁太庙于洛阳，梁帝由大梁赴洛阳；开平四年（910）年内继续以洛阳为主要朝廷中心，并有河北晋梁战争。'},
];
const kaifengEarlyLaterLiangCitation = {
  title:'开封党史方志网：五代开封都城沿革',
  urlOrCitation:'https://www.kfdsw.com/index/detail/id/2483.html',
  pageOrRecord:'记载后梁开平元年（907）以汴州为都、升为开封府、号东都；地点仅以项目既有现代坐标作近似中心。',
};
const luoyangLaterLiangCitation = {
  title:'洛阳市文化广电和旅游局：洛阳都城历史沿革',
  urlOrCitation:'https://oss.ly.gov.cn/lyswhgdhlyj/upload/20240723/297ed34a90d832350190dd810af40005.pdf',
  pageOrRecord:'汇总后梁东都洛阳阶段为909—913年；本轮结合《资治通鉴》核迁入年份与913年复归大梁。地点使用既有现代洛阳近似坐标，不代表洛阳城垣。',
};
const northernSongFoundingCitation = {
  title:'《宋史》卷一·太祖本纪',
  urlOrCitation:'https://zh.wikisource.org/zh-hans/宋史/卷001',
  version:'元脱脱等修，维基文库数字文本',
  pageOrRecord:'显德七年（960）陈桥驿兵变、回师入开封及周恭帝禅位后即皇帝位。用于确认建政节点与开封政治中心，不据此推定连续疆界。',
};
const northernSongFoundingContextCitation = {
  title:'李焘《续资治通鉴长编》卷一·建隆元年',
  urlOrCitation:'https://skqs.dazhishi.com/show_grdoxpvvya.html',
  version:'四库全书文本',
  pageOrRecord:'建隆元年（960）各月记录宋初与南唐、南汉、吴越、北汉、辽等政权的往来及军事行动，说明政权整合尚未完成。',
};
const southernSongCourtRouteCitations = [
  {
    title:'高桥弘臣：《南宋上供米输送问题》',
    urlOrCitation:'https://cssn.cn/lsx/lsx_zgs/202210/t20221024_5552487.shtml',
    version:'《国际社会科学杂志》2020年第3期，作者现任爱媛大学法文学部教授；中国社会科学网转载',
    pageOrRecord:'文中梳理高宗1127年应天即位、十月移居扬州；1129年二月至1130年四月间的杭州、建康、越州、明州、温州、台州、绍兴路线；1132年正月移居临安；1134—1135年赴平江、1136—1138年赴建康及1138年二月后驻临安。',
  },
  {
    title:'《复旦学报（社会科学版）》：南宋三省与临安的城市空间',
    urlOrCitation:'https://iahs.fudan.edu.cn/__local/A/E4/F8/57D6CD810A054A64071BCD61A78_66F81439_CDFAA.pdf',
    version:'复旦大学历史地理研究资料，PDF版',
    pageOrRecord:'第58—60页记载绍兴八年（1138）二月长驻临安前的阶段性驻跸：1129年二月至四月、绍兴二年至四年十月、绍兴五年至六年九月；绍兴元年十一月筹备移跸临安及1132年正月抵达。',
  },
];

const southernSongAnnualCenters: Array<[number, number[][], string]> = [
  [1127, [[115.65,34.45],[119.42,32.39]], '五月应天即位，十月迁居扬州；点位表示同年先后两个政治中心，不表示同时驻跸。'],
  [1128, [[119.42,32.39]], '扬州为阶段性驻跸中心。'],
  [1129, [[119.42,32.39],[120.16,30.25],[118.80,32.06],[120.58,30.00],[121.55,29.87],[120.70,28.00],[121.42,28.66]], '金军追击期间的迁徙路线节点：由扬州南下，经杭州、建康、越州、明州、温州、台州；忽略海上航段，不连线、不推定沿途实控。'],
  [1130, [[120.58,30.00]], '1130年四月前后迁徙抵达绍兴（越州）后暂居。'],
  [1131, [[120.58,30.00],[120.16,30.25]], '年内先驻绍兴；十一月诏令筹备移跸临安，故并列两个先后中心。'],
  [1132, [[120.58,30.00],[120.16,30.25]], '绍兴二年正月由绍兴移居临安；两点表示年内先后驻跸，不表示同时驻留。'],
  [1133, [[120.16,30.25]], '临安为稳定驻跸中心。'],
  [1134, [[120.16,30.25],[120.58,31.30]], '为应对金、齐军事压力，高宗于九月赴平江府（今苏州）；与临安为年内先后驻跸。'],
  [1135, [[120.16,30.25],[120.58,31.30]], '续接平江府驻跸至绍兴五年二月，年内返回临安；点位不表示同时驻跸。'],
  [1136, [[120.16,30.25],[118.80,32.06]], '绍兴六年九月移跸建康以筹划北伐；年内先后中心。'],
  [1137, [[118.80,32.06]], '建康阶段驻跸，服务对金北伐；不代表其控制边界。'],
  [1138, [[118.80,32.06],[120.16,30.25]], '绍兴八年二月由建康返回临安并长驻；临安中心的制度定位与1127年建政分开。'],
];

const southernSongCenterExtent = ([year, centers, note]: [number, number[][], string]): BoundaryState => {
  const geometry: GeoJSON.Geometry = centers.length === 1
    ? {type:'Point',coordinates:centers[0]}
    : {type:'MultiPoint',coordinates:centers};
  return {
    id:`special-southern-song-${year}-court-centers`, polityId:'song_south', validFrom:year, validTo:year,
    snapshotYear:year, temporalKind:'interval', presentation:'reference', sourceName:`南宋${year}年朝廷政治中心参照`,
    sourceUrl:southernSongCourtRouteCitations[0].urlOrCitation, vertexCount:centers.length, geometry,
    controlType:'direct', confidence:'low', sourceIds:['southern-song-court-route-study','southern-song-linan-academic-study','modern-geography-reference'], mapRepresentation:'control-centers',
    notes:`仅展示史料支持的朝廷驻跸中心或路线节点；点位按现代城市中心近似定位，不代表古城范围。${note}`,
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',citations:[...southernSongCourtRouteCitations,
      {title:'山河年轮地点资料：现代城市中心近似定位',urlOrCitation:'src/data/places.ts及公开地名定位参考',pageOrRecord:'本记录为控制中心示意点，坐标近似；不代表古城遗址、辖区或地图边界。'}],
      uncertaintyNote:'编年与研究资料支持所列朝廷停驻阶段，但不能据此推出宋军直接控制范围或全年疆界。多点只列本年度有来源的中心，不连接迁徙路径；海上航段不落点。'},
  };
};

const mingNorthernYuanCitations = [
  {
    title:'《明太祖实录》卷三十四等：洪武元年建号、金陵为南京',
    urlOrCitation:'https://zh.wikisource.org/zh-hans/明實錄/太祖高皇帝實錄/卷034',
    version:'维基文库数字文本',
    pageOrRecord:'洪武元年正月朱元璋即皇帝位、国号大明；八月诏以金陵为南京。用于明建政与首都判断，不表示疆界。',
  },
  {
    title:'《元史》卷四十七·顺帝纪：北撤、应昌与元昭宗北走',
    urlOrCitation:'https://zh.wikisource.org/zh-hans/元史_%28四庫全書本%29/卷047',
    version:'四库全书本数字文本',
    pageOrRecord:'至正二十八年元廷离大都北行；至正二十九年明军取上都后顺帝驻应昌；至正三十年应昌陷落、皇太子北走。用于北迁中心阶段，不推定领土轮廓。',
  },
  {
    title:'周松：《军卫建置与明洪武朝的西北经略》',
    urlOrCitation:'https://www.cssn.cn/jsx/jsx_zgzx/202208/t20220803_5450945.shtml',
    version:'《中国边疆史地研究》2018年第2期；中国社会科学网转载',
    pageOrRecord:'讨论洪武五年河西之役与明初西北军卫建置，指出“全面控制”等结论仍需结合旋立旋废的羁縻卫所、军政重心变化辨析。用于拒绝以晚期疆域回填1368—1374年。',
  },
  {
    title:'Mapping Karakorum, the capital of the Mongol Empire',
    urlOrCitation:'https://doi.org/10.15184/aqy.2021.153',
    version:'Antiquity 96 (2022)',
    pageOrRecord:'研究指出元朝覆亡后和林仍作为元室流亡成员驻地并保持数十年重要性；只支持北元汗廷政治中心参照，不等于汗廷全年固定驻留或其控制边界。',
  },
];

const mingNorthernYuanAnnualCenters: Array<[number, 'ming' | 'northern_yuan', number[][], string]> = [
  [1368, 'ming', [[118.80,32.06]], '洪武元年在应天即位并建号大明；南京点只表示中央政治中心。北伐与夺取大都发生于年内，不能据后续势力范围倒推全年疆界。'],
  [1369, 'ming', [[118.80,32.06]], '洪武二年继续经营北方新占地区与西北战事；应天仍为首都。北方军镇初设和战事进退不支持把后世政区画成连续控制线。'],
  [1370, 'ming', [[118.80,32.06]], '洪武三年继续北征并攻取应昌；应天为中央政治中心。军事占领点不等于全年疆界。'],
  [1371, 'ming', [[118.80,32.06]], '洪武四年中央仍在应天；西南政权战事与北方蒙古部众活动并存，本点不表达控制强度或边界。'],
  [1372, 'ming', [[118.80,32.06]], '洪武五年明军深入漠北受挫；西北经略及羁縻军卫亦处在变动中，边境和名义声索不等于直接控制。'],
  [1373, 'ming', [[118.80,32.06]], '洪武六年应天仍为中央政治中心；辽东、蒙古及西北方向的军政关系尚未形成可据以绘制的稳定年度边界。'],
  [1374, 'ming', [[118.80,32.06]], '洪武七年应天仍为中央政治中心；北疆防务与归附关系继续变化，留空疆界面。'],
  [1368, 'northern_yuan', [[116.18,42.36]], '元廷离开大都后向北迁；上都为该年可确认的北迁政治中心参照。此点不表示北元全境。'],
  [1369, 'northern_yuan', [[116.18,42.36],[116.79,43.24]], '年内明军攻取上都后，元顺帝转驻应昌；两点表示先后中心，不是同时控制区或迁徙通道。'],
  [1370, 'northern_yuan', [[116.79,43.24],[102.83,47.20]], '应昌陷落后，元昭宗率少数随从北走和林；两点表示先后中心，不能解释为全年领土或同等控制。'],
  [1371, 'northern_yuan', [[102.83,47.20]], '元室北迁后和林仍是汗廷重要政治中心；不据汗廷位置推定草原部众边界。'],
  [1372, 'northern_yuan', [[102.83,47.20]], '明军三路北征与北元军在漠北交战；和林只作政治中心参照，交战范围不作疆界。'],
  [1373, 'northern_yuan', [[102.83,47.20]], '和林仍为元室流亡朝廷的政治中心参照；汗廷移动及部众关系不支持绘制固定年度边界。'],
  [1374, 'northern_yuan', [[102.83,47.20]], '现有可核史料不足以复原北元逐年直接控制范围；以和林作为阶段性政治中心参照，疆界明确留空。'],
];

const mingNorthernYuanCenterExtent = ([year, polityId, centers, note]: [number, 'ming' | 'northern_yuan', number[][], string]): BoundaryState => {
  const geometry: GeoJSON.Geometry = centers.length === 1
    ? {type:'Point',coordinates:centers[0]}
    : {type:'MultiPoint',coordinates:centers};
  const polityName = polityId === 'ming' ? '明' : '北元';
  return {
    id:`special-${polityId}-early-foundation-${year}-center`, polityId, validFrom:year, validTo:year,
    snapshotYear:year, temporalKind:'interval', presentation:'reference', sourceName:`${polityName}${year}年政治中心参照`,
    sourceUrl:mingNorthernYuanCitations[0].urlOrCitation, vertexCount:centers.length, geometry,
    controlType:'direct', confidence:'low', sourceIds:['ming-yuan-northern-frontier-1368-1374','modern-geography-reference'], mapRepresentation:'control-centers',
    notes:`仅显示史料支持的阶段性政治中心；多个点按年内先后排列，不连线、不构成范围。${note}`,
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',citations:[...mingNorthernYuanCitations,
      {title:'山河年轮地点资料：现代城市或遗址中心近似定位',urlOrCitation:'src/data/places.ts#yingtian、#shangdu、#yingchang_yuan、#mongol_karakorum',pageOrRecord:'点位用于政治中心参照；现代南京城市中心、上都遗址、应昌故城和哈拉和林遗址坐标不表示城墙、辖区或疆界。'}],
      uncertaintyNote:'《明太祖实录》《元史》及现代研究支持建政、北迁、攻取驻地和汗廷区域中心等结论，但不足以提供1368—1374年逐年连续直接控制边界。明方卫所、羁縻关系、军队活动范围、北元汗廷位置均不得自动合并成国界。'},
  };
};

export const specialHistoricalExtents: BoundaryState[] = [
  ...Array.from({length: 7}, (_, index): BoundaryState => {
    const year = 400 + index;
    const placeId = year < 405 ? 'dunhuang' : 'jiuquan';
    const place = places.find(item => item.id === placeId)!;
    const primarySourceId = year === 400 ? 'zizhi-tongjian-vol111-western-liang'
      : year === 401 ? 'zizhi-tongjian-vol112-western-liang' : 'jinshu-vol87-li-hao';
    return {
      id:`special-western-liang-${year}-center`, polityId:'western_liang', validFrom:year, validTo:year,
      snapshotYear:year, temporalKind:'interval', presentation:'reference', sourceName:`西凉${year}年政治中心参照`,
      sourceUrl:year === 401
        ? 'https://zh.wikisource.org/zh-hans/資治通鑑/卷112'
        : year === 400 ? 'https://zh.wikisource.org/zh-hans/資治通鑑/卷111'
          : 'https://zh.wikisource.org/zh-hans/晉書/卷087', vertexCount:1,
      geometry:{type:'Point',coordinates:[place.longitude, place.latitude]}, controlType:'direct', confidence:'low',
      sourceIds:[primarySourceId, 'modern-geography-reference'], mapRepresentation:'control-centers',
      notes:`${year}年西凉政治中心的城市级参照为${place.historicalName}。只显示中心点，不表示城垣、年度直接控制范围或疆域边界。`,
      evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',
        citations:[
          {title:year === 401 ? '《资治通鉴》卷112·酒泉、凉宁转归西凉' : year === 400 ? '《资治通鉴》卷111·西凉形成' : '《晋书》卷87·凉武昭王李暠传',
            urlOrCitation:year === 401
              ? 'https://zh.wikisource.org/zh-hans/資治通鑑/卷112'
              : year === 400
                ? 'https://zh.wikisource.org/zh-hans/資治通鑑/卷111'
                : 'https://zh.wikisource.org/zh-hans/晉書/卷087',
            pageOrRecord:year === 400
              ? '隆安四年唐瑶移檄六郡推李暠为凉公；敦煌为早期政治中心。'
              : year === 401
                ? '记酒泉、凉宁二郡从北凉转归西凉；记载的是行政归属变化，不提供连续边界。'
                : year === 405
                  ? '义熙元年记李暠由敦煌迁居酒泉。'
                  : `${year}年使用《晋书》所载迁治前后中心时段；该记载不提供本年度连续疆界。`},
          {title:`山河年轮地点资料：${place.historicalName}`,urlOrCitation:`src/data/places.ts#${placeId}`,
            pageOrRecord:'现代城市中心坐标仅作地点参照，不等同于古城范围或政权控制边界。'},
        ],
        uncertaintyNote:'史料足以支持政治中心的阶段定位，但没有逐年连续直接控制边界的空间依据；不生成疆域面，也不将军事实控、名义声索或邻年范围转换为确定疆界。'},
    };
  }),
  ...Array.from({length: 10}, (_, index): BoundaryState => {
    const year = 410 + index;
    const place = places.find(item => item.id === 'jiuquan')!;
    return {
      id:`special-western-liang-${year}-center`, polityId:'western_liang', validFrom:year, validTo:year,
      snapshotYear:year, temporalKind:'interval', presentation:'reference', sourceName:`西凉${year}年酒泉中心参照`,
      sourceUrl:'https://zh.wikisource.org/zh-hans/晉書/卷087', vertexCount:1,
      geometry:{type:'Point',coordinates:[place.longitude, place.latitude]}, controlType:'direct', confidence:'low',
      sourceIds:['jinshu-vol87-li-hao','modern-geography-reference'], mapRepresentation:'control-centers',
      notes:`${year}年西凉以酒泉为政治中枢的城市级参照。李暠、李歆时期的北凉战争和局部军事实控不等于完整直接控制范围；此点不表示城垣或疆界。`,
      evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',
        citations:[
          {title:'《晋书》卷87·凉武昭王李暠传、凉后主李歆传',urlOrCitation:'https://zh.wikisource.org/zh-hans/晉書/卷087',
            pageOrRecord:year === 417 ? '记李暠卒、李歆承统改元；酒泉宫及西凉中枢延续。'
              : year < 417 ? '记李暠迁居酒泉后时期、酒泉经营及北凉战争；只能确认政治中心阶段，不提供年度疆界。'
                : '记李歆继位后及其出征、酒泉失守过程；本年点只作城市级政治中心参照。'},
          {title:'山河年轮地点资料：酒泉',urlOrCitation:'src/data/places.ts#jiuquan',
            pageOrRecord:'现代城市中心坐标，仅用于位置参照，不表示古城城垣或控制范围。'},
        ],
        uncertaintyNote:'本点表示可确认的政治中枢，不编码北凉与西凉之间的军事实控、名义关系或逐年边界。420年不沿用本点，因为该年酒泉失守且李恂另据敦煌。'},
    };
  }),
  (() : BoundaryState => {
    const place = places.find(item => item.id === 'dunhuang')!;
    return {
      id:'special-western-liang-421-terminal-center', polityId:'western_liang', validFrom:421, validTo:421,
      snapshotYear:421, temporalKind:'interval', presentation:'reference', sourceName:'西凉421年敦煌终局中心参照',
      sourceUrl:'https://zh.wikisource.org/zh-hans/資治通鑑/卷119', vertexCount:1,
      geometry:{type:'Point',coordinates:[place.longitude, place.latitude]}, controlType:'direct', confidence:'low',
      sourceIds:['zizhi-tongjian-vol119-western-liang','modern-geography-reference'], mapRepresentation:'control-centers',
      notes:'421年李恂政权终止前敦煌城市级终局中心参照。北凉围城、水灌敦煌及城陷表明年内权力转换；此点不表示全年独立控制或完整西凉疆域。',
      evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',
        citations:[
          {title:'《资治通鉴》卷119·北凉攻敦煌',urlOrCitation:'https://zh.wikisource.org/zh-hans/資治通鑑/卷119',
            pageOrRecord:'记李恂于420年冬返回敦煌；421年北凉围城筑堤水灌，敦煌陷落，政权终止。'},
          {title:'山河年轮地点资料：敦煌',urlOrCitation:'src/data/places.ts#dunhuang',
            pageOrRecord:'现代城市中心坐标，仅用于敦煌位置参照，不表示古城范围。'},
        ],
        uncertaintyNote:'史料支持终局据点和覆亡过程，不支持421年全年固定边界；点仅作年内终局阶段参照。'},
    };
  })(),
  ...Array.from({length: 3}, (_, index): BoundaryState => {
    const year = 407 + index;
    const place = places.find(item => item.id === 'longcheng')!;
    return {
      id:`special-northern-yan-${year}-longcheng-center`, polityId:'northern_yan', validFrom:year, validTo:year,
      snapshotYear:year, temporalKind:'interval', presentation:'reference', sourceName:`北燕${year}年龙城区域中心参照`,
      sourceUrl:year === 409
        ? 'https://zh.wikisource.org/zh-hans/資治通鑑/卷115'
        : 'https://zh.wikisource.org/zh-hans/資治通鑑/卷114', vertexCount:1,
      geometry:{type:'Point',coordinates:[place.longitude, place.latitude]}, controlType:'direct', confidence:'low',
      sourceIds:['zizhi-tongjian-vol114-115-northern-yan','capital-history-reference','modern-geography-reference'], mapRepresentation:'control-centers',
      notes:year === 407
        ? '407年高云在龙城取代慕容熙，新燕政权形成；此点为龙城区域级政治中心参照，不判定唯一古城坐标、后燕旧境承接或全年疆界。'
        : year === 409
          ? '409年冯跋掌权，龙城政治中心延续；此点为区域级现代参照，不表示政权内部更替已形成稳定边界。'
          : '408年龙城继续作为辽西燕政权中枢参照；不据军事行动或名义辖区推定全年直接控制边缘。',
      evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',
        citations:[
          {title:`《资治通鉴》卷${year === 409 ? '115' : '114'}·后燕与北燕政权转换`,urlOrCitation:year === 409
            ? 'https://zh.wikisource.org/zh-hans/資治通鑑/卷115'
            : 'https://zh.wikisource.org/zh-hans/資治通鑑/卷114',
            pageOrRecord:year === 407
              ? '记高云在龙城取代慕容熙；新燕政权形成与北燕名称的史学分期另行保留。'
              : year === 409
                ? '记冯跋于龙城掌权，作为高云之后的统治结构转换节点。'
                : '记408年夏王勃勃与后秦齐难交战及夏军退保河曲、追至木城；本条龙城点仅依据政权中心延续，不表示战区边界。'},
          {title:'山河年轮地点资料：龙城',urlOrCitation:'src/data/places.ts#longcheng',
            pageOrRecord:'区域性现代参照为朝阳及和龙一带，具体古城对应有差异；点位不表示某一遗址中心或城垣。'},
        ],
        uncertaintyNote:'龙城现代对应和北燕建政分期存在异说；此处只作低精度区域政治中心表达，不生成疆域面，也不把后燕末年或北燕后期范围回填。'},
    };
  }),
  {
    id:'special-southern-yan-410-termination-center', polityId:'southern_yan', validFrom:410, validTo:410,
    snapshotYear:410, temporalKind:'interval', presentation:'reference', sourceName:'南燕覆亡年广固终局中心参照',
    sourceUrl:'https://zh.wikisource.org/zh-hans/資治通鑑/卷115', vertexCount:1,
    geometry:{type:'Point',coordinates:[118.48,36.70]}, controlType:'direct', confidence:'low',
    sourceIds:['southern-yan-termination-410-primary-sources','modern-geography-reference'], mapRepresentation:'control-centers',
    notes:'410年广固为南燕覆亡前的年内政治中心与终局城市参照。正月慕容超仍登城朝见群臣，二月广固被刘裕攻破；此点不表示南燕全年独立控制，也不表示东晋全年稳定接收。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',
      citations:[
        {title:'《资治通鉴》卷115·晋纪三十七',urlOrCitation:'https://zh.wikisource.org/zh-hans/資治通鑑/卷115',pageOrRecord:'410年正月慕容超登广固城、二月丁亥刘裕攻破广固、慕容超被获并送建康处斩；不能据此推定全年疆界。'},
        {title:'山河年轮地点资料：广固',urlOrCitation:'src/data/places.ts#guanggu',pageOrRecord:'青州市一带近似遗址定位，不表示广固城垣范围。'}],
      uncertaintyNote:'明确的空间参照仅限广固这一终局城市；围城进退、南燕全年控制和东晋后续接收边界均无本年度逐年可绘资料，不生成疆域面。'},
  },
  ...([398, 400, 401] as const).map((year): BoundaryState => ({
    id:`special-southern-yan-founding-${year}-center`, polityId:'southern_yan', validFrom:year, validTo:year,
    snapshotYear:year, temporalKind:'interval', presentation:'reference', sourceName:`南燕${year}年政治中心参照`,
    sourceUrl:'https://zh.wikisource.org/zh-hans/晉書/卷127', vertexCount:1,
    geometry:{type:'Point',coordinates:year === 398 ? [114.46, 35.58] : [118.48, 36.70]},
    controlType:'direct', confidence:'low', sourceIds:['southern-yan-formation-primary-sources','modern-geography-reference'], mapRepresentation:'control-centers',
    notes:year === 398
      ? '398年慕容德率众南迁滑台并称燕王。滑台坐标仅为滑县古城区域附近的低置信度现代参照，不指认古城垣。'
      : `${year}年广固作为南燕政治中心参照；此点不表示广固城垣、南燕全部直接控制范围或疆域边界。`,
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',
      citations:[
        {title:'《晋书》卷127·慕容德载记',urlOrCitation:'https://zh.wikisource.org/zh-hans/晉書/卷127',pageOrRecord:'记398年率户四万南徙滑台并称元年；并记399年滑台失守、慕容云率部出滑台赴德。'},
        {title:'《资治通鉴》卷110—111·晋纪',urlOrCitation:'https://zh.wikisource.org/zh-hans/資治通鑑/卷110；https://zh.wikisource.org/zh-hans/資治通鑑_(四庫全書本)/卷111',pageOrRecord:'核对398—399年南迁、滑台失守和青齐军事行动；卷111将广固称帝记在400年，故不把广固提前至399年。'},
        ...(year === 398 ? [{title:'河南省文物考古研究院：滑县产业集聚区文物保护区域评估报告',urlOrCitation:'https://www.hnhx.gov.cn/portal/rootfiles/2023/02/06/1677317150332677-1677317150390281.pdf',pageOrRecord:'记述滑台城名与滑县地方关系；本项目采用滑县城区附近近似区域点，不标定古城址精确坐标。'}] : []),
        {title:'山河年轮地点资料：广固',urlOrCitation:'src/data/places.ts#guanggu',pageOrRecord:'青州市一带近似遗址定位，不表示广固城垣范围。'},
      ],
      uncertaintyNote:'逐年政治中心点仅用于城市/区域级定位。398—401年处于建政、迁徙、军事占领与制度整合阶段；未发现支持全年直接控制边缘的逐年空间材料，故不绘疆域面。399年滑台已失而广固作为中心的明确纪年在400年，不擅自填补过渡年的空间表达。'},
  })),
  {
    id:'special-wei-northern-386-shengle-center', polityId:'wei_northern', validFrom:386, validTo:386,
    snapshotYear:386, temporalKind:'interval', presentation:'reference', sourceName:'北魏建立年迁居盛乐后的中心参照',
    sourceUrl:northernWeiFoundingCitation.urlOrCitation, vertexCount:1,
    geometry:{type:'Point',coordinates:[111.8125,40.458333333333336]}, controlType:'direct', confidence:'low',
    sourceIds:['northern-wei-founding-386-primary-source','shengle-site-archaeology-reference'], mapRepresentation:'control-centers',
    notes:'拓跋珪386年正月在牛川即代王位，二月迁盛乐，四月改称魏王；八月北迁贺兰部，十月再至牛川。此点仅标记二月至七月可定位的盛乐阶段参照，不表示全年单一中心、行军路线或疆界；398年迁都平城不提前到386年。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',
      citations:[northernWeiFoundingCitation,
        {title:'和林格尔土城子遗址考古资料：盛乐古城点位',urlOrCitation:'src/data/places.ts#shengle',pageOrRecord:'采用城址发掘报告坐标作遗址近似中心，古城考古范围不等于该点。'}],
      uncertaintyNote:'386年年内包括牛川即位、盛乐、贺兰部和牛川等阶段转换；年度点只显示可定位的盛乐阶段，不表示全年唯一中心或北魏逐年疆界。'},
  },
  {
    id:'special-later-yan-385-zhongshan-center', polityId:'later_yan', validFrom:385, validTo:385,
    snapshotYear:385, temporalKind:'interval', presentation:'reference', sourceName:'后燕年末定都中山的年度中心参照',
    sourceUrl:laterYanQinFoundingCitations[0].urlOrCitation, vertexCount:1,
    geometry:{type:'Point',coordinates:[114.98,38.52]}, controlType:'direct', confidence:'low',
    sourceIds:['later-yan-qin-founding-384-386-primary-sources','later-yan-zhongshan-location-gazetteer','modern-geography-reference'], mapRepresentation:'control-centers',
    notes:'《资治通鉴》卷106记385年后燕围邺未下，四月撤围；年末慕容垂北至中山并始定都。该点作年末定都后的城区级低置信度参照，不表示全年唯一中心、精确古城或疆界。386年继续使用中山区域参照。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',
      citations:[...laterYanQinFoundingCitations,{title:'《资治通鉴》卷106',urlOrCitation:'https://zh.wikisource.org/zh-hans/資治通鑑/卷106',pageOrRecord:'太元十年（385）记慕容垂围邺未下、四月撤围；年末记北至中山并“始定都中山”。'}],
      uncertaintyNote:'年末中山中心可定位，但该点不表示385全年唯一中心、精确古城范围或疆界；史料记载战事期间中心与驻军行动变化。前一年荥阳仍仅作事件区域点。'},
  },
  {
    id:'special-later-yan-386-zhongshan-center', polityId:'later_yan', validFrom:386, validTo:386,
    snapshotYear:386, temporalKind:'interval', presentation:'reference', sourceName:'后燕在中山称帝后的区域中心参照',
    sourceUrl:'https://zh.wikisource.org/zh-hans/晉書/卷009', vertexCount:1,
    geometry:{type:'Point',coordinates:[114.98,38.52]}, controlType:'direct', confidence:'low',
    sourceIds:['later-yan-qin-founding-384-386-primary-sources','later-yan-zhongshan-location-gazetteer','modern-geography-reference'], mapRepresentation:'control-centers',
    notes:'386年正月慕容垂于中山即皇帝位。《畿辅通志》将卢奴故城定位为定州治，并记后燕在中山小城南建都。本点只作今定州城区级低置信度区域参照，不表示考古城址、城垣、全年稳定辖区或后燕疆界。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',
      citations:[laterYanQinFoundingCitations[0],{title:'《晋书》卷九·孝武帝纪',urlOrCitation:'https://zh.wikisource.org/zh-hans/晉書/卷009',pageOrRecord:'太元十一年正月记慕容垂于中山即皇帝位。'},{title:'《畿辅通志》定州古迹条',urlOrCitation:'https://www.shidianguji.com/zh/mid-page/7394567998968971274',pageOrRecord:'卢奴故城即定州治，并记后燕在中山小城南建都。'},{title:'中央研究院地名规范数据库：定州',urlOrCitation:'https://authority-dev.dila.edu.tw/place/search.php?code=PL000000002511',pageOrRecord:'定州别名中山，城区参考坐标114.9847E、38.5194N，原数据采用GRS67；本项目仅取两位小数作城区区域参照。'},{title:'项目地点资料：中山（卢奴）',urlOrCitation:'src/data/places.ts#zhongshan_lunu',pageOrRecord:'今定州城区级近似位置，不是具体遗址或城垣坐标。'}],
      uncertaintyNote:'古籍支持中山与卢奴、定州治所的区域联系，但没有提供可直接采用的古城测绘坐标。现代点仅指向定州城区区域，且现代地图来源使用权与公开展示条件仍待审核。'},
  },
  {
    id:'special-later-qin-386-changan-center', polityId:'later_qin', validFrom:386, validTo:386,
    snapshotYear:386, temporalKind:'interval', presentation:'reference', sourceName:'后秦取得长安并称帝年度中心参照',
    sourceUrl:laterYanQinFoundingCitations[0].urlOrCitation, vertexCount:1,
    geometry:{type:'Point',coordinates:[108.94,34.34]}, controlType:'direct', confidence:'low',
    sourceIds:['later-yan-qin-founding-384-386-primary-sources','modern-geography-reference'], mapRepresentation:'control-centers',
    notes:'姚苌于386年取得长安并称帝，长安由此进入后秦正式都城阶段；其后当年仍出兵安定。384年姚苌在渭北马牧称万年秦王，地点不能可靠映射为本项目坐标；385年征战与据点移动不以长安代替。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',
      citations:[...laterYanQinFoundingCitations,{title:'山河年轮地点资料：长安',urlOrCitation:'src/data/places.ts#changan',pageOrRecord:'现代西安市近似中心坐标，不表示古长安城垣边界。'}],
      uncertaintyNote:'只标记386年取得长安并定都后的政治中心参照；不表示全年对关中或后秦其他声索区域的稳定直接控制，不生成疆域面。'},
  },
  {
    id:'special-later-qin-417-changan-transition-center', polityId:'later_qin', validFrom:417, validTo:417,
    snapshotYear:417, temporalKind:'interval', presentation:'reference', sourceName:'后秦终止年长安政权交接中心参照',
    sourceUrl:laterQinTerminationCitation.urlOrCitation, vertexCount:1,
    geometry:{type:'Point',coordinates:[108.94,34.34]}, controlType:'direct', confidence:'low',
    sourceIds:['later-qin-termination-417-primary-source','modern-geography-reference'], mapRepresentation:'control-centers',
    notes:'长安在417年仍是后秦都城，刘裕军攻取长安后姚泓出降，后秦政治结构终止。此点标记年内政权交接地点，不表示后秦全年持续控制长安，也不表示东晋已稳定控制关中。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',
      citations:[laterQinTerminationCitation,{title:'山河年轮地点资料：长安',urlOrCitation:'src/data/places.ts#changan',pageOrRecord:'现代西安市近似中心坐标，不表示古长安城垣边界。'}],
      uncertaintyNote:'史料支持长安在年内被刘裕军攻取及姚泓出降，但不足以恢复战役推进、各地接收先后或后秦年初至终止时的疆界。地图点仅为交接中心参照。'},
  },
  {
    id:'special-xia-erlitou-core', polityId:'xia_early', validFrom:-1750, validTo:-1600,
    snapshotYear:-1750, temporalKind:'interval', presentation:'reference', sourceName:'二里头考古文化核心参照',
    sourceUrl:erlitouCitation.urlOrCitation, vertexCount:1, geometry:{type:'Point',coordinates:[112.70,34.70]},
    controlType:'influence', confidence:'low', sourceIds:['erlitou-official','erlitou-chronology-cass-2022'],
    notes:'仅在二里头遗址考古年代范围内显示附近的文化核心参考点，不表示夏代国家边界或完整文化分布。遗址与夏王朝的对应仍有研究不确定性；坐标为近似定位。',
    evidence:{evidenceLevel:'D',derivation:'cultural-core',reviewStatus:'source-checked',
      citations:[erlitouCitation,erlitouResearchCitation,{title:'中国社会科学院：中国科技考古助推中国考古学新发展',urlOrCitation:'https://www.cass.cn/xueshuchengguo/xscg_lsyjy/202207/t20220707_5415948.shtml',pageOrRecord:'二里头遗址绝对年代约前1750—前1530年；与传统夏代年代框架及夏文化归属分开处理。'}],
      uncertaintyNote:'考古来源支持二里头遗址附近的文化核心定位和约前1750—前1530年的遗址年代，不证明夏王朝逐年直接控制范围。仅在本政权台账覆盖的前1750—前1600年显示参考点；遗址年代之前不前推。'},
  },
  {
    id:'special-gengshi-23-centers', polityId:'gengshi', validFrom:23, validTo:23,
    snapshotYear:23, temporalKind:'interval', presentation:'reference', sourceName:'更始政权控制中心参照',
    sourceUrl:gengshiWanCitation.urlOrCitation, vertexCount:3,
    geometry:{type:'MultiPoint',coordinates:[[112.53,32.99],[112.45,34.62],[108.94,34.34]]},
    controlType:'influence', confidence:'low', sourceIds:['gengshi-official'],
    notes:'显示23年相关的宛城、洛阳、长安中心，不把中心连线或覆盖范围解释为国界。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',citations:[gengshiWanCitation,gengshiChanganCitation],
      uncertaintyNote:'年级别记录只能表达主要政治与军事中心，不能确定同年各时点的连续控制范围。'},
  },
  {
    id:'special-gengshi-24-centers', polityId:'gengshi', validFrom:24, validTo:24,
    snapshotYear:24, temporalKind:'interval', presentation:'reference', sourceName:'更始政权迁都中心参照',
    sourceUrl:gengshiChanganCitation.urlOrCitation, vertexCount:2,
    geometry:{type:'MultiPoint',coordinates:[[112.45,34.62],[108.94,34.34]]},
    controlType:'influence', confidence:'low', sourceIds:['gengshi-official'],
    notes:'显示24年由洛阳迁都长安的中心序列，不表示连续疆域。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',citations:[gengshiChanganCitation],
      uncertaintyNote:'迁都时序有地方志依据，但中心点不能推导更始政权的封闭控制边界。'},
  },
  {
    id:'special-gengshi-25-center', polityId:'gengshi', validFrom:25, validTo:25,
    snapshotYear:25, temporalKind:'interval', presentation:'reference', sourceName:'更始政权长安中心参照',
    sourceUrl:gengshiChanganCitation.urlOrCitation, vertexCount:1,
    geometry:{type:'Point',coordinates:[108.94,34.34]}, controlType:'influence', confidence:'low', sourceIds:['gengshi-official','zizhi-tongjian-vol40-gengshi-25'],
    notes:'表示25年更始政权末期的长安中心参照。《资治通鉴》卷四十逐月记载刘秀六月即位、赤眉九月入长安后更始出走，以及十月东汉定都洛阳；该点不表示全年连续控制或国界。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',citations:[gengshiChanganCitation,gengshiYear25Citation],
      uncertaintyNote:'年内政局快速变化，长安只是更始政权末期中心参照；不推断长安失守后的控制状态，也不生成疆域范围。'},
  },
  {
    id:'special-yang-wu-902-910-yangzhou-capital-center', polityId:'wu_ten', validFrom:902, validTo:910,
    snapshotYear:902, temporalKind:'interval', presentation:'reference', sourceName:'杨吴形成与扩张期扬州政治中心参照',
    sourceUrl:'https://zh.wikisource.org/zh-hans/資治通鑑/卷263', vertexCount:1,
    geometry:{type:'Point',coordinates:[119.42,32.39]},
    controlType:'direct', confidence:'low', sourceIds:['zizhi-tongjian-vol263-267-yang-wu','capital-history-reference','modern-geography-reference'], mapRepresentation:'control-centers',
    notes:'902—910年仅表示杨吴政治中心扬州/广陵的现代城市级近似参照。杨行密受封、继承变动及江西方向的州城攻取分别记录；扬州中心点不表示淮南或江西疆域、各地全年控制强度，也不替代战事地点。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',citations:[
      {title:'《资治通鉴》卷263—267·唐纪与后梁纪',urlOrCitation:'https://zh.wikisource.org/zh-hans/資治通鑑/卷263',pageOrRecord:'卷263记杨行密受封吴王、以扬州为中心；卷263—267逐年记其继承与扩张事件，州城攻取不等于全年稳定实控。'},
      {title:'项目首都阶段记录：杨吴扬州',urlOrCitation:'src/data/capital-history.ts',pageOrRecord:'capitalHistory.wu_ten记录扬州为902—937年政治中心阶段；本点仅截取本缺口范围902—910年。'},
      {title:'项目地点资料：扬州',urlOrCitation:'src/data/places.ts#yangzhou',pageOrRecord:'现代扬州市区域级近似坐标，不代表五代广陵城垣、城址边界或杨吴疆界。'}],
      uncertaintyNote:'历史资料支持扬州/广陵作为政权中心，但本研究段没有可复原的逐年连续控制线；此D级点只提供城市级位置参照，不代表明确疆界。'},
  },
  {
    id:'special-southern-tang-937-959-jiankang-capital-center', polityId:'southern_tang', validFrom:937, validTo:959,
    snapshotYear:937, temporalKind:'interval', presentation:'reference', sourceName:'南唐金陵／建康都城中心参照',
    sourceUrl:'src/data/capital-history.ts#southern_tang', vertexCount:1, geometry:{type:'Point',coordinates:[118.80,32.06]},
    controlType:'direct', confidence:'low', sourceIds:['zizhi-tongjian-southern-tang-937-959','capital-history-reference','modern-geography-reference'], mapRepresentation:'control-centers',
    notes:'937—959年南唐以金陵／建康为正式政治中心，项目首都阶段记录为937—960年。点位采用今南京市城市级近似坐标，逐年表示都城中心；不表示城垣范围或南唐疆界。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',
      citations:[{title:'《资治通鉴》卷281—294·南唐纪年核对',urlOrCitation:'https://zh.wikisource.org/zh-hans/資治通鑑/卷281；https://zh.wikisource.org/zh-hans/資治通鑑/卷283；https://zh.wikisource.org/zh-hans/資治通鑑/卷284；https://zh.wikisource.org/zh-hans/資治通鑑/卷292；https://zh.wikisource.org/zh-hans/資治通鑑/卷294',pageOrRecord:'逐年记录南唐建国、金陵政治中心、闽楚战事、后周南征与958年割地；仅用于年度政权事件和中心沿革核对，不支持疆界重建。'},
        {title:'项目首都阶段记录：南唐金陵／建康',urlOrCitation:'src/data/capital-history.ts',pageOrRecord:'southern_tang记录金陵／建康为937—960年正式政治中心；本条仅覆盖937—959年。'},
        {title:'项目现代地理参照：建康／南京',urlOrCitation:'src/data/places.ts#jiankang',pageOrRecord:'城市级近似坐标118.80, 32.06，用于地图定位，不代表古城遗址测绘或历史疆界。'}],
      uncertaintyNote:'都城阶段支持金陵为政治中心；城市点是现代地名映射。政权中心不能推出全境边界，战线、割地、藩镇和地方臣属仍需分别判断。'},
  },
  {
    id:'special-nanzhao-739-740-taihe-capital-center', polityId:'nanzhao', validFrom:739, validTo:740,
    snapshotYear:739, temporalKind:'interval', presentation:'reference', sourceName:'南诏739—740年太和城政治中心参照',
    sourceUrl:'https://zh.wikisource.org/zh-hans/舊唐書/卷197', vertexCount:1,
    geometry:{type:'Point',coordinates:[100.17,25.68]},
    controlType:'direct', confidence:'medium', sourceIds:['nanzhao-taihe-capital-period-reference','nanzhao-taihe-site-whitrap','nanzhao-formation-zizhi-214','modern-geography-reference'], mapRepresentation:'control-centers',
    notes:'《旧唐书·南诏蛮》将迁居大和城记于开元二十七年（739）；南诏城市史研究亦倾向739年并据779年迁往羊苴咩城确定太和城约40年中心阶段。点位表示太和城遗址区域级政治中心，不表示城垣或疆域；738年《资治通鉴》条下亦有迁居记载，纪年异文保留。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',citations:[
      {title:'《旧唐书》卷一九七·南诏蛮',urlOrCitation:'https://zh.wikisource.org/zh-hans/舊唐書/卷197',pageOrRecord:'开元二十七年（739）迁居大和城记载；迁入年份有《资治通鉴》738年条下的异文。'},
      {title:'吴晓亮《洱海区域古代城市体系研究》第四章',urlOrCitation:'https://lfglib.cn/ecohistory/zhongwai/216801.html',pageOrRecord:'并列738、739迁居说，倾向采用739，并据779年迁往羊苴咩城界定太和城约40年政治中心阶段。'},
      {title:'WHITRAP太和城遗址资料',urlOrCitation:'https://whitrap.pku.edu.cn/info/1013/9751.htm',pageOrRecord:'太和城遗址位于今大理市太和街道太和村；支持地点参照，不提供政权疆界。'}],
      uncertaintyNote:'此点仅表达739—740年都城阶段和遗址所在区域；不由中心点推导洱海区域以外的控制范围，亦不解决738/739迁居纪年异文。'},
  },
  {
    id:'special-tibetan-early-yarlung-core-618-622', polityId:'tibetan_empire', validFrom:618, validTo:622,
    snapshotYear:618, temporalKind:'interval', presentation:'reference', sourceName:'吐蕃早期雅砻河谷政治核心区域参照',
    sourceUrl:'https://content.ucpress.edu/chapters/10352.ch01.pdf', vertexCount:1,
    geometry:{type:'Point',coordinates:[91.77,29.24]},
    controlType:'influence', confidence:'low', sourceIds:['tibetan-empire-early-history-ucpress','tibetan-yarlung-polities-uva','modern-geography-reference'], mapRepresentation:'control-centers',
    notes:'仅在项目采用的618—622年形成阶段显示雅砻河谷早期王权核心的区域参照。Uebach记载松赞干布前王系居于雅砻河谷支谷、朗日松赞时期联盟推动国家形成；该阶段性证据不裁定精确建政年、具体宫城、逐年控制范围或高原疆界。坐标是山南区域级近似点。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',citations:[
      {title:'Helga Uebach, “The Tibetan Empire (Seventh–Ninth Centuries)”',urlOrCitation:'https://content.ucpress.edu/chapters/10352.ch01.pdf',pageOrRecord:'章节第3页（PDF第1页）记述松赞干布前王系居于雅砻河谷支谷；朗日松赞时期联盟是吐蕃国家形成起点之一。只支持早期核心区域参照。'},
      {title:'项目地点资料：雅砻区域参照',urlOrCitation:'src/data/places.ts#yalong',pageOrRecord:'山南市区域近似位置；不代表宫城遗址、疆域线或边界测绘坐标。'}],
      uncertaintyNote:'618为项目沿用的吐蕃形成约年映射；Uebach将松赞干布在位起年列作617年，并将国家形成前史追溯到朗日松赞时期。此低精度区域参照只表示早期形成阶段与雅砻核心的历史关联，不能据此确认无争议建政年、每年政权活动、精确控制强度或疆域多边形。'},
  },
  {
    id:'special-qin-221-219-capital-center', polityId:'qin', validFrom:-221, validTo:-219,
    snapshotYear:-221, temporalKind:'interval', presentation:'reference', sourceName:'秦统一初期咸阳都城中心参照',
    sourceUrl:qinUnificationCitation.urlOrCitation, vertexCount:1, geometry:{type:'Point',coordinates:[108.70,34.33]},
    controlType:'direct', confidence:'low', sourceIds:['shiji-qin-unification-administration','liye-qin-slip-weapons-220','qin-regional-control-lander','qin-shihuang-28th-year-eastern-tour','modern-geography-reference'], mapRepresentation:'control-centers',
    notes:'前221—前219年仅表示秦帝国中央政治中心咸阳。前221年统一与郡县建制、前220年郡级兵器转输、前219年东巡各自反映行政整合和政治活动，不代表郡县边界、连续疆域或各地区控制强度。坐标为近似定位。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',
      citations:[qinUnificationCitation,
        {title:'里耶秦简与秦征服期物流行政研究',urlOrCitation:'https://www.cambridge.org/core/journals/early-china/article/emergence-of-logistics-networks-and-financial-administration-during-the-qin-conquest-230221-bce/88CAA846820D79FE59DE99630ADB3528',pageOrRecord:'秦始皇二十七年洞庭、南、苍梧、巴等郡兵器向内史转输；证明特定行政网络联系，不证明连续边界。'},
        {title:'Brian Lander, “Making Use of the Land”',urlOrCitation:'https://doi.org/10.1017/jch.2022.19',pageOrRecord:'用于秦帝国区域行政能力与南方控制差异的研究背景，不转译为直接几何。'},
        {title:'《史记·秦始皇本纪》二十八年东行郡县',urlOrCitation:'https://www.shidianguji.com/mid-page/7597182949280497691',pageOrRecord:'支持前219年东巡和到访节点，不将巡行路线绘作边界。'},xianyangPlaceCitation],
      uncertaintyNote:'现有史料支持秦统一初期中央设于咸阳，也能追踪特定行政节点和巡行活动；这些证据不足以重建前221至前219年逐年疆界，三年疆域面继续留空。'},
  },
  ...([-208,-207] as const).map((year): BoundaryState => ({
    id:`special-qin-collapse-${Math.abs(year)}-xianyang-center`, polityId:'qin', validFrom:year, validTo:year,
    snapshotYear:year, temporalKind:'interval', presentation:'reference', sourceName:`秦末${Math.abs(year)}年咸阳政治中心参照`,
    sourceUrl:qinCollapseCitations[0].urlOrCitation, vertexCount:1, geometry:{type:'Point',coordinates:[108.70,34.33]},
    controlType:'direct', confidence:'low', sourceIds:['qin-collapse-timeline-shiji','qin-regional-control-lander','modern-geography-reference'], mapRepresentation:'control-centers',
    notes:year === -207
        ? '秦二世死、子婴继位并杀赵高；关中战事和刘邦入武关持续。Lander研究将约前230—前206年的东、南新征区描述为控制较弱，但不确认前207年各地归属。此点仅表示秦末朝廷的咸阳政治中心。'
        : '秦末战乱中秦廷仍以咸阳为政治中心参照。Lander研究指出约前230—前206年新征区域控制较弱；此累计范围不能确定前208年各地实控，也不支持回填统一时期最大版图。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',citations:[...qinCollapseCitations,
      {title:'山河年轮地点资料：咸阳',urlOrCitation:'src/data/places.ts#xianyang',pageOrRecord:'咸阳现代城市近似点，不代表秦咸阳城垣、关中辖区或秦末控制线。'}],
      uncertaintyNote:'秦末政权覆亡日期因秦历、汉历和后世公历换算存在前207／前206等口径。秦廷所在地、刘邦军占领、项羽入关与汉王分封是不同时间和控制主体；D级中心点不表示全年稳定边界，疆界面均留空。'},
  })),
  {
    id:'special-han-206-nanzheng-center', polityId:'han_western', validFrom:-206, validTo:-206,
    snapshotYear:-206, presentation:'reference', sourceName:'汉王南郑中心参照',
    sourceUrl:hanKingCitation.urlOrCitation, vertexCount:1, geometry:{type:'Point',coordinates:[107.03,33.07]},
    controlType:'direct', confidence:'low', sourceIds:['han-king-chuhan-206-203-primary-sources','modern-geography-reference'], mapRepresentation:'control-centers',
    notes:'表示前206年汉王受封后以南郑为都的政治中心；史载王巴、蜀、汉中，不将四十一县范围或山地间未证实地带绘成疆界。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',
      citations:[hanKingCitation,hanNanzhengLocationCitation],
      uncertaintyNote:'南郑都城和受封范围有文本依据；该点仅为近似定位，不表示汉王领地的完整边界。'},
  },
  ...([-206,-205,-204,-203] as const).map((year): BoundaryState => ({
    id:`special-xiang-yu-${Math.abs(year)}-pengcheng-center`, polityId:'xiang_yu', validFrom:year, validTo:year,
    snapshotYear:year, temporalKind:'interval', presentation:'reference', sourceName:`项羽政权彭城中心参照（${Math.abs(year)} BCE）`,
    sourceUrl:xiangYuRegimeCitation.urlOrCitation, vertexCount:1, geometry:{type:'Point',coordinates:[117.18,34.27]},
    controlType:'direct', confidence:'low', sourceIds:['xiang-yu-regime-206-202-primary-sources','xuzhou-pengcheng-historical-location'], mapRepresentation:'control-centers',
    notes:year === -206
      ? '史书记项羽自立为西楚霸王、都彭城；此点只表示政权中心参照，不表示梁楚九郡的精确范围或全年直接控制边界。'
      : '彭城作为项羽政权中心参照；前205年汉军一度进据、楚军反击，点位不表示该年任何一方对城市的全年控制。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',
      citations:[xiangYuRegimeCitation,{title:'彭城历史地名与徐州城市级定位',urlOrCitation:'src/data/places.ts#pengcheng',pageOrRecord:'沿用项目彭城城市级参考坐标，不代表古城遗址边界或战场位置。'}],
      uncertaintyNote:'中心都城记载及彭城现代城市级近似位置可核；此点不是疆域线，九郡划分存在异说，战争中控制时点也有变化。'},
  })),
  {
    id:'special-han-205-liyang-center', polityId:'han_western', validFrom:-205, validTo:-205,
    snapshotYear:-205, presentation:'reference', sourceName:'汉王栎阳中心参照',
    sourceUrl:hanLiyangCitation.urlOrCitation, vertexCount:1, geometry:{type:'Point',coordinates:[109.3133,34.6425]},
    controlType:'direct', confidence:'low', sourceIds:['han-king-chuhan-206-203-primary-sources','modern-geography-reference'], mapRepresentation:'control-centers',
    notes:'表示前205年汉王还都栎阳这一政治中心节点；本年战事与控制范围多次变化，不表示全年连续疆域。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',
      citations:[hanLiyangCitation,liyangLocationCitation],
      uncertaintyNote:'都城记载和遗址大致位置可核对；点位不代表栎阳以外的控制线。'},
  },
  {
    id:'special-han-204-xingyang-center', polityId:'han_western', validFrom:-204, validTo:-204,
    snapshotYear:-204, presentation:'reference', sourceName:'楚汉战争荥阳前线参照',
    sourceUrl:hanXingyangCitation.urlOrCitation, vertexCount:1, geometry:{type:'Point',coordinates:[113.5308,34.8745]},
    controlType:'disputed', confidence:'low', sourceIds:['han-king-chuhan-206-203-primary-sources','zhengzhou-xingyang-old-city-site','modern-geography-reference'], mapRepresentation:'control-centers',
    notes:'表示汉楚在荥阳一带长期争夺的前线位置；城池控制反复变化，点位不表示汉方稳定控制荥阳全域。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',
      citations:[hanXingyangCitation,xingyangLocationCitation],
      uncertaintyNote:'战事地点可定位，具体年内控制时点和边界不能压成一个确定面。'},
  },
  {
    id:'special-han-203-xingyang-center', polityId:'han_western', validFrom:-203, validTo:-203,
    snapshotYear:-203, presentation:'reference', sourceName:'楚汉鸿沟约和与荥阳前线参照',
    sourceUrl:hanXingyangCitation.urlOrCitation, vertexCount:1, geometry:{type:'Point',coordinates:[113.5308,34.8745]},
    controlType:'disputed', confidence:'low', sourceIds:['han-king-chuhan-206-203-primary-sources','zhengzhou-xingyang-old-city-site','honggou-canal-course-study-2017','modern-geography-reference'], mapRepresentation:'control-centers',
    notes:'仅标记荥阳、成皋相持这一战事背景。年末记洪沟约和、楚军东归及汉方追击决策；不据此认定边界已交接或绘成稳定疆界。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',
      citations:[hanXingyangCitation,xingyangLocationCitation,honggouCourseCitation],
      uncertaintyNote:'历史地名和战事可定位；研究指出鸿沟渠首河道经历迁移且具体地望存在歧见。年末约和及追击决策不等于边界已完成交接或成为全年实控线。'},
  },
  ...([6,7,8] as const).map(year => ({
    id:`special-han-${year}-changan-center`, polityId:'han_western', validFrom:year, validTo:year,
    snapshotYear:year, temporalKind:'interval' as const, presentation:'reference' as const,
    sourceName:`西汉末年${year}年长安政治中心参照`,
    sourceUrl:hanXinTransitionCitations[0].urlOrCitation, vertexCount:1, geometry:{type:'Point' as const,coordinates:[108.94,34.34]},
    controlType:'direct' as const, confidence:'low' as const,
    sourceIds:['han-xin-transition-primary-sources','modern-geography-reference'], mapRepresentation:'control-centers' as const,
    notes:year === 6
      ? '居摄元年，王莽摄政，孺子婴立为皇太子；汉室名义延续。长安点仅标记中央政治中心，不表示王莽个人领地、汉廷对各地全年直接控制或疆界。'
      : year === 7
        ? '居摄二年，翟义于东郡起兵，移檄郡国，至山阳时众十余万；槐里赵明、霍鸿亦于同年起兵并攻烧官寺。长安点仅标记中央政治中心；各地响应与朝廷军事行动不支持绘制全年稳定疆界。'
        : '初始元年二月平定前一年起兵的槐里赵明、霍鸿；《资治通鉴》记王莽于冬受命、即真天子位并定国号为新，改以当年十二月为始建国元年正月。长安点仅标记政权转换前的中央政治中心，不表示全年直接控制区。',
    evidence:{evidenceLevel:'D' as const,derivation:'control-centers' as const,reviewStatus:'source-checked' as const,
      citations:[...hanXinTransitionCitations,{title:'山河年轮地点资料：长安',urlOrCitation:'src/data/places.ts#changan',pageOrRecord:'现代西安市近似中心坐标；不代表汉长安城垣边界。'}],
      uncertaintyNote:year === 6
        ? '《资治通鉴》记录居摄及汉室名义延续，支持长安为中央政治中枢参照，不足以支持本年逐年疆域线。'
        : year === 7
          ? '《资治通鉴》记录翟义与槐里赵明、霍鸿起兵、移檄郡国及朝廷调兵，支持长安为中央政治中枢参照，不足以支持本年逐年疆域线。'
          : '《资治通鉴》记录二月平定槐里赵明、霍鸿及王莽岁末即真、定国号为新；长安点仅支持政权转换前的中央中枢参照，不足以支持本年逐年疆域线。9年按新正朔编年，政权更替另作记录，不用本点延长或回填。'},
  })),
  ...([25,26,27,28,29] as const).map(year => ({
    id:`special-han-eastern-${year}-luoyang-center`, polityId:'han_eastern', validFrom:year, validTo:year,
    snapshotYear:year, temporalKind:'interval' as const, presentation:'reference' as const,
    sourceName:`东汉建武${year - 24}年洛阳政治中心参照`,
    sourceUrl:easternHanFoundingCitations[0].urlOrCitation, vertexCount:1,
    geometry:{type:'Point' as const,coordinates:[112.45,34.62]},
    controlType:'direct' as const, confidence:'low' as const,
    sourceIds:['han-eastern-founding-primary-sources','modern-geography-reference'], mapRepresentation:'control-centers' as const,
    notes:year === 25
      ? '东汉于本年六月在鄗南即位，秋冬间攻取洛阳；十月入洛阳后正式定都。本点只表示25年末洛阳中央政治中心，不代表年初即以洛阳为都，也不表示全年疆界。鄗南即位遗址的今地考证存在差异，未有可直接采用的精确点位，本记录不将高邑县或柏乡县行政中心冒充登基地点。'
      : year === 26
        ? '建武二年，洛阳为东汉中央政治中心；汉军仍在邺、河内等地作战和招降，本点不代表相应战区或全年直接控制范围。'
        : year === 27
          ? '建武三年，光武帝以洛阳为中央政治中心，赤眉及刘永、彭宠等地方势力仍构成并存与军事整合背景；本点不表示战事控制线。'
          : year === 28
            ? '建武四年，洛阳仍为东汉中央政治中心，区域性反抗与征讨持续；本点不据战果推定全国全年实控疆界。'
            : '建武五年，洛阳仍为东汉中央政治中心，各地军政整合并非可由都城位置还原的连续边界；本点只表示中央中枢。',
    evidence:{evidenceLevel:'D' as const,derivation:'control-centers' as const,reviewStatus:'source-checked' as const,
      citations:[...easternHanFoundingCitations,luoyangPlaceCitation],
      uncertaintyNote:year === 25
        ? '《后汉书》记录六月鄗南即位、十月入洛定都。鄗南遗址虽有学术研究定位到今柏乡县范围，地方官方介绍存在不同对应说法；由于本项目无可核精确坐标，本点只标记十月以后洛阳中心，不替鄗南选址。其余年份也不以洛阳点位代替边界。'
        : '编年史支持本年洛阳为中央都城，并记录建武初年战争和地方势力；证据不足以生成逐年疆域面或推断边界。'},
  })),
  {
    id:'special-wei-263-luoyang-center', polityId:'wei_three', validFrom:263, validTo:263,
    snapshotYear:263, temporalKind:'interval', presentation:'reference', sourceName:'魏灭蜀转换年洛阳政治中心参照',
    sourceUrl:shuFallCitation.urlOrCitation, vertexCount:1, geometry:{type:'Point',coordinates:[112.45,34.62]},
    controlType:'direct', confidence:'low', sourceIds:['shu-fall-263-primary-source','modern-geography-reference'], mapRepresentation:'control-centers',
    notes:'263年魏军伐蜀并迫使刘禅投降；洛阳点只表示魏的中央政治中心，不表示魏已在全年控制蜀地，也不把年内投降和后续接管转绘为完整疆域。魏来源轮廓在263年单独挂起待审，264年仍按原来源时段显示。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',citations:[shuFallCitation,luoyangPlaceCitation],
      uncertaintyNote:'《资治通鉴》确认魏伐蜀、成都降魏及后续接管的年内次序；来源魏轮廓跨263—264年且控制语义未定，未通过本项目历史与制图审核，故本年只显示洛阳中心点，不显示该来源面。'},
  },
  {
    id:'special-shu-263-chengdu-center', polityId:'shu_three', validFrom:263, validTo:263,
    snapshotYear:263, temporalKind:'interval', presentation:'reference', sourceName:'蜀汉终止年成都政治中心参照',
    sourceUrl:shuFallCitation.urlOrCitation, vertexCount:1, geometry:{type:'Point',coordinates:[104.07,30.67]},
    controlType:'direct', confidence:'low', sourceIds:['shu-fall-263-primary-source','modern-geography-reference'], mapRepresentation:'control-centers',
    notes:'成都为蜀汉中央政治中心；263年魏军伐蜀并于年内迫使刘禅投降。此点不表示蜀汉全年稳定控制，也不把成都一点解释为疆域面。魏军占领、蜀汉降附和姜维后续行动须按阶段区分。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',
      citations:[shuFallCitation,chengduPlaceCitation],
      uncertaintyNote:'史籍支持年内魏伐蜀、成都降魏及政权终止，不能由单一都城点重建战线变化或全年直接控制范围。'},
  },
  {
    id:'special-cheng-han-347-chengdu-center', polityId:'cheng_han', validFrom:347, validTo:347,
    snapshotYear:347, temporalKind:'interval', presentation:'reference', sourceName:'成汉终止年成都政治中心参照',
    sourceUrl:chengHanFallCitation.urlOrCitation, vertexCount:1, geometry:{type:'Point',coordinates:[104.07,30.67]},
    controlType:'direct', confidence:'low', sourceIds:['cheng-han-fall-347-primary-sources','modern-geography-reference'], mapRepresentation:'control-centers',
    notes:'成都为成汉中央政治中心。347年春桓温攻取成都、李势投降，桓温留驻三十日后还江陵；四月邓定、隗文等入据成都。此点只作年内战事与控制转折的位置参照，不表示东晋四月仍据成都、成汉全年稳定控制或东晋全年直接控制，更不重建战线。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',
      citations:[chengHanFallCitation,chengduPlaceCitation],
      uncertaintyNote:'史料支持当年成都政权交接，未提供足以表示年内推进、投降与接收先后的完整边界数据。城市坐标为现代近似定位。'},
  },
  ...([351,352] as const).map(year => ({
    id:`special-former-qin-${year}-changan-center`, polityId:'former_qin', validFrom:year, validTo:year,
    snapshotYear:year, temporalKind:'interval' as const, presentation:'reference' as const,
    sourceName:`前秦建政期${year}年长安政治中心参照`, sourceUrl:formerQinFoundingCitations[0].urlOrCitation,
    vertexCount:1, geometry:{type:'Point' as const,coordinates:[108.94,34.34]},
    controlType:'direct' as const, confidence:'low' as const,
    sourceIds:['former-qin-founding-351-352-primary-sources','modern-geography-reference'], mapRepresentation:'control-centers' as const,
    notes:year === 351
      ? '苻健于350年十月进至长安、十一月入城并以此为都；351年正月称天王、大单于、改元皇始、置百官，四月在五丈原击退司马勋。中心点不表示关中各郡均已稳定直接控制，也不把名义辖区或军事胜负画成边界。'
      : '苻健于本年即皇帝位，前秦由称天王阶段转为称帝阶段。称号变化不表示疆域变化；中心点不表示全年疆域。',
    evidence:{evidenceLevel:'D' as const,derivation:'control-centers' as const,reviewStatus:'source-checked' as const,
      citations:[...formerQinFoundingCitations,{title:'山河年轮地点资料：长安',urlOrCitation:'src/data/places.ts#changan',pageOrRecord:'现代西安市近似中心坐标，不表示古长安城垣边界。'}],
      uncertaintyNote:'编年史和纪传支持长安政治中心及建政、称帝先后，不支持复原351或352年的逐年直接控制疆界。'},
  })),
  ...([304,305] as const).map(year => ({
    id:`special-cheng-han-${year}-chengdu-center`, polityId:'cheng_han', validFrom:year, validTo:year,
    snapshotYear:year, temporalKind:'interval' as const, presentation:'reference' as const,
    sourceName:`成汉建政期${year}年成都政治中心参照`,
    sourceUrl:chengHanFoundingCitations[0].urlOrCitation, vertexCount:1,
    geometry:{type:'Point' as const,coordinates:[104.07,30.67]},
    controlType:'direct' as const, confidence:'low' as const,
    sourceIds:['cheng-han-founding-304-305-primary-sources','modern-geography-reference'], mapRepresentation:'control-centers' as const,
    notes:year === 304
      ? '《晋书》纪年记李雄于304年末攻克成都并称成都王；其年内政治中心经历转移。本年度点仅提示该年末成都政权中心，不能表示年初至年末均稳定控制成都，也不以“尽有成都之地”的概述推导边界。'
      : '305年李雄仍以成都王称号建政；《晋书》记当年遣李骧攻汉安，反映政权活动仍在发展。成都点仅作政治中心参照，不将军事实力、名义属地或后一年疆域等同为全年直接控制。',
    evidence:{evidenceLevel:'D' as const,derivation:'control-centers' as const,reviewStatus:'source-checked' as const,
      citations:[...chengHanFoundingCitations,chengduPlaceCitation],
      uncertaintyNote:year === 304
        ? '李雄攻克成都与称成都王均在304年后段；年度显示无法呈现月内中心转移，不能解释为全年疆界或从年初起的持续控制。'
        : '史料可确认成都政治中心和攻汉安行动，但未给出足以复原305年直接控制边界的逐年县郡清单与地图依据。'},
  })),
  {
    id:'special-former-zhao-309-318-pingyang-center', polityId:'former_zhao', validFrom:309, validTo:318,
    snapshotYear:309, temporalKind:'interval', presentation:'reference', sourceName:'前赵309—318年平阳政治中心参照',
    sourceUrl:'https://zh.wikisource.org/zh-hans/資治通鑑/卷087', vertexCount:1,
    geometry:{type:'Point',coordinates:[111.52,36.08]}, controlType:'direct', confidence:'low',
    sourceIds:['former-zhao-capital-timeline-primary-sources','modern-geography-reference'], mapRepresentation:'control-centers',
    notes:'《资治通鉴》卷八十七记永嘉三年（309）迁都平阳。此点为现代临汾城市近似中心，只表示政治中心区域，不代表平阳故城边缘或年度疆界。304—308年左国城、蒲子阶段不由此点回填。318年发生继承与军政转折，正式迁都长安按319年记载。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',
      citations:[{title:'《资治通鉴》卷八十七·晋纪九',urlOrCitation:'https://zh.wikisource.org/zh-hans/資治通鑑/卷087',pageOrRecord:'永嘉三年（309）正月记刘渊从太史令宣于修之议，迁都平阳。'},
        {title:'山河年轮地点资料：平阳',urlOrCitation:'src/data/places.ts#pingyang',pageOrRecord:'临汾市现代近似中心坐标，不表示平阳故城范围。'}],
      uncertaintyNote:'史料支持309年迁都平阳、319年迁都长安；城市中心坐标为现代近似定位，不能代替古城址测绘或前赵疆域。'},
  },
  {
    id:'special-former-zhao-319-329-changan-center', polityId:'former_zhao', validFrom:319, validTo:329,
    snapshotYear:319, temporalKind:'interval', presentation:'reference', sourceName:'前赵319—329年长安政治中心参照',
    sourceUrl:'https://zh.wikisource.org/zh-hans/資治通鑑/卷091', vertexCount:1,
    geometry:{type:'Point',coordinates:[108.94,34.34]}, controlType:'direct', confidence:'low',
    sourceIds:['former-zhao-capital-timeline-primary-sources','modern-geography-reference'], mapRepresentation:'control-centers',
    notes:'刘曜于319年正式迁都长安。此前镇守长安及318年政变、称帝节点不等同于正式迁都；此点仅为现代西安市近似中心，不表示古长安城垣或全年疆界。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',
      citations:[{title:'《资治通鉴》卷九十一·晋纪十三',urlOrCitation:'https://zh.wikisource.org/zh-hans/資治通鑑/卷091',pageOrRecord:'光初二年（319）记刘曜迁都长安、改国号为赵。'},
        {title:'山河年轮地点资料：长安',urlOrCitation:'src/data/places.ts#changan',pageOrRecord:'现代西安市近似中心坐标，不表示古长安城垣边界。'}],
      uncertaintyNote:'政治中心点按正式迁都年限标注；不据此复原前赵逐年直接控制范围。'},
  },
  ...Array.from({length:18}, (_, index) => 319 + index).flatMap(year => {
    const centers = year < 335
      ? [{placeId:'xiangguo',coordinates:[114.50,37.07] as [number,number],phase:'襄国中枢'}]
      : year === 335
        ? [
            {placeId:'xiangguo',coordinates:[114.50,37.07] as [number,number],phase:'迁都前的襄国中枢'},
            {placeId:'ye',coordinates:[114.37,36.33] as [number,number],phase:'九月迁都后的邺城中枢'},
          ]
        : [{placeId:'ye',coordinates:[114.37,36.33] as [number,number],phase:'邺城中枢'}];
    return centers.map(center => ({
      id:`special-later-zhao-${year}-${center.placeId}-center`, polityId:'later_zhao', validFrom:year, validTo:year,
      snapshotYear:year, temporalKind:'interval' as const, presentation:'reference' as const,
      sourceName:`后赵${year}年${center.phase}参照`, sourceUrl:laterZhaoAnnualCitations[0].urlOrCitation,
      vertexCount:1, geometry:{type:'Point' as const,coordinates:center.coordinates},
      controlType:'direct' as const, confidence:'low' as const,
      sourceIds:['later-zhao-319-336-chronicles','capital-history-reference','modern-geography-reference'], mapRepresentation:'control-centers' as const,
      notes:year === 319
        ? '石勒于襄国称赵王并建立政权。点仅表示建政中枢，不表示当年军政势力范围或疆界。'
        : year === 326
          ? '石勒时期营建邺宫并以太子镇邺；邺为重要军事与宫室据点，但不替代襄国中枢，也不表示其周边全部实控。'
          : year === 328
            ? '与前赵刘曜战争发生重大转折；战线和军队占领范围年内变化，不以中心点或战果推导稳定疆界。'
            : year === 329
              ? '前赵覆亡，后赵取得长安等区域；战后接收与地方控制整合并非同一时点，未据战果绘制扩大疆界。'
              : year === 330
                ? '石勒即皇帝位，后赵中央制度改变；称帝与国号不提供直接控制线。'
                : year === 333
                  ? '石勒去世、石弘继位，石虎掌握军政权力；继承转折年不把政权名号变动视为疆界静止证据。'
                  : year === 334
                    ? '石虎废石弘并掌权，后赵中枢发生改变；此点只标示政治中心，仍无法复原全年疆界。'
                    : year === 335
                      ? '《资治通鉴》与相关研究将正式迁都系于建武元年九月。襄国点只指迁都前阶段，邺点指迁都后阶段；年度地图同时显示两点是对月内转换的提示，不表示两处全年并列同等首都。'
                      : year === 336
                        ? '石虎继续在邺营建并迁运洛阳旧物；该建设与物资转运不等于疆域扩张或逐年控制边界。'
                        : `${year}年后赵政治中枢位置参照。编年史载有区域战争及政权竞争，但不足以据中心点复原该年逐年实控疆域。`,
      evidence:{evidenceLevel:'D' as const,derivation:'control-centers' as const,reviewStatus:'source-checked' as const,
        citations:[...laterZhaoAnnualCitations,
          {title:`山河年轮地点资料：${center.placeId === 'xiangguo' ? '襄国' : '邺'}`,urlOrCitation:`src/data/places.ts#${center.placeId}`,pageOrRecord:'近似现代定位，仅表示古代城市/政治中心的项目坐标，不表示城垣边界。'}],
        uncertaintyNote:year === 335
          ? '九月迁都的具体月日不作伪精确表达，年点同时标记迁出前后两个中心，只作过渡提示。'
          : '政治中心可定位不等于逐年疆界可复原。现有历史来源为近似时段模型，不据其邻年面推定本年直接控制范围。'},
    }));
  }),
  {
    id:'special-wei-265-luoyang-center', polityId:'wei_three', validFrom:265, validTo:265,
    snapshotYear:265, temporalKind:'interval', presentation:'reference', sourceName:'魏晋禅代年洛阳政治中心参照',
    sourceUrl:weiJinTransitionCitation.urlOrCitation, vertexCount:1, geometry:{type:'Point',coordinates:[112.45,34.62]},
    controlType:'direct', confidence:'low', sourceIds:['wei-jin-transition-265-primary-sources','modern-geography-reference'], mapRepresentation:'control-centers',
    notes:'洛阳是曹魏禅代发生地与中央政治中心；265年十二月政权交接，不能把该点解释为曹魏全年稳定控制，也不据都城推定疆界。吴当年仍存续，属于并存政权背景。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',
      citations:[weiJinTransitionCitation,luoyangPlaceCitation],
      uncertaintyNote:'编年史支持洛阳政治中心及十二月禅代；年内政权更替使全年疆域面无法由此确定。此点只表示中心位置。'},
  },
  {
    id:'special-wu-265-wuchang-center', polityId:'wu_three', validFrom:265, validTo:265,
    snapshotYear:265, temporalKind:'interval', presentation:'reference', sourceName:'吴迁都武昌后的年末政治中心参照',
    sourceUrl:weiJinTransitionCitation.urlOrCitation, vertexCount:1, geometry:{type:'Point',coordinates:[114.88,30.40]},
    controlType:'direct', confidence:'low', sourceIds:['wei-jin-transition-265-primary-sources','wuchang-wu-capital-location','modern-geography-reference'], mapRepresentation:'control-centers',
    notes:'《资治通鉴》记吴于265年冬迁都武昌。点位使用今鄂州城市级近似坐标，表示迁都后的年末政治中心参照，不表示吴的控制边界；年值不呈现迁都的具体月日。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',
      citations:[weiJinTransitionCitation,wuchangLocationCitation,{title:'联合国地名专家组地名数据库：鄂州城市坐标',urlOrCitation:'https://ungegn.un.org/dashboard/cities/details?id=2006',pageOrRecord:'鄂州城市级参考坐标：东经114.88、北纬30.4；非吴王城遗址测绘坐标。'}],
      uncertaintyNote:'史籍只记年内冬季迁都；遗址位于今鄂州城区，现代城市坐标仅提供近似区域定位，不代表古城范围、全年中心或疆界。'},
  },
  {
    id:'special-wu-221-wuchang-center', polityId:'wu_three', validFrom:221, validTo:221,
    snapshotYear:221, temporalKind:'interval', presentation:'reference', sourceName:'孙权迁都武昌后的吴王政权中心参照',
    sourceUrl:wuFormationCitation.urlOrCitation, vertexCount:1, geometry:{type:'Point',coordinates:[114.88,30.40]},
    controlType:'direct', confidence:'low', sourceIds:['three-kingdoms-formation-220-223-primary-sources','wuchang-wu-capital-location','modern-geography-reference'], mapRepresentation:'control-centers',
    notes:'221年孙权受魏封吴王并自公安徙都鄂、改名武昌。此点表示项目纳入的吴王政权中央政治中心，不把受封关系简化为吴已独立称帝，也不表示疆界；项目将独立改元阶段另记于222年。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',
      citations:[wuFormationCitation,wuchangLocationCitation,{title:'联合国地名专家组地名数据库：鄂州城市坐标',urlOrCitation:'https://ungegn.un.org/dashboard/cities/details?id=2006',pageOrRecord:'鄂州城市级参考坐标：东经114.88、北纬30.4；非吴王城遗址测绘坐标。'}],
      uncertaintyNote:'点位只表示221年迁都后的政治中心近似位置；孙权接受魏册封与江东实际军政并存，吴的独立称帝及疆域边界不能由此点推出。'},
  },
  {
    id:'special-wei-220-223-luoyang-center', polityId:'wei_three', validFrom:220, validTo:223,
    snapshotYear:220, temporalKind:'interval', presentation:'reference', sourceName:'曹魏形成期洛阳都城中心参照',
    sourceUrl:weiFormationCitation.urlOrCitation, vertexCount:1, geometry:{type:'Point',coordinates:[112.45,34.62]},
    controlType:'direct', confidence:'low', sourceIds:['three-kingdoms-formation-220-223-primary-sources','modern-geography-reference'], mapRepresentation:'control-centers',
    notes:'表示220—223年曹魏以洛阳为都的政治中心；前220年代汉魏禅代、蜀汉和孙吴先后建政，不据都城或汉廷名义辖地推定曹魏连续疆界。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',
      citations:[weiFormationCitation,luoyangPlaceCitation],
      uncertaintyNote:'史料支持魏都洛阳这一中心事实，不足以确定220—223年逐年的直接控制边界。'},
  },
  {
    id:'special-shu-221-223-chengdu-center', polityId:'shu_three', validFrom:221, validTo:223,
    snapshotYear:221, temporalKind:'interval', presentation:'reference', sourceName:'蜀汉建政期成都都城中心参照',
    sourceUrl:shuFormationCitation.urlOrCitation, vertexCount:1, geometry:{type:'Point',coordinates:[104.07,30.67]},
    controlType:'direct', confidence:'low', sourceIds:['three-kingdoms-formation-220-223-primary-sources','modern-geography-reference'], mapRepresentation:'control-centers',
    notes:'表示221年蜀汉在成都建政后的政治中心；222年夷陵战败与223年刘备去世均不支持将224年后的最大或稳定轮廓倒推至本段。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',
      citations:[shuFormationCitation,chengduPlaceCitation],
      uncertaintyNote:'史料支持成都作为蜀汉都城，不足以确定221—223年逐年的连续控制边界。'},
  },
  {
    id:'special-sui-581-582-changan-center', polityId:'sui', validFrom:581, validTo:582,
    snapshotYear:581, temporalKind:'interval', presentation:'reference', sourceName:'隋初长安政治中心参照',
    sourceUrl:suiFoundingCitation.urlOrCitation, vertexCount:1, geometry:{type:'Point',coordinates:[108.94,34.34]},
    controlType:'direct', confidence:'low', sourceIds:['zizhi-tongjian','modern-geography-reference'], mapRepresentation:'control-centers',
    notes:'表示581—582年隋朝初期长安政治中心；582年开始营建新都，迁都发生于583年。陈朝仍在江南，与隋并存。本点不表示隋的疆界或稳定连续控制区。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',
      citations:[suiFoundingCitation,suiCapitalCitation,changanCenterCitation],
      uncertaintyNote:'史料可核政权建立、都城迁移年份与陈隋并存，但不能支持581—582年隋的完整疆域几何；坐标是现代城市近似定位。'},
  },
  {
    id:'special-sui-583-586-daxing-center', polityId:'sui', validFrom:583, validTo:586,
    snapshotYear:583, temporalKind:'interval', presentation:'reference', sourceName:'隋大兴都城中心参照',
    sourceUrl:suiCapitalCitation.urlOrCitation, vertexCount:1, geometry:{type:'Point',coordinates:[108.935,34.25]},
    controlType:'direct', confidence:'low', sourceIds:['zizhi-tongjian','sui-tang-changan-gis-study','modern-geography-reference'], mapRepresentation:'control-centers',
    notes:'表示583—586年迁入大兴城后的政治中心区域参照。坐标取学术研究所述隋唐长安城区范围边界框中点推算，不是宫城中心、考古城址中心或城垣；陈朝仍存，不据隋后期版图外推。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',
      citations:[suiCapitalCitation,suiFoundingCitation,suiTangChanganGisCitation],
      uncertaintyNote:'迁都年份与隋唐长安城区范围有来源支持；点位由城区范围边界框中点推算，不能解释为大兴宫位置、古城垣或政权边界。'},
  },
  {
    id:'special-tang-618-622-changan-center', polityId:'tang', validFrom:618, validTo:622,
    snapshotYear:618, temporalKind:'interval', presentation:'reference', sourceName:'唐初长安政治中心参照',
    sourceUrl:tangEarlyChronicleCitations[0].urlOrCitation, vertexCount:1, geometry:{type:'Point',coordinates:[108.935,34.25]},
    controlType:'direct', confidence:'low', sourceIds:['zizhi-tongjian','sui-tang-changan-gis-study','modern-geography-reference'], mapRepresentation:'control-centers',
    notes:'仅显示唐初中央政治中心长安的区域参照。点位由隋唐长安城区范围边界框中点推算，不是宫城中心或城垣。618—622年唐与薛举／薛仁杲、李轨、刘武周、王世充、窦建德、刘黑闼等势力的控制区域多次变化；本点不代表这些战事中的占领范围、唐的连续疆界或名义声索。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',
      citations:[...tangEarlyChronicleCitations,suiTangChanganGisCitation,{title:'山河年轮地点资料：唐长安',urlOrCitation:'src/data/places.ts#tang_changan',pageOrRecord:'研究所载隋唐长安城区范围的边界框中点推算，非城墙或宫城中心。'}],
      uncertaintyNote:'编年史支持唐廷在长安建立并持续记载中央政务，同时显示618—622年尚未完成全国统一；学术城区范围仅支持低置信度区域参照点，不足以复原逐年疆界。'},
  },
  {
    id:'special-later-liang-907-908-kaifeng-center', polityId:'liang_later', validFrom:907, validTo:908,
    snapshotYear:907, temporalKind:'interval', presentation:'reference', sourceName:'后梁初期大梁都城中心参照',
    sourceUrl:laterLiangChronicleCitations[0].urlOrCitation, vertexCount:1, geometry:{type:'Point',coordinates:[114.34,34.80]},
    controlType:'direct', confidence:'low', sourceIds:['zizhi-tongjian','modern-geography-reference'], mapRepresentation:'control-centers',
    notes:'907—908年后梁以大梁（汴州，改置开封府）为政治中心；该点只表示都城近似位置，不表示后梁全国疆域、藩镇实控边界或唐末名义辖地。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',
      citations:[laterLiangChronicleCitations[0],kaifengEarlyLaterLiangCitation,{title:'山河年轮地点资料：开封',urlOrCitation:'src/data/places.ts#kaifeng',pageOrRecord:'今开封市近似定位，不代表五代汴州／开封府城垣边界。'}],
      uncertaintyNote:'史料支持后梁建都大梁及开封府名称变更；其地方和藩镇控制范围不能从都城位置推定。'},
  },
  {
    id:'special-later-liang-909-912-luoyang-center', polityId:'liang_later', validFrom:909, validTo:912,
    snapshotYear:909, temporalKind:'interval', presentation:'reference', sourceName:'后梁迁都洛阳阶段政治中心参照',
    sourceUrl:laterLiangChronicleCitations[1].urlOrCitation, vertexCount:1, geometry:{type:'Point',coordinates:[112.45,34.62]},
    controlType:'direct', confidence:'low', sourceIds:['zizhi-tongjian','modern-geography-reference'], mapRepresentation:'control-centers',
    notes:'909年正月迁都洛阳，洛阳为909—912年主要朝廷中心；913年朱友贞在大梁即位后复归大梁。909年间仍有帝王往返大梁、洛阳处理军政，本点仅表示该阶段主要都城，不表示全年固定驻跸，更不表示疆域。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',
      citations:[laterLiangChronicleCitations[1],luoyangLaterLiangCitation,{title:'山河年轮地点资料：洛阳',urlOrCitation:'src/data/places.ts#luoyang',pageOrRecord:'今洛阳市近似定位，不表示后梁河南府城或宫城边界。'}],
      uncertaintyNote:'《通鉴》记录909年正月迁入洛阳及913年新君在大梁即位；政治中枢与帝王巡行不能转换为确定疆界，点位仅作主要都城参照。'},
  },
  {
    id:'special-hedong-jin-895-922-taiyuan-center', polityId:'jin_hedong', validFrom:895, validTo:922,
    snapshotYear:895, temporalKind:'interval', presentation:'reference', sourceName:'河东晋王政权晋阳政治军事中心参照',
    sourceUrl:'https://zh.wikisource.org/zh-hans/資治通鑑/卷260', vertexCount:1, geometry:{type:'Point',coordinates:[112.55,37.87]},
    controlType:'unspecified', confidence:'low', sourceIds:['hedong-jin-907-923-primary-sources','modern-geography-reference'], mapRepresentation:'control-centers',
    notes:'895—906年李克用受唐廷册封晋王并以河东为军政基础；907—922年李克用、李存勖继续以晋王名义经营河东。晋阳以今太原城市近似点作区域中心参照，不表示晋阳古城精确城址、河东全部州镇或连续疆界；唐廷名义关系、承唐主张与区域自主须分期理解。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',
      citations:[
        {title:'《资治通鉴》卷260·唐纪七十六',urlOrCitation:'https://zh.wikisource.org/zh-hans/資治通鑑/卷260',pageOrRecord:'895年进封李克用为晋王并记其河东军政基础；支持晋王阶段起点和区域中心参照，不支持连续疆界。'},
        {title:'《资治通鉴》卷262·唐纪七十八',urlOrCitation:'https://zh.wikisource.org/zh-hans/資治通鑑/卷262',pageOrRecord:'900年记李克用整治晋阳城堑；支持晋阳军政据点参照，不表示城垣范围或全域边界。'},
        {title:'《资治通鉴》卷266·后梁纪一',urlOrCitation:'https://zh.wikisource.org/zh-hans/資治通鑑/卷266',pageOrRecord:'907年梁代唐时记河东晋王、河东兵与晋阳军政背景；支持并存政权阶段和晋阳参照，不支持全年连续边界。'},
        {title:'《资治通鉴》卷272·后唐纪一',urlOrCitation:'https://zh.wikisource.org/zh-hans/資治通鑑/卷272',pageOrRecord:'923年李存勖称帝建后唐，标记晋王阶段的政权形态转换；称帝、攻梁和后续接收不合并为疆界。'},
        {title:'山河年轮地点资料：太原',urlOrCitation:'src/data/places.ts#taiyuan',pageOrRecord:'今太原市近似城市中心，不表示晋阳古城具体遗址边界。'}],
      uncertaintyNote:'“河东晋王政权”是对晋王时期事实军政集团的项目建模名，不主张其以独立主权国家名义建国。晋阳只能作区域中心参照；战争、州镇归附、名义承唐和实际控制变化均不能推定连续疆界。'},
  },
  {
    id:'special-northern-song-960-kaifeng-center', polityId:'song_northern', validFrom:960, validTo:960,
    snapshotYear:960, temporalKind:'interval', presentation:'reference', sourceName:'北宋建政年开封政治中心参照',
    sourceUrl:northernSongFoundingCitation.urlOrCitation, vertexCount:1, geometry:{type:'Point',coordinates:[114.34,34.80]},
    controlType:'direct', confidence:'low', sourceIds:['songshi-vol1-taizu','xuzizhi-tongjian-changbian-vol1','china-chronology','modern-geography-reference'], mapRepresentation:'control-centers',
    notes:'960年后周禅代、赵匡胤于开封建宋；此点只表示北宋建立后的中央政治中心近似位置，不表示后周疆域、宋初直接控制边界、军事占领区、藩属关系或后世统一范围。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',
      citations:[northernSongFoundingCitation,northernSongFoundingContextCitation,{title:'山河年轮地点资料：开封',urlOrCitation:'src/data/places.ts#kaifeng',pageOrRecord:'开封市近似定位，不代表960年开封城垣或陈桥驿位置。'}],
      uncertaintyNote:'史料足以确认建宋后开封为政治中心；宋初与辽、北汉及南方诸政权并存且仍有军事整合过程，现有证据不足以复原960全年连续疆界。该点不是疆域几何。'},
  },
  {
    id:'special-liu-song-420-425-jiankang-center', polityId:'song_southern', validFrom:420, validTo:425,
    snapshotYear:420, temporalKind:'interval', presentation:'reference', sourceName:'刘宋初期建康政治中心参照',
    sourceUrl:'https://zh.wikisource.org/wiki/資治通鑑/卷119', vertexCount:1, geometry:{type:'Point',coordinates:[118.80,32.06]},
    controlType:'direct', confidence:'low', sourceIds:['zizhi-tongjian','modern-geography-reference'], mapRepresentation:'control-centers',
    notes:'表示刘宋建立至宋文帝初期的建康中央政治中心。420年东晋禅代与刘宋建政是年内政权转换；422年刘裕去世、424年少帝被废和文帝入建康均不表示中心离开建康。此点不是刘宋疆域或北伐战果范围。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',
      citations:[
        {title:'《资治通鉴》卷119—120·宋纪一至二',urlOrCitation:'https://zh.wikisource.org/wiki/資治通鑑/卷119；https://zh.wikisource.org/wiki/資治通鑑/卷120',pageOrRecord:'420—425年刘宋建立、武帝去世、少帝继位及文帝在建康即位；不用于推定疆界。'},
        {title:'山河年轮地点资料：建康',urlOrCitation:'src/data/places.ts#jiankang',pageOrRecord:'今南京市近似城市点位，不表示六朝建康城垣边界。'}],
      uncertaintyNote:'史料支持420—425年建康中央政治中心连续存在，但不能据此复原刘宋逐年直接控制边界；420年为年内政权交接，点只作中心参照。'},
  },
  {
    id:'special-qi-southern-479-jiankang-center', polityId:'qi_southern', validFrom:479, validTo:479,
    snapshotYear:479, temporalKind:'interval', presentation:'reference', sourceName:'南齐受禅建政年建康中心参照',
    sourceUrl:'https://zh.wikisource.org/zh-hans/資治通鑑/卷135', vertexCount:1, geometry:{type:'Point',coordinates:[118.80,32.06]},
    controlType:'direct', confidence:'low', sourceIds:['southern-qi-founding-479-primary-source','modern-geography-reference'], mapRepresentation:'control-centers',
    notes:'479年萧道成在建康受禅称帝，点仅标记南齐建政节点的中央政治中心。刘宋与南齐年内交接并不等于南齐已完整接收刘宋旧境；不据此点绘制双方边界。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',
      citations:[
        {title:'《资治通鉴》卷135·齐纪一',urlOrCitation:'https://zh.wikisource.org/zh-hans/資治通鑑/卷135',pageOrRecord:'479年宋顺帝禅位、萧道成在建康称帝；用于事件与中心定位，不用于推定疆界。'},
        {title:'山河年轮地点资料：建康',urlOrCitation:'src/data/places.ts#jiankang',pageOrRecord:'今南京近似城市点位，不表示建康城垣边界。'}],
      uncertaintyNote:'史料支持建康为南齐建政中心；不支持据受禅地点推断479年全部直接控制范围或年内地方接收。'},
  },
  {
    id:'special-liang-southern-502-509-jiankang-center', polityId:'liang_southern', validFrom:502, validTo:509,
    snapshotYear:502, temporalKind:'interval', presentation:'reference', sourceName:'南梁初期建康政治中心参照',
    sourceUrl:'https://zh.wikisource.org/zh-hans/資治通鑑/卷145', vertexCount:1, geometry:{type:'Point',coordinates:[118.80,32.06]},
    controlType:'direct', confidence:'low', sourceIds:['liang-founding-502-509-primary-sources','modern-geography-reference'], mapRepresentation:'control-centers',
    notes:'表示502年受禅建梁后至509年南梁中央政治中心建康。天监年间梁魏战事与临时军事进退不表示稳定的直接控制边界；点不代表建康城垣或南梁全境。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',
      citations:[
        {title:'《资治通鉴》卷145—147·梁纪一至三',urlOrCitation:'https://zh.wikisource.org/zh-hans/資治通鑑/卷145；https://zh.wikisource.org/zh-hans/資治通鑑/卷146；https://zh.wikisource.org/zh-hans/資治通鑑/卷147',pageOrRecord:'覆盖502—509年梁朝建立及早期事件，支持建康政治中心与战争时间线，不支持逐年疆界复原。'},
        {title:'山河年轮地点资料：建康',urlOrCitation:'src/data/places.ts#jiankang',pageOrRecord:'今南京市近似城市点位，不表示六朝建康城垣边界。'}],
      uncertaintyNote:'建康中心在本时段稳定，但南北战争及地方控制变化不能从都城位置推定；现阶段仅提供中心参照，疆域面留空。'},
  },
  {
    id:'special-chen-southern-557-560-jiankang-center', polityId:'chen_southern', validFrom:557, validTo:560,
    snapshotYear:557, temporalKind:'interval', presentation:'reference', sourceName:'南陈建政初期建康政治中心参照',
    sourceUrl:'https://zh.wikisource.org/zh-hans/資治通鑑/卷167', vertexCount:1, geometry:{type:'Point',coordinates:[118.80,32.06]},
    controlType:'direct', confidence:'low', sourceIds:['southern-chen-founding-557-primary-sources','modern-geography-reference'], mapRepresentation:'control-centers',
    notes:'表示557年梁陈禅代后至560年南陈中央政治中心建康。557年为年内承接，559年陈霸先去世、陈蒨继位；这类政权更替和战事不表示完整疆界。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',
      citations:[
        {title:'《资治通鉴》卷167—168·陈纪一至二',urlOrCitation:'https://zh.wikisource.org/zh-hans/資治通鑑/卷167；https://zh.wikisource.org/zh-hans/資治通鑑/卷168',pageOrRecord:'557年建陈、559年陈霸先去世与陈蒨继位、560年文帝朝节点；支持建康政治中心，不支持边界推定。'},
        {title:'山河年轮地点资料：建康',urlOrCitation:'src/data/places.ts#jiankang',pageOrRecord:'今南京近似城市点位，不表示城垣。'}],
      uncertaintyNote:'史料支持建康为南陈中央中心；南北军事竞争和梁末旧境接收不能据中心点推算，疆域面留空。'},
  },
  {
    id:'special-zhou-northern-557-560-changan-center', polityId:'zhou_northern', validFrom:557, validTo:560,
    snapshotYear:557, temporalKind:'interval', presentation:'reference', sourceName:'北周建政初期长安政治中心参照',
    sourceUrl:'https://zh.wikisource.org/zh-hans/資治通鑑/卷167', vertexCount:1, geometry:{type:'Point',coordinates:[108.94,34.34]},
    controlType:'direct', confidence:'low', sourceIds:['northern-zhou-founding-557-primary-sources','modern-geography-reference'], mapRepresentation:'control-centers',
    notes:'表示北周557年承接西魏后至560年的长安中央政治中心。560年明帝去世、武帝继位未改变都城节点；此点不表示北周继承西魏全部疆域或其与北齐之间的边界。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',
      citations:[
        {title:'《资治通鉴》卷167—168·陈纪一至二',urlOrCitation:'https://zh.wikisource.org/zh-hans/資治通鑑/卷167；https://zh.wikisource.org/zh-hans/資治通鑑/卷168',pageOrRecord:'557年西魏禅代建周、560年周明帝与武帝更替；支持长安中心，不支持边界推定。'},
        {title:'山河年轮地点资料：长安',urlOrCitation:'src/data/places.ts#changan',pageOrRecord:'今西安近似城市点位，不表示北周长安城垣。'}],
      uncertaintyNote:'史料支持北周中央政治中心延续在长安；控制范围与北齐、南陈相邻或冲突地带仍需分年校勘，疆域面留空。'},
  },
  {
    id:'special-qi-northern-550-554-ye-center', polityId:'qi_northern', validFrom:550, validTo:554,
    snapshotYear:550, temporalKind:'interval', presentation:'reference', sourceName:'北齐建政初期邺都城中心参照',
    sourceUrl:'https://zh.wikisource.org/zh-hans/資治通鑑/卷163', vertexCount:1, geometry:{type:'Point',coordinates:[114.37,36.33]},
    controlType:'direct', confidence:'low', sourceIds:['northern-qi-founding-550-554-sources','modern-geography-reference'], mapRepresentation:'control-centers',
    notes:'表示东魏于550年在邺禅代、北齐建政后至554年的都城政治中心。东魏旧有名义辖区、北齐实际接收和北方战事分开判断；点不表示完整控制界。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',
      citations:[
        {title:'《资治通鉴》卷163—165·梁纪十九至二十一',urlOrCitation:'https://zh.wikisource.org/zh-hans/資治通鑑/卷163；https://zh.wikisource.org/zh-hans/資治通鑑/卷164；https://zh.wikisource.org/zh-hans/資治通鑑/卷165',pageOrRecord:'逐年核对550—554年东魏终止、北齐建政及邺城中心，不用后续轮廓推定疆界。'},
        {title:'山河年轮地点资料：邺',urlOrCitation:'src/data/places.ts#ye',pageOrRecord:'临漳一带近似城市点，不表示邺城考古边界。'}],
      uncertaintyNote:'邺都位置可定位，不能据此推断北齐旧东魏辖区的实际接收边界；本记录仅表示中心。'},
  },
  {
    id:'special-turkic-552-554-uhtuken-reference', polityId:'turkic', validFrom:552, validTo:554,
    snapshotYear:552, temporalKind:'interval', presentation:'reference', sourceName:'第一突厥汗国初期于都斤—鄂尔浑移动核心区域参照',
    sourceUrl:'https://zh.wikisource.org/zh-hans/周書/卷50', vertexCount:1, geometry:{type:'Point',coordinates:[102.50,47.50]},
    controlType:'unspecified', confidence:'low', sourceIds:['turkic-founding-552-554-sources','turkic-orkhon-heritage'], mapRepresentation:'control-centers',
    notes:'移动汗廷的区域政治核心参照，使用既有于都斤—鄂尔浑区域点；不表示552年战场、固定营地、全部部众或稳定疆界。坐标只代表蒙古国中部区域概略中心。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',
      citations:[
        {title:'《周书》卷50·突厥传、《北史》卷99·突厥传及《资治通鉴》卷164—165',urlOrCitation:'https://zh.wikisource.org/zh-hans/周書/卷50；https://zh.wikisource.org/zh-hans/北史/卷99；https://zh.wikisource.org/zh-hans/資治通鑑/卷164；https://zh.wikisource.org/zh-hans/資治通鑑/卷165',pageOrRecord:'552—554年汗权建立及草原部众网络；不提供可唯一定位的固定都城或疆界。'},
        {title:'山河年轮地点资料：于都斤／鄂尔浑',urlOrCitation:'src/data/places.ts#uhtuken',pageOrRecord:'蒙古国中部区域概略中心，pointType为mobile-centre，区域表达非精确城址。'}],
      uncertaintyNote:'史料显示可汗与部众的流动草原政治网络，不能确认单一年度固定都城；此点是低置信度的区域参照，不编码直接控制范围。'},
  },
  {
    id:'special-qi-northern-577-ye-transition-center', polityId:'qi_northern', validFrom:577, validTo:577,
    snapshotYear:577, temporalKind:'interval', presentation:'reference', sourceName:'北齐终止年邺城政治转换中心参照',
    sourceUrl:'https://zh.wikisource.org/zh-hans/資治通鑑/卷173', vertexCount:1, geometry:{type:'Point',coordinates:[114.37,36.33]},
    controlType:'disputed', confidence:'low', sourceIds:['northern-qi-termination-577-primary-sources','modern-geography-reference'], mapRepresentation:'control-centers',
    notes:'邺在577年初仍是北齐政治中心，随后遭北周攻取。点表示年内政权转换节点，不代表全年北齐控制、北周占领范围或双方疆界。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',
      citations:[
        {title:'《资治通鉴》卷173·陈纪七与《北齐书》卷8·幼主纪',urlOrCitation:'https://zh.wikisource.org/zh-hans/資治通鑑/卷173；https://zh.wikisource.org/zh-hans/北齊書/卷8',pageOrRecord:'577年邺城的北齐政治中心、北周攻取及中央政权终止。'},
        {title:'山河年轮地点资料：邺',urlOrCitation:'src/data/places.ts#ye',pageOrRecord:'临漳一带近似城市定位，不表示邺城墙址边界。'}],
      uncertaintyNote:'政权转换发生在年内，且攻取、出奔、被俘和地方接收并非同一时刻；本点只表示转换城市，不编码控制范围。'},
  },
  {
    id:'special-later-tang-923-925-luoyang-center', polityId:'tang_later', validFrom:923, validTo:925,
    snapshotYear:923, temporalKind:'interval', presentation:'reference', sourceName:'后唐建政初期洛阳政治中心参照',
    sourceUrl:'https://zh.wikisource.org/zh-hans/資治通鑑/卷272', vertexCount:1, geometry:{type:'Point',coordinates:[112.45,34.62]},
    controlType:'direct', confidence:'low', sourceIds:['later-tang-founding-923-925-sources','modern-geography-reference'], mapRepresentation:'control-centers',
    notes:'表示后唐923年建政并在年内迁入洛阳后至925年的中央政治中心。923年魏州称帝、攻入开封及925年灭前蜀分属不同事件；点不代表年初中心、军队行进路线或攻取地区的全年直辖边界。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',
      citations:[
        {title:'《资治通鉴》卷272—274·后唐纪一至三',urlOrCitation:'https://zh.wikisource.org/zh-hans/資治通鑑/卷272；https://zh.wikisource.org/zh-hans/資治通鑑/卷273；https://zh.wikisource.org/zh-hans/資治通鑑/卷274',pageOrRecord:'923年称帝与攻梁、924年政务、925年攻蜀及前蜀终止按年分开核对。'},
        {title:'山河年轮地点资料：洛阳',urlOrCitation:'src/data/places.ts#luoyang',pageOrRecord:'今洛阳市近似城市点，不表示五代洛阳城垣边界。'}],
      uncertaintyNote:'洛阳作为后唐首都中心可定位，但923年内政治迁移、后梁旧地接收和925年攻蜀不能从一个点推出逐年疆域。'},
  },
  {
    id:'special-later-tang-936-luoyang-transition-center', polityId:'tang_later', validFrom:936, validTo:936,
    snapshotYear:936, temporalKind:'interval', presentation:'reference', sourceName:'后唐终结年洛阳政治转换中心参照',
    sourceUrl:'https://zh.wikisource.org/zh-hans/資治通鑑/卷280', vertexCount:1, geometry:{type:'Point',coordinates:[112.45,34.62]},
    controlType:'disputed', confidence:'low', sourceIds:['later-tang-termination-936-primary-source','modern-geography-reference'], mapRepresentation:'control-centers',
    notes:'表示936年后唐末帝在洛阳终局及后晋进入洛阳的年内转换节点。石敬瑭五月在太原举兵、九月契丹军至晋阳、十一月受册称帝、十二月洛阳终局先后发生；点不代表后唐全年控制、后晋全部接收或十六州割让范围。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',
      citations:[
        {title:'《资治通鉴》卷280·后晋纪一',urlOrCitation:'https://zh.wikisource.org/zh-hans/資治通鑑/卷280',pageOrRecord:'936年五月至十二月河东起兵、契丹援军、受册建晋、后唐洛阳终局及政权接收。'},
        {title:'山河年轮地点资料：洛阳',urlOrCitation:'src/data/places.ts#luoyang',pageOrRecord:'今洛阳市近似城市点，不表示五代洛阳城垣边界。'}],
      uncertaintyNote:'洛阳仅作为年内终局与承接的城市参照；后唐、后晋及契丹的军事实控和地方接收时点不一，不能由此点推出936年任何一方的疆域。'},
  },
  {
    id:'special-later-jin-936-taiyuan-origin-center', polityId:'jin_later', validFrom:936, validTo:936,
    snapshotYear:936, temporalKind:'interval', presentation:'reference', sourceName:'后晋建立年太原起兵中心参照',
    sourceUrl:'https://zh.wikisource.org/zh-hans/資治通鑑/卷280', vertexCount:1, geometry:{type:'Point',coordinates:[112.55,37.87]},
    controlType:'unspecified', confidence:'low', sourceIds:['later-tang-termination-936-primary-source','modern-geography-reference'], mapRepresentation:'control-centers',
    notes:'表示石敬瑭936年五月据太原起兵、后续退守晋阳并获契丹援助的政治军事中心参照。后晋受册地点在柳林，后续又南下洛阳；此点不将太原等同受册地点、正式都城、后晋全年直辖区或其全部控制范围。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',
      citations:[
        {title:'《资治通鉴》卷280·后晋纪一',urlOrCitation:'https://zh.wikisource.org/zh-hans/資治通鑑/卷280',pageOrRecord:'936年五月石敬瑭据河东举兵、战守晋阳；十一月在柳林受册，后续南下。'},
        {title:'山河年轮地点资料：太原',urlOrCitation:'src/data/places.ts#taiyuan',pageOrRecord:'今太原市近似城市点，不表示五代晋阳城址或城墙范围。'}],
      uncertaintyNote:'太原点只标识后晋形成过程中的军事政治中心；史料另载受册在柳林且此后南下。政权创建、正式都城与控制范围不能互相替代。'},
  },
  {
    id:'special-later-jin-947-kaifeng-transition-center', polityId:'jin_later', validFrom:947, validTo:947,
    snapshotYear:947, temporalKind:'interval', presentation:'reference', sourceName:'后晋覆亡年开封政权转换中心参照',
    sourceUrl:'https://zh.wikisource.org/zh-hans/資治通鑑/卷286', vertexCount:1, geometry:{type:'Point',coordinates:[114.34,34.80]},
    controlType:'disputed', confidence:'low', sourceIds:['later-jin-termination-947-primary-sources','modern-geography-reference'], mapRepresentation:'control-centers',
    notes:'表示947年正月契丹军进入开封、后晋末帝出降和后晋中央终止的城市转换节点。后晋控制已在年初结束；点不代表后晋全年控制，也不把契丹占领或后汉后来入汴转为后晋边界。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',
      citations:[
        {title:'《资治通鉴》卷286·后汉纪一',urlOrCitation:'https://zh.wikisource.org/zh-hans/資治通鑑/卷286',pageOrRecord:'947年正月契丹进入开封，后晋末帝及家人出降、后晋政治结构终止。'},
        {title:'山河年轮地点资料：开封',urlOrCitation:'src/data/places.ts#kaifeng',pageOrRecord:'今开封市近似城市点，不表示五代大梁城垣。'}],
      uncertaintyNote:'该点只标记终结城市节点；后晋控制终止、契丹军事占领及后汉进入中原发生在同一年度的不同阶段。'},
  },
  {
    id:'special-khitan-947-kaifeng-occupation-center', polityId:'khitan', validFrom:947, validTo:947,
    snapshotYear:947, temporalKind:'interval', presentation:'reference', sourceName:'契丹南下占领开封的阶段性中心参照',
    sourceUrl:'https://zh.wikisource.org/zh-hans/資治通鑑/卷286', vertexCount:1, geometry:{type:'Point',coordinates:[114.34,34.80]},
    controlType:'direct', confidence:'low', sourceIds:['later-jin-termination-947-primary-sources','modern-geography-reference'], mapRepresentation:'control-centers',
    notes:'表示契丹军947年正月至四月在开封建立占领统治并控制宫城、城门的阶段性城市中心。契丹军五月后在后汉进军下从河南退却；该点不表示辽对整个中原或开封全年持续控制，也不转绘契丹名义声索为疆界。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',
      citations:[
        {title:'《资治通鉴》卷286《后汉纪一》、卷287《后汉纪二》',urlOrCitation:'https://zh.wikisource.org/zh-hans/資治通鑑/卷286；https://zh.wikisource.org/zh-hans/資治通鑑/卷287',pageOrRecord:'卷286记契丹进入开封与占领；卷287记后汉南下、契丹河南军退却及离开大梁。'},
        {title:'山河年轮地点资料：开封',urlOrCitation:'src/data/places.ts#kaifeng',pageOrRecord:'今开封市近似城市点，不表示五代大梁城垣。'}],
      uncertaintyNote:'此为年度内阶段性军事占领参照，不能表达覆盖时间以外的直接管辖、河南全域或后续辽政权疆界。'},
  },
  {
    id:'special-later-han-947-taiyuan-center', polityId:'han_later', validFrom:947, validTo:947,
    snapshotYear:947, temporalKind:'interval', presentation:'reference', sourceName:'后汉初建太原政治中心参照',
    sourceUrl:'https://zh.wikisource.org/zh-hans/資治通鑑/卷286', vertexCount:1, geometry:{type:'Point',coordinates:[112.55,37.87]},
    controlType:'direct', confidence:'low', sourceIds:['later-jin-termination-947-primary-sources','modern-geography-reference'], mapRepresentation:'control-centers',
    notes:'表示刘知远于947年二月在太原即皇帝位、建立后汉政权的早期政治中心。后汉五月由太原发兵南下，随后入洛阳、开封；太原点不表示后汉全年疆域或进入中原前已经接收开封。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',
      citations:[
        {title:'《资治通鉴》卷286·后汉纪一',urlOrCitation:'https://zh.wikisource.org/zh-hans/資治通鑑/卷286',pageOrRecord:'947年二月刘知远在太原即皇帝位，五月之前仍在晋阳筹备进军。'},
        {title:'山河年轮地点资料：太原',urlOrCitation:'src/data/places.ts#taiyuan',pageOrRecord:'今太原市近似城市点，不表示五代晋阳城垣范围。'}],
      uncertaintyNote:'后汉在947年经历太原建政和南下接管过程；此点只标政治中心，不代表全年持续在太原或控制范围。'},
  },
  {
    id:'special-later-han-947-kaifeng-center', polityId:'han_later', validFrom:947, validTo:947,
    snapshotYear:947, temporalKind:'interval', presentation:'reference', sourceName:'后汉进入开封后的都城中心参照',
    sourceUrl:'https://zh.wikisource.org/zh-hans/資治通鑑/卷287', vertexCount:1, geometry:{type:'Point',coordinates:[114.34,34.80]},
    controlType:'direct', confidence:'low', sourceIds:['later-jin-termination-947-primary-sources','modern-geography-reference'], mapRepresentation:'control-centers',
    notes:'表示后汉军947年进入开封并于六月复以汴州为东京、改国号汉后的政治中心阶段。后汉接管开封发生在契丹占领与撤退过程中；此点不代表年初已控制开封、后晋旧地立即全面归附或全年疆域。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',
      citations:[
        {title:'《资治通鉴》卷287·后汉纪二',urlOrCitation:'https://zh.wikisource.org/zh-hans/資治通鑑/卷287',pageOrRecord:'947年五月后汉进入洛阳、开封，六月复汴州为东京并改国号汉。'},
        {title:'山河年轮地点资料：开封',urlOrCitation:'src/data/places.ts#kaifeng',pageOrRecord:'今开封市近似城市点，不表示五代大梁城垣。'}],
      uncertaintyNote:'开封点仅用于后汉中枢进入后的阶段性定位；各地归附时间不一，不能推导947年完整中原疆域。'},
  },
  {
    id:'special-later-zhou-951-959-kaifeng-center', polityId:'zhou_later', validFrom:951, validTo:959,
    snapshotYear:951, temporalKind:'interval', presentation:'reference', sourceName:'后周951—959年开封中央政治中心参照',
    sourceUrl:'https://zh.wikisource.org/zh-hans/資治通鑑/卷290', vertexCount:1, geometry:{type:'Point',coordinates:[114.34,34.80]},
    controlType:'direct', confidence:'low', sourceIds:['later-zhou-formation-951-959-primary-sources','modern-geography-reference'], mapRepresentation:'control-centers',
    notes:'表示后周951—959年以开封为中央政治中心的城市参照。期间后周边境和军事控制显著变化：954年与北汉、契丹军交战，955年经营秦凤，956—958年对南唐作战并取得江北地，959年北向攻辽；点不代表上述各年的相同控制范围或完整疆界。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',
      citations:[
        {title:'《资治通鉴》卷290—294·后周纪一至五',urlOrCitation:'https://zh.wikisource.org/zh-hans/資治通鑑/卷290；https://zh.wikisource.org/zh-hans/資治通鑑/卷291；https://zh.wikisource.org/zh-hans/資治通鑑/卷292；https://zh.wikisource.org/zh-hans/資治通鑑/卷293；https://zh.wikisource.org/zh-hans/資治通鑑/卷294',pageOrRecord:'逐年核对951—959年后周建政、继承、边境战争、秦凤与淮南战事、南唐关系及959年北向攻辽；来源提供编年事件，不提供可重绘的逐年疆界坐标。'},
        {title:'山河年轮地点资料：开封',urlOrCitation:'src/data/places.ts#kaifeng',pageOrRecord:'今开封市近似城市点，不表示五代大梁城垣。'}],
      uncertaintyNote:'都城位置可确认，但战役胜负、临时占领、割地条约、奉正朔与直接行政控制不是同一含义；本点不编码疆界。'},
  },
  {
    id:'special-northern-han-951-taiyuan-founding-center', polityId:'northern_han', validFrom:951, validTo:951,
    snapshotYear:951, temporalKind:'interval', presentation:'reference', sourceName:'北汉建政年太原政治中心参照',
    sourceUrl:'https://zh.wikisource.org/zh-hans/資治通鑑/卷290', vertexCount:1, geometry:{type:'Point',coordinates:[112.55,37.87]},
    controlType:'direct', confidence:'low', sourceIds:['later-zhou-formation-951-959-primary-sources','modern-geography-reference'], mapRepresentation:'control-centers',
    notes:'表示刘旻951年在太原建立北汉后的政治中心参照，与开封的后周同时存在。后汉终止、后周受禅和北汉建政是相邻但不同的政权过程；点不表示北汉完整疆域或后周控制北方全部区域。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',
      citations:[
        {title:'《资治通鉴》卷290·后周纪一',urlOrCitation:'https://zh.wikisource.org/zh-hans/資治通鑑/卷290',pageOrRecord:'951年正月郭威受禅建立后周；刘旻据太原称帝建立北汉。'},
        {title:'山河年轮地点资料：太原',urlOrCitation:'src/data/places.ts#taiyuan',pageOrRecord:'今太原市近似城市点，不表示五代晋阳城垣范围。'}],
      uncertaintyNote:'此处只作北汉政治中心定位，北汉与后周边界及契丹关系不由都城点推定。'},
  },
  {
    id:'special-jurchen-jin-1115-1125-huining-center', polityId:'jin_jurchen', validFrom:1115, validTo:1125,
    snapshotYear:1115, temporalKind:'interval', presentation:'reference', sourceName:'金建国与攻辽期会宁府政治中心参照',
    sourceUrl:'https://skqs.dazhishi.com/show_xnymjvzbdm.html', vertexCount:1, geometry:{type:'Point',coordinates:[126.98,45.55]},
    controlType:'direct', confidence:'low', sourceIds:['jinshi-vol2-taizu','jinshi-vol3-taizong','capital-history-reference','modern-geography-reference'], mapRepresentation:'control-centers',
    notes:'1115—1125年仅显示金早期政治中心会宁府（上京）的近似参照点。金朝在此期间建国、攻辽、接收辽州县、进入燕京并于1125年转入攻宋，直接控制范围快速变化；此点不代表全境、州县归附范围、军事占领或宋金外交分地。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',citations:[
      {title:'《金史》卷二《太祖纪》与卷三《太宗纪》',urlOrCitation:'https://skqs.dazhishi.com/show_xnymjvzbdm.html；https://skqs.dazhishi.com/show_qmdkxlagyv.html',pageOrRecord:'逐年记建国、攻辽、燕京接管、太祖太宗交接、辽亡及攻宋；不提供可据以重建全段连续疆界的空间坐标。'},
      {title:'项目资本史：金朝都城阶段',urlOrCitation:'src/data/capital-history.ts#jin_jurchen',pageOrRecord:'会宁府为1115—1153年阶段性都城；都城时段不等同金朝疆域。'},
      {title:'山河年轮地点资料：会宁府',urlOrCitation:'src/data/places.ts#huining',pageOrRecord:'今哈尔滨市阿城区白城遗址一带近似点位，不表示金上京城墙边界。'}],
      uncertaintyNote:'史料支持会宁府为金早期都城，项目地点目录将其定位到阿城区白城遗址一带。都城点只表达政治中心，不把军事战果、归附、条约分地或邻年轮廓转为疆界；本段疆界几何继续留空。'},
  },
  {
    id:'special-han-warring-230-xinzheng-center', polityId:'han_warring', validFrom:-230, validTo:-230,
    snapshotYear:-230, temporalKind:'interval', presentation:'reference', sourceName:'韩国亡年新郑政治中心参照',
    sourceUrl:'https://zh.wikisource.org/zh-hans/資治通鑑/卷006', vertexCount:1, geometry:{type:'Point',coordinates:[113.74,34.40]},
    controlType:'direct', confidence:'low', sourceIds:['zizhi-tongjian-vol6-han-termination','china-chronology','capital-history-reference','xinzheng-government-history'], mapRepresentation:'control-centers',
    notes:'仅表示韩国在前230年亡国及秦接收前的新郑政治中心参照。内史腾攻韩、俘韩王安并改置颍川郡均发生于年内；点不代表韩国全境、城垣或秦郡边界。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',citations:[
      {title:'《资治通鉴》卷六·秦王政十七年',urlOrCitation:'https://zh.wikisource.org/zh-hans/資治通鑑/卷006',pageOrRecord:'记内史腾灭韩、虏韩王安，以其地置颍川郡；用于确认前230年政权终结和年内接收，不据此绘制韩国边界。'},
      {title:'山河年轮地点资料：新郑',urlOrCitation:'src/data/places.ts#xinzheng',pageOrRecord:'现代新郑城区附近的低置信度区域参照，不表示故城城垣或精确古址坐标。'},
      {title:'新郑市人民政府：历史沿革',urlOrCitation:'https://www.xinzheng.gov.cn/lsyg.jhtml',pageOrRecord:'仅支持战国时期新郑为韩国都城及秦代新郑县的历史关联，不提供点位坐标或疆界。'}],
      uncertaintyNote:'韩国都城位置可作为低置信度D级政治中心点；该政权在年内终止，疆域范围随战争及接管变化，无法表示为全年稳定多边形。'},
  },
  {
    id:'special-yan-warring-226-222-liaoyang-regional-center', polityId:'yan_warring', validFrom:-226, validTo:-222,
    snapshotYear:-226, temporalKind:'interval', presentation:'reference', sourceName:'燕王喜退保辽东后的辽阳区域中心参照',
    sourceUrl:'https://yuyencia.wordpress.com/wp-content/uploads/2017/11/e8aebae78795e59bde79a84e4ba94e5baa7e983bde59f8e.pdf', vertexCount:1, geometry:{type:'Point',coordinates:[123.17,41.27]},
    controlType:'direct', confidence:'low', sourceIds:['yan-capital-relocation-liaoyang-2011','zizhi-tongjian-vol7-yan-termination','modern-geography-reference'], mapRepresentation:'control-centers',
    notes:'仅将辽阳标为一种有学术依据但仍有分歧的燕末区域政治中心参照。薛兰霞、杨玉生2011年研究称燕王喜失蓟后迁至辽阳、约五年后被俘；《资治通鉴》只明确记燕王东保辽东及前222年王贲攻辽东俘王喜。点位为今辽阳市城区的低置信度区域定位，不声称战国襄平城垣坐标，不代表辽东全域、全年直接控制范围或疆界。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',citations:[
      {title:'薛兰霞、杨玉生《论燕国的五座都城》',urlOrCitation:'https://yuyencia.wordpress.com/wp-content/uploads/2017/11/e8aebae78795e59bbde79a84e4ba94e5baa7e983bde59f8e.pdf',version:'《河北大学学报（哲学社会科学版）》2011年第36卷第1期',pageOrRecord:'第93页，“燕国最后都城辽阳”节；作者称燕王喜退至辽阳、五年后被俘。',license:'未核验'},
      {title:'《资治通鉴》卷七·秦始皇二十一、二十五年',urlOrCitation:'https://zh.wikisource.org/wiki/資治通鑑/卷007',version:'胡三省音注本（维基文库数字文本）',pageOrRecord:'前226年秦军拔蓟、燕王及太子东保辽东；前222年王贲攻辽东、俘燕王喜。原文不点名燕廷驻地。'},
      {title:'山河年轮地点资料：辽阳区域参照',urlOrCitation:'src/data/places.ts#liaoyang',pageOrRecord:'使用现代辽阳市城区代表坐标作区域定位，不对应已确认的战国襄平城址或城垣。'}],
      uncertaintyNote:'辽阳作为燕最后都城是薛兰霞、杨玉生论文的一种研究结论；其他燕都迁徙研究存在不同序列。辽东史事可支持燕王退保区域及燕国终结，不能独立证明辽阳为唯一驻地。该D级点仅表明研究支持的区域中心参照，疆域几何仍为空。'},
  },
  {
    id:'special-yuan-1271-1293-dadu-shangdu-centers', polityId:'yuan', validFrom:1272, validTo:1293,
    snapshotYear:1272, temporalKind:'interval', presentation:'reference', sourceName:'元初大都政治中心参照',
    sourceUrl:'https://zh.wikisource.org/zh-hans/元史/卷007', vertexCount:1, geometry:{type:'Point',coordinates:[116.40,39.90]},
    controlType:'direct', confidence:'low', sourceIds:['yuanshi-shizu-1271-1293','yuan-nationalities-history','yuan-li-bingzhong','capital-history-reference'], mapRepresentation:'control-centers',
    notes:'仅显示大都的政治中心参照；上都作为阶段性都城通过资本史资料呈现。1271—1293年元朝经历南宋战争、接管、内乱及边疆军政变化；都城点不代表城垣、两都之间连续直辖范围、全部行省或蒙古诸王势力范围。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',citations:[
      {title:'《元史》卷七至卷十七·世祖本纪',urlOrCitation:'https://zh.wikisource.org/zh-hans/元史/卷007；https://zh.wikisource.org/zh-hans/元史/卷008；https://zh.wikisource.org/zh-hans/元史/卷009；https://zh.wikisource.org/zh-hans/元史/卷010；https://zh.wikisource.org/zh-hans/元史/卷011；https://zh.wikisource.org/zh-hans/元史/卷012；https://zh.wikisource.org/zh-hans/元史/卷013；https://zh.wikisource.org/zh-hans/元史/卷014；https://zh.wikisource.org/zh-hans/元史/卷015；https://zh.wikisource.org/zh-hans/元史/卷016；https://zh.wikisource.org/zh-hans/元史/卷017',pageOrRecord:'逐年记录至元八年至三十年政令、战争、受降和地方建置；支持政权过程核对而不提供连续直接控制边界。'},
      {title:'国家民委：元代历史沿革与行政建置',urlOrCitation:'https://www.neac.gov.cn/seac/c103391/201806/1066616.shtml',pageOrRecord:'用于元朝制度与行政背景，名义行政关系不等同年度边界。'},
      {title:'北京市文物局：元大都新城营建与定名',urlOrCitation:'https://wwj.beijing.gov.cn/bjww/resource/cms/article/bjww_362762/10831102/2020072009031417131.pdf',pageOrRecord:'大都新城始建于至元四年（1267），至元九年（1272）正式定名；城市点仅作政治中心参照。'},
      {title:'山河年轮地点资料：大都',urlOrCitation:'src/data/places.ts#dadu',pageOrRecord:'近似城市中心坐标，不表示古城城墙范围。'}],
      uncertaintyNote:'大都作为政治中心有都城资料支撑；上都的阶段性都城记录由资本史资料独立展示。此D级点位不推定全境疆界。元代行政、朝贡、羁縻、军镇、军事占领和蒙古诸王实际势力分别处理；1271—1293年sourceBoundaryIds继续为空。'},
  },
  {
    id:'special-dali-early-937-946-yangjumei-center', polityId:'dali', validFrom:937, validTo:946,
    snapshotYear:937, temporalKind:'interval', presentation:'reference', sourceName:'大理早期羊苴咩城政治中心参照',
    sourceUrl:'https://mzzj.yn.gov.cn/html/2002/yunnanlishiminzurenwu_0101/8266.html', vertexCount:1, geometry:{type:'Point',coordinates:[100.16,25.70]},
    controlType:'direct', confidence:'low', sourceIds:['dali-duan-siping-official','dali-history-research-nopss','dali-early-lineage-study','dali-early-history-nagoya','dali-yangjumei-mct','modern-geography-reference'], mapRepresentation:'control-centers',
    notes:'937—946年仅显示羊苴咩城政治中心参照点。大理建国年有937/938口径差异，段思英、段思良交接有945/946异说；点位采用今大理古城一带的近似坐标，不表示古城墙、逐年控制边缘或大理国疆域。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',citations:[
      {title:'云南省民族宗教事务委员会：段思平',urlOrCitation:'https://mzzj.yn.gov.cn/html/2002/yunnanlishiminzurenwu_0101/8266.html',pageOrRecord:'采用937年建国、以羊苴咩城为都及段思平在位八年等地方历史口径。'},
      {title:'《大理国史研究》与名古屋大学早期王统研究',urlOrCitation:'https://www.nopss.gov.cn/GB/219506/219508/219522/14640080.html；https://nagoya.repo.nii.ac.jp/record/8095/files/jouflh_50_1.pdf',pageOrRecord:'建国年存在937/938异说；早期王统年表对段思英、段思良交接年份有不同列法。'},
      {title:'文化和旅游部转载考古报道：阳苴咩城城墙遗址',urlOrCitation:'https://www.mct.gov.cn/whzx/qgwhxxlb/yn/201307/t20130711_791318.htm',pageOrRecord:'考古报道称遗址为南诏大理国都城北城墙一段，位置在今大理古城一带；不能据城墙遗址推定大理国疆界。'},
      {title:'山河年轮地点资料：羊苴咩城',urlOrCitation:'src/data/places.ts#yangjumei',pageOrRecord:'今大理古城一带的考古区域近似点。'}],
      uncertaintyNote:'只表达政治中心位置，结论置信度为低。建国与继位纪年分歧保留在逐年审计；没有937—946年连续直接控制边界资料，本段不绘制疆域多边形。'},
  },
  ...southernSongAnnualCenters.map(southernSongCenterExtent),
  ...mingNorthernYuanAnnualCenters.map(mingNorthernYuanCenterExtent),
];
