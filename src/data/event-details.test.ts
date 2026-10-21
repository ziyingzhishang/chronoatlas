import { describe, expect, it } from 'vitest';
import { getEventDetail } from './event-details';

describe('historical event details', () => {
  it('describes participants, polities, causes, phases, outcomes, links, and evidence', () => {
    const detail = getEventDetail('tang-founded');

    expect(detail).toBeDefined();
    expect(detail?.participants).toEqual(expect.arrayContaining([
      expect.objectContaining({ personId: 'li-yuan', role: expect.any(String) }),
    ]));
    expect(detail?.polityIds).toContain('tang');
    expect(detail?.causes.length).toBeGreaterThan(0);
    expect(detail?.phases?.length).toBeGreaterThan(0);
    expect(detail?.consequences.length).toBeGreaterThan(0);
    expect(detail?.locationIds).toContain('changan');
    expect(detail?.relatedEventIds.length).toBeGreaterThan(0);
    expect(detail?.sourceIds).toContain('zizhi-tongjian');
    expect(detail?.uncertaintyNote).toBeTruthy();
  });

  it('keeps event detail lookup separate from the base event catalog', () => {
    expect(getEventDetail('event-that-does-not-exist')).toBeUndefined();
  });
});
