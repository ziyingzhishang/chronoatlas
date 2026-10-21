import type { Locale } from './locale';
import { translateText } from './text';

export type SourceFieldKind = 'sourceName' | 'membership' | 'documentTitle' | 'attribution';

const labels: Record<SourceFieldKind, string> = {
  sourceName: '来源原始标注：',
  membership: '来源原始所属：',
  documentTitle: '来源文献原题：',
  attribution: '原始署名：',
};

export function formatSourceField(kind: SourceFieldKind, value: string, locale: Locale) {
  return { label: translateText(labels[kind], locale), value };
}
