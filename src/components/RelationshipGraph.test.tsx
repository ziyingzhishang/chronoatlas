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
    expect(screen.getByRole('button', { name: /李世民 · 治理／君臣 · 统治 · 方向：李世民 → 唐 · 626—649年/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /唐 · 遗产关联 · 遗留 · 方向：唐 → 大明宫遗址/ })).toBeInTheDocument();
  });

  it('groups claims into five categories and exposes direction, time precision, and source state', () => {
    const bundle = getChanganStudyBundle();
    const view = buildPolityStudyView('tang', 640, { polities, places, people, heritage: heritageAssets, events: bundle.events, claims, capitalTerms: capitalHistory });
    const graphView = {
      ...view!,
      claims: [...view!.claims, {
        id: 'fixture-unknown-source-relationship', subjectId: 'li-shimin', predicate: 'ally-of', objectId: 'li-yuan',
        validFrom: 618, validTo: 626, datePrecision: 'approximate' as const, perspective: 'person' as const,
        evidenceType: 'inference' as const, confidence: 'low' as const, sourceIds: ['missing-fixture-source'],
      }],
    };
    render(<RelationshipGraph view={graphView} />);

    for (const heading of ['治理／君臣', '亲属', '联盟与对立', '事件参与', '遗产关联']) {
      expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
    }
    expect(screen.getByRole('button', { name: /李世民 · 治理／君臣 · 统治 · 方向：李世民 → 唐 · 626—649年 · 时间精度：范围 · 来源：可用/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /李世民 · 联盟与对立 · 联盟 · 方向：李世民 → 李渊 · 618—626年 · 时间精度：约年 · 来源：待解析/ })).toBeInTheDocument();
  });

  it('shows generic historical associations in a separate graph category', () => {
    const bundle = getChanganStudyBundle();
    const view = buildPolityStudyView('tang', 640, { polities, places, people, heritage: heritageAssets, events: bundle.events, claims, capitalTerms: capitalHistory });
    const graphView = {
      ...view!,
      claims: [...view!.claims, {
        id: 'fixture-historical-association', subjectId: 'li-shimin', predicate: 'related-to', objectId: 'li-yuan',
        validFrom: 618, validTo: 626, datePrecision: 'range' as const, perspective: 'person' as const,
        evidenceType: 'cross-checked' as const, confidence: 'medium' as const, sourceIds: ['zizhi-tongjian'],
      }],
    };
    render(<RelationshipGraph view={graphView} />);

    expect(screen.getByRole('heading', { name: '历史关联' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /李世民 · 历史关联 · 历史关联 · 方向：李世民 → 李渊 · 618—626年/ })).toBeInTheDocument();
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

    fireEvent.click(screen.getByRole('button', { name: /李世民 · 治理／君臣 · 统治 · 方向：李世民 → 唐/ }));

    expect(onOpenEntity).toHaveBeenCalledWith({ type: 'polity', id: 'tang' });
  });
});
