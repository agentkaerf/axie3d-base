'use client'

import { useFrame } from '@react-three/fiber'
import { useEffect, forwardRef, useImperativeHandle } from 'react'
import type { CharacterName, AnimationName } from '@/lib/types'
import { useAxieModel } from '@/hooks/useAxieModel'

export interface PlayerModelHandle {
  playAnimation: (name: AnimationName) => void
  loadAnimation: (name: AnimationName) => Promise<void>
}

interface PlayerModelProps {
  character: CharacterName
}

const PlayerModel = forwardRef<PlayerModelHandle, PlayerModelProps>(
  function PlayerModel({ character }, ref) {
    const {
      groupRef,
      boneRoot,
      texture,
      skinnedMeshes,
      preloadEssential,
      loadAnimation,
      playAnimation,
      update,
    } = useAxieModel(character)

    useEffect(() => {
      preloadEssential().then(() => {
        playAnimation('idle')
      })
    }, [preloadEssential, playAnimation])

    useImperativeHandle(ref, () => ({
      playAnimation: (name: AnimationName) => {
        loadAnimation(name).then(() => playAnimation(name))
      },
      loadAnimation,
    }), [playAnimation, loadAnimation])

    useFrame((_, delta) => update(delta))

    return (
      <group ref={groupRef} dispose={null}>
        {/* Render only the bone hierarchy (not the whole clone) */}
        {boneRoot && <primitive object={boneRoot} />}

        {skinnedMeshes.map(({ name, mesh }) => (
          <skinnedMesh
            key={name}
            name={name}
            geometry={mesh.geometry}
            skeleton={mesh.skeleton}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial map={texture} />
          </skinnedMesh>
        ))}
      </group>
    )
  }
)

export default PlayerModel
