import { describe, expect, it } from 'vitest';

import { eventDetails } from './event-details';
import { people } from './people';

describe('前秦据长安事件参与人物边界', () => {
  it('uses the distinct Fu Jian founder endpoint instead of Fu Jian the later ruler', () => {
    const detail = eventDetails.find((item) => item.eventId === 'changan-former-qin');
    const person = people.find((item) => item.id === 'fu-jian-founder');

    expect(person).toBeDefined();
    expect(person?.name).toBe('苻健');
    expect(detail?.participants).toContainEqual(expect.objectContaining({
      personId: 'fu-jian-founder',
      relationType: 'direct',
    }));
    expect(detail?.participants).not.toContainEqual(expect.objectContaining({ personId: 'fu-jian' }));
  });
});
