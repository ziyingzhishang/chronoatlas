import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { getChanganStudyBundle } from '../data/changan-study';
import { capitalHistory } from '../data/capital-history';
import { claims } from '../data/claims';
import { heritageAssets } from '../data/heritage';
import { people } from '../data/people';
import { places } from '../data/places';
import { polities } from '../data/polities';
import { buildCityStudyView, buildPolityStudyView } from '../domain/study-view';
import { groupPersonRelationships } from '../domain/relationships';
import { LocaleProvider } from '../i18n/locale';
import { StudyRelationsPanel } from './StudyRelationsPanel';

const data = { polities, places, people, heritage: heritageAssets, events: getChanganStudyBundle().events, claims, capitalTerms: capitalHistory };

describe('StudyRelationsPanel integration', () => {
  it('renders the polity perspective and its people', () => {
    const view = buildPolityStudyView('tang', 640, data);
    expect(view?.claims.map((claim) => claim.id)).toContain('claim-li-shimin-ruled-tang');
    expect(groupPersonRelationships('li-shimin', 640, view?.claims ?? [])['person-polity']).toHaveLength(1);
    render(<StudyRelationsPanel view={view!} />);

    expect(screen.getByText('政权视角')).toBeInTheDocument();
    expect(screen.getAllByText(/李世民/).length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText(/统治/).length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('唐在长安建立').length).toBeGreaterThanOrEqual(1);
  });

  it('renders new study labels in English', () => {
    localStorage.setItem('history-locale', 'en');
    const view = buildCityStudyView('changan', 650, data);
    render(<LocaleProvider><StudyRelationsPanel view={view!} /></LocaleProvider>);

    expect(screen.getByText('City perspective')).toBeInTheDocument();
    expect(screen.getByText('Related events')).toBeInTheDocument();
    expect(screen.getByText('Heritage and city memory')).toBeInTheDocument();
    expect(screen.getAllByText(/Daming Palace Site|大明宫遗址/).length).toBeGreaterThanOrEqual(1);
    localStorage.removeItem('history-locale');
  });
});
