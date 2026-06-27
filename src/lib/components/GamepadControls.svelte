<script>
  import { input } from '../state/input.svelte.ts'
  import { game } from '../state/game.svelte.ts'

  const DEADZONE = 0.12
  let raf = 0
  let prevPause = false

  const dz = (v) => (Math.abs(v) < DEADZONE ? 0 : v)

  function poll() {
    const pad = navigator.getGamepads().find(Boolean) // first connected pad
    if (pad) {
      input.yaw = dz(-pad.axes[0])
      input.throttle = dz(-pad.axes[1])
      input.roll = dz(pad.axes[2])
      input.pitch = dz(pad.axes[3])

      const pauseBtn = pad.buttons[9]?.pressed // Start: toggle pause
      if (pauseBtn && !prevPause && !game.over) game.paused = !game.paused
      prevPause = pauseBtn
    }
    raf = requestAnimationFrame(poll)
  }

  function ongamepaddisconnected() {
    if (navigator.getGamepads().some(Boolean)) return // other pads still on
    cancelAnimationFrame(raf)
    raf = 0
    input.yaw = input.throttle = input.roll = input.pitch = 0
  }

  // Start polling on mount: the gamepad may already be connected (e.g. the
  // player used it on the menu), so the gamepadconnected event won't re-fire.
  $effect(() => {
    if (!raf) raf = requestAnimationFrame(poll)
    return () => {
      cancelAnimationFrame(raf)
      raf = 0
    }
  })
</script>

<svelte:window {ongamepaddisconnected} />
