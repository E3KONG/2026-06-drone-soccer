<script>
  import Scene from './lib/Scene.svelte'
  import KeyboardControls from './lib/components/KeyboardControls.svelte'
  import GamepadControls from './lib/components/GamepadControls.svelte'
  import Joystick from './lib/components/Joystick.svelte'
  import HUD from './lib/components/HUD.svelte'
  import StartScreen from './lib/components/StartScreen.svelte'
  import { game } from './lib/state/game.svelte.ts'
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
