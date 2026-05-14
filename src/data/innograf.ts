// src/data/innograf.ts
import type { CardProfile } from '../types/card.types';


export const innografCard: CardProfile = {
    id: 'innograf-jorge-del-aguila',
    // ── NUEVO: MOTOR DE ORQUESTACIÓN ──
    config: {
        sections: {
            socials: { visible: false, order: 5 },
            clients: { visible: true, order: 1 },
            services: { visible: true, order: 2 },
            documents: { visible: true, order: 3 },
            multimedia: { visible: false, order: 4 },

        }
    },
    company: {
        name: 'INNOGRAF',
        legalName: 'Innograf S.A.C.',
        website: 'https://innograf-portfolio.vercel.app/',
        since: 2011,
        tagline: 'Elevando el estándar de la impresión comercial desde 2011.',
        logoUrl: '/logo.svg',
        primaryColor: '#DD2025', // Rojo corporativo
        accentColor: '#F0A91E',  // Amarillo/Dorado
        coverUrl: 'https://res.cloudinary.com/dhlkqt62w/image/upload/v1778702791/ab2d4058-a9da-4191-aaa2-6c2026eb2279_1_ubjuvd.png',
        stats: [
            { value: '+500', label: 'proyectos', suffix: 'proyectos entregados' },
            { value: '13', label: 'años', suffix: 'años de experiencia' },
            { value: '98%', label: 'satisfacción', suffix: 'satisfacción de clientes' },
            { value: '+80', label: 'marcas', suffix: 'marcas confían en nosotros' },
        ],
        // CONFIGURACIÓN DE TEMA WHITE-LABEL
        theme: {
            primaryColor: '#DD2025',
            primaryGradient: 'linear-gradient(rgba(221, 32, 37, 0.85), rgba(221, 32, 37, 0.85))',
            accentColor: '#F0A91E',
            paperColor: '#FFFFFF',
            inkColor: '#1A1A1A'
        }
    },

    person: {
        fullName: 'Jorge Manuel del Aguila',
        firstName: 'Jorge',
        role: 'Gerente General',
        avatarUrl: 'https://res.cloudinary.com/dhlkqt62w/image/upload/v1778644734/Gemini_Generated_Image_4jciol4jciol4jci_1_vlgvmp.png',
        avatarFallback: 'JDA',
        bio: 'Más de 13 años liderando proyectos de impresión de alto impacto para marcas líderes en el Perú.',
    },

    contact: {
        phone: '+51997903296',
        whatsapp: '+51997903296',
        whatsappMessage: 'Hola Jorge, vi tu tarjeta digital y me gustaría saber más sobre los servicios de Innograf.',
        email: 'jorgedelaguila36@gmail.com',
        address: 'Lima, Perú',
    },

    vcard: {
        firstName: 'Jorge Manuel', lastName: 'Del Aguila',
        organization: 'Innograf S.A.C.', title: 'Gerente General',
        phone: '+51997903296', email: 'jorgedelaguila36@hotmail.com',
        url: 'https://innograf-portfolio.vercel.app/',
        note: 'Impresión comercial premium · Lima, Perú',
    },

    socials: [
        { id: 'linkedin', label: 'LinkedIn', url: 'https://linkedin.com/company/innograf', icon: 'linkedin' },
        { id: 'instagram', label: 'Instagram', url: 'https://instagram.com/innograf', icon: 'instagram' },
    ],

    clients: [
        { id: 'pardos', name: "Pardos Chicken", logoUrl: 'https://pbs.twimg.com/profile_images/1339984045137129475/R6D7MbMF_400x400.jpg', colorLogoUrl: '' },
        { id: 'mitsui', name: 'Mitsui', logoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTI7ylD1Qc7zGhkyt92RaRdvfB8zQfSlndqA&s', colorLogoUrl: '' },
        { id: 'mbrenting', name: 'MB Renting', logoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6VWg3kgg2UoC5vP22vNleyT0dF6uuOMNQsQ&s', colorLogoUrl: '' },
        { id: 'Charles Taylor', name: 'Sapet', logoUrl: 'https://www.charlestaylor.com/static/img/ct-logo.png', colorLogoUrl: '' },
        { id: 'Promelsa', name: 'LATAM', logoUrl: 'https://www.promelsa.com.pe/media/logo/stores/1/p1itaboohh1vh812rq19vd2id1iqb4_page_02.png', colorLogoUrl: '' },
        // { id: 'interbank', name: 'Interbank', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Interbank_logo.svg', colorLogoUrl: '' },
    ],

    services: [
        {
            id: 'papeleria-editorial',
            category: 'Impresión',
            title: 'Papelería y Editorial',
            description: 'Tarjetas de presentación, papelería institucional, cuadernos, flyers, revistas, etiquetas y adhesivos.',
            icon: '🖨️',
            imageUrl: 'https://res.cloudinary.com/dhlkqt62w/image/upload/v1778716167/8305e3dc-afc2-4506-8d2a-663642ab4ee4.png'
        },
        {
            id: 'gran-formato',
            category: 'Señalética',
            title: 'Gran Formato y Señalética',
            description: 'Gigantografías, banners, letreros y paneles acrílicos, rollers, banners ajustables y viniles decorativos.',
            icon: '📐',
            imageUrl: 'https://res.cloudinary.com/dhlkqt62w/image/upload/v1778716014/f6a530a0-ad3d-4781-a4f4-e6863376170d.png'
        },
        {
            id: 'marketing-btl',
            category: 'BTL & Cajas',
            title: 'Marketing BTL y Campañas',
            description: 'Módulos, counters, tótems, ruletas, displays, atriles, packaging y box corporativos para impactar.',
            icon: '🚀',
            imageUrl: 'https://res.cloudinary.com/dhlkqt62w/image/upload/v1778716157/9af148f0-6aa8-433b-95f6-d25bc1498be9.png'
        },
        {
            id: 'merchandising',
            category: 'Merch',
            title: 'Artículos de Merchandising',
            description: 'Artículos textiles, tomatodos, tazas, artículos de oficina y promocionales diversos.',
            icon: '🎁',
            imageUrl: 'https://res.cloudinary.com/dhlkqt62w/image/upload/v1778716255/ccde5374-3abe-48a4-a9b3-7056aceed70f.png'
        },
        {
            id: 'servicios-adicionales',
            category: 'Especiales',
            title: 'Servicios Adicionales',
            description: 'Sellos, fechadores, elaboración de fotochecks en PVC y proyectos a medida en acrílico.',
            icon: '✨',
            imageUrl: 'https://res.cloudinary.com/dhlkqt62w/image/upload/v1778716520/c48efcaf-6b40-4ccd-bf5c-6d8a6ffa83c3.png'
        }
    ],

    // ── V2: DOCUMENTOS ────────────────────────────────────
    documents: [
        {
            id: 'brochure-2024',
            title: 'Brochure Corporativo',
            subtitle: 'Servicios & Portafolio · 2026',
            fileType: 'pdf',
            sizeLabel: '4.8 MB',
            url: '/docs/catalogo-innograf.pdf',
            coverUrl: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&q=75',
        },
        // {
        //     id: 'tarifario-2024',
        //     title: 'Tarifario de Servicios',
        //     subtitle: 'Precios referenciales · Lima 2024',
        //     fileType: 'pdf',
        //     sizeLabel: '1.2 MB',
        //     url: 'https://drive.google.com/file/d/PLACEHOLDER_TARIFARIO/view',
        // },
        // {
        //     id: 'catalogo-merch',
        //     title: 'Catálogo Merchandising',
        //     subtitle: 'Artículos promocionales · Temporada 2024',
        //     fileType: 'pdf',
        //     sizeLabel: '8.1 MB',
        //     url: 'https://drive.google.com/file/d/PLACEHOLDER_CATALOGO/view',
        // },
    ],

    // ── V2: MULTIMEDIA ────────────────────────────────────
    multimedia: [
        // {
        //     id: 'proceso-offset',
        //     title: 'Proceso de Impresión Offset',
        //     subtitle: 'Así fabricamos tus piezas · Innograf Plant Tour',
        //     type: 'youtube',
        //     embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',   // placeholder
        //     thumbnailUrl: 'https://images.unsplash.com/photo-1614729939124-032d1e6c9945?w=800&q=80',
        //     duration: '2:47',
        // },
        // {
        //     id: 'cases-pardos',
        //     title: "Case Study: Pardos Chicken",
        //     subtitle: 'Campaña de packaging y señalética',
        //     type: 'youtube',
        //     embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',   // placeholder
        //     thumbnailUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
        //     duration: '1:23',
        // },
    ],

    cardUrl: 'https://innograf-jorgedelaguila-card.vercel.app',
    poweredBy: {
        name: 'AstoStudios', url: 'https://astostudios.pe',
        logo: '/assets/asto-studio-mark.svg',
    },
};