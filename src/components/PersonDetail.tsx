import type { HistoricalClaim, HistoricalEvent, Person, PersonDetail as PersonDetailRecord, PersonRelationType, Polity } from '../domain/types';
import { groupPersonRelationships, type PersonRelationship } from '../domain/relationships';
import { formatHistoricalYear } from '../domain/timeline';
import { useLocale } from '../i18n/locale';
import { useHistoricalContent } from '../content/ContentContext';
import { toReaderSources } from '../presentation/reader-content';
import { ReaderNotes } from './ReaderNotes';
import { readerPersonRelationshipLabel } from '../presentation/relationship-label';

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

export function PersonDetail({ person, detail, year, claims, people = [], polities = [], events = [], onOpenEntity }: PersonDetailProps) {
  const { t } = useLocale();
  const { catalog } = useHistoricalContent();
  if (!detail) return <article className="event-detail person-detail" aria-label={t('人物详情')}><h3>{t(person.name)}</h3><p className="detail-note">{t('暂无已收录人物详情')}</p></article>;

  const grouped = groupPersonRelationships(person.id, year, claims);
  const personById = new Map(people.map((item) => [item.id, item]));
  const polityById = new Map(polities.map((item) => [item.id, item]));
  const eventById = new Map(events.map((item) => [item.id, item]));
  const timeNote = catalog.personTimeNotes.find((record) => record.personId === person.id);

  return <article className="event-detail person-detail" aria-label={t('人物详情')}>
    <div className="event-meta">{t(person.roles?.join('／') ?? '历史人物')} · {formatLife(person.birthYear, person.deathYear)}</div>
    <h3>{t(person.name)}</h3>
    {detail.aliases.length > 0 && <p className="aliases">{t('别名：')}{detail.aliases.map(t).join('、')}</p>}
    <p className="event-lead">{t(detail.biography)}</p>

    <section className="person-detail-section">
      <h4>{t('任职经历')}</h4>
      <ul className="study-list">{detail.offices.map((office, index) => <li key={`${office.title}-${index}`}><span>{t(office.title)}{office.polityId && ` · ${t(polityById.get(office.polityId)?.name ?? '相关政权')}`}</span><span>{formatRange(office.validFrom, office.validTo, office.datePrecision)}</span></li>)}</ul>
    </section>

    <section className="person-detail-section">
      <h4>{t('关键事件')}</h4>
      {detail.keyEvents.length > 0 ? <ul className="study-list">{detail.keyEvents.map((eventId) => { const event = eventById.get(eventId); return <li key={eventId}>{event ? <button type="button" onClick={() => onOpenEntity?.({ type: 'event', id: event.id })}>{t(event.title)}</button> : <span>{t('相关资料尚待补充')}</span>}</li>; })}</ul> : <p className="detail-note">{t('暂无已收录关键事件')}</p>}
    </section>

    <section className="person-detail-section" aria-label={t('人物关系')}>
      <h4>{t('人物关系')}</h4>
      <PersonRelationshipGraph personName={person.name} grouped={grouped} people={personById} polities={polityById} events={eventById} onOpenEntity={onOpenEntity} t={t} />
      {relationSections.map((section) => <RelationSection key={section.title} title={section.title} types={section.types} grouped={grouped} people={personById} polities={polityById} events={eventById} onOpenEntity={onOpenEntity} t={t} />)}
      {grouped['person-heritage'].length > 0 && <RelationSection title="其他关系" types={['commissioned']} grouped={grouped} people={personById} polities={polityById} events={eventById} onOpenEntity={onOpenEntity} t={t} />}
    </section>

    <ReaderNotes className="event-sources" note={{
      dateDescription: timeNote?.dateDescription ?? '生卒年尚待核实',
      uncertainty: [timeNote?.uncertainty, detail.uncertaintyNote].filter(Boolean).join('；'),
      sources: toReaderSources([...detail.sourceIds, ...(timeNote?.sourceIds ?? [])], catalog.sources),
    }} />
  </article>;
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
        const targetLabel = target ? ('title' in target ? t(target.title) : t(target.name)) : t('相关对象');
        const targetType = relation.kind === 'person-person' ? 'person' : relation.kind === 'person-polity' ? 'polity' : relation.kind === 'person-event' ? 'event' : 'heritage';
        const relationLabel = t(readerPersonRelationshipLabel(relation.relationType));
        const accessibleLabel = `${relationLabel}：${targetLabel}`;
        return <li key={`graph-${relation.claim.id}`} className="person-relationship-graph-edge">
          {onOpenEntity ? <button type="button" aria-label={accessibleLabel} onClick={() => onOpenEntity({ type: targetType, id: objectId })}><span>{t(category)} · {targetLabel}</span><small>{relationLabel} · {formatRange(relation.claim.validFrom, relation.claim.validTo, relation.claim.datePrecision)}</small></button> : <span><span>{t(category)} · {targetLabel}</span><small>{relationLabel} · {formatRange(relation.claim.validFrom, relation.claim.validTo, relation.claim.datePrecision)}</small></span>}
        </li>;
      })}
    </ul>
  </section>;
}

function RelationSection({ title, types, grouped, people, polities, events, onOpenEntity, t }: { title: string; types: PersonRelationType[]; grouped: ReturnType<typeof groupPersonRelationships>; people: Map<string, Person>; polities: Map<string, Polity>; events: Map<string, HistoricalEvent>; onOpenEntity?: PersonDetailProps['onOpenEntity']; t: (text: string) => string }) {
  const relations = types.flatMap((type) => grouped[type]);
  return <section className="person-relation-section"><h5>{t(title)}</h5>{relations.length > 0 ? <ul className="study-list">{relations.map((relation) => <RelationItem key={relation.claim.id} relation={relation} people={people} polities={polities} events={events} onOpenEntity={onOpenEntity} t={t} />)}</ul> : <p className="detail-note">{t('暂无已收录关系')}</p>}</section>;
}

function RelationItem({ relation, people, polities, events, onOpenEntity, t }: { relation: PersonRelationship; people: Map<string, Person>; polities: Map<string, Polity>; events: Map<string, HistoricalEvent>; onOpenEntity?: PersonDetailProps['onOpenEntity']; t: (text: string) => string }) {
  const { catalog } = useHistoricalContent();
  const objectId = relation.claim.objectId ?? '';
  const target = relation.kind === 'person-person' ? people.get(objectId) : relation.kind === 'person-polity' ? polities.get(objectId) : events.get(objectId);
  const label = target ? ('title' in target ? t(target.title) : t(target.name)) : t('相关对象');
  const targetType = relation.kind === 'person-person' ? 'person' : relation.kind === 'person-polity' ? 'polity' : relation.kind === 'person-event' ? 'event' : 'heritage';
  const relationLabel = t(readerPersonRelationshipLabel(relation.relationType));
  const content = <>{relationLabel} · {label}<small className="person-relation-meta">{formatRange(relation.claim.validFrom, relation.claim.validTo, relation.claim.datePrecision)}</small></>;
  return <li>{onOpenEntity ? <button type="button" onClick={() => onOpenEntity({ type: targetType, id: objectId })}>{content}</button> : <span>{content}</span>}<ReaderNotes note={{ uncertainty: relation.claim.uncertaintyNote, sources: toReaderSources(relation.claim.sourceIds, catalog.sources) }} /></li>;
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
