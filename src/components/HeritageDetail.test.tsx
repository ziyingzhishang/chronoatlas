import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { getHeritageDetail } from '../data/heritage-details';
import { LocaleProvider } from '../i18n/locale';
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

  it('opens the structured modern place from the heritage detail header', () => {
    const detail = getHeritageDetail('ximing-temple-site')!;
    const onNavigate = vi.fn();

    render(<HeritageDetail detail={detail} placeId="changan" onNavigate={onNavigate} />);

    fireEvent.click(screen.getByRole('button', { name: '长安' }));
    expect(onNavigate).toHaveBeenCalledWith({ type: 'place', id: 'changan' });
  });

  it('makes verifiable heritage sources navigable from the detail drawer', () => {
    const detail = getHeritageDetail('big-wild-goose-pagoda')!;

    render(<HeritageDetail detail={detail} heritageName="大雁塔" />);

    const sourceLink = screen.getByRole('link', { name: '大雁塔 · 西安市地方志办公室' });
    expect(sourceLink).toHaveAttribute('href', 'https://xadfz.xa.gov.cn/xadq/rwxa/1802954373708996609.html');
    expect(sourceLink).toHaveAttribute('target', '_blank');
  });

  it('localizes the heritage detail structure through the shared locale provider', () => {
    const previousLocale = localStorage.getItem('history-locale');
    localStorage.setItem('history-locale', 'en');

    try {
      const detail = getHeritageDetail('daming-palace-site')!;
      render(<LocaleProvider><HeritageDetail detail={detail} heritageName="大明宫遗址" /></LocaleProvider>);

      expect(screen.getByRole('article', { name: 'Heritage details' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Construction history' })).toBeInTheDocument();
      expect(screen.getByText('Modern location:')).toBeInTheDocument();
      expect(screen.getByText('Sources and evidence')).toBeInTheDocument();
    } finally {
      if (previousLocale === null) localStorage.removeItem('history-locale');
      else localStorage.setItem('history-locale', previousLocale);
    }
  });
});
