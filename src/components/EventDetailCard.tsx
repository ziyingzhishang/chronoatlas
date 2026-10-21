import { useLocale } from '../i18n/locale';
import type { HistoricalEvent } from '../domain/types';
import { formatHistoricalYear, indexToYear, yearToIndex, TIMELINE_MIN_YEAR, TIMELINE_MAX_YEAR } from '../domain/timeline';
import { formatSourceField } from '../i18n/source-display';

export interface EventDetailCardProps {
  event: HistoricalEvent;
  year: number;
  onYearChange: (year: number) => void;
  onBack?: () => void;
  onLocate?: (event: HistoricalEvent) => void;
}

export function eventDate(event: HistoricalEvent) {
  return `${event.datePrecision === 'approximate' ? '约 ' : ''}${formatHistoricalYear(event.year)}${event.endYear && event.endYear !== event.year ? `—${formatHistoricalYear(event.endYear)}` : ''}`;
}

export function EventDetailCard({ event, onYearChange, onBack, onLocate }: EventDetailCardProps) {
  const { locale, t } = useLocale();
  return <article className="event-detail" aria-label={t('事件详情')}>
    {onBack && <button className="event-back-to-list" type="button" onClick={onBack}>← {t('返回事件列表')}</button>}
    <div className="event-meta">{t(eventDate(event))} · {t(event.region === 'world' ? '同期世界' : '中国历史')} · {t(event.category ?? '历史转折')}</div>
    <h3>{t(event.title)}</h3>
    <p className="event-lead">{t(event.summary)}</p>
    <p className="event-verification">{t(event.verification === 'checked' ? '已核对所列出处' : '部分依据待进一步核验')}{t(event.locationPrecision === 'approximate' ? ' · 地点为约址' : '')}</p>
    <div className="event-jumps">
      <button disabled={event.year === TIMELINE_MIN_YEAR} onClick={() => onYearChange(indexToYear(yearToIndex(event.year) - 1))}>{t('事件前一年')}</button>
      <button disabled={(event.endYear ?? event.year) === TIMELINE_MAX_YEAR} onClick={() => onYearChange(indexToYear(yearToIndex(event.endYear ?? event.year) + 1))}>{t('事件后一年')}</button>
      {event.coordinates && onLocate && <button onClick={() => onLocate(event)}>{t('定位')}{t(event.locationPrecision === 'approximate' ? '约址' : '地点')}</button>}
    </div>
    {([['背景', event.background], ['经过', event.process], ['影响', event.impact], ['地图解读', event.mapNote]] as const).map(([label, text]) => text && <section className="event-paragraph" key={label}><h4>{t(label)}</h4><p>{t(text)}</p></section>)}
    {!event.coordinates && <p className="detail-note">{t('尚无独立核验的位置，不在地图上推测标点。')}</p>}
    <p className="detail-note">{t('事件与疆域资料分别核验；地图缺图或显示最大参考，不代表本事件的实际控制范围。')}</p>
    <details className="event-sources" open><summary>{t('出处与依据')}</summary>
      {event.references?.length ? event.references.map((source, index) => { const field = formatSourceField('documentTitle', source.title, locale); return <p key={`${source.url}-${index}`}><span className="source-field-label">{field.label}</span><a href={source.url} target="_blank" rel="noreferrer">{field.value}</a>{source.detail && <small>{source.detail}</small>}</p>; }) : <p>{t('具体出处待补，本条不作为已核验史料。')}</p>}
    </details>
  </article>;
}
