import { describe, expect, it } from 'vitest';
import { events } from './events';
import { eventDetails } from './event-details';
import { getPersonDetail } from './person-details';
import { getHeritageDetail } from './heritage-details';
import { getPolityDetail } from './polity-details';

describe('下一批城市知识链闭合', () => {
  it('南凉人物与事件不应错挂南朝梁节点', () => {
    expect(getPersonDetail('tufa-wugu')?.keyEvents).toContain('southern-liang-founded-397');
    expect(getPersonDetail('tufa-wugu')?.keyEvents).not.toContain('southern-liang-founded');
    expect(eventDetails.find((item) => item.eventId === 'southern-liang-founded-397')?.relatedEventIds)
      .not.toContain('southern-liang-founded');
  });

  it('南凉迁移、哈拉和林、上都各自拥有城市专属事件', () => {
    for (const eventId of ['southern-liang-moves-ledu', 'mongol-karakorum-fixed-center', 'yuan-shangdu-built']) {
      expect(events.some((event) => event.id === eventId), eventId).toBe(true);
      expect(eventDetails.some((detail) => detail.eventId === eventId), eventId).toBe(true);
    }
    expect(getPolityDetail('southern_liang')?.eventIds).toContain('southern-liang-moves-ledu');
    expect(getPolityDetail('mongol')?.eventIds).toContain('mongol-karakorum-fixed-center');
    expect(getPolityDetail('yuan')?.eventIds).toContain('yuan-shangdu-built');
    expect(events.find((event) => event.id === 'southern-liang-moves-ledu')?.placeId).toBe('ledu');
    expect(events.find((event) => event.id === 'mongol-karakorum-fixed-center')?.placeId).toBe('mongol_karakorum');
    expect(events.find((event) => event.id === 'yuan-shangdu-built')?.placeId).toBe('shangdu');
  });

  it('上都遗产不应把唐太宗作为元代人物', () => {
    expect(getHeritageDetail('yuan-shangdu-site')?.associatedPeople).not.toContain('li-shimin');
    expect(getHeritageDetail('yuan-shangdu-site')?.associatedPeople).toContain('kublai');
  });
});
