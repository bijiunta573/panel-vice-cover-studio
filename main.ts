// Panel Vice: Cover Studio — the make.fun gta6-cover-art-01 hand-in program (Node 22, standard
// library only). The entry itself is the static web app in app/: a fully offline multi-panel
// GTA-style cover maker (seven polygonal layouts, five colour grades, a twelve-scene library,
// drag / zoom / pan panel editing, PNG export at 1080x1080, 1080x1350 and 1920x1080).
// This program copies app/ and screenshots/ from beside this file into the output directory
// and writes dossier.json there with buildDossier from vendor/makefun-app.ts, byte for byte
// the way the sealed scorer rebuilds it.
//
// Serve the app locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Panel Vice sanity check: refuse to hand in a package the gate would refuse anyway —
// the screenshots folder must hold 3 or 4 images and none may exceed the 256 KiB cap.
const shotsDir = join(here, 'screenshots');
const shotFiles = existsSync(shotsDir)
  ? readdirSync(shotsDir).filter((name) => !name.startsWith('.'))
  : [];
if (shotFiles.length < 3 || shotFiles.length > 4) {
  throw new Error(`Panel Vice: expected 3 or 4 screenshots, found ${shotFiles.length}`);
}
for (const name of shotFiles) {
  const bytes = statSync(join(shotsDir, name)).size;
  if (bytes > 262144) throw new Error(`Panel Vice: screenshot ${name} is ${bytes} bytes, over the 256 KiB cap`);
}

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
cpSync(shotsDir, join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the
// others refuse an entry the scorer would refuse (more than 993 files in app/ or 48 MiB of
// app files in all, or a path under app/ over 1000 bytes).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);

console.log(`Panel Vice: handed in app/ and ${shotFiles.length} screenshots to ${out}`);
