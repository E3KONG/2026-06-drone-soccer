<script>
  import { useThrelte, useTask } from '@threlte/core'
  import { Vector3, Quaternion } from 'three'
  import { score } from '../state/score.svelte.ts'
  import { dronePos } from '../state/droneState.svelte.ts'
  import { addGoalShot, clearGoalShots } from '../state/goalShots.svelte.ts'
  import { captureRig } from '../state/captureRig.ts'
  import { applyBeautyPose } from '../beautyCam.js'

  const { renderer, camera, renderStage } = useThrelte()

  const savedPos = new Vector3()
  const savedQuat = new Quaternion()
  let savedFov = 0
  let prev = score.value

  // runs in the render stage, after Effects has drawn the gameplay frame
  useTask(
    () => {
      const v = score.value
      if (v > prev) capture()
      else if (v < prev) clearGoalShots() // new game / restart resets to 0
      prev = v
    },
    { stage: renderStage, autoInvalidate: false }
  )

  function capture() {
    const composer = captureRig.composer
    const cam = camera.current
    if (!composer || !cam) return

    savedPos.copy(cam.position)
    savedQuat.copy(cam.quaternion)
    savedFov = cam.fov

    applyBeautyPose(cam, dronePos)
    composer.render()

    // grab synchronously before restoring, so nothing flashes on screen
    const gl = renderer.domElement
    const off = document.createElement('canvas')
    off.width = gl.width
    off.height = gl.height
    off.getContext('2d').drawImage(gl, 0, 0)

    cam.position.copy(savedPos)
    cam.quaternion.copy(savedQuat)
    cam.fov = savedFov
    cam.updateProjectionMatrix()
    composer.render() // restore the gameplay frame that gets presented

    off.toBlob((blob) => blob && addGoalShot(blob), 'image/jpeg', 0.85)
  }
</script>
