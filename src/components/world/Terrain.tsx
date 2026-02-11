'use client'

import { RigidBody } from '@react-three/rapier'

export default function Terrain() {
  return (
    <RigidBody type="fixed" colliders="cuboid">
      <mesh receiveShadow position={[0, -0.5, 0]}>
        <boxGeometry args={[200, 1, 200]} />
        <meshStandardMaterial color="#4a7c3f" />
      </mesh>
    </RigidBody>
  )
}
