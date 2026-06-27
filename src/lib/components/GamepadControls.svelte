<script>
  import { input } from '../state/input.svelte.ts'

  const DEADZONE = 0.12
  let raf = 0

  const dz = (v) => (Math.abs(v) < DEADZONE ? 0 : v)

  function poll() {
    const pad = navigator.getGamepads().find(Boolean) // first connected pad
    if (pad) {
      input.yaw = dz(-pad.axes[0])
      input.throttle = dz(-pad.axes[1])
      input.roll = dz(pad.axes[2])
      input.pitch = dz(pad.axes[3])
    }
    raf = requestAnimationFrame(poll)
  }

  function ongamepadconnected() {
    if (!raf) raf = requestAnimationFrame(poll)
  }

  function ongamepaddisconnected() {
    if (navigator.getGamepads().some(Boolean)) return // other pads still on
    cancelAnimationFrame(raf)
    raf = 0
    input.yaw = input.throttle = input.roll = input.pitch = 0
  }

  $effect(() => () => cancelAnimationFrame(raf))
</script>

<svelte:window {ongamepadconnected} {ongamepaddisconnected} />
