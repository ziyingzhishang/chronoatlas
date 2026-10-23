import { describe, expect, it } from 'vitest';
import exportedKnowledgeCoverage from '../../public/data/knowledge-coverage.json';
import type {
  CapitalTerm,
  HistoricalClaim,
  HistoricalEvent,
  HistoricalEventDetail,
  HeritageAsset,
  Place,
  Person,
  Polity,
  SourceNote,
} from '../domain/types';
import {
  auditKnowledgeCoverage,
  serializeKnowledgeCoverageReport,
  type KnowledgeCoverageCatalog,
} from './knowledge-coverage';

const source: SourceNote = {
  id: 'fixture-source',
  title: 'Fixture source',
  scope: 'test',
  note: 'test',
};

const polity: Polity = {
  id: 'fixture-polity',
  name: '测试政权',
  type: 'regime',
  startYear: 1,
  endYear: 10,
  color: '#000000',
  description: '测试政权摘要',
  sourceIds: ['fixture-source'],
};

const person: Person = {
  id: 'fixture-person',
  name: '测试人物',
  birthYear: 1,
  roles: ['君主'],
  polityIds: ['fixture-polity'],
  description: '测试人物摘要',
  sourceIds: ['fixture-source'],
};

const event: HistoricalEvent = {
  id: 'fixture-event',
  year: 2,
  title: '测试事件',
  summary: '测试事件摘要',
  sourceIds: ['fixture-source'],
};

const eventDetail: HistoricalEventDetail = {
  eventId: 'fixture-event',
  participants: [{ personId: 'fixture-person', role: '参与者' }],
  polityIds: ['fixture-polity'],
  causes: ['测试原因'],
  consequences: ['测试影响'],
  locationIds: [],
  relatedEventIds: [],
  sourceIds: ['fixture-source'],
};

const heritage: HeritageAsset = {
  id: 'fixture-heritage',
  name: '测试遗产',
  placeId: 'fixture-place',
  type: 'city-site',
  constructionFrom: 3,
  modernStatus: 'archaeological-site',
  description: '测试遗产摘要',
  sourceIds: ['fixture-source'],
};

const catalog: KnowledgeCoverageCatalog = {
  polities: [polity],
  people: [person],
  events: [event],
  eventDetails: [eventDetail],
  heritageAssets: [heritage],
  heritageDetails: [{
    heritageId: 'fixture-heritage',
    modernLocation: '测试地点',
    historicalAssociations: ['测试关联'],
    constructionHistory: [],
    associatedPeople: ['fixture-person'],
    associatedPolities: ['fixture-polity'],
    associatedEvents: ['fixture-event'],
    survivingFeatures: ['测试遗存'],
    presentDayValue: '测试价值',
    sourceIds: ['fixture-source'],
    uncertaintyNote: '测试不确定性',
  }],
  personDetails: [{
    personId: 'fixture-person',
    biography: '测试人物详情',
    offices: [],
    aliases: [],
    keyEvents: ['fixture-event'],
    sourceIds: ['fixture-source'],
  }],
  claims: [],
  sourceNotes: [source],
};

describe('knowledge coverage audit', () => {
  it('publishes the generated report with the v1 knowledge coverage contract', () => {
    expect(exportedKnowledgeCoverage.schemaVersion).toBe(1);
    expect(exportedKnowledgeCoverage.reportType).toBe('knowledge-coverage');
    expect(exportedKnowledgeCoverage.byPolity).toHaveProperty('qin');
    expect(exportedKnowledgeCoverage.byCity).toHaveProperty('liao_xijing');
    expect(exportedKnowledgeCoverage.byCity.liao_xijing.capitalRecordCount).toBeGreaterThan(0);
  });

  it('serializes a stable standalone knowledge coverage report without changing the boundary audit contract', () => {
    const report = serializeKnowledgeCoverageReport(auditKnowledgeCoverage(catalog));

    expect(report.schemaVersion).toBe(1);
    expect(report.reportType).toBe('knowledge-coverage');
    expect(report.entities).toHaveLength(4);
    expect(report.entities.map((entity) => entity.entityKey)).toEqual(
      [...report.entities.map((entity) => entity.entityKey)].sort(),
    );
    expect(report.byPolity['fixture-polity']).toBeDefined();
    expect(report.byCity['fixture-place']).toBeDefined();
    expect(report).toHaveProperty('tasks');
    expect(report).toHaveProperty('gaps');
    expect(report).toHaveProperty('byKey');
  });

  it('reports five dimensions and traces entity gaps back to a polity', () => {
    const report = auditKnowledgeCoverage(catalog);
    const personReport = report.entities.find((item) => item.entityId === 'fixture-person');

    expect(personReport?.checks).toEqual(expect.arrayContaining([
      expect.objectContaining({ dimension: 'summary', status: 'covered' }),
      expect.objectContaining({ dimension: 'detail', status: 'covered' }),
      expect.objectContaining({ dimension: 'source', status: 'covered' }),
      expect.objectContaining({ dimension: 'relationship', status: 'covered' }),
      expect.objectContaining({ dimension: 'time', status: 'uncertain' }),
    ]));

    expect(report.byType.person.totalEntities).toBe(1);
    expect(report.byPolity['fixture-polity'].entityKeys).toContain('person:fixture-person');
    expect(report.byPolity['fixture-polity'].gaps).toEqual(expect.arrayContaining([
      expect.objectContaining({
        entityKey: 'person:fixture-person',
        dimension: 'time',
        kind: 'uncertain',
      }),
    ]));
  });

  it('keeps intentional not-applicable and uncertain annotations distinct from missing data', () => {
    const report = auditKnowledgeCoverage({
      ...catalog,
      annotations: [
        {
          entityType: 'heritage',
          entityId: 'fixture-heritage',
          dimension: 'relationship',
          status: 'not-applicable',
          note: '该遗产尚未建立可核验的人物关系',
        },
        {
          entityType: 'event',
          entityId: 'fixture-event',
          dimension: 'time',
          status: 'uncertain',
          note: '测试事件年代采用约年',
        },
      ],
    });

    expect(report.byKey['heritage:fixture-heritage'].checks).toEqual(expect.arrayContaining([
      expect.objectContaining({ dimension: 'relationship', status: 'not-applicable', overridden: true }),
    ]));
    expect(report.byKey['event:fixture-event'].checks).toEqual(expect.arrayContaining([
      expect.objectContaining({ dimension: 'time', status: 'uncertain', overridden: true }),
    ]));
    expect(report.byType.heritage.statusCounts['not-applicable']).toBe(1);
  });

  it('classifies missing summary, relationship, and source independently', () => {
    const report = auditKnowledgeCoverage({
      ...catalog,
      polities: [{ ...polity, description: '', sourceIds: [] }],
      people: [{ ...person, description: '', polityIds: [], sourceIds: [], birthYear: undefined }],
      events: [{ ...event, summary: '', sourceIds: [] }],
      eventDetails: [],
      heritageAssets: [{ ...heritage, description: '', sourceIds: [], constructionFrom: undefined }],
      heritageDetails: [],
      personDetails: [],
      claims: [],
      sourceNotes: [],
    });
    const kinds = new Set(report.gaps.map((gap) => gap.kind));

    expect(kinds).toEqual(new Set(['data-missing', 'relationship-missing', 'source-missing', 'uncertain']));
    expect(report.byType.polity.gapCounts['data-missing']).toBeGreaterThan(0);
    expect(report.byType.person.gapCounts['relationship-missing']).toBeGreaterThan(0);
    expect(report.byType.event.gapCounts['source-missing']).toBeGreaterThan(0);
  });

  it('audits the current catalogs without inventing entities and exposes per-type counts', () => {
    const report = auditKnowledgeCoverage();

    expect(report.byType.polity.totalEntities).toBeGreaterThan(0);
    expect(report.byType.person.totalEntities).toBeGreaterThan(0);
    expect(report.byType.event.totalEntities).toBeGreaterThan(0);
    expect(report.byType.heritage.totalEntities).toBeGreaterThan(0);
    expect(report.entities).toHaveLength(
      report.byType.polity.totalEntities
      + report.byType.person.totalEntities
      + report.byType.event.totalEntities
      + report.byType.heritage.totalEntities,
    );
    expect(report.byPolity.tang.entityKeys).toContain('polity:tang');
    expect(Object.keys(report.byType).sort()).toEqual(['event', 'heritage', 'person', 'polity']);
    expect(new Set(report.entities.map((item) => item.entityKey)).size).toBe(report.entities.length);
  });

  it('turns learning-loop relationship gaps into actionable polity, person, event, and city tasks', () => {
    const place: Place = {
      id: 'fixture-place',
      historicalName: '测试城',
      aliases: [],
      modernName: '今测试城',
      longitude: 0,
      latitude: 0,
      sourceIds: ['fixture-source'],
    };
    const report = auditKnowledgeCoverage({
      ...catalog,
      places: [place],
      events: [{ ...event, id: 'event-without-links', placeId: 'fixture-place' }],
      eventDetails: [{
        ...eventDetail,
        eventId: 'event-without-links',
        participants: [],
        locationIds: [],
      }],
      heritageAssets: [],
      heritageDetails: [],
      claims: [],
    });

    expect(report.tasks).toEqual(expect.arrayContaining([
      expect.objectContaining({
        taskKind: 'polity-heritage-missing',
        perspective: 'polity',
        subjectId: 'fixture-polity',
      }),
      expect.objectContaining({
        taskKind: 'person-person-relationship-missing',
        perspective: 'polity',
        subjectId: 'fixture-person',
      }),
      expect.objectContaining({
        taskKind: 'event-participant-missing',
        perspective: 'polity',
        subjectId: 'event-without-links',
      }),
      expect.objectContaining({
        taskKind: 'event-location-missing',
        perspective: 'city',
        subjectId: 'event-without-links',
      }),
    ]));
    expect(report.byPolity['fixture-polity'].summary).toContain('遗产关联');
    expect(report.byPolity['fixture-polity'].taskCounts['person-person-relationship-missing']).toBe(1);
    expect(report.byCity['fixture-place'].cityName).toBe('今测试城');
    expect(report.byCity['fixture-place'].summary).toContain('事件地点');
    expect(report.byCity['fixture-place'].taskCounts['event-location-missing']).toBe(1);
  });

  it('keeps capital-only cities visible in the city coverage report', () => {
    const capitalOnlyPlace: Place = {
      id: 'capital-only-place',
      historicalName: '首都候选城',
      aliases: [],
      modernName: '今首都候选城',
      longitude: 0,
      latitude: 0,
      sourceIds: ['fixture-source'],
    };
    const capitalTerm: CapitalTerm = {
      polityId: 'fixture-polity',
      placeId: 'capital-only-place',
      validFrom: 1,
      validTo: 10,
      role: 'primary',
      status: 'formal',
      confidence: 'high',
      sourceIds: ['fixture-source'],
    };
    const report = auditKnowledgeCoverage({
      ...catalog,
      places: [capitalOnlyPlace],
      polities: [polity],
      events: [],
      eventDetails: [],
      heritageAssets: [],
      heritageDetails: [],
      capitalTerms: [capitalTerm],
    });

    expect(report.byCity['capital-only-place']).toEqual(expect.objectContaining({
      cityName: '今首都候选城',
      capitalRecordCount: 1,
      entityKeys: [],
      taskCounts: expect.objectContaining({
        'event-location-missing': 0,
      }),
    }));
    expect(report.byCity['capital-only-place'].summary).toContain('尚无关联知识节点');
  });

  it('does not create specific tasks when the corresponding graph edge is present', () => {
    const secondPerson: Person = {
      ...person,
      id: 'fixture-person-2',
      name: '第二位人物',
    };
    const report = auditKnowledgeCoverage({
      ...catalog,
      people: [person, secondPerson],
      claims: [{
        id: 'person-relation',
        subjectId: 'fixture-person',
        objectId: 'fixture-person-2',
        predicate: 'ally-of',
        datePrecision: 'year',
        perspective: 'person',
        evidenceType: 'explicit-record',
        confidence: 'high',
        sourceIds: ['fixture-source'],
      }],
      eventDetails: [{ ...eventDetail, locationIds: ['fixture-place'] }],
      places: [{
        id: 'fixture-place',
        historicalName: '测试城',
        aliases: [],
        modernName: '今测试城',
        longitude: 0,
        latitude: 0,
        sourceIds: ['fixture-source'],
      }],
    });

    expect(report.tasks).not.toEqual(expect.arrayContaining([
      expect.objectContaining({ taskKind: 'polity-heritage-missing' }),
      expect.objectContaining({ taskKind: 'person-person-relationship-missing' }),
      expect.objectContaining({ taskKind: 'event-participant-missing' }),
      expect.objectContaining({ taskKind: 'event-location-missing' }),
    ]));
  });
});
