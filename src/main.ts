// src/main.ts — v3.1 (Asto Studio Orchestrator Architecture - Socials Fixed)

// ── 1. Estilos Globales (El orden importa para Vite) ──────────────────
import './design-system/tokens.css';
import './design-system/global.css';
import './design-system/animations.css';

// ── 2. Datos y Utilidades ─────────────────────────────────────────────
import { innografCard } from './data/innograf';
import { applyTheme } from './utils/theme';
import { mountLoader } from './utils/loader';
import { initScrollAnimations } from './utils/scroll-observer';

// ── 3. Componentes Estáticos (Fijos por UX) ───────────────────────────
import { HeroCover } from './components/organisms/HeroCover/HeroCover';
import { ActionGroup } from './components/molecules/ActionGroup/ActionGroup';
import { FooterShare } from './components/organisms/FooterShare/FooterShare';

// ── 4. Componentes Dinámicos (Orquestados) ────────────────────────────
import { SocialLinks } from './components/organisms/SocialLinks/SocialLinks'; // <-- Movido aquí
import { ClientsGrid } from './components/organisms/ClientsGrid/ClientsGrid';
import { ServicesPanel } from './components/organisms/ServicesPanel/ServicesPanel';
import { DocumentList } from './components/organisms/DocumentList/DocumentList';
import { MediaGallery } from './components/organisms/MediaGallery/MediaGallery';

// ── 5. Registro del Orquestador ───────────────────────────────────────
const DYNAMIC_SECTIONS: Record<string, (profile: any) => HTMLElement> = {
  socials: SocialLinks, // <-- AÑADIDO AL ORQUESTADOR
  clients: ClientsGrid,
  services: ServicesPanel,
  documents: DocumentList,
  multimedia: MediaGallery,
};

// ── 6. Inicialización Temprana ────────────────────────────────────────
applyTheme(innografCard.company.theme);
const dismissLoader = mountLoader();
const startTime = Date.now();

// ── 7. Construcción del DOM ───────────────────────────────────────────
const app = document.getElementById('app');
if (!app) throw new Error('[Asto Studio] Elemento #app no encontrado.');

const fragment = document.createDocumentFragment();

// A. Bloque Superior Estático
// Quitamos SocialLinks de aquí para que el orquestador lo ubique dinámicamente
fragment.append(
  HeroCover(innografCard),
  ActionGroup(innografCard)
);

// B. Motor de Secciones Dinámicas
const { config } = innografCard;
if (config && config.sections) {
  Object.entries(config.sections)
    // 1. Ordenar según el "order" definido en la data
    .sort(([, a], [, b]) => a.order - b.order)
    // 2. Filtrar: ¿Está visible? ¿Existe el array de datos y tiene elementos?
    .filter(([id, sectionConfig]) => {
      const data = (innografCard as any)[id];
      const hasData = Array.isArray(data) ? data.length > 0 : !!data;
      return sectionConfig.visible && hasData;
    })
    // 3. Renderizar y añadir al fragmento
    .forEach(([id]) => {
      const builder = DYNAMIC_SECTIONS[id];
      if (builder) fragment.append(builder(innografCard));
    });
}

// C. Bloque Inferior Estático
fragment.append(FooterShare(innografCard));

app.appendChild(fragment);

// ── 8. Lógica de Carga y Animaciones (Fix de Race Condition) ──────────
const MIN_LOADER_MS = 900;
const heroCoverImg = app.querySelector<HTMLImageElement>('.hc__cover-img');

function onAppReady(): void {
  const elapsed = Date.now() - startTime;
  const delay = Math.max(0, MIN_LOADER_MS - elapsed);

  setTimeout(() => {
    // Apagamos el loader
    dismissLoader();

    // Disparamos el observer en el frame exacto de pintura
    requestAnimationFrame(() => {
      initScrollAnimations();
    });
  }, delay);
}

if (heroCoverImg?.complete) {
  onAppReady();
} else {
  heroCoverImg?.addEventListener('load', onAppReady, { once: true });
  heroCoverImg?.addEventListener('error', onAppReady, { once: true });
  setTimeout(onAppReady, 3000); // Fallback
}