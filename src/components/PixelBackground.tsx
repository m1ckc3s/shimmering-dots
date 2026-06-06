import * as React from "react"
import { cn } from "@/lib/utils"

export const PATTERNS = [
  "grid",
  "wiggle",
  "starfield",
  "twist",
  "displace",
  "shimmer",
  "organic",
  "aurora",
  "morph",
  "meteors",
] as const
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
  spacing: number
  dotSize: number
  shimmerSpeed: number
  dxFactor: number
  dyFactor: number
  baseAlpha: number
  alphaMultiplier: number
}

export type DisplaceParams = {
  count: number
  emission: number
  sizeMin: number
  sizeMax: number
  speedMin: number
  speedMax: number
  lifetime: number
  drift: number
  forceRadius: number
  forceStrength: number
  friction: number
}

export type FieldParams = {
  speed: number
  brightness: number
  dotSize: number
  density: number
  scale: number
  vignette: number
}

export type OrganicParams = FieldParams
export type AuroraParams = FieldParams
export type MorphParams = FieldParams

export type MeteorsParams = {
  count: number
  angle: number
  showStarfield: boolean
  speed: number
  lifeMin: number
  lifeMax: number
  fadeSpeed: number
  length: number
  width: number
  delay: number
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

export const ORGANIC_DEFAULTS: OrganicParams = {
  speed: 1,
  brightness: 2,
  dotSize: 1,
  density: 1,
  scale: 2,
  vignette: 1,
}

export const AURORA_DEFAULTS: AuroraParams = {
  speed: 1,
  brightness: 1,
  dotSize: 1,
  density: 1,
  scale: 1,
  vignette: 1,
}

export const MORPH_DEFAULTS: MorphParams = {
  speed: 1,
  brightness: 1,
  dotSize: 1,
  density: 1,
  scale: 1,
  vignette: 1,
}

export const METEORS_DEFAULTS: MeteorsParams = {
  count: 5,
  angle: 20,
  showStarfield: true,
  speed: 60,
  lifeMin: 0.3,
  lifeMax: 0.7,
  fadeSpeed: 0.2,
  length: 240,
  width: 2,
  delay: 11,
}

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
    const radius = (size * 1.5) / 2
    if (radius < 0.05) continue
    ctx.fillStyle = `rgba(255,255,255,${opacity})`
    ctx.beginPath()
    ctx.arc(s.xPct * width, s.yPct * height, radius, 0, Math.PI * 2)
    ctx.fill()
  }
}

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
  const cx =
    width / 2 +
    p.drift * (0.62 * Math.sin(t * 0.11) + 0.38 * Math.sin(t * 0.041 + 2.1))
  const cy =
    height / 2 +
    p.drift * (0.62 * Math.sin(t * 0.09 + 1.7) + 0.38 * Math.sin(t * 0.034 + 0.5))
  const spin = t * p.spin
  const spread = ref * 0.056 * zoom
  const pitch = spread / Math.max(0.5, twist)
  const TAU = Math.PI * 2
  const coreR = pitch * 0.35

  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i]
    const dx = cell.x - cx
    const dy = cell.y - cy
    const r = Math.sqrt(dx * dx + dy * dy)
    const theta = Math.atan2(dy, dx)
    const wv = Math.cos((TAU * r) / pitch - arms * theta - spin)
    const crest = Math.pow(Math.max(0, wv), width2)
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

type ShimmerCell = {
  x: number
  y: number
  col: number
  row: number
  phase: number
  freq: number
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

type Floater = {
  x: number
  y: number
  sizeT: number
  speedT: number
  driftDir: number
  vx: number
  vy: number
  birth: number
  lifetime: number
  peak: number
}

type TouchForce = { x: number; y: number; t: number }

const FLOAT_DECAY = 0.3
const FLOAT_FADE_IN = 0.5
const FLOAT_FADE_OUT = 1.0
const FLOAT_SPAWN_LO = 0.3
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

function updateFloaters(
  floaters: Floater[],
  forces: TouchForce[],
  p: DisplaceParams,
  width: number,
  height: number,
  now: number,
  dt: number,
) {
  const frictionPow = Math.pow(p.friction, dt * 60)
  const speedSpan = Math.max(0, p.speedMax - p.speedMin)

  let w = 0
  for (let i = 0; i < floaters.length; i++) {
    const f = floaters[i]

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

    f.vx *= frictionPow
    f.vy *= frictionPow
    f.x += f.vx * dt
    f.y += f.vy * dt

    f.y -= (p.speedMin + f.speedT * speedSpan) * dt
    f.x += f.driftDir * p.drift * dt

    const age = now - f.birth
    if (age > f.lifetime || f.y < -10) continue
    floaters[w++] = f
  }
  floaters.length = w

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

type FieldCell = {
  px: number
  py: number
  u: number
  v: number
  len: number
  vd: number
}

function buildFieldCells(
  width: number,
  height: number,
  pitch: number,
): FieldCell[] {
  const cells: FieldCell[] = []
  if (width <= 0 || height <= 0 || pitch <= 0) return cells
  const kxMax = Math.ceil(width / (2 * height) / pitch) + 1
  const kyMax = Math.ceil(0.5 / pitch) + 1
  for (let ky = -kyMax; ky <= kyMax; ky++) {
    const v = ky * pitch
    const py = v * height + height / 2
    if (py < -4 || py > height + 4) continue
    const vy = (py - height / 2) / height
    for (let kx = -kxMax; kx <= kxMax; kx++) {
      const u = kx * pitch
      const px = u * height + width / 2
      if (px < -4 || px > width + 4) continue
      const vx = (px - width / 2) / width
      cells.push({
        px,
        py,
        u,
        v,
        len: Math.sqrt(u * u + v * v),
        vd: vx * vx + vy * vy,
      })
    }
  }
  return cells
}

const TAU = Math.PI * 2
const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x)

export const ORGANIC_GRID = 0.02
export const AURORA_GRID = 0.018
export const MORPH_GRID = 0.018

function fieldFillRgb(brightness: number): string {
  const c = Math.min(255, Math.max(0, Math.round(255 * brightness)))
  return `${c},${c},${c}`
}

function renderOrganic(
  ctx: CanvasRenderingContext2D,
  cells: FieldCell[],
  p: OrganicParams,
  t: number,
) {
  const ps = p.scale
  const dotR = 1.4 * Math.max(0.05, p.dotSize)
  const vK = 0.85 * p.vignette
  const rgb = fieldFillRgb(p.brightness)
  for (let i = 0; i < cells.length; i++) {
    const c = cells[i]
    const n =
      Math.sin(c.u * 3 * ps + t * 0.4) * Math.cos(c.v * 3 * ps - t * 0.35) +
      0.5 *
        Math.sin(c.u * 7 * ps - t * 0.6) *
        Math.sin(c.v * 7 * ps + t * 0.55)
    const fronts = Math.sin(n * 6 + c.len * 8 * ps - t * 1.8)
    const bright = Math.pow(Math.max(0, fronts), 1.8)
    const vig = clamp01(1 - c.vd * vK)
    const intensity = (0.1 + bright) * vig
    if (intensity < 0.01) continue
    ctx.fillStyle = `rgba(${rgb},${intensity < 1 ? intensity : 1})`
    ctx.beginPath()
    ctx.arc(c.px, c.py, dotR, 0, TAU)
    ctx.fill()
  }
}

function renderAurora(
  ctx: CanvasRenderingContext2D,
  cells: FieldCell[],
  p: AuroraParams,
  t: number,
) {
  const ps = p.scale
  const dotR = 1.6 * Math.max(0.05, p.dotSize)
  const vK = 0.9 * p.vignette
  const rgb = fieldFillRgb(p.brightness)
  for (let i = 0; i < cells.length; i++) {
    const c = cells[i]
    let v =
      Math.sin(c.u * 8 * ps + t * 1.3) +
      Math.sin(c.v * 8 * ps + t * 1.1) +
      Math.sin((c.u + c.v) * 6 * ps + t * 1.5) +
      Math.sin(c.len * 10 * ps - t * 1.8)
    v *= 0.25
    const bright = Math.pow(clamp01(0.5 + 0.5 * v), 2.5)
    const vig = clamp01(1 - c.vd * vK)
    const intensity = bright * vig
    if (intensity < 0.01) continue
    ctx.fillStyle = `rgba(${rgb},${intensity < 1 ? intensity : 1})`
    ctx.beginPath()
    ctx.arc(c.px, c.py, dotR, 0, TAU)
    ctx.fill()
  }
}

function renderMorph(
  ctx: CanvasRenderingContext2D,
  cells: FieldCell[],
  p: MorphParams,
  t: number,
) {
  const ps = p.scale
  const dotR = 1.5 * Math.max(0.05, p.dotSize)
  const vK = 0.7 * p.vignette
  const rgb = fieldFillRgb(p.brightness)
  for (let i = 0; i < cells.length; i++) {
    const c = cells[i]
    const angle =
      Math.sin(c.u * 4 * ps + t * 0.6) * 1.2 +
      Math.cos(c.v * 4 * ps - t * 0.5) * 1.2 +
      Math.sin((c.u + c.v) * 3 * ps + t * 0.9)
    const fx = Math.cos(angle)
    const fy = Math.sin(angle)
    const phase = (c.u * fx + c.v * fy) * 12 * ps - t * 4
    let bright = 0.5 + 0.5 * Math.sin(phase)
    bright = bright * bright * bright * bright
    const vig = clamp01(1 - c.vd * vK)
    const intensity = (0.1 + 1.1 * bright) * vig
    if (intensity < 0.01) continue
    ctx.fillStyle = `rgba(${rgb},${intensity < 1 ? intensity : 1})`
    ctx.beginPath()
    ctx.arc(c.px, c.py, dotR, 0, TAU)
    ctx.fill()
  }
}

function meteorRandRange(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function meteorAxis(angleRad: number, w: number, h: number) {
  const dx = Math.cos(angleRad)
  const dy = Math.sin(angleRad)
  const px = -dy
  const py = dx
  const corners = [
    [0, 0],
    [w, 0],
    [0, h],
    [w, h],
  ]
  let aMin = Infinity
  let aMax = -Infinity
  let pMin = Infinity
  let pMax = -Infinity
  for (let i = 0; i < corners.length; i++) {
    const a = corners[i][0] * dx + corners[i][1] * dy
    const p = corners[i][0] * px + corners[i][1] * py
    if (a < aMin) aMin = a
    if (a > aMax) aMax = a
    if (p < pMin) pMin = p
    if (p > pMax) pMax = p
  }
  return { dx, dy, px, py, aMin, aLen: Math.max(1, aMax - aMin), pMin, pMax }
}

const METEOR_FADE_IN = 0.12

class Meteor {
  state: "idle" | "active" = "idle"
  timer = 0
  dx = 1
  dy = 0
  px = 0
  py = 1
  aMin = 0
  aLen = 1
  cross = 0
  reach = 0.6
  speed = 1
  f = 0

  spawn(width: number, height: number, p: MeteorsParams) {
    const ax = meteorAxis(p.angle * (Math.PI / 180), width, height)
    this.dx = ax.dx
    this.dy = ax.dy
    this.px = ax.px
    this.py = ax.py
    this.aMin = ax.aMin
    this.aLen = ax.aLen
    this.cross = meteorRandRange(ax.pMin - p.length, ax.pMax + p.length)
    const lo = Math.min(p.lifeMin, p.lifeMax)
    const hi = Math.max(p.lifeMin, p.lifeMax)
    this.reach = Math.min(0.95, Math.max(0.05, meteorRandRange(lo, hi)))
    this.speed = Math.max(1, p.speed) * meteorRandRange(0.85, 1.15)
    this.f = 0
    this.state = "active"
  }

  update(dt: number, width: number, height: number, p: MeteorsParams) {
    if (this.state === "idle") {
      this.timer -= dt
      if (this.timer <= 0) this.spawn(width, height, p)
      return
    }
    this.f += (this.speed / this.aLen) * dt
    if (this.f >= this.reach) {
      this.state = "idle"
      this.timer = p.delay * meteorRandRange(0.7, 1.3)
    }
  }

  private fadeOutStart(p: MeteorsParams) {
    return this.reach * Math.min(0.98, Math.max(0.02, p.fadeSpeed))
  }

  opacity(p: MeteorsParams) {
    const fadeInEnd = METEOR_FADE_IN * this.reach
    if (this.f < fadeInEnd) return this.f / fadeInEnd
    const start = this.fadeOutStart(p)
    if (this.f > start) {
      return Math.max(0, (this.reach - this.f) / (this.reach - start))
    }
    return 1
  }
}

function renderMeteors(
  ctx: CanvasRenderingContext2D,
  meteors: Meteor[],
  p: MeteorsParams,
  width: number,
  height: number,
  dt: number,
) {
  for (let i = 0; i < meteors.length; i++) {
    meteors[i].update(dt, width, height, p)
  }

  const lineW = Math.max(0.5, p.width)

  ctx.save()
  ctx.lineCap = "round"
  ctx.shadowColor = "rgba(255,255,255,0.9)"
  ctx.shadowBlur = 6
  for (let i = 0; i < meteors.length; i++) {
    const m = meteors[i]
    if (m.state !== "active") continue
    const op = m.opacity(p)
    if (op <= 0.01) continue

    const headAlong = m.aMin + m.f * m.aLen
    const tailAlong = headAlong - p.length
    const hx = headAlong * m.dx + m.cross * m.px
    const hy = headAlong * m.dy + m.cross * m.py
    const tx = tailAlong * m.dx + m.cross * m.px
    const ty = tailAlong * m.dy + m.cross * m.py

    const grad = ctx.createLinearGradient(hx, hy, tx, ty)
    grad.addColorStop(0, `rgba(255,255,255,${op})`)
    grad.addColorStop(1, "rgba(255,255,255,0)")
    ctx.strokeStyle = grad
    ctx.lineWidth = lineW
    ctx.beginPath()
    ctx.moveTo(hx, hy)
    ctx.lineTo(tx, ty)
    ctx.stroke()
  }
  ctx.restore()
}

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
  organic: OrganicParams
  aurora: AuroraParams
  morph: MorphParams
  meteors: MeteorsParams
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
  organic,
  aurora,
  morph,
  meteors,
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
  const fieldCellsRef = React.useRef<FieldCell[]>([])
  const meteorsRef = React.useRef<Meteor[]>([])
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
  const organicLiveRef = React.useRef(organic)
  const auroraLiveRef = React.useRef(aurora)
  const morphLiveRef = React.useRef(morph)
  const meteorsLiveRef = React.useRef(meteors)
  const liveRef = React.useRef({ pattern })

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
    organicLiveRef.current = organic
    auroraLiveRef.current = aurora
    morphLiveRef.current = morph
    meteorsLiveRef.current = meteors
    liveRef.current = { pattern }
  })

  React.useEffect(() => {
    reducedMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches
    lastFrameRef.current = performance.now()
  }, [])

  React.useEffect(() => {
    let seed: number
    let quantity: number
    if (pattern === "starfield") {
      seed = starfield.seed
      quantity = starfield.quantity
    } else if (pattern === "meteors") {
      seed = STARFIELD_DEFAULTS.seed
      quantity = STARFIELD_DEFAULTS.quantity
    } else {
      return
    }
    const rng = mulberry32(seed)
    const stars: Star[] = []
    const n = Math.max(0, Math.floor(quantity))
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
    } else if (pattern === "organic" || pattern === "aurora" || pattern === "morph") {
      const base =
        pattern === "organic"
          ? ORGANIC_GRID
          : pattern === "aurora"
            ? AURORA_GRID
            : MORPH_GRID
      const density =
        pattern === "organic"
          ? organic.density
          : pattern === "aurora"
            ? aurora.density
            : morph.density
      const pitch = base / Math.max(0.01, density)
      fieldCellsRef.current = buildFieldCells(width, height, pitch)
      pixelsRef.current = []
      particlesRef.current = []
      cellsRef.current = []
    } else if (pattern === "meteors") {
      const p = meteorsLiveRef.current
      const n = Math.max(0, Math.floor(meteors.count))
      const arr: Meteor[] = []
      for (let i = 0; i < n; i++) {
        const m = new Meteor()
        m.spawn(width, height, p)
        m.f = Math.random() * m.reach
        if (Math.random() < 0.25) {
          m.state = "idle"
          m.timer = Math.random() * p.delay
        }
        arr.push(m)
      }
      meteorsRef.current = arr
      pixelsRef.current = []
      particlesRef.current = []
      cellsRef.current = []
    } else {
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
    organic.density,
    aurora.density,
    morph.density,
    meteors.count,
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

      if (
        pat === "grid" ||
        pat === "shimmer" ||
        pat === "organic" ||
        pat === "aurora" ||
        pat === "morph"
      ) {
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
      } else if (pat === "organic") {
        const p = organicLiveRef.current
        renderOrganic(ctx, fieldCellsRef.current, p, (now / 1000) * p.speed)
      } else if (pat === "aurora") {
        const p = auroraLiveRef.current
        renderAurora(ctx, fieldCellsRef.current, p, (now / 1000) * p.speed)
      } else if (pat === "morph") {
        const p = morphLiveRef.current
        renderMorph(ctx, fieldCellsRef.current, p, (now / 1000) * p.speed)
      } else if (pat === "meteors") {
        const { w, h } = dimsRef.current
        const dtSec = Math.min(dt, 64) / 1000
        const mp = meteorsLiveRef.current
        if (mp.showStarfield) {
          renderStarfield(ctx, starsRef.current, STARFIELD_DEFAULTS, w, h, now / 1000)
        }
        renderMeteors(ctx, meteorsRef.current, mp, w, h, dtSec)
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
