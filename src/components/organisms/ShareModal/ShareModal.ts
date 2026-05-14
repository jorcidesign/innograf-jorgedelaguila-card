// src/components/organisms/ShareModal/ShareModal.ts
import { injectCSS } from '../../../utils/dom';
import type { CardProfile } from '../../../types/card.types';

export function openShareModal(profile: CardProfile): void {
    injectCSS(SHARE_MODAL_CSS, '__css-share-modal');

    const shareText = `Hola, accede a mi tarjeta digital interactiva desde el siguiente enlace:\n\n`;
    const shareUrl = profile.cardUrl;
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(`Tarjeta Digital | ${profile.company.name}`);

    // ── DOM shell ─────────────────────────────────────────────────────────────────
    const overlay = document.createElement('div');
    overlay.className = 'sm__overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');

    overlay.innerHTML = `
    <div class="sm__backdrop"></div>
    <div class="sm__sheet">
      
      <div class="sm__header">
        <h2 class="sm__title">Compartir Tarjeta</h2>
        <button class="sm__btn-close" aria-label="Cerrar">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="sm__body">
        <p class="sm__desc">Puedes compartir esta tarjeta fácilmente en cualquiera de los sistemas informados que tengas habilitados en tu dispositivo.</p>

        <div class="sm__section">
          <div class="sm__action-row">
            <button class="sm__action-btn" onclick="alert('Generador de QR disponible en el próximo sprint.')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              QR acceso a tarjeta
            </button>
            <button class="sm__action-btn" onclick="alert('Generador de QR disponible en el próximo sprint.')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              QR vCard
            </button>
          </div>
        </div>

        <div class="sm__section">
          <h3 class="sm__subtitle">Compartir en sistemas de comunicación:</h3>
          <div class="sm__grid">
            <a href="https://api.whatsapp.com/send?text=${encodedText}${encodedUrl}" target="_blank" rel="noopener noreferrer" class="sm__icon-link">
              <div class="sm__icon-wrap" style="color: #25D366; background: rgba(37,211,102,0.1);">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              </div>
              <span>WhatsApp</span>
            </a>
            <a href="sms:?&body=${encodedText}${encodedUrl}" class="sm__icon-link">
              <div class="sm__icon-wrap" style="color: #007AFF; background: rgba(0,122,255,0.1);">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              </div>
              <span>SMS</span>
            </a>
          </div>
        </div>

        <div class="sm__section">
          <h3 class="sm__subtitle">Compartir en redes sociales:</h3>
          <div class="sm__grid">
            <a href="https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}" target="_blank" rel="noopener noreferrer" class="sm__icon-link">
              <div class="sm__icon-wrap" style="color: #1877F2; background: rgba(24,119,242,0.1);">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </div>
              <span>Facebook</span>
            </a>
            <a href="https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}" target="_blank" rel="noopener noreferrer" class="sm__icon-link">
              <div class="sm__icon-wrap" style="color: var(--ink); background: var(--ink-04);">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </div>
              <span>X</span>
            </a>
            <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}" target="_blank" rel="noopener noreferrer" class="sm__icon-link">
              <div class="sm__icon-wrap" style="color: #0A66C2; background: rgba(10,102,194,0.1);">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </div>
              <span>LinkedIn</span>
            </a>
            <a href="https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}" target="_blank" rel="noopener noreferrer" class="sm__icon-link">
              <div class="sm__icon-wrap" style="color: #E60023; background: rgba(230,0,35,0.1);">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"></path><path d="M12 8v8"></path><path d="M9 11l3-3 3 3"></path></svg>
              </div>
              <span>Pinterest</span>
            </a>
          </div>
        </div>

        <div class="sm__section">
          <h3 class="sm__subtitle">Otros métodos para compartir:</h3>
          <button class="sm__action-btn sm__action-btn--full" id="sm-copy-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
            Copiar enlace
          </button>
        </div>

        <div class="sm__section sm__section--email">
          <p class="sm__desc" style="margin-bottom: 12px; text-align: center;">Puedes enviar esta tarjeta por email que incluye un acceso directo y un formato vCard para descarga.</p>
          <a href="mailto:?subject=${encodedTitle}&body=${encodedText}${encodedUrl}" class="sm__action-btn sm__action-btn--primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            Enviar por email
          </a>
        </div>

      </div>
    </div>
  `;

    document.body.appendChild(overlay);

    // Trigger animation
    requestAnimationFrame(() => overlay.classList.add('sm__overlay--open'));

    // ── Logic ───────────────────────────────────────────────────────────────────
    function close() {
        overlay.classList.remove('sm__overlay--open');
        overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
    }

    overlay.querySelector('.sm__btn-close')!.addEventListener('click', close);
    overlay.querySelector('.sm__backdrop')!.addEventListener('click', close);

    // Copy link functionality
    const copyBtn = overlay.querySelector('#sm-copy-btn')!;
    copyBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#25D366" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> ¡Enlace copiado!`;
            setTimeout(() => copyBtn.innerHTML = originalText, 2000);
        } catch (err) {
            console.error('Error copiando', err);
        }
    });
}

// ── CSS (Apple / Japanese Minimalist) ─────────────────────────────────────────
const SHARE_MODAL_CSS = `
  .sm__overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: flex-end; /* Mobile bottom sheet */
    justify-content: center;
    opacity: 0;
    visibility: hidden;
    transition: opacity 300ms ease, visibility 300ms;
  }
  .sm__overlay--open {
    opacity: 1;
    visibility: visible;
  }

  .sm__backdrop {
    position: absolute; inset: 0;
    background: rgba(0,0,0,0.4);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  .sm__sheet {
    position: relative;
    width: 100%;
    max-width: 500px;
    background: var(--paper, #ffffff);
    border-radius: 28px 28px 0 0;
    padding: 24px 20px 40px;
    transform: translateY(100%);
    transition: transform 400ms cubic-bezier(0.16, 1, 0.3, 1);
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 -10px 40px rgba(0,0,0,0.1);
  }
  .sm__overlay--open .sm__sheet {
    transform: translateY(0);
  }

  @media (min-width: 640px) {
    .sm__overlay { align-items: center; }
    .sm__sheet {
      border-radius: 24px;
      padding: 32px;
      transform: translateY(20px) scale(0.95);
    }
    .sm__overlay--open .sm__sheet {
      transform: translateY(0) scale(1);
    }
  }

  /* Header */
  .sm__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  .sm__title {
    font-size: 20px;
    font-weight: 600;
    color: var(--ink);
    letter-spacing: -0.02em;
    margin: 0;
  }
  .sm__btn-close {
    width: 36px; height: 36px;
    border-radius: 50%;
    background: var(--ink-04);
    border: none;
    color: var(--ink-60);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: background 150ms;
  }
  .sm__btn-close:active { background: var(--ink-08); }

  /* Body */
  .sm__body {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  .sm__desc {
    font-size: 14px;
    line-height: 1.5;
    color: var(--ink-60);
    margin: 0;
  }
  .sm__subtitle {
    font-size: 12px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--ink-40);
    margin: 0 0 12px 0;
  }

  /* Buttons & Rows */
  .sm__section {
    display: flex;
    flex-direction: column;
  }
  .sm__action-row {
    display: flex;
    gap: 12px;
  }
  .sm__action-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px;
    background: var(--surface-2, #F7F7F8);
    border: 1px solid var(--ink-04);
    border-radius: 16px;
    color: var(--ink);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    text-decoration: none;
    transition: background 150ms, transform 100ms;
  }
  .sm__action-btn:active { transform: scale(0.97); background: var(--ink-08); }
  .sm__action-btn--full { width: 100%; }
  
  .sm__action-btn--primary {
    background: var(--ink);
    color: var(--paper);
    border: none;
  }
  .sm__action-btn--primary:active { background: #000; }

  /* Grid Icons (Apps & Social) */
  .sm__grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px 8px;
  }
  .sm__icon-link {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    color: var(--ink-60);
    font-size: 11px;
    font-weight: 500;
    transition: transform 150ms;
  }
  .sm__icon-link:active { transform: scale(0.92); }
  .sm__icon-wrap {
    width: 52px; height: 52px;
    border-radius: 16px; /* Squircle feel */
    display: flex; align-items: center; justify-content: center;
  }
  
  /* Email Section padding */
  .sm__section--email {
    margin-top: 8px;
    padding-top: 24px;
    border-top: 1px solid var(--ink-04);
  }
`;