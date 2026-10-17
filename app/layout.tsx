import './globals.css';
import type { Metadata } from 'next';
import { Press_Start_2P, VT323 } from 'next/font/google';
import { portfolio } from '../content/portfolio';

const pressStart = Press_Start_2P({
  variable: '--font-press-start',
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
});

const vt323 = VT323({
  variable: '--font-vt323',
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(portfolio.meta.canonical),
  title: portfolio.meta.title,
  description: portfolio.meta.description,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: portfolio.meta.canonical,
    title: portfolio.meta.title,
    description: portfolio.meta.description,
    siteName: portfolio.name,
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: portfolio.meta.imageAlt }],
  },
  twitter: {
    card: 'summary_large_image',
    title: portfolio.meta.title,
    description: portfolio.meta.description,
    images: ['/opengraph-image'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: portfolio.name,
    url: portfolio.meta.canonical,
    affiliation: { '@type': 'CollegeOrUniversity', name: 'IIT Jodhpur' },
    sameAs: [portfolio.contact.links[0].href],
  };

  return (
    <html lang="en">
      <body className={pressStart.variable + ' ' + vt323.variable}>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }}
        />
      </body>
    </html>
  );
}
