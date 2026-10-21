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
