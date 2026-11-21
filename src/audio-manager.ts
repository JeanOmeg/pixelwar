import * as ex from 'excalibur'
import { Resources } from './resources'

const PREF_MUTED = 'pixelfantasywar.muted'
const PREF_MUSIC = 'pixelfantasywar.volume.music'
const PREF_EFFECTS = 'pixelfantasywar.volume.effects'

/** Volume steps of the sliders (0..VOLUME_STEPS) */
export const VOLUME_STEPS = 10

export type AudioChannel = 'music' | 'effects'

function read(key: string): string | null {
  try { return localStorage.getItem(key) } catch { return null }
}

function write(key: string, value: string) {
  try { localStorage.setItem(key, value) } catch { /* storage unavailable */ }
}

function readStep(key: string): number {
  const value = Number(read(key))
  return read(key) !== null && Number.isInteger(value) && value >= 0 && value <= VOLUME_STEPS ? value : VOLUME_STEPS
}

/**
 * Sound levels: mute, and a volume for music and one for effects (0..10, all
 * remembered between visits). A sound's volume = its own mix level × its
 * channel's volume (match music registers itself, see music.ts).
 */
export class AudioManager {
  /** Sound off, remembered between visits */
  static muted = read(PREF_MUTED) === '1'
  static volumes: Record<AudioChannel, number> = {
    music: readStep(PREF_MUSIC),
    effects: readStep(PREF_EFFECTS)
  }

  /**
   * Mix level of each sound (1 when missing). Music: same level as the match
   * music (music.ts). The old explosion.wav is much louder than the other effects.
   */
  private static levels = new Map<ex.Sound, number>([
    [ Resources.TitleMusic, .2 ],
    [ Resources.ExplosionSound, .15 ],
  ])

  private static music = new Set<ex.Sound>([ Resources.TitleMusic ])
  private static listeners = new Set<() => void>()

  static init() {
    AudioManager.applyVolumes()
  }

  /** Registers a sound loaded later (match music): its channel and mix level */
  static register(sound: ex.Sound, channel: AudioChannel, level = 1) {
    AudioManager.levels.set(sound, level)
    if (channel === 'music') AudioManager.music.add(sound)
    AudioManager.applyVolume(sound)
  }

  static toggleMute(shouldMute: boolean) {
    AudioManager.muted = shouldMute
    write(PREF_MUTED, shouldMute ? '1' : '0')
    AudioManager.changed()
  }

  /** Sets a channel's volume (0..VOLUME_STEPS) */
  static setVolume(channel: AudioChannel, step: number) {
    AudioManager.volumes[channel] = Math.max(0, Math.min(VOLUME_STEPS, Math.round(step)))
    write(channel === 'music' ? PREF_MUSIC : PREF_EFFECTS, String(AudioManager.volumes[channel]))
    AudioManager.changed()
  }

  /** Called when mute or a volume changes; returns the unsubscribe function */
  static onChange(listener: () => void): () => void {
    AudioManager.listeners.add(listener)
    return () => AudioManager.listeners.delete(listener)
  }

  private static changed() {
    AudioManager.applyVolumes()
    AudioManager.listeners.forEach(listener => listener())
  }

  private static applyVolume(sound: ex.Sound) {
    const channel: AudioChannel = AudioManager.music.has(sound) ? 'music' : 'effects'
    const volume = AudioManager.volumes[channel] / VOLUME_STEPS
    const level = AudioManager.levels.get(sound) ?? 1
    sound.volume = AudioManager.muted ? 0 : level * volume
  }

  private static applyVolumes() {
    for (const resource of Object.values(Resources)) {
      if (resource instanceof ex.Sound) AudioManager.applyVolume(resource)
    }
    for (const sound of AudioManager.levels.keys()) AudioManager.applyVolume(sound)
  }
}
