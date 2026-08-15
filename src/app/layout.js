import { Poppins } from "next/font/google";
import "./globals.css";
import OneSignalInit from "./components/OneSignalInit";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata = {
  metadataBase: new URL('https://www.codeverza.com'),
  title: {
    default: 'Codeverza – Software House Pakistan',
    template: '%s | Codeverza',
  },
  description:
    'Codeverza is a full-service software house from Pakistan. We build high-performance web apps, mobile apps, and digital products using Next.js, React, Node.js, and Firebase.',
  keywords: [
    'Codeverza',
    'software house Pakistan',
    'web development',
    'mobile app development',
    'Next.js',
    'React',
    'Node.js',
    'Firebase',
    'custom software',
    'IT company Pakistan',
  ],
  authors: [{ name: 'Codeverza', url: 'https://www.codeverza.com' }],
  creator: 'Codeverza',
  publisher: 'Codeverza',
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
    type: 'website',
    locale: 'en_US',
    siteName: 'Codeverza',
    title: 'Codeverza – Software House Pakistan',
    description:
      'Codeverza is a full-service software house from Pakistan building cutting-edge web and mobile solutions for startups and enterprises worldwide.',
    images: [
      {
        url: '/img/codeverza-logo.png',
        width: 1200,
        height: 630,
        alt: 'Codeverza – Software House Pakistan',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Codeverza – Software House Pakistan',
    description:
      'Codeverza is a full-service software house from Pakistan building cutting-edge web and mobile solutions for startups and enterprises worldwide.',
    images: ['/img/codeverza-logo.png'],
    creator: '@codeverza',
    site: '@codeverza',
  },
  icons: {
    icon: '/favicon-32x32.png',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
    other: [
      { rel: 'icon', url: '/android-chrome-192x192.png', sizes: '192x192' },
      { rel: 'icon', url: '/android-chrome-512x512.png', sizes: '512x512' },
    ],
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="font-poppins antialiased" id="__next">
        <OneSignalInit />
        {children}
      </body>
    </html>
  );
}
