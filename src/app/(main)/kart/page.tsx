"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { BURSASPOR, BURSASPOR_PLAYERS, FORMATIONS, getNextMatch } from "@/lib/data"
import { cn } from "@/lib/utils"
import {
  Image,
  Download,
  Share2,
  RotateCcw,
  Palette,
  Type,
  Users,
  Shield,
  Target,
  Calendar,
  Clock,
  Trophy,
  Sparkles,
  Layers,
  Minus,
  Plus,
  Check,
  X,
} from "lucide-react"
import { formatDate, formatTime } from "@/lib/utils"

type CardType = "match" | "lineup" | "result" | "prediction" | "player" | "stats"

interface CardTemplate {
  id: CardType
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  gradient: string
}

const TEMPLATES: CardTemplate[] = [
  { id: "match", name: "Maç Kartı", description: "Gelecek maç için duyuru kartı", icon: Calendar, gradient: "from-bursa-green to-bursa-green-dark" },
  { id: "lineup", name: "İlk 11 Kartı", description: "Kadro ve formasyon paylaşımı", icon: Users, gradient: "from-blue-600 to-blue-800" },
  { id: "result", name: "Sonuç Kartı", description: "Maç sonrası skor kartı", icon: Trophy, gradient: "from-green-600 to-green-800" },
  { id: "prediction", name: "Tahmin Kartı", description: "Skor tahmin paylaşımı", icon: Target, gradient: "from-purple-600 to-purple-800" },
  { id: "player", name: "Oyuncu Kartı", description: "Oyuncu istatistik kartı", icon: Sparkles, gradient: "from-orange-600 to-orange-800" },
  { id: "stats", name: "İstatistik Kartı", description: "Takım/oyuncu karşılaştırma", icon: Shield, gradient: "from-red-600 to-red-800" },
]

const nextMatch = getNextMatch()

export default function CardGeneratorPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<CardType>("match")
  const [canvasRef, setCanvasRef] = useState<HTMLDivElement | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [customText, setCustomText] = useState("")
  const [showLogo, setShowLogo] = useState(true)
  const [showWatermark, setShowWatermark] = useState(true)
  const [backgroundType, setBackgroundType] = useState<"gradient" | "image" | "solid">("gradient")
  const [selectedPlayer, setSelectedPlayer] = useState(BURSASPOR_PLAYERS[0])

  const template = TEMPLATES.find((t) => t.id === selectedTemplate)!

  const renderCard = async () => {
    if (!canvasRef) return
    setIsGenerating(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    setIsGenerating(false)
  }

  useEffect(() => {
    renderCard()
  }, [selectedTemplate, customText, showLogo, showWatermark, backgroundType, selectedPlayer])

  return (
    <div className="min-h-screen py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-bursa-green flex items-center justify-center">
              <Image className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Kart Oluşturucu</h1>
              <p className="text-gray-600 dark:text-gray-400">Sosyal medya için profesyonel Bursaspor kartları tasarlayın ve paylaşın</p>
            </div>
          </div>

          {/* Template Selector */}
          <Card className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-3">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplate(t.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border",
                      selectedTemplate === t.id
                        ? "bg-white dark:bg-gray-800 text-bursa-green border-bursa-green shadow-lg"
                        : "text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-bursa-green"
                    )}
                  >
                    <t.icon className="w-4 h-4" />
                    {t.name}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-8">
          {/* Preview */}
          <div className="space-y-6">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="w-5 h-5" />
                  Önizleme
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div ref={setCanvasRef} className="relative">
                  <CardPreview
                    template={selectedTemplate}
                    customText={customText}
                    showLogo={showLogo}
                    showWatermark={showWatermark}
                    backgroundType={backgroundType}
                    selectedPlayer={selectedPlayer}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="bg-gradient-to-r from-bursa-green to-bursa-green-dark text-white">
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-3">
                  <Button variant="secondary" className="bg-white/20 border-white/30 hover:bg-white/30 text-white flex-1" onClick={renderCard} disabled={isGenerating}>
                    {isGenerating ? (
                      <>
                        <svg className="w-4 h-4 mr-2 animate-spin" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Oluşturuluyor...
                      </>
                    ) : (
                      <>
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Yeniden Oluştur
                      </>
                    )}
                  </Button>
                  <Button variant="secondary" className="bg-white/20 border-white/30 hover:bg-white/30 text-white flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Resim İndir (PNG)
                  </Button>
                  <Button variant="ghost" className="text-white hover:bg-white/10 border-white/30 flex-1">
                    <Share2 className="w-4 h-4 mr-2" />
                    Paylaş
                  </Button>
                </div>
                <p className="text-white/70 text-sm mt-3 text-center">
                  Kartınız hazır! Sosyal medyada #Bursaspor #YeşilBeyaz etiketleriyle paylaşın.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Görünüm Ayarları
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="label-field">Arka Plan Türü</label>
                  <div className="flex gap-2">
                    {[
                      { id: "gradient", label: "Degrade", icon: Palette },
                      { id: "solid", label: "Düz Renk", icon: Minus },
                    ].map((bg) => (
                      <button
                        key={bg.id}
                        onClick={() => setBackgroundType(bg.id as typeof backgroundType)}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all",
                          backgroundType === bg.id
                            ? "bg-bursa-green text-white border-bursa-green"
                            : "text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-bursa-green"
                        )}
                      >
                        <bg.icon className="w-4 h-4" />
                        {bg.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label-field flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showLogo}
                      onChange={(e) => setShowLogo(e.target.checked)}
                      className="w-4 h-4 text-bursa-green border-gray-300 rounded focus:ring-bursa-green"
                    />
                    Takım Logosu Göster
                  </label>
                </div>

                <div>
                  <label className="label-field flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showWatermark}
                      onChange={(e) => setShowWatermark(e.target.checked)}
                      className="w-4 h-4 text-bursa-green border-gray-300 rounded focus:ring-bursa-green"
                    />
                    Filigran (Site Adresi) Göster
                  </label>
                </div>

                {selectedTemplate === "match" && nextMatch && (
                  <div className="p-3 bg-bursa-green-50 dark:bg-bursa-green-900/20 rounded-lg border border-bursa-green-200 dark:border-bursa-green-800">
                    <p className="font-medium text-bursa-green dark:text-bursa-green-light mb-1">Bu Haftaki Maç</p>
                    <p className="text-sm">{nextMatch.homeTeam.shortName} vs {nextMatch.awayTeam.shortName}</p>
                    <p className="text-xs text-gray-500">{formatDate(nextMatch.date)} · {formatTime(nextMatch.time)}</p>
                  </div>
                )}

                {selectedTemplate === "player" && (
                  <div>
                    <label className="label-field">Oyuncu Seç</label>
                    <select
                      value={selectedPlayer.id}
                      onChange={(e) => setSelectedPlayer(BURSASPOR_PLAYERS.find((p) => p.id === e.target.value)!)}
                      className="input-field"
                    >
                      {BURSASPOR_PLAYERS.slice(0, 11).map((p) => (
                        <option key={p.id} value={p.id}>
                          #{p.number} {p.name} ({p.position})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedTemplate === "lineup" && (
                  <div>
                    <label className="label-field">Formasyon</label>
                    <select
                      value={FORMATIONS[0].id}
                      onChange={(e) => {}}
                      className="input-field"
                    >
                      {FORMATIONS.map((f) => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {["prediction", "result"].includes(selectedTemplate) && (
                  <div>
                    <label className="label-field">Özel Mesaj / Tahmin</label>
                    <textarea
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      placeholder={selectedTemplate === "prediction" ? "Örn: Bu hafta 3-1 galibiyet!" : "Örn: Harika bir galibiyet!"}
                      className="input-field min-h-[80px] resize-y"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="border-bursa-green/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-bursa-green" />
                  İpuçları
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-bursa-green mt-0.5 flex-shrink-0" /> Maç kartları için önceden maç seçin</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-bursa-green mt-0.5 flex-shrink-0" /> İlk 11 kartında formasyon seçebilirsiniz</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-bursa-green mt-0.5 flex-shrink-0" /> Oyuncu kartında istatistikler otomatik eklenir</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-bursa-green mt-0.5 flex-shrink-0" /> PNG formatında yüksek kalitede indirin</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-bursa-green mt-0.5 flex-shrink-0" /> Instagram Story boyutunda (1080x1920) uygun</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function CardPreview({
  template,
  customText,
  showLogo,
  showWatermark,
  backgroundType,
  selectedPlayer,
}: {
  template: "match" | "lineup" | "result" | "prediction" | "player" | "stats"
  customText: string
  showLogo: boolean
  showWatermark: boolean
  backgroundType: "gradient" | "image" | "solid"
  selectedPlayer: typeof BURSASPOR_PLAYERS[0]
}) {
  const gradients = {
    match: "from-bursa-green via-bursa-green-dark to-black",
    lineup: "from-blue-600 via-blue-800 to-black",
    result: "from-green-600 via-green-800 to-black",
    prediction: "from-purple-600 via-purple-800 to-black",
    player: "from-orange-600 via-orange-800 to-black",
    stats: "from-red-600 via-red-800 to-black",
  }

  const bgClass = backgroundType === "gradient" 
    ? `bg-gradient-to-br ${gradients[template]}` 
    : backgroundType === "solid" 
    ? "bg-bursa-green" 
    : "bg-gradient-to-br from-bursa-green via-bursa-green-dark to-black"

  return (
    <div className={`relative ${bgClass} text-white min-h-[500px] aspect-[1080/1920] max-w-md mx-auto`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/patterns/noise.png')] opacity-5" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative p-8 h-full flex flex-col justify-between">
        {/* Top - Logo & Badge */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {showLogo && (
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                <span className="text-2xl font-bold">B</span>
              </div>
            )}
            <div>
              <p className="text-xs text-white/70 uppercase tracking-wider">Bursaspor Taraftar Merkezi</p>
              <p className="text-sm font-medium">{TEMPLATES.find((t) => t.id === template)?.name}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/60">Resmî olmayan taraftar sitesi</p>
            <p className="text-xs text-white/50">bursaspor-taraftar.com</p>
          </div>
        </div>

        {/* Middle - Template Specific Content */}
        <div className="flex-1 flex items-center justify-center px-4">
          {template === "match" && <MatchCardContent />}
          {template === "lineup" && <LineupCardContent />}
          {template === "result" && <ResultCardContent />}
          {template === "prediction" && <PredictionCardContent customText={customText} />}
          {template === "player" && <PlayerCardContent player={selectedPlayer} />}
          {template === "stats" && <StatsCardContent />}
        </div>

        {/* Bottom - Watermark & Social */}
        <div className="flex items-center justify-between pt-4 border-t border-white/20">
          {showWatermark && (
            <div className="flex items-center gap-2 text-white/60 text-xs">
              <span>Oluşturan: Bursaspor Taraftar Merkezi</span>
            </div>
          )}
          <div className="flex items-center gap-4 text-white/70 text-xs">
            <span>#Bursaspor</span>
            <span>#YeşilBeyaz</span>
            <span>#Timsahlar</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function MatchCardContent() {
  const match = getNextMatch()
  if (!match) return <div className="text-center text-white/70">Henüz maç planlanmamış</div>

  return (
    <div className="text-center w-full">
      <div className="flex items-center justify-center gap-4 mb-4">
        <img src={match.homeTeam.logo} alt="" className="w-20 h-20 object-contain filter drop-shadow-lg" />
        <div className="text-4xl font-bold text-white/90">VS</div>
        <img src={match.awayTeam.logo} alt="" className="w-20 h-20 object-contain filter drop-shadow-lg" />
      </div>
      <div className="space-y-2">
        <p className="text-lg font-medium">{match.competition} · {match.matchday}. Hafta</p>
        <div className="flex items-center justify-center gap-6 text-white/80">
          <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {formatDate(match.date)}</span>
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {formatTime(match.time)}</span>
        </div>
        <p className="text-sm text-white/60">{match.stadium}</p>
      </div>
    </div>
  )
}

function LineupCardContent() {
  return (
    <div className="text-center w-full space-y-4">
      <p className="text-xl font-bold">İLK 11 KADROSU</p>
      <p className="text-white/70">4-4-2 Formasyonu</p>
      <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto">
        {["GK", "CB", "CB", "LB", "RM", "CM", "CM", "LM", "ST", "ST"].map((pos, i) => (
          <div key={i} className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold border border-white/20">
            {pos}
          </div>
        ))}
      </div>
      <p className="text-xs text-white/50">Oyuncu isimleri İlk 11 sayfasından eklenir</p>
    </div>
  )
}

function ResultCardContent() {
  return (
    <div className="text-center w-full space-y-4">
      <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center border border-green-500">
        <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <p className="text-2xl font-bold">MAÇ SONUCU</p>
      <div className="flex items-center justify-center gap-4">
        <img src="/logos/bursaspor.svg" alt="" className="w-16 h-16 object-contain" />
        <div className="text-4xl font-bold tabular-nums">3 - 1</div>
        <img src="/logos/galatasaray.svg" alt="" className="w-16 h-16 object-contain" />
      </div>
      <p className="text-white/70">Süper Lig · 15. Hafta · Bursa</p>
    </div>
  )
}

function PredictionCardContent({ customText }: { customText: string }) {
  return (
    <div className="text-center w-full space-y-4">
      <div className="w-16 h-16 mx-auto rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500">
        <Target className="w-8 h-8 text-purple-400" />
      </div>
      <p className="text-2xl font-bold">SKOR TAHMİNİ</p>
      <div className="flex items-center justify-center gap-4">
        <img src="/logos/bursaspor.svg" alt="" className="w-16 h-16 object-contain" />
        <div className="text-4xl font-bold tabular-nums">2 - 1</div>
        <img src="/logos/fenerbahce.svg" alt="" className="w-16 h-16 object-contain" />
      </div>
      {customText && <p className="text-white/80 italic px-4">"{customText}"</p>}
      <p className="text-white/60 text-sm">Tahmin tarihi: {formatDate(new Date())}</p>
    </div>
  )
}

function PlayerCardContent({ player }: { player: typeof BURSASPOR_PLAYERS[0] }) {
  return (
    <div className="text-center w-full space-y-4">
      <div className="w-24 h-24 mx-auto rounded-full bg-white/10 flex items-center justify-center border-2 border-white/30">
        <span className="text-3xl font-bold">{player.number}</span>
      </div>
      <h2 className="text-2xl font-bold">{player.name}</h2>
      <p className="text-white/70">{player.position} · {player.age} yaş</p>
      <div className="flex items-center justify-center gap-6 text-sm">
        <div className="text-center">
          <p className="font-bold text-xl">{player.stats?.goals || 0}</p>
          <p className="text-white/60">Gol</p>
        </div>
        <div className="text-center">
          <p className="font-bold text-xl">{player.stats?.assists || 0}</p>
          <p className="text-white/60">Asist</p>
        </div>
        <div className="text-center">
          <p className="font-bold text-xl">{player.stats?.rating || "—"}</p>
          <p className="text-white/60">Rating</p>
        </div>
      </div>
      <p className="text-white/50 text-xs">Bursaspor Taraftar Merkezi · İstatistikler</p>
    </div>
  )
}

function StatsCardContent() {
  return (
    <div className="text-center w-full space-y-4">
      <div className="w-16 h-16 mx-auto rounded-full bg-red-500/20 flex items-center justify-center border border-red-500">
        <Shield className="w-8 h-8 text-red-400" />
      </div>
      <p className="text-2xl font-bold">TAKIM İSTATİSTİKLERİ</p>
      <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
        <StatItem label="Puan" value="27" />
        <StatItem label="Gol Farkı" value="+12" />
        <StatItem label="Sıralama" value="3." />
      </div>
      <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
        <StatItem label="Galibiyet" value="8" color="green" />
        <StatItem label="Beraberlik" value="3" color="yellow" />
        <StatItem label="Mağlubiyet" value="3" color="red" />
      </div>
    </div>
  )
}

function StatItem({ label, value, color = "white" }: { label: string; value: string; color?: string }) {
  const colors = {
    white: "text-white",
    green: "text-green-400",
    yellow: "text-yellow-400",
    red: "text-red-400",
  }
  return (
    <div className="text-center p-3 bg-white/10 rounded-xl">
      <p className="text-2xl font-bold" style={{ color: colors[color as keyof typeof colors] }}>{value}</p>
      <p className="text-xs text-white/60">{label}</p>
    </div>
  )
}