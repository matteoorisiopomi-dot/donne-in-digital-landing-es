/**
 * POST /api/lead — Vercel serverless function (Node runtime).
 *
 * Architettura: Opzione B (CLAUDE.md → Form e tracking → Fase 3).
 * Sta a livello root, FUORI da src/pages/. Vercel la deploya
 * automaticamente come function — la landing resta statica, niente
 * Astro SSR / niente adapter.
 *
 * Flusso:
 *   1. Method allowlist: solo POST.
 *   2. Validazione payload con Zod (8 campi + event_id opzionale).
 *   3. Lettura SLACK_WEBHOOK_URL da process.env.
 *   4. POST su Slack con rich blocks. aware=no → header con badge.
 *   5. Fire CAPI (Fase 4) con stesso event_id per dedup. Best-effort:
 *      failure non blocca la response.
 *   6. Risposta al client. In ogni caso il client redirige a /gracias.
 *
 * Logging:
 *   - Successo: solo email + ok.
 *   - Failure: payload completo loggato per recovery.
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createHash, randomUUID } from "node:crypto";
import { z } from "zod";

import { BRAND_NAME } from "../src/content/copy.ts";

/* Regole telefono per mercato, applicate al numero NAZIONALE (dopo il
   country code). Speculari a PHONE_RULES in OptInGate.astro e in
   scripts/test-lead-schema.mjs: se cambi una, riallinea le altre.
     ES +34 → mobili 6xxxxxxxx e 71-79xxxxxxx (9 cifre). Esclusi i fissi
     8xx/9xx e il range 70x, che nel piano di numerazione spagnolo è
     "numeración personal" e non un móvil: l'hint del form promette
     "Solo números de móvil". */
const PHONE_RULES: Record<string, RegExp> = {
  "34": /^(?:6\d|7[1-9])\d{7}$/,
};

const LeadSchema = z.object({
  name: z.string().trim().min(2).max(100),
  surname: z.string().trim().min(2).max(100),
  email: z.email().trim().max(254),
  phone: z
    .string()
    .trim()
    .min(8)
    .max(20)
    .refine((v) => (v.match(/\d/g) ?? []).length >= 8, {
      message: "phone_min_digits",
    })
    /* Guard server-side: il client già normalizza in E.164 e ammette solo
       ES (buildE164/validatePhone in OptInGate.astro), ma lo schema da
       solo accetterebbe qualsiasi stringa. Un POST diretto o JS disabilitato
       bypasserebbe la validazione client e farebbe arrivare alla coach un
       numero senza prefisso / fuori mercato / della lunghezza sbagliata.
       Qui replichiamo il client: un solo "+", country code ammesso E
       lunghezza nazionale conforme al mercato. Senza il secondo controllo
       un "+34" con 7 cifre passerebbe (9 cifre totali ≥ min 8). */
    .refine(
      (v) => {
        const m = /^\+(\d{2})(\d+)$/.exec(v);
        if (!m) return false;
        const rule = PHONE_RULES[m[1]!];
        return rule !== undefined && rule.test(m[2]!);
      },
      { message: "phone_not_supported_market" },
    ),
  age: z.coerce.number().int().min(18).max(99),
  occupation: z.string().trim().min(2).max(80),
  /* Domande a risposta aperta — qualificazione lead per la coach. */
  motivation: z.string().trim().min(2).max(1000),
  goal: z.string().trim().min(2).max(1000),
  aware: z.enum(["yes", "no"]),
  consent: z.literal(true),
  /* event_id: UUID generato dal client, condiviso tra Pixel e CAPI per
     dedup lato Meta. Optional per retro-compatibilità: se mancante,
     viene generato server-side (CAPI funziona, Pixel client perde la
     dedup). */
  event_id: z.uuid().optional(),
});

type Lead = z.infer<typeof LeadSchema>;

function buildSlackPayload(lead: Lead): object {
  const isAware = lead.aware === "yes";
  /* Testi definiti dal committente, VERBATIM: il tag mercato "ES" resta
     sempre nell'header per riconoscere il canale al volo anche cross-mercato.
     Il ramo warning non porta il brand, come nell'impianto originale. */
  const headerText = isAware
    ? `🔔 Nuevo lead ES - ${BRAND_NAME}`
    : "⚠️ Nuevo lead ES - respuesta 'No' sobre la inversión";

  /* Layout verticale: un section block per campo (full width).
     Evita il grid a 2 colonne che Slack applica con `fields`. */
  const rows: Array<[string, string]> = [
    ["Nombre", `${lead.name} ${lead.surname}`],
    ["Edad", String(lead.age)],
    ["Email", lead.email],
    ["Teléfono", lead.phone],
    ["Ocupación", lead.occupation],
    ["Por qué justo ahora", lead.motivation],
    ["Qué cambiaría en su vida", lead.goal],
    ["Consciente de la inversión", isAware ? "✅ Sí" : "❌ No"],
  ];

  return {
    text: headerText,
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: headerText, emoji: true },
      },
      ...rows.map(([label, value]) => ({
        type: "section",
        text: { type: "mrkdwn", text: `*${label}*\n${value}` },
      })),
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `Recibido: ${new Date().toISOString()}`,
          },
        ],
      },
    ],
  };
}

/* ---------- CAPI helpers (Fase 4) ---------- */

/** Hash SHA-256 lowercase normalized — formato richiesto da Meta CAPI. */
function sha256(input: string): string {
  return createHash("sha256").update(input.trim().toLowerCase()).digest("hex");
}

/** Telefono → digits-only per hash CAPI (E.164 senza il +). */
function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

/** Estrae cookie dal request header. */
function getCookie(req: VercelRequest, name: string): string | undefined {
  const raw = req.headers.cookie;
  if (!raw) return undefined;
  const match = raw
    .split(";")
    .map((p) => p.trim())
    .find((p) => p.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : undefined;
}

interface CapiContext {
  ip?: string;
  userAgent?: string;
  fbp?: string;
  fbc?: string;
  sourceUrl?: string;
}

function extractCapiContext(req: VercelRequest): CapiContext {
  const fwd = req.headers["x-forwarded-for"];
  const ip =
    typeof fwd === "string"
      ? fwd.split(",")[0]?.trim()
      : Array.isArray(fwd)
        ? fwd[0]?.split(",")[0]?.trim()
        : undefined;
  const ua = req.headers["user-agent"];
  const referer = req.headers["referer"];
  return {
    ip,
    userAgent: typeof ua === "string" ? ua : undefined,
    fbp: getCookie(req, "_fbp"),
    fbc: getCookie(req, "_fbc"),
    sourceUrl: typeof referer === "string" ? referer : undefined,
  };
}

/** Fire Lead event verso Meta Conversions API. Best-effort: failure
 *  loggato ma non bloccante per la response al client. Se le env CAPI
 *  mancano, skip silenzioso (no-op). */
async function fireCapiLead(
  lead: Lead,
  eventId: string,
  ctx: CapiContext,
): Promise<void> {
  const datasetId = process.env.META_CAPI_DATASET_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  const testEventCode = process.env.META_CAPI_TEST_EVENT_CODE;

  if (!datasetId || !accessToken) {
    /* Config mancante: senza questo warn il CAPI resta spento in silenzio
       (è successo — META_CAPI_DATASET_ID non era mai stata settata). */
    console.warn(
      "[lead] CAPI skipped: missing META_CAPI_DATASET_ID or ACCESS_TOKEN",
    );
    return;
  }

  const userData: Record<string, string | string[]> = {
    em: [sha256(lead.email)],
    ph: [sha256(normalizePhone(lead.phone))],
    fn: [sha256(lead.name)],
    ln: [sha256(lead.surname)],
  };
  if (ctx.ip) userData.client_ip_address = ctx.ip;
  if (ctx.userAgent) userData.client_user_agent = ctx.userAgent;
  if (ctx.fbp) userData.fbp = ctx.fbp;
  if (ctx.fbc) userData.fbc = ctx.fbc;

  const body: Record<string, unknown> = {
    data: [
      {
        event_name: "Lead",
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: "website",
        ...(ctx.sourceUrl ? { event_source_url: ctx.sourceUrl } : {}),
        user_data: userData,
      },
    ],
  };
  if (testEventCode) {
    body.test_event_code = testEventCode;
  }

  const url = `https://graph.facebook.com/v18.0/${datasetId}/events?access_token=${encodeURIComponent(
    accessToken,
  )}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("[lead][capi] post failed", {
        status: res.status,
        body: text,
        eventId,
      });
      return;
    }
    console.info("[lead][capi] delivered", { eventId });
  } catch (err) {
    clearTimeout(timeoutId);
    console.error("[lead][capi] request threw", {
      err: err instanceof Error ? err.message : String(err),
      eventId,
    });
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "method_not_allowed" });
    return;
  }

  const parsed = LeadSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      ok: false,
      error: "validation",
      issues: parsed.error.issues,
    });
    return;
  }

  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn("[lead] SLACK_WEBHOOK_URL missing — payload not delivered", {
      email: parsed.data.email,
    });
    res.status(503).json({ ok: false, error: "config_missing" });
    return;
  }

  /* event_id: usa quello dal client (dedup con Pixel) o ne genera uno
     server-side per il fire CAPI. */
  const eventId = parsed.data.event_id ?? randomUUID();
  const capiCtx = extractCapiContext(req);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const slackRes = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildSlackPayload(parsed.data)),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!slackRes.ok) {
      const bodyText = await slackRes.text().catch(() => "");
      console.error("[lead] Slack post failed", {
        status: slackRes.status,
        body: bodyText,
        payload: parsed.data,
      });
      res.status(502).json({ ok: false, error: "slack_post_failed" });
      return;
    }

    /* CAPI fire DOPO Slack OK. Fire-and-forget intenzionale: la
       deliverability del lead a Slack è priorità 1, il tracking è
       secondario. Non aspetto la risposta — se CAPI è lento non
       voglio penalizzare la response al client. */
    void fireCapiLead(parsed.data, eventId, capiCtx);

    console.info("[lead] delivered", { email: parsed.data.email, eventId });
    res.status(200).json({ ok: true, event_id: eventId });
  } catch (err) {
    clearTimeout(timeoutId);
    console.error("[lead] Slack request threw", {
      err: err instanceof Error ? err.message : String(err),
      payload: parsed.data,
    });
    res.status(502).json({ ok: false, error: "slack_unreachable" });
  }
}
