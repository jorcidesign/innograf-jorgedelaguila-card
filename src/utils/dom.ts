// src/utils/dom.ts

/**
 * Inyecta un bloque CSS en <head> exactamente una vez.
 * Llamar ANTES de construir el innerHTML del componente
 * para evitar FOUC (Flash of Unstyled Content).
 *
 * @param css  - Texto CSS a inyectar
 * @param id   - Identificador único del bloque (evita duplicados)
 */
export function injectCSS(css: string, id: string): void {
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    // textContent es más rápido que innerHTML y evita parsing extra
    style.textContent = css;
    // insertBefore(, firstChild) garantiza que el CSS llega
    // antes de cualquier elemento del body, aunque el head esté vacío
    document.head.insertBefore(style, document.head.firstChild);
}

/**
 * Crea un elemento tipado con atributos opcionales.
 * Evita el repetido document.createElement + setAttribute.
 */
export function createElement<T extends keyof HTMLElementTagNameMap>(
    tag: T,
    attrs: Partial<Record<string, string>> = {},
    className?: string
): HTMLElementTagNameMap[T] {
    const el = document.createElement(tag);
    if (className) el.className = className;
    for (const [k, v] of Object.entries(attrs)) {
        if (v !== undefined) el.setAttribute(k, v);
    }
    return el;
}