import type { UnitClass } from '../unit-types'
import { t } from '../i18n'
import type { SkillId } from '../skills'
import type { Placement } from '../deploy'

/**
 * Online play: every message the game sends between browsers, and the room
 * rules' shared constants. Pure (no engine, no network).
 */

/** Raised when a message changes shape: peers on different versions refuse each other */
export const PROTOCOL_VERSION = 4
export const APP_ID = 'pixelfantasywar'
export const MAX_SPECTATORS = 8
export const ONLINE_TURN_SECONDS = 300
/** The turn timer turns red under this */
export const TURN_WARNING_SECONDS = 15
/** After the timer hits 0, the waiting side gives the active player this long to send `end-turn` */
export const TURN_GRACE_SECONDS = 15
/** A player who drops mid-match loses after this long away */
export const RECONNECT_SECONDS = 180
/** No connection after this long: show the failure and the Wi-Fi tip */
export const CONNECT_TIMEOUT_SECONDS = 20
export const NAME_MAX_LENGTH = 16
export const EMOTE_COOLDOWN_MS = 3000

/** Keys 1-9 send the first nine (keep the order: players learn the numbers) */
export const EMOTES = [
  'Nice!', 'Oops', 'Good luck', 'GG', 'Hmm...', 'Hurry up!',
  'Too easy', 'Is that all?', 'Watch your back',
  'Big brain', 'Lucky!', 'Noooo!',
  'Run!', 'Bring it on', 'I meant that',
  'Hahaha', 'Wow', 'Oh no',
  'Hello?', 'Calculated', 'Sorry not sorry',
  'EZ', 'Skill issue', 'Cry about it',
  'Uninstall', 'Get rekt', 'Too slow',
  'Free kill', 'Was that a plan?', 'Rage quit?',
  'Nerf this!', 'Grandma plays better', 'Read the rules',
] as const
export type Emote = typeof EMOTES[number]

/** Emoji shown after each emote (display only: the message still carries the plain text) */
const EMOTE_EMOJI: Record<Emote, string> = {
  'Nice!': '👍',
  'Oops': '😅',
  'Good luck': '🍀',
  'GG': '🤝',
  'Hmm...': '🤔',
  'Hurry up!': '⏳',
  'Too easy': '😎',
  'Is that all?': '🥱',
  'Watch your back': '🗡️',
  'Big brain': '🧠',
  'Lucky!': '🎲',
  'Noooo!': '😭',
  'Run!': '🏃',
  'Bring it on': '💪',
  'I meant that': '🙃',
  'Hahaha': '🤣',
  'Wow': '😮',
  'Oh no': '😱',
  'Hello?': '👋',
  'Calculated': '🧮',
  'Sorry not sorry': '😇',
  'EZ': '😏',
  'Skill issue': '🤡',
  'Cry about it': '😢',
  'Uninstall': '🗑️',
  'Get rekt': '💀',
  'Too slow': '🐢',
  'Free kill': '🎁',
  'Was that a plan?': '🤨',
  'Rage quit?': '😡',
  'Nerf this!': '🔨',
  'Grandma plays better': '👵',
  'Read the rules': '📖',
}

/** Text shown for an emote: the text plus its emoji */
export function emoteLabel(emote: string): string {
  const emoji = EMOTE_EMOJI[emote as Emote]
  const label = t().emotes[emote] ?? emote
  return emoji ? `${label} ${emoji}` : label
}

/** 0 = Blue (plays first), 1 = Red */
export type Seat = 0 | 1
export type JoinIntent = 'play' | 'watch'
/** Board cell: [x, y] */
export type Pos = [number, number]

export interface Member {
  peerId: string
  name: string
  /** Random id kept in sessionStorage: gives the seat back after a reload */
  token: string
  connected: boolean
}

export interface SeatState extends Member {
  ready: boolean
  /** The class of each spawn slot; hidden from everybody else until the match starts */
  army: UnitClass[] | null
  /** Cell of each slot (deploy zone); hidden like the army */
  placement: Placement | null
  wantsRematch: boolean
}

export type RoomPhase = 'lobby' | 'match' | 'over'

export interface RoomState {
  code: string
  ownerToken: string
  /** Locked rooms are not listed: only who has the code gets in */
  locked: boolean
  mapId: string
  /** [Blue, Red] */
  seats: [SeatState | null, SeatState | null]
  spectators: Member[]
  phase: RoomPhase
  /** Matches played in this room (colors swap on every rematch) */
  matchNo: number
  /** Tokens removed by the owner: they can't come back */
  kicked: string[]
}

export type RejectReason = 'full' | 'version' | 'kicked' | 'closed'

/** One thing a player did on the board, sent once it is confirmed */
export type GameAction =
  | { a: 'move', unit: Pos, path: Pos[], skill?: SkillId }
  /** `rolls`: the dice ([d20, d6]) of the strike and, if any, of the counterattack */
  | { a: 'attack', unit: Pos, target: Pos, rolls: [number, number][], skill?: SkillId }
  | { a: 'self-skill', unit: Pos, skill: SkillId }
  | { a: 'heal', unit: Pos, target: Pos }
  | { a: 'undo', unit: Pos }
  | { a: 'pass', unit: Pos }
  | { a: 'end-turn', reason: 'button' | 'timeout' }

export type NetMessage =
  | { t: 'hello', version: number, name: string, token: string, intent: JoinIntent }
  | { t: 'room', room: RoomState }
  | { t: 'reject', reason: RejectReason }
  | { t: 'ready', ready: boolean, army: UnitClass[] | null, placement: Placement | null }
  | { t: 'set-map', mapId: string }
  | { t: 'set-locked', locked: boolean }
  | { t: 'kick', token: string }
  /** `index`: position in the match history (0, 1, 2...) */
  | { t: 'action', matchNo: number, index: number, action: GameAction }
  | { t: 'history-request', matchNo: number }
  | { t: 'history', matchNo: number, actions: GameAction[] }
  /** Board summary after `index` actions, sent by the player who ended the turn */
  | { t: 'turn-hash', matchNo: number, index: number, hash: string }
  | { t: 'emote', emote: Emote }
  | { t: 'rematch' }
  /** The sender left for good (lobby: frees the seat; match: forfeits) */
  | { t: 'leave' }
  /** The owner closed the room */
  | { t: 'close' }

/** What an open room announces in the public room list */
export interface RoomListing {
  code: string
  owner: string
  mapId: string
  phase: RoomPhase
  /** A seat is free: Play is offered */
  seatOpen: boolean
  spectators: number
  round: number
}

export type DirectoryMessage = { t: 'listing', version: number, listing: RoomListing } | { t: 'unlist', code: string }

// --- codes, tokens and names ---

/** No 0/O, 1/I/L: easy to read aloud and type */
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
export const CODE_LENGTH = 5

function randomString(alphabet: string, length: number): string {
  const values = new Uint32Array(length)
  crypto.getRandomValues(values)
  return Array.from(values, v => alphabet[v % alphabet.length]).join('')
}

export function newRoomCode(): string {
  return randomString(CODE_ALPHABET, CODE_LENGTH)
}

export function newToken(): string {
  return randomString('abcdefghijklmnopqrstuvwxyz0123456789', 16)
}

/** What the player typed as a code, or null if it can't be one */
export function normalizeRoomCode(text: string): string | null {
  const code = text.trim().toUpperCase().replace(/[\s-]/g, '')
  if (code.length !== CODE_LENGTH) return null
  return [...code].every(c => CODE_ALPHABET.includes(c)) ? code : null
}

/** Trimmed, single spaces, at most NAME_MAX_LENGTH characters; empty = invalid */
export function cleanName(text: string): string {
  return text.replace(/\s+/g, ' ').trim().slice(0, NAME_MAX_LENGTH).trim()
}
