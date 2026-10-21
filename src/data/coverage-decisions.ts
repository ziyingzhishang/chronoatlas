export type GapVerdict =
  | 'direct-record-added'
  | 'licensed-digitization-added'
  | 'nearest-same-polity'
  | 'maximum-record'
  | 'cultural-core'
  | 'control-centers'
  | 'leave-unfilled';

export interface CoverageDecision {
  id: string;
  polityId: string;
  from: number;
  to: number;
  verdict: GapVerdict;
  sourceBoundaryIds: string[];
  citationIds: string[];
  historicalTransitionCheck: string;
  rationale: string;
  reviewStatus: 'pending' | 'reviewed';
  reviewedAt: string | null;
}

export const gapKey = (polityId: string, from: number, to: number) =>
  `${polityId}:${from}:${to}`;

export const decisionKey = (decision: CoverageDecision) =>
  gapKey(decision.polityId, decision.from, decision.to);

export const coverageDecisions = raw as CoverageDecision[];
import raw from './coverage-decisions.json';

