import { create } from 'zustand'
import type { CharacterName, AnimationName, GamePhase } from '@/lib/types'

interface GameState {
  phase: GamePhase
  setPhase: (phase: GamePhase) => void

  selectedCharacter: CharacterName
  selectCharacter: (character: CharacterName) => void

  currentAnimation: AnimationName
  setAnimation: (anim: AnimationName) => void

  playerPosition: [number, number, number]
  setPlayerPosition: (pos: [number, number, number]) => void

  discoveredLocations: Set<string>
  discoverLocation: (label: string) => void

  showInteractionPrompt: boolean
  interactionPromptText: string
  setInteractionPrompt: (show: boolean, text?: string) => void
}

export const useGameStore = create<GameState>((set) => ({
  phase: 'menu',
  setPhase: (phase) => set({ phase }),

  selectedCharacter: 'buba',
  selectCharacter: (selectedCharacter) => set({ selectedCharacter }),

  currentAnimation: 'idle',
  setAnimation: (currentAnimation) => set({ currentAnimation }),

  playerPosition: [0, 0, 0],
  setPlayerPosition: (playerPosition) => set({ playerPosition }),

  discoveredLocations: new Set(),
  discoverLocation: (label) =>
    set((state) => ({
      discoveredLocations: new Set([...Array.from(state.discoveredLocations), label]),
    })),

  showInteractionPrompt: false,
  interactionPromptText: '',
  setInteractionPrompt: (show, text = '') =>
    set({ showInteractionPrompt: show, interactionPromptText: text }),
}))
