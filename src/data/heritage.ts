import type { HeritageAsset } from '../domain/types';

export const heritageAssets: HeritageAsset[] = [];

export const heritageById = Object.fromEntries(heritageAssets.map((asset) => [asset.id, asset]));
