import type { HistoricalEvent, HistoricalEventDetail } from '../domain/types';
import { eventDetails as defaultEventDetails } from './event-details';
import { events as defaultEvents } from './events';
import { sourceNotes as defaultSourceNotes } from './sources';

export type EventTimeReviewStatus = 'confirmed' | 'approximate' | 'unknown';
export type EventTimeTimelineStrategy = 'year-marker' | 'approximate-marker' | 'range-band' | 'unknown-window';
export type ReviewedDatePrecision = NonNullable<HistoricalEvent['datePrecision']>;
export type EventTimeActualPrecision = ReviewedDatePrecision | 'unknown';

export interface EventTimeReviewEntry {
  eventId: string;
  status: EventTimeReviewStatus;
  expectedPrecision: ReviewedDatePrecision;
  explanation: string;
  timelineStrategy: EventTimeTimelineStrategy;
}

export interface EventTimeReviewRecord extends EventTimeReviewEntry {
  title: string;
  year: number;
  endYear?: number;
  datePrecision: EventTimeActualPrecision;
  sourceIds: string[];
}

export interface EventTimeSourceMismatch {
  eventId: string;
  sourceIds: string[];
  unknownSourceIds: string[];
}

export interface EventTimePrecisionMismatch {
  eventId: string;
  expected: ReviewedDatePrecision;
  actual: HistoricalEvent['datePrecision'];
}

export interface EventTimeCoverageReport {
  isComplete: boolean;
  totalReviewed: number;
  records: EventTimeReviewRecord[];
  statusCounts: Record<EventTimeReviewStatus, number>;
  missingEventIds: string[];
  missingDetailEventIds: string[];
  unreviewedNonPreciseEventIds: string[];
  sourceMismatches: EventTimeSourceMismatch[];
  precisionMismatches: EventTimePrecisionMismatch[];
}

export interface ReviewEventTimeCoverageOptions {
  events?: readonly HistoricalEvent[];
  eventDetails?: readonly HistoricalEventDetail[];
  reviewEntries?: readonly EventTimeReviewEntry[];
  knownSourceIds?: Iterable<string>;
}

// These are editorial interpretations only. Dates, source IDs and precision are read from the existing catalogs below.
export const eventTimeReview: readonly EventTimeReviewEntry[] = [
  { eventId: 'xia-early-founded-eighth-batch', status: 'approximate', expectedPrecision: 'approximate', explanation: '传统纪年与夏代起始问题仍有学术分歧，只能按约年锚点展示，不把公元前2070年当作精确建国日。', timelineStrategy: 'approximate-marker' },
  { eventId: 'shang-founded-eighth-batch', status: 'approximate', expectedPrecision: 'approximate', explanation: '商代起始年代采用通行约年，年代与考古分期不能还原为单一可证实日期。', timelineStrategy: 'approximate-marker' },
  { eventId: 'zhou-conquest', status: 'approximate', expectedPrecision: 'approximate', explanation: '前1046年是常用克商约年，牧野战事与西周建政是连续过程，不能压缩成单日节点。', timelineStrategy: 'approximate-marker' },
  { eventId: 'western-zhou-founded-eighth-batch', status: 'approximate', expectedPrecision: 'approximate', explanation: '西周建立涉及克商、分封与东征等阶段，前1046年只作常用约年锚点。', timelineStrategy: 'approximate-marker' },
  { eventId: 'eastern-zhou-founded-eighth-batch', status: 'approximate', expectedPrecision: 'approximate', explanation: '东周分期以周室东迁为传统节点，政权转移和政治中心变化不等同于精确建国日。', timelineStrategy: 'approximate-marker' },
  { eventId: 'qin-state-founded-eighth-batch', status: 'approximate', expectedPrecision: 'approximate', explanation: '秦国早期建制属于传统分期，前770年只能表示历史阶段起点。', timelineStrategy: 'approximate-marker' },
  { eventId: 'han-warring-founded-eighth-batch', status: 'approximate', expectedPrecision: 'approximate', explanation: '三家分晋后的韩政权起点按传统分期记录，不能将前403年解释为单一仪式时刻。', timelineStrategy: 'approximate-marker' },
  { eventId: 'zhao-warring-founded-eighth-batch', status: 'approximate', expectedPrecision: 'approximate', explanation: '赵政权起点采用三家分晋传统分期，前403年是阶段锚点而非精确建政日。', timelineStrategy: 'approximate-marker' },
  { eventId: 'wei-warring-founded-eighth-batch', status: 'approximate', expectedPrecision: 'approximate', explanation: '魏政权起点采用三家分晋传统分期，政治实体形成过程不能还原为单日。', timelineStrategy: 'approximate-marker' },
  { eventId: 'chu-warring-founded-eighth-batch', status: 'approximate', expectedPrecision: 'approximate', explanation: '战国楚的目录起点是传统分期，前403年只用于时间轴定位。', timelineStrategy: 'approximate-marker' },
  { eventId: 'yan-warring-founded-eighth-batch', status: 'approximate', expectedPrecision: 'approximate', explanation: '战国燕的目录起点是传统分期，不能据此推断精确的政权成立日期。', timelineStrategy: 'approximate-marker' },
  { eventId: 'qi-warring-founded-eighth-batch', status: 'approximate', expectedPrecision: 'approximate', explanation: '战国齐的目录起点是传统分期，前403年仅作约年时间锚点。', timelineStrategy: 'approximate-marker' },
  { eventId: 'xiongnu-founded', status: 'approximate', expectedPrecision: 'approximate', explanation: '匈奴联盟形成是部众整合过程，前209年用于表示传统形成阶段，不代表单一建国仪式。', timelineStrategy: 'approximate-marker' },
  { eventId: 'chu-han-contention', status: 'confirmed', expectedPrecision: 'range', explanation: '楚汉竞争的起止区间有明确编年边界，但事件本身跨越多个军事与政治阶段。', timelineStrategy: 'range-band' },
  { eventId: 'silla-founded', status: 'approximate', expectedPrecision: 'approximate', explanation: '前57年是新罗传统纪年节点，早期辰韩诸部整合仍需按形成过程理解。', timelineStrategy: 'approximate-marker' },
  { eventId: 'goguryeo-founded', status: 'approximate', expectedPrecision: 'approximate', explanation: '前37年是高句丽传统建国纪年，早期国家化与城址对应不能被视为精确日期。', timelineStrategy: 'approximate-marker' },
  { eventId: 'cheng-han-founded', status: 'approximate', expectedPrecision: 'approximate', explanation: '304年前后表示成汉政权形成阶段，306年称帝等后续节点不能前推到同一年。', timelineStrategy: 'approximate-marker' },
  { eventId: 'tuyuhun-founded', status: 'approximate', expectedPrecision: 'approximate', explanation: '313年前后表示吐谷浑部众形成稳定政治共同体，迁徙与建制不是单日完成。', timelineStrategy: 'approximate-marker' },
  { eventId: 'former-liang-founded', status: 'approximate', expectedPrecision: 'approximate', explanation: '314年前后表示河西张氏地方统治的独立形成，前凉建政起点存在口径差异。', timelineStrategy: 'approximate-marker' },
  { eventId: 'eastern-jin', status: 'confirmed', expectedPrecision: 'range', explanation: '东晋建立跨越317—318年的政权承接过程，区间边界可用但不应压缩为单日。', timelineStrategy: 'range-band' },
  { eventId: 'western-liang-state-founded', status: 'approximate', expectedPrecision: 'approximate', explanation: '400年前后表示西凉政权形成，李暠的地方承接与正式建制存在阶段性。', timelineStrategy: 'approximate-marker' },
  { eventId: 'northern-yan-founded', status: 'approximate', expectedPrecision: 'approximate', explanation: '407年前后表示北燕形成，政权承接与冯跋后续称制不能简化为单日。', timelineStrategy: 'approximate-marker' },
  { eventId: 'xia-sixteen-states-founded-eighth-batch', status: 'approximate', expectedPrecision: 'approximate', explanation: '夏政权建立采用形成阶段约年，赫连勃勃的部众整合和称帝分属不同节点。', timelineStrategy: 'approximate-marker' },
  { eventId: 'tibetan-founded', status: 'approximate', expectedPrecision: 'approximate', explanation: '618年前后表示吐蕃形成阶段，松赞干布后的高原整合不能回填为建政当年。', timelineStrategy: 'approximate-marker' },
  { eventId: 'nanzhao-founded', status: 'approximate', expectedPrecision: 'approximate', explanation: '738年前后表示南诏形成，部族联盟、唐廷册封与区域整合是连续过程。', timelineStrategy: 'approximate-marker' },
  { eventId: 'an-lushan-rebellion', status: 'confirmed', expectedPrecision: 'range', explanation: '安史之乱的755—763年区间有明确编年边界，但战局和控制范围随阶段变化。', timelineStrategy: 'range-band' },
  { eventId: 'jingnan-founded', status: 'approximate', expectedPrecision: 'approximate', explanation: '924年前后表示荆南政权形成，地方军镇承接与后续正式建制存在时间层次。', timelineStrategy: 'approximate-marker' },
  { eventId: 'dali-founded', status: 'approximate', expectedPrecision: 'approximate', explanation: '937年前后表示大理政权形成，杨干贞改国号与段氏承接等节点不能混为精确建国日。', timelineStrategy: 'approximate-marker' },
  { eventId: 'western-liao-founded', status: 'approximate', expectedPrecision: 'approximate', explanation: '1124年前后表示西辽形成阶段，耶律大石西迁、建制与称号变化具有过程性。', timelineStrategy: 'approximate-marker' },
  { eventId: 'northern-yuan-founded', status: 'approximate', expectedPrecision: 'approximate', explanation: '1368年前后表示元廷北迁后的政权重组，“北元”是后世概称，不能视为单一建国日。', timelineStrategy: 'approximate-marker' },
  { eventId: 'southern-ming-founded', status: 'approximate', expectedPrecision: 'approximate', explanation: '1644年前后表示南明多阶段政权体系形成，不能把不同弘光、隆武、永历阶段压成一个日期。', timelineStrategy: 'approximate-marker' },
];

function unique(values: readonly string[]): string[] {
  return [...new Set(values)];
}

function emptyStatusCounts(): Record<EventTimeReviewStatus, number> {
  return { confirmed: 0, approximate: 0, unknown: 0 };
}

export function reviewEventTimeCoverage(options: ReviewEventTimeCoverageOptions = {}): EventTimeCoverageReport {
  const currentEvents = options.events ?? defaultEvents;
  const currentDetails = options.eventDetails ?? defaultEventDetails;
  const reviewEntries = options.reviewEntries ?? eventTimeReview;
  const knownSourceIds = new Set(options.knownSourceIds ?? defaultSourceNotes.map((source) => source.id));
  const eventsById = new Map(currentEvents.map((event) => [event.id, event]));
  const detailsById = new Map(currentDetails.map((detail) => [detail.eventId, detail]));
  const statusCounts = emptyStatusCounts();
  const missingEventIds: string[] = [];
  const missingDetailEventIds: string[] = [];
  const sourceMismatches: EventTimeSourceMismatch[] = [];
  const precisionMismatches: EventTimePrecisionMismatch[] = [];
  const records: EventTimeReviewRecord[] = [];

  for (const entry of reviewEntries) {
    statusCounts[entry.status] += 1;
    const event = eventsById.get(entry.eventId);
    const detail = detailsById.get(entry.eventId);
    if (!detail) {
      missingDetailEventIds.push(entry.eventId);
    }
    if (!event) {
      missingEventIds.push(entry.eventId);
      continue;
    }
    if (event.datePrecision !== entry.expectedPrecision) {
      precisionMismatches.push({ eventId: entry.eventId, expected: entry.expectedPrecision, actual: event.datePrecision });
    }
    if (!detail) continue;
    const sourceIds = unique(detail.sourceIds);
    const unknownSourceIds = sourceIds.filter((sourceId) => !knownSourceIds.has(sourceId));
    if (sourceIds.length === 0 || unknownSourceIds.length > 0) {
      sourceMismatches.push({ eventId: entry.eventId, sourceIds, unknownSourceIds });
    }
    records.push({
      ...entry,
      title: event.title,
      year: event.year,
      endYear: event.endYear,
      datePrecision: event.datePrecision ?? 'unknown',
      sourceIds,
    });
  }

  const reviewedIds = new Set(reviewEntries.map((entry) => entry.eventId));
  const unreviewedNonPreciseEventIds = currentEvents
    .filter((event) => event.datePrecision !== 'year' && !reviewedIds.has(event.id))
    .map((event) => event.id);
  const isComplete = missingEventIds.length === 0
    && missingDetailEventIds.length === 0
    && unreviewedNonPreciseEventIds.length === 0
    && sourceMismatches.length === 0
    && precisionMismatches.length === 0
    && records.length === reviewEntries.length;

  return {
    isComplete,
    totalReviewed: reviewEntries.length,
    records,
    statusCounts,
    missingEventIds,
    missingDetailEventIds,
    unreviewedNonPreciseEventIds,
    sourceMismatches,
    precisionMismatches,
  };
}
