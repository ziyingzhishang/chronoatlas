import type { HeritageAsset } from '../domain/types';

export const heritageAssets: HeritageAsset[] = [
  { id: 'han-changan-city-site', name: '汉长安城遗址', placeId: 'changan', type: 'city-site', constructionFrom: -202, constructionTo: 23, modernStatus: 'archaeological-site', description: '西汉长安城遗址，保留城址、宫殿区与道路等城市考古信息。', sourceIds: ['zizhi-tongjian', 'modern-geography-reference'] },
  { id: 'weiyang-palace-site', name: '未央宫遗址', placeId: 'changan', type: 'palace', constructionFrom: -200, modernStatus: 'archaeological-site', description: '汉长安城重要宫殿遗址，与汉代帝国宫城制度相关。', sourceIds: ['modern-geography-reference'] },
  { id: 'daming-palace-site', name: '大明宫遗址', placeId: 'changan', type: 'palace', constructionFrom: 634, modernStatus: 'archaeological-site', description: '唐长安城北部重要宫殿遗址，反映唐代宫城与都城格局。', sourceIds: ['modern-geography-reference'] },
  { id: 'xingqing-palace-site', name: '兴庆宫遗址', placeId: 'changan', type: 'palace', constructionFrom: 714, modernStatus: 'archaeological-site', description: '唐长安城东部宫苑遗址，与玄宗时期政治生活相关。', sourceIds: ['modern-geography-reference'] },
  { id: 'tang-changan-city-site', name: '隋唐长安城遗址', placeId: 'changan', type: 'city-site', constructionFrom: 582, constructionTo: 907, modernStatus: 'archaeological-site', description: '大兴城及唐长安城遗址，体现隋唐都城规划和城市空间。', sourceIds: ['zizhi-tongjian', 'modern-geography-reference'] },
  { id: 'xiao-yan-ta', name: '小雁塔', placeId: 'changan', type: 'temple', constructionFrom: 707, modernStatus: 'extant', description: '唐代荐福寺相关佛教建筑，今天仍是西安城市历史景观的一部分。', sourceIds: ['modern-geography-reference'] },
  { id: 'big-wild-goose-pagoda', name: '大雁塔', placeId: 'changan', type: 'temple', constructionFrom: 652, modernStatus: 'extant', description: '唐代大慈恩寺塔，与玄奘译经及佛教传播传统相关。', sourceIds: ['modern-geography-reference'] },
  { id: 'hanyangling', name: '汉景帝阳陵', placeId: 'changan', type: 'tomb', constructionFrom: -157, modernStatus: 'archaeological-site', description: '西汉帝陵与陵邑体系遗址，展示汉代都城周边的陵墓空间。', sourceIds: ['modern-geography-reference'] },
  { id: 'qianling', name: '乾陵', placeId: 'changan', type: 'tomb', constructionFrom: 684, modernStatus: 'extant', description: '唐高宗与武则天合葬陵墓，位于长安都城西北方向的关中陵区。', sourceIds: ['modern-geography-reference'] },
  { id: 'xian-beilin', name: '西安碑林', placeId: 'changan', type: 'inscription', constructionFrom: 1087, modernStatus: 'extant', description: '后世保存并展示碑刻的城市文化遗产，可作为唐代长安书写文化的延伸观察点。', sourceIds: ['modern-geography-reference'] },
];

export const heritageById = Object.fromEntries(heritageAssets.map((asset) => [asset.id, asset]));
