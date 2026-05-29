# Dots

A full-screen animated dot-grid background with a floating control panel. The
app is a single canvas surface; each "pattern" is a different generative
animation rendered to it, tunable live from the panel in the bottom-right.

Work here is design-driven. Defaults encode visual choices that were dialed in
by hand — change them only when asked.

## Stack

- Vite + React 19 + TypeScript
- Tailwind v4 (`@tailwindcss/vite`)
- Canvas 2D + `requestAnimationFrame` for all rendering
- `clsx` + `tailwind-merge` (`cn` helper in `@/lib/utils`)

No component framework (controls are hand-rolled) and no animation libraries —
per-pixel canvas work is the right tool, and adding a toolkit has never been the
bottleneck.

## Commands

```bash
pnpm dev      # dev server on :3000
pnpm build    # tsc -b && vite build
pnpm lint     # eslint .
pnpm preview  # serve the production build
```

## Architecture

Three files do everything:

- [src/App.tsx](src/App.tsx) — holds one state object per pattern (`original`,
  `wiggle`, `starfield`, `twist`) plus the active `pattern` and global
  `opacity`. Switching patterns preserves each pattern's params.
- [src/components/PixelBackground.tsx](src/components/PixelBackground.tsx) —
  pattern type defs, exported defaults, per-pattern render logic, and the canvas
  component (DPR-aware sizing, init, and the RAF loop). Types and defaults are
  exported from here; Controls imports them.
- [src/components/Controls.tsx](src/components/Controls.tsx) — the panel:
  per-pattern sub-components, the `Slider` and `RangeSlider` (dual-thumb)
  primitives, and Reset.

### Adding a pattern

1. Append the name to `PATTERNS` in PixelBackground.
2. Define `XParams` + `X_DEFAULTS` (exported).
3. Write a render function (or a class, like `Pixel`/`Particle` for stateful
   patterns).
4. Branch on it in the `init` callback (structural setup) and in the animate
   loop.
5. Add an `XControls` sub-component in Controls.
6. Add state in App.tsx and wire the props through.

## Patterns

### `original`
Dense grid; each cell does a random-delay reveal then perpetually
size-shimmers between `minSize` and a per-cell random `maxSize`. Palette is dark
grays (`#2a2a2a,#3b3b3b,#525252`) on the `#070707` page — deliberately subtle.
Params: `gap`, `dotSize`, `speed` (0–100, mapped through a 0.001 throttle).

### `wiggle`
Sparse particles with two independent per-particle cycles — drift (position) and
twinkle (opacity + scale) — plus per-particle rate jitter (0.5–1.5×) so the
field never locks into a global rhythm. Random positions; `count` drives
density.
Params: `count`, `sizeMin`/`sizeMax`, `speed`, `twinkle`, `drift`.

### `starfield`
Seeded random positions (inline mulberry32, no dependency). Each star has its
own cosine twinkle from full opacity to `fadedOpacity` and back — no motion.
Positions are stored as percentages so a window resize doesn't reshuffle the
field; only `seed`/`quantity` regenerate it.
Params: `quantity`, `seed`, `sizeMin`/`sizeMax`, `durationMin`/`durationMax`
(seconds), `fadedOpacity`.

### `twist`
A near-blank grid lit by a rotating Archimedean spiral vortex. Per cell, with
`r`/`theta` measured from a drifting centre:

```
wv    = cos(2π·r/pitch − arms·θ − spin)
crest = max(0, wv) ^ width
env   = exp(−(r/spread)²) · smoothstep(r/coreR)
alpha = floor + (peak − floor)·crest·env
```

- **Archimedean, not logarithmic.** The phase is linear in `r`, so arc spacing
  (`pitch`) and arc thickness are uniform across the whole field. A log/Fibonacci
  spiral's spacing explodes outward, which no slider could correct.
- `spread = ref·0.056·zoom` where `ref = min(w,h)/2`. **Zoom is a true camera
  dolly** — it scales the brightness envelope and the arc spacing together, so
  the whole structure magnifies against the fixed frame. (On a self-similar
  spiral, scaling `r` alone is only a rotation, so zoom must move the envelope.)
- `pitch = spread / twist` — `twist` sets how many arms fall inside the bright
  band.
- Centre drifts on a non-repeating 2D path (sum of incommensurate sines per
  axis), not left/right.
- A smoothstep core fade (`coreR = pitch·0.35`) makes the arms meet at a clean
  point.

Params: `gap`, `dotSize`, `peak`, `zoom`, `twist`, `arms`, `spin`, `drift`,
`width`, `floor`.

## Conventions

- **Live params vs. structural params.** Slider edits flow into the running
  animation by reference through a mutable ref per pattern (`twistLiveRef`,
  etc.), so drags stay smooth. Only structural params (`gap`, `count`, `seed`)
  are in the `init` dependency array and trigger a full reinit.
- **`original` is throttled to ~60fps.** Its size math is per-frame, not
  dt-scaled. `lastFrameRef` must advance only on rendered frames, or the
  throttle starves the loop on high-refresh displays. Other patterns are
  dt-scaled (or use absolute time) and run every RAF.
- Time source for periodic patterns is `performance.now() / 1000`; absolute time
  is fine because the functions are periodic.
- Canvas is DPR-aware: the backing store is sized to `devicePixelRatio` and the
  context scaled to match.
- Page background is `#070707`. Don't change it without reason.

## Workflow

- **Verify visual changes without screenshots.** Use canvas pixel sampling via
  the Claude Preview MCP (`preview_eval` against `getImageData`) — lit-pixel
  counts, radial brightness profiles, centroid drift. After a visual change, end
  with "Done. Let me know how it looks." and wait for feedback.
- Conventional commits: `feat` / `fix` / `chore` / `refactor` / `style`.
  Branches: `<type>/kebab-case-description`.
- No AI attribution or `Co-Authored-By` in commits or PRs.
- `gh` is at `/opt/homebrew/bin/gh` (not on the default PATH).
