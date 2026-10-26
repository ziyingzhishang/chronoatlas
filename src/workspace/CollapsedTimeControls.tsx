import { TIMELINE_MAX_YEAR, formatHistoricalYear, indexToYear, yearToIndex } from '../domain/timeline';
import { useLocale } from '../i18n/locale';

export interface CollapsedTimeControlsProps {
  year: number;
  eraLabel?: string;
  isPlaying: boolean;
  onYearChange: (year: number) => void;
  onPlayToggle: () => void;
}

export function CollapsedTimeControls({ year, eraLabel, isPlaying, onYearChange, onPlayToggle }: CollapsedTimeControlsProps) {
  const { t } = useLocale();
  const index = yearToIndex(year);
  return <div className="collapsed-time-controls" role="group" aria-label={t('简明时间控制')}>
    <div className="collapsed-time-reading">
      <strong>{t(formatHistoricalYear(year))}</strong>
      {eraLabel && <span>{t(eraLabel)}</span>}
    </div>
    <div className="collapsed-time-actions">
      <button type="button" aria-label={t('上一年')} disabled={index === 0} onClick={() => onYearChange(indexToYear(index - 1))}>−1</button>
      <button type="button" className="collapsed-play" aria-label={t(isPlaying ? '暂停' : '播放')} onClick={onPlayToggle}>{t(isPlaying ? '暂停' : '播放')}</button>
      <button type="button" aria-label={t('下一年')} disabled={year === TIMELINE_MAX_YEAR} onClick={() => onYearChange(indexToYear(index + 1))}>+1</button>
    </div>
  </div>;
}
