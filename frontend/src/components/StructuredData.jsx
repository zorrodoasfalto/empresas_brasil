import React from 'react';
import { Helmet } from 'react-helmet-async';

// Componente para dados estruturados da aplicação principal
export const SoftwareApplicationSchema = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Data Atlas",
    "alternateName": "Data Atlas Brasil",
    "description": "Plataforma de inteligência empresarial com acesso a 66+ milhões de empresas brasileiras, prospecção multicanal e CRM integrado",
    "url": "https://dataatlas.com.br",
    "downloadUrl": "https://dataatlas.com.br/register",
    "installUrl": "https://dataatlas.com.br/register",
    "screenshot": "https://dataatlas.com.br/dashboard-screenshot.jpg",
    "logo": "https://dataatlas.com.br/logo.png",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser, Windows, macOS, Linux",
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "softwareVersion": "6.4",
    "releaseDate": "2024-01-01",
    "dateModified": "2025-01-01",
    "publisher": {
      "@type": "Organization",
      "@id": "https://dataatlas.com.br/#organization"
    },
    "author": {
      "@type": "Organization",
      "@id": "https://dataatlas.com.br/#organization"
    },
    "creator": {
      "@type": "Organization", 
      "@id": "https://dataatlas.com.br/#organization"
    },
    "featureList": [
      "Busca em 66+ milhões de empresas brasileiras",
      "Prospecção Instagram, LinkedIn e Google Maps",
      "CRM integrado com funil de vendas Kanban",
      "Exportação Excel (.xlsx) e CSV nativa",
      "32+ campos por empresa exportados",
      "Dados de sócios detalhados (3+ por empresa)",
      "Performance: 50k empresas em 2,5 minutos",
      "Sistema de afiliados com comissão recorrente",
      "API de consultas empresariais",
      "Dados oficiais da Receita Federal"
    ],
    "offers": [
      {
        "@type": "Offer",
        "name": "Plano Pro",
        "description": "7 dias de teste gratuito + Plano Pro mensal",
        "price": "97.00",
        "priceCurrency": "BRL",
        "priceValidUntil": "2025-12-31",
        "availability": "https://schema.org/InStock",
        "validFrom": "2025-01-01",
        "category": "Pro",
        "hasFreeOffer": true,
        "eligibleRegion": {
          "@type": "Country",
          "name": "Brasil"
        }
      },
      {
        "@type": "Offer", 
        "name": "Plano Premium",
        "description": "Recursos avançados + suporte premium",
        "price": "147.00",
        "priceCurrency": "BRL",
        "priceValidUntil": "2025-12-31",
        "availability": "https://schema.org/InStock", 
        "validFrom": "2025-01-01",
        "category": "Premium",
        "hasFreeOffer": true
      },
      {
        "@type": "Offer",
        "name": "Plano Max", 
        "description": "Acesso completo + recursos ilimitados",
        "price": "247.00",
        "priceCurrency": "BRL",
        "priceValidUntil": "2025-12-31",
        "availability": "https://schema.org/InStock",
        "validFrom": "2025-01-01", 
        "category": "Max",
        "hasFreeOffer": true
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "127",
      "bestRating": "5",
      "worstRating": "1"
    },
    "supportingData": [
      {
        "@type": "Dataset",
        "name": "Base de Empresas Brasileiras",
        "description": "66+ milhões de empresas com dados da Receita Federal",
        "creator": "Receita Federal do Brasil",
        "dateModified": "2025-01-01"
      }
    ]
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData, null, 2)}
      </script>
    </Helmet>
  );
};

// Dados estruturados da organização
export const OrganizationSchema = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://dataatlas.com.br/#organization",
    "name": "Data Atlas",
    "alternateName": "Data Atlas Brasil",
    "url": "https://dataatlas.com.br",
    "logo": "https://dataatlas.com.br/logo.png",
    "image": "https://dataatlas.com.br/og-image.jpg",
    "description": "Maior base de dados empresariais do Brasil com 66+ milhões de empresas e ferramentas avançadas de prospecção B2B",
    "foundingDate": "2024",
    "founder": {
      "@type": "Person",
      "name": "Equipe Data Atlas"
    },
    "numberOfEmployees": {
      "@type": "QuantitativeValue",
      "value": "10-50"
    },
    "industry": "Software de Inteligência Empresarial",
    "knowsAbout": [
      "Dados empresariais brasileiros",
      "Prospecção B2B", 
      "CRM e funil de vendas",
      "LinkedIn Scraping",
      "Instagram Scraping", 
      "Google Maps Scraping",
      "Inteligência comercial",
      "Automação de vendas",
      "Base de dados CNPJ",
      "Receita Federal"
    ],
    "serviceArea": {
      "@type": "Country",
      "name": "Brasil"
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "BR",
      "addressRegion": "Brasil"
    },
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": "+55-19-99275-3157",
        "contactType": "customer service",
        "availableLanguage": ["Portuguese"],
        "areaServed": "BR"
      },
      {
        "@type": "ContactPoint", 
        "email": "contato@dataatlas.com",
        "contactType": "customer service",
        "availableLanguage": ["Portuguese"]
      }
    ],
    "sameAs": [
      "https://dataatlas.com.br"
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Planos Data Atlas",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Data Atlas Pro"
          }
        },
        {
          "@type": "Offer", 
          "itemOffered": {
            "@type": "Product",
            "name": "Data Atlas Premium"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product", 
            "name": "Data Atlas Max"
          }
        }
      ]
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData, null, 2)}
      </script>
    </Helmet>
  );
};

// FAQ Schema para páginas de dúvidas
export const FAQSchema = ({ faqs }) => {
  const structuredData = {
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
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData, null, 2)}
      </script>
    </Helmet>
  );
};

// Schema para produtos/serviços específicos
export const ServiceSchema = ({ service }) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": service.name,
    "description": service.description,
    "provider": {
      "@type": "Organization",
      "@id": "https://dataatlas.com.br/#organization"
    },
    "areaServed": {
      "@type": "Country",
      "name": "Brasil"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": service.name,
      "itemListElement": service.features?.map(feature => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "Product",
          "name": feature
        }
      })) || []
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData, null, 2)}
      </script>
    </Helmet>
  );
};

// Breadcrumb Schema (usado automaticamente pelo componente Breadcrumb)
export const BreadcrumbSchema = ({ breadcrumbs }) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((breadcrumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": breadcrumb.name,
      "item": `https://dataatlas.com.br${breadcrumb.path}`
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData, null, 2)}
      </script>
    </Helmet>
  );
};

export default {
  SoftwareApplicationSchema,
  OrganizationSchema,
  FAQSchema,
  ServiceSchema,
  BreadcrumbSchema
};