import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
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
    expect(screen.getByText('隋')).toBeInTheDocument();
    expect(screen.getByText('大明宫遗址')).toBeInTheDocument();
  });
});
