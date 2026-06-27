<script>
  import { restartGame, toMenu } from '../state/game.svelte.ts'
  import { score } from '../state/score.svelte.ts'
  import { menuNav } from '../menuNav.js'
  import MenuItem from './MenuItem.svelte'
</script>

<div class="end">
  <div class="backdrop"></div>

  <div class="final-score">{score.value}</div>

  <p class="congrats">
    恭喜你，射進 {score.value} 球！歡迎將畫面截圖，到報導者的 FB 或 IG 貼文底下留言，和大家分享你的成績，有機會抽精美好禮喔！
  </p>

  <div class="actions" use:menuNav>
    <MenuItem onclick={restartGame}>再玩一次</MenuItem>
    <MenuItem onclick={toMenu}>回到選單</MenuItem>
  </div>
</div>

<style>
  .end {
    --u: min(0.052083333vw, 0.092592593vh);
    position: fixed;
    inset: 0;
    z-index: 35;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    font-family: 'Swei Marker Sans', system-ui, sans-serif;
    user-select: none;
  }
  .backdrop {
    position: absolute;
    inset: 0;
    z-index: -1;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(37.5px);
    -webkit-backdrop-filter: blur(37.5px);
  }
  .final-score {
    font-family: 'WDXL Lubrifont TC', system-ui, monospace;
    font-size: calc(360 * var(--u));
    line-height: 0.9;
    color: #06f;
    text-shadow: 0 0 30px #0066ff80;
  }
  .congrats {
    max-width: calc(900 * var(--u));
    margin-top: calc(30 * var(--u));
    font-size: calc(40 * var(--u));
    line-height: 1.6;
    letter-spacing: calc(-1.2 * var(--u));
    text-align: center;
    color: rgba(0, 102, 255, 0.8);
    font-weight: 500;
  }
  .actions {
    display: flex;
    gap: calc(32 * var(--u));
    margin-top: calc(56 * var(--u));
  }

  @media (orientation: portrait) {
    .end {
      --u: min(0.092592593vw, 0.052083333vh);
    }
    .actions {
      flex-direction: column;
      align-items: center;
      gap: calc(30 * var(--u));
    }
  }
</style>
