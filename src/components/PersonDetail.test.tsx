import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { HistoricalClaim, HistoricalEvent, Person } from '../domain/types';
import { getPersonDetail } from '../data/person-details';
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
    expect(screen.getByText(/王莽/)).toBeInTheDocument();
    expect(screen.getByText('来源与考据')).toBeInTheDocument();
    expect(screen.getAllByText(/不确定性/).length).toBeGreaterThan(0);
  });

  it('shows an explicit empty state when detail data is unavailable', () => {
    render(<PersonDetail person={person} year={620} claims={[]} />);

    expect(screen.getByText('暂无已收录人物详情')).toBeInTheDocument();
  });
});
