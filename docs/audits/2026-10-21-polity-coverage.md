# 全局政权建政与关系覆盖审计

审计日期：2026-10-21

## 口径

- 审计对象是 `src/data/polities.ts` 中的全部政权目录，共 87 条。
- 建政/建立节点只认 `event-details.ts` 中显式关联该政权、且标题、摘要或阶段明确表达建立、建国、即位、改国号、政权形成等语义的事件。
- 人物只纳入人物目录中显式声明 `polityIds` 的人物；多政权事件的参与者不因参加事件而自动归属于每个政权。
- 关系只纳入 `claims.ts` 中以该政权为对象的显式关系，例如 `founded`、`ruled`、`succeeded`。
- 来源只纳入现有 `sourceNotes` 可解析的来源 ID。起止年、描述、都城或边界记录不会被反推成建政史实。

## 总体结果

| 指标 | 结果 |
| --- | ---: |
| 政权总数 | 87 |
| 有明确建政/建立节点 | 11 |
| 建政事件覆盖率 | 11/87 = 12.64% |
| 缺少建政节点 | 76 |
| 缺少关联人物 | 71 |
| 缺少明确关系 | 83 |
| 事件详情引用目录外关联事件 | 9 个政权 |
| 缺少可解析来源 | 0 |

已明确纳入的建政节点：秦—`qin-unification`；西汉—`han-imperial-accession`；东汉—`eastern-han-restores-changan`；魏、蜀汉、吴—`three-kingdoms`；东晋—`eastern-jin`；北周—`northern-zhou-changan`；唐—`tang-founded`；后梁—`five-dynasties`。

## 缺口分类

- `missing-establishment-event`：现有事件详情没有足够明确的建政/政权成立节点；不能用 `startYear` 代替。
- `missing-associated-person`：没有人物通过 `polityIds` 明确关联；不能从政权名称或事件参与者臆测建国者。
- `missing-explicit-relationship`：没有 claims 以该政权为对象建立明确关系；不能把都城、边界或同场事件当作人物关系。
- `unresolved-event-reference`：事件详情的 `relatedEventIds` 指向当前事件详情目录之外的 ID；这是数据索引缺口，不是史实结论。
- `missing-source`：当前结果未出现。每条政权目录至少有一个来源，且来源 ID 均能在 `sourceNotes` 中解析。

## 逐政权结果

“—”表示当前没有明确可纳入项；缺口代码见上节。

| ID | 政权 | 建政节点 | 人物 | 现有关联事件 | 明确关系 | 来源 | 缺口 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `han_warring` | 韩 | — | — | `partition-jin`, `qin-unification` | — | `modern-geography-reference`, `zizhi-tongjian` | 建政、人物、关系 |
| `zhao_warring` | 赵 | — | — | `partition-jin`, `qin-unification` | — | `modern-geography-reference`, `zizhi-tongjian` | 建政、人物、关系 |
| `wei_warring` | 魏 | — | — | `partition-jin`, `qin-unification` | — | `modern-geography-reference`, `zizhi-tongjian` | 建政、人物、关系 |
| `chu_warring` | 楚 | — | — | `qin-unification` | — | `modern-geography-reference`, `zizhi-tongjian` | 建政、人物、关系 |
| `yan_warring` | 燕 | — | — | `qin-unification` | — | `modern-geography-reference`, `zizhi-tongjian` | 建政、人物、关系 |
| `qi_warring` | 齐 | — | — | `qin-unification` | — | `modern-geography-reference`, `zizhi-tongjian` | 建政、人物、关系 |
| `qin` | 秦 | `qin-unification` | `meng-tian`, `qin-shi-huang` | `chu-han-contention`, `qin-unification`, `qin-xianyang-capital`, `qin-xianyang-unification` | — | `modern-geography-reference`, `zizhi-tongjian` | 关系 |
| `han_western` | 西汉 | `han-imperial-accession` | `han-xin`, `huo-qubing`, `liu-bang`, `xiao-he`, `zhang-qian` | `chu-han-contention`, `han-changan-new-city`, `han-imperial-accession`, `han-wudi-expands-changan` | `claim-liu-bang-founded-han` / founded | `modern-geography-reference`, `zizhi-tongjian` | 事件索引 |
| `xin` | 新 | — | `wang-mang` | `gengshi-enters-changan` | `claim-wang-mang-founded-xin` / founded | `zizhi-tongjian` | 建政、事件索引 |
| `han_eastern` | 东汉 | `eastern-han-restores-changan` | `ban-gu`, `liu-xiu` | `dong-zhuo-changan`, `eastern-han-moves-luoyang`, `eastern-han-restores-changan` | — | `modern-geography-reference`, `zizhi-tongjian` | 关系、事件索引 |
| `wei_three` | 魏 | `three-kingdoms` | — | `red-cliffs`, `three-kingdoms` | — | `zizhi-tongjian` | 人物、关系 |
| `shu_three` | 蜀汉 | `three-kingdoms` | — | `red-cliffs`, `three-kingdoms` | — | `zizhi-tongjian` | 人物、关系 |
| `wu_three` | 吴 | `three-kingdoms` | — | `jin-unification`, `red-cliffs`, `three-kingdoms` | — | `zizhi-tongjian` | 人物、关系 |
| `jin_western` | 西晋 | — | — | `jin-unification`, `western-jin-loses-changan` | — | `zizhi-tongjian` | 建政、人物、关系 |
| `jin_eastern` | 东晋 | `eastern-jin` | — | `eastern-jin`, `liu-yu-captures-changan` | — | `zizhi-tongjian` | 人物、关系 |
| `cheng_han` | 成汉 | — | — | — | — | `zizhi-tongjian` | 建政、人物、关系 |
| `former_zhao` | 前赵 | — | `liu-yao` | `former-zhao-capital-changan` | — | `zizhi-tongjian` | 建政、关系、事件索引 |
| `later_zhao` | 后赵 | — | — | — | — | `zizhi-tongjian` | 建政、人物、关系 |
| `former_yan` | 前燕 | — | — | — | — | `zizhi-tongjian` | 建政、人物、关系 |
| `former_qin` | 前秦 | — | `fu-jian` | — | — | `zizhi-tongjian` | 建政、关系 |
| `later_yan` | 后燕 | — | — | — | — | `zizhi-tongjian` | 建政、人物、关系 |
| `later_qin` | 后秦 | — | `yao-chang`, `yao-xing` | `later-qin-falls-changan`, `liu-yu-captures-changan` | — | `zizhi-tongjian` | 建政、关系、事件索引 |
| `xia` | 夏 | — | `heliAN-bobo` | — | — | `zizhi-tongjian` | 建政、关系 |
| `northern_liang` | 北凉 | — | — | — | — | `zizhi-tongjian` | 建政、人物、关系 |
| `wei_northern` | 北魏 | — | — | — | — | `zizhi-tongjian` | 建政、人物、关系 |
| `song_southern` | 刘宋 | — | — | — | — | `zizhi-tongjian` | 建政、人物、关系 |
| `qi_southern` | 南齐 | — | — | — | — | `zizhi-tongjian` | 建政、人物、关系 |
| `liang_southern` | 南梁 | — | — | — | — | `zizhi-tongjian` | 建政、人物、关系 |
| `chen_southern` | 南陈 | — | — | `sui-unification` | — | `zizhi-tongjian` | 建政、人物、关系 |
| `wei_eastern` | 东魏 | — | — | — | — | `zizhi-tongjian` | 建政、人物、关系 |
| `wei_western` | 西魏 | — | `yu-wen-tai` | `western-wei-changan` | — | `zizhi-tongjian` | 建政、关系 |
| `qi_northern` | 北齐 | — | — | — | — | `zizhi-tongjian` | 建政、人物、关系 |
| `zhou_northern` | 北周 | `northern-zhou-changan` | — | `northern-zhou-changan` | — | `zizhi-tongjian` | 人物、关系 |
| `sui` | 隋 | — | `yang-jian` | `daxing-capital`, `sui-unification`, `tang-founded` | — | `modern-geography-reference`, `zizhi-tongjian` | 建政、关系、事件索引 |
| `tang` | 唐 | `tang-founded` | `an-lushan`, `du-fu`, `li-longji`, `li-shimin`, `li-yuan`, `li-zhi`, `wang-wei`, `wei-zheng`, `wu-zhao`, `xuan-zang` | `an-lushan-rebellion`, `court-moves-luoyang`, `five-dynasties`, `huang-chao-changan`, `tang-changan-occupation`, `tang-founded`, `xuanwu-gate` | `claim-li-shimin-ruled-tang` / ruled; `claim-li-yuan-founded-tang` / founded | `modern-geography-reference`, `zizhi-tongjian` | 事件索引 |
| `liang_later` | 后梁 | `five-dynasties` | `zhu-wen` | `court-moves-luoyang`, `five-dynasties` | — | `zizhi-tongjian` | 关系、事件索引 |
| `tang_later` | 后唐 | — | `li-cunxu` | — | — | `zizhi-tongjian` | 建政、关系 |
| `jin_later` | 后晋 | — | — | — | — | `zizhi-tongjian` | 建政、人物、关系 |
| `han_later` | 后汉 | — | — | — | — | `zizhi-tongjian` | 建政、人物、关系 |
| `zhou_later` | 后周 | — | — | — | — | `china-chronology`, `zizhi-tongjian` | 建政、人物、关系 |
| `xiongnu` | 匈奴 | — | — | — | — | `zizhi-tongjian` | 建政、人物、关系 |
| `goguryeo` | 高句丽 | — | — | — | — | `zizhi-tongjian` | 建政、人物、关系 |
| `silla` | 新罗 | — | — | — | — | `zizhi-tongjian` | 建政、人物、关系 |
| `tuyuhun` | 吐谷浑 | — | — | — | — | `zizhi-tongjian` | 建政、人物、关系 |
| `turkic` | 突厥 | — | — | — | — | `zizhi-tongjian` | 建政、人物、关系 |
| `tibetan_empire` | 吐蕃 | — | — | — | — | `zizhi-tongjian` | 建政、人物、关系 |
| `nanzhao` | 南诏 | — | — | — | — | `zizhi-tongjian` | 建政、人物、关系 |
| `khitan` | 辽 | — | — | — | — | `china-chronology` | 建政、人物、关系 |
| `xia_early` | 夏（约年） | — | — | — | — | `china-chronology` | 建政、人物、关系 |
| `shang` | 商 | — | — | — | — | `china-chronology` | 建政、人物、关系 |
| `zhou_western` | 西周 | — | `zhou-gong-dan`, `zhou-wu` | `zhou-eastward`, `zhou-fenghao-capital` | — | `china-chronology`, `modern-geography-reference`, `zizhi-tongjian` | 建政、关系 |
| `zhou_eastern` | 东周王室 | — | — | `partition-jin`, `zhou-eastward` | — | `china-chronology`, `modern-geography-reference`, `zizhi-tongjian` | 建政、人物、关系 |
| `qin_state` | 秦国 | — | — | — | — | `china-chronology` | 建政、人物、关系 |
| `gengshi` | 更始政权 | — | `liu-xiu`, `liu-xuan` | `gengshi-enters-changan` | `claim-liu-xiu-succeeded-gengshi` / succeeded | `zizhi-tongjian` | 建政、事件索引 |
| `wu_zhou` | 武周 | — | `wu-zhao` | — | — | `zizhi-tongjian` | 建政、关系 |
| `former_liang` | 前凉 | — | — | — | — | `china-chronology` | 建政、人物、关系 |
| `western_qin` | 西秦 | — | — | — | — | `china-chronology` | 建政、人物、关系 |
| `later_liang` | 后凉 | — | — | — | — | `china-chronology` | 建政、人物、关系 |
| `southern_liang` | 南凉 | — | — | — | — | `china-chronology` | 建政、人物、关系 |
| `southern_yan` | 南燕 | — | — | — | — | `china-chronology` | 建政、人物、关系 |
| `western_liang` | 西凉 | — | — | — | — | `china-chronology` | 建政、人物、关系 |
| `northern_yan` | 北燕 | — | — | — | — | `china-chronology` | 建政、人物、关系 |
| `song_northern` | 北宋 | — | — | — | — | `china-chronology` | 建政、人物、关系 |
| `song_south` | 南宋 | — | — | — | — | `china-chronology` | 建政、人物、关系 |
| `western_xia` | 西夏 | — | — | — | — | `china-chronology` | 建政、人物、关系 |
| `jin_jurchen` | 金 | — | — | — | — | `china-chronology` | 建政、人物、关系 |
| `western_liao` | 西辽 | — | — | — | — | `china-chronology` | 建政、人物、关系 |
| `dali` | 大理 | — | — | — | — | `china-chronology` | 建政、人物、关系 |
| `mongol` | 蒙古汗国 | — | — | — | — | `china-chronology` | 建政、人物、关系 |
| `yuan` | 元 | — | — | — | — | `china-chronology` | 建政、人物、关系 |
| `northern_yuan` | 北元 | — | — | — | — | `china-chronology` | 建政、人物、关系 |
| `ming` | 明 | — | — | — | — | `china-chronology` | 建政、人物、关系 |
| `ming_southern` | 南明 | — | — | — | — | `china-chronology` | 建政、人物、关系 |
| `later_jin` | 后金 | — | — | — | — | `china-chronology` | 建政、人物、关系 |
| `qing` | 清 | — | — | — | — | `china-chronology` | 建政、人物、关系 |
| `republic` | 中华民国（大陆时期） | — | — | — | — | `china-chronology` | 建政、人物、关系 |
| `prc` | 中华人民共和国 | — | — | — | — | `china-chronology` | 建政、人物、关系 |
| `wu_ten` | 杨吴 | — | — | — | — | `china-chronology` | 建政、人物、关系 |
| `southern_tang` | 南唐 | — | — | — | — | `china-chronology` | 建政、人物、关系 |
| `wuyue` | 吴越 | — | — | — | — | `china-chronology` | 建政、人物、关系 |
| `min` | 闽 | — | — | — | — | `china-chronology` | 建政、人物、关系 |
| `southern_han` | 南汉 | — | — | — | — | `china-chronology` | 建政、人物、关系 |
| `chu_ten` | 马楚 | — | — | — | — | `china-chronology` | 建政、人物、关系 |
| `former_shu` | 前蜀 | — | — | — | — | `china-chronology` | 建政、人物、关系 |
| `later_shu` | 后蜀 | — | — | — | — | `china-chronology` | 建政、人物、关系 |
| `jingnan` | 荆南 | — | — | — | — | `china-chronology` | 建政、人物、关系 |
| `northern_han` | 北汉 | — | — | — | — | `china-chronology` | 建政、人物、关系 |

## 解释与边界

本报告是当前仓库数据的覆盖审计，不是对中国及世界政权史的完整断言。比如 `yuan`、`prc`、`ming` 等政权目录有起始年和来源，但当前事件详情未建立对应建政节点，因此报告显示为缺口；这表示“当前数据未覆盖”，不表示历史上没有该事件。多政权事件也按显式关联保留，不能由共同参加战争反推每一方的建国者或人物关系。
