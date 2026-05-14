// src/components/organisms/DocumentList/DocumentList.ts
import { injectCSS } from '../../../utils/dom';
import { openPdfFlipbook } from '../PdfFlipbookModal/PdfFlipbookModal';
import type { CardProfile } from '../../../types/card.types';

export function DocumentList(profile: CardProfile): HTMLElement {
  injectCSS(DOC_CSS, '__css-doc-list');

  const section = document.createElement('section');
  section.className = 'dl';
  section.setAttribute('aria-label', 'Documentos descargables');
  section.setAttribute('data-animate', 'true');

  section.innerHTML = `
    <header class="dl__header">
      <span class="dl__eyebrow">Recursos</span>
      <h2 class="dl__title">Documentos</h2>
    </header>
    <ul class="dl__list" role="list">
      ${profile.documents.map(doc => `
        <li role="listitem">
          <a class="dl__row ${doc.fileType === 'pdf' ? 'dl__row--flipbook' : ''}"
             href="${doc.url}"
             ${doc.fileType !== 'pdf' ? 'target="_blank" rel="noopener noreferrer"' : ''}
             data-filetype="${doc.fileType}"
             data-title="${doc.title}"
             aria-label="${doc.fileType === 'pdf' ? 'Abrir ' + doc.title + ' como flipbook interactivo' : 'Abrir ' + doc.title + ' (' + doc.sizeLabel + ')'}">
            <span class="dl__icon" data-type="${doc.fileType}" aria-hidden="true">
              ${doc.fileType.toUpperCase()}
            </span>
            <span class="dl__info">
              <span class="dl__name">${doc.title}</span>
              <span class="dl__sub">${doc.subtitle}</span>
            </span>
            <span class="dl__meta" aria-label="${doc.sizeLabel}">
              <span class="dl__size">${doc.sizeLabel}</span>
              ${doc.fileType === 'pdf'
      ? `<span class="dl__badge-flip" aria-hidden="true">Flipbook</span>`
      : ''}
              <svg class="dl__arrow" width="16" height="16" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" stroke-width="1.7"
                   stroke-linecap="round" aria-hidden="true">
                ${doc.fileType === 'pdf'
      ? '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>'
      : '<path d="M7 17L17 7M17 7H7M17 7v10"/>'}
              </svg>
            </span>
          </a>
        </li>
      `).join('')}
    </ul>
  `;

  // ── Interceptar clics en PDFs → abrir flipbook ──────────────────────────────────
  section.querySelectorAll<HTMLAnchorElement>('.dl__row--flipbook').forEach(anchor => {
    anchor.addEventListener('click', (e: MouseEvent) => {
      e.preventDefault();
      const url = anchor.getAttribute('href') ?? '';
      const title = anchor.dataset.title ?? 'Documento';
      openPdfFlipbook(url, title);
    });
  });

  return section;
}

// ─── CSS ───────────────────────────────────────────────────────────────
const DOC_CSS = `
  .dl {
    padding: 0 var(--section-pad) var(--section-gap);
  }

  .dl__header {
    padding: var(--section-gap) 0 var(--s-5);
  }

  .dl__eyebrow {
    display: block;
    font-size: var(--t-xs);
    font-weight: 600;
    letter-spacing: .16em;
    text-transform: uppercase;
    color: var(--ink-40);
    margin-bottom: var(--s-1);
  }

  .dl__title {
    font-size: clamp(22px, 5vw, 28px);
    font-weight: 600;
    letter-spacing: -.02em;
    color: var(--ink);
    line-height: 1.15;
  }

  .dl__list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: var(--s-2);
  }

  .dl__row {
    min-height: var(--touch-min);
    display: flex;
    align-items: center;
    gap: var(--s-3);

    padding: var(--s-4) var(--s-4);
    border-radius: var(--r-md);
    background: var(--surface, #F3F2EF);
    border: 1px solid transparent;

    text-decoration: none;
    color: inherit;

    transition:
      background var(--t-fast),
      transform 160ms var(--ease-out),
      border-color 160ms ease,
      box-shadow 160ms ease;

    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }

  .dl__row:active {
    transform: scale(.98);
    background: var(--surface-2);
  }

  @media (hover: hover) and (pointer: fine) {
    .dl__row:hover {
      background: var(--brand-paper, #fff);
      border-color: rgba(var(--brand-accent-rgb, 200,169,110), 0.28);
      transform: translateX(4px);
      box-shadow: var(--shadow-sm), 0 0 0 1px rgba(var(--brand-accent-rgb, 200,169,110), 0.12);
    }

    .dl__row:hover .dl__arrow {
      transform: translate(2px, -2px);
      color: var(--brand-accent);
    }

    /* PDF flipbook rows: animamos el ícono como un libro abriéndose */
    .dl__row--flipbook:hover {
      transform: translateX(4px);
    }
    .dl__row--flipbook:hover .dl__arrow {
      transform: scale(1.15) rotate(10deg);
      color: var(--brand-accent);
    }
  }

  .dl__icon {
    flex-shrink: 0;
    width: 44px; height: 44px;
    border-radius: var(--r-sm);
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; font-weight: 700; letter-spacing: .04em;
  }

  /* Colores de tipos de archivo */
  .dl__icon[data-type="pdf"]  { background: rgba(229,67,46,.08);  color: #C9381D; }
  .dl__icon[data-type="pptx"] { background: rgba(208,79,26,.08);  color: #C84A1A; }
  .dl__icon[data-type="xlsx"] { background: rgba(33,130,80,.08);  color: #1A7A45; }
  .dl__icon[data-type="docx"] { background: rgba(25,100,200,.08); color: #1553A8; }

  .dl__info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .dl__name {
    font-size: var(--t-base);
    font-weight: 600;
    color: var(--ink);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .dl__sub {
    font-size: var(--t-xs);
    color: var(--ink-40);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .dl__meta {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: var(--s-2);
  }

  .dl__size {
    font-size: var(--t-xs);
    color: var(--ink-40);
    white-space: nowrap;
  }

  /* ── Flipbook badge (Ajustado al color de marca) ── */
  .dl__badge-flip {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: .1em;
    text-transform: uppercase;
    color: var(--brand-accent);
    background: rgba(var(--brand-accent-rgb, 200,169,110), 0.12);
    padding: 3px 6px;
    border-radius: 4px;
    white-space: nowrap;
    border: 1px solid rgba(var(--brand-accent-rgb, 200,169,110), 0.24);
  }

  .dl__arrow {
    color: var(--ink-16);
    transition: transform 200ms var(--ease-spring), color var(--t-fast);
    flex-shrink: 0;
  }
`;