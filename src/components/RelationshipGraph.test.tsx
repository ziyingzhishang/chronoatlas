import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { getChanganStudyBundle } from '../data/changan-study';
import { capitalHistory } from '../data/capital-history';
import { claims } from '../data/claims';
import { events } from '../data/events';
import { eventDetails } from '../data/event-details';
import { heritageAssets } from '../data/heritage';
import { people } from '../data/people';
import { places } from '../data/places';
import { polities } from '../data/polities';
import { polityDetails } from '../data/polity-details';
import { buildCityStudyView, buildPolityStudyView } from '../domain/study-view';
import type { DetailEntity } from '../domain/detail-entity';
import { RelationshipGraph } from './RelationshipGraph';
import { toCityRelationshipGraphView, toPolityRelationshipGraphView } from './relationship-graph-model';

describe('RelationshipGraph', () => {
  it('renders a city-centered graph and navigates city graph nodes', () => {
    const city = buildCityStudyView('changan', 650, { polities, places, people, heritage: heritageAssets, events, claims, capitalTerms: capitalHistory });
    const onOpenEntity = vi.fn<(entity: DetailEntity) => void>();
    render(<RelationshipGraph graph={toCityRelationshipGraphView(city!)} onOpenEntity={onOpenEntity} />);

    expect(screen.getByRole('img', { name: '城市关系网络' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '长安' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('link', { name: '隋' }));

    expect(onOpenEntity).toHaveBeenCalledWith({ type: 'polity', id: 'sui' });
  });

  it('keeps reader-facing material notes and source traceability for city graph edges', () => {
    const city = buildCityStudyView('changan', 650, { polities, places, people, heritage: heritageAssets, events, claims, capitalTerms: capitalHistory });
    render(<RelationshipGraph graph={toCityRelationshipGraphView(city!)} />);

    expect(screen.getAllByText('资料说明').length).toBeGreaterThan(0);
    expect(document.body).not.toHaveTextContent('边证据');
  });

  it('renders person, polity and heritage connections as accessible text and SVG', () => {
    const bundle = getChanganStudyBundle();
    const view = buildPolityStudyView('tang', 640, { polities, places, people, heritage: heritageAssets, events: bundle.events, claims, capitalTerms: capitalHistory });
    render(<RelationshipGraph graph={toPolityRelationshipGraphView(view!)} />);

    expect(screen.getByRole('img', { name: '人物关系网络' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /李世民 · 治理／君臣 · 统治 · 唐 · 626—649年.*当前地图时段/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /唐 · 遗产关联 · 遗留 · 大明宫遗址/ })).toBeInTheDocument();
  });

  it('groups claims into five categories without exposing direction, precision, or source workflow state', () => {
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
    render(<RelationshipGraph graph={toPolityRelationshipGraphView(graphView)} />);

    for (const heading of ['治理／君臣', '亲属', '联盟与对立', '事件参与', '遗产关联']) {
      expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
    }
    expect(screen.getByRole('button', { name: /李世民 · 治理／君臣 · 统治 · 唐 · 626—649年/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /李世民 · 联盟与对立 · 联盟 · 李渊 · 618—626年/ })).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent('方向：');
    expect(document.body).not.toHaveTextContent('待解析');
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
    render(<RelationshipGraph graph={toPolityRelationshipGraphView(graphView)} />);

    expect(screen.getByRole('heading', { name: '历史关联' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /李世民 · 历史关联 · 历史关联 · 李渊 · 618—626年/ })).toBeInTheDocument();
  });

  it('renders the fifty-fifth batch event edges in the event participation category', () => {
    const bundle = getChanganStudyBundle();
    const view = buildPolityStudyView('tang', 640, { polities, places, people, heritage: heritageAssets, events: bundle.events, claims, capitalTerms: capitalHistory });
    const graphView = {
      ...view!,
      people: [...view!.people, people.find((person) => person.id === 'cao-cao')!],
      events: [...view!.events, events.find((event) => event.id === 'three-kingdoms')!],
      claims: [...view!.claims, claims.find((claim) => claim.id === 'claim-cao-cao-participated-three-kingdoms-fiftyfifth')!],
    };
    render(<RelationshipGraph graph={toPolityRelationshipGraphView(graphView)} />);

    expect(screen.getByRole('heading', { name: '事件参与' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /曹操 · 事件参与 · 参与事件 · 三国开始 · 220年/ })).toBeInTheDocument();
  });

  it('renders fifty-sixth batch ruler edges in the governance category', () => {
    const view = buildPolityStudyView('qing', 1643, { polities, places, people, heritage: heritageAssets, events, claims, capitalTerms: capitalHistory });
    render(<RelationshipGraph graph={toPolityRelationshipGraphView(view!)} />);

    expect(screen.getByRole('button', { name: /皇太极 · 治理／君臣 · 统治 · 清 · 1636—1643年/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /福临 · 治理／君臣 · 统治 · 清 · 1643—1661年/ })).toBeInTheDocument();
  });

  it('renders fifty-ninth batch ruler edges in the governance category', () => {
    const view = buildPolityStudyView('wu_three', 240, { polities, places, people, heritage: heritageAssets, events, claims, capitalTerms: capitalHistory });
    render(<RelationshipGraph graph={toPolityRelationshipGraphView(view!)} />);

    expect(screen.getByRole('button', { name: /孙权 · 治理／君臣 · 统治 · 吴 · 229—252年/ })).toBeInTheDocument();
  });

  it('renders the fifty-seventh batch conflict edge in the alliance and conflict category', () => {
    const view = buildPolityStudyView('liang_southern', 555, { polities, places, people, heritage: heritageAssets, events, claims, capitalTerms: capitalHistory });
    const graphView = {
      ...view!,
      people: [...view!.people, people.find((person) => person.id === 'chen-baxian')!],
      claims: [...view!.claims, claims.find((claim) => claim.id === 'claim-wang-sengbian-enemy-chen-baxian-fiftyseventh')!],
    };
    render(<RelationshipGraph graph={toPolityRelationshipGraphView(graphView)} />);

    expect(screen.getByRole('button', { name: /王僧辩 · 联盟与对立 · 对立 · 陈霸先 · 555年/ })).toBeInTheDocument();
  });

  it('opens a person entity from a focusable SVG node', () => {
    const bundle = getChanganStudyBundle();
    const view = buildPolityStudyView('tang', 640, { polities, places, people, heritage: heritageAssets, events: bundle.events, claims, capitalTerms: capitalHistory });
    const onOpenEntity = vi.fn<(entity: DetailEntity) => void>();
    render(<RelationshipGraph graph={toPolityRelationshipGraphView(view!)} onOpenEntity={onOpenEntity} />);

    const personNode = screen.getByRole('link', { name: '李世民' });
    expect(personNode).toHaveAttribute('tabindex', '0');
    fireEvent.keyDown(personNode, { key: 'Enter' });

    expect(onOpenEntity).toHaveBeenCalledWith({ type: 'person', id: 'li-shimin' });
  });

  it('opens a heritage entity when its SVG node is clicked', () => {
    const bundle = getChanganStudyBundle();
    const view = buildPolityStudyView('tang', 640, { polities, places, people, heritage: heritageAssets, events: bundle.events, claims, capitalTerms: capitalHistory });
    const onOpenEntity = vi.fn<(entity: DetailEntity) => void>();
    render(<RelationshipGraph graph={toPolityRelationshipGraphView(view!)} onOpenEntity={onOpenEntity} />);

    fireEvent.click(screen.getByRole('link', { name: '大明宫遗址' }));

    expect(onOpenEntity).toHaveBeenCalledWith({ type: 'heritage', id: 'daming-palace-site' });
  });

  it('opens the related target entity from a text relationship item', () => {
    const bundle = getChanganStudyBundle();
    const view = buildPolityStudyView('tang', 640, { polities, places, people, heritage: heritageAssets, events: bundle.events, claims, capitalTerms: capitalHistory });
    const onOpenEntity = vi.fn<(entity: DetailEntity) => void>();
    render(<RelationshipGraph graph={toPolityRelationshipGraphView(view!)} onOpenEntity={onOpenEntity} />);

    fireEvent.click(screen.getByRole('button', { name: /李世民 · 治理／君臣 · 统治 · 唐/ }));

    expect(onOpenEntity).toHaveBeenCalledWith({ type: 'polity', id: 'tang' });
  });

  it('renders detail-linked entities and claims with an explicit non-current scope', () => {
    const qingDetail = polityDetails.find((detail) => detail.polityId === 'qing')!;
    const detailClaim = claims.find((claim) => claim.id === 'claim-nurhaci-parent-hongtaiji')!;
    const view = buildPolityStudyView('qing', 1636, {
      polities, places, people, heritage: heritageAssets, events, eventDetails,
      claims, capitalTerms: capitalHistory,
      polityDetails: [
        ...polityDetails.filter((detail) => detail.polityId !== 'qing'),
        { ...qingDetail, claimIds: [detailClaim.id] },
      ],
    });
    render(<RelationshipGraph graph={toPolityRelationshipGraphView(view!)} />);

    expect(screen.getByRole('link', { name: '努尔哈赤' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '清入关' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '清盛京宫殿与城市历史层' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /努尔哈赤 · 亲属 · 亲属：父母 · 皇太极 · 1592—1626年.*与本专题相关/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '清入关 · 与本专题相关' })).toBeInTheDocument();
    expect(screen.getByText('专题相关内容')).toBeInTheDocument();
  });

  it('expands relationship material notes with readable uncertainty and sources', () => {
    const bundle = getChanganStudyBundle();
    const view = buildPolityStudyView('tang', 640, { polities, places, people, heritage: heritageAssets, events: bundle.events, claims, capitalTerms: capitalHistory });
    const graphView = {
      ...view!,
      claims: [...view!.claims, {
        id: 'fixture-edge-evidence-url', subjectId: 'li-shimin', predicate: 'ally-of', objectId: 'li-yuan',
        validFrom: 618, validTo: 626, datePrecision: 'range' as const, perspective: 'person' as const,
        evidenceType: 'inference' as const, confidence: 'low' as const, sourceIds: ['silla-encykorea'],
        uncertaintyNote: '关系方向是阶段性概括。',
      }],
    };
    render(<RelationshipGraph graph={toPolityRelationshipGraphView(graphView)} />);

    const relation = screen.getByRole('button', { name: /李世民 · 联盟与对立 · 联盟 · 李渊 · 618—626年/ });
    const relationItem = within(relation.closest('li')!);
    fireEvent.click(relationItem.getByText('资料说明'));
    expect(relationItem.getByText('618—626年')).toBeInTheDocument();
    expect(relationItem.getByText('关系方向是阶段性概括。')).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent('证据类型');
    expect(document.body).not.toHaveTextContent('可信度');
    expect(screen.getByRole('link', { name: '新罗 · 韩国民族文化大百科' })).toHaveAttribute('href', 'https://encykorea.aks.ac.kr/Article/E0032800');
  });

  it('renders bibliography text without unresolved source ids or workflow states', () => {
    const bundle = getChanganStudyBundle();
    const view = buildPolityStudyView('tang', 640, { polities, places, people, heritage: heritageAssets, events: bundle.events, claims, capitalTerms: capitalHistory });
    const graphView = {
      ...view!,
      claims: [...view!.claims, {
        id: 'fixture-edge-evidence-bibliography', subjectId: 'li-shimin', predicate: 'enemy-of', objectId: 'li-yuan',
        validFrom: 626, validTo: 626, datePrecision: 'year' as const, perspective: 'person' as const,
        evidenceType: 'explicit-record' as const, confidence: 'medium' as const, sourceIds: ['zizhi-tongjian', 'missing-edge-source'],
      }],
    };
    render(<RelationshipGraph graph={toPolityRelationshipGraphView(graphView)} />);

    expect(screen.getAllByText('《资治通鉴》').length).toBeGreaterThan(0);
    expect(document.body).not.toHaveTextContent('missing-edge-source');
    expect(document.body).not.toHaveTextContent('来源未解析');
    expect(screen.queryByRole('link', { name: '《资治通鉴》' })).not.toBeInTheDocument();
  });
});
