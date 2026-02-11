import type { AnimationName, InputState, PlayerState } from './types'

export function getPlayerState(
  input: InputState,
  isGrounded: boolean,
  verticalVelocity: number
): PlayerState {
  if (!isGrounded && verticalVelocity < -1) return 'falling'
  if (!isGrounded) return 'jumping'
  if (input.attack) return 'attacking'
  const isMoving = input.forward || input.backward || input.left || input.right
  if (isMoving && input.sprint) return 'running'
  if (isMoving) return 'walking'
  return 'idle'
}

export function stateToAnimation(state: PlayerState): AnimationName {
  switch (state) {
    case 'idle': return 'idle'
    case 'walking': return 'walk'
    case 'running': return 'run'
    case 'jumping': return 'jump'
    case 'falling': return 'jump'
    case 'attacking': return 'idleattack'
  }
}
