<script>
  import { useThrelte } from '@threlte/core'
  import { score } from '../state/score.svelte.ts'
  import { addGoalShot, clearGoalShots } from '../state/goalShots.svelte.ts'

  // Captures the rendered frame at each goal (score++). preserveDrawingBuffer is
  // on, so the gameplay-angle pixels are readable straight off the canvas — no
  // state recording / re-render needed for v1 (that's only for beauty/orbit cam).
  const { renderer } = useThrelte()
  let prev = score.value

  $effect(() => {
    const v = score.value
    if (v > prev) capture()
    else if (v < prev) clearGoalShots() // new game / restart resets score to 0
    prev = v
  })

  function capture() {
    // wait one frame so the goal frame is rendered before reading it back
    requestAnimationFrame(() => {
      renderer.domElement.toBlob(
        (blob) => blob && addGoalShot(blob),
        'image/jpeg',
        0.85
      )
    })
  }
</script>
