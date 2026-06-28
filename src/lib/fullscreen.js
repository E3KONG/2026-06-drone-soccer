// True when this document is actually allowed to go fullscreen. False on iOS
// Safari (element fullscreen is video-only) and in iframes without
// allow="fullscreen" — in those cases we open the standalone game in a new tab.
export function canFullscreen() {
  return Boolean(document.fullscreenEnabled || document.webkitFullscreenEnabled)
}

export function toggleFullscreen() {
  if (!canFullscreen()) {
    window.open(window.location.href, '_blank', 'noopener')
    return
  }
  const root = document.documentElement
  if (document.fullscreenElement || document.webkitFullscreenElement) {
    if (document.exitFullscreen) document.exitFullscreen()
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen()
    return
  }
  if (root.requestFullscreen) root.requestFullscreen()
  else if (root.webkitRequestFullscreen) root.webkitRequestFullscreen()
}
