interface InputState {
  throttle: number
  yaw: number
  pitch: number
  roll: number
}

export const input: InputState = $state({
  throttle: 0,
  yaw: 0,
  pitch: 0,
  roll: 0,
})

export function resetInput() {
  input.throttle = 0
  input.yaw = 0
  input.pitch = 0
  input.roll = 0
}
