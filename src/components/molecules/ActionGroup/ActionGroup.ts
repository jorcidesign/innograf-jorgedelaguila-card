// src/components/molecules/ActionGroup/ActionGroup.ts
import { injectCSS } from '../../../utils/dom';
import { generateVCard } from '../../../utils/vcard';
import type { CardProfile } from '../../../types/card.types';

export function ActionGroup(profile: CardProfile): HTMLElement {
  injectCSS(ACTION_CSS, '__css-action-group');

  const { contact, person, vcard, company } = profile;

  const wrapper = document.createElement('div');
  wrapper.className = 'ag-wrapper';

  // ── Barra de acciones principal ─────────────────────────────
  const nav = document.createElement('nav');
  nav.className = 'ag';
  nav.setAttribute('aria-label', 'Acciones de contacto');

  const actions = [
    {
      id: 'save',
      label: 'Guardar',
      icon: SVG_CONTACT,
      ariaLabel: `Guardar contacto de ${person.firstName}`,
      onClick: () => {
        const blob = new Blob([generateVCard(vcard)], { type: 'text/vcard' });
        const url = URL.createObjectURL(blob);
        const a = Object.assign(document.createElement('a'), {
          href: url, download: `${person.firstName}-${company.name}.vcf`
        });
        a.click();
        URL.revokeObjectURL(url);
      },
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: SVG_WA,
      ariaLabel: 'Escribir por WhatsApp',
      href: `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(contact.whatsappMessage)}`,
    },
    {
      id: 'call',
      label: 'Llamar',
      icon: SVG_PHONE,
      ariaLabel: `Llamar a ${person.firstName}`,
      href: `tel:${contact.phone}`,
    },
    {
      id: 'email',
      label: 'Email',
      icon: SVG_EMAIL,
      ariaLabel: `Enviar email a ${person.firstName}`,
      href: `mailto:${contact.email}`,
    },
  ];

  nav.innerHTML = actions.map(a => `
    <${a.href ? 'a' : 'button'}
      class="ag__btn"
      id="ag-${a.id}"
      ${a.href ? `href="${a.href}" target="_blank" rel="noopener noreferrer"` : 'type="button"'}
      aria-label="${a.ariaLabel}"
    >
      <span class="ag__icon" aria-hidden="true">${a.icon}</span>
      <span class="ag__label">${a.label}</span>
    </${a.href ? 'a' : 'button'}>
  `).join('');

  // Bind onClick para los botones sin href
  actions.filter(a => a.onClick).forEach(a => {
    nav.querySelector(`#ag-${a.id}`)
      ?.addEventListener('click', a.onClick!);
  });

  // ── Web Corporativo: botón visualmente distinto ─────────────
  // Se muestra debajo de los botones de acción, con borde de acento
  // y diseño diferenciado — no compite visualmente con el CTA principal
  const webLink = document.createElement('a');
  webLink.className = 'ag__web-link';
  webLink.href = company.website;
  webLink.target = '_blank';
  webLink.rel = 'noopener noreferrer';
  webLink.setAttribute('aria-label', `Visitar sitio web de ${company.name}`);

  webLink.innerHTML = `
    <span class="ag__web-link-icon" aria-hidden="true">${SVG_GLOBE}</span>
    <span class="ag__web-link-text">
      <span class="ag__web-link-label">Sitio web oficial</span>
      <span class="ag__web-link-url">${company.website.replace(/^https?:\/\//, '')}</span>
    </span>
    <span class="ag__web-link-arrow" aria-hidden="true">${SVG_ARROW}</span>
  `;

  wrapper.append(nav, webLink);
  return wrapper;
}

// SVGs — 22px, stroke-width 1.7, linecap round
const SVG_CONTACT = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
const SVG_WA = `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
</svg>`;
const SVG_PHONE = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2A19.86 19.86 0 013.07 4.18 2 2 0 015.06 2h3a2 2 0 012 1.72 12.8 12.8 0 00.7 2.82 2 2 0 01-.45 2.11L9.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.8 12.8 0 002.82.7A2 2 0 0122 16.92z"/></svg>`;
const SVG_EMAIL = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`;

const SVG_GLOBE = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`;
const SVG_ARROW = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>`;

const ACTION_CSS = `
  /* ── Wrapper: agrupa barra + link web ── */
  .ag-wrapper {
    background: var(--brand-paper, #fff);
    padding: var(--s-6) var(--section-pad);
    display: flex;
    flex-direction: column;
    gap: var(--s-3);
  }

  /* ── Barra de acciones ── */
  .ag {
    display: flex;
    gap: var(--s-2);
  }

  .ag__btn {
    flex: 1;
    min-height: var(--touch-min);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 5px;
    padding: 12px 4px 10px;
    border-radius: var(--r-md);

    background: var(--brand-primary);
    color: var(--brand-paper);
    border: 1px solid rgba(var(--brand-primary-rgb), 0.1);

    font-family: var(--font-body);
    font-size: var(--t-xs);
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    transition: all 200ms var(--ease-out);
    -webkit-tap-highlight-color: transparent;
  }

  .ag__btn .ag__icon {
    color: var(--brand-paper);
  }

  .ag__btn:active {
    transform: scale(0.95);
    opacity: 0.9;
  }

  @media (hover: hover) and (pointer: fine) {
    .ag__btn:hover {
      background: var(--brand-accent);
      color: var(--brand-ink);
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(var(--brand-accent-rgb), 0.3);
    }
    .ag__btn:hover .ag__icon {
      color: var(--brand-ink);
    }
  }

  /* ── Link Web Corporativo ── */
  .ag__web-link {
    display: flex;
    align-items: center;
    gap: var(--s-3);
    padding: 14px var(--s-4);
    border-radius: var(--r-md);
    text-decoration: none;
    color: inherit;
    min-height: var(--touch-min);

    /* Borde con acento — diferencia visual clara del CTA principal */
    background: transparent;
    border: 1.5px solid rgba(var(--brand-accent-rgb, 200,169,110), 0.30);

    transition:
      background 200ms var(--ease-out),
      border-color 200ms var(--ease-out),
      transform 200ms var(--ease-out),
      box-shadow 200ms var(--ease-out);

    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }

  .ag__web-link-icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: var(--r-sm);
    background: rgba(var(--brand-accent-rgb, 200,169,110), 0.08);
    color: var(--brand-accent, #C8A96E);
  }

  .ag__web-link-text {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .ag__web-link-label {
    font-size: var(--t-sm);
    font-weight: 600;
    color: var(--ink);
    line-height: 1.2;
  }

  .ag__web-link-url {
    font-size: var(--t-xs);
    color: var(--brand-accent, #C8A96E);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 400;
  }

  .ag__web-link-arrow {
    flex-shrink: 0;
    color: rgba(var(--brand-accent-rgb, 200,169,110), 0.50);
    transition: transform 200ms var(--ease-spring), color 200ms ease;
  }

  /* Touch feedback */
  .ag__web-link:active {
    transform: scale(0.98);
    background: rgba(var(--brand-accent-rgb, 200,169,110), 0.06);
  }

  /* Hover solo en mouse */
  @media (hover: hover) and (pointer: fine) {
    .ag__web-link:hover {
      background: rgba(var(--brand-accent-rgb, 200,169,110), 0.06);
      border-color: rgba(var(--brand-accent-rgb, 200,169,110), 0.60);
      transform: translateX(4px);
      box-shadow: var(--shadow-sm);
    }

    .ag__web-link:hover .ag__web-link-arrow {
      transform: translate(3px, -3px);
      color: var(--brand-accent, #C8A96E);
    }
  }
`;