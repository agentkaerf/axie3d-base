import { useGLTF, useTexture } from '@react-three/drei'
import { useGraph } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useCallback } from 'react'
import * as THREE from 'three'
import { SkeletonUtils, GLTFLoader } from 'three-stdlib'
import type { CharacterName, AnimationName } from '@/lib/types'
import { getModelUrl, getTextureUrl, getAnimationUrl, PRELOAD_ANIMATIONS } from '@/lib/assets'

const gltfLoader = new GLTFLoader()

export interface AxieMeshInfo {
  name: string
  mesh: THREE.SkinnedMesh
}

export function useAxieModel(character: CharacterName) {
  const groupRef = useRef<THREE.Group>(null!)
  const mixerRef = useRef<THREE.AnimationMixer | null>(null)
  const actionsRef = useRef<Map<string, THREE.AnimationAction>>(new Map())
  const currentActionRef = useRef<THREE.AnimationAction | null>(null)
  const loadingRef = useRef<Set<string>>(new Set())

  // Load base model
  const { scene } = useGLTF(getModelUrl(character))

  // Load texture — try pure GLTF convention (flipY=false only, no other transforms)
  const texture = useTexture(getTextureUrl(character))
  useMemo(() => {
    texture.flipY = false
    texture.needsUpdate = true
  }, [texture])

  // Clone scene and extract nodes using useGraph (same pattern as reference)
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene])
  const { nodes } = useGraph(clone)

  // Extract bone hierarchy root and all skinned meshes from the node map
  const { boneRoot, skinnedMeshes } = useMemo(() => {
    // Find the bone hierarchy root - try known group names from the GLB structure
    const root = (nodes['JointBase_Grp'] || nodes['Root_Character'] || nodes['Hip_JNT']) as THREE.Object3D

    // Collect all skinned meshes from the node map
    const meshes: AxieMeshInfo[] = []
    Object.entries(nodes).forEach(([name, node]) => {
      if ((node as THREE.SkinnedMesh).isSkinnedMesh) {
        meshes.push({ name, mesh: node as THREE.SkinnedMesh })
      }
    })
    return { boneRoot: root, skinnedMeshes: meshes }
  }, [nodes])

  // Initialize mixer
  useEffect(() => {
    if (groupRef.current) {
      mixerRef.current = new THREE.AnimationMixer(groupRef.current)
    }
    return () => {
      mixerRef.current?.stopAllAction()
      mixerRef.current = null
      actionsRef.current.clear()
      loadingRef.current.clear()
    }
  }, [clone])

  // Load a single animation GLB and register its clip
  const loadAnimation = useCallback(async (animName: AnimationName): Promise<void> => {
    if (actionsRef.current.has(animName) || loadingRef.current.has(animName)) return
    loadingRef.current.add(animName)

    const url = getAnimationUrl(character, animName)
    return new Promise<void>((resolve) => {
      gltfLoader.load(
        url,
        (gltf) => {
          if (gltf.animations.length > 0 && mixerRef.current) {
            const clip = gltf.animations[0]
            clip.name = animName
            const action = mixerRef.current.clipAction(clip)
            actionsRef.current.set(animName, action)
          }
          loadingRef.current.delete(animName)
          resolve()
        },
        undefined,
        (err) => {
          console.warn(`Failed to load animation ${animName}:`, err)
          loadingRef.current.delete(animName)
          resolve()
        }
      )
    })
  }, [character])

  const preloadEssential = useCallback(async () => {
    await Promise.all(PRELOAD_ANIMATIONS.map((a) => loadAnimation(a)))
  }, [loadAnimation])

  const playAnimation = useCallback((animName: AnimationName, fadeDuration = 0.2) => {
    const action = actionsRef.current.get(animName)
    if (!action || action === currentActionRef.current) return

    if (currentActionRef.current) {
      currentActionRef.current.fadeOut(fadeDuration)
    }
    action.reset().fadeIn(fadeDuration).play()
    currentActionRef.current = action
  }, [])

  const update = useCallback((delta: number) => {
    mixerRef.current?.update(delta)
  }, [])

  return {
    groupRef,
    boneRoot,
    texture,
    skinnedMeshes,
    loadAnimation,
    preloadEssential,
    playAnimation,
    update,
  }
}
