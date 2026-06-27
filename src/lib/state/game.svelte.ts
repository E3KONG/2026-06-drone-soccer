import { score } from './score.svelte.ts'
import { resetInput } from './input.svelte.ts'

type Mode = 'practice' | 'match'

export const game = $state({
  started: false,
  paused: false,
  mode: 'practice' as Mode,
  timeLeft: 180,
  countdown: null as number | null,
  over: false,
  resetTick: 0,
})

export function restartGame() {
  resetInput()
  score.value = 0
  if (game.mode === 'match') {
    game.timeLeft = 180
    game.countdown = 3
  }
  game.over = false
  game.resetTick++
  game.paused = false
}

export function toMenu() {
  resetInput()
  game.resetTick++
  game.paused = false
  game.started = false
  game.over = false
}
