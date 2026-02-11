'use client'

import { useRef } from 'react'
import * as THREE from 'three'
import Player from '@/components/player/Player'
import World from '@/components/world/World'
import ThirdPersonCamera from '@/components/camera/ThirdPersonCamera'

export default function Scene() {
  const playerRef = useRef<THREE.Group>(null!)

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight
        castShadow
        intensity={1.2}
        position={[50, 50, 25]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={150}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />

      {/* World */}
      <World />

      {/* Player */}
      <Player ref={playerRef} />

      {/* Camera */}
      <ThirdPersonCamera targetRef={playerRef} />
    </>
  )
}
