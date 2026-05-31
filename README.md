# 3D Drone Soccer Simulator ( Svelte +  Threlte )

A 3D drone soccer practice simulator embedded as an iframe component in TWReporter Kids articles (via Keystone CMS). Players fly a drone through a goal ring using keyboard or mobile virtual joystick controls.

---

## Project Setup
```
pnpm install
pnpm run dev -- --host
```

---

## Project Context

- **Platform**: TWReporter Kids (`kids.twreporter.org`)
- **Embed method**: `<iframe>` inserted via Keystone CMS article editor
- **Audience**: High school students and below
- **Purpose**: Single article embed — interactive companion to a drone soccer article
- **Deployment**: Static build hosted on Vercel / GitHub Pages / Cloudflare Pages

---

## Tech Stack

| Layer               | Technology                                      |
| ------------------- | ----------------------------------------------- |
| Framework           | Svelte 5 + TypeScript                           |
| 3D Rendering        | Threlte v8 (`@threlte/core`, `@threlte/extras`) |
| Build Tool          | Vite                                            |
| Mobile Joystick     | nipplejs                                        |
| Physics             | Custom (no Rapier) — velocity vectors + inertia |
| Collision Detection | Math-based (no physics engine)                  |

---

## Library Responsibilities

These three libraries coexist in every component — understanding what each owns prevents confusion:

| Library | Owns | Examples |
|---|---|---|
| **Three.js** (`three`) | 3D math, geometry, materials, scene graph | `Vector3`, `Euler`, `MathUtils`, `TorusGeometry` |
| **Threlte** (`@threlte/core`, `@threlte/extras`) | Svelte component layer over Three.js | `<Canvas>`, `<T.Mesh>`, `useTask`, `useGltf` |
| **Svelte 5** | Reactivity, component lifecycle, shared state | `$state`, `$effect`, `.svelte.ts` modules |

**Key rule**: Threlte wraps Three.js scene objects as Svelte components, but does not replace Three.js math. Import math utilities (`Vector3`, `MathUtils`, etc.) directly from `three` — they are the same instance Threlte uses internally.

---

## Features

- 3D drone flight in an open arena with a single goal ring
- Dual-joystick control scheme (mirrors real RC controller logic)
- Third-person follow camera
- Simple scoring — detects when drone passes through the goal ring
- Responsive: keyboard on desktop, virtual joystick on mobile
- Self-contained static build, embeddable as `<iframe>`

---

## Control Scheme

### Keyboard (Desktop)

| Key | Action |
|---|---|
| `W` / `S` | Throttle up / down |
| `A` / `D` | Yaw left / right |
| `↑` / `↓` | Pitch forward / backward |
| `←` / `→` | Roll left / right |

### Virtual Joystick (Mobile)

| Joystick | Axis | Action |
|---|---|---|
| Left | Y | Throttle up / down |
| Left | X | Yaw left / right |
| Right | Y | Pitch forward / backward |
| Right | X | Roll left / right |

---

## Physics Model

No physics engine is used. Physics are approximated with:

- **Velocity vectors** — one per axis (x, y, z, yaw)
- **Linear drag** — velocity multiplied by a damping factor each frame (`0.92` default)
- **Visual tilt** — mesh rotation on X/Z axes reflects current velocity for realism
- **No gravity** — drone hovers in place when no input is given

This gives a "floaty but directional" feel appropriate for the audience without the complexity of full 6DOF simulation.

```
// Core physics loop (inside useTask)
velocity.x += input.roll  * ACCELERATION
velocity.y += input.throttle * ACCELERATION
velocity.z += input.pitch * ACCELERATION
yaw        += input.yaw   * YAW_RATE

velocity.x *= DAMPING  // e.g. 0.92
velocity.y *= DAMPING
velocity.z *= DAMPING

drone.position.add(velocity)
drone.rotation.y = yaw
drone.rotation.x = -velocity.z * TILT_FACTOR
drone.rotation.z = -velocity.x * TILT_FACTOR
```

---

## Goal Detection

No collider mesh. Scoring uses a math check each frame:

```
// Drone passes through the goal plane and lands within the ring radius
passedPlane = lastZ < goal.z && currentZ >= goal.z
inRing      = sqrt((drone.x - goal.x)² + (drone.y - goal.y)²) < GOAL_RADIUS

if passedPlane && inRing → score++
```

Update `lastZ` every frame after the check.

---

## Project Structure

```
2026-06-drone-soccer/
├── src/
│   ├── assets/
│   │   └── drone-soccer.glb           # Drone 3D model
│   ├── lib/
│   │   ├── components/                # 3D scene components
│   │   │   ├── Arena.svelte           # Floor grid + boundary cage (Grid + Edges)
│   │   │   ├── Camera.svelte          # Third-person chase camera
│   │   │   ├── Drone.svelte           # GLB model + physics loop
│   │   │   ├── Goal.svelte            # Goal ring + score detection (future)
│   │   │   ├── HUD.svelte             # Score overlay (future)
│   │   │   ├── Joystick.svelte        # nipplejs mobile joystick (touch-only)
│   │   │   └── KeyboardControls.svelte # Headless keyboard handler
│   │   ├── constants/
│   │   │   └── colors.ts              # Kids Design System colour tokens (as const)
│   │   ├── state/                     # Shared reactive state (.svelte.ts)
│   │   │   ├── droneState.svelte.ts   # Drone position — written by Drone, read by Camera + Goal
│   │   │   └── input.svelte.ts        # Input axes — written by keyboard + joystick, read by Drone
│   │   └── Scene.svelte               # Threlte Canvas entry point
│   ├── App.svelte
│   └── main.js
├── public/
├── index.html
├── vite.config.js
├── tsconfig.json
├── package.json
└── README.md
```

### File Architecture Ideology

**`.svelte.ts` modules** — any state shared between sibling components lives in a `.svelte.ts` file using Svelte 5 `$state`. This makes it a module-level singleton accessible to any component that imports it.

```
input.svelte.ts      → written by keyboard + joystick, read by Drone physics
droneState.svelte.ts → written by Drone, read by Camera + Goal
```

**`.ts` modules** — pure TypeScript with no runes. Used for constants, utilities, and type definitions.

```
constants/colors.ts  → Kids Design System colour tokens, used by Three.js materials and HTML overlays
```

**Svelte components (`.svelte`)** — own their local logic and reference shared state from `.svelte.ts` modules. Threlte hooks (`useTask`, `useGltf`) and `<T.*>` components live here.

---

## Input State Design

Input is stored as a plain reactive object using Svelte 5 runes — **not** a Svelte store — to avoid triggering reactivity on every frame:

```ts
// src/lib/state/input.svelte.ts
export const input = $state({
  throttle: 0,  // -1 to 1
  yaw: 0,       // -1 to 1
  pitch: 0,     // -1 to 1
  roll: 0,      // -1 to 1
})
```

Both keyboard and joystick handlers write to this same object. The physics loop in `useTask` reads from it directly.

---

## Camera Behavior

Third-person follow camera using Threlte's `useTask`:

- Positioned behind and above the drone (`offset: [0, 2, 6]` rotated by drone yaw)
- Uses manual `lerp` per axis (`factor: 0.08`) — gives a natural "chasing" feel
- Looks at drone position each frame via `camera.lookAt(x, y, z)`
- Drone position shared via `droneState.svelte.js` singleton

---

## Joystick Behavior

Two `static`-mode nipplejs sticks (left + right), rendered as an HTML overlay above the canvas — **not** inside `<Canvas>`. Mounted in `App.svelte` alongside `KeyboardControls`.

- **Touch-only**: the whole overlay is gated behind `matchMedia('(pointer: coarse)')`, so desktop stays keyboard-only.
- **Axis mapping** (writes the same `input` object the keyboard does):

  | Stick | nipplejs | `input` |
  |---|---|---|
  | Left X | `vector.x` | `yaw` |
  | Left Y | `vector.y` | `throttle` |
  | Right X | `vector.x` | `roll` |
  | Right Y | `-vector.y` | `pitch` (sign flipped — stick up = fly forward = `-z`) |

- **nipplejs 1.0.x payload**: the `move` handler receives a single `evt`; data is on `evt.data` (`evt.data.vector`, range −1..1). The pre-1.0 `(evt, data)` two-arg signature is gone.
- **Reset**: the `end` event zeroes that stick's axes (the `move` event does not fire at rest).
- **Styling**: nipplejs injects `.joystick` > `.back` + `.front` divs at runtime, so CSS targets them via `:global()`. It sets `background`/`opacity`/`size`/`border-radius` as inline styles → override those with `!important`; `box-shadow`/`border` are free. There is no built-in "active" class, so `start`/`end` toggle a local `active` flag for pressed-state styling. Idle fade is the `restOpacity` option.

---

## Deployment & Embedding

Deploy `dist/` to any static host (Vercel recommended).

Embed in Keystone article editor:

```html
<iframe
  src="https://your-deployed-url.com"
  width="100%"
  height="560"
  style="border:none;"
  allow="gyroscope; accelerometer"
  allowfullscreen
>
</iframe>
```

> **Note**: The `allow="gyroscope; accelerometer"` attribute is included for future gyroscope control support on mobile.

---

## Key Constants (tunable)

| Constant | Default | Description |
|---|---|---|
| `ACCELERATION` | `0.004` | How fast drone responds to input |
| `DAMPING` | `0.92` | Inertia — lower = snappier, higher = floatier |
| `YAW_RATE` | `0.03` | Rotation speed |
| `TILT_FACTOR` | `0.4` | Visual tilt intensity |
| `GOAL_RADIUS` | `1.2` | Goal ring radius in scene units |
| `MAX_VELOCITY` | `0.3` | Velocity cap per axis |

---

## Known Constraints

- **Single-player only** — no multiplayer
- **No wind or gravity** — simplified physics by design
- **GLB model** — drone uses `Drone.glb` loaded via `useGltf`; swap the file in `src/assets/` to update the model
- **iframe scroll conflict on mobile** — joystick area must use `touch-action: none` to prevent page scroll interference