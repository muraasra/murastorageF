// Données structurées JSON-LD pour le SEO
export const useStructuredData = () => {
  const getOrganizationSchema = () => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Mura Storage",
    "alternateName": "Groupe Mura",
    "url": "https://murastorage.netlify.app",
    "logo": "https://murastorage.netlify.app/img/logo-mura-storage.png",
    "description": "Solution complète de gestion de stock et inventaire pour entreprises",
    "foundingDate": "2024",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "FR",
      "addressLocality": "France"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": "French"
    },
    "sameAs": [
      "https://murastorage.netlify.app"
    ]
  })

  const getSoftwareApplicationSchema = () => ({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Mura Storage",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "description": "Logiciel de gestion de stock et inventaire pour entreprises",
    "url": "https://murastorage.netlify.app",
    "author": {
      "@type": "Organization",
      "name": "Groupe Mura"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "EUR",
      "description": "Essai gratuit 14 jours"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "150"
    }
  })

  const getWebSiteSchema = () => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Mura Storage",
    "url": "https://murastorage.netlify.app",
    "description": "Solution complète de gestion de stock et inventaire pour entreprises",
    "publisher": {
      "@type": "Organization",
      "name": "Groupe Mura"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://murastorage.netlify.app/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  })

  const getBreadcrumbSchema = (breadcrumbs: Array<{name: string, url: string}>) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  })

  const getFAQSchema = (faqs: Array<{question: string, answer: string}>) => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  })

  return {
    getOrganizationSchema,
    getSoftwareApplicationSchema,
    getWebSiteSchema,
    getBreadcrumbSchema,
    getFAQSchema
  }
}
