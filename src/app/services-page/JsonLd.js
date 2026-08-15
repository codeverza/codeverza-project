// Server Component – no 'use client' needed

export default function JsonLd() {
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',     item: 'https://www.codeverza.com' },
      { '@type': 'ListItem', position: 2, name: 'Services', item: 'https://www.codeverza.com/services-page' },
    ],
  };

  const webPage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Services – Codeverza Software House',
    url: 'https://www.codeverza.com/services-page',
    description:
      'Codeverza offers end-to-end digital services including web development, mobile apps, UI/UX design, AI solutions, cloud & DevOps, graphic design, and motion graphics.',
    inLanguage: 'en-US',
    isPartOf: {
      '@type': 'WebSite',
      name: 'Codeverza',
      url: 'https://www.codeverza.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Codeverza',
      url: 'https://www.codeverza.com',
      logo: 'https://www.codeverza.com/img/codeverza-logo.png',
    },
  };

  const serviceList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Codeverza Services',
    url: 'https://www.codeverza.com/services-page',
    numberOfItems: 8,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        item: {
          '@type': 'Service',
          name: 'Web Development',
          description:
            'High-performance web applications using Next.js, React, and Node.js. From landing pages to enterprise platforms with clean, scalable code.',
          provider: { '@type': 'Organization', name: 'Codeverza' },
          areaServed: 'Worldwide',
          serviceType: 'Web Development',
        },
      },
      {
        '@type': 'ListItem',
        position: 2,
        item: {
          '@type': 'Service',
          name: 'Mobile App Development',
          description:
            'Cross-platform iOS & Android apps using React Native with push notifications, offline-first architecture, and App Store deployment.',
          provider: { '@type': 'Organization', name: 'Codeverza' },
          areaServed: 'Worldwide',
          serviceType: 'Mobile App Development',
        },
      },
      {
        '@type': 'ListItem',
        position: 3,
        item: {
          '@type': 'Service',
          name: 'UI / UX Design',
          description:
            'User-centered interface design with wireframing, interactive prototypes, design systems, WCAG accessibility, and Figma deliverables.',
          provider: { '@type': 'Organization', name: 'Codeverza' },
          areaServed: 'Worldwide',
          serviceType: 'UI/UX Design',
        },
      },
      {
        '@type': 'ListItem',
        position: 4,
        item: {
          '@type': 'Service',
          name: 'AI Solutions',
          description:
            'Custom AI chatbots, machine learning pipelines, NLP, computer vision, predictive analytics, and OpenAI & LLM integrations.',
          provider: { '@type': 'Organization', name: 'Codeverza' },
          areaServed: 'Worldwide',
          serviceType: 'Artificial Intelligence Solutions',
        },
      },
      {
        '@type': 'ListItem',
        position: 5,
        item: {
          '@type': 'Service',
          name: 'Cloud & DevOps',
          description:
            'AWS, GCP & Azure setup, CI/CD pipelines, Docker & Kubernetes orchestration, infrastructure as code, security audits, and 24/7 monitoring.',
          provider: { '@type': 'Organization', name: 'Codeverza' },
          areaServed: 'Worldwide',
          serviceType: 'Cloud & DevOps',
        },
      },
      {
        '@type': 'ListItem',
        position: 6,
        item: {
          '@type': 'Service',
          name: 'Support & Maintenance',
          description:
            'Ongoing bug fixes, security patches, feature enhancements, database optimization, uptime monitoring, and monthly consultations.',
          provider: { '@type': 'Organization', name: 'Codeverza' },
          areaServed: 'Worldwide',
          serviceType: 'Software Support & Maintenance',
        },
      },
      {
        '@type': 'ListItem',
        position: 7,
        item: {
          '@type': 'Service',
          name: 'Graphic Design & Branding',
          description:
            'Logo design, brand identity, social media graphics, marketing materials, business cards, and brand guidelines delivered in Figma & Photoshop.',
          provider: { '@type': 'Organization', name: 'Codeverza' },
          areaServed: 'Worldwide',
          serviceType: 'Graphic Design & Branding',
        },
      },
      {
        '@type': 'ListItem',
        position: 8,
        item: {
          '@type': 'Service',
          name: 'Motion Graphics & Animation',
          description:
            'Logo animations, 2D explainer videos, social media reels, product showcases, Lottie web animations, and After Effects motion design.',
          provider: { '@type': 'Organization', name: 'Codeverza' },
          areaServed: 'Worldwide',
          serviceType: 'Motion Graphics & Animation',
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
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
