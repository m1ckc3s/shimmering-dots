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
  METEORS_DEFAULTS,
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
  type MeteorsParams,
} from "@/components/PixelBackground"
import { Controls } from "@/components/Controls"

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
  meteors: 1,
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
  const [meteors, setMeteors] = useState<MeteorsParams>(METEORS_DEFAULTS)

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
        meteors={meteors}
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
          meteors={meteors}
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
          onMeteorsChange={setMeteors}
        />
      </div>
      <SocialLinks />
    </div>
  )
}

function SocialLinks() {
  return (
    <nav className="social-links">
      <a
        className="social-btn"
        href="https://github.com/m1ckc3s/shimmering-dots"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub repository"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
        </svg>
      </a>
      <a
        className="social-btn"
        href="https://x.com/mickces"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="X profile"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>
    </nav>
  )
}
