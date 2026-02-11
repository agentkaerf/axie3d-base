import type { CharacterName, AnimationName } from './types'

export const CHARACTERS: CharacterName[] = ['buba', 'puffy', 'pomodoro']

export const ANIMATIONS: AnimationName[] = [
  'idle', 'idleattack', 'idlecarryitem', 'idlegethit',
  'jump', 'run', 'runattack', 'runcarryitem', 'rungethit', 'runjump',
  'walk', 'walkattack', 'walkcarryitem', 'walkjump', 'cuttree',
]

export const PRELOAD_ANIMATIONS: AnimationName[] = ['idle', 'walk', 'run', 'jump']

const MODEL_BASE = 'https://cdn.jsdelivr.net/gh/axieinfinity/r3f-axie-starter/assets'
const ANIM_BASE = 'https://cdn.jsdelivr.net/gh/axieinfinity/axie-starter-3d-assets/glb'

export function getModelUrl(character: CharacterName): string {
  return `${MODEL_BASE}/models/starter_${character}.glb`
}

export function getTextureUrl(character: CharacterName): string {
  return `${MODEL_BASE}/textures/${character}_texture.jpg`
}

export function getAnimationUrl(character: CharacterName, animation: AnimationName): string {
  // Handle known typo in puffy's idle file
  if (character === 'puffy' && animation === 'idle') {
    return `${ANIM_BASE}/puffy/strater_puffy_idle.glb`
  }
  return `${ANIM_BASE}/${character}/starter_${character}_${animation}.glb`
}

export const KEYBOARD_MAP = [
  { name: 'forward', keys: ['KeyW'] },
  { name: 'backward', keys: ['KeyS'] },
  { name: 'left', keys: ['KeyA'] },
  { name: 'right', keys: ['KeyD'] },
  { name: 'jump', keys: ['Space'] },
  { name: 'sprint', keys: ['ShiftLeft', 'ShiftRight'] },
  { name: 'attack', keys: ['KeyE'] },
  { name: 'cameraLeft', keys: ['ArrowLeft'] },
  { name: 'cameraRight', keys: ['ArrowRight'] },
  { name: 'cameraUp', keys: ['ArrowUp'] },
  { name: 'cameraDown', keys: ['ArrowDown'] },
]
