// src/components/atoms/ShareButton/ShareButton.ts
import { injectCSS } from '../../../utils/dom';
import type { CardProfile } from '../../../types/card.types';
import { openShareModal } from '../../organisms/ShareModal/ShareModal'; // <-- Importamos la función

export function ShareButton(profile: CardProfile): HTMLButtonElement {
    injectCSS(SHARE_BTN_CSS, '__css-share-btn');

    const btn = document.createElement('button');
    btn.className = 'atm-share-btn';
    btn.setAttribute('aria-label', 'Compartir tarjeta digital');

    // Icono de "Compartir" universal
    btn.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
      <polyline points="16 6 12 2 8 6"></polyline>
      <line x1="12" y1="2" x2="12" y2="15"></line>
    </svg>
  `;

    // Al hacer click, levantamos nuestro diseño Premium
    btn.addEventListener('click', () => {
        openShareModal(profile);
    });

    return btn;
}

const SHARE_BTN_CSS = `
  .atm-share-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--paper, #ffffff);
    border: 1px solid var(--ink-08, rgba(0,0,0,0.08));
    color: var(--ink, #1a1a1a);
    cursor: pointer;
    box-shadow: var(--shadow-sm);
    transition: transform 150ms ease, background 150ms ease;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }

  .atm-share-btn:active {
    transform: scale(0.92);
    background: var(--ink-04);
  }
`;