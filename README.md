# Dots

A full-screen animated dot-grid background with a floating control panel. Each
"pattern" is a different generative animation rendered to a single canvas
surface, tunable live from the panel.

## Patterns

- **Grid** — dense grid; each cell does a random-delay reveal, then perpetually
  size-shimmers between a min and a per-cell random max.
- **Wiggle** — sparse particles with two independent cycles (drift + twinkle) plus
  per-particle rate jitter, so the field never locks into a global rhythm.
- **Starfield** — seeded random star positions; each twinkles on its own cosine
  cycle from full to faded opacity and back (no motion).
- **Twist** — near-blank grid lit by a rotating Archimedean spiral vortex with
  uniform arc spacing; arms converge at a drifting centre.
- **Displace** — particles drift upward and fade in/out over their lifetime; the
  cursor (or touch) repels nearby ones, then friction settles them back.
- **Shimmer** — dense dot grid whose per-dot alpha is two summed sine waves: a
  global travelling wave plus a per-dot hashed pulse.
- **Organic** — flat dot grid lit by a curl-like vector field; a layered sine
  field whose crests sweep across the grid orthogonally to the field direction.
- **Aurora** — flat dot grid lit by a stacked-sine field; each dot tones up to
  the field intensity at its cell centre, for a soft, drifting glow.
- **Morph** — flat dot grid where a per-cell noise-like angle steers a moving
  phase wavefront, so the lit regions morph and snake across the grid.

The last three share one knob set (speed, brightness, dot size, density, scale,
vignette) — all multipliers, so the defaults reproduce each field's stock look.
