import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata = {
  metadataBase: new URL('https://vericheck.ai'), // Replace with your actual domain later
  title: 'VeriCheck — The World’s Fastest AI Fact Checker | 99% Verified Accuracy',
  description:
    'Instantly verify any claim, news headline, or tweet with VeriCheck. Powered by Gemini 1.5 & GPT-4o, get sub-2-second verdicts with trusted sources and deep analysis.',
  keywords: ['fact check', 'AI fact checker', 'verify news', 'fake news detector', 'claims verification', 'premium fact checker', 'India fact check'],
  authors: [{ name: 'VeriCheck Team' }],
  creator: 'VeriCheck',
  publisher: 'Antigravity AI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'VeriCheck — Truth at Your Fingertips',
    description: 'Instantly verify any claim with deep AI analysis.',
    url: 'https://vericheck.ai',
    siteName: 'VeriCheck',
    images: [
      {
        url: '/og-image.png', // You should add an OG image to your public folder
        width: 1200,
        height: 630,
        alt: 'VeriCheck AI Fact Checker',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VeriCheck — AI-Powered Fact Checker',
    description: 'Sub-2-second verification for any news claim.',
    creator: '@vericheck_ai',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

import CursorFollower from '@/components/CursorFollower';

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <CursorFollower />
        {children}
      </body>
    </html>
  );
}
