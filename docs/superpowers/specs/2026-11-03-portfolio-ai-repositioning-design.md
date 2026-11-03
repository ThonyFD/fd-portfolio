# Portafolio: reposicionamiento IA + SEO/AEO/ATS

Fecha: 2026-11-03
Estado: borrador para aprobación

## Intención

Anthony Mosquera (ThonyFD) tiene 15+ años de trayectoria (Telefónica, Banistmo, Banco General Banca Móvil/Yappy, Tigo, Cox, Banco Aliado, hoy Solutions Architect en ASSA) y muchos proyectos personales con IA. El portafolio actual cuenta la historia de un "Full Stack Developer" y la IA casi no aparece.

Lector objetivo: **reclutador internacional que llega desde LinkedIn buscando un ingeniero con experiencia en IA para un puesto remoto**. Lo revisa en 30 a 60 segundos y probablemente en inglés. También lo van a leer máquinas: buscadores, motores de respuesta con IA (ChatGPT, Perplexity, Claude, Gemini) y herramientas automatizadas de reclutamiento y ATS.

Éxito: en menos de un minuto el lector (humano o máquina) concluye que es un **arquitecto de soluciones con IA en producción**, ve 2 o 3 proyectos de IA con impacto concreto, sabe que está abierto a remoto y tiene una forma directa de contactarlo.

## Objetivos

1. Poner la IA al frente: titular, resumen y una sección nueva "AI Experience" como primera sección después del hero.
2. Que todo el contenido exista en el HTML servido (sin depender de JavaScript) para crawlers, bots de IA y ATS.
3. Datos estructurados y archivos de descubrimiento: JSON-LD, sitemap, robots, `llms.txt`, Open Graph correcto.
4. Diseño visual nuevo, sobrio y técnico, hecho con los skills de frontend del entorno (impeccable / design-taste-frontend).
5. Mantener Firestore como fuente del contenido y el flujo actual de "pedir a Claude que actualice Firebase".

## No objetivos

- Panel de administración o CMS nuevo.
- Blog.
- Chatbot en la página (hay uno comentado en `home.page.html`; queda fuera).
- Rediseño de la marca FD Systems; `/fd-systems` se migra técnicamente, sin cambiar su contenido ni su estética.

## Anti-objetivos (sería un fracaso aunque funcione)

- Inventar o inflar experiencia de IA. Todo proyecto listado debe existir y describirse con lo que realmente hace.
- Una página que se ve bien pero que, sin JavaScript, sigue mostrando un `<app-root>` vacío.
- Estética genérica de plantilla "AI-made" (gradientes morados, glassmorphism por defecto, emojis en cada línea).
- Texto ilegible para máquinas: contenido metido en shadow DOM, imágenes con texto o fechas en formatos ambiguos.

## Decisiones tomadas por el usuario

- Actualizar Angular (hoy 16) a una versión actual y **quitar Ionic** de las páginas públicas.
- Reposicionar hacia IA con una sección "Experiencia con IA" (EN: "AI Experience").
- Proyectos de IA a incluir (nada es confidencial):
  1. **Datacentria: AI Omnichannel Agent Backend** (cliente DATACENTRIA, proveedor FD Systems, 2026). Middleware serverless y orientado a eventos que conecta agentes conversacionales de GHL AI Studio con GoHighLevel CRM. AWS SAM, Node.js 22, TypeScript, 8 Lambdas, SQS + DLQ, 7 tablas DynamoDB, S3, validación HMAC, deduplicación, OAuth con GHL. Fuente: `~/orca/workspaces/datacentria-aws-middalware` y `~/projects/datacentria`.
  2. **AI Finance Agent** (personal-dashboard, 2026). Agente serverless que monitorea Gmail, extrae transacciones financieras con Gemini (`@google/genai`) y alimenta un dashboard React. Cloud Run (ingestor, poller, monitor, renovación de token), push con polling de respaldo. Repo público `ThonyFD/personal-dashboard`. Fuente: `~/orca/workspaces/personal-dashboard/telescopefish`.
  3. **AI Job Scraper** (Apify Actor, 2026). Sandbox con Claude Code, Codex CLI y OpenCode preconfigurados; prompts de descubrimiento de empleo por perfil de candidato; control por MCP (`@modelcontextprotocol/sdk`), REST y shell web; persistencia en Notion. Fuente: `~/projects/ai-job-scrapper/apify-job-scraper/actor`.
  4. **Agent-driven engineering (Swarm Forge / SDD)** (2026). Pipeline de 6 agentes (specifier, coder, cleaner, architect, reviewer, qa) con quality gates: CRAP, mutation testing (Pitest), BDD. Caso principal: F1 widget Android (Kotlin). El mismo método (specs + ADRs + AGENTS.md/CLAUDE.md) se aplica en tournaments-ai, banking-risk-reports (IRRBB/Basilea, NIIF 9) y notas-agil. Fuente: `~/projects/f1-widget`, `~/projects/tournaments-ai`, `~/projects/banking-risk-reports`.
  5. **Cloud Runner 2049** (Google ADK multi-agente, MCP remoto, A2A, Gemini). Es una adaptación de un repo comunitario de otro autor (aaronthewarrior): se muestra como trabajo de comunidad o aprendizaje con crédito explícito, en una posición menor. Fuente: `~/projects/cloud_runner_2049`.
  - `ai-query-dashboard` (GitHub privado, Vue) no se pudo revisar; queda fuera hasta que se revise.

## Decisiones de cómo se construye (propuestas por Claude, aceptadas)

### Contenido y fuente de datos

- Firestore (proyecto `thony-test`, colección `portfolio`, documentos por locale: `introduction-en`, `experience-en`, `projects-en`, `tech-*`, `courses-*`, `schooling-*`, y equivalentes `-es`) sigue siendo la fuente de verdad.
- Se agregan documentos `ai-experience-en` y `ai-experience-es` con el mismo modelo `Section` (slots con title, subTitle, description HTML, tags, start/end, logo, order). Si hacen falta campos nuevos (por ejemplo `links`, `highlights`, `role`), se agregan como opcionales al modelo `Section`.
- Cambios de contenido en Firestore:
  - `introduction-*`: titular "Solutions Architect · AI Systems Engineer" (ES: "Arquitecto de Soluciones · Ingeniero de Sistemas con IA"), resumen de una o dos frases, etiquetas con la IA al frente (AI Agents, LLM Integration, MCP, Serverless, Solutions Architecture, AWS/GCP/Azure) en lugar de "Just a human" e "Ionic Expert".
  - `tech-ai` / `tech-ai-es` nuevo: LLMs (Claude, Gemini, OpenAI), agentes de código (Claude Code, Codex, OpenCode), MCP, Google ADK, A2A, prompt engineering, SDD con agentes.
  - Proyectos freelance 2012 a 2020 se compactan en un bloque "Earlier work" (lista corta, sin descripción expandida).
  - Cursos: se ocultan (`visible:false` o se quitan del slot) los irrelevantes para el perfil (WordPress Plugins, C++, Interface Design); se mantienen Azure AZ-900, DevOps, Engineering Management.
- Antes de escribir en Firestore se respalda la colección completa a un JSON local (fuera del repo o en `.gitignore`).

### Orden de la página (home, por idioma)

1. Hero: nombre, titular, resumen, señales (remoto, GMT-5 / America/Panama, inglés y español), CTAs: email, LinkedIn, GitHub, CV (si existe).
2. AI Experience.
3. Experience (trayectoria, más reciente primero).
4. Selected projects (no IA, los de mayor impacto: Banca Móvil, Yappy, Tigo, Cox serverless) + Earlier work compacto.
5. Skills / Stack (con bloque AI primero).
6. Education + certificaciones relevantes.
7. Contacto.

### Arquitectura técnica

- Actualizar Angular de 16 a la versión estable actual (consultar Context7 para la ruta de migración), pasando por las versiones intermedias con `ng update`.
- Quitar `@ionic/angular`, `@capacitor/*` e `ionicons` de las páginas públicas. Iconos como SVG inline. Layout con HTML semántico (`header`, `main`, `section`, `article`, `h1` a `h3`, `time datetime`) y CSS propio con tokens.
- **Prerender en build (SSG)** con el soporte de prerender de Angular. Un paso previo al build lee Firestore (API REST pública o Admin SDK) y escribe un snapshot JSON en el proyecto de build; los componentes leen ese snapshot, no Firestore en runtime. Resultado: HTML completo por ruta.
- Rutas: `/` (redirige o sirve EN como default con selector), `/en`, `/es`, `/fd-systems`. `hreflang` entre `/en` y `/es` y `x-default`.
- SEO/AEO por ruta: `<title>`, `meta description`, canonical absoluto, Open Graph y Twitter card con imagen OG real 1200x630 (no el favicon), `lang` correcto en `<html>`.
- JSON-LD: `ProfilePage` con `mainEntity` `Person` (name, alternateName ThonyFD, jobTitle, worksFor ASSA, alumniOf, knowsAbout con temas de IA, sameAs LinkedIn/GitHub, address/país Panamá, knowsLanguage). Los proyectos de IA como `CreativeWork` / `SoftwareSourceCode` donde haya repo público.
- Archivos: `robots.txt` (permite crawlers de buscadores y de IA: GPTBot, ClaudeBot, PerplexityBot, Google-Extended, etc.), `sitemap.xml` generado en build, `llms.txt` con resumen en Markdown del perfil y enlaces, y una versión `/resume.md` o `/en/llms-full.txt` con el CV completo en texto plano para agentes.
- Quitar `user-scalable=no` / `maximum-scale` del viewport.
- Accesibilidad: contraste AA, foco visible, navegación por teclado, `alt` en logos.
- Rendimiento: imágenes de Firebase Storage con dimensiones fijas y `loading="lazy"` excepto en el hero; objetivo Lighthouse 95+ en SEO, accesibilidad y buenas prácticas.

### Despliegue

- **Producción es Cloudflare Pages**: proyecto `fd-portfolio` (`fd-portfolio.pages.dev`), dominio canónico **`https://thonyfd.com`**. Firebase Hosting (`thony-test.web.app`) también tiene un despliegue por los workflows de GitHub; queda como secundario.
- Hoy `thonyfd.com/robots.txt` devuelve el `index.html` (fallback SPA) y `www.thonyfd.com` da error 522. El build nuevo publica archivos reales (`robots.txt`, `sitemap.xml`, `llms.txt`) y usa `_redirects` / `_headers` de Cloudflare Pages para los 301 (`/en` a `/`), los headers de caché y la cabecera `Link`/`X-Robots-Tag` donde aplique. `www` se arregla con un redirect a `thonyfd.com` (regla de Cloudflare o DNS), verificando primero cómo está configurado.
- Antes de cambiar nada se verifica cómo despliega Pages (integración Git con build en Cloudflare, o `wrangler pages deploy` desde CI) y se ajusta el comando de build y el directorio de salida.
- Reconstrucción por cambios de contenido en Firestore: deploy hook de Cloudflare Pages disparado a mano o por cron (GitHub Action con `schedule` + `workflow_dispatch`).
- El canonical, el sitemap, el JSON-LD, el OG y el `hreflang` de las páginas de `thony-test.web.app` y `fd-portfolio.pages.dev` apuntan a `thonyfd.com`, y esos hosts secundarios llevan `X-Robots-Tag: noindex` para no duplicar contenido.
- Se actualizan los workflows de `.github/workflows` (quitar Ionic CLI, usar `ng build`).

### Diseño visual

- Se hace con `impeccable` y/o `design-taste-frontend` en el flujo de esos skills (dirección, comp, construcción, revisión con capturas).
- Tono: sobrio, técnico, de arquitecto senior. Tipografía con carácter, mucho aire, jerarquía clara, modo claro y oscuro. Sin estética genérica de IA.

## Resueltas tras la revisión del builder (decisiones de Claude, marcadas para revisión)

- **Ionic/Capacitor se quitan por completo.** No hay carpetas `android/` ni `ios/`; `capacitor.config.json` es el del starter (`io.ionic.starter`). No se publica ninguna app nativa desde este repo.
- **`/fd-systems` se reconstruye sin Ionic** (hoy usa unos 20 elementos `ion-*`, sobre todo `ion-content`, `ion-button`, `ion-icon`) con el mismo aspecto, a mano con HTML y CSS. No se deja Ionic solo para esa ruta.
- **Firestore y el sitio viejo.** El sitio actual lee la colección `portfolio` en vivo. Los documentos nuevos (`ai-experience-*`, `tech-ai*`) se crean con `visible:false` antes del corte y no afectan al sitio viejo. Los cambios a documentos existentes (intro, cursos, compactar proyectos antiguos, `visible:true` en los nuevos) se aplican en el mismo momento del deploy del sitio nuevo, con un script idempotente y respaldo previo.
- **URLs existentes.** Solo existen `/` y `/fd-systems`; ambas se mantienen. `/` sirve la versión EN completa (no redirige) con canonical a sí misma; `/es` es la versión en español; `/en` redirige 301 a `/`. `hreflang` en: `/`, es: `/es`, x-default: `/`.
- **Enlaces a repos.** Solo `ThonyFD/personal-dashboard` es público; es el único con enlace "ver código" y JSON-LD `SoftwareSourceCode`. El resto se describe sin enlace a repo. El nombre del cliente DATACENTRIA se muestra (ya aparece hoy en el sitio).

## Lo que queda a criterio del builder

- Versión exacta de Angular y la ruta de `ng update`.
- Forma del snapshot de contenido y del script de build.
- Estructura de componentes y estilos.
- Redacción final de textos en EN y ES, respetando los hechos listados arriba y sin guiones largos (em dash).

## Respuestas del usuario a lo que quedaba abierto

- Email de contacto: **fdsystems.fd@gmail.com** (CTA principal `mailto:` en el hero y en contacto, y en JSON-LD `email`).
- CV: por ahora **solo versión en texto** (`/resume.md` y `llms-full.txt`), sin PDF. El botón "CV" del hero enlaza a la versión en texto o se omite.
- Diseño visual: el usuario **aprueba un mockup antes de construir la página completa**. Primer paso de implementación: dirección visual + comp del hero y de la sección AI Experience (desktop y móvil), presentado para aprobación. La migración técnica (Angular, quitar Ionic, SSG) puede avanzar en paralelo, pero no se construyen los estilos finales hasta aprobar el comp.
