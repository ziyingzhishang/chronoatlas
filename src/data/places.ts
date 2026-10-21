import type { Place } from '../domain/types';

export const places: Place[] = [
  { id:'erlitou', historicalName:'二里头', aliases:['斟鄩（研究观点）'], modernName:'二里头村附近', modernAdministrativeUnit:'河南省洛阳市偃师区', longitude:112.70, latitude:34.70, validFrom:-2070, validTo:-1600, notes:'二里头文化核心近似定位；不表示夏代国家边界。', sourceIds:['erlitou-official'] },
  { id:'wan_nanyang', historicalName:'宛城', aliases:['宛'], modernName:'南阳市城区', modernAdministrativeUnit:'河南省南阳市', longitude:112.53, latitude:32.99, validFrom:22, validTo:25, notes:'更始政权早期中心的近似定位。', sourceIds:['gengshi-official'] },
  { id: 'xianyang', historicalName: '咸阳', aliases: ['咸阳宫'], modernName: '咸阳市', modernAdministrativeUnit: '陕西省', longitude: 108.70, latitude: 34.33, notes: '秦都城。', sourceIds: ['zizhi-tongjian', 'modern-geography-reference'] },
  { id: 'changan', historicalName: '长安', aliases: ['西京'], modernName: '西安市', modernAdministrativeUnit: '陕西省', longitude: 108.94, latitude: 34.34, notes: '汉、隋、唐重要都城。', sourceIds: ['zizhi-tongjian', 'modern-geography-reference'] },
  { id: 'luoyang', historicalName: '洛阳', aliases: ['雒阳'], modernName: '洛阳市', modernAdministrativeUnit: '河南省', longitude: 112.45, latitude: 34.62, notes: '东汉、魏晋及多个北方政权都城。', sourceIds: ['zizhi-tongjian', 'modern-geography-reference'] },
  { id: 'ye', historicalName: '邺', aliases: ['邺城'], modernName: '临漳县一带', modernAdministrativeUnit: '河北省', longitude: 114.37, latitude: 36.33, notes: '曹魏、十六国及北朝重要政治中心。', sourceIds: ['zizhi-tongjian', 'modern-geography-reference'] },
  { id: 'jiankang', historicalName: '建康', aliases: ['建业', '金陵'], modernName: '南京市', modernAdministrativeUnit: '江苏省', longitude: 118.80, latitude: 32.06, notes: '孙吴、东晋及南朝都城。', sourceIds: ['zizhi-tongjian', 'modern-geography-reference'] },
  { id: 'chengdu', historicalName: '成都', aliases: [], modernName: '成都市', modernAdministrativeUnit: '四川省', longitude: 104.07, latitude: 30.67, notes: '蜀汉都城。', sourceIds: ['zizhi-tongjian', 'modern-geography-reference'] },
  { id: 'xiangyang', historicalName: '襄阳', aliases: [], modernName: '襄阳市', modernAdministrativeUnit: '湖北省', longitude: 112.12, latitude: 32.01, notes: '汉水流域重要军事与交通节点。', sourceIds: ['zizhi-tongjian', 'modern-geography-reference'] },
  { id: 'chibi', historicalName: '赤壁', aliases: [], modernName: '赤壁市一带', modernAdministrativeUnit: '湖北省', longitude: 113.90, latitude: 29.85, notes: '三国时期赤壁之战传统所指区域。', sourceIds: ['zizhi-tongjian', 'modern-geography-reference'] },
  { id: 'hefei', historicalName: '合肥', aliases: [], modernName: '合肥市', modernAdministrativeUnit: '安徽省', longitude: 117.23, latitude: 31.82, notes: '江淮之间的军事重镇。', sourceIds: ['zizhi-tongjian', 'modern-geography-reference'] },
  { id: 'youzhou', historicalName: '幽州', aliases: [], modernName: '北京及周边', modernAdministrativeUnit: '北京市一带', longitude: 116.40, latitude: 39.90, notes: '北方边地重要区域名称。', sourceIds: ['zizhi-tongjian', 'modern-geography-reference'] },
  { id: 'liangzhou', historicalName: '凉州', aliases: [], modernName: '武威及河西走廊', modernAdministrativeUnit: '甘肃省', longitude: 102.64, latitude: 37.93, notes: '河西走廊重要区域。', sourceIds: ['zizhi-tongjian', 'modern-geography-reference'] },
  { id: 'yangzhou', historicalName: '扬州', aliases: [], modernName: '扬州市一带', modernAdministrativeUnit: '江苏省', longitude: 119.42, latitude: 32.39, notes: '江淮与江南交通要地。', sourceIds: ['zizhi-tongjian', 'modern-geography-reference'] },
  { id: 'kaifeng', historicalName: '开封', aliases: ['大梁', '汴州'], modernName: '开封市', modernAdministrativeUnit: '河南省', longitude: 114.34, latitude: 34.80, notes: '五代多个政权的都城。', sourceIds: ['zizhi-tongjian', 'modern-geography-reference'] },
];
