import type { CityStudyView, PolityStudyView } from '../domain/study-view';
import { formatHistoricalYear } from '../domain/timeline';
import { useLocale } from '../i18n/locale';
import { groupPersonRelationships } from '../domain/relationships';
import { getHeritageDetail } from '../data/heritage-details';
import { RelationshipGraph } from './RelationshipGraph';
import type { DetailEntity } from '../domain/detail-entity';
import { buildCityHistoryTimeline } from '../domain/city-timeline';
import { CityHistoryTimeline } from './CityHistoryTimeline';

type StudyView = CityStudyView | PolityStudyView;

export function StudyRelationsPanel({ view, onOpenEntity }: { view: StudyView; onOpenEntity?: (entity: DetailEntity) => void }) {
  const { t } = useLocale();
  const cityView = view.kind === 'city' ? view : undefined;
  const polityView = view.kind === 'polity' ? view : undefined;
  const relationshipLabel: Record<string, string> = { founded: '建立', ruled: '统治', succeeded: '承接', commissioned: '营建' };
  const cityTimeline = cityView ? buildCityHistoryTimeline(cityView.subject.id, {
    places: [cityView.subject], polities: cityView.polities, people: cityView.people,
    heritage: cityView.heritage, events: cityView.events, claims: cityView.claims,
    capitalTerms: cityView.capitalTerms,
  }) : undefined;
  const featuredEvents = polityView
    ? view.events.filter((event) => event.year >= polityView.subject.startYear - 10 && event.year <= polityView.subject.startYear + 10).slice(0, 5)
    : view.events.slice(-5);

  return (
    <section className="study-relations" aria-label={t('历史关系研究视图')}>
      <div className="study-relations-heading">
        <span className="eyebrow">{t(cityView ? '城市视角' : '政权视角')}</span>
        <span className="study-year">{t('截至')} {formatHistoricalYear(view.year)}</span>
      </div>
      {cityView && <div className="study-block">
        {cityTimeline && <CityHistoryTimeline nodes={cityTimeline.nodes} missingData={cityTimeline.missingData} onOpenEntity={(entity) => onOpenEntity?.(entity)} />}
      </div>}
      {cityView && <div className="study-block">
        <h3>{t('曾以此地为政治中心的政权')}</h3>
        <ul className="study-chip-list">{cityView.polities.map((polity) => <li key={polity.id}><button type="button" onClick={() => onOpenEntity?.({ type: 'polity', id: polity.id })}>{polity.name}</button></li>)}</ul>
      </div>}
      {polityView && <div className="study-block">
        <h3>{t('首都／政治中心')}</h3>
        {polityView.capitalPlaces.length > 0 ? <ul className="study-list">{polityView.capitalPlaces.map((place) => {
          const terms = polityView.capitalTerms.filter((term) => term.placeId === place.id);
          return <li key={place.id}><button type="button" onClick={() => onOpenEntity?.({ type: 'place', id: place.id })}><strong>{t(place.historicalName)}</strong></button><span>{place.modernName ? `${t('今·')}${t(place.modernName)} · ` : ''}{terms.map((term) => formatHistoricalYear(term.validFrom)).join('、')}</span></li>;
        })}</ul> : <p className="detail-note">{t('暂无已核验沿革')}</p>}
      </div>}
      {polityView && <div className="study-block">
        <h3>{t('相关人物')}</h3>
        <ul className="study-chip-list">{polityView.people.map((person) => {
          const relations = groupPersonRelationships(person.id, view.year, view.claims);
          const relationList = Object.values(relations).flat();
          return <li key={person.id}><button type="button" onClick={() => onOpenEntity?.({ type: 'person', id: person.id })}>{person.name}</button>{relationList.length > 0 && <span className="study-relation-label"> · {relationList.map((relation) => t(relationshipLabel[relation.claim.predicate] ?? relation.claim.predicate)).join('、')}</span>}</li>;
        })}</ul>
      </div>}
      {polityView && <div className="study-block">
        <h3>{t('关系网络')}</h3>
        <RelationshipGraph view={polityView} onOpenEntity={onOpenEntity} />
      </div>}
      <div className="study-block">
        <h3>{t('相关事件')}</h3>
        {featuredEvents.length > 0 ? <ul className="study-list">{featuredEvents.map((event) => <li key={event.id}><button type="button" onClick={() => onOpenEntity?.({ type: 'event', id: event.id })}><strong>{t(event.title)}</strong></button><span>{formatHistoricalYear(event.year)}</span></li>)}</ul> : <p className="detail-note">{t('暂无已关联事件')}</p>}
      </div>
      <div className="study-block">
        <h3>{t('遗产与城市记忆')}</h3>
        {view.heritage.length > 0 ? <ul className="study-list study-heritage-list">{view.heritage.slice(0, 5).map((asset) => { const detail = getHeritageDetail(asset.id); return <li key={asset.id}><details><summary><button type="button" onClick={(event) => { event.preventDefault(); onOpenEntity?.({ type: 'heritage', id: asset.id }); }}><strong>{t(asset.name)}</strong></button><span>{t(asset.modernStatus === 'extant' ? '现存' : '遗址')}</span></summary>{detail && <div className="study-heritage-detail"><p>{t(detail.modernLocation)}</p><p>{detail.historicalAssociations.map(t).join('；')}</p><p>{t(detail.presentDayValue)}</p><p className="detail-note">{t('不确定性：')}{t(detail.uncertaintyNote)}</p></div>}</details></li>; })}</ul> : <p className="detail-note">{t('暂无已关联遗产')}</p>}
      </div>
    </section>
  );
}
