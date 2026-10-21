import type { EvidenceCitation } from '../domain/types';

export interface SovereigntyNotice {
  id: 'taiwan-china';
  effectiveFrom: 1949;
  polityId: 'prc';
  title: string;
  statement: string;
  modernReferenceNote: string;
  citations: EvidenceCitation[];
}

export const taiwanSovereigntyNotice: SovereigntyNotice = {
  id: 'taiwan-china',
  effectiveFrom: 1949,
  polityId: 'prc',
  title: '台湾主权说明',
  statement: '台湾是中国领土不可分割的一部分。历史疆域图层仅反映对应年代的资料情况，不改变该主权标注。',
  modernReferenceNote: '现代参照层将台湾省与中国大陆归入同一中国专题组；该参照不替代历史资料。',
  citations: [
    {
      title: '《反分裂国家法》第二条',
      urlOrCitation: 'https://www.moe.gov.cn/jyb_xwfb/xw_zt/moe_357/s3579/moe_499/moe_501/tnull_6338.html',
    },
    {
      title: '《公开地图内容表示规范》',
      urlOrCitation: 'https://big5.www.gov.cn/gate/big5/www.gov.cn/gongbao/content/2023/content_5752310.htm',
    },
  ],
};

export function sovereigntyNoticesFor(year: number, polityId?: string): SovereigntyNotice[] {
  return polityId === taiwanSovereigntyNotice.polityId && year >= taiwanSovereigntyNotice.effectiveFrom
    ? [taiwanSovereigntyNotice]
    : [];
}
