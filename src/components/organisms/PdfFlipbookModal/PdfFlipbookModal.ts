import { injectCSS } from '../../../utils/dom';

// ─── CDN URLs ────────────────────────────────────────────────────────────────
const PDFJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs';
const PDFJS_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs';

// ─── Types ───────────────────────────────────────────────────────────────────
interface PDFjsLib {
    getDocument: (params: { url: string; withCredentials: boolean }) => { promise: Promise<PDFDocumentProxy> };
    GlobalWorkerOptions: { workerSrc: string };
}

interface PDFDocumentProxy {
    numPages: number;
    getPage: (n: number) => Promise<PDFPageProxy>;
}

interface PDFPageProxy {
    getViewport: (opts: { scale: number }) => { width: number; height: number };
    render: (ctx: { canvasContext: CanvasRenderingContext2D; viewport: unknown }) => { promise: Promise<void> };
}

interface PageFlipInstance {
    loadFromHTML: (els: Element[]) => void;
    destroy: () => void;
    flipNext: () => void;
    flipPrev: () => void;
    getCurrentPageIndex: () => number;
    getPageCount: () => number;
    on: (event: string, cb: (e: { data: number }) => void) => void;
}

interface PageFlipModule {
    PageFlip: new (el: HTMLElement, opts: Record<string, unknown>) => PageFlipInstance;
}

// ─── Singleton loaders ───────────────────────────────────────────────────────
let pdfjsPromise: Promise<PDFjsLib> | null = null;
let pageFlipPromise: Promise<PageFlipModule> | null = null;

function loadPdfJs(): Promise<PDFjsLib> {
    if (pdfjsPromise) return pdfjsPromise;
    pdfjsPromise = import(/* @vite-ignore */ PDFJS_CDN) as Promise<PDFjsLib>;
    return pdfjsPromise;
}

function loadPageFlip(): Promise<PageFlipModule> {
    if (pageFlipPromise) return pageFlipPromise;
    pageFlipPromise = import('page-flip') as Promise<PageFlipModule>;
    return pageFlipPromise;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Calcula el scale de pdf.js para UNA SOLA PÁGINA centrada.
 */
function calcScale(): number {
    const TOPBAR_H = 52;
    const isMobile = window.innerWidth < 640;
    const PAD_H = isMobile ? 8 : 16;
    const PAD_V = isMobile ? 12 : 24;

    const availW = window.innerWidth - PAD_H * 2;
    const availH = window.innerHeight - TOPBAR_H - PAD_V * 2;

    // A4 base a 72 dpi: 595 × 842 pts
    const scaleW = availW / 595;
    const scaleH = availH / 842;
    return Math.min(scaleW, scaleH, 2); // cap 2× para nitidez máxima
}

// ─── Main export ─────────────────────────────────────────────────────────────
export async function openPdfFlipbook(pdfUrl: string, title: string): Promise<void> {
    injectCSS(MODAL_CSS, '__css-pdf-flipbook');

    // ── DOM shell ─────────────────────────────────────────────────────────────────
    const overlay = document.createElement('div');
    overlay.className = 'pfm__overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', `Flipbook: ${title}`);

    overlay.innerHTML = `
    <div class="pfm__backdrop"></div>
    <div class="pfm__shell">

      <header class="pfm__topbar">
        <span class="pfm__doc-title">${title}</span>
        <div class="pfm__controls">
          <button class="pfm__btn pfm__btn--prev" aria-label="Página anterior" disabled>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          <span class="pfm__pager">—</span>
          <button class="pfm__btn pfm__btn--next" aria-label="Página siguiente" disabled>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
          <button class="pfm__btn pfm__btn--dl" aria-label="Descargar PDF">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </button>
          <button class="pfm__btn pfm__btn--close" aria-label="Cerrar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </header>

      <div class="pfm__stage">
        <div class="pfm__loader">
          <div class="pfm__spinner"></div>
          <span class="pfm__loader-msg">Cargando…</span>
        </div>
        <div class="pfm__book-wrap" hidden></div>
        <div class="pfm__error" hidden>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p class="pfm__error-msg">No se pudo cargar el PDF.<br>Puede estar bloqueado por CORS.</p>
          <a class="pfm__error-dl" href="${pdfUrl}" target="_blank" rel="noopener noreferrer">
            Descargar PDF
          </a>
        </div>
      </div>

    </div>
  `;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('pfm__overlay--open'));

    // ── Refs ──────────────────────────────────────────────────────────────────────
    const loader = overlay.querySelector<HTMLElement>('.pfm__loader')!;
    const bookWrap = overlay.querySelector<HTMLElement>('.pfm__book-wrap')!;
    const errorEl = overlay.querySelector<HTMLElement>('.pfm__error')!;
    const loaderMsg = overlay.querySelector<HTMLElement>('.pfm__loader-msg')!;
    const pager = overlay.querySelector<HTMLElement>('.pfm__pager')!;
    const btnPrev = overlay.querySelector<HTMLButtonElement>('.pfm__btn--prev')!;
    const btnNext = overlay.querySelector<HTMLButtonElement>('.pfm__btn--next')!;
    const btnDl = overlay.querySelector<HTMLButtonElement>('.pfm__btn--dl')!;
    const btnClose = overlay.querySelector<HTMLButtonElement>('.pfm__btn--close')!;

    // ── Close ─────────────────────────────────────────────────────────────────────
    let flipInstance: PageFlipInstance | null = null;

    function close() {
        document.removeEventListener('keydown', onKey);
        overlay.classList.remove('pfm__overlay--open');
        overlay.addEventListener('transitionend', () => {
            flipInstance?.destroy();
            overlay.remove();
        }, { once: true });
    }

    function onKey(e: KeyboardEvent) {
        if (e.key === 'Escape') close();
        if (e.key === 'ArrowRight') flipInstance?.flipNext();
        if (e.key === 'ArrowLeft') flipInstance?.flipPrev();
    }

    btnClose.addEventListener('click', close);
    overlay.querySelector('.pfm__backdrop')!.addEventListener('click', close);
    btnDl.addEventListener('click', () => window.open(pdfUrl, '_blank', 'noopener,noreferrer'));
    document.addEventListener('keydown', onKey);

    // ── Load + render ─────────────────────────────────────────────────────────────
    try {
        loaderMsg.textContent = 'Cargando librerías…';
        const [pdfjs, pageFlipModule] = await Promise.all([loadPdfJs(), loadPageFlip()]);

        pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;

        loaderMsg.textContent = 'Abriendo documento…';
        const pdfDoc = await pdfjs.getDocument({ url: pdfUrl, withCredentials: false }).promise;
        const numPages = pdfDoc.numPages;
        const SCALE = calcScale();
        const pages: HTMLCanvasElement[] = [];

        for (let i = 1; i <= numPages; i++) {
            loaderMsg.textContent = `Procesando página ${i} de ${numPages}…`;
            const page = await pdfDoc.getPage(i);
            const vp = page.getViewport({ scale: SCALE });
            const canvas = document.createElement('canvas');
            canvas.width = vp.width;
            canvas.height = vp.height;
            canvas.className = 'pfm__page';
            await page.render({ canvasContext: canvas.getContext('2d')!, viewport: vp }).promise;
            pages.push(canvas);
        }

        // ── Mount PageFlip ────────────────────────────────────────────────────────────
        const bookEl = document.createElement('div');
        bookEl.className = 'pfm__book';
        pages.forEach(c => bookEl.appendChild(c));
        bookWrap.appendChild(bookEl);

        const pageW = pages[0].width;
        const pageH = pages[0].height;
        flipInstance = new pageFlipModule.PageFlip(bookEl, {
            width: pageW,
            height: pageH,
            size: 'stretch', // <--- CAMBIA 'fit' a 'stretch'

            // Forza SIEMPRE una sola página sin importar el dispositivo
            usePortrait: true,

            minWidth: Math.round(pageW * 0.5),
            maxWidth: pageW,
            minHeight: Math.round(pageH * 0.5),
            maxHeight: pageH,

            showCover: false, // Evita comportamientos raros en la primera página
            mobileScrollSupport: false,
            clickEventForward: true,
            autoSize: true,
            flippingTime: 620,
            useMouseEvents: true,
            swipeDistance: 40,
            startZIndex: 10,
            drawShadow: true,
            maxShadowOpacity: 0.32,
        });
        flipInstance.loadFromHTML(pages);

        // ── Pager ─────────────────────────────────────────────────────────────────────
        function updatePager() {
            if (!flipInstance) return;
            const cur = flipInstance.getCurrentPageIndex();
            const total = flipInstance.getPageCount();
            pager.textContent = `${cur + 1} / ${total}`;
            btnPrev.disabled = cur === 0;
            btnNext.disabled = cur >= total - 1;
        }

        flipInstance.on('flip', updatePager);
        updatePager();
        btnPrev.addEventListener('click', () => flipInstance?.flipPrev());
        btnNext.addEventListener('click', () => flipInstance?.flipNext());
        btnPrev.disabled = false;
        btnNext.disabled = false;

        loader.hidden = true;
        bookWrap.hidden = false;
    } catch (err) {
        console.error('[PdfFlipbook]', err);
        document.removeEventListener('keydown', onKey);
        loader.hidden = true;
        errorEl.hidden = false;
    }
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const MODAL_CSS = `
  /* ── Fix global para el atributo hidden ── */
  .pfm__shell [hidden] {
    display: none !important;
  }

  /* ── Overlay ── */
  .pfm__overlay {
    position: fixed;
    inset: 0;
    z-index: 9000;
    display: flex; align-items: center; justify-content: center;
    opacity: 0;
    transition: opacity 260ms cubic-bezier(.16,1,.3,1);
    pointer-events: none;
  }
  .pfm__overlay--open {
    opacity: 1;
    pointer-events: auto;
  }

  /* ── Backdrop ── */
  .pfm__backdrop {
    position: absolute; inset: 0;
    background: rgba(10,10,12,.86);
    backdrop-filter: blur(14px) saturate(1.4);
    -webkit-backdrop-filter: blur(14px) saturate(1.4);
  }

  /* ── Shell ── */
  .pfm__shell {
    position: relative;
    z-index: 1;
    width: min(96vw, 1100px);
    height: 94vh;
    display: flex; flex-direction: column;
    border-radius: 14px;
    overflow: hidden;
    background: #0f0f12;
    box-shadow:
      0 0 0 1px rgba(255,255,255,.07),
      0 40px 120px rgba(0,0,0,.75);
    transform: translateY(20px) scale(.97);
    transition: transform 320ms cubic-bezier(.16,1,.3,1);
  }
  .pfm__overlay--open .pfm__shell {
    transform: translateY(0) scale(1);
  }

  /* ── Mobile: full-screen como bottom sheet ── */
  @media (max-width: 639px) {
    .pfm__shell {
      width: 100vw;
      height: 100dvh;
      border-radius: 0;
      transform: translateY(32px) scale(1);
    }
    .pfm__overlay--open .pfm__shell {
      transform: translateY(0) scale(1);
    }
  }

  /* ── Topbar ── */
  .pfm__topbar {
    flex-shrink: 0;
    height: 52px;
    display: flex; align-items: center; justify-content: space-between;
    gap: 12px;
    padding: 0 12px;
    background: rgba(255,255,255,.04);
    border-bottom: 1px solid rgba(255,255,255,.08);
  }
  .pfm__doc-title {
    font-size: 13px; font-weight: 500;
    color: rgba(255,255,255,.62);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    flex: 1; min-width: 0;
  }
  .pfm__controls {
    display: flex; align-items: center; gap: 4px;
    flex-shrink: 0;
  }
  .pfm__pager {
    font-size: 12px; color: rgba(255,255,255,.35);
    white-space: nowrap; min-width: 48px; text-align: center;
  }

  /* ── Buttons ── */
  .pfm__btn {
    width: 34px; height: 34px;
    border: none;
    background: transparent; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    color: rgba(255,255,255,.52);
    cursor: pointer;
    transition: background 130ms, color 130ms, transform 90ms;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }
  .pfm__btn:hover  { background: rgba(255,255,255,.09); color: #fff; }
  .pfm__btn:active { transform: scale(.88); }
  .pfm__btn:disabled { opacity: .22; cursor: default; pointer-events: none; }
  .pfm__btn--dl    { color: var(--accent, #7C8FF0); }
  .pfm__btn--close:hover { background: rgba(229,67,46,.18); color: #E5432E; }

  /* ── Stage ── */
  .pfm__stage {
    flex: 1; min-height: 0;
    overflow: hidden;
    display: flex; align-items: center; justify-content: center;
    padding: 12px 8px;
  }
  @media (min-width: 640px) {
    .pfm__stage { padding: 24px 16px; }
  }

  /* ── Loader ── */
  .pfm__loader {
    display: flex; flex-direction: column;
    align-items: center; gap: 14px;
  }
  .pfm__spinner {
    width: 32px; height: 32px;
    border: 2px solid rgba(255,255,255,.1);
    border-top-color: var(--accent, #7C8FF0);
    border-radius: 50%;
    animation: pfm-spin 600ms linear infinite;
  }
  @keyframes pfm-spin { to { transform: rotate(360deg); } }
  .pfm__loader-msg {
    font-size: 13px; color: rgba(255,255,255,.36);
    text-align: center;
  }

  /* ── Book wrap ── */
  .pfm__book-wrap {
    width: 100%;
    height: 100%;
    display: flex; align-items: center; justify-content: center;
    overflow: hidden;
  }
  .pfm__page { display: block; }
  .pfm__page--blank { background: #fff; }

  /* ── Error ── */
  .pfm__error {
    display: flex;
    flex-direction: column; align-items: center;
    gap: 16px; padding: 32px 24px; text-align: center;
    color: rgba(255,255,255,.48);
  }
  .pfm__error svg    { color: rgba(229,67,46,.6); }
  .pfm__error-msg    { font-size: 14px; line-height: 1.7; }
  .pfm__error-dl {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 11px 22px; border-radius: 8px;
    background: var(--accent, #7C8FF0);
    color: #fff; font-size: 13px; font-weight: 500;
    text-decoration: none;
    transition: opacity 130ms;
  }
  .pfm__error-dl:hover { opacity: .8; }
`;