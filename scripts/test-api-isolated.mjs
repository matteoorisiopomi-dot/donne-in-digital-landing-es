/**
 * Verifica che le serverless function in `api/` siano AUTOSUFFICIENTI a
 * runtime su Vercel.
 *
 * ── DUE CRASH IN PRODUZIONE, STESSA FAMIGLIA (DE, 2026-08-18) ───────────
 *   1. import da "../src/content/copy.ts"
 *      → Cannot find module '/var/task/src/content/copy.ts'
 *        `api/` è impacchettata FUORI dalla build Astro: `src/` non
 *        esiste nel bundle.
 *   2. import da "./_shared/brand.ts"
 *      → Cannot find module '/var/task/api/_shared/brand.ts'
 *        Vercel COMPILA i .ts della function in .js: a runtime c'è
 *        `brand.js`, e uno specifier con estensione `.ts` non risolve.
 *
 * Entrambi muti per l'utente: il client è fire-and-forget e redirige
 * alla thank-you comunque, quindi /gracias appariva e il lead spariva.
 * Questo repo (ES) aveva lo stesso import del caso 1: corretto in via
 * preventiva, mai andato in produzione.
 *
 * ── PERCHÉ QUESTO TEST È STATICO ────────────────────────────────────────
 * La prima versione di questo script copiava `api/` in una temp dir senza
 * `src/` e importava l'handler. Ha preso il crash n.1 ma NON il n.2: Node
 * fa type-stripping e risolve i `.ts` direttamente dal sorgente, quindi
 * l'ambiente compilato di Vercel non era simulato affatto. Un test che
 * gira sul sorgente **non può** provare nulla sulla risoluzione post
 * compilazione: era un falso verde.
 *
 * La garanzia vera si ottiene togliendo la variabile, non simulandola:
 * se in `api/` non esiste NESSUN import relativo, non c'è percorso né
 * estensione da riscrivere e il bundler non ha modo di sbagliare. Restano
 * ammessi solo i builtin `node:` e i pacchetti npm dichiarati in
 * `dependencies`, che Vercel installa e bundla sempre.
 *
 * ── COSA VERIFICA ───────────────────────────────────────────────────────
 *   A. STATICO — zero import relativi/assoluti in ogni file di `api/`;
 *      ogni specifier bare è un builtin `node:` o una `dependencies`.
 *      (Gli `import type` sono esclusi: spariscono in compilazione.)
 *   B. RUNTIME — l'handler si carica e si esegue: con una request mockata
 *      e senza SLACK_WEBHOOK_URL deve rispondere 503 `config_missing`.
 *      Questo prova che il codice gira, non che gli import risolvano in
 *      produzione: quella parte la garantisce il controllo A.
 *
 * USO   node scripts/test-api-isolated.mjs
 * Exit 0 = ok. Exit 1 = almeno una function crasherebbe in produzione.
 */

import { readdir, readFile } from "node:fs/promises";
import { join, dirname, resolve, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { isBuiltin } from "node:module";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const API_DIR = join(REPO, "api");

/* Entrypoint da eseguire nel controllo B. Aggiungere qui ogni nuova
   function. Il controllo A gira invece su TUTTI i file di api/. */
const ENTRYPOINTS = ["lead.ts"];

const pkg = JSON.parse(await readFile(join(REPO, "package.json"), "utf8"));
const RUNTIME_DEPS = new Set(Object.keys(pkg.dependencies ?? {}));

/** Payload valido secondo lo schema Zod di api/lead.ts. */
const VALID_LEAD = {
  name: "TEST",
  surname: "ISOLATION",
  email: "test-isolation@example.com",
  phone: "+34612345678",
  age: 30,
  occupation: "Diagnostico",
  motivation: "Test de aislamiento de la serverless function.",
  goal: "Comprobar que los imports resuelven en runtime.",
  aware: "yes",
  consent: true,
};

function mockRes() {
  const out = {};
  return {
    out,
    status(code) {
      out.status = code;
      return this;
    },
    json(payload) {
      out.body = payload;
      return this;
    },
  };
}

/** Tutti i file sorgente sotto api/, ricorsivo. */
async function collectFiles(dir) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...(await collectFiles(full)));
    else if (/\.(ts|mts|cts|js|mjs|cjs)$/.test(entry.name)) found.push(full);
  }
  return found;
}

/**
 * Estrae gli specifier importati da un sorgente.
 * Volutamente testuale e non un parser completo: deve girare senza
 * dipendenze aggiuntive. Copre import statico, export-from, import()
 * dinamico e require(). I commenti di blocco vengono rimossi prima, così
 * un esempio dentro un commento non produce falsi positivi.
 */
function extractSpecifiers(source) {
  const code = source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");

  const specs = [];
  const patterns = [
    /(?:^|\n)\s*import\s+(type\s+)?[^;'"]*?from\s*['"]([^'"]+)['"]/g,
    /(?:^|\n)\s*import\s+['"]([^'"]+)['"]/g,
    /(?:^|\n)\s*export\s+(type\s+)?[^;'"]*?from\s*['"]([^'"]+)['"]/g,
    /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  ];

  for (const re of patterns) {
    for (const m of code.matchAll(re)) {
      /* Se il gruppo 1 ha catturato "type ", lo specifier è nel gruppo 2. */
      const isType = m[1]?.trim() === "type";
      const spec = isType ? m[2] : (m[2] ?? m[1]);
      if (spec) specs.push({ spec, isType });
    }
  }
  return specs;
}

let failures = 0;

/* ── A. Controllo statico ─────────────────────────────────────────────── */

console.log("A. Import di api/ — nessun relativo, solo npm/builtin\n");

const files = await collectFiles(API_DIR);
if (files.length === 0) {
  console.error("❌ nessun file trovato in api/");
  process.exit(1);
}

for (const file of files) {
  const rel = relative(REPO, file);
  const specs = extractSpecifiers(await readFile(file, "utf8"));
  const problems = [];

  for (const { spec, isType } of specs) {
    if (spec.startsWith(".") || spec.startsWith("/")) {
      problems.push(
        `import relativo/assoluto "${spec}" — non risolve dopo la compilazione su Vercel`,
      );
      continue;
    }
    if (isType) continue; // cancellato in compilazione, non esiste a runtime
    if (isBuiltin(spec)) continue;
    /* "pkg/sub/path" → il nome del pacchetto è la prima parte (due per gli scope). */
    const pkgName = spec.startsWith("@")
      ? spec.split("/").slice(0, 2).join("/")
      : spec.split("/")[0];
    if (!RUNTIME_DEPS.has(pkgName)) {
      problems.push(
        `"${spec}" non è un builtin né una dependencies di package.json (è forse una devDependency? a runtime non c'è)`,
      );
    }
  }

  const shown = specs.map((s) => (s.isType ? `type ${s.spec}` : s.spec));
  console.log(`  ${rel}`);
  console.log(
    `    specifier: ${shown.length ? shown.join(", ") : "(nessuno)"}`,
  );

  if (problems.length) {
    failures += problems.length;
    for (const p of problems) console.error(`    ❌ ${p}`);
  } else {
    console.log("    ✅ autosufficiente");
  }
}

/* ── B. Esecuzione dell'handler ───────────────────────────────────────── */

console.log("\nB. Esecuzione handler con request mockata\n");

for (const entry of ENTRYPOINTS) {
  const label = `api/${entry}`;
  process.stdout.write(`  ${label}: `);

  let handler;
  try {
    const mod = await import(pathToFileURL(join(API_DIR, entry)).href);
    handler = mod.default;
  } catch (err) {
    failures++;
    console.error(`❌ import fallito — ${err.code ?? "Error"}: ${err.message}`);
    continue;
  }

  if (typeof handler !== "function") {
    failures++;
    console.error("❌ nessun export default eseguibile");
    continue;
  }

  delete process.env.SLACK_WEBHOOK_URL;
  const res = mockRes();
  try {
    await handler({ method: "POST", body: VALID_LEAD, headers: {} }, res);
  } catch (err) {
    failures++;
    console.error(`❌ throw in esecuzione — ${err?.message ?? err}`);
    continue;
  }

  if (res.out.status !== 503 || res.out.body?.error !== "config_missing") {
    failures++;
    console.error(
      `❌ atteso 503 config_missing, ricevuto ${res.out.status} ${JSON.stringify(res.out.body)}`,
    );
    continue;
  }
  console.log("✅ eseguito (503 config_missing)");
}

if (failures > 0) {
  console.error(
    `\n❌ ${failures} problema/i: api/ NON è autosufficiente a runtime. Vedi sopra.`,
  );
  process.exit(1);
}

console.log(
  `\n✅ api/ autosufficiente: ${files.length} file senza import relativi, ${ENTRYPOINTS.length} entrypoint eseguito/i.`,
);
