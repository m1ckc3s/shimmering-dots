import { useState } from "react"
import {
  PixelBackground,
  ORIGINAL_DEFAULTS,
  WIGGLE_DEFAULTS,
  STARFIELD_DEFAULTS,
  TWIST_DEFAULTS,
  type Pattern,
  type OriginalParams,
  type WiggleParams,
  type StarfieldParams,
  type TwistParams,
} from "@/components/PixelBackground"
import { Controls } from "@/components/Controls"

// Opacity is per-pattern: switching patterns recalls that pattern's own value
// rather than carrying one global value across all of them.
const OPACITY_DEFAULTS: Record<Pattern, number> = {
  original: 1,
  wiggle: 0.65,
  starfield: 0.65,
  twist: 0.65,
}

export default function App() {
  const [pattern, setPattern] = useState<Pattern>("original")
  const [opacities, setOpacities] = useState<Record<Pattern, number>>(
    OPACITY_DEFAULTS,
  )
  const opacity = opacities[pattern]
  const setOpacity = (v: number) =>
    setOpacities((prev) => ({ ...prev, [pattern]: v }))
  const [original, setOriginal] = useState<OriginalParams>(ORIGINAL_DEFAULTS)
  const [wiggle, setWiggle] = useState<WiggleParams>(WIGGLE_DEFAULTS)
  const [starfield, setStarfield] = useState<StarfieldParams>(STARFIELD_DEFAULTS)
  const [twist, setTwist] = useState<TwistParams>(TWIST_DEFAULTS)

  return (
    <div className="relative h-full w-full bg-[#070707]">
      <PixelBackground
        pattern={pattern}
        pixelOpacity={opacity}
        original={original}
        wiggle={wiggle}
        starfield={starfield}
        twist={twist}
        className="absolute inset-0"
      />
      <div className="pointer-events-none fixed bottom-6 right-6 z-10">
        <Controls
          pattern={pattern}
          opacity={opacity}
          original={original}
          wiggle={wiggle}
          starfield={starfield}
          twist={twist}
          onPatternChange={setPattern}
          onOpacityChange={setOpacity}
          onOriginalChange={setOriginal}
          onWiggleChange={setWiggle}
          onStarfieldChange={setStarfield}
          onTwistChange={setTwist}
        />
      </div>
    </div>
  )
}
