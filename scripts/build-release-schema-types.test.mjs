import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import {
  renderReleaseSchemaModule,
  verifyGeneratedReleaseSchema,
} from './build-release-schema-types.mjs';

test('renders an identical TypeScript module for identical schema input', () => {
  const schema = { type: 'object', properties: { id: { type: 'string' } } };

  const first = renderReleaseSchemaModule(schema);
  const second = renderReleaseSchemaModule(schema);

  assert.equal(first, second);
  assert.match(first, /as const satisfies JSONSchema/);
  assert.equal(first.endsWith('\n'), true);
});

test('detects when the generated type mirror drifts from the JSON schema', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'chronoatlas-release-schema-'));
  const schemaPath = join(directory, 'schema.json');
  const generatedPath = join(directory, 'schema.generated.ts');
  try {
    const schema = { type: 'string', minLength: 1 };
    await writeFile(schemaPath, `${JSON.stringify(schema)}\n`);
    await writeFile(generatedPath, renderReleaseSchemaModule(schema));
    await assert.doesNotReject(() => verifyGeneratedReleaseSchema({ schemaPath, generatedPath }));

    await writeFile(schemaPath, `${JSON.stringify({ ...schema, maxLength: 8 })}\n`);
    await assert.rejects(
      () => verifyGeneratedReleaseSchema({ schemaPath, generatedPath }),
      /out of date/i,
    );
    assert.equal((await readFile(generatedPath, 'utf8')).includes('maxLength'), false);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
