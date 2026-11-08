import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "Bursaspor Taraftar Merkezi - Maç, Taktik, İstatistik ve Haberler",
    template: "%s | Bursaspor Taraftar Merkezi",
  },
  description:
    "Bursaspor taraftarları için maç fikstürü, puan durumu, ilk 11 oluşturucu, taktik analizi, oyuncu istatistikleri, skor tahmin oyunu ve kart oluşturucu. Resmî olmayan taraftar sitesidir.",
  keywords: [
    "Bursaspor",
    "Süper Lig",
    "maç fikstürü",
    "puan durumu",
    "ilk 11",
    "taktik",
    "istatistik",
    "skor tahmini",
    "taraftar",
    "yeşil beyaz",
  ],
  authors: [{ name: "Bursaspor Taraftar Merkezi" }],
  creator: "Bursaspor Taraftar Merkezi",
  publisher: "Bursaspor Taraftar Merkezi",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://bursaspor-taraftar.com",
    siteName: "Bursaspor Taraftar Merkezi",
    title: "Bursaspor Taraftar Merkezi",
    description:
      "Bursaspor taraftarları için maç, taktik, istatistik ve haberler.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Bursaspor Taraftar Merkezi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bursaspor Taraftar Merkezi",
    description: "Bursaspor taraftarları için maç, taktik, istatistik ve haberler.",
    images: ["/og-image.png"],
    creator: "@bursaspor_taraftar",
  },
  verification: {
    google: "google-site-verification-code",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#006633" },
    { media: "(prefers-color-scheme: dark)", color: "#004422" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr" className={`${inter.variable} scroll-smooth`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white antialiased font-sans flex flex-col">
        <div className="flex min-h-screen flex-col">
          {children}
        </div>
      </body>
    </html>
  )
}