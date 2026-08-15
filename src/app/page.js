import Navbar from "./components/navbar";
import About from "./components/about";
import Services from "./components/services";
import Technologies from "./components/technologies";
import HowItWorks from "./components/how-it-work";
import Contact from "./components/contact";
import Footer from "./components/footer";
import HomeJsonLd from "./JsonLd";

export const metadata = {
  title: 'Codeverza – Software House Pakistan | Web, Mobile & AI Solutions',
  description:
    'Codeverza is a Pakistan-based software house building high-performance web apps, mobile apps, AI solutions, UI/UX designs, motion graphics, and cloud infrastructure for startups and enterprises worldwide.',
  keywords: [
    'software house Pakistan',
    'web development company Pakistan',
    'Next.js development Pakistan',
    'React development company',
    'mobile app development Pakistan',
    'AI solutions Pakistan',
    'UI UX design company',
    'custom software development',
    'IT company Pakistan',
    'Codeverza',
    'digital solutions Pakistan',
    'hire web developer Pakistan',
  ],
  alternates: {
    canonical: 'https://www.codeverza.com',
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
    title: 'Codeverza – Software House Pakistan | Web, Mobile & AI Solutions',
    description:
      'Codeverza is a Pakistan-based software house building cutting-edge web apps, mobile apps, AI solutions, and digital products for startups and enterprises worldwide.',
    url: 'https://www.codeverza.com',
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
    title: 'Codeverza – Software House Pakistan | Web, Mobile & AI Solutions',
    description:
      'Codeverza is a Pakistan-based software house building cutting-edge web apps, mobile apps, AI solutions, and digital products for startups and enterprises worldwide.',
    images: ['https://www.codeverza.com/img/codeverza-logo.png'],
    creator: '@codeverza',
    site: '@codeverza',
  },
};

export default function Home() {
  return (
    <>
      <HomeJsonLd />
      <div>
        <Navbar />
        <About />
        <Services />
        <Technologies />
        <HowItWorks />
        <Contact />
        <Footer />
      </div>
    </>
  );
}
