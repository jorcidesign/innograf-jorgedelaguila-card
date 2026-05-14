// src/utils/loader.ts

export function mountLoader(): () => void {
    const style = document.createElement('style');
    style.id = '__loader-style';
    style.textContent = LOADER_CSS;
    document.head.appendChild(style);

    const loader = document.createElement('div');
    loader.id = '__loader';
    loader.innerHTML = `
    <div class="loader__inner">
      <svg class="loader__mark" width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect x="1" y="1" width="38" height="38" rx="10"
              stroke="rgba(200,169,110,.3)" stroke-width="1.5"/>
        <rect class="loader__ring" x="1" y="1" width="38" height="38" rx="10"
              stroke="#C8A96E" stroke-width="1.5"
              stroke-dasharray="140" stroke-dashoffset="140"
              fill="none"/>
        <text x="20" y="25" text-anchor="middle"
              font-family="'DM Sans', system-ui, sans-serif"
              font-size="13" font-weight="600" fill="#C8A96E"
              letter-spacing="-0.5">A</text>
      </svg>
      <span class="loader__label">Innograf</span>
    </div>
  `;
    document.body.appendChild(loader);

    // Animar el borde del ring
    requestAnimationFrame(() => {
        const ring = loader.querySelector<SVGRectElement>('.loader__ring');
        if (ring) ring.style.strokeDashoffset = '0';
    });

    // Retorna la función dismissLoader
    return function dismissLoader(): void {
        loader.classList.add('loader--exit');
        loader.addEventListener('transitionend', () => {
            loader.remove();
            style.remove();
        }, { once: true });
    };
}

const LOADER_CSS = `
  #__loader {
    position: fixed; inset: 0; z-index: 1000;
    display: flex; align-items: center; justify-content: center;
    background: #FAFAF8;
    transition: opacity 600ms cubic-bezier(.16,1,.3,1),
                transform 600ms cubic-bezier(.16,1,.3,1);
  }
  #__loader.loader--exit {
    opacity: 0;
    transform: scale(1.04);
  }
  .loader__inner {
    display: flex; flex-direction: column;
    align-items: center; gap: 16px;
  }
  .loader__mark {
    animation: loader-breathe 2s ease-in-out infinite;
  }
  .loader__ring {
    transition: stroke-dashoffset 1.2s cubic-bezier(.16,1,.3,1);
  }
  @keyframes loader-breathe {
    0%, 100% { transform: scale(1);    opacity: 1; }
    50%       { transform: scale(.95); opacity: .7; }
  }
  .loader__label {
    font-family: 'DM Sans', system-ui, sans-serif;
    font-size: 13px; font-weight: 500;
    letter-spacing: .12em; text-transform: uppercase;
    color: rgba(13,13,13,.4);
    animation: loader-label 1s ease both;
  }
  @keyframes loader-label {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;