<script>
    import { T, useTask } from "@threlte/core";
    import { useGltf } from "@threlte/extras";
    import { MathUtils, Quaternion, Euler, Vector3 } from "three";
    import droneUrl from "../../assets/drone-soccer.glb?url";
    import { input } from "../state/input.svelte.ts";
    import { dronePos } from "../state/droneState.svelte.ts";
    import { GOALS, GOAL_RING_R, GOAL_TUBE_R } from "./Goal.svelte";

    const ACCEL = 0.01;
    const DAMPING = 0.92;
    const YAW_RATE = 0.05;
    const TILT = 0.5;
    const MAX_VEL = 0.3;
    const TILT_FACTOR = 0.05;

    const DRONE_RADIUS = 0.2;
    const RESTITUTION = 0.5;

    const PROP_SPIN = 24;
    const DRONE_EMISSIVE_COLOR = "#0066FF";
    const DRONE_EMISSIVE_INTENSITY = 20;

    const BOUNDS_MIN = new Vector3(-3.5, 0, -8);
    const BOUNDS_MAX = new Vector3(3.5, 5, 8);

    const gltf = useGltf(droneUrl);

    let droneRef = $state();
    const vel = { x: 0, y: 0, z: 0 };
    let yaw = 0;

    // 螺旋槳：載入後找出 4 片，對角配對反向旋轉
    let fins = [];
    $effect(() => {
        const g = $gltf;
        if (!g) return;
        fins = [];
        g.scene.traverse((o) => {
            const m = o.name.match(/^Fin_export_(\d+)/);
            if (m) {
                const i = Number(m[1]);
                o.userData.spinDir = i === 0 || i === 3 ? 1 : -1;
                fins.push(o);
            }

            const materials = Array.isArray(o.material)
                ? o.material
                : o.material
                    ? [o.material]
                    : [];
            for (const material of materials) {
                if (material.name === "Led strip - Friends" && material.emissiveMap) {
                    material.emissive.set(DRONE_EMISSIVE_COLOR);
                    material.emissiveIntensity = DRONE_EMISSIVE_INTENSITY;
                    material.needsUpdate = true;
                }
            }
        });
    });

    let currentPitch = 0;
    let currentRoll = 0;

    // 在 useTask 外建立，每幀重用，不重複 new
    const qYaw = new Quaternion();
    const qTilt = new Quaternion();
    const eYaw = new Euler();
    const eTilt = new Euler();
    const moveDir = new Vector3();
    const toDrone = new Vector3();
    const normal = new Vector3();

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

        const surfaceDist = GOAL_TUBE_R + DRONE_RADIUS;
        for (const G of GOALS) {
            toDrone.copy(droneRef.position).sub(G);
            const planar = Math.hypot(toDrone.x, toDrone.y);
            const dr = planar - GOAL_RING_R;
            const d = Math.hypot(dr, toDrone.z);

            if (d < surfaceDist && planar > 1e-4) {
                normal.set(
                    (toDrone.x / planar) * (dr / d),
                    (toDrone.y / planar) * (dr / d),
                    toDrone.z / d,
                );
                droneRef.position.addScaledVector(normal, surfaceDist - d);

                const vn = vel.x * normal.x + vel.y * normal.y + vel.z * normal.z;
                if (vn < 0) {
                    const j = (1 + RESTITUTION) * vn;
                    vel.x -= j * normal.x;
                    vel.y -= j * normal.y;
                    vel.z -= j * normal.z;
                }
            }
        }

        // yaw quaternion（eYaw 已在上面設好）
        qYaw.setFromEuler(eYaw);

        // lerp 目前 tilt 靠近目標（input * TILT）
        currentPitch += (input.pitch * TILT - currentPitch) * TILT_FACTOR;
        currentRoll += (-input.roll * TILT - currentRoll) * TILT_FACTOR;

        eTilt.set(currentPitch, 0, currentRoll);
        qTilt.setFromEuler(eTilt);

        droneRef.quaternion.copy(qYaw).multiply(qTilt);

        // 螺旋槳持續旋轉，移動越快轉越快
        const speed = Math.hypot(vel.x, vel.y, vel.z);
        const spin = PROP_SPIN + speed * 3;
        for (const f of fins) f.rotateY(spin * f.userData.spinDir);

        dronePos.x = droneRef.position.x;
        dronePos.y = droneRef.position.y;
        dronePos.z = droneRef.position.z;
        dronePos.yaw = yaw;
    });
</script>

{#if $gltf}
    <T is={$gltf.scene} bind:ref={droneRef} position.y={0.5} />
{/if}
