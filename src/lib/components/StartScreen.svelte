<script>
  import { game } from '../state/game.svelte.ts'
  import { score } from '../state/score.svelte.ts'
  import bgUrl from '../../assets/start/StartScreenBackground.webp?url'
  import logotypeUrl from '../../assets/start/Logotype.png?url'
  import descriptionUrl from '../../assets/start/Description.png?url'
  import iconFullScreenUrl from '../../assets/hud/Icon-fullScreen.svg?url'
  import controllerIconSvg from '../../assets/hud/Icon_Controller.svg?raw'
  import { menuNav } from '../menuNav.js'
  import MenuItem from './MenuItem.svelte'
  import KeyGuide from './KeyGuide.svelte'
  import TouchGuide from './TouchGuide.svelte'
  import { toggleFullscreen } from '../fullscreen.js'

  // controller-connected indicator for the guide screen
  let padConnected = $state(false)
  $effect(() => {
    const check = () =>
      (padConnected = [...(navigator.getGamepads?.() ?? [])].some(Boolean))
    check()
    window.addEventListener('gamepadconnected', check)
    window.addEventListener('gamepaddisconnected', check)
    return () => {
      window.removeEventListener('gamepadconnected', check)
      window.removeEventListener('gamepaddisconnected', check)
    }
  })

  const start = (mode) => {
    game.mode = mode
    score.value = 0
    score.shock = 0
    game.over = false
    game.showGuide = false
    if (mode === 'match') {
      game.timeLeft = 180
      game.countdown = 3
    } else {
      game.countdown = null
    }
    game.started = true
  }
</script>

<div class="start" use:menuNav>
  <img class="bg" src={bgUrl} alt="" />

  <!-- <div class="stage"> -->
  <button
    class="fullscreen-button"
    type="button"
    aria-label="Toggle fullscreen"
    onclick={toggleFullscreen}
  >
    <img src={iconFullScreenUrl} alt="" />
  </button>

  <img class="logotype" src={logotypeUrl} alt="空中梅西 STRIKER" />

  <div class="menu">
    <MenuItem onclick={() => start('practice')}>練習場</MenuItem>
    <MenuItem onclick={() => start('match')}>3分鐘挑戰</MenuItem>
  </div>

  <button
    class="control-guide"
    type="button"
    data-nav-item
    onclick={() => (game.showGuide = true)}
  >
    <span class="cg-pad" class:on={padConnected}>{@html controllerIconSvg}</span
    >
    <span>控制器指引</span>
  </button>
  <div class="divider"></div>

  <img
    class="description"
    src={descriptionUrl}
    alt="挑戰無人機足球射門 drone soccer simulation"
  />
  <p class="credit">kids.twreporter</p>
</div>

{#if game.showGuide}
  <div class="guide-overlay">
    <button
      class="guide-dismiss"
      type="button"
      aria-label="關閉控制器指引"
      onclick={() => (game.showGuide = false)}
    ></button>
    <div class="pad-indicator" class:on={padConnected}>
      <span class="pad-icon">{@html controllerIconSvg}</span>
      <span>{padConnected ? '手把已連線' : '未偵測到遊戲手把'}</span>
    </div>
    <button
      class="fullscreen-button"
      type="button"
      aria-label="Toggle fullscreen"
      onclick={toggleFullscreen}
    >
      <img src={iconFullScreenUrl} alt="" />
    </button>
    <KeyGuide pressedKeys={{}} />
    <TouchGuide />
    <div class="guide-menu" use:menuNav>
      <MenuItem onclick={() => start('practice')}>練習場</MenuItem>
      <MenuItem onclick={() => start('match')}>3分鐘挑戰</MenuItem>
    </div>
    <span class="guide-close">點擊任意處關閉</span>
  </div>
{/if}

<!-- </div> -->

<style>
  .start {
    --u: min(0.052083333vw, 0.092592593vh);
    position: fixed;
    inset: 0;
    z-index: 30;
    overflow: hidden;
    font-family: 'WDXL Lubrifont TC', system-ui, sans-serif;
    user-select: none;
  }
  .bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    pointer-events: none;
  }
  .fullscreen-button {
    position: absolute;
    top: calc(118 * var(--u));
    right: calc(100 * var(--u));
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: calc(50 * var(--u));
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
    filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.8));
  }
  .fullscreen-button:hover {
    filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.8));
    opacity: 1;
  }
  .logotype {
    position: absolute;
    left: calc(100 * var(--u));
    top: calc(118 * var(--u));
    width: calc(549 * var(--u));
    height: auto;
    filter: drop-shadow(
      0 calc(3 * var(--u)) calc(6 * var(--u)) rgba(0, 0, 0, 0.25)
    );
  }
  .menu {
    position: absolute;
    left: calc(100 * var(--u));
    bottom: calc(365 * var(--u));
    display: flex;
    flex-direction: column;
    gap: calc(30 * var(--u));
    align-items: flex-start;
  }

  .control-guide {
    position: absolute;
    left: calc(100 * var(--u));
    bottom: calc(190 * var(--u));
    display: inline-flex;
    align-items: center;
    gap: calc(10 * var(--u));
    padding: 0;
    border: 0;
    background: none;
    -webkit-appearance: none;
    appearance: none;
    font-family: inherit;
    font-size: var(--fs-sm);
    color: rgba(255, 255, 255, 0.5);
    text-shadow: 0 calc(4 * var(--u)) calc(4 * var(--u)) rgba(0, 0, 0, 0.25);
    cursor: pointer;
  }
  .cg-pad {
    display: inline-flex;
    transition: filter 0.2s ease;
  }
  .cg-pad :global(svg) {
    display: block;
    width: calc(50 * var(--u));
    height: auto;
  }
  .cg-pad :global(svg path) {
    fill: rgba(255, 255, 255, 0.4);
    transition: fill 0.2s ease;
  }
  .cg-pad.on :global(svg path) {
    fill: #fff;
  }
  .cg-pad.on {
    filter: drop-shadow(0 0 calc(4 * var(--u)) rgba(255, 255, 255, 0.2));
  }
  .control-guide:hover,
  .control-guide:focus-visible,
  .control-guide.is-active {
    outline: none;
    color: #fff;
  }
  .guide-overlay {
    --u: min(0.052083333vw, 0.092592593vh);
    position: fixed;
    inset: 0;
    z-index: 50;
  }
  .guide-dismiss {
    position: absolute;
    inset: 0;
    z-index: 0;
    padding: 0;
    border: 0;
    -webkit-appearance: none;
    appearance: none;
    background: rgba(0, 0, 0, 0.6);
    -webkit-backdrop-filter: blur(8px);
    backdrop-filter: blur(8px);
    cursor: pointer;
  }
  .guide-menu {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 46;
    display: flex;
    flex-direction: column;
    gap: calc(50 * var(--u));
    align-items: center;
  }
  .pad-indicator {
    position: absolute;
    left: 50%;
    top: calc(110 * var(--u));
    transform: translateX(-50%);
    z-index: 46;
    display: flex;
    align-items: center;
    gap: calc(12 * var(--u));
    font-family: 'Swei Marker Sans', system-ui, sans-serif;
    font-size: var(--fs-xs);
    font-weight: 500;
    line-height: 1.3;
    color: rgba(255, 255, 255, 0.4);
    text-shadow: 0 calc(4 * var(--u)) calc(4 * var(--u)) rgba(0, 0, 0, 0.25);
    pointer-events: none;
  }
  .pad-icon {
    display: inline-flex;
    transition: filter 0.2s ease;
  }
  .pad-icon :global(svg) {
    display: block;
    width: auto;
    height: calc(var(--fs-xs) * 0.9);
  }
  .pad-icon :global(svg path) {
    fill: rgba(255, 255, 255, 0.4);
    transition: fill 0.2s ease;
  }
  .pad-indicator.on {
    color: #fff;
    filter: drop-shadow(0 0 calc(10 * var(--u)) #ffffffcc);
  }
  .pad-indicator.on .pad-icon :global(svg path) {
    fill: #fff;
  }
  .guide-close {
    position: absolute;
    left: 50%;
    bottom: calc(80 * var(--u));
    transform: translateX(-50%);
    z-index: 46;
    font-family: 'Swei Marker Sans', system-ui, sans-serif;
    font-size: var(--fs-xs);
    color: rgba(255, 255, 255, 0.35);
    text-shadow: 0 calc(4 * var(--u)) calc(4 * var(--u)) rgba(0, 0, 0, 0.25);
    pointer-events: none;
  }

  @media (orientation: portrait) {
    .guide-overlay {
      --u: min(0.092592593vw, 0.052083333vh);
    }
    .guide-menu {
      flex-direction: column;
      gap: calc(30 * var(--u));
      top: 40%;
    }
  }
  .divider {
    position: absolute;
    left: calc(100 * var(--u));
    bottom: calc(165 * var(--u));
    width: calc(418 * var(--u));
    height: calc(3 * var(--u));
    background: linear-gradient(
      to right,
      rgba(255, 255, 255, 0.5),
      rgba(255, 255, 255, 0)
    );
  }
  .description {
    position: absolute;
    left: calc(100 * var(--u));
    bottom: calc(108 * var(--u));
    height: calc(32 * var(--u));
    width: auto;
  }
  .credit {
    position: absolute;
    right: calc(100 * var(--u));
    bottom: calc(108 * var(--u));
    margin: 0;
    font-family: 'Bitcount Grid Single', monospace;
    font-weight: 200;
    font-size: var(--fs-xs);
    letter-spacing: calc(-0.6 * var(--u));
    color: #fff;
  }

  @media (orientation: portrait) {
    .start {
      --u: min(0.092592593vw, 0.052083333vh);
    }
    .fullscreen-button {
      display: none;
    }
    .logotype {
      left: 50%;
      top: calc(160 * var(--u));
      transform: translateX(-50%);
      width: calc(795 * var(--u));
    }
    .menu {
      left: 50%;
      top: auto;
      bottom: calc(480 * var(--u));
      transform: translateX(-50%);
      align-items: center;
      gap: calc(30 * var(--u));
    }
    .menu :global(.menu-item) {
      color: rgba(255, 255, 255, 0.85);
    }
    .control-guide {
      left: 50%;
      top: auto;
      bottom: calc(270 * var(--u));
      transform: translateX(-50%);
      text-align: center;
    }
    .divider {
      left: 50%;
      top: auto;
      bottom: calc(229 * var(--u));
      transform: translateX(-50%);
      width: calc(626 * var(--u));
      background: linear-gradient(
        to right,
        rgba(255, 255, 255, 0),
        rgba(255, 255, 255, 0.5),
        rgba(255, 255, 255, 0)
      );
    }
    .description {
      left: 50%;
      top: auto;
      bottom: calc(155 * var(--u));
      transform: translateX(-50%);
      height: calc(48 * var(--u));
    }
    .credit {
      left: 50%;
      right: auto;
      top: auto;
      bottom: calc(98 * var(--u));
      transform: translateX(-50%);
      letter-spacing: calc(-0.96 * var(--u));
    }
  }
</style>
