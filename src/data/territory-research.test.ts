import { describe, expect, it } from 'vitest';

import { getHistoricalState } from '../domain/history-state';
import { buildLocalMapData } from '../map/history-map';
import { coverageDecisions } from './coverage-decisions';
import { sourceNotes } from './sources';
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

  it('uses each linked annual audit row for its year-specific conclusion, sources, and map expression', () => {
    const hanXinTask = territoryResearchTasks.find((task) => task.previousDecisionId === 'gap-han_western-6-9')!;
    const hanXinYearSeven = territoryResearchYearConclusions.find((item) => item.taskId === hanXinTask.taskId && item.year === 7)!;
    expect(hanXinYearSeven.conclusion).toContain('翟义');
    expect(hanXinYearSeven.sourceIds).toContain('han-xin-transition-primary-sources');
    expect(hanXinYearSeven.mapExpression).toBe('capital-and-event-points');

    const northernHanTask = territoryResearchTasks.find((task) => task.previousDecisionId === 'gap-northern_han-951-959')!;
    const northernHanYear = territoryResearchYearConclusions.find((item) => item.taskId === northernHanTask.taskId && item.year === 954)!;
    expect(northernHanYear.conclusion).toContain('高平');
    expect(northernHanYear.sourceIds).toContain('zizhi-tongjian-northern-han-951-959');
    expect(northernHanYear.mapExpression).toBe('taiyuan-capital-point-and-bagongyuan-event-point');
    expect(northernHanYear.evidenceGap).toContain('边界');
  });

  it('rejects the former Zhao founding coordinate that resolves to modern Lishi rather than Nancun', () => {
    const formerZhaoTask = territoryResearchTasks.find((task) => task.previousDecisionId === 'gap-former_zhao-304-305')!;
    const foundingYear = territoryResearchYearConclusions.find((item) => item.taskId === formerZhaoTask.taskId && item.year === 304)!;
    expect(foundingYear.mapExpression).toBe('historical-conclusion-only');
    expect(foundingYear.sourceIds).toEqual(expect.arrayContaining([
      'zuoguo-city-nancun-location-study',
      'jiangshan-map-zuoguo-coordinate-crosscheck',
      'amap-lishi-district-coordinate',
    ]));
    expect(foundingYear.evidenceGap).toContain('离石');
    expect(foundingYear.evidenceGap).toContain('南村');
  });

  it('loads the full 1451-year ledger from source-linked annual audit rows', () => {
    expect(territoryResearchYearConclusions).toHaveLength(1451);
    expect(territoryResearchYearConclusions.every((item) => item.auditFile)).toBe(true);
    expect(territoryResearchYearConclusions.every((item) => item.sourceIds.length > 0)).toBe(true);
    const sourceIds = new Set(sourceNotes.map((source) => source.id));
    expect(territoryResearchYearConclusions.every((item) => item.sourceIds.every((sourceId) => sourceIds.has(sourceId)))).toBe(true);
    expect(territoryResearchYearConclusions.every((item) => item.mapExpression)).toBe(true);
    expect(territoryResearchYearConclusions.every((item) => item.conclusion.trim().length > 0)).toBe(true);
    expect(territoryResearchYearConclusions.some((item) => item.year === 0)).toBe(false);
  });

  it('renders a sourced point for every annual conclusion whose map expression promises one', () => {
    const pointConclusions = territoryResearchYearConclusions.filter((item) => item.mapExpression?.includes('point'));
    expect(pointConclusions.length).toBeGreaterThan(0);

    for (const item of pointConclusions) {
      const state = getHistoricalState(item.year);
      const mapData = buildLocalMapData(state);
      const centerPlaceIds = item.mapExpression?.includes('event-point')
        ? item.centerPlaceIds ?? (item.mapEventIds?.length ? [] : item.centerPlaceId ? [item.centerPlaceId] : [])
        : [];
      if (centerPlaceIds.length === 0 && item.mapExpression?.includes('event-point')) {
        expect(item.mapEventIds?.length ?? 0, `${item.previousDecisionId} should name its map event points`).toBeGreaterThan(0);
      }
      for (const eventId of item.mapEventIds ?? []) {
        expect(mapData.events.features.some(feature => feature.properties?.entityId === eventId),
          `${item.previousDecisionId} should render ${eventId} in ${item.year}`).toBe(true);
      }
      for (const placeId of centerPlaceIds) {
        const place = state.places.find(candidate => candidate.id === placeId);
        expect(place, `${item.previousDecisionId} should reference a known center place`).toBeDefined();
        const centerPoint = mapData.boundaries.features.some(feature => (
          feature.properties?.polityId === item.polityId
          && feature.geometry.type === 'Point'
          && feature.geometry.coordinates[0] === place?.longitude
          && feature.geometry.coordinates[1] === place?.latitude
        )) || mapData.capitalPlaces.features.some(feature => (
          feature.properties?.polityId === item.polityId
          && feature.geometry.type === 'Point'
          && feature.geometry.coordinates[0] === place?.longitude
          && feature.geometry.coordinates[1] === place?.latitude
        ));
        expect(centerPoint, `${item.previousDecisionId} should render ${placeId} in ${item.year}`).toBe(true);
      }
      const centerPlace = item.centerPlaceId
        ? state.places.find((place) => place.id === item.centerPlaceId)
        : undefined;
      const polityPoint = state.boundaries.some((boundary) => (
        boundary.polityId === item.polityId
        && (boundary.geometry.type === 'Point' || boundary.geometry.type === 'MultiPoint')
        && (!centerPlace || (boundary.geometry.type === 'Point'
          && boundary.geometry.coordinates[0] === centerPlace.longitude
          && boundary.geometry.coordinates[1] === centerPlace.latitude))
      ));
      const capitalPoint = mapData.capitalPlaces.features.some((feature) => (
        feature.properties?.polityId === item.polityId
        && (!centerPlace || (feature.geometry.type === 'Point'
          && feature.geometry.coordinates[0] === centerPlace.longitude
          && feature.geometry.coordinates[1] === centerPlace.latitude))
        && (feature.geometry.type === 'Point' || feature.geometry.type === 'MultiPoint')
      ));
      const eventPoint = centerPlace && mapData.events.features.some((feature) => (
        feature.geometry.type === 'Point'
        && feature.geometry.coordinates[0] === centerPlace.longitude
        && feature.geometry.coordinates[1] === centerPlace.latitude
      ));
      const declaredEventPoint = (item.mapEventIds ?? []).some(eventId => mapData.events.features.some(feature => (
        feature.properties?.entityId === eventId && feature.geometry.type === 'Point'
      )));
      expect(polityPoint || capitalPoint || eventPoint || declaredEventPoint,
        `${item.previousDecisionId} promises a rendered point for ${item.polityId} in ${item.year}`)
        .toBe(true);
    }
  });

  it('names every mapped event promised by an annual event-point expression', () => {
    const eventPointConclusions = territoryResearchYearConclusions.filter((item) => item.mapExpression?.includes('event-point'));
    expect(eventPointConclusions.length).toBeGreaterThan(0);
    for (const item of eventPointConclusions) {
      expect(item.mapEventIds?.length ?? 0, `${item.previousDecisionId} should identify its event points in ${item.year}`)
        .toBeGreaterThan(0);
    }
  });

  it('keeps every explicitly unfilled annual conclusion out of the runtime map', () => {
    const unfilled = territoryResearchYearConclusions.filter((item) => item.mapExpression === 'leave-unfilled');
    expect(unfilled.length).toBeGreaterThan(0);

    for (const item of unfilled) {
      const state = getHistoricalState(item.year);
      const mapData = buildLocalMapData(state);
      expect(state.boundaries.some((boundary) => boundary.polityId === item.polityId),
        `${item.previousDecisionId} must remain unfilled for ${item.polityId} in ${item.year}`)
        .toBe(false);
      expect(mapData.boundaries.features.some((feature) => feature.properties?.polityId === item.polityId),
        `${item.previousDecisionId} must not render a fallback for ${item.polityId} in ${item.year}`)
        .toBe(false);
    }
  });

  it('does not render an areal source outline in any year whose coverage decision leaves territory unfilled', () => {
    const unfilledDecisions = new Map(
      coverageDecisions.filter((decision) => decision.verdict === 'leave-unfilled')
        .map((decision) => [decision.id, decision]),
    );
    const unfilledYears = territoryResearchYearConclusions.filter((item) => unfilledDecisions.has(item.previousDecisionId));
    expect(unfilledYears.length).toBeGreaterThan(0);

    for (const item of unfilledYears) {
      const state = getHistoricalState(item.year);
      const mapData = buildLocalMapData(state);
      expect(state.boundaries.some((boundary) => boundary.polityId === item.polityId
        && boundary.geometry.type !== 'Point' && boundary.geometry.type !== 'MultiPoint'),
      `${item.previousDecisionId} may not render an areal outline for ${item.polityId} in ${item.year}`)
        .toBe(false);
      expect(mapData.boundaries.features.some((feature) => feature.properties?.polityId === item.polityId
        && feature.geometry.type !== 'Point' && feature.geometry.type !== 'MultiPoint'),
      `${item.previousDecisionId} may not draw an areal fallback for ${item.polityId} in ${item.year}`)
        .toBe(false);
    }
  });

  it('advances the first pilot to source-checked while keeping its geometry unpublished', () => {
    const task = territoryResearchTasks.find((item) => item.previousDecisionId === 'gap-qin--221--219')!;
    expect(task.status).toBe('source-checked');
    expect(task.historicalReviewedBy).toEqual([]);
    expect(task.cartographicReviewedBy).toEqual([]);
    expect(task.geometryAssetId).toBeUndefined();
  });

  it('keeps Qin map references traceable without turning a broad-period map into annual geometry', () => {
    const qinYear = territoryResearchYearConclusions.find((item) => item.previousDecisionId === 'gap-qin--221--219' && item.year === -221)!;
    expect(qinYear.sourceIds).toEqual(expect.arrayContaining([
      'qin-historical-atlas-volume2',
      'qin-empire-at-height-map-land',
    ]));
    expect(qinYear.mapExpression).toBe('control-center-point');
    expect(qinYear.evidenceGap).toContain('前221年');
  });

  it('preserves the traditional-calendar limitation for the Han–Chu Honggou agreement', () => {
    const hanChuYear = territoryResearchYearConclusions.find((item) => (
      item.previousDecisionId === 'gap-han_western--206--203' && item.year === -203
    ))!;
    expect(hanChuYear.mapExpression).toBe('frontline-reference-point');
    expect(hanChuYear.evidenceGap).toContain('传统历月');
    expect(hanChuYear.evidenceGap).toContain('不将其等同某个公历月份');
  });

  it('distinguishes the unnamed Chu king in 224 BCE from the capture of Fuchu in 223 BCE', () => {
    const chuYear = territoryResearchYearConclusions.find((item) => (
      item.previousDecisionId === 'gap-chu_warring--223--223' && item.year === -223
    ))!;
    expect(chuYear.conclusion).toContain('《史记·秦始皇本纪》另在前224年记未具名‘荆王’被俘');
    expect(chuYear.conclusion).toContain('《史记·楚世家》《六国年表》及《资治通鉴》明确把负刍被俘、楚亡系于前223年');
    expect(chuYear.conclusion).toContain('雷虹霁、陶然（2019）提出前后可能是不同事件');
    expect(chuYear.mapExpression).toBe('leave-unfilled');
    expect(chuYear.centerPlaceId).toBeNull();
    expect(chuYear.evidenceGap).toContain('史料也不足以确定前223年楚方残余抵抗的具体空间或稳定边缘');
  });

  it('shows Liaoyang as a regional Yan center after Ji fell without drawing a Yan boundary', () => {
    const yanYear = territoryResearchYearConclusions.find((item) => (
      item.previousDecisionId === 'gap-yan_warring--222--222' && item.year === -222
    ))!;
    const state = getHistoricalState(-222);
    const mapData = buildLocalMapData(state);

    expect(yanYear.mapExpression).toBe('control-center-point');
    expect(yanYear.centerPlaceId).toBe('liaoyang');
    expect(yanYear.sourceIds).toContain('yan-capital-relocation-liaoyang-2011');
    expect(state.capitalTerms).toEqual(expect.arrayContaining([
      expect.objectContaining({ polityId: 'yan_warring', placeId: 'liaoyang', validFrom: -226, validTo: -222 }),
    ]));
    expect((state.capitalTerms ?? []).some((term) => term.polityId === 'yan_warring' && term.placeId === 'ji')).toBe(false);
    expect(state.boundaries.some((boundary) => boundary.polityId === 'yan_warring' && boundary.geometry.type !== 'Point')).toBe(false);
    expect(mapData.capitalPlaces.features.some((feature) => feature.properties?.polityId === 'yan_warring'
      && feature.properties?.placeId === 'liaoyang')).toBe(true);
  });

  it('keeps Ming–Northern Yuan succession centers as year-specific points without boundary inference', () => {
    const yuan1369 = territoryResearchYearConclusions.find((item) => (
      item.previousDecisionId === 'gap-northern_yuan-1368-1374' && item.year === 1369
    ))!;
    const yuan1370 = territoryResearchYearConclusions.find((item) => (
      item.previousDecisionId === 'gap-northern_yuan-1368-1374' && item.year === 1370
    ))!;
    const ming1370 = territoryResearchYearConclusions.find((item) => (
      item.previousDecisionId === 'gap-ming-1368-1374' && item.year === 1370
    ))!;

    expect(yuan1369.mapExpression).toBe('ordered-center-points');
    expect(yuan1369.evidenceGap).toContain('上都失守后顺帝转驻应昌');
    expect(yuan1370.mapExpression).toBe('ordered-center-points');
    expect(yuan1370.evidenceGap).toContain('应昌陷落、顺帝去世及昭宗北走和林');
    expect(ming1370.evidenceGap).toContain('不等于全年稳定控制线');
    for (const year of [yuan1369, yuan1370, ming1370]) {
      expect(year.sourceIds).toContain('ming-yuan-northern-frontier-1368-1374');
      expect(year.evidenceGap?.length).toBeGreaterThan(20);
    }
  });

  it('keeps baseline tasks outside the runtime geometry publication path', () => {
    expect(territoryResearchTasks.every((task) => ['queued', 'source-checked'].includes(task.status))).toBe(true);
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
        'Accepted tasks require a historical reviewer.',
        'Accepted tasks require a cartographic reviewer.',
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
      historicalReviewedBy: ['history-reviewer'],
      cartographicReviewedBy: ['cartography-reviewer'],
      reviewedAt: '2026-10-25',
    }));
    const assets = accepted.map((task, index) => ({
      assetId: task.geometryAssetId!,
      taskId: task.taskId,
      version: 1,
      uri: `object://territory/conflict-${index}.geojson`,
      sha256: String(index + 1).repeat(64),
      sourceIds: [...task.sourceIds],
      license: 'research-only',
    }));
    expect(acceptedTerritoryGeometryTasks(accepted, assets)).toHaveLength(2);
    expect(acceptedTerritoryGeometryTasks(accepted, assets, [{
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
      historicalReviewedBy: ['history-reviewer'],
      cartographicReviewedBy: ['cartography-reviewer'],
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
    expect(acceptedTerritoryGeometryTasks([task], [asset])).toEqual([task]);
    expect(validateTerritoryGeometryAssets([task], [{ ...asset, taskId: 'wrong-task', sourceIds: ['unknown-source'] }]))
      .toEqual(expect.arrayContaining([
        'Geometry geometry:test:v1 does not point back to territory-research:gap-han_warring--230--230:v1.',
        'Geometry geometry:test:v1 references source unknown-source outside its decision.',
      ]));
    expect(acceptedTerritoryGeometryTasks([task], [{ ...asset, taskId: 'wrong-task' }])).toEqual([]);
  });
});
