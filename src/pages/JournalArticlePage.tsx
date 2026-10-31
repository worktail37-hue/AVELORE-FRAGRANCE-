import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { JOURNAL_ARTICLES } from '../data/journalArticles';
import { getProductBySlug } from '../data/productsHelper';
import { ProductCard } from '../components/ProductCard';
import { SEO } from '../components/SEO';
import { Clock, Calendar, ArrowLeft, ChevronRight, User, Share2, Sparkles } from 'lucide-react';
import { SITE_URL, SITE_NAME } from '../seo/config';
import { Product } from '../data/siteData';

interface JournalArticlePageProps {
  onQuickView: (product: Product) => void;
  onFindInStore: (product: Product) => void;
}

export const JournalArticlePage: React.FC<JournalArticlePageProps> = ({
  onQuickView,
  onFindInStore,
}) => {
  const { articleSlug } = useParams<{ articleSlug: string }>();
  const article = JOURNAL_ARTICLES.find((a) => a.slug === articleSlug);

  if (!article) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-24 text-center bg-[#FAF2E1]">
        <SEO
          title="Article Not Found | The Avelore Journal"
          description="The requested fragrance guide could not be located."
          noindex={true}
        />
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-[#3B0000] mb-4">
          Article Not Found
        </h1>
        <p className="text-sm text-[#7E4A4A] max-w-md mb-8 font-sans">
          The requested chronicle may have moved or been updated under another title.
        </p>
        <Link
          to="/journal"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#3B0000] text-[#FFD482] rounded-full text-xs font-bold uppercase tracking-wider font-display hover:bg-[#520909] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to All Journal Guides</span>
        </Link>
      </div>
    );
  }

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Journal', url: '/journal' },
    { name: article.title, url: `/journal/${article.slug}` },
  ];

  // Resolve related products mentioned in the article
  const relatedProducts = article.relatedProductSlugs
    .map((slug) => getProductBySlug(slug))
    .filter((p): p is NonNullable<typeof p> => p !== null);

  // Schema.org BlogPosting structured data
  const blogPostingJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.metaDescription,
    image: `${SITE_URL}${article.featuredImage}`,
    datePublished: article.publishedDate,
    dateModified: article.modifiedDate,
    author: {
      '@type': 'Organization',
      name: article.author,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.svg`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/journal/${article.slug}`,
    },
    wordCount: article.wordCount,
  };

  // Convert markdown-style sections and links to clean JSX
  const renderFormattedContent = (content: string) => {
    const paragraphs = content.trim().split('\n\n');
    return paragraphs.map((block, i) => {
      const trimmed = block.trim();

      // Heading 2
      if (trimmed.startsWith('## ')) {
        const text = trimmed.replace('## ', '');
        return (
          <h2
            key={i}
            className="text-2xl sm:text-3xl font-display font-bold text-[#3B0000] mt-10 mb-4 tracking-tight leading-snug border-b border-[#3B0000]/10 pb-2"
          >
            {text}
          </h2>
        );
      }

      // Unordered list
      if (trimmed.startsWith('- ')) {
        const items = trimmed.split('\n').filter((line) => line.trim().startsWith('- '));
        return (
          <ul key={i} className="list-disc pl-5 my-4 space-y-2 text-[#521313] font-sans text-sm sm:text-base leading-relaxed">
            {items.map((item, idx) => {
              const itemContent = item.replace(/^- /, '');
              return (
                <li key={idx} dangerouslySetInnerHTML={{ __html: renderInlineLinks(itemContent) }} />
              );
            })}
          </ul>
        );
      }

      // Numbered list
      if (/^\d+\.\s/.test(trimmed)) {
        const items = trimmed.split('\n').filter((line) => /^\d+\.\s/.test(line.trim()));
        return (
          <ol key={i} className="list-decimal pl-5 my-4 space-y-2 text-[#521313] font-sans text-sm sm:text-base leading-relaxed">
            {items.map((item, idx) => {
              const itemContent = item.replace(/^\d+\.\s*/, '');
              return (
                <li key={idx} dangerouslySetInnerHTML={{ __html: renderInlineLinks(itemContent) }} />
              );
            })}
          </ol>
        );
      }

      // Blockquote
      if (trimmed.startsWith('> ')) {
        return (
          <blockquote key={i} className="border-l-2 border-[#FFD482] pl-4 italic text-[#7E4A4A] my-6 font-serif text-lg">
            {trimmed.replace('> ', '')}
          </blockquote>
        );
      }

      // Standard paragraph with inline markdown links
      return (
        <p
          key={i}
          className="text-base sm:text-lg text-[#521313] leading-relaxed font-sans my-4"
          dangerouslySetInnerHTML={{ __html: renderInlineLinks(trimmed) }}
        />
      );
    });
  };

  // Replace markdown links [text](url) and bold with safe sanitized HTML
  const renderInlineLinks = (text: string): string => {
    // 1. Escape HTML special characters to prevent script injection (XSS)
    const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

    // 2. Format markdown bold, italic, and strictly validate link schemes (http, https, /)
    return escaped
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, linkText, url) => {
        const cleanUrl = url.trim();
        const isSafe = /^(https?:\/\/|\/)/i.test(cleanUrl);
        if (!isSafe) {
          return linkText; // Discard unsafe javascript:, data:, or vbscript: links
        }
        return `<a href="${cleanUrl}" rel="noopener noreferrer" class="text-[#3B0000] font-bold underline hover:text-[#801B00] transition-colors">${linkText}</a>`;
      });
  };

  const formattedDate = new Date(article.publishedDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article className="min-h-screen bg-[#FAF2E1] pt-28 sm:pt-36 pb-28">
      <SEO
        title={article.metaTitle}
        description={article.metaDescription}
        canonicalPath={`/journal/${article.slug}`}
        ogType="article"
        breadcrumbs={breadcrumbs}
        jsonLd={blogPostingJsonLd}
      />

      <div className="max-w-4xl mx-auto px-6 sm:px-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumbs" className="mb-8">
          <ol className="flex items-center flex-wrap gap-2 text-xs font-display font-bold uppercase tracking-wider text-[#3B0000]/60">
            {breadcrumbs.map((b, idx) => (
              <li key={idx} className="flex items-center gap-2">
                {idx > 0 && <ChevronRight className="w-3 h-3 text-[#3B0000]/40 shrink-0" />}
                {idx === breadcrumbs.length - 1 ? (
                  <span className="text-[#3B0000] font-extrabold truncate max-w-[200px] sm:max-w-none" aria-current="page">
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

        {/* Article Header */}
        <header className="mb-12 border-b border-[#3B0000]/10 pb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-[#FFD482] text-[#3B0000] text-[10px] font-mono font-bold uppercase tracking-wider">
              {article.category}
            </span>
            <span className="text-xs text-[#7E4A4A] font-mono flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#3B0000]" />
              <span>{article.readTime}</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-bold text-[#3B0000] tracking-tight leading-[1.08] mb-6">
            {article.title}
          </h1>

          <p className="text-lg sm:text-xl font-serif italic text-[#7E4A4A] leading-relaxed mb-6">
            {article.excerpt}
          </p>

          <div className="flex items-center justify-between text-xs font-mono text-[#3B0000]/80 pt-4 border-t border-[#3B0000]/10">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#3B0000]" />
              <span className="font-bold">{article.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#3B0000]" />
              <time dateTime={article.publishedDate}>{formattedDate}</time>
            </div>
          </div>
        </header>

        {/* Article Body Content */}
        <div className="prose prose-lg max-w-none font-sans text-[#521313] leading-relaxed">
          {renderFormattedContent(article.content)}
        </div>

        {/* Author Bylines & Scent Philosophy */}
        <div className="mt-16 p-8 bg-[#FFFBF5] rounded-[28px] border border-[#3B0000]/10 text-xs text-[#7E4A4A] font-sans flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-[#3B0000] text-[#FFD482] flex items-center justify-center shrink-0 font-display font-bold text-sm">
            A
          </div>
          <div>
            <span className="font-display font-bold uppercase tracking-wider text-[#3B0000] block text-sm mb-1">
              About {article.author}
            </span>
            <p className="leading-relaxed">
              The master perfumers of Avelore work between ancestral Grasse botanical stills and our Paris formulation salon. With a commitment to patient cold maceration and zero synthetic fixatives, the Maison composes scents that linger with authentic intention.
            </p>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="mt-20 pt-12 border-t border-[#3B0000]/10" aria-labelledby="featured-creations-heading">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs uppercase tracking-[0.25em] text-[#3B0000] font-display font-bold block mb-1">
                  Mentioned in This Guide
                </span>
                <h2 id="featured-creations-heading" className="text-2xl sm:text-3xl font-display font-bold text-[#3B0000]">
                  Featured Formulations
                </h2>
              </div>
              <Link
                to="/shop"
                className="text-xs font-display font-bold uppercase tracking-wider text-[#3B0000] hover:text-[#520909] underline"
              >
                Explore All →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onQuickView={onQuickView}
                  onFindInStore={onFindInStore}
                />
              ))}
            </div>
          </section>
        )}

        {/* Back Link */}
        <div className="mt-16 text-center">
          <Link
            to="/journal"
            className="inline-flex items-center gap-2 text-xs font-display font-bold uppercase tracking-widest text-[#3B0000] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to All Journal Articles</span>
          </Link>
        </div>
      </div>
    </article>
  );
};
