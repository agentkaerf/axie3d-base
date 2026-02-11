'use client'

import { useFrame } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import { useRef } from 'react'
import * as THREE from 'three'

interface ThirdPersonCameraProps {
  targetRef: React.RefObject<THREE.Group>
  distance?: number
  heightOffset?: number
  lookAtOffset?: [number, number, number]
  lerpFactor?: number
  rotationSpeed?: number
  minPolarAngle?: number
  maxPolarAngle?: number
}

const _idealPos = new THREE.Vector3()
const _idealLookAt = new THREE.Vector3()
const _currentLookAt = new THREE.Vector3()

export default function ThirdPersonCamera({
  targetRef,
  distance = 10,
  heightOffset = 1,
  lookAtOffset = [0, 1, 0],
  lerpFactor = 5,
  rotationSpeed = 2,
  minPolarAngle = 0.2,
  maxPolarAngle = 1.4,
}: ThirdPersonCameraProps) {
  const initialized = useRef(false)
  const yaw = useRef(0)
  const pitch = useRef(0.5)

  const [, getKeys] = useKeyboardControls()

  useFrame(({ camera }, delta) => {
    if (!targetRef.current) return

    const keys = getKeys() as {
      cameraLeft: boolean
      cameraRight: boolean
      cameraUp: boolean
      cameraDown: boolean
    }

    // Update orbital angles from arrow keys
    if (keys.cameraLeft) yaw.current += rotationSpeed * delta
    if (keys.cameraRight) yaw.current -= rotationSpeed * delta
    if (keys.cameraUp) pitch.current = Math.min(pitch.current + rotationSpeed * delta, maxPolarAngle)
    if (keys.cameraDown) pitch.current = Math.max(pitch.current - rotationSpeed * delta, minPolarAngle)

    const target = targetRef.current

    // Compute orbital camera position from yaw/pitch
    const horizontalDist = distance * Math.cos(pitch.current)
    _idealPos.set(
      target.position.x + horizontalDist * Math.sin(yaw.current),
      target.position.y + heightOffset + distance * Math.sin(pitch.current),
      target.position.z + horizontalDist * Math.cos(yaw.current),
    )

    // Look-at point
    _idealLookAt.set(
      target.position.x + lookAtOffset[0],
      target.position.y + lookAtOffset[1],
      target.position.z + lookAtOffset[2],
    )

    const t = 1.0 - Math.pow(0.001, delta * lerpFactor)

    if (!initialized.current) {
      camera.position.copy(_idealPos)
      _currentLookAt.copy(_idealLookAt)
      initialized.current = true
    } else {
      camera.position.lerp(_idealPos, t)
      _currentLookAt.lerp(_idealLookAt, t)
    }

    camera.lookAt(_currentLookAt)
  })

  return null
}
