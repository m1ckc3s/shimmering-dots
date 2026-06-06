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

- [src/App.tsx](src/App.tsx) — holds one state object per pattern (`grid`,
  `wiggle`, `starfield`, `twist`, `displace`, `shimmer`, `organic`, `aurora`,
  `morph`, `meteors`), the active `pattern`,
  and a per-pattern `opacity` map (`OPACITY_DEFAULTS`). Switching patterns
  preserves each pattern's params and its own opacity.
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

### `grid`
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

### `displace`
Upward-drifting particles that fade in → peak → out over their lifetime. The
canvas becomes interactive only for this pattern (`pointerEvents: auto`,
`touchAction: none`); a pointer press/drag deposits short-lived forces that
repel nearby particles with a quadratic falloff, then framerate-independent
friction (`pow(friction, dt·60)`) settles them back into the rise. Ported from
an iOS onboarding `floatingParticles` view modifier.
Params: `count`, `emission`, `sizeMin`/`sizeMax`, `speedMin`/`speedMax`,
`lifetime`, `drift`, `forceRadius`, `forceStrength`, `friction`.

### `shimmer`
Dot grid whose per-dot alpha is two summed sine sources:

```
baseWave = sin(t·0.6 + col·dxFactor) + cos(t·0.4 + row·dyFactor)
pulse    = sin(t·shimmerSpeed·freq + phase)
alpha    = baseAlpha + alphaMultiplier·|(pulse + baseWave)/4|
```

`baseWave` is a global travelling wave; `pulse` is a per-dot pulse with a hashed
phase/`freq` (`Math.imul`, matching Swift's `&*`), so the field never locks into
one rhythm. Cells are built in `init` from `spacing` (structural); everything
else is live. Ported from a SwiftUI `DotPatternView`.
Params: `spacing`, `dotSize`, `shimmerSpeed`, `dxFactor`, `dyFactor`,
`baseAlpha`, `alphaMultiplier`.

### `organic`, `aurora`, `morph`

Three flat (non-perspective) dot grids lit by a procedural field, sharing one
knob set (`FieldParams`: `speed`, `brightness`, `dotSize`, `density`, `scale`,
`vignette`). Each is a per-cell evaluation of a field: `buildFieldCells` tiles a
normalised space centred on the canvas and scaled by height
(`u = (px−w/2)/h`, `v = (py−h/2)/h`), then each frame computes a 0–1 intensity
per cell and draws a small white dot at that alpha over the page background (the
field is otherwise dark). Every knob is a multiplier on the field's built-in
constants, so all-1 defaults reproduce each field's stock look. `density` is
structural (sets the cell pitch, `base/density`, where `base` is
`ORGANIC_GRID`/`AURORA_GRID`/`MORPH_GRID`); the rest are live. `brightness`
folds into the dot's grey value; `vignette` darkens toward the edges. All three
are absolute-time driven and throttled to ~60fps.

- **`organic`** — layered sine field whose crests (`sin(n·6 + …)`) sweep as
  wavefronts orthogonal to a curl-like flow; a `0.10` base keeps a faint static
  grid visible.
- **`aurora`** — stacked-sine field (`pow(·, 2.5)`), no base term, so only the
  lit regions show — a soft, drifting glow.
- **`morph`** — a per-cell noise-like angle steers a moving phase wavefront
  (`pow(·, 4)`), so brightness morphs and snakes across the grid; `0.10` base.

### `meteors`
A calm meteor shower ported from a motion-based component. `count` independent
capsules (round-capped strokes) all travel the same direction (`angle`, degrees).
Each loops: streak → burn out → idle for `delay` (±30% jitter) → respawn, so they
stagger. The non-obvious parts:

- **Never reaches the far edge.** Each meteor picks a burn-out distance `reach`
  from the Lifespan range — a fraction of the screen span along the travel axis,
  capped ≤0.95 — and fully fades by then, so it always dies before the downstream
  edge.
- **Burn-out is a uniform opacity fade, not a length shrink.** The capsule glides
  at constant velocity and full length; burn-out scales the whole
  head-bright→tail-transparent gradient toward 0. Because the tail is already
  faint, a uniform fade reads as the head burning out. (Geometric shrink was tried
  both ways — anchoring the head makes the tail rush in; anchoring the tail makes
  the head stall. Both look wrong. Do not reintroduce a length-shrink.)
- Travel basis is fixed at spawn (`meteorAxis` projects the canvas corners onto
  the direction), so a live `angle` change only applies on the next ignition.
- `showStarfield` draws the `starfield` field (with `STARFIELD_DEFAULTS`) behind
  the shower; stars regenerate whenever the pattern is `meteors` or `starfield`.

Params: `count` (structural), `angle`, `showStarfield`, `speed` (px/s),
`lifeMin`/`lifeMax` (Lifespan, fraction of span), `fadeSpeed` (Fade Out Speed,
higher = quicker), `length`, `width`, `delay` (s).

## Conventions

- **Live params vs. structural params.** Slider edits flow into the running
  animation by reference through a mutable ref per pattern (`twistLiveRef`,
  etc.), so drags stay smooth. Only structural params (`gap`, `count`, `seed`)
  are in the `init` dependency array and trigger a full reinit. The effect that
  copies the latest props into the `*LiveRef`s runs on **every commit with no
  dependency array** (so live edits reach the RAF loop) — don't add a dep array.
- **`grid`, `shimmer`, `organic`, `aurora`, and `morph` are throttled to
  ~60fps.** `grid` needs it for correctness — its size math is per-frame, not
  dt-scaled. The others are dense per-cell loops but absolute-time driven, so
  throttling only skips redundant frames on high-refresh displays — the look is
  identical, the draw cost halves.
  `lastFrameRef` must advance only on rendered frames, or the throttle starves
  the loop on high-refresh displays. The remaining patterns are dt-scaled (or
  use absolute time) and run every RAF.
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
