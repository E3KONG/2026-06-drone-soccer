<script>
  import { T, useTask } from '@threlte/core'
  import { Vector3, Euler } from 'three'
  import { dronePos } from '../state/droneState.svelte.ts'

  let camRef = $state()

  const targetPos  = new Vector3()
  const offset     = new Vector3()
  const yawEuler   = new Euler()

  useTask(() => {
    if (!camRef) return

    yawEuler.set(0, dronePos.yaw, 0)
    offset.set(0, 0.5, 1.25)
    offset.applyEuler(yawEuler)

    targetPos.set(dronePos.x, dronePos.y, dronePos.z).add(offset)
    camRef.position.lerp(targetPos, 0.2)
    camRef.lookAt(dronePos.x, dronePos.y, dronePos.z)
  })
</script>

<T.PerspectiveCamera
  makeDefault
  fov={75}
  near={0.1}
  far={1000}
  bind:ref={camRef}
  position.x={0}
  position.y={0.2}
  position.z={1}
/>
