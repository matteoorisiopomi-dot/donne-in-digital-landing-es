# Landing ES — Piano di lavoro

> **Mercato**: ES (Spagna). **Aggiornato**: 2026-08-18.
>
> Lista azionabile delle task aperte **per questo mercato**.
> Per il contesto strategico e le regole permanenti vedi `CLAUDE.md`.
> Il materiale ereditato dal piano IT è confinato in fondo, sotto
> "Archivio piano IT (non applicabile)": **non è vero per ES**.

---

## Stato sintetico (ES)

| Area                                                             | Stato                                            |
| ---------------------------------------------------------------- | ------------------------------------------------ |
| Scaffolding Astro + Tailwind + tokens                            | ✅                                               |
| Layout Base + font + favicon                                     | ✅                                               |
| Navbar + Footer                                                  | ✅ (logo = asset IT, cambia al rename brand)     |
| Copy castellano di Spagna (`copy.ts`)                            | ✅                                               |
| Rotte `/gracias`, `/aviso-legal`, `/privacidad`                  | ✅ (le due legali sono stub DRAFT)               |
| OptInGate + form **10 campi** (+ `motivation`, `goal`)           | ✅                                               |
| Validazione telefono **+34 solo móvil**, client+server allineati | ✅ 28/28 + 31/31 test                            |
| `api/lead.ts` — Zod + Slack blocks + CAPI dedup                  | ✅ codice pronto, **env vuote = no-op**          |
| Pixel + CAPI scaffolding                                         | ✅ codice pronto, **env vuote = no-op**          |
| `robots.txt` + sitemap                                           | ✅ build ok, ⚠ riga `Sitemap:` ancora commentata |
| A11y (main, skip-link, aria, reduced-motion)                     | ✅ ereditata, **non ri-testata su ES**           |
| **Video VSL**                                                    | ⛔ `provider: "placeholder"` — nessun video      |
| **`timerSeconds`**                                               | ⛔ `570` ereditato dal VSL IT, da ricalcolare    |
| **Dominio + `PUBLIC_SITE_URL`**                                  | ⛔ non esiste ancora                             |
| **OG image**                                                     | ⛔ assente                                       |
| **`BRAND_NAME`**                                                 | ✅ `"Chicas Digitales"` (rename 2026-09-07)      |
| **Consent cookies (RGPD/LSSI/AEPD)**                             | ⛔ non implementato — P0 ads                     |
| Lighthouse / bundle budget su build ES                           | ⬜ da misurare (i report IT sono stati rimossi)  |
| Test cross-browser + a11y su device reali                        | ⬜ da fare                                       |

---

## ⛔ Placeholder aperti — gate pre go-live

> Nessuno di questi va in produzione con traffico reale finché resta
> `PLACEHOLDER`. Tabella di verifica: prima di ogni deploy di produzione
> si ricontrolla riga per riga.

| #      | Placeholder                                              | Dove                                                 | Valore oggi                                                     | Cosa serve al go-live                                                                                |
| ------ | -------------------------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 1      | **Video VSL (Vimeo ID)**                                 | `src/content/copy.ts` → `vsl.video`                  | `{ provider: "placeholder" }`                                   | `{ provider: "vimeo", url: "https://player.vimeo.com/video/<ID>" }` con l'ID del VSL ES              |
| 2      | **Poster video**                                         | `src/content/copy.ts` → `vsl.video.poster`           | assente                                                         | `https://vumbnail.com/<ID>_large.jpg` oppure JPG locale 1920×1080 in `/public/assets/vsl-poster.jpg` |
| 3      | **`timerSeconds`**                                       | `src/content/copy.ts` → `optinGate.timerSeconds`     | `570` (ereditato dal VSL IT)                                    | **da ricalcolare**: `durataVideoES_in_secondi − 60`                                                  |
| ~~4~~  | ~~**`PUBLIC_SITE_URL`**~~ ✅ **chiuso 2026-09-07**       | env Vercel + `astro.config.mjs`                      | fallback = `https://chicasdigitales.com` (apex)                 | resta da puntare il DNS al progetto Vercel                                                           |
| 5      | **Meta Pixel**                                           | env `PUBLIC_META_PIXEL_ID`                           | vuota → no-op                                                   | Pixel ID **del mercato ES** (mai quello IT)                                                          |
| 6      | **Meta CAPI**                                            | env `META_CAPI_ACCESS_TOKEN`, `META_CAPI_DATASET_ID` | vuote → no-op                                                   | token + dataset **del mercato ES**                                                                   |
| 7      | **Slack webhook**                                        | env `SLACK_WEBHOOK_URL`                              | vuota → `/api/lead.ts` no-op                                    | incoming webhook del canale lead ES                                                                  |
| ~~8~~  | ~~**Sitemap in `robots.txt`**~~ ✅ **chiuso 2026-09-07** | `public/robots.txt`                                  | `Sitemap: https://chicasdigitales.com/sitemap-index.xml` attiva | —                                                                                                    |
| 9      | **OG image**                                             | `/public/og-image.jpg` + `src/pages/index.astro`     | **assente**, `ogImage` non passata a `Base.astro`               | asset 1200×630 ex novo + `ogImage="/og-image.jpg"` in `index.astro`                                  |
| ~~10~~ | ~~**`BRAND_NAME`**~~ ✅ **chiuso 2026-09-07**            | `src/content/copy.ts` + `api/lead.ts`                | `"Chicas Digitales"` in entrambi                                | —                                                                                                    |

---

## 🔒 Gate go-live ES (non-placeholder)

Stesso peso dei placeholder: **bloccanti**.

- **Pagine legali** — `/aviso-legal` e `/privacidad` sono **stub DRAFT
  `noindex`**, escluse da sitemap e robots. Servono i testi definitivi
  dal pacchetto legale prima del lancio; poi vanno rimesse in sitemap
  (vedi commento in `astro.config.mjs`).
- **Consent cookies** — RGPD / LSSI, linee guida **AEPD**. Da
  implementare **prima** di attivare il pixel con traffico reale.
  **P0 ads.**

---

## Port verso gli altri mercati

> Regola generale in `CLAUDE.md`: ogni fix di logica condivisa (form,
> gate timer, `api/lead.ts`, guard pixel/CAPI) si replica sugli altri
> due repo **lo stesso giorno**, commit con prefisso `port:`.

- [ ] **port (bassa priorità)**: valutare la regex +34 stretta anche sul
      repo IT, che oggi con `/^[67]\d{8}$/` accetta il range 70x sul
      selettore +34. Da fare alla prossima apertura del repo IT, **non
      ora**.

---

## Task aperte ES — sbloccate dalle dipendenze

### Quando arriva il video VSL ES

- [ ] `vsl.video` → `{ provider: "vimeo", url: "https://player.vimeo.com/video/<ID>" }`
- [ ] `poster` → `https://vumbnail.com/<ID>_large.jpg` o JPG locale 1920×1080
- [ ] **Ricalcola `optinGate.timerSeconds` = durata_secondi − 60** (oggi `570`, valore IT)
- [ ] Whitelist dominio ES + `*.vercel.app` sul provider
- [ ] Verifica LCP < 2.5s su Lighthouse mobile throttling

### Quando arriva `SLACK_WEBHOOK_URL` (canale lead ES)

- [ ] Setta env var su Vercel
- [ ] Submit reale da preview → verifica messaggio in canale
- [ ] Verifica entrambi i rami `aware=yes` / `aware=no`
- [ ] Verifica che le label del messaggio siano in castellano

### Quando arrivano le credenziali Meta **del mercato ES**

> ⚠ Mai riusare Pixel ID / dataset del mercato IT.

- [ ] `PUBLIC_META_PIXEL_ID`, `META_CAPI_ACCESS_TOKEN`, `META_CAPI_DATASET_ID`
- [ ] `META_CAPI_TEST_EVENT_CODE` (opzionale, solo per i test)
- [ ] Deploy preview → verifica `<script>` Pixel emesso in HTML
- [ ] Submit reale → `Lead` visibile in Events Manager Test Events
- [ ] Verifica dedup: stesso `event_id` client+server → Meta mostra **1** lead
- [ ] Rimuovi `META_CAPI_TEST_EVENT_CODE` dopo i test
- [ ] ⚠ **Non attivare con traffico reale prima del consent cookies**

### Quando arriva il dominio ES

- [ ] DNS su Vercel (A/CNAME)
- [ ] `PUBLIC_SITE_URL=https://<dominio-ES>` in env Vercel
- [ ] `public/robots.txt`: scommenta e aggiorna la riga `Sitemap:` (file statico, a mano)
- [ ] Verifica dominio in Meta Business Manager
- [ ] Verifica canonical + `og:url` in output build

### Quando arriva il nome brand definitivo

- [ ] Segui `BRAND_RENAME_CHECKLIST.md` (il brand vive solo in `BRAND_NAME`)
- [ ] Rigenera logo + favicon + `og-image` con il nuovo marchio

### Quando arriva la review copy finale

- [ ] Aggiorna le stringhe in `src/content/copy.ts`
- [ ] Verifica nessuna regressione layout (headline più lunga = wrap)
- [ ] Ricontrolla i divieti: zero `certificación oficial`, zero income claims

---

## Go-live checklist ES

- [ ] **Tabella placeholder**: tutte e 10 le righe chiuse
- [ ] **Gate**: pagine legali definitive + consent cookies attivo
- [ ] Lighthouse mobile **sulla build ES**: LCP < 2.5s, CLS < 0.05, INP < 200ms
- [ ] JS bundle < 30 KB, CSS < 20 KB
- [ ] Test su iPhone reale + Android reale
- [ ] Pixel events visibili in Events Manager (no test mode)
- [ ] Slack webhook live (submit reale)
- [ ] Meta Sharing Debugger: card OG renderizza
- [ ] Sitemap inviata a Google Search Console
- [ ] Test campagna con budget minimo → verifica arrivo eventi `Lead`
- [ ] **Vai live** 🚀

---

## Archivio piano IT (non applicabile)

> ⚠️ **Niente qui sotto descrive il mercato ES.** È il piano di lavoro
> del repo IT, ereditato col fork e conservato solo come traccia storica
> di come è stata costruita la logica condivisa (utile quando si applica
> la regola `port:`). Valori, date, domini, conteggi campi e metriche
> sono **quelli italiani**: timer 240s, form 8 campi, dominio `.ch`,
> `vsl.mp4` 553 MB, report Lighthouse ora rimossi.
>
> La storia IT completa sta in `CLAUDE.md`, sotto la testa ES.

<details>
<summary>Espandi il piano IT ereditato</summary>

## Stasera (2026-05-08) — sequence operativo

> Vedi `docs/go-live-checklist.md` per dettaglio step-by-step.

**Decisioni ferme**:

- Vimeo Pro account creato con email business (carta business attiva stasera)
- Dominio `.ch` registrato stasera
- Slack webhook + Meta Pixel/CAPI generati stasera

**Sequence**:

1. **Cliente**: registra dominio + crea mailbox business + Vimeo Pro signup
2. **Cliente**: upload `vsl.mp4` su Vimeo (encoding HLS può durare ore — avvia presto)
3. **Cliente**: Slack incoming webhook → URL
4. **Cliente**: Meta Business Manager → Pixel ID + CAPI token + Dataset ID
5. **Dev**: import progetto Vercel + setta env vars
6. **Dev**: refactor `VslSection.astro` per provider Vimeo (post URL+durata)
7. **Dev**: configura dominio Vercel + DNS al registrar
8. **Dev**: rimuovi `public/assets/vsl.mp4` (553 MB)
9. **Dev**: test E2E (Slack + Pixel + CAPI + video)
10. **Cliente**: review copy finale (headline VSL, sottotitolo, qualifying)

**Review copy finale** rimane aperta — `vsl.headline`, `vsl.subtitle`,
`optinGate.labels.awareLegend`. Cliente conferma stasera.

---

---

## Da fare ora — ordine di esecuzione

### Sessione 1 — Quick wins (1-2 ore)

- [x] **1a. Scaffolding `/api/lead.ts`** ✅ (2026-05-08)
  - ✅ File `api/lead.ts` creato (root level, Node runtime Vercel)
  - ✅ Validazione Zod 8 campi (name, surname, email, phone, **age**, **occupation**, aware, consent)
  - ✅ Slack rich blocks message — branch `aware=yes`/`aware=no` con header dedicato
  - ✅ AbortController 5s timeout su POST Slack
  - ✅ Error responses: 400 (validation), 405 (method), 502 (slack fail), 503 (no env), 500 (other)
  - ✅ Server log: solo email su success, payload completo solo su failure (GDPR)
  - ✅ Submit handler `OptInGate.astro` aggiornato — fetch keepalive fire-and-forget
  - ✅ `@vercel/node` + `@types/node` aggiunti come devDep
  - ✅ Type check pulito + production build OK

- [ ] **1b. Test E2E `/api/lead.ts`** (richiede Vercel project + webhook fake)
  - Genera URL temporaneo su `webhook.site`
  - Setta `SLACK_WEBHOOK_URL` su Vercel preview env (Project → Settings → Environment Variables)
  - Deploy preview Vercel
  - Curl test:
    - POST valido → 200 + payload visibile su webhook.site
    - POST con campo mancante → 400 + issues
    - POST con `aware=no` → header con ⚠️ badge
    - POST con consent=false → 400
    - GET → 405
  - Test reale form submit da preview UI (verifica fetch fire-and-forget + redirect)
  - **Fatto quando**: tutti i casi sopra passano, message format giudicato OK dal team coach
  - **Bloccante per**: nessuno scaffolding, ma Fase 3 chiusa solo dopo questo test

- [x] **2. `robots.txt` esplicito** ✅ (2026-05-08)
  - ✅ `public/robots.txt` creato con `Disallow: /gracias` + reference a sitemap
  - ✅ Verificato in build: `dist/robots.txt` presente

- [x] **3. Sitemap.xml** ✅ (2026-05-08)
  - ✅ `@astrojs/sitemap` installato
  - ✅ `astro.config.mjs` aggiornato: integration + `site` da `process.env.PUBLIC_SITE_URL`
  - ✅ Fallback locale `https://donne-in-digital.ch` (placeholder)
  - ✅ Filter esclude `/gracias` (noindex)
  - ✅ Build genera `dist/sitemap-0.xml` + `dist/sitemap-index.xml`
  - ✅ `.env.example` documenta `PUBLIC_SITE_URL`
  - ⚠ **Al go-live**: settare `PUBLIC_SITE_URL=https://<dominio-finale>.ch`
    in Vercel (Project → Settings → Environment Variables). Niente
    code change necessario — il fallback locale si usa solo in dev.
  - ⚠ **`public/robots.txt`** ha hardcoded `https://donne-in-digital.ch/sitemap-index.xml`.
    Aggiornare a mano al go-live (file statico, no env var).

- [ ] **4. Lighthouse baseline audit** (template pronto, esecuzione manuale)
  - ✅ `docs/lighthouse-baseline.md` creato con procedura + tabella da compilare
  - ⬜ **Da fare**: `npm run build && npm run preview` + Chrome incognito Lighthouse mobile → compilare numeri
  - ⚠ Caveat: con video 553 MB il baseline è dominato dal video (vedi note nel doc). Più utile rifare audit post-migrazione video per misurare delta reale.

- [x] **5. Counter spettatori — KEEP, range 25-35** ✅ (2026-05-08)
  - ✅ Range stretto e realistico (25–35 vs 19–89 precedente)
  - ✅ `sessionStorage` persistence: stesso valore su reload tab (no perdita fiducia)
  - ✅ Drift lento: ogni 6–12s, 50% probabilità ±1
  - ✅ Decisione registrata in CLAUDE.md → "Decisioni aperte"

### Sessione 2 — Tracking + form robustness (3-4 ore)

- [x] **6. Scaffolding Pixel + CAPI** ✅ (2026-05-08)
  - ✅ `src/components/tracking/Pixel.astro` — snippet standard fbevents.js,
    fire `PageView`, conditional su `PUBLIC_META_PIXEL_ID`. Senza env →
    no markup emesso (graceful, build verificato).
  - ✅ Helper `src/lib/tracking.ts` skippato — single fire site, premature
    abstraction (CLAUDE.md "Three similar lines is better than premature
    abstraction"). Logica fbq Lead inline in `OptInGate.astro`.
  - ✅ `<Pixel />` montato in `Base.astro` `<head>`.
  - ✅ `OptInGate.astro` — generate `event_id` (UUID via crypto.randomUUID),
    fire `fbq('track', 'Lead', ..., {eventID})` prima del redirect, send
    `event_id` in payload `/api/lead`.
  - ✅ `api/lead.ts` esteso — schema accetta `event_id`, post-Slack fire
    CAPI con SHA-256 hash di em/ph/fn/ln + ip + ua + fbp/fbc cookie.
    AbortController 4s timeout, fire-and-forget (CAPI failure non blocca
    response). Test event code support via env var.
  - ✅ Type check clean, production build OK.
  - ⬜ **Test reale post-go-live**: env fake → no fire (verificato in build),
    env reali → fire visibile in Events Manager Test Events.
  - ⬜ **Verifica deduplicazione**: stesso `event_id` su Pixel client + CAPI
    server → Meta deve mostrare 1 lead, non 2.

- [x] **7. Edge case validazione form** ✅ (2026-05-08)
  - ✅ **Bug pre-esistente fixato**: `pattern="[+\d\s()\-]{8,20}"` su input
    phone produceva `pattern="[+ds()-]{8,20}"` in HTML (Astro processa
    backslash come escape JS, `\d`→`d`). Pattern rifiutava telefoni
    reali con cifre. Rimosso — `setCustomValidity` JS è autoritativo.
  - ✅ **Anti-double-submit lock**: flag `submitting` al top dell'handler,
    return early se già in corso. Chiude il varco tra preventDefault
    e button.disabled.
  - ✅ **Test edge case** via `scripts/test-lead-schema.mjs` (15/15 passed):
    - email +tag (mario+ads@gmail.com): ACCEPT
    - telefono CH +41 79 123 45 67: ACCEPT
    - telefono IT con trattini: ACCEPT
    - telefono IT con prefisso 0039: ACCEPT
    - nome apostrofo (D'Angelo): ACCEPT
    - nome accenti unicode (Niccolò, Cafà): ACCEPT
    - occupation con parens: ACCEPT
    - age boundary 18 e 99: ACCEPT
    - event_id UUID: ACCEPT
    - phone solo separatori: REJECT (digit count check)
    - phone < 8 char: REJECT
    - age 17: REJECT
    - consent=false: REJECT
    - email malformata: REJECT
  - ⬜ **JS disabled fallback non implementato** (decisione 2026-05-08).
    Form ha `novalidate` per gestione UI lato JS. Senza JS niente succede.
    Traffico Meta mobile no-JS in 2026 ≈ 0% — complessità non vale.
    Limite documentato in CLAUDE.md.
  - ⬜ Test reale doppio-click rapido + UI lock visibile da fare in
    Sessione 2 task 8 (UI submit states).

- [x] **8. UI stati submit** ✅ (2026-05-08)
  - ✅ **Spinner inline** — SVG circle + arc con `animate-spin` Tailwind v4,
    `currentColor` (eredita testo bottone), `aria-hidden`. Sostituisce
    il testo "Invio in corso…" con icona + testo in flex gap-2.
  - ✅ **Console.warn DEV-only** — su `fetch().catch` logga errore solo
    se `import.meta.env.DEV`. In prod silenzioso (CLAUDE.md → no
    errori utente per problemi interni).
  - ✅ **Anti-double-submit lock** già attivo (task 7). Flag `submitting`
    al top dell'handler chiude il varco tra preventDefault e
    button.disabled.
  - ⬜ **Test manuale 3G + offline** da fare in browser:
    1. `npm run dev` → DevTools Network → Throttling: "Slow 3G"
    2. Compila form, submit. Verifica spinner visibile per ~secondi
       prima del redirect (fetch con keepalive non blocca redirect)
    3. DevTools Network → "Offline" + submit. Verifica:
       - Console DEV mostra "[lead] fetch failed"
       - Redirect a `/gracias` avviene comunque
    4. Doppio click rapido su submit → solo 1 fetch parte (Network tab)

- [~] **9. Test cross-browser su device reali** — 🟡 audit statico
  pronto, esecuzione manuale da fare (2026-05-08)
  - ✅ **Static audit cross-browser** del codice → `docs/cross-browser-bugs.md`:
    - Identifica file:line dei pattern noti rischiosi (autoplay iOS,
      `has()` Firefox <121, `backdrop-blur` Safari, `text-balance`,
      `crypto.randomUUID`, `localStorage` private mode, ecc.)
    - Risk-flagged in tabelle (basso/medio/noto)
  - ✅ **Checklist manuale step-by-step** per browser nel doc
  - ✅ **Sezione "Trappole storiche"** con 8 issue cross-browser tipici
    da osservare durante il test
  - ✅ Sezione "Risultati per browser" vuota da compilare
  - ⬜ **Esecuzione manuale richiede device reali** (non automatizzabile):
    - Safari iOS (priorità 1, autoplay è la trappola)
    - Chrome Android (priorità 2)
    - Firefox desktop (priorità 3, `has()` Firefox <121)
    - Edge desktop (priorità 4)
  - **Fatto quando**: doc compilato con bug trovati per ogni browser, fix
    P0 fatti, bug P1+ aperti come task in Sessione 3

### Sessione 3 — A11y + polish (2 ore)

- [~] **10. Audit a11y deep** — 🟡 fix statici applicati, manuale da fare
  (2026-05-08)
  - ✅ **`<main>` landmark** in `index.astro` + `gracias.astro`
  - ✅ **Skip-to-main link** in `Base.astro` + CSS in `global.css`
    (visibile solo su focus tab)
  - ✅ **`aria-label`** su `<section>` di VslSection ("Video presentazione")
    e OptInGate ("Modulo di contatto") — accessible name corretti
  - ✅ **`aria-busy="true"`** su submit button durante loading state
  - ✅ Doc `docs/a11y-audit.md` con:
    - Lista fix applicati
    - Lista cose già a posto (heading order, labels, fieldset, focus ring,
      reduced motion, lang, alt text)
    - Tap target audit (tutti ≥ 40 px, target P2 → 48 px se necessario)
    - Procedura step-by-step axe DevTools / Tab keyboard / NVDA / VoiceOver iOS
    - Sezione risultati vuota da compilare
    - Limiti noti accettati
  - ⬜ **Esecuzione manuale** richiede:
    - axe DevTools scan (browser extension)
    - NVDA su Windows o VoiceOver su iOS
    - Test reduced motion (Settings OS)
  - **Fatto quando**: doc compilato con risultati per ogni tool, zero
    violations critical/serious axe

- [x] **11. Animation polish CSS** ✅ (2026-05-08)
  - ✅ **Fade-in form** al reveal: classe `.gate-reveal` + `.is-revealed`,
    transition 360ms opacity + translateY(14px). Force reflow via
    `void offsetHeight` prima di applicare classe.
  - ✅ **Smooth scroll** a form post-reveal: `scrollIntoView({ behavior:
"smooth", block: "start" })`. Rispetta `prefers-reduced-motion` →
    `behavior: "auto"`.
  - ✅ **CTA pulse**: animazione `cta-pulse` su submit button — pulse rosa
    sottile via box-shadow, 2.4s ease-out infinite. Si ferma su `:disabled`
    (loading state). Rispetta `prefers-reduced-motion`.
  - ✅ Tutto puro CSS, niente librerie. Build OK.

- [x] **12. Skeleton/loading state video** ✅ (2026-05-08)
  - ✅ **Gradient palette** (ink → plum → rose → plum → ink) con shimmer
    4s lineare, copre il box video MP4 finché `loadeddata` non scatta.
  - ✅ **Spinner SVG** centrato, h-12 w-12, color paper/50, animate-spin
    Tailwind. Stessa estetica del submit spinner.
  - ✅ Solo per provider="mp4" (iframe Vimeo/YouTube hanno loader proprio).
  - ✅ Fade-out 320ms su `loadeddata` o se `readyState >= 2` (video in cache).
  - ✅ Rispetta `prefers-reduced-motion` (skeleton non shimmera ma resta visibile).
  - ✅ `aria-hidden="true"` (decorativo, non legge da screen reader).

### Sessione 4 — Pulizia P3 (30 min) ✅ (2026-05-08)

- [x] **13. README repo personalizzato** ✅ (2026-05-08)
  - ✅ Riscritto: contesto VSL squeeze (vs vecchio "PDF lead magnet"),
    rimossi riferimenti a Brevo (mai usato), aggiunti tutti i pointer
    ai doc (CLAUDE.md, TODO.md, a11y-audit.md, cross-browser-bugs.md,
    lighthouse-baseline.md, testing-staging.md).
  - ✅ Tabelle: stack, comandi, env vars, architettura backend.
  - ✅ Stato corrente al 2026-05-08 + cosa manca.

- [x] **14. Cleanup `.DS_Store`** ✅ (2026-05-08)
  - ✅ Working tree pulito (`git status` clean).
  - ✅ `.DS_Store` non presente in repo (Windows non genera).
  - ✅ `.gitignore` riga 21 copre `.DS_Store` per quando il progetto
    si sposta su Mac (verificato con `git check-ignore`).

- [x] **15. Verifica `.gitignore` per `vsl.mp4`** ✅ (2026-05-08)
  - ✅ `git check-ignore public/assets/vsl.mp4` → match (riga 24
    `public/assets/*.mp4`).
  - ✅ Pattern copre anche `.mov` e `.webm` per sicurezza futura.

- [x] **16. Documentazione query param testing** ✅ (2026-05-08)
  - ✅ `docs/testing-staging.md` creato. Contiene:
    - Query string `?unlock=1` (salta timer) / `?reset=1` (svuota storage)
    - Procedura step-by-step funnel completo (6 sezioni: prima visita,
      sblocco, submit, Slack post-Fase 3, reset, persistenza 24h)
    - Test su device reali via ngrok
    - Differenza dev (timer reset always) vs prod
    - Pulizia stato (incognito vs DevTools manual)
  - ✅ Pronto da condividere col cliente in staging.

---

</details>
