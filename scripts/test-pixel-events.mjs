/**
 * Test E2E degli eventi custom del Meta Pixel sulla build di PRODUZIONE.
 *
 *   node scripts/test-pixel-events.mjs
 *
 * Verifica che i 5 eventi della VSL partano davvero verso Meta:
 * VSL_Play, VSL_25, VSL_50, VSL_75, Form_Visible (+ PageView di base).
 * Apre l'URL in Chrome headless, intercetta via CDP le richieste verso
 * facebook.com/tr e stampa una tabella evento -> richiesta partita sì/no.
 *
 * ┌──────────────────────────────────────────────────────────────────┐
 * │ ⚠️  OVERRIDE USER-AGENT OBBLIGATORIO — NON RIMUOVERLO            │
 * └──────────────────────────────────────────────────────────────────┘
 * Con lo User-Agent "HeadlessChrome" di default di puppeteer,
 * fbevents.js si carica regolarmente, registra l'evento nella sua coda
 * interna (`fbq.instance.pixelsByID[<id>].eventCount` sale) e poi
 * SCARTA SILENZIOSAMENTE l'invio: nessuna richiesta /tr, nessun errore
 * in console, nessuna richiesta fallita. Un test senza override
 * restituisce 0 eventi su 5 e sembra un bug della landing: non lo è.
 *
 * Misurato il 2026-08-07 su questa stessa pagina:
 *   UA headless di default ....... 0 richieste /tr
 *   UA reale (sotto) ............. 2/2 richieste /tr (PageView + custom)
 *   UA reale + webdriver mascherato  2/2  (nessun guadagno: basta l'UA)
 *
 * Discriminante utile in caso di dubbio: una richiesta /tr costruita a
 * mano (`new Image().src = "https://www.facebook.com/tr?..."`) viene
 * sempre catturata. Se quella passa e quelle del pixel no, il problema
 * è il rilevamento di automazione, non il codice della pagina.
 *
 * ── Nessun URL e nessun pixel hardcodati ──
 * Il deployment del mercato spagnolo non esiste ancora (vedi il TODO su
 * PUBLIC_SITE_URL in astro.config.mjs) e il pixel di questo mercato non è
 * lo stesso di altri mercati. Entrambi i valori arrivano da env var e lo
 * script esce con errore se mancano: così non può puntare per sbaglio al
 * deployment o al dataset di un altro mercato.
 *
 *   TEST_TARGET_URL=https://<deployment-es> \
 *   PUBLIC_META_PIXEL_ID=<pixel-es> \
 *   node scripts/test-pixel-events.mjs
 *
 * ── VSL ancora in placeholder ──
 * Con `vsl.video = { provider: "placeholder" }` il ramo Vimeo di
 * VslSection.astro non viene renderizzato: l'overlay [data-vimeo-unmute]
 * non esiste e VSL_Play / VSL_25 / VSL_50 / VSL_75 non possono partire.
 * Di default lo script verifica quindi solo PageView e Form_Visible.
 * Con TEST_VSL=1 (dopo il passaggio di `vsl.video` da placeholder a
 * vimeo) riattiva tap + quartili e li rimette fra gli eventi attesi.
 *
 * ── Form_Visible senza aspettare 570s ──
 * Il gate si sblocca a `optinGate.timerSeconds` dal primo arrivo. Invece
 * di attendere, si retrodata `didi_vsl_first_seen_at` in localStorage e
 * si ricarica: è lo stato reale di un utente tornato dopo 10 minuti. Il
 * ramo eseguito è quello vero (tick() -> reveal(true)) — il bypass
 * ?unlock=1 chiama reveal(false) e per costruzione NON traccia, quindi
 * non è utilizzabile per questo test.
 *
 * ⚠️ Questo script spara eventi VERI al pixel di produzione: compaiono
 * in Events Manager. Usalo per verifiche puntuali, non in loop.
 */

import puppeteer from "puppeteer";

const URL_PROD = process.env.TEST_TARGET_URL ?? process.env.PUBLIC_SITE_URL;
const PIXEL_ID = process.env.PUBLIC_META_PIXEL_ID;

if (!URL_PROD) {
  console.error(
    "Setta TEST_TARGET_URL (o PUBLIC_SITE_URL): il deployment ES non è ancora noto.",
  );
  process.exit(1);
}
if (!PIXEL_ID) {
  console.error(
    "PUBLIC_META_PIXEL_ID non impostata: senza pixel di questo mercato il test non ha nulla da verificare.",
  );
  process.exit(1);
}

/* VSL_* dipendono dal player Vimeo: verificabili solo dopo il passaggio di
   vsl.video da "placeholder" a "vimeo" (vedi nota in testa al file). */
const VSL_ATTIVO = process.env.TEST_VSL === "1";

/* UA di un Chrome mobile reale: allineato al motore (Chrome) e al
   profilo di traffico della campagna (mobile). Vedi avviso in testa. */
const UA_MOBILE =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36";

const ATTESI = VSL_ATTIVO
  ? ["PageView", "Form_Visible", "VSL_Play", "VSL_25", "VSL_50", "VSL_75"]
  : ["PageView", "Form_Visible"];
const RUNS = 2;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function visita(run) {
  const tr = [];
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required"],
  });
  const page = await browser.newPage();
  await page.setUserAgent(UA_MOBILE);
  await page.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });

  /* CDP invece di page.on("request"): cattura anche beacon e ping, che
     l'API alto livello può non riportare. */
  const cdp = await page.target().createCDPSession();
  await cdp.send("Network.enable");
  cdp.on("Network.requestWillBeSent", (e) => {
    const url = e.request.url;
    if (!/facebook\.com\/tr/.test(url)) return;
    try {
      const u = new URL(url);
      tr.push({ ev: u.searchParams.get("ev"), id: u.searchParams.get("id"), url });
    } catch {
      /* URL non parsabile: ignora */
    }
  });

  const step = (s) => console.log(`  [run ${run}] ${s}`);

  await page.goto(URL_PROD, { waitUntil: "networkidle2", timeout: 60000 });
  step(`load iniziale — fbq: ${await page.evaluate(() => typeof window.fbq)}`);

  /* Retrodata il gate e azzera il dedup di sessione, poi ricarica. */
  await page.evaluate(() => {
    sessionStorage.clear();
    localStorage.setItem("didi_vsl_first_seen_at", String(Date.now() - 571000));
  });
  await page.reload({ waitUntil: "networkidle2", timeout: 60000 });
  await sleep(2500);
  const formVisibile = await page.evaluate(
    () => !!document.querySelector('[data-gate-state="unlocked"]:not([hidden])'),
  );
  step(`reload con timer scaduto → form rivelato: ${formVisibile}`);

  if (!VSL_ATTIVO) {
    step("VSL in placeholder: tap + quartili saltati (TEST_VSL=1 per attivarli)");
    const chiaviBase = await page.evaluate(() =>
      Object.keys(sessionStorage)
        .filter((k) => k.startsWith("didi_evt_"))
        .sort(),
    );
    await sleep(4000); // flush delle richieste in coda
    await browser.close();
    step(`richieste /tr catturate: ${tr.length}`);
    return { tr, chiavi: chiaviBase };
  }

  /* VSL_Play: tap sull'overlay di attivazione audio. */
  let tap;
  try {
    await page.click("[data-vimeo-unmute]");
    tap = "click reale sull'overlay";
  } catch {
    tap = await page.evaluate(() => {
      const o = document.querySelector("[data-vimeo-unmute]");
      if (!o) return "overlay assente";
      o.click();
      return "click via JS";
    });
  }
  step(`tap: ${tap}`);
  await sleep(2000);

  /* Quartili: MessageEvent sintetici con l'origin di Vimeo, stessa forma
     del payload timeupdate reale ({percent, seconds, duration}). Evita di
     dover riprodurre 10 minuti di video. L'handler in VslSection.astro
     scarta qualsiasi origin diverso, quindi l'origin va impostato. */
  for (const pct of [0.26, 0.51, 0.8]) {
    await page.evaluate((p) => {
      window.dispatchEvent(
        new MessageEvent("message", {
          origin: "https://player.vimeo.com",
          data: JSON.stringify({
            event: "timeupdate",
            data: { percent: p, seconds: p * 630, duration: 630 },
          }),
        }),
      );
    }, pct);
    await sleep(900);
  }
  step("quartili iniettati (26% / 51% / 80%)");

  const chiavi = await page.evaluate(() =>
    Object.keys(sessionStorage)
      .filter((k) => k.startsWith("didi_evt_"))
      .sort(),
  );
  step(`chiavi dedup: ${chiavi.join(", ")}`);

  await sleep(4000); // flush delle richieste in coda
  await browser.close();
  step(`richieste /tr catturate: ${tr.length}`);
  return { tr, chiavi };
}

const risultati = [];
for (let run = 1; run <= RUNS; run++) {
  console.log(`\n=== RUN ${run} ===`);
  risultati.push(await visita(run));
  if (run < RUNS) await sleep(3000);
}

const fine = new Date();

console.log("\n\n================= TABELLA EVENTI =================\n");
console.log(`evento        | ${risultati.map((_, i) => `run ${i + 1}    `).join(" | ")} | id pixel`);
console.log(`--------------|${risultati.map(() => "-----------").join("|")}|------------------`);
let tuttiOk = true;
for (const ev of ATTESI) {
  const c = risultati.map((r) => r.tr.filter((x) => x.ev === ev));
  if (c.some((n) => n.length === 0)) tuttiOk = false;
  const id = c.flat()[0]?.id ?? "—";
  const cell = (n) => (n.length ? `SÌ (${n.length})` : "NO      ").padEnd(9);
  console.log(`${ev.padEnd(13)} | ${c.map(cell).join(" | ")} | ${id}`);
}

const EV_CAMPIONE = VSL_ATTIVO ? "VSL_Play" : "Form_Visible";
console.log(`\n--- parametri di una richiesta custom (run 1, ${EV_CAMPIONE}) ---`);
const es = risultati[0].tr.find((x) => x.ev === EV_CAMPIONE);
if (es) {
  const u = new URL(es.url);
  const p = {};
  for (const [k, v] of u.searchParams) if (!/^(cd\[|udff|expv)/.test(k)) p[k] = v;
  console.log(JSON.stringify(p, null, 2).slice(0, 700));
} else {
  console.log("(nessuna — se sono tutti NO, ricontrolla l'override UA in testa al file)");
}

console.log("\n--- eventi extra inviati a Meta ---");
const extra = [
  ...new Set(
    risultati.flatMap((r) => r.tr.map((x) => x.ev)).filter((e) => e && !ATTESI.includes(e)),
  ),
];
/* SubscribedButtonClick / ViewContent non vengono dalla landing: li
   genera il rilevamento eventi automatico lato Meta. */
console.log(extra.length ? extra.join(", ") : "(nessuno)");

console.log(`\npixel id atteso: ${PIXEL_ID}`);
console.log(`esito: ${tuttiOk ? "TUTTI GLI EVENTI PARTITI ✅" : "MANCANO EVENTI ❌"}`);
console.log(
  `\n⏱  FINE: ${fine.toLocaleString("es-ES", { timeZone: "Europe/Madrid" })} (hora española)`,
);
console.log(`   UTC: ${fine.toISOString()}`);

process.exit(tuttiOk ? 0 : 1);
