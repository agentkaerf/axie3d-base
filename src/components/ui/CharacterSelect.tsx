'use client'

import { useGameStore } from '@/hooks/useGameStore'
import { CHARACTERS, getModelUrl, getAnimationUrl, PRELOAD_ANIMATIONS } from '@/lib/assets'
import { useGLTF } from '@react-three/drei'
import type { CharacterName } from '@/lib/types'

const CHARACTER_INFO: Record<CharacterName, { name: string; description: string; color: string }> = {
  buba: { name: 'Buba', description: 'A brave and curious explorer', color: '#ff6b6b' },
  puffy: { name: 'Puffy', description: 'A gentle and wise creature', color: '#6bc5ff' },
  pomodoro: { name: 'Pomodoro', description: 'A fierce and loyal companion', color: '#6bff6b' },
}

export default function CharacterSelect() {
  const selectedCharacter = useGameStore((s) => s.selectedCharacter)
  const selectCharacter = useGameStore((s) => s.selectCharacter)
  const setPhase = useGameStore((s) => s.setPhase)

  const handleSelect = (character: CharacterName) => {
    selectCharacter(character)
    // Preload model + animations
    useGLTF.preload(getModelUrl(character))
    PRELOAD_ANIMATIONS.forEach((a) => {
      useGLTF.preload(getAnimationUrl(character, a))
    })
  }

  const handleStart = () => {
    setPhase('playing')
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-8">Choose Your Axie</h1>
        <div className="flex gap-6 mb-8">
          {CHARACTERS.map((char) => {
            const info = CHARACTER_INFO[char]
            const isSelected = selectedCharacter === char
            return (
              <button
                key={char}
                onClick={() => handleSelect(char)}
                className={`p-6 rounded-xl border-4 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-yellow-400 scale-110 shadow-lg shadow-yellow-400/30'
                    : 'border-white/30 hover:border-white/60'
                }`}
                style={{ backgroundColor: info.color + '33' }}
              >
                <div className="text-5xl mb-3">
                  {char === 'buba' ? '🔴' : char === 'puffy' ? '🔵' : '🟢'}
                </div>
                <div className="text-2xl font-bold text-white">{info.name}</div>
                <div className="text-sm text-white/70 mt-2 max-w-[150px]">
                  {info.description}
                </div>
              </button>
            )
          })}
        </div>
        <button
          onClick={handleStart}
          className="px-8 py-3 bg-yellow-400 text-black font-bold rounded-lg text-xl hover:bg-yellow-300 transition cursor-pointer"
        >
          Start Adventure
        </button>
      </div>
    </div>
  )
}
