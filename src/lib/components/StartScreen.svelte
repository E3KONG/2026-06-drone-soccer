<script>
  import { game } from '../state/game.svelte.ts'
  import { score } from '../state/score.svelte.ts'
  import bgUrl from '../../assets/start/StartScreenBackground.jpg?url'
  import logotypeUrl from '../../assets/start/Logotype.png?url'
  import descriptionUrl from '../../assets/start/Description.png?url'
  import selectUrl from '../../assets/hud/Icon_select.svg?url'
  import iconFullScreenUrl from '../../assets/hud/Icon-fullScreen.svg?url'

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

  <div class="menu">
    <button class="menu-item" type="button" onclick={() => start('practice')}>
      <img class="cursor left" src={selectUrl} alt="" />
      <span>練習場</span>
      <img class="cursor right" src={selectUrl} alt="" />
    </button>
    <button class="menu-item" type="button" onclick={() => start('match')}>
      <img class="cursor left" src={selectUrl} alt="" />
      <span>3分鐘挑戰</span>
      <img class="cursor right" src={selectUrl} alt="" />
    </button>
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
    gap: calc(15 * var(--u));
    align-items: flex-start;
  }
  .menu-item span {
    white-space: nowrap;
  }
  .menu-item {
    display: flex;
    align-items: center;
    padding: 0;
    border: 0;
    gap: calc(5 * var(--u));
    background: transparent;
    cursor: pointer;
    font: inherit;
    font-size: calc(64 * var(--u));
    color: rgba(255, 255, 255, 0.75);
    text-shadow: 0 calc(4 * var(--u)) calc(4 * var(--u)) rgba(0, 0, 0, 0.25);
    transition: color 0.15s ease;
  }
  .menu-item .cursor {
    width: 0;
    height: calc(28 * var(--u));
    margin-right: 0;
    opacity: 0;
    transition:
      width 0.15s ease,
      margin-right 0.15s ease,
      opacity 0.15s ease;
  }
  .menu-item .cursor.right {
    display: none;
  }
  .menu-item:hover,
  .menu-item:focus-visible {
    color: #fff;
    outline: none;
  }
  .menu-item:hover .cursor,
  .menu-item:focus-visible .cursor {
    width: calc(26 * var(--u));
    margin-right: calc(5 * var(--u));
    opacity: 1;
  }
  .settings {
    position: absolute;
    left: calc(100 * var(--u));
    bottom: calc(190 * var(--u));
    font-size: calc(48 * var(--u));
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
    font-size: calc(20 * var(--u));
    letter-spacing: calc(-0.6 * var(--u));
    color: #fff;
  }

  /* Mobile: centered portrait layout (1080 x 1920 design frame) */
  @media (orientation: portrait) {
    .start {
      --u: min(0.092592593vw, 0.052083333vh);
    }
    .stage {
      width: calc(1080 * var(--u));
      height: calc(1920 * var(--u));
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
      bottom: calc(407 * var(--u));
      transform: translateX(-50%);
      align-items: center;
      gap: calc(35 * var(--u));
    }
    .menu-item {
      gap: calc(20 * var(--u));
      justify-content: center;
      font-size: calc(128 * var(--u));
    }
    .menu-item .cursor {
      width: calc(52 * var(--u));
      height: calc(56 * var(--u));
      margin-right: 0;
    }
    .menu-item .cursor.right {
      display: block;
      transform: scaleX(-1);
    }
    .menu-item:hover .cursor,
    .menu-item:focus-visible .cursor,
    .menu-item:active .cursor {
      width: calc(52 * var(--u));
      margin-right: 0;
      opacity: 1;
    }
    .settings {
      left: 50%;
      top: auto;
      bottom: calc(270 * var(--u));
      transform: translateX(-50%);
      font-size: calc(64 * var(--u));
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
      font-size: calc(32 * var(--u));
      letter-spacing: calc(-0.96 * var(--u));
    }
  }
</style>
