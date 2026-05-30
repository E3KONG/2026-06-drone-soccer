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
