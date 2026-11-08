"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { BURSASPOR_PLAYERS, Player } from "@/lib/data"
import { cn } from "@/lib/utils"
import {
  Users,
  ArrowLeftRight,
  RefreshCw,
  BarChart2,
  Target,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  Search,
  Scale,
  Filter,
  Trophy,
} from "lucide-react"
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from "recharts"

const COMPARISON_STATS = [
  { key: "goals", label: "Gol", color: "#ef4444", max: 20 },
  { key: "assists", label: "Asist", color: "#22c55e", max: 15 },
  { key: "rating", label: "Rating", color: "#f59e0b", max: 10 },
  { key: "passAccuracy", label: "Pas %", color: "#3b82f6", max: 100 },
  { key: "tacklesPerGame", label: "Takıl/Maç", color: "#8b5cf6", max: 5 },
  { key: "interceptionsPerGame", label: "Kesme/Maç", color: "#06b6d4", max: 4 },
  { key: "minutesPlayed", label: "Dakika", color: "#6366f1", max: 3000 },
  { key: "yellowCards", label: "Sarı Kart", color: "#f97316", max: 15 },
]

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
}

export default function PlayerComparisonPage() {
  const [player1, setPlayer1] = useState<Player | null>(BURSASPOR_PLAYERS[0])
  const [player2, setPlayer2] = useState<Player | null>(BURSASPOR_PLAYERS[8])
  const [viewMode, setViewMode] = useState<"radar" | "bars" | "table" | "pie">("radar")
  const [selectedStats, setSelectedStats] = useState<string[]>(
    COMPARISON_STATS.map((s) => s.key)
  )

  const availablePlayers = useMemo(() => 
    BURSASPOR_PLAYERS.filter(p => p.stats)
  , [])

  const p1Stats = player1?.stats
  const p2Stats = player2?.stats

  const handlePlayerSelect = (slot: 1 | 2, player: Player) => {
    if (slot === 1) {
      if (player.id === player2?.id) {
        setPlayer2(player1)
      }
      setPlayer1(player)
    } else {
      if (player.id === player1?.id) {
        setPlayer1(player2)
      }
      setPlayer2(player)
    }
  }

  const swapPlayers = () => {
    setPlayer1(player2!)
    setPlayer2(player1!)
  }

  const resetComparison = () => {
    setPlayer1(BURSASPOR_PLAYERS[0])
    setPlayer2(BURSASPOR_PLAYERS[8])
    setSelectedStats(COMPARISON_STATS.map((s) => s.key))
  }

  const getStatValue = (player: Player | null, key: string) => {
    if (!player?.stats) return 0
    return (player.stats as any)[key] || 0
  }

  const getNormalizedValue = (value: number, max: number) => {
    return Math.min((value / max) * 100, 100)
  }

  const radarData = useMemo(() => {
    if (!player1?.stats || !player2?.stats) return []
    return COMPARISON_STATS.filter(s => selectedStats.includes(s.key)).map((stat) => ({
      stat: stat.label,
      [player1.name.split(" ")[0]]: getNormalizedValue(getStatValue(player1, stat.key), stat.max),
      [player2.name.split(" ")[0]]: getNormalizedValue(getStatValue(player2, stat.key), stat.max),
      fullKey: stat.key,
    }))
  }, [player1, player2, selectedStats])

  const barData = useMemo(() => {
    if (!player1?.stats || !player2?.stats) return []
    return COMPARISON_STATS.filter(s => selectedStats.includes(s.key)).map((stat) => ({
      stat: stat.label,
      [player1.name.split(" ")[0]]: getStatValue(player1, stat.key),
      [player2.name.split(" ")[0]]: getStatValue(player2, stat.key),
      color: stat.color,
      fullKey: stat.key,
    }))
  }, [player1, player2, selectedStats])

  const winner = useMemo(() => {
    if (!player1?.stats || !player2?.stats) return null
    let p1Wins = 0
    let p2Wins = 0
    COMPARISON_STATS.filter(s => selectedStats.includes(s.key)).forEach((stat) => {
      const v1 = getStatValue(player1, stat.key)
      const v2 = getStatValue(player2, stat.key)
      if (stat.key === "yellowCards" || stat.key === "redCards") {
        if (v1 < v2) p1Wins++
        else if (v2 < v1) p2Wins++
      } else {
        if (v1 > v2) p1Wins++
        else if (v2 > v1) p2Wins++
      }
    })
    if (p1Wins > p2Wins) return player1
    if (p2Wins > p1Wins) return player2
    return null
  }, [player1, player2, selectedStats])

  return (
    <div className="min-h-screen py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-bursa-green flex items-center justify-center">
              <Scale className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Oyuncu Karşılaştırma</h1>
              <p className="text-gray-600 dark:text-gray-400">İki oyuncuyu yan yana karşılaştırın, istatistikleri analiz edin</p>
            </div>
          </div>

          {/* Player Selectors */}
          <Card className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-6 items-center">
                <PlayerSelector
                  player={player1}
                  label="1. Oyuncu"
                  players={availablePlayers}
                  onSelect={(p) => handlePlayerSelect(1, p)}
                  onClear={() => setPlayer1(null)}
                />
                <button
                  onClick={swapPlayers}
                  disabled={!player1 || !player2}
                  className="flex-shrink-0 p-3 rounded-xl bg-bursa-green-100 dark:bg-bursa-green-900/30 text-bursa-green hover:bg-bursa-green-200 dark:hover:bg-bursa-green-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Oyuncuları değiştir"
                >
                  <ArrowLeftRight className="w-6 h-6" />
                </button>
                <PlayerSelector
                  player={player2}
                  label="2. Oyuncu"
                  players={availablePlayers}
                  onSelect={(p) => handlePlayerSelect(2, p)}
                  onClear={() => setPlayer2(null)}
                />
                <div className="flex-1" />
                <Button variant="secondary" onClick={resetComparison} className="whitespace-nowrap">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sıfırla
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Winner Banner */}
        {winner && player2 && (
          <Card className="mb-6 border-bursa-green/50 bg-bursa-green-50 dark:bg-bursa-green-900/20">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-bursa-green flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-bursa-green">Bu Kategoride Önde: {winner.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Seçili istatistiklerde {winner === player1 ? player1.name.split(" ")[0] : player2.name.split(" ")[0]} daha yüksek performans gösteriyor
                  </p>
                </div>
              </div>
              <Badge variant="success">Kazanıldı</Badge>
            </CardContent>
          </Card>
        )}

        {/* View Mode Tabs */}
        <Card className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 mb-6">
          <CardContent className="p-2">
            <div className="flex gap-1">
              {[
                { id: "radar", label: "Radar Grafik", icon: Target },
                { id: "bars", label: "Çubuk Grafik", icon: BarChart2 },
                { id: "pie", label: "Pasta Grafik", icon: PieChart },
                { id: "table", label: "Tablo", icon: Scale },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setViewMode(tab.id as typeof viewMode)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    viewMode === tab.id
                      ? "bg-white dark:bg-gray-800 text-bursa-green shadow"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stat Filter */}
        <Card className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-700 dark:text-gray-300">Karşılaştırılacak İstatistikler:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {COMPARISON_STATS.map((stat) => (
                <label
                  key={stat.key}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer transition-all border",
                    selectedStats.includes(stat.key)
                      ? "bg-bursa-green text-white border-bursa-green"
                      : "text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-bursa-green"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedStats.includes(stat.key)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedStats([...selectedStats, stat.key])
                      } else {
                        setSelectedStats(selectedStats.filter((s) => s !== stat.key))
                      }
                    }}
                    className="w-4 h-4 text-bursa-green border-gray-300 rounded focus:ring-bursa-green"
                  />
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded" style={{ backgroundColor: stat.color }} />
                    {stat.label}
                  </span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Comparison Content */}
        {player1 && player2 && player1.stats && player2.stats && (
          <div className="space-y-6">
            {/* Radar Chart */}
            {viewMode === "radar" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Radar Karşılaştırma (Normalize Edilmiş)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[500px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" innerRadius={30} outerRadius={120} data={radarData}>
                        <PolarGrid gridType="polygon" stroke="#e5e7eb" />
                        <PolarAngleAxis stroke="#6b7280" fontSize={12} />
                        <PolarRadiusAxis angle={30} stroke="#6b7280" fontSize={10} domain={[0, 100]} />
                        <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", color: "white" }} />
                        <Radar
                          name={player1.name.split(" ")[0]}
                          dataKey={player1.name.split(" ")[0]}
                          stroke="#006633"
                          fill="#006633"
                          fillOpacity={0.2}
                          strokeWidth={2}
                          dot={false}
                        />
                        <Radar
                          name={player2.name.split(" ")[0]}
                          dataKey={player2.name.split(" ")[0]}
                          stroke="#ef4444"
                          fill="#ef4444"
                          fillOpacity={0.2}
                          strokeWidth={2}
                          dot={false}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-center text-sm text-gray-500 mt-4">
                    Değerler 0-100 aralığına normalize edilmiştir. Dışa doğru daha iyi performans.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Bar Chart */}
            {viewMode === "bars" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart2 className="w-5 h-5" />
                    Çubuk Grafik Karşılaştırma
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[500px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis type="number" stroke="#6b7280" fontSize={11} />
                        <YAxis dataKey="stat" type="category" stroke="#6b7280" fontSize={12} width={100} />
                        <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", color: "white" }} />
                        <Bar dataKey={player1.name.split(" ")[0]} fill="#006633" name={player1.name.split(" ")[0]} radius={[0, 4, 4, 0]} />
                        <Bar dataKey={player2.name.split(" ")[0]} fill="#ef4444" name={player2.name.split(" ")[0]} radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pie Chart */}
            {viewMode === "pie" && (
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="w-5 h-5" />
                      {player1.name.split(" ")[0]} - İstatistik Dağılımı
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={COMPARISON_STATS.filter(s => selectedStats.includes(s.key)).map(s => ({
                              name: s.label,
                              value: getStatValue(player1, s.key),
                              color: s.color,
                            }))}
                            cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                            dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                          >
                            {COMPARISON_STATS.filter(s => selectedStats.includes(s.key)).map((_, i) => (
                              <Cell key={i} fill={COMPARISON_STATS[i].color} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", color: "white" }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="w-5 h-5" />
                      {player2.name.split(" ")[0]} - İstatistik Dağılımı
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={COMPARISON_STATS.filter(s => selectedStats.includes(s.key)).map(s => ({
                              name: s.label,
                              value: getStatValue(player2, s.key),
                              color: s.color,
                            }))}
                            cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                            dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                          >
                            {COMPARISON_STATS.filter(s => selectedStats.includes(s.key)).map((_, i) => (
                              <Cell key={i} fill={COMPARISON_STATS[i].color} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", color: "white" }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Table */}
            {viewMode === "table" && (
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="w-5 h-5" />
                    Detaylı Tablo Karşılaştırma
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-40">İstatistik</th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-40">
                            {player1.name.split(" ")[0]}
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-40">
                            {player2.name.split(" ")[0]}
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-32">Fark</th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-32">Kazanan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {COMPARISON_STATS.filter(s => selectedStats.includes(s.key)).map((stat) => {
                          const v1 = getStatValue(player1, stat.key)
                          const v2 = getStatValue(player2, stat.key)
                          const isLowerBetter = stat.key === "yellowCards" || stat.key === "redCards"
                          const diff = isLowerBetter ? v2 - v1 : v1 - v2
                          const winnerPlayer = isLowerBetter ? (v1 < v2 ? player1 : v2) : (v1 > v2 ? player1 : v2)
                          const isTie = v1 === v2

                          return (
                            <tr key={stat.key} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <span className="w-3 h-3 rounded" style={{ backgroundColor: stat.color }} />
                                  <span className="font-medium">{stat.label}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center font-bold text-gray-900 dark:text-white">
                                {stat.key === "passAccuracy" ? `${v1}%` : stat.key === "rating" ? v1.toFixed(2) : v1}
                              </td>
                              <td className="px-4 py-3 text-center font-bold text-gray-900 dark:text-white">
                                {stat.key === "passAccuracy" ? `${v2}%` : stat.key === "rating" ? v2.toFixed(2) : v2}
                              </td>
                              <td className="px-4 py-3 text-center font-bold" style={{ color: diff > 0 ? "#22c55e" : diff < 0 ? "#ef4444" : "#6b7280" }}>
                                {diff > 0 ? `+` : ""}{stat.key === "rating" ? diff.toFixed(2) : diff}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {isTie ? (
                                  <Badge variant="default" size="sm">Berabere</Badge>
                                ) : (
                                  <Badge variant={winnerPlayer === player1 ? "success" : "danger"} size="sm">
                                    {winnerPlayer.name.split(" ")[0]}
                                    <Check className="w-3 h-3 ml-1 inline" />
                                  </Badge>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Player Cards Side by Side */}
            <div className="grid lg:grid-cols-2 gap-6">
              <PlayerDetailCard player={player1} highlight={winner === player1} />
              <PlayerDetailCard player={player2} highlight={winner === player2} />
            </div>
          </div>
        )}

        {(!player1 || !player2) && (
          <Card className="text-center py-16">
            <CardContent>
              <Scale className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">İki Oyuncu Seçin</h3>
              <p className="text-gray-500 dark:text-gray-400">Yukarıdaki seçim kutularından karşılaştırmak istediğiniz oyuncuları seçin.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

interface PlayerSelectorProps {
  player: Player | null
  label: string
  players: Player[]
  onSelect: (player: Player) => void
  onClear: () => void
}

function PlayerSelector({ player, label, players, onSelect, onClear }: PlayerSelectorProps) {
  const [search, setSearch] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)

  const filtered = players.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) && p.id !== player?.id
  )

  return (
    <div className="relative flex-1 min-w-0">
      <label className="label-field">{label}</label>
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className={cn(
            "w-full px-4 py-3 rounded-lg border text-left transition-colors",
            player
              ? "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          )}
        >
          {player ? (
            <div className="flex items-center gap-3">
              <img src={player.photo || "/logos/bursaspor.svg"} alt={player.name} className="w-10 h-10 rounded-full object-cover" />
              <div className="flex-1 min-w-0 text-left">
                <p className="font-medium text-gray-900 dark:text-white truncate">{player.name}</p>
                <p className="text-sm text-gray-500">#{player.number} · {player.position} · {player.age} yaş</p>
              </div>
              <X className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-pointer" onClick={(e) => { e.stopPropagation(); onClear(); }} />
            </div>
          ) : (
            <span className="text-gray-500">Oyuncu seçin...</span>
          )}
        </button>

        {showDropdown && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg z-50 max-h-96 overflow-y-auto">
            <input
              type="text"
              placeholder="Oyuncu ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field m-3"
              autoFocus
            />
            <div className="px-3 pb-3 max-h-64 overflow-y-auto">
              {filtered.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { onSelect(p); setShowDropdown(false); setSearch(""); }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                >
                  <img src={p.photo || "/logos/bursaspor.svg"} alt={p.name} className="w-8 h-8 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{p.name}</p>
                    <p className="text-xs text-gray-500">#{p.number} · {p.position} · {p.age} yaş</p>
                  </div>
                  {p.stats && (
                    <span className="text-sm font-bold text-yellow-500">{p.stats.rating}</span>
                  )}
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="text-center text-gray-500 py-4">Oyuncu bulunamadı</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface PlayerDetailCardProps {
  player: Player
  highlight: boolean
}

function PlayerDetailCard({ player, highlight }: PlayerDetailCardProps) {
  const stats = player.stats!

  return (
    <Card className={cn("overflow-hidden", highlight && "ring-2 ring-bursa-green shadow-lg")}>
      {highlight && (
        <div className="h-2 bg-gradient-to-r from-bursa-green to-bursa-green-light" />
      )}
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <img src={player.photo || "/logos/bursaspor.svg"} alt={player.name} className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700" />
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{player.name}</h3>
            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
              <span className="flex items-center gap-1"><Badge variant="default" size="sm">{player.position}</Badge></span>
              <span>#{player.number}</span>
              <span>{player.age} yaş</span>
              <span>{player.nationality}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatBox label="Gol" value={stats.goals} color="#ef4444" icon="⚽" />
          <StatBox label="Asist" value={stats.assists} color="#22c55e" icon="🎯" />
          <StatBox label="Rating" value={stats.rating.toFixed(2)} color="#f59e0b" icon="⭐" />
          <StatBox label="Pas %" value={`${stats.passAccuracy}%`} color="#3b82f6" icon="📊" />
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatBox label="Takıl/Maç" value={stats.tacklesPerGame} color="#8b5cf6" icon="🛡️" />
          <StatBox label="Kesme/Maç" value={stats.interceptionsPerGame} color="#06b6d4" icon="🔍" />
          <StatBox label="Dakika" value={`${stats.minutesPlayed}'`} color="#6366f1" icon="⏱️" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatBox label="Sarı Kart" value={stats.yellowCards} color="#f97316" icon="🟨" />
          <StatBox label="Kırmızı Kart" value={stats.redCards} color="#ef4444" icon="🟥" />
        </div>
      </CardContent>
    </Card>
  )
}

function StatBox({ label, value, color, icon }: { label: string; value: string | number; color: string; icon: string }) {
  return (
    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <p className="text-xl font-bold text-gray-900 dark:text-white" style={{ color }}>{value}</p>
    </div>
  )
}