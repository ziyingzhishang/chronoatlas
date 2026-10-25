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

  it('presents sources and uncertainty as reader-facing notes without audit vocabulary', () => {
    render(<PolityDetail detail={getPolityDetail('qin')!} mode="drawer" />);

    expect(screen.getAllByText('资料说明').length).toBeGreaterThan(0);
    expect(screen.getAllByText('前221年—前206年').length).toBeGreaterThan(0);
    expect(screen.getAllByText('《资治通鉴》').length).toBeGreaterThan(0);
    expect(document.body).not.toHaveTextContent('来源解析');
    expect(document.body).not.toHaveTextContent('已解析');
    expect(document.body).not.toHaveTextContent('bundled-');
  });

  it('uses reader labels instead of unresolved internal entity IDs', () => {
    const base = getPolityDetail('qin')!;
    render(<PolityDetail detail={{
      ...base,
      principalFigureIds: ['missing-person-id'],
      capitalPhases: [{ ...base.capitalPhases[0], placeId: 'missing-place-id' }],
      heritageIds: ['missing-heritage-id'],
      eventIds: ['missing-event-id'],
    }} mode="drawer" />);

    for (const internalId of ['missing-person-id', 'missing-place-id', 'missing-heritage-id', 'missing-event-id']) {
      expect(document.body).not.toHaveTextContent(internalId);
    }
    expect(screen.getByText('相关地点')).toBeInTheDocument();
  });
});
