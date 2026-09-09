Add the Beam effect from Libraries.dev to my React app.

Install:
npm install border-beam

Usage:
import { BorderBeam } from 'border-beam';

<BorderBeam size="md" colorVariant="colorful" strength={0.7}>
  <YourCard>Content</YourCard>
</BorderBeam>

Props:
- size: "md" | "sm" | "line" | "pulse-inner" | "pulse-outside"
- colorVariant: "colorful" | "mono" | "ocean" | "sunset"
- strength: 0-1, glow intensity
- active: boolean, pauses the animation when false
- theme: "light" | "dark"

Beam wraps a child element and rides an animated glow around its border.
It ships zero runtime dependencies and needs React 18 or newer.
Docs: https://libraries.dev/beam.html

for the ai input bar, use sunset

Add the Metal effect from Libraries.dev to my React app.

Install:
npm install metal-fx

Usage (v2):
import { MetalFx, MetalText, MetalBadge, useMetalBend, useMetalTextReflection } from 'metal-fx';

<MetalFx preset="chromatic" strength={1}>
  <button>Upgrade to Pro</button>
</MetalFx>

<MetalFx preset="chromatic" variant="circle" innerShadow ref={ref}>   // useMetalBend(ref) for the cursor dent
  <button aria-label="Send"><ArrowUpIcon /></button>
</MetalFx>

<MetalText font="500 24px/1.2 Inter" color="#E2E2E2">Pro</MetalText>
<MetalBadge>New</MetalBadge>

Props (MetalFx):
- preset: "chromatic" | "silver" | "gold" — each ships dark and light tunings
- variant: "button" | "circle"
- strength: 0-1, multiplies the shader opacity and glow alpha
- theme: "light" | "dark", picks the preset's matching side
- innerShadow: light rim on the ring's top inside edge
- reflectionTargets: refs of neighbours that catch the metal
- disableGlow, glowGain, paused

Metal wraps a button, icon, text or badge in a real-time WebGL liquid-metal
effect with a wandering halo. Needs React 18+ and WebGL2 (falls back to the
plain child). v1 engine: npm install metal-fx@1.
Docs: https://libraries.dev/metal.html

use somewhere
