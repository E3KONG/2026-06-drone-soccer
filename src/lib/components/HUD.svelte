<script>
  import { score } from '../state/score.svelte.ts'
  import { warning } from '../state/warning.svelte.ts'
  import { game, restartGame } from '../state/game.svelte.ts'
  import PauseMenu from './PauseMenu.svelte'
  import EndScreen from './EndScreen.svelte'
  import staticUiRaw from '../../assets/hud/StaticUI.svg?raw'
  import flashSvg from '../../assets/hud/Flash.svg?raw'
  import flashTriangleUrl from '../../assets/hud/Flash-triangle.svg?url'
  import buttonCorneredSvg from '../../assets/hud/Button-cornered.svg?raw'
  import buttonNocornerSvg from '../../assets/hud/Button-nocorner.svg?raw'
  import iconArrowUrl from '../../assets/hud/Icon-arrow.svg?url'
  import iconFullScreenUrl from '../../assets/hud/Icon-fullScreen.svg?url'
  import iconPauseUrl from '../../assets/hud/Icon-pause.svg?url'
  import iconReplayUrl from '../../assets/hud/Icon-replay.svg?url'

  const staticUiSvg = staticUiRaw.replaceAll(
    'fill="white"',
    'fill="currentColor"',
  )

  let isFullscreen = $state(false)
  let showGoalFlash = $state(false)
  let previousScore = score.value
  let goalFlashTimer
  let showWarning = $state(false)
  let previousWarn = warning.count
  let warningTimer
  let dimmed = $state(false)
  let pressedKeys = $state({
    w: false,
    a: false,
    s: false,
    d: false,
    c: false,
    r: false,
    ArrowUp: false,
    ArrowLeft: false,
    ArrowDown: false,
    ArrowRight: false,
  })

  const wasdKeys = [
    ['w', 90],
    ['a', 90],
    ['s', -90],
    ['d', 180],
  ]

  const arrowKeys = [
    ['ArrowUp', 0],
    ['ArrowLeft', -90],
    ['ArrowDown', 180],
    ['ArrowRight', 90],
  ]

  const getTrackedKey = (key) => {
    const lowerKey = key.toLowerCase()
    if (['w', 'a', 's', 'd', 'c', 'r'].includes(lowerKey)) return lowerKey
    if (key in pressedKeys) return key
    return null
  }

  const togglePause = () => {
    if (game.over) return
    game.paused = !game.paused
  }

  let holdRestartTimer

  const onkeydown = (event) => {
    if (event.key === 'Escape') {
      togglePause()
      return
    }
    const key = getTrackedKey(event.key)
    if (key) pressedKeys[key] = true
    if (key === 'r' && !holdRestartTimer) {
      holdRestartTimer = setTimeout(() => {
        holdRestartTimer = null
        restartGame()
      }, 2000)
    }
  }

  const onkeyup = (event) => {
    const key = getTrackedKey(event.key)
    if (key) pressedKeys[key] = false
    if (key === 'r') {
      clearTimeout(holdRestartTimer)
      holdRestartTimer = null
    }
  }

  const resetPressedKeys = () => {
    for (const key in pressedKeys) pressedKeys[key] = false
    clearTimeout(holdRestartTimer)
    holdRestartTimer = null
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

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  $effect(() => {
    if (game.countdown === null || game.paused) return
    const id = setInterval(() => {
      if (game.countdown > 0) game.countdown -= 1
      else game.countdown = null
    }, 1000)
    return () => clearInterval(id)
  })

  $effect(() => {
    if (
      game.mode !== 'match' ||
      game.paused ||
      game.over ||
      (game.countdown ?? 0) > 0
    )
      return
    const id = setInterval(() => {
      if (game.timeLeft > 0) {
        game.timeLeft -= 1
        if (game.timeLeft === 0) game.over = true
      }
    }, 1000)
    return () => clearInterval(id)
  })

  $effect(() => {
    if (score.value === previousScore) return

    previousScore = score.value
    showGoalFlash = true
    dimmed = true
    clearTimeout(goalFlashTimer)
    goalFlashTimer = setTimeout(() => {
      showGoalFlash = false
    }, 2000)

    return () => clearTimeout(goalFlashTimer)
  })

  $effect(() => {
    if (warning.count === previousWarn) return

    previousWarn = warning.count
    showWarning = true
    dimmed = true
    clearTimeout(warningTimer)
    warningTimer = setTimeout(() => {
      showWarning = false
    }, 1000)

    return () => clearTimeout(warningTimer)
  })
</script>

<svelte:window
  {onkeydown}
  {onkeyup}
  onblur={resetPressedKeys}
  onfullscreenchange={syncFullscreenState}
  onwebkitfullscreenchange={syncFullscreenState}
/>

<div
  class="static-ui"
  class:warn={showWarning}
  class:scored={showGoalFlash}
  class:dimmed
  class:paused={game.paused}
  aria-hidden="true"
>
  <div class="static-symbols">{@html staticUiSvg}</div>

  <svg class="static-corner top left" viewBox="0 0 857 380">
    <use href="#Corner" />
  </svg>
  <svg class="static-corner top right mirror-x" viewBox="0 0 857 380">
    <use href="#Corner" />
  </svg>
  <svg class="static-corner bottom left mirror-y" viewBox="0 0 857 380">
    <use href="#Corner" />
  </svg>
  <svg class="static-corner bottom right mirror-xy" viewBox="0 0 857 380">
    <use href="#Corner" />
  </svg>

  <svg
    class="static-extend horizontal top left"
    viewBox="857 0 87 29"
    preserveAspectRatio="none"
  >
    <use href="#Extend_horizontal" />
  </svg>
  <svg
    class="static-extend horizontal top right mirror-x"
    viewBox="857 0 87 29"
    preserveAspectRatio="none"
  >
    <use href="#Extend_horizontal" />
  </svg>
  <svg
    class="static-extend horizontal bottom left mirror-y"
    viewBox="857 0 87 29"
    preserveAspectRatio="none"
  >
    <use href="#Extend_horizontal" />
  </svg>
  <svg
    class="static-extend horizontal bottom right mirror-xy"
    viewBox="857 0 87 29"
    preserveAspectRatio="none"
  >
    <use href="#Extend_horizontal" />
  </svg>
</div>

<img class="flash-triangle top" src={flashTriangleUrl} alt="" />
<img class="flash-triangle bottom" src={flashTriangleUrl} alt="" />

{#if showGoalFlash}
  <div class="score-flash" aria-hidden="true">{score.value}</div>
{/if}

{#if game.countdown !== null}
  {#key game.countdown}
    <div class="countdown" aria-hidden="true">
      {game.countdown === 0 ? 'GO!' : game.countdown}
    </div>
  {/key}
{/if}

<div
  class="flash-idle"
  class:scored={showGoalFlash}
  class:warn={showWarning}
  aria-hidden="true"
>
  <div class="flash-corner top left">{@html flashSvg}</div>
  <div class="flash-corner top right mirror-x">{@html flashSvg}</div>
  <div class="flash-corner bottom left mirror-y">{@html flashSvg}</div>
  <div class="flash-corner bottom right mirror-xy">{@html flashSvg}</div>
</div>

<button
  class="pause-label"
  type="button"
  aria-label="暫停"
  onclick={togglePause}
>
  <span>暫</span>
  <span>停</span>
</button>

<button
  class="icon-button pause"
  type="button"
  aria-label="暫停"
  onclick={togglePause}
>
  <img src={iconPauseUrl} alt="" />
</button>

<button
  class="icon-button restart"
  type="button"
  aria-label="重新開始"
  onclick={restartGame}
>
  <img src={iconReplayUrl} alt="" />
</button>

{#if game.paused}
  <PauseMenu />
{/if}

{#if game.over}
  <EndScreen />
{/if}

{#if game.mode === 'match'}
  <div
    class="timer"
    class:low={game.timeLeft <= 30}
    aria-label="Time remaining"
  >
    {formatTime(game.timeLeft)}
  </div>
{/if}

{#if showWarning}
  <div class="warning-text" role="alert">
    無人機足機比賽中禁止從球門背後穿越及穿越自方破門
  </div>
{/if}

<div class="score-hud" aria-label={`Score ${score.value}`}>
  {score.value}
</div>

<button
  class="fullscreen-button"
  type="button"
  aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
  aria-pressed={isFullscreen}
  onclick={toggleFullscreen}
>
  <img src={iconFullScreenUrl} alt="" />
</button>

<div class="controls-hud" aria-hidden="true">
  <div class="key-cluster wasd">
    <div class="key-row top">
      <span class="key" class:active={pressedKeys.w}>
        <span class="key-frame" style={`--rotation:${wasdKeys[0][1]}deg`}>
          {@html buttonCorneredSvg}
        </span>
        <span>W</span>
      </span>
    </div>
    <div class="key-row">
      {#each wasdKeys.slice(1) as [key, rotation]}
        <span class="key" class:active={pressedKeys[key]}>
          <span class="key-frame" style={`--rotation:${rotation}deg`}>
            {@html buttonCorneredSvg}
          </span>
          <span>{key.toUpperCase()}</span>
        </span>
      {/each}
    </div>
  </div>

  <div class="key-cluster reset">
    <span class="key restart-key" class:active={pressedKeys.r}>
      <i class="key-fill"></i>
      <span class="key-frame">{@html buttonNocornerSvg}</span>
      <span>R</span>
    </span>
    <span class="key" class:active={pressedKeys.c}>
      <span class="key-frame">{@html buttonNocornerSvg}</span>
      <span>C</span>
    </span>
  </div>

  <div class="key-cluster arrows">
    <div class="key-row top">
      <span class="key arrow-key" class:active={pressedKeys.ArrowUp}>
        <span
          class="key-frame"
          style={`--rotation:${arrowKeys[0][1] + 180}deg`}
        >
          {@html buttonCorneredSvg}
        </span>
        <img
          class="arrow-icon"
          src={iconArrowUrl}
          style={`--rotation:${arrowKeys[0][1]}deg`}
          alt=""
        />
      </span>
    </div>
    <div class="key-row">
      {#each arrowKeys.slice(1) as [key, rotation]}
        <span class="key arrow-key" class:active={pressedKeys[key]}>
          <span class="key-frame" style={`--rotation:${rotation + 180}deg`}>
            {@html buttonCorneredSvg}
          </span>
          <img
            class="arrow-icon"
            src={iconArrowUrl}
            style={`--rotation:${rotation}deg`}
            alt=""
          />
        </span>
      {/each}
    </div>
  </div>
</div>

<style>
  .static-ui,
  .pause-label,
  .timer,
  .score-hud,
  .fullscreen-button,
  .controls-hud {
    position: fixed;
    display: flex;
    font-family: 'WDXL Lubrifont TC', system-ui, sans-serif;
    user-select: none;
    z-index: 20;
  }
  .static-ui,
  .flash-idle {
    --hud-u: min(0.052083333vw, 0.092592593vh);
    --edge-x: calc(16 * var(--hud-u));
    --top-y: calc(19 * var(--hud-u));
    --bottom-y: calc(21 * var(--hud-u));
    --corner-w: calc(857 * var(--hud-u));
    --corner-h: calc(380 * var(--hud-u));
    --flash-gap-x: calc(7.5 * var(--hud-u));
    --flash-gap-y: calc(74 * var(--hud-u));
    --extend-overlap: 1px;
    --extend-w: max(
      0px,
      calc(50vw - var(--edge-x) - var(--corner-w) + var(--extend-overlap))
    );
    inset: 0;
    display: block;
    pointer-events: none;
    z-index: 14;
  }
  .static-ui {
    opacity: 0.5;
    color: #fff;
    animation: static-idle-fade 2s ease-out 5s forwards;
  }
  .static-ui.dimmed {
    opacity: 0.25;
  }
  .static-ui.warn {
    color: var(--color-red-400);
    filter: drop-shadow(0 0 8px var(--color-red-400));
    animation: static-warn-tint 1s ease-out forwards;
  }
  .static-ui.scored {
    animation: static-score-tint 1s ease-out forwards;
  }
  /* When paused, lift the frame above the pause overlay (z 40) so it stays
     sharp and frames the pause menu instead of being blurred behind it. */
  .static-ui.paused {
    z-index: 45;
    opacity: 0.6;
    color: #fff;
    animation: none;
  }
  @keyframes static-idle-fade {
    to {
      opacity: 0.2;
    }
  }
  @keyframes static-warn-tint {
    0%,
    70% {
      opacity: 1;
    }
    100% {
      opacity: 0.25;
    }
  }
  @keyframes static-score-tint {
    0%,
    70% {
      opacity: 0.75;
      color: var(--color-yellow-400);
      filter: drop-shadow(0 0 8px var(--color-yellow-400));
    }
    100% {
      opacity: 0.25;
      color: #fff;
    }
  }
  .static-symbols,
  .static-corner,
  .static-extend,
  .flash-corner {
    position: absolute;
    overflow: visible;
  }
  .static-symbols {
    width: 0;
    height: 0;
    overflow: hidden;
  }
  .static-symbols :global(svg) {
    position: absolute;
    width: 0;
    height: 0;
  }
  .flash-corner :global(svg) {
    display: block;
    width: 100%;
    height: 100%;
    overflow: visible;
  }
  .flash-idle {
    position: fixed;
    inset: 0;
    z-index: 14;
    pointer-events: none;
    mix-blend-mode: screen;
    transition: filter 1.2s ease-out;
  }
  .flash-idle :global(path) {
    transition: fill 1.2s ease-out;
  }
  .score-flash {
    position: fixed;
    top: 50%;
    left: 50%;
    z-index: 16;
    pointer-events: none;
    color: var(--color-yellow-400);
    font-family: 'Bitcount Grid Single', system-ui, monospace;
    font-size: clamp(140px, 90vw, 700px);
    line-height: 1;
    text-shadow:
      0 0 10px var(--color-gray-500) inset,
      0 0 30px var(--color-yellow-400);
    mix-blend-mode: screen;
    animation: score-flash-pop 1.5s ease-out both;
    filter: blur(5px);
  }
  .countdown {
    position: fixed;
    top: 50%;
    left: 50%;
    z-index: 25;
    pointer-events: none;
    color: #0066ff40;
    -webkit-text-stroke-width: 2px;
    -webkit-text-stroke-color: #06f;
    font-family: 'WDXL Lubrifont TC', system-ui, sans-serif;
    font-size: clamp(160px, 40vw, 520px);
    line-height: 1;
    text-shadow:
      0 0 30px var(--color-blue-400),
      0 0 60px #0066ff40;
    animation: countdown-pop 1s ease-out both;
  }
  @keyframes countdown-pop {
    0% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(1.6);
    }
    20% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
    80% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.85);
    }
  }
  .flash-idle :global([id^='Flash-trapezoid'] path) {
    opacity: 0;
  }
  .flash-idle :global([id^='Flash-parallelogram'] path) {
    opacity: 0;
  }
  .flash-idle.scored :global([id^='Flash-parallelogram'] path) {
    animation-name: flash-pop;
    animation-duration: 1.2s;
    animation-timing-function: ease-in-out;
  }
  .flash-idle.scored {
    filter: drop-shadow(0 0 5px var(--color-yellow-400));
    transition: filter 0s;
  }
  .flash-idle.scored :global(path) {
    fill: var(--color-yellow-400);
    transition: fill 0s;
  }
  .flash-idle.warn :global(path) {
    fill: var(--color-red-400);
    transition: fill 0s;
  }
  .flash-idle :global([id^='Flash-line'] path),
  .flash-idle :global([id^='Flash-square'] path),
  .flash-idle :global([id^='Flash-circle'] path) {
    animation: flash-fade 1.5s ease-in-out infinite;
  }
  .flash-idle :global(g path:nth-child(1)) {
    animation-delay: 0s;
  }
  .flash-idle :global(g path:nth-child(2)) {
    animation-delay: 0.2s;
  }
  .flash-idle :global(g path:nth-child(3)) {
    animation-delay: 0.4s;
  }
  .flash-idle :global(g path:nth-child(4)) {
    animation-delay: 0.6s;
  }
  .flash-idle :global(g path:nth-child(5)) {
    animation-delay: 0.8s;
  }
  .static-corner,
  .static-extend {
    opacity: 0.9;
    filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.24));
  }
  .static-corner {
    width: var(--corner-w);
    height: var(--corner-h);
  }
  .static-corner.top {
    top: var(--top-y);
  }
  .static-corner.bottom {
    bottom: var(--bottom-y);
  }
  .static-corner.left {
    left: var(--edge-x);
  }
  .static-corner.right {
    right: var(--edge-x);
  }
  .static-extend.horizontal {
    width: var(--extend-w);
    height: calc(29 * var(--hud-u));
  }
  .static-extend.horizontal.top {
    top: var(--top-y);
  }
  .static-extend.horizontal.bottom {
    bottom: var(--bottom-y);
  }
  .static-extend.horizontal.left {
    left: calc(var(--edge-x) + var(--corner-w));
  }
  .static-extend.horizontal.right {
    right: calc(var(--edge-x) + var(--corner-w));
  }
  .mirror-x {
    transform: scaleX(-1);
  }
  .mirror-y {
    transform: scaleY(-1);
  }
  .mirror-xy {
    transform: scale(-1);
  }
  .flash-corner {
    width: calc(766 * var(--hud-u));
    height: calc(450 * var(--hud-u));
  }
  .flash-corner.top {
    top: calc(var(--top-y) + var(--flash-gap-y));
  }
  .flash-corner.bottom {
    bottom: calc(var(--bottom-y) + var(--flash-gap-y));
  }
  .flash-corner.left {
    left: calc(var(--edge-x) + var(--flash-gap-x));
  }
  .flash-corner.right {
    right: calc(var(--edge-x) + var(--flash-gap-x));
  }
  .flash-triangle {
    position: fixed;
    z-index: 14;
    left: 50%;
    width: 14px;
    height: 7px;
    transform: translateX(-50%);
    animation: triangle-blink 5s ease-in-out infinite;
  }
  .flash-triangle.top {
    top: 13.52vh;
  }
  .flash-triangle.bottom {
    bottom: 18.05vh;
    transform: translateX(-50%) scaleY(-1);
  }
  .pause-label {
    top: 20px;
    left: 21px;
    flex-direction: column;
    align-items: center;
    padding: 0;
    border: 0;
    background: transparent;
    color: rgba(255, 255, 255, 0.94);
    font-family: 'WDXL Lubrifont TC', system-ui, sans-serif;
    font-size: clamp(34px, 3.35vw, 64px);
    line-height: 1.05;
    opacity: 0.5;
    pointer-events: auto;
    cursor: pointer;
    transition: all 0.15s ease-in-out;
  }
  .pause-label:hover {
    opacity: 1;
  }
  .icon-button {
    position: fixed;
    top: 20px;
    z-index: 20;
    display: none;
    align-items: center;
    justify-content: center;
    width: clamp(40px, 11vw, 56px);
    aspect-ratio: 1;
    padding: 0;
    border: 0;
    opacity: 0.6;
    background: transparent;
    pointer-events: auto;
    cursor: pointer;
    transition: all 0.15s ease-in-out;
  }
  .icon-button.pause {
    left: 18px;
  }
  .icon-button.restart {
    right: 18px;
  }
  .icon-button img {
    width: 100%;
    height: 100%;
  }
  .icon-button:hover,
  .icon-button:active {
    filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.8));
    opacity: 1;
  }
  .timer,
  .score-hud {
    --hud-u: min(0.052083333vw, 0.092592593vh);
    --label-gap: calc(39 * var(--hud-u));
  }
  .warning-text {
    position: fixed;
    --hud-u: min(0.052083333vw, 0.092592593vh);
    top: calc(150 * var(--hud-u));
    left: 50%;
    transform: translateX(-50%);
    z-index: 20;
    pointer-events: none;
    white-space: nowrap;
    color: var(--color-red-400);
    font-family: 'WDXL Lubrifont TC', system-ui, sans-serif;
    font-size: clamp(14px, 1.5vw, 26px);
    text-shadow: 0 0 10px var(--color-red-400);
  }
  .timer {
    top: calc(30 * var(--hud-u) + var(--label-gap));
    left: 50%;
    transform: translateX(-50%);
    pointer-events: none;
    align-items: center;
    justify-content: center;
    width: 134px;
    color: rgba(255, 255, 255, 0.96);
    font-size: clamp(42px, 3.35vw, 64px);
    line-height: 1;
    letter-spacing: 0;
    text-align: center;
    text-shadow: 0 0 12px rgba(255, 255, 255, 0.28);
  }
  .timer.low {
    color: var(--color-red-400);
    text-shadow: 0 0 12px var(--color-red-400);
  }
  .score-hud {
    bottom: calc(35 * var(--hud-u) + var(--label-gap));
    left: 50%;
    transform: translateX(-50%);
    pointer-events: none;
    align-items: center;
    justify-content: center;
    width: 120px;
    color: rgba(255, 255, 255, 0.96);
    font-size: clamp(72px, 6.7vw, 150px);
    line-height: 0.9;
    letter-spacing: 0;
    text-align: center;
    text-shadow: 0 0 12px rgba(255, 255, 255, 0.24);
  }
  .fullscreen-button {
    top: 30px;
    right: 33px;
    align-items: center;
    justify-content: center;
    width: 35px;
    min-width: 35px;
    aspect-ratio: 1;
    padding: 0;
    border: 0;
    opacity: 0.5;
    background: transparent;
    cursor: pointer;
    transition: all 0.15s ease-in-out;
  }
  .fullscreen-button img {
    width: 100%;
    height: 100%;
  }
  .fullscreen-button:hover,
  .fullscreen-button[aria-pressed='true'] {
    filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.8));
    opacity: 1;
  }
  .controls-hud {
    --key-base: clamp(20px, 3.4vw, 50px);
    --key: var(--key-base);
    --key-gap: calc(var(--key) / 6);
    bottom: 21px;
    left: 0;
    right: 0;
    display: block;
    height: calc(var(--key) * 2 + var(--key-gap));
    pointer-events: none;
  }
  .key-cluster {
    position: absolute;
    bottom: 0;
    display: flex;
    flex-direction: column;
    gap: var(--key-gap);
  }
  .key-cluster.wasd {
    left: 12px;
  }
  .key-cluster.reset {
    --key: calc(var(--key-base) * 0.75);
    --key-gap: calc(var(--key) / 6);
    right: 20vw;
    flex-direction: row;
  }
  .key-cluster.arrows {
    right: 12px;
  }
  .key-row {
    display: flex;
    gap: var(--key-gap);
  }
  .key-row.top {
    justify-content: center;
  }
  .key {
    position: relative;
    display: grid;
    place-items: center;
    width: var(--key);
    height: var(--key);
    border: 0;
    background: transparent;
    color: rgba(255, 255, 255, 0.9);
    font-size: calc(var(--key) * 0.8);
    line-height: 1;
    text-shadow: 0 0 8px rgba(255, 255, 255, 0.25);
    opacity: 0.5;
    transition: all 0.15s ease-in-out;
  }
  .key-frame,
  .arrow-icon {
    position: absolute;
    max-width: none;
    pointer-events: none;
  }
  .key-frame {
    inset: 0;
    width: 100%;
    height: 100%;
    transform: rotate(var(--rotation, 0deg));
  }
  .key-frame :global(svg) {
    display: block;
    width: 100%;
    height: 100%;
  }
  .key-frame :global([id^='button-flash']) {
    opacity: 0;
    transition: opacity 0.15s ease-out;
  }
  .key.active .key-frame :global([id^='button-flash']) {
    opacity: 1;
  }
  .arrow-icon {
    width: calc(var(--key) * 0.567);
    height: calc(var(--key) * 0.317);
    transform: rotate(var(--rotation, 0deg));
  }
  .key > span:not(.key-frame) {
    position: relative;
    z-index: 1;
    transform: translateY(-1px);
  }
  .key.active {
    opacity: 1;
    filter: drop-shadow(0 0 5px rgba(255, 255, 255, 1));
  }
  .restart-key .key-fill {
    position: absolute;
    inset: 0;
    z-index: 0;
    border-radius: calc(var(--key) * 0.12);
    background: var(--color-red-400);
    opacity: 0;
  }
  .restart-key.active .key-fill {
    animation: key-fill 2s linear forwards;
  }
  .restart-key.active {
    filter: none;
  }
  .restart-key.active > span:not(.key-frame) {
    color: var(--color-red-400);
    text-shadow: none;
  }
  .restart-key.active .key-frame :global([id^='button-frame']) {
    stroke: var(--color-red-400);
  }
  .restart-key.active .key-frame :global([id^='button-flash']) {
    fill: none;
  }
  @keyframes key-fill {
    to {
      opacity: 1;
    }
  }
  @media (max-width: 900px) {
    .fullscreen-button {
      top: 24px;
      right: 22px;
    }
  }
  @media (max-width: 760px), (pointer: coarse) {
    .controls-hud {
      display: none;
    }
  }
  @media (pointer: coarse) {
    .fullscreen-button,
    .pause-label {
      display: none;
    }
    .icon-button {
      display: flex;
    }
  }
  @media (orientation: portrait) {
    .static-ui,
    .flash-idle {
      --hud-u: min(0.092592593vw, 0.052083333vh);
      --extend-w: max(
        0px,
        calc(50vh - var(--edge-x) - var(--corner-w) + var(--extend-overlap))
      );
      inset: auto;
      top: 50%;
      left: 50%;
      width: 100vh;
      height: 100vw;
      transform: translate(-50%, -50%) rotate(90deg);
    }
    .timer {
      font-size: 60px;
      top: 6vh;
    }
    .score-hud {
      font-size: 20vw;
      bottom: 6.5vh;
    }
    .flash-triangle.top {
      top: 16vh;
    }
    .warning-text {
      top: 16vh;
      white-space: normal;
      max-width: 80vw;
      text-align: center;
      line-height: 1.4;
      font-size: 16px;
    }
  }
  @keyframes flash-fade {
    0%,
    100% {
      opacity: 0;
    }
    40% {
      opacity: 1;
    }
  }
  @keyframes triangle-blink {
    0%,
    80%,
    100% {
      opacity: 0;
    }
    90% {
      opacity: 1;
    }
  }
  @keyframes score-flash-pop {
    0% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.8);
    }
    15% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
    70% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(1.1);
    }
  }
  @keyframes flash-pop {
    0% {
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
</style>
