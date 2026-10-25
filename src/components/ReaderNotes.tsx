import { useLocale } from '../i18n/locale';
import { toReaderText, type ReaderNote } from '../presentation/reader-content';

export function ReaderNotes({ note, className = '' }: { note: ReaderNote; className?: string }) {
  const { t } = useLocale();
  const dateDescription = toReaderText(note.dateDescription);
  const uncertainty = toReaderText(note.uncertainty);
  const sources = note.sources.flatMap((source) => {
    const title = toReaderText(source.title);
    if (!title) return [];
    return [{
      ...source,
      title,
      institution: toReaderText(source.institution),
      citation: toReaderText(source.citation),
    }];
  });
  const hasMaterial = Boolean(dateDescription || uncertainty || sources.length);
  return <details className={`reader-notes ${className}`.trim()}>
    <summary>{t('资料说明')}</summary>
    {hasMaterial ? <div className="reader-notes-body">
      {dateDescription && <p><strong>{t('时间范围：')}</strong>{t(dateDescription)}</p>}
      {uncertainty && <p><strong>{t('表达限制：')}</strong>{t(uncertainty)}</p>}
      {sources.length > 0 ? <ul className="source-links">{sources.map((source, index) => <li key={`${source.title}-${source.url ?? source.citation ?? index}`}>
        {source.url ? <a href={source.url} target="_blank" rel="noreferrer">{t(source.title)}</a> : <span>{t(source.title)}</span>}
        {source.institution && <span> · {t(source.institution)}</span>}
        {source.citation && <small>{t(source.citation)}</small>}
      </li>)}</ul> : <p>{t('相关资料尚待补充')}</p>}
    </div> : <p>{t('相关资料尚待补充')}</p>}
  </details>;
}
