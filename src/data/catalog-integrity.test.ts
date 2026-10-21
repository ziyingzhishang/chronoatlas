import { describe, expect, it } from 'vitest';
import { heritageAssets } from './heritage';
import { people } from './people';
import type { HeritageAsset, Person } from '../domain/types';

describe('knowledge graph node catalogs', () => {
  it('exposes typed person and heritage collections', () => {
    const personCatalog: Person[] = people;
    const heritageCatalog: HeritageAsset[] = heritageAssets;

    expect(personCatalog).toEqual([]);
    expect(heritageCatalog).toEqual([]);
  });
});
