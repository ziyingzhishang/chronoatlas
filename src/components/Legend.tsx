import { useLocale } from '../i18n/locale';
export function Legend() {
  const { t } = useLocale();
  return (
    <section className="legend" aria-label={t("地图图例")}>
      <h3>{t("图例")}</h3>
      <p className="legend-current">{t("实线＋半透明色面：所选年匹配的来源时段模型。虚线＋浅色面＋“最大参考”：缺年时使用的已收录最大单条轮廓，不是本年实况。两者均非测绘或主权依据；下列控制类型仅在来源具备分类时使用。")}</p>
      <div className="legend-group evidence-legend">
        <span className="legend-title">{t("地图表达")}</span>
        <span><i className="legend-evidence level-a" />{t("有来源支持的范围")}</span>
        <span><i className="legend-evidence level-b" />{t("数字化参考范围")}</span>
        <span><i className="legend-evidence level-c" />{t("过渡或最大参考范围")}</span>
        <span><i className="legend-evidence level-d" />{t("文化核心或影响范围")}</span>
        <span>{t("资料不足时留空")}</span>
      </div>
      <div className="legend-group">
        <span className="legend-title">{t("首都／政治中心")}</span>
        <span><i className="legend-capital" />{t("金色标记：历史首都；标签下方显示今地名")}</span>
      </div>
      <div className="legend-group">
        <span className="legend-title">{t("控制关系")}</span>
        <span><i className="legend-swatch direct" />{t("直接控制")}</span>
        <span><i className="legend-swatch indirect" />{t("间接控制")}</span>
        <span><i className="legend-swatch disputed" />{t("争议范围")}</span>
        <span><i className="legend-swatch influence" />{t("影响范围")}</span>
      </div>
      <div className="legend-group">
        <span className="legend-title">{t("置信度")}</span>
        <span><i className="legend-opacity high" />{t("高置信度")}</span>
        <span><i className="legend-opacity medium" />{t("中置信度")}</span>
        <span><i className="legend-opacity low" />{t("低置信度")}</span>
      </div>
    </section>
  );
}
