export default function JsonLd() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://codeverza.vercel.app',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Careers',
        item: 'https://codeverza.vercel.app/career-page',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Apply Now',
        item: 'https://codeverza.vercel.app/career-form',
      },
    ],
  };

  const jobPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: 'Software Development Positions at Codeverza',
    description: 'Join Codeverza and work on cutting-edge web applications, mobile apps, and digital solutions. We are looking for talented developers, designers, and tech professionals.',
    identifier: {
      '@type': 'PropertyValue',
      name: 'Codeverza',
      value: 'CODEVERZA-2026-DEV',
    },
    datePosted: '2026-01-01',
    validThrough: '2026-12-31',
    employmentType: ['FULL_TIME', 'PART_TIME', 'CONTRACTOR'],
    hiringOrganization: {
      '@type': 'Organization',
      name: 'Codeverza',
      sameAs: 'https://codeverza.vercel.app',
      logo: 'https://res.cloudinary.com/icqvc17h/image/upload/v1787310867/codeverza-assets/codeverza-logo.png',
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'PK',
        addressLocality: 'Pakistan',
      },
    },
    baseSalary: {
      '@type': 'MonetaryAmount',
      currency: 'PKR',
      value: {
        '@type': 'QuantitativeValue',
        minValue: 50000,
        maxValue: 200000,
        unitText: 'MONTH',
      },
    },
    qualifications: 'Experience in web development, programming languages (JavaScript, Python, etc.), problem-solving skills, and passion for technology.',
    responsibilities: 'Develop and maintain web applications, collaborate with team members, write clean and efficient code, participate in code reviews, and contribute to product innovation.',
    skills: 'JavaScript, React, Next.js, Node.js, Python, Git, API development, responsive design, problem-solving',
    workHours: 'Flexible working hours with remote options available',
    benefits: 'Competitive salary, remote work opportunities, professional development, collaborative environment, innovative projects',
    applicationContact: {
      '@type': 'ContactPoint',
      telephone: '+92-325-1507557',
      email: 'careers@codeverza.com',
      contactType: 'HR',
    },
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Codeverza',
    url: 'https://codeverza.vercel.app',
    logo: 'https://res.cloudinary.com/icqvc17h/image/upload/v1787310867/codeverza-assets/codeverza-logo.png',
    description: 'Codeverza is a software house specializing in web development, mobile applications, and digital solutions.',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+92-325-1507557',
      contactType: 'Customer Service',
      email: 'info@codeverza.com',
      availableLanguage: ['English', 'Urdu'],
    },
    sameAs: [
      'https://linkedin.com/company/codeverza',
      'https://github.com/codeverza',
      'https://instagram.com/codeverza',
    ],
  };

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Apply Now - Codeverza Career Application',
    description: 'Submit your application to join Codeverza. Apply for software development, design, and tech positions.',
    url: 'https://codeverza.vercel.app/career-form',
    inLanguage: 'en-US',
    isPartOf: {
      '@type': 'WebSite',
      name: 'Codeverza',
      url: 'https://codeverza.vercel.app',
    },
    breadcrumb: breadcrumbSchema,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
    </>
  );
}
