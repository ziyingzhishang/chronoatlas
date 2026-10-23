import type { HistoricalClaim, HistoricalEvent, Person, PersonDetail as PersonDetailRecord, PersonRelationType, Polity } from '../domain/types';
import { groupPersonRelationships, type PersonRelationship } from '../domain/relationships';
import { formatHistoricalYear } from '../domain/timeline';
import { sourceById } from '../data/sources';
import { buildPersonTimeCoverageReport, type PersonTimeReview, type PersonTimeReviewStatus } from '../data/person-time-review';
import {
  buildPersonRelationshipCoverageReport,
  personRelationshipCategoryKeys,
  type PersonRelationshipCategory,
  type PersonRelationshipCategoryCoverage,
} from '../data/person-relationship-coverage';
import { useLocale } from '../i18n/locale';

export interface PersonDetailProps {
  person: Person;
  detail?: PersonDetailRecord;
  year: number;
  claims: HistoricalClaim[];
  people?: Person[];
  polities?: Polity[];
  events?: HistoricalEvent[];
  onOpenEntity?: (entity: { type: 'person' | 'polity' | 'event' | 'heritage'; id: string }) => void;
}

const relationSections: Array<{ title: string; types: PersonRelationType[] }> = [
  { title: '亲属关系', types: ['parent-of', 'child-of', 'grandparent-of', 'grandchild-of', 'spouse-of', 'sibling-of', 'teacher-of', 'student-of'] },
  { title: '君臣关系', types: ['served', 'appointed', 'succeeded', 'ruled'] },
  { title: '联盟关系', types: ['ally-of'] },
  { title: '对立关系', types: ['enemy-of'] },
  { title: '事件参与', types: ['participated-in'] },
];

const relationLabels: Partial<Record<PersonRelationType, string>> = {
  'parent-of': '父母／子女', 'child-of': '子女／父母', 'grandparent-of': '祖父母／外祖父母', 'grandchild-of': '孙辈／外孙辈', 'spouse-of': '配偶', 'sibling-of': '兄弟姊妹',
  'teacher-of': '师承', 'student-of': '弟子', served: '侍奉／效力', appointed: '任用', succeeded: '承接', ruled: '统治', 'ally-of': '盟友', 'enemy-of': '对立', 'participated-in': '参与事件',
};

const relationshipCoverageLabels: Record<PersonRelationshipCategory, string> = {
  governance: '君臣／治理',
  kinship: '亲属',
  allianceConflict: '联盟／对立',
  eventParticipation: '事件参与',
};

const relationDatePrecisionLabels: Record<HistoricalClaim['datePrecision'], string> = {
  day: '日', year: '年', approximate: '约年', range: '范围', century: '世纪', unknown: '未知',
};

export function PersonDetail({ person, detail, year, claims, people = [], polities = [], events = [], onOpenEntity }: PersonDetailProps) {
  const { t } = useLocale();
  if (!detail) return <article className="event-detail person-detail" aria-label={t('人物详情')}><h3>{t(person.name)}</h3><p className="detail-note">{t('暂无已收录人物详情')}</p></article>;

  const grouped = groupPersonRelationships(person.id, year, claims);
  const personById = new Map(people.map((item) => [item.id, item]));
  const polityById = new Map(polities.map((item) => [item.id, item]));
  const eventById = new Map(events.map((item) => [item.id, item]));
  const sources = [...new Set(detail.sourceIds)].map((sourceId) => sourceById[sourceId]).filter(Boolean);
  const timeReview = buildPersonTimeCoverageReport().byPersonId[person.id] ?? unknownPersonTimeReview(person);
  const relationshipCoverage = buildPersonRelationshipCoverageReport().byPersonId[person.id];

  return <article className="event-detail person-detail" aria-label={t('人物详情')}>
    <div className="event-meta">{t(person.roles?.join('／') ?? '历史人物')} · {formatLife(person.birthYear, person.deathYear)}</div>
    <h3>{t(person.name)}</h3>
    {detail.aliases.length > 0 && <p className="aliases">{t('别名：')}{detail.aliases.map(t).join('、')}</p>}
    <p className="event-lead">{t(detail.biography)}</p>
    <TimeEvidenceReview review={timeReview} t={t} />

    <section className="person-detail-section">
      <h4>{t('任职经历')}</h4>
      <ul className="study-list">{detail.offices.map((office, index) => <li key={`${office.title}-${index}`}><span>{t(office.title)}{office.polityId && ` · ${t(polityById.get(office.polityId)?.name ?? office.polityId)}`}</span><span>{formatRange(office.validFrom, office.validTo, office.datePrecision)}</span></li>)}</ul>
    </section>

    <section className="person-detail-section">
      <h4>{t('关键事件')}</h4>
      {detail.keyEvents.length > 0 ? <ul className="study-list">{detail.keyEvents.map((eventId) => { const event = eventById.get(eventId); return <li key={eventId}>{event ? <button type="button" onClick={() => onOpenEntity?.({ type: 'event', id: event.id })}>{t(event.title)}</button> : <span>{t(eventId)}</span>}</li>; })}</ul> : <p className="detail-note">{t('暂无已收录关键事件')}</p>}
    </section>

    <section className="person-detail-section" aria-label={t('人物关系')}>
      <h4>{t('人物关系')}</h4>
      {relationshipCoverage && <RelationshipCoverageSummary record={relationshipCoverage} t={t} />}
      {relationSections.map((section) => <RelationSection key={section.title} title={section.title} personName={person.name} types={section.types} grouped={grouped} people={personById} polities={polityById} events={eventById} onOpenEntity={onOpenEntity} t={t} />)}
      {grouped['person-heritage'].length > 0 && <RelationSection title="其他关系" personName={person.name} types={['commissioned']} grouped={grouped} people={personById} polities={polityById} events={eventById} onOpenEntity={onOpenEntity} t={t} />}
    </section>

    <details className="event-sources" open><summary>{t('来源与考据')}</summary>
      {sources.length > 0 ? sources.map((source) => <p key={source.id}><strong>{t(source.title)}</strong>{source.authorOrInstitution && <small>{t(source.authorOrInstitution)}</small>}{source.urlOrCitation && <small>{t(source.urlOrCitation)}</small>}</p>) : <p>{t('具体出处待补，本条不作为已核验史料。')}</p>}
    </details>
    {detail.uncertaintyNote && <p className="uncertainty-note">{t('不确定性：')}{t(detail.uncertaintyNote)}</p>}
  </article>;
}

function RelationshipCoverageSummary({ record, t }: { record: { categories: Record<PersonRelationshipCategory, PersonRelationshipCategoryCoverage> }; t: (text: string) => string }) {
  return <section className="relationship-coverage-summary" aria-label={t('人物关系覆盖审计')}>
    <h5>{t('覆盖状态')}</h5>
    <p className="relationship-coverage-audit-note">{t('以下状态来自人物关系覆盖审计；待补与待复核均不等同于已覆盖。')}</p>
    <ul className="relationship-coverage-grid">
      {personRelationshipCategoryKeys.map((category) => {
        const coverage = record.categories[category];
        const status = relationshipCoverageStatus(coverage);
        return <li key={category} className={`relationship-coverage-item relationship-coverage-${status}`}>
          <span className="relationship-coverage-category">{t(relationshipCoverageLabels[category])}</span>
          <strong data-relationship-coverage-status={status}>{t(relationshipCoverageStatusLabel(status))}</strong>
          <span className="relationship-coverage-note">{t(coverage.note)}</span>
        </li>;
      })}
    </ul>
  </section>;
}

type RelationshipCoverageStatus = 'covered' | 'required' | 'review' | 'not-applicable';

function relationshipCoverageStatus(coverage: PersonRelationshipCategoryCoverage): RelationshipCoverageStatus {
  if (coverage.status === 'covered') return 'covered';
  if (coverage.status === 'not-applicable') return 'not-applicable';
  return coverage.applicabilityStatus === 'required' ? 'required' : 'review';
}

function relationshipCoverageStatusLabel(status: RelationshipCoverageStatus) {
  return status === 'covered' ? '已覆盖' : status === 'required' ? '待补' : status === 'review' ? '待复核' : '不适用';
}

function TimeEvidenceReview({ review, t }: { review: PersonTimeReview; t: (text: string) => string }) {
  const sourceNames = review.evidenceSourceIds.map((sourceId) => sourceById[sourceId]?.title ?? sourceId);
  return <section className="time-evidence-review" aria-label={t('时间证据审计')}>
    <h4>{t('时间证据审计')}</h4>
    <p><strong>{t(personTimeStatusLabel(review.status))}</strong> · {t(review.allowTimelinePosition ? '可定位到时间轴' : '暂不允许时间轴定位')}</p>
    <p className="detail-note">{t(review.explanation)}</p>
    <p className="detail-note">{t('证据来源：')}{sourceNames.length > 0 ? sourceNames.map(t).join('、') : t('暂无可解析来源')}</p>
  </section>;
}

function personTimeStatusLabel(status: PersonTimeReviewStatus) {
  return status === 'confirmed' ? '已确证' : status === 'approximate' ? '约年' : '未知';
}

function unknownPersonTimeReview(person: Person): PersonTimeReview {
  return {
    personId: person.id,
    personName: person.name,
    status: 'unknown',
    evidence: [],
    evidenceSourceIds: [],
    allowTimelinePosition: false,
    explanation: `${person.name}尚未纳入人物时间证据审计目录，暂不升级为已确证年份。`,
  };
}

function RelationSection({ title, personName, types, grouped, people, polities, events, onOpenEntity, t }: { title: string; personName: string; types: PersonRelationType[]; grouped: ReturnType<typeof groupPersonRelationships>; people: Map<string, Person>; polities: Map<string, Polity>; events: Map<string, HistoricalEvent>; onOpenEntity?: PersonDetailProps['onOpenEntity']; t: (text: string) => string }) {
  const relations = types.flatMap((type) => grouped[type]);
  return <section className="person-relation-section"><h5>{t(title)}</h5>{relations.length > 0 ? <ul className="study-list">{relations.map((relation) => <RelationItem key={relation.claim.id} relation={relation} personName={personName} people={people} polities={polities} events={events} onOpenEntity={onOpenEntity} t={t} />)}</ul> : <p className="detail-note">{t('暂无已收录关系')}</p>}</section>;
}

function RelationItem({ relation, personName, people, polities, events, onOpenEntity, t }: { relation: PersonRelationship; personName: string; people: Map<string, Person>; polities: Map<string, Polity>; events: Map<string, HistoricalEvent>; onOpenEntity?: PersonDetailProps['onOpenEntity']; t: (text: string) => string }) {
  const objectId = relation.claim.objectId ?? '';
  const target = relation.kind === 'person-person' ? people.get(objectId) : relation.kind === 'person-polity' ? polities.get(objectId) : events.get(objectId);
  const label = target ? ('title' in target ? t(target.title) : t(target.name)) : objectId;
  const targetType = relation.kind === 'person-person' ? 'person' : relation.kind === 'person-polity' ? 'polity' : relation.kind === 'person-event' ? 'event' : 'heritage';
  const relationLabel = t(relationLabels[relation.relationType] ?? relation.claim.predicate);
  const content = <>{relationLabel} · {label}{relation.relationType === 'participated-in' && <small className="person-relation-meta">{t('方向：')}{t(personName)} → {label} · {formatRange(relation.claim.validFrom, relation.claim.validTo, relation.claim.datePrecision)} · {t('时间精度：')}{t(relationDatePrecisionLabels[relation.claim.datePrecision])} · {t('来源：')}{t(hasResolvableSources(relation.claim) ? '可用' : '待解析')}</small>}{relation.claim.uncertaintyNote && <small>{t('不确定性：')}{t(relation.claim.uncertaintyNote)}</small>}</>;
  return <li>{onOpenEntity ? <button type="button" onClick={() => onOpenEntity({ type: targetType, id: objectId })}>{content}</button> : <span>{content}</span>}</li>;
}

function hasResolvableSources(claim: HistoricalClaim) {
  return claim.sourceIds.length > 0 && claim.sourceIds.every((sourceId) => sourceById[sourceId] !== undefined);
}

function formatLife(birthYear?: number, deathYear?: number) {
  if (birthYear === undefined && deathYear === undefined) return '生卒年待核';
  return `${birthYear === undefined ? '?' : formatHistoricalYear(birthYear)}—${deathYear === undefined ? '?' : formatHistoricalYear(deathYear)}`;
}

function formatRange(from: number | undefined, to: number | undefined, precision: string) {
  if (from === undefined && to === undefined) return '年代待核';
  const prefix = precision === 'approximate' ? '约 ' : '';
  if (from === undefined) return `${prefix}${formatHistoricalYear(to!)}`;
  if (to === undefined || to === from) return `${prefix}${formatHistoricalYear(from)}`;
  return `${prefix}${formatHistoricalYear(from)}—${formatHistoricalYear(to)}`;
}
