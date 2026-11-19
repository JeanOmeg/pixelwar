// Hand-drawn 16x16 sprites for the new tiles (the tileset art is 16x16 drawn at 2x).
// One character per pixel, colors from PALETTE; '.' is transparent and 's' is the
// shadow color of the ground the sprite is placed on.

// Colors already used by the tileset (plus the two sand tones)
export const PALETTE: Record<string, string> = {
  o: '2a2236', // darkest outline
  k: '2e3b58', // wall darkest
  n: '464f7d',
  d: '596598', // wall dark
  m: '939bbb', // wall mid
  l: 'cbd8b9', // wall light
  w: '64474b', // dark brown (trunks, wood outline)
  b: '876a3b', // wood
  a: 'a87629', // dirt speck / wood light
  y: 'b08840', // dirt
  r: 'ad5736', // door orange
  g: '56b439', // grass
  t: '2da236', // grass tuft
  h: '438b36', // grass shadow
  e: '209036', // tree green
  f: '2c6d39', // tree dark
  c: '0070d4', // water
  u: '5087f6', // water light
  v: '0258aa', // water dark
  p: 'b0a29e', // stone floor
  q: '877d81', // stone floor dark
  j: '777562',
  z: '9b9774', // gravel
  S: 'ceae68', // sand (new)
  T: 'c49c52' // sand speck (new)
}

// shine and cracks on ice ('s' = crack)
export const ICE_A = [
  '................',
  '..ll............',
  '...ll.......s...',
  '....l......s....',
  '..........ss....',
  '.........s......',
  '........ss......',
  '................',
  '................',
  '.........ll.....',
  '..s.......ll....',
  '..ss.......l....',
  '....s...........',
  '.....s..........',
  '................',
  '................'
]

export const ICE_B = [
  '................',
  '................',
  '.......s........',
  '.......ss.......',
  '.........s......',
  '...ll.....s.....',
  '....ll....ss....',
  '.....l..........',
  '................',
  '............ll..',
  '.............ll.',
  '...s..........l.',
  '....ss..........',
  '......s.........',
  '................',
  '................'
]

export const CACTUS = [
  '................',
  '.......ff.......',
  '......fttf......',
  '......fgth......',
  '..ff..fgth......',
  '.fgtf.fgth......',
  '.fgth.fgth..ff..',
  '.fgthffgth.fgtf.',
  '..fgttggth.fgth.',
  '...ffffgthfgth..',
  '......fgttgth...',
  '......fgthff....',
  '......fgth......',
  '......fgth......',
  '.....sfghhfs....',
  '......ssssss....'
]

export const DEAD_SHRUB = [
  '................',
  '................',
  '................',
  '....w......w....',
  '.....w....w..w..',
  '..w..w...w..w...',
  '...w..w.bw.w....',
  '....w.wbw.w...w.',
  '.w...wbbw.w..w..',
  '..ww..wbbwwww...',
  '....wwwbbbw.....',
  '.......wbw......',
  '......wbbbw.....',
  '.....sswwwss....',
  '................',
  '................'
]

export const PEBBLES = [
  '................',
  '................',
  '...pp...........',
  '..pmmd..........',
  '..dmdk.......pp.',
  '...ss.......pmd.',
  '............dks.',
  '......pp........',
  '.....pmmd.......',
  '.....dmmk.......',
  '......dkss......',
  '................',
  '.pp.........pp..',
  'pmmd.......pmd..',
  '.dks........ss..',
  '................'
]

export const BUSH = [
  '................',
  '................',
  '................',
  '......ffff......',
  '....ffeeeeff....',
  '...feeeeeeeef...',
  '..feeefeeeeeef..',
  '..feeeeeeeefef..',
  '.feeeeeeefeeeff.',
  '.feefeeeeeeeeff.',
  '.ffeeeeefeeefwf.',
  '.wffeeeeeeeffww.',
  '..wwffffffffww..',
  '...swwwwwwwws...',
  '....ssssssss....',
  '................'
]

export const FLOWERS_A = [
  '................',
  '..l.............',
  '.lyl.......r....',
  '..lh......ryr...',
  '...h.......rh...',
  '............h...',
  '......u.........',
  '.....uyu........',
  '......uh....l...',
  '.......h...lyl..',
  '............lh..',
  '..r..........h..',
  '.ryr.....l......',
  '..rh....lyl.....',
  '...h.....lh.....',
  '................'
]

export const FLOWERS_B = [
  '................',
  '.........l......',
  '..r.....lyl.....',
  '.ryr.....lh.....',
  '..rh......h.....',
  '...h........r...',
  '...........ryr..',
  '.....l......rh..',
  '....lyl......h..',
  '.....lh.........',
  '......h...u.....',
  '.........uyu....',
  '..u.......uh....',
  '.uyu.......h....',
  '..uh............',
  '...h............'
]

export const TALL_GRASS = [
  '................',
  '................',
  '...t.......t....',
  '...t..t...tt....',
  '..tt..t...t..t..',
  '..t..tt..tt..t..',
  '.tt.tth..t..tt..',
  '.t.tth..tt.tth..',
  'tt.th..tth.th...',
  'th.h..tth..h..t.',
  'h..h.tth..th.tt.',
  '..t..th..tth.th.',
  '.tt..h..tth..h..',
  '.th.....th......',
  '.h......h.......',
  '................'
]

export const STUMP = [
  '................',
  '................',
  '................',
  '................',
  '................',
  '.....wwwwww.....',
  '....wyyaayyw....',
  '...wyaayyaayw...',
  '...wyayaayayw...',
  '...bwyaayyawb...',
  '...bbwwwwwwbb...',
  '...bbbbwbbbbw...',
  '...wbbbwbbbww...',
  '..wbbwbbbwbbbw..',
  '..swwwswwswwws..',
  '....ssssssss....'
]

export const LOG = [
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '..wwwwwwwwwwww..',
  '.wbbbbbbbbbbwyw.',
  'wbbwbbbbwbbwyayw',
  'wbbbbwbbbbbwyaaw',
  'wbwbbbbbwbbwyayw',
  '.wwbbbwbbbbbwyw.',
  '..wwwwwwwwwwwww.',
  '..sssssssssssss.',
  '................',
  '................'
]

export const CRATE = [
  '................',
  '................',
  '...wwwwwwwwwww..',
  '...wyyyyyyyyyw..',
  '...wyaaaaaayyw..',
  '...wyaaaaayayw..',
  '...wyaaaayaayw..',
  '...wyaaayaaayw..',
  '...wyaayaaaayw..',
  '...wyayaaaaayw..',
  '...wyyaaaaaayw..',
  '...wyyyyyyyyyw..',
  '...wbbbbbbbbbw..',
  '...wwwwwwwwwww..',
  '...sssssssssss..',
  '................'
]

export const BARREL = [
  '................',
  '................',
  '....wwwwwwww....',
  '...wbyyyyyybw...',
  '...wwbbbbbbww...',
  '...wddddddddw...',
  '...wyayaayaaw...',
  '...wyayaayaaw...',
  '...wddddddddw...',
  '...wyayaayaaw...',
  '...wyayaayaaw...',
  '...wddddddddw...',
  '...wbbabbabbw...',
  '....wwwwwwww....',
  '...ssssssssss...',
  '................'
]

const FENCE_POST_TOP = '......www.......'
const FENCE_POST = '......wyw.......'
const FENCE_RAIL_EDGE = 'wwwwwwwbwwwwwwww'
const FENCE_RAIL_TOP = 'yyyyyywbwyyyyyyy'
const FENCE_RAIL_BOTTOM = 'bbbbbbwbwbbbbbbb'

export const FENCE_H = [
  '................',
  '................',
  '................',
  '................',
  FENCE_POST_TOP,
  FENCE_POST,
  FENCE_RAIL_EDGE,
  FENCE_RAIL_TOP,
  FENCE_RAIL_BOTTOM,
  FENCE_RAIL_EDGE,
  '......wbw.......',
  FENCE_RAIL_EDGE,
  FENCE_RAIL_TOP,
  FENCE_RAIL_BOTTOM,
  FENCE_RAIL_EDGE,
  'ssssssssssssssss'
]

// Keep only columns [from, to) of a sprite (fence ends)
export function cropColumns(rows: string[], from: number, to: number): string[] {
  return rows.map(row => [...row].map((ch, x) => (x >= from && x < to ? ch : '.')).join(''))
}

export const FENCE_V_MIDDLE = [
  '.....wybw.......',
  '.....wybws......',
  '.....wybws......',
  '....wwwwwws.....',
  '....wyyyybws....',
  '....wybbbbws....',
  '....wybbbbws....',
  '....wwwwwwws....',
  '.....wybws......',
  '.....wybws......',
  '.....wybws......',
  '.....wybws......',
  '.....wybws......',
  '.....wybws......',
  '.....wybws......',
  '.....wybws......'
]

export const WELL = [
  '................',
  '................',
  '...kkkkkkkkkk...',
  '..kllmllllmllk..',
  '.klmkkkkkkkkmlk.',
  '.kmkvvvvvvvvkmk.',
  '.klkvccucccvklk.',
  '.kmkvcccccuvkmk.',
  '.kllkkkkkkkkllk.',
  '.kdmmlldmmlldmk.',
  '.kmmdmmmdmmmdmk.',
  '.kddddkddddkddk.',
  '.kmmmdmmmdmmmdk.',
  '..kkkkkkkkkkkk..',
  '..ssssssssssss..',
  '................'
]

export const RUBBLE = [
  '................',
  '................',
  '................',
  '................',
  '......ll........',
  '.....lmmd...ll..',
  '....lmmmdk.lmmd.',
  '...ldmmddk.dddk.',
  '.ll.dkkks..sss..',
  'lmmd.sss........',
  'dddks....llll...',
  '.sss....lmmmmd..',
  '........dmmdddk.',
  '.........kkkkks.',
  '..........ssss..',
  '................'
]

export const BROKEN_PILLAR = [
  '................',
  '................',
  '................',
  '................',
  '....l.ll........',
  '...lmlmmll......',
  '...lmmmmlll.....',
  '...mlmmmllm.....',
  '...dmmmmmmd.....',
  '...ddmmmmdd.....',
  '...kdddddddk....',
  '...kdmdddmdk....',
  '...kkdddddkk.ll.',
  '...wkkkkkkkwlmmd',
  '...wwwwwwwwwdkks',
  '....sssssss.sss.'
]

export const ALTAR = [
  '................',
  '................',
  '................',
  '..kkkkkkkkkkkk..',
  '.kllllllllllllk.',
  '.kllrrrrrrrrllk.',
  '.kmmrrrrrrrrmmk.',
  '.kdmmrrrrrrmmdk.',
  '.kkkkrryyrrkkkk.',
  '..kdmmryyrmmdk..',
  '..kmmdryyrdmmk..',
  '..kddmrrrrmddk..',
  '..kmmdmmmmdmmk..',
  '..kkkkkkkkkkkk..',
  '.ssssssssssssss.',
  '................'
]

export const STAIRS = [
  'kkkkkkkkkkkkkkkk',
  'llllllllllllllll',
  'mmmmmmmmmmmmmmmm',
  'dddddddddddddddd',
  'llllllllllllllll',
  'mmmmmmmmmmmmmmmm',
  'dddddddddddddddd',
  'llllllllllllllll',
  'mmmmmmmmmmmmmmmm',
  'dddddddddddddddd',
  'llllllllllllllll',
  'mmmmmmmmmmmmmmmm',
  'dddddddddddddddd',
  'kkkkkkkkkkkkkkkk',
  'nnnnnnnnnnnnnnnn',
  'kkkkkkkkkkkkkkkk'
]

// Overlays drawn on top of a wall facade tile
export const WINDOW = [
  '................',
  '................',
  '................',
  '.....kkkkkk.....',
  '....kwwwwwwk....',
  '....kwoboowk....',
  '....kwoboowk....',
  '....kwbbbbwk....',
  '....kwoboowk....',
  '....kwoboowk....',
  '....kwwwwwwk....',
  '....kmmmmmmk....',
  '.....kkkkkk.....',
  '................',
  '................',
  '................'
]

export const TORCH = [
  '................',
  '.......l........',
  '......lyl.......',
  '......yry.......',
  '.....yrrry......',
  '.....rrarr......',
  '......rar.......',
  '......wbw.......',
  '.......b........',
  '......wbw.......',
  '.....kwbwk......',
  '.....kwwwk......',
  '......kkk.......',
  '................',
  '................',
  '................'
]

export const ARROW_SLIT = [
  '................',
  '................',
  '................',
  '.......kk.......',
  '......kook......',
  '......kook......',
  '......kook......',
  '....kkkookkk....',
  '....kooooook....',
  '....kkkookkk....',
  '......kook......',
  '......kook......',
  '......kmmk......',
  '.......kk.......',
  '................',
  '................'
]

export const CRACKS = [
  '................',
  '.........k......',
  '.........k......',
  '........kk......',
  '........k.......',
  '.......kk.......',
  '......kk.k......',
  '......k...k.....',
  '.....kk...kk....',
  '.....k.....k....',
  '....kk..........',
  '................',
  '..k.............',
  '..kk............',
  '...k............',
  '................'
]
