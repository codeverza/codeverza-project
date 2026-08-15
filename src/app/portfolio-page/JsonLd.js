// Server Component – no 'use client' needed
// Injects JSON-LD structured data for Portfolio page

export default function JsonLd() {
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
        name: 'Portfolio',
        item: 'https://www.codeverza.com/portfolio-page',
      },
    ],
  };

  const webPage = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Portfolio – Codeverza Software House',
    url: 'https://www.codeverza.com/portfolio-page',
    description:
      'Explore Codeverza\'s portfolio of real-world projects including e-commerce platforms, web apps, EV charging systems, brand identities, UI/UX designs, and motion graphics.',
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

  const projectList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Codeverza Projects Portfolio',
    description: 'A collection of web development, design, and animation projects by Codeverza.',
    url: 'https://www.codeverza.com/portfolio-page',
    numberOfItems: 7,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'A.H Garments — Premium Lingerie E-Commerce Store',
        description:
          'A fully custom e-commerce platform built for A.H Garments using Next.js, Firebase, and Tailwind CSS with cart, wishlist, admin panel, and order tracking.',
        url: 'https://ahgarments.pk',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Ayaz Ahmad Academy — Education Platform',
        description:
          'A fully animated 5-page educational website with student & teacher registration, automated emails, and Firebase backend.',
        url: 'https://www.ayazahmadacademy.com',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'VoltrixStation — EV Charging Platform',
        description:
          'A full-featured electric vehicle charging management platform with real-time session tracking, unique session codes, and an admin panel. Built with Next.js and Firebase.',
        url: 'https://voltrixstation.com',
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: 'DFTL — Dawood Family Takaful Corporate Website',
        description:
          'Official corporate website for Dawood Family Takaful Ltd. migrated to Next.js for performance and SEO improvements. Built with Bootstrap and SQL backend.',
        url: 'https://www.codeverza.com/portfolio-page',
      },
      {
        '@type': 'ListItem',
        position: 5,
        name: 'Brand Identity — TechStart',
        description:
          'Complete brand identity design including logo, color palette, typography, and brand guidelines for a tech startup. Designed in Figma and Adobe Illustrator.',
        url: 'https://www.codeverza.com/portfolio-page',
      },
      {
        '@type': 'ListItem',
        position: 6,
        name: 'Motion Graphics — Product Launch Video',
        description:
          'Animated product launch video with kinetic typography, particle effects, and brand-aligned color grading. Created in Adobe After Effects.',
        url: 'https://www.codeverza.com/portfolio-page',
      },
      {
        '@type': 'ListItem',
        position: 7,
        name: 'Logo Animation — SaaS Brand (Lottie)',
        description:
          'Professional logo animation exported as Lottie JSON for seamless web and app integration. Multiple variants for loading screen, splash screen, and website intro.',
        url: 'https://www.codeverza.com/portfolio-page',
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectList) }}
      />
    </>
  );
}
