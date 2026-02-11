'use client'

import { Canvas } from '@react-three/fiber'
import { KeyboardControls } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import { Suspense } from 'react'
import Scene from './Scene'
import { KEYBOARD_MAP } from '@/lib/assets'

export default function GameCanvas() {
  return (
    <KeyboardControls map={KEYBOARD_MAP}>
      <Canvas
        shadows
        camera={{ fov: 60, near: 0.1, far: 300, position: [0, 5, 10] }}
        style={{ width: '100vw', height: '100vh' }}
      >
        <Suspense fallback={null}>
          <Physics gravity={[0, -20, 0]}>
            <Scene />
          </Physics>
        </Suspense>
      </Canvas>
    </KeyboardControls>
  )
}
