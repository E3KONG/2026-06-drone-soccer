export function toggleFullscreen() {
  const root = document.documentElement
  if (document.fullscreenElement || document.webkitFullscreenElement) {
    if (document.exitFullscreen) document.exitFullscreen()
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen()
    return
  }
  if (root.requestFullscreen) root.requestFullscreen()
  else if (root.webkitRequestFullscreen) root.webkitRequestFullscreen()
}
