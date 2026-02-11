'use client'

import { useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import * as THREE from 'three'
import { useGameStore } from '@/hooks/useGameStore'

interface PointOfInterestProps {
  position: [number, number, number]
  label: string
  color?: string
  interactionRadius?: number
}

const _playerVec = new THREE.Vector3()
const _poiVec = new THREE.Vector3()

export default function PointOfInterest({
  position,
  label,
  color = '#ffd700',
  interactionRadius = 4,
}: PointOfInterestProps) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const [isNear, setIsNear] = useState(false)

  const discoverLocation = useGameStore((s) => s.discoverLocation)
  const setInteractionPrompt = useGameStore((s) => s.setInteractionPrompt)

  useFrame(({ clock }) => {
    if (!meshRef.current) return

    // Hover animation
    meshRef.current.position.y = position[1] + 2 + Math.sin(clock.elapsedTime * 2) * 0.3
    meshRef.current.rotation.y += 0.02

    // Proximity check using store
    const playerPos = useGameStore.getState().playerPosition
    _playerVec.set(playerPos[0], 0, playerPos[2])
    _poiVec.set(position[0], 0, position[2])
    const dist = _playerVec.distanceTo(_poiVec)
    const near = dist < interactionRadius

    if (near !== isNear) {
      setIsNear(near)
      if (near) {
        setInteractionPrompt(true, `explore ${label}`)
        discoverLocation(label)
      } else {
        setInteractionPrompt(false)
      }
    }
  })

  return (
    <group position={position}>
      {/* Floating marker */}
      <mesh ref={meshRef}>
        <octahedronGeometry args={[0.5]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isNear ? 2 : 0.5}
        />
      </mesh>
      {/* Ground ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[interactionRadius - 0.2, interactionRadius, 32]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={isNear ? 0.3 : 0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}
