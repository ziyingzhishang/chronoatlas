import { events } from '../data/events';
import { heritageById } from '../data/heritage';
import { people } from '../data/people';
import { places } from '../data/places';
import { polities } from '../data/polities';
import { sourceById } from '../data/sources';
import type { HeritageDetail as HeritageDetailData, HeritagePhaseType } from '../data/heritage-details';
import { useLocale } from '../i18n/locale';

export interface HeritageNavigationTarget {
  type: 'person' | 'polity' | 'event' | 'place';
  id: string;
}

export interface HeritageDetailProps {
  detail: HeritageDetailData;
  heritageName?: string;
  placeId?: string;
  onNavigate?: (target: HeritageNavigationTarget) => void;
  onOpenEntity?: (target: HeritageNavigationTarget) => void;
}

const phaseLabels: Record<HeritagePhaseType, string> = {
  original: '原建筑',
  site: '遗址',
  reconstruction: '后世重建',
  restoration: '现代复原',
};

const fallbackLabels: Record<string, string> = {
  xuanzang: '玄奘',
  'xuanzang-translations': '玄奘取经',
};

function entityLabel(type: HeritageNavigationTarget['type'], id: string): string {
  if (fallbackLabels[id]) return fallbackLabels[id];
  if (type === 'person') return people.find((person) => person.id === id)?.name ?? id;
  if (type === 'polity') return polities.find((polity) => polity.id === id)?.name ?? id;
  if (type === 'place') return places.find((place) => place.id === id)?.historicalName ?? id;
  return events.find((event) => event.id === id)?.title ?? id;
}

function RelatedEntityList({
  type,
  ids,
  onNavigate,
}: {
  type: HeritageNavigationTarget['type'];
  ids: string[];
  onNavigate?: (target: HeritageNavigationTarget) => void;
}) {
  const { t } = useLocale();
  if (ids.length === 0) return <p className="detail-note">{t('暂无已关联资料')}</p>;
  return <ul className="heritage-related-list">
    {ids.map((id) => <li key={id}>
      {onNavigate ? <button type="button" onClick={() => onNavigate({ type, id })}>{t(entityLabel(type, id))}</button> : <span>{t(entityLabel(type, id))}</span>}
    </li>)}
  </ul>;
}

export function HeritageDetail({ detail, heritageName, placeId, onNavigate, onOpenEntity }: HeritageDetailProps) {
  const { t } = useLocale();
  const navigate = onNavigate ?? onOpenEntity;
  const name = heritageName ?? heritageById[detail.heritageId]?.name ?? detail.heritageId;

  return <article className="heritage-detail" aria-label={t('遗产详情')}>
    <header className="heritage-detail-header">
      <p className="eyebrow">{t('遗产详情')}</p>
      <h2>{t(name)}</h2>
      <p className="heritage-detail-location">
        <span>{t('现代位置：')}</span><span>{t(detail.modernLocation)}</span>
        {placeId && <><span>{t('关联地点：')}</span>{navigate ? <button type="button" onClick={() => navigate({ type: 'place', id: placeId })}>{t(entityLabel('place', placeId))}</button> : <span>{t(entityLabel('place', placeId))}</span>}</>}
      </p>
    </header>

    <section className="heritage-detail-section" aria-labelledby="heritage-history-heading">
      <h3 id="heritage-history-heading">{t('建造沿革')}</h3>
      <ol className="heritage-phase-list">
        {detail.constructionHistory.map((item, index) => <li key={`${item.type}-${item.period}-${index}`} className={`heritage-phase heritage-phase-${item.type}`}>
          <div className="heritage-phase-heading"><strong>{t(item.label || phaseLabels[item.type])}</strong><span>{t(item.period)}</span></div>
          <p>{t(item.description)}</p>
          {item.sourceIds.length > 0 && <p className="detail-note heritage-phase-sources">
            <span>{t('阶段依据：')}</span>
            <span>{item.sourceIds.map((sourceId) => t(sourceById[sourceId]?.title ?? sourceId)).join('、')}</span>
          </p>}
          {item.uncertaintyNote && <p className="detail-note"><span>{t('不确定性：')}</span><span>{t(item.uncertaintyNote)}</span></p>}
        </li>)}
      </ol>
    </section>

    <section className="heritage-detail-section" aria-labelledby="heritage-associations-heading">
      <h3 id="heritage-associations-heading">{t('历史关联')}</h3>
      <ul className="heritage-association-list">{detail.historicalAssociations.map((association) => <li key={association}>{t(association)}</li>)}</ul>
    </section>

    <section className="heritage-detail-section" aria-labelledby="heritage-related-people-heading">
      <h3 id="heritage-related-people-heading">{t('关联人物')}</h3>
      <RelatedEntityList type="person" ids={detail.associatedPeople} onNavigate={navigate} />
    </section>

    <section className="heritage-detail-section" aria-labelledby="heritage-related-polities-heading">
      <h3 id="heritage-related-polities-heading">{t('关联政权')}</h3>
      <RelatedEntityList type="polity" ids={detail.associatedPolities} onNavigate={navigate} />
    </section>

    <section className="heritage-detail-section" aria-labelledby="heritage-related-events-heading">
      <h3 id="heritage-related-events-heading">{t('关联事件')}</h3>
      <RelatedEntityList type="event" ids={detail.associatedEvents} onNavigate={navigate} />
    </section>

    <section className="heritage-detail-section" aria-labelledby="heritage-surviving-features-heading">
      <h3 id="heritage-surviving-features-heading">{t('现存特征')}</h3>
      <ul className="heritage-feature-list">{detail.survivingFeatures.map((feature) => <li key={feature}>{t(feature)}</li>)}</ul>
      <p className="heritage-present-day-value">{t('今日价值：')}{t(detail.presentDayValue)}</p>
    </section>

    <section className="heritage-detail-section" aria-labelledby="heritage-evidence-heading">
      <h3 id="heritage-evidence-heading">{t('来源与依据')}</h3>
      <details open>
        <summary>{t('查看来源')}</summary>
        <ul className="heritage-source-list">{detail.sourceIds.map((sourceId) => {
          const source = sourceById[sourceId];
          const sourceTitle = t(source?.title ?? sourceId);
          return <li key={sourceId}><strong>{source?.urlOrCitation?.startsWith('http') ? <a href={source.urlOrCitation} target="_blank" rel="noreferrer">{sourceTitle}</a> : sourceTitle}</strong>{source?.urlOrCitation && <small>{source.urlOrCitation}</small>}{source?.note && <p>{t(source.note)}</p>}</li>;
        })}</ul>
      </details>
      <p className="detail-note"><span>{t('不确定性：')}</span><span>{t(detail.uncertaintyNote)}</span></p>
    </section>
  </article>;
}
