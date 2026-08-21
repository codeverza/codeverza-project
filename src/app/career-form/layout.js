export const metadata = {
  title: 'Apply Now - Join Codeverza | Software House Career Opportunities',
  description: 'Apply for exciting career opportunities at Codeverza. Join our team of talented developers, designers, and digital professionals. Submit your application and start your journey with us.',
  keywords: [
    'Codeverza careers',
    'software house jobs',
    'apply for developer job',
    'tech career Pakistan',
    'software engineer jobs',
    'web developer jobs',
    'career application form',
    'join Codeverza team',
    'software development jobs',
    'IT jobs Pakistan',
    'remote developer jobs',
    'frontend developer careers',
    'backend developer careers',
    'full stack developer jobs',
  ].join(', '),
  authors: [{ name: 'Codeverza' }],
  creator: 'Codeverza',
  publisher: 'Codeverza',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://codeverza.vercel.app/career-form',
    siteName: 'Codeverza',
    title: 'Apply Now - Join Codeverza Team',
    description: 'Start your career with Codeverza. Apply for software development positions and join our innovative team building cutting-edge digital solutions.',
    images: [
      {
        url: 'https://res.cloudinary.com/icqvc17h/image/upload/v1787310867/codeverza-assets/codeverza-logo.png',
        width: 1200,
        height: 630,
        alt: 'Codeverza - Apply for Career',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Apply Now - Join Codeverza Team',
    description: 'Start your career with Codeverza. Apply for software development positions and join our innovative team.',
    images: ['https://res.cloudinary.com/icqvc17h/image/upload/v1787310867/codeverza-assets/codeverza-logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://codeverza.vercel.app/career-form',
  },
};

export default function CareerFormLayout({ children }) {
  return <>{children}</>;
}
