import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { HistoricalClaim, HistoricalEvent, Person } from '../domain/types';
import { getPersonDetail } from '../data/person-details';
import { claims as catalogClaims } from '../data/claims';
import { people as catalogPeople } from '../data/people';
import { polities as catalogPolities } from '../data/polities';
import { LocaleProvider } from '../i18n/locale';
import { PersonDetail } from './PersonDetail';

const person: Person = {
  id: 'li-shimin',
  name: '李世民',
  aliases: ['唐太宗'],
  birthYear: 598,
  deathYear: 649,
  roles: ['皇帝'],
  polityIds: ['tang'],
  description: '唐太宗时期以长安为帝国政治与文化中心。',
  sourceIds: ['zizhi-tongjian'],
};

const relationPeople: Person[] = [
  person,
  { ...person, id: 'li-yuan', name: '李渊' },
  { ...person, id: 'wang-mang', name: '王莽' },
];

const relationshipClaims: HistoricalClaim[] = [
  { id: 'parent', subjectId: 'li-shimin', predicate: 'parent-of', objectId: 'li-yuan', validFrom: 618, validTo: 649, datePrecision: 'range', perspective: 'person', evidenceType: 'cross-checked', confidence: 'medium', sourceIds: ['zizhi-tongjian'] },
  { id: 'served', subjectId: 'li-shimin', predicate: 'served', objectId: 'li-yuan', validFrom: 618, validTo: 626, datePrecision: 'range', perspective: 'person', evidenceType: 'explicit-record', confidence: 'medium', sourceIds: ['zizhi-tongjian'] },
  { id: 'ally', subjectId: 'li-shimin', predicate: 'ally-of', objectId: 'li-yuan', validFrom: 618, validTo: 626, datePrecision: 'range', perspective: 'person', evidenceType: 'cross-checked', confidence: 'medium', sourceIds: ['zizhi-tongjian'] },
  { id: 'enemy', subjectId: 'li-shimin', predicate: 'enemy-of', objectId: 'wang-mang', validFrom: 618, validTo: 649, datePrecision: 'range', perspective: 'person', evidenceType: 'inference', confidence: 'low', sourceIds: ['zizhi-tongjian'], uncertaintyNote: '示范关系，仅用于保留对立关系的方向和证据状态。' },
  { id: 'participated', subjectId: 'li-shimin', predicate: 'participated-in', objectId: 'tang-founded-changan', validFrom: 618, validTo: 620, datePrecision: 'year', perspective: 'person', evidenceType: 'explicit-record', confidence: 'medium', sourceIds: ['zizhi-tongjian'] },
];

const events: HistoricalEvent[] = [
  { id: 'tang-founded-changan', year: 618, title: '唐在长安建立', summary: '李渊入据长安并建立唐朝。', sourceIds: ['zizhi-tongjian'] },
];

describe('PersonDetail', () => {
  it('renders biography, offices, events, directional relation groups, sources, and uncertainty', () => {
    render(
      <PersonDetail
        person={person}
        detail={getPersonDetail('li-shimin')!}
        year={620}
        claims={relationshipClaims}
        people={relationPeople}
        events={events}
      />,
    );

    expect(screen.getByRole('article', { name: '人物详情' })).toBeInTheDocument();
    expect(screen.getByText('李世民是唐初军事与政治核心，继位后以长安为帝国政治和文化中心之一。')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '任职经历' })).toBeInTheDocument();
    expect(screen.getByText(/唐太宗/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '关键事件' })).toBeInTheDocument();
    expect(screen.getByText('唐在长安建立')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '亲属关系' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '君臣关系' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '联盟关系' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '对立关系' })).toBeInTheDocument();
    expect(screen.getAllByText(/李渊/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/王莽/).length).toBeGreaterThan(0);
    expect(screen.getAllByText('资料说明').length).toBeGreaterThan(0);
    expect(document.body).not.toHaveTextContent('时间证据审计');
  });

  it('shows an explicit empty state when detail data is unavailable', () => {
    render(<PersonDetail person={person} year={620} claims={[]} />);

    expect(screen.getByText('暂无已收录人物详情')).toBeInTheDocument();
  });

  it('shows confirmed time evidence in reader language', () => {
    render(<PersonDetail person={person} detail={getPersonDetail('li-shimin')!} year={620} claims={[]} />);

    expect(screen.getAllByText('生卒年记录较明确').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/现有资料同时记录生年与卒年/).length).toBeGreaterThan(0);
  });

  it('shows approximate and unknown states without inventing a life date', () => {
    const approximatePerson = {
      ...person,
      id: 'yu-the-great',
      name: '大禹',
      birthYear: undefined,
      deathYear: undefined,
    };
    render(<PersonDetail person={approximatePerson} detail={getPersonDetail('yu-the-great')} year={2200} claims={[]} />);

    expect(screen.getAllByText('相关活动年代为约数').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/生卒年尚不完整；现有任职或活动年代仅用于说明其活跃时期/).length).toBeGreaterThan(0);

    render(<PersonDetail person={{ ...person, id: 'not-in-review', name: '未审计人物' }} detail={getPersonDetail('li-shimin')} year={620} claims={[]} />);
    expect(screen.getAllByText('生卒年尚待核实').length).toBeGreaterThan(0);
    expect(document.body).not.toHaveTextContent('可定位到时间轴');
  });

  it('keeps relationship audit status and internal claim ids out of the reader view', () => {
    render(<PersonDetail person={person} detail={getPersonDetail('li-shimin')!} year={620} claims={relationshipClaims} people={relationPeople} events={events} />);

    expect(screen.getByRole('heading', { name: '人物关系' })).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: '人物关系覆盖审计' })).not.toBeInTheDocument();
    expect(document.body).not.toHaveTextContent('claim:');
    expect(document.body).not.toHaveTextContent(' claim ');
    expect(document.body).not.toHaveTextContent('覆盖状态');
  });

  it('renders an interactive person-centered relationship graph summary', () => {
    const onOpenEntity = vi.fn();
    render(<PersonDetail person={person} detail={getPersonDetail('li-shimin')!} year={620} claims={relationshipClaims} people={relationPeople} events={events} onOpenEntity={onOpenEntity} />);

    const graph = screen.getByRole('region', { name: '人物关系图谱' });
    expect(graph).toBeInTheDocument();
    const kinshipNode = within(graph).getByRole('button', { name: '父母／子女：李渊' });
    expect(kinshipNode).toBeInTheDocument();
    kinshipNode.click();
    expect(onOpenEntity).toHaveBeenCalledWith({ type: 'person', id: 'li-yuan' });
  });

  it('does not link readers to the internal knowledge coverage report', () => {
    const tufaWugu = catalogPeople.find((item) => item.id === 'tufa-wugu')!;
    render(
      <PersonDetail
        person={tufaWugu}
        detail={getPersonDetail('tufa-wugu')!}
        year={397}
        claims={catalogClaims}
        people={catalogPeople}
        polities={catalogPolities}
      />,
    );

    expect(screen.queryByRole('link', { name: '打开知识覆盖报告' })).not.toBeInTheDocument();
  });

  it('keeps internal relationship evidence labels out of the English reader view', () => {
    localStorage.setItem('history-locale', 'en');
    render(<LocaleProvider><PersonDetail person={person} detail={getPersonDetail('li-shimin')!} year={620} claims={relationshipClaims} people={relationPeople} events={events} /></LocaleProvider>);

    expect(document.body).not.toHaveTextContent('Coverage evidence');
    expect(document.body).not.toHaveTextContent('Direct relationship evidence');
    localStorage.removeItem('history-locale');
  });

  it('shows directional, dated, sourced event participation and opens the event', () => {
    const onOpenEntity = vi.fn();
    render(<PersonDetail person={person} detail={getPersonDetail('li-shimin')!} year={620} claims={relationshipClaims} people={relationPeople} events={events} onOpenEntity={onOpenEntity} />);

    expect(screen.getByRole('heading', { name: '事件参与' })).toBeInTheDocument();
    const eventRelation = screen.getAllByRole('button', { name: /参与事件.*唐在长安建立/ }).at(-1)!;
    expect(eventRelation).toBeInTheDocument();
    eventRelation.click();

    expect(onOpenEntity).toHaveBeenCalledWith({ type: 'event', id: 'tang-founded-changan' });
  });

  it('shows incoming governance relations without debug direction text', () => {
    const onOpenEntity = vi.fn();
    render(<PersonDetail
      person={person}
      detail={getPersonDetail('li-shimin')!}
      year={620}
      claims={[{
        id: 'incoming-served', subjectId: 'li-yuan', predicate: 'served', objectId: 'li-shimin',
        validFrom: 618, validTo: 626, datePrecision: 'range', perspective: 'person',
        evidenceType: 'explicit-record', confidence: 'medium', sourceIds: ['zizhi-tongjian'],
      }]}
      people={relationPeople}
      onOpenEntity={onOpenEntity}
    />);

    expect(screen.getAllByRole('button', { name: /侍奉／效力.*李渊/ }).length).toBeGreaterThan(0);
    expect(document.body).not.toHaveTextContent('方向：');
  });

  it('renders an HTTP source note for a relationship as a keyboard-accessible external link', () => {
    const onOpenEntity = vi.fn();
    const urlClaim: HistoricalClaim = {
      id: 'url-backed-relationship', subjectId: 'li-shimin', predicate: 'served', objectId: 'li-yuan',
      validFrom: 618, validTo: 626, datePrecision: 'range', perspective: 'person',
      evidenceType: 'cross-checked', confidence: 'medium', sourceIds: ['xian-local-chronicle-western-han-mausoleums'],
    };
    render(<PersonDetail
      person={person}
      detail={getPersonDetail('li-shimin')!}
      year={620}
      claims={[urlClaim]}
      people={relationPeople}
      onOpenEntity={onOpenEntity}
    />);

    const sourceLink = screen.getByRole('link', { name: '西安市志·西汉帝陵条目' });
    expect(sourceLink).toHaveAttribute('href', 'https://dfz.shaanxi.gov.cn/zslm/fzzlk/xbsxsxz/xbsxz/xas/201803/P020250630548327427771.pdf');
    expect(sourceLink).toHaveAttribute('target', '_blank');
    expect(sourceLink).toHaveAttribute('rel', 'noreferrer');
    expect(screen.getAllByRole('button', { name: /侍奉／效力.*李渊/ }).length).toBeGreaterThan(0);
  });

  it('keeps a non-URL relationship bibliography as text rather than a link', () => {
    const onOpenEntity = vi.fn();
    render(<PersonDetail
      person={person}
      detail={getPersonDetail('li-shimin')!}
      year={620}
      claims={[relationshipClaims[1]]}
      people={relationPeople}
      onOpenEntity={onOpenEntity}
    />);

    expect(screen.getAllByText('《资治通鉴》').length).toBeGreaterThan(0);
    expect(screen.queryByRole('link', { name: '《资治通鉴》' })).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /侍奉／效力.*李渊/ }).length).toBeGreaterThan(0);
  });

  it('opens person and polity targets without exposing traceability codes', () => {
    const onOpenEntity = vi.fn();
    const foundedClaim: HistoricalClaim = {
      id: 'founded-tang', subjectId: 'li-shimin', predicate: 'founded', objectId: 'tang',
      validFrom: 618, validTo: 618, datePrecision: 'year', perspective: 'person',
      evidenceType: 'explicit-record', confidence: 'high', sourceIds: ['zizhi-tongjian'],
    };
    render(<PersonDetail
      person={person}
      detail={getPersonDetail('li-shimin')!}
      year={618}
      claims={[...relationshipClaims, foundedClaim]}
      people={relationPeople}
      polities={catalogPolities}
      events={events}
      onOpenEntity={onOpenEntity}
    />);

    const kinship = screen.getAllByRole('button', { name: /父母／子女.*李渊/ }).at(-1)!;
    expect(kinship).toBeInTheDocument();
    kinship.click();
    expect(onOpenEntity).toHaveBeenCalledWith({ type: 'person', id: 'li-yuan' });

    const founded = screen.getAllByRole('button', { name: /建立.*唐/ }).at(-1)!;
    expect(founded).toBeInTheDocument();
    founded.click();
    expect(onOpenEntity).toHaveBeenCalledWith({ type: 'polity', id: 'tang' });
  });

  it('marks event participation with an unresolved source state', () => {
    const unresolvedClaims = relationshipClaims.map((claim) => claim.id === 'participated' ? { ...claim, sourceIds: ['missing-event-source'] } : claim);
    render(<PersonDetail person={person} detail={getPersonDetail('li-shimin')!} year={620} claims={unresolvedClaims} people={relationPeople} events={events} />);

    expect(document.body).not.toHaveTextContent('missing-event-source');
    expect(document.body).not.toHaveTextContent('待解析');
  });

  it('shows a fifty-sixth batch ruler relation in the person detail governance section', () => {
    const hongtaiji = catalogPeople.find((item) => item.id === 'hongtaiji')!;
    render(
      <PersonDetail
        person={hongtaiji}
        detail={getPersonDetail('hongtaiji')!}
        year={1640}
        claims={catalogClaims}
        people={catalogPeople}
        polities={catalogPolities}
      />,
    );

    expect(screen.getByRole('heading', { name: '君臣关系' })).toBeInTheDocument();
    expect(screen.getByText(/统治\s+·\s+清/)).toBeInTheDocument();
  });

  it('shows a fifty-ninth batch ruler relation in the person detail governance section', () => {
    const sunQuan = catalogPeople.find((item) => item.id === 'sun-quan')!;
    render(
      <PersonDetail
        person={sunQuan}
        detail={getPersonDetail('sun-quan')!}
        year={240}
        claims={catalogClaims}
        people={catalogPeople}
        polities={catalogPolities}
      />,
    );

    expect(screen.getByRole('heading', { name: '君臣关系' })).toBeInTheDocument();
    expect(screen.getByText(/统治\s+·\s+吴/)).toBeInTheDocument();
  });

  it('shows the fifty-seventh batch conflict relation in the person detail', () => {
    const wangSengbian = catalogPeople.find((item) => item.id === 'wang-sengbian')!;
    render(
      <PersonDetail
        person={wangSengbian}
        detail={getPersonDetail('wang-sengbian')!}
        year={555}
        claims={catalogClaims}
        people={catalogPeople}
        polities={catalogPolities}
      />,
    );

    expect(screen.getByRole('heading', { name: '对立关系' })).toBeInTheDocument();
    expect(screen.getByText(/对立\s+·\s+陈霸先/)).toBeInTheDocument();
  });

  it('keeps relationship audit status labels out of English', () => {
    localStorage.setItem('history-locale', 'en');
    render(<LocaleProvider><PersonDetail person={person} detail={getPersonDetail('li-shimin')!} year={620} claims={relationshipClaims} people={relationPeople} events={events} /></LocaleProvider>);

    expect(screen.queryByRole('region', { name: 'Person relationship coverage audit' })).not.toBeInTheDocument();
    expect(document.body).not.toHaveTextContent('Coverage status');
    localStorage.removeItem('history-locale');
  });

  it('makes URL-backed person evidence keyboard-navigable', () => {
    const detail = getPersonDetail('li-shimin')!;
    render(<LocaleProvider><PersonDetail
      person={person}
      detail={{ ...detail, sourceIds: ['xian-local-chronicle-western-han-mausoleums'] }}
      year={620}
      claims={[]}
    /></LocaleProvider>);

    const sourceLink = screen.getByRole('link', { name: '西安市志·西汉帝陵条目' });
    expect(sourceLink).toHaveAttribute('href', 'https://dfz.shaanxi.gov.cn/zslm/fzzlk/xbsxsxz/xbsxz/xas/201803/P020250630548327427771.pdf');
    expect(sourceLink).toHaveAttribute('target', '_blank');
  });
});
