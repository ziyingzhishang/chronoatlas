import type { LocalizedNameMeta, Polity } from '../domain/types';
import { chineseText } from './chinese';
import type { Locale } from './locale';

const polityTokens: Record<string, string> = {
  han:'Han', zhao:'Zhao', wei:'Wei', chu:'Chu', yan:'Yan', qi:'Qi', qin:'Qin', xin:'Xin',
  jin:'Jin', shu:'Shu', wu:'Wu', cheng:'Cheng', xia:'Xia', liang:'Liang', song:'Song',
  sui:'Sui', tang:'Tang', zhou:'Zhou', ming:'Ming', yuan:'Yuan', qing:'Qing',
  former:'Former', later:'Later', northern:'Northern', southern:'Southern', eastern:'Eastern', western:'Western',
  west:'Western', warring:'Warring State', three:'Three Kingdoms', state:'State', early:'(approx.)',
  xiongnu:'Xiongnu', goguryeo:'Goguryeo', silla:'Silla', tuyuhun:'Tuyuhun', turkic:'Turkic Khaganate',
  tibetan:'Tibetan', empire:'Empire', nanzhao:'Nanzhao', khitan:'Liao', gengshi:'Gengshi',
  jurchen:'Jurchen Jin', dali:'Dali', mongol:'Mongol Empire', republic:'Republic of China', prc:"People's Republic of China",
  ten:'Ten Kingdoms', wuyue:'Wuyue', min:'Min', jingnan:'Jingnan',
};

const polityNames: Record<string, string> = {
  wei_three:'Cao Wei', shu_three:'Shu Han', wu_three:'Eastern Wu', song_southern:'Liu Song',
  khitan:'Liao', xia_early:'Xia (approximate dates)', zhou_eastern:'Eastern Zhou royal house',
  wu_zhou:'Wu Zhou', song_south:'Southern Song', western_xia:'Western Xia', jin_jurchen:'Jurchen Jin',
  later_jin:'Later Jin', ming_southern:'Southern Ming', wu_ten:'Wu', chu_ten:'Chu',
  southern_han:'Southern Han', northern_han:'Northern Han', southern_tang:'Southern Tang',
  former_shu:'Former Shu', later_shu:'Later Shu',
};

function englishPolityName(polity: Polity): string {
  if (polity.originalName && !/[\u3400-\u9fff]/.test(polity.originalName)) return polity.originalName;
  if (polityNames[polity.id]) return polityNames[polity.id];
  return polity.id.split('_').map(token => polityTokens[token] ?? token.replace(/^./, letter => letter.toUpperCase())).join(' ');
}

export function resolvePolityName(polity: Polity, locale: Locale): { name: string; meta: LocalizedNameMeta } {
  const isSourceOriginal = polity.region === 'world'
    && polity.name === polity.originalName
    && !/[\u3400-\u9fff]/.test(polity.name);

  if (locale === 'en') {
    const name = englishPolityName(polity);
    return { name, meta: { status: isSourceOriginal ? 'source-original' : 'verified', mapLabel: name, sourceName: polity.originalName } };
  }

  if (isSourceOriginal) {
    const sourceName = polity.originalName ?? polity.name;
    const pending = chineseText('中文译名待核验', locale);
    return {
      name: `${chineseText('原名：', locale)}${sourceName}（${pending}）`,
      meta: { status: 'source-original', mapLabel: `${sourceName}〔${chineseText('译名待核验', locale)}〕`, sourceName },
    };
  }

  const name = chineseText(polity.name, locale);
  return { name, meta: { status: 'verified', mapLabel: name, sourceName: polity.originalName } };
}
