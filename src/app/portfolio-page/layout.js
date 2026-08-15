export const metadata = {
  title: 'Portfolio | Our Work – Codeverza Software House',
  description:
    'Explore Codeverza\'s portfolio of real-world projects — e-commerce platforms, web apps, EV charging systems, brand identities, UI/UX designs, and motion graphics. Built with Next.js, React, Firebase, and more.',
  keywords: [
    'Codeverza portfolio',
    'software house projects Pakistan',
    'web development portfolio',
    'Next.js projects',
    'React projects',
    'e-commerce website Pakistan',
    'Firebase web app',
    'UI UX design portfolio',
    'motion graphics portfolio',
    'brand identity design Pakistan',
  ],
  alternates: {
    canonical: 'https://www.codeverza.com/portfolio-page',
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
    title: 'Portfolio | Our Work – Codeverza Software House',
    description:
      'Real projects. Real results. Explore Codeverza\'s work — from e-commerce platforms and SaaS web apps to brand identities and motion graphics.',
    url: 'https://www.codeverza.com/portfolio-page',
    siteName: 'Codeverza',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://www.codeverza.com/img/codeverza-logo.png',
        width: 1200,
        height: 630,
        alt: 'Codeverza Portfolio – Software House Pakistan',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Portfolio | Our Work – Codeverza Software House',
    description:
      'Real projects. Real results. Explore Codeverza\'s work — from e-commerce platforms and SaaS web apps to brand identities and motion graphics.',
    images: ['https://www.codeverza.com/img/codeverza-logo.png'],
    creator: '@codeverza',
    site: '@codeverza',
  },
};

export default function PortfolioLayout({ children }) {
  return <>{children}</>;
}
