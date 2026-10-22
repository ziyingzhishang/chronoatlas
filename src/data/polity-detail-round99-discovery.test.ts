import { describe, expect, it } from 'vitest';
import { claims } from './claims';
import { capitalHistory } from './capital-history';
import { eventDetails } from './event-details';
import { events } from './events';
import { heritageAssets } from './heritage';
import { people } from './people';
import { places } from './places';
import { polities } from './polities';
import { getPolityDetail } from './polity-details';
import { sourceNotes } from './sources';
import { buildPolityStudyView } from '../domain/study-view';

describe('第九十九轮政权详情专项', () => {
  it('keeps the two selected associations backed by existing event, person, and source records', () => {
    const eventById = new Map(events.map((event) => [event.id, event]));
    const peopleById = new Map(people.map((person) => [person.id, person]));
    const sourceIds = new Set(sourceNotes.map((source) => source.id));
    const tang = getPolityDetail('tang')!;
    const qing = getPolityDetail('qing')!;
    const xuanwu = eventDetails.find((detail) => detail.eventId === 'xuanwu-gate')!;
    const qingFoundation = eventDetails.find((detail) => detail.eventId === 'qing-founded')!;

    expect(tang.foundationProcess.length).toBeGreaterThan(0);
    expect(tang.eventIds).toContain('xuanwu-gate');
    expect(eventById.get('xuanwu-gate')?.sourceIds.every((id) => sourceIds.has(id))).toBe(true);
    expect(xuanwu.polityIds).toContain('tang');
    expect(xuanwu.sourceIds.every((id) => sourceIds.has(id))).toBe(true);

    expect(qing.foundationProcess.length).toBeGreaterThan(0);
    expect(qing.principalFigureIds).toContain('hongtaiji');
    expect(peopleById.get('hongtaiji')?.sourceIds.every((id) => sourceIds.has(id))).toBe(true);
    expect(qingFoundation.polityIds).toContain('qing');
    expect(qingFoundation.participants.map((participant) => participant.personId)).toContain('hongtaiji');
    expect(qingFoundation.sourceIds.every((id) => sourceIds.has(id))).toBe(true);
  });

  it('surfaces both associations in the historical polity study view without inventing endpoints', () => {
    const data = { polities, places, people, heritage: heritageAssets, events, claims, capitalTerms: capitalHistory };
    const tangView = buildPolityStudyView('tang', 650, data);
    const qingView = buildPolityStudyView('qing', 1636, data);

    expect(tangView?.events.map((event) => event.id)).toContain('xuanwu-gate');
    expect(qingView?.people.map((person) => person.id)).toContain('hongtaiji');
    expect(qingView?.events.map((event) => event.id)).toContain('qing-founded');
  });
});
