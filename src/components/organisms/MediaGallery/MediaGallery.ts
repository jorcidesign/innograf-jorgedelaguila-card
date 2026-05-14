// src/components/organisms/MediaGallery/MediaGallery.ts
import { injectCSS } from '../../../utils/dom';
import type { CardProfile } from '../../../types/card.types';

export function MediaGallery(profile: CardProfile): HTMLElement {
    injectCSS(MEDIA_CSS, '__css-media-gallery');

    const section = document.createElement('section');
    section.className = 'mg';
    section.setAttribute('aria-label', 'Galería multimedia');
    section.setAttribute('data-animate', '');

    section.innerHTML = `
    <header class="mg__header">
      <span class="mg__eyebrow">Multimedia</span>
      <h2 class="mg__title">En acción</h2>
    </header>
    <div class="mg__list">
      ${profile.multimedia.map((item, i) => `
        <article class="mg__card" data-animate data-animate-delay="${i * 120}">
          <div class="mg__embed-wrap" data-src="${item.embedUrl}">
            <button
              class="mg__thumb"
              aria-label="Reproducir: ${item.title}"
              type="button"
            >
              <img
                class="mg__thumb-img"
                src="${item.thumbnailUrl}"
                alt="${item.title}"
                loading="lazy"
                decoding="async"
                width="390"
                height="219"
              />
              <span class="mg__thumb-overlay" aria-hidden="true"></span>
              <span class="mg__play" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </span>
              ${item.duration
            ? `<span class="mg__duration" aria-label="Duración: ${item.duration}">${item.duration}</span>`
            : ''}
            </button>
          </div>
          <div class="mg__meta">
            <span class="mg__item-title">${item.title}</span>
            ${item.subtitle
            ? `<span class="mg__item-sub">${item.subtitle}</span>`
            : ''}
          </div>
        </article>
      `).join('')}
    </div>
  `;

    // Lazy load del iframe al tap (no en hover — es mobile)
    section.querySelectorAll<HTMLElement>('.mg__thumb').forEach(btn => {
        btn.addEventListener('click', () => loadMedia(btn), { once: true });
    });

    return section;
}

function loadMedia(btn: HTMLElement): void {
    const wrap = btn.closest<HTMLElement>('.mg__embed-wrap');
    if (!wrap) return;
    const src = wrap.dataset.src;
    if (!src) return;

    wrap.innerHTML = `
    <iframe
      src="${src}?autoplay=1&rel=0&modestbranding=1"
      title="Video embebido"
      loading="lazy"
      allow="autoplay; encrypted-media; picture-in-picture"
      allowfullscreen
      style="position:absolute;inset:0;width:100%;height:100%;border:none;border-radius:inherit"
    ></iframe>
  `;
}

const MEDIA_CSS = `
  .mg {
    padding: 0 0 var(--section-gap);
  }

  .mg__header {
    padding: var(--section-gap) var(--section-pad) var(--s-5);
  }

  .mg__eyebrow {
    display: block;
    font-size: var(--t-xs);
    font-weight: 500;
    letter-spacing: .16em;
    text-transform: uppercase;
    color: var(--ink-40);
    margin-bottom: var(--s-1);
  }

  .mg__title {
    font-size: var(--t-lg);
    font-weight: 600;
    letter-spacing: -.025em;
    color: var(--ink);
    line-height: 1.15;
  }

  .mg__list {
    display: flex;
    flex-direction: column;
    gap: var(--s-4);
    padding: 0 var(--section-pad);
  }

  .mg__card {
    border-radius: var(--r-lg);
    overflow: hidden;
    background: var(--surface);
  }

  .mg__embed-wrap {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
    background: #111;
    border-radius: var(--r-lg) var(--r-lg) 0 0;
    overflow: hidden;
  }

  /* ── Thumbnail / play button ── */
  .mg__thumb {
    /* Cubre todo el embed-wrap — es el touch target completo */
    position: absolute; inset: 0;
    width: 100%; height: 100%;
    border: none; background: transparent; cursor: pointer;
    padding: 0;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
    display: block;
  }

  .mg__thumb-img {
    position: absolute; inset: 0;
    width: 100%; height: 100%;
    object-fit: cover; display: block;
    /* Transición solo en opacity — menos costosa que transform */
    transition: opacity 400ms var(--ease-out);
  }

  .mg__thumb:active .mg__thumb-img { opacity: .8; }

  @media (hover: hover) and (pointer: fine) {
    .mg__thumb:hover .mg__thumb-img { opacity: .85; }
    .mg__thumb:hover .mg__play { transform: translate(-50%,-50%) scale(1.1); }
  }

  .mg__thumb-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(
      180deg,
      transparent 35%,
      rgba(0,0,0,.6) 100%
    );
  }

  /* Play button — tamaño mínimo de touch target: 44px */
  .mg__play {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 52px; height: 52px;
    border-radius: 50%;
    background: rgba(255,255,255,.92);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center;
    color: var(--ink);
    box-shadow: 0 4px 20px rgba(0,0,0,.22);
    transition: transform 260ms var(--ease-spring), background var(--t-fast), box-shadow var(--t-fast);
    pointer-events: none; /* el click lo captura .mg__thumb */
  }

  .mg__thumb:active .mg__play {
    background: var(--accent);
    color: #fff;
    transform: translate(-50%, -50%) scale(.95);
    box-shadow: var(--shadow-accent);
  }

  .mg__duration {
    position: absolute;
    bottom: 10px; right: 10px;
    background: rgba(0,0,0,.65);
    backdrop-filter: blur(4px);
    color: #fff;
    font-size: var(--t-xs);
    font-weight: 500;
    padding: 3px 8px;
    border-radius: var(--r-full);
    pointer-events: none;
    line-height: 1.4;
  }

  /* ── Meta ── */
  .mg__meta {
    padding: var(--s-4) var(--s-4);
  }

  .mg__item-title {
    display: block;
    font-size: var(--t-base);
    font-weight: 500;
    color: var(--ink);
    line-height: 1.35;
  }

  .mg__item-sub {
    display: block;
    font-size: var(--t-xs);
    color: var(--ink-40);
    margin-top: 3px;
    line-height: 1.4;
  }
`;