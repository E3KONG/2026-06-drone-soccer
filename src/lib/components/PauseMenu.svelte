<script>
  import { game, restartGame, toMenu } from '../state/game.svelte.ts'
  import { resetInput } from '../state/input.svelte.ts'
  import { audio, toggleMute } from '../state/audio.svelte.ts'
  import { toggleFullscreen, canFullscreen } from '../fullscreen.js'
  import { menuNav } from '../menuNav.js'
  import MenuItem from './MenuItem.svelte'
  import soundOnUrl from '../../assets/hud/Icon_SoundOn.svg?url'
  import soundMuteUrl from '../../assets/hud/Icon_SoundMute.svg?url'
  import iconFullScreenUrl from '../../assets/hud/Icon-fullScreen.svg?url'

  const isTouch = matchMedia('(pointer: coarse)').matches
  const fsLabel = canFullscreen() ? 'Toggle fullscreen' : 'Open in new tab'

  const resume = () => {
    resetInput()
    game.paused = false
  }

  // practice → offer the 3-min challenge instead of a plain restart
  const playMatch = () => {
    game.mode = 'match'
    restartGame() // restart in match mode sets the timer + countdown, unpauses
  }

  const toggleGuide = () => (game.controlGuide = !game.controlGuide)
</script>

<div class="pause-menu" use:menuNav>
  <div class="backdrop"></div>
  <div class="top-buttons">
    <button
      class="icon-button"
      type="button"
      aria-label="Toggle sound"
      aria-pressed={audio.muted}
      onclick={toggleMute}
    >
      <img src={audio.muted ? soundMuteUrl : soundOnUrl} alt="" />
    </button>
    <button
      class="icon-button"
      type="button"
      aria-label={fsLabel}
      onclick={toggleFullscreen}
    >
      <img src={iconFullScreenUrl} alt="" />
    </button>
  </div>
  <MenuItem onclick={resume}>繼續</MenuItem>
  {#if game.mode === 'practice'}
    <MenuItem onclick={playMatch}>3分鐘挑戰</MenuItem>
  {:else}
    <MenuItem onclick={restartGame}>重新開始</MenuItem>
  {/if}
  <MenuItem onclick={toMenu}>返回主選單</MenuItem>
  {#if isTouch && game.mode === 'practice'}
    <MenuItem selected={game.controlGuide} onclick={toggleGuide}>
      控制器指引
    </MenuItem>
  {/if}
</div>

<style>
  .pause-menu {
    --u: min(0.052083333vw, 0.092592593vh);
    position: fixed;
    inset: 0;
    z-index: 40;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: calc(22 * var(--u));
    font-family: 'WDXL Lubrifont TC', system-ui, sans-serif;
    user-select: none;
  }
  .pause-menu :global(.menu-item.toggle) {
    position: absolute;
    bottom: 12vh;
    left: 50%;
    transform: translateX(-50%);
    font-size: calc(var(--fs-md) * 0.75);
  }
  .backdrop {
    position: absolute;
    inset: 0;
    z-index: -1;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
  .top-buttons {
    position: absolute;
    top: calc(100 * var(--u));
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: calc(50 * var(--u));
  }
  .icon-button {
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
  .icon-button img {
    width: 100%;
    height: 100%;
    filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.8));
  }
  .icon-button:hover {
    opacity: 1;
    filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.8));
  }

  @media (orientation: portrait) {
    .pause-menu {
      --u: min(0.092592593vw, 0.052083333vh);
      gap: calc(40 * var(--u));
    }
  }

  @media (pointer: coarse) {
    .pause-menu {
      padding-bottom: 2vh;
    }
  }
</style>
