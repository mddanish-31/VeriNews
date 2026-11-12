import type { Metadata } from 'next'
import { Inter, Manrope, Noto_Sans_Devanagari } from 'next/font/google'
import './globals.css'
import { SmoothScrollProvider } from '../components/providers/SmoothScrollProvider'
import { ElectricArcCursor } from '../components/ui/electric-arc-cursor'

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-manrope',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
})

const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-sans-devanagari',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'VeriNews — Verify News. Read Smarter.',
  description:
    'A research-oriented multilingual news language-pattern analysis platform. Explore news-style patterns in English and Hindi with context, not certainty.',
}

const themeInitScript = `
  (function() {
    try {
      const stored = localStorage.getItem('verinews-theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (stored === 'dark' || (!stored && prefersDark)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (_) {}
  })();
`

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${manrope.variable} ${inter.variable} ${notoSansDevanagari.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen bg-main text-content-primary antialiased selection:bg-brand-blue/20">
        <ElectricArcCursor />
        <SmoothScrollProvider>
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  )
}
