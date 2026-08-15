// Server Component – no 'use client' needed

export default function JsonLd() {
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',       item: 'https://www.codeverza.com' },
      { '@type': 'ListItem', position: 2, name: 'Contact Us', item: 'https://www.codeverza.com/contact-page' },
    ],
  };

  const contactPage = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact Codeverza – Start Your Project',
    url: 'https://www.codeverza.com/contact-page',
    description:
      'Get in touch with Codeverza. Send your project details and receive a free consultation. We reply within 24 hours via email or WhatsApp.',
    inLanguage: 'en-US',
    isPartOf: {
      '@type': 'WebSite',
      name: 'Codeverza',
      url: 'https://www.codeverza.com',
    },
  };

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Codeverza',
    url: 'https://www.codeverza.com',
    logo: 'https://www.codeverza.com/img/codeverza-logo.png',
    email: 'codeverza02@gmail.com',
    telephone: '+92-325-1507557',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'PK',
      addressLocality: 'Pakistan',
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+92-325-1507557',
        contactType: 'customer support',
        contactOption: 'TollFree',
        areaServed: 'Worldwide',
        availableLanguage: ['English', 'Urdu'],
        hoursAvailable: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          opens: '09:00',
          closes: '19:00',
        },
      },
      {
        '@type': 'ContactPoint',
        email: 'codeverza02@gmail.com',
        contactType: 'customer support',
        areaServed: 'Worldwide',
        availableLanguage: ['English', 'Urdu'],
      },
    ],
    sameAs: [
      'https://www.instagram.com/codeverza',
      'https://www.linkedin.com/company/codeverza',
      'https://github.com/codeverza02',
    ],
  };

  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How long does a project take?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Timelines vary by scope. A simple website takes 1–2 weeks; complex apps can take 4–12 weeks. We always give a clear estimate upfront.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do you work with international clients?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Absolutely. We work with clients across Pakistan, UK, UAE, USA, and beyond. Communication is fully remote and seamless.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is your payment structure?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We typically work with a 50% upfront and 50% on delivery model. Milestone-based payments are also available for larger projects.',
        },
      },
      {
        '@type': 'Question',
        name: 'Will I own the source code?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Once the project is complete and payment is settled, full ownership of the source code transfers to you.',
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPage) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }}
      />
    </>
  );
}
