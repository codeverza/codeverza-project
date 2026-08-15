// Server Component – no 'use client' needed
// Injects JSON-LD structured data for Career page

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
        name: 'Careers',
        item: 'https://www.codeverza.com/career-page',
      },
    ],
  };

  const jobPosting = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: 'Sales Representative',
    description:
      'Codeverza is looking for motivated and results-driven Sales Representatives who can identify potential clients, generate leads, and bring software and digital projects to the company. This is a fully remote, commission-based opportunity open to candidates worldwide.',
    datePosted: '2025-01-01',
    validThrough: '2026-12-31',
    employmentType: 'CONTRACTOR',
    hiringOrganization: {
      '@type': 'Organization',
      name: 'Codeverza',
      sameAs: 'https://www.codeverza.com',
      logo: 'https://www.codeverza.com/img/codeverza-logo.png',
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'PK',
        addressLocality: 'Pakistan',
      },
    },
    applicantLocationRequirements: {
      '@type': 'Country',
      name: 'Worldwide',
    },
    jobLocationType: 'TELECOMMUTE',
    workHours: 'Flexible',
    baseSalary: {
      '@type': 'MonetaryAmount',
      currency: 'PKR',
      value: {
        '@type': 'QuantitativeValue',
        minValue: 0,
        unitText: 'MONTH',
        description: 'Commission-based — unlimited earning potential',
      },
    },
    responsibilities: [
      'Identify and approach potential clients who require software or digital services.',
      'Generate leads through your own network, social media, LinkedIn, freelancing platforms, or referrals.',
      'Introduce clients to Codeverza\'s services in a professional manner.',
      'Assist in communication during initial project discussions and deal confirmation.',
      'Build and maintain strong relationships with potential and existing clients.',
    ],
    qualifications:
      'Strong communication and negotiation skills. Self-motivated and target-oriented. Basic understanding of software or digital services is preferred.',
    skills: 'Sales, Lead Generation, Client Communication, Business Development, Networking',
    industry: 'Software Development',
    occupationalCategory: 'Sales Representative',
    url: 'https://www.codeverza.com/career-page',
    directApply: true,
  };

  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How do I apply for a position at Codeverza?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Simply visit our Contact page and send us a message mentioning the position you are interested in. Our team will get back to you with the next steps.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are all positions at Codeverza remote?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. All current and future openings at Codeverza are fully remote. You can work from anywhere in the world with no geographical restrictions.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do I need a formal degree or certification to apply?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Not necessarily. We value skills, attitude, and the ability to deliver results over formal qualifications. Each position has its own requirements listed in the job description.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does the earning structure work at Codeverza?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Earning structures vary by role. Some positions are performance-based where your income grows with your results. Details are always clearly mentioned in each job listing.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the commission process — how and when do I get paid?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Once you bring a client and the project is confirmed, our team handles the development and delivery. After the project is successfully completed and the client payment has been received, your agreed commission is paid to you.',
        },
      },
      {
        '@type': 'Question',
        name: 'If I bring more sales, will I receive additional incentives?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. At Codeverza, we recognize and reward consistent high performance. If you regularly bring valuable projects, you may receive additional performance-based incentives on top of your regular earnings.',
        },
      },
      {
        '@type': 'Question',
        name: 'Will there be more job openings in the future?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. As Codeverza grows, we will be adding new positions across different departments. Keep checking this page for the latest opportunities.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I apply even if there is no matching opening right now?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Absolutely. If you believe you can add value to Codeverza, reach out to us through the Contact page. We are always open to connecting with talented and motivated individuals.',
        },
      },
    ],
  };

  const webPage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Careers at Codeverza – Join Our Remote Team',
    url: 'https://www.codeverza.com/career-page',
    description:
      'Join Codeverza as a remote Sales Representative. Earn unlimited commission, work from anywhere, and grow with a fast-moving software house from Pakistan.',
    inLanguage: 'en-US',
    isPartOf: {
      '@type': 'WebSite',
      name: 'Codeverza',
      url: 'https://www.codeverza.com',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPosting) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPage) }}
      />
    </>
  );
}
