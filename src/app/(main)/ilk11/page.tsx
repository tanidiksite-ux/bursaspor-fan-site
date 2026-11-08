"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { BURSASPOR_PLAYERS, FORMATIONS, Formation, Player } from "@/lib/data"
import { cn } from "@/lib/utils"
import {
  Users,
  Download,
  Share2,
  RotateCcw,
  Plus,
  Minus,
  GripVertical,
  Trash2,
  Save,
  Loader2,
} from "lucide-react"
// Import from react-dnd - use require to avoid TS issues with types
// @ts-ignore
import { useDrag, useDrop, DndProvider } from "react-dnd"
// @ts-ignore
import type { DragSourceMonitor, DropTargetMonitor } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"

type PitchPosition = { x: number; y: number; role: string; playerId?: string } | null

interface FormationPlayer {
  player: Player
  position: { x: number; y: number }
  isCaptain: boolean
  isSubstitute: boolean
}

const INITIAL_FORMATION = "4-4-2"

export default function Starting11Page() {
  const [formation, setFormation] = useState<Formation>(
    FORMATIONS.find((f) => f.id === INITIAL_FORMATION)!
  )
  const [lineup, setLineup] = useState<FormationPlayer[]>([])
  const [substitutes, setSubstitutes] = useState<Player[]>([])
  const [captainId, setCaptainId] = useState<string | null>(null)
  const [savedLineups, setSavedLineups] = useState<FormationPlayer[][]>([])
  const [isLoading, setIsLoading] = useState(false)

  const availablePlayers = BURSASPOR_PLAYERS.filter(
    (p) => !lineup.some((lp) => lp.player.id === p.id) && !substitutes.some((sp) => sp.id === p.id)
  )

  const positionPlayers = formation.positions.map((pos) => {
    const assigned = lineup.find((lp) => 
      Math.abs(lp.position.x - pos.x) < 5 && Math.abs(lp.position.y - pos.y) < 5
    )
    return { ...pos, player: assigned?.player || null }
  })

  const handlePlayerDrop = useCallback((player: Player, position: { x: number; y: number; role: string }) => {
    setLineup((prev) => {
      const existing = prev.find((lp) => lp.player.id === player.id)
      if (existing) {
        return prev.map((lp) =>
          lp.player.id === player.id ? { ...lp, position, isSubstitute: false } : lp
        )
      }
      if (prev.length >= 11) return prev
      return [...prev, { player, position, isCaptain: false, isSubstitute: false }]
    })
    setSubstitutes((prev) => prev.filter((p) => p.id !== player.id))
  }, [])

  const handleSubstituteDrop = useCallback((player: Player) => {
    setLineup((prev) => prev.filter((lp) => lp.player.id !== player.id))
    setSubstitutes((prev) => [...prev, player])
  }, [])

  const removeFromLineup = useCallback((playerId: string) => {
    const player = lineup.find((lp) => lp.player.id === playerId)?.player
    if (player) {
      setSubstitutes((prev) => [...prev, player])
      setLineup((prev) => prev.filter((lp) => lp.player.id !== playerId))
    }
  }, [lineup])

  const toggleCaptain = useCallback((playerId: string) => {
    setCaptainId((prev) => (prev === playerId ? null : playerId))
    setLineup((prev) =>
      prev.map((lp) => (lp.player.id === playerId ? { ...lp, isCaptain: !lp.isCaptain } : lp))
    )
  }, [])

  const saveLineup = useCallback(() => {
    if (lineup.length === 11) {
      setSavedLineups((prev) => [...prev, lineup])
    }
  }, [lineup])

  const loadLineup = useCallback((saved: FormationPlayer[]) => {
    setLineup(saved)
    setCaptainId(saved.find((p) => p.isCaptain)?.player.id || null)
  }, [])

  const resetLineup = useCallback(() => {
    setLineup([])
    setSubstitutes([])
    setCaptainId(null)
  }, [])

  const autoFill = useCallback(() => {
    const sortedPlayers = [...BURSASPOR_PLAYERS].sort((a, b) => {
      const posOrder: Record<string, number> = {
        GK: 1, CB: 2, LB: 3, RB: 4, LWB: 5, RWB: 6,
        CDM: 7, CM: 8, CAM: 9, LM: 10, RM: 11, LW: 12, RW: 13, CF: 14, ST: 15
      }
      return (posOrder[a.position] || 99) - (posOrder[b.position] || 99)
    })

    const newLineup: FormationPlayer[] = []
    const usedPlayers = new Set<string>()

    formation.positions.forEach((pos) => {
      const player = sortedPlayers.find((p) => p.position === pos.role && !usedPlayers.has(p.id))
      if (player) {
        newLineup.push({ player, position: { x: pos.x, y: pos.y }, isCaptain: false, isSubstitute: false })
        usedPlayers.add(player.id)
      }
    })

    const remaining = sortedPlayers.filter((p) => !usedPlayers.has(p.id))
    const subs = remaining.slice(0, 7)

    setLineup(newLineup)
    setSubstitutes(subs)
    if (newLineup.length > 0) {
      setCaptainId(newLineup[0].player.id)
      setLineup((prev) => prev.map((lp, i) => ({ ...lp, isCaptain: i === 0 })))
    }
  }, [formation])

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen py-8">
        <div className="container-custom">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-bursa-green flex items-center justify-center">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">İlk 11 Oluşturucu</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Sürükle-bırak ile kadro oluşturun, kaptan belirleyin ve paylaşın
                </p>
              </div>
            </div>

            {/* Formation Selector */}
            <Card className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Formasyon:</span>
                  <div className="flex gap-2 flex-wrap">
                    {FORMATIONS.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setFormation(f)}
                        className={cn(
                          "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                          formation.id === f.id
                            ? "bg-bursa-green text-white shadow-lg"
                            : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-bursa-green-50 dark:hover:bg-bursa-green-900/30 border border-gray-200 dark:border-gray-700"
                        )}
                      >
                        {f.name}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2 ml-auto">
                    <Button variant="secondary" size="sm" onClick={autoFill} disabled={isLoading}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Otomatik Doldur
                    </Button>
                    <Button variant="secondary" size="sm" onClick={resetLineup}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Temizle
                    </Button>
                    <Button variant="primary" size="sm" onClick={saveLineup} disabled={lineup.length !== 11}>
                      <Save className="w-4 h-4 mr-2" />
                      Kaydet
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-[1fr_380px] gap-8">
            {/* Pitch */}
            <div className="space-y-6">
              <Card padding="none" className="formation-pitch overflow-hidden relative">
                <div className="aspect-[100/68] relative">
                  {/* Pitch Lines */}
                  <div className="absolute inset-0 border-2 border-white/30 rounded-xl" />
                  <div className="absolute top-1/2 left-0 right-0 border-t border-white/30" style={{ transform: "translateY(-50%)" }} />
                  <div className="absolute top-1/2 left-1/2 w-8 h-8 border-2 border-white/30 rounded-full" style={{ transform: "translate(-50%, -50%)" }} />
                  <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white/30 rounded-full" style={{ transform: "translate(-50%, -50%)" }} />
                  
                  {/* Penalty Areas */}
                  <div className="absolute left-0 top-[22%] w-[18%] h-[56%] border-2 border-white/30 border-l-0 rounded-r-xl" />
                  <div className="absolute right-0 top-[22%] w-[18%] h-[56%] border-2 border-white/30 border-r-0 rounded-l-xl" />
                  
                  {/* Goal Areas */}
                  <div className="absolute left-0 top-[35%] w-[6%] h-[30%] border-2 border-white/30 border-l-0 rounded-r-lg" />
                  <div className="absolute right-0 top-[35%] w-[6%] h-[30%] border-2 border-white/30 border-r-0 rounded-l-lg" />
                  
                  {/* Penalty Spots */}
                  <div className="absolute left-[11%] top-1/2 w-1.5 h-1.5 bg-white/30 rounded-full" style={{ transform: "translateY(-50%)" }} />
                  <div className="absolute right-[11%] top-1/2 w-1.5 h-1.5 bg-white/30 rounded-full" style={{ transform: "translateY(-50%)" }} />

                  {/* Players on Pitch */}
                  {positionPlayers.map((pos, index) => (
                    <PitchPlayer
                      key={index}
                      position={pos}
                      lineup={lineup}
                      captainId={captainId}
                      onCaptainClick={toggleCaptain}
                      onRemove={removeFromLineup}
                    />
                  ))}
                </div>
              </Card>

              {/* Substitutes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Yedekler ({substitutes.length}/7)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {substitutes.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Henüz yedek oyuncu yok</p>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      {substitutes.map((player) => (
                        <SubstitutePlayerCard
                          key={player.id}
                          player={player}
                          onRemove={handleSubstituteDrop}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Available Players */}
            <div className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Kullanılabilir Oyuncular ({availablePlayers.length})
                  </CardTitle>
                  <Badge variant="info" size="sm">
                    Sürükleyip bırakın
                  </Badge>
                </CardHeader>
                <CardContent className="p-0 max-h-[600px] overflow-y-auto">
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {availablePlayers.map((player) => (
                      <DraggablePlayerCard key={player.id} player={player} />
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Saved Lineups */}
              {savedLineups.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Save className="w-5 h-5" />
                      Kaydedilen Kadrolar ({savedLineups.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {savedLineups.map((saved, index) => (
                        <div
                          key={index}
                          className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-bursa-green-100 dark:bg-bursa-green-900/30 flex items-center justify-center">
                              <span className="text-bursa-green font-bold text-sm">{index + 1}</span>
                            </div>
                            <div>
                              <p className="font-medium text-sm">{formation.name} Formasyonu</p>
                              <p className="text-xs text-gray-500">{saved.length} oyuncu · Kaptan: {saved.find((p) => p.isCaptain)?.player.name || "Belirlenmemiş"}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => loadLineup(saved)}>
                            Yükle
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Export/Share */}
              <Card className="bg-gradient-to-r from-bursa-green to-bursa-green-dark text-white">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-3">Kadronu Paylaş</h3>
                  <p className="text-white/80 mb-4 text-sm">
                    Oluşturduğunuz kadroyu sosyal medyada paylaşın veya resim olarak indirin.
                  </p>
                  <div className="flex gap-3">
                    <Button variant="secondary" className="bg-white/20 border-white/30 hover:bg-white/30 text-white flex-1">
                      <Download className="w-4 h-4 mr-2" />
                      Resim Olarak İndir
                    </Button>
                    <Button variant="ghost" className="text-white hover:bg-white/10 border-white/30 flex-1">
                      <Share2 className="w-4 h-4 mr-2" />
                      Paylaş
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  )
}

interface PitchPlayerProps {
  position: { x: number; y: number; role: string; player?: Player | null }
  lineup: FormationPlayer[]
  captainId: string | null
  onCaptainClick: (id: string) => void
  onRemove: (id: string) => void
}

function PitchPlayer({ position, lineup, captainId, onCaptainClick, onRemove }: PitchPlayerProps) {
  const assigned = lineup.find(
    (lp) => Math.abs(lp.position.x - position.x) < 5 && Math.abs(lp.position.y - position.y) < 5
  )

  if (!assigned) {
    return (
      <div
        className="absolute w-10 h-10 rounded-full border-2 border-dashed border-white/40 flex items-center justify-center text-white/40 text-xs font-medium pointer-events-none"
        style={{ left: `${position.x}%`, top: `${position.y}%`, transform: "translate(-50%, -50%)" }}
      >
        {position.role}
      </div>
    )
  }

  const { player, isCaptain } = assigned
  const isGK = player.position === "GK"

  return (
    <div
      className={cn(
        "absolute w-20 h-24 transition-all duration-200 cursor-pointer",
        isCaptain && "ring-2 ring-yellow-400 ring-offset-2 ring-offset-green-800"
      )}
      style={{ left: `${position.x}%`, top: `${position.y}%`, transform: "translate(-50%, -50%)" }}
      onClick={() => onCaptainClick(player.id)}
    >
      <div className={cn(
        "relative w-full h-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col items-center p-2",
        isGK && "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-400"
      )}>
        <div className="flex items-center gap-1 w-full mb-1">
          <span className="text-xs font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
            {player.number}
          </span>
          {isCaptain && <span className="text-yellow-500 ml-auto mr-1">★</span>}
        </div>
        <p className="text-xs font-medium text-gray-900 dark:text-white text-center truncate w-full px-1">
          {player.name.split(" ").pop()}
        </p>
        <p className="text-[10px] text-gray-500 text-center">{player.position}</p>
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(player.id); }}
          className="mt-1 p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded text-xs"
          aria-label={`${player.name} oyuncuyu kaldır`}
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}

interface SubstitutePlayerCardProps {
  player: Player
  onRemove: (player: Player) => void
}

function SubstitutePlayerCard({ player, onRemove }: SubstitutePlayerCardProps) {
  return (
    <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 group">
      <span className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-sm font-bold text-gray-700 dark:text-gray-300 flex-shrink-0">
        {player.number}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{player.name}</p>
        <p className="text-xs text-gray-500">{player.position}</p>
      </div>
      <button
        onClick={() => onRemove(player)}
        className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label={`${player.name} oyuncuyu ana kadrodan çıkar`}
      >
        <Minus className="w-4 h-4" />
      </button>
    </div>
  )
}

interface DraggablePlayerCardProps {
  player: Player
}

function DraggablePlayerCard({ player }: DraggablePlayerCardProps) {
  const [{ isDragging }, drag] = useDrag({
    type: "PLAYER",
    item: { player },
    collect: (monitor: DragSourceMonitor) => ({ isDragging: monitor.isDragging() }),
  })

  const [{ canDrop }, drop] = useDrop({
    accept: "PLAYER",
    collect: (monitor: DropTargetMonitor) => ({ canDrop: monitor.canDrop() }),
  })

  drag(drop)

  return (
    <div
      ref={drag}
      className={cn(
        "p-3 flex items-center gap-3 cursor-grab active:cursor-grabbing transition-opacity",
        isDragging && "opacity-50",
        canDrop && "bg-bursa-green-50 dark:bg-bursa-green-900/20"
      )}
    >
      <GripVertical className="w-5 h-5 text-gray-300 flex-shrink-0" />
      <span className="w-10 h-10 rounded-full bg-bursa-green-100 dark:bg-bursa-green-900/30 flex items-center justify-center text-sm font-bold text-bursa-green flex-shrink-0">
        {player.number}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{player.name}</p>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Badge variant="default" size="sm">{player.position}</Badge>
          <span className="text-yellow-500">★ {player.stats?.rating || "—"}</span>
        </div>
      </div>
      <Plus className="w-5 h-5 text-bursa-green opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  )
}