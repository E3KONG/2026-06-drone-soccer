<script>
  import { useThrelte, useTask } from '@threlte/core'
  import { Vector3, Quaternion } from 'three'
  import { score } from '../state/score.svelte.ts'
  import { dronePos } from '../state/droneState.svelte.ts'
  import { addGoalShot, clearGoalShots } from '../state/goalShots.svelte.ts'
  import { captureRig } from '../state/captureRig.ts'
  import { applyBeautyPose } from '../beautyCam.js'
  import { gradeBeautyShot } from '../beautyGrade.js'

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
    const shockPass = captureRig.shockPass
    const cam = camera.current
    if (!composer || !cam) return

    savedPos.copy(cam.position)
    savedQuat.copy(cam.quaternion)
    savedFov = cam.fov

    // drop the shockwave from the still (it's gameplay feedback, hides the drone)
    const liveShock = shockPass?.uniforms.progress.value
    if (shockPass) shockPass.uniforms.progress.value = -1

    applyBeautyPose(cam, dronePos)
    composer.render()

    // grab synchronously before restoring, so nothing flashes on screen
    const gl = renderer.domElement
    const base = document.createElement('canvas')
    base.width = gl.width
    base.height = gl.height
    base.getContext('2d').drawImage(gl, 0, 0)

    cam.position.copy(savedPos)
    cam.quaternion.copy(savedQuat)
    cam.fov = savedFov
    cam.updateProjectionMatrix()
    if (shockPass) shockPass.uniforms.progress.value = liveShock
    composer.render() // restore the gameplay frame (with live shockwave) for screen

    // in-camera grade (RGB split / warm / vignette / grain), then store
    gradeBeautyShot(base).toBlob(
      (blob) => blob && addGoalShot(blob),
      'image/jpeg',
      0.85
    )
  }
</script>
