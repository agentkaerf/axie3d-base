'use client'

import { Sky } from '@react-three/drei'

export default function Skybox() {
  return (
    <>
      <Sky sunPosition={[100, 20, 100]} />
      <fog attach="fog" args={['#c9e8ff', 60, 150]} />
    </>
  )
}
