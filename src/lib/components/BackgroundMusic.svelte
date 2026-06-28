<script>
  import loopUrl from '../../assets/audio/DroneSoccer_GameLoop_Deep.mp3?url'
  import { audio } from '../state/audio.svelte.ts'

  const VOLUME = 0.15 // low background bed

  const music = new Audio(loopUrl)
  music.loop = true

  // volume fade on desktop/Android (iOS ignores volume — handled by pause below)
  $effect(() => {
    music.volume = VOLUME * audio.gain
  })

  // hard play/stop: the reliable silence on iOS, and actually stops audio while
  // muted. Unmuting is always via a tap/key, so play() runs within a gesture.
  $effect(() => {
    if (audio.muted) music.pause()
    else music.play().catch(() => {})
  })
</script>
