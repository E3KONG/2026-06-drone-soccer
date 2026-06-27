<script>
  import { T, useThrelte } from '@threlte/core'
  import { useGltf } from '@threlte/extras'
  import arenaUrl from '../../assets/area.glb?url'

  const gltf = useGltf(arenaUrl)
  const { renderer } = useThrelte()

  $effect(() => {
    const g = $gltf
    if (!g) return
    const max = renderer.capabilities.getMaxAnisotropy()
    g.scene.traverse((o) => {
      const mats = Array.isArray(o.material)
        ? o.material
        : o.material
          ? [o.material]
          : []
      if (!mats.length) return
      // Only the metal structure casts; the alpha net would cast a solid blob + phantom faces.
      o.castShadow = mats.some((m) => m.name === 'Metal')
      o.receiveShadow = true
      for (const m of mats) {
        for (const t of [m.map, m.emissiveMap, m.normalMap, m.roughnessMap]) {
          if (t) {
            t.anisotropy = max
            t.needsUpdate = true
          }
        }
      }
    })
  })
</script>

{#if $gltf}
  <T is={$gltf.scene} rotation.y={Math.PI / 2} />
{/if}
