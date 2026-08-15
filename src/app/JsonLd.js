// Server Component – homepage structured data

export default function HomeJsonLd() {
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Codeverza',
    url: 'https://www.codeverza.com',
    logo: 'https://www.codeverza.com/img/codeverza-logo.png',
    description:
      'Codeverza is a full-service software house from Pakistan building high-performance web apps, mobile apps, AI solutions, and digital products for startups and enterprises worldwide.',
    email: 'codeverza02@gmail.com',
    telephone: '+92-325-1507557',
    foundingLocation: {
      '@type': 'Place',
      addressCountry: 'PK',
      addressLocality: 'Pakistan',
    },
    areaServed: 'Worldwide',
    knowsAbout: [
      'Web Development',
      'Mobile App Development',
      'UI/UX Design',
      'Artificial Intelligence',
      'Cloud & DevOps',
      'Graphic Design',
      'Motion Graphics',
      'Next.js',
      'React',
      'Node.js',
      'Firebase',
    ],
    sameAs: [
      'https://www.instagram.com/codeverza',
      'https://www.linkedin.com/company/codeverza',
      'https://github.com/codeverza02',
      'https://wa.me/923251507557',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+92-325-1507557',
      email: 'codeverza02@gmail.com',
      contactType: 'customer support',
      areaServed: 'Worldwide',
      availableLanguage: ['English', 'Urdu'],
    },
  };

  const webSite = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Codeverza',
    url: 'https://www.codeverza.com',
    description:
      'Codeverza – a forward-thinking software house from Pakistan building digital experiences that drive real business growth.',
    inLanguage: 'en-US',
    publisher: {
      '@type': 'Organization',
      name: 'Codeverza',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://www.codeverza.com/?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const webPage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Codeverza – Software House Pakistan | Web, Mobile & AI Solutions',
    url: 'https://www.codeverza.com',
    description:
      'Codeverza is a Pakistan-based software house offering web development, mobile apps, UI/UX design, AI solutions, cloud & DevOps, graphic design, and motion graphics.',
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
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', 'h2', '.about-desc'],
    },
  };

  const serviceList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Codeverza Core Services',
    url: 'https://www.codeverza.com/services-page',
    numberOfItems: 8,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Web Development',            url: 'https://www.codeverza.com/services-page' },
      { '@type': 'ListItem', position: 2, name: 'Mobile App Development',     url: 'https://www.codeverza.com/services-page' },
      { '@type': 'ListItem', position: 3, name: 'UI / UX Design',             url: 'https://www.codeverza.com/services-page' },
      { '@type': 'ListItem', position: 4, name: 'AI Solutions',               url: 'https://www.codeverza.com/services-page' },
      { '@type': 'ListItem', position: 5, name: 'Cloud & DevOps',             url: 'https://www.codeverza.com/services-page' },
      { '@type': 'ListItem', position: 6, name: 'Graphic Design & Branding',  url: 'https://www.codeverza.com/services-page' },
      { '@type': 'ListItem', position: 7, name: 'Motion Graphics & Animation',url: 'https://www.codeverza.com/services-page' },
      { '@type': 'ListItem', position: 8, name: 'Support & Maintenance',      url: 'https://www.codeverza.com/services-page' },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSite) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPage) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceList) }}
      />
    </>
  );
}
