# Landing ES

Landing page lead-generation del brand `{BRAND_NAME}` (mercato ES).
Funnel **VSL squeeze pura**: video di vendita + countdown timer + form opt-in
gated. Submit → coach del team richiama entro 48h al numero lasciato.

Target traffic: paid Meta Ads, mobile italiano (iOS/Android), 25–50.

---

## Documentazione

| File | Cosa contiene |
| --- | --- |
| [`CLAUDE.md`](./CLAUDE.md) | Contesto strategico, tono di voce, vincoli, palette, decisioni aperte |
| [`TODO.md`](./TODO.md) | Piano di lavoro azionabile, priorità, task aperte e chiuse |
| [`BRAND_RENAME_CHECKLIST.md`](./BRAND_RENAME_CHECKLIST.md) | Procedura di rename del brand (`BRAND_NAME` è placeholder) |
| [`LANDING_COPY_ES.md`](./LANDING_COPY_ES.md) | Copy castellano di Spagna, stringa per stringa |

---

## Stack

Astro 6 (output statico) · Tailwind CSS v4 · TypeScript strict · Zod ·
Vercel Serverless Functions (`/api/lead.ts`) · deploy Vercel.

Niente React/Vue, niente animation libs, niente UI kit. Vincolo
performance: JS < 30 KB, CSS < 20 KB, LCP < 2.5s mobile 4G (vedi
CLAUDE.md → "Vincoli tecnici").

---

## Setup

```bash
npm install
cp .env.example .env       # poi compila i valori (vedi sotto)
npm run dev                # http://localhost:4321
```

Cross-platform: il progetto si sviluppa indifferentemente su Windows e
Mac. Il `.gitignore` copre `.DS_Store` (Mac) e file video MP4/MOV/WEBM
(troppo grandi per git, vanno in CDN/Vercel).

---

## Comandi

| Comando | Cosa fa |
| --- | --- |
| `npm run dev` | Dev server con hot reload |
| `npm run build` | Build statica in `dist/` |
| `npm run preview` | Anteprima della build |
| `npm run check` | Type check (`astro check`) |
| `npm run format` | Prettier su tutto il repo |
| `node scripts/test-lead-schema.mjs` | Test edge case Zod schema (15 casi) |

---

## Variabili d'ambiente

Tutte documentate in [`.env.example`](./.env.example). Sintesi:

| Variabile | Scope | Quando serve |
| --- | --- | --- |
| `PUBLIC_SITE_URL` | server (build) | Canonical URL, og:url, sitemap. In dev: fallback hardcoded. In prod Vercel: settare al dominio finale |
| `SLACK_WEBHOOK_URL` | server | `/api/lead.ts` posta lead in canale Slack (Fase 3) |
| `PUBLIC_META_PIXEL_ID` | client | Meta Pixel base — fire `PageView` + `Lead` con `event_id` (Fase 4) |
| `META_CAPI_ACCESS_TOKEN` | server | Conversions API server-side fire (Fase 4) |
| `META_CAPI_DATASET_ID` | server | Dataset Pixel su CAPI (Fase 4) |
| `META_CAPI_TEST_EVENT_CODE` | server | Opzionale, per Test Events durante dev |

**Mai** prefissare `PUBLIC_` chiavi server (espongono al browser).

---

## Architettura backend

`/api/lead.ts` è una **Vercel Serverless Function** a livello root —
**non** dentro `src/pages/api/`. Vercel la deploya automaticamente.
La landing resta statica: niente Astro SSR, niente adapter.

Flusso submit:
1. Client genera `event_id` (UUID) → fire Pixel `Lead` con `eventID`
2. Client POST `/api/lead` (fire-and-forget keepalive) → redirect a `/gracias`
3. Server valida payload (Zod) → posta in Slack → fire CAPI con stesso `event_id`
4. Errori swallowed lato client: redirect a `/gracias` comunque

Vedi CLAUDE.md → "Form e tracking" per dettaglio completo.

---

## Stato (al 2026-05-08)

- ✅ Scaffolding completo (Astro + Tailwind + TS + Zod + Pixel + CAPI + Slack)
- ✅ A11y/animation/skeleton polish
- 🟡 In attesa cliente: video VSL su Vimeo/Wistia, `SLACK_WEBHOOK_URL`,
  Meta Pixel/CAPI credentials, dominio `.ch`, logo SVG
- ⬜ Test manuale cross-browser + a11y + Lighthouse baseline
- ⬜ Go-live (Fase 6)

Vedi `TODO.md` per la lista completa.
