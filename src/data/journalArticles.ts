/**
 * AVELORE JOURNAL ARTICLES
 * Original, comprehensive editorial guides (600–900 words each)
 * Rich in H2 sections, internal product & collection links, author, date, and schema metadata.
 */

export interface JournalArticleFull {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  category: string;
  author: string;
  publishedDate: string; // ISO 8601
  modifiedDate: string;
  readTime: string;
  wordCount: number;
  featuredImage: string;
  content: string; // Markdown or rich HTML-friendly text
  relatedProductSlugs: string[];
  relatedCollectionSlugs: string[];
}

export const JOURNAL_ARTICLES: JournalArticleFull[] = [
  {
    slug: "how-to-choose-a-perfume",
    title: "How to Choose a Perfume That Suits You: The Art of the Signature Scent",
    metaTitle: "How to Choose a Perfume That Suits You | Avelore Guide",
    metaDescription: "Master perfumer guide on how to choose a perfume that suits your skin chemistry, lifestyle, and seasonal mood. Discover your authentic signature scent with Avelore.",
    excerpt: "Selecting a perfume is not an act of shopping; it is an intimate conversation between your skin's natural lipid chemistry and botanical macerations.",
    category: "Olfactory Guides",
    author: "Avelore Perfumers",
    publishedDate: "2026-09-15T09:00:00Z",
    modifiedDate: "2026-10-20T11:30:00Z",
    readTime: "7 min read",
    wordCount: 820,
    featuredImage: "/journal/choose-perfume.jpg",
    relatedProductSlugs: ["reserve-ambre-imperial", "solene", "bleu-meridian", "noir-ambre"],
    relatedCollectionSlugs: ["solar", "nocturne", "meridian"],
    content: `
Selecting a signature perfume is one of the most intimate decisions you can make. A fragrance does not simply sit on clothing; it interacts continuously with your body heat, skin pH, and natural sebum. What smells luminous and airy on a paper blotter in a boutique may bloom into a deep, brooding resin once warmed by your pulse points. 

Understanding how to choose a perfume that genuinely harmonizes with your individuality requires patience, an appreciation for olfactory families, and a willingness to test slowly.

## 1. Understand Your Olfactory Family Archetype

Every perfume belongs to an olfactory family that defines its overarching architectural mood. Rather than browsing by brand names or marketing descriptions, start by observing which emotional climates you gravitate toward:

- **Ambrée & Resinous**: Warm, comforting, and hypnotic. These compositions emphasize Madagascar vanilla, labdanum, benzoin, and aged amber resins. If you are drawn to evening mystery and velvety warmth, explore creations like our [Ambre Impérial Reserve](/shop/reserve-ambre-imperial) or the smoky warmth of [Nocturne & Earth](/collections/nocturne).
- **Solar & Citrus**: Radiant, uplifting, and golden. Dominated by cold-pressed Calabrian bergamot, Spanish neroli blossom, and warm terracotta accords. Discover [Solène](/shop/solene) for an evocative midday sunlight experience.
- **Oceanic & Mineral Woods**: Clean, contemplative, and expansive. Crisp sea salt, crushed coastal sage, and Australian sandalwood. [Bleu Meridian](/shop/bleu-meridian) represents this crystalline clarity.
- **Botanical Greens & Soliflores**: Fresh, dewy, and truthful. Morning rose de Mai, wet violet leaves, and iris butter, celebrated in [The Botanical Garden](/collections/botanical).

## 2. Test Exclusively on Skin—Never Rely Solely on Paper Blotters

Paper scent strips (mouillettes) are valuable for experiencing the initial volatile top notes of a fragrance, but paper has no warmth, pulse, or lipid layer. When you find a scent that intrigues you on paper:

1. Spray a single mist onto the inside of your wrist or the crook of your elbow.
2. **Never rub your wrists together**. Rubbing creates friction and premature heat that bruises delicate floral top notes and evaporates volatile citrus molecules prematurely.
3. Allow the alcohol carrier to evaporate naturally for 30 seconds before taking your first inhalation.

## 3. Observe the Three Evolution Stages

True luxury perfume is composed in a tripartite pyramid of top, heart, and base notes. A common mistake is buying a flacon based solely on the opening five minutes. 

- **The Top Notes (0–15 Minutes)**: The greeting. Characterized by volatile molecules such as citrus, green herbs, and aldehydes.
- **The Heart (30 Minutes – 3 Hours)**: The true identity. Florals, spices, and fruit pulps begin to unfurl.
- **The Drydown / Base (4–12+ Hours)**: The lingering memory. Heavy molecular structures such as vetiver roots, oakmoss, oud, and ambergris fuse with your skin chemistry.

We advise wearing a perfume for a minimum of four hours before deciding whether to welcome it into your permanent wardrobe.

## 4. Account for Seasons, Terroirs, and Moods

A fragrance wardrobe should evolve with the light and temperature of the year:
- **Spring and Summer**: High ambient heat accelerates fragrance evaporation. Crisp aquatic notes, bitter citrus, and delicate floral waters linger with elegance without overwhelming those around you.
- **Autumn and Winter**: Crisp, dry air invites opulent balsams, smoky woods, and rich leather accords like [Noir Ambre](/shop/noir-ambre) that wrap around you like a bespoke cashmere coat.

## 5. Trust Your Visceral Sensation

At Avelore, our guiding principle is that "luxury never shouts; it lingers with intention." Do not select a fragrance because it is popular or prominent in social feeds. Choose the flacon that makes you stand taller, feel grounded, and exhale with quiet confidence.
    `,
  },
  {
    slug: "fragrance-notes-explained",
    title: "Fragrance Notes Explained: Top, Heart, and Base Olfactory Architecture",
    metaTitle: "Fragrance Notes Explained: Top, Heart, Base | Avelore Guide",
    metaDescription: "Understand the structure of perfume. Our master perfumer guide explains top, heart, and base notes, molecular volatility, and how scent unfolds over hours.",
    excerpt: "Just as a musical sonata consists of chords and movements, fine fragrance is built on varying rates of molecular evaporation.",
    category: "Perfume Craftsmanship",
    author: "Avelore Perfumers",
    publishedDate: "2026-08-28T10:00:00Z",
    modifiedDate: "2026-10-22T14:15:00Z",
    readTime: "8 min read",
    wordCount: 860,
    featuredImage: "/journal/fragrance-notes.jpg",
    relatedProductSlugs: ["reserve-sol-aureum", "santal-celeste", "rose-sepal", "reserve-oud-meridian"],
    relatedCollectionSlugs: ["solar", "meridian", "botanical"],
    content: `
In classical French haute parfumerie, a fragrance is rarely a static monolithic scent. Rather, it is a dynamic living timeline engineered through the precise chemistry of molecular weights and vapor pressures. When you spray an extrait de parfum, you are setting into motion a choreographed sequence of botanical transformations.

Understanding fragrance notes—categorized into **Top**, **Heart**, and **Base**—is the master key to decoding any flacon and understanding why your perfume shifts between breakfast, midday, and twilight.

## 1. What Are Fragrance Notes?

Fragrance notes are the individual olfactory facets that make up a finished formulation. A master nose balances dozens of natural isolates, resinous extraits, and floral absolutes so that the scent transitions seamlessly from opening to drydown without jarring seams.

These notes are structured across the traditional olfactory pyramid according to their molecular evaporation rate.

## 2. Top Notes (The Head / Notes de Tête)

The top notes represent your first impression. They are composed of light, volatile molecules with low boiling points that evaporate within the first 10 to 20 minutes of application.

- **Role**: To introduce the fragrance, create an immediate sensory atmosphere, and awaken the olfactory receptors.
- **Classic Materials**: 
  - Citrus harvests (Calabrian bergamot, bitter orange, yuzu, green mandarin)
  - Aromatic herbs (crushed thyme, wild mint, French lavender)
  - Sharp berries & aldehydes (pink pepper, juniper berries, aldehydes)
- **Signature Example**: In [Sol Aureum Reserve](/shop/reserve-sol-aureum) from [The Solar Solstice](/collections/solar), the opening sparkles with cold-pressed bitter orange and Italian neroli that feels like warm morning sunlight pouring through orchard shutters.

## 3. Heart Notes (The Core / Notes de Cœur)

As the volatile top notes dissipate, the heart of the perfume emerges. These molecules possess medium weight and typically become dominant between 20 minutes and 3 hours after application.

- **Role**: The heart is the structural soul and emotional thematic center of the perfume. It tempers the sharpness of the opening and provides a bridge to the deep resinous base.
- **Classic Materials**:
  - Full-bodied florals (Centifolia Rose de Mai, Jasmin Sambac, Florentine Iris butter, Tuberose)
  - Botanical spices (Cardamom, nutmeg, saffron threads, cinnamon bark)
  - Fruits & greens (Black fig pulp, green tea buds, crushed violet leaves)
- **Signature Example**: In [Rose Sépale](/shop/rose-sepal), the heart unfolds with dewy Damask rose petals spiked with fresh coriander seeds, balancing delicate romance with raw botanical green thorns.

## 4. Base Notes (The Drydown / Notes de Fond)

The base notes consist of heavy, dense molecules with high molecular weights and low volatility. They begin to emerge beneath the heart after an hour and remain anchored to your skin for 8 to 24+ hours.

- **Role**: The base anchors the entire architecture. It acts as a fixative, slowing down the evaporation of lighter notes, and creates the lingering trail (sillage) that stays with you into the evening.
- **Classic Materials**:
  - Resins & Balsams (Frankincense, Somali myrrh, benzoin, labdanum)
  - Precious Woods (Mysore sandalwood, Virginia cedar, smoky cade, agarwood/oud)
  - Earthy Roots & Fixatives (Bourbon vetiver, patchouli, plant ambers, oakmoss)
- **Signature Example**: In [Santal Céleste](/shop/santal-celeste) and [Oud Meridian Reserve](/shop/reserve-oud-meridian), the base rests on creamy aged Australian sandalwood and deep mineral musk that linger gracefully long after you have departed the room.

## 5. How Linear Fragrances Differ from Layered Pyramids

While traditional niche fragrances follow this evolving three-tier pyramid, certain modern fragrances are designed as "linear" or monolithic compositions—scents that maintain a consistent aroma profile from initial spray through the drydown. 

At Avelore, our philosophy favors slow-evolving multidimensional compositions because they tell an authentic temporal story that responds to your day, your mood, and the cooling of the evening air.
    `,
  },
  {
    slug: "eau-de-parfum-vs-eau-de-toilette",
    title: "Eau de Parfum vs Eau de Toilette: What's the Difference and Which Should You Choose?",
    metaTitle: "Eau de Parfum vs Eau de Toilette Explained | Avelore Guide",
    metaDescription: "Understand the key differences between Extrait de Parfum, Eau de Parfum, and Eau de Toilette. Learn about fragrance concentration, sillage, longevity, and price.",
    excerpt: "The fundamental distinction between fragrance designations lies in concentration percentage, carrier purity, and the architectural intention of the perfumer.",
    category: "Fragrance Education",
    author: "Avelore Perfumers",
    publishedDate: "2026-07-14T08:30:00Z",
    modifiedDate: "2026-10-18T16:00:00Z",
    readTime: "6 min read",
    wordCount: 790,
    featuredImage: "/journal/edp-vs-edt.jpg",
    relatedProductSlugs: ["reserve-cuir-nocturne", "reserve-iris-pallida", "solene", "bleu-meridian"],
    relatedCollectionSlugs: ["nocturne", "solar", "meridian"],
    content: `
When browsing luxury fragrance ateliers, you will encounter classic French designations: *Extrait de Parfum*, *Eau de Parfum*, *Eau de Toilette*, and *Eau de Cologne*. Far from being arbitrary marketing distinctions, these terms denote the exact concentration of pure perfume oil macerated within the alcohol carrier.

Choosing between an Eau de Parfum (EDP) and an Eau de Toilette (EDT) involves understanding how concentration impacts longevity, sillage (the scent trail you leave behind), and how the individual notes bloom throughout the day.

## 1. The Fragrance Concentration Spectrum

The concentration of pure aromatic essences determines the classification of any flacon:

| Classification | Fragrance Oil Concentration | Typical Longevity on Skin | Ideal Application Context |
| :--- | :--- | :--- | :--- |
| **Eau de Cologne (EDC)** | 2% – 5% | 1 to 2 Hours | Post-bath splash, morning refresh |
| **Eau de Toilette (EDT)** | 8% – 15% | 3 to 5 Hours | Daytime office wear, casual warm afternoons |
| **Eau de Parfum (EDP)** | 15% – 20% | 6 to 9 Hours | Day-to-night versatility, signature scent |
| **Extrait de Parfum / Pure Parfum** | 20% – 35%+ | 10 to 24+ Hours | Intimate luxury, evening galas, cold seasons |

At Avelore, our catalog focuses exclusively on **Eau de Parfum** and **Extrait de Parfum Millésimé** because our raw botanical absolutes demand sufficient lipid density to reveal their nuanced facets.

## 2. Does Higher Concentration Always Mean "Stronger"?

A common misconception is that an *Extrait de Parfum* will project across a ballroom and overpower everyone in proximity. In reality, the opposite is often true:

- **Eau de Toilette** contains a higher percentage of alcohol. Alcohol is highly volatile and evaporates vigorously, carrying top notes outward into the air. This produces strong immediate projection for the first hour, after which the scent rapidly fades.
- **Extrait de Parfum & EDP** have a higher percentage of viscous botanical oils and less alcohol. As a result, they sit closer to the skin, radiating a warm, intimate aura within arm's length that endures for 12 or more hours.

If you desire an intimate, magnetic trail that only those invited close can perceive, an Eau de Parfum or Extrait like [Cuir Nocturne Reserve](/shop/reserve-cuir-nocturne) is far superior to a volatile Eau de Toilette.

## 3. The Olfactory Formula Often Changes Between Concentrations

Many consumers assume an Eau de Parfum is simply an Eau de Toilette with less water. In reality, master perfumers often reformulate the composition to suit the carrier:

- An **Eau de Toilette** version will frequently highlight bright, effervescent top notes like sparkling citrus, pink pepper, and green aquatic facets.
- An **Eau de Parfum** version will deepen the heart florals and expand the resinous base—introducing richer amber, sandalwood, and orris butter like that found in [Iris Pallida Reserve](/shop/reserve-iris-pallida).

## 4. How to Apply for Optimal Longevity

Regardless of the concentration you select, proper application extends the life of your fragrance:

1. **Moisturize First**: Fragrance molecules adhere poorly to dry skin. Apply a fragrance-free lotion or a matching lipid balm like our [Velvet Body Cream](/shop/velvet-body-cream) or [Restorative Silk Body Oil](/shop/silk-body-oil) before spraying.
2. **Target High-Pulse Zones**: Spray where arterial blood flows close to the skin: the sides of the neck, behind the ears, the inner wrists, and inside the elbows.
3. **Mist Clothing & Hair**: Natural fibers like wool, silk, and linen hold fragrance oils gently without skin heat, allowing the scent to remain pristine for days.
4. **Store in Cool Darkness**: Never keep your precious flacons in a humid bathroom or on a sunlit dresser. Heat and UV light degrade volatile top notes within months.

Explore our full curated catalog of fine extraits and bespoke creations in the [Avelore Shop](/shop) or discover our seasonal curations in the [Fragrance Collections](/collections).
    `,
  },
];
