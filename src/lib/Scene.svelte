<script>
  import { Canvas, T } from '@threlte/core'
  import { Environment } from '@threlte/extras'
  import { WebGLRenderer, VSMShadowMap } from 'three'
  import Arena from './components/Arena.svelte'
  import Drone from './components/Drone.svelte'
  import Enemies from './components/Enemies.svelte'
  import Camera from './components/Camera.svelte'
  import Goal from './components/Goal.svelte'
  import Effects from './components/Effects.svelte'
  import hdriFullUrl from '../assets/hdri-full.exr?url'
  import hdriCompressUrl from '../assets/hdri-compress_1K.jpg?url'

  const isTouchDevice = typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0
  const maxDpr = isTouchDevice ? 1.25 : 2
  const shadowMapSize = isTouchDevice ? 1024 : 2048

  const createRenderer = (canvas) => {
    const renderer = new WebGLRenderer({
      canvas,
      powerPreference: 'high-performance',
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    })
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = VSMShadowMap
    return renderer
  }
</script>

<Canvas dpr={[1, maxDpr]} {createRenderer}>
  {#if isTouchDevice}
    <Environment url={hdriCompressUrl} isBackground />
  {:else}
    <Environment url={hdriFullUrl} isBackground />
  {/if}
  <T.Color attach="background" args={['#F1F1F1']} />
  <T.AmbientLight intensity={0.4} />
  <T.DirectionalLight
    position={[3, 10, -3]}
    intensity={1}
    castShadow
    shadow.mapSize.width={shadowMapSize}
    shadow.mapSize.height={shadowMapSize}
    shadow.camera.near={1}
    shadow.camera.far={50}
    shadow.camera.left={-10}
    shadow.camera.right={10}
    shadow.camera.top={10}
    shadow.camera.bottom={-10}
    shadow.bias={-0.0005}
    shadow.radius={3}
    shadow.blurSamples={8}
  />
  <Arena />
  <T.Mesh rotation.x={-Math.PI / 2} position.y={0.01} receiveShadow>
    <T.PlaneGeometry args={[7, 16]} />
    <T.ShadowMaterial opacity={0.5} />
  </T.Mesh>
  <Drone />
  <Enemies />
  <Goal />
  <Camera />
  <Effects />
</Canvas>

<style>
  :global(canvas) {
    display: block;
    width: 100% !important;
    height: 100% !important;
  }
</style>
