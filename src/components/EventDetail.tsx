import { useLocale } from '../i18n/locale';
import type { DetailEntity } from '../domain/detail-entity';
import type { HistoricalEvent, HistoricalEventDetail } from '../domain/types';
import { eventDate } from './EventDetailCard';
import { events } from '../data/events';
import { changanEvents } from '../data/changan-study';
import { getEventDetail } from '../data/event-details';
import { people } from '../data/people';
import { polities } from '../data/polities';
import { places } from '../data/places';
import { sourceById } from '../data/sources';
import { reviewEventTimeCoverage, type EventTimeReviewEntry, type EventTimeReviewStatus } from '../data/event-time-review';
import { formatHistoricalYear } from '../domain/timeline';

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

export function EventDetail({ event, detail = getEventDetail(event.id), onNavigate, onOpenEntity }: EventDetailProps) {
  const { t } = useLocale();
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
  const detailEvents = [...events, ...changanEvents.filter((item) => !events.some((eventItem) => eventItem.id === item.id))];
  const eventById = new Map(detailEvents.map((item) => [item.id, item]));
  const timeReview = reviewEventTimeCoverage().records.find((record) => record.eventId === event.id) ?? unknownEventTimeReview(event.id);

  return <article className="event-detail" aria-label={t('事件详情')}>
    <div className="event-meta">{t(eventDate(event))} · {t(event.region === 'world' ? '同期世界' : '中国历史')} · {t(event.category ?? '历史转折')}</div>
    <h3>{t(event.title)}</h3>
    <p className="event-lead">{t(event.summary)}</p>
    <TimeEvidenceReview review={timeReview} t={t} />

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
          <LinkedLabel label={t(person?.name ?? participant.personId)} entity={{ type: 'person', id: participant.personId }} onNavigate={navigate} />
          <span> · {t(participant.role)}</span>
          {participant.note && <small>（{t(participant.note)}）</small>}
        </li>;
      })}</ul> : <p className="detail-note">{t('暂无已收录参与者')}</p>}
    </section>

    <section className="event-detail-section">
      <h4>{t('参与政权')}</h4>
      <ul>{detail.polityIds.map((polityId) => <li key={polityId}><LinkedLabel label={t(polityById.get(polityId)?.name ?? polityId)} entity={{ type: 'polity', id: polityId }} onNavigate={navigate} /></li>)}</ul>
    </section>

    <section className="event-detail-section">
      <h4>{t('结果与影响')}</h4>
      <ul>{detail.consequences.map((consequence) => <li key={consequence}>{t(consequence)}</li>)}</ul>
      {event.impact && <p>{t(event.impact)}</p>}
    </section>

    <section className="event-detail-section">
      <h4>{t('关联地点')}</h4>
      {detail.locationIds.length > 0 ? <ul>{detail.locationIds.map((placeId) => <li key={placeId}><LinkedLabel label={t(placeById.get(placeId)?.historicalName ?? placeId)} entity={{ type: 'place', id: placeId }} onNavigate={navigate} /></li>)}</ul> : <p className="detail-note">{t('暂无已收录关联地点')}</p>}
    </section>

    <section className="event-detail-section">
      <h4>{t('关联事件')}</h4>
      {detail.relatedEventIds.length > 0 ? <ul>{detail.relatedEventIds.map((eventId) => <li key={eventId}><LinkedLabel label={t(eventById.get(eventId)?.title ?? eventId)} entity={{ type: 'event', id: eventId }} onNavigate={navigate} /></li>)}</ul> : <p className="detail-note">{t('暂无已收录关联事件')}</p>}
    </section>

    <section className="event-detail-section event-sources">
      <h4>{t('来源')}</h4>
      <ul>{detail.sourceIds.map((sourceId) => {
        const source = sourceById[sourceId];
        const citation = source?.urlOrCitation;
        const isHttpUrl = citation?.startsWith('http://') || citation?.startsWith('https://');
        return <li key={sourceId}>{source && isHttpUrl ? <a href={citation} target="_blank" rel="noreferrer">{t(source.title)}</a> : t(source?.title ?? sourceId)}</li>;
      })}</ul>
      {detail.uncertaintyNote && <p className="detail-note"><strong>{t('不确定性')}</strong>：{t(detail.uncertaintyNote)}</p>}
    </section>
  </article>;
}

function TimeEvidenceReview({ review, t }: { review: Pick<EventTimeReviewEntry, 'eventId' | 'status' | 'explanation' | 'timelineStrategy'> & { sourceIds: string[] }; t: (text: string) => string }) {
  const sourceNames = review.sourceIds.map((sourceId) => sourceById[sourceId]?.title ?? sourceId);
  const allowTimelinePosition = review.timelineStrategy !== 'unknown-window';
  return <section className="time-evidence-review" aria-label={t('时间证据审计')}>
    <h4>{t('时间证据审计')}</h4>
    <p><strong>{t(eventTimeStatusLabel(review.status))}</strong> · {t(allowTimelinePosition ? '可定位到时间轴' : '暂不允许时间轴定位')}</p>
    <p className="detail-note">{t(review.explanation)}</p>
    <p className="detail-note">{t('证据来源：')}{sourceNames.length > 0 ? sourceNames.map(t).join('、') : t('暂无可解析来源')}</p>
  </section>;
}

function eventTimeStatusLabel(status: EventTimeReviewStatus) {
  return status === 'confirmed' ? '已确证' : status === 'approximate' ? '约年' : '未知';
}

function unknownEventTimeReview(eventId: string): Pick<EventTimeReviewEntry, 'eventId' | 'status' | 'explanation' | 'timelineStrategy'> & { sourceIds: string[] } {
  return {
    eventId,
    status: 'unknown',
    explanation: '当前事件尚未纳入时间证据审计目录，暂不把目录年份升级为已确证时间。',
    timelineStrategy: 'unknown-window',
    sourceIds: [],
  };
}
