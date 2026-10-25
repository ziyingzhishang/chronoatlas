import type { HeritageDetail as HeritageDetailData, HeritagePhaseType } from '../data/heritage-details';
import { useLocale } from '../i18n/locale';
import { useHistoricalContent } from '../content/ContentContext';
import { toReaderSources } from '../presentation/reader-content';
import { ReaderNotes } from './ReaderNotes';

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

function entityLabel(type: HeritageNavigationTarget['type'], id: string, catalog: ReturnType<typeof useHistoricalContent>['catalog']): string {
  if (fallbackLabels[id]) return fallbackLabels[id];
  if (type === 'person') return catalog.people.find((person) => person.id === id)?.name ?? id;
  if (type === 'polity') return catalog.polities.find((polity) => polity.id === id)?.name ?? id;
  if (type === 'place') return catalog.places.find((place) => place.id === id)?.historicalName ?? id;
  return catalog.studyEvents.find((event) => event.id === id)?.title ?? id;
}

function hasEntity(type: HeritageNavigationTarget['type'], id: string, catalog: ReturnType<typeof useHistoricalContent>['catalog']): boolean {
  if (type === 'person') return catalog.people.some((person) => person.id === id);
  if (type === 'polity') return catalog.polities.some((polity) => polity.id === id);
  if (type === 'place') return catalog.places.some((place) => place.id === id);
  return catalog.studyEvents.some((event) => event.id === id);
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
  const { catalog } = useHistoricalContent();
  if (ids.length === 0) return <p className="detail-note">{t('暂无已关联资料')}</p>;
  return <ul className="heritage-related-list">
    {ids.map((id) => {
      const resolved = hasEntity(type, id, catalog);
      return <li key={id}>
        {onNavigate && resolved ? <button type="button" onClick={() => onNavigate({ type, id })}>{t(entityLabel(type, id, catalog))}</button> : <span>{t(entityLabel(type, id, catalog))}</span>}
        {!resolved && <span className="detail-note">（{t('暂无已关联资料')}）</span>}
      </li>;
    })}
  </ul>;
}

export function HeritageDetail({ detail, heritageName, placeId, onNavigate, onOpenEntity }: HeritageDetailProps) {
  const { t } = useLocale();
  const { catalog } = useHistoricalContent();
  const navigate = onNavigate ?? onOpenEntity;
  const name = heritageName ?? catalog.heritage.find((asset) => asset.id === detail.heritageId)?.name ?? detail.heritageId;

  return <article className="heritage-detail" aria-label={t('遗产详情')}>
    <header className="heritage-detail-header">
      <p className="eyebrow">{t('遗产详情')}</p>
      <h2>{t(name)}</h2>
      <p className="heritage-detail-location">
        <span>{t('现代位置：')}</span><span>{t(detail.modernLocation)}</span>
        {placeId && <><span>{t('关联地点：')}</span>{navigate ? <button type="button" onClick={() => navigate({ type: 'place', id: placeId })}>{t(entityLabel('place', placeId, catalog))}</button> : <span>{t(entityLabel('place', placeId, catalog))}</span>}</>}
      </p>
    </header>

    <section className="heritage-detail-section" aria-labelledby="heritage-history-heading">
      <h3 id="heritage-history-heading">{t('建造沿革')}</h3>
      <ol className="heritage-phase-list">
        {detail.constructionHistory.map((item, index) => <li key={`${item.type}-${item.period}-${index}`} className={`heritage-phase heritage-phase-${item.type}`}>
          <div className="heritage-phase-heading"><strong>{t(item.label || phaseLabels[item.type])}</strong><span>{t(item.period)}</span></div>
          <p>{t(item.description)}</p>
          <ReaderNotes className="heritage-phase-sources" note={{ uncertainty: item.uncertaintyNote, sources: toReaderSources(item.sourceIds, catalog.sources) }} />
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

    <ReaderNotes className="heritage-detail-section" note={{ uncertainty: detail.uncertaintyNote, sources: toReaderSources(detail.sourceIds, catalog.sources) }} />
  </article>;
}
