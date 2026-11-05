import type { Polity } from '../domain/types';
import type { Locale } from '../i18n/locale';

export interface PresentDistance {
  relation: 'past' | 'present' | 'future';
  years: number;
}

function historicalOrdinal(year: number): number {
  if (!Number.isInteger(year) || year === 0) {
    throw new RangeError(`历史年份必须是非零整数，不能使用公元0年：${year}`);
  }
  return year < 0 ? year + 1 : year;
}

export function yearsFromPresent(historicalYear: number, presentYear: number): PresentDistance {
  const difference = historicalOrdinal(presentYear) - historicalOrdinal(historicalYear);
  if (difference === 0) return { relation: 'present', years: 0 };
  return difference > 0
    ? { relation: 'past', years: difference }
    : { relation: 'future', years: Math.abs(difference) };
}

export function formatPresentDistance(distance: PresentDistance, locale: Locale): string {
  if (distance.relation === 'present') return locale === 'en' ? 'This year' : '今年';
  const count = locale === 'en' ? distance.years.toLocaleString('en-US') : String(distance.years);
  if (locale === 'en') {
    return distance.relation === 'past' ? `${count} years ago` : `${count} years from now`;
  }
  return distance.relation === 'past' ? `距今${count}年` : `距今尚有${count}年`;
}

export function primaryPolityName(polities: Polity[]): string | undefined {
  return polities.find((polity) => polity.region !== 'world' && polity.name.trim())?.name;
}

function appendCoexistingPolities(label: string, ids: Set<string>, excludedIds: string[] = []): string {
  const excluded = new Set(excludedIds);
  const names = [
    ['goguryeo', '高句丽'],
    ['silla', '新罗'],
    ['tuyuhun', '吐谷浑'],
    ['nanzhao', '南诏'],
  ] as const;
  const coexisting = names.filter(([id]) => ids.has(id) && !excluded.has(id)).map(([, name]) => name);
  return coexisting.length ? `${label}；${coexisting.join('、')}并存` : label;
}

function appendFiveDynastiesPolities(label: string, ids: Set<string>, year: number, excludedIds: string[] = []): string {
  const excluded = new Set(excludedIds);
  const names = [
    ['khitan', '辽'],
    ['northern_han', '北汉'],
    ['southern_tang', '南唐'],
    ['wuyue', '吴越'],
    ['southern_han', '南汉'],
    ['jingnan', '荆南'],
    ['later_shu', '后蜀'],
    ['dali', '大理'],
  ] as const;
  const coexisting = names.filter(([id]) => ids.has(id) && !excluded.has(id)).map(([, name]) => name);
  const coexistenceLabel = coexisting.length ? `${label}；${coexisting.join('、')}并存` : label;
  return year === 951 && ids.has('chu_ten') ? `${coexistenceLabel}；马楚终止` : coexistenceLabel;
}

function basePolityDisplayName(polities: Polity[], year: number): string | undefined {
  const ids = new Set(polities.map((polity) => polity.id));
  if ((year === 2025 || year === 2026) && ids.has('prc')) {
    return '中华人民共和国；显示2024年C级近邻参考面；非本年疆界核定';
  }
  if (year === 1949 && ids.has('republic') && ids.has('prc')) {
    return '中华民国—中华人民共和国交替；10月1日北京建政事件点；年内接收未完成；疆域未定';
  }
  if (year >= 1916 && year <= 1929 && ids.has('republic')) {
    if (year === 1916) return '北京政府中心；袁世凯去世、黎元洪继任；地方军政分裂；疆域未定';
    if (year === 1917) return '北京政府—广州护法军政府并立；北京为中央中心；疆域未定';
    if (year === 1918) return '北京政府、广州南方政权并存；外交承认不等于全国控制；疆域未定';
    if (year === 1919) return '北京政府以北京为中心；南方反对派与区域军政势力并存；疆域未定';
    if (year === 1920) return '北京政府中心；直皖战争改变北洋权力；南方与地方势力并存；疆域未定';
    if (year === 1921) return '北京政府—广州非常大总统政权并立；北京、广州为政治中心；疆域未定';
    if (year === 1922) return '北京政府—南方政权并立；直奉等军系掌握区域军力；战事不作疆界';
    if (year === 1923) return '北京政府—广州南方政权并存；广州大元帅大本营；疆域未定';
    if (year === 1924) return '北京政府年内权力更迭；北京政变、段祺瑞执政；各方边界未定';
    if (year === 1925) return '北京、广州政治中心并立；地方军阀掌握区域行政；疆域未定';
    if (year === 1926) return '北京政府与广州国民政府并存；北伐启动，战线不作疆界';
    if (year === 1927) return '北京、武汉、南京国民政府阶段并存、争夺中央代表权；疆域未定';
    if (year === 1928) return '南京国民政府6月接收北平、12月东北易帜；形式统一不等于全年直接控制；疆域未定';
    return '南京为中央政治中心；地方实力派仍掌握军政；全国直辖疆域未定';
  }
  if (year === 1227 && ids.has('western_xia') && ids.has('mongol') && ids.has('song_south')
    && ids.has('jin_jurchen') && ids.has('dali')) {
    return '西夏终止；蒙古围攻中兴府；终局事件点不作疆界；南宋、金、大理并存';
  }
  if (ids.has('zhou_eastern') && year >= -770 && year <= -751) {
    if (ids.has('qin_state')) {
      if (year === -770) return '东周迁洛（传统约年）；秦襄公列侯；洛邑、西犬丘中心参照；王畿未定';
      if (year <= -763) return '东周、秦国并存；洛邑、西犬丘中心参照；列国并立；王畿未定';
      return '东周、秦国并存；洛邑、汧渭之会中心参照；列国并立；王畿未定';
    }
    return year === -770
      ? '东周迁洛（传统约年）；洛邑王室中心参照；王畿未定'
      : '东周王室洛邑中心；列国并立；王畿未定';
  }
  if (ids.has('zhou_western') && year >= -1046 && year <= -1001) {
    if (year === -1046) return '西周建政约年；克商日期有异说；丰镐王室中心参照；疆域未定';
    if (year === -1045) return '西周早期；克商纪年存在分歧；丰镐王室中心参照；疆域未定';
    if (year === -1044) return '有研究定为克商年；项目采用前1046约年；丰镐王室中心参照；疆域未定';
    if (year >= -1043 && year <= -1042) return '周武王卒；周公摄政与东国秩序动荡；丰镐王室中心参照；疆域未定';
    if (year >= -1041 && year <= -1036) return '成王时期东征与秩序重建；丰镐王室中心参照；疆域未定';
    if (year >= -1035 && year <= -1021) return '成王后期；分封秩序形成；丰镐王室中心参照；疆域未定';
    return '康王早期；纪年仍有争议；丰镐王室中心参照；疆域未定';
  }
  if (ids.has('xia_early')) {
    return year < -1750
      ? '夏（传统纪年）—现有证据不支持空间表达'
      : '夏（传统纪年）—二里头文化核心参照点；不代表夏疆界';
  }
  if (ids.has('former_liang') && year >= 314 && year <= 323) {
    if (year === 314) return '张轨卒；张寔承摄凉州；姑臧为中心；疆域未定';
    if (year === 315) return '张寔奉晋命治理凉州；姑臧为中心；疆域未定';
    if (year === 316) return '西晋终止；张氏据守河西；姑臧为中心；疆域未定';
    if (year === 317) return '东晋建立；张氏仍以姑臧为中心治理河西；疆域未定';
    if (year === 318) return '张氏奉晋统治河西；姑臧为中心；疆域未定';
    if (year === 319) return '前凉、后赵、前赵、东晋并存；姑臧、襄国为中心；疆域未定';
    if (year === 320) return '张寔遇害、张茂接掌；前凉、后赵、前赵、东晋并存；姑臧、襄国为中心；疆域未定';
    if (year === 321) return '张茂继续治理凉州；前凉、后赵、前赵、东晋并存；姑臧、襄国为中心；疆域未定';
    if (year === 322) return '前凉置秦州、向陇西南安扩展；后赵、前赵、东晋并存；姑臧、襄国为中心；郡界未定';
    return '前赵西击前凉、张茂称藩；前凉、后赵、东晋并存；疆域未定';
  }
  if (year === 6 && ids.has('han_western')) {
    return '王莽居摄；刘崇攻宛未克（未占领）；西羌攻西海郡；长安为中央参照；疆域未定';
  }
  if (year === 7 && ids.has('han_western')) {
    return '翟义于东郡、赵明霍鸿于槐里起兵；长安为中央政治中心；响应范围不等于占领区；疆域未定';
  }
  if (year === 8 && ids.has('han_western')) {
    return '二月平定赵明、霍鸿；岁末王莽即真、定国号新并改正朔；长安为政权转换前中心；疆域未定';
  }
  if (year >= 26 && year <= 29 && ids.has('han_eastern')) {
    if (year === 27) return '赤眉降汉；刘永、彭宠、张步等势力仍存；洛阳为中央中心；疆域未定；匈奴、高句丽、新罗并存';
    if (year === 28) return '东汉以洛阳为中央政治中心；地方征讨、政权整合继续；疆域未定；匈奴、高句丽、新罗并存';
    if (year === 29) return '东汉洛阳中心；军政整合逐步恢复；疆域未定；匈奴、高句丽、新罗并存';
    return '东汉以洛阳为中央政治中心；恢复制度并整合地方；疆域未定；匈奴、高句丽、新罗并存';
  }
  if (year >= 319 && year <= 336 && ids.has('later_zhao')) {
    if (year === 319) return '后赵建政；前赵、东晋并存；襄国为中心';
    if (year === 320) return '后赵—晋及地方势力交战；前赵、东晋并存；襄国为中心';
    if (year === 321) return '后赵延续；前赵、东晋并存；襄国为中心';
    if (year === 322) return '后赵—前赵、东晋并存；襄国为中心';
    if (year === 323) return '后赵接纳徐、兖坞堡；前赵、东晋并存；襄国仍为中枢';
    if (year === 324) return '后赵将领活动于下邳、彭城；与前赵交战；东晋并存';
    if (year === 325) return '后赵延续；前赵、东晋并存；襄国为中心';
    if (year === 326) return '后赵建邺宫、镇邺；前赵、东晋并存；襄国仍为中枢';
    if (year === 327) return '后赵延续；前赵、东晋并存；襄国为中心';
    if (year === 328) return '后赵—前赵战局转折；东晋并存；洛阳、关中方向';
    if (year === 329) return '后赵灭前赵；东晋并存；地方接管分期';
    if (year === 330) return '后赵称帝；东晋并存；襄国为中心';
    if (year === 331) return '后赵延续；东晋并存；襄国为中心';
    if (year === 332) return '后赵继承与权势转折；东晋并存；襄国为中心';
    if (year === 333) return '石勒死—石弘继位；石虎掌权；东晋并存';
    if (year === 334) return '石虎废石弘；后赵权力转移；东晋并存';
    if (year === 335) return '后赵迁都；襄国—邺年内转换；东晋并存';
    if (year === 336) return '后赵都邺；营建持续；东晋并存';
  }
  if (year === 351 && ids.has('former_qin') && ids.has('jin_eastern')) {
    return '前秦称天王；长安为政治中心；五丈原为区域战事参照；疆域未定；东晋、新罗并存';
  }
  if (year === 352 && ids.has('former_qin') && ids.has('jin_eastern') && ids.has('former_yan')) {
    return '前秦称帝；长安为政治中心；石安沿革记载有异说；疆域未定；前燕、东晋、新罗并存';
  }
  if (year >= 398 && year <= 401 && ids.has('southern_yan') && ids.has('jin_eastern')
    && ids.has('later_yan') && ids.has('later_qin') && ids.has('wei_northern')
    && ids.has('northern_liang') && ids.has('later_liang') && ids.has('southern_liang')) {
    if (year === 398 && ids.has('western_qin')) return '南燕建政于滑台；东晋、后燕、后秦、北魏、北凉、南凉、后凉、西秦并存';
    if (year === 399 && ids.has('western_qin')) return '南燕迁往广固；东晋、后燕、后秦、北魏、北凉、南凉、后凉、西秦并存';
    if (year === 400 && ids.has('western_qin') && ids.has('western_liang')) {
      return '南燕在广固称帝；东晋、后燕、后秦、北魏、北凉、南凉、后凉、西秦、西凉并存';
    }
    if (year === 401 && !ids.has('western_qin') && ids.has('western_liang')) {
      return '南燕以广固为中心；东晋、后燕、后秦、北魏、北凉、南凉、后凉、西凉并存';
    }
  }
  if (year === 394 && ids.has('former_qin') && ids.has('later_qin') && ids.has('western_qin')) {
    return ids.has('western_yan')
      ? '西燕终止；台壁败、长子陷落；前秦亦年内终止'
      : '前秦终止；苻登七月被擒杀、苻崇十月败亡';
  }
  if (year === 410 && ids.has('southern_yan') && ids.has('jin_eastern') && ids.has('xia')
    && ids.has('northern_yan') && ids.has('later_qin') && ids.has('wei_northern')
    && ids.has('northern_liang') && ids.has('southern_liang')
    && ids.has('western_qin') && ids.has('western_liang')) {
    return '南燕二月终止；广固为覆亡前中心；疆域未定；西凉以酒泉为中心；东晋、夏、北燕、后秦、北魏、北凉、南凉、西秦并存';
  }
  if (year >= 402 && year <= 406 && ids.has('western_liang')) {
    const center = year <= 404 ? '敦煌' : '酒泉';
    const coexisting = [
      ['jin_eastern', '东晋'],
      ['later_yan', '后燕'],
      ['later_qin', '后秦'],
      ['wei_northern', '北魏'],
      ['northern_liang', '北凉'],
      ['southern_liang', '南凉'],
      ['southern_yan', '南燕'],
      ['later_liang', '后凉'],
      ['goguryeo', '高句丽'],
      ['silla', '新罗'],
      ['tuyuhun', '吐谷浑'],
    ] as const;
    const others = coexisting.filter(([id]) => ids.has(id)).map(([, name]) => name);
    return `西凉以${center}为政治中心；疆域未定；${others.join('、')}并存`;
  }
  if (year >= 411 && year <= 413 && ids.has('western_liang')) {
    return '西凉以酒泉为中心；疆域未定；东晋、夏、北燕、后秦、北魏、北凉、西秦并存';
  }
  if (year === 414 && ids.has('southern_liang') && ids.has('western_qin')
    && ids.has('jin_eastern') && ids.has('xia') && ids.has('northern_yan')
    && ids.has('later_qin') && ids.has('wei_northern') && ids.has('northern_liang')
    && ids.has('western_liang')) {
    return '南凉年内终止；西秦攻取乐都；乐都为覆亡前中心；疆域未定；西凉以酒泉为中心；东晋、夏、北燕、后秦、北魏、北凉并存';
  }
  if (year === 420 && ids.has('jin_eastern') && ids.has('song_southern') && ids.has('wei_northern')) {
    return '东晋—刘宋交替；六月刘裕受禅后以建康为中心；东晋、刘宋疆域未定；西凉年内酒泉失守、李恂返敦煌，地图留空；北魏、夏、北凉、西秦、北燕、新罗并存';
  }
  if (year >= 421 && year <= 425 && ids.has('song_southern') && ids.has('wei_northern')) {
    if (year === 421 && ids.has('western_liang')) {
      return '西凉终止；敦煌为覆亡前中心；疆域未定；刘宋以建康为中心；疆域未定；北魏、夏、北凉、西秦、北燕、新罗并存';
    }
    if (year === 422) return '刘裕五月去世、刘义符即位；刘宋以建康为中心；疆域未定；北魏、夏、北凉、西秦、北燕、新罗并存';
    if (year === 423) return '刘宋少帝刘义符在位；建康为中心；疆域未定；北魏、夏、北凉、西秦、北燕、新罗并存';
    if (year === 424) return '刘义符年内被废、刘义隆八月即位；建康中心延续；疆域未定；北魏、夏、北凉、西秦、北燕、新罗并存';
    return '元嘉二年；文帝刘义隆开始亲理政务；建康为中心；疆域未定；北魏、夏、北凉、西秦、北燕、新罗并存';
  }
  if (year === 386 && ids.has('wei_northern') && ids.has('later_yan') && ids.has('later_qin')
    && ids.has('later_liang') && ids.has('western_qin')) {
    return '北魏（代）年初牛川即位，二月迁居盛乐、四月改称魏王；仅标盛乐阶段中心，年内迁贺兰部、再返牛川；疆域未定；后燕、后秦称帝；后燕中山、后秦长安中心参照，后秦向安定用兵；西秦勇士城区域中心参照；西燕、前秦、东晋、后凉、新罗并存';
  }
  if (year >= 384 && year <= 386 && ids.has('later_yan') && ids.has('later_qin') && ids.has('western_yan')) {
    if (year === 384) return '后燕荥阳称王（事件区域点、非全年中心）；后秦在渭北马牧起兵、自称万年秦王（地望未定）；疆域未定；前秦、东晋、西燕、新罗并存';
    if (year === 385) return '后燕围邺未下、四月撤围，年末定都中山（中心参照）；后秦多线征战；西秦九月建政、勇士城中心参照；疆域未定；前秦、东晋、西燕、新罗并存';
    if (year === 386) return '北魏（代）年初牛川即位，二月迁居盛乐、四月改称魏王；仅标盛乐阶段中心，年内迁贺兰部、再返牛川；疆域未定；后燕、后秦称帝；后燕中山、后秦长安中心参照，后秦向安定用兵；西秦勇士城区域中心参照；西燕、前秦、东晋、后凉、新罗并存';
  }
  if (year >= 387 && year <= 393 && ids.has('western_yan') && ids.has('later_yan')) {
    if (year === 392) return '翟钊奔长子；西燕、后燕并存';
    return '西燕—后燕并存；长子为西燕政治中心';
  }
  if (year >= 415 && year <= 416 && ids.has('jin_eastern') && ids.has('later_qin')
    && ids.has('xia') && ids.has('northern_yan') && ids.has('wei_northern')
    && ids.has('northern_liang') && ids.has('western_qin') && ids.has('western_liang')) {
    return '西凉以酒泉为中心；疆域未定；东晋、后秦、夏、北燕、北魏、北凉、西秦并存';
  }
  if (year === 417 && ids.has('jin_eastern') && ids.has('later_qin') && ids.has('xia')
    && ids.has('northern_yan') && ids.has('wei_northern') && ids.has('northern_liang')
    && ids.has('western_qin') && ids.has('western_liang')) {
    return '东晋刘裕攻取长安；姚泓出降，后秦中央政权终止；长安为年内交接参照（不代表全年稳定控制）；疆域未定；西凉以酒泉为中心；夏、北燕、北魏、北凉、西秦、新罗并存';
  }
  if (year >= 418 && year <= 419 && ids.has('jin_eastern') && ids.has('xia')
    && ids.has('northern_yan') && ids.has('wei_northern') && ids.has('northern_liang')
    && ids.has('western_qin') && ids.has('western_liang')) {
    return '西凉以酒泉为中心；疆域未定；东晋、夏、北燕、北魏、北凉、西秦并存';
  }
  if (year >= 407 && year <= 409 && ids.has('xia')) {
    if (year === 407 && ids.has('later_yan') && ids.has('northern_yan')) {
      return '夏建政；高平川地望有异说；疆域未定；后燕—北燕交替；东晋、后秦、北魏、北凉、南凉、南燕、西凉、新罗并存';
    }
    if (year === 408 && ids.has('northern_yan') && ids.has('later_qin') && ids.has('southern_yan')) {
      return '夏军退保河曲、追至木城擒齐难；地点与“大城”异文未决，不标战场点；疆域未定；东晋、后秦、北魏、北凉、南凉、南燕、北燕、西凉、新罗并存';
    }
    if (year === 409 && ids.has('northern_yan') && ids.has('western_qin') && ids.has('western_liang')) {
      return '夏军攻掠平凉七千余户、进屯依力川；不代表控制平凉全境；地点、疆域未定；西秦复立、度坚山区域事件点（非全年中心）；东晋、后秦、北魏、北凉、南凉、南燕、北燕、西凉、新罗并存';
    }
  }
  if (year === 304 && ids.has('jin_western') && ids.has('former_zhao') && ids.has('cheng_han')) {
    return '西晋—成汉—前赵并存';
  }
  if (year === 305 && ids.has('jin_western') && ids.has('former_zhao') && ids.has('cheng_han')) {
    return '西晋—成汉—前赵并存';
  }
  if (year === 23 && ids.has('xin') && ids.has('gengshi') && ids.has('xiongnu')
    && ids.has('goguryeo') && ids.has('silla')) {
    return '新朝—更始交替；更始在宛形成、年内入长安；匈奴、高句丽、新罗并存';
  }
  if (year === 24 && ids.has('gengshi') && ids.has('xiongnu') && ids.has('goguryeo') && ids.has('silla')) {
    return '更始自洛阳迁都长安（年内转换）；匈奴、高句丽、新罗并存';
  }
  if (year === 347 && ids.has('jin_eastern') && ids.has('cheng_han')) {
    return '成汉终止年；桓温春季攻取成都后还江陵；四月邓定、隗文等复据成都；成都为控制转折参照；疆域未定；东晋、新罗并存';
  }
  if (year === -230 && ids.has('han_warring') && ids.has('qin_state')) {
    return '韩国年内终止；秦灭韩、置颍川郡；新郑为受降前中心；疆域未定；赵、魏、楚、燕、齐并存';
  }
  if (year === -223 && ids.has('chu_warring') && ids.has('qin_state')) {
    return '楚王负刍被俘、楚政权终止；秦接收楚地（前224“荆王”与前223负刍节点关系未定）；不标寿春中心；疆域未定；秦、赵、魏、燕、齐并存';
  }
  if (year === -222 && ids.has('yan_warring') && ids.has('qin_state')) {
    return '燕王喜被俘、燕政权终止；辽阳为低置信度末期中心区域参照（不定位襄平）；疆域未定；秦、赵、魏、齐并存';
  }
  if (year === -221 && ids.has('qin')) {
    return `${ids.has('qi_warring') ? '齐—秦交替；' : ''}秦灭齐、完成统一；咸阳为中央政治中心；三十六郡建制可确认，郡界未定`;
  }
  if (year === -221 && ids.has('qi_warring') && ids.has('qin_state')) return '齐—秦交替；秦统一过程未完；疆域未定';
  if (year === -220 && ids.has('qin')) {
    return '洞庭、巴、南等郡兵器输内史；秦简见行政资源联系，不代表连续控制面；咸阳为中央中心；疆界未定';
  }
  if (year === -219 && ids.has('qin')) {
    return '秦始皇东巡郡县至邹峄、泰山、琅邪；巡行不作疆界；咸阳为中央中心；齐地郡制断代有异说';
  }
  if (year === -208 && ids.has('qin')) {
    return '李斯被杀；秦廷仍在咸阳；反秦战争、地方控制瓦解；疆域未定；匈奴并存';
  }
  if (year === -207 && ids.has('qin')) {
    return '刘邦八月入武关；秦二世被逼自杀、子婴继位并诛赵高；秦廷中心仍在咸阳；疆域未定；匈奴并存';
  }
  if (year === -206 && ids.has('qin') && ids.has('han_western')) {
    return ids.has('xiang_yu')
      ? '秦亡、项羽政权自立为西楚霸王并都彭城；封刘邦为汉王、都南郑；三秦分封；项羽九郡及各方实控县界未定；年度图不显示秦中心；匈奴并存'
      : '秦亡、项羽分封三秦；项羽封刘邦为汉王；南郑为汉王都，巴、蜀、汉中封域县界未定；年度图不显示秦中心；匈奴并存';
  }
  if (year === -206 && ids.has('qin')) {
    return '子婴降、秦亡（采用公历年表，史记秦历另有编年）；项羽入咸阳并分封三秦；秦中心年度图留空；疆域未定';
  }
  if (year === -205 && ids.has('han_western')) {
    return ids.has('xiang_yu')
      ? '汉、项羽政权并存；楚军反击、汉军败退彭城；汉王年末还都栎阳；彭城为项羽都城及城市级战事参照；九郡边界未定；匈奴并存'
      : '汉军还定三秦、东进彭城败退；年末还都栎阳；彭城为城市级战事参照；疆域未定';
  }
  if (year === -204 && ids.has('han_western')) {
    return ids.has('xiang_yu')
      ? '汉、项羽政权并存；争夺荥阳、成皋与粮道；荥阳为前线参照、不代表全年控制；疆域未定；匈奴并存'
      : '汉楚争荥阳、成皋与粮道；荥阳为前线参照、不代表全年控制；疆域未定';
  }
  if (year === -203 && ids.has('han_western')) {
    return ids.has('xiang_yu')
      ? '汉、项羽政权并存；年末鸿沟约和、楚军暂退；汉方决定追击；荥阳为前线参照；不将鸿沟画作已执行全年边界；疆域未定；匈奴并存'
      : '年末鸿沟约和、楚军暂退；汉方决定追击；荥阳为前线参照；不将鸿沟画作已执行全年边界；疆域未定';
  }
  if (year === -202 && ids.has('han_western') && ids.has('xiang_yu')) {
    return '楚汉战争终结；项羽政权年内终止，垓下败、乌江自刎；不以终止事件推定全年疆界；匈奴并存';
  }
  if (year === -209 && ids.has('qin') && ids.has('xiongnu')) {
    return '秦—匈奴并存；冒顿立单于（传统约年）；单于庭移动、龙城位置待考；疆域未定';
  }
  if (year === -37 && ids.has('han_western') && ids.has('goguryeo') && ids.has('silla')) {
    return '西汉—高句丽、新罗并存；传统建国年；纥升骨城／五女山为早期中心候选；不确认建国仪式点；疆域未定';
  }
  if (year === 25 && ids.has('gengshi') && ids.has('han_eastern')) return '更始—东汉交替';
  if (year === 557 && ids.has('liang_southern') && ids.has('chen_southern')
    && ids.has('wei_western') && ids.has('zhou_northern') && ids.has('qi_northern')) {
    return '南梁—南陈交替；西魏—北周交替；建康为南陈建政后中心、长安为西魏—北周承接中心；南陈、北周疆域未定；北齐并存；其来源范围仅为低置信时段参考，控制性质未定';
  }
  if (year === 581 && ids.has('zhou_northern') && ids.has('sui') && ids.has('chen_southern')) {
    return '北周—隋交替；隋以长安为政治中心；疆域未定；南陈并存';
  }
  if (year === 582 && ids.has('sui') && ids.has('chen_southern')) {
    return '隋营建大兴新都；仍以长安为政治中心；疆域未定；南陈并存';
  }
  if (year === 583 && ids.has('sui') && ids.has('chen_southern')) {
    return '隋迁都大兴；大兴为低置信度区域参照；疆域未定；南陈并存';
  }
  if (year >= 584 && year <= 586 && ids.has('sui') && ids.has('chen_southern')) {
    return '隋以大兴为都；地图点为区域参照；疆域未定；南陈并存';
  }
  if (year >= 582 && year <= 586 && ids.has('sui') && ids.has('chen_southern')) return '隋—南陈并存';
  if (year === 577 && ids.has('chen_southern') && ids.has('qi_northern') && ids.has('zhou_northern')) {
    return '高恒即位；北周攻取邺、北齐终止；邺为年内转换中心；疆域未定；南陈并存';
  }
  if (year >= 558 && year <= 560 && ids.has('chen_southern')
    && ids.has('qi_northern') && ids.has('zhou_northern')) {
    const centers = '南陈以建康、北周以长安为政治中心；疆域未定；北齐并存；其来源范围仅为低置信时段参考，控制性质未定';
    if (year === 558) return centers;
    if (year === 559) return `陈霸先卒—陈蒨继位；${centers}`;
    return `宇文邕继位；${centers}`;
  }
  if (year === 479 && ids.has('song_southern') && ids.has('qi_southern') && ids.has('wei_northern')) {
    return '刘宋三月禅位—南齐五月建政；建康为建政中心参照，非全年连续控制；疆域未定；北魏、新罗并存';
  }
  if (year >= 479 && year <= 501 && ids.has('qi_southern') && ids.has('wei_northern')) return '南齐—北魏并存';
  if (year === 502 && ids.has('qi_southern') && ids.has('liang_southern') && ids.has('wei_northern')) {
    return '南齐—南梁交替；萧衍年中在建康受禅建梁；中心点仅表示建梁后阶段，疆域未定；北魏、新罗并存';
  }
  if (year === 507 && ids.has('liang_southern') && ids.has('wei_northern')) {
    return '南梁以建康为中心；疆域未定；钟离及邵阳洲附近战事（钟离区域近似事件点）；南梁援军击退北魏军；北魏、新罗并存';
  }
  if (year >= 503 && year <= 509 && ids.has('liang_southern') && ids.has('wei_northern')) {
    return '南梁以建康为中心；疆域未定；北魏、新罗并存';
  }
  if (year >= 503 && year <= 533 && ids.has('liang_southern') && ids.has('wei_northern')) return '南梁—北魏并存';
  if (year === 534 && ids.has('liang_southern') && ids.has('wei_northern') && ids.has('wei_eastern')) {
    return '北魏分裂；孝武帝七月离洛入关中、东魏十月在邺建政；洛阳、邺仅为事件点；西魏于公历535年建政，疆域未定；南梁、新罗并存';
  }
  if (year === 550 && ids.has('wei_eastern') && ids.has('qi_northern')
    && ids.has('wei_western') && ids.has('liang_southern')) {
    return '东魏—北齐交替；邺为北齐建政中心；北齐疆域未定；西魏、南梁并存';
  }
  if (year === 551 && ids.has('qi_northern') && ids.has('wei_western') && ids.has('liang_southern')) {
    return '北齐以邺为政治中心；疆域未定；西魏、南梁并存';
  }
  if (year === 552 && ids.has('qi_northern') && ids.has('wei_western')
    && ids.has('liang_southern') && ids.has('turkic')) {
    return '北齐以邺为政治中心；疆域未定；筑长城（线路待考、不作疆界）；土门击败柔然，突厥汗权形成（《周书》记于怀荒以北战事）；西魏、南梁并存';
  }
  if (year === 553 && ids.has('qi_northern') && ids.has('wei_western')
    && ids.has('liang_southern') && ids.has('turkic')) {
    return '北齐以邺为政治中心；疆域未定；突厥汗位承继记载有异文；西魏、南梁并存';
  }
  if (year === 554 && ids.has('qi_northern') && ids.has('wei_western')
    && ids.has('liang_southern') && ids.has('turkic')) {
    return '北齐以邺为政治中心；疆域未定；突厥十一月再攻柔然，柔然举国奔齐，北齐迎纳、突厥请降；战局不构成疆界；西魏、南梁并存';
  }
  if (year >= 552 && year <= 554 && ids.has('qi_northern') && ids.has('wei_western')
    && ids.has('liang_southern') && ids.has('turkic')) {
    return '北齐以邺为政治中心；疆域未定；西魏、南梁、突厥并存';
  }
  if (year === 902 && ids.has('tang') && ids.has('wu_ten')) {
    return '吴王受封；扬州为政治中心；封号不表示封域实控；唐末群雄并存；疆域未定';
  }
  if (year === 903 && ids.has('tang') && ids.has('wu_ten')) {
    return '杨吴以扬州为政治中心；方镇名义辖区不作疆界；唐末群雄并存；疆域未定';
  }
  if (year === 904 && ids.has('tang') && ids.has('wu_ten')) {
    return '杨吴以扬州为政治中心；各州控制强弱未明；唐末群雄并存；疆域未定';
  }
  if (year === 905 && ids.has('tang') && ids.has('wu_ten')) {
    return '杨行密卒、杨渥继位；吴军西取鄂州；扬州为政治中心；战事不作疆界；疆域未定';
  }
  if (year === 906 && ids.has('tang') && ids.has('wu_ten')) {
    return '吴军取得江州、饶州、洪州州城；阶段性战事不等于全年直辖；扬州为中心；疆域未定';
  }
  if (year === 907 && ids.has('tang') && ids.has('liang_later') && ids.has('wu_ten')
    && ids.has('jin_hedong') && ids.has('wuyue') && ids.has('chu_ten') && ids.has('former_shu')) {
    return '唐—后梁交替；杨吴沿用天祐年号、以扬州为中心；疆域未定；河东晋、吴越、楚、前蜀并存';
  }
  if (year === 908 && ids.has('liang_later') && ids.has('wu_ten') && ids.has('jin_hedong')
    && ids.has('wuyue') && ids.has('chu_ten') && ids.has('former_shu')) {
    return '杨隆演继位、杨吴以扬州为中枢；后梁以大梁为中心；疆域未定；河东晋、吴越、楚、前蜀并存';
  }
  if (year === 909 && ids.has('liang_later') && ids.has('wu_ten') && ids.has('jin_hedong')
    && ids.has('wuyue') && ids.has('chu_ten') && ids.has('former_shu') && ids.has('min')) {
    return '杨吴向江西诸州扩张，接管时序与连续控制线未明；后梁年内迁都洛阳、秋还大梁；闽以福州为中心，五州沿革概述不作疆界；疆域未定；河东晋、吴越、楚、前蜀、闽并存';
  }
  if (year === 910 && ids.has('liang_later') && ids.has('wu_ten') && ids.has('jin_hedong')
    && ids.has('wuyue') && ids.has('chu_ten') && ids.has('former_shu') && ids.has('min')) {
    return '杨吴以扬州为中心；“尽有今江西”不回推为本年全年疆界；后梁以洛阳为主朝廷中心、大梁为东都；岐王求巴、剑二州，王建拒绝割让；州界未定；闽以福州为中心，五州沿革概述不作疆界；河东晋、吴越、楚、前蜀、闽并存';
  }
  if (year >= 909 && year <= 910 && ids.has('liang_later') && ids.has('wu_ten')
    && ids.has('jin_hedong') && ids.has('wuyue') && ids.has('chu_ten')
    && ids.has('former_shu') && ids.has('min')) {
    return '后梁—杨吴、晋、吴越、楚、前蜀、闽并存';
  }
  if (year >= 934 && year <= 935 && ids.has('tang_later') && ids.has('later_shu')) {
    const concurrentLabel = ids.has('jingnan') ? '；荆南并存' : '';
    if (year === 934) {
      return `后唐—后蜀并存；孟知祥在成都即帝位；渠州叛乱及平定是局部事件，不作疆界；疆域未定${concurrentLabel}`;
    }
    return `后唐—后蜀并存；孟知祥以成都为中心；蜀大赦不作疆界；疆域未定${concurrentLabel}`;
  }
  if (year === 936 && ids.has('tang_later') && ids.has('jin_later') && ids.has('later_shu')) {
    return '石敬瑭太原起兵、契丹入援并受册；后唐十二月终止、后晋兴起；洛阳为终局转换中心；割十六州之约不作疆界；疆域未定；后蜀并存';
  }
  if (year === 937 && ids.has('jin_later') && ids.has('southern_tang')
    && ids.has('later_shu') && ids.has('dali')) {
    return '后晋、南唐、后蜀、大理并存；大理建政年937/938有异说；羊苴咩城D级中心参照；疆域未定';
  }
  if (year >= 938 && year <= 944 && ids.has('jin_later') && ids.has('southern_tang')
    && ids.has('later_shu') && ids.has('dali')) {
    if (year === 938) return '后晋、南唐、后蜀、大理并存；羊苴咩城D级中心参照；段思平分封与整合不作疆界';
    if (year === 944) return '后晋、南唐、后蜀、大理并存；段思平去世、段思英继位；羊苴咩城D级中心参照；疆域未定';
    return '后晋、南唐、后蜀、大理并存；羊苴咩城D级中心参照；疆域未定';
  }
  if (year === 945 && ids.has('jin_later') && ids.has('southern_tang') && ids.has('later_shu')
    && ids.has('dali') && ids.has('min')) {
    return '后晋、南唐、后蜀、大理并存；闽终止；段思英、段思良交接纪年有异说；羊苴咩城D级中心参照；疆域未定';
  }
  if (year === 946 && ids.has('jin_later') && ids.has('southern_tang')
    && ids.has('later_shu') && ids.has('dali')) {
    return '后晋、南唐、后蜀、大理并存；段思良继位纪年有异说；羊苴咩城D级中心参照；疆域未定';
  }
  if (year === 947 && ids.has('jin_later') && ids.has('han_later')
    && ids.has('southern_tang') && ids.has('later_shu') && ids.has('dali')) {
    return '契丹正月入汴、后晋终止；后汉二月在太原建政、五月入洛阳与开封；开封、太原为年内转换中心；疆域未定；南唐、后蜀、大理并存';
  }
  if (year >= 948 && year <= 950 && ids.has('han_later') && ids.has('southern_tang')) {
    if (year === 949) {
      return appendFiveDynastiesPolities('后汉以开封为中心；南唐以金陵为中枢；泉州升清源军并兼领南州（漳州）；辖区自治不作疆界；疆域未定', ids, year);
    }
    if (year === 950) {
      return appendFiveDynastiesPolities('后汉以开封为中心；南唐以金陵为中枢；清源军等地方军政关系不作直辖边界；疆域未定', ids, year);
    }
    return appendFiveDynastiesPolities('后汉以开封为中心；南唐以金陵为中枢；闽地地方军政关系不等于中央直辖；疆域未定', ids, year);
  }
  if (year === 924 && ids.has('tang_later') && ids.has('jingnan')) {
    return '后唐—荆南并存；后唐以洛阳为中心；南平王高季兴以江陵为中心；封爵不作疆界；疆域未定';
  }
  if (year === 925 && ids.has('tang_later') && ids.has('former_shu') && ids.has('jingnan')) {
    return '后唐—荆南并存；后唐以洛阳为中心；灭前蜀、蜀地接收分期；荆南以江陵为中心；邻国变化不作荆南疆界；疆域未定';
  }
  if (year === 923 && ids.has('liang_later') && ids.has('jin_hedong') && ids.has('tang_later')) {
    return '后唐魏州即位、攻取开封；后梁终止；迁入洛阳后为中央中心；疆域未定';
  }
  if (year >= 907 && year <= 922 && ids.has('liang_later') && ids.has('jin_hedong')) return '后梁—河东晋王并存';
  if (year === 221 && ids.has('wei_three') && ids.has('shu_three') && ids.has('wu_three')) {
    return '魏—蜀汉建政；吴王受魏封、迁都武昌；洛阳、成都、武昌为中心参照；各方疆域未定';
  }
  if (year === 263 && ids.has('wei_three') && ids.has('shu_three') && ids.has('wu_three')) {
    return '蜀汉年内终止；魏军攻取成都；成都为终止前中枢；接管分期、疆域未定；吴并存';
  }
  if (year === 223 && ids.has('wei_three') && ids.has('shu_three') && ids.has('wu_three')) {
    return '魏、蜀汉、吴并存；刘备卒于永安、刘禅继位；洛阳、成都、武昌为中心；疆域未定';
  }
  if (year === 265 && ids.has('wei_three') && ids.has('jin_western') && ids.has('wu_three')) {
    return '魏—晋交替；年初魏以洛阳为中心；吴冬迁武昌、此为年末中心；疆域未定';
  }
  if (year === 222 && ids.has('wei_three') && ids.has('shu_three') && ids.has('wu_three')) {
    return '魏、蜀汉、吴并存；吴自立改元黄武；洛阳、成都、武昌为中心；疆域未定';
  }
  if (year >= 222 && year <= 223 && ids.has('wei_three') && ids.has('shu_three') && ids.has('wu_three')) {
    return '魏—蜀汉—吴并存';
  }
  if (year === 220 && ids.has('han_eastern') && ids.has('wei_three')) return '东汉—魏交替；魏以洛阳为中心；疆域未定';
  if (year === 265 && ids.has('wei_three') && ids.has('jin_western')) return '魏—晋交替';
  if (year === 9 && ids.has('han_western') && ids.has('xin')) {
    return '公历9年按新正朔为始建国元年；西汉—新朝年内交替；新朝区间轮廓在本年待审、地图留空；新罗并存';
  }
  if (year === 618 && ids.has('sui') && ids.has('tang')) {
    const transition = '隋—唐交替；唐以长安为政治中心；疆域未定';
    if (ids.has('tibetan_empire') && ids.has('goguryeo') && ids.has('silla') && ids.has('tuyuhun') && ids.has('turkic')) {
      return `${transition}；薛举、李轨、王世充等并存；高句丽、新罗、吐谷浑、突厥并存；吐蕃形成约年（年代有异说），雅砻核心参照`;
    }
    return ids.has('tibetan_empire') ? `${transition}；吐蕃形成约年（年代有异说），雅砻核心参照` : transition;
  }
  if (year >= 619 && year <= 622 && ids.has('tang') && ids.has('tibetan_empire')) {
    if (ids.has('goguryeo') && ids.has('silla') && ids.has('tuyuhun') && ids.has('turkic')) {
      const neighboringPolities = '高句丽、新罗、吐谷浑、突厥并存；';
      if (year === 619) return `唐初以长安为政治中心；疆域未定；刘武周、宋金刚、王世充、窦建德等并存；${neighboringPolities}吐蕃雅砻核心参照`;
      if (year === 620) return `唐初以长安为政治中心；疆域未定；刘武周等势力并存；${neighboringPolities}吐蕃雅砻核心参照`;
      if (year === 621) return `唐初以长安为政治中心；疆域未定；唐军攻取洛阳、击败窦建德（事件参照）；${neighboringPolities}吐蕃雅砻核心参照`;
      return `唐初以长安为政治中心；疆域未定；刘黑闼据洺州（对手中心区域参照，不代表唐控）；${neighboringPolities}吐蕃雅砻核心参照`;
    }
    if (year === 622) return '唐初以长安为政治中心；疆域未定；刘黑闼据洺州（对手中心区域参照，不代表唐控）；吐蕃雅砻核心参照';
    return '唐初以长安为政治中心；疆域未定；吐蕃雅砻核心参照';
  }
  if (year >= 661 && year <= 681 && ids.has('tang') && ids.has('turkic') && ids.has('tibetan_empire')) {
    return appendCoexistingPolities('唐—突厥余部—吐蕃并存', ids);
  }
  if (year >= 682 && year <= 689 && ids.has('tang') && ids.has('turkic') && ids.has('tibetan_empire')) {
    return appendCoexistingPolities('唐—后突厥—吐蕃并存', ids);
  }
  if (year >= 690 && year <= 704 && ids.has('wu_zhou') && ids.has('turkic') && ids.has('tibetan_empire')) {
    return appendCoexistingPolities('武周—后突厥—吐蕃并存', ids);
  }
  if (year === 705 && ids.has('wu_zhou') && ids.has('tang') && ids.has('turkic') && ids.has('tibetan_empire')) {
    return appendCoexistingPolities('武周—唐交替；后突厥、吐蕃并存', ids);
  }
  if (year === 738 && ids.has('tang') && ids.has('turkic') && ids.has('tibetan_empire') && ids.has('nanzhao')) {
    return appendCoexistingPolities('唐—后突厥—吐蕃并存；南诏形成约年', ids, ['nanzhao']);
  }
  if (year >= 739 && year <= 740 && ids.has('tang') && ids.has('turkic')
    && ids.has('tibetan_empire') && ids.has('nanzhao')) {
    return appendCoexistingPolities('唐—后突厥—吐蕃—南诏并存', ids, ['nanzhao']);
  }
  if (year === 742 && ids.has('tang') && ids.has('turkic') && ids.has('tibetan_empire')) {
    return appendCoexistingPolities('三部攻杀骨咄叶护；乌苏米施继立；吐蕃并存', ids);
  }
  if (year >= 706 && year <= 743 && ids.has('tang') && ids.has('turkic') && ids.has('tibetan_empire')) {
    return appendCoexistingPolities('唐—后突厥—吐蕃并存', ids);
  }
  if (year === 744 && ids.has('tang') && ids.has('turkic') && ids.has('tibetan_empire')) {
    return appendCoexistingPolities('乌苏死、白眉继立；回纥怀仁可汗受册；吐蕃并存', ids);
  }
  if (year === 951 && ids.has('han_later') && ids.has('zhou_later') && ids.has('northern_han')) {
    return appendFiveDynastiesPolities('后汉终止—后周、北汉建政；开封、太原为政治中心；疆域未定', ids, year,
      ['northern_han']);
  }
  if (year >= 952 && year <= 959 && ids.has('zhou_later') && ids.has('northern_han')) {
    if (year === 954) return appendFiveDynastiesPolities('柴荣继位；后周高平战胜契丹—北汉联军；开封为中心；疆域未定', ids, year);
    if (year === 955) return appendFiveDynastiesPolities('后周进取秦、凤方向；开封为中心；州界未定', ids, year);
    if (year === 956) return appendFiveDynastiesPolities('后周南征淮南；战事不作疆界；开封为中心；疆域未定', ids, year);
    if (year === 957) return appendFiveDynastiesPolities('淮南战事及州郡控制转换；开封为中心；疆域未定', ids, year);
    if (year === 958) return appendFiveDynastiesPolities('南唐割江北地、奉后周正朔；不等于直辖江南；开封为中心；疆域未定', ids, year);
    if (year === 959) return appendFiveDynastiesPolities('后周北征取得关南部分地区；柴荣去世后停兵；不以单年战果回填疆界；开封为中心；疆域未定', ids, year);
    return appendFiveDynastiesPolities('后周以开封为中央政治中心；疆域未定', ids, year);
  }
  if (year === 960 && ids.has('zhou_later') && ids.has('song_northern') && ids.has('northern_han')) {
    return '后周—北宋交替；北汉并存';
  }
  if (year === 1115 && ids.has('khitan') && ids.has('jin_jurchen')) return '辽—金并存；金建政';
  if (year >= 1116 && year <= 1117 && ids.has('khitan') && ids.has('jin_jurchen')) {
    return '辽—金并存；金势力扩展';
  }
  if (year === 1118 && ids.has('khitan') && ids.has('jin_jurchen') && ids.has('song_northern')) {
    return '辽—金并存；宋金议伐辽';
  }
  if (year === 1119 && ids.has('khitan') && ids.has('jin_jurchen')) return '辽—金并存；金拒辽册封';
  if (year === 1120 && ids.has('khitan') && ids.has('jin_jurchen')) return '辽—金并存；金取辽上京';
  if (year === 1121 && ids.has('khitan') && ids.has('jin_jurchen')) return '辽—金并存';
  if (year === 1122 && ids.has('khitan') && ids.has('jin_jurchen') && ids.has('song_northern')) {
    return '辽—金并存；宋金议燕京分地';
  }
  if (year === 1123 && ids.has('khitan') && ids.has('jin_jurchen') && ids.has('song_northern')) {
    return '辽—金—宋并存；金太祖—太宗交替';
  }
  if (year === 1124 && ids.has('khitan') && ids.has('jin_jurchen') && ids.has('western_liao')
    && ids.has('song_northern') && ids.has('western_xia') && ids.has('dali')) {
    return '辽、金、北宋、西夏、大理并存；耶律大石西迁、可敦城驻留；西辽建政纪年有异说；疆域留空';
  }
  if (year === 1125 && ids.has('khitan') && ids.has('jin_jurchen') && ids.has('western_liao')
    && ids.has('song_northern') && ids.has('western_xia') && ids.has('dali')) {
    return '辽中央终止；金攻宋；耶律大石集团西迁，西辽形成纪年有异说；北宋、西夏、大理并存；疆域未定';
  }
  if (year === 1127 && ids.has('song_northern') && ids.has('song_south') && ids.has('jin_jurchen')) {
    return '北宋终止—南宋建政；应天—扬州迁驻';
  }
  if (year >= 1128 && year <= 1138 && ids.has('song_south') && ids.has('jin_jurchen')) {
    if (year === 1128) return '南宋—金并存；扬州行在';
    if (year === 1129) return '南宋—金交战；行在多次迁驻';
    if (year === 1130) return '南宋—金并存；绍兴行在';
    if (year === 1131) return '南宋—金并存；绍兴—临安迁驻';
    if (year >= 1132 && year <= 1133) return '南宋—金并存；行在临安';
    if (year === 1134) return '南宋—金并存；临安—平江驻跸';
    if (year === 1135) return '南宋—金并存；平江—临安返驻';
    if (year === 1136) return '南宋—金并存；临安—建康驻跸';
    if (year === 1137) return '南宋—金并存；行在建康';
    if (year === 1138) return '南宋—金并存；建康—临安返驻';
  }
  if (year === 1127 && ids.has('song_northern') && ids.has('song_south')) return '北宋—南宋交替';
  if (year === 1271 && ids.has('mongol') && ids.has('yuan') && ids.has('song_south')) {
    return '蒙古汗廷—元朝国号转换；上都中心参照；南宋并存；统一未完成，疆域未定';
  }
  if (year >= 1272 && year <= 1278 && ids.has('song_south') && ids.has('yuan')) {
    if (year === 1272) return '南宋—元并存；大都定名、上都并用；双都中心参照；疆域未定';
    if (year === 1273) return '南宋—元并存；襄樊战事转折、吕文焕降；大都、上都中心参照；疆域未定';
    if (year === 1274) return '南宋—元并存；大都营建、南征部署；大都、上都中心参照；疆域未定';
    if (year === 1275) return '南宋—元并存；元军南下、江淮战事推进；大都、上都中心参照；疆域未定';
    if (year === 1276) return '南宋朝廷临安降元、残余政权仍抵抗；大都、上都中心参照；疆域未定';
    if (year === 1277) return '南宋残余抵抗、元军接管分期继续；大都、上都中心参照；疆域未定';
    return '南宋残余军队在四川及南方抵抗；大都、上都中心参照；疆域未定';
  }
  if (year === 1279 && ids.has('song_south') && ids.has('yuan')) {
    return '南宋终止—元统一；疆域仍未定；大都、上都中心参照';
  }
  if (year >= 1280 && year <= 1293 && ids.has('yuan')) {
    if (year === 1280) return '元以大都、上都为中心参照；对日远征计划不表示控制；疆域未定';
    if (year === 1281) return '元以大都、上都为中心参照；高丽关系与对日战争不等同直接疆界；疆域未定';
    if (year === 1282) return '元以大都、上都为中心参照；内乱与地方治理调整不作疆界；疆域未定';
    if (year === 1283) return '元以大都、上都为中心参照；西南军政、远征与朝贡不等同直接管辖；疆域未定';
    if (year === 1284) return '元以大都、上都为中心参照；地方行政与边疆事务不提供连续疆界；疆域未定';
    if (year === 1285) return '元以大都、上都为中心参照；与海都等蒙古诸王交战，不简化为稳定国界；疆域未定';
    if (year === 1286) return '元以大都、上都为中心参照；北方战事不覆盖全年控制状态；疆域未定';
    if (year === 1287) return '元以大都、上都为中心参照；乃颜之乱及东北战事不作疆界；疆域未定';
    if (year === 1288) return '元以大都、上都为中心参照；东北战事后续不作疆界；疆域未定';
    if (year === 1289) return '元以大都、上都为中心参照；政权延续，逐年边界未定';
    if (year === 1290) return '元以大都、上都为中心参照；边疆军政不等同同质直接控制面；疆域未定';
    if (year === 1291) return '元以大都、上都为中心参照；东川路建置不自动构成国家外界；疆域未定';
    if (year === 1292) return '元以大都、上都为中心参照；对外军事与地方行政并行；疆域未定';
    return '元以大都、上都为中心参照；不以后续成熟版图回推本年；疆域未定';
  }
  if (year >= 1440 && year <= 1467 && ids.has('northern_yuan')) {
    if (year === 1440) return '也先承接脱欢后的瓦剌权力；蒙古诸部整合中；无可定位中心或疆界';
    if (year === 1449) return '瓦剌也先入明；土木堡事件点为近似位置；军事行动不作疆界；蒙古势力范围未定';
    if (year === 1450) return '也先送还英宗、与明议和；蒙古内部权力竞争；疆域留空';
    if (year === 1454) return '也先杀脱脱不花并称汗、当年被杀；蒙古势力再分裂；不绘疆域';
    if (year >= 1455) {
      if (year === 1467) return '明、朝鲜联合攻建州女真；此为东北邻接事件，不作北元疆界；蒙古诸部范围未定';
      return '蒙古诸部多集团并存；单一北元控制范围未明；疆域留空';
    }
    if (year >= 1451) return '也先与脱脱不花权力竞争；汗廷驻地及各部控制边缘未定；疆域留空';
    return '瓦剌与东蒙古诸部竞争整合；年度疆界及汗廷位置未定；疆域留空';
  }
  if (year >= 1616 && year <= 1618 && ids.has('ming') && ids.has('later_jin') && ids.has('northern_yuan')) {
    if (year === 1616) return '明、后金、北元并存；后金建政、都赫图阿拉；中心点不表示疆界';
    if (year === 1617) return '明、后金、北元并存；赫图阿拉为都；科尔沁来朝不推定臣属或疆域';
    return '明、后金、北元并存；赫图阿拉为都；七大恨后对明用兵，战事不作疆界';
  }
  if (year === 1368 && ids.has('yuan') && ids.has('ming') && ids.has('northern_yuan')) {
    return '元廷北撤、北元形成—明建政；应天、上都中心参照；双方疆域未定';
  }
  if (year >= 1369 && year <= 1374 && ids.has('ming') && ids.has('northern_yuan')) {
    if (year === 1369) return '明—北元并存；应天为明廷中心；上都失守后北元转驻应昌；两点为先后中心，不作路线或疆界';
    if (year === 1370) return '明—北元并存；应天为明廷中心；应昌陷落后北元汗廷转至和林；两点为先后中心，不作路线或疆界';
    if (year === 1371) return '明—北元并存；应天、和林中心参照；部众边界未定';
    if (year === 1372) return '明—北元并存；漠北战事不作疆界；应天、和林中心参照；疆域未定';
    if (year === 1373) return '明—北元并存；应天、和林中心参照；汗廷与部众关系不构成固定边界';
    return '明—北元并存；应天、和林中心参照；疆域未定';
  }
  if (year >= 1659 && year <= 1662 && ids.has('ming_southern') && ids.has('qing')) {
    if (year === 1659) return '南明永历朝廷由云南撤入缅甸；流亡路线不作疆域；清并存';
    if (year === 1660) return '永历朝廷处于缅甸流亡；滇缅战事与朝廷驻留分开；疆域留空；清并存';
    if (year === 1661) return '永历朝廷仍在缅甸及滇缅交涉阶段；各方军事活动不作南明控制面；清并存';
    return '永历帝被执献、押回昆明并遇害；永历政权主要政治延续终止；事件点不作疆域；地方抗清力量另存；清并存';
  }
  if (year === 1636 && ids.has('ming') && ids.has('later_jin') && ids.has('qing')) {
    return '明并存；后金年内改国号为清、皇太极在盛京称帝；盛京为建政事件地点，不作疆域';
  }
  if (year === 1644 && ids.has('ming') && ids.has('qing') && ids.has('ming_southern')) {
    return '明亡—清入关；南京弘光政权年内形成、以南京为阶段中心；南明多中心并起；疆域未定';
  }
  if (year === 1912 && ids.has('qing') && ids.has('republic')) {
    return '中华民国1月1日在南京成立；清帝2月12日退位；南北交接非瞬时完成；北京终止事件点；疆域未定';
  }
  return primaryPolityName(polities);
}

export function polityDisplayName(polities: Polity[], year: number): string | undefined {
  if (year === -256) {
    return '周王室终止（项目采用前256年口径）；洛阳中心参照；疆域未定；东周君国尚存';
  }
  const baseLabel = basePolityDisplayName(polities, year);
  const ids = new Set(polities.map(polity => polity.id));
  if (!ids.has('silla') || year < -57 || year > 377 || year === 25) return baseLabel;
  if (year === -57) return '西汉—新罗传统建国年';
  if (year === -37 && ids.has('han_western') && ids.has('goguryeo')) {
    return '西汉—高句丽、新罗并存；传统建国年；纥升骨城／五女山为早期中心候选；不确认建国仪式点；疆域未定';
  }
  if (baseLabel?.includes('新罗')) return baseLabel;
  return baseLabel ? `${baseLabel}；新罗并存` : '新罗王京参照';
}
