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
