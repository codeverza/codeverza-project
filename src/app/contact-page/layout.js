export const metadata = {
  title: 'Contact Us | Start Your Project – Codeverza',
  description:
    'Get in touch with Codeverza. Send us your project details and we\'ll reply within 24 hours. Reach us via email at codeverza02@gmail.com or WhatsApp at +92 325 1507557. Free consultation available.',
  keywords: [
    'contact Codeverza',
    'hire software house Pakistan',
    'get a quote web development',
    'contact web developer Pakistan',
    'start a project Codeverza',
    'software development inquiry',
    'web development consultation Pakistan',
    'hire Next.js developer',
    'get website made Pakistan',
    'Codeverza email WhatsApp',
  ],
  alternates: {
    canonical: 'https://www.codeverza.com/contact-page',
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
    title: 'Contact Us | Start Your Project – Codeverza',
    description:
      'Have a project in mind? Contact Codeverza and get a free consultation. We reply within 24 hours via email or WhatsApp.',
    url: 'https://www.codeverza.com/contact-page',
    siteName: 'Codeverza',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://www.codeverza.com/img/codeverza-logo.png',
        width: 1200,
        height: 630,
        alt: 'Contact Codeverza – Software House Pakistan',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us | Start Your Project – Codeverza',
    description:
      'Have a project in mind? Contact Codeverza and get a free consultation. We reply within 24 hours via email or WhatsApp.',
    images: ['https://www.codeverza.com/img/codeverza-logo.png'],
    creator: '@codeverza',
    site: '@codeverza',
  },
};

export default function ContactLayout({ children }) {
  return <>{children}</>;
}
