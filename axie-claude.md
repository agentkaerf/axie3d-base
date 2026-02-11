# Axie 3D Adventure Game — Claude Code Reproduction Prompt

## Instructions

Build a web-based 3D adventure game featuring Axie characters using Next.js and React Three Fiber. The player selects from three Axie characters (Buba, Puffy, Pomodoro), then explores a procedurally generated world with WASD movement, a third-person camera, physics collisions, and discoverable points of interest.

## Tech Stack

| Package | Version | Purpose |
|---|---|---|
| next | ^14.0.0 | Framework |
| react / react-dom | ^18.2.0 | UI |
| three | ^0.166.1 | 3D engine (must be 0.166+ for drei 9 compatibility) |
| @react-three/fiber | ^8.14.2 | React renderer for Three.js |
| @react-three/drei | ^9.83.9 | Helpers (useGLTF, useTexture, KeyboardControls, Sky) |
| @react-three/rapier | ^1.1.1 | Physics (Rapier WASM) |
| three-stdlib | ^2.23.0 | SkeletonUtils, GLTFLoader |
| zustand | ^4.4.1 | State management |
| typescript | ^5.2.0 | Types |
| tailwindcss | ^3.3.0 | Styling |
| autoprefixer | ^10.4.24 | Required by PostCSS/Tailwind (must be explicitly installed) |

## Critical Configuration Notes

- `next.config` MUST be `.mjs` (not `.ts`) for Next.js 14
- Enable WASM in webpack config: `config.experiments = { ...config.experiments, asyncWebAssembly: true }`
- `autoprefixer` must be in devDependencies (Tailwind/PostCSS won't work without it)
- tsconfig uses `@/*` path alias mapping to `./src/*`

## Asset URLs

All assets come from two Axie Infinity GitHub repos, served via jsdelivr CDN:

```
Base models:  https://cdn.jsdelivr.net/gh/axieinfinity/r3f-axie-starter/assets/models/starter_[char].glb
Textures:     https://cdn.jsdelivr.net/gh/axieinfinity/r3f-axie-starter/assets/textures/[char]_texture.jpg
Animations:   https://cdn.jsdelivr.net/gh/axieinfinity/axie-starter-3d-assets/glb/[char]/starter_[char]_[anim].glb
```

Characters: `buba`, `puffy`, `pomodoro`

Animations (15 per character): `idle`, `idleattack`, `idlecarryitem`, `idlegethit`, `jump`, `run`, `runattack`, `runcarryitem`, `rungethit`, `runjump`, `walk`, `walkattack`, `walkcarryitem`, `walkjump`, `cuttree`

**IMPORTANT — Known quirk:** Puffy's idle animation file is misspelled: `strater_puffy_idle.glb` (not `starter_`). Handle this in the URL builder.

## Critical Texture Loading Pattern

**DO NOT copy the texture transforms from the r3f-axie-starter reference repo.** That repo applies `wrapS=RepeatWrapping`, `repeat.x=-1`, `center=(0.5,0.5)`, `rotation=Math.PI`, and `flipY=false`. The math of those transforms computes to a UV transform of `(u, v) → (u, 1-v)`, which is a vertical flip that **cancels out** the `flipY=false`, making it equivalent to the default `flipY=true` with no transforms — which gives wrong results.

The correct texture configuration is simply:

```typescript
const texture = useTexture(textureUrl)
useMemo(() => {
  texture.flipY = false
  texture.needsUpdate = true
}, [texture])
```

Why: GLTF models use a top-left UV origin convention. Three.js's `useTexture` (via TextureLoader) defaults to `flipY=true` (bottom-left origin). Setting `flipY=false` aligns the texture orientation with what the GLTF UVs expect. No other transforms are needed.

## Model Loading Pattern

Use `SkeletonUtils.clone(scene)` (from three-stdlib) — never `scene.clone()`, which breaks skinned mesh skeleton bindings.

Use `useGraph(clone)` from `@react-three/fiber` to extract a flat `{ nodes }` map from the cloned scene. Then:

1. Render ONLY the bone hierarchy root (`nodes['JointBase_Grp']`) via `<primitive>` — NOT the entire clone
2. Render each skinned mesh as a separate JSX `<skinnedMesh>` element with declarative `<meshStandardMaterial map={texture} />`
3. Find skinned meshes by iterating `Object.entries(nodes)` and checking `isSkinnedMesh`

```tsx
<group ref={groupRef} dispose={null}>
  {boneRoot && <primitive object={boneRoot} />}
  {skinnedMeshes.map(({ name, mesh }) => (
    <skinnedMesh key={name} geometry={mesh.geometry} skeleton={mesh.skeleton} castShadow receiveShadow>
      <meshStandardMaterial map={texture} />
    </skinnedMesh>
  ))}
</group>
```

The GLB scene graph structure is:
```
Group "" (root, 2 children)
  ├── Group "JointBase_Grp" → contains all bones/skeleton
  └── Group "SM_Mesh" → contains all skinned meshes (SM_Body, SM_Eye_M_1, SM_Mouth_1, SM_Ear_R_1, SM_Ear_L_1, SM_Horn_T_1, SM_Back_M_1, SM_Tail_M_1)
```

## Animation Loading Pattern

Do NOT use the `@sms0nhaaa/r3f-axie-starter` npm package — it embeds 13.5MB of animation JSON in the bundle.

Instead, load animation GLBs on demand (~350KB each) using an imperative `GLTFLoader`:

```typescript
const gltfLoader = new GLTFLoader()  // module-level singleton

const loadAnimation = async (animName) => {
  const url = getAnimationUrl(character, animName)
  return new Promise((resolve) => {
    gltfLoader.load(url, (gltf) => {
      if (gltf.animations.length > 0 && mixer) {
        const clip = gltf.animations[0]
        clip.name = animName
        const action = mixer.clipAction(clip)
        actions.set(animName, action)
      }
      resolve()
    })
  })
}
```

Preload `idle`, `walk`, `run`, `jump` on character select. Lazy-load others when needed.

Use `AnimationMixer` with `fadeIn(0.2)` / `fadeOut(0.2)` for smooth crossfade transitions.

## File Structure

```
src/
  app/
    layout.tsx              # Root layout with metadata
    page.tsx                # Landing page with "Play Now" button → navigates to /game
    game/page.tsx           # Game page — dynamic import of GameCanvas (ssr: false), CharacterSelect overlay, HUD
    globals.css             # Tailwind directives + body reset (overflow hidden, 100vw/vh)
  components/
    canvas/
      GameCanvas.tsx        # <KeyboardControls> + <Canvas shadows> + <Physics gravity={[0,-20,0]}> + <Suspense> + <Scene>
      Scene.tsx             # Composes: ambientLight + directionalLight (shadows) + World + Player + ThirdPersonCamera
    player/
      Player.tsx            # RigidBody + CapsuleCollider + WASD/camera-relative movement + animation state machine
      PlayerModel.tsx       # forwardRef, loads Axie via useAxieModel, manages animations via imperative handle
    camera/
      ThirdPersonCamera.tsx # Orbital camera: arrow keys control yaw/pitch, lerp follow, min/max polar angle
    world/
      World.tsx             # Composes: Skybox + Terrain + Trees + Rocks + Water + 5 PointsOfInterest
      Terrain.tsx           # Green box (200x1x200) with fixed RigidBody
      Trees.tsx             # 80 procedural trees (seeded RNG, cone+cylinder geometry, collision)
      Rocks.tsx             # 40 procedural rocks (dodecahedron geometry, hull collider)
      Water.tsx             # Semi-transparent blue circle at (30,0,30)
      Skybox.tsx            # drei Sky + fog
      PointOfInterest.tsx   # Floating octahedron, hover animation, proximity detection, discovery trigger
    ui/
      CharacterSelect.tsx   # 3 character cards, preloads assets on click, "Start Adventure" button
      HUD.tsx               # Discovery counter (X/5), interaction prompt, controls hint
  hooks/
    useAxieModel.ts         # Core hook: useGLTF + useTexture + SkeletonUtils.clone + useGraph + AnimationMixer + on-demand GLTFLoader
    useGameStore.ts         # Zustand store: phase, selectedCharacter, animation, playerPosition, discoveredLocations, interactionPrompt
  lib/
    assets.ts               # CDN URLs, CHARACTERS array, ANIMATIONS array, PRELOAD_ANIMATIONS, KEYBOARD_MAP (WASD + arrows + shift + space + E)
    animations.ts           # getPlayerState(input, grounded, velocity) → PlayerState; stateToAnimation(state) → AnimationName
    types.ts                # CharacterName, AnimationName, PlayerState, InputState, GamePhase
```

## Game Flow

1. Landing page (`/`) → "Play Now" button → navigates to `/game`
2. Game page starts in `characterSelect` phase → shows CharacterSelect overlay
3. User picks character (preloads model + essential animations) → clicks "Start Adventure"
4. Phase becomes `playing` → HUD shows, player spawns at (0, 3, 0)
5. WASD moves player (camera-relative), Shift sprints, Space jumps, Arrow keys orbit camera
6. Walk near PointOfInterest (radius 4) → discovered, counter increments (5 total to find)

## Player Movement Details

- Camera-relative: W moves toward camera facing direction
- Walk speed: 4, Run speed: 8, Jump velocity: 6
- Character model rotates toward movement direction via quaternion slerp (speed 10)
- Physics: CapsuleCollider(halfHeight=0.4, radius=0.5), linear damping 0.5, rotation locked
- Grounded detection: `|velocity.y| < 0.5`
- Animation state machine: input + grounded + verticalVelocity → PlayerState → AnimationName

## Key Pitfalls to Avoid

1. **Texture transforms**: Do NOT apply repeat/rotation/center from the reference repo. Just `flipY=false` + `needsUpdate=true`.
2. **SkeletonUtils.clone**: Always use this for GLB scenes with skinned meshes, never `scene.clone()`.
3. **Render bone root, not full clone**: Render `<primitive object={nodes.JointBase_Grp} />`, not `<primitive object={clone} />`. Rendering the full clone includes hidden original meshes that conflict with the JSX skinned meshes.
4. **Puffy idle typo**: The CDN file is `strater_puffy_idle.glb` not `starter_puffy_idle.glb`.
5. **Dynamic import**: GameCanvas must use `next/dynamic` with `ssr: false` because Three.js needs `window`.
6. **Set iteration**: Use `Array.from(set)` instead of `[...set]` spread without `downlevelIteration` in tsconfig.
7. **Three.js version**: Must be 0.166+ for drei 9 compatibility (BatchedMesh export).
8. **next.config extension**: Must be `.mjs` not `.ts` for Next.js 14.
9. **No `initialized` ref guard on animation preload**: With `reactStrictMode: true`, React double-invokes effects. If you use an `initialized` ref to skip the second run, the animation mixer gets destroyed and recreated (by its own cleanup/re-run), but the preload effect is skipped because the ref is already `true`. Result: the new mixer has no animations. Instead, let the preload `useEffect` run based on its dependency array alone — `preloadEssential` and `playAnimation` are stable `useCallback` refs, so it only re-runs when the character changes (which is correct).

```tsx
// WRONG — breaks in React strict mode:
const initialized = useRef(false)
useEffect(() => {
  if (initialized.current) return
  initialized.current = true
  preloadEssential().then(() => playAnimation('idle'))
}, [preloadEssential, playAnimation])

// CORRECT:
useEffect(() => {
  preloadEssential().then(() => playAnimation('idle'))
}, [preloadEssential, playAnimation])
```
