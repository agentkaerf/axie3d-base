'use client'

import { useGameStore } from '@/hooks/useGameStore'

export default function HUD() {
  const discoveredLocations = useGameStore((s) => s.discoveredLocations)
  const showInteractionPrompt = useGameStore((s) => s.showInteractionPrompt)
  const interactionPromptText = useGameStore((s) => s.interactionPromptText)

  return (
    <div className="absolute inset-0 pointer-events-none z-40">
      {/* Discovered locations counter */}
      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg text-white">
        Discovered: {discoveredLocations.size} / 5
      </div>

      {/* Interaction prompt */}
      {showInteractionPrompt && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm px-6 py-3 rounded-lg text-white text-lg">
          {interactionPromptText}
        </div>
      )}

      {/* Controls hint */}
      <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg text-white/60 text-sm">
        WASD - Move | Arrows - Camera | Shift - Sprint | Space - Jump
      </div>
    </div>
  )
}
