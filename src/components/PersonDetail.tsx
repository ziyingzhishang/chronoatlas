import type { ClaimEvidenceType, Confidence, HistoricalClaim, HistoricalEvent, Person, PersonDetail as PersonDetailRecord, PersonRelationType, Polity } from '../domain/types';
import { groupPersonRelationships, type PersonRelationship } from '../domain/relationships';
import { formatHistoricalYear } from '../domain/timeline';
import { buildPersonTimeCoverageReport, type PersonTimeReview, type PersonTimeReviewStatus } from '../data/person-time-review';
import {
  buildPersonRelationshipCoverageReport,
  personRelationshipCategoryKeys,
  type PersonRelationshipCategory,
  type PersonRelationshipCategoryCoverage,
} from '../data/person-relationship-coverage';
import type { PersonRelationshipEvidenceKind } from '../data/person-relationship-evidence';
import { useLocale } from '../i18n/locale';
import { useHistoricalContent } from '../content/ContentContext';

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
  { title: '君臣关系', types: ['served', 'appointed', 'succeeded', 'founded', 'ruled'] },
  { title: '联盟关系', types: ['ally-of'] },
  { title: '对立关系', types: ['enemy-of'] },
  { title: '事件参与', types: ['participated-in'] },
];

const relationLabels: Partial<Record<PersonRelationType, string>> = {
  'parent-of': '父母／子女', 'child-of': '子女／父母', 'grandparent-of': '祖父母／外祖父母', 'grandchild-of': '孙辈／外孙辈', 'spouse-of': '配偶', 'sibling-of': '兄弟姊妹',
  'teacher-of': '师承', 'student-of': '弟子', served: '侍奉／效力', appointed: '任用', succeeded: '承接', founded: '建立', ruled: '统治', 'ally-of': '盟友', 'enemy-of': '对立', 'participated-in': '参与事件',
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
  const { catalog, external } = useHistoricalContent();
  if (!detail) return <article className="event-detail person-detail" aria-label={t('人物详情')}><h3>{t(person.name)}</h3><p className="detail-note">{t('暂无已收录人物详情')}</p></article>;

  const grouped = groupPersonRelationships(person.id, year, claims);
  const personById = new Map(people.map((item) => [item.id, item]));
  const polityById = new Map(polities.map((item) => [item.id, item]));
  const eventById = new Map(events.map((item) => [item.id, item]));
  const sourceById = new Map(catalog.sources.map((source) => [source.id, source]));
  const sources = [...new Set(detail.sourceIds)].map((sourceId) => sourceById.get(sourceId)).filter((source): source is NonNullable<typeof source> => Boolean(source));
  const timeReview = (external ? buildPersonTimeCoverageReport({ people, personDetails: catalog.personDetails, claims }) : buildPersonTimeCoverageReport()).byPersonId[person.id] ?? unknownPersonTimeReview(person);
  const relationshipCoverage = (external ? buildPersonRelationshipCoverageReport({
    catalog: {
      polities,
      people,
      events,
      eventDetails: catalog.eventDetails,
      heritageAssets: catalog.heritage,
      heritageDetails: catalog.heritageDetails,
      personDetails: catalog.personDetails,
      polityDetails: catalog.polityDetails,
      claims,
      sourceNotes: catalog.sources,
      places: catalog.places,
      capitalTerms: catalog.capitalTerms,
    },
  }) : buildPersonRelationshipCoverageReport()).byPersonId[person.id];

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
      <PersonRelationshipGraph personName={person.name} grouped={grouped} people={personById} polities={polityById} events={eventById} onOpenEntity={onOpenEntity} t={t} />
      {relationSections.map((section) => <RelationSection key={section.title} title={section.title} personName={person.name} types={section.types} grouped={grouped} people={personById} polities={polityById} events={eventById} onOpenEntity={onOpenEntity} t={t} />)}
      {grouped['person-heritage'].length > 0 && <RelationSection title="其他关系" personName={person.name} types={['commissioned']} grouped={grouped} people={personById} polities={polityById} events={eventById} onOpenEntity={onOpenEntity} t={t} />}
    </section>

    <details className="event-sources" open><summary>{t('来源与考据')}</summary>
      {sources.length > 0 ? sources.map((source) => {
        const isHttpUrl = source.urlOrCitation?.startsWith('http://') || source.urlOrCitation?.startsWith('https://');
        return <p key={source.id}><strong>{isHttpUrl ? <a href={source.urlOrCitation} target="_blank" rel="noreferrer">{t(source.title)}</a> : t(source.title)}</strong>{source.authorOrInstitution && <small>{t(source.authorOrInstitution)}</small>}{source.urlOrCitation && !isHttpUrl && <small>{t(source.urlOrCitation)}</small>}</p>;
      }) : <p>{t('具体出处待补，本条不作为已核验史料。')}</p>}
    </details>
    {detail.uncertaintyNote && <p className="uncertainty-note">{t('不确定性：')}{t(detail.uncertaintyNote)}</p>}
  </article>;
}

function RelationshipCoverageSummary({ record, t }: { record: { categories: Record<PersonRelationshipCategory, PersonRelationshipCategoryCoverage> }; t: (text: string) => string }) {
  const requiresFollowUp = personRelationshipCategoryKeys.some((category) => relationshipCoverageStatus(record.categories[category]) === 'required');
  return <section className="relationship-coverage-summary" aria-label={t('人物关系覆盖审计')}>
    <h5>{t('覆盖状态')}</h5>
    <p className="relationship-coverage-audit-note">{t('以下状态来自人物关系覆盖审计；待补与待复核均不等同于已覆盖。')}</p>
    {requiresFollowUp && <p className="relationship-coverage-audit-note"><a href="/data/knowledge-coverage.json" target="_blank" rel="noreferrer" aria-label={t('打开知识覆盖报告')}>{t('打开知识覆盖报告')}</a></p>}
    <ul className="relationship-coverage-grid">
      {personRelationshipCategoryKeys.map((category) => {
        const coverage = record.categories[category];
        const status = relationshipCoverageStatus(coverage);
        return <li key={category} className={`relationship-coverage-item relationship-coverage-${status}`}>
          <span className="relationship-coverage-category">{t(relationshipCoverageLabels[category])}</span>
          <strong data-relationship-coverage-status={status}>{t(relationshipCoverageStatusLabel(status))}</strong>
          <span className="relationship-coverage-note">{t(coverage.note)}</span>
          {coverage.evidence.length > 0 && <ul className="relationship-coverage-evidence" aria-label={t('覆盖证据')}>
            {coverage.evidence.map((evidence) => <li key={evidence.evidenceId} data-relationship-evidence-kind={evidence.kind}>
              {t(relationshipEvidenceKindLabel(evidence.kind))} · {evidence.evidenceId}
            </li>)}
          </ul>}
        </li>;
      })}
    </ul>
  </section>;
}

function relationshipEvidenceKindLabel(kind: PersonRelationshipEvidenceKind) {
  return kind === 'claim' ? '直接关系证据' : kind === 'event-detail' ? '事件详情参与证据' : '适用性角色依据';
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

function PersonRelationshipGraph({ personName, grouped, people, polities, events, onOpenEntity, t }: { personName: string; grouped: ReturnType<typeof groupPersonRelationships>; people: Map<string, Person>; polities: Map<string, Polity>; events: Map<string, HistoricalEvent>; onOpenEntity?: PersonDetailProps['onOpenEntity']; t: (text: string) => string }) {
  const relations = relationSections.flatMap((section) => section.types.flatMap((type) => grouped[type].map((relation) => ({ relation, category: section.title }))));
  if (relations.length === 0) return null;

  return <section className="person-relationship-graph" aria-label={t('人物关系图谱')}>
    <h5>{t('人物关系图谱')}</h5>
    <div className="person-relationship-graph-center" aria-label={t('图谱中心人物')}>{t(personName)}</div>
    <ul className="person-relationship-graph-edges">
      {relations.map(({ relation, category }) => {
        const objectId = relation.claim.objectId ?? '';
        const target = relation.kind === 'person-person' ? people.get(objectId) : relation.kind === 'person-polity' ? polities.get(objectId) : events.get(objectId);
        const targetLabel = target ? ('title' in target ? t(target.title) : t(target.name)) : objectId;
        const targetType = relation.kind === 'person-person' ? 'person' : relation.kind === 'person-polity' ? 'polity' : relation.kind === 'person-event' ? 'event' : 'heritage';
        const relationLabel = t(relationLabels[relation.relationType] ?? relation.claim.predicate);
        const direction = relation.direction === 'incoming' ? `${targetLabel} → ${t(personName)}` : `${t(personName)} → ${targetLabel}`;
        const accessibleLabel = `${relationLabel}：${direction}`;
        return <li key={`graph-${relation.claim.id}`} className="person-relationship-graph-edge">
          {onOpenEntity ? <button type="button" aria-label={accessibleLabel} onClick={() => onOpenEntity({ type: targetType, id: objectId })}><span>{t(category)} → {targetLabel}</span><small>{relationLabel} · {t('方向：')}{t(direction)} · {t('有效期：')}{formatRange(relation.claim.validFrom, relation.claim.validTo, relation.claim.datePrecision)}</small></button> : <span><span>{t(category)} → {targetLabel}</span><small>{relationLabel} · {t('方向：')}{t(direction)} · {t('有效期：')}{formatRange(relation.claim.validFrom, relation.claim.validTo, relation.claim.datePrecision)}</small></span>}
        </li>;
      })}
    </ul>
  </section>;
}

function TimeEvidenceReview({ review, t }: { review: PersonTimeReview; t: (text: string) => string }) {
  const { catalog } = useHistoricalContent();
  const sourceNames = review.evidenceSourceIds.map((sourceId) => catalog.sources.find((source) => source.id === sourceId)?.title ?? sourceId);
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
  const { catalog } = useHistoricalContent();
  const knownSourceIds = new Set(catalog.sources.map((source) => source.id));
  const objectId = relation.claim.objectId ?? '';
  const target = relation.kind === 'person-person' ? people.get(objectId) : relation.kind === 'person-polity' ? polities.get(objectId) : events.get(objectId);
  const label = target ? ('title' in target ? t(target.title) : t(target.name)) : objectId;
  const targetType = relation.kind === 'person-person' ? 'person' : relation.kind === 'person-polity' ? 'polity' : relation.kind === 'person-event' ? 'event' : 'heritage';
  const relationLabel = t(relationLabels[relation.relationType] ?? relation.claim.predicate);
  const direction = relation.direction === 'incoming' ? `${label} → ${personName}` : `${personName} → ${label}`;
  const content = <>{relationLabel} · {label}<small className="person-relation-meta">{t('方向：')}{t(direction)} · {t('有效期：')}{formatRange(relation.claim.validFrom, relation.claim.validTo, relation.claim.datePrecision)} · {t('时间精度：')}{t(relationDatePrecisionLabels[relation.claim.datePrecision])} · {t('证据：')}{t(claimEvidenceTypeLabel(relation.claim.evidenceType))} · {t('可信度：')}{t(confidenceLabel(relation.claim.confidence))} · {t('来源：')}{t(hasResolvableSources(relation.claim, knownSourceIds) ? '可用' : '待解析')}</small>{relation.claim.uncertaintyNote && <small>{t('不确定性：')}{t(relation.claim.uncertaintyNote)}</small>}</>;
  return <li>{onOpenEntity ? <button type="button" onClick={() => onOpenEntity({ type: targetType, id: objectId })}>{content}</button> : <span>{content}</span>}<RelationshipSourceLinks sourceIds={relation.claim.sourceIds} t={t} /></li>;
}

function RelationshipSourceLinks({ sourceIds, t }: { sourceIds: string[]; t: (text: string) => string }) {
  const { catalog } = useHistoricalContent();
  const sourceById = new Map(catalog.sources.map((source) => [source.id, source]));
  return <small className="person-relation-sources" aria-label={t('关系来源：')}>
    {t('关系来源：')}{sourceIds.length > 0 ? sourceIds.map((sourceId, index) => {
      const source = sourceById.get(sourceId);
      const isHttpUrl = source?.urlOrCitation?.startsWith('http://') || source?.urlOrCitation?.startsWith('https://');
      return <span key={sourceId}>{index > 0 && '、'}{source ? (isHttpUrl ? <a href={source.urlOrCitation} target="_blank" rel="noreferrer">{t(source.title)}</a> : <span>{t(source.title)}{source.urlOrCitation && ` · ${t(source.urlOrCitation)}`}</span>) : sourceId}</span>;
    }) : t('待补')}
  </small>;
}

function claimEvidenceTypeLabel(type: ClaimEvidenceType) {
  return type === 'explicit-record' ? '明确记载' : type === 'archaeology' ? '考古证据' : type === 'cross-checked' ? '交叉核验' : type === 'inference' ? '推断' : '传统记载';
}

function confidenceLabel(confidence: Confidence) {
  return confidence === 'high' ? '高' : confidence === 'medium' ? '中' : '低';
}

function hasResolvableSources(claim: HistoricalClaim, knownSourceIds: Set<string>) {
  return claim.sourceIds.length > 0 && claim.sourceIds.every((sourceId) => knownSourceIds.has(sourceId));
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
