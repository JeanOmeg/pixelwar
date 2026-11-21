// Tiny offline synthesizer for the game's sound effects (no audio library):
// oscillators, noise, envelopes, biquad filters and a WAV writer
import { writeFileSync } from 'fs'

export const RATE = 22050

export type Wave = 'sine' | 'square' | 'saw' | 'triangle' | 'noise'
/** A constant or a value over time (seconds from the start of the sound) */
export type Param = number | ((t: number) => number)

const at = (p: Param, t: number) => typeof p === 'number' ? p : p(t)

/** Deterministic random numbers (the same file on every run) */
export function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const random = rng(7)

export function samples(seconds: number) {
  return new Float32Array(Math.round(seconds * RATE))
}

export function midi(note: number) {
  return 440 * Math.pow(2, (note - 69) / 12)
}

/** Oscillator (or noise) with a frequency that may change over time */
export function osc(wave: Wave, freq: Param, seconds: number): Float32Array {
  const out = samples(seconds)
  let phase = 0
  for (let i = 0; i < out.length; i++) {
    const t = i / RATE
    phase = (phase + at(freq, t) / RATE) % 1
    switch (wave) {
    case 'sine': out[i] = Math.sin(phase * 2 * Math.PI); break
    case 'square': out[i] = phase < 0.5 ? 1 : -1; break
    case 'saw': out[i] = 2 * phase - 1; break
    case 'triangle': out[i] = 1 - 4 * Math.abs(phase - 0.5); break
    case 'noise': out[i] = random() * 2 - 1; break
    }
  }
  return out
}

/** Attack, then exponential-ish decay to silence at the end of the buffer */
export function env(buffer: Float32Array, attack: number, curve = 3): Float32Array {
  const total = buffer.length / RATE
  for (let i = 0; i < buffer.length; i++) {
    const t = i / RATE
    const rise = attack > 0 ? Math.min(1, t / attack) : 1
    const fall = t < attack ? 1 : Math.pow(1 - (t - attack) / Math.max(total - attack, 1e-6), curve)
    buffer[i] *= rise * fall
  }
  return buffer
}

/** Multiplies the buffer by a gain over time */
export function gain(buffer: Float32Array, g: Param): Float32Array {
  for (let i = 0; i < buffer.length; i++) buffer[i] *= at(g, i / RATE)
  return buffer
}

type FilterKind = 'lowpass' | 'highpass' | 'bandpass'

/** RBJ biquad; cutoff may change over time */
export function filter(buffer: Float32Array, kind: FilterKind, cutoff: Param, q = 0.707): Float32Array {
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0
  for (let i = 0; i < buffer.length; i++) {
    const f = Math.min(Math.max(at(cutoff, i / RATE), 20), RATE * 0.45)
    const w = 2 * Math.PI * f / RATE
    const alpha = Math.sin(w) / (2 * q)
    const cos = Math.cos(w)
    let b0: number, b1: number, b2: number
    if (kind === 'lowpass') { b0 = (1 - cos) / 2; b1 = 1 - cos; b2 = b0 }
    else if (kind === 'highpass') { b0 = (1 + cos) / 2; b1 = -(1 + cos); b2 = b0 }
    else { b0 = alpha; b1 = 0; b2 = -alpha }
    const a0 = 1 + alpha, a1 = -2 * cos, a2 = 1 - alpha
    const x = buffer[i]
    const y = (b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0
    x2 = x1; x1 = x; y2 = y1; y1 = y
    buffer[i] = y
  }
  return buffer
}

/** Soft clipping */
export function drive(buffer: Float32Array, amount: number): Float32Array {
  const norm = Math.tanh(amount)
  for (let i = 0; i < buffer.length; i++) buffer[i] = Math.tanh(buffer[i] * amount) / norm
  return buffer
}

/** Adds `part` into `into` starting at `start` seconds (grows nothing: `into` must be long enough) */
export function mix(into: Float32Array, part: Float32Array, start = 0, level = 1): Float32Array {
  const offset = Math.round(start * RATE)
  for (let i = 0; i < part.length && offset + i < into.length; i++) into[offset + i] += part[i] * level
  return into
}

/** Short feedback echo, a cheap room */
export function echo(buffer: Float32Array, delay: number, feedback: number): Float32Array {
  const d = Math.round(delay * RATE)
  for (let i = d; i < buffer.length; i++) buffer[i] += buffer[i - d] * feedback
  return buffer
}

/** Scales to the given peak, with short fades at both ends (no clicks) */
export function normalize(buffer: Float32Array, peak = 0.9): Float32Array {
  let max = 0
  for (const v of buffer) max = Math.max(max, Math.abs(v))
  const k = max > 0 ? peak / max : 1
  const fade = Math.round(0.004 * RATE)
  for (let i = 0; i < buffer.length; i++) {
    const edge = Math.min(1, i / fade, (buffer.length - 1 - i) / fade)
    buffer[i] *= k * edge
  }
  return buffer
}

/** 16-bit mono PCM WAV */
export function writeWav(path: string, buffer: Float32Array) {
  const data = Buffer.alloc(buffer.length * 2)
  buffer.forEach((v, i) => data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v)) * 32767), i * 2))
  const header = Buffer.alloc(44)
  header.write('RIFF', 0)
  header.writeUInt32LE(36 + data.length, 4)
  header.write('WAVE', 8)
  header.write('fmt ', 12)
  header.writeUInt32LE(16, 16)
  header.writeUInt16LE(1, 20)
  header.writeUInt16LE(1, 22)
  header.writeUInt32LE(RATE, 24)
  header.writeUInt32LE(RATE * 2, 28)
  header.writeUInt16LE(2, 32)
  header.writeUInt16LE(16, 34)
  header.write('data', 36)
  header.writeUInt32LE(data.length, 40)
  writeFileSync(path, Buffer.concat([header, data]))
}

/**
 * Scales to the given loudness: RMS of the loudest 100 ms (so a short hit and
 * a long jingle sound equally loud), never above `maxPeak`
 */
export function normalizeLoudness(buffer: Float32Array, rms: number, maxPeak = 0.95): Float32Array {
  const window = Math.round(0.1 * RATE)
  let loudest = 0
  for (let start = 0; start < buffer.length; start += Math.floor(window / 2)) {
    let energy = 0
    const end = Math.min(buffer.length, start + window)
    for (let i = start; i < end; i++) energy += buffer[i] * buffer[i]
    loudest = Math.max(loudest, Math.sqrt(energy / window))
  }
  let max = 0
  for (const v of buffer) max = Math.max(max, Math.abs(v))
  const scale = Math.min(rms / Math.max(loudest, 1e-9), maxPeak / Math.max(max, 1e-9))
  return normalize(buffer, max * scale)
}
