import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

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
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
          {children}
          <Analytics />
        </div>
      </body>
    </html>
  )
}
