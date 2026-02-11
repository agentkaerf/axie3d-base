'use client'

import { RigidBody } from '@react-three/rapier'
import { useMemo } from 'react'

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface TreeProps {
  position: [number, number, number]
  scale: number
}

function Tree({ position, scale }: TreeProps) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={position}>
      <group scale={scale}>
        {/* Trunk */}
        <mesh castShadow position={[0, 1, 0]}>
          <cylinderGeometry args={[0.15, 0.2, 2, 8]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        {/* Foliage bottom */}
        <mesh castShadow position={[0, 2.5, 0]}>
          <coneGeometry args={[1.2, 2, 8]} />
          <meshStandardMaterial color="#2d5a1e" />
        </mesh>
        {/* Foliage top */}
        <mesh castShadow position={[0, 3.5, 0]}>
          <coneGeometry args={[0.8, 1.5, 8]} />
          <meshStandardMaterial color="#3a7a2a" />
        </mesh>
      </group>
    </RigidBody>
  )
}

export default function Trees() {
  const trees = useMemo(() => {
    const rng = mulberry32(42)
    const result: { position: [number, number, number]; scale: number }[] = []
    for (let i = 0; i < 80; i++) {
      const x = (rng() - 0.5) * 160
      const z = (rng() - 0.5) * 160
      // Keep trees away from spawn area
      if (Math.abs(x) < 8 && Math.abs(z) < 8) continue
      result.push({
        position: [x, 0, z],
        scale: 0.8 + rng() * 0.6,
      })
    }
    return result
  }, [])

  return (
    <>
      {trees.map((t, i) => (
        <Tree key={i} position={t.position} scale={t.scale} />
      ))}
    </>
  )
}
