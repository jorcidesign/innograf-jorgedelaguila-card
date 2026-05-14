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

function isMobileDevice(): boolean {
    const cssWidth = window.innerWidth;
    const screenCssWidth = window.screen.width / (window.devicePixelRatio || 1);
    const smallestWidth = Math.min(cssWidth, screenCssWidth);
    const hasTouchPrimary = window.matchMedia('(pointer: coarse)').matches;
    const isNarrow = smallestWidth < 900;
    return hasTouchPrimary || isNarrow;
}

function calcScale(pageW: number, pageH: number): number {
    const TOPBAR_H = 52;
    const isMobile = isMobileDevice();
    const PAD_H = isMobile ? 4 : 16;
    const PAD_V = isMobile ? 8 : 24;

    const availW = window.innerWidth - PAD_H * 2;
    const availH = window.innerHeight - TOPBAR_H - PAD_V * 2;

    const scaleW = availW / pageW;
    const scaleH = availH / pageH;
    return Math.min(scaleW, scaleH, 2);
}

// ─── Zoom state ───────────────────────────────────────────────────────────────
const ZOOM_MIN = 1;
const ZOOM_MAX = 3;
const ZOOM_STEP = 0.25;

// ─── Main export ─────────────────────────────────────────────────────────────
export async function openPdfFlipbook(pdfUrl: string, title: string): Promise<void> {
    injectCSS(MODAL_CSS, '__css-pdf-flipbook');

    const mobile = isMobileDevice();

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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <span class="pfm__pager">—</span>
          <button class="pfm__btn pfm__btn--next" aria-label="Página siguiente" disabled>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
          <button class="pfm__btn pfm__btn--zoom-out" aria-label="Reducir zoom" disabled>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
          </button>
          <span class="pfm__zoom-label">100%</span>
          <button class="pfm__btn pfm__btn--zoom-in" aria-label="Aumentar zoom" disabled>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
          </button>
          <button class="pfm__btn pfm__btn--dl" aria-label="Descargar PDF">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </button>
          <button class="pfm__btn pfm__btn--close" aria-label="Cerrar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </header>

      <div class="pfm__stage">
        <div class="pfm__loader">
          <div class="pfm__spinner"></div>
          <span class="pfm__loader-msg">Cargando…</span>
        </div>
        <div class="pfm__book-wrap" hidden>
          <!-- ESTRUCTURA CORREGIDA: Espaciador + Escalador -->
          <div class="pfm__zoom-spacer">
            <div class="pfm__zoom-scaler">
              <!-- book se monta aquí -->
            </div>
          </div>
        </div>
        <div class="pfm__error" hidden>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <p class="pfm__error-msg">No se pudo cargar el PDF.<br>Puede estar bloqueado por CORS.</p>
          <a class="pfm__error-dl" href="${pdfUrl}" target="_blank" rel="noopener noreferrer">Descargar PDF</a>
        </div>
      </div>

    </div>
  `;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('pfm__overlay--open'));

    // ── Refs ──────────────────────────────────────────────────────────────────────
    const loader = overlay.querySelector<HTMLElement>('.pfm__loader')!;
    const bookWrap = overlay.querySelector<HTMLElement>('.pfm__book-wrap')!;
    const zoomSpacer = overlay.querySelector<HTMLElement>('.pfm__zoom-spacer')!;
    const zoomScaler = overlay.querySelector<HTMLElement>('.pfm__zoom-scaler')!;
    const errorEl = overlay.querySelector<HTMLElement>('.pfm__error')!;
    const loaderMsg = overlay.querySelector<HTMLElement>('.pfm__loader-msg')!;
    const pager = overlay.querySelector<HTMLElement>('.pfm__pager')!;
    const btnPrev = overlay.querySelector<HTMLButtonElement>('.pfm__btn--prev')!;
    const btnNext = overlay.querySelector<HTMLButtonElement>('.pfm__btn--next')!;
    const btnDl = overlay.querySelector<HTMLButtonElement>('.pfm__btn--dl')!;
    const btnClose = overlay.querySelector<HTMLButtonElement>('.pfm__btn--close')!;
    const btnZoomIn = overlay.querySelector<HTMLButtonElement>('.pfm__btn--zoom-in')!;
    const btnZoomOut = overlay.querySelector<HTMLButtonElement>('.pfm__btn--zoom-out')!;
    const zoomLabel = overlay.querySelector<HTMLElement>('.pfm__zoom-label')!;

    // ── Zoom logic ────────────────────────────────────────────────────────────────
    let currentZoom = 1;
    let baseW = 0;
    let baseH = 0;

    /**
     * Lógica de zoom corregida:
     * 1. Aumentamos físicamente el `zoomSpacer` para generar los scrollbars nativos.
     * 2. Aplicamos la transformación desde el centro al `zoomScaler`.
     */
    function applyZoom(zoom: number, animate = true) {
        if (baseW === 0 || baseH === 0) return;

        const prevZoom = currentZoom;
        currentZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom));

        // Centro actual de visualización
        const wrapW = bookWrap.clientWidth;
        const wrapH = bookWrap.clientHeight;
        const scrollCenterX = bookWrap.scrollLeft + wrapW / 2;
        const scrollCenterY = bookWrap.scrollTop + wrapH / 2;

        // Toggle animaciones (desactivar durante wheel/touch para no causar lag)
        zoomSpacer.style.transition = animate ? 'width 180ms ease, height 180ms ease' : 'none';
        zoomScaler.style.transition = animate ? 'transform 180ms ease' : 'none';

        // Expandir el contenedor físicamente para que el scroll funcione
        zoomSpacer.style.width = `${baseW * currentZoom}px`;
        zoomSpacer.style.height = `${baseH * currentZoom}px`;

        // Aplicar el escalado visual al centro
        zoomScaler.style.transform = `scale(${currentZoom})`;

        zoomLabel.textContent = `${Math.round(currentZoom * 100)}%`;
        btnZoomOut.disabled = currentZoom <= ZOOM_MIN;
        btnZoomIn.disabled = currentZoom >= ZOOM_MAX;

        // Calcular nuevo offset de scroll y aplicarlo en el siguiente tick para que el DOM se haya actualizado
        const ratio = currentZoom / prevZoom;
        requestAnimationFrame(() => {
            bookWrap.scrollLeft = scrollCenterX * ratio - wrapW / 2;
            bookWrap.scrollTop = scrollCenterY * ratio - wrapH / 2;
        });
    }

    btnZoomIn.addEventListener('click', () => applyZoom(currentZoom + ZOOM_STEP, true));
    btnZoomOut.addEventListener('click', () => applyZoom(currentZoom - ZOOM_STEP, true));

    // Pinch-to-zoom 
    let pinchStartDist = 0;
    let pinchStartZoom = 1;

    bookWrap.addEventListener('touchstart', (e: TouchEvent) => {
        if (e.touches.length === 2) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            pinchStartDist = Math.sqrt(dx * dx + dy * dy);
            pinchStartZoom = currentZoom;
        }
    }, { passive: true });

    bookWrap.addEventListener('touchmove', (e: TouchEvent) => {
        if (e.touches.length === 2) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const ratio = dist / pinchStartDist;
            applyZoom(pinchStartZoom * ratio, false); // Sin animar para máxima fluidez
        }
    }, { passive: true });

    // Wheel zoom (Desktop con Ctrl/Cmd)
    bookWrap.addEventListener('wheel', (e: WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
            applyZoom(currentZoom + delta, false);
        }
    }, { passive: false });

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
        if (e.key === '+' || e.key === '=') applyZoom(currentZoom + ZOOM_STEP, true);
        if (e.key === '-') applyZoom(currentZoom - ZOOM_STEP, true);
        if (e.key === '0') applyZoom(1, true);
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

        const firstPage = await pdfDoc.getPage(1);
        const baseVp = firstPage.getViewport({ scale: 1 });
        const SCALE = calcScale(baseVp.width, baseVp.height);

        // Guardamos las dimensiones base calculadas para usarlas en el zoom y en el constructor de page-flip
        baseW = baseVp.width * SCALE;
        baseH = baseVp.height * SCALE;

        // Inicializamos los contenedores de zoom con las medidas exactas
        zoomSpacer.style.width = `${baseW}px`;
        zoomSpacer.style.height = `${baseH}px`;
        zoomScaler.style.width = `${baseW}px`;
        zoomScaler.style.height = `${baseH}px`;

        const pages: HTMLCanvasElement[] = [];

        // Multiplicador para pantallas de alta densidad (Retina, Smartphones) 
        // Soluciona el texto borroso
        const dpr = window.devicePixelRatio || 1;

        for (let i = 1; i <= numPages; i++) {
            loaderMsg.textContent = `Procesando página ${i} de ${numPages}…`;
            const page = i === 1 ? firstPage : await pdfDoc.getPage(i);
            const vp = page.getViewport({ scale: SCALE });

            const canvas = document.createElement('canvas');
            canvas.className = 'pfm__page';

            // Resolución física vs tamaño lógico CSS
            canvas.width = vp.width * dpr;
            canvas.height = vp.height * dpr;
            canvas.style.width = `${vp.width}px`;
            canvas.style.height = `${vp.height}px`;

            const ctx = canvas.getContext('2d')!;
            ctx.scale(dpr, dpr);

            await page.render({ canvasContext: ctx, viewport: vp }).promise;
            pages.push(canvas);
        }

        // ── Mount PageFlip ────────────────────────────────────────────────────────────
        const bookEl = document.createElement('div');
        bookEl.className = 'pfm__book';
        pages.forEach(c => bookEl.appendChild(c));
        zoomScaler.appendChild(bookEl);

        flipInstance = new pageFlipModule.PageFlip(bookEl, {
            width: baseW,
            height: baseH,
            // FIX: "fixed" en vez de "stretch". Stretch colapsa dentro del contenedor flex.
            size: 'fixed',
            usePortrait: true,
            showCover: false,
            mobileScrollSupport: false,
            clickEventForward: true,
            autoSize: false, // Desactivado para controlar nosotros las dimensiones
            flippingTime: mobile ? 400 : 620,
            useMouseEvents: true,
            swipeDistance: mobile ? 30 : 40,
            startZIndex: 10,
            drawShadow: !mobile,
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

        btnZoomIn.disabled = false;
        btnZoomOut.disabled = true;

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
    box-shadow: 0 0 0 1px rgba(255,255,255,.07), 0 40px 120px rgba(0,0,0,.75);
    transform: translateY(20px) scale(.97);
    transition: transform 320ms cubic-bezier(.16,1,.3,1);
  }
  .pfm__overlay--open .pfm__shell {
    transform: translateY(0) scale(1);
  }

  @media (max-width: 639px), (pointer: coarse) and (max-width: 899px) {
    .pfm__shell {
      width: 100vw;
      height: 100dvh;
      border-radius: 0;
      transform: translateY(32px) scale(1);
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
  .pfm__zoom-label {
    font-size: 11px; color: rgba(255,255,255,.35);
    white-space: nowrap; min-width: 36px; text-align: center;
    font-variant-numeric: tabular-nums;
  }
  @media (max-width: 380px) {
    .pfm__zoom-label { display: none; }
  }

  /* ── Buttons ── */
  .pfm__btn {
    width: 34px; height: 34px; border: none;
    background: transparent; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    color: rgba(255,255,255,.52); cursor: pointer;
    transition: background 130ms, color 130ms, transform 90ms;
    -webkit-tap-highlight-color: transparent; touch-action: manipulation;
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
  .pfm__loader { display: flex; flex-direction: column; align-items: center; gap: 14px; }
  .pfm__spinner {
    width: 32px; height: 32px; border: 2px solid rgba(255,255,255,.1);
    border-top-color: var(--accent, #7C8FF0); border-radius: 50%;
    animation: pfm-spin 600ms linear infinite;
  }
  @keyframes pfm-spin { to { transform: rotate(360deg); } }
  .pfm__loader-msg { font-size: 13px; color: rgba(255,255,255,.36); text-align: center; }

  /* ── Book wrap (Scroll Container) ── */
  .pfm__book-wrap {
    width: 100%; height: 100%;
    overflow: auto; /* Permitir scroll nativo */
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  .pfm__book-wrap::-webkit-scrollbar { display: none; }

  /* ── Zoom Spacer (Crea el espacio físico) ── */
  .pfm__zoom-spacer {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 100%;
    min-height: 100%;
    /* La transición física se inyecta via JS para controlarla */
  }

  /* ── Zoom Scaler (Aplica el tamaño visual real) ── */
  .pfm__zoom-scaler {
    transform-origin: center center;
    will-change: transform;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .pfm__page { display: block; }
  .pfm__page--blank { background: #fff; }

  /* ── Error ── */
  .pfm__error { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 32px 24px; text-align: center; color: rgba(255,255,255,.48); }
  .pfm__error svg    { color: rgba(229,67,46,.6); }
  .pfm__error-msg    { font-size: 14px; line-height: 1.7; }
  .pfm__error-dl {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 11px 22px; border-radius: 8px;
    background: var(--accent, #7C8FF0);
    color: #fff; font-size: 13px; font-weight: 500; text-decoration: none;
    transition: opacity 130ms;
  }
  .pfm__error-dl:hover { opacity: .8; }
`;