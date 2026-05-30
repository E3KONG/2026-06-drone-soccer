<script>
    import { T, useTask } from "@threlte/core";
    import { useGltf } from "@threlte/extras";
    import { MathUtils, Quaternion, Euler } from "three";
    import droneUrl from "../../assets/Drone.glb?url";
    import { input } from "../state/input.svelte.ts";
    import { dronePos } from "../state/droneState.svelte.ts";

    const ACCEL = 0.004;
    const DAMPING = 0.92;
    const YAW_RATE = 0.03;
    const TILT = 0.5;
    const MAX_VEL = 0.3;
    const tilt_factor = 0.12;

    const gltf = useGltf(droneUrl);

    let droneRef = $state();
    const vel = { x: 0, y: 0, z: 0 };
    let yaw = 0;

    let currentPitch = 0;
    let currentRoll = 0;

    // 在 useTask 外建立，每幀重用，不重複 new
    const qYaw = new Quaternion();
    const qTilt = new Quaternion();
    const eYaw = new Euler();
    const eTilt = new Euler();

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

        // yaw quaternion（機頭朝向）
        eYaw.set(0, yaw, 0);
        qYaw.setFromEuler(eYaw);

        // lerp 目前 tilt 靠近目標（input * TILT）
        currentPitch += (input.pitch * TILT - currentPitch) * tilt_factor;
        currentRoll += (-input.roll * TILT - currentRoll) * tilt_factor;

        eTilt.set(currentPitch, 0, currentRoll);
        qTilt.setFromEuler(eTilt);

        droneRef.quaternion.copy(qYaw).multiply(qTilt);

        dronePos.x = droneRef.position.x;
        dronePos.y = droneRef.position.y;
        dronePos.z = droneRef.position.z;
        dronePos.yaw = yaw;
    });
</script>

{#if $gltf}
    <T is={$gltf.scene} bind:ref={droneRef} position.y={0.5} />
{/if}
