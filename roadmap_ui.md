# HobCanon – Roadmap de UI/UX

Este documento detalla propuestas de mejora para la interfaz de usuario basadas en los datos disponibles (`authors.json`, `books.json`) y patrones habituales de exploración facetada de catálogos.

## 1. Principios generales

- El usuario viene a **explorar un canon**, no sólo a ver una lista: necesita rutas de entrada (por época, país, género, dificultad, importancia, tags).
- Todas las vistas de exploración deben adoptar patrones de **facetas**:
  - Filtros en columna lateral (en desktop) o panel deslizable (en móvil).
  - Posibilidad de **multiselección** por país, género, tags, etc.
  - Resumen de filtros activos como chips arriba de la lista, con botón "Limpiar todo".
  - Ordenación explícita (por importancia, año, dificultad, título).
- Todos los textos visibles deben pasar por el sistema i18n (`t(...)`), incluidos placeholders, badges y etiquetas en gráficos.

## 2. Home – de landing decorativa a panel de entrada

### Problemas
- Hero visualmente agradable pero con poca guía práctica.
- Selección de destacados algo arbitraria; no hay "caminos" claros según el interés del lector.

### Propuestas
- **Hero con rutas de entrada**:
  - Tres CTAs claros que lleven a listas prefiltradas de `books`:
    - "Clásicos esenciales para empezar" → `importance >= 4` y dificultad 2–3.
    - "Explorar por época" → vista centrada en timeline (stats) o `/books` con filtros de periodo.
    - "Explorar por países y lenguas" → `/books` con facetas de `country` + `lang`.
- **Bloque "Rutas de lectura"** (cards derivadas de datos):
  - Ejemplos: "Tragedia griega esencial", "Épica latina fundacional", "Canon hispánico medieval".
  - Cada card muestra nº de libros, rango de años, dificultad media y tiempo estimado (a partir de `pages`).
- **Vista previa de facetas clave**:
  - Chips clicables con top géneros, top tags y top países (basados en `stats` actuales), enlazando a `/books` con filtros ya aplicados.

## 3. Libros (lista) – explorador principal

### Problemas
- Filtros en un bloque único, poco estructurados.
- Falta ordenación clara y multiselección cómoda.
- Layout de cards desaprovecha parte de la riqueza del dataset.

### Layout propuesto
- **Columna izquierda (filtros)**, derecha con lista de `BookCard`.
- Barra superior en la lista con:
  - Contador de resultados.
  - Selector de ordenación: "Relevancia canónica" (importance desc, luego dificultad asc), "Año", "Dificultad", "Título".

### Facetas concretas

1. **Búsqueda**
   - Input con placeholder i18n ("Título, autor, género, etiqueta…").
   - Opción futura: auto-suggest de autores/tags.

2. **Tiempo y longitud**
   - Rango de **año** como slider doble (ya existe, pero mejor etiquetado).
   - Rango de **páginas** nuevo (ej. 0–100, 100–300, 300+ o slider continuo).

3. **Contexto literario**
   - País (`country`) como listado de checkboxes con bandera y nombre traducido.
   - Lengua (`lang`) como checkboxes o pill buttons.
   - Periodo (faceta basada en `period`, multi-select).
   - Formato (`format`): prosa, poesía, teatro (checkboxes).

4. **Perfil de lectura**
   - Dificultad: slider 1–5 con significado textual ("Fácil", "Media", "Avanzada"), aplicado como "al menos".
   - Importancia: slider 1–5 ("Relevancia en el canon").
   - Atajo "Ideal para empezar" que combine dificultad 2–3, importancia ≥4 y excluya obras muy largas.

5. **Temática**
   - Género (de `genre`) como lista de checkboxes con contador.
   - Tags (de `tags`) mostrando sólo los más frecuentes; botón "Ver más" para desplegar el resto.

### Mejora de `BookCard`
- Mantener estructura actual, pero:
  - Añadir una línea de **resumen compacto**: "Épica · Grecia clásica · Dif. 4 · Imp. 5 · 500 págs".
  - Mostrar sólo 2–3 tags más representativas como chips (clicables para filtrar por esa tag).
  - Colorear el chip de periodo según macro-periodo (Antigüedad, Medieval, Moderna, Contemporánea).
  - Añadir CTA secundaria "Ver similares" que lleve a `/books` con filtros precargados (mismo género, periodo y rango de dificultad).

## 4. Autores (lista)

### Problemas
- Filtros básicos y poco aprovechamiento de `bookCount`, países y épocas.

### Facetas
- Búsqueda por nombre/alias (mantener).
- País (multi-select con banderas).
- Rango de años: separar visualmente nacimiento y muerte, o usar un solo rango pero etiquetado mejor.
- Nº de libros en el canon (`bookCount`) como slider o buckets (1; 2–4; 5+).

### Cards de autor
- Estructura sugerida:
  - Imagen (si `url_photo`), si no, avatar inicial.
  - Nombre + alias en una línea secundaria.
  - Línea de contexto: "1898–1936 · España 🇪🇸".
  - Chips con nº de libros, 1–2 géneros predominantes y 1–2 tags frecuentes extraídas de sus libros.
  - Botones: "Ver autor" y "Ver sus libros" (link a `/books` filtrado por ese autor).

### Ordenación
- Por nombre.
- Por año de nacimiento.
- Por nº de libros.

## 5. Detalle de libro

### Objetivo
Dar contexto y sugerir **qué leer después**, no sólo mostrar una ficha técnica.

### Estructura

1. **Columna principal**
   - Título (localizado con `titleFor`).
   - Subtítulo: "Tragedia · Grecia clásica · 429 a.C. · GR".
   - Bloque "Perfil de lectura":
     - Visualización gráfica de dificultad e importancia (barras o 5 puntos marcados).
     - Páginas + tiempo estimado (p.ej. 250 págs ≈ 8–10 h).
   - Tags como chips clicables (filtran `/books` por ese tag).

2. **Columna lateral / sección inferior**
   - Panel "Del mismo autor": lista corta de otros libros del mismo autor, ordenados por importancia.
   - Panel "Similares": libros con género/periodo/dificultad parecidos.
   - Mini-card de autor con foto, país, años y link a su detalle.

3. **Interacción**
   - Botón "Explorar obras similares" que envía a `/books` con filtros basados en el libro actual.

## 6. Detalle de autor

### Estructura

1. **Hero**
   - Foto grande (si existe `url_photo`).
   - Nombre principal + alias.
   - Vida (años) + país con bandera y nombre traducido.
   - Chips con nº de libros, géneros y periodos característicos.

2. **Obras en el canon**
   - Lista de `BookCard` del autor, agrupadas por género o periodo (acordeones) y ordenadas por importancia.
   - Filtro ligero en la propia página (p.ej. por género o dificultad máxima).

3. **Enlaces externos**
   - Link claro a Wikipedia (`url_wikipedia`).

## 7. Stats / Exploración de datos

### Problemas
- Página muy potente pero densa; cuesta extraer insights rápidos.

### Propuestas
- Priorizar 3–4 gráficos clave:
  - Distribución por género.
  - Distribución por épocas (siglo/decenios).
  - Idiomas y países.
  - Dificultad e importancia.
- Controles globales arriba que afecten todos los gráficos:
  - Dificultad mínima, importancia mínima, rango de años, país.
- Añadir textos interpretativos generados a partir de datos (p.ej. "La mayoría de las obras se concentran entre 1800 y 1950").
- Hacer que clic en una barra/segmento lleve a `/books` con el filtro correspondiente aplicado.

## 8. Vistas futuras posibles

- **Explorador temporal dedicado**: timeline grande interactivo con filtros y lista debajo.
- **Mapa de países**: grid o mapa simple que muestra nº de obras por país, clicable.
- **Rutas de lectura guiadas**: progresiones por dificultad dentro de un género o periodo.

## 9. Prioridades de implementación UI

1. Rediseñar `src/routes/books/+page.svelte` con el nuevo layout de filtros laterales, ordenación y cards enriquecidas.
2. Ajustar `src/routes/+layout.svelte` y home para ofrecer rutas de entrada claras y navegación consistente con `base`.
3. Rediseñar `src/routes/authors/+page.svelte` y detalle de autor para aprovechar mejor `bookCount`, países y épocas.
4. Simplificar y hacer más legible la página de estadísticas, con filtros globales y enlaces a listas prefiltradas.
5. Completar la internacionalización de todos los textos visibles y revisar accesibilidad (contraste, focus, jerarquía de headings).
