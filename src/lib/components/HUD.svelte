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
    top: 16px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: baseline;
    gap: 10px;
    padding: 8px 22px;
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.45);
    font-family: system-ui, sans-serif;
    pointer-events: none;
    user-select: none;
    z-index: 20;
  }
  .label {
    font-size: 14px;
    letter-spacing: 0.12em;
    color: var(--color-white);
    opacity: 0.8;
  }
  .value {
    font-size: 28px;
    font-weight: 700;
    color: var(--color-yellow-400);
  }
</style>
