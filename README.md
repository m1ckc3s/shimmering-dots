# Shimmering Dots

A growing collection of full-screen, canvas-based particle animations for the
web — each one tunable live from a floating control panel until it looks exactly
the way you want.

<img width="1000" height="670" alt="Screen Recording 2026-05-29 at 7 03 31 PM (1)" src="https://github.com/user-attachments/assets/97b40a00-3732-4787-bfe5-3926286c1c9b" />

It is **not an npm package.** There's no install step and no version to track.
You copy the two source files into your project, dial in the look with the
sliders, lock the values in, and ship. Think of it as a cookbook of generative
backgrounds you own outright, not a dependency you pull in.

New patterns get added over time. Today there are six.

## Patterns

| Pattern | Look |
| --- | --- |
| `grid` | Dense grid of dark dots that reveal on a random delay, then perpetually size-shimmer. Deliberately subtle. |
| `wiggle` | Sparse particles drifting and twinkling on independent per-particle rhythms, so the field never locks into a single beat. |
| `starfield` | Seeded, motionless star grid where each star pulses through its own fade cycle. Stable across window resizes. |
| `twist` | A near-blank grid lit by a rotating Archimedean spiral vortex. Zoom is a true camera dolly; Twist sets the arm count. |
| `displace` | Particles drift upward and fade across their lifetime; moving the cursor (or a touch) repels nearby ones, then friction settles them back into the rise. The only interactive pattern. |
| `shimmer` | Dot grid whose per-dot opacity rides overlapping sine waves — a global travelling wave plus a hashed per-dot pulse — so it shimmers without locking into one rhythm. |

Every pattern renders to a single `<canvas>` via plain Canvas 2D +
`requestAnimationFrame`. No WebGL, no animation libraries.

## Try it locally

```bash
pnpm install
pnpm dev        # http://localhost:3000
```

Switch patterns and drag the sliders in the bottom-right panel. Collapse the
panel with the **×** for an unobstructed view; reopen it with the **Controls**
pill.

Other scripts:

```bash
pnpm build      # tsc -b && vite build
pnpm preview    # serve the production build
pnpm lint       # eslint .
```

## Using it in your own project

1. **Copy two files** into your app:
   - `src/components/PixelBackground.tsx` — the canvas component, pattern types,
     defaults, and render logic.
   - `src/components/Controls.tsx` — the tuning panel (optional; drop it once
     you've locked your values).

   `PixelBackground` uses a `cn()` helper (`clsx` + `tailwind-merge`). Either
   copy `src/lib/utils.ts` too, or swap the `cn(...)` calls for a plain template
   string — it's only used for class composition.

2. **Render it** behind your content:

   ```tsx
   import { PixelBackground, TWIST_DEFAULTS } from "@/components/PixelBackground"

   export default function Page() {
     return (
       <div className="relative min-h-screen bg-[#070707]">
         <PixelBackground
           pattern="twist"
           pixelOpacity={0.65}
           twist={TWIST_DEFAULTS}
           className="absolute inset-0"
         />
         {/* your content */}
       </div>
     )
   }
   ```

3. **Tune it, then lock it in.** Keep `Controls` mounted while you experiment.
   Once a pattern looks right, freeze those numbers as your defaults. The
   fastest way: hand the values to your AI coding assistant and ask it to *"set
   these as the `*_DEFAULTS` in `PixelBackground.tsx` and remove the control
   panel."* You ship a fixed, dependency-light background — no sliders, no extra
   state.

### Requirements

- React 19 (works with 18 with no changes)
- Tailwind v4 for the panel's utility classes (the canvas itself needs none)
- A dark page background — these are designed against `#070707`

## Adding a pattern

1. Append the name to `PATTERNS` in `PixelBackground.tsx`.
2. Define `XParams` + `X_DEFAULTS` (exported).
3. Write a render function (or a stateful class, like `Pixel` / `Particle`).
4. Branch on it in the `init` callback and the animate loop.
5. Add an `XControls` sub-component in `Controls.tsx`.
6. Add state and wire the props through `App.tsx`.

## Stack

Vite · React 19 · TypeScript · Tailwind v4 · Canvas 2D. No component or
animation frameworks — per-pixel canvas work is the right tool, and the controls
are hand-rolled.
