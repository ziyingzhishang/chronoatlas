import { fireEvent, render, screen, within } from '@testing-library/react';
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
    expect(screen.getAllByText('资料说明').length).toBeGreaterThan(0);
  });

  it('collects the evidence attached to each construction phase in material notes', () => {
    const detail = getHeritageDetail('big-wild-goose-pagoda')!;

    render(<HeritageDetail detail={detail} heritageName="大雁塔" />);

    expect(screen.getAllByText('资料说明')).toHaveLength(detail.constructionHistory.length + 1);
  });

  it('makes URL-backed phase evidence directly navigable without turning citations into links', () => {
    const detail = getHeritageDetail('white-horse-temple')!;

    render(<HeritageDetail detail={detail} heritageName="白马寺" />);

    const phaseEvidenceLinks = screen.getAllByRole('link', { name: '洛阳白马寺官方历史与保护资料' });
    expect(phaseEvidenceLinks).toHaveLength((detail.constructionHistory.length + 1) * 2);
    expect(phaseEvidenceLinks[0]).toHaveAttribute('href', 'https://www.mct.gov.cn/preview/special/3578/3597/201203/t20120330_235404.html');
    expect(phaseEvidenceLinks[0]).toHaveAttribute('target', '_blank');
    expect(screen.queryByRole('link', { name: '《资治通鉴》' })).not.toBeInTheDocument();
  });

  it('exposes related people, polities, and events as navigation actions', () => {
    const detail = getHeritageDetail('daming-palace-site')!;
    const onNavigate = vi.fn();

    render(<HeritageDetail detail={detail} onNavigate={onNavigate} />);

    fireEvent.click(screen.getByRole('button', { name: '李世民' }));
    expect(onNavigate).toHaveBeenCalledWith({ type: 'person', id: 'li-shimin' });

    fireEvent.click(screen.getByRole('button', { name: '唐' }));
    expect(onNavigate).toHaveBeenCalledWith({ type: 'polity', id: 'tang' });

    fireEvent.click(screen.getByRole('button', { name: '唐建立' }));
    expect(onNavigate).toHaveBeenCalledWith({ type: 'event', id: 'tang-founded' });
  });

  it('does not make an unresolved related endpoint look navigable', () => {
    const detail = getHeritageDetail('big-wild-goose-pagoda')!;

    render(<HeritageDetail detail={detail} onNavigate={vi.fn()} />);

    const relatedEvents = screen.getByRole('region', { name: '关联事件' });
    expect(within(relatedEvents).queryByRole('button', { name: '玄奘取经' })).not.toBeInTheDocument();
    expect(within(relatedEvents).getByText(/暂无已关联资料/)).toBeInTheDocument();
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
      expect(screen.getAllByText('Material notes').length).toBeGreaterThan(0);
    } finally {
      if (previousLocale === null) localStorage.removeItem('history-locale');
      else localStorage.setItem('history-locale', previousLocale);
    }
  });

  it('splits multi-link citations and never exposes unresolved source identifiers', () => {
    const detail = getHeritageDetail('white-horse-temple')!;
    render(<LocaleProvider><HeritageDetail detail={{ ...detail, sourceIds: [...detail.sourceIds, 'missing-source'] }} /></LocaleProvider>);

    expect(screen.getAllByRole('link', { name: '洛阳白马寺官方历史与保护资料' })).toHaveLength((detail.constructionHistory.length + 1) * 2);
    expect(document.body).not.toHaveTextContent('missing-source');
    expect(document.body).not.toHaveTextContent('来源未解析');
  });

  it('never falls back to unresolved heritage or place IDs', () => {
    const detail = getHeritageDetail('white-horse-temple')!;
    render(<HeritageDetail detail={{ ...detail, heritageId: 'missing-heritage-id' }} placeId="missing-place-id" onNavigate={vi.fn()} />);

    expect(screen.getByRole('heading', { name: '相关遗产' })).toBeInTheDocument();
    expect(screen.getByText('相关地点')).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent('missing-heritage-id');
    expect(document.body).not.toHaveTextContent('missing-place-id');
  });
});
