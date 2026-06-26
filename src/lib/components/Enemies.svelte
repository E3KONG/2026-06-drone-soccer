<script>
  import { T, useTask } from '@threlte/core'
  import { useGltf } from '@threlte/extras'
  import { Vector3, Euler, MathUtils } from 'three'
  import droneUrl from '../../assets/drone-soccer.glb?url'
  import { enemies, ENEMY_RADIUS, originalShell } from '../state/enemyState.svelte.ts'
  import { game } from '../state/game.svelte.ts'

  // 在 A 門(z=-6.5)前方來回巡邏的活動範圍
  const REGION_MIN = new Vector3(-1, 3, -6.2)
  const REGION_MAX = new Vector3(1, 4, -5.5)
  const ENEMY_EMISSIVE = '#FF1A1A'

  const MAX_SPEED = 1.2
  const STEER = 2.5 // 速度趨近期望值的速率，越小越柔順
  const ARRIVE = 0.3 // 到達航點門檻，換新目標
  const SLOWDOWN = 0.8 // 進入此半徑開始減速，避免到點急轉
  const YAW_RATE = 5
  const TILT_RATE = 6
  const TILT_K = 0.4 // 轉向力 → 傾斜量
  const MAX_TILT = 0.5
  const FIN_SPIN = 1.0 // 每幀槳葉自轉(弧度)，恆定空轉
  const GROUND_Y = 0.2 // 開賽前停在地面，之後靠 seek 飛上巡邏區

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
            c.emissiveIntensity = 20
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
      a.pos.set(MathUtils.lerp(-0.6, 0.6, t), GROUND_Y, MathUtils.lerp(REGION_MIN.z, REGION_MAX.z, t))
      a.vel.set(0, 0, 0)
      a.target = randomTarget()
      a.yaw = a.pitch = a.roll = 0
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
  const eul = new Euler(0, 0, 0, 'YXZ')

  useTask((delta) => {
    const dt = Math.min(delta, 0.05) // 卡頓時鉗住，避免瞬移
    const active = game.started && !game.paused && !game.over && (game.countdown ?? 0) === 0

    if (active) {
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

      for (let i = 0; i < agents.length; i++) {
        const a = agents[i]
        desired.subVectors(a.target, a.pos)
        let dist = desired.length()
        if (dist < ARRIVE) {
          a.target = randomTarget()
          desired.subVectors(a.target, a.pos)
          dist = desired.length()
        }
        const speed = dist < SLOWDOWN ? MAX_SPEED * (dist / SLOWDOWN) : MAX_SPEED
        if (dist > 1e-4) desired.multiplyScalar(speed / dist)
        else desired.set(0, 0, 0)

        force.subVectors(desired, a.vel) // 轉向力，同時驅動傾斜
        a.vel.addScaledVector(force, Math.min(STEER * dt, 1))
        a.pos.addScaledVector(a.vel, dt)

        const sp = a.vel.length()
        let tPitch = 0
        let tRoll = 0
        if (sp > 0.05) {
          fwd.copy(a.vel).divideScalar(sp)
          a.yaw = dampAngle(a.yaw, Math.atan2(-fwd.x, -fwd.z), YAW_RATE, dt)
          right.set(fwd.z, 0, -fwd.x)
          tPitch = MathUtils.clamp(-force.dot(fwd) * TILT_K, -MAX_TILT, MAX_TILT)
          tRoll = MathUtils.clamp(force.dot(right) * TILT_K, -MAX_TILT, MAX_TILT)
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
  <T is={model} position={enemies[i].toArray()} />
{/each}
