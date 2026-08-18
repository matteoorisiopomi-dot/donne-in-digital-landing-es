/**
 * Test ad-hoc edge cases per LeadSchema (Zod). Mercato: SPAGNA.
 * Replica dello schema in api/lead.ts — manuale per evitare di
 * dover importare un .ts.
 *
 * IMPORTANTE: lo schema qui sotto deve restare allineato a api/lead.ts,
 * incluso il guard telefono +34 (vedi PHONE_RULES). Se modifichi lo schema
 * reale, riallinea questa copia e i casi telefono.
 *
 * Esegui: node scripts/test-lead-schema.mjs
 */

import { z } from "zod";

/* Speculare a PHONE_RULES in api/lead.ts. Unico mercato: ES (+34),
   solo móviles: 6xxxxxxxx e 71-79xxxxxxx (9 cifre). Il range 70x è
   "numeración personal", non un móvil, ed è escluso. */
const PHONE_RULES = {
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
    /* Guard server-side: il client normalizza già in E.164 e ammette solo
       ES. Qui richiediamo un solo "+", country code ammesso E lunghezza
       nazionale conforme al mercato. NB: lo schema reale riceve il telefono
       GIÀ normalizzato dal form (niente spazi/trattini); i casi con
       separatori qui sotto verificano solo che valori non-E.164 vengano
       rifiutati. */
    .refine(
      (v) => {
        const m = /^\+(\d{2})(\d+)$/.exec(v);
        if (!m) return false;
        const rule = PHONE_RULES[m[1]];
        return rule !== undefined && rule.test(m[2]);
      },
      { message: "phone_not_supported_market" },
    ),
  age: z.coerce.number().int().min(18).max(99),
  occupation: z.string().trim().min(2).max(80),
  motivation: z.string().trim().min(2).max(1000),
  goal: z.string().trim().min(2).max(1000),
  aware: z.enum(["yes", "no"]),
  consent: z.literal(true),
  event_id: z.uuid().optional(),
});

/* Telefoni di riferimento (E.164, come li produce buildE164 nel form). */
const ES_MOBILE_6 = "+34612345678";
const ES_MOBILE_7 = "+34712345678";

const cases = [
  /* ---------- expected to ACCEPT ---------- */
  {
    label: "happy path ES — móvil 6x",
    expectOk: true,
    payload: {
      name: "Lucía",
      surname: "García",
      email: "lucia@ejemplo.es",
      phone: ES_MOBILE_6,
      age: 34,
      occupation: "dependienta",
      motivation: "Llevo años en la tienda y quiero cambiar de sector.",
      goal: "Organizarme el día yo misma y trabajar desde casa.",
      aware: "yes",
      consent: true,
    },
  },
  {
    label: "happy path ES — móvil 7x",
    expectOk: true,
    payload: {
      name: "Marta",
      surname: "Ruiz",
      email: "marta.ruiz@ejemplo.es",
      phone: ES_MOBILE_7,
      age: 29,
      occupation: "peluquera",
      aware: "yes",
      consent: true,
    },
  },
  {
    label: "email con +tag",
    expectOk: true,
    payload: {
      name: "Nuria",
      surname: "Sanz",
      email: "nuria+ads@gmail.com",
      phone: ES_MOBILE_6,
      age: 30,
      occupation: "administrativa",
      aware: "yes",
      consent: true,
    },
  },
  {
    label: "apellido con acento y ñ",
    expectOk: true,
    payload: {
      name: "Begoña",
      surname: "Martínez Núñez",
      email: "begona@ejemplo.es",
      phone: ES_MOBILE_6,
      age: 45,
      occupation: "camarera",
      aware: "yes",
      consent: true,
    },
  },
  {
    label: "italiana expat en España (nombre IT, móvil ES)",
    expectOk: true,
    payload: {
      name: "Niccolò",
      surname: "D'Angelo",
      email: "n.dangelo@ejemplo.es",
      phone: ES_MOBILE_7,
      age: 37,
      occupation: "cameriera",
      motivation: "Me mudé a Valencia y quiero dejar los turnos.",
      goal: "Un trabajo que no dependa del horario del local.",
      aware: "yes",
      consent: true,
    },
  },
  {
    label: "occupation con paréntesis",
    expectOk: true,
    payload: {
      name: "Sara",
      surname: "Gómez",
      email: "sara@ejemplo.es",
      phone: ES_MOBILE_6,
      age: 36,
      occupation: "camarera (turno de noche)",
      aware: "yes",
      consent: true,
    },
  },
  {
    label: "aware=no — lead etiquetado, NO descartado",
    expectOk: true,
    payload: {
      name: "Pilar",
      surname: "Ortega",
      email: "pilar@ejemplo.es",
      phone: ES_MOBILE_6,
      age: 42,
      occupation: "administrativa",
      aware: "no",
      consent: true,
    },
  },
  {
    label: "age boundary 18",
    expectOk: true,
    payload: {
      name: "Alba",
      surname: "Ferrer",
      email: "alba@ejemplo.es",
      phone: ES_MOBILE_7,
      age: 18,
      occupation: "estudiante",
      aware: "yes",
      consent: true,
    },
  },
  {
    label: "age boundary 99",
    expectOk: true,
    payload: {
      name: "Carmen",
      surname: "Vega",
      email: "carmen@ejemplo.es",
      phone: ES_MOBILE_6,
      age: 99,
      occupation: "jubilada",
      aware: "yes",
      consent: true,
    },
  },
  {
    label: "event_id UUID v4",
    expectOk: true,
    payload: {
      name: "Eva",
      surname: "Blanco",
      email: "eva@ejemplo.es",
      phone: ES_MOBILE_6,
      age: 30,
      occupation: "administrativa",
      aware: "yes",
      consent: true,
      event_id: "550e8400-e29b-41d4-a716-446655440000",
    },
  },

  /* ---------- expected to FAIL — teléfono ES fuera de regla ---------- */
  {
    label: "ES fijo Madrid (+34 9xx) — debe fallar",
    expectOk: false,
    payload: {
      name: "Elena",
      surname: "Prieto",
      email: "elena@ejemplo.es",
      phone: "+34912345678",
      age: 35,
      occupation: "administrativa",
      aware: "yes",
      consent: true,
    },
  },
  {
    label: "ES fijo 8xx (+34 8xx) — debe fallar",
    expectOk: false,
    payload: {
      name: "Rosa",
      surname: "Lara",
      email: "rosa@ejemplo.es",
      phone: "+34812345678",
      age: 39,
      occupation: "dependienta",
      aware: "yes",
      consent: true,
    },
  },
  {
    label: "ES 70x (numeración personal, no móvil) — debe fallar",
    expectOk: false,
    payload: {
      name: "Ana",
      surname: "Moya",
      email: "ana.moya@ejemplo.es",
      phone: "+34701234567",
      age: 41,
      occupation: "administrativa",
      aware: "yes",
      consent: true,
    },
  },
  {
    label: "ES demasiado corto (8 dígitos nacionales) — debe fallar",
    expectOk: false,
    payload: {
      name: "Irene",
      surname: "Soto",
      email: "irene@ejemplo.es",
      phone: "+3461234567",
      age: 31,
      occupation: "administrativa",
      aware: "yes",
      consent: true,
    },
  },
  {
    label: "ES demasiado largo (10 dígitos nacionales) — debe fallar",
    expectOk: false,
    payload: {
      name: "Ana",
      surname: "Molina",
      email: "ana@ejemplo.es",
      phone: "+346123456789",
      age: 27,
      occupation: "camarera",
      aware: "yes",
      consent: true,
    },
  },
  {
    label: "ES nacional sin prefijo (612345678) — debe fallar",
    expectOk: false,
    payload: {
      name: "Clara",
      surname: "Ibáñez",
      email: "clara@ejemplo.es",
      phone: "612345678",
      age: 29,
      occupation: "administrativa",
      aware: "yes",
      consent: true,
    },
  },
  {
    label: "ES con separadores (no normalizado) — debe fallar",
    expectOk: false,
    payload: {
      name: "Test",
      surname: "Test",
      email: "t@ejemplo.es",
      phone: "+34 612 34 56 78",
      age: 30,
      occupation: "test",
      aware: "yes",
      consent: true,
    },
  },
  {
    label: "doble country code (+3434…) — debe fallar",
    expectOk: false,
    payload: {
      name: "Test",
      surname: "Test",
      email: "t@ejemplo.es",
      phone: "+3434612345678",
      age: 30,
      occupation: "test",
      aware: "yes",
      consent: true,
    },
  },

  /* ---------- expected to FAIL — países fuera de mercado ---------- */
  {
    label: "teléfono IT (+39) — fuera de mercado",
    expectOk: false,
    payload: {
      name: "Luca",
      surname: "Bianchi",
      email: "luca@example.it",
      phone: "+393331234567",
      age: 28,
      occupation: "freelance",
      aware: "no",
      consent: true,
    },
  },
  {
    label: "teléfono CH (+41) — fuera de mercado",
    expectOk: false,
    payload: {
      name: "Heidi",
      surname: "Frei",
      email: "heidi@example.ch",
      phone: "+41791234567",
      age: 33,
      occupation: "impiegata",
      aware: "yes",
      consent: true,
    },
  },
  {
    label: "teléfono DE (+49) — fuera de mercado",
    expectOk: false,
    payload: {
      name: "Petra",
      surname: "Schmidt",
      email: "petra@example.de",
      phone: "+4917612345678",
      age: 38,
      occupation: "Verkäuferin",
      aware: "yes",
      consent: true,
    },
  },
  {
    label: "teléfono US (+1) — fuera de mercado",
    expectOk: false,
    payload: {
      name: "Jane",
      surname: "Doe",
      email: "jane@example.com",
      phone: "+12025550123",
      age: 41,
      occupation: "manager",
      aware: "yes",
      consent: true,
    },
  },
  {
    label: "teléfono PT (+351) — fuera de mercado (vecino)",
    expectOk: false,
    payload: {
      name: "Ana",
      surname: "Sousa",
      email: "ana@example.pt",
      phone: "+351912345678",
      age: 34,
      occupation: "empregada",
      aware: "yes",
      consent: true,
    },
  },
  {
    label: "phone solo separadores (sin dígitos)",
    expectOk: false,
    payload: {
      name: "Test",
      surname: "Test",
      email: "t@ejemplo.es",
      phone: "++++----",
      age: 30,
      occupation: "test",
      aware: "yes",
      consent: true,
    },
  },
  {
    label: "phone demasiado corto (5 caracteres)",
    expectOk: false,
    payload: {
      name: "Test",
      surname: "Test",
      email: "t@ejemplo.es",
      phone: "12345",
      age: 30,
      occupation: "test",
      aware: "yes",
      consent: true,
    },
  },

  /* ---------- expected to FAIL — otros campos (teléfono válido) ---------- */
  {
    label: "age 17 (por debajo del mínimo)",
    expectOk: false,
    payload: {
      name: "Test",
      surname: "Test",
      email: "t@ejemplo.es",
      phone: ES_MOBILE_6,
      age: 17,
      occupation: "test",
      aware: "yes",
      consent: true,
    },
  },
  {
    label: "consent=false",
    expectOk: false,
    payload: {
      name: "Test",
      surname: "Test",
      email: "t@ejemplo.es",
      phone: ES_MOBILE_6,
      age: 30,
      occupation: "test",
      aware: "yes",
      consent: false,
    },
  },
  {
    label: "email mal formado",
    expectOk: false,
    payload: {
      name: "Test",
      surname: "Test",
      email: "not-an-email",
      phone: ES_MOBILE_7,
      age: 30,
      occupation: "test",
      aware: "yes",
      consent: true,
    },
  },
  {
    label: "motivation demasiado corta",
    expectOk: false,
    payload: {
      name: "Test",
      surname: "Test",
      email: "t@ejemplo.es",
      phone: ES_MOBILE_6,
      age: 30,
      occupation: "test",
      motivation: "x",
      goal: "Más tiempo para mi familia.",
      aware: "yes",
      consent: true,
    },
  },
  {
    label: "goal vacío",
    expectOk: false,
    payload: {
      name: "Test",
      surname: "Test",
      email: "t@ejemplo.es",
      phone: ES_MOBILE_7,
      age: 30,
      occupation: "test",
      motivation: "Quiero cambiar de trabajo.",
      goal: "",
      aware: "yes",
      consent: true,
    },
  },
  {
    label: "aware fuera del enum",
    expectOk: false,
    payload: {
      name: "Test",
      surname: "Test",
      email: "t@ejemplo.es",
      phone: ES_MOBILE_6,
      age: 30,
      occupation: "test",
      aware: "quizás",
      consent: true,
    },
  },
];

let pass = 0;
let fail = 0;

/* Respuestas abiertas válidas por defecto, inyectadas en cada payload: los
   casos existentes siguen siendo válidos y los "expected FAIL" fallan por su
   motivo, no por los campos abiertos. Los casos específicos las sobrescriben. */
const OPEN_DEFAULTS = {
  motivation: "Quiero cambiar de trabajo.",
  goal: "Más tiempo para mi familia.",
};

for (const c of cases) {
  const result = LeadSchema.safeParse({ ...OPEN_DEFAULTS, ...c.payload });
  const ok = result.success;
  const matches = ok === c.expectOk;
  if (matches) {
    pass++;
    console.log(`✅ ${c.label} — ${ok ? "ACCEPT" : "REJECT"}`);
  } else {
    fail++;
    console.log(
      `❌ ${c.label} — expected ${c.expectOk ? "ACCEPT" : "REJECT"} got ${ok ? "ACCEPT" : "REJECT"}`,
    );
    if (!ok) console.log("   issues:", result.error.issues);
  }
}

console.log(`\n${pass}/${pass + fail} passed`);
process.exit(fail === 0 ? 0 : 1);
