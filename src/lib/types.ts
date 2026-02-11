export type CharacterName = 'buba' | 'puffy' | 'pomodoro'

export type AnimationName =
  | 'idle'
  | 'idleattack'
  | 'idlecarryitem'
  | 'idlegethit'
  | 'jump'
  | 'run'
  | 'runattack'
  | 'runcarryitem'
  | 'rungethit'
  | 'runjump'
  | 'walk'
  | 'walkattack'
  | 'walkcarryitem'
  | 'walkjump'
  | 'cuttree'

export type PlayerState = 'idle' | 'walking' | 'running' | 'jumping' | 'falling' | 'attacking'

export interface InputState {
  forward: boolean
  backward: boolean
  left: boolean
  right: boolean
  jump: boolean
  sprint: boolean
  attack: boolean
}

export type GamePhase = 'menu' | 'characterSelect' | 'loading' | 'playing' | 'paused'
