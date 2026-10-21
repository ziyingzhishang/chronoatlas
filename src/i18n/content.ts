import type { HistoricalEvent, HistoricalState, Place, Polity } from '../domain/types';
import { chineseText } from './chinese';
import { eventEnglish } from './content-events';
import { resolvePolityName } from './entity-label';
import type { Locale } from './locale';
import { translateText } from './text';

const originalSearch = new WeakMap<object, string>();

const placeEnglish: Record<string, Pick<Place, 'historicalName'|'modernName'|'modernAdministrativeUnit'|'notes'|'aliases'>> = {
  erlitou:{historicalName:'Erlitou',aliases:['Zhenxun (scholarly interpretation)'],modernName:'Near Erlitou village',modernAdministrativeUnit:'Yanshi District, Luoyang, Henan',notes:'Approximate cultural-core reference; not a Xia state border.'},
  wan_nanyang:{historicalName:'Wan',aliases:['Wancheng'],modernName:'Urban Nanyang',modernAdministrativeUnit:'Nanyang, Henan',notes:'Approximate location of an early Gengshi political centre.'},
  xianyang:{historicalName:'Xianyang',aliases:['Xianyang Palace'],modernName:'Xianyang',modernAdministrativeUnit:'Shaanxi',notes:'Capital of Qin.'},
  changan:{historicalName:"Chang'an",aliases:['Western Capital'],modernName:"Xi'an",modernAdministrativeUnit:'Shaanxi',notes:'An important capital of Han, Sui and Tang.'},
  luoyang:{historicalName:'Luoyang',aliases:['Luoyang (historic variant)'],modernName:'Luoyang',modernAdministrativeUnit:'Henan',notes:'Capital of Eastern Han, Wei, Jin and several northern regimes.'},
  ye:{historicalName:'Ye',aliases:['Ye City'],modernName:'Linzhang area',modernAdministrativeUnit:'Hebei',notes:'An important political centre under Cao Wei, the Sixteen Kingdoms and Northern Dynasties.'},
  jiankang:{historicalName:'Jiankang',aliases:['Jianye','Jinling'],modernName:'Nanjing',modernAdministrativeUnit:'Jiangsu',notes:'Capital of Eastern Wu, Eastern Jin and the Southern Dynasties.'},
  chengdu:{historicalName:'Chengdu',aliases:[],modernName:'Chengdu',modernAdministrativeUnit:'Sichuan',notes:'Capital of Shu Han.'},
  xiangyang:{historicalName:'Xiangyang',aliases:[],modernName:'Xiangyang',modernAdministrativeUnit:'Hubei',notes:'An important military and transport node in the Han River basin.'},
  chibi:{historicalName:'Red Cliffs',aliases:[],modernName:'Chibi area',modernAdministrativeUnit:'Hubei',notes:'The region traditionally associated with the Battle of Red Cliffs.'},
  hefei:{historicalName:'Hefei',aliases:[],modernName:'Hefei',modernAdministrativeUnit:'Anhui',notes:'An important military centre between the Yangtze and Huai rivers.'},
  youzhou:{historicalName:'Youzhou',aliases:[],modernName:'Beijing and vicinity',modernAdministrativeUnit:'Beijing area',notes:'An important historical region on the northern frontier.'},
  liangzhou:{historicalName:'Liangzhou',aliases:[],modernName:'Wuwei and the Hexi Corridor',modernAdministrativeUnit:'Gansu',notes:'An important region of the Hexi Corridor.'},
  yangzhou:{historicalName:'Yangzhou',aliases:[],modernName:'Yangzhou area',modernAdministrativeUnit:'Jiangsu',notes:'A transport hub between the Huai and lower Yangtze regions.'},
  kaifeng:{historicalName:'Kaifeng',aliases:['Daliang','Bianzhou'],modernName:'Kaifeng',modernAdministrativeUnit:'Henan',notes:'Capital of several regimes during the Five Dynasties.'},
};

function remember<T extends object>(localized:T, original:object, extra=''):T {
  originalSearch.set(localized, `${Object.values(original).filter(value=>typeof value==='string').join(' ')} ${extra}`);
  return localized;
}

function localizePolity(polity:Polity,locale:Locale):Polity {
  const unknownWorld=polity.region==='world' && polity.name===polity.originalName && !/[\u3400-\u9fff]/.test(polity.name);
  const resolved=resolvePolityName(polity,locale);
  let localized:Polity;
  if(locale==='en') {
    localized={...polity,name:resolved.name,localizedName:resolved.meta,description:unknownWorld
      ? 'Source interval model. Dates, control and territorial geometry must be interpreted with the cited source.'
      : 'Historical polity in the project catalog. Dates, control and territorial geometry must be interpreted with the cited sources.'};
  } else {
    const note=unknownWorld ? ' 中文译名待核验。' : '';
    localized={...polity,name:resolved.name,localizedName:resolved.meta,description:chineseText(`${polity.description}${note}`,locale)};
  }
  return remember(localized,polity,polity.originalName ?? '');
}

function localizePlace(place:Place,locale:Locale):Place {
  const localized=locale==='en' ? {...place,...(placeEnglish[place.id] ?? {
    historicalName:place.id.replaceAll('_',' '), aliases:[], modernName:'Reference location',
    modernAdministrativeUnit:'Administrative reference pending', notes:'Historical place reference.',
  })} : {
    ...place,
    historicalName:chineseText(place.historicalName,locale), aliases:place.aliases.map(alias=>chineseText(alias,locale)),
    modernName:place.modernName&&chineseText(place.modernName,locale),
    modernAdministrativeUnit:place.modernAdministrativeUnit&&chineseText(place.modernAdministrativeUnit,locale),
    notes:place.notes&&chineseText(place.notes,locale),
  };
  return remember(localized,place,place.aliases.join(' '));
}

export function localizeEvents(items:HistoricalEvent[],locale:Locale):HistoricalEvent[] {
  return items.map(item=>{
    let localized:HistoricalEvent;
    if(locale==='en') {
      const copy=eventEnglish[item.id];
      localized=copy ? {...item,title:copy.title,summary:copy.summary,background:copy.background,process:copy.process,
        impact:copy.impact,mapNote:copy.mapNote,references:item.references?.map((reference,index)=>({...reference,detail:copy.details[index] ?? 'Reference retained from the source catalog.'}))}
        : {...item,title:item.id.replaceAll('-',' '),summary:'Historical event in the project catalog.',background:'Background translation pending.',process:'Event account translation pending.',impact:'Impact translation pending.',mapNote:'Map interpretation translation pending.',references:item.references?.map(reference=>({...reference,detail:'Reference retained from the source catalog.'}))};
    } else {
      localized={...item,title:chineseText(item.title,locale),summary:chineseText(item.summary,locale),
        background:item.background&&chineseText(item.background,locale),process:item.process&&chineseText(item.process,locale),
        impact:item.impact&&chineseText(item.impact,locale),mapNote:item.mapNote&&chineseText(item.mapNote,locale),
        references:item.references?.map(reference=>({...reference,detail:reference.detail&&chineseText(reference.detail,locale)}))};
    }
    return remember(localized,item);
  });
}

export function localizeState(state:HistoricalState,locale:Locale):HistoricalState {
  return {...state,displayLabel:translateText(state.displayLabel,locale),activePolities:state.activePolities.map(item=>localizePolity(item,locale)),
    places:state.places.map(item=>localizePlace(item,locale)),events:localizeEvents(state.events,locale)};
}

export function contentSearchText(item:HistoricalEvent|Place|Polity):string {
  return `${Object.values(item).filter(value=>typeof value==='string').join(' ')} ${originalSearch.get(item) ?? ''}`.toLocaleLowerCase();
}
