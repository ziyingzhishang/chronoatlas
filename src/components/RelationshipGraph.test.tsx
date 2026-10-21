import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { getChanganStudyBundle } from '../data/changan-study';
import { capitalHistory } from '../data/capital-history';
import { claims } from '../data/claims';
import { heritageAssets } from '../data/heritage';
import { people } from '../data/people';
import { places } from '../data/places';
import { polities } from '../data/polities';
import { buildPolityStudyView } from '../domain/study-view';
import type { DetailEntity } from '../domain/detail-entity';
import { RelationshipGraph } from './RelationshipGraph';

describe('RelationshipGraph', () => {
  it('renders person, polity and heritage connections as accessible text and SVG', () => {
    const bundle = getChanganStudyBundle();
    const view = buildPolityStudyView('tang', 640, { polities, places, people, heritage: heritageAssets, events: bundle.events, claims, capitalTerms: capitalHistory });
    render(<RelationshipGraph view={view!} />);

    expect(screen.getByRole('img', { name: '人物关系网络' })).toBeInTheDocument();
    expect(screen.getByText(/李世民 · 统治 · 唐/)).toBeInTheDocument();
    expect(screen.getByText(/唐 · 遗留 · 大明宫遗址/)).toBeInTheDocument();
  });

  it('opens a person entity from a focusable SVG node', () => {
    const bundle = getChanganStudyBundle();
    const view = buildPolityStudyView('tang', 640, { polities, places, people, heritage: heritageAssets, events: bundle.events, claims, capitalTerms: capitalHistory });
    const onOpenEntity = vi.fn<(entity: DetailEntity) => void>();
    render(<RelationshipGraph view={view!} onOpenEntity={onOpenEntity} />);

    const personNode = screen.getByRole('link', { name: '李世民' });
    expect(personNode).toHaveAttribute('tabindex', '0');
    fireEvent.keyDown(personNode, { key: 'Enter' });

    expect(onOpenEntity).toHaveBeenCalledWith({ type: 'person', id: 'li-shimin' });
  });

  it('opens a heritage entity when its SVG node is clicked', () => {
    const bundle = getChanganStudyBundle();
    const view = buildPolityStudyView('tang', 640, { polities, places, people, heritage: heritageAssets, events: bundle.events, claims, capitalTerms: capitalHistory });
    const onOpenEntity = vi.fn<(entity: DetailEntity) => void>();
    render(<RelationshipGraph view={view!} onOpenEntity={onOpenEntity} />);

    fireEvent.click(screen.getByRole('link', { name: '大明宫遗址' }));

    expect(onOpenEntity).toHaveBeenCalledWith({ type: 'heritage', id: 'daming-palace-site' });
  });

  it('opens the related target entity from a text relationship item', () => {
    const bundle = getChanganStudyBundle();
    const view = buildPolityStudyView('tang', 640, { polities, places, people, heritage: heritageAssets, events: bundle.events, claims, capitalTerms: capitalHistory });
    const onOpenEntity = vi.fn<(entity: DetailEntity) => void>();
    render(<RelationshipGraph view={view!} onOpenEntity={onOpenEntity} />);

    fireEvent.click(screen.getByRole('button', { name: '李世民 · 统治 · 唐' }));

    expect(onOpenEntity).toHaveBeenCalledWith({ type: 'polity', id: 'tang' });
  });
});
