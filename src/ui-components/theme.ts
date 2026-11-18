import { css } from 'lit'

/**
 * Shared look of the in-game UI: dark translucent pixel panels, thick light
 * borders and hard black shadows (same language as the start screen).
 *
 * Sizes are written in "world pixels" with `--u`, so the UI scales with the
 * canvas: `--s` (page px per world px) is set by GameUI on the overlay root.
 */
export const theme = css`
  :host {
    /*
     * --u: layout unit = 1 world px at 1920x1080, times --ui-scale.
     * --t: text unit = --u times --text-scale. Use it for every font-size.
     * GameUI and the start screen set --s, --ui-scale and --text-scale.
     */
    --u: calc(var(--s, 1) * var(--ui-scale, 1) * 1px);
    --t: calc(var(--u) * var(--text-scale, 1));
    --ink: #f4f1e8;
    --muted: #9ea3b8;
    --panel: rgba(14, 16, 26, 0.92);
    --panel-solid: #0e101a;
    --edge: #f4f1e8;
    --shadow: #000;
    --blue: #3d7bff;
    --blue-dark: #16307a;
    --red: #ff4d4d;
    --red-dark: #7a1616;
    --hp: #4ee06a;
    --hp-mid: #ffd23f;
    --hp-low: #ff4d4d;
    --mp: #4cc9f0;
    --gold: #ffd23f;
    --orange: #ff8c42;
    /* neutral accent for panels that don't belong to a team */
    --team: #343a52;
    --team-dark: #1c2030;

    font-family: 'notjamslab14', monospace;
    color: var(--ink);
    -webkit-font-smoothing: none;
    image-rendering: pixelated;
    user-select: none;
  }

  /* keyboard hints are noise on touch screens */
  @media (hover: none) and (pointer: coarse) {
    .keys-only { display: none !important; }
  }

  .team-blue { --team: var(--blue); --team-dark: var(--blue-dark); }
  .team-red { --team: var(--red); --team-dark: var(--red-dark); }

  .panel {
    background: var(--panel);
    border: calc(3 * var(--u)) solid var(--edge);
    box-shadow: calc(5 * var(--u)) calc(5 * var(--u)) 0 var(--shadow);
  }

  .panel-title {
    display: flex;
    align-items: center;
    gap: calc(8 * var(--u));
    padding: calc(6 * var(--u)) calc(10 * var(--u));
    background: var(--team);
    color: #fff;
    text-shadow: calc(2 * var(--u)) calc(2 * var(--u)) 0 #000;
    border-bottom: calc(3 * var(--u)) solid var(--edge);
    font-size: calc(22 * var(--t));
    line-height: 1;
  }

  .muted { color: var(--muted); }

  /* Segmented pixel bar: <div class="bar hp"><i style="width: 60%"></i></div> */
  .bar {
    position: relative;
    height: calc(12 * var(--u));
    background: #000;
    border: calc(2 * var(--u)) solid #000;
    box-shadow: 0 0 0 calc(2 * var(--u)) var(--edge);
    overflow: hidden;
  }
  .bar > i {
    position: absolute;
    inset: 0 auto 0 0;
    background: var(--fill, var(--hp));
    transition: width 250ms steps(6);
  }
  .bar > i.ghost {
    background: #fff;
    animation: ghost 700ms steps(2) infinite;
  }
  .bar::after {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(90deg, transparent 0 calc(7 * var(--u)), rgba(0, 0, 0, 0.55) calc(7 * var(--u)) calc(9 * var(--u)));
    pointer-events: none;
  }
  .bar.hp { --fill: var(--hp); }
  .bar.hp.mid { --fill: var(--hp-mid); }
  .bar.hp.low { --fill: var(--hp-low); }
  .bar.mp { --fill: var(--mp); }

  @keyframes ghost {
    50% { opacity: 0.25; }
  }

  .btn {
    all: unset;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: calc(8 * var(--u));
    padding: calc(7 * var(--u)) calc(12 * var(--u));
    font-size: calc(20 * var(--t));
    line-height: 1;
    color: var(--ink);
    cursor: pointer;
    background: transparent;
  }
  .btn:hover:not(:disabled),
  .btn:focus-visible:not(:disabled) {
    background: var(--team);
    color: #fff;
    text-shadow: calc(2 * var(--u)) calc(2 * var(--u)) 0 #000;
  }
  .btn:active:not(:disabled) {
    filter: brightness(1.25);
  }
  .btn:disabled {
    color: #555a6e;
    cursor: default;
  }

  .btn-solid {
    justify-content: center;
    background: var(--team);
    color: #fff;
    border: calc(3 * var(--u)) solid var(--edge);
    box-shadow: calc(4 * var(--u)) calc(4 * var(--u)) 0 #000;
    text-shadow: calc(2 * var(--u)) calc(2 * var(--u)) 0 #000;
  }
  .btn-solid:hover:not(:disabled) {
    filter: brightness(1.15);
  }
  .btn-solid:active:not(:disabled) {
    transform: translate(calc(2 * var(--u)), calc(2 * var(--u)));
    box-shadow: calc(2 * var(--u)) calc(2 * var(--u)) 0 #000;
  }

  .chip {
    display: inline-block;
    padding: calc(2 * var(--u)) calc(6 * var(--u));
    font-size: calc(14 * var(--t));
    line-height: 1.2;
    border: calc(2 * var(--u)) solid currentColor;
  }
`
