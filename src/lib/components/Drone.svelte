<script>
    import { T, useTask } from "@threlte/core";
    import { useGltf } from "@threlte/extras";
    import { MathUtils, Quaternion, Euler, Vector3, Color } from "three";
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

    // 螺旋槳 motor mixing：各旋翼依輸入微調轉速（quadcopter 飛控原理）
    const MIX_THROTTLE = 12; // 升降：四片同向
    const MIX_PITCH = 8; // 前後：前/後兩片相反
    const MIX_ROLL = 8; // 左右：左/右兩片相反
    const MIX_YAW = 8; // 偏航：同轉向的對角加速
    const FIN_SPEED_MIN_CLAMP = 0; // 轉速下限，避免反轉/停轉
    const FIN_SPEED_SMOOTH = 0.08; // 轉速與顏色的平滑係數（越小越緩）
    const FIN_SPEED_RED = 15; // 此轉速(含)以下 → 紅
    const FIN_SPEED_BLUE = 25; // 此轉速(含)以上 → 藍
    const FIN_COLOR_SLOW = new Color("#FF3300");
    const FIN_COLOR_FAST = new Color("#0066FF");
    const POINTER_DISTANCE = 0.4;
    const POINTER_LOCAL_FORWARD = new Vector3(0, 1, 0);
    const POINTER_TARGET_GOAL = GOALS[0];

    // 場地內側範圍（量測自 area.glb：地板 y=0、圍網 x±3.5 / z±8 / 頂 4.5）
    // 內縮一個無人機半徑，避免機身穿過地板與圍網
    const BOUNDS_MIN = new Vector3(-3.5, 0, -8).addScalar(DRONE_RADIUS);
    const BOUNDS_MAX = new Vector3(3.5, 4.5, 8).subScalar(DRONE_RADIUS);

    const gltf = useGltf(droneUrl);

    let droneRef = $state();
    let goalPointerRef = $state();
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
                o.userData.sx = Math.sign(o.position.x) || 1; // 右為正
                o.userData.sz = Math.sign(o.position.z) || 1; // 後為正
                o.userData.curSpeed = 0;
                // 每片各自 clone 材質，才能依轉速獨立上色
                const baseMat = Array.isArray(o.material)
                    ? o.material[0]
                    : o.material;
                if (baseMat) {
                    const finMat = baseMat.clone();
                    o.material = finMat;
                    o.userData.finMat = finMat;
                }
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
    const pointerDirection = new Vector3();

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

        const startZ = droneRef.position.z; // 移動前的位置，用來判斷從哪一側接近球門
        droneRef.position.x += vel.x;
        droneRef.position.y += vel.y;
        droneRef.position.z += vel.z;

        // 撞到地板/圍網 → 以相同回彈係數反彈（與撞球門環一致）
        if (droneRef.position.x < BOUNDS_MIN.x && vel.x < 0) vel.x = -vel.x * RESTITUTION;
        else if (droneRef.position.x > BOUNDS_MAX.x && vel.x > 0) vel.x = -vel.x * RESTITUTION;
        if (droneRef.position.y < BOUNDS_MIN.y && vel.y < 0) vel.y = -vel.y * RESTITUTION;
        else if (droneRef.position.y > BOUNDS_MAX.y && vel.y > 0) vel.y = -vel.y * RESTITUTION;
        if (droneRef.position.z < BOUNDS_MIN.z && vel.z < 0) vel.z = -vel.z * RESTITUTION;
        else if (droneRef.position.z > BOUNDS_MAX.z && vel.z > 0) vel.z = -vel.z * RESTITUTION;

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

            // 單向開口：只能從正面(場地側)穿過；從背面回穿會被擋下並反彈
            const dirBack = Math.sign(G.z); // 正面→背面的方向
            const odx = droneRef.position.x - G.x;
            const ody = droneRef.position.y - G.y;
            if (
                Math.hypot(odx, ody) < GOAL_RING_R &&         // 在開口範圍內
                (startZ - G.z) * dirBack > 0 &&               // 上一刻在背側
                vel.z * dirBack < 0 &&                        // 正朝正面移動
                (droneRef.position.z - G.z) * dirBack < DRONE_RADIUS // 已逼近平面
            ) {
                droneRef.position.z = G.z + dirBack * DRONE_RADIUS;
                vel.z = -vel.z * RESTITUTION;
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

        // 螺旋槳 motor mixing：依 throttle/pitch/roll/yaw 算各片目標轉速
        // 落地時不轉（怠速 0），離地才轉到 PROP_SPIN
        const airborne = droneRef.position.y > BOUNDS_MIN.y + 0.01;
        const baseSpin = airborne ? PROP_SPIN : 0;
        for (const f of fins) {
            const ud = f.userData;
            const target = Math.max(
                FIN_SPEED_MIN_CLAMP,
                baseSpin +
                    input.throttle * MIX_THROTTLE -
                    ud.sx * input.roll * MIX_ROLL -
                    ud.sz * input.pitch * MIX_PITCH +
                    ud.spinDir * input.yaw * MIX_YAW,
            );
            // 平滑轉速（不瞬間跳變）
            ud.curSpeed += (target - ud.curSpeed) * FIN_SPEED_SMOOTH;
            f.rotateY(ud.curSpeed * ud.spinDir);
            // diffuse 顏色由平滑後的轉速決定：慢=紅、快=藍（漸變，不發光）
            if (ud.finMat) {
                const k = MathUtils.clamp(
                    (ud.curSpeed - FIN_SPEED_RED) /
                        (FIN_SPEED_BLUE - FIN_SPEED_RED),
                    0,
                    1,
                );
                // 轉速→顏色：停轉(0)為黑，升速時淡入紅，再轉藍
                const fade = MathUtils.clamp(ud.curSpeed / FIN_SPEED_RED, 0, 1);
                ud.finMat.color
                    .copy(FIN_COLOR_SLOW)
                    .lerp(FIN_COLOR_FAST, k)
                    .multiplyScalar(fade);
            }
        }

        dronePos.x = droneRef.position.x;
        dronePos.y = droneRef.position.y;
        dronePos.z = droneRef.position.z;
        dronePos.yaw = yaw;

        if (goalPointerRef) {
            pointerDirection.subVectors(POINTER_TARGET_GOAL, droneRef.position);
            if (pointerDirection.lengthSq() > 1e-6) {
                pointerDirection.normalize();
                goalPointerRef.position
                    .copy(droneRef.position)
                    .addScaledVector(pointerDirection, POINTER_DISTANCE);
                goalPointerRef.quaternion.setFromUnitVectors(
                    POINTER_LOCAL_FORWARD,
                    pointerDirection,
                );
            }
        }
    });
</script>

{#if $gltf}
    <T is={$gltf.scene} bind:ref={droneRef} position={[0,0.2,6.5]} />
{/if}

<T.Mesh bind:ref={goalPointerRef}>
    <T.ConeGeometry args={[0.02, 0.07, 12]} />
    <T.MeshStandardMaterial
        color="#FFD400"
        emissive="#FF7A00"
        emissiveIntensity={5}
        roughness={0}
    />
</T.Mesh>
