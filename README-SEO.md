# Avelore SEO Architecture & Deployment Guide

This document outlines the complete Technical and On-Page Search Engine Optimization (SEO) setup for the **Avelore** Haute Parfumerie web application.

---

## 1. Domain & URL Configuration

### Primary Configuration (`/src/seo/config.ts`)
Update `SITE_URL` to your production domain:
```typescript
export const SITE_URL = "https://YOUR-DOMAIN.com"; // Replace with your production domain (no trailing slash)
export const SITE_NAME = "Avelore";
export const DEFAULT_OG_IMAGE = "/og-image.jpg";
export const LOCALE = "en";
```

### Host-Level Canonical Rules (Recommended Web Server Configuration)
To prevent duplicate content indexing, enforce the following at your reverse proxy (Cloudflare, Nginx, Vercel, or AWS CloudFront):
1. **HTTP to HTTPS Redirection**: Enforce 301 redirects from `http://` to `https://`.
2. **Non-WWW Canonicalization**: Enforce 301 redirect from `https://www.your-domain.com/*` to `https://your-domain.com/$1` (or vice versa according to brand preference).
3. **Trailing Slash Discipline**: Enforce consistent non-trailing slash behavior (e.g. `/shop`, `/about`, `/journal`). All internal links and canonical meta tags omit trailing slashes.

---

## 2. Crawlability & SPA Routing

The application has been upgraded from `HashRouter` to clean HTML5 `BrowserRouter` history routing.

### URL Structure
- **Home**: `/`
- **Shop & Catalogue**: `/shop`
- **Product Standalone Pages**: `/shop/:productSlug` (e.g., `/shop/reserve-ambre-imperial`, `/shop/solene`)
- **Collections Index & Chapters**: `/collections` and `/collections/:collectionSlug` (`solar`, `meridian`, `nocturne`, `botanical`)
- **Atelier & Terroir**: `/about`
- **Concierge & Boutiques**: `/contact`
- **Olfactory Journal Guides**: `/journal` and `/journal/:articleSlug`
- **404 Not Found Page**: Custom branded fallback with `noindex` robots directive and return navigation.

### SPA Host Fallbacks
- **Netlify & Cloudflare Pages**: Handled via `/public/_redirects` (`/* /index.html 200`).
- **Vercel**: Handled via `/vercel.json` rewrites.
- **Firebase Hosting**:
  ```json
  {
    "hosting": {
      "public": "dist",
      "rewrites": [ { "source": "**", "destination": "/index.html" } ]
    }
  }
  ```

---

## 3. Structured Data (Schema.org JSON-LD)

All structured data is generated dynamically per route and injected into `<head>`:
- **Site-wide**:
  - `Organization`: Brand identity, logo, Grasse/Paris contact point, customer support phone and language, social links.
  - `WebSite`: Publisher name and absolute canonical URL.
- **Inner Pages**:
  - `BreadcrumbList`: Hierarchical breadcrumbs linking back to parent routes.
- **Shop & Collections**:
  - `CollectionPage` with `ItemList` schema enumerating product URLs.
  - `FAQPage`: Schema matching the 7 visible questions (formulation, longevity, IFRA compliance, temperature storage, pulse points, gifting).
- **Product Detail Pages**:
  - `Product`: Item name, description, SKU, Grasse origin, Brand (`Avelore`), and image.
  - *Note*: As required by Google Search Guidelines, fake review stars and fictitious aggregate ratings have been excluded to protect domain trust.
- **Journal Articles**:
  - `BlogPosting`: Full editorial schema with headline, author ("Avelore Perfumers"), datePublished, dateModified, and canonical URL.
- **Contact & Boutiques**:
  - `ContactPage` with commented `LocalBusiness` template for physical salons (Paris Marais, Mayfair London, SoHo NY).

---

## 4. Performance & Core Web Vitals (CWV)

### Largest Contentful Paint (LCP < 2.5s)
- The hero poster image (`/hero-poster.jpg`) is preloaded in `index.html` with `fetchpriority="high"` and explicit dimensions (`width="1920" height="1080"`).
- The heavy background video (`HERO_VIDEO_SRC`) is deferred using `requestIdleCallback` after first paint and skipped entirely if the user has `Save-Data` or a 2G connection enabled.

### Cumulative Layout Shift (CLS < 0.1)
- Fixed aspect-ratio wrappers and explicit image dimensions throughout product grids and chapter banners prevent layout jank.
- Sticky hero stage maintains a fixed `400vh` scroll track with reserved viewport heights.

### Interaction to Next Paint (INP < 200ms)
- Code-splitting with `React.lazy` and `Suspense` ensures only necessary code chunks load per route.
- Custom cursor and smooth scroll (Lenis) are strictly restricted to fine-pointer desktop devices (`(pointer: fine)`) and respect `prefers-reduced-motion: reduce`.

---

## 5. Pre-Rendering / Static Generation (SSG Export)

To output fully rendered HTML files containing static meta tags, visible text, and JSON-LD for headless crawlers, you can run:

```bash
# Production client build
npm run build
```

For environments supporting static site generation (SSG) with `vite-plugin-prerender` or `vite-react-ssg`:
```bash
# Add prerender tool if exporting to pure static storage
npm i -D vite-plugin-prerender
```
All routes are crawlable through standard anchor tags `<Link to="...">` with `<a href="...">` rendered directly in the DOM.
