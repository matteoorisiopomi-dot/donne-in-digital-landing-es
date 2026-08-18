// @ts-check
import { defineConfig, fontProviders } from "astro/config";

import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

// URL canonico del sito. Usato per canonical URL, og:url assoluti,
// sitemap.xml. Letto da env con fallback PLACEHOLDER.
//
// TODO (go-live): il dominio del mercato spagnolo non esiste ancora.
// Registrarlo, poi settare PUBLIC_SITE_URL=https://<dominio-finale> nel
// pannello Vercel (Project → Settings → Environment Variables) e fare un
// redeploy di production. Niente code change necessario.
//
// Il fallback è volutamente un dominio .invalid (RFC 2606): se finisce in
// un build di produzione salta all'occhio in canonical/og:url/sitemap
// invece di puntare in silenzio a un dominio sbagliato.
//
// ⚠️ `||` + `.trim()`, NON `??`: l'import del progetto su Vercel crea le
// env di .env.example come STRINGHE VUOTE. Con `??` il fallback non
// scatta (`"" ?? x` → `""`), `site: ""` arriva ad Astro e il build muore
// con "[config] Astro found issue(s): Invalid URL". Vuoto o soli spazi
// vanno trattati come env assente.
const siteUrl =
  (process.env.PUBLIC_SITE_URL || "").trim() ||
  "https://example-PLACEHOLDER.invalid";

// Rotte escluse dalla sitemap: tutte noindex.
//  - /gracias      thank-you page post-submit
//  - /aviso-legal  stub legale in stato DRAFT
//  - /privacidad   stub legale in stato DRAFT
// Le due legali vanno RIMESSE in sitemap quando il legal pack sostituisce
// i placeholder e le pagine perdono il noindex.
const EXCLUDED_FROM_SITEMAP = ["/gracias", "/aviso-legal", "/privacidad"];

// https://astro.build/config
export default defineConfig({
  site: siteUrl,
  integrations: [
    sitemap({
      filter: (page) =>
        !EXCLUDED_FROM_SITEMAP.some((route) => page.includes(route)),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Inter",
      cssVariable: "--font-inter",
      weights: ["400", "600"],
      styles: ["normal"],
      subsets: ["latin", "latin-ext"],
      fallbacks: [
        "system-ui",
        "-apple-system",
        "Segoe UI",
        "Roboto",
        "sans-serif",
      ],
      display: "swap",
    },
    {
      provider: fontProviders.google(),
      name: "Fraunces",
      cssVariable: "--font-fraunces",
      weights: ["500", "600"],
      styles: ["normal"],
      subsets: ["latin", "latin-ext"],
      fallbacks: ["Georgia", "Times New Roman", "serif"],
      display: "swap",
    },
  ],
});
