# Portafolio — David Almaraz (dev-deivis)

## Proyecto
Portafolio personal en **Astro 6** con tema oscuro, animación de ondas en canvas y glassmorphism.  
URL de producción: `https://dev-deivis.github.io/portafolio`  
Repo: `https://github.com/dev-deivis/portafolio.git`  
Dev: `npm run dev` → localhost:4321

---

## Estructura

```
src/
  layouts/Layout.astro        ← HTML shell, SEO, fuentes Inter + JetBrains Mono
  styles/global.css           ← variables CSS, reset, utilidades (.glass-card, .btn-*, .reveal-section)
  scripts/gsap-init.ts        ← animaciones GSAP (cards) + IntersectionObserver
  pages/index.astro           ← compone todos los componentes, escucha CustomEvent('portfolio:open')
  components/
    BlobBackground.astro      ← canvas 2D con ondas animadas (ver sección técnica abajo)
    IntroScreen.astro         ← pantalla de carga glitch, auto-lanza a 6s, dispara portfolio:open
    Navbar.astro              ← nav fija con glassmorphism (único elemento con backdrop-filter)
    Hero.astro                ← título blanco puro + text-shadow, botones CTA
    About.astro               ← sección "Sobre Mí" con timeline derecha
    Skills.astro              ← sección "De la Idea al Producto" (proceso + stack)
    Projects.astro            ← sección "Portafolio de Proyectos" con carrusel
    Services.astro
    Contact.astro
public/assets/                ← imágenes y videos de proyectos
.github/workflows/deploy.yml  ← GitHub Actions → GitHub Pages automático
```

---

## Decisiones de diseño importantes

### Colores (variables CSS)
```css
--bg:         #0d0e15
--c-purple:   #6C63FF
--c-cyan:     #00E5FF
--c-green:    #00FFA3
--text:       #EAEAF0
--text-muted: #8892a4
```

### Título Hero
- Blanco puro (`#ffffff`) con `text-shadow` para contrastar sobre las ondas
- **No usar** `gradient-text` en el h1 del Hero — se fusionaba visualmente con el fondo

### glass-card
- **Sin** `backdrop-filter` — solo en Navbar (1 elemento fijo)
- Fondo semitransparente + borde, sin blur en tarjetas

---

## Animación de ondas (BlobBackground.astro)

### Técnica
- **Canvas 2D** con `requestAnimationFrame`
- **Sin `shadowBlur`** — causa lag severo (24 ops de blur/frame)
- **Sin `color-mix()`** — no todos los navegadores lo soportan; rompe el CSS silenciosamente
- Efecto volumétrico 3D: **6 capas de `lineWidth` decreciente** sobre el mismo `Path2D`

### Capas por stream (exterior → centro)
```
lineWidth × 3.2,  alpha 0.06  ← halo exterior
lineWidth × 2.0,  alpha 0.11  ← cuerpo exterior
lineWidth × 1.1,  alpha 0.22  ← cuerpo principal
lineWidth × 0.5,  alpha 0.40  ← zona interior
lineWidth × 0.18, alpha 0.62  ← highlight (color acento)
lineWidth × 0.04, alpha 0.85  ← glint central
```

### 4 streams configurados
```js
{ yBase:0.55, slope:-0.38, freq:0.0013, phase:0,    speed:0.00120, amp:0.10, body:'55,40,160',  hl:'150,140,255', hw:0.14 }
{ yBase:0.70, slope:-0.45, freq:0.0019, phase:2.09, speed:0.00085, amp:0.12, body:'10,80,130',  hl:'60,210,255',  hw:0.12 }
{ yBase:0.38, slope:-0.28, freq:0.0012, phase:4.19, speed:0.00150, amp:0.08, body:'10,100,75',  hl:'60,240,170',  hw:0.10 }
{ yBase:0.82, slope:-0.50, freq:0.0016, phase:1.05, speed:0.00100, amp:0.09, body:'40,20,130',  hl:'115,100,245', hw:0.09 }
```

**Parámetros:**
- `yBase` — posición vertical en x=0 (fracción de H)
- `slope` — barrido diagonal izq→der (negativo = sube)
- `freq` — frecuencia de onda (rad/px)
- `speed` — velocidad de animación (rad/ms); rango cómodo: 0.001–0.002
- `hw` — half-width del ribbon (fracción de H)

---

## Sección "De la Idea al Producto" (Skills.astro)

- **Parte 1:** Grid 4 columnas con tarjetas de proceso (Análisis → Diseño → Desarrollo → Deploy)
- **Parte 2:** Grid 4 columnas de stack tecnológico con iconos de `skillicons.dev`
- **Sin `color-mix()`** — usar clases modificadoras explícitas (`sc-purple`, `tc-tcyan`, etc.)
- Colores por clase, no por CSS custom properties en `style=`

---

## Sección "Portafolio de Proyectos" (Projects.astro)

### Proyectos activos
1. **Hackathon** — featured (span 2 cols), carrusel multimedia, métricas badge cian
2. **Voces Indígenas** — nota con borde izquierdo púrpura
3. **MediBot** *(WIP)* — borde punteado naranja, placeholder en lugar de carrusel, sin links

### Rutas de assets en producción
```js
// Siempre prefixar con BASE_URL para que funcione en /portafolio
src={import.meta.env.BASE_URL + s.src.slice(1)}
// s.src viene como '/assets/...' → slice(1) quita el /
```

### Grid
- 2 columnas (`repeat(2, 1fr)`)
- Hackathon: `grid-column: span 2`
- Voces + MediBot: columna cada uno (fila 2)

---

## Deploy (GitHub Actions)

Archivo: `.github/workflows/deploy.yml`  
Trigger: push a `master`  
Build: `npm ci && npm run build` → `dist/`  
Deploy: `actions/deploy-pages@v4`

### Config Astro
```js
// astro.config.mjs
export default defineConfig({
  site: 'https://dev-deivis.github.io',
  base: '/portafolio',
});
```

### Push inicial
```bash
git remote add origin https://github.com/dev-deivis/portafolio.git
git push -f origin master   # -f solo la primera vez para sobreescribir repo viejo
```
Token necesita scopes: **repo + workflow**

---

## Reglas de trabajo

- Responder siempre en **español**
- No usar `color-mix()` en este proyecto
- No usar `shadowBlur` en el canvas (causa lag)
- No usar `backdrop-filter` en tarjetas (solo Navbar)
- El título `h1` del Hero debe ser blanco, sin `gradient-text`
- Prefixar todos los assets de `public/` con `import.meta.env.BASE_URL`
