/**
 * Utilidades para detección y formateo visual de contactos y enlaces de anuncios
 * (Wallapop, Milanuncios, Facebook, enlaces web, teléfonos).
 */

export interface ParsedContact {
  hasUrl: boolean;
  url?: string;
  platform?: 'WALLAPOP' | 'MILANUNCIOS' | 'FACEBOOK' | 'WEB';
  platformLabel?: string;
  badgeColor?: string;
  badgeBg?: string;
  icon?: string;
  cleanPhone?: string;
  displayText?: string;
}

export function extractContactLink(rawText?: string, canalHint?: string): ParsedContact {
  if (!rawText || !rawText.trim()) {
    return { hasUrl: false };
  }

  const text = rawText.trim();
  // Buscar URL http o https en el texto
  const urlMatch = text.match(/(https?:\/\/[^\s]+)/i);

  if (urlMatch && urlMatch[0]) {
    const url = urlMatch[0];
    const lowerUrl = url.toLowerCase();

    if (lowerUrl.includes('wallapop.com') || canalHint === 'WALLAPOP') {
      return {
        hasUrl: true,
        url,
        platform: 'WALLAPOP',
        platformLabel: 'Ver en Wallapop',
        badgeColor: '#FFFFFF',
        badgeBg: '#13C1AC',
        icon: '🟠',
      };
    }

    if (lowerUrl.includes('milanuncios.com') || canalHint === 'MILANUNCIOS') {
      return {
        hasUrl: true,
        url,
        platform: 'MILANUNCIOS',
        platformLabel: 'Ver en Milanuncios',
        badgeColor: '#FFFFFF',
        badgeBg: '#2ECC71',
        icon: '🟢',
      };
    }

    if (lowerUrl.includes('facebook.com') || lowerUrl.includes('fb.me') || canalHint === 'FACEBOOK') {
      return {
        hasUrl: true,
        url,
        platform: 'FACEBOOK',
        platformLabel: 'Ver en Facebook',
        badgeColor: '#FFFFFF',
        badgeBg: '#1877F2',
        icon: '🔵',
      };
    }

    return {
      hasUrl: true,
      url,
      platform: 'WEB',
      platformLabel: 'Abrir Anuncio Web',
      badgeColor: '#FFFFFF',
      badgeBg: '#0284C7',
      icon: '🔗',
    };
  }

  // Si no hay URL, pero hay texto de usuario o alias
  return {
    hasUrl: false,
    displayText: text.replace(/\s+/g, ' ').slice(0, 40),
  };
}

/**
 * Limpia el texto compartido de Wallapop/Milanuncios para guardar solo la URL limpia si existe.
 */
export function sanitizeContactInput(input: string): string {
  if (!input) return '';
  const urlMatch = input.match(/(https?:\/\/[^\s]+)/i);
  if (urlMatch && urlMatch[0]) {
    return urlMatch[0];
  }
  return input.trim();
}
