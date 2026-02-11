'use client'

import dynamic from 'next/dynamic'
import { useEffect } from 'react'
import { useGameStore } from '@/hooks/useGameStore'
import CharacterSelect from '@/components/ui/CharacterSelect'
import HUD from '@/components/ui/HUD'

const GameCanvas = dynamic(() => import('@/components/canvas/GameCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-screen h-screen bg-black flex items-center justify-center text-white text-xl">
      Loading game engine...
    </div>
  ),
})

export default function GamePage() {
  const phase = useGameStore((s) => s.phase)
  const setPhase = useGameStore((s) => s.setPhase)

  // Default to character select when arriving at game page
  useEffect(() => {
    if (phase === 'menu') {
      setPhase('characterSelect')
    }
  }, [phase, setPhase])

  return (
    <main className="w-screen h-screen overflow-hidden relative">
      <GameCanvas />
      {phase === 'characterSelect' && <CharacterSelect />}
      {phase === 'playing' && <HUD />}
    </main>
  )
}
