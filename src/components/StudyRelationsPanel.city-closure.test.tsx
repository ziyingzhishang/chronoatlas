import { useState } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { capitalHistory } from '../data/capital-history';
import { claims } from '../data/claims';
import { events } from '../data/events';
import { heritageAssets } from '../data/heritage';
import { people } from '../data/people';
import { places } from '../data/places';
import { polities } from '../data/polities';
import { buildCityHistoryTimeline } from '../domain/city-timeline';
import { type DetailEntity } from '../domain/detail-entity';
import { buildCityStudyView, type CityStudyView } from '../domain/study-view';
import { EntityDrawer } from './EntityDrawer';
import { StudyRelationsPanel } from './StudyRelationsPanel';

const data = { polities, places, people, heritage: heritageAssets, events, claims, capitalTerms: capitalHistory };
const currentYear = 2026;
const cityCases = [
  ['长安', 'changan'],
  ['洛阳', 'luoyang'],
  ['建康', 'jiankang'],
  ['成都', 'chengdu'],
  ['开封', 'kaifeng'],
] as const;

function CityStudyHarness({ view }: { view: CityStudyView }) {
  const [selected, setSelected] = useState<DetailEntity>();
  return <>
    <StudyRelationsPanel view={view} onOpenEntity={setSelected} />
    {selected && <EntityDrawer title="实体详情" entityType={selected.type} onClose={() => setSelected(undefined)}>
      <p data-testid="opened-entity">{selected.type}:{selected.id}</p>
    </EntityDrawer>}
  </>;
}

describe('第四十四轮 B：城市视角闭环验收', () => {
  it.each(cityCases)('%s同时保留政权、人物、事件、遗产四层城市历史', (cityName, cityId) => {
    const view = buildCityStudyView(cityId, currentYear, data);
    const timeline = buildCityHistoryTimeline(cityId, data);

    expect(view, cityName).toBeDefined();
    expect(timeline.missingData, cityName).toEqual([]);
    expect(new Set(timeline.nodes.map((node) => node.type)), cityName).toEqual(new Set(['place', 'polity', 'person', 'event', 'heritage']));
    expect(view!.polities.length, cityName).toBeGreaterThan(0);
    expect(view!.people.length, cityName).toBeGreaterThan(0);
    expect(view!.events.length, cityName).toBeGreaterThan(0);
    expect(view!.heritage.length, cityName).toBeGreaterThan(0);
  });

  it.each(cityCases)('%s的城市时间轴保留时间与来源证据', (cityName, cityId) => {
    const view = buildCityStudyView(cityId, currentYear, data)!;
    const timeline = buildCityHistoryTimeline(cityId, data);
    const years = timeline.nodes.map((node) => node.year).filter((year): year is number => year !== undefined);
    const claimById = new Map(view.claims.map((claim) => [claim.id, claim]));

    expect(years, cityName).toEqual([...years].sort((left, right) => left - right));
    for (const entity of [...view.polities, ...view.people, ...view.events, ...view.heritage]) {
      expect(entity.sourceIds.length, `${cityName}:${entity.id}`).toBeGreaterThan(0);
    }
    for (const relation of view.relations ?? []) {
      const claim = claimById.get(relation.claimId);
      expect(claim, `${cityName}:${relation.claimId}`).toBeDefined();
      expect(relation.sourceIds).toEqual(claim!.sourceIds);
      expect(relation.validFrom).toBe(claim!.validFrom);
      expect(relation.validTo).toBe(claim!.validTo);
    }
  });

  it.each(cityCases)('%s的时间轴实体均可打开详情抽屉且保持实体类型与 ID', async (cityName, cityId) => {
    const user = userEvent.setup();
    const view = buildCityStudyView(cityId, currentYear, data)!;
    const timeline = buildCityHistoryTimeline(cityId, data);
    render(<CityStudyHarness view={view} />);

    for (const type of ['polity', 'person', 'event', 'heritage'] as const) {
      const node = timeline.nodes.find((item) => item.type === type);
      expect(node, `${cityName}:${type}`).toBeDefined();
      const nodeButton = document.querySelector(`li[data-entity-type="${type}"] button`) as HTMLElement | null;
      expect(nodeButton, `${cityName}:${type} timeline button`).not.toBeNull();
      await user.click(nodeButton!);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByTestId('opened-entity')).toHaveTextContent(`${type}:${node!.entity.id}`);
      await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: '关闭详情' }));
    }

    const timelineSection = screen.getByRole('region', { name: '城市历史时间轴' });
    expect(within(timelineSection).getAllByRole('button').length, cityName).toBeGreaterThanOrEqual(4);
  });
});
