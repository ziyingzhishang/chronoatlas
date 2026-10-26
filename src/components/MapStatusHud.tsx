import { useLocale } from '../i18n/locale';

export interface MapStatusHudProps {
  yearLabel: string;
  eraLabel?: string;
  viewLabel: string;
  distanceLabel: string;
  windowLabel: string;
  expanded: boolean;
  onToggle: () => void;
}

export function MapStatusHud({ yearLabel, eraLabel, viewLabel, distanceLabel, windowLabel, expanded, onToggle }: MapStatusHudProps) {
  const { t } = useLocale();
  return <button className="map-status-hud" type="button" aria-label={t('当前历史状态')}
    aria-expanded={expanded} aria-controls="directory-popover" onClick={onToggle}>
    <span className="map-status-primary">
      <strong className="map-status-year">{t(yearLabel)}</strong>
      {eraLabel && <span className="map-status-era">{t(eraLabel)}</span>}
      <span className="map-status-view">{t(viewLabel)}</span>
      <span className="map-status-distance">{distanceLabel}</span>
    </span>
    <span className="map-status-window">{windowLabel}</span>
  </button>;
}
