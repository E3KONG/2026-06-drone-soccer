<script>
  import { score } from '../state/score.svelte.ts'
</script>

<div class="hud">
  <span class="label">SCORE</span>
  <span class="value">{score.value}</span>
</div>

<style>
  .hud {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 20px 2px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.15);
    font-family: "Bitcount Grid Single", system-ui, monospace;
    pointer-events: none;
    user-select: none;
    z-index: 20;
    -webkit-backdrop-filter: blur(3px);
    backdrop-filter: blur(3px);
    box-shadow: 1px 2px 0px 1px rgba(255, 255, 255, 0.1) inset;
  }
  .label {
    font-size: 18px;
    letter-spacing: 0.12em;
    color: var(--color-black);
  }
  .value {
    font-size: 36px;
    font-weight: 400;
    color: var(--color-blue-400);
  }
</style>
