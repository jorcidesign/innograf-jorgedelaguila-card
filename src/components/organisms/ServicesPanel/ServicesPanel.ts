// src/components/organisms/ServicesPanel/ServicesPanel.ts
import { injectCSS } from '../../../utils/dom';
import type { CardProfile } from '../../../types/card.types';

let cssInjected = false;

function injectStyles() {
  if (cssInjected) return;
  cssInjected = true;
  injectCSS(SERVICES_CSS, '__css-services-panel');
}

export function ServicesPanel(profile: CardProfile): HTMLElement {
  injectStyles();

  const section = document.createElement('section');
  section.className = 'srv-section';
  section.id = 'services-section';
  // CRÍTICO: No usamos 'data-animate' aquí para evitar que el 'transform' rompa el position: sticky.

  // ── Header de la sección ──
  const header = document.createElement('div');
  header.className = 'srv-section__header';
  header.innerHTML = `
      <h3 class="srv-section__title">Nuestras Soluciones</h3>
      <span class="srv-section__count">${profile.services.length} servicios</span>
    `;

  // ── Contenedor del Stack ──
  const list = document.createElement('div');
  list.className = 'srv-stack-container';

  // Guardaremos referencias para el motor JS de scroll
  const cardEls: HTMLElement[] = [];

  profile.services.forEach((service, index) => {
    const card = document.createElement('article');
    card.className = 'srv-card';
    card.style.setProperty('--card-index', index.toString());

    card.innerHTML = `
          <div class="srv-card__inner">
            <div class="srv-card__badge">${String(index + 1).padStart(2, '0')}</div>
            
            ${service.imageUrl ? `
            <div class="srv-card__media">
              <img src="${service.imageUrl}" alt="${service.title}" loading="lazy" decoding="async" />
            </div>` : ''}
            
            <div class="srv-card__body">
              <div class="srv-card__header">
                <div class="srv-card__icon" aria-hidden="true">${service.icon}</div>
                <div class="srv-card__title-group">
                  <span class="srv-card__label">${service.category}</span>
                  <h4 class="srv-card__title">${service.title}</h4>
                </div>
              </div>
              
              <div class="srv-card__separator" aria-hidden="true"></div>
              
              <p class="srv-card__desc">${service.description}</p>
              
              <a href="https://wa.me/${profile.contact.whatsapp}?text=Hola, me interesa el servicio de ${encodeURIComponent(service.title)}" 
                 target="_blank" rel="noopener" class="srv-card__cta">
                Cotizar servicio
                <svg class="srv-card__cta-arrow" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 7h12M8 2l5 5-5 5"/>
                </svg>
              </a>
            </div>
          </div>
        `;

    list.appendChild(card);
    cardEls.push(card);
  });

  section.append(header, list);

  // ── Scroll Engine (Awwwards Effect) ──
  // Pequeño delay para asegurar que el DOM se dibujó y las posiciones son medibles
  setTimeout(() => initStackEngine(cardEls), 150);

  return section;
}

// ── Lógica de Animación de Stack ──
function initStackEngine(cardEls: HTMLElement[]) {
  const STACK_TOP_OFFSET = 80;
  const STACK_CARD_GAP = 18;
  const SCALE_STEP = 0.032;
  const OPACITY_STEP = 0.07;
  const BRIGHTNESS_STEP = 0.06;

  function getCardStickyTop(index: number) {
    return STACK_TOP_OFFSET + index * STACK_CARD_GAP;
  }

  function updateStack() {
    const vp = window.innerHeight;

    cardEls.forEach((cardEl, i) => {
      const img = cardEl.querySelector('.srv-card__media img') as HTMLElement | null;

      // 1. Parallax sutil de la imagen
      if (img) {
        const rect = cardEl.getBoundingClientRect();
        const progress = 1 - (rect.top + rect.height) / (vp + rect.height);
        const parallaxY = progress * -24; // Desplazamiento máximo -24px
        img.style.transform = `translateY(${parallaxY.toFixed(2)}px)`;
      }

      // 2. Cálculo de profundidad
      let buriedDepth = 0;
      for (let j = i + 1; j < cardEls.length; j++) {
        const jStickyTop = getCardStickyTop(j);
        const jCardRect = cardEls[j].getBoundingClientRect();
        // Medimos sobre la cáscara externa que no se deforma
        if (jCardRect.top <= jStickyTop + 2) {
          buriedDepth++;
        }
      }

      // 3. Variables de CSS para la capa interna
      const scale = Math.max(0.82, 1 - buriedDepth * SCALE_STEP);
      const opacity = Math.max(0.55, 1 - buriedDepth * OPACITY_STEP);
      const brightness = Math.max(0.72, 1 - buriedDepth * BRIGHTNESS_STEP);

      // Inyectamos las variables. El CSS se encarga de la transición fluida
      cardEl.style.setProperty('--_scale', scale.toFixed(4));
      cardEl.style.setProperty('--_opacity', opacity.toFixed(4));
      cardEl.style.setProperty('--_brightness', brightness.toFixed(4));
    });
  }

  let rafId: number | null = null;
  function onScroll() {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      updateStack();
      rafId = null;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', updateStack, { passive: true });

  updateStack();
}

// ── Estilos CSS Adaptados al Tema White-Label ──
const SERVICES_CSS = `
  /* Parche crítico para Desktop: Reemplaza overflow: hidden por clip para no matar el sticky */
  @media (min-width: 520px) {
    #app {
      overflow: clip !important;
    }
  }

  .srv-section {
    padding: 32px 16px 120px;
    --stack-top-offset: 80px;
    --stack-card-gap: 18px;
  }

  .srv-section__header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 32px;
    padding: 0 8px;
  }

  .srv-section__title {
    font-size: clamp(22px, 5vw, 28px);
    font-weight: 600;
    letter-spacing: -0.02em;
    color: var(--ink);
    line-height: 1;
    margin: 0;
  }

  .srv-section__count {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--ink-40);
  }

  .srv-stack-container {
    display: flex;
    flex-direction: column;
    gap: 24px;
    position: relative;
  }

  /* LA CÁSCARA: Solo sirve para frenar en el scroll, no tiene fondos ni transformaciones */
  .srv-card {
    position: sticky;
    top: calc(var(--stack-top-offset) + (var(--card-index, 0) * var(--stack-card-gap)));
    z-index: calc(10 + var(--card-index, 0));
    display: block;
    will-change: transform;
  }

  /* LA TARJETA REAL: Contiene el diseño y reacciona a las variables de JS */
  .srv-card__inner {
    background: var(--brand-paper, #fff);
    border-radius: 24px;
    overflow: hidden;
    border: 1px solid rgba(0,0,0,0.05);

    box-shadow:
      0 0 0 1px rgba(0,0,0,0.03),
      0 8px 32px rgba(0,0,0,0.06),
      0 2px 8px rgba(0,0,0,0.04);

    display: flex;
    flex-direction: column;

    /* Absorbe las variables calculadas por el Engine JS */
    transform: scale(var(--_scale, 1)) translateZ(0);
    transform-origin: center top;
    opacity: var(--_opacity, 1);
    filter: brightness(var(--_brightness, 1));

    transition:
      transform 0.5s cubic-bezier(0.16, 1, 0.3, 1),
      opacity   0.5s cubic-bezier(0.16, 1, 0.3, 1),
      filter    0.5s cubic-bezier(0.16, 1, 0.3, 1);
    will-change: transform, opacity, filter;
  }

  /* ── BADGE DE NÚMERO ── */
  .srv-card__badge {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(var(--brand-accent-rgb, 200,169,110), 0.12);
    border: 1px solid rgba(var(--brand-accent-rgb, 200,169,110), 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.04em;
    color: var(--brand-accent, #C8A96E);
    z-index: 10;
  }

  /* ── MEDIA ── */
  .srv-card__media {
    position: relative;
    width: 100%;
    padding-top: 52%;
    background: var(--surface-2);
    overflow: hidden;
  }

  .srv-card__media img {
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 108%; 
    object-fit: cover;
    will-change: transform;
  }

  .srv-card__media::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.18) 100%);
  }

  /* ── CUERPO ── */
  .srv-card__body {
    padding: 24px 24px 28px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    position: relative;
  }

  .srv-card__header {
    display: flex;
    align-items: flex-start;
    gap: 16px;
  }

  .srv-card__icon {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    background: rgba(var(--brand-accent-rgb, 200,169,110), 0.1);
    border: 1px solid rgba(var(--brand-accent-rgb, 200,169,110), 0.2);
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: var(--brand-accent);
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .srv-card__inner:hover .srv-card__icon {
    transform: scale(1.08) rotate(-4deg);
  }

  .srv-card__title-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding-top: 4px;
  }

  .srv-card__label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--brand-accent, #C8A96E);
  }

  .srv-card__title {
    font-size: clamp(18px, 4vw, 20px);
    font-weight: 600;
    color: var(--ink);
    margin: 0;
    line-height: 1.15;
    letter-spacing: -0.02em;
  }

  .srv-card__desc {
    font-size: 14px;
    line-height: 1.6;
    color: var(--ink-60);
    margin: 0;
    font-weight: 400;
  }

  /* ── LINK/CTA ── */
  .srv-card__cta {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.04em;
    color: var(--brand-accent, #C8A96E);
    text-decoration: none;
    margin-top: 4px;
    width: fit-content;
    border-bottom: 1px solid rgba(var(--brand-accent-rgb, 200,169,110), 0.3);
    padding-bottom: 2px;
    transition: gap 0.25s ease, border-color 0.25s ease;
  }

  .srv-card__inner:hover .srv-card__cta {
    gap: 14px;
    border-color: var(--brand-accent);
  }

  .srv-card__cta-arrow {
    width: 14px;
    height: 14px;
    display: block;
    flex-shrink: 0;
  }

  .srv-card__separator {
    width: 40px;
    height: 1px;
    background: linear-gradient(to right, rgba(var(--brand-accent-rgb, 200,169,110), 0.4), transparent);
    margin: 4px 0;
  }
`;