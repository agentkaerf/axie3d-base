# Axie 3D Adventure Game

## Project Overview

A web-based 3D adventure/exploration game featuring Axie characters (Buba, Puffy, Pomodoro). Players select a character, then explore a procedurally decorated world with third-person camera, physics, and discoverable points of interest.

## Tech Stack

- **Framework**: Next.js 14 + TypeScript + Tailwind CSS
- **3D Engine**: Three.js via React Three Fiber (`@react-three/fiber` 8.x)
- **Helpers**: `@react-three/drei` 9.x (useGLTF, useTexture, KeyboardControls, Sky, Outlines)
- **Physics**: `@react-three/rapier` 1.x (Rapier WASM)
- **Cloning**: `three-stdlib` (SkeletonUtils for skinned mesh cloning)
- **State**: Zustand 4.x
- **Three.js**: 0.166+ (required for drei 9's BatchedMesh export)

## Commands

- `npm run dev` — start dev server on localhost:3000
- `npm run build` — production build
- `npm run lint` — ESLint

## Project Structure

```
src/
  app/
    page.tsx                        # Landing page ("Play Now" button)
    game/page.tsx                   # Game page (dynamic Canvas import + UI overlays)
    layout.tsx                      # Root layout
    globals.css                     # Tailwind + body reset
  components/
    canvas/
      GameCanvas.tsx                # R3F Canvas + Rapier Physics + KeyboardControls
      Scene.tsx                     # Composes lighting + World + Player + Camera
    player/
      Player.tsx                    # RigidBody + CapsuleCollider + WASD movement + animation state
      PlayerModel.tsx               # Loads Axie GLB, applies texture, manages animations via ref
    camera/
      ThirdPersonCamera.tsx         # Smooth lerp follow camera (character-relative)
    world/
      World.tsx                     # Composes all environment elements + 5 POIs
      Terrain.tsx                   # Green ground plane with fixed RigidBody
      Trees.tsx                     # 80 procedural low-poly trees (seeded RNG) with collision
      Rocks.tsx                     # 40 procedural rocks with collision
      Water.tsx                     # Semi-transparent blue circle
      Skybox.tsx                    # drei Sky + fog
      PointOfInterest.tsx           # Floating octahedron, proximity glow, discovery trigger
    ui/
      CharacterSelect.tsx           # Pick Buba/Puffy/Pomodoro overlay
      HUD.tsx                       # Discovery counter + controls hint
  hooks/
    useAxieModel.ts                 # Core: loads GLB model + texture + on-demand animation GLBs
    useGameStore.ts                 # Zustand store (phase, character, animation, position, discoveries)
  lib/
    assets.ts                       # CDN URLs, character/animation constants, keyboard map
    animations.ts                   # State machine: InputState + grounded -> PlayerState -> AnimationName
    types.ts                        # Shared types (CharacterName, AnimationName, PlayerState, etc.)
```

## Asset Loading

Assets are loaded from jsdelivr CDN (no local copies needed):

- **Base models**: `https://cdn.jsdelivr.net/gh/axieinfinity/r3f-axie-starter/assets/models/starter_[char].glb`
- **Textures**: `https://cdn.jsdelivr.net/gh/axieinfinity/r3f-axie-starter/assets/textures/[char]_texture.jpg`
- **Animations**: `https://cdn.jsdelivr.net/gh/axieinfinity/axie-starter-3d-assets/glb/[char]/starter_[char]_[anim].glb`

We do NOT use the `@sms0nhaaa/r3f-axie-starter` npm package (it embeds 13.5MB of animation JSON). Instead we replicate the loading pattern and load animation GLBs on demand (~350KB each).

### Critical Asset Quirks

- **Puffy idle typo**: The file is `strater_puffy_idle.glb` (not `starter_`). Handled in `lib/assets.ts`.
- **Texture config**: ONLY set `flipY=false` + `needsUpdate=true`. Do NOT apply repeat/rotation/center transforms from the r3f-axie-starter reference — they compute to `(u,v)→(u,1-v)` which cancels out flipY=false.
- **Skeleton cloning**: Must use `SkeletonUtils.clone(scene)`, NOT `scene.clone()` (breaks skinned mesh bindings).
- **Animation loading**: Uses imperative `GLTFLoader` from three-stdlib (not useGLTF hook) for on-demand loading without component re-mounts.

## Architecture Decisions

- **Camera-relative movement**: W moves toward where the camera faces. Character model rotates via quaternion slerp.
- **Imperative animation loading**: `GLTFLoader.load()` extracts `AnimationClip` from each GLB, registers with shared `AnimationMixer`. Preloads idle/walk/run/jump; lazy-loads others.
- **Zustand over Context**: Avoids re-render cascades. Store is read by both R3F components (inside Canvas) and DOM components (HUD, CharacterSelect).
- **No ecctrl**: It expects all animations in one GLB. Our assets have separate GLBs per animation.
- **Dynamic import**: `GameCanvas` uses `next/dynamic` with `ssr: false` because Three.js needs `window`.

## Game Flow

1. Landing page (`/`) → click "Play Now"
2. Game page (`/game`) → phase starts as `characterSelect`
3. Pick character → assets preload → click "Start Adventure" → phase becomes `playing`
4. Explore world with WASD + Shift (sprint) + Space (jump)
5. Walk near Points of Interest to discover them (5 total)

## Version Compatibility Notes

- `three@0.166+` required for drei 9 (BatchedMesh export)
- `next.config` must be `.mjs` not `.ts` for Next 14
- `autoprefixer` must be explicitly installed for Tailwind/PostCSS
- Set iteration needs `Array.from()` wrapper (no downlevelIteration in tsconfig)

## Related Plans

- `unityplan.md` — Same game concept ported to Unity (C#, CharacterController, Cinemachine, Animator Override Controllers)
