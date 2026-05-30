# 3D Drone Soccer Simulator ( Svelte +  Threlte )

A 3D drone soccer practice simulator embedded as an iframe component in TWReporter Kids articles (via Keystone CMS). Players fly a drone through a goal ring using keyboard or mobile virtual joystick controls.

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
| Framework           | Svelte 5                                        |
| 3D Rendering        | Threlte v8 (`@threlte/core`, `@threlte/extras`) |
| Build Tool          | Vite                                            |
| Mobile Joystick     | nipplejs                                        |
| Physics             | Custom (no Rapier) — velocity vectors + inertia |
| Collision Detection | Math-based (no physics engine)                  |

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
// Core physics loop (inside useFrame)
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
drone-soccer-sim/
├── src/
│   ├── lib/
│   │   ├── Scene.svelte          # Threlte Canvas + scene root
│   │   ├── Drone.svelte          # Drone mesh + rotor animation
│   │   ├── Goal.svelte           # Goal ring mesh + score detection
│   │   ├── Arena.svelte          # Floor grid + environment
│   │   ├── FollowCamera.svelte   # Third-person chase camera
│   │   ├── HUD.svelte            # Score display overlay
│   │   ├── Joystick.svelte       # nipplejs mobile virtual joystick
│   │   └── input.svelte.js       # Shared input state (Svelte 5 runes)
│   ├── App.svelte
│   └── main.js
├── public/
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

---

## Input State Design

Input is stored as a plain reactive object using Svelte 5 runes — **not** a Svelte store — to avoid triggering reactivity on every frame:

```js
// src/lib/input.svelte.js
export const input = $state({
  throttle: 0,  // -1 to 1
  yaw: 0,       // -1 to 1
  pitch: 0,     // -1 to 1
  roll: 0,      // -1 to 1
})
```

Both keyboard and joystick handlers write to this same object. The physics loop in `useFrame` reads from it directly.

---

## Camera Behavior

Third-person follow camera using Threlte's `useFrame`:

- Positioned behind and above the drone (`offset: [0, 2, -6]`)
- Uses `lerp` for smooth lag (`factor: 0.08`) — gives a natural "chasing" feel
- Looks at drone position each frame

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
- **No GLTF model** — drone uses procedural geometry (box + cylinders); replace with `.glb` if visual quality needs upgrading
- **iframe scroll conflict on mobile** — joystick area must use `touch-action: none` to prevent page scroll interference