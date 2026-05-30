<script>
    import { T, useTask } from "@threlte/core";
    import { useGltf } from "@threlte/extras";
    import { MathUtils } from "three";
    import droneUrl from "../assets/Drone.glb?url";
    import { input } from "./input.svelte.js";
    import { dronePos } from "./droneState.svelte.js";

    const ACCEL = 0.004;
    const DAMPING = 0.92;
    const YAW_RATE = 0.03;
    const TILT = 0.4;
    const MAX_VEL = 0.3;

    const gltf = useGltf(droneUrl);

    let droneRef = $state();
    const vel = { x: 0, y: 0, z: 0 };
    let yaw = 0;

    useTask((delta) => {
        if (!droneRef) return;

        vel.x = MathUtils.clamp(vel.x + input.roll * ACCEL, -MAX_VEL, MAX_VEL);
        vel.y = MathUtils.clamp(
            vel.y + input.throttle * ACCEL,
            -MAX_VEL,
            MAX_VEL,
        );
        vel.z = MathUtils.clamp(vel.z + input.pitch * ACCEL, -MAX_VEL, MAX_VEL);
        yaw += input.yaw * YAW_RATE;

        vel.x *= DAMPING;
        vel.y *= DAMPING;
        vel.z *= DAMPING;

        droneRef.position.x += vel.x;
        droneRef.position.y += vel.y;
        droneRef.position.z += vel.z;
        droneRef.rotation.y = yaw;
        droneRef.rotation.x = -vel.z * TILT;
        droneRef.rotation.z = -vel.x * TILT;

        dronePos.x = droneRef.position.x;
        dronePos.y = droneRef.position.y;
        dronePos.z = droneRef.position.z;
        dronePos.yaw = yaw;
    });
</script>

{#if $gltf}
    <T is={$gltf.scene} bind:ref={droneRef} position.y={0.5} />
{/if}
