import * as ex from 'excalibur'
import { AudioManager } from './audio-manager'
import adventureMetalVersionPath from './assets/music/adventure-metal-version.mp3'
import adventurousMetalPiratesPath from './assets/music/adventurous-metal-pirates.mp3'
import afterglowPath from './assets/music/afterglow.mp3'
import armyOfTheDeadPath from './assets/music/army-of-the-dead.mp3'
import ascendantPath from './assets/music/ascendant.mp3'
import battleOfHastingsPath from './assets/music/battle-of-hastings.mp3'
import boundByTheOathPath from './assets/music/bound-by-the-oath.mp3'
import culpritMassacrePath from './assets/music/culprit-massacre.mp3'
import curriculum404Path from './assets/music/curriculum-404.mp3'
import folklorePath from './assets/music/folklore.mp3'
import frozenHordePath from './assets/music/frozen-horde.mp3'
import helheimPath from './assets/music/helheim.mp3'
import theRiffPath from './assets/music/the-riff.mp3'
import twelveDaysOfChaosPath from './assets/music/twelve-days-of-chaos.mp3'
import voidToTheWorldPath from './assets/music/void-to-the-world.mp3'
import wreckTheHallsPath from './assets/music/wreck-the-halls.mp3'

/**
 * Match music: these tracks play one after the other in random order during a
 * match (the title music never changes, it lives in Resources). To add a
 * track: put the original .mp3 in music-src/, run yarn music (light 64 kbps
 * copy in src/assets/music/) and import it here.
 * Music by Alexander Nakarada (creatorchords.com), Pixabay Content License.
 */
const MATCH_TRACKS: string[] = [
  adventureMetalVersionPath,
  adventurousMetalPiratesPath,
  afterglowPath,
  armyOfTheDeadPath,
  ascendantPath,
  battleOfHastingsPath,
  boundByTheOathPath,
  culpritMassacrePath,
  curriculum404Path,
  folklorePath,
  frozenHordePath,
  helheimPath,
  theRiffPath,
  twelveDaysOfChaosPath,
  voidToTheWorldPath,
  wreckTheHallsPath
]

/** Mix level of the match music: ~8 dB under the effects (the files are loudness-normalized by yarn music) */
const MUSIC_LEVEL = 0.2

/** How often the playlist checks whether the current track ended (ms, real time) */
const CHECK_MS = 1000

/**
 * Not in Resources: each track is ~9 MB, so it loads only when its turn comes
 * (the next one loads while the current one plays) instead of before PLAY!.
 */
const sounds = new Map<string, ex.Sound>()

function soundFor(path: string): ex.Sound {
  let sound = sounds.get(path)
  if (!sound) {
    sound = new ex.Sound(path)
    AudioManager.register(sound, 'music', MUSIC_LEVEL)
    sounds.set(path, sound)
  }
  return sound
}

/** Shuffled play order, never the same track twice in a row */
function nextTrack(previous: string | null): string {
  const choices = MATCH_TRACKS.length > 1 ? MATCH_TRACKS.filter(path => path !== previous) : MATCH_TRACKS
  return choices[Math.floor(Math.random() * choices.length)]
}

class MatchPlaylist {
  private current: string | null = null
  private upcoming: string | null = null
  private timer: ReturnType<typeof setInterval> | null = null
  /** Bumped by stop(): a track that finishes loading after it doesn't start */
  private session = 0
  private starting = false
  /** When the current track was started (it may take a moment to report playing) */
  private startedAt = 0

  /** The tracks that exist so far (GameUI pauses the playing one) */
  get sounds(): ex.Sound[] {
    return [...sounds.values()]
  }

  start() {
    this.stop()
    this.timer = setInterval(() => this.check(), CHECK_MS)
    void this.playNext()
  }

  stop() {
    this.session++
    if (this.timer) clearInterval(this.timer)
    this.timer = null
    this.starting = false
    for (const sound of sounds.values()) sound.stop()
  }

  /** Starts the next track when the current one ended (a paused one is left alone) */
  private check() {
    if (this.starting || !this.current || Date.now() - this.startedAt < 3000) return
    const sound = soundFor(this.current)
    if (!sound.isPlaying() && !sound.isPaused()) void this.playNext()
  }

  private async playNext() {
    if (MATCH_TRACKS.length === 0) return
    const session = this.session
    this.starting = true
    const path = this.upcoming ?? nextTrack(this.current)
    const sound = soundFor(path)
    try {
      if (!sound.isLoaded()) await sound.load()
    } catch {
      // couldn't load (offline?): try another one at the next check
      if (session === this.session) {
        this.current = path
        this.starting = false
      }
      return
    }
    if (session !== this.session) return
    this.current = path
    this.starting = false
    sound.loop = MATCH_TRACKS.length === 1
    this.startedAt = Date.now()
    void sound.play()
    // load the following track in the background
    this.upcoming = nextTrack(path)
    const upcoming = soundFor(this.upcoming)
    if (!upcoming.isLoaded()) upcoming.load().catch(() => { /* retried when its turn comes */ })
  }
}

export const MatchMusic = new MatchPlaylist()
