import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Hydrodrops | Mineral Water Delivery & Bottle Ledger',
  description: 'Order water coupon packages and track your bottle deliveries transparently.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-slate-50 text-slate-800 antialiased`}>
        {children}
      </body>
    </html>
  )
}