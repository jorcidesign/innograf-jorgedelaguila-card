// src/components/atoms/Button/Button.ts

export type ButtonVariant = 'primary' | 'ghost' | 'icon';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
    label: string;
    variant?: ButtonVariant;
    size?: ButtonSize;
    icon?: string;           // SVG string inline
    href?: string;           // Si se provee, renderiza como <a>
    onClick?: () => void;
    ariaLabel?: string;
}

// Inyecta el CSS exactamente una vez en el <head>
let cssInjected = false;
function injectButtonCSS(): void {
    if (cssInjected) return;
    cssInjected = true;
    const style = document.createElement('style');
    style.textContent = BUTTON_CSS;
    document.head.appendChild(style);
}

// Factory function — retorna un HTMLElement listo para montar
export function Button(props: ButtonProps): HTMLElement {
    injectButtonCSS();

    const {
        label,
        variant = 'primary',
        size = 'md',
        icon,
        href,
        onClick,
        ariaLabel,
    } = props;

    const tag = href ? 'a' : 'button';
    const el = document.createElement(tag) as HTMLButtonElement | HTMLAnchorElement;

    el.className = [
        'btn',
        `btn--${variant}`,
        `btn--${size}`,
        icon && !label ? 'btn--icon-only' : '',
    ].filter(Boolean).join(' ');

    el.setAttribute('aria-label', ariaLabel ?? label);

    if (href && el instanceof HTMLAnchorElement) {
        el.href = href;
        el.target = '_blank';
        el.rel = 'noopener noreferrer';
    }

    // Inner HTML: icono + label
    el.innerHTML = `
    ${icon ? `<span class="btn__icon" aria-hidden="true">${icon}</span>` : ''}
    ${label ? `<span class="btn__label">${label}</span>` : ''}
  `;

    if (onClick) {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            // Micro-interacción: ripple effect
            triggerRipple(el as HTMLElement, e as MouseEvent);
            onClick();
        });
    }

    return el;
}

function triggerRipple(el: HTMLElement, e: MouseEvent): void {
    const ripple = document.createElement('span');
    ripple.className = 'btn__ripple';
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    ripple.style.cssText = `
    width: ${size}px; height: ${size}px;
    left: ${e.clientX - rect.left - size / 2}px;
    top:  ${e.clientY - rect.top - size / 2}px;
  `;
    el.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
}

// CSS encapsulado dentro del módulo TS
const BUTTON_CSS = `
  .btn {
    --btn-radius: 50px;
    position: relative; overflow: hidden;
    display: inline-flex; align-items: center; justify-content: center;
    gap: 8px;
    font-family: var(--font-sans, 'Inter', system-ui, sans-serif);
    font-weight: 500; letter-spacing: -0.01em;
    border: none; cursor: pointer;
    text-decoration: none;
    transition: transform 180ms cubic-bezier(.22,1,.36,1),
                background 200ms ease,
                box-shadow 200ms ease,
                opacity 200ms ease;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
  }

  /* Sizes */
  .btn--sm  { padding: 8px 16px;  font-size: 13px; height: 36px; }
  .btn--md  { padding: 12px 24px; font-size: 14px; height: 44px; }
  .btn--lg  { padding: 14px 32px; font-size: 15px; height: 52px; }
  .btn--icon-only.btn--md { padding: 0; width: 44px; height: 44px; border-radius: 50%; }
  .btn--icon-only.btn--lg { padding: 0; width: 52px; height: 52px; border-radius: 50%; }

  /* Primary */
  .btn--primary {
    background: var(--color-ink, #111);
    color: var(--color-paper, #fff);
    border-radius: var(--btn-radius);
    box-shadow: 0 1px 3px rgba(0,0,0,.12);
  }
  .btn--primary:hover  { background: #333; box-shadow: 0 4px 12px rgba(0,0,0,.18); transform: translateY(-1px); }
  .btn--primary:active { transform: scale(.97) translateY(0); }

  /* Ghost */
  .btn--ghost {
    background: transparent;
    color: var(--color-ink, #111);
    border: 1.5px solid rgba(0,0,0,.15);
    border-radius: var(--btn-radius);
  }
  .btn--ghost:hover  { border-color: rgba(0,0,0,.4); background: rgba(0,0,0,.04); transform: translateY(-1px); }
  .btn--ghost:active { transform: scale(.97); }

  /* Icon */
  .btn--icon {
    background: var(--color-surface, #f4f4f2);
    color: var(--color-ink, #111);
    border-radius: 50%;
    flex-direction: column;
    gap: 4px;
    font-size: 11px;
    padding: 12px;
    height: auto;
    width: auto;
    min-width: 64px;
  }
  .btn--icon:hover  { background: var(--color-accent, #C8A96E); color: #fff; transform: translateY(-2px); }
  .btn--icon:active { transform: scale(.95); }

  .btn__icon  { display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .btn__label { white-space: nowrap; }

  /* Ripple */
  .btn__ripple {
    position: absolute; border-radius: 50%;
    background: rgba(255,255,255,.25);
    transform: scale(0);
    animation: btn-ripple 500ms ease-out forwards;
    pointer-events: none;
  }
  @keyframes btn-ripple { to { transform: scale(1); opacity: 0; } }
`;