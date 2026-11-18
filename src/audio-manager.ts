import * as ex from 'excalibur'
import { Resources } from './resources'

const PREF_MUTED = 'pixelfantasywar.muted'

function readMuted(): boolean {
  try { return localStorage.getItem(PREF_MUTED) === '1' } catch { return false }
}

export class AudioManager {
  /** Sound off, remembered between visits */
  static muted = readMuted()

  static levels = new Map<ex.Sound, number>([
    [ Resources.HitSound, 1.0 ],
    [ Resources.MoveSound, 1.0 ],
    [ Resources.SelectSound, 1.0 ],
    [ Resources.TargetSelectSound, 1.0 ],
    [ Resources.LevelMusic2, .05 ],
    [ Resources.ExplosionSound, 1.0 ],
    [ Resources.TitleMusic, .05 ],
  ])

  static init() {
    AudioManager.applyVolumes()
  }

  static toggleMute(shouldMute: boolean) {
    AudioManager.muted = shouldMute
    try { localStorage.setItem(PREF_MUTED, shouldMute ? '1' : '0') } catch { /* storage unavailable */ }
    AudioManager.applyVolumes()
  }

  private static applyVolumes() {
    for (const resource of Object.values(Resources)) {
      if (resource instanceof ex.Sound) {
        resource.volume = AudioManager.muted ? 0 : (AudioManager.levels.get(resource) ?? 1.0)
      }
    }
  }
}