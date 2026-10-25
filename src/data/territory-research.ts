import { coverageDecisions, type CoverageDecision, type GapVerdict } from './coverage-decisions';

export type TerritoryRepresentation =
  | 'direct-boundary'
  | 'control-centers'
  | 'cultural-core'
  | 'influence-area'
  | 'leave-unfilled';

export type TerritoryResearchStatus =
  | 'queued'
  | 'researching'
  | 'source-checked'
  | 'cross-checked'
  | 'accepted'
  | 'blocked';

export type TerritoryResearchBatch = 'batch-2' | 'batch-3' | 'batch-4';

export interface TerritoryResearchTask {
  taskId: string;
  polityId: string;
  from: number;
  to: number;
  priority: 1 | 2 | 3;
  batch: TerritoryResearchBatch;
  pilot: boolean;
  researchQuestion: string;
  previousDecisionId: string;
  status: TerritoryResearchStatus;
  proposedRepresentation?: TerritoryRepresentation;
  sourceIds: string[];
  geometryAssetId?: string;
  historicalDecision?: string;
  rightsReview?: string;
  publicationReview?: string;
  reviewedBy: string[];
  reviewedAt?: string;
}

export interface TerritoryResearchYearConclusion {
  taskId: string;
  previousDecisionId: string;
  polityId: string;
  year: number;
  status: 'inherited-for-review';
  proposedRepresentation?: TerritoryRepresentation;
  sourceIds: string[];
  conclusion: string;
}

export interface TerritoryGeometryConflict {
  conflictId: string;
  taskIds: [string, string];
  years: number[];
  status: 'requires-review' | 'resolved';
  resolution?: string;
  reviewedBy: string[];
}

export interface TerritoryResearchReleaseSummary {
  newGeometry: number;
  alternativeRepresentation: number;
  leaveUnfilled: number;
  blocked: number;
}

export interface TerritoryGeometryAsset {
  assetId: string;
  taskId: string;
  version: number;
  uri: string;
  sha256: string;
  sourceIds: string[];
  license: string;
}

const pilotDecisionIds = new Set([
  'gap-qin--221--219',
  'gap-han_western--206--203',
  'gap-wei_three-220-223',
  'gap-sui-581-586',
  'gap-tang-618-622',
  'gap-liang_later-907-910',
  'gap-song_northern-960-960',
  'gap-song_south-1127-1138',
  'gap-ming-1368-1374',
  'gap-northern_yuan-1368-1374',
]);

const batch2DecisionIds = new Set([
  ...coverageDecisions.slice(0, 8).map((decision) => decision.id),
  'gap-sui-581-586', 'gap-tang-618-622', 'gap-tibetan_empire-618-622',
  'gap-nanzhao-738-740', 'gap-wu_zhou-705-705',
]);
const fiveDynastiesPolities = new Set([
  'liang_later', 'tang_later', 'jin_later', 'zhou_later',
  'wu_ten', 'southern_tang', 'wuyue', 'min', 'chu_ten', 'former_shu',
  'later_shu', 'jingnan', 'northern_han', 'dali',
]);
const weiJinAdditionalPolities = new Set([
  'goguryeo', 'turkic', 'former_liang', 'western_qin', 'later_liang',
  'southern_liang', 'southern_yan', 'western_liang', 'northern_yan',
]);

function researchBatch(decision: CoverageDecision): TerritoryResearchBatch {
  if (batch2DecisionIds.has(decision.id) || fiveDynastiesPolities.has(decision.polityId)) return 'batch-2';
  if ((decision.from >= 220 && decision.to <= 589) || weiJinAdditionalPolities.has(decision.polityId)) return 'batch-3';
  return 'batch-4';
}

function representationFromVerdict(verdict: GapVerdict): TerritoryRepresentation | undefined {
  if (verdict === 'direct-record-added' || verdict === 'licensed-digitization-added') return 'direct-boundary';
  if (verdict === 'control-centers') return 'control-centers';
  if (verdict === 'cultural-core') return 'cultural-core';
  if (verdict === 'leave-unfilled') return 'leave-unfilled';
  // A maximum outline or nearest-year bridge is not promoted to a new research proposal.
  return undefined;
}

function priorityFor(decision: CoverageDecision): 1 | 2 | 3 {
  if (pilotDecisionIds.has(decision.id)) return 1;
  const yearCount = expandCivilYears(decision.from, decision.to).length;
  return yearCount >= 20 ? 2 : 3;
}

export function expandCivilYears(from: number, to: number): number[] {
  if (from > to) throw new Error(`Invalid civil-year range: ${from}..${to}`);
  const years: number[] = [];
  for (let year = from; year <= to; year += 1) if (year !== 0) years.push(year);
  return years;
}

function buildTask(decision: CoverageDecision): TerritoryResearchTask {
  return {
    taskId: `territory-research:${decision.id}:v1`,
    polityId: decision.polityId,
    from: decision.from,
    to: decision.to,
    priority: priorityFor(decision),
    batch: researchBatch(decision),
    pilot: pilotDecisionIds.has(decision.id),
    researchQuestion: `在${decision.from}至${decision.to}年间，${decision.polityId}的直接控制、军事占领、羁縻或属国关系、文化核心与影响范围分别能被哪些史料和空间证据支持？`,
    previousDecisionId: decision.id,
    status: 'queued',
    proposedRepresentation: representationFromVerdict(decision.verdict),
    sourceIds: [...decision.citationIds],
    historicalDecision: decision.rationale,
    reviewedBy: [],
  };
}

export const territoryResearchTasks: TerritoryResearchTask[] = coverageDecisions.map(buildTask);

export const territoryResearchYearConclusions: TerritoryResearchYearConclusion[] = territoryResearchTasks.flatMap((task) =>
  expandCivilYears(task.from, task.to).map((year) => ({
    taskId: task.taskId,
    previousDecisionId: task.previousDecisionId,
    polityId: task.polityId,
    year,
    status: 'inherited-for-review' as const,
    proposedRepresentation: task.proposedRepresentation,
    sourceIds: [...task.sourceIds],
    conclusion: task.historicalDecision ?? '既有结论待逐年复核。',
  })),
);

export function validateTerritoryResearchTask(task: TerritoryResearchTask): string[] {
  const problems: string[] = [];
  if (task.geometryAssetId && task.status !== 'accepted') {
    problems.push('Only accepted research tasks may reference runtime geometry.');
  }
  if (task.proposedRepresentation === 'leave-unfilled' && task.geometryAssetId) {
    problems.push('Leave-unfilled decisions cannot reference geometry.');
  }
  if (task.status === 'accepted') {
    if (task.sourceIds.length === 0) problems.push('Accepted tasks require source records.');
    if (!task.historicalDecision?.trim()) problems.push('Accepted tasks require a historical decision.');
    if (!task.rightsReview?.trim()) problems.push('Accepted tasks require a rights review.');
    if (!task.publicationReview?.trim()) problems.push('Accepted tasks require a publication review.');
    if (task.reviewedBy.length === 0 || !task.reviewedAt) {
      problems.push('Accepted tasks require named reviewers and a review date.');
    }
  }
  return problems;
}

export function acceptedTerritoryGeometryTasks(
  tasks = territoryResearchTasks,
  conflicts: TerritoryGeometryConflict[] = [],
): TerritoryResearchTask[] {
  const heldTaskIds = new Set(conflicts
    .filter((conflict) => conflict.status === 'requires-review')
    .flatMap((conflict) => conflict.taskIds));
  return tasks.filter((task) => task.status === 'accepted'
    && Boolean(task.geometryAssetId)
    && !heldTaskIds.has(task.taskId)
    && validateTerritoryResearchTask(task).length === 0);
}

export function summarizeTerritoryResearchRelease(
  tasks: TerritoryResearchTask[],
): TerritoryResearchReleaseSummary {
  return tasks.reduce<TerritoryResearchReleaseSummary>((summary, task) => {
    if (task.status === 'blocked') summary.blocked += 1;
    if (task.status !== 'accepted') return summary;
    if (task.geometryAssetId) summary.newGeometry += 1;
    else if (task.proposedRepresentation === 'leave-unfilled') summary.leaveUnfilled += 1;
    else if (task.proposedRepresentation && task.proposedRepresentation !== 'direct-boundary') {
      summary.alternativeRepresentation += 1;
    }
    return summary;
  }, { newGeometry: 0, alternativeRepresentation: 0, leaveUnfilled: 0, blocked: 0 });
}

export function validateTerritoryGeometryAssets(
  tasks: TerritoryResearchTask[],
  assets: TerritoryGeometryAsset[],
): string[] {
  const problems: string[] = [];
  const tasksById = new Map(tasks.map((task) => [task.taskId, task]));
  const assetsById = new Map(assets.map((asset) => [asset.assetId, asset]));
  for (const task of tasks.filter((candidate) => candidate.geometryAssetId)) {
    const asset = assetsById.get(task.geometryAssetId!);
    if (!asset) {
      problems.push(`Task ${task.taskId} references missing geometry ${task.geometryAssetId}.`);
      continue;
    }
    if (asset.taskId !== task.taskId) {
      problems.push(`Geometry ${asset.assetId} does not point back to ${task.taskId}.`);
    }
    for (const sourceId of asset.sourceIds) {
      if (!task.sourceIds.includes(sourceId)) {
        problems.push(`Geometry ${asset.assetId} references source ${sourceId} outside its decision.`);
      }
    }
    if (asset.version < 1 || !asset.uri.trim() || !/^[a-f\d]{64}$/i.test(asset.sha256) || !asset.license.trim()) {
      problems.push(`Geometry ${asset.assetId} is missing versioned file, checksum, or license metadata.`);
    }
  }
  for (const asset of assets) {
    if (!tasksById.has(asset.taskId)) problems.push(`Geometry ${asset.assetId} references unknown task ${asset.taskId}.`);
  }
  return problems;
}
