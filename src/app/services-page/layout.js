export const metadata = {
  title: 'Services | Web, Mobile, AI & Design – Codeverza',
  description:
    'Codeverza offers end-to-end digital services — web development (Next.js, React), mobile apps, UI/UX design, AI solutions, cloud & DevOps, graphic design, motion graphics, and 24/7 support. Based in Pakistan, serving clients worldwide.',
  keywords: [
    'web development services Pakistan',
    'Next.js development company',
    'React development Pakistan',
    'mobile app development Pakistan',
    'UI UX design services',
    'AI solutions Pakistan',
    'cloud DevOps services',
    'graphic design Pakistan',
    'motion graphics Pakistan',
    'software house services Codeverza',
  ],
  alternates: {
    canonical: 'https://www.codeverza.com/services-page',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  openGraph: {
    title: 'Services | Web, Mobile, AI & Design – Codeverza',
    description:
      'From idea to deployment — Codeverza delivers end-to-end digital solutions: web apps, mobile apps, AI, cloud, UI/UX, graphic design, and motion graphics.',
    url: 'https://www.codeverza.com/services-page',
    siteName: 'Codeverza',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://www.codeverza.com/img/codeverza-logo.png',
        width: 1200,
        height: 630,
        alt: 'Codeverza Services – Software House Pakistan',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Services | Web, Mobile, AI & Design – Codeverza',
    description:
      'From idea to deployment — Codeverza delivers end-to-end digital solutions: web apps, mobile apps, AI, cloud, UI/UX, graphic design, and motion graphics.',
    images: ['https://www.codeverza.com/img/codeverza-logo.png'],
    creator: '@codeverza',
    site: '@codeverza',
  },
};

export default function ServicesLayout({ children }) {
  return <>{children}</>;
}
