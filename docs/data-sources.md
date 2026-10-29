# 数据来源与不确定性说明

更新：2026-10-18。“数据可按年查询”不等于“已经逐年考证”。

## 时间、目录与地名

时间导航前8000—2026年，跳过公元0年；《资治通鉴》前403—959年保留为快捷专题。史前文化及上古王朝为约年分期，不表示逐年断代精度，也不把文化分布当作确定国家疆域。

分期参考[中国国家博物馆古代中国](https://www.chnmuseum.cn/portals/0/web/zt/gudai/en/index.html)、[Met中国史前时间轴](https://www.metmuseum.org/toah/ht/02/eac.html)及项目编年整理。当前中国历史及周边目录87项，不是穷尽名录。年内改朝换代可在同一年列出两政权，不等于全年同时存在。地图另处理唐/武周和后金/清的重复几何。

13个精选古地名仍限于原阅读专题，未逐年校勘更名、迁移与归属；不自动延伸到史前或宋元明清。不能声称各地域当时地名均已补齐。《资治通鉴》支持编年叙事，不是多边形坐标来源。

## 主要疆域来源：Cliopatria v0.2.1

- 作者：Bennett 等 / Seshat Global History Databank。
- [固定版本仓库](https://github.com/Seshat-Global-History-Databank/cliopatria/tree/v0.2.1)、[数据论文](https://doi.org/10.1038/s41597-025-04516-9)。
- 许可：[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)。本项目作名称映射、日期过滤与打包，未改动原始几何坐标；再分发须保留署名、来源、许可及变更声明。
- 原始文件：`cliopatria_polities_only_v021.geojson`，13,797条记录，SHA-256 为 `fc6f0d1e4cc42f45da83522b3696db6f2cc85ec0d12259a85c89b31347b8fc0a`。
- 筛选后中国目录625条时段记录、85个有几何政权；同期世界11,402条记录、1,458个来源实体。数字是记录/标识统计，不是独立历史考证数量、真实国家总数或独立几何数量。

来源是非等间隔时段模型。面积为来源模型的面积字段（平方公里），不是统一核验的真实控制面积。源资料中的臣属、封建层级、战时控制、争议与历史地名并不充分，不能由轮廓实线推导为直辖或确定国界。

### 导入与核对规则

`scripts/import-cliopatria.mjs` 配合 `src/data/cliopatria-mapping.ts`：

1. 只取 Type=POLITY 且无 Components 的单体记录，不将联盟/上层汇总与成员重复填色。保留 MemberOf 供解释，但不是直接管辖证明。
2. 原始名称显式映射稳定ID，按目录存续期取交集；原始起止年另存。拒收的同名中国记录不得再经世界层出现。
3. 保留完整 Polygon/MultiPolygon、孔洞和岛屿，检查WGS84坐标、闭合环、年份和面积；不平滑、不补点、不插值、不用现代省界拼接或强制贴合现代海岸。
4. 世界按世纪分55片，每片对完全相同的几何去重。只载入相关世纪，按当前年区间过滤；旧请求不能污染新年份。无消费者的在途请求会取消，完成结果最多缓存4个世纪。
5. 原始6条记录以0为结束边界。在可选民用纪年中只显示至前1年，原始 sourceTo=0 保留并说明；不是将全部公元前记录作天文纪年位移。

逐政权结果在 `internal/audits/coverage-audit.json`：覆盖年数、缺年区间、原名、最大单条记录与核验备注。`public/data/cliopatria-manifest.json` 保留版本、输入与分片哈希、排除项、许可。这里“核验”指名称、存续期、异常与几何结构检查，**不是逐条边界的学术史料复核**。

### 关键同名、改号与中断

| 来源记录 | 本项目处理 |
| --- | --- |
| Qin / Qin Dynasty | 秦国与秦帝国分开；缺少前221—前219年帝国图，不把秦国末期改名冒充 |
| Han Dynasty / Xin Dynasty | 西汉、新、东汉分开；排除6—13年仅143平方公里汉残片；东汉不延续到三国后期 |
| Western Jin | 来源将两晋合名；317年起按东晋目录分开，名称重分不等于已修正原始边界 |
| Xia | 十六国赫连夏，不是上古夏代 |
| Tang Dynasty | 690—704年归武周，705年复唐只画唐；目录保留年内过渡 |
| Western Qin | 400年降后秦、409年复立；401—408年不列独立政权，也不允许最大补缺填回 |
| Later Zhou | 负年份为东周王室；五代后周仅采用相符年份 |
| Later Liang / Later Liang Dynasty | 十六国后凉与五代后梁分开 |
| Later Jin / Later Jin Dynasty | 五代后晋与满洲后金分开；1636年起归清；拒绝不相符年代记录 |
| Former Jin | 922—925年跨越晋/后唐改号，暂隔离，不作为世界实体与后唐重复；仍待分年补证 |
| Mongol Empire / Yuan Dynasty | 不把整个蒙古帝国换名为元；北元另列，1440—1467年缺口明确标注 |
| Southern Ming | 排除1662年起涉及台湾/三藩的错名记录，不延续南明本体标签 |
| Republic of China | 本目录只展示大陆时期至1949年，不把1950年后记录冒用为大陆控制图 |

年代核对参考：[故宫皇太极资料](https://www.dpm.org.cn/court/lineage/226251.html)、[Met秦代说明](https://www.metmuseum.org/ja/essays/qin-dynasty-221-206-b-c)、[Seshat西晋](https://seshat-db.com/core/polity/254)、[Seshat东晋](https://www.seshat-db.com/core/polity/255)。西秦中断与复立参考天水市公开《甘谷县志》“建置沿革”及[白银区历史沿革](https://www.baiyinqu.gov.cn/zjby/LSYG/art/2022/art_ff671c3713d54aed8ab8becaf280de56.html)。纪年核对不替代每条疆界的地图史料。

## 缺年与最大已收录范围

每一政权优先级：匹配所选年的来源时段 → 恰好同年的旧断面 → 本政权已收录单条记录中面积最大的轮廓（maximum）→ 无资料则留空。

最大参考用浅色、虚线及名称后缀“最大参考”；选中时仍保留虚线。详情显示来源年代与面积，可整体隐藏。它不是多时段并集、不是已证实的历史极大疆域，也不是所选年实际控制。不同年代的参考可能重叠，不得把记录年代改成当前年。

世界层不作缺年最大补缺，也不将旧记录延续到2025—2026年。中国目录2025—2026年若显示轮廓，只能作为带标记的最大已收录参考。

## 旧断面来源

[Historical Basemaps](https://github.com/aourednik/historical-basemaps)，André Ourednik 及贡献者，GPL-3.0；24个年份、51个图形、14,122个坐标点。原始许可、SHA-256和排除规则保存在 `public/data/boundary-manifest.json` 与 `public/data/licenses/`。

只在所选年没有适用新时段、且旧资料恰好同年时使用；不再采用“100年内邻近断面”。此前500年Jin Empire、700年Sui Empire、900年Tibetan Empire、1400年Great Khanate、1914年Manchu Empire等可疑标注仍不自动改名引入。

## 仍待补证

- 夏代和更始政权仍无可重发布的确定国界；当前分别显示二里头D级文化核心和宛城／洛阳／长安D级控制中心，不计入确定疆域覆盖率。
- 春秋诸侯、地方政权、战争控制、羁縻/臣属及争议范围尚不完整；85/87不是全部中国历史的覆盖率。
- 同一形状可能连续多年重复，不能把逐年查询称为完成逐年修界。
- 世界部分保留英文原名及上游年代；未逐国独立校勘。跨改号、同名实体与近现代边界需继续核实。未着色不等于无人居住或没有政权。
- 底图是现代海岸、河流和地形；古今差异及源数据精度仍可能造成视觉不贴合。高精度需许可合适的历史GIS/地图集逐时期校勘，不能靠加密点、平滑或裁海岸伪造。
- 中国几何当前进入首屏JS；世界最大世纪片约19.9 MB，公开部署前仍需性能优化。

已检查但未打包：[CHGIS V6](https://chgis.fas.harvard.edu/data/chgis/v6/)有用途/再分发限制；[Hartwell](https://chgis.fas.harvard.edu/data/hartwell/)用现代县单元近似历史区域，不能当精确古界。

## 现代地貌底图

公开发布合规状态记录在 `public/data/map-release-compliance.json`。当前状态为 `research-only`，未填写审图号，因此 `npm run verify:map-release` 必须受控失败。标准地图与送审参考入口为自然资源部地图技术审查中心的[标准地图服务系统](https://bzdt.tianditu.gov.cn/)；不得借用无关项目审图号。

- 地形：[Esri World Shaded Relief](https://resources.arcgis.com/en/help/data-appliance/5.1/01tp/01tp0000003s000000.htm)，Esri、USGS、NOAA。
- 影像：[Esri World Imagery](https://doc.arcgis.com/en/data-appliance/2024/maps/world-imagery.htm)，Esri、Maxar、Earthstar Geographics及GIS User Community。
- 在线瓦片不作离线打包；断网保留 world-atlas / Natural Earth 本地陆地轮廓，不显示现代行政线。
- MapLibre提供缩放、旋转、平移及俯仰；俯仰不是高程网格驱动的三维山体。

## 复现与扩展

用Node 24运行 `node scripts/import-cliopatria.mjs /absolute/path/cliopatria_polities_only_v021.geojson`。先核对输入版本及哈希，再运行完整测试与生产构建。增删目录或日期规则后须重新生成数据、覆盖清单和分片，不只改界面年表。

新增资料须有用途许可、出处、时间粒度、控制关系、不确定性及原始几何；为改朝、复国、断年及异步换年先写失败测试。禁止用现代国界、另一朝代或模型猜出的边界补空。
