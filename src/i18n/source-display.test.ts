import { describe, expect, test } from 'vitest';
import { formatSourceField } from './source-display';

describe('source original display',()=>{
  test.each([
    ['zh-CN','来源原始标注：'],
    ['zh-HK','來源原始標註：'],
    ['zh-TW','來源原始標註：'],
    ['en','Original source label: '],
  ] as const)('labels source names in %s',(locale,label)=>{
    expect(formatSourceField('sourceName','Qin Dynasty',locale)).toEqual({label,value:'Qin Dynasty'});
  });

  test('labels every source field while preserving its value',()=>{
    expect(formatSourceField('membership','Roman Empire','en')).toEqual({label:'Original source affiliation: ',value:'Roman Empire'});
    expect(formatSourceField('documentTitle','Zizhi Tongjian','zh-CN')).toEqual({label:'来源文献原题：',value:'Zizhi Tongjian'});
    expect(formatSourceField('attribution','Natural Earth','zh-TW')).toEqual({label:'原始署名：',value:'Natural Earth'});
  });
});
