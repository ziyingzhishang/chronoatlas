import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { getChanganStudyBundle } from '../data/changan-study';
import { capitalHistory } from '../data/capital-history';
import { claims } from '../data/claims';
import { heritageAssets } from '../data/heritage';
import { people } from '../data/people';
import { places } from '../data/places';
import { polities } from '../data/polities';
import { buildPolityStudyView } from '../domain/study-view';
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
});
