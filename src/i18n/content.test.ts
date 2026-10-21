import { describe, expect, it } from 'vitest';
import { events } from '../data/events';
import { polities } from '../data/polities';
import { places } from '../data/places';
import type { HistoricalState, Polity } from '../domain/types';
import { localizeEvents, localizeState, contentSearchText } from './content';

const state: HistoricalState = { year: -221, displayLabel: '公元前221年', activePolities: polities, places, events,
  coverage: { mode: 'interval', missingPolityIds: ['xia_early'] }, boundaries: [{ id: 'b', polityId: 'qin', validFrom: -221, validTo: -206, snapshotYear: -221,
    sourceName: '原始来源', sourceUrl: 'https://example.org', vertexCount: 1, geometry: { type: 'Point', coordinates: [108, 34] }, controlType: 'unspecified', confidence: 'low', sourceIds: ['source'],
    evidence: { evidenceLevel:'D', derivation:'control-centers', reviewStatus:'source-checked', citations:[{title:'测试来源',urlOrCitation:'https://example.org'}], uncertaintyNote:'测试用控制中心。' } }] };

describe('historical content localization', () => {
  it('translates every English event narrative without changing evidence or filters', () => {
    const result = localizeEvents(events, 'en');
    expect(result).toHaveLength(26);
    result.forEach((item, index) => {
      const original = events[index];
      for (const key of ['title','summary','background','process','impact','mapNote'] as const) {
        expect(item[key], `${item.id}.${key}`).toBeTruthy();
        expect(item[key], `${item.id}.${key}`).not.toMatch(/[\u3400-\u9fff]/);
      }
      const {title,summary,background,process,impact,mapNote,references,...stable} = item;
      const {title:a,summary:b,background:c,process:d,impact:e,mapNote:f,references:refs,...expected} = original;
      expect(stable).toEqual(expected);
      references?.forEach((ref, n) => {
        expect(ref.title).toBe(refs![n].title);
        expect(ref.url).toBe(refs![n].url);
        expect(ref.detail).not.toMatch(/[\u3400-\u9fff]/);
      });
    });
    expect(events.find(e => e.id === 'qin-unification')!.title).toBe('秦统一六国');
  });
  it('localizes all local polities and places while retaining identity, geometry and aliases', () => {
    const result = localizeState(state, 'en');
    expect(result.displayLabel).toBe('221 BCE');
    expect(result.coverage).toBe(state.coverage);
    expect(result.boundaries[0].geometry).toBe(state.boundaries[0].geometry);
    expect(result.boundaries[0]).toEqual(state.boundaries[0]);
    result.activePolities.forEach((p, i) => {
      expect(p.name + p.description).not.toMatch(/[\u3400-\u9fff]/);
      expect(p.id).toBe(polities[i].id);
      expect(p.sourceIds).toBe(polities[i].sourceIds);
    });
    result.places.forEach((p, i) => {
      expect([p.historicalName,p.modernName,p.modernAdministrativeUnit,p.notes].join('')).not.toMatch(/[\u3400-\u9fff]/);
      expect(p.longitude).toBe(places[i].longitude);
      expect(p.latitude).toBe(places[i].latitude);
      expect(p.aliases.join('')).not.toMatch(/[\u3400-\u9fff]/);
      places[i].aliases.forEach(alias=>expect(contentSearchText(p)).toContain(alias));
    });
    expect(contentSearchText(result.places.find(p => p.id === 'changan')!)).toContain('长安');
    expect(contentSearchText(result.activePolities.find(p => p.id === 'han_western')!)).toContain('西汉');
  });
  it('converts Traditional narratives but preserves original reference titles and stable categories', () => {
    for (const locale of ['zh-HK','zh-TW'] as const) {
      const result = localizeEvents(events, locale);
      expect(result.find(e => e.id === 'qin-unification')!.title).toBe('秦統一六國');
      expect(result.find(e => e.id === 'columbus-caribbean')!.process).toContain('1492年');
      result.forEach((e,i) => {
        expect(e.category).toBe(events[i].category);
        expect(e.references?.map(r => r.title)).toEqual(events[i].references?.map(r => r.title));
      });
    }
  });
  it('labels unfamiliar world names instead of exposing a bare source name in Chinese', () => {
    const world: Polity = {...polities[0], id:'world-unknown', region:'world', name:'Unmapped Realm', originalName:'Unmapped Realm', description:'来源时段模型。'};
    for (const [locale, name, note] of [
      ['zh-CN','原名：Unmapped Realm（中文译名待核验）','中文译名待核验'],
      ['zh-HK','原名：Unmapped Realm（中文譯名待核驗）','中文譯名待核驗'],
      ['zh-TW','原名：Unmapped Realm（中文譯名待核驗）','中文譯名待核驗'],
      ['en','Unmapped Realm','Source interval model'],
    ] as const) {
      const result = localizeState({...state,activePolities:[world]},locale).activePolities[0];
      expect(result.name).toBe(name);
      expect(result.description).toContain(note);
      if(locale==='en') expect(result.description).not.toContain('Chinese translation');
      expect(result.originalName).toBe(world.originalName);
    }
    const known = {...world,id:'world-roman',name:'罗马帝国',originalName:'Roman Empire'};
    expect(localizeState({...state,activePolities:[known]},'en').activePolities[0].name).toBe('Roman Empire');
    expect(localizeState({...state,activePolities:[known]},'zh-TW').activePolities[0].description).not.toContain('待核驗');
  });
  it('retains original event titles for searches after localization', () => {
    expect(contentSearchText(localizeEvents(events,'en').find(e=>e.id==='red-cliffs')!)).toContain('赤壁之战');
  });
});
