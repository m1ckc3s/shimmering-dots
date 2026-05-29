import * as React from "react"
import { cn } from "@/lib/utils"

// Patterns:
//   original  — verbatim port of the lab playground. Random-delay reveal
//               + perpetual size shimmer on a dense grid.
//   wiggle    — sparse white particles with two independent animation
//               cycles (drift + twinkle). Port of StarrySkyView.swift.
//   starfield — port of MicksStars.tsx (Framer). Seeded random
//               positions, per-star duration twinkle from 1 to faded
//               opacity and back. No motion — pure cosine pulse.
//   twist      — near-blank grid lit by a rotating Archimedean spiral vortex
//               (uniform arc spacing). Arms converge at a 2D-drifting centre;
//               Zoom dollies the whole structure, Twist sets the arm count.

export const PATTERNS = ["original", "wiggle", "starfield", "twist"] as const
export type Pattern = (typeof PATTERNS)[number]

export type OriginalParams = {
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

export const ORIGINAL_DEFAULTS: OriginalParams = {
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

// ─── Pattern: original ──────────────────────────────────────────────

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

// ─── Component ──────────────────────────────────────────────────────

const ORIGINAL_COLORS = "#2a2a2a,#3b3b3b,#525252"

type Props = {
  pattern: Pattern
  pixelOpacity: number
  original: OriginalParams
  wiggle: WiggleParams
  starfield: StarfieldParams
  twist: TwistParams
  className?: string
  children?: React.ReactNode
}

export function PixelBackground({
  pattern,
  pixelOpacity,
  original,
  wiggle,
  starfield,
  twist,
  className,
  children,
}: Props) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const pixelsRef = React.useRef<Pixel[]>([])
  const particlesRef = React.useRef<Particle[]>([])
  const cellsRef = React.useRef<GridCell[]>([])
  const starsRef = React.useRef<Star[]>([])
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
  wiggleLiveRef.current.sizeMin = wiggle.sizeMin
  wiggleLiveRef.current.sizeMax = wiggle.sizeMax
  wiggleLiveRef.current.drift = wiggle.drift
  wiggleLiveRef.current.speed = wiggle.speed
  wiggleLiveRef.current.twinkle = wiggle.twinkle

  const twistLiveRef = React.useRef(twist)
  twistLiveRef.current = twist
  const starfieldLiveRef = React.useRef(starfield)
  starfieldLiveRef.current = starfield

  const liveRef = React.useRef({ pattern })
  liveRef.current = { pattern }

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

    if (pattern === "original") {
      const gapInt = Math.max(1, Math.floor(original.gap))
      const colorsArray = ORIGINAL_COLORS.split(",")
      const pxs: Pixel[] = []
      const effSpeed = getEffectiveSpeed(original.speed, reducedMotionRef.current)
      const diag = Math.sqrt(width * width + height * height)
      const sz = Math.max(1, original.dotSize)
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
    } else {
      // starfield — stars are generated in the dedicated effect above;
      // init just resets the canvas dims.
      pixelsRef.current = []
      particlesRef.current = []
      cellsRef.current = []
    }
  }, [
    pattern,
    original.gap,
    original.dotSize,
    original.speed,
    wiggle.count,
    twist.gap,
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

      if (pat === "original") {
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

      if (pat === "original") {
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

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden isolate", className)}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full pointer-events-none"
        style={{ opacity: pixelOpacity }}
      />
      {children ? <div className="relative z-[1]">{children}</div> : null}
    </div>
  )
}
