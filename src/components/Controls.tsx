import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import {
  PATTERNS,
  GRID_DEFAULTS,
  WIGGLE_DEFAULTS,
  STARFIELD_DEFAULTS,
  TWIST_DEFAULTS,
  DISPLACE_DEFAULTS,
  SHIMMER_DEFAULTS,
  type Pattern,
  type GridParams,
  type WiggleParams,
  type StarfieldParams,
  ORGANIC_DEFAULTS,
  AURORA_DEFAULTS,
  MORPH_DEFAULTS,
  METEORS_DEFAULTS,
  type TwistParams,
  type DisplaceParams,
  type ShimmerParams,
  type FieldParams,
  type OrganicParams,
  type AuroraParams,
  type MorphParams,
  type MeteorsParams,
} from "./PixelBackground"

type Props = {
  pattern: Pattern
  opacity: number
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
  onPatternChange: (v: Pattern) => void
  onOpacityChange: (v: number) => void
  onGridChange: (p: GridParams) => void
  onWiggleChange: (p: WiggleParams) => void
  onStarfieldChange: (p: StarfieldParams) => void
  onTwistChange: (p: TwistParams) => void
  onDisplaceChange: (p: DisplaceParams) => void
  onShimmerChange: (p: ShimmerParams) => void
  onOrganicChange: (p: OrganicParams) => void
  onAuroraChange: (p: AuroraParams) => void
  onMorphChange: (p: MorphParams) => void
  onMeteorsChange: (p: MeteorsParams) => void
  className?: string
}

export function Controls({
  pattern,
  opacity,
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
  onPatternChange,
  onOpacityChange,
  onGridChange,
  onWiggleChange,
  onStarfieldChange,
  onTwistChange,
  onDisplaceChange,
  onShimmerChange,
  onOrganicChange,
  onAuroraChange,
  onMorphChange,
  onMeteorsChange,
  className,
}: Props) {
  const [open, setOpen] = useState(true)

  const reset = () => {
    if (pattern === "grid") onGridChange(GRID_DEFAULTS)
    else if (pattern === "wiggle") onWiggleChange(WIGGLE_DEFAULTS)
    else if (pattern === "starfield") onStarfieldChange(STARFIELD_DEFAULTS)
    else if (pattern === "twist") onTwistChange(TWIST_DEFAULTS)
    else if (pattern === "displace") onDisplaceChange(DISPLACE_DEFAULTS)
    else if (pattern === "shimmer") onShimmerChange(SHIMMER_DEFAULTS)
    else if (pattern === "organic") onOrganicChange(ORGANIC_DEFAULTS)
    else if (pattern === "aurora") onAuroraChange(AURORA_DEFAULTS)
    else if (pattern === "morph") onMorphChange(MORPH_DEFAULTS)
    else if (pattern === "meteors") onMeteorsChange(METEORS_DEFAULTS)
  }

  return (
    <div className={cn("relative font-mono", className)}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open controls"
        className={cn(
          "absolute bottom-0 right-0 flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 backdrop-blur-xl",
          "text-[11px] font-medium uppercase tracking-[0.08em] text-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.45)]",
          "origin-bottom-right transition-all duration-300 ease-out hover:text-white/90",
          open
            ? "pointer-events-none scale-90 opacity-0"
            : "pointer-events-auto scale-100 opacity-100",
        )}
      >
        <SlidersIcon />
        Controls
      </button>

      <div
        className={cn(
          "w-64 rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl",
          "shadow-[0_8px_32px_rgba(0,0,0,0.45)]",
          "origin-bottom-right transition-all duration-300 ease-out",
          open
            ? "pointer-events-auto scale-100 opacity-100"
            : "pointer-events-none scale-90 opacity-0",
        )}
      >
        <div className="flex items-center justify-between pb-4">
          <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-white/50">
            Shimmering Dots
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close controls"
            className="-mr-1 -mt-1 cursor-pointer rounded p-1 text-white/40 transition-colors hover:text-white/80"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="space-y-4">
        <PatternSelect value={pattern} onChange={onPatternChange} />

        <AnimatedHeight>
          {pattern === "grid" && (
            <GridControls params={grid} onChange={onGridChange} />
          )}
          {pattern === "wiggle" && (
            <WiggleControls params={wiggle} onChange={onWiggleChange} />
          )}
          {pattern === "starfield" && (
            <StarfieldControls params={starfield} onChange={onStarfieldChange} />
          )}
          {pattern === "twist" && (
            <TwistControls params={twist} onChange={onTwistChange} />
          )}
          {pattern === "displace" && (
            <DisplaceControls params={displace} onChange={onDisplaceChange} />
          )}
          {pattern === "shimmer" && (
            <ShimmerControls params={shimmer} onChange={onShimmerChange} />
          )}
          {pattern === "organic" && (
            <FieldControls params={organic} onChange={onOrganicChange} />
          )}
          {pattern === "aurora" && (
            <FieldControls params={aurora} onChange={onAuroraChange} />
          )}
          {pattern === "morph" && (
            <FieldControls params={morph} onChange={onMorphChange} />
          )}
          {pattern === "meteors" && (
            <MeteorsControls params={meteors} onChange={onMeteorsChange} />
          )}
        </AnimatedHeight>

        <Slider
          label="Opacity"
          value={opacity}
          min={0}
          max={1}
          step={0.05}
          onChange={onOpacityChange}
          format={(v) => v.toFixed(2)}
        />

          <ResetButton onClick={reset} />
        </div>
      </div>
    </div>
  )
}

function AnimatedHeight({ children }: { children: React.ReactNode }) {
  const innerRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number>()

  useEffect(() => {
    const el = innerRef.current
    if (!el) return
    const update = () => setHeight(el.offsetHeight)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div
      className="overflow-hidden transition-[height] duration-300 ease-out"
      style={{ height }}
    >
      <div ref={innerRef} className="space-y-4 py-1">
        {children}
      </div>
    </div>
  )
}

function GridControls({
  params,
  onChange,
}: {
  params: GridParams
  onChange: (p: GridParams) => void
}) {
  const set = <K extends keyof GridParams>(key: K, v: GridParams[K]) =>
    onChange({ ...params, [key]: v })
  return (
    <>
      <Slider label="Gap" value={params.gap} min={5} max={50} step={1} onChange={(v) => set("gap", v)} />
      <Slider label="Size" value={params.dotSize} min={1} max={8} step={0.5} onChange={(v) => set("dotSize", v)} format={(v) => v.toFixed(1)} />
      <Slider label="Speed" value={params.speed} min={0} max={100} step={1} onChange={(v) => set("speed", v)} />
    </>
  )
}

function WiggleControls({
  params,
  onChange,
}: {
  params: WiggleParams
  onChange: (p: WiggleParams) => void
}) {
  const set = <K extends keyof WiggleParams>(key: K, v: WiggleParams[K]) =>
    onChange({ ...params, [key]: v })
  return (
    <>
      <Slider label="Count" value={params.count} min={20} max={500} step={10} onChange={(v) => set("count", v)} />
      <RangeSlider
        label="Size Range"
        valueMin={params.sizeMin}
        valueMax={params.sizeMax}
        min={0.5}
        max={6}
        step={0.1}
        onChange={(lo, hi) => onChange({ ...params, sizeMin: lo, sizeMax: hi })}
        format={(v) => v.toFixed(1)}
      />
      <Slider label="Speed" value={params.speed} min={0} max={3} step={0.05} onChange={(v) => set("speed", v)} format={(v) => v.toFixed(2)} />
      <Slider label="Twinkle" value={params.twinkle} min={0} max={5} step={0.05} onChange={(v) => set("twinkle", v)} format={(v) => v.toFixed(2)} />
      <Slider label="Drift" value={params.drift} min={0} max={30} step={1} onChange={(v) => set("drift", v)} />
    </>
  )
}

function StarfieldControls({
  params,
  onChange,
}: {
  params: StarfieldParams
  onChange: (p: StarfieldParams) => void
}) {
  const set = <K extends keyof StarfieldParams>(key: K, v: StarfieldParams[K]) =>
    onChange({ ...params, [key]: v })
  return (
    <>
      <Slider label="Quantity" value={params.quantity} min={1} max={500} step={1} onChange={(v) => set("quantity", v)} />
      <Slider label="Seed" value={params.seed} min={0} max={99999} step={1} onChange={(v) => set("seed", v)} />
      <RangeSlider
        label="Size"
        valueMin={params.sizeMin}
        valueMax={params.sizeMax}
        min={0.1}
        max={10}
        step={0.1}
        onChange={(lo, hi) => onChange({ ...params, sizeMin: lo, sizeMax: hi })}
        format={(v) => v.toFixed(1)}
      />
      <RangeSlider
        label="Duration"
        valueMin={params.durationMin}
        valueMax={params.durationMax}
        min={100}
        max={10000}
        step={100}
        onChange={(lo, hi) =>
          onChange({ ...params, durationMin: lo, durationMax: hi })
        }
        format={(v) => `${(v / 1000).toFixed(1)}s`}
      />
      <Slider
        label="Faded"
        value={params.fadedOpacity}
        min={0}
        max={1}
        step={0.01}
        onChange={(v) => set("fadedOpacity", v)}
        format={(v) => v.toFixed(2)}
      />
    </>
  )
}

function TwistControls({
  params,
  onChange,
}: {
  params: TwistParams
  onChange: (p: TwistParams) => void
}) {
  const set = <K extends keyof TwistParams>(key: K, v: TwistParams[K]) =>
    onChange({ ...params, [key]: v })
  return (
    <>
      <Slider label="Gap" value={params.gap} min={6} max={50} step={1} onChange={(v) => set("gap", v)} />
      <Slider label="Size" value={params.dotSize} min={1} max={8} step={0.5} onChange={(v) => set("dotSize", v)} format={(v) => v.toFixed(1)} />
      <Slider label="Peak" value={params.peak} min={0.05} max={1} step={0.01} onChange={(v) => set("peak", v)} format={(v) => v.toFixed(2)} />
      <Slider label="Zoom" value={params.zoom} min={0.5} max={60} step={0.5} onChange={(v) => set("zoom", v)} format={(v) => v.toFixed(1)} />
      <Slider label="Twist" value={params.twist} min={0.5} max={12} step={0.5} onChange={(v) => set("twist", v)} format={(v) => v.toFixed(1)} />
      <Slider label="Arms" value={params.arms} min={1} max={6} step={1} onChange={(v) => set("arms", v)} />
      <Slider label="Spin" value={params.spin} min={0} max={1} step={0.02} onChange={(v) => set("spin", v)} format={(v) => v.toFixed(2)} />
      <Slider label="Drift" value={params.drift} min={0} max={500} step={10} onChange={(v) => set("drift", v)} />
      <Slider label="Width" value={params.width} min={0.4} max={14} step={0.1} onChange={(v) => set("width", v)} format={(v) => v.toFixed(1)} />
      <Slider label="Floor" value={params.floor} min={0} max={0.1} step={0.005} onChange={(v) => set("floor", v)} format={(v) => v.toFixed(3)} />
    </>
  )
}

function DisplaceControls({
  params,
  onChange,
}: {
  params: DisplaceParams
  onChange: (p: DisplaceParams) => void
}) {
  const set = <K extends keyof DisplaceParams>(key: K, v: DisplaceParams[K]) =>
    onChange({ ...params, [key]: v })
  return (
    <>
      <Slider label="Count" value={params.count} min={10} max={300} step={10} onChange={(v) => set("count", v)} />
      <Slider label="Emission" value={params.emission} min={0} max={30} step={1} onChange={(v) => set("emission", v)} />
      <RangeSlider
        label="Size"
        valueMin={params.sizeMin}
        valueMax={params.sizeMax}
        min={0.5}
        max={8}
        step={0.1}
        onChange={(lo, hi) => onChange({ ...params, sizeMin: lo, sizeMax: hi })}
        format={(v) => v.toFixed(1)}
      />
      <RangeSlider
        label="Speed"
        valueMin={params.speedMin}
        valueMax={params.speedMax}
        min={5}
        max={150}
        step={1}
        onChange={(lo, hi) => onChange({ ...params, speedMin: lo, speedMax: hi })}
      />
      <Slider label="Lifetime" value={params.lifetime} min={1} max={15} step={0.5} onChange={(v) => set("lifetime", v)} format={(v) => `${v.toFixed(1)}s`} />
      <Slider label="Drift" value={params.drift} min={0} max={40} step={1} onChange={(v) => set("drift", v)} />
      <Slider label="Force Radius" value={params.forceRadius} min={20} max={300} step={5} onChange={(v) => set("forceRadius", v)} />
      <Slider label="Force" value={params.forceStrength} min={0} max={800} step={10} onChange={(v) => set("forceStrength", v)} />
      <Slider label="Friction" value={params.friction} min={0.8} max={0.99} step={0.01} onChange={(v) => set("friction", v)} format={(v) => v.toFixed(2)} />
    </>
  )
}

function ShimmerControls({
  params,
  onChange,
}: {
  params: ShimmerParams
  onChange: (p: ShimmerParams) => void
}) {
  const set = <K extends keyof ShimmerParams>(key: K, v: ShimmerParams[K]) =>
    onChange({ ...params, [key]: v })
  return (
    <>
      <Slider label="Spacing" value={params.spacing} min={8} max={50} step={1} onChange={(v) => set("spacing", v)} />
      <Slider label="Size" value={params.dotSize} min={1} max={10} step={0.5} onChange={(v) => set("dotSize", v)} format={(v) => v.toFixed(1)} />
      <Slider label="Speed" value={params.shimmerSpeed} min={0.5} max={5} step={0.1} onChange={(v) => set("shimmerSpeed", v)} format={(v) => v.toFixed(2)} />
      <Slider label="Wave X" value={params.dxFactor} min={0.05} max={1} step={0.05} onChange={(v) => set("dxFactor", v)} format={(v) => v.toFixed(2)} />
      <Slider label="Wave Y" value={params.dyFactor} min={0.05} max={1} step={0.05} onChange={(v) => set("dyFactor", v)} format={(v) => v.toFixed(2)} />
      <Slider label="Base" value={params.baseAlpha} min={0} max={1} step={0.05} onChange={(v) => set("baseAlpha", v)} format={(v) => v.toFixed(2)} />
      <Slider label="Intensity" value={params.alphaMultiplier} min={0} max={8} step={0.1} onChange={(v) => set("alphaMultiplier", v)} format={(v) => v.toFixed(1)} />
    </>
  )
}

function FieldControls({
  params,
  onChange,
}: {
  params: FieldParams
  onChange: (p: FieldParams) => void
}) {
  const set = <K extends keyof FieldParams>(key: K, v: FieldParams[K]) =>
    onChange({ ...params, [key]: v })
  const f2 = (v: number) => v.toFixed(2)
  return (
    <>
      <Slider label="Speed" value={params.speed} min={0} max={3} step={0.05} onChange={(v) => set("speed", v)} format={f2} />
      <Slider label="Brightness" value={params.brightness} min={0} max={3} step={0.05} onChange={(v) => set("brightness", v)} format={f2} />
      <Slider label="Dot Size" value={params.dotSize} min={0.2} max={3} step={0.05} onChange={(v) => set("dotSize", v)} format={f2} />
      <Slider label="Density" value={params.density} min={0.3} max={3} step={0.05} onChange={(v) => set("density", v)} format={f2} />
      <Slider label="Scale" value={params.scale} min={0.2} max={3} step={0.05} onChange={(v) => set("scale", v)} format={f2} />
      <Slider label="Vignette" value={params.vignette} min={0} max={3} step={0.05} onChange={(v) => set("vignette", v)} format={f2} />
    </>
  )
}

function MeteorsControls({
  params,
  onChange,
}: {
  params: MeteorsParams
  onChange: (p: MeteorsParams) => void
}) {
  const set = <K extends keyof MeteorsParams>(key: K, v: MeteorsParams[K]) =>
    onChange({ ...params, [key]: v })
  const secs = (v: number) => `${v.toFixed(1)}s`
  const pct = (v: number) => `${Math.round(v * 100)}%`
  return (
    <>
      <Slider label="Count" value={params.count} min={1} max={50} step={1} onChange={(v) => set("count", v)} />
      <Slider label="Angle" value={params.angle} min={0} max={360} step={1} onChange={(v) => set("angle", v)} format={(v) => `${Math.round(v)}°`} />
      <Slider label="Speed" value={params.speed} min={50} max={1200} step={10} onChange={(v) => set("speed", v)} />
      <RangeSlider
        label="Lifespan"
        valueMin={params.lifeMin}
        valueMax={params.lifeMax}
        min={0.05}
        max={0.95}
        step={0.01}
        onChange={(lo, hi) => onChange({ ...params, lifeMin: lo, lifeMax: hi })}
        format={pct}
      />
      <Slider label="Fade Out Speed" value={params.fadeSpeed} min={0.05} max={1} step={0.05} onChange={(v) => set("fadeSpeed", v)} format={(v) => v.toFixed(2)} />
      <Slider label="Length" value={params.length} min={20} max={400} step={10} onChange={(v) => set("length", v)} />
      <Slider label="Width" value={params.width} min={0.5} max={10} step={0.5} onChange={(v) => set("width", v)} format={(v) => v.toFixed(1)} />
      <Slider label="Delay" value={params.delay} min={0} max={12} step={0.5} onChange={(v) => set("delay", v)} format={secs} />
      <Divider />
      <Toggle
        label="Starfield"
        checked={params.showStarfield}
        onChange={(v) => set("showStarfield", v)}
      />
    </>
  )
}

function Divider() {
  return <div className="mt-1 border-t border-white/[0.08]" />
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] uppercase tracking-wide text-white/70">
        {label}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative box-border h-5 w-9 shrink-0 cursor-pointer rounded-full border transition-colors",
          "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-white/20",
          checked ? "border-white bg-white" : "border-white/[0.08] bg-white/[0.08]",
        )}
      >
        <span
          className={cn(
            "absolute left-0.5 top-0.5 h-3.5 w-3.5 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.4)] transition-transform",
            checked ? "translate-x-4 bg-[#070707]" : "translate-x-0 bg-white",
          )}
        />
      </button>
    </div>
  )
}

type SliderProps = {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
  format?: (v: number) => string
}

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format,
}: SliderProps) {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100))
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-[11px]">
        <span className="uppercase tracking-wide text-white/70">{label}</span>
        <span className="tabular-nums text-white/40">
          {format ? format(value) : value.toFixed(step < 1 ? 2 : 0)}
        </span>
      </div>
      <div className="relative h-1.5">
        <div className="absolute inset-0 rounded-full bg-white/10" />
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-white/70"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_0_2px_rgba(0,0,0,0.5)] [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white"
        />
      </div>
    </div>
  )
}

type RangeSliderProps = {
  label: string
  valueMin: number
  valueMax: number
  min: number
  max: number
  step?: number
  onChange: (lo: number, hi: number) => void
  format?: (v: number) => string
}

function RangeSlider({
  label,
  valueMin,
  valueMax,
  min,
  max,
  step = 1,
  onChange,
  format,
}: RangeSliderProps) {
  const range = max - min
  const lowPct = ((valueMin - min) / range) * 100
  const highPct = ((valueMax - min) / range) * 100
  const fmt = (v: number) => (format ? format(v) : v.toFixed(step < 1 ? 2 : 0))

  const inputCls =
    "absolute inset-0 h-full w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_0_2px_rgba(0,0,0,0.5)] [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white"

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-[11px]">
        <span className="uppercase tracking-wide text-white/70">{label}</span>
        <span className="tabular-nums text-white/40">
          {fmt(valueMin)} – {fmt(valueMax)}
        </span>
      </div>
      <div className="relative h-1.5">
        <div className="absolute inset-0 rounded-full bg-white/10" />
        <div
          className="absolute inset-y-0 rounded-full bg-white/70"
          style={{ left: `${lowPct}%`, width: `${Math.max(0, highPct - lowPct)}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={valueMin}
          onChange={(e) => {
            const v = Math.min(Number(e.target.value), valueMax)
            onChange(v, valueMax)
          }}
          className={inputCls}
          style={{ zIndex: valueMin > max - range * 0.05 ? 2 : 1 }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={valueMax}
          onChange={(e) => {
            const v = Math.max(Number(e.target.value), valueMin)
            onChange(valueMin, v)
          }}
          className={inputCls}
        />
      </div>
    </div>
  )
}

function PatternSelect({
  value,
  onChange,
}: {
  value: Pattern
  onChange: (v: Pattern) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-1 rounded-md bg-white/[0.04] p-0.5">
      {PATTERNS.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={cn(
            "cursor-pointer rounded px-2 py-1 text-[11px] uppercase tracking-wider transition-colors",
            value === p
              ? "bg-white/15 text-white"
              : "text-white/50 hover:text-white/80",
          )}
        >
          {p}
        </button>
      ))}
    </div>
  )
}

function CloseIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" />
    </svg>
  )
}

function SlidersIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M2 4h6M11 4h1M2 10h1M6 10h6" />
      <circle cx="9.5" cy="4" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="4.5" cy="10" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

function ResetButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-1 w-full cursor-pointer rounded-md border border-white/10 bg-white/[0.02] px-2 py-1.5 text-[11px] uppercase tracking-wide text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white/90"
    >
      Reset
    </button>
  )
}
