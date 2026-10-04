// Fails if a 3D model / print file, an archive, or an oversized file is about to be published.
// Runs as the git pre-commit hook (staged files) and in the deploy workflow (repo + built site).
//   node scripts/check-no-models.mjs           → checks files tracked or staged in git
//   node scripts/check-no-models.mjs dist      → also checks everything in dist/
import { execSync } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const BLOCKED = /\.(stl|3mf|obj|mtl|amf|ply|step|stp|iges|igs|f3d|f3z|fcstd|scad|sldprt|sldasm|ipt|iam|blend\d?|fbx|dae|3ds|max|c4d|ma|mb|ztl|zpr|glb|gltf|usdz|gcode|bgcode|lys|chitubox|ctb|zip|7z|rar)$/i;
const MAX_BYTES = 1.5 * 1024 * 1024; // web images should be far smaller; a big file is usually a full-res original

const files = execSync('git ls-files --cached', { encoding: 'utf8' }).split('\n').filter(Boolean);
const walk = dir => readdirSync(dir, { withFileTypes: true }).flatMap(e => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]));
for (const dir of process.argv.slice(2)) files.push(...walk(dir));

const problems = [];
for (const f of files) {
  if (BLOCKED.test(f)) problems.push(`${f}  (model/print/archive file type)`);
  else {
    let size = 0;
    try { size = statSync(f).size; } catch { continue; } // staged deletion
    if (size > MAX_BYTES) problems.push(`${f}  (${(size / 1048576).toFixed(1)} MB — too large for a web asset)`);
  }
}

if (problems.length) {
  console.error('\nBlocked: these files must not be published from this public repo:\n  ' + problems.join('\n  '));
  console.error('\nRemove them (git rm --cached <file>) — 3D models stay private.\n');
  process.exit(1);
}
console.log(`check-no-models: ${files.length} files OK`);
