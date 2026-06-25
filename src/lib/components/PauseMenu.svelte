<script>
  import { game, restartGame } from '../state/game.svelte.ts'

  const resume = () => {
    game.paused = false
  }
  const restart = restartGame
  const toMenu = () => {
    game.paused = false
    game.started = false
  }
</script>

<div class="pause-menu">
  <div class="backdrop"></div>
  <button type="button" onclick={resume}>繼續</button>
  <button type="button" onclick={restart}>重新開始</button>
  <button type="button" onclick={toMenu}>返回主選單</button>
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
    font-family: "WDXL Lubrifont TC", system-ui, sans-serif;
    user-select: none;
  }
  .backdrop {
    position: absolute;
    inset: 0;
    z-index: -1;
    background: rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(37.5px);
    -webkit-backdrop-filter: blur(37.5px);
  }
  button {
    padding: calc(13 * var(--u)) calc(40 * var(--u));
    border: calc(3 * var(--u)) solid #06f;
    border-radius: calc(16 * var(--u));
    background: transparent;
    font-family: inherit;
    font-size: calc(64 * var(--u));
    line-height: 1;
    letter-spacing: calc(-1.92 * var(--u));
    color: #06f;
    cursor: pointer;
    transition: filter 0.15s ease-in-out, transform 0.15s ease-in-out;
  }
  button:hover {
    filter: drop-shadow(0 0 8px currentColor);
    transform: scale(1.03);
  }
</style>
