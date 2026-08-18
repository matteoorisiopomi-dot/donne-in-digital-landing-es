/**
 * /site.webmanifest — generato, non statico.
 *
 * Prima era un file in public/. È diventato un endpoint Astro perché
 * `name` e `short_name` derivano da BRAND_NAME: così il brand resta in
 * UN SOLO punto (src/content/copy.ts) e il rename non richiede di
 * ricordarsi di aprire un JSON a mano.
 *
 * Output statico: Astro lo prerenderizza al build in dist/site.webmanifest.
 * Le icone restano asset statici in public/ — vanno rifatte a mano al
 * rename del brand (vedi BRAND_RENAME_CHECKLIST.md).
 */

import type { APIRoute } from "astro";
import { BRAND_NAME } from "../content/copy.ts";

/**
 * `short_name` è la variante compatta mostrata sotto l'icona nella home
 * screen. Deriva da BRAND_NAME scartando le parole di collegamento
 * (≤ 2 caratteri), es. "Marca de Ejemplo" → "Marca Ejemplo".
 */
const shortName =
  BRAND_NAME.split(/\s+/)
    .filter((word) => word.length > 2)
    .join(" ") || BRAND_NAME;

const manifest = {
  name: BRAND_NAME,
  short_name: shortName,
  lang: "es",
  icons: [
    {
      src: "/android-chrome-192x192.png",
      sizes: "192x192",
      type: "image/png",
    },
    {
      src: "/android-chrome-512x512.png",
      sizes: "512x512",
      type: "image/png",
    },
  ],
  theme_color: "#18082a",
  background_color: "#e8aacf",
  display: "standalone",
};

export const GET: APIRoute = () =>
  new Response(JSON.stringify(manifest, null, 2), {
    headers: {
      "Content-Type": "application/manifest+json",
    },
  });
