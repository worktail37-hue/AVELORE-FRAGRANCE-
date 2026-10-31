import React from 'react';
import { Link } from 'react-router-dom';
import { About } from './About';
import { SEO } from '../components/SEO';
import { ChevronRight } from 'lucide-react';
import { SITE_URL } from '../seo/config';

interface AboutPageProps {
  onOpenStoreLocator: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onOpenStoreLocator }) => {
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'About', url: '/about' },
  ];

  const aboutJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About Avelore | A Modern Luxury Fragrance House',
    description: 'Learn the philosophy of Avelore. Founded on ancestral Grasse maceration traditions, ethical raw botanical sourcing, and an uncompromising dedication to olfactory art.',
    url: `${SITE_URL}/about`,
  };

  return (
    <div className="min-h-screen bg-[#FAF2E1] pt-28 sm:pt-36">
      <SEO
        title="About Avelore | A Modern Luxury Fragrance House"
        description="Learn the philosophy of Avelore. Founded on ancestral Grasse maceration traditions, ethical raw botanical sourcing, and an uncompromising dedication to olfactory art."
        canonicalPath="/about"
        breadcrumbs={breadcrumbs}
        jsonLd={aboutJsonLd}
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
              The Maison Heritage
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-display font-bold text-[#3B0000] tracking-tight leading-[1.08] mb-6">
            About Avelore: A Modern <span className="font-serif italic font-normal text-[#520909]">Luxury Fragrance House</span>
          </h1>

          {/* Crawlable Intro (60-100 words) with Natural Target Keywords */}
          <p className="text-base sm:text-lg text-[#7E4A4A] leading-relaxed font-sans">
            Founded on the principle that true luxury lingers rather than shouts, learn <strong>about Avelore</strong> and our devotion to ancestral <strong>fragrance craftsmanship</strong>. Working between historic Grasse stills and our Paris salon, our master <strong>perfumer</strong> artisans practice slow cold maceration with an uncompromising standard for <strong>ingredient sourcing</strong>, single-origin absolutes, and architectural glass craft.
          </p>
        </header>
      </div>

      {/* Render the complete About heritage & terroir content */}
      <About onOpenStoreLocator={onOpenStoreLocator} />
    </div>
  );
};
