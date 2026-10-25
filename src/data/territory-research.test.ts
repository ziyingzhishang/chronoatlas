import { describe, expect, it } from 'vitest';

import { getHistoricalState } from '../domain/history-state';
import { coverageDecisions } from './coverage-decisions';
import {
  acceptedTerritoryGeometryTasks,
  expandCivilYears,
  summarizeTerritoryResearchRelease,
  territoryResearchTasks,
  territoryResearchYearConclusions,
  validateTerritoryResearchTask,
  validateTerritoryGeometryAssets,
} from './territory-research';

describe('territory research ledger', () => {
  it('creates exactly one current, version-linked task for each of the 90 existing decisions', () => {
    expect(coverageDecisions).toHaveLength(90);
    expect(territoryResearchTasks).toHaveLength(90);
    expect(new Set(territoryResearchTasks.map((task) => task.taskId)).size).toBe(90);
    expect(new Set(territoryResearchTasks.map((task) => task.previousDecisionId)).size).toBe(90);
    expect(territoryResearchTasks.map((task) => task.previousDecisionId).sort())
      .toEqual(coverageDecisions.map((decision) => decision.id).sort());
  });

  it('records an inherited, traceable conclusion for every civil year without inventing year zero', () => {
    expect(expandCivilYears(-1, 1)).toEqual([-1, 1]);
    for (const task of territoryResearchTasks) {
      const years = territoryResearchYearConclusions
        .filter((conclusion) => conclusion.taskId === task.taskId)
        .map((conclusion) => conclusion.year);
      expect(years, task.taskId).toEqual(expandCivilYears(task.from, task.to));
      expect(years, task.taskId).not.toContain(0);
      expect(task.historicalDecision, task.taskId).toBeTruthy();
    }
  });

  it('keeps baseline tasks outside the runtime geometry publication path', () => {
    expect(territoryResearchTasks.every((task) => task.status === 'queued')).toBe(true);
    expect(territoryResearchTasks.every((task) => task.geometryAssetId === undefined)).toBe(true);
    const representativeYears = [-221, 220, 581, 618, 907, 960, 1271, 1368, 1644, 1912, 1949, 2026];
    const renderedIds = representativeYears.flatMap((year) => getHistoricalState(year).boundaries.map((boundary) => boundary.id));
    expect(renderedIds.some((id) => id.startsWith('territory-research:'))).toBe(false);
  });

  it('rejects premature geometry, incomplete acceptance, and leave-unfilled geometry', () => {
    const base = territoryResearchTasks[0];
    expect(validateTerritoryResearchTask({ ...base, geometryAssetId: 'geo:test' }))
      .toContain('Only accepted research tasks may reference runtime geometry.');
    expect(validateTerritoryResearchTask({ ...base, status: 'accepted', sourceIds: [] }))
      .toEqual(expect.arrayContaining([
        'Accepted tasks require source records.',
        'Accepted tasks require a rights review.',
        'Accepted tasks require a publication review.',
        'Accepted tasks require named reviewers and a review date.',
      ]));
    expect(validateTerritoryResearchTask({
      ...base,
      proposedRepresentation: 'leave-unfilled',
      geometryAssetId: 'geo:test',
    })).toContain('Leave-unfilled decisions cannot reference geometry.');
  });

  it('assigns every task to the 28/36/26 planned batches and keeps pilot work highest priority', () => {
    expect(territoryResearchTasks.filter((task) => task.batch === 'batch-2')).toHaveLength(28);
    expect(territoryResearchTasks.filter((task) => task.batch === 'batch-3')).toHaveLength(36);
    expect(territoryResearchTasks.filter((task) => task.batch === 'batch-4')).toHaveLength(26);
    const pilots = territoryResearchTasks.filter((task) => task.pilot);
    expect(pilots.length).toBeGreaterThanOrEqual(9);
    expect(pilots.every((task) => task.priority === 1)).toBe(true);
    expect(pilots.map((task) => task.polityId)).toEqual(expect.arrayContaining([
      'qin', 'han_western', 'wei_three', 'sui', 'tang', 'liang_later',
      'song_northern', 'song_south', 'ming', 'northern_yuan',
    ]));
  });

  it('holds concurrent geometry conflicts for human review instead of auto-publishing them', () => {
    const accepted = territoryResearchTasks.slice(0, 2).map((task, index) => ({
      ...task,
      status: 'accepted' as const,
      proposedRepresentation: 'direct-boundary' as const,
      geometryAssetId: `geometry:${index}`,
      rightsReview: '许可与改绘条件已记录。',
      publicationReview: '公开展示条件已单独核对。',
      reviewedBy: ['history-reviewer', 'cartography-reviewer'],
      reviewedAt: '2026-10-25',
    }));
    expect(acceptedTerritoryGeometryTasks(accepted)).toHaveLength(2);
    expect(acceptedTerritoryGeometryTasks(accepted, [{
      conflictId: 'conflict:test',
      taskIds: [accepted[0].taskId, accepted[1].taskId],
      years: [-221],
      status: 'requires-review',
      reviewedBy: [],
    }])).toEqual([]);
  });

  it('reports geometry, alternative expression, leave-unfilled, and blocked outcomes separately', () => {
    expect(summarizeTerritoryResearchRelease([
      { ...territoryResearchTasks[0], status: 'accepted', geometryAssetId: 'geometry:1', proposedRepresentation: 'direct-boundary' },
      { ...territoryResearchTasks[1], status: 'accepted', proposedRepresentation: 'control-centers' },
      { ...territoryResearchTasks[2], status: 'accepted', proposedRepresentation: 'leave-unfilled' },
      { ...territoryResearchTasks[3], status: 'blocked' },
    ])).toEqual({ newGeometry: 1, alternativeRepresentation: 1, leaveUnfilled: 1, blocked: 1 });
  });

  it('requires bidirectional decision, source, version, license, and file traceability for geometry assets', () => {
    const task = {
      ...territoryResearchTasks[0],
      status: 'accepted' as const,
      proposedRepresentation: 'direct-boundary' as const,
      geometryAssetId: 'geometry:test:v1',
      rightsReview: '许可与改绘条件已记录。',
      publicationReview: '公开展示条件已单独核对。',
      reviewedBy: ['history-reviewer', 'cartography-reviewer'],
      reviewedAt: '2026-10-25',
    };
    const asset = {
      assetId: 'geometry:test:v1',
      taskId: task.taskId,
      version: 1,
      uri: 'object://territory/geometry-test-v1.geojson',
      sha256: 'a'.repeat(64),
      sourceIds: [...task.sourceIds],
      license: 'research-only; source-specific reuse review recorded',
    };
    expect(validateTerritoryGeometryAssets([task], [asset])).toEqual([]);
    expect(validateTerritoryGeometryAssets([task], [{ ...asset, taskId: 'wrong-task', sourceIds: ['unknown-source'] }]))
      .toEqual(expect.arrayContaining([
        'Geometry geometry:test:v1 does not point back to territory-research:gap-han_warring--230--230:v1.',
        'Geometry geometry:test:v1 references source unknown-source outside its decision.',
      ]));
  });
});
