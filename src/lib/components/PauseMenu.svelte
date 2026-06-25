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
  <button class="game-button" type="button" onclick={resume}>繼續</button>
  <button class="game-button" type="button" onclick={restart}>重新開始</button>
  <button class="game-button" type="button" onclick={toMenu}>返回主選單</button>
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
</style>
