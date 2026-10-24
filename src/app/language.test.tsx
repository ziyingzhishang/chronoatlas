import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, test } from 'vitest';
import { App } from './App';
import { mapInstances } from '../test/maplibre-mock';

afterEach(()=>localStorage.clear());
test('all supported languages change labels while retaining year, renderer and camera',async()=>{
  render(<App/>);
  const map=mapInstances.at(-1)!;
  act(()=>map.emit('style.load'));
  await userEvent.click(screen.getByTitle('地图图层'));
  await userEvent.click(screen.getByRole('button',{name:'卫星影像'}));
  await userEvent.click(screen.getByRole('checkbox',{name:'历史地名'}));
  map.queryRenderedFeatures.mockReturnValue([{layer:{id:'boundary-fill'},properties:{entityId:'tang'}}] as any);
  act(()=>map.emit('click',{point:{x:1,y:1}}));
  await userEvent.click(screen.getByRole('button',{name:'更多'}));
  const selector=screen.getByRole('combobox',{name:'显示语言'});
  for(const [locale,tool,mapLabel,mapRegion] of [
    ['zh-HK','更多','唐','歷史地圖'],
    ['zh-TW','更多','唐','歷史地圖'],
    ['en','More','Tang','Historical map'],
    ['zh-CN','更多','唐','历史地图'],
  ] as const){
    await userEvent.selectOptions(selector,locale);
    expect(screen.getByRole('button',{name:tool})).toBeInTheDocument();
    expect(document.documentElement.lang).toBe(locale);
    expect(screen.getByRole('region',{name:mapRegion})).toHaveAttribute('data-year','800');
    await waitFor(()=>expect(map.getSource('polityLabels')!.setData.mock.lastCall![0].features.some((f:GeoJSON.Feature)=>f.properties?.name===mapLabel)).toBe(true));
  }
  await userEvent.click(screen.getByTitle('地图图层'));
  expect(screen.getByRole('button',{name:'卫星影像'})).toHaveAttribute('aria-pressed','true');
  expect(screen.getByRole('checkbox',{name:'历史地名'})).not.toBeChecked();
  map.queryRenderedFeatures.mockReturnValue([{layer:{id:'boundary-fill'},properties:{entityId:'tang'}}] as any);
  act(()=>map.emit('click',{point:{x:1,y:1}}));
  expect(screen.getByRole('heading',{name:'唐'})).toBeInTheDocument();
  expect(mapInstances.at(-1)).toBe(map);
  expect(map.flyTo).not.toHaveBeenCalled();
  expect(map.remove).not.toHaveBeenCalled();
},30000);
