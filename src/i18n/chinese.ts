import { Converter } from 'opencc-js/cn2t';
import type { Locale } from './locale';

const converters = {
  'zh-HK': Converter({from:'cn',to:'hk'}),
  'zh-TW': Converter({from:'cn',to:'tw'}),
};
// Reviewed UI terminology; historical names have their own content overrides.
const terms = {
  'zh-HK': [['加载','載入'],['默认','預設'],['鼠标','滑鼠'],['软件','軟件'],['数据','數據'],['后台','後台']],
  'zh-TW': [['加载','載入'],['默认','預設'],['鼠标','滑鼠'],['软件','軟體'],['数据','資料'],['信息','資訊'],['视频','影片'],['后台','後臺']],
} as const;

export function chineseText(text:string,locale:Locale):string {
  if(locale!=='zh-HK'&&locale!=='zh-TW')return text;
  let result=text;
  for(const [from,to] of terms[locale])result=result.replaceAll(from,to);
  return converters[locale](result);
}
