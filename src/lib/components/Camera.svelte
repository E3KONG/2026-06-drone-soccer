<script>
  import { T, useTask, useThrelte } from '@threlte/core'
  import { MathUtils, Vector3 } from 'three'
  import { dronePos } from '../state/droneState.svelte.ts'

  const MIN_DISTANCE = 0.5
  const MAX_DISTANCE = 4
  const DEFAULT_DISTANCE = Math.hypot(1.25, 0.5)
  const DEFAULT_PITCH = Math.atan2(0.5, 1.25)
  const MIN_PITCH = -0.15
  const MAX_PITCH = 1.2
  const ROTATE_SENSITIVITY = 0.006
  const ZOOM_SENSITIVITY = 0.0015

  const { renderer } = useThrelte()

  let camRef = $state()
  let orbitYawOffset = 0
  let orbitPitch = DEFAULT_PITCH
  let cameraDistance = DEFAULT_DISTANCE
  let isDragging = false
  let lastPointerX = 0
  let lastPointerY = 0

  const targetPos  = new Vector3()
  const offset     = new Vector3()

  const resetCamera = () => {
    orbitYawOffset = 0
    orbitPitch = DEFAULT_PITCH
    cameraDistance = DEFAULT_DISTANCE
  }

  $effect(() => {
    const canvas = renderer.domElement

    const setDragging = (dragging) => {
      isDragging = dragging
      canvas.style.cursor = dragging ? 'grabbing' : 'grab'
    }

    const handlePointerDown = (event) => {
      if (event.button !== 0) return
      lastPointerX = event.clientX
      lastPointerY = event.clientY
      canvas.setPointerCapture(event.pointerId)
      setDragging(true)
    }

    const handlePointerMove = (event) => {
      if (!isDragging) return
      const dx = event.clientX - lastPointerX
      const dy = event.clientY - lastPointerY
      lastPointerX = event.clientX
      lastPointerY = event.clientY

      orbitYawOffset -= dx * ROTATE_SENSITIVITY
      orbitPitch = MathUtils.clamp(
        orbitPitch - dy * ROTATE_SENSITIVITY,
        MIN_PITCH,
        MAX_PITCH,
      )
    }

    const handlePointerUp = (event) => {
      if (!isDragging) return
      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId)
      }
      setDragging(false)
    }

    const handleWheel = (event) => {
      event.preventDefault()
      cameraDistance = MathUtils.clamp(
        cameraDistance + event.deltaY * ZOOM_SENSITIVITY,
        MIN_DISTANCE,
        MAX_DISTANCE,
      )
    }

    const handleKeyDown = (event) => {
      if (event.key.toLowerCase() === 'c') {
        resetCamera()
      }
    }

    canvas.style.cursor = 'grab'
    canvas.style.touchAction = 'none'
    canvas.addEventListener('pointerdown', handlePointerDown)
    canvas.addEventListener('pointermove', handlePointerMove)
    canvas.addEventListener('pointerup', handlePointerUp)
    canvas.addEventListener('pointercancel', handlePointerUp)
    canvas.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      canvas.style.cursor = ''
      canvas.style.touchAction = ''
      canvas.removeEventListener('pointerdown', handlePointerDown)
      canvas.removeEventListener('pointermove', handlePointerMove)
      canvas.removeEventListener('pointerup', handlePointerUp)
      canvas.removeEventListener('pointercancel', handlePointerUp)
      canvas.removeEventListener('wheel', handleWheel)
      window.removeEventListener('keydown', handleKeyDown)
    }
  })

  useTask(() => {
    if (!camRef) return

    const orbitYaw = dronePos.yaw + orbitYawOffset
    const horizontalDistance = Math.cos(orbitPitch) * cameraDistance
    offset.set(
      Math.sin(orbitYaw) * horizontalDistance,
      Math.sin(orbitPitch) * cameraDistance,
      Math.cos(orbitYaw) * horizontalDistance,
    )

    targetPos.set(dronePos.x, dronePos.y, dronePos.z).add(offset)
    camRef.position.lerp(targetPos, 0.2)
    camRef.lookAt(dronePos.x, dronePos.y, dronePos.z)
  })
</script>

<T.PerspectiveCamera
  makeDefault
  fov={50}
  near={0.1}
  far={1000}
  bind:ref={camRef}
  position={[0, 0.2, 6.5]}
/>
