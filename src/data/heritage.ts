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
  { id: 'changle-palace-site', name: '长乐宫遗址', placeId: 'changan', type: 'palace', constructionFrom: -200, modernStatus: 'archaeological-site', description: '汉长安城东部宫城遗址，连接汉初宫殿建设与皇帝日常政治空间。', sourceIds: ['zizhi-tongjian', 'modern-geography-reference'] },
  { id: 'taiji-palace-site', name: '太极宫遗址', placeId: 'changan', type: 'palace', constructionFrom: 582, modernStatus: 'archaeological-site', description: '隋唐宫城核心正殿空间遗址，反映都城朝会与中央政治仪式。', sourceIds: ['zizhi-tongjian', 'modern-geography-reference'] },
  { id: 'hanguang-gate-site', name: '含光门遗址', placeId: 'changan', type: 'city-site', constructionFrom: 582, modernStatus: 'archaeological-site', description: '隋唐长安城南部城门遗址，关联城墙、门道和城市道路交通体系。', sourceIds: ['modern-geography-reference'] },
  { id: 'mingde-gate-site', name: '明德门遗址', placeId: 'changan', type: 'city-site', constructionFrom: 582, modernStatus: 'archaeological-site', description: '唐长安城南墙重要城门遗址，体现城市中轴、礼制与城外交通联系。', sourceIds: ['zizhi-tongjian', 'modern-geography-reference'] },
  { id: 'ximing-temple-site', name: '西明寺遗址', placeId: 'changan', type: 'temple', constructionFrom: 618, modernStatus: 'uncertain', description: '唐长安寺院与译经网络的约址，反映佛教传播和中外文化交流。', sourceIds: ['modern-geography-reference'] },
  { id: 'qinglong-temple-site', name: '青龙寺遗址', placeId: 'changan', type: 'temple', constructionFrom: 582, modernStatus: 'archaeological-site', description: '长安东部寺院遗址与现代纪念空间，关联唐代密教传播和东亚交流。', sourceIds: ['modern-geography-reference'] },
  { id: 'huaqing-palace', name: '华清宫遗址与温泉宫苑', placeId: 'changan', type: 'palace', constructionFrom: 618, modernStatus: 'extant', description: '骊山北麓的关中宫苑遗产，保存温泉环境与历代宫苑叠合的历史记忆。', sourceIds: ['modern-geography-reference'] },
  { id: 'maoling', name: '茂陵', placeId: 'changan', type: 'tomb', constructionFrom: -139, modernStatus: 'archaeological-site', description: '汉武帝帝陵及关中陵区遗址，展示西汉帝陵制度、陵邑和礼制空间。', sourceIds: ['modern-geography-reference'] },
  { id: 'du-ling', name: '杜陵', placeId: 'changan', type: 'tomb', constructionFrom: -74, modernStatus: 'archaeological-site', description: '汉宣帝帝陵遗址，连接西汉晚期长安南部城市与帝陵空间。', sourceIds: ['modern-geography-reference'] },
  { id: 'han-changling', name: '汉长陵', placeId: 'changan', type: 'tomb', constructionFrom: -195, modernStatus: 'archaeological-site', description: '汉高祖刘邦帝陵，位于长安北部五陵原，体现汉初帝陵秩序。', sourceIds: ['zizhi-tongjian', 'modern-geography-reference'] },
];

export const heritageById = Object.fromEntries(heritageAssets.map((asset) => [asset.id, asset]));
