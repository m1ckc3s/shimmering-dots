import { useState } from "react"
import {
  PixelBackground,
  GRID_DEFAULTS,
  WIGGLE_DEFAULTS,
  STARFIELD_DEFAULTS,
  TWIST_DEFAULTS,
  DISPLACE_DEFAULTS,
  SHIMMER_DEFAULTS,
  ORGANIC_DEFAULTS,
  AURORA_DEFAULTS,
  MORPH_DEFAULTS,
  type Pattern,
  type GridParams,
  type WiggleParams,
  type StarfieldParams,
  type TwistParams,
  type DisplaceParams,
  type ShimmerParams,
  type OrganicParams,
  type AuroraParams,
  type MorphParams,
} from "@/components/PixelBackground"
import { Controls } from "@/components/Controls"

// Opacity is per-pattern: switching patterns recalls that pattern's own value
// rather than carrying one global value across all of them.
const OPACITY_DEFAULTS: Record<Pattern, number> = {
  grid: 1,
  wiggle: 0.65,
  starfield: 0.65,
  twist: 0.65,
  displace: 1,
  shimmer: 0.65,
  organic: 1,
  aurora: 1,
  morph: 1,
}

export default function App() {
  const [pattern, setPattern] = useState<Pattern>("grid")
  const [opacities, setOpacities] = useState<Record<Pattern, number>>(
    OPACITY_DEFAULTS,
  )
  const opacity = opacities[pattern]
  const setOpacity = (v: number) =>
    setOpacities((prev) => ({ ...prev, [pattern]: v }))
  const [grid, setGrid] = useState<GridParams>(GRID_DEFAULTS)
  const [wiggle, setWiggle] = useState<WiggleParams>(WIGGLE_DEFAULTS)
  const [starfield, setStarfield] = useState<StarfieldParams>(STARFIELD_DEFAULTS)
  const [twist, setTwist] = useState<TwistParams>(TWIST_DEFAULTS)
  const [displace, setDisplace] = useState<DisplaceParams>(DISPLACE_DEFAULTS)
  const [shimmer, setShimmer] = useState<ShimmerParams>(SHIMMER_DEFAULTS)
  const [organic, setOrganic] = useState<OrganicParams>(ORGANIC_DEFAULTS)
  const [aurora, setAurora] = useState<AuroraParams>(AURORA_DEFAULTS)
  const [morph, setMorph] = useState<MorphParams>(MORPH_DEFAULTS)

  return (
    <div className="relative h-full w-full bg-[#070707]">
      <PixelBackground
        pattern={pattern}
        pixelOpacity={opacity}
        grid={grid}
        wiggle={wiggle}
        starfield={starfield}
        twist={twist}
        displace={displace}
        shimmer={shimmer}
        organic={organic}
        aurora={aurora}
        morph={morph}
        className="absolute inset-0"
      />
      <div className="pointer-events-none fixed bottom-6 right-6 z-10">
        <Controls
          pattern={pattern}
          opacity={opacity}
          grid={grid}
          wiggle={wiggle}
          starfield={starfield}
          twist={twist}
          displace={displace}
          shimmer={shimmer}
          organic={organic}
          aurora={aurora}
          morph={morph}
          onPatternChange={setPattern}
          onOpacityChange={setOpacity}
          onGridChange={setGrid}
          onWiggleChange={setWiggle}
          onStarfieldChange={setStarfield}
          onTwistChange={setTwist}
          onDisplaceChange={setDisplace}
          onShimmerChange={setShimmer}
          onOrganicChange={setOrganic}
          onAuroraChange={setAurora}
          onMorphChange={setMorph}
        />
      </div>
    </div>
  )
}
