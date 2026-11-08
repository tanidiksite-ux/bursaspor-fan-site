"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { BURSASPOR_PLAYERS, Player, PlayerStats } from "@/lib/data"
import { cn } from "@/lib/utils"
import {
  Target,
  Trophy,
  Users,
  BarChart2,
  TrendingUp,
  TrendingDown,
  Filter,
  Download,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Shield,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
} from "recharts"

type StatCategory = "all" | "attack" | "defense" | "passing" | "discipline"
type SortDirection = "asc" | "desc"

interface SortConfig {
  key: keyof PlayerStats | "name" | "position" | "number"
  direction: SortDirection
}

const STAT_CATEGORIES = [
  { id: "all", label: "Tümü", icon: BarChart2 },
  { id: "attack", label: "Hücum", icon: Target },
  { id: "defense", label: "Savunma", icon: Shield },
  { id: "passing", label: "Pas", icon: ArrowUpDown },
  { id: "discipline", label: "Disiplin", icon: Badge },
]

const ATTACK_STATS: (keyof PlayerStats)[] = ["goals", "assists", "rating"]
const DEFENSE_STATS: (keyof PlayerStats)[] = ["tacklesPerGame", "interceptionsPerGame", "clearances"]
const PASSING_STATS: (keyof PlayerStats)[] = ["passAccuracy", "keyPasses"]
const DISCIPLINE_STATS: (keyof PlayerStats)[] = ["yellowCards", "redCards", "fouls"]

const STAT_LABELS: Record<string, string> = {
  appearances: "Oynanan Maç",
  goals: "Gol",
  assists: "Asist",
  yellowCards: "Sarı Kart",
  redCards: "Kırmızı Kart",
  minutesPlayed: "Dakika",
  passAccuracy: "Pas Başarısı (%)",
  tacklesPerGame: "Maç Başına Takıl",
  interceptionsPerGame: "Maç Başına Kesme",
  rating: "Ortalama Rating",
  clearances: "Top Uzaklaştırma",
  keyPasses: "Anahtar Pas",
  fouls: "Faul",
}

const STAT_COLORS: Record<string, string> = {
  goals: "#ef4444",
  assists: "#22c55e",
  rating: "#f59e0b",
  passAccuracy: "#3b82f6",
  tacklesPerGame: "#8b5cf6",
  interceptionsPerGame: "#06b6d4",
  yellowCards: "#f97316",
  redCards: "#ef4444",
  appearances: "#6b7280",
  minutesPlayed: "#6366f1",
  clearances: "#84cc16",
  keyPasses: "#ec4899",
  fouls: "#f97316",
}

export default function StatisticsPage() {
  const [category, setCategory] = useState<StatCategory>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "rating", direction: "desc" })
  const [viewMode, setViewMode] = useState<"table" | "cards" | "charts">("table")
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [page, setPage] = useState(1)
  const pageSize = 15

  const filteredPlayers = BURSASPOR_PLAYERS.filter((player) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (!player.name.toLowerCase().includes(query)) return false
    }
    return true
  }).sort((a, b) => {
    let aVal: any
    let bVal: any
    
    if (sortConfig.key === "name") {
      aVal = a.name
      bVal = b.name
    } else if (sortConfig.key === "position") {
      aVal = a.position
      bVal = b.position
    } else if (sortConfig.key === "number") {
      aVal = a.number
      bVal = b.number
    } else if (a.stats && b.stats) {
      aVal = a.stats[sortConfig.key as keyof PlayerStats]
      bVal = b.stats[sortConfig.key as keyof PlayerStats]
    } else {
      return 0
    }
    
    if (aVal === undefined || bVal === undefined) return 0
    
    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortConfig.direction === "asc" 
        ? aVal.localeCompare(bVal) 
        : bVal.localeCompare(aVal)
    }
    
    return sortConfig.direction === "asc" 
      ? (aVal as number) - (bVal as number) 
      : (bVal as number) - (aVal as number)
  })

  const paginatedPlayers = filteredPlayers.slice((page - 1) * pageSize, page * pageSize)
  const totalPages = Math.ceil(filteredPlayers.length / pageSize)

  const handleSort = (key: SortConfig["key"]) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "desc" ? "asc" : "desc",
    }))
  }

  const getCategoryStats = (cat: StatCategory): (keyof PlayerStats)[] => {
    switch (cat) {
      case "attack": return ATTACK_STATS
      case "defense": return DEFENSE_STATS
      case "passing": return PASSING_STATS
      case "discipline": return DISCIPLINE_STATS
      default: return ["goals", "assists", "rating", "passAccuracy", "tacklesPerGame", "yellowCards"]
    }
  }

  const visibleStats = getCategoryStats(category)

  return (
    <div className="min-h-screen py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-bursa-green flex items-center justify-center">
              <BarChart2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Oyuncu İstatistikleri</h1>
              <p className="text-gray-600 dark:text-gray-400">Bursaspor oyuncularının detaylı performans verileri</p>
            </div>
          </div>

          {/* Filters & Controls */}
          <Card className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {STAT_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id as StatCategory)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border",
                        category === cat.id
                          ? "bg-white dark:bg-gray-800 text-bursa-green border-bursa-green shadow"
                          : "text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-bursa-green"
                      )}
                    >
                      <cat.icon className="w-4 h-4" />
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3 w-full sm:w-auto items-center">
                  <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Oyuncu ara..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="input-field pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewMode("table")}
                      className={cn("p-2 rounded-lg transition-colors", viewMode === "table" ? "bg-bursa-green text-white" : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700")}
                      aria-label="Tablo görünümü"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </button>
                    <button
                      onClick={() => setViewMode("cards")}
                      className={cn("p-2 rounded-lg transition-colors", viewMode === "cards" ? "bg-bursa-green text-white" : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700")}
                      aria-label="Kart görünümü"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                    </button>
                    <button
                      onClick={() => setViewMode("charts")}
                      className={cn("p-2 rounded-lg transition-colors", viewMode === "charts" ? "bg-bursa-green text-white" : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700")}
                      aria-label="Grafik görünümü"
                    >
                      <BarChart2 className="w-5 h-5" />
                    </button>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      CSV
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatSummary title="Toplam Gol" value={BURSASPOR_PLAYERS.reduce((sum, p) => sum + (p.stats?.goals || 0), 0)} icon={Target} color="text-red-500" bg="bg-red-100 dark:bg-red-900/30" />
          <StatSummary title="Toplam Asist" value={BURSASPOR_PLAYERS.reduce((sum, p) => sum + (p.stats?.assists || 0), 0)} icon={Users} color="text-green-500" bg="bg-green-100 dark:bg-green-900/30" />
          <StatSummary title="Ort. Rating" value={BURSASPOR_PLAYERS.filter(p => p.stats).reduce((sum, p) => sum + (p.stats?.rating || 0), 0) / BURSASPOR_PLAYERS.filter(p => p.stats).length} icon={Trophy} color="text-yellow-500" bg="bg-yellow-100 dark:bg-yellow-900/30" isDecimal />
          <StatSummary title="Pas Başarısı" value={Math.round(BURSASPOR_PLAYERS.filter(p => p.stats).reduce((sum, p) => sum + (p.stats?.passAccuracy || 0), 0) / BURSASPOR_PLAYERS.filter(p => p.stats).length)} icon={ArrowUpDown} color="text-blue-500" bg="bg-blue-100 dark:bg-blue-900/30" suffix="%" />
        </div>

        {/* Content Views */}
        {viewMode === "table" && (
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-12">#</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-16"></th>
                      <th 
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-bursa-green"
                        onClick={() => handleSort("name")}
                      >
                        Oyuncu
                        {sortConfig.key === "name" && (sortConfig.direction === "desc" ? <TrendingDown className="w-4 h-4 inline" /> : <TrendingUp className="w-4 h-4 inline" />)}
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-16">Pos</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-16">Yaş</th>
                      {visibleStats.map((stat) => (
                        <th
                          key={stat}
                          className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24 cursor-pointer hover:text-bursa-green"
                          onClick={() => handleSort(stat)}
                        >
                          {STAT_LABELS[stat]}
                          {sortConfig.key === stat && (sortConfig.direction === "desc" ? <TrendingDown className="w-4 h-4 inline" /> : <TrendingUp className="w-4 h-4 inline" />)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {paginatedPlayers.map((player, index) => (
                      <tr
                        key={player.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                        onClick={() => setSelectedPlayer(player)}
                      >
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{player.number}</td>
                        <td className="px-4 py-3">
                          <img src={player.photo || "/logos/bursaspor.svg"} alt={player.name} className="w-10 h-10 rounded-full object-cover" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900 dark:text-white">{player.name}</div>
                          <div className="text-xs text-gray-500">{player.nationality}</div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant="default" size="sm">{player.position}</Badge>
                        </td>
                        <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">{player.age}</td>
                        {visibleStats.map((stat) => (
                          <td key={stat} className="px-4 py-3 text-center font-medium">
                            {stat === "passAccuracy" ? `${player.stats?.[stat] || 0}%` : player.stats?.[stat] || 0}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn-secondary p-2 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="px-4 text-sm text-gray-600 dark:text-gray-400">
                    Sayfa {page} / {totalPages} ({filteredPlayers.length} oyuncu)
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="btn-secondary p-2 disabled:opacity-50"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {viewMode === "cards" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedPlayers.map((player) => (
              <PlayerStatCard key={player.id} player={player} onClick={() => setSelectedPlayer(player)} />
            ))}
          </div>
        )}

        {viewMode === "charts" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gol ve Asist Dağılımı</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={BURSASPOR_PLAYERS.filter(p => (p.stats?.goals || 0) > 0 || (p.stats?.assists || 0) > 0).slice(0, 10).map(p => ({
                      name: p.name.split(" ").pop() || "",
                      goals: p.stats?.goals || 0,
                      assists: p.stats?.assists || 0,
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" stroke="#6b7280" fontSize={11} />
                      <YAxis stroke="#6b7280" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", color: "white" }} />
                      <Bar dataKey="goals" fill="#ef4444" radius={[4, 4, 0, 0]} name="Gol" />
                      <Bar dataKey="assists" fill="#22c55e" radius={[4, 4, 0, 0]} name="Asist" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>Pas Başarısı Dağılımı</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={BURSASPOR_PLAYERS.filter(p => p.stats).map(p => ({
                            name: p.name.split(" ").pop() || "",
                            value: p.stats!.passAccuracy,
                          })).slice(0, 8)}
                          cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                          dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                        >
                          {BURSASPOR_PLAYERS.slice(0, 8).map((_, i) => (
                            <Cell key={i} fill={["#006633", "#008844", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#ef4444"][i]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", color: "white" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Rating Dağılımı (Radial)</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-64 flex justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart
                        data={BURSASPOR_PLAYERS.filter(p => p.stats).slice(0, 6).map(p => ({
                          name: p.name.split(" ").pop() || "",
                          rating: Math.round((p.stats!.rating / 10) * 100),
                        }))}
                        cx="50%" cy="50%" innerRadius="40%" outerRadius="80%"
                      >
                        <RadialBar
                          dataKey="rating"
                        >
                          <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", color: "white" }} />
                        </RadialBar>
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Player Detail Modal */}
        {selectedPlayer && (
          <PlayerDetailModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
        )}
      </div>
    </div>
  )
}

function StatSummary({ title, value, icon: Icon, color, bg, isDecimal, suffix }: { title: string; value: number; icon: React.ComponentType<{ className?: string }>; color: string; bg: string; isDecimal?: boolean; suffix?: string }) {
  return (
    <Card className="card-hover">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {isDecimal ? value.toFixed(2) : value}{suffix || ""}
            </p>
          </div>
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", bg)}>
            <Icon className={cn("w-6 h-6", color)} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function PlayerStatCard({ player, onClick }: { player: Player; onClick: () => void }) {
  if (!player.stats) return null

  return (
    <Card className="card-hover cursor-pointer" onClick={onClick} padding="md">
      <div className="flex items-center gap-3 mb-3">
        <img src={player.photo || "/logos/bursaspor.svg"} alt={player.name} className="w-12 h-12 rounded-full object-cover" />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 dark:text-white truncate">{player.name}</p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Badge variant="default" size="sm">{player.position}</Badge>
            <span>#{player.number}</span>
            <span>{player.age} yaş</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-yellow-500">{player.stats.rating}</p>
          <p className="text-xs text-gray-500">Rating</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-xl font-bold text-red-500">{player.stats.goals}</p>
          <p className="text-xs text-gray-500">Gol</p>
        </div>
        <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-xl font-bold text-green-500">{player.stats.assists}</p>
          <p className="text-xs text-gray-500">Asist</p>
        </div>
        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-xl font-bold text-blue-500">{player.stats.passAccuracy}%</p>
          <p className="text-xs text-gray-500">Pas %</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center mt-2">
        <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <p className="text-lg font-bold text-purple-500">{player.stats.tacklesPerGame}</p>
          <p className="text-xs text-gray-500">Takıl/Maç</p>
        </div>
        <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
          <p className="text-lg font-bold text-orange-500">{player.stats.yellowCards}</p>
          <p className="text-xs text-gray-500">Sarı Kart</p>
        </div>
        <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-lg font-bold text-gray-500">{player.stats.minutesPlayed}'</p>
          <p className="text-xs text-gray-500">Dakika</p>
        </div>
      </div>
    </Card>
  )
}

interface PlayerDetailModalProps {
  player: Player
  onClose: () => void
}

function PlayerDetailModal({ player, onClose }: PlayerDetailModalProps) {
  const stats = player.stats!

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={player.photo || "/logos/bursaspor.svg"} alt={player.name} className="w-16 h-16 rounded-full object-cover" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{player.name}</h2>
              <p className="text-gray-500">#{player.number} · {player.position} · {player.age} yaş · {player.nationality}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Key Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Gol", value: stats.goals, color: "red", icon: Target },
              { label: "Asist", value: stats.assists, color: "green", icon: Users },
              { label: "Rating", value: stats.rating, color: "yellow", icon: Trophy },
              { label: "Pas %", value: `${stats.passAccuracy}%`, color: "blue", icon: ArrowUpDown },
            ].map((item) => (
              <StatBox key={item.label} {...item} />
            ))}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Detaylı İstatistikler</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: "Oynanan Maç", value: stats.appearances },
                { label: "Dakika", value: `${stats.minutesPlayed}'` },
                { label: "Takıl/Maç", value: stats.tacklesPerGame },
                { label: "Kesme/Maç", value: stats.interceptionsPerGame },
                { label: "Sarı Kart", value: stats.yellowCards },
                { label: "Kırmızı Kart", value: stats.redCards },
              ].map((item) => (
                <div key={item.label} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                  <p className="text-sm text-gray-500">{item.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mini Charts */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Performans Radar</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    data={[
                      { name: "Gol", value: Math.min(stats.goals * 10, 100) },
                      { name: "Asist", value: Math.min(stats.assists * 10, 100) },
                      { name: "Pas %", value: stats.passAccuracy },
                      { name: "Takıl", value: Math.min(stats.tacklesPerGame * 20, 100) },
                      { name: "Kesme", value: Math.min(stats.interceptionsPerGame * 20, 100) },
                      { name: "Rating", value: (stats.rating / 10) * 100 },
                    ]}
                    cx="50%" cy="50%" innerRadius="30%" outerRadius="80%"
                  >
                    <RadialBar
                      dataKey="value"
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Karşılaştırma (Takım Ort.)</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { metric: "Gol", player: stats.goals, team: 1.2 },
                    { metric: "Asist", player: stats.assists, team: 0.8 },
                    { metric: "Pas %", player: stats.passAccuracy, team: 82 },
                    { metric: "Takıl", player: stats.tacklesPerGame, team: 2.1 },
                    { metric: "Rating", player: stats.rating, team: 6.8 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="metric" stroke="#6b7280" fontSize={11} />
                    <YAxis stroke="#6b7280" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", color: "white" }} />
                    <Bar dataKey="player" fill="#006633" radius={[4, 4, 0, 0]} name="Oyuncu" />
                    <Bar dataKey="team" fill="#9ca3af" radius={[4, 4, 0, 0]} name="Takım Ort." />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
            <Button onClick={onClose}>Kapat</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface StatBoxProps {
  label: string
  value: string | number
  color: string
  icon: React.ComponentType<{ className?: string }>
}

function StatBox({ label, value, color, icon: Icon }: StatBoxProps) {
  const colors = {
    red: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
    green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    yellow: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  }

  return (
    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-2">
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", colors[color as keyof typeof colors])}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  )
}