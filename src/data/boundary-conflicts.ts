import annualOverlapAudit from '../../docs/audits/topics/coeval-boundary-overlaps-387-393.json';

/**
 * Geometry conflicts and annual gap holds that need historical and cartographic review.
 * Held source geometry remains intact in the catalog; the affected annual frame
 * omits it from runtime until the issue is resolved.
 */
type BoundaryGeometryConflict = {
  conflictId: string;
  boundaryId: string;
  polityIds: readonly string[];
  years: readonly number[];
  status: 'requires-review';
  reason: string;
  reviewedBy: readonly string[];
};

export const boundaryGeometryConflicts: readonly BoundaryGeometryConflict[] = [
  {
    conflictId: 'conflict:shang-western-zhou-transition:1046-bce',
    boundaryId: 'clio-110-shang--1100',
    polityIds: ['shang', 'zhou_western'],
    years: [-1046],
    status: 'requires-review',
    reason: 'Cliopatria record 110 is a low-confidence interval outline ending in 1046 BCE, while the project uses the traditional c.1046 BCE Shang–Zhou transition and Zhang Pengcheng’s 2023 reconstruction dates the first campaign to 1046 and conquest to 1044. The source polygon cannot establish a stable full-year Shang direct-control boundary through this transition. Preserve its source geometry and hold it only in 1046 pending historical and cartographic review; do not clip it or transfer area to Western Zhou. The Fenghao center point remains available.',
    reviewedBy: [],
  },
  ...Array.from((() => {
    const byBoundary = new Map<string, { years: Set<number>; polityIds: Set<string> }>();
    for (const yearRecord of annualOverlapAudit.years) {
      for (const pair of yearRecord.overlapPairs) {
        pair.boundaryIds.forEach((boundaryId, index) => {
          const review = byBoundary.get(boundaryId) ?? { years: new Set<number>(), polityIds: new Set<string>() };
          review.years.add(yearRecord.year);
          review.polityIds.add(pair.polityIds[index]);
          review.polityIds.add(pair.polityIds[1 - index]);
          byBoundary.set(boundaryId, review);
        });
      }
    }
    return byBoundary;
  })()).map(([boundaryId, review]) => ({
    conflictId: `conflict:coeval-outline-overlaps-387-393:${boundaryId}`,
    boundaryId,
    polityIds: [...review.polityIds],
    years: [...review.years],
    status: 'requires-review' as const,
    reason: 'The annual 387–393 source-geometry preflight found an interior overlap with one or more contemporaneous interval outlines. This is a cartographic review trigger, not a claim of shared historical control. Preserve the source geometry and hold it only in years recorded by the audit; do not clip or transfer it. See docs/audits/topics/coeval-boundary-overlaps-387-393.json.',
    reviewedBy: [],
  })),
  {
    conflictId: 'conflict:xin-han-transition:9',
    boundaryId: 'clio-1120-xin-9',
    polityIds: ['xin', 'han_western'],
    years: [9],
    status: 'requires-review',
    reason: 'Cliopatria record 1120 is a low-confidence 9–13 interval model with unspecified control semantics. The annual audit for 9 has no approved boundary and identifies the outline only as an inherited reference, while the Han-to-Xin calendar and polity transition spans the preceding year-end and the formal removal of the Han title in 9. Preserve the original polygon and hold it only in 9 pending historical and cartographic review; do not clip or transfer it. The source interval resumes in 10.',
    reviewedBy: [],
  },
  {
    conflictId: 'conflict:xin-gengshi-transition:23',
    boundaryId: 'clio-1136-xin-23',
    polityIds: ['xin', 'gengshi'],
    years: [23],
    status: 'requires-review',
    reason: 'Cliopatria record 1136 is a low-confidence, unspecified-control 23–29 period model, clipped in this catalog to 23 as Xin’s end year. The chronicles place Gengshi’s formation and the capture of Chang’an within 23, so this outline cannot establish one stable full-year Xin direct-control boundary across the transition. Preserve the source geometry and hold it only in 23 pending historical and cartographic review; do not clip it or transfer it to Gengshi. The annual Wan center and the sourced Chang’an event remain available.',
    reviewedBy: [],
  },
  {
    conflictId: 'conflict:han-wei-transition:220',
    boundaryId: 'clio-1325-han_eastern-215',
    polityIds: ['han_eastern', 'wei_three'],
    years: [220],
    status: 'requires-review',
    reason: 'Cliopatria record clio-1325 is a low-confidence 215–220 interval outline with no year-specific direct-control semantics. The annual audit for 220 records the Han-to-Wei abdication transition and leaves Wei territory unfilled; the interval cannot establish stable full-year Han control or be transferred to Wei. Preserve the source geometry and hold it only in 220 pending historical and cartographic review; do not clip it. The original outline remains available through 219.',
    reviewedBy: [],
  },
  {
    conflictId: 'conflict:wu-zhou-tang-transition:705',
    boundaryId: 'clio-2642-tang-705',
    polityIds: ['wu_zhou', 'tang'],
    years: [705],
    status: 'requires-review',
    reason: 'Cliopatria record 2642 is a low-confidence, unspecified-control 705–749 period model. Wu Zhou ended and Tang was restored during 705, so the outline cannot establish a stable full-year Tang direct-control boundary across the transition. Preserve the source geometry and hold it only in 705 pending historical and cartographic review; do not clip it or transfer any area from Wu Zhou. The original interval resumes in 706.',
    reviewedBy: [],
  },
  {
    conflictId: 'conflict:former-zhao-period-model-306-310',
    boundaryId: 'clio-1428-former_zhao-306',
    polityIds: ['former_zhao'],
    years: [306, 307, 308, 309, 310],
    status: 'requires-review',
    reason: 'Cliopatria record 1428 is a low-confidence 306–310 interval model with unspecified control semantics. The interval spans left-city/Puzi/Pingyang political-center changes, while the source does not establish year-specific direct control or cartographic boundary evidence. Preserve the original polygon in the source catalog and hold it from annual runtime frames pending historical and cartographic review; separately sourced center points may still render.',
    reviewedBy: [],
  },
  {
    conflictId: 'conflict:former-zhao-period-model-311-323',
    boundaryId: 'clio-1434-former_zhao-311',
    polityIds: ['former_zhao'],
    years: Array.from({length: 13}, (_, index) => 311 + index),
    status: 'requires-review',
    reason: 'Cliopatria record 1434 is a low-confidence 311–323 interval model, not an annual survey; its boundary and control semantics have not received this project’s historical and cartographic approval. Preserve the source polygon and hold it from annual runtime frames until that review is complete; do not infer a year-by-year boundary from the interval outline.',
    reviewedBy: [],
  },
  {
    conflictId: 'conflict:former-zhao-period-model-324-329',
    boundaryId: 'clio-1444-former_zhao-324',
    polityIds: ['former_zhao'],
    years: [324, 325, 326, 327, 328, 329],
    status: 'requires-review',
    reason: 'Cliopatria record 1444 is a low-confidence 324–329 interval model, not an annual survey; its boundary and control semantics have not received this project’s historical and cartographic approval. Preserve the source polygon and hold it from annual runtime frames until that review is complete; do not infer a year-by-year boundary from the interval outline.',
    reviewedBy: [],
  },
  {
    conflictId: 'conflict:western-qin-southern-liang:414',
    boundaryId: 'clio-1684-western_qin-414',
    polityIds: ['western_qin', 'southern_liang'],
    years: [414],
    status: 'requires-review',
    reason: 'Western Qin source interval covers 414–416, while Southern Liang held Ledu until the intra-year conquest in 414. The source polygon represents a period model and must not be clipped to the Ledu point or treated as a full-year boundary without review.',
    reviewedBy: [],
  },
  {
    conflictId: 'conflict:republic-prc-transition:1949',
    boundaryId: 'clio-13089-republic-1949',
    polityIds: ['republic', 'prc'],
    years: [1949],
    status: 'requires-review',
    reason: 'The source provides a low-confidence 1949 interval-model outline with unspecified control semantics. The year contains a state transition and changing military/administrative control; hold the source geometry until historical and cartographic review establishes whether it can be shown as direct control or only as a labeled source reference.',
    reviewedBy: [],
  },
  {
    conflictId: 'conflict:qin-qi-unification:221-bce',
    boundaryId: 'clio-721-qi_warring--222',
    polityIds: ['qi_warring', 'qin'],
    years: [-221],
    status: 'requires-review',
    reason: 'The Qi polygon is a broad interval model covering 222–221 BCE, while the Qin annals record the capture of the Qi king and Qin unification in 221 BCE. The source does not identify within-year control dates or a transition boundary; hold the Qi outline for this year rather than showing the whole interval as a stable annual border.',
    reviewedBy: [],
  },
  {
    conflictId: 'conflict:song-southern-transition-479',
    boundaryId: 'clio-1860-song_southern-476',
    polityIds: ['song_southern', 'qi_southern'],
    years: [479],
    status: 'requires-review',
    reason: 'Cliopatria record 1860 is a low-confidence 476–479 interval model with unspecified control semantics. The year includes the Song–Qi abdication and accession; the source does not identify within-year control dates or a transition boundary. Preserve the original Liu Song polygon and hold it from the 479 runtime frame pending historical and cartographic review. Do not clip it to the Jiankang center or assign its outline to Southern Qi; the 480 Southern Qi record remains in its own source interval.',
    reviewedBy: [],
  },
  {
    conflictId: 'conflict:qi-southern-liang-transition-502',
    boundaryId: 'clio-1928-qi_southern-500',
    polityIds: ['qi_southern', 'liang_southern'],
    years: [502],
    status: 'requires-review',
    reason: 'Cliopatria record 1928 is a low-confidence 500–502 interval model with unspecified control semantics. The year contains the Southern Qi–Liang abdication and accession; the source does not establish within-year control dates or the transfer boundary. Preserve the original Southern Qi polygon and hold it from the 502 runtime frame pending historical and cartographic review. Do not clip it to the Jiankang center or transfer it to Southern Liang; record 1937 remains in its 510–533 source interval.',
    reviewedBy: [],
  },
  {
    conflictId: 'conflict:eastern-wei-founding-transition-534',
    boundaryId: 'clio-1982-wei_eastern-534',
    polityIds: ['wei_eastern'],
    years: [534],
    status: 'requires-review',
    reason: 'Cliopatria record 1982 is a low-confidence 534–545 interval model with unspecified control semantics. Eastern Wei emerged from the Northern Wei division during 534, and the source does not distinguish the year-end regime from earlier Northern Wei control. Preserve the polygon and hold it only from the 534 runtime frame pending historical and cartographic review; the separately sourced Yecheng capital point may render, and the original polygon remains eligible from 535 onward.',
    reviewedBy: [],
  },
  {
    conflictId: 'conflict:eastern-wei-qi-transition-550',
    boundaryId: 'clio-2059-wei_eastern-546',
    polityIds: ['wei_eastern', 'qi_northern'],
    years: [550],
    status: 'requires-review',
    reason: 'Cliopatria record 2059 is a low-confidence 546–550 interval model with unspecified control semantics. Northern Qi replaced Eastern Wei in 550, and the source does not distinguish the abdication-year transfer or establish when control changed. Preserve the Eastern Wei polygon and hold it only from the 550 runtime frame pending historical and cartographic review; do not clip or assign its outline to Northern Qi. Northern Qi record 2068 remains in its 555–560 source interval.',
    reviewedBy: [],
  },
  {
    conflictId: 'conflict:southern-liang-chen-transition-557',
    boundaryId: 'clio-2080-liang_southern-555',
    polityIds: ['liang_southern', 'chen_southern'],
    years: [557],
    status: 'requires-review',
    reason: 'Cliopatria record 2080 is a low-confidence 555–557 interval model with unspecified control semantics. Southern Liang ended and Southern Chen was founded during 557; the source does not distinguish the year-end transfer or establish a full-year boundary. Preserve the source polygon and hold it only from the 557 runtime frame pending historical and cartographic review; do not clip it or assign it to Southern Chen. The original geometry remains available for 555–556.',
    reviewedBy: [],
  },
  {
    conflictId: 'conflict:western-wei-zhou-transition-557',
    boundaryId: 'clio-2099-wei_western-555',
    polityIds: ['wei_western', 'zhou_northern'],
    years: [557],
    status: 'requires-review',
    reason: 'Cliopatria record 2099 is a low-confidence 555–557 interval model with unspecified control semantics. Western Wei ended and Northern Zhou was founded during 557; the source does not distinguish the year-end transfer or establish a full-year boundary. Preserve the source polygon and hold it only from the 557 runtime frame pending historical and cartographic review; do not clip it or assign it to Northern Zhou. The original geometry remains available for 555–556.',
    reviewedBy: [],
  },
  {
    conflictId: 'conflict:northern-qi-zhou-transition-577',
    boundaryId: 'clio-2147-zhou_northern-577',
    polityIds: ['qi_northern', 'zhou_northern'],
    years: [577],
    status: 'requires-review',
    reason: 'Cliopatria record 2147 is a low-confidence 577–581 interval model with unspecified control semantics. Northern Qi began the year in control of Ye, while Northern Zhou campaigns captured Jinyang, Ye and additional prefectures and ended the Northern Qi court during the year. The outline cannot represent a single stable full-year Northern Zhou direct-control area. Preserve the source polygon and hold it only in 577 pending historical and cartographic review; do not clip it to the Ye transition point or push later control backward. The original geometry remains in use from 578 onward.',
    reviewedBy: [],
  },
  {
    conflictId: 'conflict:northern-zhou-sui-transition-581',
    boundaryId: 'clio-2147-zhou_northern-577',
    polityIds: ['zhou_northern', 'sui'],
    years: [581],
    status: 'requires-review',
    reason: 'Cliopatria record 2147 is a low-confidence 577–581 interval model with unspecified control semantics. Sui replaced Northern Zhou in 581, and the source does not distinguish that within-year transition or establish the annual direct-control boundary. Preserve the Northern Zhou polygon and hold it only from the 581 runtime frame pending historical and cartographic review; do not clip or assign it to Sui. The Sui center points remain available, and the source polygon is already held for the separate 577 Northern Qi transition.',
    reviewedBy: [],
  },
  {
    conflictId: 'conflict:sui-tang-transition-618',
    boundaryId: 'clio-2257-sui-617',
    polityIds: ['sui', 'tang'],
    years: [618],
    status: 'requires-review',
    reason: 'Cliopatria record 2257 is a low-confidence 617–618 interval model with unspecified control semantics. Tang was founded at Chang’an during 618 while Sui authority and competing regimes changed through the year; the source does not establish a full-year Sui control boundary or the transfer date. Preserve the Sui polygon and hold it only from the 618 runtime frame pending historical and cartographic review. Keep the separately sourced Tang Chang’an point and do not clip or reassign the polygon; Tang record 2281 starts in 623.',
    reviewedBy: [],
  },
  {
    conflictId: 'conflict:later-tang-jin-transition-936',
    boundaryId: 'clio-3744-jin_later-936',
    polityIds: ['tang_later', 'jin_later'],
    years: [936],
    status: 'requires-review',
    reason: 'Cliopatria record 3744 is a low-confidence 936–946 interval model with unspecified control semantics. Later Jin was established late in 936 after Shi Jingtang’s rebellion and the Khitan intervention; Later Tang’s court ended at Luoyang in December, while local transfers did not form one documented annual boundary. Preserve the source polygon and hold it only from the 936 runtime frame pending historical and cartographic review. Keep the separately sourced Taiyuan and Luoyang transition points; do not assign the whole interval outline as direct control to either Later Jin or Later Tang. The original geometry remains eligible from 937 onward.',
    reviewedBy: [],
  },
  {
    conflictId: 'conflict:later-jin-han-transition-947',
    boundaryId: 'clio-3830-han_later-947',
    polityIds: ['jin_later', 'khitan', 'han_later'],
    years: [947],
    status: 'requires-review',
    reason: 'Cliopatria record 3830 is a low-confidence 947–951 interval model with unspecified control semantics. In 947 the Khitan entered Kaifeng in January, the Later Jin court ended, Later Han was established at Taiyuan in February, and Later Han forces retook Luoyang and Kaifeng in May as Khitan forces withdrew from Henan. The interval outline cannot represent these within-year transfers as one stable Later Han annual direct-control area. Preserve the polygon and hold it only from the 947 runtime frame pending historical and cartographic review; keep the separately sourced transition centers and restore the unchanged source geometry from 948 onward. The distinct Khitan 936–959 interval remains available as its northern polity-area reference; it does not include Kaifeng or the documented Henan occupation point.',
    reviewedBy: [],
  },
  {
    conflictId: 'conflict:northern-song-jin-war-1125',
    boundaryId: 'clio-4444-song_northern-1056',
    polityIds: ['song_northern', 'jin_jurchen'],
    years: [1125],
    status: 'requires-review',
    reason: 'Cliopatria record 4444 is a low-confidence 1056–1125 interval model with unspecified control semantics. The Jin annals record the order to attack Song in 1125 and the invasion began later that year, so the outline cannot establish a stable full-year Northern Song direct-control area across the new war. Preserve the source polygon and hold it only from the 1125 runtime frame pending historical and cartographic review; do not transfer or clip it to Jin. The original Song outline remains available through 1124.',
    reviewedBy: [],
  },
  {
    conflictId: 'conflict:later-zhou-song-transition-960',
    boundaryId: 'clio-3861-zhou_later-960',
    polityIds: ['zhou_later', 'song_northern'],
    years: [960],
    status: 'requires-review',
    reason: 'Cliopatria record 3861 is a low-confidence 960 single-year outline with unspecified control semantics. The Later Zhou–Northern Song succession occurred early in the year, so this polygon cannot be treated as an unchanged Later Zhou full-year border. Preserve the original source geometry and hold it from the 960 runtime frame pending historical and cartographic review; do not clip it to Kaifeng or reassign it to Song. The Song record begins in 961 and remains in its own source interval.',
    reviewedBy: [],
  },
  {
    conflictId: 'conflict:mongol-xixia-transition-1227',
    boundaryId: 'clio-5505-mongol-1227',
    polityIds: ['mongol', 'western_xia'],
    years: [1227],
    status: 'requires-review',
    reason: 'Cliopatria record 5505 is a low-confidence 1227–1235 interval model with unspecified control semantics. The Mongol siege and Western Xia’s terminal defeat unfolded during 1227; the outline cannot establish a stable full-year Mongol direct-control area or the timing of local transfers. Preserve the source polygon and hold it only in 1227 pending historical and cartographic review. Do not clip it to the Zhongxing event point or treat the 1220–1226 Western Xia outline as continuing; the Mongol source polygon remains from 1228 onward.',
    reviewedBy: [],
  },
  {
    conflictId: 'conflict:mongol-yuan-transition-1271',
    boundaryId: 'clio-5808-mongol-1260',
    polityIds: ['mongol', 'yuan'],
    years: [1271],
    status: 'requires-review',
    reason: 'Cliopatria record 5808 is a low-confidence 1260–1271 interval model with unspecified control semantics. Kublai proclaimed the Yuan dynastic name in 1271, while Mongol imperial authority had already fragmented; the source does not establish which parts of its broad outline represent year-end Yuan direct control, other Mongol khanates, or claims. Preserve the source geometry and hold it only in 1271 pending historical and cartographic review. Do not assign it to Yuan; the audited Yuan display for 1271 remains the sourced Shangdu political-center point.',
    reviewedBy: [],
  },
  {
    conflictId: 'conflict:yuan-ming-northern-yuan-transition:1368',
    boundaryId: 'clio-6542-yuan-1363',
    polityIds: ['yuan', 'ming', 'northern_yuan'],
    years: [1368],
    status: 'requires-review',
    reason: 'Cliopatria record 6542 is a low-confidence 1363–1368 interval model that crosses the 1368 Yuan retreat from Dadu, Ming foundation, and Northern Yuan formation. It cannot represent one stable full-year direct-control area; preserve the source polygon and hold it only for 1368 pending historical and cartographic review, without clipping or assigning it to a successor polity.',
    reviewedBy: [],
  },
  {
    conflictId: 'conflict:shu-wei-transition:263',
    boundaryId: 'clio-1371-wei_three-263',
    polityIds: ['wei_three', 'shu_three'],
    years: [263],
    status: 'requires-review',
    reason: 'Cliopatria record 1371 is a low-confidence 263–264 interval model with unspecified control semantics. The Wei campaign captured Shu’s capital and ended the Shu regime during 263, so the polygon cannot establish a stable full-year Wei direct-control area or the timing of territorial transfer. Preserve the source polygon and hold it only for 263 pending historical and cartographic review; show the sourced Luoyang center point without clipping the polygon or assigning all Shu territory to Wei.',
    reviewedBy: [],
  },
  {
    conflictId: 'conflict:wei-jin-transition:265',
    boundaryId: 'clio-1376-jin_western-265',
    polityIds: ['jin_western', 'wei_three'],
    years: [265],
    status: 'requires-review',
    reason: 'The Jin source interval begins in 265, but the Wei-Jin abdication occurred in December and Wu remained independent. Its cross-year polygon must not render as a full-year 265 control area before historical and cartographic review; preserve the source geometry and hold only this transition year.',
    reviewedBy: [],
  },
  {
    conflictId: 'conflict:western-jin-breakaway-polities:304-305',
    boundaryId: 'clio-1407-jin_western-287',
    polityIds: ['jin_western', 'cheng_han'],
    years: [304, 305],
    status: 'requires-review',
    reason: 'Cliopatria record 1407 is a 287–305 interval outline without annual control changes. Li Xiong captured Chengdu late in 304 and established Cheng Han there; the sourced Chengdu center point falls within the broad Jin outline, which otherwise renders as if Jin retained the region through 305. Preserve the original polygon and hold it only for 304–305 pending historical and cartographic review; do not clip it or transfer it to Cheng Han. Former Zhao also formed in 304, but its early centers lack project-verified coordinates and are not used to assert polygon overlap.',
    reviewedBy: [],
  },
  {
    conflictId: 'conflict:jin-chenghan-transition:347',
    boundaryId: 'clio-1477-jin_eastern-347',
    polityIds: ['jin_eastern', 'cheng_han'],
    years: [347],
    status: 'requires-review',
    reason: 'Cliopatria record 1477 is a low-confidence, unspecified-control 347–370 interval outline that spatially includes the Chengdu reference point. The annual Cheng Han audit records Huan Wen leaving Chengdu after a brief spring occupation, followed by Deng Ding and Wei Wen re-entering the city in the fourth month. The interval cannot establish Eastern Jin direct control for all of 347. Preserve the original source geometry and hold it only in 347 pending historical and cartographic review; do not clip it or transfer any area. The source interval resumes in 348.',
    reviewedBy: [],
  },
  {
    conflictId: 'conflict:wu-interval-model-transition:265',
    boundaryId: 'clio-1373-wu_three-263',
    polityIds: ['wu_three'],
    years: [265],
    status: 'requires-review',
    reason: 'Cliopatria record 1373 is an unspecified low-confidence 263–269 interval model, while the chronicle records Wu’s winter move from Jiankang to Wuchang in 265. Hold the interval polygon only for this transition year and show the sourced Wuchang year-end center point; preserve the original polygon without clipping or treating it as a 265 annual direct-control boundary.',
    reviewedBy: [],
  },
  {
    conflictId: 'hold:yuan-unfilled-gap:1279',
    boundaryId: 'hb-1279-yuan-246',
    polityIds: ['yuan'],
    years: [1279],
    status: 'requires-review',
    reason: 'Historical Basemaps record 246 is a low-confidence, unspecified-control single-year outline. The source README describes the maps as work in progress and asks users to verify them against other sources; it does not provide a 1279 boundary-by-boundary basis for annual direct control. Preserve the GPL-3.0 source geometry in the catalog, but hold it from the 1279 runtime frame to honor the annual leave-unfilled decision. Keep Dadu and Shangdu political-center points; do not treat the snapshot as an annual Yuan border.',
    reviewedBy: [],
  },
  ...[-1, 100, 200, 300].map((year) => ({
    conflictId: `hold:silla-early-unfilled-gap:${year}`,
    boundaryId: year === -1 ? 'hb--1-silla-295'
      : year === 100 ? 'hb-100-silla-426'
        : year === 200 ? 'hb-200-silla-164' : 'hb-300-silla-465',
    polityIds: ['silla'],
    years: [year],
    status: 'requires-review' as const,
    reason: 'The annual Silla gap audit explicitly leaves this year without territory geometry. The Historical Basemaps world-scale outline is a coarse, unsourced-by-boundary snapshot that does not distinguish direct control, dependencies, or disputed areas; retain it in the source catalog but do not show it as the audited annual territory.',
    reviewedBy: [],
  })),
];
