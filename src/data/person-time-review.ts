import type {
  HistoricalClaim,
  Person,
  PersonDetail,
} from '../domain/types';
import { claims as defaultClaims } from './claims';
import { people as defaultPeople } from './people';
import { personDetails as defaultPersonDetails } from './person-details';

export type PersonTimeReviewStatus = 'confirmed' | 'approximate' | 'unknown';

export interface PersonTimeEvidence {
  recordId: string;
  kind: 'person-field' | 'office' | 'claim';
  from?: number;
  to?: number;
  datePrecision: 'year' | 'range' | 'approximate' | 'century' | 'unknown';
  sourceIds: string[];
  explanation: string;
}

export interface PersonTimeReview {
  personId: string;
  personName: string;
  status: PersonTimeReviewStatus;
  birthYear?: number;
  deathYear?: number;
  evidence: PersonTimeEvidence[];
  evidenceSourceIds: string[];
  allowTimelinePosition: boolean;
  explanation: string;
}

export interface PersonTimeReviewCatalog {
  people: Person[];
  personDetails: PersonDetail[];
  claims: HistoricalClaim[];
}

export interface PersonTimeCoverageReport {
  totalPeople: number;
  statusCounts: Record<PersonTimeReviewStatus, number>;
  records: PersonTimeReview[];
  uncertainPersonIds: string[];
  byPersonId: Record<string, PersonTimeReview>;
}

const activityPredicates = new Set([
  'appointed',
  'commissioned',
  'founded',
  'participated-in',
  'ruled',
  'served',
]);

function finite(value: number | undefined): value is number {
  return Number.isFinite(value);
}

function unique(values: string[]): string[] {
  return [...new Set(values)].sort();
}

function hasTime(evidence: Pick<PersonTimeEvidence, 'from' | 'to'>): boolean {
  return finite(evidence.from) || finite(evidence.to);
}

function evidenceFromPerson(person: Person): PersonTimeEvidence[] {
  const evidence: PersonTimeEvidence[] = [];
  if (finite(person.birthYear)) {
    evidence.push({
      recordId: `person:${person.id}:birth`,
      kind: 'person-field',
      from: person.birthYear,
      datePrecision: 'year',
      sourceIds: [...person.sourceIds],
      explanation: '人物目录直接记录了生年。',
    });
  }
  if (finite(person.deathYear)) {
    evidence.push({
      recordId: `person:${person.id}:death`,
      kind: 'person-field',
      to: person.deathYear,
      datePrecision: 'year',
      sourceIds: [...person.sourceIds],
      explanation: '人物目录直接记录了卒年。',
    });
  }
  return evidence;
}

function evidenceFromDetails(person: Person, detail: PersonDetail | undefined): PersonTimeEvidence[] {
  if (!detail) return [];
  return detail.offices.flatMap((office, index) => {
    const evidence: PersonTimeEvidence = {
      recordId: `person:${person.id}:office:${index}`,
      kind: 'office',
      from: office.validFrom,
      to: office.validTo,
      datePrecision: office.datePrecision,
      sourceIds: [...office.sourceIds],
      explanation: `任职记录“${office.title}”提供活动时间锚点，不代表完整生卒年。`,
    };
    return hasTime(evidence) && office.datePrecision !== 'unknown' ? [evidence] : [];
  });
}

function evidenceFromClaims(person: Person, sourceClaims: HistoricalClaim[]): PersonTimeEvidence[] {
  return sourceClaims
    .filter((claim) => (
      (claim.subjectId === person.id || claim.objectId === person.id)
      && activityPredicates.has(claim.predicate)
      && (finite(claim.validFrom) || finite(claim.validTo))
    ))
    .map((claim) => ({
      recordId: `claim:${claim.id}`,
      kind: 'claim' as const,
      from: claim.validFrom,
      to: claim.validTo,
      datePrecision: claim.datePrecision === 'day' ? 'year' : claim.datePrecision,
      sourceIds: [...claim.sourceIds],
      explanation: claim.uncertaintyNote
        ? `活动关系 claim：${claim.uncertaintyNote}`
        : '活动关系 claim 提供了人物活动时间锚点，不代表完整生卒年。',
    }));
}

function classify(person: Person, evidence: PersonTimeEvidence[]): PersonTimeReviewStatus {
  if (finite(person.birthYear) && finite(person.deathYear)) return 'confirmed';
  return evidence.some(hasTime) ? 'approximate' : 'unknown';
}

function explanationFor(
  person: Person,
  status: PersonTimeReviewStatus,
  evidence: PersonTimeEvidence[],
): string {
  if (status === 'confirmed') return '现有人物目录同时记录生年与卒年，可按完整生卒区间定位。';
  if (status === 'approximate') {
    const kinds = unique(evidence.map((item) => item.kind === 'person-field' ? '部分生卒年' : item.kind === 'office' ? '任职记录' : '活动关系'));
    const caveat = evidence.find((item) => item.kind === 'claim' && /传统|争议|约年|不确定/.test(item.explanation));
    return `${person.name}未同时记录完整生卒年；本目录仅采纳${kinds.join('、')}作为时间锚点，不将其扩展为完整生卒区间。${caveat ? ` 证据说明：${caveat.explanation}` : ''}`;
  }
  return `${person.name}在现有 people、person-details、claims 中没有可用于人物时间定位的生卒或活动时间记录，暂不定位。`;
}

function reviewPerson(
  person: Person,
  detail: PersonDetail | undefined,
  sourceClaims: HistoricalClaim[],
): PersonTimeReview {
  const evidence = [
    ...evidenceFromPerson(person),
    ...evidenceFromDetails(person, detail),
    ...evidenceFromClaims(person, sourceClaims),
  ];
  const status = classify(person, evidence);
  return {
    personId: person.id,
    personName: person.name,
    status,
    birthYear: person.birthYear,
    deathYear: person.deathYear,
    evidence,
    evidenceSourceIds: unique(evidence.flatMap((item) => item.sourceIds)),
    allowTimelinePosition: status !== 'unknown' && evidence.some(hasTime),
    explanation: explanationFor(person, status, evidence),
  };
}

export function buildPersonTimeCoverageReport(catalog: PersonTimeReviewCatalog = {
  people: defaultPeople,
  personDetails: defaultPersonDetails,
  claims: defaultClaims,
}): PersonTimeCoverageReport {
  const detailByPersonId = new Map(catalog.personDetails.map((detail) => [detail.personId, detail]));
  const records = catalog.people.map((person) => reviewPerson(
    person,
    detailByPersonId.get(person.id),
    catalog.claims,
  ));
  const statusCounts: Record<PersonTimeReviewStatus, number> = {
    confirmed: 0,
    approximate: 0,
    unknown: 0,
  };
  records.forEach((record) => { statusCounts[record.status] += 1; });
  const byPersonId = Object.fromEntries(records.map((record) => [record.personId, record]));
  return {
    totalPeople: records.length,
    statusCounts,
    records,
    uncertainPersonIds: records
      .filter((record) => record.status !== 'confirmed')
      .map((record) => record.personId),
    byPersonId,
  };
}
