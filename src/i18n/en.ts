import type { UnitClass } from '../unit-types'
import type { SkillId } from '../skills'
import type { GameMode } from '../game-modes'

/**
 * English texts: the source of every key. `pt-br.ts` must have the same shape
 * (`Strings`). Texts in `[brackets]` are highlighted by the hint and the
 * tutorial balloon. HTML (`<b>`) only in `howTo` (rendered as markup).
 */

const s = (count: number) => count === 1 ? '' : 's'

export const en = {
  languageName: 'English',

  common: {
    back: 'Back',
    cancel: 'Cancel',
    confirm: 'Confirm',
    mainMenu: 'Main menu',
    blue: 'Blue',
    red: 'Red',
    player: 'Player',
    cpu: 'CPU',
    you: 'You',
    random: 'Random',
    pts: 'pts',
    vs: 'VS'
  },

  stats: {
    hp: 'HP',
    atk: 'ATK',
    def: 'DEF',
    rng: 'RNG',
    mov: 'MOV',
    mp: 'MP'
  },

  loader: {
    play: 'PLAY!'
  },

  rotate: {
    title: 'Rotate your device',
    text: 'PixelFantasyWar is played in landscape'
  },

  audio: {
    sound: 'Sound',
    fullscreen: 'Fullscreen',
    tipTitle: 'Play in fullscreen',
    tipBefore: 'Tap',
    tipShare: 'Share, then',
    tipAdd: 'Add to Home Screen',
    tipAfter: ', and open PixelWar from the new icon.',
    tipClose: 'Tap to close',
    music: 'Music',
    effects: 'Effects',
    mute: 'Mute all',
    unmute: 'Sound on'
  },

  title: {
    tagline: 'Turn-based tactics in the browser',
    play: 'Play',
    howToPlay: 'How to play',
    units: 'Units',
    credits: 'Credits',
    language: 'Language'
  },

  modes: {
    heading: 'Choose mode',
    newHere: 'New here?',
    cpuDifficulty: 'CPU difficulty',
    escBack: 'Esc back'
  },

  gameModes: {
    tutorial: { title: 'Learn to play', description: 'New here? A guided match teaches you the basics.', sides: ['You', 'CPU'] },
    online: { title: 'Online', description: 'Play or watch a friend on another device.', sides: ['You', 'Friend'] },
    p1vscpu: { title: 'Player vs CPU', description: 'Command the blue army against the computer.', sides: ['You', 'CPU'] },
    p1vsp2: { title: 'Player vs Player', description: 'Two players take turns on the same device.', sides: ['P1', 'P2'] },
    cpuvscpu: { title: 'CPU vs CPU', description: 'Sit back and watch two AI armies fight it out.', sides: ['CPU', 'CPU'] }
  } as Record<GameMode, { title: string, description: string, sides: [string, string] }>,

  difficulties: {
    easy: 'Easy',
    normal: 'Normal',
    hard: 'Hard'
  },

  maps: {
    'twin-keeps': { name: 'Twin Keeps', description: 'Two walled keeps face each other across an open field. Woods in the middle give cover, bridges cross the ponds.' },
    'river-isles': { name: 'River Isles', description: 'Armies start on small islands linked by narrow bridges. Hold the crossings and the central meadow.' },
    greenwood: { name: 'Greenwood', description: 'Open meadow with scattered groves and rocks for cover. A small pond with a bridge sits in the very center.' },
    'split-river': { name: 'Split River', description: 'A river cuts the field in two. Only three narrow bridges cross it, but archers and mages can shoot over the water.' },
    'crater-lake': { name: 'Crater Lake', description: 'A wide lake fills the middle, crossed by one long bridge. Rocky passes guard the shores to the north and south.' },
    'old-fortress': { name: 'Old Fortress', description: 'An abandoned fortress stands between the armies. Its doors are the only way in, and its pillared courtyard is the prize.' },
    'riverside-village': { name: 'Riverside Village', description: 'A village split by a river. Fight between houses and gardens, and hold the stone squares at both bridges.' },
    'ruined-temple': { name: 'Ruined Temple', description: 'Broken walls and pillars surround an old altar. Watchtowers on each meadow shelter the archers.' },
    'desert-oasis': { name: 'Desert Oasis', description: 'A sun-baked desert around a green oasis. The lake splits the field into two lanes, with only cacti and rocks for cover.' },
    'frozen-pass': { name: 'Frozen Pass', description: 'A snowfield between two green valleys. The frozen lake can be crossed on foot, but it is slow and slippery; snowy pines and rocks narrow the way around it.' },
    'hamlet-ford': { name: 'Hamlet Ford', description: 'Two farm hamlets on either side of a river. Two wooden bridges and a stone one are the only crossings.' },
    'fallen-citadel': { name: 'Fallen Citadel', description: 'The broken walls of a citadel guard twin altars. Breaches on every side let both armies in, and watchtowers flank each camp.' }
  } as Record<string, { name: string, description: string }>,

  mapSelect: {
    heading: 'Select map',
    mode: 'Mode:',
    maps: 'Maps',
    randomMap: 'Random map',
    anyOf: (n: number) => `Any of the ${n} maps`,
    randomText: (n: number) => `Let fate pick the battlefield. One of the ${n} maps is chosen when the match starts.`,
    mapCount: (n: number) => `${n} maps`,
    tiles: (w: number, h: number) => `${w}×${h} tiles`,
    units: (counts: string) => `${counts} units`,
    rounds: (n: number) => `${n} rounds max`,
    keys: '↑↓ choose · Enter start · Esc back',
    start: 'Start'
  },

  army: {
    heading: 'Build your army',
    playerLabel: (player: string, team: string) => `${player} (${team})`,
    playerN: (n: number) => `Player ${n}`,
    points: 'points',
    slotOf: (slot: number, total: number) => `Slot ${slot} of ${total}`,
    pickFor: (slot: number) => `Pick a class for slot ${slot}`,
    left: (n: number) => `${n} left`,
    moveHere: (slot: number) => `Move slot ${slot} here`,
    moveTo: (slot: number, x: number, y: number) => `Move slot ${slot} to ${x}, ${y}`,
    slotTitle: (slot: number, unit: string) => `Slot ${slot}: ${unit}`,
    empty: 'Empty',
    emptyLower: 'empty',
    remove: 'Remove',
    removeUnit: (unit: string) => `Remove ${unit}`,
    notEnough: 'Not enough points',
    pickForSlot: (slot: number) => `Pick for slot ${slot}`,
    fullHint: 'Pick a slot, then a class for it or a lit tile to move it',
    emptyHint: (n: number) => `${n} empty slot${s(n)} left to fill`,
    keys: ' · Del remove · Enter confirm · Esc back',
    removeAll: 'Remove all',
    classic: 'Classic army',
    saved: 'Saved armies',
    savedEmpty: 'No saved armies yet. Build one, name it and save it here.',
    load: 'Load',
    deleteArmy: (name: string) => `Delete ${name}`,
    armyName: 'Army name',
    defaultName: (n: number) => `Army ${n}`,
    saveCurrent: 'Save current',
    replace: 'Replace',
    savedFull: (max: number) => `Up to ${max} armies: delete one, or save with the name of one to replace it`,
    saveIncomplete: 'Fill every slot to save this army',
    wrongSize: (units: number, slots: number) => `${units} units: this map has ${slots} slots`,
    overBudget: 'Over the points budget',
    close: 'Close'
  },

  classes: {
    Archer: { name: 'Archer', role: 'Sniper', description: 'Longest range in the game (6 tiles). Picks off targets from far away, fragile up close.' },
    Mage: { name: 'Mage', role: 'Battle mage', description: 'Ranged caster, a bit faster than the Archer. Its Fireball also burns every enemy next to the target.' },
    Spearman: { name: 'Spearman', role: 'Line breaker', description: 'Hits two tiles away on open ground, safe from counterattacks. Pierce ignores armor and forest.' },
    Thief: { name: 'Thief', role: 'Skirmisher', description: 'Hard hitter that crosses rough terrain at full speed. Perfect for back attacks.' },
    Fighter: { name: 'Fighter', role: 'Melee', description: 'Solid all-rounder with good mobility.' },
    Cleric: { name: 'Cleric', role: 'Healer', description: 'The only healer: restores 6 HP to itself or an adjacent ally. Sturdy enough to stay on the front line.' },
    Barbarian: { name: 'Barbarian', role: 'Bruiser', description: 'Strong attacker with thick hide, but slow.' },
    Warrior: { name: 'Warrior', role: 'Tank', description: 'Highest HP and defense. Slow, built to block paths.' },
    Paladin: { name: 'Paladin', role: 'Guardian', description: 'Armored swordsman, almost as tough as a Barbarian and faster. Shield Wall also guards the allies next to it.' },
    Berserker: { name: 'Berserker', role: 'Glass cannon', description: 'The hardest hitter in the game. Light armor, so strike first.' },
    Assassin: { name: 'Assassin', role: 'Infiltrator', description: 'Fastest unit, crosses rough terrain freely. Deadly from behind, dies to a stiff breeze.' },
    Ranger: { name: 'Ranger', role: 'Woodland archer', description: 'Shorter range than the Archer, but stronger and swift through the woods. Pinning Shot stops the target from moving.' },
    Necromancer: { name: 'Necromancer', role: 'Dark mage', description: 'Dark magic that hits twice as hard as the Mage, at a shorter range. Drain heals it by the damage dealt.' },
    Halberdier: { name: 'Halberdier', role: 'Pike wall', description: 'Armored pikeman. Its reach of 2 works on any terrain, and Brace lets it counter from 2 tiles away.' }
  } as Record<UnitClass, { name: string, role: string, description: string }>,

  skills: {
    'skill-run': { name: 'Run', description: 'Double movement this turn. You can still attack.' },
    'skill-special-attack': { name: 'Special', description: 'Next attack is always critical.' },
    'skill-aimed-shot': { name: 'Aimed Shot', description: 'Next attack cannot miss and deals 3 extra damage.' },
    'skill-fireball': { name: 'Fireball', description: 'Next attack also burns the target and every enemy next to it for 2 damage, hit or miss.' },
    'skill-pierce': { name: 'Pierce', description: 'Next attack ignores the target\'s defense (armor and forest).' },
    'skill-steal': { name: 'Steal', description: 'Next attack also steals up to 2 MP from the target.' },
    'skill-second-wind': { name: 'Second Wind', description: 'Recover 6 HP.' },
    'skill-heal': { name: 'Heal', description: 'Restore 6 HP to itself or an adjacent ally.' },
    'skill-rage': { name: 'Rage', description: 'Next attack deals 5 extra damage if it hits.' },
    'skill-guard': { name: 'Guard', description: '+4 DEF until its next turn.' },
    'skill-shield-wall': { name: 'Shield Wall', description: 'It and adjacent allies get +2 DEF until its next turn.' },
    'skill-frenzy': { name: 'Frenzy', description: '+4 ATK and -1 DEF until its next turn.' },
    'skill-backstab': { name: 'Backstab', description: 'Next attack counts as a back attack: sure hit, double ATK, no counterattack.' },
    'skill-pinning-shot': { name: 'Pinning Shot', description: 'Next attack deals 2 extra damage if it hits, and the target cannot move on its next turn.' },
    'skill-drain': { name: 'Drain', description: 'Next attack deals 2 extra damage if it hits and heals it by the damage dealt.' },
    'skill-brace': { name: 'Brace', description: '+2 DEF and counterattacks up to 2 tiles away until its next turn.' }
  } as Record<SkillId, { name: string, description: string }>,

  traits: {
    pathfinder: { name: 'Pathfinder', description: 'Moves at full speed through forest.' },
    sureFooted: { name: 'Sure-footed', description: 'Moves at full speed over ice.' },
    overWater: { name: 'Over water', description: 'Can target enemies across water.' },
    counterattack: { name: 'Counterattack', description: 'Strikes back once when an adjacent enemy attacks it and it survives.' }
  },

  details: {
    range: 'Range:',
    passive: 'Passive',
    melee: 'Melee: adjacent tiles',
    rangeSlow: (range: number, slow: number) => `${range} tiles in the open, ${slow} over forest`,
    rangeAny: (range: number) => `${range} tiles on any terrain`
  },

  howTo: [
    { title: 'Goal', items: [
      'Defeat every enemy unit.',
      'If nobody wins in 50 rounds, the match is a draw.'
    ] },
    { title: 'Your turn', items: [
      'Click a unit and pick <b>Move</b>, <b>Attack</b>, <b>Skills</b> or <b>Wait</b>.',
      'Each unit can move once and attack once per turn, in any order.',
      '<b>Undo move</b> puts a unit back while it hasn\'t attacked.',
      'Press <b>End turn</b> at the top when you are done. The turn also ends when no unit can move or attack.'
    ] },
    { title: 'Combat', items: [
      'Hit if <b>ATK + d20</b> beats <b>DEF + 10</b>. Damage is <b>d6 + ATK − DEF</b>.',
      'Dice are rolled twice and the best roll counts.',
      'A natural 20 is a <b>critical</b>: 12 + ATK − DEF damage.',
      'A miss still deals 1 damage.',
      'Hit an enemy from <b>behind</b> to never miss and use double ATK.',
      '<b>Counterattack</b>: a melee unit that survives strikes back at a melee attacker, unless it was hit from behind.',
      'Attacks go in straight lines and stop at the first unit.',
      'Aim at an enemy to see the hit and kill chances before attacking.'
    ] },
    { title: 'Terrain', items: [
      'Open ground costs 1 move. Forest costs 2.',
      'Units in the <b>forest</b> get +2 DEF.',
      'Archers, mages, spearmen, rangers and necromancers pay 2 points of range per forest tile.',
      'Walls and trees block moves and attacks.',
      'Water blocks moves, but attacks fly over it.',
      '<b>Ice</b> costs 2 moves (thieves and assassins pay 1) and units on it get −2 DEF. Attacks cross it like open ground.',
      'Doors can be crossed, but block attacks. Units on a door can\'t attack or be attacked.'
    ] },
    { title: 'Skills', items: [
      '<b>Run</b> (2 MP): double movement this turn.',
      '<b>Special</b> (4 MP): the next attack is a critical hit.',
      'Every class also has a <b>skill of its own</b> (see Units): heal, guard, pierce armor, backstab...',
      'Every unit has 4 MP (never more). One skill per turn. MP comes back only in battle: +1 for each kill and +1 for each critical hit (the one forced by Special doesn\'t count).'
    ] },
    { title: 'Army', items: [
      'Before the match, pick a class for each starting slot of the map.',
      'Every class has a cost in points. Your army can spend up to <b>100</b>.',
      'Place your units anywhere on the lit tiles: the first <b>6 columns</b> from your edge. Pick a unit, then a lit tile.',
      '<b>Classic army</b> restores the units drawn in the map (exactly 100 points) and their positions.'
    ] },
    { title: 'Online', items: [
      'Type your name, then <b>create a room</b> or join one with its <b>code</b>. Open rooms are listed for everyone; <b>locked</b> rooms only take people with the code.',
      'Up to 8 people can <b>watch</b> a match, even one already going.',
      'Each turn has <b>5 minutes</b>. When time runs out the turn ends by itself.',
      'Leaving the match counts as a forfeit. Lost the connection? Reload the page to get back in.',
      '<b>Play on Wi-Fi</b>: the devices connect directly, and some mobile networks block that.'
    ] },
    { title: 'Controls', items: [
      '<b>Left click</b>: select and act.',
      '<b>Right click</b>: show a unit\'s movement range.',
      '<b>Middle click</b>: show a unit\'s attack range.',
      '<b>Click</b> an enemy (or a unit that already acted): its movement range; click again: its attack range.',
      '<b>Esc</b>: close the menu or cancel the action; with nothing to cancel, pause.',
      '<b>Pause</b> button (top center, or <b>P</b>): resume or leave the match for the main menu.',
      '<b>x1/x2/x3</b> button: game speed.',
      '<b>Eye</b> button (bottom left, or <b>H</b>): hide or show the top bars, the hint, the unit card and the combat log to see the whole map. The unit menu always shows.',
      '<b>Combat log</b> button (bottom right, or <b>L</b>): every attack of the match, with the damage, the odds it had, counterattacks and skill effects.',
      'Keyboard: <b>arrows</b> move the cursor, <b>Enter</b> acts, <b>Tab</b> jumps to the next unit, <b>R</b>/<b>F</b> show move/attack range, <b>E</b> ends the turn, <b>T</b> opens the online quick messages.'
    ] },
    { title: 'Controller', items: [
      'Xbox, PlayStation, Switch Pro and most USB/Bluetooth controllers work. Press any button to start using it; the hints then show its buttons.',
      '<b>D-pad</b> or <b>left stick</b>: move the cursor (in menus: move between buttons). <b>A</b> (✕): select and act. <b>B</b> (◯): cancel or go back.',
      '<b>Y</b> (△) / <b>X</b> (▢): movement / attack range. <b>LB</b>/<b>RB</b> (L1/R1): previous/next unit that can act.',
      '<b>LT</b>/<b>RT</b> (L2/R2): zoom. <b>Right stick</b>: move the camera (in menus: scroll).',
      '<b>Start</b> (Options): pause. <b>View</b>/<b>Select</b> (Share): end turn. <b>Left stick click</b>: hide the interface. <b>Right stick click</b>: online quick messages.',
      'Fullscreen and the first sound still need one tap or click (a browser rule).'
    ] },
    { title: 'Touch screen', items: [
      '<b>Tap</b> one of your units to open its menu.',
      'When moving or attacking, the first <b>tap</b> previews the path or the combat; <b>tap the same tile again</b> to confirm.',
      '<b>Tap</b> outside the highlighted tiles to cancel.',
      '<b>Tap</b> an enemy: its movement range; tap it again: its attack range.'
    ] }
  ],

  credits: {
    createdBy: 'Created by',
    aka: 'aka',
    source: 'Source code:',
    builtWith: 'Built with',
    and: 'and',
    soundBy: 'Sound effects by',
    with: 'with',
    font: 'Font NotJamSlabSerif11',
    musicBy: 'Music by'
  },

  hud: {
    timeLeft: 'Time left in this turn',
    say: 'Say...',
    sayTitle: 'Send a quick message (T, 1-9)',
    pause: 'Pause (P)',
    speed: 'Game speed',
    speedLocked: 'Game speed (fixed in the tutorial)',
    round: (n: number) => `Round ${n}`,
    watchingCount: (n: number) => `${n} watching`,
    peopleWatching: 'People watching',
    phase: (team: 'blue' | 'red') => `${team === 'blue' ? 'Blue' : 'Red'} phase`,
    watching: 'Watching',
    endTurn: 'End turn',
    endTurnTitle: 'End turn (E)',
    endTurnSure: (n: number) => `${n} left - sure?`
  },

  match: {
    turnOf: (name: string) => `${name}'s turn`,
    roundOf: (round: number, who: string) => `Round ${round} - ${who}`,
    playerN: (n: number) => `Player ${n}`,
    cpuN: (n: number) => `CPU ${n}`,
    withDifficulty: (label: string, difficulty: string) => `${label} (${difficulty})`,
    move: 'Move',
    attack: 'Attack',
    skills: 'Skills',
    undo: 'Undo move',
    wait: 'Wait',
    showInterface: 'Show interface (H)',
    hideInterface: 'Hide interface (H)',
    toggleInterface: 'Hide or show the interface',
    done: 'Done',
    moved: 'Moved',
    attacked: 'Attacked',
    skillReady: (skill: string) => `${skill} ready`,
    skillUsed: 'Skill used',
    forest: 'Forest DEF +2',
    ice: 'Ice DEF -2',
    braced: 'Braced',
    pinned: 'Pinned',
    waitingFor: (name: string) => `Waiting for ${name}...`,
    thinking: (team: string, who: string) => `${team} (${who}) is thinking...`,
    hintMenu: 'Choose an action · [Esc] close',
    hintMove: 'Click a highlighted tile to move · [Esc] cancel',
    hintAttack: 'Click an enemy in range to attack · [Esc] cancel',
    hintHeal: 'Click an ally to heal · [Esc] cancel',
    /** Idle hint, one part per command; a part goes away once the player used it */
    hintIdle: {
      select: '[Left click] select unit',
      moveRange: '[Right click] move range',
      attackRange: '[Middle click] attack range',
      nextUnit: '[Tab] next unit'
    },
    padEmotes: (a: string, b: string) => `${a} send · ${b} close`,
    padMenu: (a: string, b: string) => `${a} choose · ${b} close`,
    padMove: (a: string, b: string) => `${a} move here · ${b} cancel`,
    padAttack: (a: string, b: string) => `${a} attack · ${b} cancel`,
    padHeal: (a: string, b: string) => `${a} heal · ${b} cancel`,
    padIdle: {
      select: (a: string) => `${a} select`,
      moveRange: (y: string) => `${y} move range`,
      attackRange: (x: string) => `${x} attack range`,
      nextUnit: (lbrb: string) => `${lbrb} units`,
      endTurn: (select: string) => `${select} end turn`,
      pause: (start: string) => `${start} pause`
    },
    touchMenu: 'Choose an action · [tap outside] close',
    touchMove: '[Tap] a tile to preview, [tap again] to move · tap outside to cancel',
    touchAttack: '[Tap] an enemy to preview, [tap again] to attack · tap outside to cancel',
    touchHeal: '[Tap] an ally to preview, [tap again] to heal · tap outside to cancel',
    touchIdle: {
      select: '[Tap] your unit to act',
      inspect: '[Tap] other units to see their range (again: attack range)'
    }
  },

  card: {
    facing: (dir: string) => `facing ${dir}`,
    directions: { up: 'up', down: 'down', left: 'left', right: 'right' } as Record<'up' | 'down' | 'left' | 'right', string>,
    range: (note: string) => `Range: ${note}`,
    forecast: 'Attack forecast',
    hit: 'Hit',
    damage: 'Damage',
    kill: 'Kill',
    counterIfSurvives: 'Counterattack if it survives:',
    counterHit: (pct: string) => `${pct} hit`,
    counterDmg: (dmg: string) => `${dmg} dmg`,
    killsYou: (pct: string) => `${pct} kills you`,
    backAttack: 'Back attack: sure hit, double ATK',
    critical: 'Critical',
    skills: 'Skills (faded: not enough MP)',
    canPay: 'Enough MP to use it',
    cantPay: 'Not enough MP'
  },

  /** Combat log panel (bottom right of the match) */
  log: {
    title: 'Combat log',
    toggle: 'Show or hide the combat log (L)',
    empty: 'No attacks yet',
    round: (n: number) => `Round ${n}`,
    counter: 'Counter:',
    damage: (n: number) => `${n} dmg`,
    miss: (n: number) => `Miss, ${n} dmg`,
    critical: 'Critical!',
    back: 'Back attack',
    defeated: 'Defeated',
    burn: (n: number) => `burns ${n}`,
    heal: (n: number) => `heals ${n} HP`,
    steal: (n: number) => `steals ${n} MP from`,
    pinned: 'is pinned'
  },

  terrain: {
    names: { forest: 'Forest', door: 'Door', water: 'Water', ice: 'Ice' } as Record<'forest' | 'door' | 'water' | 'ice', string>,
    and: 'and',
    slowMove: (fast: string) => `Costs 2 movement. ${fast} pay 1`,
    defense: (change: string) => `${change} DEF to the unit standing here`,
    forestRange: (classes: string) => `${classes} pay 2 range points to shoot across it`,
    doorMove: 'Costs 2 movement',
    doorAttacks: 'Blocks attacks: a unit on a door can\'t attack or be attacked',
    waterMove: 'Can\'t be crossed',
    waterAttacks: 'Attacks fly over it',
    iceRange: 'Open ground for attacks: 1 range point for everyone'
  },

  floating: {
    critical: (n: number) => `Critical! ${n}`,
    backAttack: (n: number) => `Back attack! ${n}`,
    miss: (n: number) => `Miss ${n}`,
    counter: 'Counter! ',
    brace: 'Brace',
    pinned: 'Pinned'
  },

  banner: {
    skip: (touch: boolean) => `${touch ? 'tap' : 'click'} to skip`
  },

  gameOver: {
    playAgain: 'Play again',
    matchEnded: 'Match ended',
    outOfSync: 'The two games went out of sync',
    draw: 'Draw',
    turnLimit: (rounds: number) => `Turn limit reached after ${rounds} rounds`,
    noUnits: 'No units left',
    theOpponent: 'The opponent',
    leftMatch: (name: string) => `${name} left the match`,
    stoppedResponding: (name: string) => `${name} stopped responding`,
    roundSurvivors: (round: number, n: number) => `Round ${round} - ${n} unit${s(n)} left`,
    winsDash: (name: string, rest: string) => `${name} wins - ${rest}`,
    victory: 'Victory!',
    defeat: 'Defeat',
    wins: (name: string) => `${name} wins!`,
    damageDealt: 'Damage dealt',
    kills: 'Kills',
    unitsLost: 'Units lost',
    rounds: (n: number) => `${n} round${s(n)}`,
    mvp: 'MVP',
    bestCritical: 'Strongest critical',
    mvpDetail: (kills: number, damage: number) => `${kills} kill${s(kills)} · ${damage} damage`,
    damageDetail: (damage: number) => `${damage} damage`
  },

  pause: {
    title: 'Paused',
    resume: 'Resume',
    quitSure: 'Quit match - sure?',
    showEmotes: 'Show emotes',
    muteEmotes: 'Mute emotes',
    quitWarning: 'The match in progress will be lost.'
  },

  tutorialUi: {
    next: 'Next',
    nextTitle: 'Next (Enter)',
    skip: 'Skip tutorial',
    skipSure: 'Sure? Skip',
    playMatch: 'Play a match',
    complete: 'Tutorial complete!',
    completeText: 'Ready for a real match? Same map, same armies, no help this time.',
    broken: 'Something went wrong with the tutorial. Back to the menu...'
  },

  online: {
    heading: 'Online',
    rejectFull: 'The room is full.',
    rejectVersion: 'Your game versions differ. Reload the page (Ctrl+F5) and try again.',
    rejectKicked: 'You were removed from this room.',
    rejectClosed: 'The room was closed by its owner.',
    connectionClosed: 'The connection to the room was closed.',
    wifiTip: 'Online matches connect the devices directly, with no game server in the middle. Some mobile networks (4G/5G) and office networks block direct connections. If you can\'t connect, switch to Wi-Fi.',
    wifiTipTitle: 'Tip: play on Wi-Fi.',
    typeName: 'Type your name first.',
    badCode: 'Room codes have 5 letters and numbers.',
    yourName: 'Your name',
    namePlaceholder: 'Name',
    youWereIn: (code: string) => `You were in room ${code}.`,
    rejoin: 'Rejoin',
    createRoom: 'Create a room',
    locked: 'Locked: only with the code',
    open: 'Open: listed for everyone',
    createButton: 'Create room',
    joinWithCode: 'Join with a code',
    codePlaceholder: 'CODE',
    play: 'Play',
    watch: 'Watch',
    openRooms: 'Open rooms',
    refresh: 'Refresh',
    looking: 'Looking for rooms',
    noRooms: 'No open rooms right now. Create one!',
    waitingOpponent: 'Waiting for opponent',
    gettingReady: 'Getting ready',
    inMatch: (round: number) => `In match - round ${round}`,
    matchOver: 'Match over',
    ownersRoom: (owner: string) => `${owner}'s room`,
    watchingCount: (n: number) => `${n} watching`,
    couldntConnect: (code: string) => `Couldn't connect to room ${code}`,
    mayBeClosed: 'The room may be closed, or your network blocks direct connections.',
    tryAgain: 'Try again',
    connecting: (code: string) => `Connecting to room ${code}`,
    fewSeconds: 'This can take a few seconds.',
    disconnected: 'Disconnected',
    wantsRematch: 'Wants a rematch',
    playing: 'Playing',
    ready: 'Ready',
    choosingArmy: 'Choosing army',
    waitingForOpponent: (team: string) => `${team}: waiting for an opponent`,
    youTag: ' · you',
    ownerTag: ' · owner',
    kick: 'Kick',
    youSuffix: ' (you)',
    lockedRoom: 'Locked room',
    openRoom: 'Open room',
    roomCode: 'Room code',
    copied: 'Copied!',
    copy: 'Copy',
    lockedInfo: 'Locked: only people with the code can come in.',
    openInfo: 'Open: anyone can find this room in the list.',
    changeMap: 'Change map',
    mapUnits: (w: number, h: number, counts: string) => `${w}x${h} · ${counts} units`,
    players: 'Players',
    watchingTitle: (n: number, max: number) => `Watching (${n}/${max})`,
    nobody: 'Nobody yet.',
    ownerAway: 'The room owner lost the connection. Waiting for them to come back...',
    waitingRematch: 'Waiting for both players to ask for a rematch.',
    waitingOther: 'Waiting for the other player',
    leaveRoom: 'Leave room',
    rematch: 'Rematch',
    changeArmy: 'Change army',
    chooseArmy: 'Choose army',
    bothSeatsTaken: 'Both seats are taken: you are watching.',
    // in the match
    leaveWarning: 'You will leave the room.',
    forfeitWarning: 'You will forfeit the match.',
    stayInRoom: 'Stay in room',
    notResponding: (name: string) => `${name} is not responding`,
    notRespondingText: 'Their turn time ran out and nothing arrived.\nWait a bit longer, or leave and take the win.',
    wait: 'Wait',
    leave: 'Leave',
    waitingBack: (time: string) => `Waiting for them to come back... ${time}`,
    waitingBackWin: (time: string) => `Waiting for them to come back... ${time}\nIf they don't, you win.`,
    connectionLost: (name: string) => `Connection lost with ${name}`,
    leaveAndWin: 'Leave and win',
    removed: 'You were removed from the room.',
    leftRoom: (name: string) => `${name} left the room.`,
    waitingAccept: (name: string) => `Waiting for ${name} to accept...`
  },

  /** Online quick messages: the key is the id sent over the network */
  emotes: {
    'Nice!': 'Nice!',
    'Oops': 'Oops',
    'Good luck': 'Good luck',
    'GG': 'GG',
    'Hmm...': 'Hmm...',
    'Hurry up!': 'Hurry up!',
    'Too easy': 'Too easy',
    'Is that all?': 'Is that all?',
    'Watch your back': 'Watch your back',
    'Big brain': 'Big brain',
    'Lucky!': 'Lucky!',
    'Noooo!': 'Noooo!',
    'Run!': 'Run!',
    'Bring it on': 'Bring it on',
    'I meant that': 'I meant that',
    'Hahaha': 'Hahaha',
    'Wow': 'Wow',
    'Oh no': 'Oh no',
    'Hello?': 'Hello?',
    'Calculated': 'Calculated',
    'Sorry not sorry': 'Sorry not sorry',
    'EZ': 'EZ',
    'Skill issue': 'Skill issue',
    'Cry about it': 'Cry about it',
    'Uninstall': 'Uninstall',
    'Get rekt': 'Get rekt',
    'Too slow': 'Too slow',
    'Free kill': 'Free kill',
    'Was that a plan?': 'Was that a plan?',
    'Rage quit?': 'Rage quit?',
    'Nerf this!': 'Nerf this!',
    'Grandma plays better': 'Grandma plays better',
    'Read the rules': 'Read the rules'
  } as Record<string, string>,

  /** Tutorial balloons (tutorial/script.ts names them by key) */
  tutorial: {
    welcome: 'Welcome to PixelFantasyWar! You command the [Blue] army. Defeat every [Red] unit to win.',
    rounds: 'The armies take turns: first you act with your units, then the enemy acts with theirs. That is one round.',
    card: 'Select a unit and its card shows up at the top: HP, attack (ATK), defense (DEF), range and movement.',
    moveWarrior: 'Select your [Warrior], choose [Move] and pick the marked tile. The blue tiles show how far it can go.',
    barbarianDoor: 'Now move the [Barbarian] onto the [door].',
    doorBad: 'Entering a door costs 2 movement, and a unit standing on a door can\'t attack. Not a good spot!',
    undo: 'Select the Barbarian again and choose [Undo move]. A move can be undone until the unit attacks.',
    throughDoor: 'Walk the [Barbarian] through the door instead.',
    run: 'The [Archer] only moves 4 tiles. Open [Skills], choose [Run] to double its movement this turn, then pick the marked tile.',
    mp: 'Skills cost [MP]. Every unit starts with 4 MP, and only gets it back by fighting: +1 for each kill and +1 for each critical hit (up to 4). One skill per unit each turn.',
    wait: 'The [Spearman] stays home for now. Choose [Wait] to finish with it: it turns gray.',
    endTurnFirst: 'Press [End turn]. Units you didn\'t use simply stay where they are.',
    enemyTurn: 'Enemy turn! Watch the [Red] army charge.',
    pauseTip: 'Tip: [Esc] or the pause button pauses the game. Use the mouse wheel (or pinch) to zoom the map.',
    warriorForest: 'Move the [Warrior] into the [forest].',
    forest: 'Forest costs 2 movement and gives [+2 DEF] to whoever stands in it: a good spot to hold the line. Water can\'t be crossed, but arrows and magic fly over it.',
    thiefRun: 'The [Thief] crosses forest at full speed. Use [Run] to bring it to the marked tile.',
    archerMarked: 'Move the [Archer] to the marked tile.',
    fire: 'Choose [Attack] and point at the red [Cleric]: the forecast shows the hit chance and the damage. Archers shoot in a straight line, up to 6 tiles. Fire!',
    miss: 'A miss! The dice decide every attack, but even a miss deals [1 damage].',
    protect: 'Move the [Barbarian] in front of the Archer to protect it.',
    cleric: 'Bring the [Cleric] out through the lower door.',
    mage: 'And the [Mage].',
    endTurn: 'Press [End turn].',
    hereTheyCome: 'Here they come!',
    counter: 'Your [Barbarian] strikes back! Melee units (range 1) counterattack when they survive.',
    critical: 'Ouch, a [critical hit]! Rolling a 20 deals 12 + ATK − DEF. Your Warrior survives and hits back.',
    facing: 'Units face where they last moved or attacked. Hitting an enemy from [behind] always hits, deals double ATK and can\'t be countered.',
    thiefBehind: 'The red [Fighter] is facing your Barbarian. Move the [Thief] behind it.',
    attackBehind: 'Attack it from behind!',
    barbarianMage: 'Move the [Barbarian] next to the red [Mage].',
    special: 'Open [Skills] and choose [Special] (4 MP): the next attack is always a critical hit. Attack the Mage!',
    guard: 'The red [Thief] is next to your Warrior. Open the Warrior\'s [Skills] and choose [Guard]: +4 DEF until your next turn.',
    clericWarrior: 'Move the [Cleric] next to the Warrior.',
    heal: 'Open [Skills], choose [Heal] and pick the Warrior: it gets back 6 HP.',
    aimedShot: 'Every class has a skill of its own. The Archer\'s [Aimed Shot] can\'t miss and deals 3 extra damage. Use it on the red [Cleric].',
    mageMarked: 'Move the [Mage] to the marked tile.',
    fireball: 'The Mage\'s [Fireball] also burns the target and every enemy next to it. Aim at the red [Barbarian]!',
    guardPays: 'Guard pays off: the attack misses, and your Warrior\'s counterattack finishes the Thief.',
    rage: 'The red Barbarian\'s [Rage] takes down your Mage. Keep fragile units behind your front line!',
    lostMage: 'You lost the Mage, but Red has already lost three units. Finish them!',
    finishCleric: 'Your [Barbarian] can finish the wounded red [Cleric].',
    thiefWarrior: 'Move the [Thief] behind the red [Warrior].',
    backAttack: 'Back attack!',
    archerWarrior: 'Move the [Archer] next to the red Warrior.',
    shoot: 'Shoot it!',
    luck: 'A 20 on the die: [critical hit]! Luck can be on your side too.',
    clericBehind: 'The red [Barbarian] has its back to you. Move the [Cleric] behind it.',
    spearmanRun: 'The [Spearman] joins the fight. Use [Run] to reach the marked tile.',
    reach: 'Spearmen hit [2 tiles] away, so melee units can\'t strike back. Finish the Barbarian!',
    careful: 'Careful: your [Cleric] has its back to the enemy. Facing matters for you too!',
    twoLeft: 'Only two enemies left!',
    thiefArcher: 'Move the [Thief] behind the red [Archer].',
    spearmanNext: 'Move the [Spearman] next to the red Spearman.',
    pierce: 'The Spearman\'s [Pierce] ignores defense. End the battle!',
    victory: '[Victory!] You know the basics now: move, attack from good angles, use the terrain and spend MP wisely.'
  }
}

export type Strings = typeof en
export type TutorialTextKey = keyof Strings['tutorial']
