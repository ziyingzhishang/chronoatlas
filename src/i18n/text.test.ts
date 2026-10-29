import { expect, test } from 'vitest';
import { translateText } from './text';

test.each([
  ['前221年', '221 BCE'], ['公元1年', '1 CE'], ['2026年', '2026 CE'],
  ['前403年—959年', '403 BCE—959 CE'],
  ['时间轴选中 3 个事件', '3 events selected on the timeline'],
  ['选择秦疆域', 'Select Qin territory'],
  ['查看前221年疆域断面', 'View territorial snapshot for 221 BCE'],
])('translates dynamic display text %s', (source, expected) => {
  expect(translateText(source, 'en')).toBe(expected);
});
test('keeps unknown historical names and source titles intact', () => {
  expect(translateText('Unverified polity name', 'en')).toBe('Unverified polity name');
  expect(translateText('未核实专名', 'en')).toBe('未核实专名');
  expect(translateText('前221年', 'zh-CN')).toBe('前221年');
});
test('uses traditional text with separate regional terminology', () => {
  expect(translateText('历史信息', 'zh-HK')).toBe('歷史信息');
  expect(translateText('历史信息', 'zh-TW')).toBe('歷史資訊');
  expect(translateText('数据加载中', 'zh-HK')).toBe('數據載入中');
  expect(translateText('数据加载中', 'zh-TW')).toBe('資料載入中');
});
test('translates heritage detail structure labels', () => {
  expect(translateText('遗产详情', 'en')).toBe('Heritage details');
  expect(translateText('建造沿革', 'en')).toBe('Construction history');
  expect(translateText('来源与依据', 'en')).toBe('Sources and evidence');
});

test('describes the two-state time navigation without the removed density modes', () => {
  expect(translateText('桌面宽屏可在地图栏内停靠或悬浮时间控制器；手机使用简明时间条和时间分析两种状态。拖动年份不会改变地图视角。', 'en'))
    .toBe('On wide desktop screens, the time controller can be docked or floated within the map pane. Phones use two states: the concise time bar and time analysis. Scrubbing years preserves the map view.');
});
