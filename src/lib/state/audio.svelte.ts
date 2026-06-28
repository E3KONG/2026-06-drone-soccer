// `muted` is the toggle intent (drives the icon); `gain` is the animated master
// volume multiplier every audio source multiplies into. Muting drops fast to 0,
// unmuting fades slowly back up.
// `muted` is the toggle intent (drives the icon); `gain` is the animated master
// volume multiplier every audio source multiplies into.
export const audio = $state({ muted: true, gain: 0 })

const FADE_UP = 1.2 // seconds to fade back up
const FADE_DOWN = 0.15 // seconds to drop to silence

let raf = 0
let last = 0
function tick(t: number) {
  const dt = Math.min((t - last) / 1000, 0.1)
  last = t
  const target = audio.muted ? 0 : 1
  const rate = 1 / (audio.muted ? FADE_DOWN : FADE_UP)
  if (audio.gain < target) audio.gain = Math.min(target, audio.gain + rate * dt)
  else audio.gain = Math.max(target, audio.gain - rate * dt)
  raf = audio.gain === target ? 0 : requestAnimationFrame(tick)
}

export function toggleMute() {
  audio.muted = !audio.muted
  if (!raf) {
    last = performance.now()
    raf = requestAnimationFrame(tick)
  }
}
