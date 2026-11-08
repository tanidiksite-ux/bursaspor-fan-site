"use client"

import { useState } from "react"
import Link from "next/link"
import { formatDate, formatTime } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge, MatchStatusBadge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { MOCK_MATCHES, BURSASPOR, getTeamById, REFERENCE_DATE } from "@/lib/data"
import {
  Calendar,
  Clock,
  Trophy,
  Shield,
  ChevronLeft,
  ChevronRight,
  Filter,
  Grid,
  List,
  Search,
  RefreshCw,
} from "lucide-react"

type ViewMode = "all" | "upcoming" | "past" | "live"
type LayoutMode = "grid" | "list"

export default function MatchCenterPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("all")
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("list")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCompetition, setSelectedCompetition] = useState<string>("all")

  const filteredMatches = MOCK_MATCHES.filter((match) => {
    const now = REFERENCE_DATE
    const matchDate = new Date(`${match.date}T${match.time}`)
    const isPast = matchDate < now
    const isFuture = matchDate > now

    if (viewMode === "upcoming" && isPast) return false
    if (viewMode === "past" && isFuture) return false
    if (viewMode === "live" && match.status !== "live") return false

    if (selectedCompetition !== "all" && match.competition !== selectedCompetition) return false

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const homeName = match.homeTeam.name.toLowerCase()
      const awayName = match.awayTeam.name.toLowerCase()
      if (!homeName.includes(query) && !awayName.includes(query)) return false
    }

    return true
  }).sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`).getTime()
    const dateB = new Date(`${b.date}T${b.time}`).getTime()
    return viewMode === "past" ? dateB - dateA : dateA - dateB
  })

  const competitions = ["all", ...new Set(MOCK_MATCHES.map((m) => m.competition))]

  return (
    <div className="min-h-screen py-8">
      <div className="container-custom">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-bursa-green flex items-center justify-center">
              <Calendar className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Maç Merkezi</h1>
              <p className="text-gray-600 dark:text-gray-400">Fikstür, sonuçlar, canlı skor ve maç detayları</p>
            </div>
          </div>

          {/* Filters */}
          <Card className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "all", label: "Tümü", icon: Grid },
                    { value: "upcoming", label: "Gelecek", icon: Calendar },
                    { value: "past", label: "Geçmiş", icon: Trophy },
                    { value: "live", label: "Canlı", icon: Shield },
                  ].map((tab) => (
                    <button
                      key={tab.value}
                      onClick={() => setViewMode(tab.value as ViewMode)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        viewMode === tab.value
                          ? "bg-bursa-green text-white shadow-lg"
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Takım ara..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="input-field pl-10"
                    />
                  </div>
                  <select
                    value={selectedCompetition}
                    onChange={(e) => setSelectedCompetition(e.target.value)}
                    className="input-field min-w-[180px]"
                  >
                    {competitions.map((comp) => (
                      <option key={comp} value={comp}>
                        {comp === "all" ? "Tüm Ligler" : comp}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setLayoutMode("grid")}
                      className={`p-2 rounded-lg transition-colors ${
                        layoutMode === "grid"
                          ? "bg-bursa-green text-white"
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                      aria-label="Izgara görünümü"
                    >
                      <Grid className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setLayoutMode("list")}
                      className={`p-2 rounded-lg transition-colors ${
                        layoutMode === "list"
                          ? "bg-bursa-green text-white"
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                      aria-label="Liste görünümü"
                    >
                      <List className="w-5 h-5" />
                    </button>
                    <button className="btn-secondary p-2" aria-label="Yenile">
                      <RefreshCw className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Matches List */}
        <div className={layoutMode === "grid" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
          {filteredMatches.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Calendar className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Maç bulunamadı</h3>
                <p className="text-gray-500 dark:text-gray-400">Filtrelerinizi değiştirmeyi deneyin.</p>
              </CardContent>
            </Card>
          ) : (
            filteredMatches.map((match) => (
              <MatchCard key={match.id} match={match} layout={layoutMode} />
            ))
          )}
        </div>

        {/* Pagination */}
        {filteredMatches.length > 10 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button className="btn-secondary p-2" aria-label="Önceki">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="btn-primary px-4 py-2">1</button>
            <button className="btn-secondary px-4 py-2">2</button>
            <button className="btn-secondary px-4 py-2">3</button>
            <button className="btn-secondary p-2" aria-label="Sonraki">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

interface MatchCardProps {
  match: typeof MOCK_MATCHES[0]
  layout: "grid" | "list"
}

function MatchCard({ match, layout }: MatchCardProps) {
  const isPast = new Date(`${match.date}T${match.time}`) < REFERENCE_DATE
  const isBursasporHome = match.homeTeam.id === "bursaspor"
  const isBursasporAway = match.awayTeam.id === "bursaspor"
  const bursasporScore = isBursasporHome ? match.homeScore : match.awayScore
  const opponentScore = isBursasporHome ? match.awayScore : match.homeScore

  const getResultBadge = () => {
    if (!isPast || bursasporScore === null || opponentScore === null) return null
    if (bursasporScore > opponentScore) return <Badge variant="success" size="sm">G</Badge>
    if (bursasporScore === opponentScore) return <Badge variant="warning" size="sm">B</Badge>
    return <Badge variant="danger" size="sm">M</Badge>
  }

  if (layout === "grid") {
    return (
      <Link href={`/mac-merkezi/${match.id}`} className="card-hover bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
        <div className="relative aspect-video bg-gradient-to-br from-bursa-green to-bursa-green-dark">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white/10 text-8xl font-bold">VS</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between">
            <MatchStatusBadge status={match.status} size="sm" />
            <div className="text-white/80 text-sm">{match.competition}</div>
          </div>
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <img src={match.homeTeam.logo} alt={match.homeTeam.name} className="team-logo-sm" />
            <div className="flex items-center gap-3">
              {getResultBadge()}
              <div className="text-center">
                <p className="font-bold text-lg">
                  {bursasporScore !== null && opponentScore !== null ? `${bursasporScore} - ${opponentScore}` : "VS"}
                </p>
                <p className="text-xs text-gray-500">{formatDate(match.date)}</p>
              </div>
              <img src={match.awayTeam.logo} alt={match.awayTeam.name} className="team-logo-sm" />
            </div>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-500 mt-auto">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTime(match.time)}
            </span>
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              {match.stadium}
            </span>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/mac-merkezi/${match.id}`} className="card-hover bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 flex items-center justify-between gap-4 group">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className="w-12 h-12 rounded-full bg-bursa-green-100 dark:bg-bursa-green-900/30 flex items-center justify-center flex-shrink-0">
          <Calendar className="w-5 h-5 text-bursa-green" />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-gray-900 dark:text-white truncate">{match.competition} · {match.matchday}. Hafta</p>
          <p className="text-sm text-gray-500">{formatDate(match.date)} · {formatTime(match.time)} · {match.stadium}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-shrink-0">
        <div className={`text-right w-24 ${isBursasporHome ? "font-bold text-bursa-green" : ""}`}>
          <img src={match.homeTeam.logo} alt={match.homeTeam.name} className="team-logo-sm mx-auto mb-1" />
          <p className="font-medium text-sm truncate">{match.homeTeam.name}</p>
        </div>

        <div className="flex flex-col items-center gap-1 min-w-[100px]">
          <MatchStatusBadge status={match.status} size="sm" />
          {isPast && match.homeScore !== null && match.awayScore !== null && (
            <div className="font-bold text-lg tabular-nums">
              {match.homeScore} - {match.awayScore}
            </div>
          )}
          {!isPast && <div className="text-gray-400 text-sm">VS</div>}
        </div>

        <div className={`text-left w-24 ${isBursasporAway ? "font-bold text-bursa-green" : ""}`}>
          <img src={match.awayTeam.logo} alt={match.awayTeam.name} className="team-logo-sm mx-auto mb-1" />
          <p className="font-medium text-sm truncate">{match.awayTeam.name}</p>
        </div>

        {getResultBadge() && <div className="w-8 flex justify-end">{getResultBadge()}</div>}
      </div>
    </Link>
  )
}