/**
 * Test della normalizzazione E.164 del campo telefono (OptInGate.astro).
 * Mercato: SPAGNA (+34 unico prefisso ammesso).
 *
 * Le funzioni qui sotto sono una COPIA VERBATIM di quelle nello script
 * client di src/components/OptInGate.astro. Servono a verificare la tabella
 * di normalizzazione richiesta in fase di review senza dover guidare un
 * browser. Se modifichi la logica nel componente, riallinea anche questo file.
 *
 *   node scripts/test-phone-normalize.mjs
 */

const phoneMessages = {
  es: "ES_INVALID",
  unsupported: "UNSUPPORTED",
  malformed: "MALFORMED",
};

const PHONE_RULES = {
  "34": { rule: /^(?:6\d|7[1-9])\d{7}$/, message: phoneMessages.es },
};

function buildE164(raw, dial) {
  const trimmed = raw.trim();
  const startsWithPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return "";
  if (startsWithPlus) return `+${digits}`;
  if (digits.startsWith("00")) return `+${digits.slice(2)}`;
  // tolleranza: ES non ha trunk zero, ma alcuni utenti lo digitano per
  // abitudine (o copiano un formato estero). Lo scartiamo invece di
  // bocciare il numero.
  if (digits.startsWith("0")) return `+${dial}${digits.slice(1)}`;
  return `+${dial}${digits}`;
}

function validatePhone(raw, dial) {
  const e164 = buildE164(raw, dial);
  if (!e164 || /^\+0/.test(e164) || /^\+34(?:34)/.test(e164)) {
    return { ok: false, value: "", message: phoneMessages.malformed };
  }
  if (!/^\+34\d+$/.test(e164)) {
    return { ok: false, value: "", message: phoneMessages.unsupported };
  }
  const cc = e164.slice(1, 3);
  const national = e164.slice(3);
  const entry = PHONE_RULES[cc];
  if (!entry) {
    return { ok: false, value: "", message: phoneMessages.unsupported };
  }
  if (!entry.rule.test(national)) {
    return { ok: false, value: "", message: entry.message };
  }
  return { ok: true, value: e164, message: "" };
}

/* [input, dialSelezionato, attesoOk, attesoValore|messaggio] */
const cases = [
  /* ---------- ES (+34) — mobili validi, tutte le forme di input ---------- */
  ["612 34 56 78", "34", true, "+34612345678"], // mobile 6x, spaziato
  ["612345678", "34", true, "+34612345678"], // mobile 6x, nudo
  ["712345678", "34", true, "+34712345678"], // mobile 7x
  ["+34 612 345 678", "34", true, "+34612345678"], // già in E.164
  ["0034612345678", "34", true, "+34612345678"], // accesso internazionale 00
  ["612-34-56-78", "34", true, "+34612345678"], // separatori misti
  ["(612) 345 678", "34", true, "+34612345678"], // parentesi
  ["0612345678", "34", true, "+34612345678"], // trunk zero digitato per abitudine

  /* ---------- ES — fissi: rifiutati di proposito (solo móviles) ---------- */
  ["912345678", "34", false, "ES_INVALID"], // fisso Madrid 9xx
  ["932345678", "34", false, "ES_INVALID"], // fisso Barcellona 93x
  ["812345678", "34", false, "ES_INVALID"], // fisso 8xx
  ["900123456", "34", false, "ES_INVALID"], // numero gratuito 900
  ["701234567", "34", false, "ES_INVALID"], // 70x = numeración personal, non móvil

  /* ---------- ES — lunghezza fuori norma ---------- */
  ["61234567", "34", false, "ES_INVALID"], // 8 cifre → troppo corto
  ["6123456", "34", false, "ES_INVALID"], // 7 cifre → troppo corto
  ["6123456789", "34", false, "ES_INVALID"], // 10 cifre → troppo lungo
  ["+34612345", "34", false, "ES_INVALID"], // E.164 troncato

  /* ---------- Paesi non ammessi (fuori mercato) ---------- */
  ["+39 333 1234567", "34", false, "UNSUPPORTED"], // IT
  ["+41 79 123 45 67", "34", false, "UNSUPPORTED"], // CH
  ["+49 176 12345678", "34", false, "UNSUPPORTED"], // DE
  ["+1 202 555 0123", "34", false, "UNSUPPORTED"], // US
  ["0039 333 1234567", "34", false, "UNSUPPORTED"], // IT via 00

  /* ---------- Malformati ---------- */
  ["3412345678", "34", false, "MALFORMED"], // doppio country code
  ["+34 34 612345678", "34", false, "MALFORMED"], // doppio country code, E.164
  ["+0034612345678", "34", false, "MALFORMED"], // "+00" → +0…
  ["+0", "34", false, "MALFORMED"],
  ["", "34", false, "MALFORMED"], // campo vuoto
  ["----", "34", false, "MALFORMED"], // solo separatori
];

let pass = 0;
let fail = 0;
const rows = [];
for (const [input, dial, expectedOk, expected] of cases) {
  const r = validatePhone(input, dial);
  const got = r.ok ? r.value : r.message;
  const ok = r.ok === expectedOk && got === expected;
  rows.push({
    input: input || "(vuoto)",
    dial: `+${dial}`,
    risultato: r.ok ? "VALID" : "BLOCK",
    output: got,
    atteso: expected,
    esito: ok ? "PASS" : "FAIL",
  });
  if (ok) pass++;
  else fail++;
}

console.table(rows);
console.log(`\n${pass}/${pass + fail} passed${fail ? ` — ${fail} FAILED` : ""}`);
process.exit(fail ? 1 : 0);
