import { describe, expect, it } from 'vitest';
import { heritageAssets } from './heritage';
import { people } from './people';
import type { HeritageAsset, Person } from '../domain/types';

describe('knowledge graph node catalogs', () => {
  it('exposes typed person and heritage collections', () => {
    const personCatalog: Person[] = people;
    const heritageCatalog: HeritageAsset[] = heritageAssets;

    expect(personCatalog.length).toBeGreaterThan(0);
    expect(heritageCatalog.length).toBeGreaterThan(0);
    expect(personCatalog.every((person) => person.id && person.name && person.description && person.sourceIds.length > 0)).toBe(true);
    expect(heritageCatalog.every((asset) => asset.id && asset.name && asset.placeId && asset.description && asset.sourceIds.length > 0)).toBe(true);
  });
});
