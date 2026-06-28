// Random hero-angle pose for the goal beauty shot. Orbits `target`, kept on the
// field side so it always looks back toward goal A. Ranges are [min, max].
const DIST = [1.5, 2]
const FOV = [20, 70]
const DIST_PORTRAIT = [1.5, 3.2]
const FOV_PORTRAIT = [20, 85]
const AZIMUTH = [-Math.PI / 1, Math.PI / 1] // 0 = straight in front of the goal
const ELEVATION = [-0.15, 0.75] // radians; negative looks up at the drone

const rand = (a, b) => a + Math.random() * (b - a)

// randomize a pose and apply it to `cam`, aimed at `target` ({x, y, z}).
export function applyBeautyPose(cam, target) {
  const portrait = matchMedia('(orientation: portrait)').matches
  const az = rand(...AZIMUTH)
  const el = rand(...ELEVATION)
  const dist = rand(...(portrait ? DIST_PORTRAIT : DIST))
  const ch = Math.cos(el) * dist // horizontal reach
  cam.position.set(
    target.x + ch * Math.sin(az),
    target.y + dist * Math.sin(el),
    target.z + ch * Math.cos(az), // +z keeps the camera on the field side
  )
  cam.fov = rand(...(portrait ? FOV_PORTRAIT : FOV))
  cam.lookAt(target.x, target.y, target.z)
  cam.updateProjectionMatrix()
}
