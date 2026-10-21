import { describe, expect, it } from 'vitest';
import { claims } from './claims';
import { eventDetails } from './event-details';
import { people } from './people';
import { polities } from './polities';
import { sourceNotes } from './sources';
import { auditPolityCoverage } from './polity-coverage';

describe('global polity coverage audit', () => {
  const report = auditPolityCoverage();
  const sourceIds = new Set(sourceNotes.map((source) => source.id));
  const polityIds = new Set(polities.map((polity) => polity.id));
  const personIds = new Set(people.map((person) => person.id));
  const eventIds = new Set(eventDetails.map((event) => event.eventId));

  it('reports every polity in the catalog exactly once', () => {
    expect(report.totalPolities).toBe(polities.length);
    expect(report.polities).toHaveLength(polities.length);
    expect(new Set(report.polities.map((item) => item.polityId)).size).toBe(polities.length);
  });

  it('counts only explicit establishment or polity-formation nodes in coverage', () => {
    expect(report.byPolity('han_western')).toMatchObject({
      hasEstablishmentNode: true,
      establishmentEventIds: ['han-imperial-accession'],
    });
    expect(report.byPolity('tang')).toMatchObject({
      hasEstablishmentNode: true,
      establishmentEventIds: ['tang-founded'],
    });
    expect(report.byPolity('qin')).toMatchObject({
      hasEstablishmentNode: true,
      establishmentEventIds: ['qin-unification'],
    });
  });

  it('includes current people, sources, and explicit relationships without inventing links', () => {
    const han = report.byPolity('han_western');

    expect(han.personIds).toEqual(expect.arrayContaining(['liu-bang', 'han-xin', 'xiao-he']));
    expect(han.sourceIds).toEqual(expect.arrayContaining(['zizhi-tongjian']));
    expect(han.relationships).toEqual(expect.arrayContaining([
      expect.objectContaining({ claimId: 'claim-liu-bang-founded-han', predicate: 'founded', personId: 'liu-bang' }),
    ]));
    expect(han.eventIds).toEqual(expect.arrayContaining(['han-imperial-accession', 'chu-han-contention']));
  });

  it('classifies missing evidence as gaps instead of fabricating coverage', () => {
    const reportItem = report.byPolity('han_warring');

    expect(reportItem.hasEstablishmentNode).toBe(false);
    expect(reportItem.gaps).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'missing-establishment-event' }),
      expect.objectContaining({ code: 'missing-associated-person' }),
    ]));
  });

  it('keeps all reported references inside the existing catalogs', () => {
    for (const item of report.polities) {
      expect(item.polityId).toBeDefined();
      expect(item.eventIds.every((id) => eventIds.has(id))).toBe(true);
      expect(item.personIds.every((id) => personIds.has(id))).toBe(true);
      expect(item.sourceIds.every((id) => sourceIds.has(id))).toBe(true);
      expect(item.relationships.every((relation) =>
        (!relation.personId || personIds.has(relation.personId)) &&
        (!relation.objectId || polityIds.has(relation.objectId)) &&
        relation.sourceIds.every((id) => sourceIds.has(id)),
      )).toBe(true);
    }
  });

  it('exposes a reproducible establishment-event coverage rate and gap breakdown', () => {
    expect(report.establishmentCoverageRate).toBe(
      report.polities.filter((item) => item.hasEstablishmentNode).length / polities.length,
    );
    expect(report.gapCounts['missing-establishment-event']).toBeGreaterThan(0);
    expect(report.gapCounts['missing-associated-person']).toBeGreaterThan(0);
  });
});
