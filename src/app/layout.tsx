import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'RevSnap - B2B Revenue Optimization Platform',
  description: 'Optimize your business revenue strategy to maximize profits. Advanced analytics and competitive insights for small businesses.',
  keywords: 'revenue optimization, B2B SaaS, profit maximization, business analytics, competitive pricing',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-playfair`}>
        <div className="min-h-screen gradient-bg">
          {children}
          <Analytics />
        </div>
      </body>
    </html>
  )
}
