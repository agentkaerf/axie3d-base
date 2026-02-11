'use client'

import { useFrame } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import { CapsuleCollider, RigidBody, type RapierRigidBody } from '@react-three/rapier'
import { forwardRef, useRef, useImperativeHandle } from 'react'
import * as THREE from 'three'
import PlayerModel, { type PlayerModelHandle } from './PlayerModel'
import { useGameStore } from '@/hooks/useGameStore'
import { getPlayerState, stateToAnimation } from '@/lib/animations'
import type { AnimationName } from '@/lib/types'

const WALK_SPEED = 4
const RUN_SPEED = 8
const JUMP_VELOCITY = 6
const ROTATION_SPEED = 10

const _direction = new THREE.Vector3()
const _cameraDir = new THREE.Vector3()
const _cameraRight = new THREE.Vector3()
const _targetQuat = new THREE.Quaternion()

const Player = forwardRef<THREE.Group>(function Player(_, ref) {
  const rigidBodyRef = useRef<RapierRigidBody>(null!)
  const modelGroupRef = useRef<THREE.Group>(null!)
  const modelHandle = useRef<PlayerModelHandle>(null!)
  const isGroundedRef = useRef(true)
  const lastAnimRef = useRef<AnimationName>('idle')

  const character = useGameStore((s) => s.selectedCharacter)
  const setAnimation = useGameStore((s) => s.setAnimation)
  const setPlayerPosition = useGameStore((s) => s.setPlayerPosition)

  const [, getKeys] = useKeyboardControls()

  useImperativeHandle(ref, () => modelGroupRef.current, [])

  useFrame(({ camera }, delta) => {
    const body = rigidBodyRef.current
    const model = modelGroupRef.current
    if (!body || !model) return

    const keys = getKeys() as {
      forward: boolean
      backward: boolean
      left: boolean
      right: boolean
      jump: boolean
      sprint: boolean
      attack: boolean
    }

    const velocity = body.linvel()

    // Grounded check
    isGroundedRef.current = Math.abs(velocity.y) < 0.5

    // Get animation state
    const state = getPlayerState(
      keys,
      isGroundedRef.current,
      velocity.y
    )
    const animName = stateToAnimation(state)

    if (animName !== lastAnimRef.current) {
      lastAnimRef.current = animName
      setAnimation(animName)
      modelHandle.current?.playAnimation(animName)
    }

    // Camera-relative movement
    camera.getWorldDirection(_cameraDir)
    _cameraDir.y = 0
    _cameraDir.normalize()
    _cameraRight.crossVectors(new THREE.Vector3(0, 1, 0), _cameraDir).normalize()

    _direction.set(0, 0, 0)
    if (keys.forward) _direction.add(_cameraDir)
    if (keys.backward) _direction.sub(_cameraDir)
    if (keys.left) _direction.add(_cameraRight)
    if (keys.right) _direction.sub(_cameraRight)
    _direction.normalize()

    const speed = keys.sprint ? RUN_SPEED : WALK_SPEED
    const isMoving = _direction.lengthSq() > 0

    // Apply movement velocity
    body.setLinvel(
      { x: _direction.x * speed, y: velocity.y, z: _direction.z * speed },
      true
    )

    // Jump
    if (keys.jump && isGroundedRef.current) {
      body.setLinvel({ x: velocity.x, y: JUMP_VELOCITY, z: velocity.z }, true)
      isGroundedRef.current = false
    }

    // Smooth rotation toward movement direction
    if (isMoving) {
      const angle = Math.atan2(_direction.x, _direction.z)
      _targetQuat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle)
      model.quaternion.slerp(_targetQuat, delta * ROTATION_SPEED)
    }

    // Sync model group position with physics body
    const translation = body.translation()
    model.position.set(translation.x, translation.y - 0.9, translation.z)

    // Update store for camera and POI proximity checks
    setPlayerPosition([translation.x, translation.y, translation.z])
  })

  return (
    <>
      <RigidBody
        ref={rigidBodyRef}
        colliders={false}
        enabledRotations={[false, false, false]}
        position={[0, 3, 0]}
        linearDamping={0.5}
      >
        <CapsuleCollider args={[0.4, 0.5]} />
      </RigidBody>
      <group ref={modelGroupRef}>
        <PlayerModel ref={modelHandle} character={character} />
      </group>
    </>
  )
})

export default Player
