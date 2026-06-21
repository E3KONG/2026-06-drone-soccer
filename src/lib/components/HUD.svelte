<script>
  import { score } from '../state/score.svelte.ts'

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
</script>

<svelte:window {onkeydown} {onkeyup} onblur={resetPressedKeys} />

<div class="hud">
  <span class="label">SCORE</span>
  <span class="value">{score.value}</span>
</div>

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
      <span class="key" class:active={pressedKeys.ArrowUp}>↑</span>
    </div>
    <div class="key-row">
      <span class="key" class:active={pressedKeys.ArrowLeft}>←</span>
      <span class="key" class:active={pressedKeys.ArrowDown}>↓</span>
      <span class="key" class:active={pressedKeys.ArrowRight}>→</span>
    </div>
  </div>
</div>

<style>
  .hud,
  .controls-hud {
    position: fixed;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    font-family: "Bitcount Grid Single", system-ui, monospace;
    pointer-events: none;
    user-select: none;
    z-index: 20;
  }
  .hud {
    top: 20px;
    gap: 8px;
    align-items: center;
    padding: 4px 20px 2px;
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
  .controls-hud {
    bottom: 20px;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 48px;
    width: calc(100vw - 20px);
    padding: 10px 18px;
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
  @media (max-width: 760px), (pointer: coarse) {
    .controls-hud {
      display: none;
    }
  }
</style>
