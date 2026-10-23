# 人物—政权显式关系闭环审计（2026-10-23）

本轮针对审计缺口 `chu_warring`、`yan_warring`、`qi_warring`、`qin`、`han_eastern`、`wei_three`、`shu_three`、`former_qin`、`tang_later`、`tuyuhun`、`turkic`、`wu_zhou`、`later_liang`、`southern_liang`、`western_liang`、`yuan`、`jingnan`，补入最小的 person→polity 显式关系。每条关系均要求人物端点、政权端点、有效年代、来源 ID 可解析，并以 `founded` 或 `ruled` 表达治理语义。

| 政权 | 人物 | claim | 语义 | 年代 | 来源 |
|---|---|---|---|---:|---|
| 楚（战国） | 楚威王 `chu-we-wang` | `claim-chu-we-wang-ruled-chu-warring-closure` | ruled | -339—-329 | 《资治通鉴》、中国历史分期年表 |
| 燕（战国） | 燕昭王 `yan-zhaowang` | `claim-yan-zhaowang-ruled-yan-warring-closure` | ruled | -311—-279 | 《资治通鉴》、中国历史分期年表 |
| 齐（战国） | 齐威王 `qi-we-wang` | `claim-qi-we-wang-ruled-qi-warring-closure` | ruled | -356—-320 | 《资治通鉴》、中国历史分期年表 |
| 秦帝国 | 嬴政 `qin-shi-huang` | `claim-qin-shi-huang-ruled-qin-closure` | ruled | -246—-210 | 《资治通鉴》、中国历史分期年表 |
| 东汉 | 刘秀 `liu-xiu` | `claim-liu-xiu-ruled-han-eastern-closure` | ruled | 25—57 | 《资治通鉴》 |
| 曹魏 | 曹操 `cao-cao` | `claim-cao-cao-ruled-wei-three-closure` | ruled | 208—220 | 《资治通鉴》、中国历史分期年表 |
| 蜀汉 | 刘备 `liu-bei` | `claim-liu-bei-ruled-shu-three-closure` | ruled | 221—223 | 《资治通鉴》、中国历史分期年表 |
| 前秦 | 苻坚 `fu-jian` | `claim-fu-jian-ruled-former-qin-closure` | ruled | 357—385 | 《资治通鉴》 |
| 后唐 | 李存勖 `li-cunxu` | `claim-li-cunxu-ruled-tang-later-closure` | ruled | 923—926 | 《资治通鉴》 |
| 吐谷浑 | 慕容吐谷浑 `murong-tuyuhun` | `claim-murong-tuyuhun-ruled-tuyuhun-closure` | ruled | 313—317（约） | 《资治通鉴》、中国历史分期年表 |
| 突厥 | 阿史那土门 `asina-tumen` | `claim-asina-tumen-ruled-turkic-closure` | ruled | 552—553（约） | 突厥史料数据库、中国历史分期年表 |
| 武周 | 武曌 `wu-zhao` | `claim-wu-zhao-ruled-wu-zhou-closure` | ruled | 690—705 | 《资治通鉴》 |
| 后凉 | 吕光 `lv-guang` | `claim-lv-guang-ruled-later-liang-closure` | ruled | 386—399 | 《资治通鉴》、中国历史分期年表 |
| 南凉 | 秃发乌孤 `tufa-wugu` | `claim-tufa-wugu-founded-southern-liang-closure` | founded | 397 | 《资治通鉴》、中国历史分期年表 |
| 西凉 | 李暠 `li-hao` | `claim-li-hao-ruled-western-liang-closure` | ruled | 400—417 | 《资治通鉴》、中国历史分期年表 |
| 元 | 忽必烈 `kublai` | `claim-kublai-ruled-yuan-closure` | ruled | 1271—1294 | 元代历史沿革与疆域行政建置资料、刘秉忠与元初建国制度资料 |
| 荆南 | 高季兴 `gao-jixing` | `claim-gao-jixing-ruled-jingnan-closure` | ruled | 924—929 | 《资治通鉴》、中国历史分期年表 |

## 南凉特殊闭环

南凉原无可解析人物节点。本轮新增 `tufa-wugu` 到 `people.ts`，设置 `polityIds: ['southern_liang']`，并新增对应 `person-details.ts` 条目和 397 年 `founded` claim。南凉后续由秃发利鹿孤、秃发傉檀承接，未把南凉全期错误归入秃发乌孤个人统治。

## 证据边界

本轮未使用共同事件参与关系推断 person→polity。曹操条明确写为曹魏前身的实际军政核心，未把220年曹丕称帝前推为曹操称帝；吐谷浑、突厥条保留形成期/草原政治流动性说明；南凉条只标记秃发乌孤建立节点。以上均未达到“单一人物覆盖整个政权存续期”的强断言。

本轮 17 个目标均达到当前项目的最小证据标准，因此没有新增残留缺口。`src/data/event-details.ts` 未修改，也未修改目录外事件引用。已有的 `docs/audits/2026-10-20-short-gap-decisions.md` 未提交改动保持不变。
