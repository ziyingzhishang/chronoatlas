import { lstat, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const GENERATED_TEXT_EXTENSIONS = new Set(['.css', '.js', '.mjs']);

async function generatedTextFiles(root, directory = root) {
  const entries = await readdir(directory, { withFileTypes: true });
  entries.sort((left, right) => left.name.localeCompare(right.name));
  const files = [];
  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    const stat = await lstat(absolutePath);
    if (stat.isSymbolicLink()) continue;
    if (stat.isDirectory()) {
      files.push(...await generatedTextFiles(root, absolutePath));
    } else if (stat.isFile() && GENERATED_TEXT_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      files.push(absolutePath);
    }
  }
  return files;
}

export async function stripSourceMapReferences(artifactDirectory) {
  const root = path.resolve(artifactDirectory);
  const files = await generatedTextFiles(root);
  let changed = 0;

  for (const file of files) {
    const source = await readFile(file, 'utf8');
    const extension = path.extname(file).toLowerCase();
    const trailingReference = extension === '.css'
      ? /(?:\r?\n)?[ \t]*\/\*[#@][ \t]*sourceMappingURL=[^*\r\n]*\*\/[ \t]*(?:\r?\n)?$/
      : /(?:\r?\n)?[ \t]*\/\/[#@][ \t]*sourceMappingURL=[^\r\n]*[ \t]*(?:\r?\n)?$/;
    const stripped = source.replace(trailingReference, '\n');
    if (stripped !== source) {
      await writeFile(file, stripped);
      changed += 1;
    }
  }
  return changed;
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  const artifactDirectory = process.argv[2];
  if (!artifactDirectory) {
    console.error('Usage: node scripts/strip-source-map-references.mjs <artifact-directory>');
    process.exitCode = 1;
  } else {
    stripSourceMapReferences(artifactDirectory)
      .then((count) => console.log(`Removed source map references from ${count} generated files.`))
      .catch((error) => {
        console.error(error.message);
        process.exitCode = 1;
      });
  }
}
