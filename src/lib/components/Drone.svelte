<script>
    import { T, useTask } from "@threlte/core";
    import { useGltf } from "@threlte/extras";
    import { MathUtils, Euler, Vector3, Color } from "three";
    import droneUrl from "../../assets/drone-soccer.glb?url";
    import { input } from "../state/input.svelte.ts";
    import { dronePos } from "../state/droneState.svelte.ts";
    import { warning } from "../state/warning.svelte.ts";
    import { game } from "../state/game.svelte.ts";
    import { GOALS, GOAL_RING_R, GOAL_TUBE_R } from "./Goal.svelte";

    const DAMPING = 0.92;
    const GRAVITY = 0.02;
    const HOVER_THRUST = GRAVITY;
    const THROTTLE_THRUST = 0.01;
    const LIFT_COMPENSATION = 0.8;
    const YAW_ACCEL = 0.005;
    const YAW_DAMPING = 0.9;
    const THROTTLE_SMOOTH = 0.08;
    const TILT = 0.5;
    const MAX_VEL = 0.3;
    const TILT_FACTOR = 0.05;

    const DRONE_RADIUS = 0.2;
    const RESTITUTION = 0.5;

    const PROP_SPIN = 24;
    const DRONE_EMISSIVE_COLOR = "#0066FF";
    const DRONE_EMISSIVE_INTENSITY = 20;

    const MIX_THROTTLE = 12;
    const MIX_PITCH = 8;
    const MIX_ROLL = 8;
    const MIX_YAW = 8;
    const FIN_SPEED_MIN_CLAMP = 0;
    const FIN_SPEED_SMOOTH = 0.08;
    const FIN_SPEED_RED = 15;
    const FIN_SPEED_BLUE = 25;
    const FIN_COLOR_SLOW = new Color("#FF3300");
    const FIN_COLOR_FAST = new Color("#0066FF");
    const POINTER_DISTANCE = 0.4;
    const POINTER_LOCAL_FORWARD = new Vector3(0, 1, 0);
    const POINTER_TARGET_GOAL = GOALS[0];

    const FRONT_CUBE_POS = [0, 0.0025, -0.135];
    const FRONT_CUBE_SIZE = [0.005, 0.01, 0.02];
    const FRONT_CUBE_EMISSION = 10;

    const BOUNDS_MIN = new Vector3(-3.5, 0, -8).addScalar(DRONE_RADIUS);
    const BOUNDS_MAX = new Vector3(3.5, 4.5, 8).subScalar(DRONE_RADIUS);

    const SPAWN = new Vector3(0, 0.2, 6.5);

    const gltf = useGltf(droneUrl);

    let droneRef = $state();
    let goalPointerRef = $state();
    const vel = new Vector3();
    let yaw = 0;
    let yawVel = 0;
    let throttleSmooth = 0;
    let _finLogTick = 0;

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
                o.userData.sx = Math.sign(o.position.x) || 1;
                o.userData.sz = Math.sign(o.position.z) || 1;
                o.userData.curSpeed = 0;
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

    const eBody = new Euler(0, 0, 0, "YXZ");
    const thrustUp = new Vector3();
    const toDrone = new Vector3();
    const normal = new Vector3();
    const pointerDirection = new Vector3();

    const syncFollowers = () => {
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
    };

    $effect(() => {
        game.resetTick;
        if (!droneRef) return;
        droneRef.position.copy(SPAWN);
        eBody.set(0, 0, 0);
        droneRef.quaternion.setFromEuler(eBody);
        vel.set(0, 0, 0);
        yaw = 0;
        yawVel = 0;
        throttleSmooth = 0;
        currentPitch = 0;
        currentRoll = 0;
        syncFollowers();
    });

    useTask(() => {
        if (!droneRef || game.paused || (game.countdown ?? 0) > 0) return;

        yawVel += input.yaw * YAW_ACCEL;
        yawVel *= YAW_DAMPING;
        yaw += yawVel;

        currentPitch += (input.pitch * TILT - currentPitch) * TILT_FACTOR;
        currentRoll += (-input.roll * TILT - currentRoll) * TILT_FACTOR;
        eBody.set(currentPitch, yaw, currentRoll);
        droneRef.quaternion.setFromEuler(eBody);

        throttleSmooth += (input.throttle - throttleSmooth) * THROTTLE_SMOOTH;
        thrustUp.set(0, 1, 0).applyQuaternion(droneRef.quaternion);
        const upY = Math.max(thrustUp.y, 0.5);
        const comp = 1 - LIFT_COMPENSATION * (1 - upY);
        const thrust = HOVER_THRUST / comp + throttleSmooth * THROTTLE_THRUST;
        thrustUp.multiplyScalar(thrust);
        vel.add(thrustUp);
        vel.y -= GRAVITY;
        vel.clampScalar(-MAX_VEL, MAX_VEL);
        vel.multiplyScalar(DAMPING);

        const startZ = droneRef.position.z;
        droneRef.position.add(vel);

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

                const vn = vel.dot(normal);
                if (vn < 0) vel.addScaledVector(normal, -(1 + RESTITUTION) * vn);
            }

            const odx = droneRef.position.x - G.x;
            const ody = droneRef.position.y - G.y;
            const inOpening = Math.hypot(odx, ody) < GOAL_RING_R;
            if (G === GOALS[0]) {
                const dirBack = Math.sign(G.z);
                if (
                    inOpening &&
                    (startZ - G.z) * dirBack > 0 &&
                    vel.z * dirBack < 0 &&
                    (droneRef.position.z - G.z) * dirBack < DRONE_RADIUS
                ) {
                    droneRef.position.z = G.z + dirBack * DRONE_RADIUS;
                    vel.z = -vel.z * RESTITUTION;
                    warning.count++;
                }
            } else {
                const side = Math.sign(startZ - G.z) || 1;
                if (inOpening && (droneRef.position.z - G.z) * side < DRONE_RADIUS) {
                    droneRef.position.z = G.z + side * DRONE_RADIUS;
                    vel.z = -vel.z * RESTITUTION;
                    warning.count++;
                }
            }
        }

        const airborne = droneRef.position.y > BOUNDS_MIN.y + 0.01;
        const baseSpin = airborne ? PROP_SPIN : 0;
        for (const f of fins) {
            const ud = f.userData;
            const target = Math.max(
                FIN_SPEED_MIN_CLAMP,
                baseSpin +
                    throttleSmooth * MIX_THROTTLE -
                    ud.sx * input.roll * MIX_ROLL -
                    ud.sz * input.pitch * MIX_PITCH +
                    ud.spinDir * input.yaw * MIX_YAW,
            );
            ud.curSpeed += (target - ud.curSpeed) * FIN_SPEED_SMOOTH;
            f.rotateY(ud.curSpeed * ud.spinDir);
            if (ud.finMat) {
                const k = MathUtils.clamp(
                    (ud.curSpeed - FIN_SPEED_RED) /
                        (FIN_SPEED_BLUE - FIN_SPEED_RED),
                    0,
                    1,
                );
                const fade = MathUtils.clamp(ud.curSpeed / FIN_SPEED_RED, 0, 1);
                ud.finMat.color
                    .copy(FIN_COLOR_SLOW)
                    .lerp(FIN_COLOR_FAST, k)
                    .multiplyScalar(fade);
            }
        }

        // if (++_finLogTick % 20 === 0) {
        //     console.log(
        //         "fin curSpeed:",
        //         fins.map((f) => f.userData.curSpeed.toFixed(2)).join("  "),
        //         "| throttleSmooth:", throttleSmooth.toFixed(2),
        //         "| in:", `thr=${input.throttle} pit=${input.pitch} rol=${input.roll} yaw=${input.yaw}`,
        //         "| y:", droneRef.position.y.toFixed(2),
        //     );
        // }

        syncFollowers();
    });
</script>

{#if $gltf}
    <T is={$gltf.scene} bind:ref={droneRef} position={SPAWN.toArray()}>
        <T.Mesh position={FRONT_CUBE_POS}>
            <T.BoxGeometry args={FRONT_CUBE_SIZE} />
            <T.MeshStandardMaterial
                color="#0066FF"
                emissive="#0066FF"
                emissiveIntensity={FRONT_CUBE_EMISSION}
            />
        </T.Mesh>
    </T>
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
