import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SINGLE_TOPIC_VIEW_QUERY, useSingleTopicView } from './useSingleTopicView';

afterEach(() => vi.unstubAllGlobals());

describe('useSingleTopicView', () => {
  it('switches for either narrow width or low effective height', () => {
    let listener: (() => void) | undefined;
    const media = {
      matches: true,
      media: SINGLE_TOPIC_VIEW_QUERY,
      addEventListener: vi.fn((_event: string, next: () => void) => { listener = next; }),
      removeEventListener: vi.fn(),
    };
    vi.stubGlobal('matchMedia', vi.fn(() => media));

    const { result } = renderHook(() => useSingleTopicView());
    expect(result.current).toBe(true);
    media.matches = false;
    act(() => listener?.());
    expect(result.current).toBe(false);
  });
});
