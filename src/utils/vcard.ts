import type { CardProfile } from '../types/card.types';

export function generateVCard(v: CardProfile['vcard']): string {
    return [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${v.firstName} ${v.lastName}`,
        `N:${v.lastName};${v.firstName};;;`,
        `ORG:${v.organization}`,
        `TITLE:${v.title}`,
        `TEL;TYPE=CELL:${v.phone}`,
        `EMAIL;TYPE=WORK:${v.email}`,
        `URL:${v.url}`,
        `NOTE:${v.note}`,
        'END:VCARD',
    ].join('\r\n');
}