<script>
  import { game } from '../state/game.svelte.ts'
  import { score } from '../state/score.svelte.ts'
  import bgUrl from '../../assets/start/StartScreenBackground.webp?url'
  import logotypeUrl from '../../assets/start/Logotype.png?url'
  import descriptionUrl from '../../assets/start/Description.png?url'
  import iconFullScreenUrl from '../../assets/hud/Icon-fullScreen.svg?url'
  import { menuNav } from '../menuNav.js'
  import MenuItem from './MenuItem.svelte'

  const toggleFullscreen = async () => {
    const root = document.documentElement
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      if (document.exitFullscreen) await document.exitFullscreen()
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen()
      return
    }
    if (root.requestFullscreen) await root.requestFullscreen()
    else if (root.webkitRequestFullscreen) root.webkitRequestFullscreen()
  }

  const start = (mode) => {
    game.mode = mode
    score.value = 0
    score.shock = 0
    game.over = false
    if (mode === 'match') {
      game.timeLeft = 180
      game.countdown = 3
    } else {
      game.countdown = null
    }
    game.started = true
  }
</script>

<div class="start">
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

  <div class="menu" use:menuNav>
    <MenuItem onclick={() => start('practice')}>練習場</MenuItem>
    <MenuItem onclick={() => start('match')}>3分鐘挑戰</MenuItem>
  </div>

  <!-- ponytail: 設定 is visual-only; no settings system exists yet. Wire up when one does. -->
  <div class="settings">設定</div>
  <div class="divider"></div>

  <img
    class="description"
    src={descriptionUrl}
    alt="挑戰無人機足球射門 drone soccer simulation"
  />
  <p class="credit">kids.twreporter</p>
</div>

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

  .settings {
    position: absolute;
    left: calc(100 * var(--u));
    bottom: calc(190 * var(--u));
    font-size: var(--fs-sm);
    color: rgba(255, 255, 255, 0.5);
    text-shadow: 0 calc(4 * var(--u)) calc(4 * var(--u)) rgba(0, 0, 0, 0.25);
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
    .settings {
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
