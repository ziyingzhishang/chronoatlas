import { useLocale } from '../i18n/locale';
import type { DetailEntity } from '../domain/detail-entity';
import type { HistoricalEvent, HistoricalEventDetail } from '../domain/types';
import { eventDate } from './EventDetailCard';
import { reviewEventTimeCoverage, type EventTimeReviewEntry, type EventTimeReviewStatus } from '../data/event-time-review';
import { formatHistoricalYear } from '../domain/timeline';
import { useHistoricalContent } from '../content/ContentContext';

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
      })}</ul> : <p className="detail-note">{t('当前没有可核验参与人物')}；<a href="/data/knowledge-coverage.json" target="_blank" rel="noreferrer" aria-label={t('打开知识覆盖报告')}>{t('该缺口已记录在知识覆盖报告中')}</a>。</p>}
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
      <ul>{detail.sourceIds.map((sourceId) => <SourceEvidence key={sourceId} sourceId={sourceId} />)}</ul>
      {detail.uncertaintyNote && <p className="detail-note"><strong>{t('不确定性')}</strong>：{t(detail.uncertaintyNote)}</p>}
    </section>
  </article>;
}

function sourceUrls(citation?: string) {
  return (citation ?? '').split(/[；;]/).map((part) => part.trim()).filter((part) => /^https?:\/\//.test(part));
}

function SourceEvidence({ sourceId }: { sourceId: string }) {
  const { t } = useLocale();
  const { catalog } = useHistoricalContent();
  const source = catalog.sources.find((item) => item.id === sourceId);
  const urls = sourceUrls(source?.urlOrCitation);
  if (!source) {
    return <li><span>{t(sourceId)}</span><span className="detail-note"> · {t('来源未解析')}</span></li>;
  }
  return <li>
    {urls.length > 0 ? urls.map((url) => <a key={url} href={url} target="_blank" rel="noreferrer">{t(source.title)}</a>) : <span>{t(source.title)}</span>}
    <span className="detail-note"> · {t(urls.length > 0 ? '来源链接' : '书目引文')}</span>
  </li>;
}

function TimeEvidenceReview({ review, t }: { review: Pick<EventTimeReviewEntry, 'eventId' | 'status' | 'explanation' | 'timelineStrategy'> & { sourceIds: string[] }; t: (text: string) => string }) {
  const { catalog } = useHistoricalContent();
  const sourceNames = review.sourceIds.map((sourceId) => catalog.sources.find((source) => source.id === sourceId)?.title ?? sourceId);
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
