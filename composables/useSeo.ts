/**
 * Composable pour gérer les meta tags SEO de manière centralisée
 */

export interface SeoConfig {
  title: string
  description: string
  keywords?: string
  ogImage?: string
  ogType?: 'website' | 'article' | 'product'
  canonical?: string
  noindex?: boolean
  structuredData?: object
}

const SITE_URL = 'https://murastorage.netlify.app'
const DEFAULT_OG_IMAGE = `${SITE_URL}/img/og-image-MuraSrorage.png`
const SITE_NAME = 'Mura Storage'

export const useSeo = (config: SeoConfig) => {
  const route = useRoute()
  const fullUrl = config.canonical || `${SITE_URL}${route.path}`
  
  // Title optimisé (55-70 caractères)
  const optimizedTitle = config.title.length > 70 
    ? config.title.substring(0, 67) + '...'
    : config.title
  
  // Description optimisée (150-160 caractères)
  const optimizedDescription = config.description.length > 160
    ? config.description.substring(0, 157) + '...'
    : config.description

  // Image OG
  const ogImage = config.ogImage || DEFAULT_OG_IMAGE

  // Robots meta
  const robotsContent = config.noindex 
    ? 'noindex, nofollow' 
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'

  // Meta tags de base
  useSeoMeta({
    title: optimizedTitle,
    description: optimizedDescription,
    keywords: config.keywords,
    robots: robotsContent,
    ogTitle: optimizedTitle,
    ogDescription: optimizedDescription,
    ogImage: ogImage,
    ogImageAlt: config.title,
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

  // Canonical URL
  useHead({
    link: [
      {
        rel: 'canonical',
        href: fullUrl
      }
    ]
  })

  // Structured Data (JSON-LD)
  if (config.structuredData) {
    useHead({
      script: [
        {
          type: 'application/ld+json',
          children: JSON.stringify(config.structuredData)
        }
      ]
    })
  }

  // Structured Data par défaut (Organization)
  const defaultStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Mura Storage',
    url: SITE_URL,
    logo: `${SITE_URL}/img/og-image-MuraSrorage.png`,
    description: 'Solution complète de gestion de stock, inventaire et facturation pour entreprises.',
    sameAs: [
      // Ajouter les réseaux sociaux si disponibles
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+237-658-934-147',
      contactType: 'Support client',
      areaServed: 'CM',
      availableLanguage: ['fr', 'en']
    }
  }

  useHead({
    script: [
      {
        type: 'application/ld+json',
        children: JSON.stringify(defaultStructuredData)
      }
    ]
  })
}

/**
 * Structured Data pour une page Web
 */
export const createWebPageStructuredData = (title: string, description: string, url: string) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description: description,
    url: url,
    inLanguage: 'fr-FR',
    isPartOf: {
      '@type': 'WebSite',
      name: 'Mura Storage',
      url: 'https://murastorage.netlify.app'
    }
  }
}

/**
 * Structured Data pour le site Web
 */
export const createWebSiteStructuredData = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Mura Storage',
    url: 'https://murastorage.netlify.app',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://murastorage.netlify.app/search?q={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    }
  }
}



