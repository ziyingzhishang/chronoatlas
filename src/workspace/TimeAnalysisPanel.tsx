import { useEffect, useState, type ReactNode } from 'react';
import { Timeline, DEFAULT_TIMELINE_WINDOW, FULL_TIMELINE_WINDOW, type HistoricalPeriod } from '../components/Timeline';
import { TIMELINE_MAX_YEAR, TONGJIAN_RANGE, formatHistoricalYear, type YearWindow } from '../domain/timeline';
import type { HistoricalEvent } from '../domain/types';
import { useHistoricalContent } from '../content/ContentContext';
import { useLocale } from '../i18n/locale';
import type { TimelineAnnotationLayer } from './time-navigation-state';
import type { PanePresentation } from './layout';

export interface TimeAnalysisPanelProps {
  year: number;
  onYearChange: (year: number) => void;
  onYearCommit?: (year: number) => void;
  annotationLayer: TimelineAnnotationLayer;
  onAnnotationLayerChange: (layer: TimelineAnnotationLayer) => void;
  onClose: () => void;
  onEventSelect?: (event: HistoricalEvent) => void;
  onEventGroup?: (ids: string[]) => void;
  viewWindow?: YearWindow;
  onViewWindowChange?: (window: YearWindow) => void;
  onSemanticViewChange?: (window: YearWindow, label: string) => void;
  viewLabel?: string;
  canGoBack?: boolean;
  onBackView?: () => void;
  advancedTools?: ReactNode;
  presentation?: PanePresentation;
}

const sameRange = (left: YearWindow, right: YearWindow) => left[0] === right[0] && left[1] === right[1];
const shortYear = (year: number) => year < 0 ? `前${-year}` : `公元${year}`;

export function TimeAnalysisPanel({
  year,
  onYearChange,
  onYearCommit,
  annotationLayer,
  onAnnotationLayerChange,
  onClose,
  onEventSelect,
  onEventGroup,
  viewWindow,
  onViewWindowChange,
  onSemanticViewChange,
  viewLabel,
  canGoBack,
  onBackView,
  advancedTools,
  presentation = 'wide',
}: TimeAnalysisPanelProps) {
  const { t } = useLocale();
  const { catalog } = useHistoricalContent();
  const periods: readonly HistoricalPeriod[] = catalog.periods;
  const [localWindow, setLocalWindow] = useState<YearWindow>(DEFAULT_TIMELINE_WINDOW);
  const window = viewWindow ?? localWindow;
  const displayedViewLabel = viewLabel ?? `${formatHistoricalYear(window[0])}—${formatHistoricalYear(window[1])}`;

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopImmediatePropagation();
      onClose();
    };
    document.addEventListener('keydown', closeOnEscape, true);
    return () => document.removeEventListener('keydown', closeOnEscape, true);
  }, [onClose]);

  const updateWindow = (next: YearWindow) => {
    if (sameRange(next, window)) return;
    if (viewWindow === undefined) setLocalWindow(next);
    onViewWindowChange?.(next);
  };

  const chooseRange = (range: YearWindow, label: string) => {
    if (sameRange(range, window)) return;
    onSemanticViewChange?.(range, label);
    updateWindow(range);
  };

  const focusPeriod = (period: HistoricalPeriod) => {
    chooseRange([period.start, period.end], period.name);
  };

  return <section id="time-analysis-panel" className={`time-analysis-panel presentation-${presentation}`} aria-label={t('时间分析')}>
    <header className="time-analysis-header">
      <h2>{t('时间分析')}</h2>
      <div className="timeline-view-context">
        <span>{t('当前视窗')}：{t(displayedViewLabel)}</span>
        {canGoBack && <button type="button" onClick={onBackView}>{t('返回上一级')}</button>}
      </div>
      <button type="button" aria-label={t('关闭时间分析')} onClick={onClose}>×</button>
    </header>
    <div className="timeline-navigation">
      <div className="range-presets" role="group" aria-label={t('历史范围')}>
        <button aria-pressed={sameRange(window, FULL_TIMELINE_WINDOW)} onClick={() => chooseRange(FULL_TIMELINE_WINDOW, '全历史')}>{t('全历史')}</button>
        <button aria-pressed={sameRange(window, DEFAULT_TIMELINE_WINDOW)} onClick={() => chooseRange(DEFAULT_TIMELINE_WINDOW, '王朝至今')}>{t('王朝至今')}</button>
        <button className="tongjian-button" aria-label={t('聚焦资治通鉴 前403年至959年')} aria-pressed={sameRange(window, TONGJIAN_RANGE)} onClick={() => chooseRange(TONGJIAN_RANGE, '《资治通鉴》')}>{t('《资治通鉴》')}<small>{t('前403—959')}</small></button>
      </div>
      <label className="period-select">{t('朝代')}
        <select aria-label={t('选择朝代并放大时间轴')} value="" onChange={(event) => {
          const period = periods.find((candidate) => candidate.id === event.target.value);
          if (period) focusPeriod(period);
        }}>
          <option value="" disabled>{t('选择朝代 / 时期')}</option>
          {periods.map((period) => <option key={period.id} value={period.id}>{t(period.name)}{t(period.approximate ? '（约）' : '')} · {t(shortYear(period.start))}—{t(shortYear(period.end))}</option>)}
        </select>
      </label>
      <div className="time-annotation-controls" role="group" aria-label={t('时间注释')}>
        {([
          ['none', '无'],
          ['events', '历史事件'],
          ['changes', '资料变化'],
        ] as const).map(([layer, label]) => <button key={layer} type="button" aria-pressed={annotationLayer === layer} onClick={() => onAnnotationLayerChange(layer)}>{t(label)}</button>)}
      </div>
      {advancedTools && <details className="time-advanced-tools"><summary>{t('更多时间工具')}</summary>{advancedTools}</details>}
    </div>
    <Timeline
      year={year}
      onYearChange={onYearChange}
      onYearCommit={onYearCommit}
      annotationLayer={annotationLayer}
      onEventSelect={onEventSelect}
      onEventGroup={onEventGroup}
      viewWindow={window}
      onViewWindowChange={updateWindow}
      onSemanticViewChange={onSemanticViewChange}
    />
  </section>;
}
