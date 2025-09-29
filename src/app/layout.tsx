import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import './override.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RevSnap - Smart Pricing Intelligence for DTC Brands',
  description: 'AI-powered competitor pricing intelligence. Track competitors, optimize prices, and boost profits automatically. Perfect for Shopify DTC brands with 10-50 SKUs.',
  keywords: ['pricing intelligence', 'competitor tracking', 'DTC brands', 'Shopify', 'price optimization', 'AI pricing'],
  authors: [{ name: 'RevSnap Team' }],
  creator: 'RevSnap',
  publisher: 'RevSnap',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://revsnap.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'RevSnap - Smart Pricing Intelligence',
    description: 'AI-powered competitor pricing intelligence for DTC brands. Upload your CSV, get instant pricing optimization, see +23% profit uplift.',
    url: 'https://revsnap.com',
    siteName: 'RevSnap',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'RevSnap - Smart Pricing Intelligence Dashboard',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RevSnap - Smart Pricing Intelligence',
    description: 'AI-powered competitor pricing intelligence for DTC brands',
    images: ['/twitter-image.png'],
    creator: '@revsnap',
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
  manifest: '/manifest.json',
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'RevSnap',
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': '#2563eb',
    'theme-color': '#2563eb',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#2563eb' },
    { media: '(prefers-color-scheme: dark)', color: '#1e40af' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* PWA Meta Tags */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="application-name" content="RevSnap" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="RevSnap" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* PWA Icons */}
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icon-16x16.png" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#2563eb" />
        <link rel="shortcut icon" href="/favicon.ico" />

        {/* Preconnect to External Services */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Service Worker Registration - Moved to client-side to prevent hydration issues */}
      </head>
      <body className={inter.className} suppressHydrationWarning={true}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
