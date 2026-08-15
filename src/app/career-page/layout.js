export const metadata = {
  title: 'Careers | Join Our Team – Codeverza Software House',
  description:
    'Join Codeverza as a remote Sales Representative. Earn unlimited commission, work from anywhere, and grow with a fast-moving software house from Pakistan. Apply now.',
  keywords: [
    'Codeverza careers',
    'jobs at Codeverza',
    'remote sales job Pakistan',
    'software house jobs',
    'commission based job Pakistan',
    'work from home sales representative',
    'remote job Pakistan',
    'IT sales job',
    'business development remote',
    'freelance sales opportunity Pakistan',
  ],
  alternates: {
    canonical: 'https://www.codeverza.com/career-page',
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
    title: 'Careers | Join Our Team – Codeverza Software House',
    description:
      'Work remotely, earn unlimited commission, and grow with Codeverza. We are hiring Sales Representatives — apply today.',
    url: 'https://www.codeverza.com/career-page',
    siteName: 'Codeverza',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://www.codeverza.com/img/codeverza-logo.png',
        width: 1200,
        height: 630,
        alt: 'Careers at Codeverza – Software House Pakistan',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Careers | Join Our Team – Codeverza Software House',
    description:
      'Work remotely, earn unlimited commission, and grow with Codeverza. We are hiring Sales Representatives — apply today.',
    images: ['https://www.codeverza.com/img/codeverza-logo.png'],
    creator: '@codeverza',
    site: '@codeverza',
  },
};

export default function CareerLayout({ children }) {
  return <>{children}</>;
}
