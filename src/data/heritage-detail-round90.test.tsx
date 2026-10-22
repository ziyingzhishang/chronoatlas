import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { getHeritageDetail } from './heritage-details';
import { HeritageDetail } from '../components/HeritageDetail';
import { sourceById } from './sources';

const cases = [
  ['big-wild-goose-pagoda', 'xian-local-chronicle-big-wild-goose', '玄奘', '唐建立'],
  ['xiao-yan-ta', 'xiao-yan-ta-official-digital', '玄奘', '唐建立'],
  ['qinglong-temple-site', 'qinglong-temple-official', '玄奘', '唐建立'],
] as const;

describe('round ninety heritage detail closure', () => {
  it.each(cases)('%s keeps source, chronology and uncertainty evidence', (heritageId, sourceId) => {
    const detail = getHeritageDetail(heritageId);

    expect(detail, heritageId).toBeDefined();
    expect(detail?.sourceIds).toContain(sourceId);
    expect(sourceById[sourceId]?.urlOrCitation, heritageId).toBeTruthy();
    expect(detail?.constructionHistory.length, heritageId).toBeGreaterThanOrEqual(3);
    expect(detail?.constructionHistory.every((phase) => phase.sourceIds.length > 0), heritageId).toBe(true);
    expect(detail?.uncertaintyNote, heritageId).toBeTruthy();
  });

  it.each(cases)('%s exposes person, polity and existing event drawer navigation', (heritageId, _sourceId, personName, eventName) => {
    const detail = getHeritageDetail(heritageId)!;
    const onNavigate = vi.fn();

    render(<HeritageDetail detail={detail} onNavigate={onNavigate} />);

    fireEvent.click(screen.getByRole('button', { name: personName }));
    expect(onNavigate).toHaveBeenCalledWith({ type: 'person', id: 'xuan-zang' });
    fireEvent.click(screen.getByRole('button', { name: '唐' }));
    expect(onNavigate).toHaveBeenCalledWith({ type: 'polity', id: 'tang' });
    fireEvent.click(screen.getByRole('button', { name: eventName }));
    expect(onNavigate).toHaveBeenCalledWith({ type: 'event', id: 'tang-founded' });
  });
});
