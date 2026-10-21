import type { HistoricalEvent, HeritageAsset, Person, Polity } from '../domain/types';
import { getChanganStudyBundle } from './changan-study';

export interface ChanganCoverageCounts {
  polityStages: number;
  people: number;
  events: number;
  heritage: number;
}

export interface ChanganCoverageSourceSummary {
  total: number;
  covered: number;
  rate: number;
  missingNodeIds: string[];
}

export type ChanganCoverageReviewReason = 'missing-source' | 'missing-time';

export interface ChanganCoverageReviewItem {
  type: 'polity' | 'person' | 'event' | 'heritage';
  id: string;
  label: string;
  reason: ChanganCoverageReviewReason;
}

export interface ChanganCoverageGap {
  type: keyof ChanganCoverageCounts;
  target: number;
  current: number;
  shortfall: number;
}

export interface ChanganCoverageReport {
  counts: ChanganCoverageCounts;
  targets: ChanganCoverageCounts;
  shortfalls: ChanganCoverageCounts;
  sourceCoverage: ChanganCoverageSourceSummary;
  reviewItems: ChanganCoverageReviewItem[];
  gapList: ChanganCoverageGap[];
}

const targets: ChanganCoverageCounts = {
  polityStages: 15,
  people: 30,
  events: 30,
  heritage: 20,
};

type CoverageNode = Polity | Person | HistoricalEvent | HeritageAsset;

function hasSource(node: CoverageNode): boolean {
  return node.sourceIds.length > 0;
}

function hasTime(node: CoverageNode): boolean {
  if ('startYear' in node) return Number.isFinite(node.startYear) && Number.isFinite(node.endYear);
  if ('birthYear' in node || 'deathYear' in node) {
    return Number.isFinite(node.birthYear) && Number.isFinite(node.deathYear);
  }
  if ('year' in node) return Number.isFinite(node.year);
  if ('constructionFrom' in node) return Number.isFinite(node.constructionFrom);
  return false;
}

function labelOf(node: CoverageNode): string {
  return 'name' in node ? node.name : node.title;
}

function reviewItemsFor(
  type: ChanganCoverageReviewItem['type'],
  nodes: CoverageNode[],
): ChanganCoverageReviewItem[] {
  return nodes.flatMap((node) => {
    const items: ChanganCoverageReviewItem[] = [];
    if (!hasSource(node)) items.push({ type, id: node.id, label: labelOf(node), reason: 'missing-source' });
    if (!hasTime(node)) items.push({ type, id: node.id, label: labelOf(node), reason: 'missing-time' });
    return items;
  });
}

export function getChanganCoverageReport(): ChanganCoverageReport {
  const bundle = getChanganStudyBundle();
  const nodeGroups: Array<[ChanganCoverageReviewItem['type'], CoverageNode[]]> = [
    ['polity', bundle.polities],
    ['person', bundle.people],
    ['event', bundle.events],
    ['heritage', bundle.heritage],
  ];
  const counts: ChanganCoverageCounts = {
    polityStages: bundle.polities.length,
    people: bundle.people.length,
    events: bundle.events.length,
    heritage: bundle.heritage.length,
  };
  const allNodes = nodeGroups.flatMap(([, nodes]) => nodes);
  const coveredNodes = allNodes.filter(hasSource);

  const shortfalls: ChanganCoverageCounts = {
    polityStages: Math.max(0, targets.polityStages - counts.polityStages),
    people: Math.max(0, targets.people - counts.people),
    events: Math.max(0, targets.events - counts.events),
    heritage: Math.max(0, targets.heritage - counts.heritage),
  };
  const gapList = (Object.keys(targets) as Array<keyof ChanganCoverageCounts>).map((type) => ({
    type,
    target: targets[type],
    current: counts[type],
    shortfall: shortfalls[type],
  }));

  return {
    counts,
    targets,
    shortfalls,
    sourceCoverage: {
      total: allNodes.length,
      covered: coveredNodes.length,
      rate: allNodes.length === 0 ? 1 : coveredNodes.length / allNodes.length,
      missingNodeIds: allNodes.filter((node) => !hasSource(node)).map((node) => node.id),
    },
    reviewItems: nodeGroups.flatMap(([type, nodes]) => reviewItemsFor(type, nodes)),
    gapList,
  };
}
