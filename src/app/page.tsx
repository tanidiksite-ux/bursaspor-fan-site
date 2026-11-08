"use client"

import Link from "next/link"
import { formatDate, formatTime, getCountdown } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge, MatchStatusBadge } from "@/components/ui/Badge"
import { BURSASPOR, getNextMatch, getLastMatch, getUpcomingMatches, getRecentMatches, MOCK_NEWS } from "@/lib/data"
import {
  Calendar,
  Clock,
  Trophy,
  Target,
  Users,
  BarChart2,
  ArrowRight,
  ChevronRight,
  Flame,
  TrendingUp,
  Shield,
  Zap,
} from "lucide-react"
import { useState, useEffect } from "react"

export default function HomePage() {
  const nextMatch = getNextMatch()
  const lastMatch = getLastMatch()
  const upcomingMatches = getUpcomingMatches(3)
  const recentMatches = getRecentMatches(3)
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false })

  useEffect(() => {
    if (!nextMatch) return

    const updateCountdown = () => {
      const targetDate = new Date(`${nextMatch.date}T${nextMatch.time}`)
      setCountdown(getCountdown(targetDate))
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [nextMatch])

  const stats = [
    { label: "Puan", value: "27", icon: Trophy, color: "text-yellow-500", bg: "bg-yellow-100 dark:bg-yellow-900/30" },
    { label: "Sıralama", value: "3.", icon: TrendingUp, color: "text-green-500", bg: "bg-green-100 dark:bg-green-900/30" },
    { label: "Gol Farkı", value: "+12", icon: Zap, color: "text-bursa-green", bg: "bg-bursa-green-100 dark:bg-bursa-green-900/30" },
    { label: "Form (Son 5)", value: "W-W-D-L-W", icon: Flame, color: "text-orange-500", bg: "bg-orange-100 dark:bg-orange-900/30" },
  ]

  const quickLinks = [
    { href: "/mac-merkezi", label: "Maç Merkezi", desc: "Fikstür, sonuçlar, canlı skor", icon: Calendar, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/30" },
    { href: "/ilk11", label: "İlk 11 Oluşturucu", desc: "Kendiniz kadro kurun", icon: Users, color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-900/30" },
    { href: "/taktik", label: "Taktik Ekranı", desc: "Formasyon ve taktik çizimi", icon: Shield, color: "text-indigo-500", bg: "bg-indigo-100 dark:bg-indigo-900/30" },
    { href: "/puan", label: "Puan Durumu", desc: "Lig tablosu ve form grafiği", icon: Trophy, color: "text-yellow-500", bg: "bg-yellow-100 dark:bg-yellow-900/30" },
    { href: "/mac-gunu", label: "Skor Tahmini", desc: "Maç günü tahmin oyunu", icon: Target, color: "text-red-500", bg: "bg-red-100 dark:bg-red-900/30" },
    { href: "/istatistik", label: "İstatistikler", desc: "Oyuncu ve takım verileri", icon: BarChart2, color: "text-teal-500", bg: "bg-teal-100 dark:bg-teal-900/30" },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section - Next Match Countdown */}
      {nextMatch && (
        <section className="relative gradient-bursa text-white overflow-hidden">
          <div className="absolute inset-0 bg-[url('/patterns/noise.png')] opacity-5" />
          <div className="container-custom relative py-12 sm:py-16">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <Badge variant="info" className="mb-4" size="lg">
                  SIRADAKİ MAÇ
                </Badge>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                  {nextMatch.homeTeam.name} vs {nextMatch.awayTeam.name}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-white/80 mb-6">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    {formatDate(nextMatch.date)}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    {formatTime(nextMatch.time)}
                  </span>
                  <span className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    {nextMatch.competition} · {nextMatch.matchday}. Hafta
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <Link href="/mac-merkezi" className="btn-secondary text-white border-white/30 hover:bg-white/10">
                    Maç Detayları
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                  <Link href="/ilk11" className="btn-ghost text-white hover:bg-white/10">
                    İlk 11 Oluştur
                    <Users className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </div>

              <div className="relative">
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: "GÜN", value: countdown.days, icon: Calendar },
                    { label: "SAAT", value: countdown.hours, icon: Clock },
                    { label: "DAKİKA", value: countdown.minutes, icon: Zap },
                    { label: "SANİYE", value: countdown.seconds, icon: Target },
                  ].map((item, i) => (
                    <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
                      <item.icon className="w-6 h-6 mx-auto mb-2 text-white/60" />
                      <div className="text-4xl sm:text-5xl font-bold font-mono tabular-nums">
                        {String(item.value).padStart(2, "0")}
                      </div>
                      <div className="text-xs text-white/60 uppercase tracking-wider mt-1">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Stats Overview */}
      <section className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-950">
        <div className="container-custom">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <Card key={i} className="card-hover text-center" padding="md">
                <CardContent className="flex flex-col items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Last Match & Next Match Cards */}
      <section className="py-12 sm:py-16">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Last Match */}
            <Card className="card-hover" padding="md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Son Maç Sonucu</CardTitle>
                  <Badge variant="default" size="sm">Bitti</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {lastMatch ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <img src={lastMatch.awayTeam.logo} alt={lastMatch.awayTeam.name} className="team-logo" />
                        <div className="text-right">
                          <p className="font-semibold">{lastMatch.awayTeam.name}</p>
                          <p className="text-sm text-gray-500">{lastMatch.competition} · {lastMatch.matchday}. Hafta</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold tabular-nums">
                          {lastMatch.homeScore} - {lastMatch.awayScore}
                        </p>
                        <p className="text-sm text-gray-500">{formatDate(lastMatch.date)}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-left">
                          <p className="font-semibold">{lastMatch.homeTeam.name}</p>
                          <p className="text-sm text-gray-500">{lastMatch.stadium}</p>
                        </div>
                        <img src={lastMatch.homeTeam.logo} alt={lastMatch.homeTeam.name} className="team-logo" />
                      </div>
                    </div>
                    <Link href="/mac-merkezi" className="btn-primary w-full justify-center">
                      Tüm Sonuçlar
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Link>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">Henüz maç oynanmadı.</p>
                )}
              </CardContent>
            </Card>

            {/* Next Match Detail */}
            <Card className="card-hover" padding="md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Gelecek Maç</CardTitle>
                  <MatchStatusBadge status={nextMatch?.status || "scheduled"} />
                </div>
              </CardHeader>
              <CardContent>
                {nextMatch ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-bursa-green-50 dark:bg-bursa-green-900/30 rounded-xl">
                      <div className="flex items-center gap-4">
                        <img src={nextMatch.homeTeam.logo} alt={nextMatch.homeTeam.name} className="team-logo" />
                        <div className="text-right">
                          <p className="font-semibold">{nextMatch.homeTeam.name}</p>
                          <p className="text-sm text-gray-500">{nextMatch.competition} · {nextMatch.matchday}. Hafta</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-bursa-green">VS</p>
                        <p className="text-sm text-gray-500">{formatDate(nextMatch.date)} · {formatTime(nextMatch.time)}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-left">
                          <p className="font-semibold">{nextMatch.awayTeam.name}</p>
                          <p className="text-sm text-gray-500">{nextMatch.stadium}</p>
                        </div>
                        <img src={nextMatch.awayTeam.logo} alt={nextMatch.awayTeam.name} className="team-logo" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Link href="/ilk11" className="btn-secondary w-full justify-center">
                        İlk 11 Oluştur
                      </Link>
                      <Link href="/mac-gunu" className="btn-primary w-full justify-center">
                        Skor Tahmin Et
                      </Link>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">Planlanmış maç yok.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-950">
        <div className="container-custom">
          <div className="mb-8">
            <h2 className="section-title">Hızlı Erişim</h2>
            <p className="section-subtitle">En çok kullanılan özelliklere tek tıkla ulaşın</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickLinks.map((link, i) => (
              <Link key={i} href={link.href} className="card-hover p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center gap-3 group">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${link.bg}`}>
                  <link.icon className={`w-6 h-6 ${link.color}`} />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-bursa-green transition-colors">{link.label}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{link.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming & Recent Matches */}
      <section className="py-12 sm:py-16">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Upcoming Matches */}
            <Card padding="none" className="overflow-hidden">
              <CardHeader className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <CardTitle>Gelecek Maçlar</CardTitle>
                  <Link href="/mac-merkezi?view=upcoming" className="text-sm text-bursa-green hover:underline flex items-center gap-1">
                    Tümü
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="space-y-3">
                  {upcomingMatches.map((match) => (
                    <Link key={match.id} href={`/mac-merkezi/${match.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-bursa-green-100 dark:bg-bursa-green-900/30 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-bursa-green" />
                        </div>
                        <div>
                          <p className="font-medium">{match.homeTeam.shortName} vs {match.awayTeam.shortName}</p>
                          <p className="text-sm text-gray-500">{formatDate(match.date)} · {formatTime(match.time)}</p>
                        </div>
                      </div>
                      <MatchStatusBadge status={match.status} size="sm" />
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Matches */}
            <Card padding="none" className="overflow-hidden">
              <CardHeader className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <CardTitle>Son Maçlar</CardTitle>
                  <Link href="/mac-merkezi?view=past" className="text-sm text-bursa-green hover:underline flex items-center gap-1">
                    Tümü
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="space-y-3">
                  {recentMatches.map((match) => (
                    <Link key={match.id} href={`/mac-merkezi/${match.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <Shield className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                          <p className="font-medium">{match.homeTeam.shortName} vs {match.awayTeam.shortName}</p>
                          <p className="text-sm text-gray-500">{formatDate(match.date)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold tabular-nums">{match.homeScore} - {match.awayScore}</p>
                        <p className="text-xs text-gray-500">{match.competition}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Latest News */}
      <section className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-950">
        <div className="container-custom">
          <div className="mb-8">
            <h2 className="section-title">Son Haberler</h2>
            <p className="section-subtitle">Bursaspor dünyasından en güncel gelişmeler</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {MOCK_NEWS.slice(0, 3).map((news) => (
              <article key={news.id} className="card-hover bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="aspect-video bg-gradient-to-br from-bursa-green to-bursa-green-dark relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white/20 text-6xl font-bold">B</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                    <Badge variant={news.category === "Transfer" ? "warning" : "info"} size="sm">
                      {news.category}
                    </Badge>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-xs text-gray-500 mb-2">{formatDate(news.publishedAt)}</p>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2">{news.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{news.excerpt}</p>
                  <Link href={`/haberler/${news.slug}`} className="text-sm font-medium text-bursa-green hover:underline flex items-center gap-1">
                    Devamını Oku
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/haberler" className="btn-secondary">
              Tüm Haberler
              <ChevronRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 gradient-bursa-light text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Bursaspor Taraftar Ailesine Katılın</h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Maç analizleri, taktik tartışmaları, skor tahmin yarışmaları ve çok daha fazlası. 
            Yeşil-beyaz gönül birliğiyle Bursaspor'u her yerden destekleyin.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/kart" className="btn-primary bg-white text-bursa-green hover:bg-white/90 px-8 py-3">
              İlk Kartınızı Oluşturun
              <Zap className="w-5 h-5 ml-2" />
            </Link>
            <Link href="/mac-gunu" className="btn-secondary border-white text-white hover:bg-white/10 px-8 py-3">
              Bu Hafta Tahmin Yapın
              <Target className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}