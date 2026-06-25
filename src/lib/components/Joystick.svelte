<script>
  import nipplejs from "nipplejs";
  import { input } from "../state/input.svelte.ts";

  const isTouch = matchMedia("(pointer: coarse)").matches;
  const JOYSTICK_COLOR = "#575757";

  let leftZone = $state();
  let rightZone = $state();
  let leftActive = $state(false);
  let rightActive = $state(false);

  $effect(() => {
    if (!leftZone || !rightZone) return;

    const common = {
      mode: "static",
      size: 120,
      position: { left: "50%", top: "50%" },
      restOpacity: 0.25,
    };

    const left = nipplejs.create({
      ...common,
      zone: leftZone,
      color: JOYSTICK_COLOR,
    });
    const right = nipplejs.create({
      ...common,
      zone: rightZone,
      color: JOYSTICK_COLOR,
    });

    left.on("move", (evt) => {
      input.yaw = -evt.data.vector.x;
      input.throttle = evt.data.vector.y;
    });
    left.on("start", () => (leftActive = true));
    left.on("end", () => {
      leftActive = false;
      input.yaw = 0;
      input.throttle = 0;
    });
    right.on("move", (evt) => {
      input.roll = evt.data.vector.x;
      input.pitch = -evt.data.vector.y;
    });
    right.on("start", () => (rightActive = true));
    right.on("end", () => {
      rightActive = false;
      input.roll = 0;
      input.pitch = 0;
    });

    return () => {
      left.destroy();
      right.destroy();
    };
  });
</script>

{#if isTouch}
  <div class="joystick-layer">
    <div class="zone left" class:active={leftActive} bind:this={leftZone}></div>
    <div
      class="zone right"
      class:active={rightActive}
      bind:this={rightZone}
    ></div>
  </div>
{/if}

<style>
  .joystick-layer {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 10;
  }
  .zone {
    position: absolute;
    bottom: 0;
    width: 45%;
    height: 40%;
    pointer-events: auto;
    touch-action: none;
  }
  .zone :global(.back) {
    box-shadow: inset 2px 8px 10px rgba(0, 0, 0, 0.5);
  }
  .zone :global(.front) {
    background: var(--color-gray-100) !important;
    box-shadow:
      inset 0 2px 6px rgba(255, 255, 255, 0.6),
      inset 0 -3px 6px rgba(0, 0, 0, 0.35),
      0 8px 10px rgba(0, 0, 0, 0.8);
  }
  .zone.left :global(.front) {
    background: var(--color-blue-200) !important;
  }
  .zone.right :global(.front) {
    background: var(--color-red-100) !important;
  }
  .zone.active :global(.front) {
    opacity: 0.85 !important;
  }
  .zone.left {
    left: 0;
  }
  .zone.right {
    right: 0;
  }
</style>
