# Landing ES — Contesto e regole permanenti

> ## ⚠️ IL RESTO DI QUESTO FILE È LA COPIA VERBATIM DEL REPO ITALIANO.
>
> Da questa sezione in giù il contenuto è stato ereditato con il fork per
> il mercato **ES** e non è ancora stato riscritto. Prendilo come contesto
> storico del funnel, **mai** come descrizione dello stato attuale:
> seguirlo alla lettera fa reintrodurre esattamente ciò che la migrazione
> ES ha rimosso.
>
> **Fonte di verità per il mercato ES:** questa sezione di testa +
> [`BRAND_RENAME_CHECKLIST.md`](./BRAND_RENAME_CHECKLIST.md) +
> [`LANDING_COPY_ES.md`](./LANDING_COPY_ES.md) + i commenti in
> `src/content/copy.ts`.

## Regole permanenti (mercato ES)

### Repo e fratelli

Questo è il repo della **landing ES**. Repo fratelli:

| Repo | Ruolo |
| --- | --- |
| `donne-in-digital-landing` | mercato **IT**, **PRODUZIONE** — **intoccabile da qui** |
| `donne-in-digital-landing-es` | questo repo, mercato ES |
| `donne-in-digital-landing-de` | mercato DE |

Da una sessione di lavoro su questo repo non si scrive **mai** nulla
fuori da questa cartella.

### Regola port

Ogni fix di **logica condivisa** — form, gate timer, `api/lead.ts`,
guard pixel/CAPI — va replicato negli **altri due repo lo stesso
giorno**, con commit dal prefisso **`port:`**.

### Copy

Stringhe utente in **castigliano di Spagna**, **tuteo**, registro sobrio,
**anti-hype**.

- **VIETATO** `certificación oficial`: sempre **`certificado emitido por
  {BRAND_NAME}`**.
- **Zero income claims.**

### Brand

Il brand vive **SOLO** nella costante **`BRAND_NAME`**
(`src/content/copy.ts`), oggi placeholder `"Donne in Digital"`. Il rename
è previsto a breve (nome in screening): seguire
[`BRAND_RENAME_CHECKLIST.md`](./BRAND_RENAME_CHECKLIST.md).

### Telefono

Solo **+34 mobile**, regex `/^(?:6\d|7[1-9])\d{7}$/`. Client e server
**allineati**. Il range `70x` è **escluso di proposito**: è *numeración
personal*, non un móvil, e l'hint del form promette "Solo números de móvil".

### Tracciamento

Solo **env di questo mercato**. **Vietati gli ID del mercato IT.** Env
vuote = **no-op**: è il comportamento voluto, non un bug.

### Pagine legali

`/aviso-legal` e `/privacidad` sono **stub DRAFT `noindex`**: sono un
**gate del go-live**.

### P0 ads

**Consent cookies** (RGPD / LSSI, linee guida **AEPD**) **prima** di
attivare il pixel con traffico reale.

## Differenze note vs copia IT (elenco non esaustivo)

| Nella copia IT sotto | In questa codebase |
| --- | --- |
| rotta `/grazie` | rotta **`/gracias`** |
| video Vimeo `1190625710` / `1215128575` | `vsl.video = { provider: "placeholder" }` — nessun video, **niente traffico paid finché resta così** |
| `optinGate.timerSeconds = 240` | `570` ereditato dal VSL IT, da **ricalcolare** (`durata − 60`) all'arrivo del VSL ES |
| env `SITE_URL` | env **`PUBLIC_SITE_URL`** (`astro.config.mjs`) |
| dominio `vsl.donneindigital.ch` | nessun dominio: fallback `https://example-PLACEHOLDER.invalid` |
| form a 8 campi | **10 campi**: + `motivation` + `goal` (risposte aperte) |
| `og-image.jpg` presente | **assente**, da creare ex novo |
| `public/site.webmanifest` statico | generato da `src/pages/site.webmanifest.ts` |
| telefono IT/CH | **solo ES (+34)**, solo móviles `6x` / `71x-79x` |
| "niente pagina privacy" | `/privacidad` e `/aviso-legal` presenti come **stub BORRADOR** |
| copy italiano | copy **castellano di Spagna** in `src/content/copy.ts` |
| `docs/` con audit e report Lighthouse | **cartella rimossa**: erano metriche e doc del sito IT |

> **📋 Task list azionabile**: vedi [`TODO.md`](./TODO.md) per il piano
> di lavoro corrente con priorità, file coinvolti e criteri di "fatto".
> Questo file (CLAUDE.md) contiene il contesto strategico; TODO.md
> contiene le task operative.

## TL;DR

**Pagina VSL squeeze pura.** Una sola schermata: video + countdown timer.
Il timer scade **un minuto prima della fine del video**. Quando scade, si
sblocca il form opt-in con cinque campi: **nome, cognome, email, telefono,
qualifying question** (sì/no sulla consapevolezza dell'investimento futuro)
\+ checkbox consenso GDPR. Submit → redirect a `/gracias` (ES; nel repo
IT era `/grazie`). Niente altre
sezioni. Tutta la persuasione la fa il video. **Niente lead-magnet PDF**:
dopo il submit la coach del team richiama il contatto al numero lasciato.

## Stato attuale (al 2026-05-09)

> **Aggiornamento 2026-08-03**: sostituito ID video Vimeo VSL
> `1190625710` → `1215128575` (VSL v3 da 10:30). Modificato solo
> `src/content/copy.ts` (`vsl.video.url` + `poster`). I riferimenti
> storici all'ID precedente nel resto di questo file sono lasciati
> invariati per non falsare la cronologia.

**Cosa funziona già:**
- ✅ Scaffolding Astro 6 + Tailwind v4 + TypeScript strict + Zod.
- ✅ Layout `Base.astro` (head, OG, font Inter + Fraunces self-hosted,
  supporto `noindex`).
- ✅ Palette + design tokens in `global.css` (revisione satura
  2026-05-07, vedi sezione "Palette" per i valori correnti).
- ✅ `VslSection.astro`: headline + sottotitolo + player video con
  overlay "tocca per attivare l'audio". Autoplay muted di default,
  unmute → restart da `currentTime=0` + restart timer sincronizzato.
- ✅ **Video VSL su Vimeo Pro** (migrato 2026-05-09, commit `ab2cea2`).
  `vsl.video.provider = "vimeo"`, URL `https://player.vimeo.com/video/1190625710`,
  poster da `vumbnail.com`. Durata 5 min → `optinGate.timerSeconds = 240`.
  `vsl.mp4` (553 MB) eliminato da `public/assets/`. Adaptive HLS,
  niente bandwidth Vercel. Whitelist Vimeo include `vsl.donneindigital.ch` + `*.vercel.app`.
- ✅ `OptInGate.astro`: countdown timer 240s + form gated.
  Persistenza localStorage 24h in prod, reset automatico ad ogni
  reload in dev. Query string `?unlock=1` / `?reset=1` per testing.
- ✅ Form a **7 campi** (nome, cognome, email, telefono, età,
  occupazione, qualifying question) + consent GDPR. Validazione
  client-side (HTML5 + pattern telefono IT/CH). Bottone "Invia".
- ✅ Submit → redirect a `/gracias` (UI-only, **niente backend**).
- ✅ `/gracias`: messaggio "ti chiama la coach del team, entro 48h",
  `noindex`.
- ✅ Componenti di riserva (Pain/Transformation/SocialProof/HowItWorks)
  presenti in repo ma non renderizzati.
- ✅ **Polish pass 2026-05-07** (in coda alle P2/P3 di questa
  iterazione):
  - `preload="metadata"` sul player video (niente download bulk al
    page-load, mitigazione parziale del macigno da 553 MB).
  - copy `/grazie` allineato al SLA "entro 48h".
  - validazione telefono client-side: ≥ 8 digit numerici via
    `setCustomValidity`, oltre al pattern HTML.
  - a11y countdown: tolto lo spam `aria-live` (cambiava ogni 250ms),
    aggiunta live region dedicata che annuncia una sola volta lo
    sblocco del form. Box locked marcato `aria-hidden="true"`.
  - a11y counter spettatori: parent `aria-hidden="true"` (è un
    elemento decorativo + finto, non va letto dagli screen reader).
  - rimossi `.DS_Store` dal working tree + cancellate dir vuote
    `src/pages/api/` e `src/lib/`.
  - rimosso `labels.error` dead code da `copy.ts`.
- ✅ **Cleanup footer + consent + OG image (2026-05-07)**:
  - footer: rimossi link Privacy/Cookie e relativo `legalLinks` da
    `copy.ts`. Copyright ora `<p>` allineato a destra.
  - consent checkbox: rimosso link a privacy policy.
    `labels.consent` ridotto a singolo `text` (testo del consenso al
    trattamento integro).
  - `Base.astro`: prop `ogImage` ora opzionale, `og:image` non viene
    emesso quando manca l'asset (niente più 404 sui crawler social),
    `twitter:card` cade su `"summary"`.
- ✅ **Navbar + logo brand (2026-05-07, SVG aggiornato + trim 2026-05-08)**:
  - **Logo SVG vettoriale** in `/public/assets/logo.svg` (8 KB,
    viewBox `180 114 588 373` trimmato, `fill="#18082a"`). PNG legacy
    mantenuto come fallback in `/public/assets/logo.png` (112 KB).
  - **viewBox trim** (2026-05-08): rimosso padding interno SVG
    (artwork era 60% del viewBox originale 947×593) → logo ingrandito
    1.61× senza overflow. Computato via `scripts/compute-svg-bbox.mjs`.
  - **`Navbar.astro`**: header fisso, h-16 mobile / h-[78px]
    desktop, glass (`bg-white/20 backdrop-blur-md`), logo centrato
    cliccabile su `/`. Logo `h-[62px] sm:h-[76px]` (gap 1px sopra/sotto
    centrato). Spacer `<div>` in coda per riservare l'altezza esatta.
  - **`brand` export** in `src/content/copy.ts`: single source of
    truth (`name`, `logoSrc`, `logoWidth=588`, `logoHeight=373`
    intrinseci, post-trim). `logoWidth/Height` evitano CLS — la
    dimensione visiva è gestita via Tailwind nei componenti.
  - **`Footer.astro`** rinnovato: wordmark testuale → logo immagine
    (`h-10 sm:h-[46px]`); copyright `<p>` allineato a destra.
  - **Navbar montata** sia su `index.astro` sia su `gracias.astro`.

- ✅ **Favicon brand completo (2026-05-07).** Set generato da
  favicon.io a partire dal logo "D":
  - `/public/favicon.svg` (3.2 KB) — primario per browser moderni
  - `/public/favicon-32x32.png`, `favicon-16x16.png` — fallback PNG
  - `/public/favicon.ico` — Safari < 16 + email client
  - `/public/apple-touch-icon.png` (180×180) — iOS home screen e
    tab Safari mobile (iOS non supporta SVG favicon)
  - `/public/android-chrome-192x192.png`, `512x512.png` — Android
    "Add to Home Screen"
  - `/public/site.webmanifest` — manifest PWA (`name`, `short_name`,
    `theme_color: #18082a` ink per status bar mobile,
    `background_color: #e8aacf` paper).
  Il bundle copre tutti i device. `Base.astro:37-42` referenzia
  l'intera batteria.

- ✅ **Sessione 1 — Quick wins (2026-05-08)**:
  - **`/api/lead.ts`** Vercel serverless function (Opzione B, root
    level fuori `src/pages/`). Validazione Zod 8 campi, post Slack
    rich blocks (header dedicato per `aware=no`), AbortController 5s
    timeout, error responses 400/405/502/503. Submit lato client
    fire-and-forget con `fetch keepalive`. Logging GDPR-conscious
    (solo email su success).
  - **`robots.txt`** con `Disallow: /gracias` + reference sitemap.
  - **Sitemap.xml** via `@astrojs/sitemap`, filter esclude `/gracias`.
    `astro.config.mjs` legge `process.env.PUBLIC_SITE_URL` con fallback
    `https://example-PLACEHOLDER.invalid`. Al go-live: settare env
    var su Vercel, niente code change.
  - **Counter spettatori** confermato KEEP, range stretto 25–35,
    persistenza `sessionStorage`, drift lento 6–12s ±1.

- ✅ **Sessione 2 — Tracking + form robustness (2026-05-08)**:
  - **Pixel + CAPI scaffolding**:
    - `Pixel.astro` (montato in `Base.astro` head): fire `PageView`
      condizionale su `PUBLIC_META_PIXEL_ID`. Senza env → no markup.
    - `OptInGate.astro`: genera `event_id` UUID, fire `fbq('track','Lead', …, {eventID})`,
      invia `event_id` al server.
    - `api/lead.ts`: post-Slack fire CAPI con SHA-256 hash di
      em/ph/fn/ln + ip + ua + fbp/fbc cookie. AbortController 4s,
      best-effort (failure non blocca response).
    - Attivazione = solo env vars Vercel.
  - **Edge case validazione form**:
    - **Bug fixato**: `pattern="[+\d\s()\-]"` produceva `[+ds()-]` in
      output HTML (Astro escape JS) → rifiutava telefoni reali.
      Rimosso. `setCustomValidity` JS è autoritativo.
    - Anti-double-submit lock via flag `submitting`.
    - `scripts/test-lead-schema.mjs`: 15/15 edge cases passed
      (email +tag, telefono CH/IT, accenti unicode, age boundary, ecc.).
  - **UI submit states**: spinner SVG inline `animate-spin` accanto
    "Invio in corso…", `console.warn` DEV-only su fetch fail.

- ✅ **Sessione 3 — A11y + animation polish + video skeleton (2026-05-08)**:
  - **A11y deep**:
    - `<main id="main">` landmark in `index.astro` + `gracias.astro`
    - Skip-to-main link in `Base.astro` (sr-hidden until tab focus)
    - `aria-label` su `<section>` di VslSection ("Video presentazione")
      e OptInGate ("Modulo di contatto")
    - `aria-busy="true"` su submit button durante loading
    - `docs/a11y-audit.md` con checklist axe / NVDA / VoiceOver
  - **Animation polish CSS**:
    - Form fade-in al reveal (`gate-reveal` + `is-revealed`, 360ms)
    - Smooth scroll a form post-reveal (`scrollIntoView`,
      rispetta `prefers-reduced-motion`)
    - CTA submit pulse (`cta-pulse` 2.4s box-shadow ripple,
      ferma su `:disabled`, rispetta `prefers-reduced-motion`)
  - **Video skeleton MP4**: gradient palette ink→plum→rose con
    shimmer 4s + spinner SVG centrato, fade-out su `loadeddata`
    (o subito se `readyState >= 2` cache). `aria-hidden`.

- ✅ **Sessione 4 — Cleanup P3 (2026-05-08)**:
  - `README.md` riscritto (era default Astro outdated): pointer a
    tutti i doc, tabelle stack/comandi/env, stato corrente.
  - `docs/testing-staging.md` per QA cliente: query string
    `?unlock=1`/`?reset=1`, procedura funnel completo, ngrok device
    reali, dev vs prod.
  - `.DS_Store` non in working tree (Win), `.gitignore` lo copre
    per Mac. `vsl.mp4` ignorato via `public/assets/*.mp4`.

- ✅ **Audit performance + bundle (2026-05-08)**:
  - **Lighthouse mobile** (con video MP4 553 MB ancora in build, via
    preload="metadata"):
    - Landing: **99/100 perf · 100/100 a11y · LCP 2.2s · CLS 0.002 · TBT 0ms**
    - /grazie: **99/100 perf · 100/100 a11y · LCP 2.1s · CLS 0.001**
  - **Bundle**: CSS 6.92 KB gzip (target < 20 KB) · JS inline 1.80 KB
    gzip (target < 30 KB). Tutto sotto budget.
  - Report HTML in `docs/lighthouse-mobile.report.html` +
    (il report della thank-you page IT è stato rimosso da questa copia).

- ✅ **Code review** via cavecrew-reviewer (2026-05-08): zero bug.
  Solo style fix preventivo: `randomUUID` import esplicito da
  `node:crypto` invece di `crypto.randomUUID()` global.

- ✅ **Sessione 5 — Go-live tecnico (2026-05-09)**:
  - **Vimeo Pro migration** (commit `ab2cea2`): provider `mp4`→`vimeo`,
    URL `https://player.vimeo.com/video/1190625710`, poster vumbnail.
    `vsl.mp4` (553 MB) eliminato. Domain whitelist Vimeo configurata.
  - **Slack webhook** (commit `db9d658`): `SLACK_WEBHOOK_URL` settato
    su Vercel env vars. `/api/lead.ts` operativo.
  - **Meta Pixel + CAPI** (commit `db9d658` + fix `5295318` IIFE
    unwrap): `PUBLIC_META_PIXEL_ID`, `META_CAPI_ACCESS_TOKEN`,
    `META_CAPI_DATASET_ID` settati su Vercel.
  - **Dominio Namecheap → Vercel**: registrato `donneindigital.ch`
    su Namecheap. Sottodominio `vsl.donneindigital.ch` configurato
    via CNAME `vsl` → `5aa539b106e9a551.vercel-dns-016.com.`
    (Namecheap Advanced DNS). Vercel ✅ Valid Configuration,
    HTTPS auto Let's Encrypt.
  - **`SITE_URL`** env var su Vercel = `https://vsl.donneindigital.ch`,
    redeploy production fatto.
  - **`robots.txt` + `astro.config.mjs`** già allineati a
    `https://vsl.donneindigital.ch` (no edit necessario).
  - **Caveat propagazione DNS mobile**: dopo CNAME setup, dominio
    risolveva da PC ma non da telefono su 4G/5G — DNS carrier
    (TIM/Vodafone/Wind/Iliad) propaga 1-24h più lento di
    resolver pubblici (1.1.1.1, 8.8.8.8). Risolto da solo entro ~1h.
    Workaround se urgente: app Cloudflare 1.1.1.1, o WiFi (router
    DNS più veloce di carrier).

- ✅ **Sessione 6 — Privacy page + final go-live (2026-05-09)**:
  - **`src/pages/privacy.astro`** aggiunta (informativa GDPR + nLPD CH).
    `PRIVACY_EMAIL = "donneindigital@gmail.com"`, `LAST_UPDATED =
    "9 maggio 2026"`. Marcata `noindex`.
  - **Footer**: link `Privacy Policy` discreto sotto disclaimer
    (`text-[10px]`, opacity `/30` per blend con sfondo, hover
    sale a `/70` per leggibilità).
  - **OptInGate**: `<p>` "Consultabile la nostra Privacy Policy."
    sotto label consent (no refactor `copy.ts`, hardcode inline).
  - Commit `57338e5` feat(privacy) + `9cc9667` docs(CLAUDE.md).
  - **Test E2E live ✅**: submit form reale → Slack message ricevuto +
    Lead event Meta visibile + redirect `/grazie` ok.
  - **Privacy page live ✅**: `https://vsl.donneindigital.ch/privacy`
    render OK.
  - **STATO: PRONTA PER PAID TRAFFIC**. Unica voce pendente:
    verifica dominio Meta Business Manager (DNS TXT, da fare
    entro 48h da launch — non bloccante).

## Cosa manca prima del go-live

Lista ordinata per priorità. Le P0 sono bloccanti — finché non sono
risolte **non si lancia traffico paid**.

### P0 — Bloccanti (non si va online finché non sono fatte)

> **Tutte chiuse 2026-05-09.**

- ✅ **Video VSL su Vimeo Pro** (chiusa 2026-05-09, commit `ab2cea2`).
  Provider `vimeo`, URL `https://player.vimeo.com/video/1190625710`,
  durata 5 min, `optinGate.timerSeconds = 240`. `vsl.mp4` 553 MB
  eliminato da `public/assets/`.
- ✅ **Wiring Slack** (chiusa 2026-05-09, commit `db9d658`).
  `SLACK_WEBHOOK_URL` env settata su Vercel. `/api/lead.ts` operativo.
- ✅ **OG image** (chiusa 2026-05-08). Asset 1200×630 33 KB JPG in
  `/public/og-image.jpg`. `index.astro` passa `ogImage="/og-image.jpg"`.
  `Base.astro` emette `og:image` + dimensioni + tipo + `twitter:image` +
  `twitter:card="summary_large_image"`.

### P1 — Alto impatto (prima del paid traffic vero)

- ✅ **Meta Pixel + CAPI (Fase 4)** — chiusa 2026-05-09, commit `db9d658`
  + fix `5295318` (IIFE unwrap). Env vars settati su Vercel:
  `PUBLIC_META_PIXEL_ID`, `META_CAPI_ACCESS_TOKEN`, `META_CAPI_DATASET_ID`.
  PageView client-side + Lead client+server con dedup `event_id`,
  hash SHA-256 user_data. **Acceso senza cookie banner** (decisione
  2026-05-07). Trade-off legale registrato in "GDPR".
  ⬜ **Verifica Meta Business `vsl.donneindigital.ch`** — DNS TXT
  pending (cliente farà più tardi). Senza, ottimizzazione campagne
  Meta penalizzata ma Pixel/CAPI funzionano.
- ✅ **Logo SVG vettoriale** (2026-05-08). `/public/assets/logo.svg`
  (8 KB, viewBox 947×593). Convertito da PNG via SVGcode.app
  (potrace), `fill="#18082a"` aggiunto al root per match palette
  ink. Wired in `brand.logoSrc` di `copy.ts`. Aspect ratio identica
  al PNG (1.597:1) → zero CLS shift sul cambio. PNG fallback resta
  in `/public/assets/logo.png` finché render SVG non verificato su
  device reali.
- ✅ **Dominio `donneindigital.ch`** — chiuso 2026-05-09. Registrato
  su Namecheap. Sottodominio `vsl.donneindigital.ch` configurato via
  CNAME `vsl` → `5aa539b106e9a551.vercel-dns-016.com.` Vercel ✅
  HTTPS Let's Encrypt. `SITE_URL` env = `https://vsl.donneindigital.ch`.
  Vimeo whitelist + `robots.txt` + `astro.config.mjs` allineati.
  ⬜ **Verifica Meta Business** = unica voce pendente (cliente più tardi).
- ✅ **Decisione palette: satura confermata** (2026-05-08). Valori
  2026-05-07 mantenuti: paper #e8aacf salmon, body c4a0dc→e8aacf,
  muted #52246a, ink #18082a. Trade-off accettato vs brief originale
  "premium maison toni chiari" — il registro saturo dà più impatto
  visivo per il funnel paid Meta. Niente azione di code, doc allineati.

### P2 — Medio (qualità prodotto / conversione)

- ✅ **Counter spettatori finto** in `VslSection.astro` — KEEP, range
  25–35 (deciso 2026-05-08). Persiste `sessionStorage` (no salto a
  caso su reload tab), drift lento 6–12s ±1 entro [25,35]. A11y
  sistemato (`aria-hidden`).
- 🟡 **Copy review finale cliente** — STASERA. `vsl.headline`,
  `vsl.subtitle`, `optinGate.labels.awareLegend`, `vsl.stepLabel`.
  Cliente conferma stasera nella stessa sessione.

### P3 — Pulizia (non bloccante)

- ✅ **README** riscritto (2026-05-08). Pointer a tutti i doc, tabelle
  stack/comandi/env vars, stato corrente.
- ✅ **`.DS_Store`** non in working tree (Win), `.gitignore` lo copre
  per Mac (verificato `git check-ignore`).
- ✅ **`vsl.mp4` ignorato** via `public/assets/*.mp4` in `.gitignore`.
- ✅ **Doc query param testing** in `docs/testing-staging.md`.

### Dipendenze sbloccanti dal cliente — STATO 2026-05-09

- ✅ **dominio** registrato (Namecheap, `donneindigital.ch`, sub `vsl`)
- ✅ **carta business** (Vimeo Pro attivo)
- ✅ **Vimeo Pro signup** + upload video (ID 1190625710)
- ✅ **`SLACK_WEBHOOK_URL`** generato + settato Vercel
- ✅ **Meta Pixel ID + CAPI Access Token + Dataset ID** + settati Vercel
- ⬜ **Verifica dominio Meta Business** (DNS TXT) — cliente più tardi
- 🟡 **Review copy finale** (headline, sottotitolo, qualifying) —
  stato cliente non confermato

## Contesto business

Landing page di lead-generation per il brand `{BRAND_NAME}`.
Obiettivo: convertire traffico paid (Meta Ads) in **lead telefonici**
qualificati. Dopo il submit, una coach del team richiama il contatto
entro 48h per presentare il percorso di formazione.

**Target:** donne italiane 25–50, lavori percepiti come bloccati (parrucchiera,
commessa, impiegata sottopagata, partita IVA stanca). Routine pesante,
stipendio basso, sensazione di stallo.

**Promessa:** imparare a lavorare da remoto gestendo chat, messaggi e
presenza online di piccole aziende. 1–2k/mese partendo da zero.

**Funnel — VSL squeeze pura:**
1. video ads Meta (6 varianti) → landing.
2. Sopra il fold: **video VSL** + countdown timer (niente headline,
   niente sottotitolo: solo il player).
3. Il **timer scade un minuto prima della fine del video**: solo a quel
   punto il box opt-in viene rivelato.
4. Form: **nome, cognome, email, telefono**, **domanda qualificante
   sì/no** ("Sai che il percorso completo richiede un investimento?"),
   consenso GDPR.
5. Submit → redirect a `/gracias`. La coach del team richiama il
   contatto entro 48h al numero lasciato.
6. Notifica Slack al team con i dati del form: **da collegare in
   futuro** (vedi Fase 3). Pixel/CAPI in Fase 4.

**Note importanti sul funnel:**
- Niente sezioni Pain/Transformation/SocialProof/HowItWorks sopra o
  sotto il fold: tutta la persuasione la fa il **video**. I componenti
  esistono ancora in `src/components/` come riserva (vedi sotto), ma
  **non vengono renderizzati**.
- Il flag della qualifying question (`aware`) deve arrivare nella
  notifica Slack **anche se l'utente risponde "no"**, con badge
  esplicito ("ha risposto NO alla domanda di consapevolezza"). Il
  lead **non viene scartato** — viene **taggato**, e la coach decide
  in fase di chiamata come trattarlo.
- **Niente Google Sheets:** lo storage gsheet è stato rimosso dal
  funnel. La notifica Slack è l'unica destinazione del payload.

## Tono di voce (non negoziabile)

- Diretto, asciutto, frasi corte. **Niente fuffa motivazionale.**
- Empatico ma adulto. **Niente toxic positivity**, niente "cambia la tua vita
  oggi!".
- Italiano informale: **tu** (mai voi, mai lei).
- Riprendi il linguaggio degli ads:
  > "Non è una vita brutta. È solo che sembra sempre uguale."
  > "Un k, anche due al mese."
  > "partite da zero."
- No emoji nei testi della landing salvo decisione esplicita.
- No claim assoluti tipo "garantito", "100%", "sicuro": problemi legali
  + stona col tono.

## Stack

- **Astro 6** (output statico, deploy Vercel)
- **Tailwind CSS v4** (via `@tailwindcss/vite`)
- **TypeScript** strict (estende `astro/tsconfigs/strict`)
- **Zod** per validazione input lato server
- **Form / lead notification:** notifica **Slack** al team (incoming
  webhook). Niente Google Sheets, niente provider email. Il follow-up
  è una **chiamata telefonica** dalla coach del team, gestita fuori
  da questo repo.
- **Tracking:** Meta Pixel (client) + Conversions API (server),
  deduplicati via `event_id`

## Vincoli tecnici

### Performance budget
- **LCP < 2.5s** su 4G mobile italiano
- **CLS < 0.05**
- **INP < 200ms**
- **JS totale in pagina < 30 KB** (escluso Pixel)
- **CSS totale < 20 KB**

Ogni 100ms in più brucia conversioni reali. Prima di aggiungere qualunque
script o dipendenza, valuta l'impatto su questi numeri.

### Mobile-first
95%+ del traffico arriverà mobile da Meta Ads. Disegna mobile prima,
adatta desktop dopo. Test su device reale prima del go-live, non solo
DevTools.

### Asset
- **Immagini:** WebP, dimensioni esatte, `loading="lazy"` ovunque tranne
  hero. `width`/`height` espliciti per evitare CLS.
- **Font:** massimo 2 weight, self-hosted in `public/fonts/`,
  `font-display: swap`, preload del woff2 critico nel layout.
- **Niente icon-font.** Icone come SVG inline o sprite.

### Niente dipendenze pesanti
- No Framer Motion / GSAP / animation libs → animazioni in CSS puro.
- No librerie UI (Radix, Headless UI, ecc.) → componenti scritti a mano.
- No Lodash / Moment / date-fns → API native.
- No analytics extra oltre Meta Pixel + CAPI. GA4 si aggiunge solo se
  richiesto esplicitamente.

## Convenzioni di codice

- **Componenti `.astro`** per UI statica. **No React/Vue/Svelte** finché
  non c'è un motivo concreto e misurabile.
- **Naming:** `PascalCase` per componenti, `camelCase` per funzioni e
  variabili, `kebab-case` per file di route.
- **Una sezione = un componente** in `src/components/`. Zero stile globale
  fuori da `src/styles/global.css`.
- **Tailwind only.** No CSS modules, no styled-components. Se una stessa
  combinazione di classi si ripete > 3 volte, estrai un componente — non
  usare `@apply`.
- **Copy centralizzato** in `src/content/copy.ts`. I componenti importano
  stringhe, **non le scrivono inline**. Serve per A/B test futuri e per
  permettere review del solo copy senza toccare markup.
- **Variabili d'ambiente:**
  - `import.meta.env.PUBLIC_*` per ciò che il browser deve leggere
    (es. `PUBLIC_META_PIXEL_ID`).
  - `import.meta.env.*` (no prefisso) per segreti server (es.
    `META_CAPI_ACCESS_TOKEN`, `SLACK_WEBHOOK_URL`). **Mai** chiavi
    private nel client.
- **TypeScript strict.** Niente `any`. Se non sai il tipo, definiscilo o chiedi.
- **Commenti:** solo dove il *perché* non è ovvio. Non commentare il *cosa*.
  Niente TODO orfani: o lo fai, o apri una issue.

## Struttura del progetto

```
api/                      # Vercel serverless functions (root, NON dentro src/)
  lead.ts                 # POST: Zod + Slack rich blocks + CAPI fire dedup (Fase 3+4)
docs/
  a11y-audit.md           # Static audit + checklist axe/NVDA/VoiceOver
  cross-browser-bugs.md   # Static audit + checklist test device reali
  go-live-checklist.md    # Sequence operativo stasera + test E2E
  lighthouse-baseline.md  # Procedura + risultati Lighthouse mobile
  lighthouse-mobile.report.html/.json   # Report landing
  (report lighthouse di /gracias: rimossi, erano metriche IT)
  testing-staging.md      # Query string ?unlock=1 ?reset=1 + procedura QA
  vercel-setup.md         # Step-by-step deploy Vercel
scripts/
  compute-svg-bbox.mjs    # Computa bounding box SVG path (per trim viewBox)
  test-lead-schema.mjs    # Test 15 edge cases Zod schema
src/
  components/
    Navbar.astro          # header fisso, logo centrato, glass effect
    VslSection.astro      # headline + sottotitolo + player video + skeleton
    OptInGate.astro       # countdown timer + form gated + fade-in + scroll
    Footer.astro          # logo + tagline + copyright + disclaimer
    SectionWrapper.astro  # helper riusabile (riserva)
    PainSection.astro     # RISERVA — non renderizzata
    Transformation.astro  # RISERVA — non renderizzata
    SocialProof.astro     # RISERVA — non renderizzata
    HowItWorks.astro      # RISERVA — non renderizzata
    tracking/
      Pixel.astro         # Meta Pixel base, conditional su PUBLIC_META_PIXEL_ID
  content/
    copy.ts               # copy + config VSL/timer + brand (logo SVG)
  layouts/
    Base.astro            # <head>, OG, font, skip-link, mount Pixel
  pages/
    index.astro           # landing (Navbar + main: VSL + Gate + Footer)
    gracias.astro         # thank you (Navbar + main: msg + Footer, noindex)
  styles/
    global.css            # @import "tailwindcss" + design tokens + animazioni
public/
  favicon.svg             # primario, "D" del logo (browser moderni)
  favicon-32x32.png       # fallback PNG
  favicon-16x16.png       # fallback PNG
  favicon.ico             # Safari < 16 + email client
  apple-touch-icon.png    # iOS home screen / tab Safari mobile
  android-chrome-192x192.png  # Android "Add to Home Screen"
  android-chrome-512x512.png  # Android "Add to Home Screen"
  site.webmanifest        # manifest PWA (theme_color, background_color)
  assets/
    logo.svg              # logo brand 947×593 (8 KB) — primario Navbar/Footer
    logo.png              # PNG fallback (112 KB), legacy — rimuovibile post-verifica
    vsl.mp4               # video VSL self-hosted, 553 MB (ignored da git)
```

**Nota architetturale:** `api/` sta a livello root, **non** dentro
`src/pages/api/`. È una serverless function gestita direttamente da
Vercel — non passa da Astro. Vedi "Form e tracking → Fase 3" per il
perché di questa scelta.

**Componenti di riserva** (`PainSection`, `Transformation`,
`SocialProof`, `HowItWorks`): tenuti in repo per riuso futuro
(varianti di funnel, A/B test, blog post). **Non importarli** in
`pages/index.astro`. Se vengono ri-attivati per una variante, va
ridiscusso — il funnel attuale è pura VSL.

## Form e tracking

Il form è **gated da timer**: appare solo dopo che `optinGate.timerSeconds`
sono trascorsi dal primo arrivo dell'utente sulla pagina (timestamp
salvato in `localStorage`, TTL 24h, vedi `OptInGate.astro`).

**Regola del timer:** durata = `(durata_video_VSL_in_secondi) - 60`.
Si imposta in `src/content/copy.ts → optinGate.timerSeconds`.

**Payload del form:**
- `name` (string, ≥ 2 char)
- `surname` (string, ≥ 2 char)
- `email` (email valida)
- `phone` (string, 8–20 char, accetta numeri italiani e svizzeri con
  separatori e prefisso internazionale opzionale)
- `age` (number, 18–99) — qualifica demografica per la coach
- `occupation` (string, 2–80 char) — qualifica demografica per la coach
- `aware` (`"yes" | "no"`, required) — qualifying question consapevolezza
  investimento
- `consent` (boolean, required) — consenso GDPR

**Stato attuale (UI-only):**
- Submit del form → validazione client → redirect a `/gracias`.
- Niente backend collegato: il payload **non viene inviato a nessuno**.
- `/gracias` è una pagina statica (no token, no JWT, no download): solo
  messaggio di ringraziamento + indicazione che la coach richiama entro
  48h. È marcata `noindex`.

**Stato futuro (Fase 3 — wiring Slack):**

**Architettura scelta — Opzione B (deciso 2026-04-30):**
`POST /api/lead` implementato come **Vercel Serverless Function** a
livello root del repo (`/api/lead.ts`, **fuori da `src/pages/`**).
Vercel la deploya automaticamente come function: la landing **resta
statica**, niente `@astrojs/vercel`, niente `output: 'server'`,
niente cambiamenti ad `astro.config.mjs`.

Motivazione: c'è un solo endpoint, niente middleware condiviso, niente
auth. Astro SSR completo sarebbe sovradimensionato. Migrazione a
`output: 'server'` se in futuro emergeranno più route server.

**Flusso del POST /api/lead:**

1. Valida payload con Zod.
2. Posta su **Slack** (incoming webhook, env `SLACK_WEBHOOK_URL`):
   - Se `aware = yes`: messaggio standard (nuovo lead qualificato).
   - Se `aware = no`: messaggio con badge esplicito
     **"⚠ ha risposto NO alla domanda di consapevolezza"** — il lead
     **non viene scartato**, viene **taggato** e la coach decide a
     valle.
3. Risposta 200 al client → il client redirige a `/gracias`.
4. **Errori 4xx/5xx**: il client redirige a `/gracias` **comunque**
   (l'utente non deve mai vedere errori per un problema interno).
   L'errore va loggato server-side per il team.

Il messaggio Slack contiene **solo i campi del form** (nome, cognome,
email, telefono, aware) + timestamp. Niente metadata extra, niente
fingerprint, niente tracking del browser.

**Comportamento in dev locale (senza `vercel dev`, senza webhook):**
il `fetch('/api/lead')` fallisce silenziosamente, il client redirige
a `/gracias` lo stesso. Comportamento identico per l'utente di prod
in caso di errore lato server.

**Stato futuro (Fase 4 — Pixel + CAPI):**

Su submit valido:
1. Genera `event_id` (UUID v4) lato server.
2. Lato client → fire `Lead` su Meta Pixel con `eventID: event_id`.
3. Lato server → fire `Lead` su Meta CAPI con stesso `event_id` +
   `user_data` hashato (em, ph, fbp, fbc, client_user_agent,
   client_ip_address). **Deduplicazione obbligatoria** via `event_id`:
   altrimenti Meta conta lead doppi e ottimizza male le campagne.

**Note implementative:**
- **Niente lead-magnet PDF.** Il follow-up è una chiamata telefonica
  dalla coach. Niente nurturing email da questo repo.
- **Test del gate in dev:** in modalità dev (`import.meta.env.DEV`)
  il timer riparte **sempre da zero** ad ogni reload, ignorando lo
  storage — comportamento solo dev, non incide sulla produzione.
  Query string aggiuntive: `?unlock=1` per saltare il timer,
  `?reset=1` per svuotare lo storage e ricominciare. Da documentare
  **solo internamente**, non esposte in UI.

## Palette

Confermata. Registro premium, niente rosa shocking né lavanda candy.
Tokens definiti in `src/styles/global.css` (Tailwind v4 `@theme`).

| Ruolo                 | Token              | Hex       |
| --------------------- | ------------------ | --------- |
| Sfondo body (gradiente) | *(body CSS)*     | `#c4a0dc` lavanda media → `#e8aacf` salmon saturo (180deg, rivisto 2026-05-07) |
| Sfondo card/input/footer | `--color-paper` | `#e8aacf` (rosa salmon saturo, rivisto 2026-05-07) |
| Testo principale      | `--color-ink`      | `#18082a` (viola notte) |
| Testo secondario      | `--color-muted`    | `#52246a` (viola scuro per contrasto su bg saturo, rivisto 2026-05-07) |
| CTA primario          | `--color-rose`     | `#a8184e` (rosa cremisi profondo) |
| CTA hover/active      | `--color-rose-deep`| `#7d1038` |
| Dettagli decorativi   | `--color-plum`     | `#4a1275` (viola intenso) |
| Card / tinte soft     | `--color-blush`    | `#ede0f5` (lavanda cipria) |

> ✅ **Palette satura confermata** (2026-05-08). I valori sopra sono
> più saturi del registro originale "premium maison" del brief —
> trade-off accettato per dare più impatto visivo al funnel paid Meta.
> Decisione registrata, niente revisione pianificata.

**Regole d'uso:**
- Body sempre su `paper`, mai bianco puro.
- Solo `ink` per testo lungo, `muted` per occhielli/etichette/note.
- CTA primario usa `rose` riempito + testo `paper`. Hover → `rose-deep`.
- `plum` solo su accenti puntuali (sottolineature di parole, virgole
  grafiche, trattini decorativi). **Mai** come sfondo di sezione intera.
- `blush` per card o background di sezione "diversa", non per pulsanti.
- Il **body usa un gradiente verticale** viola chiaro → rosa chiaro per blend seamless tra sezioni (decisione design esplicita 2026-05-02). Le sezioni sono trasparenti — il gradiente trasparisce.
- Contrasto minimo verificato: `ink` su `paper` = 13.8:1 (AAA).

## Accessibilità

- Contrasto AA minimo (4.5:1 testo normale, 3:1 testo grande).
- Form: label visibili (no placeholder come label), `aria-describedby`
  per messaggi di errore, focus ring visibile.
- Tap target ≥ 44×44px su mobile.
- `<html lang="it">` su tutte le pagine.
- Heading order coerente (un solo `h1` per pagina).

## GDPR

**Decisione 2026-05-07**: niente pagina privacy, niente pagina cookie,
niente cookie banner, Pixel acceso senza gating. Allineamento con i
competitor di riferimento del verticale, che operano nello stesso modo.
Trade-off legale accettato consapevolmente: rischio teorico ePrivacy /
GDPR (Garante IT / IFPDT CH); priorità a copertura paid e CPL.

Conseguenze sul codice:
- **Footer:** niente link legali. Solo brand, tagline, copyright,
  disclaimer di non-affiliazione Meta/Google.
- **Consent checkbox:** testo del consenso al trattamento mantenuto
  ("Acconsento al trattamento dei miei dati personali..."), niente
  link a privacy policy.
- **Pixel + CAPI (Fase 4):** si accende **senza** banner di consenso.
- **Checkbox consenso non pre-flaggata.** Submit bloccato senza
  spunta — l'utente conferma comunque esplicitamente il trattamento
  per il ricontatto telefonico.
- **Cookie tecnici** (sessione form, localStorage del timer):
  nessun banner richiesto (non lo erano nemmeno nell'impianto
  precedente).

## Regole di review (per Claude)

Prima di ogni modifica significativa:

1. **Copy:** rileggi la sezione "Tono di voce" sopra. Non cambiare il
   registro per essere più "vendibile".
2. **Dipendenze nuove:** chiedi prima di installarle. Sempre. Anche se
   sembra una micro-utility.
3. **Script in `<head>`:** mostra l'impatto stimato su LCP. Se non sai
   misurarlo, non aggiungerlo.
4. **`/api/lead`** (quando esisterà — Fase 3): prima di committare,
   test manuale con `curl` del payload + verifica messaggio ricevuto
   nel canale Slack. In Fase 4 anche verifica evento su Events Manager
   Meta.
5. **No `console.log` in produzione.**
6. **No commit di `.env`** o di chiavi.
7. **No `--no-verify` su git commit** salvo richiesta esplicita.

## Comandi

```bash
npm run dev       # dev server
npm run build     # build produzione
npm run preview   # anteprima build
npm run check     # type check (astro check)
npm run format    # prettier --write .
```

## Decisioni aperte

Da chiarire prima di chiudere le rispettive fasi:

- ✅ **Funnel:** VSL squeeze pura (deciso 2026-04-30).
- ✅ **Form notification:** **solo Slack** (gsheet rimosso). Wiring
  effettivo → Fase 3 (rimandato).
- ✅ **Lead non qualificato (aware=no):** notificato comunque su
  Slack con flag esplicito.
- ✅ **Palette:** satura confermata 2026-05-08. Valori in sezione
  "Palette". Trade-off accettato vs brief "premium maison" per impatto
  paid Meta.
- ✅ **Font:** Inter + Fraunces, self-hosted via Astro fonts API.
- ✅ **Lead magnet:** **niente PDF**. Il follow-up è una chiamata
  telefonica dalla coach del team (deciso 2026-04-30).
- ✅ **Qualifying question — formulazione:** "Sei consapevole che il
  programma richiede un investimento?" (rivista 2026-05-04;
  formulazione precedente: "Sai che il percorso completo richiede un
  investimento?", deciso 2026-04-30).
- ✅ **Form: campo telefono** aggiunto come obbligatorio (numeri
  italiani + svizzeri, deciso 2026-04-30).
- ✅ **Architettura backend (Fase 3): Opzione B — Vercel serverless
  function in `/api/` a livello root**, niente Astro SSR / niente
  adapter (deciso 2026-04-30). Vedi "Form e tracking → Fase 3" per il
  dettaglio. La landing resta statica.
- ✅ **Comportamento in caso di errore submit:** redirect a `/gracias`
  comunque, niente errore visibile all'utente (deciso 2026-04-30).
- ✅ **`vsl.stepLabel`**: "Step 1 di 2" (ripristinato 2026-05-07
  dopo breve test "Lezione gratuita" — richiesta cliente).
- ✅ **Validazione telefono**: ≥ 8 digit numerici client-side via
  `setCustomValidity` (deciso 2026-05-07).
- ✅ **Video VSL su Vimeo Pro** (2026-05-09, commit `ab2cea2`).
  ID 1190625710, durata 5 min, `optinGate.timerSeconds = 240`.
  `vsl.mp4` 553 MB eliminato.
- ✅ **Hosting video definitivo: Vimeo Pro** (deciso 2026-05-09).
- ✅ **Dominio: `donneindigital.ch`** registrato Namecheap. Sub `vsl`
  attivo. (deciso 2026-05-09).
- **Hosting / deploy:** Vercel (Fase 6). Niente adapter Astro da
  installare — Opzione B usa Vercel functions standard.
- ✅ **Pagine /privacy e /cookie: NON realizzate.** Cookie banner: NON
  realizzato. Pixel acceso senza gating (deciso 2026-05-07).
  Allineamento con competitor del verticale che operano allo stesso
  modo. Trade-off legale registrato in sezione "GDPR".
- ✅ **Footer: rimossi link Privacy/Cookie** (deciso 2026-05-07).
- ✅ **Consent checkbox: rimosso link a privacy policy** (deciso
  2026-05-07). Testo del consenso al trattamento integrale.
- ✅ **OG image** chiusa 2026-05-08, asset `/public/og-image.jpg`
  presente, `Base.astro` emette tag corretti.
- ✅ **Navbar fissa con logo centrato** (deciso 2026-05-07). Glass
  effect (`bg-white/20 backdrop-blur-md`), spacer in coda per altezza
  esatta. Montata su `index.astro` e `gracias.astro`.
- ✅ **Logo brand SVG** (2026-05-08, `/public/assets/logo.svg`, 8 KB,
  viewBox 947×593). Convertito da PNG via SVGcode.app (potrace),
  `fill="#18082a"` ink al root. Wired in Navbar e Footer via `brand`
  export in `copy.ts`. PNG (`logo.png`) lasciato come fallback fino
  a verifica visuale su device reali.
- ✅ **Favicon brand completo**: set favicon.io generato dal logo
  "D" (SVG + PNG 16/32 + ICO + apple-touch-icon 180 + Android
  Chrome 192/512 + webmanifest). Linkato in `Base.astro` (deciso
  2026-05-07). Vedi "Stato attuale" per dettagli.
- ✅ **Meta Pixel ID + CAPI Token + Dataset ID:** settati Vercel env (2026-05-09).
- ✅ **Slack incoming webhook:** generato + settato Vercel env (2026-05-09).
- ⬜ **Verifica dominio Meta Business Manager**: TXT DNS pending,
  cliente farà più tardi. Senza, ottimizzazione campagne penalizzata
  ma Pixel/CAPI continuano a funzionare.
- ✅ **Counter spettatori finto: KEEP, range 25–35** (deciso
  2026-05-08). Range precedente 19–89 troppo ampio e poco credibile
  per VSL squeeze. Implementazione: `sessionStorage` persistence
  (stesso valore su reload tab → no perdita fiducia), drift lento
  ogni 6–12s con 50% probabilità ±1 entro [25, 35]. Counter resta
  `aria-hidden` (decorativo).
- **Copy review finale** del cliente su headline/sottotitolo VSL e
  qualifying question.

## Fasi

- ✅ Fase 0 — Allineamento sul piano
- ✅ Fase 1 — Scaffolding
- ✅ Fase 2 — Long-form (sostituita da Fase 2.1)
- ✅ Fase 2.1 — Refactor a VSL squeeze pura (timer + form gated)
- ✅ Fase 2.2 — Form a 5 campi → 8 campi (+ telefono, età, occupazione),
  thank you page, niente PDF
- ✅ Fase 2.3 — Video VSL Vimeo Pro (chiusa 2026-05-09, commit `ab2cea2`).
- ✅ Fase 3 — Wiring Slack (chiusa 2026-05-09, commit `db9d658`).
- ✅ Fase 4 — Tracking Pixel + CAPI (chiusa 2026-05-09, commit `db9d658`
  + fix `5295318`). Acceso senza cookie banner.
- ❌ Fase 5 — ~~Pagine legali (privacy, cookie) + cookie banner~~ —
  **CANCELLATA** (2026-05-07). Vedi GDPR + Decisioni aperte.
- ✅ Fase 6 — Go-live: dominio + DNS + HTTPS + env Vercel + privacy
  page + test E2E (chiusa 2026-05-09). Pendente solo: verifica Meta
  Business (DNS TXT, non bloccante, entro 48h da launch).
- ⬜ Fase 7 (opzionale) — A/B test post-launch
