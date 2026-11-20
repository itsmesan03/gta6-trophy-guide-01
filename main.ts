// Leonida Trophy Guide — hand-in program (Node 22, standard library only).
//
// The guide itself is plain static files under app/: index.html, app.js,
// style.css and app/data/trophies.json. It needs no build step and loads
// nothing over the network, so any static server can host it.
//
// This program copies app/ and screenshots/ into the output directory and
// writes dossier.json with the kit's vendored library. The scorer rebuilds
// that dossier from the same files and compares the two byte for byte, so
// vendor/makefun-frontend.ts must stay exactly as the kit shipped it.
//
// Run it locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyTree(from, to) {
  mkdirSync(to, { recursive: true });
  cpSync(from, to, { recursive: true });
}

mkdirSync(outDir, { recursive: true });
copyTree(join(repoRoot, 'app'), join(outDir, 'app'));
if (existsSync(join(repoRoot, 'screenshots'))) {
  copyTree(join(repoRoot, 'screenshots'), join(outDir, 'screenshots'));
}

// The scorer's caps: at most 4 screenshots, each at most 256 KiB, at most
// 993 files and directories in app/ and 48 MiB of app files in all, and a
// dossier text capped at 160 KiB.
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);
console.log(`Wrote ${join(outDir, 'dossier.json')} (${dossier.length} bytes).`);
