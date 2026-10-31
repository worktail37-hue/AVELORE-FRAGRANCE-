import React, { useEffect } from 'react';
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE, LOCALE, SOCIAL_PROFILES } from '../seo/config';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface SEOProps {
  title: string;
  description: string;
  canonicalPath?: string;
  ogType?: 'website' | 'article' | 'product';
  ogImage?: string;
  noindex?: boolean;
  breadcrumbs?: BreadcrumbItem[];
  jsonLd?: Record<string, any> | Array<Record<string, any>>;
}

/**
 * Universal SEO & Meta Management Component
 * Automatically injects/updates title, meta descriptions, canonical URLs,
 * OpenGraph, Twitter cards, and Schema.org JSON-LD structured data into the DOM head.
 */
export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  canonicalPath = '',
  ogType = 'website',
  ogImage = DEFAULT_OG_IMAGE,
  noindex = false,
  breadcrumbs,
  jsonLd,
}) => {
  const normalizedPath = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`;
  const canonicalUrl = `${SITE_URL}${normalizedPath === '/' ? '' : normalizedPath}`;
  const fullOgImageUrl = ogImage.startsWith('http') ? ogImage : `${SITE_URL}${ogImage.startsWith('/') ? '' : '/'}${ogImage}`;

  useEffect(() => {
    // 1. Update Title
    document.title = title;

    // Helper to get or create a head tag
    const getOrCreateMeta = (selector: string, createFn: () => HTMLElement): HTMLElement => {
      let el = document.head.querySelector(selector) as HTMLElement | null;
      if (!el) {
        el = createFn();
        document.head.appendChild(el);
      }
      return el;
    };

    // 2. Meta description
    const descMeta = getOrCreateMeta('meta[name="description"]', () => {
      const m = document.createElement('meta');
      m.setAttribute('name', 'description');
      return m;
    });
    descMeta.setAttribute('content', description);

    // 3. Robots
    const robotsMeta = getOrCreateMeta('meta[name="robots"]', () => {
      const m = document.createElement('meta');
      m.setAttribute('name', 'robots');
      return m;
    });
    robotsMeta.setAttribute('content', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1');

    // 4. Canonical link
    const canonicalLink = getOrCreateMeta('link[rel="canonical"]', () => {
      const l = document.createElement('link');
      l.setAttribute('rel', 'canonical');
      return l;
    });
    canonicalLink.setAttribute('href', canonicalUrl);

    // 5. OpenGraph Tags
    const setOgTag = (property: string, content: string) => {
      const el = getOrCreateMeta(`meta[property="${property}"]`, () => {
        const m = document.createElement('meta');
        m.setAttribute('property', property);
        return m;
      });
      el.setAttribute('content', content);
    };

    setOgTag('og:site_name', SITE_NAME);
    setOgTag('og:title', title);
    setOgTag('og:description', description);
    setOgTag('og:url', canonicalUrl);
    setOgTag('og:type', ogType);
    setOgTag('og:image', fullOgImageUrl);
    setOgTag('og:locale', LOCALE);

    // 6. Twitter Card Tags
    const setTwitterTag = (name: string, content: string) => {
      const el = getOrCreateMeta(`meta[name="${name}"]`, () => {
        const m = document.createElement('meta');
        m.setAttribute('name', name);
        return m;
      });
      el.setAttribute('content', content);
    };

    setTwitterTag('twitter:card', 'summary_large_image');
    setTwitterTag('twitter:title', title);
    setTwitterTag('twitter:description', description);
    setTwitterTag('twitter:image', fullOgImageUrl);

    // 7. Structured Data (JSON-LD)
    const existingScript = document.head.querySelector('script#avelore-structured-data');
    if (existingScript) {
      existingScript.remove();
    }

    // Build complete Schema.org payload
    const schemas: Array<Record<string, any>> = [];

    // Base Organization & WebSite (Every page)
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/logo.svg`,
      description: 'A modern luxury fragrance house. Fine extraits, body & bath, home scents, and botanical cosmetics.',
      sameAs: [
        SOCIAL_PROFILES.instagram,
        SOCIAL_PROFILES.pinterest,
        SOCIAL_PROFILES.spotify,
        SOCIAL_PROFILES.x,
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+33 1 42 78 30 12',
        contactType: 'customer service',
        availableLanguage: ['English', 'French'],
      },
    });

    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
    });

    // BreadcrumbList if provided
    if (breadcrumbs && breadcrumbs.length > 0) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((b, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: b.name,
          item: b.url.startsWith('http') ? b.url : `${SITE_URL}${b.url}`,
        })),
      });
    }

    // Custom route JSON-LD
    if (jsonLd) {
      if (Array.isArray(jsonLd)) {
        schemas.push(...jsonLd);
      } else {
        schemas.push(jsonLd);
      }
    }

    const script = document.createElement('script');
    script.id = 'avelore-structured-data';
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schemas.length === 1 ? schemas[0] : schemas, null, 2);
    document.head.appendChild(script);

    return () => {
      // Cleanup script on unmount if changing route
      const s = document.head.querySelector('script#avelore-structured-data');
      if (s) s.remove();
    };
  }, [title, description, canonicalUrl, fullOgImageUrl, ogType, noindex, breadcrumbs, jsonLd]);

  return null;
};
