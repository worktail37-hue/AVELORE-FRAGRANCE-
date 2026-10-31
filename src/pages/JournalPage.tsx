import React from 'react';
import { Link } from 'react-router-dom';
import { JOURNAL_ARTICLES } from '../data/journalArticles';
import { SEO } from '../components/SEO';
import { Clock, Calendar, ArrowRight, BookOpen, ChevronRight } from 'lucide-react';
import { SITE_URL } from '../seo/config';

export const JournalPage: React.FC = () => {
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Journal', url: '/journal' },
  ];

  const journalJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'The Avelore Journal | Fragrance Guides & Scent Notes',
    description: 'Master perfumer guides on selecting signature scents, decoding fragrance pyramids, and understanding eau de parfum versus eau de toilette.',
    url: `${SITE_URL}/journal`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: JOURNAL_ARTICLES.map((article, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: article.title,
        url: `${SITE_URL}/journal/${article.slug}`,
      })),
    },
  };

  return (
    <div className="min-h-screen bg-[#FAF2E1] pt-28 sm:pt-36 pb-28">
      <SEO
        title="The Avelore Journal | Fragrance Guides & Scent Notes"
        description="Read the Avelore Journal for master perfumer guides on how to choose a perfume, fragrance notes explained (top, heart, base), and eau de parfum insights."
        canonicalPath="/journal"
        breadcrumbs={breadcrumbs}
        jsonLd={journalJsonLd}
      />

      <div className="max-w-7xl mx-auto px-6 sm:px-8">
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

        {/* Editorial Header */}
        <header className="max-w-3xl mb-16">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#FFD482]" />
            <span className="text-xs uppercase tracking-[0.25em] text-[#3B0000] font-display font-bold">
              The Atelier Chronicles
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-display font-bold text-[#3B0000] tracking-tight leading-[1.08] mb-6">
            The Avelore <span className="font-serif italic font-normal text-[#520909]">Journal</span>
          </h1>

          {/* Crawlable Intro Block with Natural Target Keywords */}
          <p className="text-base sm:text-lg text-[#7E4A4A] leading-relaxed font-sans">
            Welcome to the Avelore Journal, where our master perfumers demystify the art of haute parfumerie. Whether exploring <strong>how to choose a perfume</strong> that mirrors your personal skin chemistry, discovering how <strong>fragrance notes are explained</strong> across volatile pyramids, or navigating the differences between <strong>eau de parfum vs eau de toilette</strong>, our chronicles offer quiet guidance for the thoughtful fragrance collector.
          </p>
        </header>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {JOURNAL_ARTICLES.map((article) => (
            <article
              key={article.slug}
              className="bg-[#FFFBF5] rounded-[32px] p-8 border border-[#3B0000]/10 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow group"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-[#7E4A4A] mb-4">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FAF2E1] border border-[#3B0000]/10 font-bold uppercase text-[10px]">
                    {article.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#3B0000]/60" />
                    <span>{article.readTime}</span>
                  </div>
                </div>

                <h2 className="text-2xl font-display font-bold text-[#3B0000] group-hover:text-[#520909] transition-colors leading-snug mb-3">
                  <Link to={`/journal/${article.slug}`}>
                    {article.title}
                  </Link>
                </h2>

                <p className="text-xs sm:text-sm text-[#7E4A4A] leading-relaxed font-sans mb-6">
                  {article.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-[#3B0000]/10 flex items-center justify-between text-xs font-display font-bold">
                <span className="text-[#3B0000]/70 font-mono text-[11px]">
                  By {article.author}
                </span>

                <Link
                  to={`/journal/${article.slug}`}
                  className="inline-flex items-center gap-1 text-[#3B0000] group-hover:translate-x-1 transition-transform"
                  aria-label={`Read full article: ${article.title}`}
                >
                  <span>Read Guide</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};
