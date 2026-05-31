<script>
  import { input } from '../state/input.svelte.ts'

  const pressed = new Set()

  function update() {
    input.throttle = (pressed.has('w') ? 1 : 0) + (pressed.has('s') ? -1 : 0)
    input.yaw      = (pressed.has('d') ? -1 : 0) + (pressed.has('a') ? 1 : 0)
    input.pitch    = (pressed.has('ArrowUp') ? -1 : 0) + (pressed.has('ArrowDown') ? 1 : 0)
    input.roll     = (pressed.has('ArrowRight') ? 1 : 0) + (pressed.has('ArrowLeft') ? -1 : 0)
  }

  function onkeydown(e) {
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
      e.preventDefault()
    }
    pressed.add(e.key)
    update()
  }

  function onkeyup(e) {
    pressed.delete(e.key)
    update()
  }
</script>

<svelte:window {onkeydown} {onkeyup} />