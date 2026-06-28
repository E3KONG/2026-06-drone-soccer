<script>
  import { game } from '../state/game.svelte.ts'
  import triangleUrl from '../../assets/hud/Flash-triangle.svg?url'

  const leftHints = { n: '上升', s: '下降', w: '逆時針', e: '順時針' }
  const rightHints = { n: '前進', s: '後退', w: '左移', e: '右移' }
  const dirs = ['n', 's', 'w', 'e']
</script>

{#if game.showGuide || (game.mode === 'practice' && game.controlGuide && !game.paused)}
  <div class="touch-controls" aria-hidden="true">
    {#each [['left', leftHints], ['right', rightHints]] as [side, hints]}
      <div class="stick {side}">
        <div class="stick-base"></div>
        {#if game.showGuide}
          <!-- menu preview has no live Joystick, so draw a static knob -->
          <div class="stick-knob"></div>
        {/if}
        {#each dirs as dir}
          <img class="stick-arrow {dir}" src={triangleUrl} alt="" />
          <span class="stick-hint {dir}">{hints[dir]}</span>
        {/each}
      </div>
    {/each}
  </div>
{/if}

<style>
  .touch-controls {
    position: fixed;
    inset: 0;
    z-index: 19;
    pointer-events: none;
    font-family: 'WDXL Lubrifont TC', system-ui, sans-serif;
    user-select: none;
  }
  .stick {
    --stick: 140px;
    --hint-dist: calc(var(--stick) / 4 + 30px);
    position: absolute;
    bottom: calc(20vh - var(--stick) / 2 + var(--stick) / 4);
    width: var(--stick);
    height: var(--stick);
  }
  .stick.left {
    left: calc(24vw - var(--stick) / 2);
  }
  .stick.right {
    right: calc(24vw - var(--stick) / 2);
  }

  .stick-base {
    position: absolute;
    top: 50%;
    left: 50%;
    width: calc(2 * var(--hint-dist) + 2 * var(--fs-sm));
    height: calc(2 * var(--hint-dist) + 2 * var(--fs-sm));
    transform: translate(-50%, -50%);
    border-radius: 40%;
    background: radial-gradient(at 75% 75%, #f2f2f2 0%, #bababa 100%);
    box-shadow:
      0 -3px 3px rgba(255, 255, 255, 0.5),
      0 3px 3px rgba(255, 255, 255, 0.1),
      inset 3px 3px 10px rgba(0, 0, 0, 0.1),
      inset 0 -3px 3px rgba(255, 255, 255, 0.05);
  }

  /* static knob for the menu preview — mirrors the nipplejs .front stick */
  .stick-knob {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 70px;
    height: 70px;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    background: radial-gradient(at 50% 75%, #f2f2f2 0%, #d9d9d9 100%);
    box-shadow:
      inset 3px 3px 6px rgba(255, 255, 255, 0.3),
      inset -3px -3px 6px rgba(0, 0, 0, 0.15),
      0 1px 6px -3px rgba(0, 0, 0, 0.7),
      0 2px 10px -6px rgba(0, 0, 0, 0.2),
      -30px 0 24px -10px rgba(0, 0, 0, 0.2),
      30px 30px 24px -10px rgba(0, 0, 0, 0.1);
  }
  .stick-knob::before {
    content: '';
    position: absolute;
    top: 6px;
    left: 29px;
    width: 2px;
    height: 2px;
    border-radius: 50%;
    background: #fff;
    box-shadow:
      0 1px 2px #000,
      23px 24px #fff,
      23px 25px 2px #000,
      0 48px #fff,
      0 49px 2px #000,
      -23px 24px #fff,
      -23px 25px 2px #000;
    opacity: 0.15;
  }

  .stick-arrow {
    --arrow-dist: calc(var(--stick) / 4 + 10px);
    position: absolute;
    top: 50%;
    left: 50%;
    width: calc(var(--stick) * 0.1);
    height: auto;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  }
  .stick-arrow.n {
    transform: translate(-50%, -50%) translateY(calc(-1 * var(--arrow-dist)));
  }
  .stick-arrow.s {
    transform: translate(-50%, -50%) translateY(var(--arrow-dist))
      rotate(180deg);
  }
  .stick-arrow.w {
    transform: translate(-50%, -50%) translateX(calc(-1 * var(--arrow-dist)))
      rotate(-90deg);
  }
  .stick-arrow.e {
    transform: translate(-50%, -50%) translateX(var(--arrow-dist)) rotate(90deg);
  }

  .stick-hint {
    position: absolute;
    top: 50%;
    left: 50%;
    width: max-content;
    font-size: var(--fs-sm);
    color: rgba(255, 255, 255, 0.95);
    text-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
    white-space: nowrap;
    letter-spacing: 1px;
  }
  .stick-hint.n {
    transform: translate(-50%, -50%) translateY(calc(-1 * var(--hint-dist)));
  }
  .stick-hint.s {
    transform: translate(-50%, -50%) translateY(var(--hint-dist));
  }
  .stick-hint.w {
    transform: translate(-50%, -50%) translateX(calc(-1 * var(--hint-dist)));
    writing-mode: vertical-rl;
  }
  .stick-hint.e {
    transform: translate(-50%, -50%) translateX(var(--hint-dist));
    writing-mode: vertical-rl;
  }

  @media (pointer: fine) {
    .touch-controls {
      display: none;
    }
  }
</style>
