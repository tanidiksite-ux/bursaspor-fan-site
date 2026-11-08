"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/Badge"
import { BURSASPOR } from "@/lib/data"
import {
  LayoutDashboard,
  Calendar,
  Users,
  ClipboardList,
  BarChart2,
  Target,
  Trophy,
  Grid,
  Menu,
  X,
} from "lucide-react"
import { useState } from "react"

const navItems = [
  { href: "/", label: "Ana Sayfa", icon: LayoutDashboard },
  { href: "/mac-merkezi", label: "Maç Merkezi", icon: Calendar },
  { href: "/ilk11", label: "İlk 11 Oluşturucu", icon: Users },
  { href: "/taktik", label: "Taktik Ekranı", icon: ClipboardList },
  { href: "/puan", label: "Puan Durumu", icon: Trophy },
  { href: "/mac-gunu", label: "Skor Tahmini", icon: Target },
  { href: "/kart", label: "Kart Oluşturucu", icon: Grid },
  { href: "/istatistik", label: "Oyuncu İstatistikleri", icon: BarChart2 },
  { href: "/karsilastir", label: "Oyuncu Karşılaştırma", icon: Users },
]

export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3" aria-label="Bursaspor Taraftar Merkezi - Ana Sayfa">
            <div className="w-10 h-10 rounded-full bg-bursa-green flex items-center justify-center">
              <span className="text-white font-bold text-xl">B</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-bursa-green text-lg">Bursaspor Taraftar Merkezi</h1>
              <p className="text-xs text-gray-500">Resmî olmayan taraftar sitesidir</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1" aria-label="Ana navigasyon">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-bursa-green-50 text-bursa-green dark:bg-bursa-green-900/30"
                      : "text-gray-600 hover:text-bursa-green hover:bg-bursa-green-50 dark:text-gray-300 dark:hover:bg-bursa-green-900/20"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-3">
            <Badge variant="team" className="hidden sm:inline-flex">
              {BURSASPOR.shortName}
            </Badge>

            <button
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={mobileMenuOpen ? "Menüyü kapat" : "Menüyü aç"}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div id="mobile-menu" className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700 animate-slide-down">
            <nav className="flex flex-col gap-1" aria-label="Mobil navigasyon">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors",
                      isActive
                        ? "bg-bursa-green-50 text-bursa-green dark:bg-bursa-green-900/30"
                        : "text-gray-600 hover:text-bursa-green hover:bg-bursa-green-50 dark:text-gray-300 dark:hover:bg-bursa-green-900/20"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon className="w-5 h-5" aria-hidden="true" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}