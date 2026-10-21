export interface HistoricalPeriod {
  id: string;
  name: string;
  start: number;
  end: number;
  color: string;
  lane: 0 | 1;
  approximate?: boolean;
  intervals?: [number, number][];
}

// Reading/navigation periods, not territorial claims. Successions can overlap in the same year.
export const periods: HistoricalPeriod[] = [
  { id: 'prehistory', name: '史前文化', start: -8000, end: -2071, color: '#6a8075', lane: 0, approximate: true },
  { id: 'xia_early', name: '夏', start: -2070, end: -1600, color: '#8d7b64', lane: 0, approximate: true },
  { id: 'shang', name: '商', start: -1600, end: -1046, color: '#a67a58', lane: 0, approximate: true },
  { id: 'zhou_western', name: '西周', start: -1046, end: -771, color: '#9b9168', lane: 0, approximate: true },
  { id: 'spring_autumn', name: '春秋', start: -770, end: -476, color: '#8b9b75', lane: 0 },
  { id: 'warring', name: '战国', start: -475, end: -222, color: '#988e61', lane: 0 },
  { id: 'qin', name: '秦', start: -221, end: -206, color: '#b54f45', lane: 0 },
  { id: 'han_western', name: '西汉', start: -206, end: 9, color: '#bd9556', lane: 0 },
  { id: 'xin', name: '新', start: 9, end: 23, color: '#8c7762', lane: 0 },
  { id: 'gengshi', name: '更始', start: 23, end: 25, color: '#ae845c', lane: 0 },
  { id: 'han_eastern', name: '东汉', start: 25, end: 220, color: '#d0aa62', lane: 0 },
  { id: 'three', name: '三国', start: 220, end: 280, color: '#8e9b72', lane: 0 },
  { id: 'jin_western', name: '西晋', start: 265, end: 316, color: '#b79b68', lane: 1 },
  { id: 'jin_eastern', name: '东晋', start: 317, end: 420, color: '#a88b6e', lane: 0 },
  { id: 'sixteen', name: '十六国', start: 304, end: 439, color: '#7c8294', lane: 1 },
  { id: 'southern', name: '南朝', start: 420, end: 589, color: '#aa7b6f', lane: 0 },
  { id: 'northern', name: '北朝', start: 439, end: 581, color: '#687e92', lane: 1 },
  { id: 'sui', name: '隋', start: 581, end: 618, color: '#c3a45f', lane: 0 },
  { id: 'tang', name: '唐', start: 618, end: 907, intervals: [[618, 689], [705, 907]], color: '#c79b4d', lane: 0 },
  { id: 'wu_zhou', name: '武周', start: 690, end: 705, color: '#ba7169', lane: 1 },
  { id: 'five', name: '五代十国', start: 907, end: 979, color: '#a98076', lane: 0 },
  { id: 'song_northern', name: '北宋', start: 960, end: 1127, color: '#a88c6d', lane: 0 },
  { id: 'khitan', name: '辽', start: 916, end: 1125, color: '#7c91a1', lane: 1 },
  { id: 'western_xia', name: '西夏', start: 1038, end: 1227, color: '#a58e58', lane: 1 },
  { id: 'song_south', name: '南宋', start: 1127, end: 1279, color: '#bd9b78', lane: 0 },
  { id: 'jin_jurchen', name: '金', start: 1115, end: 1234, color: '#a58e58', lane: 1 },
  { id: 'yuan', name: '元', start: 1271, end: 1368, color: '#78988d', lane: 0 },
  { id: 'mongol', name: '蒙古汗国', start: 1206, end: 1271, color: '#809783', lane: 1 },
  { id: 'ming', name: '明', start: 1368, end: 1644, color: '#bf7565', lane: 0 },
  { id: 'northern_yuan', name: '北元', start: 1368, end: 1635, color: '#718b77', lane: 1 },
  { id: 'qing', name: '清', start: 1636, end: 1912, color: '#798caa', lane: 0 },
  { id: 'ming_southern', name: '南明', start: 1644, end: 1662, color: '#ae6758', lane: 1 },
  { id: 'republic', name: '民国·大陆时期', start: 1912, end: 1949, color: '#7e9b9d', lane: 0 },
  { id: 'prc', name: '中华人民共和国', start: 1949, end: 2026, color: '#b76c5d', lane: 0 },
];

// Keep a single Tang navigation option, but draw only its actual reign intervals.
export const periodBands = periods.flatMap(p => (p.intervals ?? [[p.start, p.end]]).map(([start, end], i) => ({
  ...p, id: p.intervals ? `${p.id}-${i}` : p.id, start, end,
})));
export const periodAtYear = (year: number) => periodBands.filter(p => p.start <= year && p.end >= year);
