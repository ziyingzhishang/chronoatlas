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
    phase('original', '原建筑', '652年始建', '大雁塔始建于唐高宗时期，与玄奘主持的大慈恩寺译经活动相关。', 652),
    phase('reconstruction', '后世重建', '唐至明清多次修缮', '塔体在后世经历修缮和结构变化，今日形制不能简单视作652年原状。', 700, 1700, '历次修缮的具体范围和年代需结合建筑史与维修档案。'),
    phase('restoration', '现代复原', '近现代保护维修', '现代保护工程保持塔体和寺院空间的可识别性，未将整座建筑重建为唐代新作。', 1900),
  ], ['xuanzang', 'li-shimin'], ['tang'], ['tang-founded', 'xuanzang-translations'], ['砖塔主体', '塔院空间', '历代题刻与维修痕迹'], '现存历史建筑和西安城市标志性文化景观。', '塔体历代修缮和重建使“唐代原状”与今日所见不能直接画等号。'),
  detail('xingqing-palace-site', '今西安市碑林区兴庆宫公园一带。', ['唐长安城东部宫苑', '玄宗时期的宫廷生活与政治空间'], [
    phase('original', '原建筑', '8世纪前期', '兴庆宫由旧宅扩建为宫苑，是唐玄宗时期长安东部的重要宫廷空间。', 714, 755),
    phase('site', '遗址', '宫苑遗址与城市公园', '原有宫苑建筑多已不存，历史空间通过遗址信息和文献研究辨识。', 755),
    phase('reconstruction', '后世重建', '20世纪城市公园建设', '现代公园沿用“兴庆宫”名称并重建部分景观，但不是唐代宫苑的连续留存。', 1950, 1999),
    phase('restoration', '现代复原', '当代展示景观', '园内景观以纪念和展示为主，需与唐代原宫殿区分。', 2000),
  ], ['li-shimin'], ['tang'], ['tang-founded', 'an-lushan-rebellion'], ['宫苑范围的历史记忆', '现代园林水系', '展示性建筑与题刻'], '城市公园与唐代宫苑记忆的叠合地点。', '现存公园景观与唐代宫苑的对应关系需要逐项考古和文献核验。'),
  detail('xiao-yan-ta', '今西安市碑林区荐福寺旧址一带。', ['唐代荐福寺佛教建筑', '长安城南部寺院与佛教传播'], [
    phase('original', '原建筑', '707年始建', '小雁塔始建于唐代荐福寺，作为长安佛教建筑群的一部分。', 707),
    phase('reconstruction', '后世重建', '唐以后历次修缮', '塔体和寺院在地震、风雨与历代维修中持续变化。', 800, 1900),
    phase('restoration', '现代复原', '近现代保护维修', '现代保护以加固和保留塔体为主，不将维修表面视作唐代原构。', 1900),
  ], ['xuanzang', 'li-shimin'], ['tang'], ['tang-founded', 'xuanzang-translations'], ['砖塔主体', '塔身开裂与维修痕迹', '寺院遗址环境'], '现存唐代佛教建筑与西安博物馆相关展示空间。', '小雁塔始建年代、维修阶段和现存构件的对应关系应以建筑考古资料为准。'),
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
    phase('original', '原建筑', '唐宋以来碑刻陆续形成', '碑刻来自不同年代和地点，不能视为同一时期建造的单体建筑。', 700, 1087, '碑刻原始位置和刻立年代需逐件核对。'),
    phase('reconstruction', '后世重建', '1087年后迁置与扩建', '碑林以保存、迁置和编次碑刻为核心，空间布局经历后世调整。', 1087, 1900),
    phase('restoration', '现代复原', '现代博物馆保护', '现代馆舍和保护设施服务于碑刻保存与展示，不等同于唐代长安原有建筑。', 1900),
  ], ['li-shimin'], ['tang'], ['tang-founded', 'xuanzang-translations'], ['碑刻与墓志', '碑廊与石刻陈列', '后世编次和保护设施'], '保存、研究和展示碑刻的城市文化遗产。', '碑林的收藏迁移、碑刻原址和后世编次不能简单还原为单一历史时刻。'),
  detail('changle-palace-site', '今西安市未央区汉长安城遗址东南部。', ['西汉东部宫城', '长安城宫殿区与皇帝日常政治空间'], [
    phase('original', '原建筑', '前200年前后', '长乐宫是汉长安城早期重要宫殿区之一，与汉初宫城建设相关。', -200),
    phase('site', '遗址', '汉长安城宫殿遗址', '宫殿台基和夯土遗迹以考古遗址形式保存。', -200, 9),
    phase('restoration', '现代复原', '遗址标识展示', '现代主要通过台基保护、标识和研究图示呈现，不重建完整宫殿。', 2000),
  ], ['liu-bang', 'wang-mang'], ['han_western', 'xin'], ['han-imperial-accession', 'qin-unification'], ['夯土台基', '宫殿区遗迹', '遗址分区标识'], '汉长安城遗址保护与汉初宫城研究节点。', '长乐宫具体建筑布局和后世沿革须以发掘资料区分，不能用展示图复原全部原貌。'),
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
    phase('original', '原建筑', '唐代', '西明寺是唐长安城重要寺院之一，与译经、僧侣往来和国家佛教活动相关。', 618, 907),
    phase('site', '遗址', '寺院遗址与文献地点', '寺院整体建筑已不存，位置和空间主要结合文献、考古与城市格局研究。', 907),
    phase('restoration', '现代复原', '研究图示与纪念展示', '现代以标识和研究性复原图解释寺院网络，不宣称完整复建原寺。', 2000, undefined, '具体院落、塔院和殿址的对应关系仍有不确定性。'),
  ], ['xuanzang', 'li-shimin'], ['tang'], ['tang-founded', 'xuanzang-translations'], ['文献记载的寺院位置', '相关译经传统', '现代研究图示'], '唐长安佛教、译经和国际交流的研究节点。', '寺院具体位置和建筑布局不能仅凭后世传说确定，现代标注为约址。'),
  detail('qinglong-temple-site', '今西安市雁塔区青龙寺遗址及其周边。', ['唐代密教传播', '长安东南部寺院与东亚佛教交流'], [
    phase('original', '原建筑', '隋唐时期', '青龙寺是长安东部重要寺院，与密教僧侣和跨区域佛教交流相关。', 582, 907),
    phase('site', '遗址', '寺院遗址', '原寺院建筑多不存，遗址范围和相关出土信息构成现代理解基础。', 907),
    phase('reconstruction', '后世重建', '20世纪纪念性建设', '后世纪念空间沿用青龙寺名称并重建局部建筑，不等同于唐代寺院原貌。', 1900, 1999),
    phase('restoration', '现代复原', '当代文化展示', '现代建筑和园林用于纪念、展示与交流，历史原构和现代复建分层呈现。', 2000),
  ], ['xuanzang', 'li-shimin'], ['tang'], ['tang-founded', 'xuanzang-translations'], ['寺院遗址信息', '纪念性建筑', '佛教交流展示'], '东亚佛教交流和西安城市文化记忆节点。', '唐代寺院原址、后世纪念建筑和现代园林不能视为同一组连续建筑。'),
  detail('huaqing-palace', '今西安市临潼区骊山北麓，位于古长安城以东。', ['唐代温泉宫苑', '帝王巡幸、宫廷生活与关中交通'], [
    phase('original', '原建筑', '唐代扩建', '华清宫沿骊山温泉发展为宫苑，与唐代帝王巡幸和长安东行交通相关。', 618, 907),
    phase('site', '遗址', '宫苑遗址与温泉遗存', '部分遗址、温泉和山麓环境保留了宫苑地点的历史线索。', 907),
    phase('reconstruction', '后世重建', '历代宫观与园林变化', '宫苑在后世经历多次毁损和重建，现存景观并非唐代连续遗存。', 1000, 1900, '各时期建筑叠压关系需以考古和维修记录核验。'),
    phase('restoration', '现代复原', '现代景区展示', '现代景区复原部分宫苑意象，服务于公众展示和旅游使用。', 1900),
  ], ['li-shimin', 'li-yuan'], ['tang'], ['tang-founded', 'an-lushan-rebellion'], ['温泉环境', '骊山宫苑格局', '现代展示建筑'], '唐代关中宫苑、温泉文化和现代历史景区的叠合地点。', '现存景区建筑与唐代华清宫的对应关系不能仅由名称或传统叙事确定。'),
  detail('maoling', '今陕西省兴平市东北部，位于西汉长安城西北陵区。', ['汉武帝帝陵', '西汉帝陵制度、陵邑与关中礼制空间'], [
    phase('original', '原建筑', '前139年后营建', '茂陵作为汉武帝帝陵，配有陵园、陪葬和陵邑相关空间。', -139),
    phase('site', '遗址', '西汉帝陵遗址', '封土、陵园和相关遗迹保留了帝陵区的历史地貌信息。', -139, 9),
    phase('restoration', '现代复原', '遗址保护与博物馆展示', '现代保护以封土、石刻和遗址环境为主，展示性建筑单独标注。', 1900),
  ], ['liu-bang', 'wang-mang'], ['han_western'], ['han-imperial-accession'], ['陵墓封土', '陵园范围', '陪葬与陵邑相关遗迹'], '西汉帝陵考古和关中历史地理研究节点。', '陵园范围、陪葬关系和陵邑行政含义不能仅凭封土规模推断。'),
  detail('du-ling', '今西安市雁塔区曲江一带，古今城市边界已经发生变化。', ['汉宣帝帝陵', '西汉晚期帝陵与长安南部空间'], [
    phase('original', '原建筑', '前74年后营建', '杜陵是汉宣帝刘询的帝陵，陵园与长安南部城市、陵区相连。', -74),
    phase('site', '遗址', '西汉帝陵遗址', '封土和陵园遗迹以考古和地面遗存形式保存。', -74, 9),
    phase('restoration', '现代复原', '遗址保护展示', '现代以封土保护、环境整治和说明牌展示为主，不复原完整陵园建筑。', 2000),
  ], ['liu-bang', 'wang-mang'], ['han_western'], ['han-imperial-accession'], ['封土', '陵园遗存', '现代保护环境'], '西汉晚期帝陵和西安南部历史地理参照点。', '杜陵与现代曲江城市景观的边界不能直接当作汉代陵园边界。'),
  detail('han-changling', '今咸阳市渭城区五陵原一带，属于长安北部帝陵区。', ['汉高祖刘邦帝陵', '汉初帝陵与长安北部陵区秩序'], [
    phase('original', '原建筑', '前195年后营建', '长陵是汉高祖刘邦帝陵，位于长安北部五陵原帝陵区。', -195),
    phase('site', '遗址', '西汉帝陵遗址', '陵墓封土及陵园环境构成现存主要遗迹。', -195, 9),
    phase('restoration', '现代复原', '文物保护展示', '现代对封土和陵区环境进行保护，不将后世整治视为汉初原建筑。', 1900),
  ], ['liu-bang'], ['han_western'], ['han-imperial-accession'], ['封土与陵区地貌', '帝陵区空间关系', '保护性说明设施'], '汉初帝陵与关中帝陵制度的历史参照点。', '帝陵封土、陵园和陵邑的具体边界需要区分文献记载与考古实测。'),
  detail('xian-city-wall', '今西安市中心明城墙及其城门、护城河一带。', ['明代西安府城', '传统城市防御、街巷和现代城市地标'], [
    phase('original', '原建筑', '明代扩建', '现存城墙基础和主要形制形成于明代西安府城建设。', 1374, 1378),
    phase('site', '遗址', '明城墙历史遗存', '城墙、城门和护城河构成仍在使用和保护中的城市遗产。', 1374, 1911),
    phase('reconstruction', '后世重建', '明清至近代维修', '城墙在明清及近现代经历多次维修、补砌和功能变化。', 1400, 1949, '具体砖石和墙体层位不能一概视为明初原构。'),
    phase('restoration', '现代复原', '20世纪后期以来保护维修', '现代修缮恢复连续城市景观并改善安全使用条件，维修段落需单独记录。', 1980),
  ], ['li-shimin'], ['ming'], ['five-dynasties'], ['城墙与城门', '护城河遗迹', '连续城市步道与展示系统'], '仍具城市边界识别和公共文化使用功能的历史城墙。', '现存城墙并非每一段都保留同等年代的原构，修缮段和现代补配材料需区分。', ['china-chronology', 'modern-geography-reference']),
];

const detailById = new Map(details.map((heritageDetail) => [heritageDetail.heritageId, heritageDetail]));

export function getHeritageDetail(heritageId: string): HeritageDetail | undefined {
  return detailById.get(heritageId);
}

export const heritageDetails = details;
