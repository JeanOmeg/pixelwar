/* eslint-disable no-console -- command line tool */
// Converts the original music in music-src/ (not in git) to the light
// versions the game uses, in src/assets/music/ (yarn music): 64 kbps stereo
// MP3 at the same loudness, no cover art or tags. Only redoes files whose original is newer.
import { execFileSync } from 'child_process'
import { existsSync, mkdirSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import ffmpeg from 'ffmpeg-static'

const ROOT = join(__dirname, '../..')
const SOURCE = join(ROOT, 'music-src')
const OUT = join(ROOT, 'src/assets/music')
const BITRATE = '64k'
/** Target loudness (LUFS); music.ts and AudioManager set how loud music plays against the effects */
const LOUDNESS = -16

if (!ffmpeg) throw new Error('ffmpeg-static has no binary for this platform')
if (!existsSync(SOURCE)) throw new Error(`Put the original .mp3 files in ${SOURCE}`)
mkdirSync(OUT, { recursive: true })

let before = 0
let after = 0
for (const file of readdirSync(SOURCE).filter(f => f.toLowerCase().endsWith('.mp3')).sort()) {
  const input = join(SOURCE, file)
  const output = join(OUT, file.toLowerCase())
  const fresh = existsSync(output) && statSync(output).mtimeMs >= statSync(input).mtimeMs
  if (!fresh) {
    execFileSync(ffmpeg, [
      '-y', '-loglevel', 'error', '-i', input,
      '-map', '0:a', '-map_metadata', '-1',
      // every track equally loud (the originals differ by up to 7 dB)
      '-af', 'loudnorm=I=' + LOUDNESS + ':TP=-1.5:LRA=11',
      '-ac', '2', '-ar', '44100', '-b:a', BITRATE,
      output
    ])
  }
  before += statSync(input).size
  after += statSync(output).size
  console.log(`${fresh ? 'ok  ' : 'new '} music/${file.toLowerCase()} ${(statSync(output).size / 1e6).toFixed(1)} MB`)
}
console.log(`total ${(before / 1e6).toFixed(0)} MB -> ${(after / 1e6).toFixed(0)} MB`)
