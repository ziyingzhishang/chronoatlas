import { useLocale } from '../i18n/locale';
import type { DetailEntity } from '../domain/detail-entity';
import type { HistoricalEvent, HistoricalEventDetail } from '../domain/types';
import { eventDate } from './EventDetailCard';
import { reviewEventTimeCoverage, type EventTimeReviewEntry } from '../data/event-time-review';
import { formatHistoricalYear } from '../domain/timeline';
import { useHistoricalContent } from '../content/ContentContext';
import { toReaderSources } from '../presentation/reader-content';
import { ReaderNotes } from './ReaderNotes';

export interface EventDetailProps {
  event: HistoricalEvent;
  detail?: HistoricalEventDetail;
  onNavigate?: (entity: DetailEntity) => void;
  onOpenEntity?: (entity: DetailEntity) => void;
}

function LinkedLabel({
  label,
  entity,
  onNavigate,
}: {
  label: string;
  entity: DetailEntity;
  onNavigate?: (entity: DetailEntity) => void;
}) {
  if (!onNavigate) return <span>{label}</span>;
  return <button type="button" onClick={() => onNavigate(entity)}>{label}</button>;
}

export function EventDetail({ event, detail: suppliedDetail, onNavigate, onOpenEntity }: EventDetailProps) {
  const { t } = useLocale();
  const { catalog } = useHistoricalContent();
  const { people, polities, places, events, studyEvents: detailEvents, eventDetails, eventTimeReviews, sources } = catalog;
  const detail = suppliedDetail ?? eventDetails.find((item) => item.eventId === event.id);
  const navigate = onNavigate ?? onOpenEntity;

  if (!detail) {
    return <article className="event-detail" aria-label={t('事件详情')}>
      <h3>{t(event.title)}</h3>
      <p className="detail-note">{t('暂无已收录事件详情')}</p>
    </article>;
  }

  const participantById = new Map(people.map((person) => [person.id, person]));
  const polityById = new Map(polities.map((polity) => [polity.id, polity]));
  const placeById = new Map(places.map((place) => [place.id, place]));
  const eventById = new Map(detailEvents.map((item) => [item.id, item]));
  const timeReview = reviewEventTimeCoverage({ events, eventDetails, reviewEntries: eventTimeReviews, knownSourceIds: sources.map((source) => source.id) }).records.find((record) => record.eventId === event.id) ?? unknownEventTimeReview(event.id);

  return <article className="event-detail" aria-label={t('事件详情')}>
    <div className="event-meta">{t(eventDate(event))} · {t(event.region === 'world' ? '同期世界' : '中国历史')} · {t(event.category ?? '历史转折')}</div>
    <h3>{t(event.title)}</h3>
    <p className="event-lead">{t(event.summary)}</p>

    <section className="event-detail-section">
      <h4>{t('原因')}</h4>
      <ul>{detail.causes.map((cause) => <li key={cause}>{t(cause)}</li>)}</ul>
    </section>

    {event.background && <section className="event-detail-section"><h4>{t('背景')}</h4><p>{t(event.background)}</p></section>}
    {event.process && <section className="event-detail-section"><h4>{t('经过')}</h4><p>{t(event.process)}</p></section>}

    {detail.phases && detail.phases.length > 0 && <section className="event-detail-section">
      <h4>{t('阶段')}</h4>
      <ol>{detail.phases.map((phase) => <li key={`${phase.label}-${phase.startYear ?? 'unknown'}`}><strong>{t(phase.label)}</strong>{(phase.startYear !== undefined || phase.endYear !== undefined) && <span> · {formatHistoricalYear(phase.startYear ?? phase.endYear!)}{phase.endYear !== undefined && phase.endYear !== phase.startYear ? `—${formatHistoricalYear(phase.endYear)}` : ''}</span>}<p>{t(phase.summary)}</p></li>)}</ol>
    </section>}

    <section className="event-detail-section">
      <h4>{t('参与者')}</h4>
      {detail.participants.length > 0 ? <ul>{detail.participants.map((participant) => {
        const person = participantById.get(participant.personId);
        return <li key={`${participant.personId}-${participant.role}`}>
          <LinkedLabel label={t(person?.name ?? '相关人物')} entity={{ type: 'person', id: participant.personId }} onNavigate={person ? navigate : undefined} />
          <span> · {t(participant.role)}</span>
          {participant.note && <small>（{t(participant.note)}）</small>}
        </li>;
      })}</ul> : <p className="detail-note">{t('相关资料尚待补充')}</p>}
    </section>

    <section className="event-detail-section">
      <h4>{t('参与政权')}</h4>
      <ul>{detail.polityIds.map((polityId) => { const polity = polityById.get(polityId); return <li key={polityId}><LinkedLabel label={t(polity?.name ?? '相关政权')} entity={{ type: 'polity', id: polityId }} onNavigate={polity ? navigate : undefined} /></li>; })}</ul>
    </section>

    <section className="event-detail-section">
      <h4>{t('结果与影响')}</h4>
      <ul>{detail.consequences.map((consequence) => <li key={consequence}>{t(consequence)}</li>)}</ul>
      {event.impact && <p>{t(event.impact)}</p>}
    </section>

    <section className="event-detail-section">
      <h4>{t('关联地点')}</h4>
      {detail.locationIds.length > 0 ? <ul>{detail.locationIds.map((placeId) => { const place = placeById.get(placeId); return <li key={placeId}><LinkedLabel label={t(place?.historicalName ?? '相关地点')} entity={{ type: 'place', id: placeId }} onNavigate={place ? navigate : undefined} /></li>; })}</ul> : <p className="detail-note">{t('暂无已收录关联地点')}</p>}
    </section>

    <section className="event-detail-section">
      <h4>{t('关联事件')}</h4>
      {detail.relatedEventIds.length > 0 ? <ul>{detail.relatedEventIds.map((eventId) => { const related = eventById.get(eventId); return <li key={eventId}><LinkedLabel label={t(related?.title ?? '相关事件')} entity={{ type: 'event', id: eventId }} onNavigate={related ? navigate : undefined} /></li>; })}</ul> : <p className="detail-note">{t('暂无已收录关联事件')}</p>}
    </section>

    <ReaderNotes className="event-detail-section event-sources" note={{
      dateDescription: eventTimeDescription(timeReview),
      uncertainty: [timeReview.explanation, detail.uncertaintyNote].filter(Boolean).join('；'),
      sources: toReaderSources([...detail.sourceIds, ...timeReview.sourceIds], sources),
    }} />
  </article>;
}

function eventTimeDescription(review: Pick<EventTimeReviewEntry, 'status' | 'timelineStrategy'>) {
  if (review.status === 'confirmed') return '年代记录较明确';
  if (review.status === 'approximate') return '约在该年前后';
  return '具体年代尚待核实';
}

function unknownEventTimeReview(eventId: string): Pick<EventTimeReviewEntry, 'eventId' | 'status' | 'explanation' | 'timelineStrategy'> & { sourceIds: string[] } {
  return {
    eventId,
    status: 'unknown',
    explanation: '现有资料尚不足以确定更精确的时间。',
    timelineStrategy: 'unknown-window',
    sourceIds: [],
  };
}
