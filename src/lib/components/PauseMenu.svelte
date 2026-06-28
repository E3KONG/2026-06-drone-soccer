<script>
  import { game, restartGame, toMenu } from '../state/game.svelte.ts'
  import { resetInput } from '../state/input.svelte.ts'
  import { menuNav } from '../menuNav.js'
  import MenuItem from './MenuItem.svelte'

  const resume = () => {
    resetInput()
    game.paused = false
  }
</script>

<div class="pause-menu" use:menuNav>
  <div class="backdrop"></div>
  <MenuItem onclick={resume}>繼續</MenuItem>
  <MenuItem onclick={restartGame}>重新開始</MenuItem>
  <MenuItem onclick={toMenu}>返回主選單</MenuItem>
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
  .pause-menu :global(.menu-item .cursor.right) {
    display: block;
    transform: scaleX(-1);
  }
  .backdrop {
    position: absolute;
    inset: 0;
    z-index: -1;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }

  @media (orientation: portrait) {
    .pause-menu {
      --u: min(0.092592593vw, 0.052083333vh);
      gap: calc(40 * var(--u));
    }
  }
  /* On touch, lift the menu up so it clears the joystick tutorial below. */
  @media (pointer: coarse) {
    .pause-menu {
      padding-bottom: 3vh;
    }
  }
</style>
