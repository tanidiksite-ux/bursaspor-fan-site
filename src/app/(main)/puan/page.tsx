"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { MOCK_STANDINGS, Standing, BURSASPOR } from "@/lib/data"
import { cn } from "@/lib/utils"
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Flag,
  BarChart2,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from "recharts"

const getFormColor = (result: "W" | "D" | "L") => {
  switch (result) {
    case "W": return "bg-green-500"
    case "D": return "bg-yellow-500"
    case "L": return "bg-red-500"
  }
}

const getFormLabel = (result: "W" | "D" | "L") => {
  switch (result) {
    case "W": return "G"
    case "D": return "B"
    case "L": return "M"
  }
}

export default function StandingsPage() {
  const [viewMode, setViewMode] = useState<"table" | "form">("table")
  const [selectedTeam, setSelectedTeam] = useState<Standing | null>(null)

  const bursasporStanding = MOCK_STANDINGS.find((s) => s.team.id === "bursaspor")!

  return (
    <div className="min-h-screen py-8">
      <div className="container-custom">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-bursa-green flex items-center justify-center">
              <Trophy className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Puan Durumu</h1>
              <p className="text-gray-600 dark:text-gray-400">Süper Lig 2024/25 sezon puan tablosu ve form grafikleri</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Bursaspor Sıralaması"
              value={`${bursasporStanding.position}.`}
              icon={Flag}
              color="text-bursa-green"
              bg="bg-bursa-green-100 dark:bg-bursa-green-900/30"
              trend={{ value: "+2", positive: true }}
            />
            <StatCard
              title="Puan"
              value={bursasporStanding.points.toString()}
              icon={Target}
              color="text-yellow-500"
              bg="bg-yellow-100 dark:bg-yellow-900/30"
              trend={{ value: "+3", positive: true }}
            />
            <StatCard
              title="Gol Farkı"
              value={bursasporStanding.goalDifference > 0 ? `+${bursasporStanding.goalDifference}` : bursasporStanding.goalDifference.toString()}
              icon={TrendingUp}
              color="text-blue-500"
              bg="bg-blue-100 dark:bg-blue-900/30"
              trend={{ value: "+5", positive: true }}
            />
            <StatCard
              title="Form (Son 5)"
              value={bursasporStanding.form.map(getFormLabel).join(" ")}
              icon={BarChart2}
              color="text-purple-500"
              bg="bg-purple-100 dark:bg-purple-900/30"
            />
          </div>

          {/* View Toggle */}
          <Card className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-500" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">Görünüm:</span>
                  <div className="flex gap-1 bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode("table")}
                      className={cn(
                        "px-4 py-2 rounded-md text-sm font-medium transition-all",
                        viewMode === "table"
                          ? "bg-white dark:bg-gray-800 text-bursa-green shadow"
                          : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                      )}
                    >
                      Tablo
                    </button>
                    <button
                      onClick={() => setViewMode("form")}
                      className={cn(
                        "px-4 py-2 rounded-md text-sm font-medium transition-all",
                        viewMode === "form"
                          ? "bg-white dark:bg-gray-800 text-bursa-green shadow"
                          : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                      )}
                    >
                      Form Grafikleri
                    </button>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  CSV İndir
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table View */}
        {viewMode === "table" && (
          <Card className="overflow-hidden">
            <CardHeader className="px-6 py-4">
              <CardTitle>Süper Lig Puan Tablosu</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-12">#</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Takım</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-12">O</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-12">G</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-12">B</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-12">M</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-16">A/Y</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-16">AV</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-12">P</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-40">Form</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {MOCK_STANDINGS.map((standing, index) => (
                      <StandingRow
                        key={standing.team.id}
                        standing={standing}
                        index={index}
                        isBursaspor={standing.team.id === "bursaspor"}
                        onClick={() => setSelectedTeam(standing)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form View */}
        {viewMode === "form" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Takım Form Grafikleri (Son 10 Maç)</CardTitle>
              </CardHeader>
              <CardContent>
                <FormCharts standings={MOCK_STANDINGS} />
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Şampiyonluk Yarışı (İlk 4)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TopRaceChart standings={MOCK_STANDINGS.slice(0, 6)} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="w-5 h-5" />
                    Küme Düşme Mücadelesi (Son 4)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BottomRaceChart standings={MOCK_STANDINGS.slice(-4)} />
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Team Detail Modal */}
        {selectedTeam && (
          <TeamDetailModal standing={selectedTeam} onClose={() => setSelectedTeam(null)} />
        )}
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bg: string
  trend?: { value: string; positive: boolean }
}

function StatCard({ title, value, icon: Icon, color, bg, trend }: StatCardProps) {
  return (
    <Card className="card-hover">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          </div>
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", bg)}>
            <Icon className={cn("w-6 h-6", color)} />
          </div>
        </div>
        {trend && (
          <div className="mt-3 flex items-center gap-1 text-sm">
            <TrendingUp className={cn("w-4 h-4", trend.positive ? "text-green-500" : "text-red-500")} />
            <span className={cn(trend.positive ? "text-green-500" : "text-red-500")}>{trend.value}</span>
            <span className="text-gray-500">hafta öncekiyle kıyasla</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface StandingRowProps {
  standing: Standing
  index: number
  isBursaspor: boolean
  onClick: () => void
}

function StandingRow({ standing, index, isBursaspor, onClick }: StandingRowProps) {
  const { team, position, played, won, drawn, lost, goalsFor, goalsAgainst, goalDifference, points, form } = standing

  const getPositionBadge = () => {
    if (position <= 2) return <Badge variant="success" size="sm">UCL</Badge>
    if (position === 3) return <Badge variant="info" size="sm">UEL</Badge>
    if (position === 4) return <Badge variant="warning" size="sm">UECL</Badge>
    if (position >= 18) return <Badge variant="danger" size="sm">Küme Düşme</Badge>
    return null
  }

  return (
    <tr
      onClick={onClick}
      className={cn(
        "cursor-pointer transition-colors",
        isBursaspor && "bg-bursa-green-50 dark:bg-bursa-green-900/20",
        "hover:bg-gray-50 dark:hover:bg-gray-800"
      )}
    >
      <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">
        {position}
        {getPositionBadge() && <span className="ml-2 inline-block">{getPositionBadge()}</span>}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <img src={team.logo} alt={team.name} className="w-8 h-8 object-contain" />
          <span className={cn("font-medium", isBursaspor && "text-bursa-green")}>{team.name}</span>
          {isBursaspor && <Badge variant="team" size="sm">BUR</Badge>}
        </div>
      </td>
      <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">{played}</td>
      <td className="px-4 py-3 text-center text-green-600 dark:text-green-400 font-medium">{won}</td>
      <td className="px-4 py-3 text-center text-yellow-600 dark:text-yellow-400 font-medium">{drawn}</td>
      <td className="px-4 py-3 text-center text-red-600 dark:text-red-400 font-medium">{lost}</td>
      <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400 font-mono tabular-nums">{goalsFor}/{goalsAgainst}</td>
      <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400 font-mono tabular-nums">
        {goalDifference > 0 ? `+${goalDifference}` : goalDifference}
      </td>
      <td className="px-4 py-3 text-center font-bold text-gray-900 dark:text-white text-lg">{points}</td>
      <td className="px-4 py-3">
        <div className="flex gap-1">
          {form.slice(-5).map((result, i) => (
            <div
              key={i}
              className={cn(
                "w-7 h-7 rounded flex items-center justify-center text-xs font-bold text-white",
                getFormColor(result)
              )}
            >
              {getFormLabel(result)}
            </div>
          ))}
        </div>
      </td>
    </tr>
  )
}

function FormCharts({ standings }: { standings: Standing[] }) {
  const data = standings.slice(0, 8).map((s) => ({
    name: s.team.shortName,
    points: s.points,
    won: s.won,
    drawn: s.drawn,
    lost: s.lost,
    isBursa: s.team.id === "bursaspor",
  }))

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
          <YAxis stroke="#6b7280" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1f2937",
              border: "none",
              borderRadius: "8px",
              color: "white",
            }}
          />
          <Bar dataKey="points" fill="#006633" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function TopRaceChart({ standings }: { standings: Standing[] }) {
  const data = standings.map((s, i) => ({
    week: `H${i + 1}`,
    points: s.points,
    team: s.team.shortName,
    isBursa: s.team.id === "bursaspor",
  }))

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorTop" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#006633" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#006633" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="week" stroke="#6b7280" fontSize={12} />
          <YAxis stroke="#6b7280" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1f2937",
              border: "none",
              borderRadius: "8px",
              color: "white",
            }}
          />
          <Area type="monotone" dataKey="points" stroke="#006633" fillOpacity={1} fill="url(#colorTop)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function BottomRaceChart({ standings }: { standings: Standing[] }) {
  const data = standings.map((s, i) => ({
    week: `H${i + 1}`,
    points: s.points,
    team: s.team.shortName,
  }))

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorBottom" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="week" stroke="#6b7280" fontSize={12} />
          <YAxis stroke="#6b7280" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1f2937",
              border: "none",
              borderRadius: "8px",
              color: "white",
            }}
          />
          <Area type="monotone" dataKey="points" stroke="#ef4444" fillOpacity={1} fill="url(#colorBottom)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

interface TeamDetailModalProps {
  standing: Standing
  onClose: () => void
}

function TeamDetailModal({ standing, onClose }: TeamDetailModalProps) {
  const { team, position, played, won, drawn, lost, goalsFor, goalsAgainst, goalDifference, points, form } = standing

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={team.logo} alt={team.name} className="w-16 h-16 object-contain" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{team.name}</h2>
              <p className="text-gray-500">Sıralama: {position}. | Puan: {points}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <StatBox label="Oynanan" value={played} icon={Target} color="blue" />
            <StatBox label="Galibiyet" value={won} icon={TrendingUp} color="green" />
            <StatBox label="Beraberlik" value={drawn} icon={Minus} color="yellow" />
            <StatBox label="Mağlubiyet" value={lost} icon={TrendingDown} color="red" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <StatBox label="Atılan Gol" value={goalsFor} icon={Target} color="purple" />
            <StatBox label="Yenen Gol" value={goalsAgainst} icon={Flag} color="orange" />
            <StatBox label="Gol Farkı" value={goalDifference > 0 ? `+${goalDifference}` : goalDifference} icon={TrendingUp} color="cyan" />
            <StatBox label="Puan" value={points} icon={Trophy} color="bursa" />
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Son 5 Maç Formu</h3>
            <div className="flex gap-2">
              {form.map((result, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white",
                    getFormColor(result)
                  )}
                >
                  {getFormLabel(result)}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <button onClick={onClose} className="btn-primary w-full">
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface StatBoxProps {
  label: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  color: string
}

function StatBox({ label, value, icon: Icon, color }: StatBoxProps) {
  const colors = {
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    yellow: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
    red: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
    purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
    orange: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
    cyan: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400",
    bursa: "bg-bursa-green-100 dark:bg-bursa-green-900/30 text-bursa-green dark:text-bursa-green-light",
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