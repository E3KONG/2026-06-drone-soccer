<script>
  import loopUrl from '../../assets/audio/DroneSoccer_GameLoop_Deep.mp3?url'
  import { audio } from '../state/audio.svelte.ts'

  const VOLUME = 0.15 // low background bed

  const music = new Audio(loopUrl)
  music.loop = true
  music.volume = VOLUME

  // master gain (fades on mute/unmute)
  $effect(() => {
    music.volume = VOLUME * audio.gain
  })

  // autoplay is blocked until a user gesture, so try now and again on first input
  $effect(() => {
    const play = () => music.play().catch(() => {})
    play()
    const onGesture = () => {
      play()
      window.removeEventListener('pointerdown', onGesture)
      window.removeEventListener('keydown', onGesture)
    }
    window.addEventListener('pointerdown', onGesture)
    window.addEventListener('keydown', onGesture)
    return () => {
      music.pause()
      window.removeEventListener('pointerdown', onGesture)
      window.removeEventListener('keydown', onGesture)
    }
  })
</script>
