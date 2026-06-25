type Mode = 'practice' | 'match'

export const game = $state({
  started: false,
  mode: 'practice' as Mode,
  timeLeft: 180,
})
