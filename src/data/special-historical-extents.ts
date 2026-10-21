import type { BoundaryState } from '../domain/types';

const erlitouCitation = {
  title: '国家发展改革委：二里头文化',
  urlOrCitation: 'https://www.ndrc.gov.cn/xwdt/ztzl/dyhgjwhgy/202209/t20220920_1335799_ext.html',
  pageOrRecord: '二里头遗址位于河南偃师二里头村附近',
};
const erlitouResearchCitation = {
  title: '洛阳市人民政府：二里头遗址考古',
  urlOrCitation: 'https://www.ly.gov.cn/2024/12-27/499371.html',
  pageOrRecord: '遗址中心区与夏代晚期都邑研究',
};
const gengshiWanCitation = {
  title: '湖北省文化和旅游厅：南阳宛城',
  urlOrCitation: 'https://wlt.hubei.gov.cn/bmdt/ztzl/zshb/201912/t20191226_1799409.shtml',
  pageOrRecord: '更始政权建都宛城、迁洛阳',
};
const gengshiChanganCitation = {
  title: '陕西地方志：更始帝迁都长安',
  urlOrCitation: 'https://dfz.shaanxi.gov.cn/zslm/fzzlk/xbsxsxz/xbsxz/xas_16198/201405/P020240923622533021818.pdf',
  pageOrRecord: '更始二年二月由洛阳迁都长安',
};

export const specialHistoricalExtents: BoundaryState[] = [
  {
    id:'special-xia-erlitou-core', polityId:'xia_early', validFrom:-2070, validTo:-1600,
    snapshotYear:-2070, temporalKind:'interval', presentation:'reference', sourceName:'二里头文化核心参照',
    sourceUrl:erlitouCitation.urlOrCitation, vertexCount:1, geometry:{type:'Point',coordinates:[112.70,34.70]},
    controlType:'influence', confidence:'low', sourceIds:['erlitou-official'],
    notes:'仅显示二里头遗址附近的考古文化核心定位，不表示夏代国家边界或完整文化分布。坐标为近似定位。',
    evidence:{evidenceLevel:'D',derivation:'cultural-core',reviewStatus:'source-checked',
      citations:[erlitouCitation,erlitouResearchCitation],
      uncertaintyNote:'考古来源支持二里头都邑与文化核心的定位，但不能据此推导夏代封闭国界。'},
  },
  {
    id:'special-gengshi-23-centers', polityId:'gengshi', validFrom:23, validTo:23,
    snapshotYear:23, temporalKind:'interval', presentation:'reference', sourceName:'更始政权控制中心参照',
    sourceUrl:gengshiWanCitation.urlOrCitation, vertexCount:3,
    geometry:{type:'MultiPoint',coordinates:[[112.53,32.99],[112.45,34.62],[108.94,34.34]]},
    controlType:'influence', confidence:'low', sourceIds:['gengshi-official'],
    notes:'显示23年相关的宛城、洛阳、长安中心，不把中心连线或覆盖范围解释为国界。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',citations:[gengshiWanCitation,gengshiChanganCitation],
      uncertaintyNote:'年级别记录只能表达主要政治与军事中心，不能确定同年各时点的连续控制范围。'},
  },
  {
    id:'special-gengshi-24-centers', polityId:'gengshi', validFrom:24, validTo:24,
    snapshotYear:24, temporalKind:'interval', presentation:'reference', sourceName:'更始政权迁都中心参照',
    sourceUrl:gengshiChanganCitation.urlOrCitation, vertexCount:2,
    geometry:{type:'MultiPoint',coordinates:[[112.45,34.62],[108.94,34.34]]},
    controlType:'influence', confidence:'low', sourceIds:['gengshi-official'],
    notes:'显示24年由洛阳迁都长安的中心序列，不表示连续疆域。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',citations:[gengshiChanganCitation],
      uncertaintyNote:'迁都时序有地方志依据，但中心点不能推导更始政权的封闭控制边界。'},
  },
  {
    id:'special-gengshi-25-center', polityId:'gengshi', validFrom:25, validTo:25,
    snapshotYear:25, temporalKind:'interval', presentation:'reference', sourceName:'更始政权长安中心参照',
    sourceUrl:gengshiChanganCitation.urlOrCitation, vertexCount:1,
    geometry:{type:'Point',coordinates:[108.94,34.34]}, controlType:'influence', confidence:'low', sourceIds:['gengshi-official'],
    notes:'仅表示25年政权覆亡前的长安中心，不表示全年连续控制或国界。',
    evidence:{evidenceLevel:'D',derivation:'control-centers',reviewStatus:'source-checked',citations:[gengshiChanganCitation],
      uncertaintyNote:'年内政局快速变化，只保留长安中心参照，不生成疆域范围。'},
  },
];
