<script>
  import { game } from '../state/game.svelte.ts'
  import { score } from '../state/score.svelte.ts'

  const start = (mode) => {
    game.mode = mode
    score.value = 0
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
  <div class="backdrop"></div>

  <h1 class="title">空中梅西你來當</h1>

  <div class="subtitle-row">
    <div class="stripes left">
      {#each [420, 400, 380] as w}<span style={`width:calc(${w} * var(--u))`}></span>{/each}
    </div>
    <p class="subtitle">挑戰無人機足球射門</p>
    <div class="stripes right">
      {#each [420, 400, 380] as w}<span style={`width:calc(${w} * var(--u))`}></span>{/each}
    </div>
  </div>

  <button class="mode match" type="button" onclick={() => start('match')}>3分鐘挑戰</button>
  <button class="mode practice" type="button" onclick={() => start('practice')}>讓我先練習</button>
</div>

<style>
  .start {
    --u: min(0.052083333vw, 0.092592593vh);
    position: fixed;
    inset: 0;
    z-index: 30;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow: hidden;
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
  .title {
    margin: 0;
    font-weight: 400;
    font-size: calc(256 * var(--u));
    line-height: 1;
    letter-spacing: calc(-7.68 * var(--u));
    color: rgba(0, 102, 255, 0.6);
    white-space: nowrap;
  }
  .subtitle-row {
    display: flex;
    align-items: center;
    gap: calc(20 * var(--u));
    margin-top: calc(40 * var(--u));
  }
  .subtitle {
    font-size: calc(64 * var(--u));
    letter-spacing: calc(-1.92 * var(--u));
    color: rgba(0, 102, 255, 0.7);
    white-space: nowrap;
  }
  .stripes {
    display: flex;
    flex-direction: column;
    gap: calc(8 * var(--u));
  }
  .stripes span {
    height: calc(15 * var(--u));
    background: linear-gradient(to right, transparent, rgba(0, 102, 255, 0.7));
  }
  .stripes.left {
    align-items: flex-end;
  }
  .stripes.right span {
    background: linear-gradient(to left, transparent, rgba(0, 102, 255, 0.7));
  }
  .mode {
    margin-top: calc(60 * var(--u));
    padding: calc(13 * var(--u)) calc(40 * var(--u));
    border: calc(3 * var(--u)) solid;
    border-radius: calc(16 * var(--u));
    background: transparent;
    font-family: inherit;
    font-size: calc(64 * var(--u));
    line-height: 1;
    letter-spacing: calc(-1.92 * var(--u));
    cursor: pointer;
    transition: filter 0.15s ease-in-out, transform 0.15s ease-in-out;
  }
  .mode.match {
    color: #06f;
    border-color: #06f;
  }
  .mode.practice {
    margin-top: calc(22 * var(--u));
    color: #66a3ff;
    border-color: #66a3ff;
  }
  .mode:hover {
    filter: drop-shadow(0 0 8px currentColor);
    transform: scale(1.03);
  }
</style>
