import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://hydrate.js.org'),
  title: {
    default: 'HydrateBeer - React Performance Monitoring SDK | PostHog Analytics',
    template: '%s | HydrateBeer',
  },
  description: 'Lightweight, privacy-first performance monitoring SDK for React and Next.js. Track hydration timing, component renders, web vitals, and navigation performance with PostHog integration. Zero configuration required.',
  keywords: ['React performance monitoring', 'Next.js analytics', 'hydration tracking', 'web vitals', 'PostHog', 'component performance', 'React profiling', 'performance SDK', 'privacy-first analytics'],
  authors: [{ name: 'Akshat Mehta', url: 'https://akshatmehta.com' }],
  creator: 'Akshat Mehta',
  publisher: 'HydrateBeer',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://hydrate.js.org',
    title: 'HydrateBeer - React Performance Monitoring SDK',
    description: 'Zero-config performance monitoring for React and Next.js applications. Track hydration timing, component renders, and web vitals with privacy-first analytics powered by PostHog.',
    siteName: 'HydrateBeer',
    images: [
      {
        url: '/og/ogimage.png',
        width: 1200,
        height: 630,
        alt: 'HydrateBeer - React Performance Monitoring SDK',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HydrateBeer - React Performance Monitoring SDK',
    description: 'Zero-config performance monitoring for React and Next.js. Track hydration, renders, and web vitals with PostHog.',
    images: ['/og/ogimage.png'],
    creator: '@akshatmehta',
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
  icons: {
    icon: [
      { url: '/og/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/og/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/og/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'icon', url: '/og/favicon.ico' },
    ],
  },
  manifest: '/og/site.webmanifest',
  alternates: {
    canonical: 'https://hydrate.js.org',
    types: {
      'application/rss+xml': 'https://hydrate.js.org/rss.xml',
    },
  },
};

export default function Layout({ children }: LayoutProps<'/'>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'HydrateBeer',
    applicationCategory: 'DeveloperApplication',
    description: 'Lightweight, privacy-first performance monitoring SDK for React and Next.js applications',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    author: {
      '@type': 'Person',
      name: 'Akshat Mehta',
      url: 'https://akshatmehta.com',
    },
    url: 'https://hydrate.js.org',
    image: 'https://hydrate.js.org/og/ogimage.png',
    sameAs: [
      'https://github.com/nerkoux/hydratebeer',
      'https://github.com/nerkoux',
    ],
  };

  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
