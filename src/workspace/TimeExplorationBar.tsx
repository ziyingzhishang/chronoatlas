import { useEffect, useRef } from 'react';
import {
  TIMELINE_MAX_YEAR,
  formatHistoricalYear,
  indexToYear,
  yearToIndex,
  type YearWindow,
} from '../domain/timeline';
import { useLocale } from '../i18n/locale';
import type { PanePresentation } from './layout';

export interface TimeExplorationBarProps {
  year: number;
  eraLabel?: string;
  viewWindow: YearWindow;
  isPlaying: boolean;
  presentation: PanePresentation;
  analysisOpen: boolean;
  onYearChange: (year: number) => void;
  onYearCommit: (year: number) => void;
  onPlayToggle: () => void;
  onOpenAnalysis: () => void;
}

export function TimeExplorationBar({
  year,
  eraLabel,
  viewWindow,
  isPlaying,
  presentation,
  analysisOpen,
  onYearChange,
  onYearCommit,
  onPlayToggle,
  onOpenAnalysis,
}: TimeExplorationBarProps) {
  const { t } = useLocale();
  const scrubber = useRef<HTMLInputElement>(null);
  const changeRef = useRef(onYearChange);
  const commitRef = useRef(onYearCommit);
  changeRef.current = onYearChange;
  commitRef.current = onYearCommit;

  const index = yearToIndex(year);
  const windowStart = yearToIndex(viewWindow[0]);
  const windowEnd = yearToIndex(viewWindow[1]);
  const scrubberValue = Math.max(windowStart, Math.min(index, windowEnd));
  const showReading = presentation === 'wide' || presentation === 'narrow';
  const showScrubber = presentation === 'wide';
  const yearLabel = t(formatHistoricalYear(year));
  const localizedEra = eraLabel ? t(eraLabel) : '';
  const accessibleLabel = [t('时间探索'), yearLabel, localizedEra].filter(Boolean).join(' · ');

  useEffect(() => {
    const input = scrubber.current;
    if (!input) return undefined;
    const commit = () => commitRef.current(indexToYear(input.valueAsNumber));
    input.addEventListener('change', commit);
    return () => input.removeEventListener('change', commit);
  }, [showScrubber]);

  const step = (delta: -1 | 1) => {
    const nextYear = indexToYear(index + delta);
    changeRef.current(nextYear);
    commitRef.current(nextYear);
  };

  return <div className={`time-exploration-bar presentation-${presentation}`} role="group" aria-label={accessibleLabel}>
    {showReading && <div className="time-exploration-reading" aria-hidden="true">
      <strong>{yearLabel}</strong>
      {localizedEra && <span>{localizedEra}</span>}
    </div>}
    <div className="time-exploration-actions">
      <button type="button" aria-label={t('上一年')} disabled={index === 0} onClick={() => step(-1)}>−1</button>
      <button type="button" className="time-exploration-play" aria-label={t(isPlaying ? '暂停' : '播放')} onClick={onPlayToggle}>{t(isPlaying ? '暂停' : '播放')}</button>
      <button type="button" aria-label={t('下一年')} disabled={year === TIMELINE_MAX_YEAR} onClick={() => step(1)}>+1</button>
    </div>
    {showScrubber && <input
      ref={scrubber}
      className="time-exploration-scrubber"
      type="range"
      min={windowStart}
      max={windowEnd}
      value={scrubberValue}
      aria-label={t('快速浏览年份')}
      onInput={(event) => changeRef.current(indexToYear(event.currentTarget.valueAsNumber))}
      onChange={() => { /* Native change commits after the input preview. */ }}
    />}
    <button
      type="button"
      className="time-analysis-open"
      aria-expanded={analysisOpen}
      aria-controls="time-analysis-panel"
      onClick={onOpenAnalysis}
    >{t('打开时间轴')}</button>
  </div>;
}
