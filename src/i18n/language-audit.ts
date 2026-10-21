import type { Locale } from './locale';
import type { Polity } from '../domain/types';

export type DisplayTextKind = 'ui' | 'entity' | 'source-original' | 'attribution' | 'language-name';

const hasHan = (text: string) => /[\u3400-\u9fff]/.test(text);
const latinWords = (text: string) => text
  .replace(/https?:\/\/\S+/g, '')
  .replace(/\b(?:km|m|CE|BCE)\b/gi, '')
  .match(/[A-Za-z]{2,}/g) ?? [];

export function auditDisplayText(text: string, locale: Locale, kind: DisplayTextKind): string[] {
  if (!text.trim()) return ['Display text is empty'];
  if (kind === 'source-original' || kind === 'attribution' || kind === 'language-name') return [];
  if (locale === 'en' && hasHan(text)) return [`English ${kind === 'entity' ? 'entity' : 'UI'} contains Han text`];
  if (locale !== 'en' && latinWords(text).length) return [`Chinese ${kind === 'entity' ? 'entity' : 'UI'} contains unlabelled Latin text`];
  return [];
}

export function auditPolityDisplayName(polity: Polity, locale: Locale, surface: 'map' | 'detail'): string[] {
  const text = surface === 'map' ? polity.localizedName?.mapLabel ?? polity.name : polity.name;
  const kind: DisplayTextKind = polity.localizedName?.status === 'source-original' ? 'source-original' : 'entity';
  return auditDisplayText(text, locale, kind);
}
