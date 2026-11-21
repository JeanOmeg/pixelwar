/* eslint-disable no-console -- command line tool */
// Builds the sound effects in src/assets/sfx/ (yarn sfx). Every sound is a
// recipe below: change it and run the command again, never edit the WAVs.
import { join } from 'path'
import { mkdirSync } from 'fs'
import { drive, echo, env, filter, gain, midi, mix, normalizeLoudness, osc, rng, samples, writeWav } from './synth'

const random = rng(42)

const OUT = join(__dirname, '../../src/assets/sfx')

/** Plucked/bell note: a few harmonics with a fast decay */
function bell(note: number, seconds: number, bright = 0.3) {
  const f = midi(note)
  const out = osc('sine', f, seconds)
  mix(out, osc('sine', f * 2.01, seconds), 0, bright)
  mix(out, osc('sine', f * 3.02, seconds), 0, bright / 3)
  return env(out, 0.004, 4)
}

/** Brass-like note for the jingles */
function brass(note: number, seconds: number) {
  const f = midi(note)
  const out = osc('saw', t => f * (1 + 0.004 * Math.sin(2 * Math.PI * 5 * t)), seconds)
  mix(out, osc('saw', f * 1.003, seconds), 0, 0.7)
  filter(out, 'lowpass', t => 900 + 1800 * Math.min(1, t / 0.06), 0.9)
  return env(out, 0.03, 1.5)
}

/** Low drum hit (kick/timpani) */
function boom(from: number, to: number, seconds: number) {
  return env(osc('sine', t => to + (from - to) * Math.exp(-t * 25), seconds), 0.002, 2.5)
}

const sounds: Record<string, () => Float32Array> = {
  // the attack went wide: a whoosh
  miss: () => {
    const out = osc('noise', 0, 0.32)
    filter(out, 'bandpass', t => 2400 - 5000 * t, 1.6)
    return env(out, 0.08, 2)
  },

  // heavy impact with a metallic ring
  critical: () => {
    const out = samples(0.7)
    mix(out, boom(160, 38, 0.55), 0, 1)
    mix(out, env(filter(osc('noise', 0, 0.18), 'lowpass', 3500), 0.001, 3), 0, 0.8)
    for (const [f, level] of [[1250, 0.3], [1870, 0.22], [2630, 0.15]]) {
      mix(out, env(osc('sine', f, 0.7), 0.002, 3), 0.01, level)
    }
    return drive(out, 1.8)
  },

  // rising major arpeggio with a shimmer
  heal: () => {
    const out = samples(1.0)
    ;[69, 73, 76, 81, 85].forEach((note, i) => mix(out, bell(note, 0.6), i * 0.07, 0.5))
    mix(out, env(filter(osc('noise', 0, 0.9), 'highpass', 6000), 0.2, 2), 0, 0.08)
    return echo(out, 0.09, 0.3)
  },

  // a skill is used: upward sweep and sparkle
  skill: () => {
    const out = samples(0.6)
    const sweep = osc('square', t => 260 + 1300 * t / 0.3, 0.3)
    mix(out, env(filter(sweep, 'lowpass', 1800), 0.02, 1.5), 0, 0.35)
    ;[84, 88, 91].forEach((note, i) => mix(out, bell(note, 0.3, 0.5), 0.18 + i * 0.05, 0.3))
    return echo(out, 0.07, 0.25)
  },

  // a unit falls: falling groan and a thud
  death: () => {
    const out = samples(0.8)
    const fall = osc('saw', t => 320 * Math.exp(-t * 3), 0.6)
    mix(out, env(filter(fall, 'lowpass', 900), 0.01, 1.5), 0, 0.5)
    mix(out, boom(110, 40, 0.35), 0.42, 0.9)
    mix(out, env(filter(osc('noise', 0, 0.2), 'lowpass', 700), 0.002, 3), 0.42, 0.6)
    return out
  },

  // fanfare in D major
  victory: () => {
    const out = samples(2.8)
    const line: [number, number, number][] = [[62, 0, 0.16], [62, 0.18, 0.16], [62, 0.36, 0.16], [69, 0.54, 0.5], [66, 1.1, 0.22], [69, 1.34, 1.4]]
    for (const [note, start, length] of line) {
      mix(out, brass(note, length), start, 0.45)
      mix(out, brass(note - 12, length), start, 0.25)
    }
    for (const note of [62, 66]) mix(out, brass(note, 1.4), 1.34, 0.25)
    for (const start of [0, 0.54, 1.34]) mix(out, boom(90, 50, 0.5), start, 0.7)
    return echo(out, 0.11, 0.25)
  },

  // slow minor descent
  defeat: () => {
    const out = samples(3.2)
    const line: [number, number, number][] = [[69, 0, 0.5], [67, 0.55, 0.5], [65, 1.1, 0.5], [62, 1.65, 1.5]]
    for (const [note, start, length] of line) {
      mix(out, brass(note, length), start, 0.4)
      mix(out, brass(note - 12, length), start, 0.3)
    }
    mix(out, brass(53, 1.5), 1.65, 0.25)
    mix(out, boom(70, 35, 1.0), 1.65, 0.8)
    return echo(out, 0.13, 0.3)
  },

  // not allowed: two low buzzes
  denied: () => {
    const out = samples(0.22)
    for (const start of [0, 0.11]) mix(out, env(filter(osc('square', 130, 0.08), 'lowpass', 1400), 0.003, 1), start, 0.6)
    return out
  },

  // bow string and the arrow leaving
  bow: () => {
    const out = samples(0.35)
    mix(out, env(osc('triangle', t => 240 - 60 * t, 0.18), 0.001, 3), 0, 0.7)
    const air = osc('noise', 0, 0.3)
    mix(out, env(filter(air, 'bandpass', t => 4000 - 6000 * t, 2), 0.03, 2), 0.02, 0.6)
    return out
  },

  // fire spell: roaring sweep with crackles
  fire: () => {
    const out = osc('noise', 0, 0.5)
    filter(out, 'lowpass', t => 400 + 4000 * Math.min(1, t / 0.25), 1.2)
    env(out, 0.12, 1.5)
    const crackle = osc('noise', 0, 0.5)
    gain(crackle, () => random() < 0.004 ? 1 : 0)
    filter(crackle, 'highpass', 3000)
    mix(out, crackle, 0, 2.5)
    return drive(out, 1.5)
  },

  // dark spell (Necromancer): low detuned hum, closing filter
  dark: () => {
    const out = samples(0.6)
    for (const f of [98, 103.5, 147]) mix(out, osc('saw', t => f * (1 + 0.03 * Math.sin(2 * Math.PI * 9 * t)), 0.6), 0, 0.3)
    filter(out, 'lowpass', t => 1800 - 2600 * t, 2)
    return env(out, 0.1, 1.5)
  }
}

/**
 * Loudness of each sound: RMS of its loudest 100 ms. The original hit.wav is
 * about 0.075, the reference for a normal effect.
 */
const LOUDNESS: Record<string, number> = {
  default: 0.075,
  critical: 0.1,
  denied: 0.05,
  victory: 0.07,
  defeat: 0.07
}

mkdirSync(OUT, { recursive: true })
for (const [name, recipe] of Object.entries(sounds)) {
  writeWav(join(OUT, `${name}.wav`), normalizeLoudness(recipe(), LOUDNESS[name] ?? LOUDNESS.default))
  console.log(`sfx/${name}.wav`)
}
