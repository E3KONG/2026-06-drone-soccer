<script>
  import { Canvas, T } from '@threlte/core'
  import { Environment } from '@threlte/extras'
  import { WebGLRenderer } from 'three'
  import Arena from './components/Arena.svelte'
  import Drone from './components/Drone.svelte'
  import Camera from './components/Camera.svelte'
  import Goal from './components/Goal.svelte'
  import Effects from './components/Effects.svelte'
  import hdriFullUrl from '../assets/hdri-full.exr?url'
  import hdriCompressUrl from '../assets/hdri-compress.png?url'

  const isTouchDevice = typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0
  const maxDpr = isTouchDevice ? 1.25 : 2

  const createRenderer = (canvas) =>
    new WebGLRenderer({
      canvas,
      powerPreference: 'high-performance',
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    })
</script>

<Canvas dpr={[1, maxDpr]} {createRenderer}>
  {#if isTouchDevice}
    <Environment url={hdriCompressUrl} isBackground />
  {:else}
    <Environment url={hdriFullUrl} isBackground />
  {/if}
  <T.Color attach="background" args={['#F1F1F1']} />
  <T.AmbientLight intensity={0.4} />
  <T.DirectionalLight position={[5, 10, 5]} intensity={1} />
  <Arena />
  <Drone />
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
