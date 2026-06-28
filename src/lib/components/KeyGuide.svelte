<script>
  import { game } from '../state/game.svelte.ts'
  import buttonCorneredSvg from '../../assets/hud/Button-cornered.svg?raw'
  import buttonNocornerSvg from '../../assets/hud/Button-nocorner.svg?raw'
  import iconArrowUrl from '../../assets/hud/Icon-arrow.svg?url'

  let { pressedKeys } = $props()

  const wasdKeys = [
    ['w', 90, '上升'],
    ['a', 90, '逆時針'],
    ['s', -90, '下降'],
    ['d', 180, '順時針'],
  ]

  const arrowKeys = [
    ['ArrowUp', 0, '前進'],
    ['ArrowLeft', -90, '左移'],
    ['ArrowDown', 180, '後退'],
    ['ArrowRight', 90, '右移'],
  ]
</script>

<div class="key-controls" class:paused={game.paused} aria-hidden="true">
  <div class="key-cluster wasd">
    <div class="key-row top">
      <span class="key" class:active={pressedKeys.w}>
        <span class="key-frame" style={`--rotation:${wasdKeys[0][1]}deg`}>
          {@html buttonCorneredSvg}
        </span>
        <span>W</span>
        <span class="key-hint">{wasdKeys[0][2]}</span>
      </span>
    </div>
    <div class="key-row">
      {#each wasdKeys.slice(1) as [key, rotation, hint]}
        <span class="key" class:active={pressedKeys[key]}>
          <span class="key-frame" style={`--rotation:${rotation}deg`}>
            {@html buttonCorneredSvg}
          </span>
          <span>{key.toUpperCase()}</span>
          <span class="key-hint">{hint}</span>
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
        <span class="key-hint">{arrowKeys[0][2]}</span>
      </span>
    </div>
    <div class="key-row">
      {#each arrowKeys.slice(1) as [key, rotation, hint]}
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
          <span class="key-hint">{hint}</span>
        </span>
      {/each}
    </div>
  </div>
</div>

{#if game.paused}
  <div class="key-legend" aria-hidden="true">
    <span class="key-legend-item">
      <kbd class="key-cap">Enter</kbd>
      <span class="key-hint">確認選擇</span>
    </span>
    <span class="key-legend-item">
      <kbd class="key-cap">Space</kbd>
      <span class="key-hint">暫停 / 繼續</span>
    </span>
  </div>
{/if}

<style>
  .key-controls {
    --key-base: clamp(20px, 3.4vw, 50px);
    --key: var(--key-base);
    --key-gap: calc(var(--key) / 6);
    position: fixed;
    bottom: 21px;
    left: 0;
    right: 0;
    display: block;
    height: calc(var(--key) * 2 + var(--key-gap));
    font-family: 'WDXL Lubrifont TC', system-ui, sans-serif;
    user-select: none;
    pointer-events: none;
    z-index: 20;
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
    filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.3));
    opacity: 0.5;
    transition: all 0.15s ease-in-out;
  }
  .key.active {
    opacity: 1;
    filter: drop-shadow(0 0 5px rgba(255, 255, 255, 1));
  }
  .key > span:not(.key-frame) {
    position: relative;
    z-index: 1;
    transform: translateY(-1px);
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

  .key-hint {
    font-size: var(--fs-sm);
    color: rgba(255, 255, 255, 0.95);
    text-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
    pointer-events: none;
  }
  /* Movement hints float over the key and only reveal while paused. */
  .key > span.key-hint {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: max-content;
    opacity: 0;
    transition: opacity 0.15s ease-in-out;
  }
  .key-row.top > .key > span.key-hint {
    bottom: calc(100% + 12px);
  }
  .key-row:not(.top) > .key > span.key-hint {
    top: calc(100% + 12px);
  }

  .key-cap {
    display: inline-block;
    min-width: 2.2em;
    padding: 0.1em 0.5em 0.18em;
    border-style: solid;
    border-width: 0.1em;
    border-color: #fff;
    color: #fff;
    text-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
    border-radius: 0.2em;
    font-family: inherit;
    text-align: center;
    font-size: var(--fs-sm);
  }

  /* Paused: lift and enlarge the cluster, reveal hints, drop the reset keys. */
  .key-controls.paused {
    --key-base: clamp(40px, 7vw, 100px);
    z-index: 45;
    top: 50%;
    bottom: auto;
    transform: translateY(-50%);
  }
  .key-controls.paused .key-cluster.wasd {
    left: 12vw;
  }
  .key-controls.paused .key-cluster.arrows {
    right: 12vw;
  }
  .key-controls.paused .key {
    opacity: 1;
  }
  .key-controls.paused .key > span.key-hint {
    opacity: 0.95;
    font-size: calc(var(--key) * 0.4);
  }
  .key-controls.paused .key-cluster.reset {
    display: none;
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

  .key-legend {
    position: fixed;
    left: 50%;
    bottom: 10vh;
    transform: translateX(-50%);
    z-index: 45;
    display: flex;
    gap: 3em;
    font-family: 'WDXL Lubrifont TC', system-ui, sans-serif;
    color: rgba(255, 255, 255, 0.8);
    user-select: none;
    pointer-events: none;
  }
  .key-legend-item {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5em;
  }

  @media (max-width: 760px), (pointer: coarse) {
    .key-controls,
    .key-legend {
      display: none;
    }
  }
</style>
