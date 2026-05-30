interface DroneState {
  x: number
  y: number
  z: number
  yaw: number
}

export const dronePos: DroneState = $state({ x: 0, y: 0.5, z: 0, yaw: 0 })
