"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { FORMATIONS, Formation, BURSASPOR_PLAYERS, Player } from "@/lib/data"
import { cn } from "@/lib/utils"
import {
  PenTool,
  Eraser,
  ArrowRight,
  ArrowUpDown,
  Layers,
  Trash2,
  Download,
  Share2,
  RotateCcw,
  Undo,
  Redo,
  Palette,
  Minus,
  Plus,
  Move,
  Target,
  Square,
  Circle,
} from "lucide-react"

type Tool = "select" | "draw" | "arrow" | "line" | "circle" | "rect" | "text" | "eraser"
type DrawColor = "#FF0000" | "#00FF00" | "#0000FF" | "#FFFF00" | "#FFFFFF" | "#FFA500" | "#FF00FF" | "#00FFFF"

interface DrawingObject {
  id: string
  type: "line" | "arrow" | "circle" | "rect" | "text" | "freehand" | "eraser"
  points: { x: number; y: number }[]
  color: DrawColor
  strokeWidth: number
  text?: string
  fontSize?: number
}

const COLORS: DrawColor[] = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FFFFFF", "#FFA500", "#FF00FF", "#00FFFF"]
const STROKE_WIDTHS = [1, 2, 3, 4, 5, 6, 8]

const INITIAL_FORMATION = "4-4-2"

export default function TacticalScreenPage() {
  const [formation, setFormation] = useState<Formation>(
    FORMATIONS.find((f) => f.id === INITIAL_FORMATION)!
  )
  const [tool, setTool] = useState<Tool>("select")
  const [color, setColor] = useState<DrawColor>("#FFFFFF")
  const [strokeWidth, setStrokeWidth] = useState(3)
  const [drawings, setDrawings] = useState<DrawingObject[]>([])
  const [history, setHistory] = useState<DrawingObject[][]>([[]])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [showPlayers, setShowPlayers] = useState(true)
  const [showGrid, setShowGrid] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDrawingRef = useRef(false)
  const currentDrawingRef = useRef<DrawingObject | null>(null)

  // Save to history
  const saveToHistory = useCallback((newDrawings: DrawingObject[]) => {
    setDrawings(newDrawings)
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newDrawings)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }, [history, historyIndex])

  // Undo/Redo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setDrawings(history[newIndex])
    }
  }, [history, historyIndex])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setDrawings(history[newIndex])
    }
  }, [history, historyIndex])

  const clearCanvas = useCallback(() => {
    saveToHistory([])
  }, [saveToHistory])

  // Canvas drawing
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = container.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`
    ctx.scale(dpr, dpr)

    // Clear
    ctx.clearRect(0, 0, rect.width, rect.height)

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = "rgba(255,255,255,0.1)"
      ctx.lineWidth = 1
      for (let i = 0; i <= 10; i++) {
        const x = (rect.width / 10) * i
        const y = (rect.height / 10) * i
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, rect.height)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(rect.width, y)
        ctx.stroke()
      }
    }

    // Draw all drawings
    drawings.forEach((drawing) => {
      ctx.strokeStyle = drawing.color
      ctx.fillStyle = drawing.color
      ctx.lineWidth = drawing.strokeWidth
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      if (drawing.type === "freehand" || drawing.type === "line" || drawing.type === "arrow") {
        if (drawing.points.length < 2) return
        ctx.beginPath()
        ctx.moveTo(drawing.points[0].x, drawing.points[0].y)
        for (let i = 1; i < drawing.points.length; i++) {
          ctx.lineTo(drawing.points[i].x, drawing.points[i].y)
        }
        ctx.stroke()

        if (drawing.type === "arrow" && drawing.points.length >= 2) {
          const last = drawing.points[drawing.points.length - 1]
          const prev = drawing.points[drawing.points.length - 2]
          const angle = Math.atan2(last.y - prev.y, last.x - prev.x)
          const headLength = 15
          ctx.beginPath()
          ctx.moveTo(last.x, last.y)
          ctx.lineTo(
            last.x - headLength * Math.cos(angle - Math.PI / 6),
            last.y - headLength * Math.sin(angle - Math.PI / 6)
          )
          ctx.moveTo(last.x, last.y)
          ctx.lineTo(
            last.x - headLength * Math.cos(angle + Math.PI / 6),
            last.y - headLength * Math.sin(angle + Math.PI / 6)
          )
          ctx.stroke()
        }
      } else if (drawing.type === "circle") {
        if (drawing.points.length < 2) return
        const center = drawing.points[0]
        const radius = Math.hypot(
          drawing.points[1].x - center.x,
          drawing.points[1].y - center.y
        )
        ctx.beginPath()
        ctx.arc(center.x, center.y, radius, 0, Math.PI * 2)
        ctx.stroke()
      } else if (drawing.type === "rect") {
        if (drawing.points.length < 2) return
        const [p1, p2] = drawing.points
        ctx.strokeRect(
          Math.min(p1.x, p2.x),
          Math.min(p1.y, p2.y),
          Math.abs(p2.x - p1.x),
          Math.abs(p2.y - p1.y)
        )
      } else if (drawing.type === "text" && drawing.text) {
        ctx.font = `${drawing.fontSize || 14}px Arial`
        ctx.fillText(drawing.text, drawing.points[0].x, drawing.points[0].y)
      }
    })
  }, [drawings, showGrid])

  useEffect(() => {
    drawCanvas()
  }, [drawCanvas])

  // Mouse handlers
  const getCanvasCoords = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const container = containerRef.current
    if (!container) return { x: 0, y: 0 }
    const rect = container.getBoundingClientRect()
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY
    return { x: clientX - rect.left, y: clientY - rect.top }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (tool === "select") return
    const coords = getCanvasCoords(e)
    isDrawingRef.current = true
    currentDrawingRef.current = {
      id: Date.now().toString(),
      type: tool === "draw" ? "freehand" : tool,
      points: [coords],
      color,
      strokeWidth,
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawingRef.current || !currentDrawingRef.current) return
    const coords = getCanvasCoords(e)
    currentDrawingRef.current.points.push(coords)
    drawCanvas()
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (tool === "select") return
    const coords = getCanvasCoords(e)
    isDrawingRef.current = true
    currentDrawingRef.current = {
      id: Date.now().toString(),
      type: tool === "draw" ? "freehand" : tool,
      points: [coords],
      color,
      strokeWidth,
    }
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDrawingRef.current || !currentDrawingRef.current) return
    e.preventDefault()
    const coords = getCanvasCoords(e)
    currentDrawingRef.current.points.push(coords)
    drawCanvas()
  }

  const handleMouseUp = () => {
    if (isDrawingRef.current && currentDrawingRef.current) {
      if (currentDrawingRef.current.points.length > 1 || currentDrawingRef.current.type === "text") {
        saveToHistory([...drawings, currentDrawingRef.current])
      }
    }
    isDrawingRef.current = false
    currentDrawingRef.current = null
  }

  const handleTouchEnd = () => {
    handleMouseUp()
  }

  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (tool !== "text") return
    const coords = getCanvasCoords(e)
    const text = prompt("Metin girin:")
    if (text) {
      const newDrawing: DrawingObject = {
        id: Date.now().toString(),
        type: "text",
        points: [coords],
        color,
        strokeWidth,
        text,
        fontSize: 14,
      }
      saveToHistory([...drawings, newDrawing])
    }
  }

  return (
    <div className="min-h-screen py-4 px-4">
      {/* Toolbar */}
      <Card className="mb-4 sticky top-4 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-gray-200 dark:border-gray-700 shadow-lg">
        <CardContent className="p-3">
          <div className="flex flex-wrap items-center gap-4">
            {/* Formation Selector */}
            <div className="flex items-center gap-2">
              <Badge variant="info">Formasyon</Badge>
              <select
                value={formation.id}
                onChange={(e) => setFormation(FORMATIONS.find((f) => f.id === e.target.value)!)}
                className="input-field py-1.5 text-sm min-w-[140px]"
              >
                {FORMATIONS.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 mx-2" />

            {/* Tools */}
            <div className="flex items-center gap-1">
              {[
                { id: "select", icon: Move, label: "Seç" },
                { id: "draw", icon: PenTool, label: "Kalem" },
                { id: "arrow", icon: ArrowRight, label: "Ok" },
                { id: "line", icon: Minus, label: "Çizgi" },
                { id: "circle", icon: Circle, label: "Daire" },
                { id: "rect", icon: Square, label: "Kare" },
                { id: "text", icon: Target, label: "Metin" },
                { id: "eraser", icon: Eraser, label: "Silgi" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTool(t.id as Tool)}
                  className={cn(
                    "p-2 rounded-lg transition-all",
                    tool === t.id
                      ? "bg-bursa-green text-white"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                  title={t.label}
                >
                  <t.icon className="w-5 h-5" />
                </button>
              ))}
            </div>

            <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 mx-2" />

            {/* Color Picker */}
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-gray-500" />
              <div className="flex gap-1">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c as DrawColor)}
                    className={cn(
                      "w-6 h-6 rounded transition-transform",
                      color === c ? "scale-125 ring-2 ring-bursa-green" : ""
                    )}
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
            </div>

            <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 mx-2" />

            {/* Stroke Width */}
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-gray-500" />
              <select
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(Number(e.target.value))}
                className="input-field py-1.5 text-sm w-20"
              >
                {STROKE_WIDTHS.map((w) => (
                  <option key={w} value={w}>{w}px</option>
                ))}
              </select>
            </div>

            <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 mx-2" />

            {/* Actions */}
            <div className="flex items-center gap-1 ml-auto">
              <button onClick={undo} disabled={historyIndex === 0} className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50" title="Geri Al">
                <Undo className="w-5 h-5" />
              </button>
              <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50" title="Yinele">
                <Redo className="w-5 h-5" />
              </button>
              <button onClick={clearCanvas} className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800" title="Temizle">
                <Trash2 className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800" title="İndir">
                <Download className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800" title="Paylaş">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showPlayers}
                onChange={(e) => setShowPlayers(e.target.checked)}
                className="w-4 h-4 text-bursa-green border-gray-300 rounded focus:ring-bursa-green"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Oyuncuları Göster</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="w-4 h-4 text-bursa-green border-gray-300 rounded focus:ring-bursa-green"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Izgara Göster</span>
            </label>
            <div className="flex-1" />
            <Badge variant={tool === "eraser" ? "danger" : "info"} size="sm">
              Araç: {tool === "select" ? "Seç" : tool === "draw" ? "Kalem" : tool === "arrow" ? "Ok" : tool === "line" ? "Çizgi" : tool === "circle" ? "Daire" : tool === "rect" ? "Kare" : tool === "text" ? "Metin" : "Silgi"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-4">
        {/* Pitch Canvas */}
        <Card padding="none" className="formation-pitch relative overflow-hidden">
          <div
            ref={containerRef}
            className="relative aspect-[100/68] touch-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onDoubleClick={handleDoubleClick}
          >
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
            
            {/* Pitch Lines (CSS) */}
            <div className="absolute inset-0 border-2 border-white/30 rounded-xl pointer-events-none" />
            <div className="absolute top-1/2 left-0 right-0 border-t border-white/30 pointer-events-none" style={{ transform: "translateY(-50%)" }} />
            <div className="absolute top-1/2 left-1/2 w-8 h-8 border-2 border-white/30 rounded-full pointer-events-none" style={{ transform: "translate(-50%, -50%)" }} />
            <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white/30 rounded-full pointer-events-none" style={{ transform: "translate(-50%, -50%)" }} />
            <div className="absolute left-0 top-[22%] w-[18%] h-[56%] border-2 border-white/30 border-l-0 rounded-r-xl pointer-events-none" />
            <div className="absolute right-0 top-[22%] w-[18%] h-[56%] border-2 border-white/30 border-r-0 rounded-l-xl pointer-events-none" />
            <div className="absolute left-0 top-[35%] w-[6%] h-[30%] border-2 border-white/30 border-l-0 rounded-r-lg pointer-events-none" />
            <div className="absolute right-0 top-[35%] w-[6%] h-[30%] border-2 border-white/30 border-r-0 rounded-l-lg pointer-events-none" />
            <div className="absolute left-[11%] top-1/2 w-1.5 h-1.5 bg-white/30 rounded-full pointer-events-none" style={{ transform: "translateY(-50%)" }} />
            <div className="absolute right-[11%] top-1/2 w-1.5 h-1.5 bg-white/30 rounded-full pointer-events-none" style={{ transform: "translateY(-50%)" }} />

            {/* Players */}
            {showPlayers && formation.positions.map((pos, index) => (
              <TacticalPlayer
                key={index}
                position={pos}
                index={index}
                onClick={() => setSelectedPlayer(BURSASPOR_PLAYERS[index % BURSASPOR_PLAYERS.length])}
              />
            ))}
          </div>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Efsane
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-white/90 dark:bg-gray-700/90 flex items-center justify-center border border-gray-200 dark:border-gray-600">
                  <span className="text-xs font-bold text-gray-900 dark:text-white">1</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Kaleci (GK)</p>
                  <p className="text-xs text-gray-500">Son savunma hattı</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-white/90 dark:bg-gray-700/90 flex items-center justify-center border border-gray-200 dark:border-gray-600">
                  <span className="text-xs font-bold text-gray-900 dark:text-white">2-5</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Defans (CB, LB, RB)</p>
                  <p className="text-xs text-gray-500">Kaleyi koruma</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-white/90 dark:bg-gray-700/90 flex items-center justify-center border border-gray-200 dark:border-gray-600">
                  <span className="text-xs font-bold text-gray-900 dark:text-white">6-8</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Orta Saha (CDM, CM, CAM)</p>
                  <p className="text-xs text-gray-500">Oyun kurma ve geçiş</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-white/90 dark:bg-gray-700/90 flex items-center justify-center border border-gray-200 dark:border-gray-600">
                  <span className="text-xs font-bold text-gray-900 dark:text-white">9-11</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Hücum (ST, LW, RW)</p>
                  <p className="text-xs text-gray-500">Gol atma sorumluluğu</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Tactics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpDown className="w-5 h-5" />
                Hızlı Taktikler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { name: "Yüksek Presing", desc: "Ön sahtan pres yapma", color: "#FF0000" },
                { name: "Orta Saha Presi", desc: "Orta sahada top kazanma", color: "#FFA500" },
                { name: "Düşük Blok", desc: "Kale önü savunma", color: "#00FF00" },
                { name: "Kanat Oyunu", desc: "Kanatlardan merkez geçiş", color: "#00FFFF" },
                { name: "Kontr Atağı", desc: "Hızlı hücum geçişi", color: "#FFFF00" },
                { name: "Top Sahipliği", desc: "Pas ağları ve kontrol", color: "#FF00FF" },
              ].map((tactic) => (
                <button
                  key={tactic.name}
                  className="w-full text-left p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-bursa-green-50 dark:hover:bg-bursa-green-900/30 transition-colors border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tactic.color }} />
                    <div>
                      <p className="font-medium text-sm">{tactic.name}</p>
                      <p className="text-xs text-gray-500">{tactic.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Selected Player Info */}
          {selectedPlayer && (
            <Card className="border-bursa-green/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-bursa-green" />
                  Seçili Oyuncu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-bursa-green-100 dark:bg-bursa-green-900/30 flex items-center justify-center">
                    <span className="text-2xl font-bold text-bursa-green">{selectedPlayer.number}</span>
                  </div>
                  <div>
                    <p className="font-bold">{selectedPlayer.name}</p>
                    <p className="text-sm text-gray-500">{selectedPlayer.position} · {selectedPlayer.age} yaş</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="default" size="sm">Form: {selectedPlayer.stats?.rating || "—"}</Badge>
                      <Badge variant="success" size="sm">Gol: {selectedPlayer.stats?.goals || 0}</Badge>
                      <Badge variant="info" size="sm">Asist: {selectedPlayer.stats?.assists || 0}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card className="bg-gradient-to-r from-bursa-green to-bursa-green-dark text-white">
            <CardContent className="p-4">
              <h4 className="font-bold mb-2">Nasıl Kullanılır?</h4>
              <ul className="space-y-1 text-sm text-white/90">
                <li>• <strong>Kalem/Ok/Şekil</strong> araçları ile sahaya çizim yapın</li>
                <li>• Renk ve kalınlık seçeneklerini kullanın</li>
                <li>• <strong>Geri Al/Yinele</strong> ile düzeltme yapın</li>
                <li>• Çizimlerinizi resim olarak indirin</li>
                <li>• Formasyon değiştirerek farklı taktikler deneyin</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

interface TacticalPlayerProps {
  position: { x: number; y: number; role: "GK" | "CB" | "LB" | "RB" | "LWB" | "RWB" | "CDM" | "CM" | "CAM" | "LM" | "RM" | "LW" | "RW" | "CF" | "ST" }
  index: number
  onClick: () => void
}

function TacticalPlayer({ position, index, onClick }: TacticalPlayerProps) {
  const isGK = position.role === "GK"
  return (
    <button
      onClick={onClick}
      className="absolute w-16 h-20 transition-all duration-200 hover:scale-110 hover:z-10"
      style={{ left: `${position.x}%`, top: `${position.y}%`, transform: "translate(-50%, -50%)" }}
    >
      <div className={cn(
        "relative w-full h-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-lg border-2 flex flex-col items-center p-1.5",
        isGK ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20" : "border-gray-200 dark:border-gray-700"
      )}>
        <div className="flex items-center gap-1 w-full mb-0.5">
          <span className="text-xs font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
            {index + 1}
          </span>
        </div>
        <p className="text-[10px] font-medium text-gray-900 dark:text-white text-center truncate w-full px-0.5 leading-tight">
          {position.role}
        </p>
      </div>
    </button>
  )
}