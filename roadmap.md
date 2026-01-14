# HobCanon – Roadmap de mejoras

Este documento recoge un análisis global del código actual y un listado priorizado de líneas de trabajo para mejorar funcionamiento, calidad y apariencia.

## 1. Fundamentos de proyecto y DX

1.1. Scripts de desarrollo y tooling
- Añadir un script de tests (aunque empiece vacío con `vitest` o similar) para dar un camino claro a futuras pruebas automatizadas.
- Añadir un script `npm run format` que use Prettier de forma explícita sobre `src/` y scripts.
- Revisar `.npmrc` (si crece) para evitar advertencias o bloqueos en CI (ahora mismo es mínimo, pero conviene documentarlo en el README/ROADMAP si se modifican registros privados, etc.).

1.2. Estructura de carpetas
- Valorar separar vistas/páginas de componentes puros en `src/lib/components/` (ya existe `BookCard`, pero podrían extraerse más componentes reutilizables de rutas con mucho markup repetido: filtros, tarjetas de métricas, tarjetas de autor, etc.).
- Documentar la estructura de datos en un pequeño `src/lib/data/README` o comentario de módulo para facilitar contribuciones futuras.

1.3. Tipado y consistencia
- Completar y consolidar tipos compartidos en `src/lib/data/types.ts` para que todo el front consuma esos tipos en lugar de duplicar suposiciones (por ejemplo, literales de `period`, `genre`, etc.).
- Crear tipos derivados para filtros (p.ej. `type DifficultyLevel = 1 | 2 | 3 | 4 | 5`) y usarlos en las páginas de filtros para evitar conversiones `string` → `number` dispersas.

## 2. Capa de datos y modelo

2.1. Calidad y coherencia del dataset
- Revisar y limpiar incoherencias en `authors.json`:
  - Fechas imposibles (p.ej. autores del siglo XVIII con `birth_year` 1945 y `death_year` 1729).
  - Duplicados con nombres ligeramente distintos (ej. nombres repetidos con alias, `ANONYME` vs `ANÓNIMO`, variantes de un mismo autor con mayúsculas/minúsculas diferentes, o con diacríticos/latinización distinta).
  - Registros con `country` que no cumplen el patrón ISO (o inconsistentes con la realidad) y normalizarlos.
  - Detectar entradas con alias que en realidad son nombre completo y deberían quizá invertirse (apellido, nombre) o unificarse.
- Revisar y limpiar incoherencias en `books.json`:
  - Duplicados claros de la misma obra (misma obra con títulos muy parecidos, mismo autor y año, etc.).
  - Asegurar que el campo `author` coincide exactamente con `authors.json` (guardando un mapa de normalización) para maximizar los `authorSlug` enlazados.
  - Revisar valores de `lang`, `country` y `period` para que sigan convenciones (ej. `lang` siempre ISO-639-1 minúsculas, `country` ISO-3166-1 alfa-2, `period` con una taxonomía corta y coherente).
  - Homogeneizar etiquetas (`tags`) siguiendo la convención indicada en el schema (minúsculas, singular, con guiones) y eliminar variaciones redundantes (`arthurian` vs `arthurian-myth`, etc.).

2.2. Normalización y utilidades
- Extraer a un módulo de utilidades compartido la lógica de normalización que ahora existe en varios sitios:
  - Normalización de nombres (`normalizeName`) que ya se usa en `dataset.ts` y en `fill-author-metadata.mjs` (actualmente hay dos implementaciones semejantes).
  - Lógica de slug (`slugify`) quizá debería aceptar opciones y/o validaciones (longitud máxima, conservar ciertos caracteres) según necesidades futuras.
- Añadir funciones de ayuda para comprobar consistencia del dataset (scripts CLI sencillos que detecten autores no referenciados, libros huérfanos sin autor, duplicados posibles por `title_es + author + year`).

2.3. Performance y escalabilidad del preprocesado
- `src/lib/data/dataset.ts` genera todo el dataset y los índices en carga de módulo:
  - Evaluar si el coste sigue siendo aceptable a medida que crezca el JSON (ahora es razonable, pero conviene tener métricas o, al menos, comentarios explicativos).
  - En caso de crecer mucho, estudiar mover parte del preprocesado a build time (script que genere un `dataset.json` enriquecido) y que el front sólo lea datos ya indexados.

2.4. Script de enriquecimiento de autores
- `scripts/fill-author-metadata.mjs` es útil pero bastante complejo:
  - Extraer la lógica de scoring y parsing (`tokenSetScore`, `levenshtein`, `charScore`, `parseYearFromText`) a un módulo reutilizable/testeable.
  - Añadir un fichero de configuración o lista de exclusión manual para autores que el script tiende a enlazar mal.
  - Añadir un modo dry-run y un log más estructurado (JSON o CSV) para revisar qué cambios propone antes de sobreescribir `authors.json`.
  - Documentar bien el uso del script (requisitos de red, límites de rate limit, cómo reanudar si falla a mitad).

## 3. Rutas y lógica de UI

3.1. Layout global (`src/routes/+layout.svelte` / `+layout.ts`)
- Implementar correctamente `isActive` usando `$page.url.pathname` normalizado frente a `base` para resaltar la pestaña activa de navegación.
- Revisar el uso de `$app/stores` (`page`) que ahora se importa pero no se usa; o bien usarlo para `isActive`, o eliminar la importación para evitar warnings.
- Consolidar estilos comunes de header/nav/footers en componentes (`<NavBar>`, `<FooterStats>`) para evitar duplicación si se amplía el sitio.

3.2. Página de inicio (`src/routes/+page.svelte`)
- Revisar criterios de selección de `highlightedBooks` (ahora mezcla importancia y dificultad ≥ 4, puede resultar arbitrario o poco representativo).
- Evitar hardcodear el texto de la badge "Stats" (o similares) cuando podría venir del diccionario i18n para ser consistente.
- Unificar los enlaces que a veces usan `base` y otras veces rutas absolutas (`/authors/...`); esto puede romper con `BASE_PATH`. Debería usarse siempre `base + '/ruta'` o el componente `svelte:component` con `<a href={base + '/...'}>`.

3.3. Índice de libros (`src/routes/books/+page.svelte`)
- Mejorar el rendimiento de los filtros:
  - Usar `derived` stores o `memoization` simple en lugar de recalcular `filtered` sobre `data.books` en cada cambio de cualquier `bind:value`, si se detecta lag con muchos registros.
  - Extraer la lógica de filtrado a una función pura en módulo separado para poder testearla aisladamente.
- Revisar UX de filtros:
  - Añadir una indicación clara de que algunos filtros son "mínimo X" (dificultad, importancia) y quizá sustituir `select` por slider o radio-buttons.
  - Reordenar filtros para agrupar por tipo (texto, rango, select categórico) y ganar legibilidad.
  - Añadir placeholders i18n para todos los inputs (ahora algunos textos de placeholder están en inglés duro).
- Asegurar que `formatLanguageName` / `formatCountryName` no rompen en navegadores antiguos o configuraciones sin `Intl.DisplayNames` (hay try/catch, pero conviene documentar el fallback y quizá mostrar el código en mayúsculas de forma más amable).

3.4. Detalle de libro (`src/routes/books/[slug]/+page.svelte` / `+page.ts`)
- Centralizar el layout de campos (año, idioma, país, dificultad, importancia, género, periodo, páginas) en un componente reutilizable si se van a mostrar bloques similares en otras vistas.
- Evitar mostrar letras sueltas como `N/A` sin i18n: usar claves de diccionario (`t('not_available')`) o un guion estandarizado.
- Añadir breadcrumbs más claros (no sólo "← Books" sino quizá la jerarquía `Home / Books / Título`).

3.5. Índice y detalle de autores (`src/routes/authors/...`)
- Afinar la lógica de cálculo de rango de años (usar util compartido; ahora se repite patrón `Math.min/Math.max` en varias vistas).
- Validar campos numéricos en inputs de rango (`eraFrom`, `eraTo`) para evitar que el usuario introduzca valores fuera de rango que rompan el layout o generen resultados inesperados.
- Mejorar la presentación de autores sin país/años (mostrar un mensaje más amable, no sólo `—` o `N/A`).
- Reutilizar `BookCard` también en la lista principal de autores si se muestran obras asociadas, o por lo menos compartir estilos.

3.6. Página de estadísticas (`src/routes/stats/+page.svelte`)
- Separar la lógica de cálculo de agregados (`countBy`, `countByNumeric`, `buildLineChart`, etc.) en un módulo TypeScript independiente bajo `src/lib/stats/` para poder:
  - Reutilizar en otras vistas (por ejemplo mini-resúmenes en Home).
  - Añadir tests unitarios que verifiquen que buckets, ticks y ordenación son correctos.
- Valorar el uso real de `chart.js` (está en `dependencies` pero la implementación actual usa únicamente SVG manual). Si no se usa, eliminar dependencia; si se quiere usar, migrar los gráficos para aprovechar tooltips, responsividad, etc.
- Añadir accesibilidad a los gráficos:
  - `aria-label` y descripciones para `<svg>`.
  - Alternativa textual (tabla de datos) para usuarios con lectores de pantalla.

## 4. i18n, accesibilidad y UX

4.1. Internacionalización
- Asegurar que **todos** los literales visibles pasan por el diccionario i18n (`t`): ahora quedan sueltos algunos textos en inglés como "Stats", placeholders en campos de búsqueda/filtro, textos de eje en gráficos (`Conteo`, `Periodo` en `stats`).
- Añadir soporte opcional para más idiomas (o, al menos, preparar el diseño del diccionario para que añadir `fr`, `de`, etc. sea sencillo), reutilizando el mapa `languageToFlag` ya presente.
- Guardar preferencia de idioma en `localStorage` o similar para que el usuario vuelva al idioma anterior tras recargar.

4.2. Accesibilidad
- Revisar contraste de colores (`text-ink/60`, overlays claros sobre fondos claros) con herramientas de contraste; ajustar Tailwind config o clases para cumplir WCAG AA al menos.
- Asegurar que botones y enlaces tienen `:focus` visible y suficiente tamaño de área clicable.
- Revisar semántica de headings (no saltar de `<h1>` a `<h3>` sin jerarquía clara) y usar landmarks (`<main>`, `<nav>`, `<header>`, `<footer>`) de forma consistente.

4.3. Diseño visual y responsividad
- Refinar los breakpoints:
  - Algunas grids (`md:grid-cols-3`, `md:grid-cols-2`) pueden verse muy apretadas en tabletas medianas; ajustar a `lg:` en lugar de `md:` donde convenga.
  - Revisar espaciados verticales en móvil (algunas tarjetas tienen padding generoso + sombras que hacen scroll largo y cansado).
- Unificar estilo de badges y tarjetas:
  - Documentar en un pequeño sistema de diseño interno qué significan los colores (`badge-amber` para métrica, `badge-plum` para dificultad, etc.).
  - Reemplazar textos genéricos por iconografía discreta consistentemente (`★` para importancia, `✦` para dificultad, etc.).

## 5. Configuración de build y despliegue

5.1. Base path y GitHub Pages
- Añadir validaciones/documentación más clara sobre `BASE_PATH`:
  - En `README` y `WARP.md` ya se explica, pero conviene añadir un pequeño check en tiempo de build que avise si `BASE_PATH` no empieza por `/`.
- Revisar que **todas** las rutas construidas a mano usan `base` (no rutas absolutas) para evitar 404 cuando se despliega bajo `/HobCanon`.

5.2. SvelteKit / Vite / Tailwind
- Añadir `sourcemap` explícito en `vite.config.ts` para build de producción si se va a depurar en producción.
- Revisar `tailwind.config.cjs` para añadir `safelist` en caso de que se generen clases dinámicas (de momento parece fijo, pero hay que confirmarlo si se añaden filtros parametrizados que generen clases a partir de datos).

## 6. Calidad del código y pruebas

6.1. Lint y typecheck
- Ejecutar y dejar documentado un flujo estándar de `npm run check` + `npm run lint` antes de cada commit; integrar en CI si se configura.
- Ajustar reglas de ESLint si hay falsos positivos específicos de SvelteKit (por ejemplo, imports usados sólo en markup o `$` reactivity).

6.2. Tests
- Introducir capa mínima de tests de lógica pura:
  - Tests de `slugify` para distintos alfabetos, diacríticos y colisiones.
  - Tests de funciones de agregación en `stats` (conteo por género, país, dificultad, importancia, etc.).
  - Tests de filtrado de libros y autores (dada una lista y filtros, el resultado esperado).
- Valentarse a añadir tests de componentes Svelte (con `@testing-library/svelte` o `vitest + jsdom`) para las piezas clave: `BookCard`, filtros de libros, navegación básica.

## 7. Prioridades sugeridas

1. **Arreglar bugs funcionales y de navegación base**
   - Arreglar `isActive` en el layout.
   - Unificar todos los enlaces para que respeten `base`.
2. **Mejorar dataset y enlaces autor/libro**
   - Limpiar incoherencias básicas en `authors.json` y `books.json`.
   - Ejecutar y mejorar el script `fill-author-metadata.mjs` con un flujo revisable.
3. **Refinar filtros y UX de listas**
   - Extraer lógica de filtrado a módulos puros y mejorar mensaje/orden de filtros.
4. **Pulir i18n y accesibilidad**
   - Llevar todos los literales a diccionarios.
   - Revisar contraste y focus states.
5. **Añadir pruebas automáticas y extraer lógica reutilizable**
   - Tests de dataset, slugs, stats y filtros.
   - Módulos compartidos para normalización, agregaciones y mapeos.

Este roadmap se puede ir marcando como completado por bloques; conviene empezar por lo que afecta a funcionamiento visible (bugs, navegación, datos mal enlazados) y después pasar a diseño visual, DX y testeo.
