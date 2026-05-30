<script>
    import { T, useTask } from "@threlte/core";
    import { useGltf } from "@threlte/extras";
    import { MathUtils, Quaternion, Euler, Vector3 } from "three";
    import droneUrl from "../../assets/drone-soccer.glb?url";
    import { input } from "../state/input.svelte.ts";
    import { dronePos } from "../state/droneState.svelte.ts";

    const ACCEL = 0.01;
    const DAMPING = 0.92;
    const YAW_RATE = 0.05;
    const TILT = 0.5;
    const MAX_VEL = 0.3;
    const TILT_FACTOR = 0.05;

    const BOUNDS_MIN = new Vector3(-3.5, 0, -8);
    const BOUNDS_MAX = new Vector3(3.5, 5, 8);

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
    const moveDir = new Vector3();

    useTask(() => {
        if (!droneRef) return;

        // 先更新 yaw，再用它旋轉移動方向
        yaw += input.yaw * YAW_RATE;
        eYaw.set(0, yaw, 0);

        // pitch/roll 輸入在本地座標，旋轉到世界座標後才加速度
        moveDir.set(input.roll, 0, input.pitch).applyEuler(eYaw);

        vel.x = MathUtils.clamp(vel.x + moveDir.x * ACCEL, -MAX_VEL, MAX_VEL);
        vel.y = MathUtils.clamp(
            vel.y + input.throttle * ACCEL,
            -MAX_VEL,
            MAX_VEL,
        );
        vel.z = MathUtils.clamp(vel.z + moveDir.z * ACCEL, -MAX_VEL, MAX_VEL);

        vel.x *= DAMPING;
        vel.y *= DAMPING;
        vel.z *= DAMPING;

        droneRef.position.x += vel.x;
        droneRef.position.y += vel.y;
        droneRef.position.z += vel.z;

        // 碰到邊界先歸零對應軸的速度，再 clamp 位置
        if (droneRef.position.x < BOUNDS_MIN.x || droneRef.position.x > BOUNDS_MAX.x)
            vel.x = 0;
        if (droneRef.position.y < BOUNDS_MIN.y || droneRef.position.y > BOUNDS_MAX.y)
            vel.y = 0;
        if (droneRef.position.z < BOUNDS_MIN.z ||droneRef.position.z > BOUNDS_MAX.z)
            vel.z = 0;

        droneRef.position.clamp(BOUNDS_MIN, BOUNDS_MAX);

        // yaw quaternion（eYaw 已在上面設好）
        qYaw.setFromEuler(eYaw);

        // lerp 目前 tilt 靠近目標（input * TILT）
        currentPitch += (input.pitch * TILT - currentPitch) * TILT_FACTOR;
        currentRoll += (-input.roll * TILT - currentRoll) * TILT_FACTOR;

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
