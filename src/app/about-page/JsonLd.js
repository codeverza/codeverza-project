// Server Component – no 'use client' needed
// Injects JSON-LD structured data for Organization + BreadcrumbList schemas

export default function JsonLd() {
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Codeverza',
    url: 'https://www.codeverza.com',
    logo: 'https://www.codeverza.com/img/codeverza-logo.png',
    description:
      'Codeverza is a full-service software house from Pakistan building high-performance web apps, mobile apps, and digital products for startups and enterprises worldwide.',
    foundingLocation: {
      '@type': 'Place',
      addressCountry: 'PK',
      addressLocality: 'Pakistan',
    },
    knowsAbout: [
      'Web Development',
      'Mobile App Development',
      'Next.js',
      'React',
      'Node.js',
      'Firebase',
      'UI/UX Design',
      'Software Architecture',
    ],
    sameAs: [
      'https://www.facebook.com/codeverza',
      'https://www.instagram.com/codeverza',
      'https://www.linkedin.com/company/codeverza',
      'https://twitter.com/codeverza',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      availableLanguage: ['English', 'Urdu'],
    },
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.codeverza.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'About Us',
        item: 'https://www.codeverza.com/about-page',
      },
    ],
  };

  const webPage = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About Codeverza – Software House Pakistan',
    url: 'https://www.codeverza.com/about-page',
    description:
      'Learn about Codeverza, a forward-thinking software house from Pakistan building digital experiences that drive real business growth.',
    inLanguage: 'en-US',
    isPartOf: {
      '@type': 'WebSite',
      name: 'Codeverza',
      url: 'https://www.codeverza.com',
    },
    about: {
      '@type': 'Organization',
      name: 'Codeverza',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPage) }}
      />
    </>
  );
}
