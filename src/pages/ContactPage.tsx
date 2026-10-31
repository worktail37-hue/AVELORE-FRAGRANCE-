import React from 'react';
import { Link } from 'react-router-dom';
import { Contact } from './Contact';
import { SEO } from '../components/SEO';
import { ChevronRight } from 'lucide-react';
import { SITE_URL, CONTACT_INFO } from '../seo/config';

interface ContactPageProps {
  onOpenStoreLocator: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onOpenStoreLocator }) => {
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Contact', url: '/contact' },
  ];

  /*
   * LOCAL BUSINESS SCHEMA TEMPLATE (Commented per requirements until real boutique address is confirmed):
   * {
   *   "@context": "https://schema.org",
   *   "@type": "Store",
   *   "name": "Avelore Atelier Marais",
   *   "image": "https://YOUR-DOMAIN.com/ateliers/paris.jpg",
   *   "telephone": "+33 1 42 78 30 12",
   *   "address": {
   *     "@type": "PostalAddress",
   *     "streetAddress": "24 Rue de Sévigné",
   *     "addressLocality": "Paris",
   *     "postalCode": "75004",
   *     "addressCountry": "FR"
   *   },
   *   "openingHoursSpecification": {
   *     "@type": "OpeningHoursSpecification",
   *     "dayOfWeek": ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
   *     "opens": "11:00",
   *     "closes": "19:30"
   *   }
   * }
   */

  const contactJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact & Stockists | Avelore Fine Fragrance',
    description: 'Connect with the Avelore concierge or reserve a private olfactory consultation at our Paris, London, New York, or Tokyo flagship ateliers.',
    url: `${SITE_URL}/contact`,
    mainEntity: {
      '@type': 'Organization',
      name: 'Avelore',
      url: SITE_URL,
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: CONTACT_INFO.phone,
        contactType: 'customer service',
        email: CONTACT_INFO.email,
        availableLanguage: ['English', 'French'],
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#FAF2E1] pt-28 sm:pt-36">
      <SEO
        title="Contact & Stockists | Avelore Fine Fragrance"
        description="Connect with the Avelore concierge or reserve a private olfactory consultation at our Paris, London, New York, or Tokyo flagship ateliers."
        canonicalPath="/contact"
        breadcrumbs={breadcrumbs}
        jsonLd={contactJsonLd}
      />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 pb-12">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumbs" className="mb-8">
          <ol className="flex items-center flex-wrap gap-2 text-xs font-display font-bold uppercase tracking-wider text-[#3B0000]/60">
            {breadcrumbs.map((b, idx) => (
              <li key={idx} className="flex items-center gap-2">
                {idx > 0 && <ChevronRight className="w-3 h-3 text-[#3B0000]/40 shrink-0" />}
                {idx === breadcrumbs.length - 1 ? (
                  <span className="text-[#3B0000] font-extrabold" aria-current="page">
                    {b.name}
                  </span>
                ) : (
                  <Link to={b.url} className="hover:text-[#3B0000] hover:underline transition-colors">
                    {b.name}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {/* Editorial Heading with Target Keywords */}
        <header className="max-w-3xl mb-12">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#FFD482]" />
            <span className="text-xs uppercase tracking-[0.25em] text-[#3B0000] font-display font-bold">
              Concierge & Flagship Salons
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-display font-bold text-[#3B0000] tracking-tight leading-[1.08] mb-6">
            Contact & <span className="font-serif italic font-normal text-[#520909]">Stockists</span>: Atelier Directory
          </h1>

          {/* Crawlable Intro (60-100 words) with Natural Target Keywords */}
          <p className="text-base sm:text-lg text-[#7E4A4A] leading-relaxed font-sans">
            Connect directly with our olfactory concierge or locate authorized <strong>Avelore stockists</strong> and flagship salons worldwide. Whether inquiring about a private <strong>fragrance consultation</strong>, bespoke flacon commissions, or global stockist distribution, we invite you to <strong>contact Avelore</strong> via secure dispatch or visit our sanctuaries in Paris, London, New York, and Tokyo.
          </p>
        </header>
      </div>

      <Contact onOpenStoreLocator={onOpenStoreLocator} />
    </div>
  );
};
