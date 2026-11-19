// Minimal PNG reader/writer (8-bit RGBA/RGB/palette, no interlace) for the
// tileset script, so it needs no image library
import { readFileSync, writeFileSync } from 'fs'
import { deflateSync, inflateSync } from 'zlib'

export interface Image {
  width: number
  height: number
  data: Uint8Array // RGBA
}

const SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

export function readPng(path: string): Image {
  const file = readFileSync(path)
  let pos = 8
  let width = 0
  let height = 0
  let colorType = 0
  let palette: Buffer | undefined
  let alpha: Buffer | undefined
  const idat: Buffer[] = []
  while (pos < file.length) {
    const length = file.readUInt32BE(pos)
    const type = file.toString('ascii', pos + 4, pos + 8)
    const chunk = file.subarray(pos + 8, pos + 8 + length)
    if (type === 'IHDR') {
      width = chunk.readUInt32BE(0)
      height = chunk.readUInt32BE(4)
      colorType = chunk[9]
      if (chunk[8] !== 8 || chunk[12] !== 0) throw new Error('unsupported PNG')
    }
    if (type === 'PLTE') palette = chunk
    if (type === 'tRNS') alpha = chunk
    if (type === 'IDAT') idat.push(chunk)
    pos += 12 + length
  }
  const bpp = ({ 6: 4, 2: 3, 3: 1 } as Record<number, number>)[colorType]
  if (!bpp) throw new Error(`unsupported PNG color type ${colorType}`)
  const raw = inflateSync(Buffer.concat(idat))
  const stride = width * bpp
  const data = new Uint8Array(width * height * 4)
  let prev = new Uint8Array(stride)
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)]
    const line = Uint8Array.from(raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)))
    for (let i = 0; i < stride; i++) {
      const left = i >= bpp ? line[i - bpp] : 0
      const up = prev[i]
      const upLeft = i >= bpp ? prev[i - bpp] : 0
      let add = 0
      if (filter === 1) add = left
      else if (filter === 2) add = up
      else if (filter === 3) add = (left + up) >> 1
      else if (filter === 4) {
        const p = left + up - upLeft
        const pa = Math.abs(p - left)
        const pb = Math.abs(p - up)
        const pc = Math.abs(p - upLeft)
        add = pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft
      }
      line[i] = (line[i] + add) & 255
    }
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * 4
      const s = x * bpp
      if (colorType === 3) {
        const k = line[s]
        data.set([palette![k * 3], palette![k * 3 + 1], palette![k * 3 + 2], alpha && k < alpha.length ? alpha[k] : 255], o)
      } else {
        data.set([line[s], line[s + 1], line[s + 2], colorType === 6 ? line[s + 3] : 255], o)
      }
    }
    prev = line
  }
  return { width, height, data }
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})

function crc32(buf: Buffer): number {
  let crc = 0xffffffff
  for (const byte of buf) crc = CRC_TABLE[(crc ^ byte) & 255] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type: string, data: Buffer): Buffer {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([length, body, crc])
}

export function writePng(path: string, image: Image): void {
  const { width, height, data } = image
  const raw = Buffer.alloc((width * 4 + 1) * height)
  for (let y = 0; y < height; y++) {
    Buffer.from(data.buffer, data.byteOffset + y * width * 4, width * 4).copy(raw, y * (width * 4 + 1) + 1)
  }
  const header = Buffer.alloc(13)
  header.writeUInt32BE(width, 0)
  header.writeUInt32BE(height, 4)
  header[8] = 8
  header[9] = 6
  writeFileSync(path, Buffer.concat([
    SIGNATURE,
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ]))
}
