import { describe, expect, it } from 'vitest';
import { eventDetails } from './event-details';
import { events } from './events';
import { heritageAssets } from './heritage';
import { heritageDetails } from './heritage-details';
import { buildHeritageDetailCoverageReport } from './heritage-detail-coverage';
import { sourceNotes } from './sources';

const reviewHeritageIds = [
  'big-wild-goose-pagoda',
  'qinglong-temple-site',
  'xian-beilin',
  'xiao-yan-ta',
  'ximing-temple-site',
] as const;

const missingEndpointId = 'xuanzang-translations';

const endpointContract = {
  eventRecord: 'events 中有稳定事件记录',
  detailRecord: 'eventDetails 中有对应详情记录',
  temporalRange: '有事件起止年代及日期精度',
  phases: '有可核验的分阶段过程',
  participant: '有玄奘及其他参与者的事件角色',
  locations: '有与五处遗产关系相符的地点证据',
  sources: '有覆盖上述断言的已收录来源',
} as const;

function sourceText(sourceId: string): string {
  const source = sourceNotes.find((item) => item.id === sourceId);
  return source ? `${source.title}${source.scope}${source.note}` : '';
}

function sourceCoversAllHeritage(sourceIds: readonly string[]): boolean {
  return reviewHeritageIds.every((heritageId) => {
    const heritage = heritageDetails.find((item) => item.heritageId === heritageId);
    const asset = heritageAssets.find((item) => item.id === heritageId);
    return Boolean(
      heritage?.associatedEvents.includes(missingEndpointId)
        && asset
        && asset.sourceIds.some((id) => sourceIds.includes(id))
        && sourceIds.some((id) => sourceText(id).includes(asset.name)),
    );
  });
}

function hasCompleteEndpoint(): boolean {
  const event = events.find((item) => item.id === missingEndpointId);
  const detail = eventDetails.find((item) => item.eventId === missingEndpointId);
  if (!event || !detail) return false;

  const phases = detail.phases ?? [];
  const sourceIds = [...new Set([...event.sourceIds, ...detail.sourceIds])];
  const sourceTextCombined = sourceIds.map(sourceText).join('');
  return Boolean(
    event.endYear !== undefined
      && event.datePrecision
      && detail.participants.some((participant) => participant.personId === 'xuan-zang')
      && detail.locationIds.length > 0
      && detail.polityIds.includes('tang')
      && phases.length >= 2
      && phases.every((phase) => phase.startYear !== undefined && phase.endYear !== undefined)
      && sourceIds.length > 0
      && sourceIds.every((id) => sourceText(id).length > 0)
      && /玄奘/.test(sourceTextCombined)
      && /译经/.test(sourceTextCombined)
      && sourceCoversAllHeritage(sourceIds),
  );
}

function endpointEvidence() {
  const event = events.find((item) => item.id === missingEndpointId);
  const detail = eventDetails.find((item) => item.eventId === missingEndpointId);
  const sourceIds = [...new Set([
    ...(event?.sourceIds ?? []),
    ...(detail?.sourceIds ?? []),
  ])];

  return {
    eventRecord: Boolean(event),
    detailRecord: Boolean(detail),
    temporalRange: Boolean(event?.endYear !== undefined && event.datePrecision),
    phases: Boolean(detail?.phases && detail.phases.length >= 2 && detail.phases.every(
      (phase) => phase.startYear !== undefined && phase.endYear !== undefined,
    )),
    participant: Boolean(detail?.participants.some((participant) => participant.personId === 'xuan-zang')),
    locations: Boolean(detail?.locationIds.includes('changan') && sourceCoversAllHeritage(sourceIds)),
    sources: sourceIds.length > 0 && sourceIds.every((sourceId) => sourceText(sourceId).length > 0),
  };
}

describe('round one hundred six Xuanzang heritage event boundary audit', () => {
  it('keeps all five unresolved references at the same explicit boundary', () => {
    const report = buildHeritageDetailCoverageReport();
    const items = report.items.filter((item) => reviewHeritageIds.includes(item.heritageId as (typeof reviewHeritageIds)[number]));

    expect(report.needsReviewHeritageIds).toEqual([...reviewHeritageIds]);
    expect(items).toHaveLength(reviewHeritageIds.length);
    expect(items.every((item) => item.missingFields.length === 0)).toBe(true);
    expect(items.map((item) => item.unresolvedReferenceIds.events)).toEqual(
      reviewHeritageIds.map(() => [missingEndpointId]),
    );
    expect(items.map((item) => item.reviewNotes[0])).toEqual(
      reviewHeritageIds.map(() => `关联事件端点未收录：${missingEndpointId}；暂不新增或推断事件端点。`),
    );
  });

  it('requires every field of a complete event endpoint before upgrading coverage', () => {
    const eventIds = new Set(events.map((event) => event.id));
    const eventDetailIds = new Set(eventDetails.map((detail) => detail.eventId));

    expect(eventIds.has(missingEndpointId)).toBe(false);
    expect(eventDetailIds.has(missingEndpointId)).toBe(false);
    expect(hasCompleteEndpoint()).toBe(false);
    expect(endpointEvidence()).toEqual({
      eventRecord: false,
      detailRecord: false,
      temporalRange: false,
      phases: false,
      participant: false,
      locations: false,
      sources: false,
    });

    const existingSemanticCandidates = events.filter((event) => /玄奘|译经/.test(
      `${event.title}${event.summary}${event.background ?? ''}${event.process ?? ''}${event.impact ?? ''}`,
    ));
    const existingParticipantCandidates = eventDetails.filter((detail) => detail.participants.some(
      (participant) => participant.personId === 'xuan-zang',
    ));

    expect(existingSemanticCandidates).toEqual([]);
    expect(existingParticipantCandidates).toEqual([]);
    expect(endpointContract).toEqual({
      eventRecord: 'events 中有稳定事件记录',
      detailRecord: 'eventDetails 中有对应详情记录',
      temporalRange: '有事件起止年代及日期精度',
      phases: '有可核验的分阶段过程',
      participant: '有玄奘及其他参与者的事件角色',
      locations: '有与五处遗产关系相符的地点证据',
      sources: '有覆盖上述断言的已收录来源',
    });
  });

  it('proves current sources are local or generic evidence, not one shared translation endpoint', () => {
    const reviewDetails = heritageDetails.filter((detail) => reviewHeritageIds.includes(
      detail.heritageId as (typeof reviewHeritageIds)[number],
    ));
    const relevantSourceIds = [...new Set(reviewDetails.flatMap((detail) => detail.sourceIds))];
    const relevantSources = sourceNotes.filter((source) => relevantSourceIds.includes(source.id));
    const translationMentioningSources = relevantSources.filter((source) => /玄奘|译经/.test(sourceText(source.id)));
    const comprehensiveSources = relevantSources.filter((source) => {
      const text = sourceText(source.id);
      return /玄奘/.test(text)
        && /译经/.test(text)
        && /统一起止|阶段链|参与者/.test(text)
        && reviewHeritageIds.every((heritageId) => {
          const heritage = heritageDetails.find((detail) => detail.heritageId === heritageId);
          return heritage?.historicalAssociations.some((association) => text.includes(association));
        });
    });

    expect(relevantSources.length).toBeGreaterThan(0);
    expect(translationMentioningSources.map((source) => source.id)).toEqual(['xian-local-chronicle-big-wild-goose']);
    expect(comprehensiveSources).toEqual([]);
    expect(relevantSources.some((source) => /统一起止|阶段链|五处遗产|完整参与者/.test(sourceText(source.id)))).toBe(false);
  });

  it('does not treat construction, naming, or archaeological years as a translation event', () => {
    for (const heritageId of reviewHeritageIds) {
      const detail = heritageDetails.find((item) => item.heritageId === heritageId)!;
      expect(detail.associatedEvents).toEqual(['tang-founded', missingEndpointId]);
      expect(detail.uncertaintyNote).toContain('不把建筑年代拼接为译经事件');
      expect(detail.uncertaintyNote).toContain('统一译经事件端点');
    }
  });
});
