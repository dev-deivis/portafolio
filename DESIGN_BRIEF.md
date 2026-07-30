# Brief de diseño — Portafolio devdeivis

## Referencia principal
**heynesh.com** (Nenad Popadic) — la dirección a seguir es la narrativa de scroll:
una historia personal contada año por año, con un grid de proyectos numerado
y mucho movimiento con propósito (GSAP), no decoración porque sí.

No copiar el layout literal — adaptar el *concepto* (scroll narrativo +
proyectos numerados + mucho GSAP) a la identidad de devdeivis.

## Lo que se descarta de intentos anteriores
- Nada de gradiente morado/azul genérico ("look de IA")
- Nada de casillero/locker (se probó, no convenció)
- Nada de dossier cyberpunk rosa/negro
- Nada de terminal retro ámbar/crema

## Paleta
```css
--bg:          #0a0a0c   /* negro casi puro, no #000 plano */
--bg-raised:   #131316   /* cards, superficies elevadas */
--text:        #F2F1ED   /* blanco roto, no #fff plano */
--text-muted:  #8b8b93
--accent:      #2D5CFF   /* azul eléctrico — NO cian, NO morado */
--accent-dim:  #17245c   /* mismo azul, para fondos sutiles/bordes */
--line:        #232327
```

## Tipografía
- Display / headlines: una sans bold con carácter — **Space Grotesk** o
  **General Sans** (evitar Inter/Poppins genéricos para titulares)
- Body: Inter o system-ui, tamaño cómodo, buen line-height
- Mono (para tags, números de proyecto, labels tipo "GSAP", "2026"):
  **JetBrains Mono** (ya la usa en el repo actual, mantenerla)

## Estructura de secciones

### 1. Hero
Título grande con su nombre y rol. Nada de gradiente en el texto.
Micro-detalle: un indicador tipo "disponible para proyectos" con punto
pulsante en `--accent`.

### 2. Mi Historia (timeline por año, estilo heynesh)
Scroll narrativo con hitos reales de David:
- Inicio en desarrollo freelance (~2 años haciendo webs para negocios de Oaxaca)
- Certificación Huawei HCIA-Cloud
- Entrada a la carrera / ITO
- MappAche — HackaTec 2026
- Servicio social como técnico en TecNM
- Ahora: buscando freelance/remoto, escalando Appoax

Cada hito aparece al hacer scroll (fade + slide), con el año marcado en mono.

### 3. Proyectos (grid numerado con tags)
Formato "01 / 02 / 03" como heynesh, cada proyecto con:
- Número de índice en mono
- Título
- Descripción corta (1-2 líneas)
- Tags de stack como pills (`Laravel`, `PostgreSQL`, `Supabase`...)
- Link a demo + repo

Proyectos reales a incluir:
1. Gestión de Hackathones (Laravel, PostgreSQL, Supabase, TailwindCSS) — LIVE
2. Voces Indígenas (HTML5, Leaflet.js) — LIVE
3. MediBot (Flutter, Dart, IA) — EN DESARROLLO

Animación: al entrar en viewport, cada card se desliza (usar GSAP
ScrollTrigger, ya está en el repo como `gsap-init.ts`).

### 4. Stack tecnológico
Mantener los iconos de skillicons.dev que ya tiene, pero integrarlos con
la nueva paleta (fondo oscuro, acento azul en hover).

### 5. Servicios freelance
Mantener las 3 cards actuales (Desarrollo Web, Soluciones Móviles,
Bases de Datos & Backend), rediseñadas con la nueva identidad.

### 6. Contacto
Formulario actual + redes (GitHub, LinkedIn, WhatsApp, email).

## Principios de animación (GSAP)
- Scroll-triggered reveals en cada sección (no solo projects)
- Timeline de "Mi Historia" con scrub sutil conforme se hace scroll
- Micro-interacciones en hover (proyectos, botones) — sutil, no exagerado
- Nada de animación decorativa sin propósito — cada movimiento debe
  reforzar la narrativa o la jerarquía visual

## Notas técnicas
- Mantener Astro 6 + estructura de componentes actual
  (`src/components/*.astro`)
- Mantener GSAP (ya integrado en `src/scripts/gsap-init.ts`)
- Mantener BASE_URL prefijo para assets en `/portafolio`
- Nombre del proyecto/branding: **devdeivis** (no "dev.almaraz")
- Responder siempre en español (regla ya en CLAUDE.md del repo)

## Prompt sugerido para Claude Code
"Rediseña mi portafolio Astro siguiendo el brief en DESIGN_BRIEF.md.
Mantén el contenido y los componentes existentes, pero aplica la nueva
paleta (negro + azul eléctrico), tipografía, y construye la sección
'Mi Historia' como timeline de scroll inspirado en heynesh.com. Los
proyectos deben tener el formato numerado con tags. No uses gradientes
morado/cian ni el concepto de casillero que se descartó."