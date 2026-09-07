/**
 * Single source of truth per tutto il copy della landing — mercato SPAGNA.
 * I componenti importano da qui — non hardcodare stringhe nei .astro.
 *
 * Lingua: castellano di Spagna, registro informale (tuteo, mai "usted").
 * Vocabolario peninsulare: "móvil" (non "celular"), "ordenador" (non
 * "computadora"), "vosotros" quando serve il plurale.
 *
 * Tono di voce: sobrio, adulto, anti-hype. Niente income claim, niente
 * cifre di guadagno, niente promesse di risultato economico, niente
 * claim assoluti ("garantizado", "100%", "seguro").
 *
 * Funnel attuale: VSL squeeze pura.
 *  -> Headline + video VSL + timer + (al timer-zero) form opt-in.
 *  -> Niente long-form sopra/sotto: i componenti di riserva
 *     (Pain/Transformation/SocialProof/HowItWorks) sono stati rimossi
 *     da questa copia insieme al relativo copy.
 */

/**
 * Brand del mercato ES. Duplicata in `api/lead.ts` (la function non può
 * importare da `src/`): al rename vanno cambiate ENTRAMBE nello stesso
 * commit — vedi BRAND_RENAME_CHECKLIST.md §1.
 */
export const BRAND_NAME = "Chicas Digitales";

/**
 * Tagline del brand. Testo del committente, VERBATIM.
 * Usata nel footer sotto il wordmark e come meta description.
 */
export const TAGLINE = "Tu nuevo oficio digital, paso a paso. Desde casa.";

export const meta = {
  title: `${BRAND_NAME} — Trabaja en remoto gestionando la comunicación online`,
  description: TAGLINE,
} as const;

/* ---------- Brand (logo + nome) ---------- */

/**
 * Single source of truth per il logo. Usato da Navbar e Footer.
 *
 * `logoWidth` e `logoHeight` sono le dimensioni INTRINSECHE del file SVG.
 * Servono solo per evitare CLS (browser sa l'aspect ratio prima del download).
 * La dimensione visiva è gestita via classi Tailwind nei componenti.
 *
 * Se sostituisci il file con un logo di aspect ratio diverso, aggiorna
 * questi due numeri al rapporto reale.
 *
 * NOTA: il logo è un asset grafico, NON segue `BRAND_NAME`.
 *
 * ⚠️ SLOT VUOTO dal rebrand del 2026-09-07: i file in
 * `/public/assets/logo.*` sono l'artwork del brand PRECEDENTE e
 * mostrerebbero il nome sbagliato. Finché `logoSrc` è `null`, Navbar e
 * Footer rendono un wordmark testuale da `BRAND_NAME`.
 *
 * Quando arriva il logo nuovo: metti il file in `/public/assets/`,
 * imposta `logoSrc` e aggiorna `logoWidth`/`logoHeight` alle dimensioni
 * INTRINSECHE reali del file (servono a evitare CLS: il browser conosce
 * l'aspect ratio prima del download).
 */
export const brand = {
  name: BRAND_NAME,
  logoSrc: null as string | null,
  logoWidth: 588,
  logoHeight: 373,
} as const;

export const anchors = {
  form: "form",
} as const;

/* ---------- Sezione VSL (sopra il fold) ---------- */

/**
 * Config del player video. Sostituire `provider` quando il video definitivo
 * è disponibile.
 *
 *  - "placeholder": stato attuale, mostra un box con call-to-action finta.
 *  - "mp4":         file self-hosted in /public/, es.
 *                   `{ provider: "mp4", url: "/assets/vsl-final.mp4",
 *                       poster: "/assets/vsl-poster.jpg" }`
 *  - "vimeo":       embed Vimeo Pro, es.
 *                   `{ provider: "vimeo", url: "https://player.vimeo.com/video/123456" }`
 *  - "wistia":      embed Wistia (per quando il funnel decolla)
 *  - "youtube":     unlisted (sconsigliato per VSL premium)
 */
export type VslVideoConfig =
  | { provider: "placeholder" }
  | { provider: "mp4"; url: string; poster?: string }
  | { provider: "vimeo"; url: string; poster?: string }
  | { provider: "wistia"; mediaId: string }
  | { provider: "youtube"; videoId: string };

export const vsl = {
  /**
   * PLACEHOLDER — il VSL del mercato spagnolo non esiste ancora.
   * L'ID Vimeo del VSL italiano è stato rimosso di proposito: non deve
   * restare da nessuna parte in questa copia.
   *
   * PROCEDURA DI RIATTIVAZIONE quando arriva il VSL di mercato:
   *   1. provider "vimeo" + nuovo URL player.vimeo.com/video/<NUOVO_ID>
   *   2. poster nuovo (vumbnail.com/<NUOVO_ID>_large.jpg o JPG locale
   *      1920x1080 in /public/assets/vsl-poster.jpg)
   *   3. ricalcolare optinGate.timerSeconds = durataVideoSecondi - 60
   *   4. verificare che gli eventi VSL_Play e i quartili VSL_25/50/75
   *      tornino a partire (dipendono da [data-vimeo-wrap], assente col
   *      provider placeholder)
   *   5. whitelist del dominio nelle impostazioni privacy del video su Vimeo
   */
  video: { provider: "placeholder" } as VslVideoConfig,
  /**
   * Testo mostrato nel riquadro del player finché `video.provider` resta
   * "placeholder". Neutro di proposito: niente riferimenti a percorsi del
   * codice, perché questo è ciò che vedrebbe un utente reale se la build
   * finisse davanti a traffico paid prima dell'arrivo del VSL.
   */
  placeholder: {
    title: "Vídeo en preparación",
    hint: "La clase estará disponible en breve.",
  },
  headline: `Mira <span class="kw-plum">con atención</span> esta clase y descubre por fin cómo <span class="kw-rose">trabajar online desde casa</span>.`,
  subtitle: `Puede que esta clase <span class="kw-urgent">no siga disponible mucho tiempo</span>.`,
  stepLabel: "Paso 1 de 2",
  viewerSuffix: "personas la están viendo ahora mismo",
  rotateHint: "Gira el móvil para ver mejor el vídeo",
} as const;

/* ---------- Sezione opt-in gated ---------- */

export const optinGate = {
  /**
   * Durata in secondi del timer prima che il box appaia.
   *
   * REGOLA: deve finire **un minuto prima** della fine del video VSL.
   * → `timerSeconds = durataVideoInSecondi - 60`.
   *
   * ATTENZIONE — valore EREDITATO dal VSL ITALIANO: 570s deriva dal video
   * italiano da 10:30 (630s - 60 = 570s). Il VSL spagnolo non esiste
   * ancora e il provider è "placeholder", quindi questo numero NON
   * corrisponde a nessun video di questo mercato: va RICALCOLATO al
   * momento del cambio video (punto 3 della procedura sopra `vsl.video`).
   */
  timerSeconds: 570,
  /** Chiave localStorage per ricordare quando l'utente è arrivato. */
  storageKey: "didi_vsl_first_seen_at",
  /** Dopo quante ore lo storage viene resettato (utente "torna dopo"). */
  storageTtlHours: 24,

  /**
   * Prefissi internazionali del selettore telefono. Mercato singolo:
   * Spagna. L'ordine determina l'ordine nel menu; `default: true` = voce
   * preselezionata. `example` guida il formato e popola il placeholder
   * del campo numero per quel paese.
   */
  phonePrefixes: [
    {
      code: "ES",
      dial: "34",
      name: "España",
      flag: "🇪🇸",
      example: "612 34 56 78",
      default: true,
    },
  ],

  /* Copy */
  timerLabel: "El formulario aparecerá en",
  formTitle: "Déjanos tus datos",
  formIntro:
    "Rellena los campos de abajo. Te escribe una coach de nuestro equipo.",

  labels: {
    name: "Nombre",
    namePlaceholder: "p. ej. Lucía",
    surname: "Apellidos",
    surnamePlaceholder: "p. ej. García Ruiz",
    email: "Email",
    emailPlaceholder: "nombre@ejemplo.es",
    phone: "Número de WhatsApp",
    phonePrefixAria: "Prefijo internacional del teléfono",
    phoneHint:
      "Solo números de móvil. Escribe el número sin el prefijo internacional.",
    phoneErrors: {
      es: "Escribe un número de móvil español válido.",
      unsupported: "Selecciona el prefijo correcto: España (+34).",
      malformed: "Número no válido. Revisa el prefijo (+) y el formato.",
    },
    age: "Edad",
    agePlaceholder: "p. ej. 34",
    occupation: "Ocupación actual",
    occupationPlaceholder: "p. ej. dependienta, peluquera, administrativa",
    motivation: "¿Por qué ahora? ¿Qué te ha llevado a dejarnos tus datos hoy?",
    motivationPlaceholder:
      "Responde con tus palabras, aunque sean pocas líneas.",
    goal: "Si por fin aprendieras a trabajar online desde casa, ¿qué cambiaría de verdad en tu día a día?",
    goalPlaceholder: "Responde con tus palabras, aunque sean pocas líneas.",
    awareLegend: "¿Invertirías en ti misma?",
    awareYes: "Sí",
    awareNo: "No",
    /* Testo del consenso pieno, senza link: /privacidad è uno stub DRAFT
       noindex e non va linkato finché non arriva il legal pack. Stesso
       impianto del mercato IT. */
    consent: {
      text: "Doy mi consentimiento para el tratamiento de mis datos personales (nombre, email, teléfono) con el fin de que me contactéis en relación con el programa.",
    },
    submit: "Enviar",
    submitting: "Enviando…",
    privacyNote:
      "Tus datos solo se usan para contactarte. Nunca se venden a terceros.",
  },
} as const;

/* ---------- Footer (minimal) ---------- */

export const footer = {
  tagline: TAGLINE,
  email: "info@chicasdigitales.com",
  copyright: `© ${new Date().getFullYear()} ${BRAND_NAME}. Todos los derechos reservados.`,
  // Disclaimer di non-affiliazione richiesto per il traffico paid Meta/Google.
  disclaimer:
    "Este sitio no forma parte del sitio web de Meta ni de Google. Tampoco está avalado por Meta ni por Google en modo alguno.",
  /* Niente link legali nel footer: /aviso-legal e /privacidad restano
     stub DRAFT noindex, non linkati finché non arriva il legal pack. */
} as const;
