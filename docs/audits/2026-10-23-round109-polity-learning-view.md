# Round 109 政权详情学习视图审计

日期：2026-10-23  
范围：`src/data/polity-details.ts` 中全部 87 个政权详情；只新增本审计测试与本报告，不修改生产数据、`claims.ts`、`people.ts`、`events.ts`、`heritage*` 或既有基线测试。

## 结论

| 审计项 | 结果 |
| --- | --- |
| 政权详情覆盖 | 87/87；详情记录 87/87 |
| `principalFigureIds` | 全部可解析；详情/抽屉人物入口无缺口 |
| `capitalPhases` | 地点与首都沿革记录全部可解析；详情/抽屉首都入口无缺口 |
| `eventIds` | 事件目录与事件详情全部可解析；详情/抽屉事件入口无缺口 |
| `heritageIds` | 遗产目录全部可解析；详情/抽屉遗产入口无缺口 |
| `claimIds` | claim 目录全部可解析；当前没有独立 claim 实体入口 |
| 学习视图：首都 | 0 个缺口 |
| 学习视图：建政/关联事件 | 5 个待集成缺口 |
| 学习视图：人物 | 1 个待集成缺口 |
| 学习视图：遗产 | 110 个待集成缺口 |

“详情/抽屉入口”按 `PolityDetail` 的真实映射核验：人物→person、首都阶段→place、事件→event、遗产→heritage。`claimIds` 仅作为详情证据关联解析，不伪造不可用的 claim 点击入口。

## 逐项审计方法

测试逐一遍历 `polities` 的 87 条记录，并按 `polityId` 读取详情。对五类引用分别检查：

- 人物：`people`；
- 首都：`places`，以及 `capitalHistory` 中同政权、地点、起止年完全匹配的记录；
- 事件：`events` 与 `eventDetails`；
- 遗产：`heritageAssets`；
- claim：`claims`。

学习视图按每条关联的历史年份调用真实 `buildPolityStudyView`。人物、首都、事件、遗产均检查该实体是否出现在视图集合中；详情抽屉直连另行检查。这样可以区分“数据 ID 可解析”与“现有学习视图过滤逻辑真正带入”。

## 待后续集成的学习视图缺口

这些不是目录断链：它们都仍可从政权详情/抽屉直达，暂不修改数据。

### 事件（5）

| 政权 | 详情事件 | 当前原因 |
| --- | --- | --- |
| `wei_three` | `jin-unification` | 事件详情未将该事件显式归入魏；共享来源回退不足以覆盖该年份 |
| `shu_three` | `jin-unification` | 同上 |
| `jin_eastern` | `jin-unification` | 事件发生年超出政权起点语义，当前过滤未形成该关联 |
| `zhou_northern` | `western-wei-founded` | 事件详情未将其作为北周学习视图事件 |
| `zhou_northern` | `sui-founded` | 事件详情未将其作为北周学习视图事件 |

### 人物（1）

- `qing → nurhaci`：详情列出努尔哈赤，但人物目录的 `polityIds` 未让他出现在清政权学习视图；详情抽屉直连正常。

### 遗产（110）

现有 `buildPolityStudyView` 的遗产集合由与政权关联且 predicate 为 `left-heritage` 的 claim 推导，而不是直接消费 `PolityDetail.heritageIds`。因此以下详情遗产均“可解析、可从抽屉打开”，但当前学习视图未带入：

`han_warring: han-xinzheng-city-site`；
`zhao_warring: zhao-wang-city-site`；
`wei_warring: wei-anyi-city-site`；
`chu_warring: chu-ying-city-site, chu-shouchun-city-site`；
`yan_warring: yan-ji-city-site`；
`qi_warring: qi-linzi-city-site`；
`han_western: han-changling, hanyangling, maoling, du-ling`；
`xin: han-changan-city-site`；
`han_eastern: luoyang-han-wei-city-site`；
`wei_three: luoyang-han-wei-city-site`；
`shu_three: shu-han-chengdu-city-site`；
`wu_three: jiankang-six-dynasties-city-site`；
`jin_western: luoyang-han-wei-city-site`；
`jin_eastern: jiankang-taicheng-site, jiankang-six-dynasties-city-site`；
`cheng_han: cheng-han-chengdu-site`；
`former_zhao: former-zhao-xiangguo-city-site`；
`later_zhao: ye-city-site`；
`former_yan: ye-city-site`；
`later_yan: later-yan-ye-city-site`；
`xia: tongwan-city-site, tongwan-south-gate-site`；
`northern_liang: zhangye-northern-liang-city-layer, guzang-ancient-city-site, guzang-baita-temple-site`；
`wei_northern: luoyang-han-wei-city-site, yungang-grottoes, yongning-temple-pagoda-site`；
`song_southern: jiankang-six-dynasties-city-site, southern-dynasties-stone-carvings`；
`qi_southern: jiankang-six-dynasties-city-site, southern-dynasties-stone-carvings`；
`liang_southern: southern-liang-jiangling-city-site, jiankang-six-dynasties-city-site`；
`chen_southern: jiankang-six-dynasties-city-site, southern-dynasties-stone-carvings`；
`wei_eastern: ye-city-site, ye-tongque-platform-site`；
`wei_western: western-wei-changan-city-layer`；
`qi_northern: ye-city-site, ye-tongque-platform-site`；
`zhou_northern: northern-zhou-changan-city-layer`；
`sui: tang-changan-city-site, luoyang-sui-tang-city-site, dingding-gate-site`；
`tang: xingqing-palace-site, xiao-yan-ta, big-wild-goose-pagoda, huaqing-palace, luoyang-sui-tang-city-site, shangyang-palace-site`；
`tang_later: later-tang-luoyang-city-site`；
`jin_later: kaifeng-later-jin-han-city-layer`；
`han_later: kaifeng-later-jin-han-city-layer`；
`xiongnu: xiongnu-longcheng-candidate`；
`goguryeo: wunvshan-goguryeo-early-capital-site, goguryeo-guonei-city-site, goguryeo-pyongyang-city-layer`；
`silla: silla-gyeongju-capital-site`；
`tuyuhun: tuyuhun-fuqisi-city-candidate`；
`turkic: orkhon-turkic-inscriptions`；
`tibetan_empire: tibetan-lhasa-city-site`；
`nanzhao: nanzhao-taihe-city-site`；
`khitan: liao-shangjing-city-site`；
`xia_early: xia-erlitou-archaeological-reference`；
`shang: shang-erlitou-archaeological-reference`；
`zhou_western: western-zhou-fenghao-reference`；
`zhou_eastern: eastern-zhou-luoyang-city-site`；
`qin_state: xianyang-qin-state-palace-site`；
`wu_zhou: mingtang-tiantang-site, shangyang-palace-site`；
`former_liang: guzang-ancient-city-site`；
`western_qin: western-qin-yuanchuan-city-candidate`；
`later_liang: guzang-ancient-city-site`；
`southern_liang: southern-liang-jiangling-city-site`；
`southern_yan: southern-yan-guanggu-city-site`；
`western_liang: dunhuang-western-liang-city-site`；
`northern_yan: northern-yan-longcheng-tomb`；
`song_northern: kaifeng-northern-song-city-site`；
`song_south: linan-southern-song-imperial-city-site`；
`western_xia: western-xia-imperial-tombs`；
`jin_jurchen: jin-huining-city-site`；
`western_liao: western-liao-balasagun-site`；
`dali: dali-city-site`；
`mongol: mongol-karakorum-city-site`；
`yuan: yuan-shangdu-site`；
`northern_yuan: northern-yuan-khan-court-landscape`；
`ming: ming-yingtian-imperial-city-site`；
`ming_southern: nanming-yingtian-imperial-city, nanming-fuzhou-xinggong-site, shaowu-junchen-tomb, nanming-yongli-zhaoqing-palace`；
`later_jin: later-jin-hetu-ala-city-site`；
`qing: qing-shengjing-palace-city-site`；
`republic: republic-nanjing-presidential-palace-site`；
`prc: prc-tiananmen-ceremony-site`；
`wu_ten: yang-wu-yangzhou-city-site`；
`southern_tang: southern-tang-jiankang-city-site`；
`wuyue: wuyue-qian-king-mausoleum`；
`min: min-wang-mausoleum`；
`southern_han: southern-han-king-mausoleum`；
`chu_ten: ma-chu-tan-zhou-city-site`；
`former_shu: former-shu-yongling`；
`later_shu: later-shu-chengdu-city-site`；
`jingnan: jingnan-jiangling-city-site`；
`northern_han: jinyang-ancient-city-site`。

## 测试

新增独立测试：[`src/data/polity-detail-round109-learning.audit.test.ts`](../../src/data/polity-detail-round109-learning.audit.test.ts)

定向命令：

```bash
npm test -- --run src/data/polity-detail-round109-learning.audit.test.ts
```

结果：2 tests passed。测试将 116 个现有学习视图缺口（遗产 110、事件 5、人物 1）固化为待集成基线；若引用解析断链、详情抽屉直连断链、首都出现新缺口，或事件/人物已知缺口发生变化，测试会失败。
