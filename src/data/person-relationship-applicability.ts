import type { HistoricalClaim, HistoricalEventDetail, Person } from '../domain/types';
import { claims as defaultClaims } from './claims';
import { eventDetails as defaultEventDetails } from './event-details';
import { people as defaultPeople } from './people';
import {
  createPersonRelationshipEvidence,
  uniquePersonRelationshipEvidence,
  type PersonRelationshipEvidence,
} from './person-relationship-evidence';

export const personRelationshipApplicabilityCategoryKeys = [
  'governance',
  'kinship',
  'allianceConflict',
  'eventParticipation',
] as const;

export type PersonRelationshipApplicabilityCategory = typeof personRelationshipApplicabilityCategoryKeys[number];
export type PersonRelationshipApplicabilityStatus = 'required' | 'not-applicable' | 'review';

export interface PersonRelationshipApplicabilityEntry {
  status: PersonRelationshipApplicabilityStatus;
  rationale: string;
  evidenceIds: string[];
  evidence: PersonRelationshipEvidence[];
}

export interface PersonRelationshipApplicabilityRecord {
  personId: string;
  personName: string;
  categories: Record<PersonRelationshipApplicabilityCategory, PersonRelationshipApplicabilityEntry>;
}

export type PersonRelationshipApplicabilityStatusCounts = Record<
  PersonRelationshipApplicabilityStatus,
  number
>;

export interface PersonRelationshipApplicabilityCatalog {
  totalPeople: number;
  totalEntries: number;
  records: PersonRelationshipApplicabilityRecord[];
  byPersonId: Record<string, PersonRelationshipApplicabilityRecord>;
  statusCounts: Record<PersonRelationshipApplicabilityCategory, PersonRelationshipApplicabilityStatusCounts>;
}

export interface PersonRelationshipApplicabilityOptions {
  people?: Person[];
  claims?: HistoricalClaim[];
  eventDetails?: HistoricalEventDetail[];
}

const governancePredicates = new Set(['served', 'appointed', 'succeeded', 'ruled']);
const kinshipPredicates = new Set(['parent-of', 'child-of', 'grandparent-of', 'grandchild-of', 'sibling-of', 'spouse-of']);
const allianceConflictPredicates = new Set(['ally-of', 'enemy-of']);

const governanceRolePattern = /皇帝|君主|国王|可汗|大汗|单于|汗|赞普|南诏王|苏丹|统治者|领袖|宰相|丞相|官员|大臣|刺史|政治家|权臣|元首|总统|国务卿|使节|代表|酋长|诸侯|摄政|宗室|继承者|改革者|建国者|留守|教廷/;
const politicalRolePattern = /皇帝|君主|国王|可汗|大汗|单于|汗|赞普|南诏王|苏丹|统治者|领袖|宰相|丞相|官员|大臣|刺史|政治家|权臣|元首|总统|国务卿|使节|代表|酋长|诸侯|摄政|宗室|继承者|改革者|建国者|军事|将领|军政|抗金|外交|谈判|叛乱|守城|留守|教廷/;
const culturalRolePattern = /诗人|画家|词人|僧侣|译经家|史家|史学家|文学家|学者|思想家|书法家|艺术家|航海者/;

function roleEvidence(person: Person): PersonRelationshipEvidence[] {
  const roles = person.roles ?? [];
  return roles.length > 0
    ? roles.map((role) => createPersonRelationshipEvidence('role', `${person.id}:${role}`))
    : [createPersonRelationshipEvidence('role', `${person.id}:role-review`)];
}

function hasPersonClaim(claim: HistoricalClaim, personId: string, predicates: Set<string>): boolean {
  return predicates.has(claim.predicate)
    && (claim.subjectId === personId || claim.objectId === personId);
}

function claimEvidence(
  personId: string,
  claims: HistoricalClaim[],
  predicates: Set<string>,
): PersonRelationshipEvidence[] {
  return claims
    .filter((claim) => hasPersonClaim(claim, personId, predicates))
    .map((claim) => createPersonRelationshipEvidence('claim', claim.id));
}

function eventEvidence(personId: string, eventDetails: HistoricalEventDetail[]): PersonRelationshipEvidence[] {
  return eventDetails
    .filter((detail) => detail.participants.some((participant) => (
      participant.personId === personId && (participant.relationType === undefined || participant.relationType === 'direct')
    )))
    .map((detail) => createPersonRelationshipEvidence('event-detail', detail.eventId));
}

function entry(
  status: PersonRelationshipApplicabilityStatus,
  rationale: string,
  evidence: PersonRelationshipEvidence[],
): PersonRelationshipApplicabilityEntry {
  const uniqueEvidence = uniquePersonRelationshipEvidence(evidence);
  return {
    status,
    rationale,
    evidenceIds: uniqueEvidence.map((item) => item.evidenceId),
    evidence: uniqueEvidence,
  };
}

function buildRecord(
  person: Person,
  claims: HistoricalClaim[],
  eventDetails: HistoricalEventDetail[],
): PersonRelationshipApplicabilityRecord {
  const roles = person.roles ?? [];
  const roleIds = roleEvidence(person);
  const culturalOnly = roles.length > 0 && roles.every((role) => culturalRolePattern.test(role));
  const governanceEvidence = claimEvidence(person.id, claims, governancePredicates);
  const kinshipEvidence = claimEvidence(person.id, claims, kinshipPredicates);
  const allianceConflictEvidence = claimEvidence(person.id, claims, allianceConflictPredicates);
  const participationEvidence = [
    ...claimEvidence(person.id, claims, new Set(['participated-in'])),
    ...eventEvidence(person.id, eventDetails),
  ];
  const hasGovernanceRole = roles.some((role) => governanceRolePattern.test(role));
  const hasPoliticalRole = roles.some((role) => politicalRolePattern.test(role));

  const governance = governanceEvidence.length > 0 || hasGovernanceRole
    ? entry('required', '人物角色或现有治理关系表明需要核验其君臣、任职、继承或统治关系。', [...governanceEvidence, ...roleIds])
    : culturalOnly
      ? entry('not-applicable', '现有人物角色均为文化、宗教或知识活动角色，且没有可解析治理关系；当前治理关系对该人物不适用。', roleIds)
      : entry('review', '现有角色不足以安全判断治理关系是否适用，保留人工复核，不把未知当作不适用。', roleIds);

  const kinship = kinshipEvidence.length > 0 || hasGovernanceRole
    ? entry('required', '人物处于政权、官职或家族网络中，亲属关系应优先核验；现有关系证据也支持继续补全。', [...kinshipEvidence, ...roleIds])
    : entry('review', '现有人物角色和来源不足以判断亲属关系是否适用，保留人工复核。', [...kinshipEvidence, ...roleIds]);

  const allianceConflict = allianceConflictEvidence.length > 0 || hasPoliticalRole
    ? entry('required', '人物角色或现有联盟/对立关系表明需要核验政治协作、冲突及其时间范围。', [...allianceConflictEvidence, ...roleIds])
    : culturalOnly
      ? entry('not-applicable', '现有人物角色均为文化、宗教或知识活动角色，且没有可解析联盟/对立关系；当前类别不适用。', roleIds)
      : entry('review', '现有角色不足以安全判断联盟/对立关系是否适用，保留人工复核。', [...allianceConflictEvidence, ...roleIds]);

  const eventParticipation = participationEvidence.length > 0 || hasPoliticalRole
    ? entry('required', '人物已有事件参与证据或政治、军事、外交角色，应核验其参与事件及事件中的具体角色。', [...participationEvidence, ...roleIds])
    : entry('review', '当前目录没有足够证据判断事件参与是否完整，保留人工复核。', [...participationEvidence, ...roleIds]);

  return {
    personId: person.id,
    personName: person.name,
    categories: { governance, kinship, allianceConflict, eventParticipation },
  };
}

function emptyStatusCounts(): PersonRelationshipApplicabilityStatusCounts {
  return { required: 0, 'not-applicable': 0, review: 0 };
}

export function buildPersonRelationshipApplicabilityCatalog(
  options: PersonRelationshipApplicabilityOptions = {},
): PersonRelationshipApplicabilityCatalog {
  const people = options.people ?? defaultPeople;
  const claims = options.claims ?? defaultClaims;
  const eventDetails = options.eventDetails ?? defaultEventDetails;
  const records = people.map((person) => buildRecord(person, claims, eventDetails));
  const byPersonId = Object.fromEntries(records.map((record) => [record.personId, record]));
  const statusCounts = Object.fromEntries(personRelationshipApplicabilityCategoryKeys.map((category) => {
    const counts = emptyStatusCounts();
    records.forEach((record) => { counts[record.categories[category].status] += 1; });
    return [category, counts];
  })) as Record<PersonRelationshipApplicabilityCategory, PersonRelationshipApplicabilityStatusCounts>;
  return {
    totalPeople: people.length,
    totalEntries: people.length * personRelationshipApplicabilityCategoryKeys.length,
    records,
    byPersonId,
    statusCounts,
  };
}

export const personRelationshipApplicability = buildPersonRelationshipApplicabilityCatalog();
