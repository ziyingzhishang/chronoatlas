import { expect, test } from 'vitest';
import { chineseText } from './chinese';
test('regional Chinese uses phrase conversion plus separate UI terminology',()=>{
  expect(chineseText('历史地图与疆域','zh-TW')).toBe('歷史地圖與疆域');
  expect(chineseText('加载数据','zh-TW')).toBe('載入資料');
  expect(chineseText('加载数据','zh-HK')).toBe('載入數據');
  expect(chineseText('后台','zh-HK')).toBe('後台');
  expect(chineseText('后台','zh-TW')).toBe('後臺');
  expect(chineseText('历史地图','zh-CN')).toBe('历史地图');
});
