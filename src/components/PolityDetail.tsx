import type { DetailEntity } from '../domain/detail-entity';
import type { PolityDetail as PolityDetailRecord } from '../domain/types';
import { events } from '../data/events';
import { people } from '../data/people';
import { heritageById } from '../data/heritage';
import { places } from '../data/places';
import { sourceById } from '../data/sources';
import { formatHistoricalYear } from '../domain/timeline';
import { useLocale } from '../i18n/locale';

interface PolityDetailProps {
  detail: PolityDetailRecord;
  onOpenEntity?: (entity: DetailEntity) => void;
  mode?: 'summary' | 'drawer';
}

const range = (from: number, to: number) => from === to ? formatHistoricalYear(from) : `${formatHistoricalYear(from)}—${formatHistoricalYear(to)}`;

function EntityLink({ label, entity, onOpenEntity }: { label: string; entity: DetailEntity; onOpenEntity?: (entity: DetailEntity) => void }) {
  if (!onOpenEntity) return <span>{label}</span>;
  return <a href={`#${entity.type}-${entity.id}`} onClick={(event) => { event.preventDefault(); onOpenEntity(entity); }}>{label}</a>;
}

export function PolityDetail({ detail, onOpenEntity, mode = 'summary' }: PolityDetailProps) {
  const { t } = useLocale();
  const personById = new Map(people.map((person) => [person.id, person]));
  const eventById = new Map(events.map((event) => [event.id, event]));
  const placeById = new Map(places.map((place) => [place.id, place]));

  const body = <article className="polity-detail-body">
      <p className="event-lead">{t(detail.perspectiveSummary)}</p>

      <section className="polity-detail-section">
        <h3>{t('建立过程')}</h3>
        <ol>{detail.foundationProcess.map((item) => <li key={item}>{t(item)}</li>)}</ol>
      </section>

      <section className="polity-detail-section">
        <h3>{t('关键转折')}</h3>
        <ol>{detail.turningPoints.map((point) => <li key={`${point.year}-${point.title}`}>
          <strong>{t(point.title)}</strong><span> · {t(formatHistoricalYear(point.year))}</span>
          <p>{t(point.summary)}</p>
          {point.eventId && eventById.has(point.eventId) && <EntityLink label={t(eventById.get(point.eventId)!.title)} entity={{ type: 'event', id: point.eventId }} onOpenEntity={onOpenEntity} />}
        </li>)}</ol>
      </section>

      <section className="polity-detail-section">
        <h3>{t('主要人物')}</h3>
        <ul className="study-list">{detail.principalFigureIds.map((personId) => {
          const person = personById.get(personId);
          return <li key={personId}><EntityLink label={t(person?.name ?? personId)} entity={{ type: 'person', id: personId }} onOpenEntity={onOpenEntity} /></li>;
        })}</ul>
      </section>

      <section className="polity-detail-section">
        <h3>{t('首都阶段')}</h3>
        <ul className="study-list">{detail.capitalPhases.map((phase) => {
          const place = placeById.get(phase.placeId);
          return <li key={`${phase.placeId}-${phase.validFrom}-${phase.validTo}`}><strong>{t(place?.historicalName ?? phase.placeId)}</strong><span> · {t(range(phase.validFrom, phase.validTo))}</span>{place?.modernName && <span> · {t('今·')}{t(place.modernName)}</span>}{phase.note && <small>{t(phase.note)}</small>}</li>;
        })}</ul>
      </section>

      <section className="polity-detail-section">
        <h3>{t('遗产与事件关联')}</h3>
        <ul className="study-list">
          {detail.heritageIds.map((heritageId) => <li key={heritageId}><EntityLink label={t(heritageById[heritageId]?.name ?? heritageId)} entity={{ type: 'heritage', id: heritageId }} onOpenEntity={onOpenEntity} /></li>)}
          {detail.eventIds.map((eventId) => <li key={eventId}><EntityLink label={t(eventById.get(eventId)?.title ?? eventId)} entity={{ type: 'event', id: eventId }} onOpenEntity={onOpenEntity} /></li>)}
        </ul>
      </section>

      <section className="polity-detail-section event-sources">
        <h3>{t('来源与不确定性')}</h3>
        <ul className="source-links">{detail.sourceIds.map((sourceId) => {
          const source = sourceById[sourceId];
          return <li key={sourceId}>{source?.urlOrCitation ? <a href={source.urlOrCitation} target="_blank" rel="noreferrer">{t(source.title)}</a> : t(source?.title ?? sourceId)}</li>;
        })}</ul>
        <p className="uncertainty-note">{t('不确定性：')}{t(detail.uncertaintyNote)}</p>
      </section>
    </article>;

  if (mode === 'drawer') return body;
  return <div className="polity-detail-summary" data-testid="polity-detail-summary">
    <button type="button" onClick={() => onOpenEntity?.({ type: 'polity', id: detail.polityId })}>{t('展开政权详情')}</button>
  </div>;
}
