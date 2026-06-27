<script>
  import { useThrelte, useTask } from '@threlte/core'
  import { Vector2 } from 'three'
  import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
  import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
  import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
  import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'

  let { strength = 0.9, radius = 0.4, threshold = 2.0 } = $props()

  const { renderer, scene, camera, size, dpr, autoRender, renderStage } =
    useThrelte()

  const composer = new EffectComposer(renderer)
  const renderPass = new RenderPass(scene, camera.current)
  const bloomPass = new UnrealBloomPass(
    new Vector2(1, 1),
    strength,
    radius,
    threshold,
  )
  composer.addPass(renderPass)
  composer.addPass(bloomPass)
  composer.addPass(new OutputPass())

  $effect(() => {
    composer.setPixelRatio($dpr)
    composer.setSize($size.width, $size.height)
  })

  $effect(() => {
    renderPass.camera = $camera
  })

  $effect(() => {
    bloomPass.strength = strength
    bloomPass.radius = radius
    bloomPass.threshold = threshold
  })

  // 接管 Threlte 的渲染，改用 composer 輸出
  $effect(() => {
    autoRender.set(false)
    return () => autoRender.set(true)
  })

  useTask((delta) => composer.render(delta), {
    stage: renderStage,
    autoInvalidate: false,
  })
</script>
