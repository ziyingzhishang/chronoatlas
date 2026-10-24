export type HeritagePhaseType = 'original' | 'site' | 'reconstruction' | 'restoration';

export interface HeritagePhase {
  type: HeritagePhaseType;
  label: string;
  period: string;
  from?: number;
  to?: number;
  description: string;
  sourceIds: string[];
  uncertaintyNote?: string;
}

export interface HeritageDetail {
  heritageId: string;
  modernLocation: string;
  historicalAssociations: string[];
  constructionHistory: HeritagePhase[];
  associatedPeople: string[];
  associatedPolities: string[];
  associatedEvents: string[];
  survivingFeatures: string[];
  presentDayValue: string;
  sourceIds: string[];
  uncertaintyNote: string;
}

const sourceIds = ['modern-geography-reference'];
const historicalSourceIds = ['zizhi-tongjian', 'modern-geography-reference'];
const dulingSourceIds = ['modern-geography-reference', 'xian-local-chronicle-duling'];
const maolingSourceIds = ['modern-geography-reference', 'xian-local-chronicle-western-han-mausoleums'];
const whiteHorseSourceIds = ['zizhi-tongjian', 'modern-geography-reference', 'luoyang-baimasi-official'];
const westernLiaoSourceIds = ['liaoshi-vol30-yelu-dashi', 'iranica-qara-ketay', 'iranica-balasagun', 'unesco-chui-balasagun'];

function phase(
  type: HeritagePhaseType,
  label: string,
  period: string,
  description: string,
  from?: number,
  to?: number,
  uncertaintyNote?: string,
): HeritagePhase {
  return { type, label, period, from, to, description, sourceIds, uncertaintyNote };
}

function historicalPhase(
  type: HeritagePhaseType,
  label: string,
  period: string,
  description: string,
  from?: number,
  to?: number,
  uncertaintyNote?: string,
  sourceIdsOverride?: string[],
): HeritagePhase {
  return {
    ...phase(type, label, period, description, from, to, uncertaintyNote),
    sourceIds: sourceIdsOverride ?? historicalSourceIds,
  };
}

function detail(
  heritageId: string,
  modernLocation: string,
  historicalAssociations: string[],
  constructionHistory: HeritagePhase[],
  associatedPeople: string[],
  associatedPolities: string[],
  associatedEvents: string[],
  survivingFeatures: string[],
  presentDayValue: string,
  uncertaintyNote: string,
  detailSourceIds = sourceIds,
): HeritageDetail {
  return {
    heritageId,
    modernLocation,
    historicalAssociations,
    constructionHistory,
    associatedPeople,
    associatedPolities,
    associatedEvents,
    survivingFeatures,
    presentDayValue,
    sourceIds: detailSourceIds,
    uncertaintyNote,
  };
}

const details: HeritageDetail[] = [
  detail('han-changan-city-site', '今西安市未央区及其周边，古城范围与现代行政区不重合。', ['西汉长安城的宫城、外郭城与城市道路体系', '汉帝国政治中心与都城制度'], [
    phase('original', '原建筑', '前202—前141年', '汉长安城在秦咸阳旧址附近营建并逐步扩展，形成宫城、外郭城和道路系统。', -202, -141),
    phase('site', '遗址', '20世纪以来', '城墙、宫殿区、道路和手工业遗迹以考古遗址形式保存。', 1900),
    phase('restoration', '现代复原', '当代遗址展示', '保护区内使用地面标识、模型和局部展示解释城市格局，不等同于原城重建。', 2000, undefined, '展示设施的现代材料和位置不能直接证明汉代建筑原貌。'),
  ], ['liu-bang', 'wang-mang'], ['han_western', 'xin'], ['han-imperial-accession', 'tang-founded'], ['城址范围与道路遗迹', '宫殿区夯土台基', '考古分区与地面标识'], '考古遗址公园与城市历史教育节点。', '遗址范围、地层年代与古今城市边界需以考古报告为准。', ['zizhi-tongjian', 'modern-geography-reference']),
  detail('weiyang-palace-site', '今西安市未央区汉长安城遗址内。', ['西汉中央宫殿区', '汉代帝国礼制与宫城空间'], [
    phase('original', '原建筑', '前200年起', '未央宫是西汉长安城的重要宫殿区，原有木构建筑群已不以完整建筑形态保存。', -200),
    phase('site', '遗址', '汉代宫殿遗址', '前殿等夯土台基、宫殿分区和相关遗迹构成可辨识的考古遗存。', -200, 9),
    phase('restoration', '现代复原', '遗址展示', '现地以台基保护、标识和展示性构筑物帮助理解宫殿尺度。', 2000, undefined, '宫殿具体建筑复原不应等同于完整历史原貌。'),
  ], ['liu-bang', 'wang-mang'], ['han_western', 'xin'], ['han-imperial-accession', 'qin-unification'], ['夯土台基', '宫殿区空间格局', '考古展示标识'], '遗址保护区，主要以考古展示和地面标识关联历史。', '宫殿具体建筑复原不应等同于完整历史原貌。'),
  detail('tang-changan-city-site', '今西安城市及其东南、北部遗址分布区。', ['隋大兴城规划', '唐长安城坊市、宫城与城市道路'], [
    phase('original', '原建筑', '582—907年', '隋大兴城与唐长安城沿用并调整棋盘式街道、坊墙、宫城和城门体系。', 582, 907),
    phase('site', '遗址', '隋唐城址遗存', '城墙、坊区、道路和门址以地下遗存、夯土台基和考古分区形式保存。', 582, 907),
    phase('restoration', '现代复原', '当代城市考古展示', '现代城市中的遗址公园、标识和局部展示用于解释隋唐城市结构。', 2000, undefined, '现代道路和行政区边界不能直接替代隋唐城界。'),
  ], ['yang-jian', 'li-yuan', 'li-shimin'], ['sui', 'tang'], ['sui-unification', 'tang-founded', 'an-lushan-rebellion'], ['城墙与城门遗迹', '坊区与道路遗迹', '宫城和官署区考古信息'], '城市考古、遗址保护和历史地理研究的重要基础。', '隋唐长安城与现代西安城区不是同一边界，点位仅作学习导航。', ['zizhi-tongjian', 'modern-geography-reference']),
  detail('daming-palace-site', '今西安市新城区北部，大明宫国家遗址公园一带。', ['唐代宫城北部扩展', '唐太宗以后长安政治空间'], [
    phase('original', '原建筑', '634—904年', '大明宫作为唐长安城北部宫城，包含含元殿、宣政殿和紫宸殿等主要空间。', 634, 904),
    phase('site', '遗址', '唐代宫城遗址', '殿址夯土台基、宫墙和门址构成今日遗址公园的核心考古对象。', 634, 904),
    phase('reconstruction', '后世重建', '近现代保护性构筑', '历史建筑主体毁圮后，后世并未连续保有整座宫城；部分展示构筑物是保护和解释工程。', 1900, 1999, '保护性构筑物不能当作唐代宫殿原建筑。'),
    phase('restoration', '现代复原', '当代遗址公园', '遗址公园对局部尺度、台基和门址进行展示性复原，用于帮助理解空间关系。', 2000, undefined, '展示性复原仅用于解释空间关系，不代表唐代原建筑完整留存。'),
  ], ['li-shimin', 'li-yuan'], ['tang'], ['tang-founded', 'an-lushan-rebellion'], ['含元殿夯土台基', '宫墙与门址', '遗址公园展示轴线'], '国家考古遗址公园与城市公共文化空间。', '现存展示建筑、复原构件与唐代原建筑应分层标注。'),
  detail('big-wild-goose-pagoda', '今西安市雁塔区大慈恩寺内。', ['唐代佛教传播', '玄奘译经传统与大慈恩寺空间'], [
    historicalPhase('original', '原建筑', '652年始建', '唐永徽三年（652年），玄奘在大慈恩寺主持营建塔，用于收藏自西域带回的经论梵本；今日塔体不是652年原状的简单复制。', 652),
    historicalPhase('site', '现存塔体与塔院', '现存历史建筑', '塔体、塔院空间和历代题刻构成今日可辨识的遗产本体；现存形制包含后世修缮。'),
    historicalPhase('reconstruction', '后世重建', '唐至明清多次修缮', '塔体在唐以后经历重修、结构变化和历代维修，今日所见七层砖塔不能简单回填为652年初建形制。', 700, 1700, '历次修缮的具体范围和年代需结合建筑史与维修档案。'),
    historicalPhase('restoration', '现代复原', '近现代保护维修', '现代保护工程保持塔体和寺院空间的可识别性，未将整座建筑重建为唐代新作。', 1900),
  ], ['xuan-zang', 'li-shimin'], ['tang'], ['tang-founded', 'xuanzang-translations'], ['七层砖塔主体', '塔院空间', '历代题刻与维修痕迹'], '现存历史建筑和西安城市标志性文化景观。', '塔体历代修缮和重建使“唐代原状”与今日所见不能直接画等号；现存建筑年代需按构件和维修档案分层。当前资料尚不能形成统一译经事件端点：缺少可共同适用于五处遗产的统一起止年代、地点集合、阶段链和独立来源；不把建筑年代拼接为译经事件，保留 xuanzang-translations 待核关联。', [...historicalSourceIds, 'xian-local-chronicle-big-wild-goose']),
  detail('xingqing-palace-site', '今西安市碑林区兴庆宫公园一带。', ['唐长安城东部宫苑', '玄宗时期的宫廷生活与政治空间'], [
    phase('original', '原建筑', '8世纪前期', '兴庆宫由旧宅扩建为宫苑，是唐玄宗时期长安东部的重要宫廷空间。', 714, 755),
    phase('site', '遗址', '宫苑遗址与城市公园', '原有宫苑建筑多已不存，历史空间通过遗址信息和文献研究辨识。', 755),
    phase('reconstruction', '后世重建', '20世纪城市公园建设', '现代公园沿用“兴庆宫”名称并重建部分景观，但不是唐代宫苑的连续留存。', 1950, 1999),
    phase('restoration', '现代复原', '当代展示景观', '园内景观以纪念和展示为主，需与唐代原宫殿区分。', 2000),
  ], ['li-shimin'], ['tang'], ['tang-founded', 'an-lushan-rebellion'], ['宫苑范围的历史记忆', '现代园林水系', '展示性建筑与题刻'], '城市公园与唐代宫苑记忆的叠合地点。', '现存公园景观与唐代宫苑的对应关系需要逐项考古和文献核验。'),
  detail('xiao-yan-ta', '今西安市碑林区荐福寺旧址一带。', ['唐代荐福寺佛教建筑', '长安城南部寺院与佛教传播'], [
    historicalPhase('original', '原建筑', '707—710年始建', '小雁塔（荐福寺塔）建于唐中宗景龙年间（约707—710年），位于荐福寺空间内，承担佛经、佛图等宗教遗产的保存与展示功能。', 707, 710),
    historicalPhase('site', '现存塔体与寺院环境', '现存历史建筑', '塔体、塔身维修痕迹和荐福寺环境构成今日可识别对象；现存结构不能全部回填为707年原构。'),
    historicalPhase('reconstruction', '后世重建', '明清及近代多次修缮', '塔体和寺院在地震、风雨与历代维修中持续变化；明代地震造成塔身震损，顶部形制与初建时已有差异。', 1487, 1949, '地震损伤、维修和现存构件的对应关系需以建筑维修档案逐项核对。'),
    historicalPhase('restoration', '现代复原', '近现代保护维修', '现代保护以加固和保留塔体为主，不将维修表面视作唐代原构。', 1900),
  ], ['xuan-zang', 'li-shimin'], ['tang'], ['tang-founded', 'xuanzang-translations'], ['现存十三层砖塔主体', '塔身开裂与维修痕迹', '荐福寺遗址环境'], '现存唐代佛教建筑与西安博物馆相关展示空间。', '小雁塔始建年代、地震损伤、维修阶段和现存构件的对应关系应以建筑考古资料为准；现存十三层不等同于初建形制。当前资料尚不能形成统一译经事件端点：缺少可共同适用于五处遗产的统一起止年代、地点集合、阶段链和独立来源；不把建筑年代拼接为译经事件，保留 xuanzang-translations 待核关联。', [...historicalSourceIds, 'xiao-yan-ta-official-digital']),
  detail('hanyangling', '今西安市北部渭城区与咸阳原一带，现代行政区与陵园范围不完全重合。', ['西汉帝陵与陵邑体系', '长安北部的帝陵礼制与陪葬空间'], [
    phase('original', '原建筑', '前157年后营建', '阳陵为汉景帝刘启与王皇后合葬陵园，包含陵墓、陵邑和陪葬坑体系。', -157),
    phase('site', '遗址', '西汉帝陵遗址', '封土、陵园遗迹、陪葬坑和陵邑遗存构成考古遗址。', -157, 70),
    phase('restoration', '现代复原', '考古博物馆展示', '地下陪葬坑以保护性展示和博物馆技术呈现，不等于将陵墓恢复成原始使用状态。', 2000),
  ], ['li-shimin'], ['han_western'], ['han-imperial-accession'], ['封土与陵园格局', '陪葬坑遗迹', '地下考古展示空间'], '帝陵考古遗址与博物馆展示节点。', '陵园边界、陵邑范围和各类陪葬遗存的年代需按考古报告分别理解。'),
  detail('qianling', '今陕西省乾县北部梁山，位于长安西北的关中陵区。', ['唐高宗与武则天合葬陵墓', '唐代帝陵制度与关中陵区'], [
    phase('original', '原建筑', '684年后营建', '乾陵依梁山营建，形成墓葬、神道、石刻和陵园礼仪空间。', 684),
    phase('site', '遗址', '唐代帝陵遗址', '陵山、墓道、石刻和陵园遗存仍构成可识别的历史景观。', 684, 907),
    phase('restoration', '现代复原', '当代文物保护', '现状以保护山体、石刻和遗址环境为主，未打开墓室进行整体复原。', 1900),
  ], ['li-shimin'], ['tang', 'wu_zhou'], ['tang-founded', 'an-lushan-rebellion'], ['梁山陵体', '无字碑等石刻', '神道与陵园环境'], '唐代帝陵遗址与关中陵区历史景观。', '墓室未全面发掘，关于内部保存状况和部分建筑布局不能作确定性展示。'),
  detail('xian-beilin', '今西安市碑林区三学街一带。', ['后世碑刻保存与展示', '长安—西安的书写、经学与城市记忆'], [
    historicalPhase('original', '原建筑', '唐宋以来碑刻陆续形成', '碑刻来自不同年代和地点，不能视为同一时期建造的单体建筑。', 700, 1087, '碑刻原始位置和刻立年代需逐件核对。'),
    historicalPhase('site', '碑刻本体与陈列空间', '现存文物与展示空间', '碑刻本体、碑廊和保护设施是今日可展示对象；它们表达收藏与编次史，而非还原每块碑刻的原址。'),
    historicalPhase('reconstruction', '后世重建', '1087年后迁置与扩建', '碑林以保存、迁置和编次碑刻为核心，空间布局经历后世调整。', 1087, 1900),
    historicalPhase('restoration', '现代复原', '现代博物馆保护', '现代馆舍和保护设施服务于碑刻保存与展示，不等同于唐代长安原有建筑。', 1900),
  ], ['li-shimin'], ['tang'], ['tang-founded', 'xuanzang-translations'], ['碑刻与墓志', '碑廊与石刻陈列', '后世编次和保护设施'], '保存、研究和展示碑刻的城市文化遗产。', '碑林的收藏迁移、碑刻原址和后世编次不能简单还原为单一历史时刻。当前资料尚不能形成统一译经事件端点：缺少可共同适用于五处遗产的统一起止年代、地点集合、阶段链和独立来源；不把建筑年代拼接为译经事件，保留 xuanzang-translations 待核关联。', historicalSourceIds),
  detail('changle-palace-site', '今西安市未央区汉长安城遗址东南部。', ['西汉东部宫城', '长安城宫殿区与皇帝日常政治空间'], [
    phase('original', '原建筑', '前200年前后', '长乐宫是汉长安城早期重要宫殿区之一，与汉初宫城建设相关。', -200),
    phase('site', '遗址', '汉长安城宫殿遗址', '宫殿台基和夯土遗迹以考古遗址形式保存。', -200, 9),
    phase('restoration', '现代复原', '遗址标识展示', '现代主要通过台基保护、标识和研究图示呈现，不重建完整宫殿。', 2000),
  ], ['liu-bang', 'wang-mang'], ['han_western', 'xin'], ['changle-palace-built', 'han-imperial-accession', 'qin-unification'], ['夯土台基', '宫殿区遗迹', '遗址分区标识'], '汉长安城遗址保护与汉初宫城研究节点。', '长乐宫具体建筑布局和后世沿革须以发掘资料区分，不能用展示图复原全部原貌；前202年是营建启动阶段，前200年为史料所载建成端点，跨政权沿用不等于单一政权遗产归属。'),
  detail('taiji-palace-site', '今西安市西北部唐长安城宫城遗址范围内。', ['隋唐宫城正殿空间', '隋唐中央政治仪式与宫城制度'], [
    phase('original', '原建筑', '隋唐时期', '太极宫作为隋唐宫城核心空间，承担朝会和政治仪式功能。', 582, 634),
    phase('site', '遗址', '宫城遗址', '相关宫城台基、城墙和道路信息主要通过考古分区理解。', 582, 907),
    phase('restoration', '现代复原', '遗址公园与研究图示', '现地展示以保护和解释为主，未恢复一座可使用的隋唐宫殿。', 2000),
  ], ['yang-jian', 'li-shimin'], ['sui', 'tang'], ['sui-unification', 'tang-founded'], ['宫城范围', '夯土台基信息', '城墙与道路遗迹'], '隋唐宫城制度研究和城市考古参照点。', '太极宫各殿址的现代定位和名称对应存在研究差异，展示点位应标注为约址。', ['zizhi-tongjian', 'modern-geography-reference']),
  detail('hanguang-gate-site', '今西安市南部唐长安城遗址保护范围内。', ['唐长安城南部城门', '城门、道路与城市交通体系'], [
    phase('original', '原建筑', '隋唐时期', '含光门是唐长安城城门体系的一部分，与城墙和南北向道路相连。', 582, 907),
    phase('site', '遗址', '城门遗址', '门道、城墙和道路遗迹通过考古发掘与保护展示被识别。', 582, 907),
    phase('restoration', '现代复原', '遗址保护展示', '现代标识和局部展示帮助理解门址，但不代表城门楼完整复建。', 2000),
  ], ['yang-jian', 'li-shimin'], ['sui', 'tang'], ['sui-unification', 'tang-founded'], ['门道与城墙遗迹', '道路轴线', '保护性展示设施'], '隋唐都城城门与道路系统的考古节点。', '门楼上部形制、装饰和具体高度缺少可直接对应今日展示的完整证据。'),
  detail('mingde-gate-site', '今西安市南郊唐长安城南墙遗址一带。', ['唐长安城南门', '隋唐礼制、城门仪式与城市轴线'], [
    phase('original', '原建筑', '隋唐时期', '明德门是唐长安城南墙的重要城门，连接城市中轴与城外交通。', 582, 907),
    phase('site', '遗址', '城门遗址', '门址、道路和城墙基础以考古遗迹和遗址保护设施保存。', 582, 907),
    phase('reconstruction', '后世重建', '现代遗址公园建设', '后世和现代的纪念性构筑物只表达城门记忆，不是唐代门楼连续保存。', 1900, 1999, '复建形式不应被误读为唐代原建筑。'),
    phase('restoration', '现代复原', '当代展示', '遗址展示对门址尺度和轴线作可视化解释。', 2000),
  ], ['li-yuan', 'li-shimin'], ['sui', 'tang'], ['tang-founded', 'an-lushan-rebellion'], ['门址与城墙基础', '南北向道路轴线', '展示性标识与模型'], '唐长安城南部城市考古和公共历史教育节点。', '城门上层建筑的形制与复原尺度存在研究边界，现代模型不等于实测原貌。'),
  detail('ximing-temple-site', '今西安市南郊唐长安城遗址相关区域，具体位置为约址。', ['唐代译经与寺院网络', '长安佛教和中外文化交流'], [
    historicalPhase('original', '原建筑', '656年营建起', '西明寺于唐显庆元年营建，成为唐长安城重要寺院之一，与译经、僧侣往来和国家佛教活动相关。', 656, 907),
    historicalPhase('site', '遗址', '寺院遗址与文献地点', '寺院整体建筑已不存，位置和空间主要结合文献、考古与城市格局研究。', 907),
    historicalPhase('restoration', '现代复原', '研究图示与纪念展示', '现代以标识和研究性复原图解释寺院网络，不宣称完整复建原寺。', 2000, undefined, '具体院落、塔院和殿址的对应关系仍有不确定性。'),
  ], ['xuan-zang', 'li-shimin', 'li-zhi'], ['tang'], ['ximing-temple-built', 'xuanzang-at-ximing-658', 'tang-founded'], ['文献记载的寺院位置', '相关译经传统', '现代研究图示'], '唐长安佛教、译经和国际交流的研究节点。', '寺院具体位置和建筑布局不能仅凭后世传说确定，现代标注为约址；656年营建和658—659年玄奘阶段已有西明寺专属事件。跨五处遗产的统一译经事件端点（xuanzang-translations）仍未闭合，因此不挂接到本详情，也不把建筑年代拼接为译经事件。', [...historicalSourceIds, 'xian-local-chronicle-ximing-temple', 'ximing-temple-primary-biography', 'xuanzang-national-museum']),
  detail('qinglong-temple-site', '今西安市雁塔区青龙寺遗址及其周边。', ['唐代密教传播', '长安东南部寺院与东亚佛教交流'], [
    historicalPhase('original', '原建筑', '582—711年', '青龙寺前身始建于隋开皇二年（582年），唐代经历废置、复立，景云二年（711年）定名青龙寺，成为长安东部重要寺院。', 582, 711),
    historicalPhase('site', '遗址', '845—1086年及现代考古', '会昌禁佛后寺院功能发生变化，855年恢复青龙寺名；北宋元祐年间仍见文献记载。1963年调查、1973—1980年发掘确认北门、东院、塔院、墙址等遗存。', 845, 1980, '文献沿革、唐代文化层和现代考古遗迹不是同一保存层，不能据此复原完整唐代寺院。'),
    historicalPhase('reconstruction', '后世重建', '20世纪纪念性建设', '后世纪念空间沿用青龙寺名称并重建局部建筑，不等同于唐代寺院原貌。', 1900, 1999, '现代园林和纪念建筑应与唐代寺院遗址、出土构件分层展示。'),
    historicalPhase('restoration', '现代复原', '当代文化展示', '现代建筑和园林用于纪念、展示与交流，历史原构和现代复建分层呈现。', 2000),
  ], ['xuan-zang', 'li-shimin'], ['tang'], ['tang-founded', 'xuanzang-translations'], ['北门、东院与塔院遗址', '唐代建筑构件与宗教遗物', '纪念性建筑与佛教交流展示'], '东亚佛教交流和西安城市文化记忆节点。', '唐代寺院原址、后世纪念建筑、现代园林和考古出土层不能视为同一组连续建筑；惠果、空海等交流史事未在本项目人物端点中新增推断关系。当前资料尚不能形成统一译经事件端点：缺少可共同适用于五处遗产的统一起止年代、地点集合、阶段链和独立来源；不把建筑年代拼接为译经事件，保留 xuanzang-translations 待核关联。', [...historicalSourceIds, 'qinglong-temple-official']),
  detail('huaqing-palace', '今西安市临潼区骊山北麓，位于古长安城以东。', ['唐代温泉宫苑', '帝王巡幸、宫廷生活与关中交通'], [
    phase('original', '原建筑', '唐代扩建', '华清宫沿骊山温泉发展为宫苑，与唐代帝王巡幸和长安东行交通相关。', 618, 907),
    phase('site', '遗址', '宫苑遗址与温泉遗存', '部分遗址、温泉和山麓环境保留了宫苑地点的历史线索。', 907),
    phase('reconstruction', '后世重建', '历代宫观与园林变化', '宫苑在后世经历多次毁损和重建，现存景观并非唐代连续遗存。', 1000, 1900, '各时期建筑叠压关系需以考古和维修记录核验。'),
    phase('restoration', '现代复原', '现代景区展示', '现代景区复原部分宫苑意象，服务于公众展示和旅游使用。', 1900),
  ], ['li-shimin', 'li-yuan'], ['tang'], ['tang-founded', 'an-lushan-rebellion'], ['温泉环境', '骊山宫苑格局', '现代展示建筑'], '唐代关中宫苑、温泉文化和现代历史景区的叠合地点。', '现存景区建筑与唐代华清宫的对应关系不能仅由名称或传统叙事确定。'),
  detail('maoling', '今陕西省兴平市东北部，位于西汉长安城西北陵区。', ['汉武帝帝陵', '西汉帝陵制度、陵邑与关中礼制空间'], [
    historicalPhase('original', '原建筑', '前139年后营建', '茂陵作为汉武帝帝陵，建元二年（前139年）开始营建，配有陵园、陪葬和陵邑相关空间。', -139, undefined, undefined, maolingSourceIds),
    historicalPhase('site', '遗址', '西汉帝陵遗址', '封土、陵园和相关遗迹保留了帝陵区的历史地貌信息。', -139, 9, undefined, maolingSourceIds),
    phase('restoration', '现代复原', '遗址保护与博物馆展示', '现代保护以封土、石刻和遗址环境为主，展示性建筑单独标注。', 1900),
  ], ['liu-che'], ['han_western'], ['maoling-built', 'han-imperial-accession'], ['陵墓封土', '陵园范围', '陪葬与陵邑相关遗迹'], '西汉帝陵考古和关中历史地理研究节点。', '陵园范围、陪葬关系和陵邑行政含义不能仅凭封土规模推断；前139年是作寿陵和开始营建的年代，不等于全部陵区建筑同年完成。', maolingSourceIds),
  detail('du-ling', '今西安市雁塔区曲江一带，古今城市边界已经发生变化。', ['汉宣帝帝陵', '西汉晚期帝陵与长安南部空间'], [
    historicalPhase('original', '原建筑', '前65年后营建', '杜陵是汉宣帝刘询的帝陵，元康元年（前65年）在杜东原择址营建，陵园与长安南部城市、陵区相连。', -65, undefined, undefined, dulingSourceIds),
    historicalPhase('site', '遗址', '西汉帝陵遗址', '封土和陵园遗迹以考古和地面遗存形式保存。', -65, 9, undefined, dulingSourceIds),
    phase('restoration', '现代复原', '遗址保护展示', '现代以封土保护、环境整治和说明牌展示为主，不复原完整陵园建筑。', 2000),
  ], ['liu-xun'], ['han_western'], ['du-ling-built', 'han-imperial-accession'], ['封土', '陵园遗存', '现代保护环境'], '西汉晚期帝陵和西安南部历史地理参照点。', '杜陵与现代曲江城市景观的边界不能直接当作汉代陵园边界；前74年为汉宣帝即位年，不作为杜陵营建年。', dulingSourceIds),
  detail('han-changling', '今咸阳市渭城区五陵原一带，属于长安北部帝陵区。', ['汉高祖刘邦帝陵', '汉初帝陵与长安北部陵区秩序'], [
    phase('original', '原建筑', '前195年后营建', '长陵是汉高祖刘邦帝陵，位于长安北部五陵原帝陵区。', -195),
    phase('site', '遗址', '西汉帝陵遗址', '陵墓封土及陵园环境构成现存主要遗迹。', -195, 9),
    phase('restoration', '现代复原', '文物保护展示', '现代对封土和陵区环境进行保护，不将后世整治视为汉初原建筑。', 1900),
  ], ['liu-bang'], ['han_western'], ['han-imperial-accession'], ['封土与陵区地貌', '帝陵区空间关系', '保护性说明设施'], '汉初帝陵与关中帝陵制度的历史参照点。', '帝陵封土、陵园和陵邑的具体边界需要区分文献记载与考古实测。'),
  detail('xian-city-wall', '今陕西省西安市中心明城墙及其城门、护城河一带；明代城界与现代西安市区不完全重合。', ['明代西安府城与关中军事交通', '城墙防御、城市街巷与今日西安历史景观'], [
    phase('original', '原建筑', '明代扩建', '现存城墙基础和主要形制形成于明代西安府城建设。', 1374, 1378),
    phase('site', '遗址', '明城墙历史遗存', '城墙、城门和护城河构成仍在使用和保护中的城市遗产。', 1374, 1911),
    phase('reconstruction', '后世重建', '明清至近代维修', '城墙在明清及近现代经历多次维修、补砌和功能变化。', 1400, 1949, '具体砖石和墙体层位不能一概视为明初原构。'),
    phase('restoration', '现代复原', '20世纪后期以来保护维修', '现代修缮恢复连续城市景观并改善安全使用条件，维修段落需单独记录。', 1980),
  ], ['zhu-yuanzhang'], ['ming'], ['ming-founded'], ['城墙与城门', '护城河遗迹', '连续城市步道与展示系统'], '仍具城市边界识别和公共文化使用功能的历史城墙，也是观察明代地方城市防御与现代西安城市记忆的实体节点。', '西安城墙的营建、维修和现代保护跨越多个时期；明建立事件仅作为政权与城市制度的关联入口，不代表城墙在1368年一日完成，也不能把每一段现存砖石都视为明初原构。', ['china-chronology', 'modern-geography-reference']),
  detail('luoyang-han-wei-city-site', '今河南省洛阳市偃师区二里头以东、汉魏故城保护范围一带；古城边界不等同于现代行政边界。', ['东汉迁都洛阳后的宫城与外郭城', '曹魏、西晋和北魏前期对洛阳城的沿用与改造'], [
    phase('original', '原城营建', '东汉25年后', '刘秀定都洛阳后，汉魏洛阳城成为东汉中央政治与礼制空间。', 25, 220),
    phase('site', '遗址', '东汉至北魏城址层', '城墙、宫城、道路和排水等遗迹以考古地层和夯土遗存形式保存。', 25, 534),
    phase('restoration', '现代保护展示', '20世纪以来', '保护区通过考古工作、标识和遗址展示解释城址格局，不重建完整汉魏都城。', 1900, undefined, '不同朝代城址叠压，现地可见遗迹不等于某一朝代建筑完整保存。'),
  ], ['liu-xiu', 'yuan-hong', 'tuoba-tao'], ['han_eastern', 'wei_three', 'jin_western', 'wei_northern'], ['han-eastern-founded', 'jin-unification', 'northern-wei-founded'], ['城墙与宫城夯土', '道路和排水遗迹', '多朝代叠压地层'], '洛阳古都史、都城制度和考古学学习的核心遗址。', '古城范围、各朝代城垣对应关系和部分宫殿位置需以考古报告分层理解；遗址现状不等同于历史建筑完整留存。', ['zizhi-tongjian', 'modern-geography-reference']),
  detail('luoyang-sui-tang-city-site', '今洛阳市区及偃师、洛龙等隋唐洛阳城遗址分布区，现代城市与古城范围并不重合。', ['隋炀帝营建东都', '唐代东都、武周神都的宫城与里坊体系'], [
    phase('original', '原城营建', '605年起', '隋代营建东都，宫城、皇城、外郭城和洛水水系共同构成新的都城格局。', 605, 618),
    phase('reconstruction', '历代沿用与改造', '唐至武周时期', '唐及武周继续使用并调整宫城、里坊和水运设施，洛阳与长安共同承担帝国政治功能。', 618, 907, '“沿用”表示城市制度和空间被继续利用，不表示隋代原建筑全部保存。'),
    phase('site', '遗址', '隋唐城址考古层', '宫城、城门、里坊、道路和河道遗迹以考古遗址和城市地下遗存形式保存。', 605, 907),
    phase('restoration', '现代展示', '当代遗址保护', '现代公园、考古展示和地面标识帮助理解都城结构，不将复原景观当作隋唐原建筑。', 2000, undefined, '展示性复原与原始建筑应明确区分。'),
  ], ['yang-jian', 'li-yuan', 'li-shimin', 'wu-zhao'], ['sui', 'tang', 'wu_zhou'], ['sui-founded', 'tang-founded', 'an-lushan-rebellion', 'wu-zhou-founded'], ['宫城与皇城遗迹', '里坊、道路和水系', '城门及考古展示区'], '观察隋唐多都制、城市规划和国家交通网络的重要地点。', '洛阳城址在不同阶段有扩展、改造和叠压；现代展示设施不能直接证明隋唐建筑原貌。', ['zizhi-tongjian', 'modern-geography-reference']),
  detail('white-horse-temple', '今河南省洛阳市洛龙区白马寺镇；寺院现址可定位，但历代寺域和建筑范围多有变化。', ['东汉洛阳佛教传播传统', '寺院作为都城宗教与跨地域交流空间的历史记忆'], [
    historicalPhase('original', '创建传统', '东汉明帝时期，传统纪年为68年', '官方资料将永平十一年（68年）作为白马寺始建年代，创建传统与具体早期建筑形制仍需区分。', 68, undefined, '创建故事、文献记载与考古证据不能互相替代。', whiteHorseSourceIds),
    historicalPhase('reconstruction', '历代重建', '东汉以后至明清', '寺院经历毁损、重修和格局调整，今日建筑群不是东汉原貌的连续留存。', 100, 1900, '各殿宇的始建、重修和现存构件年代不能用寺院创建年一概替代。', whiteHorseSourceIds),
    historicalPhase('restoration', '现代保护', '近现代以来', '现代维修和景观整治维持寺院使用与展示功能，部分建筑为后世重建或保护性修缮。', 1900, undefined, undefined, whiteHorseSourceIds),
  ], ['liu-xiu', 'ban-gu', 'xuan-zang'], ['han_eastern', 'tang'], ['white-horse-temple-founded', 'han-eastern-founded', 'tang-founded'], ['寺院中轴与殿宇群', '碑刻、塔院和历史陈设', '历代修缮叠合的建筑环境'], '东汉洛阳与佛教中国化研究的城市文化节点。', '白马寺“始建”与今日可见建筑并非同一保存层；具体殿宇年代和早期遗存应逐项核验。', whiteHorseSourceIds),
  detail('jiankang-six-dynasties-city-site', '今南京市主城及秦淮河、石头城等历史空间；六朝城界与今日南京市区不重合。', ['孙吴建业、东晋建康及南朝都城空间', '宫城、台城、石头城与秦淮水运体系'], [
    phase('original', '都城形成', '229年后', '孙吴以建业为都，南渡后的东晋和南朝继续在此经营建康政治空间。', 229, 589),
    phase('site', '遗址与城市层', '六朝时期', '城墙、宫城、道路和水系信息主要通过考古发现、城市地层和历史地理复原辨识。', 229, 589),
    phase('restoration', '现代展示', '当代城市考古', '现代博物馆、遗址标识和城市公共空间解释六朝都城，不重建完整台城或宫城。', 2000, undefined, '现代城市道路和纪念性设施不能直接视为六朝原建筑。'),
  ], ['xiao-daocheng', 'xiao-baorong', 'chen-baxian', 'chen-shubao', 'sun-quan'], ['wu_three', 'jin_eastern', 'song_southern', 'qi_southern', 'liang_southern', 'chen_southern'], ['wu-three-founded', 'eastern-jin', 'sui-unification', 'southern-qi-founded', 'southern-qi-ended-502', 'southern-chen-founded', 'southern-chen-ended-589'], ['城墙、台城和石头城相关遗迹', '秦淮河水系与城市空间', '考古地层和历史地理标识'], '理解六朝政治中心南移、都城制度和南京城市层累的重要节点。', '六朝建康的宫城、外郭城和各时期边界仍需按考古与文献分期，不能用现代南京边界替代。', ['zizhi-tongjian', 'modern-geography-reference']),
  detail('southern-dynasties-stone-carvings', '今南京及其周边南朝陵墓石刻分布区，单点坐标只作建康城市圈导航。', ['南朝帝陵制度与神道石刻', '建康政治中心周边的陵墓、礼仪与交通景观'], [
    phase('original', '陵墓石刻营造', '420—589年', '刘宋、南齐、梁、陈时期的陵墓神道配置石兽、碑刻等礼仪性设施。', 420, 589),
    phase('site', '分散遗存', '南朝以后', '石刻多以原地、迁移后或残存构件形式保存，分布并非一处完整陵园。', 420, 589, '不同石刻的墓主、原位置和年代需要逐件考证。'),
    phase('restoration', '现代保护', '20世纪以来', '现代以文物保护、标识和环境整治为主，不将补配或景观整理当作南朝原构。', 1900),
  ], ['xiao-daocheng', 'chen-baxian'], ['song_southern', 'qi_southern', 'liang_southern', 'chen_southern'], ['southern-qi-founded', 'southern-chen-founded', 'sui-unification'], ['石兽、碑刻与神道构件', '陵墓空间与道路关系', '分散遗存的保护标识'], '把南京今日城市景观与南朝政治、礼制和墓葬考古相联系的实物入口。', '现存石刻不等于整座陵墓完整保存；石刻迁移、残缺和墓主认定需分别标注。', ['zizhi-tongjian', 'modern-geography-reference']),
  detail('ye-city-site', '今河北省邯郸市临漳县邺城遗址保护区一带，漳河改道和现代村镇使古城范围需依考古资料定位。', ['曹魏邺城的规划传统', '后赵、前燕、东魏、北齐的政治中心与宫城空间'], [
    phase('original', '城市营建', '3世纪前后', '邺城在曹魏时期形成重要城市规划传统，后续十六国和北朝政权继续利用其政治位置。', 204, 350),
    phase('reconstruction', '多政权改造', '335—577年', '后赵、前燕、东魏和北齐时期，宫城、城垣和政治空间持续变化。', 335, 577, '不同政权的城址层、宫城范围和制度用途不能合并为一座静态古城。'),
    phase('site', '考古遗址', '20世纪以来', '城墙、宫殿区、道路和铜雀台等相关遗迹以考古调查、发掘和遗址保护形式保存。', 1900),
  ], ['gao-huan', 'gao-yang', 'yuan-shanjian', 'murong-huang', 'murong-wei', 'fu-jian'], ['wei_eastern', 'qi_northern', 'later_zhao', 'former_yan', 'former_qin'], ['eastern-wei-founded', 'eastern-wei-ended-550', 'northern-qi-founded', 'later-zhao-founded', 'later-zhao-moves-ye', 'former-yan-founded', 'former-yan-ended-370'], ['城垣与宫城遗址', '道路和台址', '多政权叠压的考古层'], '研究十六国、北朝都城、宫城制度和河北历史地理的关键遗址，并追踪东魏禅代、北齐承接及前燕终止后的城市承接。', '邺城不同阶段城址和建筑的对应关系需考古分期；现存台址、地面标识不等同于历史宫殿完整留存，550年政权终止也不等于城市遗产终止。', ['zizhi-tongjian', 'china-chronology', 'modern-geography-reference', 'ye-city-official']),
  detail('former-shu-yongling', '今四川省成都市金牛区永陵路一带，墓室和石刻遗存位于现代城市博物馆保护范围内。', ['前蜀王建陵墓', '成都作为十国都城的宫廷、墓葬与城市记忆'], [
    phase('original', '陵墓营建', '918年前后', '王建去世后葬于永陵，墓室、石刻和随葬体系反映前蜀皇帝陵墓制度。', 918),
    phase('site', '墓室遗存', '20世纪发掘与保护', '墓室、石床、石刻和部分遗物以考古遗址与博物馆形式保存。', 900, 2000),
    phase('restoration', '现代保护展示', '当代博物馆', '现代保护设施服务于墓室安全和公众展示，不把展陈复原物视作前蜀原建筑。', 2000, undefined, '墓室保存与原始陵园、地面建筑是否完整连续是不同问题。'),
  ], ['wang-jian', 'wang-yan'], ['former_shu'], ['former-shu-founded', 'former-shu-ended-925'], ['墓室与石床', '石刻伎乐图像', '博物馆保护展示空间'], '成都十国史、前蜀王权和古代陵墓艺术的可见节点。', '今日可见遗存主要是墓室和相关考古材料，不能等同于前蜀完整陵园建筑群；925年政权终止不等于成都遗产消失。', ['zizhi-tongjian', 'modern-geography-reference']),
  detail('jinyang-ancient-city-site', '今山西省太原市晋源区晋阳古城遗址及其周边，古晋阳与现代太原市区并非同一城市边界。', ['河东政治中心与晋阳城', '北汉以太原为都的地方政权传统', '979年北汉终止与北宋接收太原的城市转折'], [
    phase('original', '城址发展', '北朝至隋唐时期', '晋阳作为太原盆地重要城市和军事、交通中心，城址在多个时期持续发展。', 550, 907),
    phase('reconstruction', '北汉政治中心', '951—979年', '北汉以太原为都，晋阳城市传统与河东军政资源共同构成政权中心背景。', 951, 979, '北汉都城“太原”与考古学意义上的晋阳城范围不能简单完全重合。'),
    phase('site', '考古遗址', '现代考古保护', '城墙、宫殿、道路和水利遗迹以考古遗址形式保存，部分区域被现代环境覆盖。', 1900),
  ], ['liu-zhiyuan', 'liu-min', 'liu-jiyuan', 'taizong-song', 'guo-wei'], ['northern_han', 'han_later', 'song_northern'], ['northern-han-founded', 'northern-han-ended-979', 'five-dynasties', 'northern-song-founded'], ['城墙、宫殿和道路遗迹', '水利与城市环境', '太原攻守与城市接收的历史地理线索', '遗址公园和考古展示'], '从今天的太原观察晋阳城市传统、北汉都城、979年北宋接收与五代十国政治转折。', '晋阳古城考古范围、北汉都城“太原”称谓、979年政权终止和现代太原行政边界需分层说明；遗址保护现状不等于城池完整保存，宋军接收也不等于现存建筑全部可归于北汉或北宋。', ['zizhi-tongjian', 'modern-geography-reference']),
  detail('kaifeng-northern-song-city-site', '今河南省开封市区及其地下城摞城分布区；北宋东京城与今日街区存在多层叠压。', ['北宋东京的宫城、外城和水运网络', '开封作为中原王朝首都的城市治理与人口聚集'], [
    phase('original', '都城营建', '960年后', '北宋以开封为都，继承五代城市基础并不断扩建宫城、外城和漕运设施。', 960, 1127),
    phase('site', '城摞城遗址', '北宋城址考古层', '城墙、宫城、水系和道路遗存与后世城市层叠压，主要通过考古发掘和地下探测认识。', 960, 1127),
    phase('restoration', '现代考古展示', '当代城市保护', '现代博物馆、遗址公园和地面标识解释北宋东京，不重建完整北宋都城。', 2000, undefined, '开封现存建筑和复原景观不能直接视作北宋原建筑连续留存。'),
  ], ['zhu-wen', 'shi-jingtang', 'liu-zhiyuan', 'guo-wei'], ['liang_later', 'jin_later', 'han_later', 'zhou_later', 'song_northern'], ['later-liang-five-dynasties-founded', 'five-dynasties', 'northern-song-founded', 'song-southward'], ['城摞城地层', '宫城与外城遗迹', '河道、城门和城市考古展示'], '观察五代至北宋都城延续、城市水运和中原政治中心变迁的关键地点。', '北宋东京城的复原范围应以考古资料为依据，现代开封城不能直接替代北宋城界；五代后梁关联的是城市考古历史层，不代表现存可见建筑即为后梁原构。', ['zizhi-tongjian', 'modern-geography-reference']),
  detail('kaifeng-later-jin-han-city-layer', '今河南省开封市区及其地下城摞城分布区；后晋、后汉城址层与后梁、后周、北宋城市层相互叠压。', ['后晋、后汉以开封为都城阶段的宫城、官署与城市交通', '五代中原政权更替中的开封城市连续性'], [
    historicalPhase('original', '后晋开封都城阶段', '936—947年', '后晋承接后唐中原政治机构，以开封为正式都城；相关城市空间应通过五代编年与开封城址考古分层理解。', 936, 947, '现存开封城市遗存多为后世叠压层，不能据此指认后晋专属建筑。'),
    historicalPhase('reconstruction', '后汉开封都城阶段', '947—951年', '后汉进入中原后继续以开封为正式都城，城市政治功能在短时段内承接后晋秩序。', 947, 951, '后汉时期缺少可单独归属的完整地面建筑，遗产表达限于城市历史层。'),
    phase('site', '五代城摞城考古层', '五代至北宋城市叠压', '城垣、宫城、道路和水系遗存以考古调查、发掘和城市历史地理研究方式保存。', 907, 1127, '不同朝代的城址范围与建筑年代必须分层，不能以北宋复原图替代后晋或后汉城市原貌。'),
    phase('restoration', '现代考古展示', '当代城市保护', '博物馆、遗址标识和城市考古展示帮助理解五代开封，不重建后晋或后汉完整宫城。', 2000, undefined, '现代展示设施与历史原构需要区分。'),
  ], ['shi-jingtang', 'shi-chonggui', 'yelu-deguang', 'liu-zhiyuan', 'liu-chengyou', 'guo-wei'], ['jin_later', 'han_later', 'zhou_later'], ['jin-later-founded', 'later-jin-ended-947', 'han-later-founded', 'later-han-ended-951'], ['城摞城地层', '宫城与官署遗址线索', '河道、道路和城市考古展示'], '从今日开封观察后晋建立、947年后晋终止、后汉承接、951年后汉终止与后周接续，连接政权终结、人物关系、首都阶段和城市遗产。', '该条是后晋—后汉共享并延伸至后周承接的城市历史层，不代表某座现存建筑属于单一政权；契丹南下、950年前后后汉危机和951年受禅是政权控制转换节点，不等于现存建筑属于单一政权原构；后梁、后周和北宋阶段仍需通过各自事件与时期数据区分。', ['zizhi-tongjian', 'capital-history-reference', 'modern-geography-reference']),
  detail('kaifeng-later-zhou-city-layer', '今河南省开封市区及其地下城摞城分布区；后周城市层与后晋、后汉及北宋城市层相互叠压。', ['后周以开封为正式都城阶段的宫城、官署、军政与交通空间', '960年陈桥—回师受禅所连接的后周终止与北宋建立城市背景'], [
    historicalPhase('original', '后周开封都城阶段', '951—954年', '郭威受禅后后周承接开封中原政治空间，城市历史层延续五代都城功能。', 951, 954, '现存开封遗存多为后世叠压层，不能据此指认郭威时期某一建筑为后周原构。'),
    historicalPhase('reconstruction', '柴荣整顿与后周中期', '954—959年', '柴荣在开封推进军政整顿并展开对外战争，城市作为中央政权与军政调度中心持续使用。', 954, 959, '军政活动与城市考古层应分开表达，不以战争范围替代都城遗产边界。'),
    historicalPhase('site', '陈桥—开封政权转换层', '960年', '陈桥拥立、回师开封和后周禅代连接后周终止与北宋建立；陈桥在开封东北，城市层不替代兵变现场精确定位。', 960, 960, '960年政治转换是连续过程，不能把北宋后续统一或后世开封建筑前置为后周遗产。'),
    phase('restoration', '现代考古展示', '当代城市保护', '博物馆、遗址标识和城市考古展示帮助理解后周开封，不重建未经确认的后周完整宫城。', 2000, undefined, '现代展示设施与历史原构需要区分。'),
  ], ['guo-wei', 'chai-rong', 'chai-zongxun', 'zhao-kuangyin'], ['zhou_later', 'song_northern'], ['zhou-later-founded', 'later-zhou-ended-960', 'northern-song-founded'], ['城摞城地层', '宫城与官署遗址线索', '军政交通与城市考古展示'], '从今日开封观察后周建立、郭威与柴荣时期的都城承接、960年后周终止以及北宋建立之间的连续城市史。', '该条是后周—北宋承接的城市历史层，不代表某座现存建筑属于后周原构；陈桥位于开封东北，开封城市遗产只表达受禅与政治承接关联，不替代精确兵变地点。', ['zizhi-tongjian', 'capital-history-reference', 'modern-geography-reference']),
  detail('later-liang-kaifeng-city-layer', '今河南省开封市区及其地下城摞城分布区；后梁开封城市层与后唐、后晋、后汉、后周及北宋城市层相互叠压。', ['后梁以开封为正式都城阶段的宫城、官署、道路和水运网络', '923年后梁终止与后唐接收之间的城市政治连续性'], [
    historicalPhase('original', '后梁开封都城阶段', '907—923年', '后梁受禅建政后以开封为正式都城，城市空间承接唐末汴州基础并继续服务中原政治。', 907, 923, '后梁都城使用与具体宫城、官署单体的考古对应关系仍需分层核验。'),
    phase('site', '后梁城市考古层', '五代开封城摞城', '城垣、宫城、道路、水系与城市遗物通过开封城摞城考古和五代编年资料分层理解。', 907, 923, '现存开封遗存多为后世叠压层，不能据此指认后梁专属建筑或完整城界。'),
    phase('reconstruction', '后唐接收与后续叠压', '923年后', '后梁终止后，开封继续作为五代政治和交通空间使用，后唐、后晋、后汉、后周及北宋阶段分别叠加。', 923, 1127, '后续政权沿用城市空间不等于后梁制度和建筑原样延续。'),
    phase('restoration', '现代考古展示', '当代城市保护', '现代城市考古、博物馆和遗址标识帮助理解后梁开封城市层，不重建未经确认的后梁宫城。', 2000, undefined, '现代展示设施、复原景观与后梁原构需严格区分。'),
  ], ['zhu-wen', 'zhu-youzhen', 'li-cunxu'], ['liang_later', 'tang_later'], ['later-liang-five-dynasties-founded', 'later-liang-ended-923', 'tang-later-founded'], ['城摞城地层', '宫城、官署和道路遗迹线索', '河道、水运与城市考古展示'], '从今日开封观察后梁建政、923年终局和后唐接收，连接首都阶段、人物关系和五代城市连续性。', '该条是后梁开封城市历史层，不代表任何现存建筑属于后梁原构；923年终止是政权和都城控制的编年节点，地方接收、城市建筑年代与后唐实际控制范围需要分别核验。', ['zizhi-tongjian', 'capital-history-reference', 'modern-geography-reference']),
  detail('linan-southern-song-imperial-city-site', '今杭州市上城区凤凰山、南宋皇城遗址及临安城历史空间一带，现代城区已覆盖大量古城层。', ['南宋临安宫城、御街和城市水陆交通', '宋室南渡后的政治中心与江南城市社会'], [
    phase('original', '都城形成', '1127年后', '宋室南渡后，临安逐步形成宫城、御街、官署和市场相互连接的都城空间。', 1127, 1279),
    phase('site', '城市考古层', '南宋城址遗存', '宫城基址、道路、河道和相关遗迹以考古发现和城市历史地理研究形式保存。', 1127, 1279),
    phase('restoration', '现代遗址展示', '当代保护与公园展示', '南宋皇城遗址等地点通过保护、标识和展示帮助理解临安空间，不重建完整南宋宫城。', 2000, undefined, '现地复原、纪念设施与南宋原建筑应分层标注。'),
  ], ['zhao-gou', 'yue-fei'], ['song_south'], ['southern-song-founded', 'song-southward', 'song-linan-center-formed'], ['宫城遗址与台基', '御街、道路和水系遗迹', '遗址公园与城市标识'], '理解南宋政治中心南移、杭州城市形成和宋代城市生活的核心地点。', '临安城范围、皇城遗址和现代杭州行政边界不能互相替代；现存主要是考古层和展示设施，不等同于南宋建筑完整保存。', ['zizhi-tongjian', 'modern-geography-reference']),
  detail('yamen-song-yuan-battle-site', '今广东省江门市新会区崖门镇及崖门水道、崖山相关区域；具体战场范围与现代行政边界不重合。', ['1279年南宋政权终止相关海战与军政转折', '宋末帝赵昺、陆秀夫与元军南下的区域历史记忆'], [
    historicalPhase('original', '宋元终局相关区域', '1279年前后', '崖门水域及其沿海交通网络承载南宋末期政权与元军推进的终局阶段；区域节点不能替代完整战场复原。', 1279, 1279, '海战具体水域、参战编制和人物结局需按编年资料与地方考证分层。', ['yuan-nationalities-history', 'china-chronology']),
    historicalPhase('site', '地方历史地理与纪念遗产', '宋元以后至今', '崖门、崖山及相关祠庙、碑刻和地方叙事共同保存宋元政权转换记忆，现代可见设施不等同于1279年原貌。', 1279, 2000, '后世纪念建筑、地方传说和宋元战争遗址线索需区分证据等级。', ['yuan-nationalities-history', 'modern-geography-reference']),
    phase('restoration', '现代纪念与城市展示', '当代', '江门新会地方文博与旅游展示将崖门纳入宋元战争、海洋交通和地方文化记忆，不复原完整宋末战场。', 2000),
  ], ['zhao-bing', 'lu-xiufu'], ['song_south', 'yuan'], ['southern-song-ended-1279'], ['崖门水道与区域海岸线', '宋元战争纪念与地方文博展示', '南宋末期人物与政权转换叙事'], '从今日江门观察南宋政权终止、海上交通与宋元政权转换，并与杭州临安遗产层形成城市—终局双视角。', '崖门是终局相关区域参照，不是已确认的单一战场坐标；纪念设施、地方叙事与宋元原始遗存必须分层。', ['yuan-nationalities-history', 'china-chronology', 'modern-geography-reference']),
  detail('longmen-grottoes', '今河南省洛阳市洛龙区龙门山、香山一带，石窟沿伊河两岸分布。', ['北魏迁都洛阳后的皇家与贵族佛教造像', '武周、唐代洛阳的宗教、艺术和政治表达'], [
    phase('original', '原始营造', '493年前后起', '龙门石窟在北魏孝文帝迁都洛阳前后开始大规模营造，古阳洞等早期洞窟体现北魏都城佛教空间。', 493, 534),
    phase('reconstruction', '历代续造', '东魏至唐代', '东魏、北齐、隋、唐及武周时期持续开凿、造像和题刻，形成多时期叠合的石窟群。', 534, 907, '不同窟龛、造像和题记的年代不能以石窟总始建年替代。'),
    phase('site', '石窟遗存', '北魏至唐代遗存', '窟龛、造像、碑刻和摩崖题记以原位石刻遗存形式保存。', 493, 907),
    phase('restoration', '现代保护', '20世纪以来', '现代保护、加固和数字化展示维持石窟可识别性，保护设施不等同于历史造像原构。', 1900, undefined, '修缮材料、补配部位和展示设施需与原位石刻分层记录。'),
  ], ['yuan-hong', 'wu-zhao'], ['wei_northern', 'tang', 'wu_zhou'], ['northern-wei-founded', 'tang-founded', 'wu-zhou-founded'], ['洞窟与造像', '碑刻题记', '伊河两岸石窟景观与保护设施'], '连接洛阳都城、北魏迁都、武周政治和佛教艺术史的世界文化遗产节点。', '龙门为多朝代持续营造的遗产，不能把唐代或北魏单一时期的造像面貌当作全部遗产现状。', ['zizhi-tongjian', 'modern-geography-reference']),
  detail('yongning-temple-pagoda-site', '今河南省洛阳市偃师区汉魏洛阳城遗址保护范围内，塔基位置按考古遗址标识定位。', ['北魏洛阳城宫城南部的永宁寺', '孝明帝时期国家佛教、都城礼仪与高层木塔'], [
    phase('original', '原建筑', '516年营建', '永宁寺塔为北魏洛阳城重要佛教建筑，史籍记载其塔体高大并处于都城显著空间。', 516),
    phase('site', '塔基遗址', '北魏洛阳城考古层', '木塔毁坏后，塔基、夯土和寺院空间信息以考古遗址形式保存。', 516, 534),
    phase('restoration', '现代保护展示', '当代遗址展示', '现代以考古标识、保护设施和遗址说明解释塔基，不复原整座木塔为历史原建筑。', 2000, undefined, '塔基位置可定位，但塔体高度、结构和装饰应以文献与考古研究区分。'),
  ], ['yuan-hong'], ['wei_northern'], ['northern-wei-founded'], ['塔基夯土与建筑基址', '寺院空间关系', '遗址保护标识'], '理解北魏洛阳城佛教国家化和宫城空间的考古节点。', '永宁寺塔主体已不存；现代展示不能替代北魏木塔原貌，文献记载的规模也需与考古层分开。', ['zizhi-tongjian', 'modern-geography-reference']),
  detail('dingding-gate-site', '今河南省洛阳市洛龙区隋唐洛阳城遗址公园定鼎门展示区。', ['隋唐洛阳城南北中轴与外郭城正门', '都城礼制、道路交通和里坊制度'], [
    phase('original', '城门营建', '605年后', '隋营建东都时形成定鼎门及其南北向城市轴线，唐代继续使用和调整。', 605, 907),
    phase('site', '城门遗址', '隋唐城址考古层', '门址、道路、城墙和相关夯土遗存以考古遗址形式保存。', 605, 907),
    phase('restoration', '现代展示', '当代遗址公园', '现代展示建筑和尺度标识帮助理解城门空间，不等同于隋唐城门原构。', 2000, undefined, '复原高度、材料和地面铺装需与考古原址分层标注。'),
  ], ['yang-jian'], ['sui', 'tang'], ['sui-founded', 'tang-founded'], ['门址与道路遗迹', '外郭城轴线', '遗址公园展示构筑物'], '观察隋唐东都规划、礼制轴线和洛阳城市空间的实物节点。', '现存主要为遗址和展示工程，不能把现代门楼直接视作隋唐原建筑。', ['zizhi-tongjian', 'modern-geography-reference']),
  detail('mingtang-tiantang-site', '今洛阳市老城区隋唐洛阳城国家遗址公园明堂天堂景区一带。', ['武周神都洛阳宫城核心礼制建筑', '武则天时代国家仪式、宗教象征与都城政治'], [
    phase('original', '原建筑', '明堂688年、天堂694年前后', '武周在洛阳宫城营造明堂、天堂等大型礼制与宗教象征建筑。', 688, 695),
    phase('site', '宫城遗址', '武周宫城考古层', '建筑基址和宫城空间以考古遗址形式保存，原有高层木构主体已不存。', 688, 907),
    phase('reconstruction', '现代复原', '当代展示建筑', '现地明堂、天堂为现代展示性复原和博物馆空间，用于解释历史尺度与功能。', 2000, undefined, '现代复原建筑不得当作武周原建筑连续留存。'),
  ], ['wu-zhao'], ['wu_zhou'], ['wu-zhou-founded'], ['明堂、天堂遗址基址', '宫城空间关系', '现代展示性复原建筑'], '理解武周洛阳、女性皇权和国家礼制空间的高识别度城市遗产节点。', '原建筑已毁，今日可见主体以现代展示复原为主；历史基址、文献记载和复原建筑必须分层说明。', ['zizhi-tongjian', 'modern-geography-reference']),
  detail('yungang-grottoes', '今山西省大同市云冈区云冈石窟景区，位于北魏平城西郊历史空间。', ['北魏平城时期皇家主持的石窟营造', '昙曜五窟与北魏佛教、民族融合和都城文化'], [
    phase('original', '原始营造', '460年前后起', '云冈石窟在北魏平城时期开始营造，皇家和僧侣网络推动大型石窟与造像形成。', 460, 494),
    phase('reconstruction', '后续开凿', '北魏中后期', '北魏后续时期继续开凿、雕刻和修整，形成不同洞窟、造像和题刻层次。', 494, 525, '各窟、造像和维修痕迹的具体年代需逐窟核验。'),
    phase('restoration', '现代保护', '20世纪以来', '现代保护工程、监测和展示维持石窟与造像的可见性，修复部位与原刻痕迹分开标注。', 1900, undefined, '风化、修复和后世改动使今日所见不等同于北魏初始状态。'),
  ], ['tuoba-tao'], ['wei_northern'], ['northern-wei-founded'], ['石窟、造像和窟龛', '昙曜五窟', '北魏平城历史景观与保护设施'], '连接平城都城、北魏国家佛教和北方民族文化交流的世界文化遗产节点。', '云冈是多期营造和持续保护的石窟群，不能用单一年代或单一人物解释全部现存内容。', ['zizhi-tongjian', 'modern-geography-reference']),
  detail('zhao-wang-city-site', '今河北省邯郸市南部赵王城国家考古遗址公园，遗址范围与现代城区边界不重合。', ['战国赵国都城宫城、龙台和宫殿区', '邯郸作为赵国政治、军事与交通中心'], [
    phase('original', '宫城营建', '前4世纪至前3世纪', '赵国在邯郸营建宫城和台基，形成战国诸侯都城的礼制与行政空间。', -386, -228),
    phase('site', '考古遗址', '战国赵都城址', '宫殿台基、城垣和道路等遗迹以考古遗址和遗址公园形式保存。', -386, -228),
    phase('restoration', '现代保护展示', '当代遗址公园', '现代保护以遗址标识、考古展示和环境整治为主，不复原完整战国宫城。', 2000, undefined, '展示性龙台或景观构筑物不能直接视作战国原建筑。'),
  ], ['qin-shi-huang', 'zhao-wuling'], ['zhao_warring'], ['zhao-warring-founded-eighth-batch', 'zhao-wuling-reforms-307', 'qin-unification'], ['宫殿台基与龙台', '城垣和道路遗迹', '遗址公园展示系统'], '从今天的邯郸观察战国赵国首都、赵政权进入战国分期、胡服骑射改革、秦灭赵战争和诸侯都城制度的核心遗址。', '赵王城各台基、宫殿和年代对应关系仍需按考古分区理解；建政事件表达赵进入传统战国分期，不等于赵国政治实体此前不存在；胡服骑射是改革节点，不等于赵王城全部建筑在前307年完成；秦灭赵的历史联系也不等于秦代继续使用的全部城址均已确认。', ['zizhi-tongjian', 'modern-geography-reference']),
  detail('tongwan-city-site', '今陕西省榆林市靖边县红墩界镇白城子村附近统万城国家考古遗址公园。', ['夏政权统万城营建', '赫连勃勃时代河套南缘的都城、军事和族群政治'], [
    phase('original', '都城营建', '413年起', '赫连勃勃主持在河套地区营建统万城，城垣和宫城体现夏政权的都城规划与防御需求。', 413, 418),
    phase('site', '城址遗址', '夏都城址', '夯土城垣、宫城和城市分区以大型考古遗址形式保存。', 413, 431),
    phase('restoration', '现代保护展示', '当代遗址公园', '现代保护、步道和展示设施帮助定位城址与理解空间，不重建夏代都城。', 2000, undefined, '夯土风化、后世利用和现代加固层需与原始城墙分开识别。'),
  ], ['heliAN-bobo'], ['xia'], ['xia-capital-tongwan-established'], ['夯土城垣', '宫城与城门遗迹', '遗址公园考古展示'], '把统万城与赫连勃勃、夏政权和河套历史联系起来的首都遗址节点。', '统万城早期营建与后续使用阶段应区分；413年营建事件是统万城的直接建城端点，407年夏政权形成属于前置背景；今日可见夯土遗迹不等于夏代完整建筑群。', ['zizhi-tongjian', 'modern-geography-reference']),
  detail('guzang-ancient-city-site', '今甘肃省武威市城区及相关古城遗址、博物馆展示区域；姑臧古城边界需按考古资料定位。', ['前凉、北凉、后凉等河西政权的政治中心', '姑臧作为凉州行政、军事和丝绸之路交通节点'], [
    phase('original', '城市发展', '4世纪前后', '姑臧在河西地方政权竞争中持续发展，成为前凉及后续凉州政权的重要中心。', 301, 439),
    phase('reconstruction', '多政权沿用', '前凉至北凉、后凉时期', '不同政权在姑臧延续行政、军事和交通功能，城市形态与政治归属随阶段变化。', 314, 439, '不同凉州政权的宫城、外郭城和城市范围不能合并为同一静态城址。'),
    phase('site', '城市遗存', '现代考古与城市层', '城址、墓葬、道路和相关遗物以考古层、博物馆和城市历史空间形式保存。', 1900),
  ], ['fu-jian', 'juqu-mengxun', 'juqu-mujian'], ['former_liang', 'northern_liang', 'later_liang'], ['former-liang-founded', 'later-liang-founded', 'northern-liang-moved-guzang', 'northern-liang-ended-439'], ['古城与城墙遗迹', '河西交通和城市考古材料', '博物馆与遗址展示'], '从今天的武威观察十六国河西政权更替、姑臧都城传统和丝绸之路城市史。', '姑臧古城的具体范围和各政权建筑层位需分期；439年北凉政权终止是政治转换节点，不意味着姑臧城市或河西交通遗产消失。', ['zizhi-tongjian', 'modern-geography-reference']),
  detail('shangyang-palace-site', '今河南省洛阳市西工区隋唐洛阳城宫城西部及洛河沿线相关考古区域。', ['唐代洛阳宫城西部的上阳宫', '武周时期洛阳宫廷、园林和政治生活'], [
    phase('original', '原建筑', '674—676年上元中营造；675年为通行整理年', '上阳宫作为唐代洛阳宫城西部宫苑，679年已有宫成、移御记载；武周时期继续承担宫廷生活与政治空间功能。', 674, 676, '始建单年不能从“上元中”直接确定，679年宫成是另一个明确端点。'),
    phase('reconstruction', '武周沿用与调整', '690—705年', '武则天以洛阳为神都时，上阳宫与宫城其他空间共同构成武周政治中心。', 690, 705, '文献所见宫苑功能与具体建筑遗存的对应关系需分项核验。'),
    phase('site', '宫苑遗址', '现代城市考古层', '宫苑范围、建筑基址和城市地层以考古线索与历史地理研究形式保存。', 674, 907),
    phase('restoration', '现代保护展示', '当代城市展示', '现代以考古保护、城市标识和博物馆展示关联上阳宫，不重建完整唐代宫苑。', 2000, undefined, '现代景观和纪念性构筑物不能直接视作上阳宫原建筑。'),
  ], ['wu-zhao'], ['tang', 'wu_zhou'], ['shangyang-palace-built', 'shangyang-palace-completed-679', 'tang-founded', 'wu-zhou-founded'], ['宫苑基址与城市考古层', '洛河与宫城空间关系', '现代考古标识和展示设施'], '补充洛阳作为唐、武周政治中心的宫苑视角，与明堂天堂、定鼎门形成城市空间互证。', '上阳宫始建单年仍应写作约年或范围；679年宫成、移御是明确使用端点。上阳宫具体边界、建筑单元和现存遗迹需依考古资料分层；今日洛阳城市景观不能直接替代唐代宫苑。', ['zizhi-tongjian', 'modern-geography-reference', 'taiping-yulan-shangyang-palace', 'zizhi-tongjian-vol202-shangyang']),
  detail('jinci-ancestral-temple', '今山西省太原市晋源区晋祠博物馆及晋祠古建筑群范围内。', ['晋阳地区的地方祭祀、政治记忆与祠庙建筑', '唐代及后世太原区域历史的建筑叠层'], [
    phase('original', '早期祭祀传统', '唐代及以前', '晋祠以晋水和地方祭祀传统为基础，唐代太原政治空间中持续受到重视。', 618, 907, '晋祠早期创建与具体建筑年代存在多种文献和考古解释。'),
    phase('reconstruction', '历代扩建', '宋元明清', '圣母殿、献殿、鱼沼飞梁等建筑和园林空间在后世持续修缮、扩建和重构。', 960, 1911, '不同建筑的始建、重修与现存木构年代应逐项区分。'),
    phase('restoration', '现存古建筑保护', '近现代以来', '现代保护维修使部分古建筑、碑刻和园林空间延续至今，修缮材料与原构件分层记录。', 1900, undefined, '现存建筑群是多时期叠合，不宜整体标注为唐代原建筑。'),
  ], ['li-yuan', 'li-shimin'], ['tang'], ['tang-founded'], ['圣母殿、献殿与鱼沼飞梁', '碑刻、古树和水系', '晋阳区域历史环境'], '从今天的太原观察晋阳政治传统、唐代地方社会和中国古建筑连续修缮史。', '晋祠并非单一朝代遗存；具体建筑年代、原构保存率和后世修缮范围需分项核实。', ['zizhi-tongjian', 'modern-geography-reference']),
  detail('xiongnu-longcheng-candidate', '今蒙古高原中部至杭爱地区的候选范围；现有点位为区域性导航，不对应已确认的单一遗址。', ['冒顿时期匈奴联盟的单于庭与会聚传统', '草原政治中心的移动性及其与汉地边疆秩序的关系'], [
    phase('original', '政治中心形成', '前209年前后', '冒顿整合部众后，匈奴形成以单于庭和季节性会聚为核心的联盟政治。', -209, -174, '单于庭并非后世城郭式固定首都，具体地点与营地随时段移动。'),
    phase('site', '候选景观', '汉代以前后', '现代研究以区域考古、交通环境和文献线索讨论龙城或单于庭，尚不能锁定为一处完整城址。', -209, 93, '区域候选不能替代确定的考古遗址和连续建筑遗存。'),
    phase('restoration', '现代研究与展示', '当代', '今日主要通过草原考古、博物馆和历史地图解释匈奴政治中心，不复原固定都城。', 2000, undefined, '现代标识与研究性复原不等同于匈奴时代原建筑。'),
  ], ['modu-chanyu'], ['xiongnu'], ['xiongnu-founded'], ['候选区域与草原交通环境', '会聚与营地景观线索', '博物馆和历史地图展示'], '帮助学习者理解匈奴的移动政治中心，避免把草原联盟套入固定都城模型。', '龙城、龙庭、单于庭的名称和地点存在多种解释；本条只表达候选范围，不作确定性定位。', ['zizhi-tongjian', 'china-chronology']),
  detail('orkhon-turkic-inscriptions', '今蒙古国鄂尔浑河谷文化景观内，阙特勤碑、毗伽可汗碑等碑刻分布点各自定位。', ['突厥汗国王权纪念与古突厥文字', '于都斤—鄂尔浑政治核心与移动汗庭的文字化记忆'], [
    phase('original', '碑刻设置', '732—735年', '阙特勤碑和毗伽可汗碑在第二突厥汗国时期设置，记录王权、战争和祖先叙事。', 732, 735),
    phase('site', '原位碑刻遗存', '8世纪至今', '碑体、文字和相关遗址构成鄂尔浑河谷可辨识的突厥文化遗存。', 732, 744, '碑刻周边建筑、祭祀空间和后续迁移情况需按单点核对。'),
    phase('restoration', '现代保护展示', '20世纪以来', '现代保护、考古测绘和博物馆复制展示使碑刻得以研究与公众观看。', 1900, undefined, '复制品、保护设施与原位碑体必须分层说明。'),
  ], ['modu-chanyu'], ['turkic'], ['turkic-founded'], ['阙特勤碑', '毗伽可汗碑', '古突厥文碑铭与鄂尔浑河谷景观'], '突厥史、草原文字史和移动汗庭研究的核心遗产节点。', '本条关联冒顿仅作草原政治传统的比较入口，并不表示其参与突厥碑刻；突厥碑刻的直接人物谱系应由后续人物批次补齐。', ['turkic-history-db', 'turkic-orkhon-collection']),
  detail('northern-yuan-khan-court-landscape', '今蒙古高原中部阶段性范围；点位只作北元汗廷移动路线与政治核心的区域导航。', ['北元汗廷北迁后的蒙古政治空间', '脱脱不花、也先时期汗权与军事权力并存的草原格局'], [
    phase('original', '汗廷北迁', '1368年前后', '元廷北撤后，蒙古大汗政权在漠北延续，政治中心以汗帐、营地和交通网络呈现。', 1368, 1400, '不能把北元整体时期压缩为一个固定都城。'),
    phase('site', '阶段性中心', '15世纪中叶', '汗廷、会盟地和军事活动中心随季节与权力关系变化，缺少可对应全期的单一城址。', 1400, 1457, '不同阶段政治中心需要结合人物、路线和考古线索分别定位。'),
    phase('restoration', '现代历史景观', '当代', '现代通过草原考古、博物馆和历史地图展示北元政治空间，不复原单一汗宫。', 2000, undefined, '区域展示设施不能当作北元原建筑。'),
  ], ['esen-taishi', 'tuotuobuhua'], ['northern_yuan'], ['northern-yuan-founded'], ['汗帐与营地路线', '会盟与交通景观', '草原考古和历史地图展示'], '从城市之外的移动中心理解北元延续，补足固定都城叙事的盲区。', '北元是多个阶段和势力中心的后世总称；本条保留移动、阶段性和区域不确定性，不把导航点表述为唯一首都或已确认城址。', ['northern-yuan-early-ming', 'northern-yuan-yesen']),
  detail('nanming-yingtian-imperial-city', '今南京市玄武区明故宫遗址公园及其周边，明初宫城范围与南明弘光时期使用空间不完全重合。', ['明初应天府宫城与南明弘光政权的南京政治空间', '明清鼎革中的宫城继承、修缮与权力象征'], [
    phase('original', '明初宫城营建', '1368年后', '应天府明故宫作为明初中央宫城营建，形成宫门、宫殿和礼制空间。', 1368, 1421),
    phase('reconstruction', '后世沿用与损毁', '明清至近代', '宫城在迁都后功能变化并经历破坏、拆改和城市覆盖，南明使用的是既有南京政治空间。', 1421, 1911, '明初原构、南明使用层和后世城市层不能合并。'),
    phase('site', '遗址保护', '20世纪以来', '宫门、基址和城市考古信息以遗址公园和文物保护方式保存。', 1900, undefined, '现存遗址不等于明初或南明宫城完整留存。'),
  ], ['zhu-yousong', 'shi-kefa'], ['ming_southern'], ['southern-ming-founded', 'hongguang-nanjing-founded'], ['宫门与宫殿基址', '宫城轴线和城市遗址层', '遗址公园展示设施'], '把南明放回南京今日城市和明故宫遗址的连续空间中学习。', '明故宫主要建于明初，不能将全部现存遗址直接标为南明新建；南明使用关系需与建筑年代分层。', ['zizhi-tongjian', 'china-chronology', 'southern-ming-overview', 'southern-ming-hongguang']),
  detail('nanming-fuzhou-xinggong-site', '今福建省福州市鼓屏路南段及原福建布政使司衙署相关城市空间，具体行宫范围需结合考古、地方志和城市沿革定位。', ['隆武福州朝廷的行宫、衙署与政治空间', '福州从地方行政城市转为南明东南阶段中心'], [
    historicalPhase('original', '隆武福州使用阶段', '1645—1646年', '朱聿键在福州即位后，福州衙署、行宫和城市交通空间承担隆武朝廷的政治功能。', 1645, 1646, '现有资料支持阶段性城市空间关联，不足以确认完整隆武宫城的独立边界。', ['southern-ming-overview', 'southern-ming-longwu', 'fuzhou-longwu-site']),
    historicalPhase('site', '城市空间与遗址线索', '明清至今', '鼓屏路、相关衙署沿革和地方城市记忆提供今日观察入口，不能把后世道路或建筑直接标作隆武原构。', 1645, 1900, '行宫具体位置、后世改建和现存建筑层位需继续按地方考古资料核对。', ['fuzhou-longwu-site', 'modern-geography-reference']),
    historicalPhase('restoration', '现代城市展示', '当代', '福州以道路、地方史展示和城市遗迹说明隆武阶段，适合与郑芝龙、黄道周人物网络联动学习。', 2000, undefined, '展示设施和纪念性标识不等于隆武宫殿复原。', ['fuzhou-longwu-site', 'modern-geography-reference']),
  ], ['zhu-yujian', 'zheng-zhi-long', 'huang-daozhou'], ['ming_southern'], ['longwu-fuzhou-founded'], ['衙署与行宫关联空间', '鼓屏路历史城市空间', '地方志与遗址说明'], '从今日福州观察隆武朝廷、东南军镇和城市政治空间的叠合。', '“福州行宫遗址”是阶段性城市空间节点，不应误读为已确认、完整留存的单一隆武皇宫遗址。', ['southern-ming-overview', 'southern-ming-longwu', 'fuzhou-longwu-site', 'modern-geography-reference']),
  detail('shaowu-junchen-tomb', '今广东省广州市越秀公园相关区域；绍武君臣墓曾迁移，现址与1646年原葬地需分层标注。', ['绍武政权君臣墓葬与广州短期政治记忆', '墓葬迁移、碑刻保护与城市公园中的南明遗产展示'], [
    historicalPhase('original', '绍武君臣墓葬', '1646年', '绍武政权覆亡后形成君臣墓葬与纪念记忆，关联朱聿鐭、苏观生等广州阶段人物。', 1646, 1646, '墓葬具体组合和原始葬地需以考古与地方文献逐项核定。', ['southern-ming-overview', 'southern-ming-shaowu', 'guangzhou-shaowu-tomb']),
    historicalPhase('site', '墓葬迁移与保护', '1954—1981年', '墓葬经历迁移和保护地点调整，现址不能直接等同于1646年原葬地。', 1954, 1981, '迁移过程、墓主名单和碑刻位置以广州文物资料为准。', ['guangzhou-shaowu-tomb']),
    historicalPhase('restoration', '越秀公园展示', '当代', '越秀公园相关墓葬、碑刻和说明空间保留绍武阶段的城市记忆。', 2000, undefined, '现代园林环境和保护设施不等于明代墓葬原貌。', ['guangzhou-shaowu-tomb', 'modern-geography-reference']),
  ], ['zhu-yuyue', 'su-guansheng'], ['ming_southern'], ['shaowu-guangzhou-founded'], ['墓冢与碑刻', '迁移后的保护空间', '越秀公园历史说明'], '把绍武广州阶段从短期政权节点连接到今天仍可访问的墓葬遗产。', '墓葬迁移、墓主辨识和现存构件的年代必须与绍武政权的历史叙事分层，不能把现址当作原葬地的无变化保留。', ['southern-ming-overview', 'southern-ming-shaowu', 'guangzhou-shaowu-tomb', 'modern-geography-reference']),
  detail('nanming-yongli-zhaoqing-palace', '今广东省肇庆市阅江楼及相关古城历史空间；万寿宫石狮等遗存提供永历初期城市记忆入口。', ['永历肇庆初期的行宫、万寿宫与两广政治空间', '阅江楼、石狮及肇庆城市遗产中的南明记忆'], [
    historicalPhase('original', '永历肇庆政治空间', '1646—1647年', '朱由榔在肇庆即位，行宫、万寿宫及阅江楼周边城市空间承载永历初期的政治和礼仪功能。', 1646, 1647, '现存建筑与1646年行宫、万寿宫的具体对应关系需谨慎区分。', ['southern-ming-overview', 'southern-ming-yongli', 'zhaoqing-yongli-heritage']),
    historicalPhase('site', '石狮与城市遗产记忆', '明代至今', '阅江楼相关石狮和地方遗产说明保留明代桂王万寿宫的历史记忆，但不能据此宣称现存楼阁整体为永历原构。', 1646, 1900, '石狮的原始位置、万寿宫建筑范围与后世叠加层需要以地方文物资料继续核验。', ['zhaoqing-yongli-heritage', 'modern-geography-reference']),
    historicalPhase('restoration', '现代遗产展示', '当代', '肇庆通过阅江楼、七星岩及地方博物馆和说明系统解释永历初期历史空间。', 2000, undefined, '现代修缮、景区设施和复原性说明不能直接视为1646年原建筑。', ['zhaoqing-yongli-heritage', 'modern-geography-reference']),
  ], ['zhu-youlang', 'qu-shisi'], ['ming_southern'], ['yongli-zhaoqing-founded'], ['阅江楼历史空间', '万寿宫关联石狮', '肇庆古城与地方文物说明'], '从今天的肇庆观察永历初期政治中心、人物关系和城市遗产记忆。', '现存阅江楼及相关建筑经历后世修缮，永历行宫与万寿宫的具体原构不能由现代建筑整体反推。', ['southern-ming-overview', 'southern-ming-yongli', 'zhaoqing-yongli-heritage', 'modern-geography-reference']),
  detail('jiankang-taicheng-site', '今南京市鼓楼、玄武及台城相关城市考古范围；现代道路和城墙公园不能替代六朝台城边界。', ['东晋及南朝宫城台城', '建康政治中心的宫城、朝会与城市防御空间'], [
    phase('original', '宫城营建与使用', '317—589年', '东晋南朝在建康经营宫城、台城和相关城防体系，台城是政治仪式与宫廷生活的重要空间。', 317, 589),
    phase('site', '考古与城墙遗存', '六朝至今', '台城城墙、门址和城市地层通过考古发现、城墙遗迹和历史地理复原辨识。', 317, 589, '不同朝代台城边界和建筑单元需分期核对。'),
    phase('restoration', '现代城市展示', '当代', '现代城墙公园、博物馆和城市标识解释台城历史，不重建完整六朝宫城。', 2000, undefined, '现代城墙与展示设施不等于六朝原构。'),
  ], ['sima-rui', 'liu-yu'], ['jin_eastern', 'song_southern', 'qi_southern', 'liang_southern', 'chen_southern'], ['eastern-jin'], ['台城城墙与门址线索', '宫城考古地层', '现代城墙公园与历史标识'], '补充建康城市遗址中的宫城视角，连接东晋南朝政权与今日南京。', '台城的具体范围、各朝代改造和现代地面遗存对应关系仍需按考古资料分层。', ['zizhi-tongjian', 'modern-geography-reference']),
  detail('ye-tongque-platform-site', '今河北省邯郸市临漳县邺城遗址保护区内，铜雀台位置及遗存程度以考古资料和遗址标识为准。', ['曹魏邺城台观建筑与政治文化', '东魏、北齐等后续政权对邺城城市记忆和空间的重叠使用'], [
    phase('original', '台观营建', '210年前后', '曹操时期在邺城营建铜雀台等台观，形成兼具礼仪、宴飨和权力展示的城市地标。', 210, 220),
    phase('reconstruction', '多政权记忆叠合', '4—6世纪', '十六国及北朝时期邺城政治中心地位延续，台址和文献记忆被不同政权重新解释。', 335, 577, '具体台址、建筑层和后世重修不能合并为单一原建筑。'),
    phase('site', '遗址与考古展示', '现代', '相关台基、城址和考古材料以遗址保护和展示形式保存。', 1900, undefined, '今日地面标识和复原性构筑物不等于曹魏原台体。'),
  ], ['gao-huan', 'gao-yang'], ['wei_eastern', 'qi_northern'], ['eastern-wei-founded'], ['台基与城址考古层', '邺城城市轴线', '遗址保护标识'], '从邺城的标志性台观理解曹魏及北朝政治空间和城市记忆的层累。', '铜雀台的原始形制、具体遗存与文学记忆需区分；本条不把后世台址景观直接视为曹魏完整建筑。', ['zizhi-tongjian', 'modern-geography-reference']),
  detail('guzang-baita-temple-site', '今甘肃省武威市凉州区白塔寺遗址及其周边，具体寺院范围按考古与文献资料定位。', ['北凉姑臧佛教传播与河西译经传统', '河西走廊交通、凉州政权和佛教网络'], [
    phase('original', '寺院营建与活动', '5世纪前期', '白塔寺遗址与北凉时期凉州佛教活动和姑臧城市网络相关，河西成为僧侣、经卷和工艺交流通道。', 401, 439, '寺院创建年代、名称沿革和北凉宫城的对应关系需分层核验。'),
    phase('site', '遗址与出土材料', '北凉至后世', '塔基、建筑遗迹和相关考古材料以遗址形式保存，具体遗物年代需逐件确认。', 401, 1000, '后世叠压层不能直接归入北凉。'),
    phase('restoration', '现代保护展示', '当代', '现代遗址保护、博物馆和宗教文化展示帮助理解河西佛教史，不复原北凉寺院全貌。', 2000, undefined, '现代设施和后世重建不等同于北凉原建筑。'),
  ], ['fu-jian'], ['former_liang', 'northern_liang', 'later_liang'], ['former-liang-founded'], ['塔基与寺院遗址', '河西佛教与译经网络材料', '遗址保护和展示空间'], '在姑臧城市史之外增加佛教、交通与知识传播的遗产视角。', '白塔寺的具体年代、寺名沿革和与北凉政权的直接关系仍需结合考古报告；苻坚仅作十六国河西政治网络的比较入口。', ['zizhi-tongjian', 'modern-geography-reference']),
  detail('tongwan-south-gate-site', '今陕西省榆林市靖边县统万城国家考古遗址公园南城门及相关城垣范围。', ['夏政权统万城南部防御与城市出入口', '赫连勃勃营建统万城的军事、交通和都城规划'], [
    phase('original', '城门营建', '413—418年', '统万城营建期间形成南城门、城垣和道路联系，服务于都城防御和交通组织。', 413, 418),
    phase('site', '城门遗址', '夏都使用阶段', '门址、夯土城垣、道路和风蚀遗迹以考古遗址形式保存。', 413, 431, '城门各层位、维修痕迹和后续利用需按考古分区区分。'),
    phase('restoration', '现代保护展示', '当代', '遗址公园通过保护、步道和说明系统展示南城门与城垣，不重建完整城门楼。', 2000, undefined, '现代加固和展示构筑物不能当作夏代原建筑。'),
  ], ['heliAN-bobo'], ['xia'], ['xia-sixteen-states-founded-eighth-batch'], ['南城门门址', '夯土城垣与道路', '遗址公园保护展示设施'], '把统万城总体遗址进一步拆解为城门、防御和交通的可学习节点。', '南城门具体建筑形制和修缮阶段仍需考古资料支持；本条不把现代保护工程当作原城门复原。', ['zizhi-tongjian', 'modern-geography-reference']),
  detail('tuyuhun-fuqisi-city-candidate', '今青海省海南州共和县一带候选范围；伏俟城具体位置和遗址性质仍有不同研究意见。', ['吐谷浑后期王都与河湟—青海政治网络', '牧地、交通和王权中心之间的区域关系'], [
    phase('original', '王都形成', '6世纪前后', '吐谷浑后期围绕河湟、青海及相关交通节点形成较稳定的王权中心。', 500, 663, '伏俟城年代和王都性质不能由单一文献或现代地名直接确定。'),
    phase('site', '候选城址', '现代考古研究', '现有点位用于表达候选范围，尚不能确认完整城墙、宫殿和连续城市层。', 1900, undefined, '候选地点不等于已确认考古遗址。'),
    phase('restoration', '区域历史展示', '当代', '现代通过地方博物馆、考古调查和历史地图解释吐谷浑政治中心。', 2000, undefined, '展示性复原不得替代城址考古证据。'),
  ], ['modu-chanyu'], ['tuyuhun'], ['tuyuhun-founded'], ['区域候选范围', '河湟—青海交通与牧地景观', '地方考古和历史地图展示'], '帮助学习者理解吐谷浑的区域性和迁徙性政治中心。', '冒顿只作为草原政权比较人物，并非吐谷浑王室成员；伏俟城具体地点和年代应保持候选标注。', ['zizhi-tongjian', 'china-chronology']),
  detail('western-qin-yuanchuan-city-candidate', '今甘肃兰州及陇右相关区域的候选范围；“苑川”与现代金城区域不完全重合。', ['西秦形成期陇右军政网络', '乞伏部迁徙、河湟交通和十六国区域政权'], [
    phase('original', '区域中心形成', '385年前后', '西秦在陇右建立后，苑川等地可能承担阶段性军政与交通功能。', 385, 400, '不能据此认定一处固定、连续使用的西秦首都。'),
    phase('site', '候选城址与区域层', '十六国时期', '相关城址线索主要依赖文献、地理和考古区域研究，尚不具备完整城址确认条件。', 385, 431, '候选区域、城址名称和政权控制范围需分别记录。'),
    phase('restoration', '现代研究展示', '当代', '现代通过陇右考古、地方博物馆和历史地图解释西秦政治空间，不复原固定宫城。', 2000, undefined, '区域标识和研究性推测不等于原建筑遗存。'),
  ], ['yao-xing'], ['western_qin'], ['western-qin-founded'], ['陇右候选城址与交通线索', '区域考古材料', '地方博物馆和历史地图展示'], '补足西秦政权在十六国河湟—陇右网络中的遗产入口。', '姚兴属于后秦，与西秦为竞争和互动关系，并非苑川直接营建者；本条明确保留候选和交互背景，不作直接人物归属。', ['zizhi-tongjian', 'china-chronology']),
  detail('xianyang-qin-state-palace-site', '今陕西省咸阳市渭城区及渭河两岸咸阳城遗址相关范围，古今城市边界不重合。', ['秦国晚期咸阳宫殿与都城空间', '秦国向秦帝国转型的宫城、道路和礼制环境'], [
    phase('original', '宫城营建', '前4世纪至前3世纪', '秦国扩展咸阳宫城和城市设施，形成晚期秦国王都的宫殿、道路与礼制空间。', -350, -221),
    phase('site', '考古遗址层', '秦国至秦帝国时期', '宫殿基址、夯土台基、道路和城市遗物以考古遗址层形式保存。', -350, -206),
    phase('restoration', '现代考古展示', '20世纪以来', '遗址保护区、博物馆和标识系统解释咸阳都城，不重建秦国宫城原貌。', 1900, undefined, '现代展示设施不能替代秦国原建筑。'),
  ], ['qin-mugong'], ['qin_state'], ['qin-state-founded-eighth-batch', 'qin-xianyang-capital'], ['宫殿基址与夯土台基', '道路和城市遗物', '考古保护与展示空间'], '从咸阳观察秦国诸侯阶段向秦帝国转型的都城连续性。', '秦国晚期与秦帝国时期遗址层相互叠压，具体宫殿年代应以考古分期区分；现状不是完整原建筑。', ['zizhi-tongjian', 'modern-geography-reference']),
  detail('qin-xianyang-imperial-palace-site', '今陕西省咸阳市渭城区及渭河两岸秦咸阳城遗址保护、考古与展示范围；古代咸阳城界不等同于现代咸阳市界。', ['秦统一后咸阳作为帝国首都的宫城与礼制空间', '秦始皇完成统一、皇帝制度建立与都城政治'], [
    phase('original', '帝国宫城使用', '前221—前206年', '秦统一后继续以咸阳为帝国政治中心，宫殿、官署、道路与礼制空间共同支撑中央集权统治。', -221, -206),
    phase('site', '秦咸阳城考古层', '秦帝国时期及后续考古', '宫殿基址、夯土台基、道路和城市遗物以秦咸阳城遗址考古层保存。', -221, -206, '秦国晚期与秦帝国遗址层相互叠压，具体建筑年代需按考古分期核验。'),
    phase('restoration', '现代遗址保护展示', '当代', '遗址保护区、博物馆和考古标识解释秦帝国咸阳，不重建完整宫城。', 2000, undefined, '展示性复原和现代设施不能替代秦帝国原建筑。'),
  ], ['qin-shi-huang'], ['qin'], ['qin-unification'], ['宫殿基址与夯土台基', '城址、道路和城市遗物', '遗址保护区与考古展示'], '从今日咸阳观察秦统一、帝国首都和秦制形成，并与秦国晚期咸阳层区分。', '现存遗址为多时期叠压的考古对象；秦帝国咸阳的具体建筑组合和完整城界不能由单一遗址点位复原。', ['zizhi-tongjian', 'modern-geography-reference']),
  detail('former-qin-changan-city-layer', '今陕西省西安市未央区汉长安城遗址及关中历史城市考古研究范围；前秦城市层与汉、后秦、隋唐层叠压。', ['前秦351年建政后的长安政治中心', '苻健、苻坚时期关中宫城、官署与北方整合'], [
    phase('original', '政治中心沿用', '351—394年', '前秦建立后以长安为关中核心，沿用并调整既有城址、宫城和官署空间。', 351, 394),
    phase('site', '前秦历史层', '十六国长安叠压遗址', '城垣、宫殿基址、道路与城市遗物需通过多时期考古层和文献地理分辨前秦使用阶段。', 351, 394, '前秦具体宫城范围和单体建筑保存状况不能由后世城址直接推定。'),
    phase('restoration', '现代考古解释', '当代', '汉长安城遗址保护、博物馆和城市考古展示前秦长安的连续城市背景，不复原完整前秦宫城。', 2000, undefined, '现代展示设施与汉、隋唐遗址层须与前秦历史层分开标识。'),
  ], ['fu-jian-founder', 'fu-jian', 'fu-deng'], ['former_qin', 'later_qin'], ['former-qin-founded', 'former-qin-ended-394'], ['城址与宫城叠压层', '官署、道路和夯土遗迹线索', '遗址保护与历史地理展示'], '把前秦建政、长安城市史、苻登终局和后秦承接放在同一遗产节点中学习。', '前秦政权经历苻健建政、苻坚扩张及394年后期瓦解；马嵬战场不等同于长安城址，现存遗址也不能直接还原前秦完整宫城。', ['zizhi-tongjian', 'china-chronology', 'modern-geography-reference']),
  detail('later-qin-changan-city-layer', '今陕西省西安市未央区汉长安城遗址及关中历史城市考古研究范围；后秦使用层与前秦、汉、隋唐层叠压。', ['后秦取得长安后的关中政治中心', '姚苌、姚兴时期的宫城、官署与佛教文化网络'], [
    phase('original', '长安政治中心形成', '384—417年', '后秦形成后逐步取得长安并经营关中，沿用既有城址与宫城空间作为政治中心。', 384, 417),
    phase('site', '后秦历史层', '十六国长安叠压遗址', '城垣、宫署、道路和城市遗物通过文献与多时期考古研究分层理解。', 384, 417, '384年政权形成与386年后长安控制存在阶段差异，不能压缩为同一建城节点。'),
    phase('restoration', '现代考古解释', '当代', '遗址保护、城市考古和博物馆展示后秦长安，不复原未经确认的后秦完整宫城。', 2000, undefined, '现代展示和后世城市遗存不能直接当作后秦原建筑。'),
  ], ['yao-chang', 'yao-xing', 'yao-hong'], ['later_qin', 'jin_eastern'], ['later-qin-founded', 'later-qin-falls-changan'], ['城址与宫城叠压层', '官署、道路和城市遗物线索', '遗址保护与历史地理展示'], '从今日西安观察后秦政权形成、姚泓末期长安失守和东晋短暂接收，并理解十六国多政权城市叠加。', '后秦早期形成、长安控制、姚兴时期发展与417年终局需分阶段记录；现存长安遗址不能单独证明后秦完整城界和建筑原貌。', ['zizhi-tongjian', 'china-chronology', 'modern-geography-reference']),
  detail('gengshi-wanyang-city-layer', '今河南省南阳市城区及宛城历史地理、考古与地方资料参照范围；古宛城边界与现代南阳市城区不完全重合。', ['更始政权形成阶段宛城拥立与政治中心', '刘玄被拥立、汉室复起和宛—洛阳—长安中心迁移'], [
    phase('original', '政权形成与中心使用', '23年', '刘玄在宛城一带被拥立为更始帝，宛城承担更始政权形成阶段的政治中心功能。', 23, 23),
    phase('site', '宛城历史城市层', '汉代至后世叠压', '古城、道路和城市遗物通过南阳城市考古与历史地理资料辨识，现存遗存不等于更始时期完整宫城。', 23, 25, '更始随后进入洛阳、长安，宛城只代表形成阶段，不是全期唯一首都。'),
    phase('restoration', '现代城市与地方展示', '当代', '南阳城市考古、地方博物馆和历史说明系统连接宛城与更始政权形成史。', 2000, undefined, '现代城市建设和展示设施需与汉代宛城遗址层区分。'),
  ], ['liu-xuan'], ['gengshi'], ['gengshi-founded'], ['宛城历史地理范围', '汉代城市考古与道路线索', '地方博物馆和历史展示'], '从今日南阳观察更始政权的形成、阶段性中心和新末汉初政治转折，并连接洛阳、长安的后续中心迁移。', '宛城定位主要依据政权形成和地方资料的阶段性中心表达；具体宫城遗址、边界和更始全期控制范围不能据此过度推定。', ['zizhi-tongjian', 'gengshi-official', 'modern-geography-reference']),
  detail('jin-zhongdu-city-site', '今北京市西南部，核心遗址涉及西城区南部、丰台区一带；金中都古城边界与现代北京市行政范围不重合。', ['金中都大兴府宫城、城垣与城市政治空间', '金由上京会宁府迁都中都后的华北政治中心', '辽南京、金中都、元大都与明清北京的多时代城市叠压'], [
    phase('original', '中都营建', '1151—1155年', '金在燕京旧有城市空间基础上营建中都宫城、城垣和城市设施；营建期与正式迁都节点分层理解。', 1151, 1155),
    phase('site', '金中都遗址层', '金代至今', '城垣、宫城、道路和建筑基址以考古遗址形式保存，部分城市空间被后世城市覆盖。', 1153, 1214, '遗址范围是区域参照，不代表完整金中都行政城界。'),
    phase('restoration', '现代考古保护与城市展示', '当代', '北京市文物保护、考古研究和城市历史标识解释金中都，不把元大都或明清北京现存建筑当作金中都原构。', 2000, undefined, '现代展示设施、后世建筑和金代遗址层必须分开记录。'),
  ], ['wanyan-liang'], ['jin_jurchen'], ['jurchen-jin-moves-zhongdu'], ['城垣与宫城遗址线索', '建筑基址和城市道路考古', '北京城市史遗址保护与展示'], '从今日北京观察辽南京、金中都、元大都和明清北京在同一城市空间中的历史叠合。', '金中都具体宫殿、城门和城界需以考古报告分期核验；不能以元大都、明清北京或现代北京建筑直接替代金中都原貌。', ['beijing-jin-zhongdu-archaeology', 'capital-history-reference', 'modern-geography-reference']),
  detail('cheng-han-chengdu-site', '今四川省成都市主城区历史城市范围，成汉时期城市层与后世成都城址存在叠压。', ['成汉成都政治中心', '巴蜀十六国政权与成都城市延续'], [
    phase('original', '政治中心使用', '304—347年', '成汉在巴蜀建立政权后以成都为重要政治中心，沿用并调整既有城市设施。', 304, 347),
    phase('site', '城市遗址层', '十六国成都历史层', '城址、道路和城市遗物以考古层与历史地理研究形式保存，不能单独等同于完整成汉城。', 304, 347),
    phase('restoration', '现代保护展示', '当代城市考古', '现代博物馆、遗址标识和城市更新项目解释成汉历史，不重建成汉宫城。', 2000, undefined, '现代建筑和展示性复原需与成汉遗址层分开。'),
  ], ['li-xiong', 'li-shi', 'huan-wen'], ['cheng_han', 'jin_eastern'], ['cheng-han-founded', 'cheng-han-ended-347'], ['城市考古层', '道路与水系线索', '成汉—东晋政权转换历史展示'], '补足成都从蜀汉到十六国成汉，再到东晋接收后的城市连续观察角度。', '成汉宫城具体位置和建筑保存状况尚不能从现代城市直接确定；347年政权终止不等于成都城市遗产终止。', ['zizhi-tongjian', 'china-chronology', 'modern-geography-reference']),
  detail('later-yan-ye-city-site', '今河北省邯郸市临漳县邺城遗址保护范围内，后燕使用层与曹魏、十六国及北朝遗址叠压。', ['后燕重建燕政权后的邺城政治空间', '邺城多政权沿用与城市层累'], [
    phase('original', '城市沿用', '384—407年', '后燕建立后利用邺城及其周边政治、军事和交通条件，形成后燕阶段的城市使用层。', 384, 407),
    phase('site', '叠压遗址层', '十六国邺城考古层', '城垣、台址和道路信息以考古遗址层保存，不把不同政权建筑合并为后燕单一原貌。', 384, 407, '各政权城址边界和建筑层位需按考古分期核验。'),
    phase('restoration', '现代遗址保护', '当代', '遗址保护区、考古展示和说明系统帮助理解后燕邺城，不重建完整宫城。', 2000, undefined, '现地标识与复原性构筑物不等于后燕原建筑。'),
  ], ['murong-chui'], ['later_yan'], ['later-yan-founded'], ['城垣与台址考古层', '宫城和道路线索', '遗址保护展示设施'], '将后燕纳入邺城多政权城市史，而不是孤立学习一个政权。', '后燕宫城及其建筑具体遗存尚需分期核对，今日邺城遗址是多朝代叠合的考古对象。', ['zizhi-tongjian', 'modern-geography-reference']),
  detail('later-yan-longcheng-terminal-site', '今辽宁省朝阳市及吉林省和龙相关区域参照；项目沿用龙城点位表达后燕末期政治中心，但具体城址、和龙名称及不同燕政权的城市层不能直接互换。', ['后燕退守龙城与407年政权终局', '辽西政治中心、城址与交通网络的区域性历史层'], [
    phase('original', '后燕退守龙城', '398—407年', '后燕失去河北核心后，龙城承担末期政治、军事与交通中心功能，直至407年高云取代慕容熙。', 398, 407, '龙城具体位置存在朝阳、和龙等不同语境，现有项目地点只作区域性参照。'),
    phase('site', '燕政权承接的城市层', '407年后', '龙城继续承接新的燕政权政治活动，后燕末期与北燕早期城市层在区域上相连，但不应合并为同一政权遗产。', 407, 436, '北燕冯氏墓葬和城址遗产另行建模，本条不据区域重叠推定具体墓葬归属。'),
    phase('restoration', '现代考古与地方展示', '当代', '朝阳及和龙一带的考古调查、地方博物馆和历史地图用于解释龙城及十六国东北政治网络，不复原未经确认的完整后燕宫城。', 2000, undefined, '现代行政地名、考古点位和历史龙城名称不是同一边界。'),
  ], ['murong-xi'], ['later_yan'], ['later-yan-ended-407'], ['城址与交通网络考古线索', '区域墓葬和出土材料', '地方博物馆与历史地图展示'], '从龙城区域观察后燕退守、政权终局和北燕承接的城市史连续性，同时保持政权与遗产层的区分。', '龙城的具体定位、朝阳与和龙的对应关系及后燕末期与北燕早期遗产的分界仍需专题考古资料核验；本条不把区域导航点当作确定宫城。', ['zizhi-tongjian', 'capital-history-reference', 'modern-geography-reference']),
  detail('later-tang-luoyang-city-site', '今河南省洛阳市汉魏及隋唐洛阳城遗址分布区，后唐使用层与多个朝代城址叠压。', ['后唐洛阳宫城与五代政治中心', '936年后唐终局与后晋承接', '洛阳作为多代都城的空间连续性'], [
    phase('original', '宫城沿用', '923—936年', '后唐建立后以洛阳为重要政治中心，沿用前代宫城、道路和城市设施。', 923, 936),
    phase('site', '五代历史层', '后唐洛阳考古层', '后唐阶段主要通过洛阳古城叠压地层、文献和城市考古分层辨识。', 923, 936, '现存隋唐城址不能直接等同于后唐原建筑。'),
    phase('restoration', '现代遗址展示', '当代', '遗址公园、博物馆和历史地图展示五代洛阳，不重建后唐宫城。', 2000, undefined, '现代复原设施与后唐原构分开记录。'),
  ], ['li-cunxu', 'li-congke', 'shi-jingtang'], ['tang_later', 'jin_later'], ['tang-later-founded', 'later-tang-ended-936', 'jin-later-founded'], ['宫城和城门历史层', '城市叠压地层', '遗址公园与考古展示'], '从洛阳今日遗址观察后唐建政、936年终局、后晋承接与五代城市连续性。', '后唐宫殿具体位置和保存程度仍需分层核验，不能把隋唐遗存全部标为后唐原建筑；936年洛阳失守、李从珂个人结局、后晋地方接收和现存遗址年代不能合并为单一事实。', ['zizhi-tongjian', 'capital-history-reference', 'modern-geography-reference']),
  detail('eastern-zhou-luoyang-city-site', '今河南省洛阳市及周王城遗址、洛河沿岸相关考古范围，东周王城与现代洛阳市区不重合。', ['周王室东迁后的洛邑王城', '东周王室、诸侯朝聘与洛阳城市历史'], [
    phase('original', '王城形成', '前770年前后', '周平王东迁后，洛邑成为东周王室政治中心，王城、宗庙和交通空间持续发展。', -770, -256),
    phase('site', '王城遗址', '东周考古层', '城址、道路、宫殿和礼制相关遗迹通过考古调查与遗址保护呈现。', -770, -256, '东周各阶段城界和建筑层位需按考古分期。'),
    phase('restoration', '现代遗址展示', '当代', '周王城遗址展示、博物馆和历史地图帮助理解洛邑，不重建完整东周王城。', 2000, undefined, '现代展示工程不能视作东周原建筑。'),
  ], ['ji-yijiu'], ['zhou_eastern'], ['eastern-zhou-founded-eighth-batch'], ['王城城址与道路', '宫殿、宗庙及礼制空间线索', '考古遗址展示'], '把东周王室放入洛阳今日城市的多层都城时间轴中学习。', '东周王城具体范围和各阶段建筑保存情况需以考古报告为准，不能将后世洛阳建筑直接前推。', ['zizhi-tongjian', 'china-chronology', 'modern-geography-reference']),
  detail('later-shu-chengdu-city-site', '今四川省成都市主城区及后蜀成都城址研究范围，现代城市覆盖大量五代历史层。', ['后蜀宫城与成都政治中心', '十国政权在巴蜀的城市延续'], [
    phase('original', '宫城与城市使用', '934—965年', '后蜀以成都为政治中心，沿用并调整前代成都城市、宫城和交通设施。', 934, 965),
    phase('site', '五代成都历史层', '后蜀考古与历史地理层', '城址、道路和宫城线索通过城市考古与文献复原辨识，未形成一座完整可见的后蜀宫城。', 934, 965, '后蜀建筑与前蜀、宋代城市层需分开。'),
    phase('restoration', '现代城市展示', '当代', '博物馆、城市遗址标识和历史街区解释后蜀成都，不将现代建筑当作后蜀原构。', 2000, undefined, '纪念性复原与历史建筑原构分层记录。'),
  ], ['meng-zhixiang', 'meng-chang', 'zhao-kuangyin'], ['later_shu', 'song_northern'], ['later-shu-founded', 'later-shu-ended-965'], ['城市考古层', '宫城与道路历史空间', '博物馆和城市历史展示'], '连接前蜀、后蜀、北宋与今日成都，展示十国政权终止后城市政治功能与城市历史层的连续性。', '后蜀宫城具体位置和建筑保存程度尚需进一步考古核验，现有节点采用历史层而非完整建筑表述；965年政权终止不表示城市遗产消失。', ['zizhi-tongjian', 'modern-geography-reference']),
  detail('southern-tang-jiankang-city-site', '今南京市主城区及六朝建康、明故宫等历史空间的城市考古范围，金陵古今边界不重合。', ['南唐金陵宫城与城市政治空间', '南唐承接江南都城传统并与北方政权互动'], [
    phase('original', '城市与宫城使用', '937—975年', '南唐以金陵为政治中心，沿用并调整建康以来的城市、宫城和水陆交通网络。', 937, 975),
    phase('site', '城市叠压层', '五代南唐历史层', '南唐城市信息主要通过建康六朝、后世南京城址和历史地理研究分层辨识。', 937, 975, '南唐宫城具体位置和可见构件不能由六朝遗址直接替代。'),
    phase('restoration', '现代城市展示', '当代', '博物馆、遗址公园和城市标识解释南唐金陵，不重建完整南唐宫城。', 2000, undefined, '现代纪念设施与南唐原建筑分层记录。'),
  ], ['li-bian', 'li-jing', 'li-yu'], ['southern_tang'], ['southern-tang-founded', 'southern-tang-li-jing-succeeds', 'southern-tang-moves-nanchang', 'southern-tang-falls', 'southern-tang-ended-975'], ['宫城与城市叠压线索', '秦淮水系和交通空间', '南京城市考古与展示'], '从今日南京观察南唐与六朝、明代等多个政权在同一城市空间的叠合，并把975年南唐终局置于金陵城市承接的连续历史层中。', '南唐遗存多与既有和后世城市层叠压，具体建筑年代和保存状态需逐项核验；975年政权终止不表示城市遗产同时消失，现存建筑也不能全部视作南唐原构。', ['zizhi-tongjian', 'song-history-nantang', 'modern-geography-reference']),
  detail('southern-tang-er-ling', '今南京市江宁区牛首山南麓南唐二陵保护与考古范围；现代江宁行政边界不等同于南唐陵区边界。', ['李昪钦陵与李璟顺陵', '南唐皇室墓葬、陵寝制度与金陵南郊礼制空间'], [
    phase('original', '皇室陵寝营建', '943—961年', '南唐烈祖李昪钦陵与元宗李璟顺陵构成南唐二陵，墓主、陵号与年代按南唐皇室世系和考古资料分层。', 943, 961, '陵园营建、下葬和后世修缮并非同一时间点。'),
    phase('site', '南唐二陵遗址', '20世纪考古发掘以来', '墓室、石刻、随葬遗迹与保护展示共同呈现南唐皇室墓葬制度；不把所有地表构件视作南唐原貌。', 1900, undefined, '发掘、保护和展示状态应以官方文保资料为准。'),
    phase('restoration', '现代文物保护', '当代', '保护区、考古展示和地方博物馆将南唐二陵连接到今日南京江宁的城市文化学习路径。', 2000),
  ], ['li-bian', 'li-jing'], ['southern_tang'], ['southern-tang-li-jing-succeeds', 'southern-tang-moves-nanchang'], ['钦陵与顺陵墓室', '陵寝石刻与随葬遗迹', '牛首山南麓历史景观与现代保护展示'], '从南唐二陵观察三代皇室、政权继承与金陵南郊礼制空间，将专属墓葬遗产与泛化城市历史层分开。', '南唐二陵是两座皇室墓葬及其保护范围，不等于南唐都城或完整陵邑；现代展示设施与原始墓葬遗存分层理解。', ['southern-tang-er-ling-official', 'song-history-nantang']),
  detail('yang-wu-yangzhou-city-site', '今江苏省扬州市古城、运河及相关考古遗址分布区，杨吴时期城市范围与现代扬州市区不完全重合。', ['杨吴扬州政治、漕运与城市空间', '江淮地方政权与运河交通网络'], [
    phase('original', '城市经营', '902—937年', '杨吴经营淮南，以扬州为军政、财政和水运网络的重要节点，城市设施持续调整。', 902, 937),
    phase('site', '城市与运河遗址层', '五代扬州历史层', '城址、运河、道路和手工业遗存通过扬州古城考古与历史地理研究辨识。', 902, 937, '五代城市层与唐宋以后扬州城址应分层理解。'),
    phase('restoration', '现代遗址展示', '当代', '博物馆、运河遗产展示和城市考古标识解释杨吴扬州，不复原五代宫城。', 2000, undefined, '现代运河景观和复原性设施不能直接视作杨吴原建筑。'),
  ], ['yang-xingmi', 'yang-pu', 'li-bian'], ['wu_ten', 'southern_tang'], ['yang-wu-founded', 'yang-wu-ended-937', 'yang-wu-yangzhou-transferred-937'], ['古城城址与道路', '运河和水利遗迹', '博物馆、运河展示与考古标识'], '从今日扬州观察杨吴首都、南唐地方承接与运河城市连续性。', '杨吴及南唐早期宫城的具体位置和现存构件尚需进一步考古分期，今日扬州景观是多时代叠合结果；937年中央禅代与地方接收分层展示。', ['zizhi-tongjian', 'modern-geography-reference']),
  detail('liao-shangjing-city-site', '今内蒙古自治区赤峰市巴林左旗林东镇南部辽上京遗址保护区。', ['辽上京临潢府宫城、皇城与外城', '契丹辽五京制度和北方草原—农耕城市网络'], [
    phase('original', '城址营建', '918年前后', '辽上京在契丹政权进入辽朝阶段后营建并发展为上京，宫城、皇城和外城构成复合城市空间。', 918, 1125),
    phase('site', '城市遗址', '辽代至今', '城墙、宫城、道路、建筑基址和出土遗物以考古遗址形式保存。', 918, 1125),
    phase('restoration', '现代考古保护', '20世纪以来', '遗址保护区、考古调查和展示系统解释辽上京，不重建完整契丹宫城。', 1900),
  ], ['yelu-abaoji', 'yelu-yanxi'], ['khitan'], ['liao-founded', 'liao-ended-1125'], ['宫城与皇城城墙', '城市道路与建筑基址', '考古遗物和遗址展示'], '学习辽政权、五京制度、辽亡与契丹国家空间的关键城市遗址。', '辽上京不同城郭、宫殿和使用阶段需分期理解；1125年政权终止不表示遗址、人口和城市层同时消失，现代复原图不能替代考古实测。', ['zizhi-tongjian', 'modern-geography-reference']),
  detail('liao-dongjing-city-site', '今辽宁省辽阳市古城及相关考古、历史地理范围；辽东京与现代辽阳市区边界不完全重合。', ['辽东京辽阳府的宫城、城市与辽东区域治理', '五京制度中的东部政治、交通和边防节点'], [
    phase('original', '辽阳城市经营与东京阶段', '919—1125年', '辽先修葺辽阳故城、置东平郡，928年升南京，938年改东京；城市、宫城和交通网络承担辽东区域政治中心功能。', 919, 1125),
    phase('site', '多时代城市遗址层', '辽代至今', '辽阳古城、城址与地方考古资料保存东平郡、南京和东京历史层，但现存城市空间经历后世叠压。', 919, 1125, '辽代宫城和具体建筑遗存需与汉魏、金元明清城市层分开核验。'),
    phase('restoration', '现代城市展示', '当代', '地方博物馆、古城保护与历史标识解释辽阳在辽五京中的位置，不复原完整辽代东京。', 2000, undefined, '现代展示设施与辽代原构分层记录。'),
  ], ['yelu-abaoji', 'yelu-yanxi'], ['khitan'], ['liao-dongping-established', 'liao-dongdan-nanjing', 'liao-dongjing-established', 'liao-ended-1125'], ['古城与城址考古线索', '宫城及交通空间历史层', '地方博物馆与城市展示'], '从今日辽阳观察辽代多中心治理、辽东区域史、辽亡后的城市承接和五京制度。', '东京辽阳府的具体宫城范围、建筑年代和可见遗存需以考古报告分层；1125年政权终止不等于辽阳城市空间消失。', ['liao-history-geography', 'liaoyang-museum-liao-capital', 'modern-geography-reference']),
  detail('liao-nanjing-city-site', '今北京市及辽代燕京历史地理、城市考古与多时代叠压范围。', ['辽南京析津府与燕京城市政治空间', '辽代南部政治中心、农耕区治理与北方交通网络'], [
    phase('original', '南京析津府阶段', '938—1122年', '938年幽州升为南京、建号燕京；1012年改析津府，1122年辽控制阶段结束。', 938, 1122),
    phase('site', '燕京城市叠压层', '辽代至今', '辽南京城市格局主要通过北京古城历史地理、考古资料和多时代城市叠压关系辨识。', 938, 1122, '辽南京具体宫城、城墙和街道层不能由后世北京城直接替代。'),
    phase('restoration', '城市遗产解释', '当代', '北京城市考古、博物馆和历史文化遗产标识解释辽南京在北京城市史中的位置。', 2000, undefined, '现代城市遗产系统不等同于辽代南京原貌。'),
  ], ['yelu-abaoji', 'yelu-yanxi'], ['khitan'], ['liao-nanjing-established', 'liao-ended-1125'], ['燕京城址历史地理线索', '多时代城址叠压层', '博物馆与城市考古展示'], '从今日北京观察辽代南京、1122年城市控制转换与后续金中都、元大都等政权在同一城市空间的叠合。', '辽南京具体控制阶段在1122年结束，1125年辽中央政权终止是更晚的中央节点；两者不能混同，具体遗存常与后世都城层叠压，应避免把北京现存古建筑直接归入辽代。', ['liao-history-geography', 'beijing-liao-nanjing-official', 'modern-geography-reference']),
  detail('liao-zhongjing-city-site', '今内蒙古自治区赤峰市宁城县大明镇辽中京遗址保护与考古范围。', ['辽中京大定府宫城、皇城和外城', '五京制度化后连接草原、农耕和东北区域的中心城市'], [
    phase('original', '中京营建', '1007—1125年', '辽在五京体系进一步制度化阶段营建中京，形成宫城、皇城和外城复合城市。', 1007, 1125),
    phase('site', '城市考古遗址', '辽代至今', '城墙、宫城、道路、建筑基址和出土遗物以遗址保护区及考古研究保存。', 1007, 1125, '遗址各城郭和建筑基址的功能、年代需按考古分期确认。'),
    phase('restoration', '遗址保护展示', '当代', '遗址保护、考古调查和展示系统解释辽中京，不重建完整辽代都城。', 2000, undefined, '现代复原图和展示设施不能替代考古实测。'),
  ], ['yelu-abaoji', 'yelu-yanxi'], ['khitan'], ['liao-founded', 'liao-ended-1125'], ['宫城、皇城与外城城垣', '道路和建筑基址', '遗址展示与考古标识'], '学习辽五京分工、中京区域治理、辽亡后的遗产承接与草原—农耕城市网络。', '辽中京遗址保存状况和具体建筑复原应以考古报告为准，不能把中京写成辽唯一首都；1125年政权终止不等于中京遗址同时消失。', ['zizhi-tongjian', 'modern-geography-reference']),
  detail('liao-xijing-city-site', '今山西省大同市古城、云冈及相关历史地理与考古参照范围；辽西京与现代大同市域不完全重合。', ['辽西京大同府城市、宫城与北方边防网络', '辽五京制度中的西部政治和军事中心'], [
    phase('original', '西京区域中心', '1044—1125年', '1044年云州升为西京府、府名大同，连接河东、长城沿线和草原交通，承担区域军政与城市功能。', 1044, 1125),
    phase('site', '大同城市历史层', '辽代至今', '大同古城、城址和相关考古资料保存辽西京历史层，现存景观经历多个时代叠压。', 1044, 1125, '辽代宫城、城墙和建筑遗存需与北魏、金元明清层分开核验。'),
    phase('restoration', '现代遗产展示', '当代', '大同古城保护、博物馆和城市遗产标识解释辽西京，不复原完整辽代城市。', 2000, undefined, '现代修缮建筑与辽代原构分层展示。'),
  ], ['yelu-abaoji', 'yelu-yanxi'], ['khitan'], ['liao-xijing-established', 'liao-ended-1125'], ['古城与城市考古层', '宫城及边防交通历史线索', '博物馆与古城展示'], '从今日大同观察辽西京、1125年辽亡后的城市承接，以及北魏平城和后续政权在同一城市空间的历史叠合。', '辽西京具体城址和可见建筑年代需逐项核验，不能以现代大同古城外观直接代表辽代原貌；政权终止不等于大同城市层和遗产同步消失。', ['datong-liao-xijing-official', 'modern-geography-reference']),
  detail('wuyue-qian-king-mausoleum', '今浙江省杭州市临安区钱王陵公园及相关陵园范围；现存环境包含后世保护与纪念设施。', ['吴越王钱镠及钱氏王族陵墓', '吴越杭州政治中心、978年纳土归宋与两浙地方政权记忆'], [
    phase('original', '陵墓营建', '932年后', '钱镠去世后营建陵墓，陵园与吴越王室、杭州政治中心形成关联。', 932),
    phase('site', '陵园遗址', '吴越至后世', '墓冢、石刻和陵园格局以遗址与地面遗存保存，部分设施历代变化。', 932, 978),
    phase('restoration', '现代保护展示', '当代', '陵园公园、说明系统和文物保护工程展示吴越王室历史，不等同于五代原始陵园全部保存。', 2000),
  ], ['qian-liu', 'qian-chu'], ['wuyue', 'song_northern'], ['wuyue-founded', 'wuyue-ended-978'], ['墓冢与陵园环境', '石刻与纪念设施', '钱王陵历史展示'], '连接钱镠、钱俶、吴越纳土与今日杭州城市历史，观察王室遗产如何跨越政权转换继续存在。', '陵园历代修缮、重建和纪念设施需与吴越原构分层标注；钱王陵主要关联钱镠及钱氏王族，不等同于978年杭州纳土事件发生地或完整吴越都城遗存。', ['zizhi-tongjian', 'china-chronology', 'modern-geography-reference']),
  detail('min-wang-mausoleum', '今福建省福州市北峰寿山一带王审知陵园相关范围，具体陵园边界以地方文物资料为准。', ['闽王王审知陵墓与闽政权王室记忆', '福州作为闽政权政治中心的地方历史', '945年闽终止后福州城市与遗产的南唐承接'], [
    phase('original', '陵墓营建', '925年后', '王审知去世后形成王陵及祭祀空间，关联闽政权王室与福州地方秩序。', 925),
    phase('site', '陵园遗存', '闽至后世', '墓冢、碑刻和陵区环境以遗址和地方文物调查形式保存，原有建筑多不完整。', 925, 945),
    phase('restoration', '现代保护', '当代', '现代通过陵园保护、地方展示和历史说明呈现闽国记忆，不复原五代陵园全貌。', 2000),
  ], ['wang-shenzhi', 'wang-yanzheng', 'li-jing'], ['min', 'southern_tang'], ['min-founded', 'min-ended-945'], ['墓冢与陵区地貌', '碑刻和祭祀空间', '地方文物保护展示'], '把闽政权纳入福州今日城市与区域历史的可见遗产网络，并观察政权终止后王室遗产如何进入南唐及后世城市层。', '具体陵园年代、边界和后世维修需逐项核验，现代纪念设施不能直接归入闽代原建筑；遗产与945年政权终止的关联是城市历史承接关系，不表示陵园在终止当年发生新建。', ['zizhi-tongjian', 'modern-geography-reference']),
  detail('southern-han-king-mausoleum', '今广东省广州市番禺区南汉二陵考古遗址及博物馆展示范围。', ['南汉王室陵墓与广州兴王府政治中心', '岭南地方政权的王室礼制与城市网络'], [
    phase('original', '王陵营建', '917—943年', '南汉王室在广州周边营建陵墓，形成与兴王府政治中心相连的王室葬制空间。', 917, 943),
    phase('site', '陵墓考古遗址', '20世纪以来发掘与保护', '墓室、封土、石刻和随葬遗存以考古遗址和博物馆展示保存。', 917, 943),
    phase('restoration', '现代考古展示', '当代', '博物馆与遗址保护工程解释南汉王室和岭南历史，不复原墓葬使用状态。', 2000),
  ], ['liu-yin', 'liu-yan', 'liu-chang'], ['southern_han', 'song_northern'], ['southern-han-founded', 'southern-han-ended-971'], ['墓室与封土', '石刻和随葬遗存', '考古遗址博物馆展示'], '从王室墓葬理解南汉政权、广州城市与岭南区域历史，并观察971年政权终止后王室遗产如何进入北宋及后世城市记忆。', '墓葬归属、陵园边界和不同墓葬年代需以考古报告为准；971年南汉政权终止不等于陵园或广州城市消失，现代展示设施也不等于南汉原建筑。', ['zizhi-tongjian', 'modern-geography-reference']),
  detail('western-xia-imperial-tombs', '今宁夏回族自治区银川市西郊贺兰山东麓西夏王陵国家考古遗址公园。', ['西夏王室陵墓与兴庆府政治中心', '党项国家礼制、陵园与贺兰山—银川平原空间'], [
    phase('original', '王陵营建', '1038—1227年', '西夏王室在兴庆府西侧营建陵区，形成帝陵、陪葬墓、碑亭和陵园轴线。', 1038, 1227),
    phase('site', '王陵遗址', '西夏至今', '陵台、碑亭基址、陪葬墓和陵园地貌以考古遗址形式保存。', 1038, 1227),
    phase('restoration', '现代遗址保护', '当代', '国家考古遗址公园和博物馆对陵区进行保护与解释，不复原完整西夏陵园建筑。', 2000),
  ], ['li-yuanhao', 'li-xian-western-xia'], ['western_xia'], ['western-xia-founded', 'western-xia-ended-1227'], ['陵台与陪葬墓', '碑亭基址与陵园轴线', '遗址公园和博物馆展示'], '从王陵观察西夏政权、兴庆府都城、末期覆亡与党项礼制文化，并连接今日银川的考古遗产展示。', '各陵墓具体归属和陵园建筑复原需以考古分期为准；1227年西夏政权终止不等于兴庆府城市或王陵遗产同时消失，现代景观与西夏原构应分层展示。', ['zizhi-tongjian', 'modern-geography-reference']),
  detail('ma-chu-tan-zhou-city-site', '今湖南省长沙市主城区及湘江沿岸相关城市考古范围；古代潭州城与现代城市边界不完全重合。', ['马楚潭州政治中心与湖湘地方政权', '潭州城、湘江水运和五代十国区域网络'], [
    phase('original', '城市经营', '907—951年', '马楚政权以潭州为核心经营湖湘，城址、衙署和湘江水运共同支撑地方统治。', 907, 951),
    phase('site', '城市历史层', '五代至后世', '城址、道路和水运遗存以多时期城市考古与历史地理资料辨识，不能合并为完整马楚宫城。', 907, 951, '潭州城具体边界和五代建筑层位需进一步核验。'),
    phase('restoration', '现代城市展示', '当代', '博物馆、历史街区和城市考古展示马楚潭州，不把现代建筑直接标作五代原构。', 2000),
  ], ['ma-yin', 'ma-xiguang', 'ma-xie', 'ma-xichong', 'li-jing'], ['chu_ten', 'southern_tang'], ['ma-chu-founded', 'ma-chu-ended-951'], ['城市道路与城址线索', '湘江水运空间', '地方博物馆与历史展示'], '补足五代十国湖湘政权、951年南唐承接与今日长沙城市史的关联。', '马楚时期宫城和衙署具体位置尚需分层考古核验；951年长沙被南唐承接不等于湖南各地同日完成行政转换，现代长沙城市景观是多时代叠合结果。', ['zizhi-tongjian', 'modern-geography-reference']),
  detail('jin-huining-city-site', '今黑龙江省哈尔滨市阿城区白城遗址一带，金上京遗址保护和考古展示范围。', ['金早期会宁府宫城与上京制度', '女真建国、皇权礼制与阿什河流域城市网络'], [
    phase('original', '都城营建', '1115—1153年', '金建立后以会宁府为上京，逐步形成宫城、皇城和外城空间，直到迁都燕京前仍是早期政治中心。', 1115, 1153),
    phase('site', '宫城与城址遗址', '金代至今', '城墙、宫殿基址、道路和出土遗物以考古遗址形式保存。', 1115, 1153),
    phase('restoration', '现代考古保护', '当代', '遗址保护区、博物馆和考古展示解释金上京，不重建完整宫城。', 2000),
  ], ['wanyan-aguda'], ['jin_jurchen'], ['jurchen-jin-founded'], ['宫城与皇城遗址', '城墙、道路和建筑基址', '出土遗物与遗址展示'], '从金上京观察女真金政权建国初期的首都与国家制度。', '会宁府不同城郭、宫殿和使用层需按考古分期理解，现代展示性复原不等于金代原貌。', ['zizhi-tongjian', 'modern-geography-reference']),
  detail('jin-kaifeng-city-layer', '今河南省开封市区及城摞城考古分布区；金末开封层与后梁、后晋、后汉、北宋及后世城市层叠压。', ['金末政治中心与完颜守绪末期政权', '金、宋、蒙古战争背景下的开封城市承接'], [
    historicalPhase('original', '金末政治中心', '1214—1234年', '金在中都失守后以开封为末期实际政治中心，城市官署、军政交通和城防层需与北宋东京区分。', 1214, 1234, '现存开封多为多时期叠压城市层，不能据此指认金末单一宫殿原构。', ['zizhi-tongjian', 'capital-history-reference', 'modern-geography-reference']),
    historicalPhase('site', '城市考古历史层', '金至后世', '开封城摞城、道路、水系和遗址线索保存多时代城市连续性，金末层位需按考古报告分层。', 1214, 1234, '后世北宋、元、明清建筑与现代城市不能直接替代金末建筑。', ['zizhi-tongjian', 'capital-history-reference', 'modern-geography-reference']),
    phase('restoration', '现代城市考古展示', '当代', '博物馆、遗址标识和城市考古展示开封多政权首都历史，不复原完整金末宫城。', 2000),
  ], ['wanyan-shouxu'], ['jin_jurchen'], ['jin-ended-1234'], ['城摞城考古层', '金末官署与城防线索', '开封城市历史展示'], '从今日开封观察金末迁都、政权终止与多朝首都城市层承接。', '金末开封具体宫城和蔡州终局不等同于现代开封单一建筑；城市遗产与政权终止需分层。', ['zizhi-tongjian', 'capital-history-reference', 'modern-geography-reference']),
  detail('northern-yan-longcheng-tomb', '今辽宁省朝阳市及吉林省和龙相关考古参照区域；龙城具体位置与北燕墓葬对应关系仍需分点核验。', ['北燕龙城政治中心与冯氏政权', '十六国东北地区城址、墓葬与族群迁徙网络'], [
    phase('original', '墓葬与政治网络形成', '407—436年', '北燕在龙城区域延续燕政权，王室与贵族墓葬、城址和交通网络共同构成政治空间。', 407, 436, '“冯氏墓葬”与北燕具体王室成员的逐一对应不能由区域位置直接推定。'),
    phase('site', '区域考古遗址', '十六国至今', '墓葬、城址和出土材料以区域考古线索保存，不能把候选点位视作一座完整北燕王陵。', 407, 436, '遗址归属和年代需按考古报告逐项核验。'),
    phase('restoration', '现代考古展示', '当代', '地方博物馆、遗址调查和历史地图解释北燕龙城，不复原未经确认的北燕宫城。', 2000),
  ], ['murong-chui'], ['northern_yan'], ['northern-yan-founded'], ['墓葬与城址考古线索', '出土材料与地方博物馆', '龙城区域历史地图'], '为北燕提供“区域中心—墓葬—族群网络”的遗产观察角度。', '慕容垂是前燕、后燕政治网络人物，并非北燕君主；此处仅作燕政权谱系的比较关联，不能当作北燕直接营建者或墓主。', ['zizhi-tongjian', 'modern-geography-reference']),
  detail('former-zhao-xiangguo-city-site', '今河北省邢台市及襄国古城相关考古区域；古城边界与现代城区不重合。', ['前赵襄国政治中心与汉赵政权形成', '十六国早期城市、军政迁徙和中原交通网络'], [
    phase('original', '城市营建与沿用', '304—329年', '前赵政权在刘渊、刘聪及后续统治阶段经营襄国与关中政治空间，古城成为政权迁徙史的一处参照。', 304, 329),
    phase('site', '城址历史层', '十六国城市遗存', '城垣、宫署和道路信息主要通过古城考古、地方历史地理和多时期叠压层认识。', 304, 329, '前赵早期称汉赵，政治中心曾迁徙，不能把单一城址等同于全期固定首都。'),
    phase('restoration', '现代考古展示', '近现代以来', '现代城市考古与地方博物馆解释襄国历史，不复原未经确认的前赵宫殿。', 1900),
  ], ['liu-yao'], ['former_zhao'], ['former-zhao-founded'], ['城垣与建筑基址线索', '道路和水系历史空间', '地方考古展示'], '补足十六国早期前赵与邢台今日城市历史的关联。', '前赵都城经历襄国、长安等政治中心转换；本条记录的是襄国历史层，不代表全期唯一首都。'),
  detail('former-zhao-changan-city-layer', '今陕西省西安市未央区及汉长安城遗址相关考古研究范围；前赵城市层与汉、前秦、后秦及隋唐层叠压。', ['前赵刘曜时期长安政治中心', '十六国长安城的政权更替、官署承接与关中交通网络'], [
    phase('original', '前赵长安政治中心', '318—329年', '刘曜承接前赵后以关中和长安为主要政治中心，长安成为前赵与后赵争夺北方秩序的关键城市。', 318, 329, '长安具体宫城、官署和前赵建筑单体难以从现存遗址中直接分辨。'),
    phase('site', '前赵覆亡后的城市承接', '329年以后', '后赵攻取长安后，城市继续进入十六国多政权反复占有和叠压使用的历史层。', 329, undefined, '政权终止不等于城市、人口、道路和遗址在同年消失。'),
    phase('restoration', '现代考古解释', '当代', '汉长安城遗址保护、历史地图和博物馆展示多时代长安城市层，不复原未经确认的前赵宫城。', 2000),
  ], ['liu-yao', 'shi-le'], ['former_zhao'], ['former-zhao-founded', 'former-zhao-ended-329'], ['城址与道路考古线索', '关中政权更替历史地图', '遗址保护与城市展示'], '从今日西安观察前赵长安、329年政权终止与十六国城市连续性。', '前赵早期政治中心并非全期固定在长安；现存汉长安城遗址不能直接替代前赵城界，329年终止也不等于城市遗产终止。', ['zizhi-tongjian', 'china-chronology', 'modern-geography-reference']),
  detail('southern-liang-jiangling-city-site', '今湖北省荆州市荆州古城及纪南城周边历史空间；南梁江陵宫城范围需与楚纪南城分层。', ['南梁江陵政权与梁元帝时期的政治中心', '侯景之乱后南朝政局、荆州水陆交通与城市防御'], [
    phase('original', '政治中心形成', '552—554年', '南梁在侯景之乱后以江陵为重要政治中心，梁元帝时期的宫城与地方军政网络依托荆州展开。', 552, 554),
    phase('site', '城市历史层', '南朝晚期江陵遗址', '城垣、宫署和水运空间通过荆州古城、纪南城及相关考古资料分层理解。', 552, 557, '南梁江陵历史层与先秦楚都、后世荆州城址存在叠压，不能混同。'),
    phase('restoration', '现代保护展示', '当代历史城市保护', '现代古城保护、博物馆和考古标识解释南梁江陵，不将后世城墙直接视为南梁原构。', 1900),
  ], ['xiao-yan'], ['liang_southern'], ['southern-liang-founded'], ['城垣与宫城考古线索', '长江—汉水水运空间', '荆州古城与纪南城分层展示'], '连接南梁政权转折、荆州城市史与今日荆州遗产景观。', '南梁江陵城的具体宫城边界和现存构件年代需依考古分期，现代荆州古城不能直接替代南梁城界。'),
  detail('jingnan-jiangling-city-site', '今湖北省荆州市荆州古城及长江、汉水交通节点；荆南具体衙署位置尚无完整连续遗存。', ['荆南据守江陵的地方政权', '五代十国江陵城、长江航运与区域缓冲政治'], [
    phase('original', '城市经营', '924—963年', '荆南政权以江陵为据点，利用城防、河运和节度使网络维持五代十国时期的地方统治。', 924, 963),
    phase('site', '城市历史层', '五代至宋代城市叠压', '城墙、道路、码头与水系遗存以荆州古城及区域考古、历史地理资料辨识。', 924, 963, '现存荆州古城城墙多经后世修缮，不能直接视作荆南原构。'),
    phase('restoration', '现代城市保护', '当代古城保护与展示', '现代古城保护、博物馆和城市导览解释荆南历史，不复原五代衙署。', 1900),
  ], ['gao-jixing', 'gao-baorong', 'gao-baoxu', 'gao-jichong', 'zhao-kuangyin'], ['jingnan', 'song_northern'], ['jingnan-founded', 'jingnan-ended-963'], ['城墙与城门', '江陵水运空间', '地方历史博物馆与标识'], '把荆南纳入五代十国、北宋统一与今日荆州城市史的连续观察，追踪963年纳土后的城市政治承接。', '荆南政治空间与后世荆州城址存在叠压，具体宫署、码头位置需分别核验；现存城墙多经后世修缮，不能直接视作荆南原构；963年纳土不等于城市遗产或地方社会消失。'),
  detail('dali-city-site', '今云南省大理市大理古城、太和城及洱海西岸遗址分布区；现代旅游城市边界不等同于大理古城范围。', ['大理段氏政权都城与南诏都城传统的延续', '洱海区域宫城、城防、交通与宗教景观'], [
    phase('original', '城址发展', '937—1253年', '大理政权在南诏既有政治地理基础上经营羊苴咩城、大理城及洱海西岸交通网络。', 937, 1253),
    phase('site', '古城与遗址层', '大理时期城市遗存', '城墙、道路、寺院和水利线索以大理古城、太和城及周边考古资料保存。', 937, 1253, '大理城与南诏太和城的城址范围和使用阶段需分层说明。'),
    phase('restoration', '历史城市保护', '近现代以来', '古城保护、博物馆和遗址展示连接大理政权与今日城市，不将后世街巷建筑全部视作大理原构。', 1900),
  ], ['duan-siping', 'duan-xingzhi'], ['dali'], ['dali-founded', 'dali-ended-1253'], ['城墙与道路', '寺院和水利遗存', '洱海—苍山历史景观'], '从大理古城观察南诏之后西南政权、城市与区域交通，并追踪1253年前后大理政权终止后的城市延续。', '大理城、羊苴咩城和太和城不是同一城址；现存建筑多有后世维修，年代需逐项标注；1253年政权终止不等于城市遗址和地方社会消失。', ['dali-yangjumei-mct', 'dali-duan-siping-official', 'dali-history-research-nopss']),
  detail('goguryeo-guonei-city-site', '今吉林省通化市集安市国内城、丸都山城及高句丽王城遗址分布区。', ['高句丽国内城与丸都山城王城体系', '东北亚山城防御、王陵与都城迁移传统'], [
    phase('original', '王城营建', '前37—427年', '高句丽在国内城及丸都山城经营王城和山城防御体系，形成宫城、城垣与墓葬相互关联的政治景观。', -37, 427),
    phase('site', '世界文化遗产遗址', '高句丽王城、王陵与贵族墓葬', '城墙、宫殿址、山城、墓葬和壁画遗存以集安遗址群形式保存。', -37, 427),
    phase('restoration', '考古保护展示', '20世纪以来', '遗址保护区、博物馆和考古展示帮助理解高句丽王城，不重建完整宫城。', 1900),
  ], ['jumong', 'li-shimin'], ['goguryeo'], ['goguryeo-founded'], ['国内城城垣', '丸都山城防御遗迹', '王陵与贵族墓葬'], '将高句丽政权、集安今日城市和东北亚遗产研究连接起来。', '国内城、丸都山城和相关墓葬存在不同年代与功能，不能简化为单一固定首都建筑群；朱蒙用于高句丽建政入口，李世民仅作唐—高句丽互动索引。'),
  detail('goguryeo-pyongyang-city-layer', '今朝鲜民主主义人民共和国平壤市及其周边高句丽古城、王城遗址研究范围；现代行政区、古城范围与高句丽政治控制范围不重合。', ['427年迁都后的高句丽平壤都城阶段', '大同江流域城市、王权与东北亚交通网络'], [
    historicalPhase('original', '平壤都城形成', '427—585年', '高句丽迁都平壤后，平壤承接后期国家政治、军事与交通功能；427年迁都与城市营建、宫城分区的形成是连续过程。', 427, 585, '427年用于都城阶段转换，不据此断定平壤全部宫城建筑在当年完成。'),
    historicalPhase('site', '长安城转移后的城市层', '586—668年', '586年后政治中心转入长安城，平壤仍是重要城市与区域交通节点；相关古城、城垣、墓葬和交通遗迹应与都城阶段分层理解。', 586, 668, '具体遗址归属、分期与保存状态应按考古报告逐项核验。'),
    historicalPhase('restoration', '现代研究与展示', '当代', '现代城市考古、博物馆与历史地理研究为学习者呈现平壤作为高句丽后期政治中心的城市层次，不复原未经确认的完整宫城。', 2000, undefined, '现代展示、城市建设和行政边界不等同于高句丽原始建筑或政权疆域。'),
  ], ['jangsu-goguryeo', 'gwanggaeto'], ['goguryeo'], ['goguryeo-moves-pyongyang'], ['古城城垣与城市考古线索', '王城、墓葬与交通空间研究', '现代历史地理与博物馆展示'], '从今日平壤观察高句丽由国内城阶段转向后期都城阶段的政治与城市变迁，并与集安国内城形成连续但分层的城市史链条。', '平壤历史城区、古代王城与现代行政城市不是同一边界；427年迁都不等于完整宫城在当年建成，也不能由此推导后期政权疆域。', ['zizhi-tongjian', 'china-chronology', 'capital-history-reference']),
  detail('silla-gyeongju-capital-site', '今韩国庆尚北道庆州市及其王京、古坟、寺院遗址分布区。', ['新罗金城、徐罗伐王京与庆州历史城区', '新罗王权、佛教建筑、古坟群和城市基础设施'], [
    phase('original', '早期王京形成与发展', '前57—100年', '新罗以金城、徐罗伐为中心经营早期王京，宫城、聚落和王权网络持续形成；前57年是传统纪年节点。', -57, 100),
    phase('site', '月城与统一新罗王京遗址群', '101—935年', '月城、王陵、寺院、瞻星台和道路遗址共同保留庆州王京的多层证据；不同遗址不能压缩为一座连续建筑。', 101, 935, '月城与金城、徐罗伐等文献名称的对应需按考古分期理解。'),
    phase('restoration', '现代遗址保护', '现代历史城区保护', '庆州历史区以遗址公园、博物馆、世界遗产保护和城市展示连接新罗与现代城市，不把复原建筑当作原构。', 1900),
  ], ['park-hyeokgeose', 'kim-chunchu', 'kim-yushin', 'munmu-silla', 'gyeongsun-silla'], ['silla'], ['silla-founded', 'silla-tang-alliance-648', 'silla-tang-war-670-676', 'silla-ended-935'], ['月城与王京遗址', '古坟群与王陵', '寺院、瞻星台及城市遗迹'], '从庆州今日城市视角观察新罗长期首都、统一战争与王京遗产。', '新罗王京是长期扩展的城市系统，各遗址年代、功能与复原程度不同；唐—新罗外交关系应通过独立事件和人物连接，不把李世民直接挂到前57年新罗遗产节点。', ['silla-encykorea', 'silla-samguksagi-db', 'silla-unification-wars-official', 'silla-gyeongju-unesco']),
  detail('tibetan-lhasa-city-site', '今西藏自治区拉萨市布达拉宫、大昭寺及拉萨河谷历史城区；吐蕃王城与现代城区边界不重合。', ['吐蕃逻些城与高原帝国政治中心', '宫城、佛教建筑、交通和唐蕃交流网络'], [
    phase('original', '政治中心形成', '7世纪至9世纪', '吐蕃政权在逻些形成长期政治与宗教中心，宫城、寺院和交通节点共同支撑高原帝国治理。', 618, 842),
    phase('site', '历史城区与建筑遗存', '吐蕃及后世叠合层', '布达拉宫、大昭寺及相关历史城区保存建筑、地层和宗教空间线索，需与后世重修分层。', 618, 842, '现存主体经历后世修缮，不能全部视为吐蕃时期原构。'),
    phase('restoration', '现代保护展示', '当代世界遗产保护', '历史城区保护、博物馆与公共展示解释吐蕃逻些，不复原已不可见的吐蕃宫城。', 1900),
  ], ['li-shimin', 'langdarma'], ['tibetan_empire'], ['tibetan-founded', 'tibetan-ended-842'], ['宫城与历史城区空间', '大昭寺及宗教建筑', '拉萨河谷交通景观'], '把吐蕃政权、拉萨今日城市、末期王权危机和唐蕃交流置于同一遗产坐标。', '逻些城的吐蕃原始边界、建筑层和后世重修需分别核验；842年后政权结构变化不等于城市遗产终止，现代拉萨行政边界也不能替代古城范围。', ['zizhi-tongjian', 'china-chronology', 'modern-geography-reference']),
  detail('nanzhao-taihe-city-site', '今云南省大理市太和城村及苍山洱海之间的太和城遗址保护范围。', ['南诏早期太和城都城', '洱海区域王权、城防与西南交通网络'], [
    phase('original', '都城营建', '738—779年', '南诏形成后以太和城为早期都城，利用苍山洱海之间的地形组织宫城、城防和交通。', 738, 779),
    phase('site', '城址遗存', '南诏太和城考古遗址', '城垣、道路、建筑基址和周边历史地貌构成太和城可识别的遗址证据。', 738, 779),
    phase('restoration', '遗址保护展示', '当代考古保护', '遗址保护、考古调查和地方博物馆解释南诏早期都城，不复原完整城内建筑。', 1900),
  ], ['li-longji'], ['nanzhao'], ['nanzhao-founded'], ['城垣与建筑基址', '苍山洱海地形关系', '遗址保护与考古展示'], '连接南诏建政、太和城遗址和今日大理城市文化景观。', '太和城与南诏后期羊苴咩城的阶段关系需要区分，现地遗址不等于完整南诏宫城；李隆基仅作唐—南诏互动索引。'),
  detail('nanzhao-yangjumei-city-site', '今云南省大理市大理古城一带、羊苴咩城城墙遗址及洱海西岸历史空间；现代大理古城边界不等同于南诏古城范围。', ['南诏后期羊苴咩城都城', '南诏—大长和—大理连续的洱海政治中心与城市遗产'], [
    historicalPhase('original', '后期都城使用', '779—902年', '南诏迁都后以羊苴咩城为后期政治中心，城垣、道路、宫署和洱海交通网络共同支撑王权运作。', 779, 902, '羊苴咩城的宫城、外郭与周边聚落范围不能由现代大理古城边界直接替代。', ['zizhi-tongjian', 'dali-yangjumei-mct', 'modern-geography-reference']),
    historicalPhase('site', '城墙与城市遗址', '南诏后期及其后承接层', '考古发现的城墙、道路和建筑基址构成今日可辨识的羊苴咩城遗产线索；902年政权转换不等于城市遗址同时终止。', 779, 937, '遗址涉及南诏、大长和及大理连续历史层，具体构件年代需按考古分层。', ['dali-yangjumei-mct', 'modern-geography-reference']),
    historicalPhase('restoration', '现代遗址保护展示', '当代', '遗址保护、地方博物馆和历史城市导览解释南诏后期都城及其后续承接，不复原未经确认的完整宫城。', 1900, undefined, '现代保护设施和后世大理古城建筑不能直接标作南诏原构。', ['dali-yangjumei-mct', 'modern-geography-reference']),
  ], ['yimouxun', 'quanfengyou', 'shun-huazhen', 'zheng-maisi'], ['nanzhao'], ['nanzhao-founded', 'nanzhao-ended-902'], ['城墙遗址', '城市道路与建筑基址线索', '苍山洱海交通景观', '现代遗址保护与历史城市展示'], '从今日大理古城一带观察南诏后期都城、902年政权承接及后续大理城市史。', '羊苴咩城、太和城与大理古城是有连续关系但不应合并为单一城址；现存城墙和城市建筑包含后世叠压，902年南诏终止不等于城市遗产、地方社会或后续政权空间消失。', ['zizhi-tongjian', 'dali-yangjumei-mct', 'modern-geography-reference']),
  detail('western-liao-balasagun-site', '今吉尔吉斯斯坦楚河州托克马克附近布拉纳遗址及八剌沙衮历史区域。', ['西辽1134年建都所称虎思斡耳朵与八剌沙衮政治中心', '契丹政权西迁、楚河谷城市网络与中亚交通'], [
    historicalPhase('original', '八剌沙衮政治中心阶段', '1134—1218年', '《辽史》记延庆三年建都城、号虎思斡耳朵；项目将其作为八剌沙衮稳定政治中心的起点，和1132年称帝阶段分开。', 1134, 1218, '八剌沙衮城址、虎思斡耳朵宫帐与军营的对应关系不能简单视为同一固定宫城。', westernLiaoSourceIds),
    historicalPhase('site', '城址与建筑遗存', '中世纪楚河流域遗址', '布拉纳遗址保留城垣、堡垒、建筑基址、宗教建筑与水利系统等楚河谷城市遗存；这些遗存跨越西辽前后多个时期。', 1134, 1218, '现存遗迹的具体年代和西辽层位需以考古报告分层，不能把现代修复塔楼直接视作西辽原貌。', westernLiaoSourceIds),
    historicalPhase('restoration', '国际遗址保护', '现代考古与博物馆展示', '遗址保护区和布拉纳博物馆解释楚河谷丝绸之路城市史，不复原完整西辽宫城。', 1900, undefined, undefined, westernLiaoSourceIds),
  ], ['yelu-dashi', 'kuchlug'], ['western_liao'], ['western-liao-founded', 'western-liao-ended-1218'], ['布拉纳塔与城址遗迹', '城垣、堡垒与建筑基址', '楚河谷交通与水利景观'], '将西辽纳入中国史、中亚史和跨区域城市遗产的学习路径，从今日吉尔吉斯斯坦遗址观察迁徙政权、末期覆亡、城市延续与草原—绿洲网络。', '八剌沙衮与虎思斡耳朵的名称和空间对应需分层；布拉纳遗址是历史城市遗产节点，不等同于完整西辽首都或全部西辽疆域；1218年政权覆亡不等于城市遗产同时终止。', westernLiaoSourceIds),
  detail('han-xinzheng-city-site', '今河南省郑州市新郑市郑韩故城遗址保护范围，城址与现代新郑城区边界不完全重合。', ['战国韩国新郑都城', '韩国宫城、城防与中原诸侯交通网络'], [
    phase('original', '都城使用', '前403—前230年', '韩国以新郑为都城阶段形成城垣、宫殿和手工业空间，后期政权中心变化需与新郑层分开。', -403, -230),
    phase('site', '城址考古遗存', '战国韩国历史层', '城墙、宫殿区、作坊和道路遗迹以考古遗址形式保存。', -403, -230, '秦灭韩后的利用、破坏和后世地层不能直接标作韩国原构。'),
    phase('restoration', '现代遗址展示', '当代', '遗址保护、考古展示和历史地图解释新郑古城，不重建完整韩国宫城。', 2000, undefined, '展示性构筑物与战国原建筑分层记录。'),
  ], ['qin-shi-huang'], ['han_warring'], ['han-warring-founded-eighth-batch'], ['城垣与宫殿区遗迹', '手工业和道路遗存', '遗址保护展示系统'], '从今天的新郑观察战国韩国都城与秦灭六国的历史转折。', '现存遗址是多时期叠压的考古层；嬴政作为灭韩方人物是关联入口，不代表其营建韩国遗址。', ['zizhi-tongjian', 'modern-geography-reference']),
  detail('wei-anyi-city-site', '今山西省运城市夏县一带安邑古城考古区域，具体城址范围需按考古资料定位。', ['战国魏早期都城安邑', '魏国迁都前的河东政治、盐运与交通空间'], [
    phase('original', '早期都城使用', '前403—前364年', '魏在战国早期以安邑为都，河东城址与交通网络支撑其诸侯国政治。', -403, -364),
    phase('site', '古城与考古层', '战国魏安邑历史层', '城垣、道路和相关遗迹以考古调查、发掘和地方历史地理形式保存。', -403, -364, '安邑、后期大梁和现代夏县不能互相替代。'),
    phase('restoration', '现代保护展示', '当代', '考古保护区、博物馆和历史地图解释安邑，不复原魏国宫城。', 2000, undefined, '现代展示设施不等同于战国原建筑。'),
  ], ['qin-shi-huang'], ['wei_warring'], ['wei-warring-founded-eighth-batch'], ['城垣与道路线索', '河东交通与城市空间', '考古保护和地方展示'], '从安邑今日遗址观察魏国早期都城与战国政权迁都。', '嬴政关联的是后续秦灭魏的历史链条，不能当作安邑营建者；魏国不同阶段都城应分层记录。', ['zizhi-tongjian', 'modern-geography-reference']),
  detail('chu-ying-city-site', '今湖北省荆州市纪南城遗址保护范围，郢都城界与现代荆州市区不重合。', ['战国楚都郢与纪南城', '楚国宫城、水系、礼制和江汉交通网络'], [
    phase('original', '都城营建与使用', '前403—前278年', '楚国在纪南城经营宫城、城垣和水陆交通，郢都成为江汉区域政治中心。', -403, -278),
    phase('site', '城址考古遗址', '纪南城战国历史层', '城垣、宫殿基址、道路和水系遗迹以考古遗址形式保存。', -403, -278, '楚迁寿春后的阶段与郢都遗址不能合并为同一固定首都。'),
    phase('restoration', '遗址保护展示', '当代', '遗址公园、考古展示和博物馆解释郢都，不重建完整楚国宫城。', 2000, undefined, '现代复原只表达空间关系，不代表楚代原构。'),
  ], ['qin-shi-huang'], ['chu_warring'], ['chu-warring-founded-eighth-batch'], ['城垣与宫殿基址', '道路、水系和礼制空间', '纪南城遗址展示'], '从荆州今日纪南城观察战国楚国都城和秦楚战争。', '嬴政是秦灭楚的对手方人物，关联用于事件导航，不表示其参与楚都营建；郢与寿春应分别建模。', ['zizhi-tongjian', 'modern-geography-reference']),
  detail('yan-ji-city-site', '今北京市及蓟城相关考古研究区域，具体战国城址范围存在不同定位口径。', ['战国燕都蓟城', '燕国北方边疆、城防和交通网络'], [
    phase('original', '都城使用', '前403—前222年', '燕国以蓟为重要都城，城防与北方交通网络支撑其长期统治。', -403, -222),
    phase('site', '区域城市考古层', '战国至后世幽州叠压', '古城、道路和水系线索通过北京地区考古与历史地理研究辨识。', -403, -222, '蓟城与汉唐幽州并非同一完整建筑层。'),
    phase('restoration', '现代城市展示', '当代', '博物馆、遗址标识和历史地图解释蓟城，不复原未经确认的战国宫城。', 2000, undefined, '现代城市建筑与展示构筑物不等同于燕国原建筑。'),
  ], ['qin-shi-huang'], ['yan_warring'], ['yan-warring-founded-eighth-batch'], ['蓟城区域城址线索', '北方交通和城防空间', '历史地图与城市考古展示'], '从北京今日城市理解战国燕都蓟城及秦灭燕的历史转折。', '蓟城具体位置和遗址连续性仍需分区核验；嬴政关联的是灭燕事件，不是燕都营建者。', ['zizhi-tongjian', 'modern-geography-reference']),
  detail('qi-linzi-city-site', '今山东省淄博市临淄区齐都镇及齐故城遗址保护范围。', ['战国齐都临淄', '齐国宫城、手工业、商业和齐地交通网络'], [
    phase('original', '都城营建与使用', '前403—前221年', '齐国以临淄为都，大小城、宫殿和手工业区共同构成东方诸侯强国的城市空间。', -403, -221),
    phase('site', '齐故城考古遗址', '战国临淄历史层', '城垣、宫殿、排水、冶铸和道路遗迹以考古遗址形式保存。', -403, -221, '秦灭齐后的城址利用与后世村镇地层需单独区分。'),
    phase('restoration', '遗址保护展示', '当代', '遗址公园、博物馆和考古展示解释临淄，不重建完整齐国宫城。', 2000, undefined, '展示性复原不等同于战国原建筑。'),
  ], ['qin-shi-huang'], ['qi_warring'], ['qi-warring-founded-eighth-batch', 'qin-unification'], ['大城与小城城垣', '宫殿和手工业遗址', '道路与排水系统'], '从临淄今日遗址观察战国齐国城市、经济与秦统一的终局。', '嬴政是灭齐方人物，关联用于历史事件导航；临淄的宫殿、城垣和后世遗迹必须分层。', ['zizhi-tongjian', 'modern-geography-reference']),
  detail('southern-yan-guanggu-city-site', '今山东省潍坊市青州市广固城相关考古区域，古城范围与现代青州城区不完全重合。', ['南燕广固政治中心', '十六国慕容氏政权、城防与山东区域交通'], [
    phase('original', '政治中心形成', '398—410年', '南燕在山东重建燕政权并以广固为重要政治中心，城防和交通支撑其区域统治。', 398, 410),
    phase('site', '城址考古层', '广固城及青州历史空间', '城垣、建筑基址和区域交通遗迹以考古与历史地理研究形式保存。', 398, 410, '广固具体宫城范围及南燕建筑层需进一步分区核验。'),
    phase('restoration', '现代遗址展示', '当代', '考古保护、地方博物馆和历史地图解释广固，不复原完整南燕宫城。', 2000, undefined, '后世青州城和现代展示设施不能直接视作南燕原建筑。'),
  ], ['murong-chui', 'murong-chao'], ['southern_yan'], ['southern-yan-founded', 'southern-yan-ended-410'], ['广固城址与城防线索', '山东区域交通空间', '考古和地方展示'], '从青州今日遗址观察南燕、慕容氏谱系与十六国区域政权。', '慕容垂是南燕前史的慕容氏人物，不等同于南燕君主；410年广固失守是政权转换节点，不意味着广固城址或青州城市层消失。', ['zizhi-tongjian', 'modern-geography-reference']),
  detail('dunhuang-western-liang-city-site', '今甘肃省敦煌市及汉晋敦煌城、河西墓葬考古分布区，古城范围与现代敦煌城区不完全重合。', ['西凉敦煌政治中心', '绿洲城市、河西交通与十六国西部政权'], [
    phase('original', '前期城市与政治中心使用', '400—404年', '李暠在敦煌建立西凉后，敦煌绿洲城市、城防和河西交通网络支撑前期政权；405年政治中心迁至酒泉，敦煌仍保留西部军政节点。', 400, 404),
    phase('site', '城市考古层', '十六国敦煌历史层', '古城、墓葬、道路和水利线索以区域考古和历史地理研究形式保存。', 400, 421, '敦煌石窟和后续城址营造跨越多朝代，不能全部归入西凉。'),
    phase('restoration', '现代遗址保护展示', '当代', '遗址保护、博物馆和历史地图解释西凉敦煌，不重建未经确认的西凉宫城。', 2000, undefined, '现代展示设施与西凉原建筑分层记录。'),
  ], ['li-yuanhao'], ['western_liang'], ['western-liang-state-founded'], ['古城与城防线索', '绿洲水利和河西交通', '墓葬与区域考古展示'], '从敦煌今日遗址观察西凉都城、河西交通和后续西北政权的城市连续性。', '李元昊属于后来的西夏，此处仅作西北政权城市连续性比较入口，不表示其参与西凉建设；敦煌不同年代遗存必须分层。', ['zizhi-tongjian', 'modern-geography-reference', 'jinshu-vol87-li-hao', 'zizhi-tongjian-vol111-western-liang']),
  detail('zhangye-northern-liang-city-layer', '今甘肃省张掖市及甘州古城、相关城市考古与历史地理研究范围。', ['北凉早期张掖政治中心', '河西走廊城市、城防与交通网络'], [
    phase('original', '政治中心使用', '397—400年', '段业在张掖被拥立后，张掖承担北凉早期政权的城市政治与军政组织功能；该阶段与401年后姑臧都城阶段分开记录。', 397, 400, '此处按北凉首都阶段记录城市历史层，不把后世城市建筑直接归为北凉原构。'),
    phase('site', '城市历史层', '十六国河西城市考古研究', '张掖古城、道路、水利与河西交通线索通过考古和历史地理研究理解，现存城市并非一座完整保存的北凉都城。', 397, 400, '古城范围、建筑层位和北凉时期具体遗存需依考古资料分区核验。'),
    phase('restoration', '现代城市展示', '当代', '地方博物馆、遗址标识和历史地图可用于解释北凉张掖，不复原未经确认的北凉宫城。', 2000, undefined, '现代展示设施与北凉原建筑分层记录。'),
  ], ['duan-ye', 'juqu-mengxun'], ['northern_liang'], ['northern-liang-founded'], ['古城与城市考古线索', '河西走廊水利和交通空间', '地方历史展示与历史地图'], '从今天的张掖观察北凉早期建政、张掖都城阶段与后续迁都姑臧的城市连续性。', '397年张掖受拥立是北凉形成节点；该遗产仅表达张掖城市历史层和政治中心阶段，不把现存建筑或后期姑臧遗存前推为北凉早期原构。', ['zizhi-tongjian', 'capital-history-reference', 'modern-geography-reference']),
  detail('shu-han-chengdu-city-site', '今成都市中心及相关古城、水系考古研究区域，蜀汉宫城边界与现代成都城区不重合。', ['蜀汉成都都城与城市空间', '三国成都宫城、水陆交通及后世城市叠压'], [
    phase('original', '都城使用', '221—263年', '蜀汉以成都为都，宫城、城防和成都平原水陆交通共同支撑政权。', 221, 263),
    phase('site', '城市考古层', '三国成都历史层', '城址、道路和水系信息主要通过城市考古、文献与历史地理复原辨识。', 221, 263, '蜀汉建筑与后续成汉、前后蜀城市层不能合并。'),
    phase('restoration', '现代城市展示', '当代', '博物馆、遗址标识和历史地图解释蜀汉成都，不复建未经确认的宫城。', 2000, undefined, '现代城市建筑和展示设施不等同于蜀汉原构。'),
  ], ['liu-bei'], ['shu_three'], ['shu-han-founded'], ['城市考古与道路水系线索', '成都平原交通空间', '三国至十国城市叠压展示'], '从今天的成都观察蜀汉都城，并与后续成汉、前蜀、后蜀城市层比较。', '蜀汉成都宫城边界与现代城区不重合；现存城市层不能还原完整蜀汉宫城。', ['zizhi-tongjian', 'modern-geography-reference', 'shuhan-chengdu-official']),
  detail('ming-yingtian-imperial-city-site', '今南京市玄武区明故宫遗址公园及其周边，明初应天府宫城范围与现代南京城区不重合。', ['明初应天府宫城与南京政治中心', '明初宫殿、城防和明代城市制度'], [
    phase('original', '宫城营建', '1368—1421年', '朱元璋以应天府为明初都城，宫城、皇城和城市道路逐步形成。', 1368, 1421),
    phase('site', '宫城遗址', '明故宫考古层', '宫墙、宫殿基址、道路和水系遗迹以遗址公园与考古资料保存。', 1368, 1421, '明故宫后续拆改和现代城市覆盖使现存遗址不能代表完整明初宫城。'),
    phase('restoration', '现代遗址保护展示', '当代', '遗址公园、博物馆和城市标识解释应天府，不复建完整明代宫城。', 2000, undefined, '展示性复原与明初原建筑分层记录。'),
  ], ['zhu-yousong'], ['ming'], ['ming-founded'], ['宫墙与宫殿基址', '道路、水系和城市轴线', '明故宫遗址公园展示'], '从今日南京观察明初应天府、明代迁都和南明城市继承。', '朱由崧属于南明阶段，此处作为明室城市继承的关联人物；明初原建筑和后世重建不能混同。', ['zizhi-tongjian', 'modern-geography-reference']),
  detail('yuan-shangdu-site', '今内蒙古自治区锡林郭勒盟正蓝旗元上都遗址保护区，宫城、皇城和外城边界可由考古遗址定位。', ['元两都制度与上都夏都', '蒙古草原交通、元朝皇权和多中心首都体系'], [
    phase('original', '都城营建', '1256—1271年', '忽必烈时期营建开平、上都，后成为元两都制度中的夏都和重要政治、礼仪中心。', 1256, 1271),
    phase('site', '宫城皇城遗址', '元代都城遗址', '宫城、皇城、外城、道路和祭祀空间以考古遗址形式完整呈现城市规划信息。', 1271, 1368),
    phase('restoration', '遗址保护展示', '现代世界文化遗产保护', '遗址保护区、博物馆和考古展示解释元上都，不重建完整元代宫殿。', 1900),
  ], ['kublai'], ['yuan'], ['yuan-founded', 'yuan-shangdu-built'], ['宫城与皇城城垣', '外城道路和城市分区', '草原交通与祭祀空间'], '观察元代多都制、草原帝国治理与今日内蒙古遗产保护的核心地点。', '元上都与大都共同构成两都体系，不能把上都视为元代唯一首都；现存遗址不等于宫殿建筑完整保存。', ['yuan-nationalities-history', 'yuan-li-bingzhong', 'modern-geography-reference']),
  detail('yuan-dadu-site', '今北京市及元大都城址公园、土城遗址一带；元大都宫城、城墙与城市轴线被后世北京城市层叠压。', ['元大都营建与元代两都体系', '城市轴线、宫城制度和北京历史城市的前身'], [
    phase('original', '营建与定名', '1267—1272年', '元廷在燕京旧城基础上启动大都营建，1272年定名大都；营建启动、定名与1271年建国号分别表达。', 1267, 1272),
    phase('site', '城址与城市轴线', '1272—1368年', '宫城、皇城、城墙、道路和中轴空间构成元大都城市规划层，现存多以考古遗迹、地名和城市公园线索辨识。', 1272, 1368, '元代宫城完整边界与各建筑层仍需结合考古分区，不能把后世北京建筑直接归入元大都。'),
    phase('restoration', '现代遗址保护展示', '当代', '元大都城址公园、土城遗址和北京城市历史展示解释元代城市空间，不复建完整宫城。', 2000, undefined, '现代公园、道路与展示设施属于保护和解释层，不等同于元代原构。'),
  ], ['kublai', 'liu-bingzhong'], ['yuan'], ['yuan-founded', 'yuan-dadu-built'], ['城墙与土城遗址', '宫城、道路和城市轴线考古线索', '元大都城址公园与北京城市历史展示'], '从今天的北京观察元大都营建、两都体系和后世北京城的空间继承。', '元大都与上都共同构成元代首都体系；现存北京城市空间是多朝代叠压结果，不能直接视作元代完整城市。', ['yuan-dadu-beijing-heritage', 'yuan-dadu-axis-unesco', 'yuan-dadu-liu-bingzhong-official']),
  detail('western-wei-changan-city-layer', '今陕西省西安市长安城遗址及关中历史城区考古研究范围；西魏城市层与隋唐长安城并非同一完整建筑层。', ['西魏长安政治中心', '北魏分裂后关中军政、宫城与城市空间'], [
    phase('original', '政治中心使用', '535—557年', '元宝炬在长安即位后，西魏以长安为政治中心，宇文泰主持的关中军政体系依托既有城市空间运作。', 535, 557),
    phase('site', '城市历史层', '西魏长安遗址层', '宫城、官署、道路和关中城市地理主要通过文献、考古叠压与隋唐长安遗址分层辨识。', 535, 557, '现有长安遗址的可见主体多属隋唐及后世，不能直接视作西魏原建筑。'),
    phase('restoration', '现代遗址展示', '当代城市考古', '遗址公园、博物馆和历史地图解释西魏长安，不重建未经确认的西魏宫城。', 2000, undefined, '现代展示设施只表达空间关系，不等同于西魏原构。'),
  ], ['yu-wen-tai'], ['wei_western'], ['western-wei-founded'], ['长安城遗址叠压层', '关中宫城与官署空间线索', '历史地图和考古展示'], '从今日西安观察西魏建政、宇文泰关中军政与北朝城市连续性。', '西魏遗址层与北魏、北周及隋唐城市层需要继续细分；现代西安市边界不能替代西魏长安城范围。', ['zizhi-tongjian', 'modern-geography-reference']),
  detail('northern-zhou-changan-city-layer', '今陕西省西安市长安城遗址及其关中城市考古研究范围；北周城市层依托长安历史空间作阶段性定位。', ['北周长安都城', '宇文氏军政整合、宫城制度与隋建立前的关中政治空间'], [
    phase('original', '都城使用', '557—581年', '北周承接西魏关中政治中心，以长安为都城，北周皇室和军政机构在此组织北方政权。', 557, 581),
    phase('site', '城市历史层', '北周长安遗址层', '宫城、官署、道路和城市叠压关系主要结合文献与隋唐长安考古资料分层理解。', 557, 581, '现存遗址很少能单独指认北周原构，不能把隋唐宫城直接替代北周建筑。'),
    phase('restoration', '现代遗址展示', '当代城市考古', '遗址保护、博物馆和历史地图解释北周长安，不复原完整北周宫城。', 2000, undefined, '展示性复原不代表北周原建筑连续留存。'),
  ], ['yuwen-yong'], ['zhou_northern'], ['sui-founded'], ['长安城遗址叠压层', '宫城与军政空间线索', '北周—隋政权转折的历史地图'], '从今日西安观察北周都城、宇文邕统治与隋受禅之间的城市连续性。', '北周建立节点与581年隋建立是不同事件；本节点将隋建立作为北周终结和城市阶段转换的关联事件，不将其误写为北周建立。', ['zizhi-tongjian', 'modern-geography-reference']),
  detail('xia-erlitou-archaeological-reference', '今河南省洛阳市偃师区二里头村附近二里头遗址保护与考古研究范围。', ['夏代传统纪年与二里头文化核心参照', '早期宫殿区、道路、青铜礼制和区域聚落网络'], [
    phase('original', '遗址形成', '约前2070—前1600年', '二里头遗址形成宫殿区、道路和礼制性物质文化，是研究夏代传统叙事与早期国家形成的重要考古参照。', -2070, -1600, '二里头文化与夏代国家的对应关系仍是考古学和历史学讨论问题。'),
    phase('site', '考古遗址', '二里头文化遗址层', '宫殿基址、道路、青铜器作坊和聚落遗迹以考古发掘与遗址保护形式保存。', -2070, -1600),
    phase('restoration', '现代遗址展示', '当代考古博物馆与遗址保护', '遗址博物馆、考古工作站和展示系统帮助理解空间格局，不复原已不可见的夏代宫城。', 2000, undefined, '现代展示建筑与早期遗址原构必须分层标注。'),
  ], ['yu-the-great'], ['xia_early'], ['xia-early-founded-eighth-batch'], ['宫殿区夯土基址', '道路与聚落遗迹', '青铜器作坊和考古展示'], '从今日偃师观察夏代传统纪年、早期国家形成与考古证据之间的关系。', '二里头遗址是高价值考古参照，但不能据此直接确认夏代国号、首都或逐年边界；传统人物禹也需与考古证据分层。', ['erlitou-official', 'china-chronology']),
  detail('shang-erlitou-archaeological-reference', '今河南省洛阳市偃师区二里头遗址及其邻近区域；该节点不等同于今河南安阳殷墟。', ['商代早期王权形成与夏商之际考古层', '都邑迁徙、青铜礼制与二里头—早商文化连续性讨论'], [
    phase('original', '早期考古层形成', '约前1600—前1500年', '二里头及邻近区域可作为观察夏商之际都邑、青铜礼制和王权形成的早期参照，但不是已确认的商代唯一都城。', -1600, -1500, '二里头文化晚期、早商文化和商王朝政治实体的对应关系仍有学术争议。'),
    phase('site', '考古遗址', '夏商之际遗址层', '宫殿区、道路、作坊与出土遗存以考古资料保存，为商早期历史提供间接而重要的空间证据。', -1600, -1500),
    phase('restoration', '现代遗址展示', '当代考古博物馆与遗址保护', '现代博物馆和遗址展示解释夏商之际考古文化，不把二里头直接复原为殷墟或商王宫城。', 2000, undefined, '展示性复原不能替代安阳殷墟等明确商代晚期遗址。'),
  ], ['wu-ding'], ['shang'], ['shang-founded-eighth-batch'], ['宫殿区与道路遗存', '青铜礼制和作坊遗迹', '夏商之际地层与考古展示'], '从今日偃师观察商代早期王权、都邑迁徙与考古文化对应关系，并与武丁时期殷墟研究区分。', '本节点采用二里头作为商早期考古参照，而非殷墟替代物；武丁属于商代较晚阶段，人物关联用于连接商王权与甲骨文证据，不表示其活动于二里头。', ['erlitou-official', 'china-chronology']),
  detail('western-zhou-fenghao-reference', '今陕西省西安市长安区沣河两岸丰镐遗址群及其考古研究范围，具体城址边界需按遗址分区理解。', ['西周丰镐、镐京与宗周政治空间', '周初克商、礼制、宗庙和关中分封网络'], [
    phase('original', '都邑营建与使用', '约前1046—前771年', '周克商后以关中丰镐为宗周核心，宫殿、宗庙、贵族墓葬和交通网络共同支撑西周王室秩序。', -1046, -771, '克商绝对年代与早期都邑范围存在不同研究口径。'),
    phase('site', '都邑遗址群', '西周丰镐考古层', '宫殿区、城址、墓葬、青铜器和道路线索以丰镐遗址群的考古调查与发掘形式保存。', -1046, -771),
    phase('restoration', '现代遗址展示', '当代考古保护与历史地图', '遗址保护、博物馆和历史地图解释丰镐，不重建完整西周宫城。', 2000, undefined, '现代展示工程不能视为西周原建筑连续留存。'),
  ], ['zhou-wu', 'ji-chang'], ['zhou_western'], ['western-zhou-founded-eighth-batch'], ['丰镐都邑遗址线索', '宗庙、宫殿与贵族墓葬', '青铜器铭文和分封秩序参照'], '从今日西安观察西周王朝、丰镐都邑与周初礼制国家形成。', '丰镐遗址群包含多个遗址点和复杂年代层，不能用单一坐标代表全部西周都邑；青铜器铭文和后世文献需相互校勘。', ['zizhi-tongjian', 'china-chronology', 'western-zhou-national-museum', 'modern-geography-reference']),
  detail('mongol-karakorum-city-site', '今蒙古国前杭爱省哈拉和林遗址及鄂尔浑河谷文化景观，古城范围与现代行政区不重合。', ['蒙古汗国后期哈拉和林政治中心', '草原都城、宫殿、宗教建筑与欧亚交通网络'], [
    phase('original', '都城营建与使用', '约1220—1271年', '窝阔台时期将哈拉和林发展为蒙古汗国的重要固定政治中心，宫殿、城郭和跨区域使节网络在此汇聚。', 1220, 1271, '蒙古汗国早期汗廷具有移动性，哈拉和林成为固定城市中心的具体营建阶段需与营地政治区分。'),
    phase('site', '城市考古遗址', '13世纪蒙古都城遗址', '城址、宫殿基址、道路、宗教建筑和手工业遗迹以考古遗址形式保存。', 1220, 1271),
    phase('restoration', '现代遗址保护展示', '当代鄂尔浑河谷文化景观保护', '考古保护区、博物馆和遗址标识解释哈拉和林，不复建完整蒙古宫城。', 1900, undefined, '现代展示建筑与蒙古汗国原构必须分层标注。'),
  ], ['temujin'], ['mongol'], ['mongol-founded', 'mongol-karakorum-fixed-center'], ['城墙与城市分区遗迹', '宫殿和宗教建筑基址', '鄂尔浑河谷交通与碑刻文化景观'], '从今日哈拉和林观察蒙古汗国由移动汗廷走向固定城市中心的过程，并连接元代都城体系。', '1206年蒙古汗国形成时不等于已有成熟固定首都；哈拉和林是后期核心城市，不能将其直接回填为全期唯一首都，也不能用其遗址范围推导蒙古帝国疆域。', ['china-chronology', 'capital-history-reference', 'modern-geography-reference']),
  detail('later-jin-hetu-ala-city-site', '今辽宁省抚顺市新宾满族自治县赫图阿拉城遗址保护区，古城范围与现代县域不重合。', ['后金1616年建政与赫图阿拉早期都城', '女真八旗组织、宫城、城防与东北亚政治网络'], [
    phase('original', '都城营建与使用', '1616—1625年', '努尔哈赤建立后金后，以赫图阿拉作为早期政治中心，宫殿、城防和八旗政务空间在此展开。', 1616, 1625),
    phase('site', '故城遗址', '后金早期城市历史层', '城墙、宫殿基址、衙署与相关遗迹以故城遗址和考古展示形式保存。', 1616, 1625, '赫图阿拉早期都城与后金迁都辽阳、盛京后的政治中心应分阶段记录。'),
    phase('restoration', '遗址保护展示', '当代遗址保护与历史展示', '故城保护区、博物馆和展示性建筑帮助理解后金早期都城，不等同于原建筑连续留存。', 1900, undefined, '现代复建景观与后金原构不能混同。'),
  ], ['nurhaci'], ['later_jin'], ['later-jin-founded'], ['内外城城垣', '宫殿、衙署和门址遗迹', '八旗政治与女真都城展示空间'], '从今日新宾观察后金建政、努尔哈赤的都城选择与清前史的东北亚政治空间。', '赫图阿拉是后金早期都城，1625年后政治中心转移；后金、清和入关后的北京阶段不能合并成一座连续首都。', ['china-chronology', 'capital-history-reference', 'modern-geography-reference']),
  detail('qing-shengjing-palace-city-site', '今辽宁省沈阳市沈阳故宫及沈阳历史城区，盛京宫城范围与现代城市边界不重合。', ['清入关前盛京宫殿与政治中心', '后金迁都后至清入关前的宫城制度、国家仪式与东北亚交通'], [
    phase('original', '宫城营建与使用', '1625—1644年', '后金迁都后以盛京为政治中心，宫城、皇城和国家仪式空间逐步形成，1636年改国号清后继续使用。', 1625, 1644, '1625年后金迁都盛京与1636年清国号建立是连续但不同的历史阶段。'),
    phase('site', '宫殿与城市遗产', '清入关前盛京历史层', '沈阳故宫宫殿、城郭与城市格局保存了清入关前国家制度和宫廷生活的实物线索。', 1625, 1644),
    phase('restoration', '历代保护与现代展示', '清代后期至当代', '宫殿建筑经历清代维修及现代保护，现为博物馆与世界文化遗产展示空间。', 1644, undefined, '现存建筑包含历代维修构件，不能将今日全部构件视为1625年原状。'),
  ], ['hongtaiji', 'shunzhi'], ['qing', 'later_jin'], ['qing-founded', 'qing-enters-pass'], ['宫殿建筑群与院落', '城郭与宫门遗存', '国家仪式、档案与宫廷生活展示'], '从今日沈阳观察后金—清国号—入关前的国家连续性，并与北京清代宫城阶段比较。', '盛京是清入关前政治中心，1644年清廷迁入北京后首都体系改变；后金与清的关联是政权阶段连续，不应抹平国号和制度转折。', ['china-chronology', 'capital-history-reference', 'modern-geography-reference']),
  detail('republic-nanjing-presidential-palace-site', '今江苏省南京市玄武区总统府及其周边近代城市历史空间，建筑群经历多政权阶段使用。', ['1912年中华民国临时政府南京建政', '近代共和制度、总统府建筑与南京政治中心'], [
    phase('original', '共和政府使用', '1912年起', '南京总统府建筑群作为临时政府及后续南京政治机构的办公与仪式空间，承载近代共和政权建立后的城市政治实践。', 1912, 1927),
    phase('site', '近代建筑群', '清末至民国历史层', '门楼、办公建筑、园林和档案展示空间保存近代政权在南京活动的物质线索。', 1912, 1949, '建筑群并非只属于1912年临时政府，清末、北洋与国民政府阶段需分层。'),
    phase('restoration', '现代保护展示', '当代博物馆与遗址保护', '现址作为中国近代史遗址博物馆开放，经过保护修缮与展示改造。', 1980, undefined, '现代展陈和修缮不等同于民国初年原始办公状态。'),
  ], ['sun-yat-sen'], ['republic'], ['republic-founded'], ['办公建筑与门楼', '园林、档案与历史展陈', '南京近代政治空间格局'], '从今日南京观察中华民国建立、临时政府制度与近代城市政治空间。', '中华民国大陆时期的政治中心经历南京、北京及战时重庆等阶段，南京总统府只能代表建政及部分南京阶段，不能代表整个时期的唯一首都。', ['china-chronology', 'capital-history-reference', 'modern-geography-reference']),
  detail('prc-tiananmen-ceremony-site', '今北京市东城区天安门广场及其周边国家政治空间，现代广场格局与1949年现场并非完全相同。', ['1949年中华人民共和国成立典礼', '现代国家仪式、北京政治中心与公共历史记忆'], [
    phase('original', '成立典礼历史事件', '1949年10月1日', '中央人民政府成立典礼在北京天安门广场举行，形成中华人民共和国国家政治记忆的重要地点。', 1949, 1949),
    phase('site', '城市政治空间', '1949年至今', '天安门城楼、广场、纪念设施及周边国家机构共同构成可识别的现代政治城市景观。', 1949),
    phase('reconstruction', '广场扩建与城市改造', '20世纪50年代以来', '广场经历空间扩展、道路和纪念设施建设，今日形态是多次城市建设叠加的结果。', 1950, 1999, '今日广场尺度、设施和周边道路不能直接还原为1949年现场。'),
    phase('restoration', '现代保护与公共展示', '当代', '相关建筑、纪念设施和公共空间持续承担国家仪式与历史教育功能。', 2000),
  ], ['mao-zedong'], ['prc'], ['prc-founded'], ['天安门城楼与广场空间', '国家仪式和纪念设施', '北京中轴线及现代政治城市景观'], '从今日北京观察中华人民共和国成立、现代国家仪式与首都城市空间的形成。', '1949年成立典礼是政权建立事件，不等于当日完成所有地区的政治整合；广场后续改造也不能被误作1949年原貌。', ['china-chronology', 'capital-history-reference', 'modern-geography-reference']),
  detail('wunvshan-goguryeo-early-capital-site', '今辽宁省本溪市桓仁满族自治县五女山城遗址保护范围；山城、河谷与现代县域不是同一边界。', ['高句丽早期纥升骨城与五女山山城', '山城防御、王权中心迁移与东北亚早期国家化'], [
    historicalPhase('original', '早期中心形成', '前37年至约2年', '传统纪年将纥升骨城与高句丽早期王权联系起来；五女山山城所处山地环境体现早期中心对防御、交通与河谷资源的利用。', -37, 2, '纥升骨城、五女山山城与传统建国地点的对应关系需结合文献、考古分期理解，不能把传统建国年等同于遗址全部建成年代。'),
    historicalPhase('site', '山城遗址', '高句丽早期历史层', '城墙、山地防御设施、蓄水与居住活动线索以考古遗址形式保存，遗址应与后续国内城体系区分。', -37, 2),
    historicalPhase('restoration', '现代保护展示', '当代遗址保护', '五女山城以遗址保护、登山线路和说明展示帮助理解高句丽早期政治空间，不复原完整早期王城。', 2000, undefined, '现代步道、标识和保护设施不等同于高句丽原构，遗址范围也不能推导政权疆域。'),
  ], ['jumong', 'yuri-goguryeo'], ['goguryeo'], ['goguryeo-founded'], ['山城城墙与防御设施', '山地交通和河谷观察空间', '考古遗址保护与展示系统'], '从今日桓仁观察高句丽传统建国、早期王权中心与国内城迁移之间的连续而分层的历史过程。', '前37年是传统建国纪年，不能证明五女山所有遗存均在该年完成；纥升骨城与五女山的名称、年代及早期中心性质需与国内城阶段区分。', ['zizhi-tongjian', 'china-chronology', 'capital-history-reference']),
  detail('chu-shouchun-city-site', '今安徽省淮南市寿县寿春古城及其周边考古区域；楚晚期城址与现代寿县行政边界不完全重合。', ['楚国晚期迁都寿春后的淮河政治中心', '楚国由江汉向江淮转移、秦楚竞争与晚期都城空间'], [
    historicalPhase('original', '晚期都城形成', '前278年后', '郢都失守后，楚国政治中心转向寿春；寿春成为楚国晚期王权、军政和淮河交通网络的重要节点。', -278, -223, '迁都过程、寿春城具体范围与楚国晚期宫城分区需按文献和考古资料分层，不能将郢都遗存直接移植到寿春。'),
    historicalPhase('site', '城址与城市考古层', '战国晚期', '古城城垣、道路、水系和相关遗存以考古调查、保护范围和历史地理研究形式保存。', -278, -223),
    historicalPhase('restoration', '现代保护展示', '当代古城保护', '寿县古城及相关遗址通过城墙保护、博物馆和地方历史展示解释楚国晚期城市空间，不重建完整楚王宫城。', 1900, undefined, '现存古城建筑、后世城墙和现代展示设施需要与战国楚城址分层标注。'),
  ], ['chu-we-wang'], ['chu_warring'], ['chu-warring-founded-eighth-batch'], ['古城城垣与城市格局线索', '淮河交通与区域地理', '古城保护和博物馆展示'], '从今日寿县观察楚国晚期迁都、江淮政治网络与秦楚竞争，补充郢都之外的楚国首都视角。', '前403年楚国战国分期事件是政权观察入口，不是寿春迁都事件；楚威王是后续战国人物，人物关联用于观察楚国大国阶段，不把其活动前推为寿春建都者。', ['zizhi-tongjian', 'china-chronology', 'capital-history-reference']),
  detail('southern-liang-ledu-city-site', '今青海省海东市乐都区及其南凉文化展示关联空间；候选古城位置与现代城区边界不等同。', ['南凉399年迁都乐都的阶段性政治中心', '河湟绿洲、部众迁徙、军政网络与十六国区域政权'], [
    historicalPhase('original', '迁都与政治中心', '399—414年', '《太平御览》所引南凉材料记载秃发乌孤时期徙于乐都；乐都此后承接南凉后期政治、军政与河湟交通功能。', 399, 414, '文献可支持乐都作为阶段性政治中心，但不能仅凭文献把今日某一处建筑认定为南凉原构。', ['taiping-yulan-southern-liang-ledu', 'jinshu-vol126-tufa-wugu']),
    historicalPhase('site', '候选城址与城市历史层', '南凉时期', '今日乐都的南凉文化展示与地方历史空间提供城市记忆入口；具体古城遗址、城垣和宫城分区仍需考古报告逐项比定。', 399, 414, '候选历史层不等同于已经完成考古定名的遗址。', ['jinshu-vol126-tufa-wugu', 'mct-ledu-southern-liang']),
    historicalPhase('restoration', '现代文化展示', '当代', '地方文化展示、旅游线路和历史地图帮助理解南凉乐都阶段，但现代设施不视为南凉建筑遗存。', 2000, undefined, '现代展示空间与南凉原城、原建筑严格分层。', ['mct-ledu-southern-liang']),
  ], ['tufa-wugu', 'tufa-rutan', 'qifu-chipan'], ['southern_liang', 'western_qin'], ['southern-liang-founded-397', 'southern-liang-moves-ledu', 'southern-liang-ended-414'], ['乐都河湟城市空间', '南凉迁都文献记忆', '地方文化展示与候选遗址线索'], '从今日乐都观察南凉由西平转入乐都的政治中心变化、414年政权转换，并理解河湟政权的流动性与城市遗产证据边界。', '现有证据足以关联南凉—乐都的历史层和今日文化展示，但不足以确认某一现存建筑为南凉原构；414年是政治转换节点，不意味着候选城址或现代乐都城市层消失。', ['taiping-yulan-southern-liang-ledu', 'jinshu-vol126-tufa-wugu', 'mct-ledu-southern-liang']),
];

const detailById = new Map(details.map((heritageDetail) => [heritageDetail.heritageId, heritageDetail]));

export function getHeritageDetail(heritageId: string): HeritageDetail | undefined {
  return detailById.get(heritageId);
}

export const heritageDetails = details;
