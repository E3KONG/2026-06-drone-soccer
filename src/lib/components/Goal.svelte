<script module>
  import { Vector3 } from 'three'

  export const GOAL_RING_R = 0.44
  export const GOAL_TUBE_R = 0.16
  export const GOALS = [new Vector3(0, 3.32, -6.5), new Vector3(0, 3.32, 6.5)]
</script>

<script>
  import { T, useTask, useThrelte } from '@threlte/core'
  import { useGltf } from '@threlte/extras'
  import { dronePos } from '../state/droneState.svelte.ts'
  import { score } from '../state/score.svelte.ts'
  import goalUrl from '../../assets/goal.glb?url'

  const gltf = useGltf(goalUrl)
  const { renderer } = useThrelte()
  const GOAL_GLOW_PEAK_INTENSITY = 6
  const GOAL_GLOW_DURATION = 2
  const GOAL_GLOW_EASE_DURATION = 0.5

  let goalMaterials = []
  let goalGlowTimer = 0

  const setGoalIntensity = (intensity) => {
    for (const material of goalMaterials) {
      material.emissiveIntensity = intensity
    }
  }

  const easeInOut = (t) => 0.5 - Math.cos(t * Math.PI) * 0.5

  const getGlowIntensity = () => {
    const elapsed = GOAL_GLOW_DURATION - goalGlowTimer
    if (elapsed < GOAL_GLOW_EASE_DURATION) {
      return (
        easeInOut(elapsed / GOAL_GLOW_EASE_DURATION) * GOAL_GLOW_PEAK_INTENSITY
      )
    }
    if (goalGlowTimer < GOAL_GLOW_EASE_DURATION) {
      return (
        easeInOut(goalGlowTimer / GOAL_GLOW_EASE_DURATION) *
        GOAL_GLOW_PEAK_INTENSITY
      )
    }
    return GOAL_GLOW_PEAK_INTENSITY
  }

  // 細線貼圖在斜角會嚴重鋸齒，開各向異性過濾改善
  $effect(() => {
    const g = $gltf
    if (!g) return
    const max = renderer.capabilities.getMaxAnisotropy()
    goalMaterials = []
    g.scene.traverse((o) => {
      const sourceMaterials = Array.isArray(o.material)
        ? o.material
        : o.material
          ? [o.material]
          : []
      if (!sourceMaterials.length) return
      o.castShadow = true
      o.receiveShadow = true

      const materials = sourceMaterials.map((m) => {
        const material = m.emissiveMap ? m.clone() : m
        if (material.emissiveMap) {
          material.emissiveIntensity = 0
          goalMaterials.push(material)
        }
        for (const t of [
          material.map,
          material.emissiveMap,
          material.normalMap,
          material.roughnessMap,
        ]) {
          if (t) {
            t.anisotropy = max
            t.needsUpdate = true
          }
        }
        material.needsUpdate = true
        return material
      })

      if (sourceMaterials.length) {
        o.material = Array.isArray(o.material) ? materials : materials[0]
      }
    })
  })

  let lastZ = dronePos.z

  useTask((delta) => {
    const z = dronePos.z
    // 只在 A 門(GOALS[0]) 計分；B 門(GOALS[1]) 不可進球也不可穿越
    const g = GOALS[0]
    // 穿越球門所在的 z 平面
    const crossed = (lastZ - g.z) * (z - g.z) < 0
    // 只算從正面(場地側)穿入：朝遠離場地中心方向通過，背面進不算
    const fromFront = (z - lastZ) * g.z > 0
    if (crossed && fromFront) {
      const dx = dronePos.x - g.x
      const dy = dronePos.y - g.y
      if (Math.hypot(dx, dy) < GOAL_RING_R) {
        score.value++
        score.shock = 0
        goalGlowTimer = GOAL_GLOW_DURATION
      }
    }

    if (goalGlowTimer > 0) {
      goalGlowTimer = Math.max(goalGlowTimer - delta, 0)
      setGoalIntensity(getGlowIntensity())
    } else {
      setGoalIntensity(0)
    }

    lastZ = z
  })
</script>

{#if $gltf}
  <T is={$gltf.scene} rotation.y={Math.PI / 2} />
{/if}
