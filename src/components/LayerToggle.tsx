import { useLocale } from '../i18n/locale';
import { allLayers, type MapLayer } from './MapView';

interface LayerToggleProps {
  visibleLayers: Set<MapLayer>;
  onChange: (layer: MapLayer, visible: boolean) => void;
}

const labels: Record<MapLayer, string> = {
  boundaries: '历史疆域',
  places: '历史地名',
  modernReference: '现代参照',
  events: '历史事件',
};

export function LayerToggle({ visibleLayers, onChange }: LayerToggleProps) {
  const { t } = useLocale();
  return (
    <fieldset className="layer-toggle">
      <legend>{t("地图图层")}</legend>
      <div className="layer-options">
        {allLayers.map((layer) => (
          <label key={layer}>
            <input
              type="checkbox"
              checked={visibleLayers.has(layer)}
              onChange={(event) => onChange(layer, event.target.checked)}
            />
            <span>{t(labels[layer])}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
