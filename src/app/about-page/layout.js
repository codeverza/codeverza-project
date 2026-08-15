export const metadata = {
  title: 'About Us | Codeverza – Software House Pakistan',
  description:
    'Learn about Codeverza, a forward-thinking software house from Pakistan. We build high-performance web apps, mobile apps, and digital products using Next.js, React, Node.js, and Firebase.',
  keywords: [
    'Codeverza',
    'software house Pakistan',
    'about Codeverza',
    'web development Pakistan',
    'Next.js development',
    'React development',
    'mobile app development',
    'custom software development',
    'digital products Pakistan',
    'IT company Pakistan',
  ],
  alternates: {
    canonical: 'https://www.codeverza.com/about-page',
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
    title: 'About Us | Codeverza – Software House Pakistan',
    description:
      'Codeverza is a full-service software house from Pakistan building cutting-edge web and mobile solutions for startups and enterprises worldwide.',
    url: 'https://www.codeverza.com/about-page',
    siteName: 'Codeverza',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://www.codeverza.com/img/codeverza-logo.png',
        width: 1200,
        height: 630,
        alt: 'Codeverza – Software House Pakistan',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us | Codeverza – Software House Pakistan',
    description:
      'Codeverza is a full-service software house from Pakistan building cutting-edge web and mobile solutions for startups and enterprises worldwide.',
    images: ['https://www.codeverza.com/img/codeverza-logo.png'],
    creator: '@codeverza',
    site: '@codeverza',
  },
};

export default function AboutLayout({ children }) {
  return <>{children}</>;
}
