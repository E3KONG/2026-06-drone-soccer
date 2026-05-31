<script module>
  import { Vector3 } from 'three'

  export const GOAL = new Vector3(0, 2.5, -6)
  export const GOAL_RING_R = 0.4
  export const GOAL_TUBE_R = 0.1
</script>

<script>
  import { T, useTask } from '@threlte/core'
  import { dronePos } from '../state/droneState.svelte.ts'
  import { score } from '../state/score.svelte.ts'
  import { colors } from '../constants/colors.ts'

  let lastZ = dronePos.z

  useTask(() => {
    const z = dronePos.z
    // sign change of (z - GOAL.z) = crossed the goal plane (either direction)
    const crossed = (lastZ - GOAL.z) * (z - GOAL.z) < 0
    if (crossed) {
      const dx = dronePos.x - GOAL.x
      const dy = dronePos.y - GOAL.y
      if (Math.sqrt(dx * dx + dy * dy) < GOAL_RING_R) score.value++
    }
    lastZ = z
  })
</script>

<T.Mesh position={GOAL.toArray()}>
  <T.TorusGeometry args={[GOAL_RING_R, GOAL_TUBE_R, 16, 48]} />
  <T.MeshStandardMaterial color={colors.yellow[400]} />
</T.Mesh>
