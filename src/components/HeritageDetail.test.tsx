import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { getHeritageDetail } from '../data/heritage-details';
import { HeritageDetail } from './HeritageDetail';

describe('HeritageDetail', () => {
  it('shows the historical phases and modern interpretation separately', () => {
    const detail = getHeritageDetail('daming-palace-site')!;

    render(<HeritageDetail detail={detail} heritageName="大明宫遗址" />);

    expect(screen.getByRole('heading', { name: '大明宫遗址' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '建造沿革' })).toBeInTheDocument();
    expect(screen.getByText('原建筑')).toBeInTheDocument();
    expect(screen.getByText('遗址')).toBeInTheDocument();
    expect(screen.getByText('后世重建')).toBeInTheDocument();
    expect(screen.getByText('现代复原')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '现存特征' })).toBeInTheDocument();
    expect(screen.getByText(detail.modernLocation)).toBeInTheDocument();
    expect(screen.getByText(detail.uncertaintyNote)).toBeInTheDocument();
    expect(screen.getByText('来源与依据')).toBeInTheDocument();
  });

  it('shows the evidence attached to each construction phase', () => {
    const detail = getHeritageDetail('big-wild-goose-pagoda')!;

    render(<HeritageDetail detail={detail} heritageName="大雁塔" />);

    expect(screen.getAllByText('阶段依据：')).toHaveLength(detail.constructionHistory.length);
  });

  it('exposes related people, polities, and events as navigation actions', () => {
    const detail = getHeritageDetail('big-wild-goose-pagoda')!;
    const onNavigate = vi.fn();

    render(<HeritageDetail detail={detail} onNavigate={onNavigate} />);

    fireEvent.click(screen.getByRole('button', { name: '玄奘' }));
    expect(onNavigate).toHaveBeenCalledWith({ type: 'person', id: 'xuan-zang' });

    fireEvent.click(screen.getByRole('button', { name: '唐' }));
    expect(onNavigate).toHaveBeenCalledWith({ type: 'polity', id: 'tang' });

    fireEvent.click(screen.getByRole('button', { name: '玄奘取经' }));
    expect(onNavigate).toHaveBeenCalledWith({ type: 'event', id: 'xuanzang-translations' });
  });
});
