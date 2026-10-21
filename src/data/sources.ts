import type { SourceNote } from '../domain/types';

export const sourceNotes: SourceNote[] = [
  {id:'capital-history-reference',title:'政权首都与政治中心综合核验资料',authorOrInstitution:'项目组件专家团整理',urlOrCitation:'《资治通鉴》、中国历史地理与相关遗址/地方志资料交叉核验',scope:'首都、迁都、多都制、政治中心及现代地名映射',note:'用于地图定位和展示；移动汗廷、候选遗址和区域参照均保留置信度与不确定性，不由首都点推导疆域。'},
  {id:'erlitou-official',title:'二里头遗址与二里头文化官方资料',authorOrInstitution:'国家发展改革委／洛阳市人民政府',urlOrCitation:'https://www.ndrc.gov.cn/xwdt/ztzl/dyhgjwhgy/202209/t20220920_1335799_ext.html',scope:'夏代相关考古文化核心定位',note:'用于D级文化核心参照，不据此推导夏代国家边界。'},
  {id:'gengshi-official',title:'更始政权都城与中心官方地方资料',authorOrInstitution:'湖北省文化和旅游厅／陕西省地方志办公室',urlOrCitation:'https://dfz.shaanxi.gov.cn/zslm/fzzlk/xbsxsxz/xbsxz/xas_16198/201405/P020240923622533021818.pdf',scope:'23—25年宛城、洛阳、长安中心与迁都时序',note:'只用于D级控制中心表达，不生成连续疆域。'},
  {
    id: 'cliopatria', title: 'Cliopatria v0.2.1 · 全球政权时段模型',
    authorOrInstitution: 'Bennett et al. / Seshat Global History Databank',
    urlOrCitation: 'https://doi.org/10.1038/s41597-025-04516-9',
    scope: '前3400—2024年全球资料；CC BY 4.0。保留原始几何，按中国目录校正显示名称并裁定适用时段。',
    note: '可按年查询来源区间，不等于逐年独立考证。最大参考仅为已收录单条记录面积最大值，不代表历史真实极大值。边界和直接控制、臣属关系均需进一步核验。',
  },
  {
    id: 'zizhi-tongjian',
    title: '《资治通鉴》',
    authorOrInstitution: '司马光等',
    urlOrCitation: '《资治通鉴》卷一至卷二九四',
    scope: '时间范围与重大政权、事件编年',
    note: '前403—959年的阅读专题；可在完整历史时间轴上一键聚焦。此书不是疆域坐标的来源。',
  },
  {
    id: 'historical-basemaps',
    title: 'Historical Basemaps · 原始历史矢量断面',
    authorOrInstitution: 'André Ourednik 与贡献者',
    urlOrCitation: 'https://github.com/aourednik/historical-basemaps',
    scope: '部分汉至清的政权参考轮廓（GPL-3.0）',
    note: '大陆尺度开放数据，不是逐年精确边界。保留原始几何，排除明显错标年代的要素；尚未完成逐界历史校勘。现代海岸线不等于历史海岸线。',
  },
  {
    id: 'china-chronology', title: '中国历史分期与朝代年表',
    authorOrInstitution: '中国国家博物馆古代中国展 / 年表整理',
    urlOrCitation: 'https://www.chnmuseum.cn/portals/0/web/zt/gudai/en/index.html',
    scope: '史前、夏商周至明清的历史分期；主要政权目录由项目按常见纪年整理，非穷尽名录',
    note: '早期起止年为约年，不代表史料达到逐年精度。以年为单位的改朝换代允许同年并存；疆域模型的来源、日期与不确定性单独标注。',
  },
  {
    id: 'silla-encykorea', title: '新罗 · 韩国民族文化大百科', authorOrInstitution: '韩国学中央研究院', urlOrCitation: 'https://encykorea.aks.ac.kr/Article/E0032800',
    scope: '新罗前57年至935年的政权分期、王统与三国统一前后历史概述',
    note: '用于确认政权年代与阶段性转折；该条目不提供可直接重发布的逐年疆域几何。',
  },
  {
    id: 'silla-samguksagi-db', title: '《三国史记》新罗本纪 · 韩国古代史料数据库', authorOrInstitution: '韩国国史编纂委员会', urlOrCitation: 'https://db.history.go.kr/ancient/level.do?levelId=sg_045r_0080_0020',
    scope: '新罗早期王统、对外关系与377/382年前后史料注释',
    note: '逐年核对王统与重大转折；编年记载不等于现代意义的边界测绘，不能单独生成连续国界面。',
  },
  {
    id: 'silla-periodization', title: '《新编韩国史》三国时期新罗专题 · 韩国史数据库', authorOrInstitution: '韩国国史编纂委员会', urlOrCitation: 'https://db.history.go.kr/id/nh_007_0010',
    scope: '4世纪新罗王权整合、内物王时期及高句丽影响下的对外关系',
    note: '用于交叉核验356—377年阶段变化；不提供可重发布的逐年边界坐标。',
  },
  {
    id: 'turkic-history-db', title: '《旧唐书》《新唐书》突厥传 · 韩国古代史料数据库', authorOrInstitution: '韩国国史编纂委员会', urlOrCitation: 'https://db.history.go.kr/id/ko_034_1510_0070',
    scope: '突厥与唐朝关系、部落归属和后突厥时期的东亚史料参照',
    note: '用于逐年转折和政权身份核验；史料中的臣属、征伐和影响范围不直接等于现代意义国界。',
  },
  {
    id: 'turkic-orkhon-heritage', title: 'Orkhon Valley Cultural Landscape · UNESCO World Heritage nomination', authorOrInstitution: 'UNESCO', urlOrCitation: 'https://whc.unesco.org/uploads/nominations/1081rev.pdf',
    scope: '毗伽可汗、阙特勤及鄂尔浑碑铭遗址的年代与文化遗产背景',
    note: '仅作历史与遗址参照，不从遗址范围推导汗国边界；不复制现代译文或图件。',
  },
  {
    id: 'turkic-orkhon-collection', title: 'The National Museum of Mongolian History: The early Türk Empire and the Uighurs', authorOrInstitution: 'University of Washington Silk Road Seattle', urlOrCitation: 'https://depts.washington.edu/silkroad/museums/ubhist/turk.html',
    scope: '突厥、鄂尔浑碑铭与回鹘继承关系的博物馆资料摘要',
    note: '用于交叉核对遗址和继承关系，不提供可重发布的逐年疆域几何。',
  },
  {
    id: 'western-zhou-national-museum', title: '“宜侯夨”青铜簋与西周封邦建国资料', authorOrInstitution: '中国国家博物馆', urlOrCitation: 'https://www.chnmuseum.cn/zp/zpml/kgfjp/202108/t20210802_250932.shtml',
    scope: '西周早期册封、土地城邑赏赐和东国秩序的器物铭文参照',
    note: '用于区分王室直接控制、封国与分封秩序；器物铭文不提供可重发布的逐年边界几何。',
  },
  {
    id: 'western-zhou-epic', title: 'Chinese Epic · Western Zhou historical materials', authorOrInstitution: '中国国家博物馆', urlOrCitation: 'https://en.chnmuseum.cn/Portals/0/web/exhibition/exhibitions/161120Chines-Epic/en.html',
    scope: '西周早期王室、诸侯分封及政治秩序概述',
    note: '用于阶段性历史核验；不把分封名义范围直接转成连续国家边界。',
  },
  {
    id: 'map-regulation', title: '《地图管理条例》', authorOrInstitution: '中华人民共和国国务院 / 中国政府网', urlOrCitation: 'https://www.gov.cn/zhengce/zhengceku/2015-12/14/content_10403.htm',
    scope: '公开地图编制、审核、互联网地图服务与审图号要求',
    note: '用于项目发布合规标注；具体公开部署仍需按发布地和地图内容由专业人员复核。',
  },
  {
    id: 'yuan-nationalities-history', title: '元代历史沿革与疆域行政建置资料', authorOrInstitution: '国家民委 / 道中华', urlOrCitation: 'https://www.neac.gov.cn/seac/c103391/201806/1066616.shtml',
    scope: '1271年建国号、1279年灭南宋及元代行省与蒙古地区行政关系',
    note: '用于阶段性历史核验；概述中的疆域和行政名义不自动等同于逐年直接控制边界。',
  },
  {
    id: 'yuan-li-bingzhong', title: '刘秉忠与元初建国制度资料', authorOrInstitution: '国家民委 / 道中华', urlOrCitation: 'https://www.neac.gov.cn/seac/c103391/202302/1161231.shtml',
    scope: '1271年国号、大都与元初制度建设',
    note: '用于改国号、都城和制度转折核验；不提供可重发布的逐年疆域几何。',
  },
  {
    id: 'yuan-goryeo-records', title: '《元史》《高丽史》相关编年资料', authorOrInstitution: '韩国国史编纂委员会', urlOrCitation: 'https://db.history.go.kr/ancient/level.do?levelId=jo_016r',
    scope: '1271—1293年元与高丽关系、战争和边疆行政变化',
    note: '用于逐年事件交叉核验；外交、军役和属国关系不直接转换为连续现代国界。',
  },
  {
    id: 'northern-yuan-early-ming', title: '明代北方边疆与蒙元余部资料', authorOrInstitution: '中国国家博物馆', urlOrCitation: 'https://www.chnmuseum.cn/zp/zpml/csp/202008/t20200826_247448.shtml',
    scope: '明代北方防御体系、蒙元残余势力与明蒙关系的背景参照',
    note: '用于区分明方军事防御和蒙古势力范围；不提供北元逐年可重发布边界几何。',
  },
  {
    id: 'northern-yuan-yesen', title: '也先与脱脱不花关系 · 韩国史总论数据库', authorOrInstitution: '韩国国史编纂委员会', urlOrCitation: 'https://db.history.go.kr/diachronic/level.do?levelId=oh_009_0020_0010_0030',
    scope: '也先、脱脱不花、1454年政权分裂及蒙古内部重组',
    note: '用于逐年转折核验；明代文书中的敌对称谓和边患叙述需与政权身份、直接控制分开。',
  },
  {
    id: 'southern-tang-nanjing', title: '南唐建国与金陵都城资料', authorOrInstitution: '南京市人民政府地方志办公室', urlOrCitation: 'https://dfz.nanjing.gov.cn/ztzl/njzj/szcs/201003/P020210517531284843988.pdf',
    scope: '937年南唐建国、金陵建都与地方行政背景',
    note: '用于建国与都城核验；地方行政沿革不自动等于南唐全境边界。',
  },
  {
    id: 'southern-tang-periods', title: '五代十国时期与南唐政权变迁资料', authorOrInstitution: '韩国国史编纂委员会', urlOrCitation: 'https://db.history.go.kr/diachronic/level.do?levelId=oh_004_0020_0010_0010',
    scope: '五代十国分裂格局、后周与南唐关系及959年前后政治背景',
    note: '用于阶段性编年交叉核验；中原王朝名义秩序与南唐直接控制范围分开记录。',
  },
  {
    id: 'southern-tang-local-administration', title: '南唐时期地方行政沿革资料', authorOrInstitution: '龙南市人民政府', urlOrCitation: 'https://www.jxln.gov.cn/lnzf/c103681/202204/84b6e20b0bfb40f8b611722e1ec9f976.shtml',
    scope: '937—953年南唐地方行政沿革与节度体系参照',
    note: '只用于局部行政沿革的交叉核验，不外推为全政权逐年国界。',
  },
  {
    id: 'modern-geography-reference',
    title: '现代地理位置参照',
    authorOrInstitution: '项目整理',
    scope: '历史地名的现代位置',
    note: '坐标用于帮助用户定位历史地点，地名沿革和古今对应关系需要结合具体史料理解。',
  },
];

export const sourceById = Object.fromEntries(sourceNotes.map((source) => [source.id, source]));
