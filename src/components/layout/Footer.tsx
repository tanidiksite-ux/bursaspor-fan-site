"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { BURSASPOR } from "@/lib/data"
import { MessageSquare, Camera, Video, GitBranch, Heart, Globe, Mail } from "lucide-react"

export function Footer() {
  const [currentYear, setCurrentYear] = useState(2024)

  // Update year on client side to avoid hydration mismatch
  useEffect(() => {
    setCurrentYear(new Date().getFullYear())
  }, [])

  const footerLinks = {
    "Maç Bilgileri": [
      { href: "/mac-merkezi", label: "Fikstür ve Sonuçlar" },
      { href: "/mac-merkezi?view=live", label: "Canlı Skor" },
      { href: "/mac-merkezi?view=upcoming", label: "Gelecek Maçlar" },
      { href: "/mac-merkezi?view=past", label: "Geçmiş Maçlar" },
    ],
    "Analiz ve Taktik": [
      { href: "/ilk11", label: "İlk 11 Oluşturucu" },
      { href: "/taktik", label: "Taktik Ekranı" },
      { href: "/istatistik", label: "Oyuncu İstatistikleri" },
      { href: "/karsilastir", label: "Oyuncu Karşılaştırma" },
    ],
    "Lig ve Turnuvalar": [
      { href: "/puan", label: "Puan Durumu" },
      { href: "/mac-gunu", label: "Skor Tahmin Oyunu" },
      { href: "/mac-merkezi?competition=turkiye-kupasi", label: "Türkiye Kupası" },
    ],
    "Sosyal ve Diğer": [
      { href: "/kart", label: "Kart Oluşturucu" },
      { href: "/haberler", label: "Haberler" },
      { href: "/hakkinda", label: "Hakkımızda" },
      { href: "/iletisim", label: "İletişim" },
    ],
  }

  const socialLinks = [
    { href: "https://twitter.com/bursaspor", label: "Twitter (X)", icon: MessageSquare },
    { href: "https://instagram.com/bursaspor", label: "Instagram", icon: Camera },
    { href: "https://facebook.com/bursaspor", label: "Facebook", icon: Globe },
    { href: "https://youtube.com/bursaspor", label: "YouTube", icon: Video },
    { href: "https://github.com", label: "GitHub", icon: GitBranch },
  ]

  return (
    <footer className="bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4" aria-label="Bursaspor Taraftar Merkezi - Ana Sayfa">
              <div className="w-12 h-12 rounded-full bg-bursa-green flex items-center justify-center">
                <span className="text-white font-bold text-2xl">B</span>
              </div>
              <span className="font-bold text-bursa-green text-xl">Bursaspor Taraftar Merkezi</span>
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Resmî olmayan taraftar sitesidir. Maç ve istatistik verileri herkese açık spor veri kaynaklarından otomatik çekilir.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-bursa-green transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{category}</h3>
              <ul className="space-y-2" role="list">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 hover:text-bursa-green dark:text-gray-400 dark:hover:text-bursa-green transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © {currentYear} Bursaspor Taraftar Merkezi. Tüm hakları saklıdır.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" aria-hidden="true" />
              Bursaspor taraftarı tarafından, Bursaspor taraftarı için yapılmıştır.
            </p>
            <div className="flex gap-6 text-sm text-gray-500 dark:text-gray-400">
              <Link href="/gizlilik" className="hover:text-bursa-green transition-colors">
                Gizlilik Politikası
              </Link>
              <Link href="/kullanim" className="hover:text-bursa-green transition-colors">
                Kullanım Koşulları
              </Link>
              <Link href="/cerez" className="hover:text-bursa-green transition-colors">
                Çerez Politikası
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}