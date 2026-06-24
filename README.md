# Axie 3D Adventure

A proof-of-concept web game that demonstrates how to load, render, and **animate Axie 3D characters** in the browser using the Axie 3D asset pipeline — base models, textures, and the separate per-animation GLB "mixer" assets — without pulling in the heavyweight starter package.

Pick an Axie (Buba, Puffy, or Pomodoro), then explore a small procedurally decorated world in third person with physics, WASD movement, sprint, jump, and discoverable points of interest.

> The real point of this repo is the **animation mixer integration** in [`src/hooks/useAxieModel.ts`](src/hooks/useAxieModel.ts) — see [How the Axie 3D mixer works](#how-the-axie-3d-mixer-works) below. The game world around it is just a playground to show the character animating in context.

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

Then click **Play Now** → pick a character → **Start Adventure**.

Requires Node 18+. All 3D assets stream from a CDN at runtime, so no asset download or build step is needed.

### Controls

| Key | Action |
| --- | --- |
| `W` `A` `S` `D` | Move (camera-relative) |
| `Shift` | Sprint |
| `Space` | Jump |
| `E` | Attack |
| Arrow keys | Orbit camera |

Walk near a floating point of interest to discover it. There are 5 to find (tracked in the HUD).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server on `localhost:3000` |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |

## Tech stack

- **Next.js 14** + **TypeScript** + **Tailwind CSS**
- **Three.js** (`0.166`) via **React Three Fiber** 8
- **@react-three/drei** 9 — `useGLTF`, `useTexture`, `KeyboardControls`, `Sky`
- **@react-three/rapier** 1 — physics & collision (Rapier WASM)
- **three-stdlib** — `SkeletonUtils` for skinned-mesh cloning, `GLTFLoader` for on-demand animation loading
- **Zustand** 4 — game state

## How the Axie 3D mixer works

Axie 3D ships a character as **separate GLB files**: one base model (mesh + skeleton, with a placeholder 1×1 texture), one JPG texture, and **one GLB per animation clip**. This PoC wires those together into a live `THREE.AnimationMixer` and loads clips on demand. The whole pattern lives in [`src/hooks/useAxieModel.ts`](src/hooks/useAxieModel.ts).

**1. Load and clone the base model.** Skinned meshes must be cloned with `SkeletonUtils.clone()` — a plain `scene.clone()` breaks the bone bindings.

```ts
const { scene } = useGLTF(getModelUrl(character))
const clone = useMemo(() => SkeletonUtils.clone(scene), [scene])
const { nodes } = useGraph(clone)   // pull out bone root + skinned meshes
```

**2. Apply the texture correctly.** The embedded GLB texture is a 1×1 placeholder, so the JPG is loaded separately. Set **only** `flipY = false` + `needsUpdate = true` — the repeat/rotation/center transforms from the official reference cancel out `flipY=false` and produce a wrong result.

```ts
texture.flipY = false
texture.needsUpdate = true
```

**3. Create one shared mixer** bound to the rendered group, and register each animation GLB's first clip as an action:

```ts
const action = mixer.clipAction(gltf.animations[0])
actionsRef.current.set(animName, action)
```

**4. Load clips on demand with an imperative `GLTFLoader`** (not the `useGLTF` hook — that would re-mount the component). Essential clips (`idle`, `walk`, `run`, `jump`) are preloaded; the rest (`attack`, `cuttree`, carry/gethit variants, etc.) are lazy-loaded. Each animation GLB is ~350KB.

**5. Crossfade between actions** with `fadeOut`/`fadeIn` for smooth transitions, and drive the mixer every frame:

```ts
playAnimation(name)        // fadeOut current, reset+fadeIn+play next (0.2s)
update(delta)              // mixer.update(delta) inside useFrame
```

A small state machine ([`src/lib/animations.ts`](src/lib/animations.ts)) maps input + grounded state → a `PlayerState` (idle / walking / running / jumping / falling / attacking) → an animation name, which `Player` feeds into `playAnimation`.

### Why not the official starter package?

The `@…/r3f-axie-starter` npm package embeds **13.5MB of animation JSON**. This repo replicates its loading pattern but fetches animation GLBs on demand instead, keeping the bundle small.

## Asset URLs

All assets stream from jsDelivr (see [`src/lib/assets.ts`](src/lib/assets.ts)):

- **Models** — `…/r3f-axie-starter/assets/models/starter_[char].glb`
- **Textures** — `…/r3f-axie-starter/assets/textures/[char]_texture.jpg`
- **Animations** — `…/axie-starter-3d-assets/glb/[char]/starter_[char]_[anim].glb`

> ⚠️ **Known asset quirk:** Puffy's idle clip is misspelled `strater_puffy_idle.glb` (not `starter_`). It's special-cased in `getAnimationUrl()`.

## Project structure

```
src/
  app/                      # Next.js routes: landing page, /game, layout
  components/
    canvas/                 # R3F Canvas, Physics, Scene composition
    player/                 # Player rigidbody/controller + PlayerModel (mixer consumer)
    camera/                 # Third-person follow camera
    world/                  # Terrain, trees, rocks, water, sky, points of interest
    ui/                     # Character select, HUD
  hooks/
    useAxieModel.ts         # ⭐ Axie model + texture + animation mixer integration
    useGameStore.ts         # Zustand store (phase, character, discoveries, …)
  lib/
    assets.ts               # CDN URLs, character/animation constants, keymap
    animations.ts           # Input → PlayerState → AnimationName state machine
    types.ts                # Shared types
```

See [`CLAUDE.md`](CLAUDE.md) for deeper architecture notes and version-compatibility gotchas.

## Status

This is a **proof of concept**, not a production game. Expect rough edges: assets depend on a third-party CDN, there's no save/persistence, and the world is intentionally minimal.
