import { describe, expect, it } from 'vitest';

const sourceFiles = import.meta.glob('../**/*.{ts,tsx}', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

const allowedRuntimeImports = new Set([
  '../app/App.tsx|../data/world',
]);

describe('historical content runtime import boundary', () => {
  it('keeps runtime readers behind the active release adapter', () => {
    const violations: string[] = [];
    for (const [relativePath, source] of Object.entries(sourceFiles)) {
      if (relativePath.includes('.test.') || relativePath === './bundled-adapter.ts') continue;
      source.split('\n').forEach((line, index) => {
        if (/^\s*import\s+type\b/.test(line)) return;
        const match = line.match(/from\s+['"](\.\.\/data\/[^'"]+)['"]/);
        if (!match) return;
        const key = `${relativePath}|${match[1]}`;
        if (!allowedRuntimeImports.has(key)) violations.push(`${relativePath}:${index + 1} -> ${match[1]}`);
      });
    }
    expect(violations).toEqual([]);
  });
});
