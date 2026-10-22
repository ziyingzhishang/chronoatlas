import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { getPolityDetail } from '../data/polity-details';
import { PolityDetail } from './PolityDetail';

describe('PolityDetail navigation', () => {
  it('opens the capital city alongside existing person, event, and heritage entries', async () => {
    const onOpenEntity = vi.fn();

    render(<PolityDetail detail={getPolityDetail('qin')!} mode="drawer" onOpenEntity={onOpenEntity} />);

    await userEvent.click(screen.getByRole('link', { name: '咸阳' }));
    await userEvent.click(screen.getByRole('link', { name: '嬴政' }));
    await userEvent.click(screen.getAllByRole('link', { name: '秦统一六国' })[0]);
    await userEvent.click(screen.getByRole('link', { name: '秦帝国咸阳宫殿与都城遗址层' }));

    expect(onOpenEntity.mock.calls).toEqual(expect.arrayContaining([
      [{ type: 'place', id: 'xianyang' }],
      [{ type: 'person', id: 'qin-shi-huang' }],
      [{ type: 'event', id: 'qin-unification' }],
      [{ type: 'heritage', id: 'qin-xianyang-imperial-palace-site' }],
    ]));
  });
});
