# BRAND RENAME CHECKLIST — mercato ES

Il brand definitivo per Spagna/Germania **non è ancora deciso**. Questa
copia usa un valore temporaneo. Questo documento dice esattamente dove
cambiarlo e cosa NON si aggiorna da solo.

---

## 1. Dove sta la costante

La costante sta in **esattamente due punti**, entrambi marcati `TEMP`. Al
rebrand vanno cambiati **tutti e due, nello stesso commit**:

```
src/content/copy.ts  →  export const BRAND_NAME = "<marca actual>";   # client
api/lead.ts          →  const BRAND_NAME = "<marca actual>";          # serverless function
```

Verifica: `grep -rn '"Donne in Digital"' src/ api/` deve restituire
**esattamente 2 righe**, una per file. Zero è un errore (brand perso), tre o
più significa che qualcuno l'ha hardcodato da qualche altra parte.

> **Perché è duplicata invece che importata.**
> Le function in `api/` sono impacchettate da Vercel **fuori** dalla build
> Astro, e i loro `.ts` vengono **compilati in `.js`**. Due tentativi di
> condividere la costante, due crash in produzione DE il **2026-08-18**,
> entrambi al primo POST ed entrambi muti — il client è fire-and-forget e
> redirige alla thank-you comunque, quindi `/gracias` appariva e il lead
> spariva:
>
> | Tentativo                                | Errore a runtime                                                                                                 |
> | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
> | `import … from "../src/content/copy.ts"` | `Cannot find module '/var/task/src/content/copy.ts'` — `src/` non esiste nel bundle                              |
> | `import … from "./_shared/brand.ts"`     | `Cannot find module '/var/task/api/_shared/brand.ts'` — a runtime c'è `brand.js`, lo specifier `.ts` non risolve |
>
> Nessuno dei due veniva intercettato in locale, dove i `.ts` stanno sul
> disco. **Questo repo aveva lo stesso import del primo caso** ed è stato
> corretto in via preventiva: non è mai andato in produzione.
>
> La duplicazione è il prezzo accettato per non dipendere da come il
> bundler tratta percorsi ed estensioni: `api/lead.ts` non ha **nessun**
> import relativo, solo pacchetti npm e builtin `node:`.
>
> Guardia automatica contro la regressione:
> `node scripts/test-api-isolated.mjs`.

⛔ **`api/lead.ts` non deve avere import relativi — di nessun tipo.** Né
verso `src/`, né verso una sottocartella di `api/`, con o senza estensione.
Serve una costante o un helper lato server? Si scrive dentro il file.

Dopo il rename: `npm run build`, `node scripts/test-api-isolated.mjs`, e si
controllano gli asset grafici della sezione 3, che il build non tocca.

---

## 2. Cosa cambia AUTOMATICAMENTE

Tutto ciò che segue interpola `BRAND_NAME`: cambia da solo, senza aprire
altri file.

| Punto                              | File                                                     | Effetto                                                         |
| ---------------------------------- | -------------------------------------------------------- | --------------------------------------------------------------- |
| `<title>` della home               | `src/content/copy.ts` → `meta.title`                     | `"<Brand> — Trabaja en remoto…"`                                |
| `og:title` della home              | derivato da `meta.title` in `Base.astro`                 | idem                                                            |
| `brand.name`                       | `src/content/copy.ts`                                    | usato da Navbar e Footer                                        |
| `alt` del logo in navbar           | `src/components/Navbar.astro` (legge `brand.name`)       | testo alternativo del logo                                      |
| `aria-label` del link al logo      | `src/components/Navbar.astro`                            | idem                                                            |
| `alt` del logo nel footer          | `src/components/Footer.astro`                            | idem                                                            |
| Copyright del footer               | `src/content/copy.ts` → `footer.copyright`               | `© <anno> <Brand>. Todos los derechos reservados.`              |
| `<title>` della thank-you page     | `src/pages/gracias.astro`                                | `Gracias — <Brand>`                                             |
| `<title>` di `/aviso-legal`        | `src/pages/aviso-legal.astro`                            | `Aviso legal — <Brand>`                                         |
| `<title>` di `/privacidad`         | `src/pages/privacidad.astro`                             | `Política de privacidad — <Brand>`                              |
| `name` del web manifest            | `src/pages/site.webmanifest.ts`                          | endpoint generato, non più file statico                         |
| `short_name` del web manifest      | `src/pages/site.webmanifest.ts`                          | derivato scartando le parole ≤ 2 caratteri                      |
| Header standard dei messaggi Slack | `api/lead.ts` (**copia locale** della costante, vedi §1) | `🔔 Nuevo lead ES - <Brand>` — **non** si aggiorna da `copy.ts` |

> **Perché il manifest è un endpoint.** `public/site.webmanifest` era un
> JSON statico con il brand hardcodato: è stato cancellato e sostituito
> da `src/pages/site.webmanifest.ts`, che genera lo stesso JSON (stesse
> icone, `theme_color` `#18082a`, `background_color` `#e8aacf`,
> `display: standalone`) più `lang: "es"`, derivando `name` e
> `short_name` da `BRAND_NAME`. Così il brand resta in un solo punto.

> **Nota su `short_name`.** La derivazione automatica scarta le parole di
> collegamento (`.length <= 2`): `"Marca de Ejemplo"` → `"Marca Ejemplo"`.
> Le linee guida PWA raccomandano ≤ 12 caratteri: se il brand nuovo è
> lungo, verifica come viene troncato sotto l'icona in home screen su
> Android e, se serve, sostituisci la derivazione con una stringa
> esplicita in `site.webmanifest.ts`.

> **Se il brand nuovo contiene caratteri speciali** (`&`, apostrofi,
> accenti): nessun problema lato Astro (escaping automatico) né lato
> manifest (`JSON.stringify`). Lato Slack l'header è `plain_text`, quindi
> nemmeno lì serve escaping.

---

## 3. Cosa NON cambia da solo — asset grafici da rifare a mano

Nessuno di questi è generabile da config: sono file binari/vettoriali con
il wordmark disegnato dentro. **Vanno rifatti da un designer.**

### 🔴 ALTA priorità — bloccanti per il paid traffic

| Asset                          | Percorso                                      | Specifiche                                        | Note                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------------ | --------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **OG image**                   | `public/og-image.jpg` — **DA CREARE EX NOVO** | 1200×630, JPG, < 100 KB                           | **Non esiste in questa copia**: l'OG image italiana è stata rimossa. Finché manca, `index.astro` non passa `ogImage` e `Base.astro` non emette `og:image` (`twitter:card` cade su `summary`): nessun 404 sui crawler, ma **zero thumbnail** su condivisioni e anteprime — impatto diretto sul CTR degli ads. Una volta creata: rimettere `ogImage="/og-image.jpg"` in `src/pages/index.astro`. |
| **Logo SVG** (navbar + footer) | `public/assets/logo.svg`                      | 8 KB, viewBox `180 114 588 373`, `fill="#18082a"` | Wordmark **vettorizzato**: il testo è convertito in tracciati, non è modificabile da codice. Referenziato via `brand.logoSrc`. Se cambia l'aspect ratio, aggiornare `brand.logoWidth` / `brand.logoHeight` in `copy.ts` (oggi 588×373) o si introduce CLS.                                                                                                                                     |
| **Logo PNG** (fallback)        | `public/assets/logo.png`                      | 112 KB, stesso aspect ratio dell'SVG              | Fallback legacy. Rifare insieme all'SVG o eliminare se non serve più.                                                                                                                                                                                                                                                                                                                          |

### 🟠 MEDIA priorità — brand consistency, non bloccanti

Il set di favicon è generato dalla lettera "D" del logo attuale. Con un
brand nuovo l'iniziale cambia e va rigenerato **tutto il set** (es. via
favicon.io a partire dal nuovo logo):

| Asset              | Percorso                            | Uso                                          |
| ------------------ | ----------------------------------- | -------------------------------------------- |
| Favicon SVG        | `public/favicon.svg`                | primario, browser moderni                    |
| Favicon PNG 32     | `public/favicon-32x32.png`          | fallback                                     |
| Favicon PNG 16     | `public/favicon-16x16.png`          | fallback                                     |
| Favicon ICO        | `public/favicon.ico`                | Safari < 16, client email                    |
| Apple touch icon   | `public/apple-touch-icon.png`       | 180×180, home screen iOS / tab Safari mobile |
| Android Chrome 192 | `public/android-chrome-192x192.png` | "Aggiungi a schermata Home" Android          |
| Android Chrome 512 | `public/android-chrome-512x512.png` | splash screen Android                        |

I riferimenti a questi file sono in `src/layouts/Base.astro` (link rel) e
in `src/pages/site.webmanifest.ts` (array `icons`): i **percorsi** non
cambiano, si sostituiscono i file al loro posto.

> `theme_color` (`#18082a`) e `background_color` (`#e8aacf`) del manifest
> vengono dalla palette, non dal brand: si toccano solo se cambia anche
> la palette.

---

## 4. Cose collegate che NON dipendono da `BRAND_NAME`

Da verificare al rename, ma sono decisioni separate:

- **Dominio.** `PUBLIC_SITE_URL` in `astro.config.mjs` ha come fallback
  `https://example-PLACEHOLDER.invalid`. Il dominio spagnolo non esiste
  ancora: registrarlo, settare la env var su Vercel e scommentare la riga
  `Sitemap:` in `public/robots.txt`.
- **Video VSL.** `vsl.video` è `{ provider: "placeholder" }`. La
  procedura completa di riattivazione è nel commento sopra `vsl.video` in
  `src/content/copy.ts`. Include il ricalcolo di `optinGate.timerSeconds`
  (oggi **570 s ereditati dal VSL italiano**, non validi per questo
  mercato).
- **Pagine legali.** `/aviso-legal` e `/privacidad` sono stub in stato
  BORRADOR. Quando arriva il legal pack: sostituire il testo, togliere il
  banner, togliere `noindex`, rimuoverle da `EXCLUDED_FROM_SITEMAP` in
  `astro.config.mjs` e dalle righe `Disallow` in `public/robots.txt`.
- **Env vars.** Vedi `.env.example`. Tutti i valori sono vuoti: il sito
  builda comunque, ma senza `SLACK_WEBHOOK_URL` **i lead vengono persi**
  (503 lato API, redirect a `/gracias` lato utente).

---

## 5. Verifica dopo il rename

```bash
npm run check           # 0 errori TypeScript
npm run build           # build pulita
node scripts/test-phone-normalize.mjs   # 28/28
node scripts/test-lead-schema.mjs       # 31/31
```

Poi, sul build in `dist/`:

```bash
grep -o "<title>[^<]*</title>" dist/index.html dist/gracias/index.html
cat dist/site.webmanifest      # name + short_name aggiornati
```

E a occhio, sulla pagina servita: logo in navbar e footer, copyright,
favicon nella tab, anteprima social (se l'OG image è stata creata).
