<script>
  import Scene from './lib/Scene.svelte'
  import KeyboardControls from './lib/components/KeyboardControls.svelte'
  import GamepadControls from './lib/components/GamepadControls.svelte'
  import Joystick from './lib/components/Joystick.svelte'
  import HUD from './lib/components/HUD.svelte'
  import StartScreen from './lib/components/StartScreen.svelte'
  import { game } from './lib/state/game.svelte.ts'
  import { toggleFullscreen } from './lib/fullscreen.js'

  // Global fullscreen bindings: Ctrl+F and gamepad button 8.
  $effect(() => {
    const onKey = (e) => {
      if (e.ctrlKey && !e.repeat && e.key.toLowerCase() === 'f') {
        e.preventDefault()
        toggleFullscreen()
      }
    }
    window.addEventListener('keydown', onKey)

    // ponytail: browsers may reject fullscreen from gamepad input (no user
    // activation), so B8 can be a no-op where Ctrl+F still works.
    let prev = false
    let raf = requestAnimationFrame(function poll() {
      const pad = navigator.getGamepads?.().find(Boolean)
      const pressed = pad?.buttons[8]?.pressed ?? false
      if (pressed && !prev) toggleFullscreen()
      prev = pressed
      raf = requestAnimationFrame(poll)
    })

    return () => {
      window.removeEventListener('keydown', onKey)
      cancelAnimationFrame(raf)
    }
  })
</script>

<Scene />

{#if game.started}
  <KeyboardControls />
  <GamepadControls />
  <Joystick />
  <HUD />
{:else}
  <StartScreen />
{/if}
