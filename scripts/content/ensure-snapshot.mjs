#!/usr/bin/env node
// The app imports src/content/snapshot.json at compile time; it is generated and gitignored.
// Fresh checkouts (CI) fetch the preview snapshot before tests compile.
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const target = path.join(root, 'src/content/snapshot.json');
if (!existsSync(target)) {
  const r = spawnSync(process.execPath, [path.join(root, 'scripts/content/fetch-snapshot.mjs'), '--out', target, '--preview'], { stdio: 'inherit' });
  process.exit(r.status ?? 1);
}
