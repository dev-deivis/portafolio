# Animación de ondas — Notas técnicas

## El efecto buscado

Ribbons de onda fluidos tipo "seda" que barren la pantalla en diagonal,
con efecto de volumen 3D (bordes oscuros → centro brillante).

---

## Técnica final: Path2D + capas de lineWidth

### Por qué no se usaron otras opciones

| Técnica descartada | Problema |
|---|---|
| `div` con `filter: blur()` en el DOM | Repaint en cada frame, colapsa el FPS |
| `shadowBlur` en Canvas | Fuerza copia de buffer + blur gaussiano por cada `stroke()` — con 24 llamadas por frame era inviable |
| Canvas estático (solo resize) | No tiene animación, solo fondo fijo |
| Ribbons rellenos (`fill()`) con formas cerradas | Difícil lograr el degradado perpendicular a la curva |

---

## Cómo funciona la solución

### 1. `Path2D` reutilizable

Se calcula la curva de cada onda **una sola vez por frame** usando `Path2D`:

```js
function makePath(stream, t) {
  const path = new Path2D();
  for (cada punto x de 0 a W, paso 14px) {
    y = yBase + (x/W)*slope + sin(x*freq + t*speed + phase) * amp;
    path.quadraticCurveTo(puntoAnterior, puntoMedio); // suaviza la curva
  }
  return path;
}
```

El `path` resultante se pasa 6 veces a `ctx.stroke(path)` sin recalcular nada.

### 2. Efecto 3D con capas de `lineWidth` decreciente

Cada ribbon se dibuja en **6 pasadas** usando el mismo path, variando solo
`lineWidth` y `strokeStyle`. Va de muy ancho+transparente a muy delgado+opaco:

```
Capa 1: lineWidth = hw × 3.2,  alpha = 0.06  ← halo exterior difuso
Capa 2: lineWidth = hw × 2.0,  alpha = 0.11  ← cuerpo exterior
Capa 3: lineWidth = hw × 1.1,  alpha = 0.22  ← cuerpo principal visible
Capa 4: lineWidth = hw × 0.5,  alpha = 0.40  ← zona interior
Capa 5: lineWidth = hw × 0.18, alpha = 0.62  ← zona del highlight (color acento)
Capa 6: lineWidth = hw × 0.04, alpha = 0.85  ← glint central (línea de seda)
```

El resultado es una sección transversal tipo campana gaussiana:
oscuro en los bordes → brillante en el centro → línea de brillo encima.

### 3. Barrido diagonal

Cada stream tiene un parámetro `slope` que desplaza verticalmente la onda
de izquierda a derecha, creando el efecto de barrido diagonal:

```js
y = yBase * H + (x / W) * slope * H + sin(x * freq + t * speed + phase) * amp * H;
//              ↑ esto es el barrido diagonal
```

### 4. Sin `shadowBlur`, sin `filter`

La clave del rendimiento es **no usar ninguna operación de blur**.
El efecto de suavidad viene solo del apilamiento de trazos semitransparentes.
Canvas 2D puede hacer cientos de `stroke()` simples por frame sin problema.

---

## Parámetros de cada stream

```js
{ yBase, slope, freq, phase, speed, amp, body, hl, hw }
```

| Param | Descripción |
|---|---|
| `yBase` | Posición vertical en x=0 (fracción de H) |
| `slope` | Deriva vertical de izq→der (negativo = sube) |
| `freq` | Frecuencia de la onda (rad/px) |
| `phase` | Fase inicial para desfasar streams entre sí |
| `speed` | Velocidad de animación (rad/ms) |
| `amp` | Amplitud de la onda (fracción de H) |
| `body` | Color RGB oscuro del cuerpo del ribbon |
| `hl` | Color RGB del highlight central (acento) |
| `hw` | Half-width del ribbon (fracción de H) |

---

## Arquitectura del componente

**Archivo:** `src/components/BlobBackground.astro`

```
<canvas id="blob-canvas">   ← fixed, inset 0, z-index -1

Script:
  resize()                  ← actualiza W/H, se llama en window resize
  makePath(stream, t)       ← devuelve Path2D de la onda en tiempo t
  drawStream(stream, t)     ← 6 × ctx.stroke(path) con distintos lineWidth
  frame()                   ← requestAnimationFrame loop
```

El canvas es `position: fixed` con `z-index: -1`, por lo que queda detrás
de todo el contenido sin interferir con el scroll ni los eventos de mouse.

---

## Resultado de rendimiento

- Sin `shadowBlur` → 0 operaciones de blur por frame
- `Path2D` reutilizado → cálculo de curva 1× por stream por frame
- `STEP = 14px` → ~140 puntos por curva en pantalla 1920px
- 4 streams × 6 capas = 24 llamadas `stroke()` por frame
- Resultado: animación a 60 FPS estable sin impacto en el resto de la UI
