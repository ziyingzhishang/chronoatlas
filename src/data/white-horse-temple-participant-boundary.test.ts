import { describe, expect, it } from 'vitest';

import { eventDetails } from './event-details';
import { people } from './people';

describe('白马寺创建事件参与人物边界', () => {
  it('models Liu Zhuang as the directly supported Eastern Han patron', () => {
    const detail = eventDetails.find((item) => item.eventId === 'white-horse-temple-founded');
    const person = people.find((item) => item.id === 'liu-zhuang');

    expect(person).toBeDefined();
    expect(person?.sourceIds).toContain('luoyang-baimasi-official');
    expect(detail?.sourceIds).toContain('luoyang-baimasi-official');
    expect(detail?.participants).toContainEqual(expect.objectContaining({
      personId: 'liu-zhuang',
      relationType: 'direct',
    }));
  });
});
