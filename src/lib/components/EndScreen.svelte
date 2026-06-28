<script>
  import { restartGame } from '../state/game.svelte.ts'
  import { score } from '../state/score.svelte.ts'
  import { menuNav } from '../menuNav.js'
  import MenuItem from './MenuItem.svelte'
  import bgUrl from '../../assets/end/EndScreenBackground.png?url'
  import logoUrl from '../../assets/hud/kids-reporter-logo.svg?url'

  // ponytail: screenshot capture lands later; placeholder no-op for now.
  const shareScreenshot = () => {}
</script>

<div class="end">
  <img class="bg" src={bgUrl} alt="" />

  <img class="logo" src={logoUrl} alt="少年報導者 THE REPORTER FOR KIDS" />

  <div class="panel">
    <div class="final-score">{score.value}</div>
    <p class="congrats">
      恭喜你，射進 {score.value} 球！歡迎將畫面截圖，到報導者的 FB 或 IG 貼文底下留言，和大家分享你的成績，有機會抽精美好禮喔！
    </p>
  </div>

  <p class="article">
    【3D圖解】科普無人機足球的飛行祕密──「空中梅西」你來當！
  </p>

  <div class="actions" use:menuNav>
    <MenuItem onclick={restartGame}>再來一場</MenuItem>
    <MenuItem onclick={shareScreenshot}>截圖分享</MenuItem>
  </div>
</div>

<style>
  .end {
    --u: min(0.052083333vw, 0.092592593vh);
    position: fixed;
    inset: 0;
    z-index: 35;
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
  .logo {
    position: absolute;
    left: calc(61 * var(--u));
    top: calc(76 * var(--u));
    width: calc(191 * var(--u));
    height: auto;
  }
  .panel {
    position: absolute;
    top: calc(30 * var(--u));
    right: calc(78 * var(--u));
    width: fit-content;
    display: flex;
    flex-direction: column;
    gap: calc(0 * var(--u));
    align-items: flex-end;
  }
  .final-score {
    width: max-content;
    font-size: var(--fs-xl);
    line-height: 0.9;
    text-align: right;
    letter-spacing: calc(-12 * var(--u));
    color: rgba(255, 255, 255, 0.85);
    text-shadow: 0 calc(3 * var(--u)) calc(6 * var(--u)) rgba(0, 0, 0, 0.25);
  }
  .congrats {
    width: 0;
    min-width: 100%;
    font-family: 'Swei Marker Sans', system-ui, sans-serif;
    font-weight: 500;
    font-size: calc(var(--fs-sm) * 0.7);
    line-height: 1.1;
    letter-spacing: calc(-1.08 * var(--u));
    text-align: justify;
    color: #fff;
    text-shadow: 0 calc(4 * var(--u)) calc(4 * var(--u)) rgba(0, 0, 0, 0.25);
  }
  .article {
    position: absolute;
    left: calc(61 * var(--u));
    bottom: calc(85 * var(--u));
    font-family: 'Swei Marker Sans', system-ui, sans-serif;
    font-weight: 700;
    font-size: var(--fs-xs);
    letter-spacing: calc(-0.96 * var(--u));
    white-space: nowrap;
    color: #fff;
    text-shadow: 0 calc(4 * var(--u)) calc(4 * var(--u)) rgba(0, 0, 0, 0.25);
  }
  .actions {
    position: absolute;
    right: calc(78 * var(--u));
    bottom: calc(99 * var(--u));
    display: flex;
    gap: calc(50 * var(--u));
    align-items: center;
  }

  @media (orientation: portrait) {
    .end {
      --u: min(0.092592593vw, 0.052083333vh);
    }
    .logo {
      left: 50%;
      transform: translateX(-50%);
      top: calc(120 * var(--u));
      width: calc(320 * var(--u));
    }
    .panel {
      left: 50%;
      right: auto;
      top: 50%;
      transform: translate(-50%, -50%);
      width: calc(900 * var(--u));
      align-items: center;
      text-align: center;
    }
    .congrats {
      text-align: center;
    }
    .article {
      left: 50%;
      transform: translateX(-50%);
      bottom: calc(360 * var(--u));
      white-space: normal;
      max-width: calc(900 * var(--u));
      text-align: center;
    }
    .actions {
      left: 50%;
      right: auto;
      transform: translateX(-50%);
      bottom: calc(160 * var(--u));
      flex-direction: column;
      gap: calc(30 * var(--u));
    }
  }
</style>
