import { score } from './score.svelte.ts'

type Mode = 'practice' | 'match'

export const game = $state({
  started: false,
  paused: false,
  mode: 'practice' as Mode,
  timeLeft: 5,
  countdown: null as number | null,
  over: false,
  resetTick: 0,
})

export function restartGame() {
  score.value = 0
  if (game.mode === 'match') {
    game.timeLeft = 5
    game.countdown = 3
  }
  game.over = false
  game.resetTick++
  game.paused = false
}
