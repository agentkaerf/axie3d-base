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

interface RockProps {
  position: [number, number, number]
  scale: number
  rotation: [number, number, number]
}

function Rock({ position, scale, rotation }: RockProps) {
  return (
    <RigidBody type="fixed" colliders="hull" position={position}>
      <mesh castShadow receiveShadow scale={scale} rotation={rotation}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#808080" roughness={0.9} />
      </mesh>
    </RigidBody>
  )
}

export default function Rocks() {
  const rocks = useMemo(() => {
    const rng = mulberry32(99)
    const result: RockProps[] = []
    for (let i = 0; i < 40; i++) {
      const x = (rng() - 0.5) * 150
      const z = (rng() - 0.5) * 150
      if (Math.abs(x) < 6 && Math.abs(z) < 6) continue
      result.push({
        position: [x, 0.3, z],
        scale: 0.3 + rng() * 0.7,
        rotation: [rng() * Math.PI, rng() * Math.PI, rng() * Math.PI],
      })
    }
    return result
  }, [])

  return (
    <>
      {rocks.map((r, i) => (
        <Rock key={i} {...r} />
      ))}
    </>
  )
}
