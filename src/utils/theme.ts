// src/utils/theme.ts
import type { ThemeConfig } from '../types/card.types';

/**
 * Convierte Hex (#FFFFFF) a formato RGB (255, 255, 255)
 */
function hexToRgb(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
}

export function applyTheme(theme: ThemeConfig): void {
    const root = document.documentElement.style;

    // Variables de color directo
    root.setProperty('--brand-primary', theme.primaryColor);
    root.setProperty('--brand-accent', theme.accentColor);
    root.setProperty('--brand-paper', theme.paperColor);
    root.setProperty('--brand-ink', theme.inkColor);
    root.setProperty('--brand-gradient', theme.primaryGradient);

    // Variables RGB para soporte de opacidad en CSS
    // Uso: rgba(var(--brand-primary-rgb), 0.1)
    root.setProperty('--brand-primary-rgb', hexToRgb(theme.primaryColor));
    root.setProperty('--brand-accent-rgb', hexToRgb(theme.accentColor));
    root.setProperty('--brand-paper-rgb', hexToRgb(theme.paperColor));
    root.setProperty('--brand-ink-rgb', hexToRgb(theme.inkColor));
}