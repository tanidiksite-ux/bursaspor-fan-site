"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { MOCK_MATCHES, getNextMatch, BURSASPOR } from "@/lib/data"
import { cn, formatDate, formatTime } from "@/lib/utils"
import {
  Target,
  Trophy,
  Users,
  Clock,
  Calendar,
  Award,
  TrendingUp,
  Crown,
  Medal,
  Star,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react"
import { useToast } from "@/hooks/useToast"

type Prediction = {
  matchId: string
  homeScore: number
  awayScore: number
  points: number
  exactMatch: boolean
  correctOutcome: boolean
}

const MOCK_PREDICTIONS: Record<string, Prediction> = {
  "m2": { matchId: "m2", homeScore: 2, awayScore: 1, points: 3, exactMatch: true, correctOutcome: true },
  "m3": { matchId: "m3", homeScore: 3, awayScore: 0, points: 3, exactMatch: true, correctOutcome: true },
  "m4": { matchId: "m4", homeScore: 1, awayScore: 1, points: 1, exactMatch: false, correctOutcome: true },
  "m5": { matchId: "m5", homeScore: 2, awayScore: 1, points: 1, exactMatch: false, correctOutcome: true },
  "m6": { matchId: "m6", homeScore: 0, awayScore: 2, points: 0, exactMatch: false, correctOutcome: false },
}

const MOCK_LEADERBOARD = [
  { rank: 1, name: "YeşilBeyaz1963", points: 47, correctScores: 8, correctOutcomes: 12, predictions: 14, avatar: "YB" },
  { rank: 2, name: "TimsahKartali", points: 42, correctScores: 6, correctOutcomes: 11, predictions: 14, avatar: "TK" },
  { rank: 3, name: "BursaAslanı", points: 39, correctScores: 7, correctOutcomes: 9, predictions: 13, avatar: "BA" },
  { rank: 4, name: "YeşilGözyaşı", points: 35, correctScores: 5, correctOutcomes: 10, predictions: 14, avatar: "YG" },
  { rank: 5, name: "Bursasporlu42", points: 31, correctScores: 4, correctOutcomes: 9, predictions: 12, avatar: "B4" },
  { rank: 6, name: "StadyumTaraftari", points: 28, correctScores: 3, correctOutcomes: 8, predictions: 14, avatar: "ST" },
  { rank: 7, name: "AnadoluKaplanı", points: 25, correctScores: 2, correctOutcomes: 7, predictions: 11, avatar: "AK" },
  { rank: 8, name: "YeşilBeyazKalp", points: 22, correctScores: 3, correctOutcomes: 6, predictions: 13, avatar: "YK" },
  { rank: 9, name: "BursaRuhu", points: 19, correctScores: 1, correctOutcomes: 6, predictions: 10, avatar: "BR" },
  { rank: 10, name: "Taraftar1963", points: 15, correctScores: 2, correctOutcomes: 4, predictions: 9, avatar: "T6" },
]

export default function MatchDayPredictionPage() {
  const [currentMatch, setCurrentMatch] = useState(() => getNextMatch())
  const [homeScore, setHomeScore] = useState(0)
  const [awayScore, setAwayScore] = useState(0)
  const [predictions, setPredictions] = useState<Record<string, Prediction>>(MOCK_PREDICTIONS)
  const [submittedMatchIds, setSubmittedMatchIds] = useState<string[]>(Object.keys(MOCK_PREDICTIONS))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<"tahmin" | "liderlik" | "gecmis">("tahmin")
  const { toast } = useToast()

  const totalPoints = Object.values(predictions).reduce((sum, p) => sum + p.points, 0)
  const correctScores = Object.values(predictions).filter((p) => p.exactMatch).length
  const correctOutcomes = Object.values(predictions).filter((p) => p.correctOutcome).length
  const userRank = calculateUserRank(totalPoints)

  const handleSubmit = async () => {
    if (!currentMatch) return
    if (submittedMatchIds.includes(currentMatch.id)) {
      toast("Bu maç için zaten tahmin yapmışsınız!", "error")
      return
    }

    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const match = currentMatch
    const isBursaHome = match.homeTeam.id === "bursaspor"
    const bursaScore = isBursaHome ? homeScore : awayScore
    const opponentScore = isBursaHome ? awayScore : homeScore

    let points = 0
    let exactMatch = false
    let correctOutcome = false

    if (match.homeScore !== null && match.awayScore !== null) {
      const actualHome = match.homeScore
      const actualAway = match.awayScore

      if (homeScore === actualHome && awayScore === actualAway) {
        points = 3
        exactMatch = true
        correctOutcome = true
      } else {
        const predictedOutcome = Math.sign(homeScore - awayScore)
        const actualOutcome = Math.sign(actualHome - actualAway)
        if (predictedOutcome === actualOutcome) {
          points = 1
          correctOutcome = true
        }
      }
    }

    const newPrediction: Prediction = {
      matchId: match.id,
      homeScore,
      awayScore,
      points,
      exactMatch,
      correctOutcome,
    }

    setPredictions((prev) => ({ ...prev, [match.id]: newPrediction }))
    setSubmittedMatchIds((prev) => [...prev, match.id])
    setIsSubmitting(false)

    if (match.homeScore !== null) {
      if (exactMatch) {
        toast("🎉 Tam isabet! 3 puan kazandınız!", "success")
      } else if (correctOutcome) {
        toast("✅ Sonuç doğru! 1 puan kazandınız.", "success")
      } else {
        toast("❌ Maalesef tahmininiz tutmadı.", "error")
      }
    } else {
      toast("✅ Tahmininiz kaydedildi! Maç bittikten sonra puan hesaplanacak.", "success")
    }
  }

  const incrementScore = (type: "home" | "away") => {
    if (type === "home") setHomeScore((s) => Math.min(s + 1, 10))
    else setAwayScore((s) => Math.min(s + 1, 10))
  }

  const decrementScore = (type: "home" | "away") => {
    if (type === "home") setHomeScore((s) => Math.max(s - 1, 0))
    else setAwayScore((s) => Math.max(s - 1, 0))
  }

  if (!currentMatch) {
    return (
      <div className="min-h-screen py-8">
        <div className="container-custom text-center py-16">
          <Calendar className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Planlanmış Maç Yok</h2>
          <p className="text-gray-500 dark:text-gray-400">Şu an için tahmin yapılabilecek yaklaşan maç bulunmuyor.</p>
        </div>
      </div>
    )
  }

  const isMatchFinished = currentMatch.homeScore !== null && currentMatch.awayScore !== null
  const alreadySubmitted = submittedMatchIds.includes(currentMatch.id)
  const userPrediction = predictions[currentMatch.id]

  return (
    <div className="min-h-screen py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-bursa-green flex items-center justify-center">
              <Target className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Maç Günü Skor Tahmini</h1>
              <p className="text-gray-600 dark:text-gray-400">Her hafta skor tahmin edin, puan kazanın, liderlik tablosunda yükselin!</p>
            </div>
          </div>

          {/* User Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard title="Toplam Puan" value={totalPoints} icon={Trophy} color="text-yellow-500" bg="bg-yellow-100 dark:bg-yellow-900/30" rank={userRank} />
            <StatCard title="Tam İsabet" value={correctScores} icon={CheckCircle} color="text-green-500" bg="bg-green-100 dark:bg-green-900/30" />
            <StatCard title="Doğru Sonuç" value={correctOutcomes} icon={ArrowUp} color="text-blue-500" bg="bg-blue-100 dark:bg-blue-900/30" />
            <StatCard title="Yanlış Tahmin" value={Object.values(predictions).filter((p) => !p.correctOutcome).length} icon={XCircle} color="text-red-500" bg="bg-red-100 dark:bg-red-900/30" />
            <StatCard title="Sıralama" value={`${userRank}.`} icon={Crown} color="text-purple-500" bg="bg-purple-100 dark:bg-purple-900/30" />
          </div>
        </div>

        {/* Tabs */}
        <Card className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 mb-6">
          <CardContent className="p-2">
            <div className="flex gap-1">
              {[
                { id: "tahmin", label: "Tahmin Yap", icon: Target },
                { id: "liderlik", label: "Liderlik Tablosu", icon: Trophy },
                { id: "gecmis", label: "Geçmiş Tahminler", icon: Clock },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    activeTab === tab.id
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

        {/* Current Match Prediction */}
        {activeTab === "tahmin" && (
          <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
            <Card className="overflow-hidden">
              <CardHeader className="px-6 py-4 bg-gradient-to-r from-bursa-green to-bursa-green-dark text-white">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="info" size="sm">
                    {currentMatch.competition} · {currentMatch.matchday}. Hafta
                  </Badge>
                  <Badge variant={alreadySubmitted ? "success" : "warning"} size="sm">
                    {alreadySubmitted ? "Tahmin Yapıldı" : "Tahmin Bekliyor"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-center flex-1">
                    <img src={currentMatch.homeTeam.logo} alt={currentMatch.homeTeam.name} className="team-logo-lg mx-auto mb-2" />
                    <h2 className="text-xl font-bold">{currentMatch.homeTeam.name}</h2>
                  </div>
                  <div className="flex flex-col items-center gap-2 px-6">
                    <div className="flex items-center gap-3 bg-white/20 rounded-xl px-6 py-2">
                      <ScoreInput
                        value={homeScore}
                        onIncrement={() => incrementScore("home")}
                        onDecrement={() => decrementScore("home")}
                        disabled={alreadySubmitted || isMatchFinished || isSubmitting}
                      />
                      <span className="text-2xl font-bold">-</span>
                      <ScoreInput
                        value={awayScore}
                        onIncrement={() => incrementScore("away")}
                        onDecrement={() => decrementScore("away")}
                        disabled={alreadySubmitted || isMatchFinished || isSubmitting}
                      />
                    </div>
                    {alreadySubmitted && userPrediction && (
                      <div className="text-sm text-white/80">
                        Tahmininiz: <span className="font-bold">{userPrediction.homeScore} - {userPrediction.awayScore}</span>
                        {currentMatch.homeScore !== null && (
                          <span className="ml-2"> · Puan: <span className="font-bold">{userPrediction.points}</span></span>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-white/70 text-sm">
                      <Calendar className="w-4 h-4" /> {formatDate(currentMatch.date)}
                      <Clock className="w-4 h-4 ml-2" /> {formatTime(currentMatch.time)}
                    </div>
                  </div>
                  <div className="text-center flex-1">
                    <img src={currentMatch.awayTeam.logo} alt={currentMatch.awayTeam.name} className="team-logo-lg mx-auto mb-2" />
                    <h2 className="text-xl font-bold">{currentMatch.awayTeam.name}</h2>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                {!alreadySubmitted && !isMatchFinished ? (
                  <div className="text-center">
                    <Button
                      size="lg"
                      className="w-full lg:w-1/2"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Kaydediliyor...
                        </>
                      ) : (
                        <>
                          <Target className="w-5 h-5 mr-2" />
                          Tahmini Kaydet
                        </>
                      )}
                    </Button>
                    <p className="text-sm text-gray-500 mt-3">
                      Maç başladığında tahmin yapılamaz. Puanlama: Tam isabet 3 puan, doğru sonuç 1 puan.
                    </p>
                  </div>
                ) : alreadySubmitted && !isMatchFinished ? (
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold text-green-600 dark:text-green-400 mb-2">Tahmininiz Kaydedildi!</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Maç bittikten sonra puanlarınız hesaplanacak. Şimdilik liderlik tablosunu inceleyebilirsiniz.
                    </p>
                    <Button variant="secondary" className="mt-4" onClick={() => setActiveTab("liderlik")}>
                      <Trophy className="w-4 h-4 mr-2" />
                      Liderlik Tablosuna Git
                    </Button>
                  </div>
                ) : isMatchFinished && userPrediction ? (
                  <div className="text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                      userPrediction.exactMatch ? "bg-green-100 dark:bg-green-900/30" :
                      userPrediction.correctOutcome ? "bg-yellow-100 dark:bg-yellow-900/30" :
                      "bg-red-100 dark:bg-red-900/30"
                    }`}>
                      {userPrediction.exactMatch ? (
                        <CheckCircle className="w-8 h-8 text-green-500" />
                      ) : userPrediction.correctOutcome ? (
                        <ArrowUp className="w-8 h-8 text-yellow-500" />
                      ) : (
                        <XCircle className="w-8 h-8 text-red-500" />
                      )}
                    </div>
                    <h3 className="text-xl font-bold mb-2">
                      {userPrediction.exactMatch ? "🎉 TAM İSABET!" :
                      userPrediction.correctOutcome ? "✅ Doğru Sonuç" :
                      "❌ Tahmin Tutmadı"}
                    </h3>
                    <div className="flex items-center justify-center gap-4 mt-4">
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-2">
                        <p className="text-sm text-gray-500">Gerçek Skor</p>
                        <p className="font-bold text-xl">{currentMatch.homeScore} - {currentMatch.awayScore}</p>
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-2">
                        <p className="text-sm text-gray-500">Tahmininiz</p>
                        <p className="font-bold text-xl">{userPrediction.homeScore} - {userPrediction.awayScore}</p>
                      </div>
                    </div>
                    <div className="mt-4 p-4 bg-bursa-green-50 dark:bg-bursa-green-900/20 rounded-xl">
                      <p className="font-bold text-bursa-green">Kazandığınız Puan: {userPrediction.points}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    Bu maç için tahmin yapılamıyor.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sidebar - Quick Stats */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Puanlama Sistemi
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">Tam İsabet</p>
                        <p className="text-sm text-gray-500">Skora tam isabet</p>
                      </div>
                    </div>
                    <Badge variant="success">+3 Puan</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center text-white">
                        <ArrowUp className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">Doğru Sonuç</p>
                        <p className="text-sm text-gray-500">Galip/beraberlik/mağlup doğru</p>
                      </div>
                    </div>
                    <Badge variant="warning">+1 Puan</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center text-white">
                        <XCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">Yanlış Tahmin</p>
                        <p className="text-sm text-gray-500">Sonuç tamamen yanlış</p>
                      </div>
                    </div>
                    <Badge variant="danger">0 Puan</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-bursa-green to-bursa-green-dark text-white">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-2">Bu Hafta Kazanabileceğiniz Puan</h3>
                  <p className="text-white/80 mb-4 text-sm">
                    Maç sonucunu tam isabet ederseniz 3 puan, sadece sonucu bulursanız 1 puan kazanırsınız.
                  </p>
                  <Button variant="secondary" className="bg-white/20 border-white/30 hover:bg-white/30 text-white w-full" onClick={() => setActiveTab("liderlik")}>
                    <Trophy className="w-4 h-4 mr-2" />
                    Liderlik Tablosunu Gör
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        {activeTab === "liderlik" && (
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Liderlik Tablosu
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-16">Sıra</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kullanıcı</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-20">Puan</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24">Tam İsabet</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24">Doğru Sonuç</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-20">Tahmin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {MOCK_LEADERBOARD.map((entry, index) => (
                      <tr
                        key={entry.name}
                        className={cn(
                          "hover:bg-gray-50 dark:hover:bg-gray-800",
                          entry.rank <= 3 && "bg-yellow-50/50 dark:bg-yellow-900/10"
                        )}
                      >
                        <td className="px-4 py-3">
                          {entry.rank <= 3 ? (
                            <span className={cn(
                              "font-bold text-lg",
                              entry.rank === 1 && "text-yellow-500",
                              entry.rank === 2 && "text-gray-400",
                              entry.rank === 3 && "text-amber-700"
                            )}>
                              {entry.rank === 1 && <Crown className="w-5 h-5 inline" />}
                              {entry.rank === 2 && <Medal className="w-5 h-5 inline" />}
                              {entry.rank === 3 && <Award className="w-5 h-5 inline" />}
                            </span>
                          ) : (
                            <span className="font-medium text-gray-900 dark:text-white">{entry.rank}.</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-bursa-green-100 dark:bg-bursa-green-900/30 flex items-center justify-center text-bursa-green font-bold text-sm">
                              {entry.avatar}
                            </div>
                            <span className="font-medium">{entry.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-lg text-gray-900 dark:text-white">{entry.points}</td>
                        <td className="px-4 py-3 text-center text-green-600 dark:text-green-400 font-medium">{entry.correctScores}</td>
                        <td className="px-4 py-3 text-center text-blue-600 dark:text-blue-400 font-medium">{entry.correctOutcomes}</td>
                        <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">{entry.predictions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* History */}
        {activeTab === "gecmis" && (
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Geçmiş Tahminleriniz
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Maç</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tahmin</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Gerçek</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sonuç</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Puan</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tarih</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {Object.entries(predictions).map(([matchId, pred]) => {
                      const match = MOCK_MATCHES.find((m) => m.id === matchId)
                      if (!match) return null
                      return (
                        <tr key={matchId} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img src={match.homeTeam.logo} alt="" className="w-8 h-8 object-contain" />
                              <div>
                                <p className="font-medium text-sm">{match.homeTeam.shortName} vs {match.awayTeam.shortName}</p>
                                <p className="text-xs text-gray-500">{formatDate(match.date)} · {match.competition}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-lg">{pred.homeScore} - {pred.awayScore}</td>
                          <td className="px-4 py-3 text-center font-bold text-lg">
                            {match.homeScore !== null ? `${match.homeScore} - ${match.awayScore}` : <span className="text-gray-400">Henüz oynanmadı</span>}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {match.homeScore !== null ? (
                              pred.exactMatch ? (
                                <Badge variant="success">Tam İsabet</Badge>
                              ) : pred.correctOutcome ? (
                                <Badge variant="warning">Doğru Sonuç</Badge>
                              ) : (
                                <Badge variant="danger">Yanlış</Badge>
                              )
                            ) : (
                              <Badge variant="info">Bekliyor</Badge>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-lg">
                            {match.homeScore !== null ? (
                              <span className={cn(pred.points > 0 ? "text-green-600" : "text-red-600")}>+{pred.points}</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-gray-500">{formatDate(match.date)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              {Object.keys(predictions).length === 0 && (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Henüz tahmin yapmadınız.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: number | string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bg: string
  rank?: number
}

function StatCard({ title, value, icon: Icon, color, bg, rank }: StatCardProps) {
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
        {rank && rank <= 10 && (
          <div className="mt-2 text-xs text-bursa-green font-medium">
            Siz: {rank}. sıradasınız {rank <= 3 && "🏆"}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function calculateUserRank(points: number): number {
  const userPoints = points
  const sorted = [...MOCK_LEADERBOARD].sort((a, b) => b.points - a.points)
  const rank = sorted.findIndex((e) => e.points <= userPoints)
  return rank === -1 ? sorted.length + 1 : rank + 1
}

interface ScoreInputProps {
  value: number
  onIncrement: () => void
  onDecrement: () => void
  disabled: boolean
}

function ScoreInput({ value, onIncrement, onDecrement, disabled }: ScoreInputProps) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={onDecrement}
        disabled={disabled || value <= 0}
        className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 text-white disabled:opacity-50 flex items-center justify-center transition-colors"
      >
        <Minus className="w-4 h-4" />
      </button>
      <span className="w-12 text-center text-2xl font-bold text-white tabular-nums">{value}</span>
      <button
        onClick={onIncrement}
        disabled={disabled || value >= 10}
        className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 text-white disabled:opacity-50 flex items-center justify-center transition-colors"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  )
}