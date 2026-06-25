<script>
  import { restartGame } from '../state/game.svelte.ts'
  import { score } from '../state/score.svelte.ts'

  const replay = () => restartGame()

  const screenshot = () => {
    const canvas = document.querySelector('canvas')
    if (!canvas) return

    const out = document.createElement('canvas')
    out.width = canvas.width
    out.height = canvas.height
    const ctx = out.getContext('2d')
    ctx.drawImage(canvas, 0, 0)

    const cx = out.width / 2
    ctx.textAlign = 'center'
    ctx.fillStyle = '#06f'
    ctx.font = `${out.width * 0.16}px "WDXL Lubrifont TC", system-ui, sans-serif`
    ctx.fillText(`${score.value}`, cx, out.height * 0.42)
    ctx.font = `${out.width * 0.035}px "WDXL Lubrifont TC", system-ui, sans-serif`
    ctx.fillText(`我射進了 ${score.value} 球！`, cx, out.height * 0.52)

    out.toBlob((blob) => {
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `drone-soccer-${score.value}.png`
      a.click()
      URL.revokeObjectURL(a.href)
    })
  }
</script>

<div class="end">
  <div class="backdrop"></div>

  <div class="final-score">{score.value}</div>

  <p class="congrats">
    恭喜你，射進 {score.value} 球！歡迎將畫面截圖，到報導者的 FB 或 IG
    貼文底下留言，和大家分享你的成績，有機會抽精美好禮喔！
  </p>

  <div class="actions">
    <button type="button" onclick={replay}>再玩一次</button>
    <button type="button" onclick={screenshot}>截圖分享</button>
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
  .final-score {
    font-family: "WDXL Lubrifont TC", system-ui, monospace;
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
  }
  .actions {
    display: flex;
    gap: calc(32 * var(--u));
    margin-top: calc(56 * var(--u));
  }
  button {
    padding: calc(13 * var(--u)) calc(40 * var(--u));
    border: calc(3 * var(--u)) solid #06f;
    border-radius: calc(16 * var(--u));
    background: transparent;
    font-family: inherit;
    font-size: calc(48 * var(--u));
    line-height: 1;
    letter-spacing: calc(-1.44 * var(--u));
    color: #06f;
    cursor: pointer;
    transition: filter 0.15s ease-in-out, transform 0.15s ease-in-out;
  }
  button:hover {
    filter: drop-shadow(0 0 8px currentColor);
    transform: scale(1.03);
  }
</style>
