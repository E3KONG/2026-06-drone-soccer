<script>
  import nipplejs from "nipplejs";
  import { input } from "../state/input.svelte.ts";

  const isTouch = matchMedia("(pointer: coarse)").matches;
  const JOYSTICK_COLOR = "#d9d9d9";

  let leftZone = $state();
  let rightZone = $state();
  let leftActive = $state(false);
  let rightActive = $state(false);

  $effect(() => {
    if (!leftZone || !rightZone) return;

    const common = {
      mode: "static",
      size: 80, // travel radius = size/2 = 40px. Knob + base sized independently in CSS.
      position: { left: "50%", top: "50%" },
      restOpacity: 1,
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
    z-index: 20;
  }
  .zone {
    position: absolute;
    bottom: 0;
    width: 48%;
    height: 40%;
    pointer-events: auto;
    touch-action: none;
  }
  /* Base ring (.joystick) — sized independently of nipplejs travel */
  .zone :global(.back) {
    overflow: visible !important;
    width: 140px !important;
    height: 140px !important;
    margin-left: -70px !important;
    margin-top: -70px !important;
    background: radial-gradient(at 75% 75%, #f2f2f2 0%, #bababa 100%) !important;
    box-shadow:
      0 -3px 3px rgba(255, 255, 255, 0.5),
      0 3px 3px rgba(255, 255, 255, 0.1),
      inset 3px 3px 10px rgba(0, 0, 0, 0.1),
      inset 0 -3px 3px rgba(255, 255, 255, 0.05);
  }
  /* Recessed ball cavity (.joystick__ball) */
  .zone :global(.back)::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 75%;
    height: 75%;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    background: radial-gradient(at 25% 25%, #f2f2f2 0%, #d9d9d9 100%);
    box-shadow:
      inset -3px -6px 24px rgba(0, 0, 0, 0.05),
      inset 0 0 6px rgba(0, 0, 0, 0.3),
      inset 0 0 6px rgba(0, 0, 0, 0.5),
      inset 0 0 3px rgba(0, 0, 0, 0.1),
      0 0 6px rgba(0, 0, 0, 0.3);
  }
  /* Glossy stick (.joystick__stick) — pinned to 60px so the specular dots stay aligned */
  .zone :global(.front) {
    opacity: 1 !important;
    width: 70px !important;
    height: 70px !important;
    margin-left: -35px !important;
    margin-top: -35px !important;
    background: radial-gradient(at 50% 75%, #f2f2f2 0%, #d9d9d9 100%) !important;
    box-shadow:
      inset 3px 3px 6px rgba(255, 255, 255, 0.3),
      inset -3px -3px 6px rgba(0, 0, 0, 0.15),
      0 1px 6px -3px rgba(0, 0, 0, 0.7),
      0 2px 10px -6px rgba(0, 0, 0, 0.2),
      -30px 0 24px -10px rgba(0, 0, 0, 0.2),
      30px 30px 24px -10px rgba(0, 0, 0, 0.1);
  }
  /* Specular highlight dots (.joystick__stick:before) */
  .zone :global(.front)::before {
    content: "";
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
  /* Soft directional shadow (.joystick__stick:after) */
  .zone :global(.front)::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 50%;
    height: 50%;
    margin: -25% -25%;
    border-radius: 50%;
    box-shadow: -3px -3px 12px -6px;
    filter: blur(3px);
    opacity: 0.4;
  }
  .zone.left {
    left: 0;
  }
  .zone.right {
    right: 0;
  }
</style>
