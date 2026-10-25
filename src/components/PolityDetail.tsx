import type { DetailEntity } from '../domain/detail-entity';
import type { PolityDetail as PolityDetailRecord } from '../domain/types';
import { formatHistoricalYear } from '../domain/timeline';
import { useLocale } from '../i18n/locale';
import { useHistoricalContent } from '../content/ContentContext';

interface PolityDetailProps {
  detail: PolityDetailRecord;
  onOpenEntity?: (entity: DetailEntity) => void;
  mode?: 'summary' | 'drawer';
}

const range = (from: number, to: number) => from === to ? formatHistoricalYear(from) : `${formatHistoricalYear(from)}—${formatHistoricalYear(to)}`;
const optionalRange = (from?: number, to?: number) => from === undefined ? undefined : range(from, to ?? from);
const unique = (ids: string[]) => [...new Set(ids)];

function EvidenceMeta({
  sourceIds,
  validFrom,
  validTo,
  uncertaintyNote,
  t,
}: {
  sourceIds: string[];
  validFrom?: number;
  validTo?: number;
  uncertaintyNote?: string;
  t: (text: string) => string;
}) {
  const { catalog } = useHistoricalContent();
  const sourceIdsAvailable = new Set(catalog.sources.map((source) => source.id));
  const ids = unique(sourceIds);
  const resolvedCount = ids.filter((sourceId) => sourceIdsAvailable.has(sourceId)).length;
  return <small className="polity-detail-evidence">
    {optionalRange(validFrom, validTo) && <span>{t('有效期：')}{t(optionalRange(validFrom, validTo)!)}</span>}
    <span>{t('来源解析：')}{resolvedCount}/{ids.length} {t(resolvedCount === ids.length && ids.length > 0 ? '已解析' : '未解析')}</span>
    {uncertaintyNote && <span>{t('不确定性提示：')}{t(uncertaintyNote)}</span>}
  </small>;
}

function EntityLink({ label, entity, onOpenEntity }: { label: string; entity: DetailEntity; onOpenEntity?: (entity: DetailEntity) => void }) {
  if (!onOpenEntity) return <span>{label}</span>;
  return <a href={`#${entity.type}-${entity.id}`} onClick={(event) => { event.preventDefault(); onOpenEntity(entity); }}>{label}</a>;
}

export function PolityDetail({ detail, onOpenEntity, mode = 'summary' }: PolityDetailProps) {
  const { t } = useLocale();
  const { catalog } = useHistoricalContent();
  const { studyEvents: events, people, heritage, heritageDetails, places, eventDetails, personDetails, sources } = catalog;
  const heritageById = Object.fromEntries(heritage.map((item) => [item.id, item]));
  const sourceById = Object.fromEntries(sources.map((item) => [item.id, item]));
  const personById = new Map(people.map((person) => [person.id, person]));
  const eventById = new Map(events.map((event) => [event.id, event]));
  const placeById = new Map(places.map((place) => [place.id, place]));
  const personDetailById = new Map(personDetails.map((record) => [record.personId, record]));
  const eventDetailById = new Map(eventDetails.map((record) => [record.eventId, record]));
  const heritageDetailById = new Map(heritageDetails.map((record) => [record.heritageId, record]));

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
          {point.eventId && eventById.has(point.eventId) && <>
            <EntityLink label={t(eventById.get(point.eventId)!.title)} entity={{ type: 'event', id: point.eventId }} onOpenEntity={onOpenEntity} />
            <EvidenceMeta sourceIds={unique([...(eventById.get(point.eventId)?.sourceIds ?? []), ...(eventDetailById.get(point.eventId)?.sourceIds ?? [])])} validFrom={eventById.get(point.eventId)?.year} validTo={eventById.get(point.eventId)?.endYear} uncertaintyNote={eventDetailById.get(point.eventId)?.uncertaintyNote} t={t} />
          </>}
        </li>)}</ol>
      </section>

      <section className="polity-detail-section">
        <h3>{t('主要人物')}</h3>
        <ul className="study-list">{detail.principalFigureIds.map((personId) => {
          const person = personById.get(personId);
          const personDetail = personDetailById.get(personId);
          const office = personDetail?.offices.find((item) => item.polityId === detail.polityId) ?? personDetail?.offices[0];
          return <li key={personId}>
            <EntityLink label={t(person?.name ?? personId)} entity={{ type: 'person', id: personId }} onOpenEntity={onOpenEntity} />
            <EvidenceMeta sourceIds={unique([...(person?.sourceIds ?? []), ...(personDetail?.sourceIds ?? []), ...(office?.sourceIds ?? [])])} validFrom={office?.validFrom} validTo={office?.validTo} uncertaintyNote={personDetail?.uncertaintyNote} t={t} />
          </li>;
        })}</ul>
      </section>

      <section className="polity-detail-section">
        <h3>{t('首都阶段')}</h3>
        <ul className="study-list">{detail.capitalPhases.map((phase) => {
          const place = placeById.get(phase.placeId);
          return <li key={`${phase.placeId}-${phase.validFrom}-${phase.validTo}`}>
            <EntityLink label={t(place?.historicalName ?? phase.placeId)} entity={{ type: 'place', id: phase.placeId }} onOpenEntity={onOpenEntity} />
            <span> · {t(range(phase.validFrom, phase.validTo))}</span>{place?.modernName && <span> · {t('今·')}{t(place.modernName)}</span>}{phase.note && <small>{t(phase.note)}</small>}
            <EvidenceMeta sourceIds={place?.sourceIds ?? []} uncertaintyNote={place?.mappingStatus && place.mappingStatus !== 'exact' ? place.notes : undefined} t={t} />
          </li>;
        })}</ul>
      </section>

      <section className="polity-detail-section">
        <h3>{t('遗产与事件关联')}</h3>
        <ul className="study-list">
          {detail.heritageIds.map((heritageId) => {
            const heritage = heritageById[heritageId];
            const heritageDetail = heritageDetailById.get(heritageId);
            return <li key={heritageId}>
              <EntityLink label={t(heritage?.name ?? heritageId)} entity={{ type: 'heritage', id: heritageId }} onOpenEntity={onOpenEntity} />
              <EvidenceMeta sourceIds={unique([...(heritage?.sourceIds ?? []), ...(heritageDetail?.sourceIds ?? [])])} validFrom={heritage?.constructionFrom} validTo={heritage?.constructionTo} uncertaintyNote={heritageDetail?.uncertaintyNote} t={t} />
            </li>;
          })}
          {detail.eventIds.map((eventId) => {
            const event = eventById.get(eventId);
            const eventDetail = eventDetailById.get(eventId);
            return <li key={eventId}>
              <EntityLink label={t(event?.title ?? eventId)} entity={{ type: 'event', id: eventId }} onOpenEntity={onOpenEntity} />
              <EvidenceMeta sourceIds={unique([...(event?.sourceIds ?? []), ...(eventDetail?.sourceIds ?? [])])} validFrom={event?.year} validTo={event?.endYear} uncertaintyNote={eventDetail?.uncertaintyNote} t={t} />
            </li>;
          })}
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
