import { formatHistoricalYear } from '../domain/timeline';
import { useLocale } from '../i18n/locale';
import { useHistoricalContent } from '../content/ContentContext';

export function MapReadingGuide({year}: {year: number}) {
  const {t} = useLocale();
  const {catalog} = useHistoricalContent();
  const notice = catalog.sovereigntyNotices[0];
  if (!notice) return null;
  return <section className="map-reading-guide" aria-labelledby="modern-sovereignty-heading">
    <h3 id="modern-sovereignty-heading">{t('现代地理与主权说明')}</h3>
    <p>{t(notice.statement)}</p>
    <p>{t(notice.modernReferenceNote)}</p>
    <p className="detail-note">{t('本说明属于现代地理与主权标注，不表示')}{t(formatHistoricalYear(year))}{t('的政治实况。')}</p>
    <ul className="source-links">
      {notice.citations.map(citation => <li key={citation.title}>
        <a href={citation.urlOrCitation} target="_blank" rel="noreferrer">{t(citation.title)}</a>
      </li>)}
    </ul>
  </section>;
}
