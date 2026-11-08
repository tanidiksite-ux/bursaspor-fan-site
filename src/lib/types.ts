export interface Team {
  id: string
  name: string
  shortName: string
  logo: string
  primaryColor: string
  secondaryColor: string
}

export interface Player {
  id: string
  name: string
  position: Position
  number: number
  age: number
  nationality: string
  photo?: string
  stats?: PlayerStats
}

export type Position = "GK" | "CB" | "LB" | "RB" | "LWB" | "RWB" | "CDM" | "CM" | "CAM" | "LM" | "RM" | "LW" | "RW" | "CF" | "ST"

export interface PlayerStats {
  appearances: number
  goals: number
  assists: number
  yellowCards: number
  redCards: number
  minutesPlayed: number
  passAccuracy: number
  tacklesPerGame: number
  interceptionsPerGame: number
  clearances: number
  keyPasses: number
  fouls: number
  rating: number
}

export interface Match {
  id: string
  homeTeam: Team
  awayTeam: Team
  homeScore: number | null
  awayScore: number | null
  date: string
  time: string
  stadium: string
  competition: string
  matchday: number
  status: MatchStatus
  referee?: string
  attendance?: number
  events?: MatchEvent[]
  lineups?: Lineup
  stats?: MatchStats
}

export type MatchStatus = "scheduled" | "live" | "finished" | "postponed" | "cancelled"

export interface MatchEvent {
  id: string
  minute: number
  type: "goal" | "assist" | "yellow_card" | "red_card" | "substitution_in" | "substitution_out" | "penalty" | "own_goal" | "var"
  player: Player
  team: "home" | "away"
  description: string
}

export interface Lineup {
  home: FormationPlayer[]
  away: FormationPlayer[]
}

export interface FormationPlayer {
  player: Player
  position: { x: number; y: number }
  isCaptain: boolean
  isSubstitute: boolean
}

export interface MatchStats {
  home: TeamMatchStats
  away: TeamMatchStats
}

export interface TeamMatchStats {
  possession: number
  shots: number
  shotsOnTarget: number
  corners: number
  fouls: number
  offsides: number
  yellowCards: number
  redCards: number
  passes: number
  passAccuracy: number
  tackles: number
  interceptions: number
  clearances: number
  saves: number
  xG: number
}

export interface Standing {
  position: number
  team: Team
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  form: FormResult[]
  lastUpdated: string
}

export type FormResult = "W" | "D" | "L"

export interface Prediction {
  id: string
  matchId: string
  userId: string
  userName: string
  homeScore: number
  awayScore: number
  points: number
  createdAt: string
}

export interface UserPrediction extends Prediction {
  match: Match
}

export interface LeaderboardEntry {
  userId: string
  userName: string
  totalPoints: number
  correctScores: number
  correctOutcomes: number
  predictionsCount: number
}

export interface NewsArticle {
  id: string
  title: string
  excerpt: string
  content: string
  image: string
  author: string
  publishedAt: string
  category: string
  tags: string[]
  slug: string
}

export interface Formation {
  id: string
  name: string
  positions: FormationPosition[]
}

export interface FormationPosition {
  role: Position
  x: number
  y: number
}

export interface ShareCardData {
  type: "match" | "lineup" | "prediction" | "stats" | "result"
  title: string
  subtitle?: string
  backgroundImage?: string
  teamColors: { primary: string; secondary: string }
  data: Record<string, unknown>
}