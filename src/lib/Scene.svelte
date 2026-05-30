<script>
  import { Canvas, T } from '@threlte/core'
  import Arena from './Arena.svelte'
  import Drone from './Drone.svelte'
  import FollowCamera from './FollowCamera.svelte'
</script>

<Canvas>
  <T.AmbientLight intensity={0.4} />
  <T.DirectionalLight position={[5, 10, 5]} intensity={1} />
  <Arena />
  <Drone />
  <FollowCamera />
</Canvas>

<style>
  :global(canvas) {
    display: block;
    width: 100% !important;
    height: 100% !important;
  }
</style>
