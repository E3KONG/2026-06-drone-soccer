<script>
  import { T, useTask } from '@threlte/core'
  import { useGltf } from '@threlte/extras'
  import { Vector3, Euler, MathUtils } from 'three'
  import droneUrl from '../../assets/drone-soccer.glb?url'
  import {
    enemies,
    ENEMY_RADIUS,
    originalShell,
  } from '../state/enemyState.svelte.ts'
  import { dronePos } from '../state/droneState.svelte.ts'
  import { game } from '../state/game.svelte.ts'
  import { GOALS, GOAL_RING_R, GOAL_TUBE_R } from './Goal.svelte'

  // 在 A 門(z=-6.5)前方來回巡邏的活動範圍
  const REGION_MIN = new Vector3(-1, 3, -6.2)
  const REGION_MAX = new Vector3(1, 4, -5.5)
  const ENEMY_EMISSIVE = '#FF1A1A'
  const FRONT_CUBE_POS = [0, 0.0025, -0.135]
  const FRONT_CUBE_SIZE = [0.005, 0.01, 0.02]
  const FRONT_CUBE_EMISSION = 100

  const MAX_SPEED = 2
  const STEER = 2.5 // 速度趨近期望值的速率，越小越柔順
  const ARRIVE = 0.3 // 到達航點門檻，換新目標
  const SLOWDOWN = 0.8 // 進入此半徑開始減速，避免到點急轉
  const YAW_RATE = 5
  const TILT_RATE = 6
  const TILT_K = 0.4 // 轉向力 → 傾斜量
  const MAX_TILT = 0.5
  const FIN_SPIN = 1.0 // 每幀槳葉自轉(弧度)，恆定空轉
  const GROUND_Y = 0.2 // 開賽前停在地面，之後靠 seek 飛上巡邏區
  const HARASS_AT = 60 // match 剩 60 秒(含)以下改為繞著玩家飛
  const ORBIT_Y = 0
  const ENEMY_RESTITUTION = 0.5
  // harass：更快、更俐落、貼著玩家繞
  const HARASS_SPEED = 3.6
  const HARASS_STEER = 6
  const HARASS_ORBIT_R = 0.6
  const HARASS_ORBIT_SPEED = 3.2
  const HARASS_WOBBLE = 0.5 // 收斂擺動幅度，繞得更貼

  const rand = (a, b) => MathUtils.randFloat(a, b)
  // 每台敵機獨立的三軸擺動參數，讓繞圈不是平面圓而是 3D 亂飄
  const seedWobble = (a) => {
    a.fx = rand(0.6, 1.4)
    a.fy = rand(0.5, 1.1)
    a.fz = rand(0.6, 1.4)
    a.fr = rand(0.3, 0.7)
    a.px = rand(0, Math.PI * 2)
    a.py = rand(0, Math.PI * 2)
    a.pz = rand(0, Math.PI * 2)
    a.ax = rand(0.4, 0.9)
    a.ay = rand(0.5, 1.0)
    a.az = rand(0.4, 0.9)
  }

  const randomTarget = () =>
    new Vector3(
      MathUtils.randFloat(REGION_MIN.x, REGION_MAX.x),
      MathUtils.randFloat(REGION_MIN.y, REGION_MAX.y),
      MathUtils.randFloat(REGION_MIN.z, REGION_MAX.z),
    )

  const gltf = useGltf(droneUrl)
  // a.pos 直接引用 enemies[i]，更新它即同步給 Drone.svelte 的碰撞讀取
  const agents = enemies.map((pos) => ({
    pos,
    vel: new Vector3(),
    target: randomTarget(),
    yaw: 0,
    pitch: 0,
    roll: 0,
    orbitAngle: 0,
  }))
  let models = $state([])
  let modelFins = [] // 每台敵機的槳葉 mesh，供 task 自轉

  $effect(() => {
    const g = $gltf
    if (!g) return
    const fl = []
    models = enemies.map(() => {
      const scene = g.scene.clone(true)
      const fins = []
      scene.traverse((o) => {
        if (o.name === 'Striker-Tag') {
          o.visible = false
          return
        }
        if (!o.isMesh) return
        o.castShadow = true

        const fm = o.name.match(/^Fin_export_(\d+)/)
        if (fm) {
          const idx = Number(fm[1])
          o.userData.spinDir = idx === 0 || idx === 3 ? 1 : -1
          const base = Array.isArray(o.material) ? o.material[0] : o.material
          if (base) {
            const mat = base.clone()
            mat.color.set(ENEMY_EMISSIVE)
            if (mat.emissive) {
              mat.emissive.set(ENEMY_EMISSIVE)
              mat.emissiveIntensity = 4
            }
            o.material = mat
          }
          fins.push(o)
          return
        }

        const mats = Array.isArray(o.material) ? o.material : [o.material]
        let changed = false
        const out = mats.map((m) => {
          if (m && m.name === 'Led strip - Friends') {
            const c = m.clone()
            c.emissive.set(ENEMY_EMISSIVE)
            c.emissiveIntensity = 500
            changed = true
            return c
          }
          if (m && m.name === 'Drone-Shell - Main') {
            changed = true
            return originalShell.mat ?? m // 沿用原始黑殼，不跟玩家變白
          }
          return m
        })
        if (changed) o.material = Array.isArray(o.material) ? out : out[0]
      })
      fl.push(fins)
      return scene
    })
    modelFins = fl
  })

  $effect(() => {
    game.resetTick
    game.started // 開賽(或重來)時重新從地面起飛
    agents.forEach((a, i) => {
      const t = agents.length > 1 ? i / (agents.length - 1) : 0.5
      a.pos.set(
        MathUtils.lerp(-0.6, 0.6, t),
        GROUND_Y,
        MathUtils.lerp(REGION_MIN.z, REGION_MAX.z, t),
      )
      a.vel.set(0, 0, 0)
      a.target = randomTarget()
      a.yaw = a.pitch = a.roll = 0
      a.orbitAngle = (i / agents.length) * Math.PI * 2 // 各據一方，繞圈不重疊
      seedWobble(a)
    })
  })

  const dampAngle = (cur, target, rate, dt) => {
    let diff = ((target - cur + Math.PI) % (2 * Math.PI)) - Math.PI
    if (diff < -Math.PI) diff += 2 * Math.PI
    return cur + diff * Math.min(rate * dt, 1)
  }

  const desired = new Vector3()
  const force = new Vector3()
  const away = new Vector3()
  const fwd = new Vector3()
  const right = new Vector3()
  const gToE = new Vector3()
  const gNormal = new Vector3()
  const eul = new Euler(0, 0, 0, 'YXZ')
  let clock = 0 // 擺動相位用的累計時間

  useTask((delta) => {
    const dt = Math.min(delta, 0.05) // 卡頓時鉗住，避免瞬移
    const active =
      game.started && !game.paused && !game.over && (game.countdown ?? 0) === 0

    if (active) {
      clock += dt

      // 互不重疊：兩兩太近就對稱推開
      const minGap = ENEMY_RADIUS * 2
      for (let i = 0; i < agents.length; i++) {
        for (let j = i + 1; j < agents.length; j++) {
          away.subVectors(agents[i].pos, agents[j].pos)
          const d = away.length()
          if (d > 1e-4 && d < minGap) {
            away.multiplyScalar((minGap - d) / d / 2)
            agents[i].pos.add(away)
            agents[j].pos.sub(away)
          }
        }
      }

      const harass = game.mode === 'match' && game.timeLeft <= HARASS_AT
      const maxSpeed = harass ? HARASS_SPEED : MAX_SPEED
      const steer = harass ? HARASS_STEER : STEER

      for (let i = 0; i < agents.length; i++) {
        const a = agents[i]
        if (harass) {
          a.orbitAngle += HARASS_ORBIT_SPEED * dt
          const r = HARASS_ORBIT_R + Math.sin(clock * a.fr) * 0.2
          a.target.set(
            MathUtils.clamp(
              dronePos.x +
                Math.cos(a.orbitAngle) * r +
                Math.sin(clock * a.fx + a.px) * a.ax * HARASS_WOBBLE,
              -3,
              3,
            ),
            MathUtils.clamp(
              dronePos.y +
                ORBIT_Y +
                Math.sin(clock * a.fy + a.py) * a.ay * HARASS_WOBBLE,
              0.8,
              4.2,
            ),
            MathUtils.clamp(
              dronePos.z +
                Math.sin(a.orbitAngle) * r +
                Math.sin(clock * a.fz + a.pz) * a.az * HARASS_WOBBLE,
              -7,
              7,
            ),
          )
          desired.subVectors(a.target, a.pos)
        } else {
          desired.subVectors(a.target, a.pos)
          if (desired.length() < ARRIVE) {
            a.target = randomTarget()
            desired.subVectors(a.target, a.pos)
          }
        }
        let dist = desired.length()
        const speed = dist < SLOWDOWN ? maxSpeed * (dist / SLOWDOWN) : maxSpeed
        if (dist > 1e-4) desired.multiplyScalar(speed / dist)
        else desired.set(0, 0, 0)

        force.subVectors(desired, a.vel) // 轉向力，同時驅動傾斜
        a.vel.addScaledVector(force, Math.min(steer * dt, 1))
        const startZ = a.pos.z
        a.pos.addScaledVector(a.vel, dt)

        // 與球門環管碰撞，推出環外並反彈(同玩家機做法)
        const surf = GOAL_TUBE_R + ENEMY_RADIUS
        for (const G of GOALS) {
          gToE.copy(a.pos).sub(G)
          const planar = Math.hypot(gToE.x, gToE.y)
          const dr = planar - GOAL_RING_R
          const d = Math.hypot(dr, gToE.z)
          if (d < surf && planar > 1e-4 && d > 1e-6) {
            gNormal.set(
              (gToE.x / planar) * (dr / d),
              (gToE.y / planar) * (dr / d),
              gToE.z / d,
            )
            a.pos.addScaledVector(gNormal, surf - d)
            const vn = a.vel.dot(gNormal)
            if (vn < 0)
              a.vel.addScaledVector(gNormal, -(1 + ENEMY_RESTITUTION) * vn)
          }

          // 開口也不可穿越：敵機不得進門，擋回原本那側
          if (Math.hypot(a.pos.x - G.x, a.pos.y - G.y) < GOAL_RING_R) {
            const side = Math.sign(startZ - G.z) || 1
            if ((a.pos.z - G.z) * side < ENEMY_RADIUS) {
              a.pos.z = G.z + side * ENEMY_RADIUS
              a.vel.z = -a.vel.z * ENEMY_RESTITUTION
            }
          }
        }

        const sp = a.vel.length()
        let tPitch = 0
        let tRoll = 0
        if (sp > 0.05) {
          fwd.copy(a.vel).divideScalar(sp)
          a.yaw = dampAngle(a.yaw, Math.atan2(-fwd.x, -fwd.z), YAW_RATE, dt)
          right.set(fwd.z, 0, -fwd.x)
          tPitch = MathUtils.clamp(
            -force.dot(fwd) * TILT_K,
            -MAX_TILT,
            MAX_TILT,
          )
          tRoll = MathUtils.clamp(
            force.dot(right) * TILT_K,
            -MAX_TILT,
            MAX_TILT,
          )
        }
        a.pitch += (tPitch - a.pitch) * Math.min(TILT_RATE * dt, 1)
        a.roll += (tRoll - a.roll) * Math.min(TILT_RATE * dt, 1)

        const fins = modelFins[i]
        if (fins) for (const f of fins) f.rotateY(FIN_SPIN * f.userData.spinDir)
      }
    }

    // 每幀同步模型位姿，地面待機/倒數時也能正確顯示
    for (let i = 0; i < agents.length; i++) {
      const m = models[i]
      if (!m) continue
      const a = agents[i]
      m.position.copy(a.pos)
      eul.set(a.pitch, a.yaw, a.roll)
      m.quaternion.setFromEuler(eul)
    }
  })
</script>

{#each models as model, i}
  <T is={model} position={enemies[i].toArray()}>
    <T.Mesh position={FRONT_CUBE_POS}>
      <T.BoxGeometry args={FRONT_CUBE_SIZE} />
      <T.MeshStandardMaterial
        color={ENEMY_EMISSIVE}
        emissive={ENEMY_EMISSIVE}
        emissiveIntensity={FRONT_CUBE_EMISSION}
      />
    </T.Mesh>
  </T>
{/each}
