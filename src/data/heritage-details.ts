export interface HeritageDetail {
  heritageId: string;
  modernLocation: string;
  historicalAssociations: string[];
  presentDayValue: string;
  sourceIds: string[];
  uncertaintyNote: string;
}

const details: HeritageDetail[] = [
  { heritageId: 'han-changan-city-site', modernLocation: '今西安市未央区及其周边，古城范围与现代行政区不重合。', historicalAssociations: ['西汉长安城的宫城、外郭城与城市道路体系', '汉帝国政治中心与都城制度'], presentDayValue: '考古遗址公园与城市历史教育节点。', sourceIds: ['modern-geography-reference'], uncertaintyNote: '遗址范围、地层年代与古今城市边界需以考古报告为准。' },
  { heritageId: 'weiyang-palace-site', modernLocation: '今西安市未央区汉长安城遗址内。', historicalAssociations: ['西汉中央宫殿区', '汉代帝国礼制与宫城空间'], presentDayValue: '遗址保护区，主要以考古展示和地面标识关联历史。', sourceIds: ['modern-geography-reference'], uncertaintyNote: '宫殿具体建筑复原不应等同于完整历史原貌。' },
  { heritageId: 'tang-changan-city-site', modernLocation: '今西安城市及其东南、北部遗址分布区。', historicalAssociations: ['隋大兴城规划', '唐长安城坊市、宫城与城市道路'], presentDayValue: '城市考古、遗址保护和历史地理研究的重要基础。', sourceIds: ['zizhi-tongjian', 'modern-geography-reference'], uncertaintyNote: '隋唐长安城与现代西安城区不是同一边界，点位仅作学习导航。' },
  { heritageId: 'daming-palace-site', modernLocation: '今西安市新城区北部，大明宫国家遗址公园一带。', historicalAssociations: ['唐代宫城北部扩展', '唐太宗以后长安政治空间'], presentDayValue: '国家考古遗址公园与城市公共文化空间。', sourceIds: ['modern-geography-reference'], uncertaintyNote: '现存展示建筑、复原构件与唐代原建筑应分层标注。' },
  { heritageId: 'big-wild-goose-pagoda', modernLocation: '今西安市雁塔区大慈恩寺内。', historicalAssociations: ['唐代佛教传播', '玄奘译经传统与大慈恩寺空间'], presentDayValue: '现存历史建筑和西安城市标志性文化景观。', sourceIds: ['modern-geography-reference'], uncertaintyNote: '塔体历代修缮和重建使“唐代原状”与今日所见不能直接画等号。' },
];

const detailById = new Map(details.map((detail) => [detail.heritageId, detail]));

export function getHeritageDetail(heritageId: string): HeritageDetail | undefined {
  return detailById.get(heritageId);
}

export const heritageDetails = details;
