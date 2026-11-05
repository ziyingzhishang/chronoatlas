# 三国终止期疆域缺口复核：263、265年

状态：逐年史事与来源已核对（`source-checked`）；魏、蜀疆域面继续留空。机器可校验的年度结论见 [three-kingdoms-terminations-263-265.json](./three-kingdoms-terminations-263-265.json)。对应台账为 `gap-shu_three-263-263` 与 `gap-wei_three-265-265`。

## 逐年结论

| 政权与公历年 | 史事和空间表达 | 边界判断 |
| --- | --- | --- |
| 蜀汉，263 | 魏军分路伐蜀，姜维退守剑阁，邓艾经阴平趋成都，刘禅年内投降。地图显示成都中心点，仅表示蜀汉终止年前的中央所在地。 | 军队进击、投降和后续接管是有先后的事件，不能压成蜀汉或魏在263年全年的稳定控制边界；不以262年轮廓回填。 |
| 曹魏，265 | 魏以洛阳为禅代前政治中心；司马昭八月去世、十二月魏晋禅代。地图显示洛阳中心点，吴仍作为并存政权。 | 年内禅代不证明魏或晋任何一方全年控制区；西晋跨年来源几何仅在265年拦截待审，未裁剪、转归或作为魏疆界。 |
| 吴，265 | 吴在冬季由建业迁都武昌，地图以武昌年末中心点表达。 | 原Cliopatria 263—269年几何跨越迁都阶段，265年挂待审并从运行帧隐藏；点位不表示疆界。 |

## 历史地图参考

Herrmann 与 Westermann 1935年《Historical and Commercial Atlas of China》Map 16 的题名为 “The Three Kingdoms, 220–265/280 A.D.”，适合作为跨时段空间概览交叉参考。Commons文件页标记 Public Domain Mark 1.0；这是来源页面的权利状态标记，不替代项目对版本、使用方式和公开展示条件的核验。由于地图时间范围宽，无法单独确认263年蜀汉终止或265年魏晋禅代的年内控制转换。本项目没有复制图像或数字化边线。

## 地图运行和审核

- 263年蜀汉只显示成都D级中心点；蜀汉来源面不延伸至终止年。魏军攻取和蜀汉降附没有被转换成魏的全年疆域。
- 265年曹魏只显示洛阳D级中心点。西晋来源 `clio-1376-jin_western-265` 在265年由 `requires-review` 拦截，266年起恢复原来源时段；没有按年内禅代裁切或转归几何。
- 吴265年显示武昌D级年末中心点；来源 `clio-1373-wu_three-263` 在265年由 `requires-review` 拦截，266年起按原来源区间显示。
- 地图状态标题分别写为“蜀汉中央政权终止—曹魏承接；吴并存”（263）和“魏—晋交替；吴并存”（265），使仍在位的吴不因主政权转换而从年度摘要中消失。
- 两个 coverage 决策均为 `leave-unfilled`、`sourceBoundaryIds` 为空。现有地图点位和来源区间几何不是独立历史、制图审核通过或公开发布批准的证明。

## 来源

1. 司马光，《资治通鉴》卷七十八·魏纪十，[维基文库文本](https://zh.wikisource.org/zh-hans/資治通鑑/卷078)。核对263年伐蜀部署、剑阁、阴平道、成都投降及蜀汉终止；战役过程不直接复原全年控制线。
2. 司马光，《资治通鉴》卷七十九·晋纪一，[维基文库文本](https://zh.wikisource.org/zh-hans/資治通鑑/卷079)。核对265年司马昭去世、魏晋禅代、曹奂迁封及吴冬季迁都武昌。
3. Albert Herrmann and Georg Westermann, *Historical and Commercial Atlas of China* (1935), Map 16, p. 25, [Wikimedia Commons file page](https://commons.wikimedia.org/wiki/File:The_Three_Kingdoms_220-265_280_AD.jpg) and [archive scan](https://archive.org/details/kpbc.umk.pl.Kartografia_040_POWER_001_10_258359/page/n17/mode/2up). 作为220—265/280年的宽时段地图参考，不作为263年或265年逐年边界；Commons标记Public Domain Mark 1.0。
4. 吴武昌城市级近似定位使用已有来源 `wuchang-wu-capital-location`；不表示鄂州吴王城遗址的精确坐标或城墙范围。
