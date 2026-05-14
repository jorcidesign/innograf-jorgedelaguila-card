// src/components/organisms/FooterShare/FooterShare.ts
import { injectCSS } from '../../../utils/dom';
import { generateVCard } from '../../../utils/vcard';
import type { CardProfile } from '../../../types/card.types';

let cssInjected = false;
function injectStyles() {
  if (cssInjected) return;
  cssInjected = true;
  injectCSS(FOOTER_CSS, '__css-footer-share');
}

// ── Carga QRious desde CDN una sola vez ─────────────────────
let qrLibPromise: Promise<void> | null = null;

function loadQRLib(): Promise<void> {
  if (qrLibPromise) return qrLibPromise;
  qrLibPromise = new Promise((resolve, reject) => {
    // Verificamos si la librería ya está en window
    if ((window as any).QRious) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    // Usamos QRious, mucho más robusto para payloads grandes como vCards
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('No se pudo cargar QRious'));
    document.head.appendChild(script);
  });
  return qrLibPromise;
}

// ── Interfaz mínima de QRious ──────────────────────────────
interface QRiousOptions {
  element?: HTMLElement;
  value: string;
  size?: number;
  background?: string;
  foreground?: string;
  level?: 'L' | 'M' | 'Q' | 'H';
}
interface QRiousConstructor {
  new(opts: QRiousOptions): any;
}

async function renderQR(container: HTMLElement, vcardText: string): Promise<void> {
  await loadQRLib();

  // Limpia el placeholder/skeleton
  container.innerHTML = '';

  // QRious requiere inyectarse sobre un elemento <canvas> o <img>
  const canvas = document.createElement('canvas');
  container.appendChild(canvas);

  const QRious = (window as any).QRious as QRiousConstructor;
  new QRious({
    element: canvas,
    value: vcardText,
    size: 148,
    background: '#FFFFFF',
    foreground: '#0D0D0D',
    level: 'L' // Low error correction es ideal para vCards porque maximiza la capacidad de datos
  });
}

export function FooterShare(profile: CardProfile): HTMLElement {
  injectStyles();

  const footer = document.createElement('footer');
  footer.className = 'footer-share';
  footer.setAttribute('data-animate', '');

  // Generamos el texto vCard que codificará el QR
  const vcardText = generateVCard(profile.vcard);

  footer.innerHTML = `
    <div class="footer-share__qr-wrap">
      <div class="footer-share__qr-container" id="fs-qr-target">
        <div class="footer-share__qr-skeleton" aria-hidden="true">
          <svg viewBox="0 0 148 148" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect width="148" height="148" fill="#fff"/>
            <rect x="10" y="10" width="38" height="38" rx="4" fill="#E0DED9"/>
            <rect x="14" y="14" width="30" height="30" rx="2" fill="#fff"/>
            <rect x="18" y="18" width="22" height="22" rx="1" fill="#C8C6C0"/>
            <rect x="100" y="10" width="38" height="38" rx="4" fill="#E0DED9"/>
            <rect x="104" y="14" width="30" height="30" rx="2" fill="#fff"/>
            <rect x="108" y="18" width="22" height="22" rx="1" fill="#C8C6C0"/>
            <rect x="10" y="100" width="38" height="38" rx="4" fill="#E0DED9"/>
            <rect x="14" y="104" width="30" height="30" rx="2" fill="#fff"/>
            <rect x="18" y="108" width="22" height="22" rx="1" fill="#C8C6C0"/>
            <rect x="56" y="10" width="6" height="6" rx="1" fill="#D4D2CD"/>
            <rect x="66" y="10" width="6" height="6" rx="1" fill="#D4D2CD"/>
            <rect x="76" y="10" width="6" height="6" rx="1" fill="#D4D2CD"/>
            <rect x="56" y="20" width="6" height="6" rx="1" fill="#D4D2CD"/>
            <rect x="76" y="20" width="6" height="6" rx="1" fill="#D4D2CD"/>
            <rect x="56" y="30" width="6" height="6" rx="1" fill="#D4D2CD"/>
            <rect x="66" y="30" width="6" height="6" rx="1" fill="#D4D2CD"/>
            <rect x="56" y="56" width="6" height="6" rx="1" fill="#D4D2CD"/>
            <rect x="76" y="56" width="6" height="6" rx="1" fill="#D4D2CD"/>
            <rect x="56" y="66" width="6" height="6" rx="1" fill="#D4D2CD"/>
            <rect x="66" y="66" width="6" height="6" rx="1" fill="#D4D2CD"/>
            <rect x="76" y="66" width="6" height="6" rx="1" fill="#D4D2CD"/>
            <rect x="56" y="76" width="6" height="6" rx="1" fill="#D4D2CD"/>
            <rect x="76" y="76" width="6" height="6" rx="1" fill="#D4D2CD"/>
          </svg>
        </div>
      </div>
      <p class="footer-share__hint">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round"
             aria-hidden="true">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
          <path d="M12 16v-4M12 8h.01"/>
        </svg>
        Escanea para guardar el contacto
      </p>
    </div>

    <div class="footer-share__divider" aria-hidden="true"></div>

    <div class="footer-share__brand">
      <span class="footer-share__brand-label">Digital Experience by</span>
      <a class="footer-share__brand-link"
         href="${profile.poweredBy.url}"
         target="_blank"
         rel="noopener noreferrer">
        ${profile.poweredBy.name}
      </a>
    </div>
  `;

  // Renderizar QR de forma asíncrona (no bloquea el render inicial)
  const qrTarget = footer.querySelector<HTMLElement>('#fs-qr-target');
  if (qrTarget) {
    renderQR(qrTarget, vcardText).catch((err) => {
      console.warn('[FooterShare] QR fallback activado:', err);
      qrTarget.innerHTML = `
        <div class="footer-share__qr-fallback">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <path d="M14 14h.01M17 14h.01M20 14h.01M14 17h.01M17 17h.01M20 17h.01M14 20h.01M17 20h.01M20 20h.01"/>
          </svg>
          <span>QR no disponible</span>
        </div>
      `;
    });
  }

  return footer;
}

const FOOTER_CSS = `
  .footer-share {
    background: var(--ink);
    padding: 56px 24px 44px;
    text-align: center;
    border-radius: 32px 32px 0 0;
    margin-top: 8px;
    position: relative;
    overflow: hidden;
  }

  .footer-share::before {
    content: '';
    position: absolute;
    top: -60px; left: 50%;
    transform: translateX(-50%);
    width: 200px; height: 200px;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      rgba(var(--brand-accent-rgb, 200,169,110), 0.12) 0%,
      transparent 70%
    );
    pointer-events: none;
  }

  .footer-share__qr-wrap {
    position: relative;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    margin-bottom: 32px;
  }

  .footer-share__qr-container {
    background: #ffffff;
    border-radius: 20px;
    padding: 16px;
    box-shadow:
      0 0 0 1px rgba(255,255,255,0.08),
      0 8px 32px rgba(0,0,0,0.32),
      0 2px 8px rgba(0,0,0,0.24);
    color: #0D0D0D;
  }

  .footer-share__qr-container canvas {
    display: block;
    border-radius: 4px;
  }

  .footer-share__qr-skeleton {
    width: 148px;
    height: 148px;
  }

  .footer-share__qr-skeleton svg {
    width: 100%;
    height: 100%;
  }

  .footer-share__qr-fallback {
    width: 148px; height: 148px;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 8px;
    color: rgba(13,13,13,0.4);
    font-size: 12px;
    font-weight: 500;
  }

  .footer-share__hint {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.02em;
    color: rgba(255,255,255,0.5);
    margin: 0;
  }

  .footer-share__divider {
    width: 40px;
    height: 1px;
    background: rgba(255,255,255,0.12);
    margin: 0 auto 28px;
  }

  .footer-share__brand {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .footer-share__brand-label {
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.3);
  }

  .footer-share__brand-link {
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.04em;
    color: rgba(255,255,255,0.85);
    text-decoration: none;
    transition: color 200ms ease;
  }

  .footer-share__brand-link:hover {
    color: var(--brand-accent, #C8A96E);
  }
`;