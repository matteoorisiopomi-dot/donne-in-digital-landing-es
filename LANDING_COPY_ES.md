# LANDING COPY — ES (castellano de España)

Todas las cadenas visibles de la landing, en orden de aparición, para
revisión por un hablante nativo.

**Mercado:** España. **Registro:** informal, tuteo (`tú`, nunca `usted`).
**Vocabulario:** peninsular — _móvil_ (no _celular_), _ordenador_ (no
_computadora_), _vídeo_ con tilde, _dependienta / peluquera /
administrativa_.

**Reglas de traducción aplicadas (no negociables):**

- **Cero income claims.** Ninguna cifra de ingresos, ningún "X al mes",
  ninguna promesa de resultado económico. El original italiano solo
  contenía reclamos de ese tipo en los componentes de reserva
  (`transformation.proofPoint` y `socialProof.testimonials[].result`
  contenían cifras de ingresos): esos bloques se han **eliminado por
  completo** de esta copia, no se han traducido.
- **Sin "certificación" como reclamo.** Esa palabra y sus variantes no
  aparecen en ninguna cadena y no deben añadirse: cualquier mención de un
  certificado requiere validación legal previa.
- **Registro sobrio.** Sin toxic positivity, sin exclamaciones en
  cadena, sin "cambia tu vida".
- **Sin reclamos absolutos:** nada de _garantizado_, _100 %_, _seguro_.
- `${BRAND_NAME}` = marca interpolada desde `src/content/copy.ts`. Valor
  temporal: ver `BRAND_RENAME_CHECKLIST.md`.

---

## 1. Navbar

| Posición                                 | Texto italiano original       | Traducción ES                   |
| ---------------------------------------- | ----------------------------- | ------------------------------- |
| Navbar → `aria-label` del enlace al logo | _(marca IT)_ _(`brand.name`)_ | `${BRAND_NAME}` _(interpolado)_ |
| Navbar → `alt` de la imagen del logo     | _(marca IT)_ _(`brand.name`)_ | `${BRAND_NAME}` _(interpolado)_ |

> La navbar no tiene texto propio: solo el logo centrado. El logo es un
> asset gráfico y **no** sigue a `BRAND_NAME` — hay que rehacerlo a mano.

## 2. Skip link (accesibilidad, visible solo al tabular)

| Posición                 | Texto italiano original | Traducción ES       |
| ------------------------ | ----------------------- | ------------------- |
| `Base.astro` → skip link | Salta al contenuto      | Saltar al contenido |

## 3. Hero / VSL

| Posición                                  | Texto italiano original                                                                       | Traducción ES                                                                            |
| ----------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `vsl.stepLabel` (píldora sobre el vídeo)  | Step 1 di 2                                                                                   | Paso 1 de 2                                                                              |
| `vsl.headline` (h1)                       | Guarda **attentamente** questa lezione per scoprire finalmente come **lavorare in digitale**. | Mira **con atención** esta clase y descubre por fin cómo **trabajar online desde casa**. |
| `vsl.subtitle`                            | Questa lezione potrebbe **non essere disponibile a lungo**.                                   | Puede que esta clase **no siga disponible mucho tiempo**.                                |
| `vsl.viewerSuffix` (contador, decorativo) | persone stanno guardando adesso                                                               | personas la están viendo ahora mismo                                                     |
| `vsl.rotateHint` (solo móvil vertical)    | Ruota il telefono per vedere meglio il video                                                  | Gira el móvil para ver mejor el vídeo                                                    |
| `VslSection` → `aria-label` de la sección | Video presentazione                                                                           | Vídeo de presentación                                                                    |

**Énfasis (`<span>` preservados):** en la headline `kw-plum` envuelve el
modo de mirar (_con atención_) y `kw-rose` la promesa real (_trabajar
online desde casa_, coherente con `labels.goal`). En el subtítulo
`kw-urgent` envuelve la escasez (_no siga disponible mucho tiempo_). Las clases CSS son idénticas al original: solo
cambia el texto de dentro, colocado sobre las palabras que llevan el peso
en castellano.

### 3b. Reproductor de vídeo

El VSL español **todavía no existe**: `vsl.video` está en
`{ provider: "placeholder" }`. Las dos cadenas del hueco del reproductor
viven ahora en `copy.ts` (`vsl.placeholder`) y son **neutras**: sin
referencias a rutas del código fuente, porque son exactamente lo que
vería un usuario si esta build llegara a tráfico real.

> **No se lanza tráfico de pago mientras `vsl.video` siga en
> "placeholder".** El bloqueo es de producto, no de idioma.

| Posición                | Texto italiano original                                                                | Traducción ES                        |
| ----------------------- | -------------------------------------------------------------------------------------- | ------------------------------------ |
| `vsl.placeholder.title` | Video VSL — placeholder                                                                | Vídeo en preparación                 |
| `vsl.placeholder.hint`  | Il video definitivo va incollato qui. Aggiornare `vsl.video` in `src/content/copy.ts`. | La clase estará disponible en breve. |

Cadenas que reaparecen al pasar `provider` a `"vimeo"` / `"mp4"`:

| Posición                                           | Texto italiano original    | Traducción ES                                                                                |
| -------------------------------------------------- | -------------------------- | -------------------------------------------------------------------------------------------- |
| Overlay de sonido → `aria-label` (×2: mp4 y vimeo) | Attiva audio               | Activar el sonido                                                                            |
| Overlay de sonido → texto visible (×2)             | Tocca per attivare l'audio | Toca para activar el sonido                                                                  |
| `<iframe title>` (×2: vimeo y youtube)             | Video VSL                  | Vídeo de presentación _(alineado con el `aria-label` de la sección: "VSL" es jerga interna)_ |

## 4. Gate / cuenta atrás

| Posición                                      | Texto italiano original                                                           | Traducción ES                                                                                         |
| --------------------------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `optinGate.timerLabel`                        | Il modulo per essere ricontattata apparirà tra                                    | El formulario aparecerá en                                                                            |
| Cifras de la cuenta atrás                     | `MM:SS`                                                                           | `MM:SS` _(sin cambios)_                                                                               |
| Párrafo `sr-only` (solo lectores de pantalla) | Il modulo di contatto si attiva dopo aver guardato il video. Continua la visione. | El formulario de contacto se desbloquea mientras ves el vídeo. Sigue viéndolo y aparecerá aquí abajo. |
| Live region al desbloquearse                  | Modulo sbloccato. Compila i dati qui sotto.                                       | Formulario desbloqueado. Rellena tus datos aquí abajo.                                                |
| `OptInGate` → `aria-label` de la sección      | Modulo di contatto                                                                | Formulario de contacto                                                                                |

## 5. Formulario — cabecera

| Posición                   | Texto italiano original                                        | Traducción ES                                                        |
| -------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------- |
| `optinGate.formTitle` (h2) | Lasciaci un contatto                                           | Déjanos tus datos                                                    |
| `optinGate.formIntro`      | Compila i campi qui sotto. Ti chiama la coach del nostro team. | Rellena los campos de abajo. Te escribe una coach de nuestro equipo. |

## 6. Formulario — campo por campo

| Campo                  | Elemento                             | Texto italiano original                                                                                      | Traducción ES                                                                                  |
| ---------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| Nombre                 | label                                | Nome                                                                                                         | Nombre                                                                                         |
| Nombre                 | placeholder                          | Es. Giulia                                                                                                   | p. ej. Lucía                                                                                   |
| Apellidos              | label                                | Cognome                                                                                                      | Apellidos                                                                                      |
| Apellidos              | placeholder                          | Es. Rossi                                                                                                    | p. ej. García Ruiz _(dos apellidos, coherente con la etiqueta en plural)_                      |
| Email                  | label                                | Email                                                                                                        | Email                                                                                          |
| Email                  | placeholder                          | nome@esempio.it                                                                                              | nombre@ejemplo.es                                                                              |
| Teléfono               | label                                | CONTATTO WHATSAPP                                                                                            | Número de WhatsApp _(sentence case, como el resto de etiquetas)_                               |
| Teléfono               | `aria-label` del selector de prefijo | Prefisso internazionale del telefono                                                                         | Prefijo internacional del teléfono                                                             |
| Teléfono               | opción del selector                  | 🇨🇭 Svizzera (+41) · 🇩🇪 Germania (+49) · 🇪🇸 Spagna (+34)                                                      | 🇪🇸 España (+34) _(único prefijo admitido)_                                                     |
| Teléfono               | placeholder (del ejemplo del país)   | 79 123 45 67                                                                                                 | 612 34 56 78                                                                                   |
| Teléfono               | hint bajo el campo                   | Solo numeri di cellulare. Inserisci il numero senza lo zero iniziale.                                        | Solo números de móvil. Escribe el número sin el prefijo internacional.                         |
| Edad                   | label                                | Età                                                                                                          | Edad                                                                                           |
| Edad                   | placeholder                          | Es. 34                                                                                                       | p. ej. 34                                                                                      |
| Ocupación              | label                                | Occupazione attuale                                                                                          | Ocupación actual                                                                               |
| Ocupación              | placeholder                          | Es. commessa, parrucchiera, impiegata                                                                        | p. ej. dependienta, peluquera, administrativa                                                  |
| Motivación             | label                                | Perché proprio adesso? Cosa ti ha spinta a lasciare i tuoi dati oggi?                                        | ¿Por qué ahora? ¿Qué te ha llevado a dejarnos tus datos hoy?                                   |
| Motivación             | placeholder                          | Rispondi con parole tue, anche poche righe.                                                                  | Responde con tus palabras, aunque sean pocas líneas.                                           |
| Objetivo               | label                                | Se finalmente riuscissi a imparare a lavorare online da casa, cosa cambierebbe concretamente nella tua vita? | Si por fin aprendieras a trabajar online desde casa, ¿qué cambiaría de verdad en tu día a día? |
| Objetivo               | placeholder                          | Rispondi con parole tue, anche poche righe.                                                                  | Responde con tus palabras, aunque sean pocas líneas.                                           |
| Pregunta cualificadora | legend                               | Investiresti su te stessa?                                                                                   | ¿Invertirías en ti misma?                                                                      |
| Pregunta cualificadora | opción sí                            | Sì                                                                                                           | Sí                                                                                             |
| Pregunta cualificadora | opción no                            | No                                                                                                           | No                                                                                             |

### 6b. Mensajes de error del teléfono

Los tres mensajes viven en `optinGate.labels.phoneErrors` y llegan al
script cliente como `data-msg-*`. Las claves `ch` y `de` del original se
han eliminado: en este mercado solo se admite **+34**.

| Clave                   | Texto italiano original                                                      | Traducción ES                                         |
| ----------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------- |
| `es`                    | Inserisci un numero di cellulare spagnolo valido.                            | Escribe un número de móvil español válido.            |
| `unsupported`           | Seleziona il prefisso giusto: Svizzera (+41), Germania (+49) o Spagna (+34). | Selecciona el prefijo correcto: España (+34).         |
| `malformed`             | Numero non valido. Controlla il prefisso (+) e lo zero iniziale.             | Número no válido. Revisa el prefijo (+) y el formato. |
| _fallback en el script_ | Numero non valido.                                                           | Número no válido.                                     |

> Solo se aceptan **móviles** españoles: `6xxxxxxxx` y `71x`–`79x`
> (9 dígitos). Los fijos `8xx` / `9xx` y el rango `70x` (_numeración
> personal_, que no es un móvil) se rechazan a propósito, en coherencia
> con el hint "Solo números de móvil".

## 7. Consentimiento

| Posición                                              | Texto italiano original                                                                                                                  | Traducción ES                                                                                                                                            |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `labels.consent.text`                                 | Acconsento al trattamento dei miei dati personali (nome, email, telefono) per essere ricontattata telefonicamente in merito al percorso. | Doy mi consentimiento para el tratamiento de mis datos personales (nombre, email, teléfono) con el fin de que me contactéis en relación con el programa. |
| `labels.consent.privacyText` (enlace bajo la casilla) | _(no existía en el original)_                                                                                                            | Consulta nuestra Política de privacidad.                                                                                                                 |
| `labels.consent.privacyHref`                          | —                                                                                                                                        | `/privacidad`                                                                                                                                            |

## 8. Envío

| Posición                              | Texto italiano original                                          | Traducción ES                                                        |
| ------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------- |
| `labels.submit` (botón)               | Invia                                                            | Enviar                                                               |
| `labels.submitting` (estado de carga) | Invio in corso…                                                  | Enviando…                                                            |
| `labels.privacyNote` (bajo el botón)  | I tuoi dati servono solo per ricontattarti. Mai venduti a terzi. | Tus datos solo se usan para contactarte. Nunca se venden a terceros. |

## 9. Página de agradecimiento (`/gracias`)

Ruta renombrada: `/grazie` → **`/gracias`**. Marcada `noindex`.

| Posición         | Texto italiano original                                                         | Traducción ES                                                                             |
| ---------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `<title>`        | Grazie — _(marca IT)_                                                           | Gracias — `${BRAND_NAME}`                                                                 |
| meta description | Abbiamo ricevuto i tuoi dati. Ti chiama la coach del nostro team.               | Hemos recibido tus datos. Te escribe una coach de nuestro equipo.                         |
| h1               | Fatto. Ti chiama la **Coach su Whatsapp**.                                      | Ya está. Te escribe la **coach por WhatsApp**.                                            |
| Párrafo          | Abbiamo ricevuto i tuoi dati. Ti contatta entro 48h al numero che hai lasciato. | Hemos recibido tus datos. Te escribimos al número que has dejado en un plazo de 48 horas. |

**Nota:** el `<span class="kw-rose">` del h1 se conserva y envuelve
_coach por WhatsApp_. Se ha corregido la grafía de la marca: _Whatsapp_ →
**WhatsApp**.

## 10. Footer

| Posición                              | Texto italiano original                                                                                                         | Traducción ES                                                                                                              |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `footer.tagline`                      | _(sostituita al rebrand)_                                                                                                       | **Tu nuevo oficio digital, paso a paso. Desde casa.** _(tagline ufficiale, verbatim dal committente — costante `TAGLINE`)_ |
| `footer.email`                        | —                                                                                                                               | info@chicasdigitales.com                                                                                                   |
| `footer.copyright`                    | © _(año)_ _(marca IT)_. Tutti i diritti riservati.                                                                              | © _(año)_ `${BRAND_NAME}`. Todos los derechos reservados.                                                                  |
| `footer.disclaimer`                   | Questo sito non fa parte del sito web di Meta o di Google. Inoltre, questo sito non è approvato da Meta o Google in alcun modo. | Este sitio no forma parte del sitio web de Meta ni de Google. Tampoco está avalado por Meta ni por Google en modo alguno.  |
| `footer.legalLinks[0].label`          | _(no existía en el original)_                                                                                                   | Aviso legal → `/aviso-legal`                                                                                               |
| `footer.legalLinks[1].label`          | _(no existía en el original)_                                                                                                   | Política de privacidad → `/privacidad`                                                                                     |
| Nav de enlaces legales → `aria-label` | —                                                                                                                               | Enlaces legales                                                                                                            |

## 11. Páginas legales (BORRADOR)

Ambas son **stubs**: contenido de marcador de posición, marcado
claramente como borrador, `noindex`, fuera de sitemap y bloqueadas en
`robots.txt`. El texto definitivo llega del paquete legal antes del
lanzamiento. **No hay original italiano**: son páginas nuevas de esta
copia.

### `/aviso-legal`

| Posición           | Traducción ES                                                                                                                                                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<title>`          | Aviso legal — `${BRAND_NAME}`                                                                                                                                                                                                         |
| meta description   | Aviso legal del sitio. Documento en preparación: el texto definitivo se publicará antes del lanzamiento.                                                                                                                              |
| Banner de borrador | **BORRADOR** — texto legal pendiente. Este contenido es un marcador de posición: el texto definitivo del aviso legal llega del paquete legal y se publicará antes del lanzamiento. No lo consideres información válida ni vinculante. |
| h1                 | Aviso legal                                                                                                                                                                                                                           |
| Párrafo 1          | Aquí irán los datos identificativos del titular del sitio: razón social, NIF, domicilio, correo de contacto y datos registrales.                                                                                                      |
| Párrafo 2          | También las condiciones de uso del sitio, la titularidad de los contenidos y de la propiedad intelectual, el régimen de responsabilidad sobre enlaces externos, y la legislación aplicable junto con el fuero competente.             |
| Párrafo 3          | Mientras tanto, si necesitas cualquier aclaración, puedes pedírnosla cuando la coach te contacte.                                                                                                                                     |

### `/privacidad`

| Posición           | Traducción ES                                                                                                                                                                                                                                      |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<title>`          | Política de privacidad — `${BRAND_NAME}`                                                                                                                                                                                                           |
| meta description   | Política de privacidad del sitio. Documento en preparación: el texto definitivo se publicará antes del lanzamiento.                                                                                                                                |
| Banner de borrador | **BORRADOR** — texto legal pendiente. Este contenido es un marcador de posición: el texto definitivo de la política de privacidad llega del paquete legal y se publicará antes del lanzamiento. No lo consideres información válida ni vinculante. |
| h1                 | Política de privacidad                                                                                                                                                                                                                             |
| Párrafo 1          | Aquí irán el responsable del tratamiento y sus datos de contacto, las finalidades por las que tratamos tus datos y la base jurídica de cada una.                                                                                                   |
| Párrafo 2          | También los plazos de conservación, los destinatarios y encargados que intervienen, las eventuales transferencias internacionales, y el detalle de las herramientas de medición publicitaria que utiliza el sitio.                                 |
| Párrafo 3          | Y por último tus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad, cómo ejercerlos y cómo presentar una reclamación ante la autoridad de control.                                                                |
| Párrafo 4          | En resumen, y a la espera del texto definitivo: los datos que dejas en el formulario se usan solo para contactarte. No se venden a terceros.                                                                                                       |

## 12. Mensajes de Slack (internos, no visibles al usuario)

Definidos en `api/lead.ts` → `buildSlackPayload`. Los ve solo el equipo.

| Posición                          | Texto italiano original                                      | Texto ES                                                               |
| --------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------- |
| Cabecera estándar (`aware = yes`) | 🔔 Nuovo lead — _(marca IT)_                                 | 🔔 Nuevo lead ES - `${BRAND_NAME}`                                     |
| Cabecera de aviso (`aware = no`)  | ⚠️ Nuovo lead — risposta "No" su consapevolezza investimento | ⚠️ Nuevo lead ES - `${BRAND_NAME}` - respuesta "No" sobre la inversión |
| Etiqueta 1                        | Nome                                                         | Nombre                                                                 |
| Etiqueta 2                        | Età                                                          | Edad                                                                   |
| Etiqueta 3                        | Email                                                        | Email                                                                  |
| Etiqueta 4                        | Telefono                                                     | Teléfono                                                               |
| Etiqueta 5                        | Occupazione                                                  | Ocupación                                                              |
| Etiqueta 6                        | Perché proprio adesso                                        | Por qué justo ahora _(etiqueta interna de Slack, no visible al lead)_  |
| Etiqueta 7                        | Cosa cambierebbe nella sua vita                              | Qué cambiaría en su vida                                               |
| Etiqueta 8                        | Consapevole investimento                                     | Consciente de la inversión                                             |
| Valor sí                          | ✅ Sì                                                        | ✅ Sí                                                                  |
| Valor no                          | ❌ No                                                        | ❌ No                                                                  |
| Bloque de contexto final          | Ricevuto _(ISO timestamp)_                                   | Recibido: _(ISO timestamp)_                                            |

> El lead con `aware = no` **no se descarta**: se etiqueta con la
> cabecera de aviso y la coach decide durante la llamada.
>
> Los **códigos de error de la API** (`phone_min_digits`,
> `phone_not_supported_market`, `validation`, `config_missing`,
> `slack_post_failed`, `slack_unreachable`, `method_not_allowed`) son
> contrato máquina-máquina: **no se traducen**, quedan idénticos.

## 13. Meta / SEO / manifiesto

| Posición                          | Texto italiano original                                          | Traducción ES                                                                                    |
| --------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `meta.title` (home)               | _(marca IT)_ — Lavora da remoto gestendo la comunicazione online | `${BRAND_NAME}` — Trabaja en remoto gestionando la comunicación online                           |
| `meta.description` (home)         | _(sostituita al rebrand)_                                        | **Tu nuevo oficio digital, paso a paso. Desde casa.** _(= `TAGLINE`, stessa stringa del footer)_ |
| `<html lang>`                     | `it`                                                             | `es`                                                                                             |
| `og:locale`                       | `it_IT`                                                          | `es_ES`                                                                                          |
| `site.webmanifest` → `name`       | _(marca IT)_                                                     | `${BRAND_NAME}` _(generado)_                                                                     |
| `site.webmanifest` → `short_name` | _(marca IT, forma corta)_                                        | derivado de `${BRAND_NAME}` _(palabras ≤ 2 caracteres descartadas)_                              |
| `site.webmanifest` → `lang`       | _(ausente)_                                                      | `es`                                                                                             |
| `robots.txt` → comentarios        | _(en italiano)_                                                  | _(traducidos al castellano)_                                                                     |

---

## Notas para el QA nativo

1. **Tuteo consistente.** Toda la landing tutea. La única forma verbal en
   segunda persona del plural es _"que me contactéis"_ en el texto de
   consentimiento y _"pedírnosla"_ en el aviso legal: se refieren al
   equipo (vosotros), no a la usuaria. Es correcto en castellano
   peninsular y deliberado.
2. **Género.** El público objetivo son mujeres: _"¿Invertirías en ti
   misma?"_, _"una coach"_, _"dependienta, peluquera, administrativa"_.
   Coherente con el original italiano.
3. **"Coach"** se mantiene en inglés, como en italiano: es el término que
   usa el sector en España y no tiene equivalente natural.
4. **"48 horas"** en la página de agradecimiento: la abreviatura "48 h"
   es notación técnica y desentona en una frase de cierre. Si en algún
   momento se vuelve a abreviar, va con espacio antes de la unidad.
5. **Palabras prohibidas** que NO deben aparecer nunca: _certificación_,
   _certificación oficial_, _garantizado_, _100 %_, _seguro_ (como
   promesa), cualquier cifra de ingresos.
6. **La cuenta atrás sigue en 570 s**, heredada del VSL italiano de
   10:30. No corresponde a ningún vídeo español: hay que recalcularla
   (`duración − 60`) cuando llegue el VSL de este mercado.
