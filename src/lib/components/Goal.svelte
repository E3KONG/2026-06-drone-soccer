<script module>
  import { Vector3 } from 'three'

  // 球門環：中心線半徑 / 管半徑(用於碰撞)，兩端各一個
  export const GOAL_RING_R = 0.44
  export const GOAL_TUBE_R = 0.16
  export const GOALS = [
    new Vector3(0, 3.32, -6.5),
    new Vector3(0, 3.32, 6.5),
  ]
</script>

<script>
  import { T, useTask, useThrelte } from '@threlte/core'
  import { useGltf } from '@threlte/extras'
  import { dronePos } from '../state/droneState.svelte.ts'
  import { score } from '../state/score.svelte.ts'
  import goalUrl from '../../assets/goal.glb?url'

  const gltf = useGltf(goalUrl)
  const { renderer } = useThrelte()

  // 細線貼圖在斜角會嚴重鋸齒，開各向異性過濾改善
  $effect(() => {
    const g = $gltf
    if (!g) return
    const max = renderer.capabilities.getMaxAnisotropy()
    g.scene.traverse((o) => {
      const m = o.material
      if (!m) return
      // 提高自發光亮度，讓紅色環的 luminance 高於背景，bloom 才會作用在它身上
      if (m.emissiveMap) m.emissiveIntensity = 16
      for (const t of [m.map, m.emissiveMap, m.normalMap, m.roughnessMap]) {
        if (t) { t.anisotropy = max; t.needsUpdate = true }
      }
    })
  })

  let lastZ = dronePos.z

  useTask(() => {
    const z = dronePos.z
    for (const g of GOALS) {
      // 穿越球門所在的 z 平面(任一方向)且在環內 → 得分
      const crossed = (lastZ - g.z) * (z - g.z) < 0
      if (crossed) {
        const dx = dronePos.x - g.x
        const dy = dronePos.y - g.y
        if (Math.hypot(dx, dy) < GOAL_RING_R) score.value++
      }
    }
    lastZ = z
  })
</script>

{#if $gltf}
  <T is={$gltf.scene} rotation.y={Math.PI / 2} />
{/if}
