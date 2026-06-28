<script>
  import { restartGame } from '../state/game.svelte.ts'
  import { score } from '../state/score.svelte.ts'
  import { menuNav } from '../menuNav.js'
  import MenuItem from './MenuItem.svelte'
  import bgUrl from '../../assets/end/EndScreenBackground.webp?url'
  import logoUrl from '../../assets/hud/kids-reporter-logo.svg?url'
  import { toPng } from 'html-to-image'
  import { tick } from 'svelte'

  let endEl
  let bgEl
  let capturing = $state(false)

  const shareScreenshot = async () => {
    capturing = true
    await tick()
    await document.fonts.ready
    await new Promise((r) => requestAnimationFrame(r))
    try {
      const rect = endEl.getBoundingClientRect()
      const scale = 2
      const w = Math.round(rect.width * scale)
      const h = Math.round(rect.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')

      // 1) Background drawn natively (drawImage is reliable on iOS; foreignObject
      //    drops it). Replicate object-fit: cover + the portrait object-position.
      const portrait = matchMedia('(orientation: portrait)').matches
      const iw = bgEl.naturalWidth
      const ih = bgEl.naturalHeight
      const s = Math.max(w / iw, h / ih)
      const posX = portrait ? 0.33 : 0.5 // matches the CSS object-position
      ctx.drawImage(
        bgEl,
        (w - iw * s) * posX,
        (h - ih * s) * 0.5,
        iw * s,
        ih * s
      )
      // brightness(0.5) on portrait == 50% black overlay over an opaque image
      if (portrait) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
        ctx.fillRect(0, 0, w, h)
      }

      // 2) Text + logo overlay, captured transparent (bg hidden so it isn't
      //    routed through the broken foreignObject image path).
      bgEl.style.visibility = 'hidden'
      const overlayUrl = await toPng(endEl, { pixelRatio: scale })
      bgEl.style.visibility = ''
      const overlay = new Image()
      overlay.src = overlayUrl
      await overlay.decode()
      ctx.drawImage(overlay, 0, 0, w, h)

      const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'))
      const file = new File([blob], 'drone-soccer.png', { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] })
      } else {
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = 'drone-soccer.png'
        a.click()
        URL.revokeObjectURL(a.href)
      }
    } catch (e) {
      console.error('screenshot failed', e)
    } finally {
      capturing = false
    }
  }
</script>

<div class="end" class:capturing bind:this={endEl}>
  <img class="bg" src={bgUrl} alt="" bind:this={bgEl} />

  <img class="logo" src={logoUrl} alt="少年報導者 THE REPORTER FOR KIDS" />

  <div class="panel">
    <div class="final-score">{score.value}</div>
    <div class="goals">GOALS</div>
    <p class="congrats">
      恭喜你，射進 {score.value} 球！<br class="brk" />
      歡迎將畫面截圖，<br class="brk" />
      到報導者FB或IG貼文留言，<br class="brk" />
      和大家分享你的成績，<br class="brk" />
      有機會抽精美好禮喔！
    </p>
  </div>

  <div class="divider"></div>
  <p class="article">
    【3D圖解】科普無人機足球的飛行祕密<span class="dash">──</span><br
      class="brk"
    />「空中梅西」你來當！
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
    align-items: flex-end;
  }
  .final-score {
    width: max-content;
    font-size: var(--fs-xl);
    line-height: 0.9;
    text-align: right;
    letter-spacing: calc(-12 * var(--u));
    color: rgba(255, 255, 255, 1);
    text-shadow: 0 calc(3 * var(--u)) calc(10 * var(--u))
      rgba(255, 255, 255, 0.5);
  }
  .goals {
    display: none;
    font-family: 'WDXL Lubrifont TC', system-ui, sans-serif;
    font-size: calc(var(--fs-lg) * 0.8);
    line-height: 0.5;
    letter-spacing: calc(1 * var(--u));
    color: #fff;
    text-shadow: 0 calc(3 * var(--u)) calc(10 * var(--u))
      rgba(255, 255, 255, 0.5);
  }
  .capturing .congrats,
  .capturing .actions {
    display: none;
  }
  .capturing .goals {
    display: block;
  }
  .congrats {
    width: 0;
    min-width: 100%;
    font-family: 'Swei Marker Sans', system-ui, sans-serif;
    font-weight: 500;
    font-size: calc(var(--fs-sm) * 0.7);
    line-height: 1.3;
    letter-spacing: calc(2 * var(--u));
    text-align: justify;
    color: #fff;
    text-shadow: 0 calc(4 * var(--u)) calc(4 * var(--u)) rgba(0, 0, 0, 0.2);
  }
  .divider {
    position: absolute;
    left: calc(61 * var(--u));
    bottom: calc(145 * var(--u));
    width: calc(418 * var(--u));
    height: calc(3 * var(--u));
    background: linear-gradient(
      to right,
      rgba(255, 255, 255, 0.5),
      rgba(255, 255, 255, 0)
    );
  }
  .article {
    position: absolute;
    left: calc(44 * var(--u));
    bottom: calc(85 * var(--u));
    font-family: 'Swei Marker Sans', system-ui, sans-serif;
    font-weight: 500;
    font-size: var(--fs-xs);
    letter-spacing: calc(2 * var(--u));
    line-height: 130%;
    white-space: nowrap;
    color: #fff;
    text-shadow: 0 calc(4 * var(--u)) calc(4 * var(--u)) rgba(0, 0, 0, 0.25);
  }
  .brk {
    display: none;
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
    .bg {
      filter: brightness(0.5);
      object-position: 33% center;
    }
    .logo {
      left: 50%;
      transform: translateX(-50%);
      top: calc(100 * var(--u));
      width: calc(320 * var(--u));
    }
    .panel {
      left: 50%;
      right: auto;
      top: calc(200 * var(--u));
      transform: translateX(-50%);
      width: 100vw;
      align-items: center;
      text-align: center;
    }
    .final-score {
      text-shadow: none;
    }
    .goals {
      font-size: calc(var(--fs-lg) * 0.6);
      text-shadow: none;
    }
    .congrats {
      text-align: center;
      font-size: calc(var(--fs-sm) * 0.9);
    }
    .divider {
      left: 50%;
      transform: translateX(-50%);
      bottom: calc(240 * var(--u));
      width: calc(626 * var(--u));
      background: linear-gradient(
        to right,
        rgba(255, 255, 255, 0),
        rgba(255, 255, 255, 0.5),
        rgba(255, 255, 255, 0)
      );
    }
    .article {
      left: 50%;
      transform: translateX(-50%);
      bottom: calc(100 * var(--u));
      white-space: normal;
      width: 100vw;
      text-align: center;
    }
    .brk {
      display: inline;
    }
    .article .dash {
      display: none;
    }
    .actions {
      left: 50%;
      right: auto;
      transform: translateX(-50%);
      bottom: calc(300 * var(--u));
      flex-direction: column-reverse;
      gap: calc(30 * var(--u));
    }
  }
</style>
