// src/components/organisms/ClientsGrid/ClientsGrid.ts
import { injectCSS } from '../../../utils/dom';
import type { CardProfile } from '../../../types/card.types';

let cssInjected = false;
function injectStyles() {
  if (cssInjected) return;
  cssInjected = true;
  injectCSS(CLIENTS_CSS, '__css-clients-grid');
}

export function ClientsGrid(profile: CardProfile): HTMLElement {
  injectStyles();

  if (!profile.clients || profile.clients.length === 0) {
    return document.createElement('div');
  }

  const section = document.createElement('section');
  section.className = 'srv-clients';
  section.setAttribute('data-animate', 'true');

  section.innerHTML = `
        <h3 class="srv-clients__title">Empresas que confían en nosotros</h3>
        <div class="srv-clients__viewport">
            <div class="srv-clients__track"></div>
        </div>
    `;

  const track = section.querySelector<HTMLElement>('.srv-clients__track');
  const viewport = section.querySelector<HTMLElement>('.srv-clients__viewport');

  if (!track || !viewport) return section;

  // Triple set: [A][B][C] — B es el set "visible" de referencia al inicio
  const tripled = [
    ...profile.clients,
    ...profile.clients,
    ...profile.clients,
  ];

  tripled.forEach(client => {
    const item = document.createElement('div');
    item.className = 'srv-clients__item';
    if (client.logoUrl) {
      item.innerHTML = `<img src="${client.logoUrl}" alt="${client.name}" title="${client.name}" loading="lazy" decoding="async">`;
    } else {
      item.innerHTML = `<span class="srv-clients__fallback">${client.name}</span>`;
    }
    track.appendChild(item);
  });

  // Doble rAF garantiza que el layout ya tiene dimensiones reales
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      initCarouselEngine(viewport, track);
    });
  });

  return section;
}

// ─────────────────────────────────────────────────────────────
//  MOTOR DEL CAROUSEL
//  Principios clave:
//  1. El loop se hace "teletransportando" currentX sin transición,
//     por lo que nunca produce un frame visible de salto.
//  2. Durante el drag, el loop puede ocurrir igualmente — solo
//     ajustamos currentX; el usuario no nota nada.
//  3. dragVelocity se calcula con delta-time real para que la
//     inercia se sienta igual en cualquier framerate.
// ─────────────────────────────────────────────────────────────
function initCarouselEngine(viewport: HTMLElement, track: HTMLElement) {

  // ── Dimensiones ──────────────────────────────────────────
  // oneSetWidth = ancho de 1 de los 3 sets clonados.
  // Se recalcula en cada frame por si hay resize.
  function getOneSetWidth(): number {
    return track.scrollWidth / 3;
  }

  // Arrancamos en el set del MEDIO (índice 1) para que haya
  // contenido disponible tanto a izquierda como a derecha.
  let currentX = -getOneSetWidth();

  // ── Estado de física ─────────────────────────────────────
  const AUTO_SPEED = 0.4;   // px/frame a 60 fps  (~24 px/s)
  const FRICTION = 0.92;  // decaimiento de inercia por frame
  const MIN_VEL = 0.08;  // umbral para parar la inercia

  let velocity = 0;       // velocidad actual (px/frame normalizado a 16ms)
  let isDragging = false;
  let hasMomentum = false;

  // Para calcular velocidad con delta-time real
  let lastPointerX = 0;
  let lastPointerY = 0;
  let lastTime = 0;

  // Para detectar si el gesto es horizontal o vertical (touch)
  let gestureAxis: 'h' | 'v' | null = null;

  // ── RAF loop ─────────────────────────────────────────────
  let rafId: number;
  let lastFrameTime = performance.now();

  function update(now: number) {
    const dt = Math.min(now - lastFrameTime, 64); // cap a 64ms (evita saltos tras tab inactiva)
    lastFrameTime = now;

    const oneSetWidth = getOneSetWidth();

    if (!isDragging) {
      if (hasMomentum) {
        // Decaimiento de inercia escalado por dt
        const scale = dt / 16;
        velocity *= Math.pow(FRICTION, scale);
        currentX += velocity * scale;

        if (Math.abs(velocity) < MIN_VEL) {
          hasMomentum = false;
          velocity = 0;
        }
      } else {
        // Auto-play suave escalado por dt
        currentX -= AUTO_SPEED * (dt / 16);
      }
    }

    // ── Loop teletransporte ──────────────────────────────
    // Se hace SIEMPRE (incluso durante drag) sin transición.
    // Como es un único frame sin interpolación visible, el
    // usuario nunca lo percibe.
    if (oneSetWidth > 0) {
      if (currentX <= -(oneSetWidth * 2)) {
        currentX += oneSetWidth;
      } else if (currentX >= 0) {
        currentX -= oneSetWidth;
      }
    }

    track.style.transform = `translate3d(${currentX}px, 0, 0)`;
    rafId = requestAnimationFrame(update);
  }

  rafId = requestAnimationFrame(update);

  // ── Helpers de puntero ───────────────────────────────────
  function onDragStart(x: number, y: number) {
    isDragging = true;
    hasMomentum = false;
    velocity = 0;
    gestureAxis = null;
    lastPointerX = x;
    lastPointerY = y;
    lastTime = performance.now();
    viewport.classList.add('is-grabbing');
  }

  function onDragMove(x: number, y: number) {
    if (!isDragging) return;

    const now = performance.now();
    const dt = now - lastTime;
    const dx = x - lastPointerX;
    const dy = y - lastPointerY;

    // Determinar eje del gesto en los primeros mm de movimiento
    if (gestureAxis === null && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
      gestureAxis = Math.abs(dx) >= Math.abs(dy) ? 'h' : 'v';
    }

    // Si el eje es vertical, ignoramos el movimiento horizontal
    if (gestureAxis === 'v') return;

    // Velocidad con dt real, normalizada a 16ms
    if (dt > 0) {
      velocity = (dx / dt) * 16;
    }

    currentX += dx;
    lastPointerX = x;
    lastPointerY = y;
    lastTime = now;
  }

  function onDragEnd() {
    if (!isDragging) return;
    isDragging = false;
    hasMomentum = Math.abs(velocity) > 0.5;
    if (!hasMomentum) velocity = 0;
    viewport.classList.remove('is-grabbing');
    gestureAxis = null;
  }

  // ── Mouse ────────────────────────────────────────────────
  viewport.addEventListener('mousedown', (e: MouseEvent) => {
    e.preventDefault(); // evita selección de texto durante drag
    onDragStart(e.pageX, e.pageY);
  });

  window.addEventListener('mousemove', (e: MouseEvent) => {
    onDragMove(e.pageX, e.pageY);
  });

  window.addEventListener('mouseup', () => {
    onDragEnd();
  });

  // ── Touch ────────────────────────────────────────────────
  viewport.addEventListener('touchstart', (e: TouchEvent) => {
    const t = e.touches[0];
    onDragStart(t.pageX, t.clientY);
  }, { passive: true });

  // passive: false para poder llamar preventDefault() en gestos horizontales
  window.addEventListener('touchmove', (e: TouchEvent) => {
    if (!isDragging) return;
    const t = e.touches[0];

    // Necesitamos saber el eje ANTES de llamar onDragMove
    // para decidir si bloqueamos el scroll nativo.
    const dx = Math.abs(t.pageX - lastPointerX);
    const dy = Math.abs(t.clientY - lastPointerY);

    if (gestureAxis === null && (dx > 4 || dy > 4)) {
      gestureAxis = dx >= dy ? 'h' : 'v';
    }

    // Solo bloqueamos scroll si el gesto es horizontal confirmado
    if (gestureAxis === 'h' && e.cancelable) {
      e.preventDefault();
    }

    onDragMove(t.pageX, t.clientY);
  }, { passive: false });

  window.addEventListener('touchend', () => {
    onDragEnd();
  });

  window.addEventListener('touchcancel', () => {
    onDragEnd();
  });

  // ── Cleanup en caso de que el componente se desmonte ─────
  // (útil si el framework recicla el DOM)
  const observer = new MutationObserver(() => {
    if (!document.contains(viewport)) {
      cancelAnimationFrame(rafId);
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

// ─────────────────────────────────────────────────────────────
//  ESTILOS
// ─────────────────────────────────────────────────────────────
const CLIENTS_CSS = `
  .srv-clients {
    padding: 48px 0;
    background: var(--brand-paper, #fff);
    border-top: 1px solid rgba(0, 0, 0, 0.04);
    overflow: hidden;
  }

  .srv-clients__title {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    font-weight: 600;
    color: var(--ink-40, rgba(0,0,0,0.4));
    text-align: center;
    margin-bottom: 32px;
    padding: 0 24px;
  }

  .srv-clients__viewport {
    width: 100%;
    cursor: grab;
    user-select: none;
    -webkit-user-select: none;
    position: relative;
    /* Fade lateral */
    -webkit-mask-image: linear-gradient(
      to right,
      transparent 0%,
      black 10%,
      black 90%,
      transparent 100%
    );
    mask-image: linear-gradient(
      to right,
      transparent 0%,
      black 10%,
      black 90%,
      transparent 100%
    );
  }

  .srv-clients__viewport.is-grabbing {
    cursor: grabbing;
  }

  .srv-clients__track {
    display: flex;
    align-items: center;
    gap: 64px;
    width: max-content;
    /* Sin transition — el loop depende de saltos instantáneos */
    will-change: transform;
    padding: 12px 0;
  }

  .srv-clients__item {
    flex-shrink: 0;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .srv-clients__item img {
    height: 100%;
    width: auto;
    max-width: 120px;
    object-fit: contain;
    filter: grayscale(100%);
    opacity: 0.4;
    transition: opacity 0.35s ease, filter 0.35s ease;
    /* Evita conflicto con drag nativo del navegador */
    pointer-events: none;
    -webkit-user-drag: none;
    user-drag: none;
    draggable: false;
  }

  .srv-clients__viewport:not(.is-grabbing):hover .srv-clients__item img {
    opacity: 0.65;
  }

  .srv-clients__viewport.is-grabbing .srv-clients__item img {
    opacity: 0.5;
    transition: none;
  }

  .srv-clients__fallback {
    font-size: 13px;
    font-weight: 600;
    color: var(--ink-40, rgba(0,0,0,0.4));
    letter-spacing: -0.01em;
    white-space: nowrap;
  }
`;