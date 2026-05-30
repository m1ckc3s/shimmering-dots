import * as React from "react"
import { cn } from "@/lib/utils"

// Patterns:
//   grid      — random-delay reveal + perpetual size shimmer on a dense
//               grid of dark dots.
//   wiggle    — sparse white particles with two independent animation
//               cycles (drift + twinkle). Port of StarrySkyView.swift.
//   starfield — port of MicksStars.tsx (Framer). Seeded random
//               positions, per-star duration twinkle from 1 to faded
//               opacity and back. No motion — pure cosine pulse.
//   twist      — near-blank grid lit by a rotating Archimedean spiral vortex
//               (uniform arc spacing). Arms converge at a 2D-drifting centre;
//               Zoom dollies the whole structure, Twist sets the arm count.
//   displace  — particles drift upward and fade in/out over their lifetime;
//               moving the cursor (or a touch) repels nearby ones with a
//               quadratic falloff, then friction settles them back into the
//               rise. Ported from an iOS onboarding `floatingParticles` modifier.
//   shimmer   — dense dot grid whose per-dot alpha is driven by overlapping
//               sine waves: a global travelling wave plus a per-dot pulse with
//               a hashed phase/frequency, so the field shimmers without locking
//               into one rhythm. Ported from a SwiftUI `DotPatternView`.

export const PATTERNS = ["grid", "wiggle", "starfield", "twist", "displace", "shimmer"] as const
export type Pattern = (typeof PATTERNS)[number]

export type GridParams = {
  gap: number
  dotSize: number
  speed: number
}

export type WiggleParams = {
  count: number
  sizeMin: number
  sizeMax: number
  speed: number
  twinkle: number
  drift: number
}

export type StarfieldParams = {
  quantity: number
  seed: number
  sizeMin: number
  sizeMax: number
  durationMin: number
  durationMax: number
  fadedOpacity: number
}

export type TwistParams = {
  gap: number
  dotSize: number
  peak: number
  zoom: number
  twist: number
  arms: number
  spin: number
  drift: number
  width: number
  floor: number
}

export type ShimmerParams = {
  spacing: number // dot grid pitch, px (structural)
  dotSize: number
  shimmerSpeed: number // per-dot pulse rate
  dxFactor: number // global wave spatial frequency, x
  dyFactor: number // global wave spatial frequency, y
  baseAlpha: number // floor opacity every dot keeps
  alphaMultiplier: number // how far the shimmer swings above the floor
}

export type DisplaceParams = {
  count: number // max particles alive at once
  emission: number // spawns per second
  sizeMin: number
  sizeMax: number
  speedMin: number // upward speed, px/s
  speedMax: number
  lifetime: number // seconds (with internal ±15% jitter)
  drift: number // horizontal wander amplitude, px/s
  forceRadius: number // pointer influence radius, px
  forceStrength: number // pointer push strength
  friction: number // per-frame velocity retention at 60fps (0–1)
}

export const GRID_DEFAULTS: GridParams = {
  gap: 25,
  dotSize: 3.5,
  speed: 49,
}

export const WIGGLE_DEFAULTS: WiggleParams = {
  count: 340,
  sizeMin: 0.5,
  sizeMax: 1.2,
  speed: 1.0,
  twinkle: 3.45,
  drift: 20,
}

export const STARFIELD_DEFAULTS: StarfieldParams = {
  quantity: 255,
  seed: 12345,
  sizeMin: 0.2,
  sizeMax: 1.5,
  durationMin: 1000,
  durationMax: 6000,
  fadedOpacity: 0.1,
}

export const TWIST_DEFAULTS: TwistParams = {
  gap: 13,
  dotSize: 1.5,
  peak: 1,
  zoom: 60,
  twist: 1.5,
  arms: 2,
  spin: 0.42,
  drift: 270,
  width: 6,
  floor: 0,
}

// Values carried over from the SwiftUI DotPatternView defaults.
export const SHIMMER_DEFAULTS: ShimmerParams = {
  spacing: 18,
  dotSize: 3,
  shimmerSpeed: 2.0,
  dxFactor: 0.25,
  dyFactor: 0.21,
  baseAlpha: 0.2,
  alphaMultiplier: 3.0,
}

export const DISPLACE_DEFAULTS: DisplaceParams = {
  count: 260,
  emission: 20,
  sizeMin: 1.0,
  sizeMax: 3.3,
  speedMin: 35,
  speedMax: 65,
  lifetime: 11.0,
  drift: 10,
  forceRadius: 120,
  forceStrength: 470,
  friction: 0.92,
}

// ─── Pattern: grid ──────────────────────────────────────────────────

class Pixel {
  width: number
  height: number
  ctx: CanvasRenderingContext2D
  x: number
  y: number
  color: string
  speed: number
  size: number
  sizeStep: number
  minSize: number
  maxSizeInteger: number
  maxSize: number
  delay: number
  counter: number
  counterStep: number
  isIdle: boolean
  isReverse: boolean
  isShimmer: boolean

  constructor(
    width: number,
    height: number,
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
    speed: number,
    delay: number,
    dotSize: number,
  ) {
    this.width = width
    this.height = height
    this.ctx = context
    this.x = x
    this.y = y
    this.color = color
    this.speed = this.getRandomValue(0.1, 0.9) * speed
    this.size = 0
    this.sizeStep = Math.random() * 0.4
    this.minSize = 0.5
    this.maxSizeInteger = dotSize
    this.maxSize = this.getRandomValue(this.minSize, this.maxSizeInteger)
    this.delay = delay
    this.counter = 0
    this.counterStep = Math.random() * 4 + (this.width + this.height) * 0.01
    this.isIdle = false
    this.isReverse = false
    this.isShimmer = false
  }

  getRandomValue(min: number, max: number) {
    return Math.random() * (max - min) + min
  }

  draw() {
    const centerOffset = this.maxSizeInteger * 0.5 - this.size * 0.5
    this.ctx.fillStyle = this.color
    this.ctx.fillRect(
      this.x + centerOffset,
      this.y + centerOffset,
      this.size,
      this.size,
    )
  }

  appear() {
    this.isIdle = false
    if (this.counter <= this.delay) {
      this.counter += this.counterStep
      return
    }
    if (this.size >= this.maxSize) this.isShimmer = true
    if (this.isShimmer) this.shimmer()
    else this.size += this.sizeStep
    this.draw()
  }

  shimmer() {
    if (this.size >= this.maxSize) this.isReverse = true
    else if (this.size <= this.minSize) this.isReverse = false
    if (this.isReverse) this.size -= this.speed
    else this.size += this.speed
  }
}

function getEffectiveSpeed(value: number, reducedMotion: boolean) {
  const min = 0
  const max = 100
  const throttle = 0.001
  if (value <= min || reducedMotion) return min
  if (value >= max) return max * throttle
  return value * throttle
}

// ─── Pattern: wiggle ────────────────────────────────────────────────
// Two independent cycles per particle (drift + twinkle) so neighbors
// don't lock into a global rhythm.

const easeInOut = (t: number) => t * t * (3 - 2 * t)

type WiggleLive = {
  sizeMin: number
  sizeMax: number
  drift: number
  speed: number
  twinkle: number
}

class Particle {
  ctx: CanvasRenderingContext2D
  baseX: number
  baseY: number
  sizeT: number
  personalDriftRate: number
  personalTwinkleRate: number
  live: WiggleLive

  curX: number
  curY: number
  driftFromX: number
  driftFromY: number
  driftToX: number
  driftToY: number
  driftState: "animating" | "waiting"
  driftElapsed: number
  driftDuration: number

  curOpacity: number
  curScale: number
  twkFromOp: number
  twkToOp: number
  twkFromScale: number
  twkToScale: number
  twkState: "animating" | "waiting"
  twkElapsed: number
  twkDuration: number

  constructor(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    live: WiggleLive,
  ) {
    this.ctx = ctx
    this.live = live
    this.baseX = Math.random() * width
    this.baseY = Math.random() * height
    this.sizeT = Math.random()
    this.personalDriftRate = 0.5 + Math.random()
    this.personalTwinkleRate = 0.5 + Math.random()

    this.curX = this.baseX
    this.curY = this.baseY
    this.driftFromX = this.curX
    this.driftFromY = this.curY
    this.driftToX = this.baseX + this.randDrift()
    this.driftToY = this.baseY + this.randDrift()
    this.driftState = Math.random() < 0.75 ? "animating" : "waiting"
    this.driftDuration = this.pickDriftDuration()
    this.driftElapsed = Math.random() * this.driftDuration

    this.curOpacity = Math.random()
    this.curScale = 0.1 + Math.random() * 1.9
    this.twkFromOp = this.curOpacity
    this.twkFromScale = this.curScale
    this.twkToOp = Math.random()
    this.twkToScale = 0.1 + Math.random() * 1.9
    this.twkState = Math.random() < 0.75 ? "animating" : "waiting"
    this.twkDuration = this.pickTwkDuration()
    this.twkElapsed = Math.random() * this.twkDuration
  }

  private randDrift() {
    return (Math.random() * 2 - 1) * this.live.drift
  }

  private pickDriftDuration() {
    const rate = Math.max(0.05, this.live.speed) * this.personalDriftRate
    return (1200 + Math.random() * 2400) / rate
  }

  private pickTwkDuration() {
    const rate = Math.max(0.05, this.live.twinkle) * this.personalTwinkleRate
    return (600 + Math.random() * 1600) / rate
  }

  tick(dt: number) {
    this.driftElapsed += dt
    if (this.driftState === "waiting") {
      if (this.driftElapsed >= this.driftDuration) {
        this.driftState = "animating"
        this.driftElapsed = 0
        this.driftFromX = this.curX
        this.driftFromY = this.curY
        this.driftToX = this.baseX + this.randDrift()
        this.driftToY = this.baseY + this.randDrift()
        this.driftDuration = this.pickDriftDuration()
      }
    } else {
      const t = Math.min(this.driftElapsed / this.driftDuration, 1)
      const e = easeInOut(t)
      this.curX = this.driftFromX + (this.driftToX - this.driftFromX) * e
      this.curY = this.driftFromY + (this.driftToY - this.driftFromY) * e
      if (this.driftElapsed >= this.driftDuration) {
        this.driftState = "waiting"
        this.driftElapsed = 0
        this.driftDuration = this.pickDriftDuration() * 0.5
      }
    }

    this.twkElapsed += dt
    if (this.twkState === "waiting") {
      if (this.twkElapsed >= this.twkDuration) {
        this.twkState = "animating"
        this.twkElapsed = 0
        this.twkFromOp = this.curOpacity
        this.twkFromScale = this.curScale
        this.twkToOp = Math.random()
        this.twkToScale = 0.1 + Math.random() * 1.9
        this.twkDuration = this.pickTwkDuration()
      }
    } else {
      const t = Math.min(this.twkElapsed / this.twkDuration, 1)
      const e = easeInOut(t)
      this.curOpacity = this.twkFromOp + (this.twkToOp - this.twkFromOp) * e
      this.curScale = this.twkFromScale + (this.twkToScale - this.twkFromScale) * e
      if (this.twkElapsed >= this.twkDuration) {
        this.twkState = "waiting"
        this.twkElapsed = 0
        this.twkDuration = this.pickTwkDuration() * 0.4
      }
    }
  }

  draw() {
    if (this.curOpacity <= 0.005) return
    const baseSize =
      this.live.sizeMin +
      this.sizeT * Math.max(0, this.live.sizeMax - this.live.sizeMin)
    const radius = baseSize * this.curScale
    if (radius <= 0.05) return
    this.ctx.fillStyle = `rgba(255,255,255,${this.curOpacity})`
    this.ctx.beginPath()
    this.ctx.arc(this.curX, this.curY, radius, 0, Math.PI * 2)
    this.ctx.fill()
  }
}

// ─── Pattern: starfield (Framer port) ───────────────────────────────
// Positions stored as percentages so window resize doesn't shuffle the
// field — only seed/quantity changes regenerate. Each star twinkles on
// its own cycle: opacity = faded + (1-faded) * (cos(2π·t/duration + φ)
// * 0.5 + 0.5). Matches the CSS keyframe 0/50/100 = end/mid/end.

function mulberry32(seed: number) {
  let a = seed | 0
  return function () {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type Star = {
  xPct: number
  yPct: number
  sizeT: number
  durationT: number
  phase: number
}

function renderStarfield(
  ctx: CanvasRenderingContext2D,
  stars: Star[],
  p: StarfieldParams,
  width: number,
  height: number,
  t: number,
) {
  const sizeRange = Math.max(0, p.sizeMax - p.sizeMin)
  const durMin = Math.max(50, p.durationMin)
  const durRange = Math.max(0, p.durationMax - durMin)
  const faded = p.fadedOpacity
  const opacitySpan = 1 - faded
  for (let i = 0; i < stars.length; i++) {
    const s = stars[i]
    const size = p.sizeMin + s.sizeT * sizeRange
    const duration = durMin + s.durationT * durRange
    const phase = (2 * Math.PI * 1000 * t) / duration + s.phase
    const cyc = Math.cos(phase) * 0.5 + 0.5
    const opacity = faded + opacitySpan * cyc
    if (opacity < 0.01) continue
    // Framer original applied transform: scale(1.5); preserve that.
    const radius = (size * 1.5) / 2
    if (radius < 0.05) continue
    ctx.fillStyle = `rgba(255,255,255,${opacity})`
    ctx.beginPath()
    ctx.arc(s.xPct * width, s.yPct * height, radius, 0, Math.PI * 2)
    ctx.fill()
  }
}

// ─── Pattern: twist ──────────────────────────────────────────────────

type GridCell = { x: number; y: number }
const TWIST_RGB = "220,220,220"

function renderTwist(
  ctx: CanvasRenderingContext2D,
  cells: GridCell[],
  p: TwistParams,
  width: number,
  height: number,
  t: number,
) {
  const half = p.dotSize / 2
  const twist = p.twist
  const arms = Math.max(1, Math.round(p.arms))
  const width2 = Math.max(0.3, p.width)
  const peak = p.peak
  const floor = p.floor
  const span = peak - floor

  const ref = Math.min(width, height) * 0.5
  const zoom = Math.max(0.3, p.zoom)
  // Organic 2D drift: the vortex centre wanders on a non-repeating path
  // (sum of incommensurate sines per axis) instead of sliding left/right.
  const cx =
    width / 2 +
    p.drift * (0.62 * Math.sin(t * 0.11) + 0.38 * Math.sin(t * 0.041 + 2.1))
  const cy =
    height / 2 +
    p.drift * (0.62 * Math.sin(t * 0.09 + 1.7) + 0.38 * Math.sin(t * 0.034 + 0.5))
  // Rotating the whole spiral over time = the vortex spinning.
  const spin = t * p.spin
  // Zoom = a true camera dolly: the envelope and the arc spacing both scale
  // with it, so the whole structure magnifies uniformly against the fixed
  // screen frame. (Calibrated so zoom≈20.5 ≈ the old ref*1.15.)
  const spread = ref * 0.056 * zoom
  // Archimedean spiral: the radial spacing between arms (`pitch`) is CONSTANT
  // with radius — every arc is the same width apart, unlike a log/Fibonacci
  // spiral whose spacing explodes outward. `twist` sets how many arms fit in
  // the bright band (≈ spread / pitch); arc thickness stays uniform too.
  const pitch = spread / Math.max(0.5, twist)
  const TAU = Math.PI * 2
  // Small smoothstep fade at the very centre so the arms meet at a clean point.
  const coreR = pitch * 0.35

  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i]
    const dx = cell.x - cx
    const dy = cell.y - cy
    const r = Math.sqrt(dx * dx + dy * dy)
    const theta = Math.atan2(dy, dx)
    const wv = Math.cos((TAU * r) / pitch - arms * theta - spin)
    const crest = Math.pow(Math.max(0, wv), width2)
    // Bright at the centre, fading toward the edges; smoothstep fade of the
    // tiny core so the arms meet at a clean convergence point.
    const rr = r / spread
    const k = Math.min(1, r / coreR)
    const coreFade = k * k * (3 - 2 * k)
    const env = Math.exp(-rr * rr) * coreFade
    const alpha = floor + span * crest * env
    if (alpha < 0.01) continue
    ctx.fillStyle = `rgba(${TWIST_RGB},${alpha})`
    ctx.beginPath()
    ctx.arc(cell.x, cell.y, half, 0, Math.PI * 2)
    ctx.fill()
  }
}

// ─── Pattern: shimmer ────────────────────────────────────────────────
// A dot grid whose per-dot alpha is the sum of two sine sources: a global
// travelling wave (dxFactor/dyFactor set its spatial frequency across the
// grid) and a per-dot pulse with a hashed phase and frequency. Blended and
// rectified into an opacity that swings from `baseAlpha` up by `alphaMultiplier`.

type ShimmerCell = {
  x: number
  y: number
  col: number
  row: number
  phase: number // 0–2π, hashed per cell
  freq: number // 0.7–1.7, hashed per cell
}
const SHIMMER_RGB = "160,160,160"

function renderShimmer(
  ctx: CanvasRenderingContext2D,
  cells: ShimmerCell[],
  p: ShimmerParams,
  t: number,
) {
  const half = Math.max(0.5, p.dotSize) / 2
  const speed = p.shimmerSpeed
  const dxF = p.dxFactor
  const dyF = p.dyFactor
  const base = p.baseAlpha
  const mult = p.alphaMultiplier
  const wave1 = t * 0.6
  const wave2 = t * 0.4
  for (let i = 0; i < cells.length; i++) {
    const c = cells[i]
    const baseWave =
      Math.sin(wave1 + c.col * dxF) + Math.cos(wave2 + c.row * dyF)
    const pulse = Math.sin(t * speed * c.freq + c.phase)
    const blended = (pulse + baseWave) / 4
    const alpha = base + mult * Math.abs(blended)
    if (alpha < 0.01) continue
    ctx.fillStyle = `rgba(${SHIMMER_RGB},${alpha < 1 ? alpha : 1})`
    ctx.beginPath()
    ctx.arc(c.x, c.y, half, 0, Math.PI * 2)
    ctx.fill()
  }
}

// ─── Pattern: displace ────────────────────────────────────────────────
// Upward-drifting particles with a pointer-repulsion force field. Each
// particle rises at its own speed, wanders horizontally, and fades in →
// peak → out across its lifetime. A pointer press/drag deposits short-lived
// TouchForces; nearby particles are pushed away (quadratic falloff inside a
// radius) and friction bleeds that velocity off so they rejoin the rise.

type Floater = {
  x: number
  y: number
  sizeT: number // 0–1 lerp across [sizeMin, sizeMax]
  speedT: number // 0–1 lerp across [speedMin, speedMax]
  driftDir: number // −1..1 horizontal drift scale
  vx: number // interactive velocity (from pointer forces)
  vy: number
  birth: number // seconds
  lifetime: number // seconds
  peak: number // peak opacity
}

type TouchForce = { x: number; y: number; t: number } // t in seconds

const FLOAT_DECAY = 0.3 // seconds a pointer force stays active
const FLOAT_FADE_IN = 0.5 // seconds
const FLOAT_FADE_OUT = 1.0 // seconds
const FLOAT_SPAWN_LO = 0.3 // spawn band, as a fraction of view height
const FLOAT_SPAWN_HI = 1.05

function spawnFloater(
  width: number,
  height: number,
  p: DisplaceParams,
  now: number,
  ageOffset = 0,
): Floater {
  const frac = FLOAT_SPAWN_LO + Math.random() * (FLOAT_SPAWN_HI - FLOAT_SPAWN_LO)
  const jitter = 1 + (Math.random() * 2 - 1) * 0.15
  return {
    x: Math.random() * width,
    y: height * frac,
    sizeT: Math.random(),
    speedT: Math.random(),
    driftDir: Math.random() * 2 - 1,
    vx: 0,
    vy: 0,
    birth: now - ageOffset,
    lifetime: Math.max(0.5, p.lifetime * jitter),
    peak: 0.9,
  }
}

// Physics step + cull + emission. Mutates `floaters` in place (compacting the
// array) and reads everything else from the live params, so slider edits apply
// without a reinit.
function updateFloaters(
  floaters: Floater[],
  forces: TouchForce[],
  p: DisplaceParams,
  width: number,
  height: number,
  now: number,
  dt: number,
) {
  // Make friction framerate-independent: the source applied it once per 60fps
  // frame, so raise it to (dt·60) to match across refresh rates.
  const frictionPow = Math.pow(p.friction, dt * 60)
  const speedSpan = Math.max(0, p.speedMax - p.speedMin)

  let w = 0
  for (let i = 0; i < floaters.length; i++) {
    const f = floaters[i]

    // Pointer repulsion — push away from each active force, quadratic falloff.
    for (let j = 0; j < forces.length; j++) {
      const force = forces[j]
      const dx = f.x - force.x
      const dy = f.y - force.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < p.forceRadius && dist > 0) {
        const factor = 1 - dist / p.forceRadius
        const strength = p.forceStrength * factor * factor
        f.vx += (dx / dist) * strength * dt
        f.vy += (dy / dist) * strength * dt
      }
    }

    // Friction, then integrate the interactive velocity.
    f.vx *= frictionPow
    f.vy *= frictionPow
    f.x += f.vx * dt
    f.y += f.vy * dt

    // Constant upward rise + gentle horizontal wander.
    f.y -= (p.speedMin + f.speedT * speedSpan) * dt
    f.x += f.driftDir * p.drift * dt

    const age = now - f.birth
    if (age > f.lifetime || f.y < -10) continue // cull
    floaters[w++] = f
  }
  floaters.length = w

  // Emit up to the live cap. Whole spawns this frame plus a fractional chance.
  const cap = Math.max(0, Math.floor(p.count))
  let toEmit = p.emission * dt
  while (toEmit >= 1 && floaters.length < cap) {
    floaters.push(spawnFloater(width, height, p, now))
    toEmit -= 1
  }
  if (floaters.length < cap && Math.random() < toEmit) {
    floaters.push(spawnFloater(width, height, p, now))
  }
}

function drawFloaters(
  ctx: CanvasRenderingContext2D,
  floaters: Floater[],
  p: DisplaceParams,
  now: number,
) {
  const sizeSpan = Math.max(0, p.sizeMax - p.sizeMin)
  for (let i = 0; i < floaters.length; i++) {
    const f = floaters[i]
    const age = now - f.birth
    if (age < 0 || age > f.lifetime) continue
    let opacity: number
    if (age < FLOAT_FADE_IN) {
      opacity = (age / FLOAT_FADE_IN) * f.peak
    } else if (age > f.lifetime - FLOAT_FADE_OUT) {
      opacity = Math.max(0, ((f.lifetime - age) / FLOAT_FADE_OUT) * f.peak)
    } else {
      opacity = f.peak
    }
    if (opacity <= 0.01) continue
    const radius = (p.sizeMin + f.sizeT * sizeSpan) / 2
    if (radius <= 0.05) continue
    ctx.fillStyle = `rgba(255,255,255,${opacity})`
    ctx.beginPath()
    ctx.arc(f.x, f.y, radius, 0, Math.PI * 2)
    ctx.fill()
  }
}

// ─── Component ──────────────────────────────────────────────────────

const GRID_COLORS = "#2a2a2a,#3b3b3b,#525252"

type Props = {
  pattern: Pattern
  pixelOpacity: number
  grid: GridParams
  wiggle: WiggleParams
  starfield: StarfieldParams
  twist: TwistParams
  displace: DisplaceParams
  shimmer: ShimmerParams
  className?: string
  children?: React.ReactNode
}

export function PixelBackground({
  pattern,
  pixelOpacity,
  grid,
  wiggle,
  starfield,
  twist,
  displace,
  shimmer,
  className,
  children,
}: Props) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const pixelsRef = React.useRef<Pixel[]>([])
  const particlesRef = React.useRef<Particle[]>([])
  const cellsRef = React.useRef<GridCell[]>([])
  const starsRef = React.useRef<Star[]>([])
  const floatersRef = React.useRef<Floater[]>([])
  const touchForcesRef = React.useRef<TouchForce[]>([])
  const shimmerCellsRef = React.useRef<ShimmerCell[]>([])
  const dimsRef = React.useRef({ w: 0, h: 0 })
  const animationRef = React.useRef<number | null>(null)
  const lastFrameRef = React.useRef(0)
  const reducedMotionRef = React.useRef(false)

  const wiggleLiveRef = React.useRef<WiggleLive>({
    sizeMin: wiggle.sizeMin,
    sizeMax: wiggle.sizeMax,
    drift: wiggle.drift,
    speed: wiggle.speed,
    twinkle: wiggle.twinkle,
  })
  const twistLiveRef = React.useRef(twist)
  const starfieldLiveRef = React.useRef(starfield)
  const displaceLiveRef = React.useRef(displace)
  const shimmerLiveRef = React.useRef(shimmer)
  const liveRef = React.useRef({ pattern })

  // Push the latest slider values into the mutable refs the RAF loop reads.
  // Done after commit (not during render) so we never mutate refs mid-render.
  // No dep array on purpose: this must run on every commit, and it stays
  // before the init effect so a pattern switch is visible to the loop in sync
  // with the reinit.
  React.useEffect(() => {
    wiggleLiveRef.current.sizeMin = wiggle.sizeMin
    wiggleLiveRef.current.sizeMax = wiggle.sizeMax
    wiggleLiveRef.current.drift = wiggle.drift
    wiggleLiveRef.current.speed = wiggle.speed
    wiggleLiveRef.current.twinkle = wiggle.twinkle
    twistLiveRef.current = twist
    starfieldLiveRef.current = starfield
    displaceLiveRef.current = displace
    shimmerLiveRef.current = shimmer
    liveRef.current = { pattern }
  })

  React.useEffect(() => {
    reducedMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches
    lastFrameRef.current = performance.now()
  }, [])

  // Starfield star generation — independent of resize. Only regenerate
  // when seed or quantity changes; size/duration/faded read live.
  React.useEffect(() => {
    if (pattern !== "starfield") return
    const rng = mulberry32(starfield.seed)
    const stars: Star[] = []
    const n = Math.max(0, Math.floor(starfield.quantity))
    for (let i = 0; i < n; i++) {
      stars.push({
        xPct: rng(),
        yPct: rng(),
        sizeT: rng(),
        durationT: rng(),
        phase: rng() * Math.PI * 2,
      })
    }
    starsRef.current = stars
  }, [pattern, starfield.seed, starfield.quantity])

  const init = React.useCallback(() => {
    if (!containerRef.current || !canvasRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const width = Math.floor(rect.width)
    const height = Math.floor(rect.height)
    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvasRef.current.width = width * dpr
    canvasRef.current.height = height * dpr
    canvasRef.current.style.width = `${width}px`
    canvasRef.current.style.height = `${height}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    dimsRef.current = { w: width, h: height }
    // displace-only state — cleared here so a pattern switch or resize starts clean.
    floatersRef.current = []
    touchForcesRef.current = []

    if (pattern === "grid") {
      const gapInt = Math.max(1, Math.floor(grid.gap))
      const colorsArray = GRID_COLORS.split(",")
      const pxs: Pixel[] = []
      const effSpeed = getEffectiveSpeed(grid.speed, reducedMotionRef.current)
      const diag = Math.sqrt(width * width + height * height)
      const sz = Math.max(1, grid.dotSize)
      for (let x = 0; x < width; x += gapInt) {
        for (let y = 0; y < height; y += gapInt) {
          const color =
            colorsArray[Math.floor(Math.random() * colorsArray.length)]
          const delay = reducedMotionRef.current
            ? 0
            : Math.random() * diag * 0.5
          pxs.push(
            new Pixel(width, height, ctx, x, y, color, effSpeed, delay, sz),
          )
        }
      }
      pixelsRef.current = pxs
      particlesRef.current = []
      cellsRef.current = []
    } else if (pattern === "wiggle") {
      const particles: Particle[] = []
      const n = Math.max(0, Math.floor(wiggle.count))
      for (let i = 0; i < n; i++) {
        particles.push(new Particle(ctx, width, height, wiggleLiveRef.current))
      }
      particlesRef.current = particles
      pixelsRef.current = []
      cellsRef.current = []
    } else if (pattern === "twist") {
      const gapInt = Math.max(1, Math.floor(twist.gap))
      const cells: GridCell[] = []
      for (let x = gapInt / 2; x < width; x += gapInt) {
        for (let y = gapInt / 2; y < height; y += gapInt) {
          cells.push({ x, y })
        }
      }
      cellsRef.current = cells
      pixelsRef.current = []
      particlesRef.current = []
    } else if (pattern === "displace") {
      // Pre-warm with a spread of ages so the field isn't empty on entry.
      const p = displaceLiveRef.current
      const cap = Math.max(0, Math.floor(p.count))
      const seedN = Math.min(cap, 40)
      const now = performance.now() / 1000
      const seed: Floater[] = []
      for (let i = 0; i < seedN; i++) {
        seed.push(spawnFloater(width, height, p, now, Math.random() * 2))
      }
      floatersRef.current = seed
      pixelsRef.current = []
      particlesRef.current = []
      cellsRef.current = []
    } else if (pattern === "shimmer") {
      const sp = Math.max(1, shimmer.spacing)
      const cols = Math.floor(width / sp) + 2
      const rows = Math.floor(height / sp) + 2
      const cells: ShimmerCell[] = []
      for (let row = 0; row <= rows; row++) {
        for (let col = 0; col <= cols; col++) {
          // Hash row/col into a stable per-dot phase + frequency (32-bit
          // wrapping multiply, matching the Swift &* hash).
          const hash = (Math.imul(row, 73856093) ^ Math.imul(col, 19349663)) >>> 0
          const phase = ((hash & 0xff) / 255) * Math.PI * 2
          const freq = 0.7 + ((hash >>> 8) & 0xff) / 255
          cells.push({ x: col * sp, y: row * sp, col, row, phase, freq })
        }
      }
      shimmerCellsRef.current = cells
      pixelsRef.current = []
      particlesRef.current = []
      cellsRef.current = []
    } else {
      // starfield — stars are generated in the dedicated effect above;
      // init just resets the canvas dims.
      pixelsRef.current = []
      particlesRef.current = []
      cellsRef.current = []
    }
  }, [
    pattern,
    grid.gap,
    grid.dotSize,
    grid.speed,
    wiggle.count,
    twist.gap,
    shimmer.spacing,
  ])

  React.useEffect(() => {
    init()
    const observer = new ResizeObserver(() => init())
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [init])

  React.useEffect(() => {
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate)

      const now = performance.now()
      const dt = now - lastFrameRef.current
      const pat = liveRef.current.pattern

      // grid and shimmer are both dense per-cell loops; cap them at ~60fps so a
      // high-refresh display doesn't double the draw cost. grid needs it for
      // correctness (its size step is per-frame); shimmer is absolute-time
      // driven, so throttling only skips redundant frames — the look is identical.
      if (pat === "grid" || pat === "shimmer") {
        const timeInterval = 1000 / 60
        if (dt < timeInterval) return
        lastFrameRef.current = now - (dt % timeInterval)
      } else {
        lastFrameRef.current = now
      }

      const canvas = canvasRef.current
      const ctx = canvas?.getContext("2d")
      if (!ctx || !canvas) return

      const dpr = window.devicePixelRatio || 1
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr)

      if (pat === "grid") {
        const pixels = pixelsRef.current
        for (let i = 0; i < pixels.length; i++) pixels[i].appear()
      } else if (pat === "wiggle") {
        const particles = particlesRef.current
        const safeDt = Math.min(dt, 64)
        for (let i = 0; i < particles.length; i++) {
          particles[i].tick(safeDt)
          particles[i].draw()
        }
      } else if (pat === "starfield") {
        const { w, h } = dimsRef.current
        renderStarfield(
          ctx,
          starsRef.current,
          starfieldLiveRef.current,
          w,
          h,
          now / 1000,
        )
      } else if (pat === "twist") {
        const { w, h } = dimsRef.current
        renderTwist(
          ctx,
          cellsRef.current,
          twistLiveRef.current,
          w,
          h,
          now / 1000,
        )
      } else if (pat === "displace") {
        const { w, h } = dimsRef.current
        const nowSec = now / 1000
        const dtSec = Math.min(dt, 64) / 1000
        const p = displaceLiveRef.current
        // Drop pointer forces older than the decay window (compact in place).
        const forces = touchForcesRef.current
        let fw = 0
        for (let i = 0; i < forces.length; i++) {
          if (nowSec - forces[i].t < FLOAT_DECAY) forces[fw++] = forces[i]
        }
        forces.length = fw
        updateFloaters(floatersRef.current, forces, p, w, h, nowSec, dtSec)
        drawFloaters(ctx, floatersRef.current, p, nowSec)
      } else if (pat === "shimmer") {
        renderShimmer(
          ctx,
          shimmerCellsRef.current,
          shimmerLiveRef.current,
          now / 1000,
        )
      }
    }

    lastFrameRef.current = performance.now()
    animationRef.current = requestAnimationFrame(animate)
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // Record a pointer position as a transient repulsion force. Only wired up
  // for the displace pattern (the canvas is otherwise pointer-transparent).
  const addTouchForce = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    touchForcesRef.current.push({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      t: performance.now() / 1000,
    })
  }

  const interactive = pattern === "displace"

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden isolate", className)}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{
          opacity: pixelOpacity,
          pointerEvents: interactive ? "auto" : "none",
          touchAction: interactive ? "none" : undefined,
        }}
        onPointerDown={interactive ? addTouchForce : undefined}
        onPointerMove={interactive ? addTouchForce : undefined}
      />
      {children ? <div className="relative z-[1]">{children}</div> : null}
    </div>
  )
}
