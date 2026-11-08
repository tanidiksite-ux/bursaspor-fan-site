import { Match, Team, Standing, Player, NewsArticle, Prediction, LeaderboardEntry } from "@/lib/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.api-football.com/v1"
const API_KEY = process.env.NEXT_PUBLIC_API_FOOTBALL_KEY

interface ApiFootballResponse<T> {
  get: string
  parameters: Record<string, string>
  errors: string[]
  results: number
  paging: { current: number; total: number }
  response: T[]
}

interface ApiFootballMatch {
  fixture: {
    id: number
    date: string
    timestamp: number
    status: { long: string; short: string; elapsed: number | null }
    venue: { name: string; city: string }
  }
  league: { id: number; name: string; round: string; season: number }
  teams: {
    home: { id: number; name: string; logo: string; winner: boolean | null }
    away: { id: number; name: string; logo: string; winner: boolean | null }
  }
  goals: { home: number | null; away: number | null }
  score: {
    halftime: { home: number | null; away: number | null }
    fulltime: { home: number | null; away: number | null }
    extratime: { home: number | null; away: number | null }
    penalty: { home: number | null; away: number | null }
  }
}

interface ApiFootballStandingItem {
  rank: number
  team: { id: number; name: string; logo: string }
  points: number
  goalsDiff: number
  group: string
  form: string
  status: string
  description: string
  all: {
    played: number
    win: number
    draw: number
    lose: number
    goals: { for: number; against: number }
  }
}

interface ApiFootballLeagueStandings {
  league: {
    id: number
    name: string
    country: string
    logo: string
    flag: string
    season: number
    standings: ApiFootballStandingItem[][]
  }
}

interface ApiFootballPlayer {
  player: { id: number; name: string; firstname: string; lastname: string; age: number; nationality: string; photo: string }
  statistics: Array<{
    team: { id: number; name: string; logo: string }
    league: { id: number; name: string; season: number }
    games: { appearences: number; minutes: number; rating: string | null }
    goals: { total: number | null; assists: number | null }
    cards: { yellow: number | null; red: number | null }
    passes: { total: number; key: number; accuracy: string | null }
    tackles: { total: number; blocks: number; interceptions: number }
  }>
}

async function fetchApiFootball<T>(endpoint: string, params: Record<string, string> = {}): Promise<ApiFootballResponse<T> | null> {
  if (!API_KEY) {
    console.warn("API-Football key not configured, using mock data")
    return null
  }

  try {
    const url = new URL(`${API_BASE_URL}${endpoint}`)
    Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value))

    const response = await fetch(url.toString(), {
      headers: {
        "X-RapidAPI-Key": API_KEY,
        "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com",
      },
      next: { revalidate: 300 },
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("API-Football fetch error:", error)
    return null
  }
}

export async function fetchMatches(teamId: number, season: number = 2024): Promise<Match[]> {
  const data = await fetchApiFootball<ApiFootballMatch>("/fixtures", {
    team: teamId.toString(),
    season: season.toString(),
    timezone: "Europe/Istanbul",
  })

  if (!data) return []

  return data.response.map(mapApiMatchToMatch)
}

export async function fetchStandings(leagueId: number = 203, season: number = 2024): Promise<Standing[]> {
  const data = await fetchApiFootball<ApiFootballLeagueStandings>("/standings", {
    league: leagueId.toString(),
    season: season.toString(),
  })

  if (!data) return []

  const standingsArray = data.response[0]?.league?.standings?.[0] || []
  return standingsArray.map(mapApiStandingToStanding)
}

export async function fetchPlayers(teamId: number, season: number = 2024): Promise<Player[]> {
  const data = await fetchApiFootball<ApiFootballPlayer>("/players", {
    team: teamId.toString(),
    season: season.toString(),
  })

  if (!data) return []

  return data.response.map(mapApiPlayerToPlayer)
}

function mapApiMatchToMatch(apiMatch: ApiFootballMatch): Match {
  const homeTeam = mapApiTeamToTeam(apiMatch.teams.home)
  const awayTeam = mapApiTeamToTeam(apiMatch.teams.away)

  return {
    id: `m-${apiMatch.fixture.id}`,
    homeTeam,
    awayTeam,
    homeScore: apiMatch.goals.home,
    awayScore: apiMatch.goals.away,
    date: new Date(apiMatch.fixture.date).toISOString().split("T")[0],
    time: new Date(apiMatch.fixture.date).toTimeString().slice(0, 5),
    stadium: apiMatch.fixture.venue.name,
    competition: apiMatch.league.name,
    matchday: parseInt(apiMatch.league.round.replace(/\D/g, "")) || 1,
    status: mapApiStatus(apiMatch.fixture.status.short),
  }
}

function mapApiTeamToTeam(apiTeam: ApiFootballMatch["teams"]["home"]): Team {
  const teamMap: Record<number, Team> = {
    1: { id: "galatasaray", name: "Galatasaray", shortName: "GAL", logo: "https://media.api-sports.io/football/teams/1.png", primaryColor: "#FFD700", secondaryColor: "#D40000" },
    2: { id: "fenerbahce", name: "Fenerbahçe", shortName: "FB", logo: "https://media.api-sports.io/football/teams/2.png", primaryColor: "#001F3F", secondaryColor: "#FFFF00" },
    3: { id: "besiktas", name: "Beşiktaş", shortName: "BJK", logo: "https://media.api-sports.io/football/teams/3.png", primaryColor: "#000000", secondaryColor: "#FFFFFF" },
    4: { id: "trabzonspor", name: "Trabzonspor", shortName: "TS", logo: "https://media.api-sports.io/football/teams/4.png", primaryColor: "#6B4226", secondaryColor: "#00A3E0" },
    5: { id: "bursaspor", name: "Bursaspor", shortName: "BUR", logo: "https://media.api-sports.io/football/teams/5.png", primaryColor: "#006633", secondaryColor: "#FFFFFF" },
  }

  return teamMap[apiTeam.id] || {
    id: `team-${apiTeam.id}`,
    name: apiTeam.name,
    shortName: apiTeam.name.slice(0, 3).toUpperCase(),
    logo: apiTeam.logo,
    primaryColor: "#006633",
    secondaryColor: "#FFFFFF",
  }
}

function mapApiStatus(short: string): "scheduled" | "live" | "finished" | "postponed" | "cancelled" {
  switch (short) {
    case "NS": case "TBD": return "scheduled"
    case "1H": case "HT": case "2H": case "ET": case "BT": case "P": case "LIVE": return "live"
    case "FT": case "AET": case "PEN": return "finished"
    case "POST": return "postponed"
    case "CANC": case "ABD": case "AWD": return "cancelled"
    default: return "scheduled"
  }
}

function mapApiStandingToStanding(apiStanding: ApiFootballStandingItem): Standing {
  const team = mapApiTeamToTeam({ id: apiStanding.team.id, name: apiStanding.team.name, logo: apiStanding.team.logo, winner: false })

  return {
    position: apiStanding.rank,
    team,
    played: apiStanding.all.played,
    won: apiStanding.all.win,
    drawn: apiStanding.all.draw,
    lost: apiStanding.all.lose,
    goalsFor: apiStanding.all.goals.for,
    goalsAgainst: apiStanding.all.goals.against,
    goalDifference: apiStanding.goalsDiff,
    points: apiStanding.points,
    form: apiStanding.form.split("").slice(-5).map((c) => (c === "W" ? "W" : c === "D" ? "D" : "L")) as ("W" | "D" | "L")[],
    lastUpdated: new Date().toISOString().split("T")[0],
  }
}

function mapApiPlayerToPlayer(apiPlayer: ApiFootballPlayer): Player {
  const stats = apiPlayer.statistics[0]
  if (!stats) {
    return {
      id: `p-${apiPlayer.player.id}`,
      name: `${apiPlayer.player.firstname} ${apiPlayer.player.lastname}`,
      position: "CM",
      number: 0,
      age: apiPlayer.player.age,
      nationality: apiPlayer.player.nationality,
      photo: apiPlayer.player.photo,
    }
  }

  return {
    id: `p-${apiPlayer.player.id}`,
    name: `${apiPlayer.player.firstname} ${apiPlayer.player.lastname}`,
    position: "CM",
    number: stats.games.appearences,
    age: apiPlayer.player.age,
    nationality: apiPlayer.player.nationality,
    photo: apiPlayer.player.photo,
    stats: {
      appearances: stats.games.appearences || 0,
      goals: stats.goals.total || 0,
      assists: stats.goals.assists || 0,
      yellowCards: stats.cards.yellow || 0,
      redCards: stats.cards.red || 0,
      minutesPlayed: stats.games.minutes || 0,
      passAccuracy: parseFloat(stats.passes.accuracy || "0"),
      tacklesPerGame: stats.tackles.total / Math.max(stats.games.appearences || 1, 1),
      interceptionsPerGame: stats.tackles.interceptions / Math.max(stats.games.appearences || 1, 1),
      clearances: 0,
      keyPasses: stats.passes.key || 0,
      fouls: 0,
      rating: parseFloat(stats.games.rating || "0"),
    },
  }
}

export async function scrapeMatchesFromTFF(): Promise<Match[]> {
  console.warn("Scraping not available in browser, use API or backend")
  return []
}

export async function scrapeStandingsFromTFF(): Promise<Standing[]> {
  console.warn("Scraping not available in browser, use API or backend")
  return []
}

const CACHE_DURATION = 5 * 60 * 1000

export async function getCachedData<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  if (typeof window === "undefined") {
    return fetcher()
  }

  const cached = localStorage.getItem(key)
  const timestamp = localStorage.getItem(`${key}_timestamp`)

  if (cached && timestamp && Date.now() - parseInt(timestamp) < CACHE_DURATION) {
    return JSON.parse(cached)
  }

  const data = await fetcher()
  localStorage.setItem(key, JSON.stringify(data))
  localStorage.setItem(`${key}_timestamp`, Date.now().toString())
  return data
}

export function getUserPredictions(): Record<string, Prediction> {
  if (typeof window === "undefined") return {}
  try {
    return JSON.parse(localStorage.getItem("bursaspor_predictions") || "{}")
  } catch {
    return {}
  }
}

export function saveUserPrediction(prediction: Prediction): void {
  if (typeof window === "undefined") return
  const predictions = getUserPredictions()
  predictions[prediction.matchId] = prediction
  localStorage.setItem("bursaspor_predictions", JSON.stringify(predictions))
}

export function getLeaderboard(): LeaderboardEntry[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem("bursaspor_leaderboard") || "[]")
  } catch {
    return []
  }
}

export function saveLeaderboardEntry(entry: LeaderboardEntry): void {
  if (typeof window === "undefined") return
  const leaderboard = getLeaderboard()
  const existingIndex = leaderboard.findIndex((e) => e.userId === entry.userId)
  if (existingIndex >= 0) {
    leaderboard[existingIndex] = entry
  } else {
    leaderboard.push(entry)
  }
  leaderboard.sort((a, b) => b.totalPoints - a.totalPoints)
  localStorage.setItem("bursaspor_leaderboard", JSON.stringify(leaderboard.slice(0, 100)))
}