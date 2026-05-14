// src/components/organisms/SocialLinks/SocialLinks.ts
import { injectCSS } from '../../../utils/dom';
import type { CardProfile } from '../../../types/card.types';

// ── Mapa de SVG paths para cada red social ─────────────────────
const SOCIAL_ICONS: Record<string, string> = {
    linkedin: `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="1.75"
             stroke-linecap="round" stroke-linejoin="round"
             aria-hidden="true">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
          <rect x="2" y="9" width="4" height="12"/>
          <circle cx="4" cy="4" r="2"/>
        </svg>`,

    instagram: `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="1.75"
             stroke-linecap="round" stroke-linejoin="round"
             aria-hidden="true">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
        </svg>`,

    facebook: `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="1.75"
             stroke-linecap="round" stroke-linejoin="round"
             aria-hidden="true">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
        </svg>`,

    twitter: `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="1.75"
             stroke-linecap="round" stroke-linejoin="round"
             aria-hidden="true">
          <path d="M4 4l16 16M4 20L20 4"/>
          <path d="M20 4l-6 6M4 20l6-6"/>
        </svg>`,

    youtube: `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="1.75"
             stroke-linecap="round" stroke-linejoin="round"
             aria-hidden="true">
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
          <polygon points="9.75,15.02 15.5,12 9.75,8.98 9.75,15.02"/>
        </svg>`,

    tiktok: `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="1.75"
             stroke-linecap="round" stroke-linejoin="round"
             aria-hidden="true">
          <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
        </svg>`,

    default: `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="1.75"
             stroke-linecap="round" stroke-linejoin="round"
             aria-hidden="true">
          <circle cx="12" cy="12" r="10"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>`,
};

function getSocialIcon(iconId: string): string {
    return SOCIAL_ICONS[iconId.toLowerCase()] ?? SOCIAL_ICONS['default'];
}

export function SocialLinks(profile: CardProfile): HTMLElement {
    injectCSS(SOCIAL_CSS, '__css-social-links');

    if (!profile.socials || profile.socials.length === 0) {
        return document.createElement('div');
    }

    const section = document.createElement('section');
    section.className = 'sl';
    section.setAttribute('aria-label', 'Redes sociales');
    section.setAttribute('data-animate', '');

    section.innerHTML = `
    <div class="sl__inner">
      <span class="sl__label">Síguenos en</span>
      <nav class="sl__links" aria-label="Links de redes sociales">
        ${profile.socials.map((social, i) => `
          <a
            class="sl__item"
            href="${social.url}"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="${social.label}"
            data-animate
            data-animate-delay="${i * 80}"
            title="${social.label}"
          >
            <span class="sl__icon">${getSocialIcon(social.icon)}</span>
            <span class="sl__item-label">${social.label}</span>
          </a>
        `).join('')}
      </nav>
    </div>
  `;

    return section;
}

const SOCIAL_CSS = `
  .sl {
    /* Fondo blanco dinámico para unirse visualmente al ActionGroup */
    background: var(--brand-paper, #fff);
    /* Gap superior ajustado (s-6) y bottom gap generoso */
    padding: var(--s-6) var(--section-pad) var(--s-8);
    /* Borde inferior sutil para separarlo del contenido siguiente */
    border-bottom: 1px solid rgba(0,0,0,0.05);
  }

  .sl__inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--s-4);
  }

  .sl__label {
    font-size: var(--t-xs);
    font-weight: 500;
    letter-spacing: 0.10em;
    text-transform: uppercase;
    color: var(--ink-40);
  }

  .sl__links {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--s-4);
    flex-wrap: wrap;
  }

  /* ── Cada item: círculo con acento de marca ── */
  .sl__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    text-decoration: none;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }

  .sl__icon {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;

    /* Círculo sutil con acento de marca */
    background: rgba(var(--brand-accent-rgb, 200,169,110), 0.08);
    border: 1.5px solid rgba(var(--brand-accent-rgb, 200,169,110), 0.20);
    color: var(--brand-accent, #C8A96E);

    transition:
      background 220ms var(--ease-out),
      border-color 220ms var(--ease-out),
      transform 220ms var(--ease-spring),
      color 220ms var(--ease-out),
      box-shadow 220ms var(--ease-out);
  }

  .sl__item-label {
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.04em;
    color: var(--ink-40);
    transition: color 220ms ease;
    white-space: nowrap;
  }

  /* Touch feedback */
  .sl__item:active .sl__icon {
    transform: scale(0.92);
    background: rgba(var(--brand-accent-rgb, 200,169,110), 0.18);
  }

  /* Hover (solo mouse) */
  @media (hover: hover) and (pointer: fine) {
    .sl__item:hover .sl__icon {
      background: var(--brand-accent, #C8A96E);
      border-color: var(--brand-accent, #C8A96E);
      color: #fff;
      transform: translateY(-3px);
      box-shadow:
        0 8px 20px rgba(var(--brand-accent-rgb, 200,169,110), 0.30),
        0 2px 6px rgba(var(--brand-accent-rgb, 200,169,110), 0.20);
    }

    .sl__item:hover .sl__item-label {
      color: var(--brand-accent, #C8A96E);
    }
  }
`;