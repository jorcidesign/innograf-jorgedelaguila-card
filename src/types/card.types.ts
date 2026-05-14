// src/types/card.types.ts

export interface ThemeConfig {
    primaryColor: string;
    primaryGradient: string;
    accentColor: string;
    paperColor: string;
    inkColor: string;
}

export interface VCardData {
    firstName: string; lastName: string; organization: string;
    title: string; phone: string; email: string; url: string; note: string;
}

export interface SocialLink {
    id: string; label: string; url: string; icon: string;
}

export interface Client {
    id: string; name: string; logoUrl: string; colorLogoUrl: string;
}

export interface Service {
    id: string; category: string; title: string; description: string; icon: string; imageUrl?: string; // <-- NUEVO: Soporte para imágenes en el Stacked Card
}

// ── V2 NEW ──────────────────────────────────────────────
export interface Document {
    id: string;
    title: string;
    subtitle: string;          // ej: "Presentación Corporativa · 2024"
    fileType: 'pdf' | 'pptx' | 'xlsx' | 'docx';
    sizeLabel: string;         // ej: "3.2 MB"
    url: string;               // S3 / Drive / Notion
    coverUrl?: string;         // Thumbnail del documento
}

export interface MediaItem {
    id: string;
    title: string;
    subtitle?: string;
    type: 'youtube' | 'vimeo' | 'mp4';
    embedUrl: string;          // https://www.youtube.com/embed/VIDEO_ID
    thumbnailUrl: string;
    duration?: string;         // ej: "2:34"
}

export interface Stat {
    value: string;             // ej: "+500"
    label: string;             // ej: "proyectos entregados"
    suffix?: string;           // ej: "clientes" | "%"
}

export interface CardProfile {
    id: string;
    config: CardConfig; // <-- Nueva propiedad
    company: {
        name: string;
        legalName: string;
        website: string;
        since: number;
        tagline: string;
        logoUrl: string;
        primaryColor: string; // Mantenemos por compatibilidad
        accentColor: string;  // Mantenemos por compatibilidad
        coverUrl: string;
        stats: Stat[];
        theme: ThemeConfig; // <-- Nueva propiedad
    };
    person: {
        fullName: string;
        firstName: string;
        role: string;
        avatarUrl: string;
        avatarFallback: string;
        bio?: string;
    };
    contact: {
        phone: string;
        whatsapp: string;
        whatsappMessage: string;
        email: string;
        address: string;
    };
    vcard: VCardData;
    socials: SocialLink[];
    clients: Client[];
    services: Service[];
    documents: Document[];
    multimedia: MediaItem[];
    cardUrl: string;
    poweredBy: { name: string; url: string; logo: string; };

}


export interface SectionConfig {
    visible: boolean;
    order: number;
}

export interface CardConfig {
    sections: {
        clients: SectionConfig;
        services: SectionConfig;
        documents: SectionConfig;
        multimedia: SectionConfig;
        socials: SectionConfig;
    };
}
