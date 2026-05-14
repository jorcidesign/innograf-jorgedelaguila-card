// src/components/organisms/HeroCover/HeroCover.ts
import { injectCSS } from '../../../utils/dom';
import type { CardProfile } from '../../../types/card.types';
import { ShareButton } from '../../atoms/ShareButton/ShareButton'; // <-- Importamos el Átomo

export function HeroCover(profile: CardProfile): HTMLElement {
  // ── 1. CSS primero, ANTES de tocar el DOM ──────────────────
  injectCSS(HERO_CSS, '__css-hero-cover');

  const { person, company } = profile;

  // ── 2. Construir el elemento ────────────────────────────────
  const section = document.createElement('section');
  section.className = 'hc';
  section.setAttribute('aria-label', `Perfil de ${person.fullName}`);

  section.innerHTML = `
    <div class="hc__cover-wrap">
      <img
        class="hc__cover-img"
        src="${company.coverUrl}"
        alt="Portada ${company.name}"
        fetchpriority="high"
        loading="eager"
        decoding="async"
        width="430"
        height="220"
      />
      <div class="hc__cover-overlay" aria-hidden="true"></div>
      <div class="hc__cover-pill" aria-hidden="true">
        ${company.logoUrl
      ? `<img src="${company.logoUrl}" alt="" class="hc__company-logo" /><span class="hc__company-name">${company.name}</span>`
      : `<span class="hc__company-name">${company.name}</span>`}
      </div>
    </div>

    <div class="hc__avatar-anchor" aria-hidden="true">
      <div class="hc__avatar-bg"></div>
      <div class="hc__avatar">
        <img
          src="${person.avatarUrl}"
          alt=""
          loading="eager"
          decoding="async"
          onerror="this.style.display='none';document.getElementById('hc-fb').removeAttribute('hidden')"
        />
        <span id="hc-fb" hidden aria-hidden="true">${person.avatarFallback}</span>
      </div>
    </div>

    <div id="hc-actions" class="hc__actions-anchor"></div>

    <div class="hc__body" data-animate data-animate-delay="100">
      <div class="hc__name-row">
        <h1 class="hc__name">${person.fullName}</h1>
        <svg class="hc__badge" viewBox="0 0 18 18" aria-label="Perfil verificado" role="img">
          <circle cx="9" cy="9" r="8.5" fill="${company.accentColor}"/>
          <path d="M5.5 9l2.2 2.2L12.5 6" stroke="#fff" stroke-width="1.5"
                stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </svg>
      </div>

      <p class="hc__role">
        <span>${person.role}</span>
        <span class="hc__role-sep" aria-hidden="true">·</span>
        <span>${company.name}</span>
      </p>

      ${person.bio
      ? `<p class="hc__bio">${person.bio}</p>`
      : ''}

      <div class="hc__stats" role="list" aria-label="Estadísticas">
        ${company.stats.map(s => `
          <div class="hc__stat" role="listitem">
            <span class="hc__stat-val">${s.value}</span>
            <span class="hc__stat-lbl">${s.suffix ?? s.label}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // ── 3. Composición de Átomos ────────────────────────────────
  // Buscamos el ancla vacía e insertamos el ShareButton hidratado con la data
  const actionsAnchor = section.querySelector('#hc-actions');
  if (actionsAnchor) {
    actionsAnchor.appendChild(ShareButton(profile));
  }

  return section;
}

/* ─────────────────────────────────────────────────────────────
   CSS — Mobile First.
   Los media queries solo añaden, nunca sobreescriben en exceso.
───────────────────────────────────────────────────────────── */
const HERO_CSS = `

  /* ── Cover ── */
  .hc { position: relative; }

  .hc__cover-wrap {
    position: relative;
    width: 100%;
    height: clamp(180px, 48vw, 240px);
    overflow: hidden;
    display: block;
  }

  .hc__cover-img {
    width: 100%; height: 100%;
    object-fit: cover; object-position: center 30%;
    display: block;
  }

  .hc__cover-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(
      180deg,
      rgba(0,0,0,.04) 0%,
      rgba(0,0,0,.52) 100%
    );
  }

  .hc__cover-pill {
    position: absolute; top: 16px; left: 16px;
    background: rgba(255,255,255,.16);
    backdrop-filter: blur(12px) saturate(1.5);
    -webkit-backdrop-filter: blur(12px) saturate(1.5);
    border: 1px solid rgba(255,255,255,.26);
    border-radius: 99px;
    padding: 8px 16px;
    display: flex; align-items: center; justify-content: center;
    gap: 8px;
    min-height: 32px;
    color: #fff;
    line-height: 1;
  }

  .hc__company-logo {
    height: 20px;
    width: auto;
    object-fit: contain;
    display: block;
  }

  .hc__company-name {
    font-size: 13px;
    font-weight: 600;
    letter-spacing: .04em;
    padding-top: 1px;
  }

  /* ── Avatar superpuesto ── */
  .hc__avatar-anchor {
    position: absolute;
    left: 20px;
    top: calc(clamp(180px, 48vw, 240px) - 48px);
    z-index: 10;
  }

  .hc__avatar-bg {
    position: absolute;
    inset: -5px;
    border-radius: 50%;
    background: var(--paper);
  }

  .hc__avatar {
    position: relative; z-index: 1;
    width: clamp(96px, 26vw, 120px);
    height: clamp(96px, 26vw, 120px);
    border-radius: 50%;
    overflow: hidden;
    background: var(--surface-2);
    display: flex; align-items: center; justify-content: center;
    font-size: clamp(22px, 6vw, 32px);
    font-weight: 600;
    color: var(--ink);
    box-shadow: var(--shadow-md);
  }

  .hc__avatar img {
    width: 100%; height: 100%;
    object-fit: cover;
    display: block;
  }

  /* ── Acciones a la derecha (Botón Compartir) ── */
  .hc__actions-anchor {
    position: absolute;
    right: var(--section-pad, 20px);
    /* Se alinea debajo de la imagen de portada, respirando 16px hacia abajo */
    top: calc(clamp(180px, 48vw, 240px) + 16px);
    z-index: 10;
  }

  /* ── Body ── */
  .hc__body {
    padding-top: calc(clamp(96px, 26vw, 120px) / 2 + 24px);
    padding-left: var(--section-pad);
    padding-right: var(--section-pad);
    padding-bottom: var(--s-8);
  }

  /* ── Name ── */
  .hc__name-row {
    display: flex;
    align-items: center;
    gap: var(--s-2);
    margin-bottom: var(--s-1);
    flex-wrap: wrap;
  }

  .hc__name {
    font-size: var(--t-xl);
    font-weight: 600;
    letter-spacing: -.03em;
    line-height: 1.1;
    color: var(--ink);
    word-break: break-word;
    hyphens: auto;
  }

  .hc__badge {
    width: 20px; height: 20px;
    flex-shrink: 0;
    margin-top: 2px;
  }

  /* ── Role ── */
  .hc__role {
    font-size: var(--t-sm);
    font-weight: 400;
    letter-spacing: .08em;
    text-transform: uppercase;
    color: var(--ink-40);
    margin-bottom: var(--s-3);
    display: flex;
    align-items: center;
    gap: var(--s-2);
    flex-wrap: wrap;
  }

  .hc__role-sep { color: var(--accent); }

  /* ── Bio ── */
  .hc__bio {
    font-size: var(--t-base);
    line-height: 1.65;
    color: var(--ink-60);
    margin-bottom: var(--s-6);
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* ── Stats — glassmorphism ── */
  .hc__stats {
    display: flex;
    border-radius: var(--r-md);
    border: 1px solid var(--ink-04);
    overflow: hidden;
    background: rgba(243,242,239,.72);
    backdrop-filter: var(--blur-sm);
    -webkit-backdrop-filter: var(--blur-sm);
  }

  .hc__stat {
    flex: 1;
    min-height: var(--touch-min);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--s-3) var(--s-2);
    position: relative;
    min-width: 0;
  }

  .hc__stat + .hc__stat::before {
    content: '';
    position: absolute;
    left: 0; top: 20%; bottom: 20%;
    width: 1px;
    background: var(--ink-08);
  }

  .hc__stat-val {
    font-size: clamp(14px, 4.2vw, 18px);
    font-weight: 600;
    letter-spacing: -.02em;
    color: var(--ink);
    line-height: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  .hc__stat-lbl {
    font-size: clamp(9px, 2.2vw, 10px);
    color: var(--ink-40);
    margin-top: 3px;
    text-align: center;
    line-height: 1.3;
    letter-spacing: .02em;
    word-break: break-word;
    max-width: 56px;
  }

  @media (min-width: 380px) {
    .hc__stat { padding: var(--s-4) var(--s-3); }
  }
`;