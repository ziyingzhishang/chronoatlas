import type { SourceNote } from '../domain/types';

export interface ReaderSource {
  title: string;
  institution?: string;
  citation?: string;
  url?: string;
}

export interface ReaderEntityLink {
  label: string;
  type: 'polity' | 'person' | 'event' | 'place' | 'heritage';
  id: string;
}

export interface ReaderNote {
  dateDescription?: string;
  uncertainty?: string;
  sources: ReaderSource[];
}

export interface ReaderSection {
  heading: string;
  paragraphs: string[];
  relatedEntities?: ReaderEntityLink[];
  note?: ReaderNote;
}

const httpUrl = /^https?:\/\//;

export function sourceUrls(citation?: string) {
  return (citation ?? '').split(/[；;]/).map((part) => part.trim()).filter((part) => httpUrl.test(part));
}

export function toReaderSources(sourceIds: string[], catalog: SourceNote[]): ReaderSource[] {
  const byId = new Map(catalog.map((source) => [source.id, source]));
  return [...new Set(sourceIds)].flatMap<ReaderSource>((sourceId) => {
    const source = byId.get(sourceId);
    if (!source) return [];
    const urls = sourceUrls(source.urlOrCitation);
    if (urls.length > 0) return urls.map((url) => ({ title: source.title, institution: source.authorOrInstitution, url }));
    return [{ title: source.title, institution: source.authorOrInstitution, citation: source.urlOrCitation }];
  });
}

export function toReaderText(text?: string) {
  if (!text) return undefined;
  const value = text
    .replace(/bundled-[\w-]+/gi, '')
    .replace(/\b(?:claim|evidence)[-:][\w-]+\b/gi, '')
    .replace(/\b(?:evidenceId|reviewStatus)\b/gi, '')
    .replace(/来源解析\s*\d+\s*\/\s*\d+/g, '')
    .replace(/(?:覆盖审计|缺口代码|待解析|知识覆盖)/g, '')
    .replace(/证据级别[：:]\s*[ABCD]\b/gi, '')
    .replace(/\d+\s*个原始坐标点/g, '')
    .replace(/\bclaim\b/gi, '关系记录')
    .replace(/([；;])\s*\1+/g, '$1')
    .replace(/^[；;，,、\s]+|[；;，,、\s]+$/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return value || undefined;
}
