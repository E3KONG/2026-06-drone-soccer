<script>
  import { useThrelte, useTask } from '@threlte/core'
  import { Vector2 } from 'three'
  import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
  import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
  import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
  import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'

  const strength = 0.9
  const radius = 0.4
  const threshold = 2.0

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
    autoRender.set(false)
    return () => autoRender.set(true)
  })

  useTask((delta) => composer.render(delta), {
    stage: renderStage,
    autoInvalidate: false,
  })
</script>
