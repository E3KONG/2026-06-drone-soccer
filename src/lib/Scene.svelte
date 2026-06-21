<script>
  import { Canvas, T } from '@threlte/core'
  import { Environment } from '@threlte/extras'
  import Arena from './components/Arena.svelte'
  import Drone from './components/Drone.svelte'
  import Camera from './components/Camera.svelte'
  import Goal from './components/Goal.svelte'
  import Effects from './components/Effects.svelte'
  import hdriUrl from '../assets/studio-hdri.exr?url'
</script>

<Canvas>
  <Environment url={hdriUrl} isBackground />
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
