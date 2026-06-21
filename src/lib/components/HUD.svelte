<script>
  import { score } from '../state/score.svelte.ts'

  let isFullscreen = $state(false)
  let pressedKeys = $state({
    w: false,
    a: false,
    s: false,
    d: false,
    c: false,
    ArrowUp: false,
    ArrowLeft: false,
    ArrowDown: false,
    ArrowRight: false,
  })

  const getTrackedKey = (key) => {
    const lowerKey = key.toLowerCase()
    if (['w', 'a', 's', 'd', 'c'].includes(lowerKey)) return lowerKey
    if (key in pressedKeys) return key
    return null
  }

  const onkeydown = (event) => {
    const key = getTrackedKey(event.key)
    if (key) pressedKeys[key] = true
  }

  const onkeyup = (event) => {
    const key = getTrackedKey(event.key)
    if (key) pressedKeys[key] = false
  }

  const resetPressedKeys = () => {
    for (const key in pressedKeys) pressedKeys[key] = false
  }

  const fullscreenElement = () =>
    document.fullscreenElement || document.webkitFullscreenElement

  const syncFullscreenState = () => {
    isFullscreen = Boolean(fullscreenElement())
  }

  const toggleFullscreen = async () => {
    const root = document.documentElement
    if (fullscreenElement()) {
      if (document.exitFullscreen) await document.exitFullscreen()
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen()
      return
    }

    if (root.requestFullscreen) await root.requestFullscreen()
    else if (root.webkitRequestFullscreen) root.webkitRequestFullscreen()
  }
</script>

<svelte:window
  {onkeydown}
  {onkeyup}
  onblur={resetPressedKeys}
  onfullscreenchange={syncFullscreenState}
  onwebkitfullscreenchange={syncFullscreenState}
/>

<div class="hud">
  <span class="label">SCORE</span>
  <span class="value">{score.value}</span>
</div>

<button
  class="fullscreen-button"
  type="button"
  aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
  aria-pressed={isFullscreen}
  onclick={toggleFullscreen}
>
  <span class="material-symbols-rounded">
    {isFullscreen ? 'close' : 'fullscreen'}
  </span>
</button>

<div class="controls-hud" aria-hidden="true">
  <div class="key-cluster wasd">
    <div class="key-row top">
      <span class="key" class:active={pressedKeys.w}>W</span>
    </div>
    <div class="key-row">
      <span class="key" class:active={pressedKeys.a}>A</span>
      <span class="key" class:active={pressedKeys.s}>S</span>
      <span class="key" class:active={pressedKeys.d}>D</span>
    </div>
  </div>

  <div class="key-cluster camera">
    <span class="key primary" class:active={pressedKeys.c}>C</span>
  </div>

  <div class="key-cluster arrows">
    <div class="key-row top">
      <span class="key" class:active={pressedKeys.ArrowUp}>
        <span class="material-symbols-rounded">keyboard_arrow_up</span>
      </span>
    </div>
    <div class="key-row">
      <span class="key" class:active={pressedKeys.ArrowLeft}>
        <span class="material-symbols-rounded">keyboard_arrow_left</span>
      </span>
      <span class="key" class:active={pressedKeys.ArrowDown}>
        <span class="material-symbols-rounded">keyboard_arrow_down</span>
      </span>
      <span class="key" class:active={pressedKeys.ArrowRight}>
        <span class="material-symbols-rounded">keyboard_arrow_right</span>
      </span>
    </div>
  </div>
</div>

<style>
  .hud,
  .fullscreen-button,
  .controls-hud {
    position: fixed;
    display: flex;
    font-family: "Bitcount Grid Single", system-ui, monospace;
    user-select: none;
    z-index: 20;
  }
  .hud {
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    gap: 8px;
    align-items: center;
    padding: 4px 20px 2px;
    pointer-events: none;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.15);
    -webkit-backdrop-filter: blur(3px);
    backdrop-filter: blur(3px);
    box-shadow: 1px 2px 0px 1px rgba(255, 255, 255, 0.1) inset;
  }
  .label {
    font-size: 18px;
    letter-spacing: 0.12em;
    color: var(--color-black);
  }
  .value {
    font-size: 36px;
    font-weight: 400;
    color: var(--color-blue-400);
  }
  .fullscreen-button {
    top: 20px;
    right: 20px;
    align-items: center;
    justify-content: center;
    width: 40px;
    min-width: 40px;
    height: 36px;
    padding: 0;
    border: 0;
    border-radius: 7px;
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 1px 2px 0px 1px rgba(255, 255, 255, 0.1) inset;
    color: var(--color-gray-500);
    cursor: pointer;
    -webkit-backdrop-filter: blur(3px);
    backdrop-filter: blur(3px);
    transition:
      color 0.15s ease-in-out,
      background 0.15s ease-in-out;
  }
  .fullscreen-button:hover,
  .fullscreen-button[aria-pressed="true"] {
    color: var(--color-gray-900);
    background: rgba(255, 255, 255, 0.22);
  }
  .controls-hud {
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 48px;
    width: calc(100vw - 20px);
    padding: 10px 18px;
    pointer-events: none;
    border-radius: 24px;
  }
  .key-cluster {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .key-cluster.wasd {
    justify-self: start;
  }
  .key-cluster.camera {
    justify-self: center;
    justify-content: flex-end;
  }
  .key-cluster.arrows {
    justify-self: end;
  }
  .key-row {
    display: flex;
    gap: 4px;
  }
  .key-row.top {
    justify-content: center;
  }
  .key {
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.2);
    box-shadow:
      1px 2px 0px 1px rgba(255, 255, 255, 0.12) inset,
      0 2px 8px rgba(0, 0, 0, 0.1);
    color: var(--color-gray-500);
    -webkit-backdrop-filter: blur(3px);
    backdrop-filter: blur(3px);
    font-size: 20px;
    line-height: 1;
    transition: color 0.15s ease-in-out;
  }
  .key.primary {
    width: 40px;
    height: 40px;
    font-size: 24px;
  }
  .key.active {
    color: var(--color-gray-900);
  }
  .material-symbols-rounded {
    font-family: "Material Symbols Rounded";
    font-weight: normal;
    font-style: normal;
    font-size: 26px;
    line-height: 1;
    letter-spacing: normal;
    text-transform: none;
    white-space: nowrap;
    direction: ltr;
    -webkit-font-feature-settings: "liga";
    -webkit-font-smoothing: antialiased;
    font-feature-settings: "liga";
    font-variation-settings:
      "FILL" 0,
      "wght" 400,
      "GRAD" 0,
      "opsz" 24;
  }
  .fullscreen-button .material-symbols-rounded {
    font-size: 24px;
  }
  @media (max-width: 760px), (pointer: coarse) {
    .controls-hud {
      display: none;
    }
  }
</style>
