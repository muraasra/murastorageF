/**
 * Composable SEO/AEO/GEO centralisé pour Mura Storage.
 * SEO  = ranking Google classique (mots-clés, structured data)
 * AEO  = featured snippets, voice search, Google AI Overview (FAQPage, HowTo)
 * GEO  = être cité par ChatGPT / Perplexity / Gemini (SoftwareApplication, reviews, brand)
 */

export interface SeoConfig {
  title: string
  description: string
  keywords?: string
  ogImage?: string
  ogType?: 'website' | 'article' | 'product'
  canonical?: string
  noindex?: boolean
  structuredData?: object | object[]
}

export const SITE_URL = 'https://murastorage.com'
const DEFAULT_OG_IMAGE = `${SITE_URL}/img/og-murastorage.png`
const SITE_NAME = 'Mura Storage'

export const useSeo = (config: SeoConfig) => {
  const route = useRoute()
  const fullUrl = config.canonical || `${SITE_URL}${route.path}`

  const optimizedTitle = config.title.length > 70
    ? config.title.substring(0, 67) + '...'
    : config.title

  const optimizedDescription = config.description.length > 160
    ? config.description.substring(0, 157) + '...'
    : config.description

  const ogImage = config.ogImage || DEFAULT_OG_IMAGE

  const robotsContent = config.noindex
    ? 'noindex, nofollow'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'

  useSeoMeta({
    title: optimizedTitle,
    description: optimizedDescription,
    keywords: config.keywords,
    robots: robotsContent,
    ogTitle: optimizedTitle,
    ogDescription: optimizedDescription,
    ogImage: ogImage,
    ogImageAlt: config.title,
    ogImageWidth: '1200',
    ogImageHeight: '630',
    ogUrl: fullUrl,
    ogType: config.ogType || 'website',
    ogSiteName: SITE_NAME,
    ogLocale: 'fr_FR',
    twitterCard: 'summary_large_image',
    twitterTitle: optimizedTitle,
    twitterDescription: optimizedDescription,
    twitterImage: ogImage,
    author: 'Groupe Mura',
    'google-site-verification': '9artqrghm4Re-7Mtnpp73H61ynt3zNIncWDWGh96fuA'
  })

  useHead({
    link: [{ rel: 'canonical', href: fullUrl }]
  })

  // Structured data personnalisée (array ou objet)
  if (config.structuredData) {
    const items = Array.isArray(config.structuredData)
      ? config.structuredData
      : [config.structuredData]

    items.forEach(data => {
      useHead({
        script: [{ type: 'application/ld+json', children: JSON.stringify(data) }]
      })
    })
  }

  // Organisation par défaut sur toutes les pages (GEO : identité de marque)
  useHead({
    script: [{
      type: 'application/ld+json',
      children: JSON.stringify(createOrganizationData())
    }]
  })
}

// ── Schemas réutilisables ────────────────────────────────────────────────────

/** GEO/SEO : identité de la marque — cité par les IA génératives */
export function createOrganizationData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: 'Mura Storage',
    alternateName: 'MuraStorage',
    url: SITE_URL,
    logo: { '@type': 'ImageObject', url: `${SITE_URL}/img/logo-mura-storage.png` },
    description: 'Solution africaine de gestion de stock, inventaire et facturation multi-boutiques. Pensé pour les PME d\'Afrique.',
    foundingDate: '2024',
    areaServed: ['CM', 'CI', 'SN', 'BJ', 'TG', 'GN', 'ML', 'BF', 'GA', 'CG'],
    knowsLanguage: ['fr', 'en'],
    sameAs: ['https://murastorage.com'],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+237-658-934-147',
      contactType: 'customer support',
      email: 'support@murastorage.com',
      areaServed: 'CM',
      availableLanguage: ['fr', 'en']
    }
  }
}

/** SEO/GEO : pour être référencé comme logiciel dans les résultats et par les IA */
export function createSoftwareApplicationData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Mura Storage',
    operatingSystem: 'Web',
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'Inventory Management Software',
    description: 'Logiciel de gestion de stock, inventaire et facturation multi-boutiques pour PME africaines. Suivi en temps réel, codes-barres, transferts, analytiques.',
    url: SITE_URL,
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'XAF',
      lowPrice: '0',
      highPrice: '19900',
      offerCount: '4'
    },
    featureList: [
      'Gestion de stock multi-boutiques',
      'Facturation et devis',
      'Inventaires périodiques',
      'Codes-barres et QR codes',
      'Transferts entre boutiques',
      'Import/Export CSV et Excel',
      'Analytiques et rapports',
      'Gestion des partenaires',
      'Accès multi-utilisateurs'
    ],
    screenshot: `${SITE_URL}/img/logo-mura-storage.png`,
    softwareVersion: '2.0',
    releaseNotes: 'Version avec gestion multi-boutiques, plans Starter, Business et Pro.',
    inLanguage: 'fr',
    provider: {
      '@type': 'Organization',
      name: 'Groupe Mura',
      url: SITE_URL
    }
  }
}

/** AEO : crée des featured snippets et répond aux IA (FAQPage schema) */
export function createFAQData(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer
      }
    }))
  }
}

/** SEO : plans tarifaires avec rich results Google */
export function createPricingData() {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Mura Storage Starter',
      description: 'Gestion de stock pour petits commerces — 2 boutiques, 5 utilisateurs, 200 produits.',
      brand: { '@type': 'Brand', name: 'Mura Storage' },
      offers: {
        '@type': 'Offer',
        price: '4900',
        priceCurrency: 'XAF',
        priceValidUntil: '2026-12-31',
        availability: 'https://schema.org/InStock',
        url: `${SITE_URL}/home/tarification`
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Mura Storage Business',
      description: 'Solution complète pour PME — 3 boutiques, 15 utilisateurs, 1 000 produits, factures illimitées.',
      brand: { '@type': 'Brand', name: 'Mura Storage' },
      offers: {
        '@type': 'Offer',
        price: '9900',
        priceCurrency: 'XAF',
        priceValidUntil: '2026-12-31',
        availability: 'https://schema.org/InStock',
        url: `${SITE_URL}/home/tarification`
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Mura Storage Pro',
      description: 'Toutes les fonctionnalités sans limite — 10 boutiques, 50 utilisateurs, API, analytiques avancées.',
      brand: { '@type': 'Brand', name: 'Mura Storage' },
      offers: {
        '@type': 'Offer',
        price: '19900',
        priceCurrency: 'XAF',
        priceValidUntil: '2026-12-31',
        availability: 'https://schema.org/InStock',
        url: `${SITE_URL}/home/tarification`
      }
    }
  ]
}

/** SEO local : pour les entreprises locales / Google Maps */
export function createLocalBusinessData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${SITE_URL}/#software`,
    name: 'Mura Storage',
    url: SITE_URL,
    telephone: '+237658934147',
    email: 'support@murastorage.com',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Yaoundé',
      addressCountry: 'CM'
    }
  }
}

/** WebPage pour les pages internes */
export function createWebPageStructuredData(title: string, description: string, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url,
    inLanguage: 'fr-FR',
    isPartOf: { '@type': 'WebSite', name: 'Mura Storage', url: SITE_URL }
  }
}

/** WebSite avec SearchAction */
export function createWebSiteStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Mura Storage',
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
      'query-input': 'required name=search_term_string'
    }
  }
}
