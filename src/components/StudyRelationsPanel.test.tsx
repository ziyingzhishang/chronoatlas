import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { getChanganStudyBundle } from '../data/changan-study';
import { capitalHistory } from '../data/capital-history';
import { buildCityStudyView } from '../domain/study-view';
import { StudyRelationsPanel } from './StudyRelationsPanel';

describe('StudyRelationsPanel', () => {
  it('shows the city perspective with historical regimes and heritage', () => {
    const bundle = getChanganStudyBundle();
    const view = buildCityStudyView('changan', 650, {
      ...bundle,
      capitalTerms: capitalHistory,
      places: [bundle.city],
    });
    render(<StudyRelationsPanel view={view!} />);

    expect(screen.getByText('城市视角')).toBeInTheDocument();
    expect(screen.getAllByText('隋').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('大明宫遗址').length).toBeGreaterThanOrEqual(1);
  });

  it('renders the city history timeline and opens a selected node', async () => {
    const bundle = getChanganStudyBundle();
    const view = buildCityStudyView('changan', 650, {
      ...bundle,
      capitalTerms: capitalHistory,
      places: [bundle.city],
    });
    const onOpenEntity = vi.fn();
    render(<StudyRelationsPanel view={view!} onOpenEntity={onOpenEntity} />);

    expect(screen.getByRole('region', { name: '城市历史时间轴' })).toBeInTheDocument();
    await userEvent.click(within(screen.getByRole('region', { name: '城市历史时间轴' })).getByRole('button', { name: '唐在长安建立' }));
    expect(onOpenEntity).toHaveBeenCalledWith({ type: 'event', id: 'tang-founded-changan' });
  });

  it('opens a historical polity from the city regime list', async () => {
    const bundle = getChanganStudyBundle();
    const view = buildCityStudyView('changan', 650, {
      ...bundle,
      capitalTerms: capitalHistory,
      places: [bundle.city],
    });
    const onOpenEntity = vi.fn();
    render(<StudyRelationsPanel view={view!} onOpenEntity={onOpenEntity} />);

    const regimeBlock = screen.getByRole('heading', { name: '曾以此地为政治中心的政权' }).parentElement!;
    await userEvent.click(within(regimeBlock).getByRole('button', { name: '隋' }));
    expect(onOpenEntity).toHaveBeenCalledWith({ type: 'polity', id: 'sui' });
  });

  it('uses reader language for related content instead of detail-link workflow terms', () => {
    const bundle = getChanganStudyBundle();
    const view = buildCityStudyView('changan', 650, { ...bundle, capitalTerms: capitalHistory, places: [bundle.city] });
    render(<StudyRelationsPanel view={view!} />);

    expect(document.body).not.toHaveTextContent('时间精度：');
    expect(document.body).not.toHaveTextContent('详情关联入口');
    expect(document.body).not.toHaveTextContent('非本年事实');
  });
});
