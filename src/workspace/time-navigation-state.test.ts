import { describe, expect, test } from 'vitest';
import { initialTimeNavigationState, timeNavigationReducer } from './time-navigation-state';

describe('timeNavigationReducer', () => {
  test('opens and closes one analysis mode without resetting the annotation choice', () => {
    const open = timeNavigationReducer(initialTimeNavigationState, { type: 'open-analysis' });
    expect(open).toEqual({ mode: 'analysis', annotationLayer: 'none' });

    const events = timeNavigationReducer(open, { type: 'show-events' });
    expect(timeNavigationReducer(events, { type: 'close-analysis' })).toEqual({
      mode: 'bar',
      annotationLayer: 'events',
    });
  });

  test('keeps event and change annotations mutually exclusive', () => {
    const events = timeNavigationReducer(initialTimeNavigationState, { type: 'show-events' });
    expect(events.annotationLayer).toBe('events');
    const changes = timeNavigationReducer(events, { type: 'show-changes' });
    expect(changes.annotationLayer).toBe('changes');
    expect(timeNavigationReducer(changes, { type: 'show-none' }).annotationLayer).toBe('none');
  });

  test('contains no compact or expanded density and no layout preference', () => {
    expect(Object.keys(initialTimeNavigationState).sort()).toEqual(['annotationLayer', 'mode']);
    expect(JSON.stringify(initialTimeNavigationState)).not.toMatch(/compact|expanded|floating|docked/);
  });
});
