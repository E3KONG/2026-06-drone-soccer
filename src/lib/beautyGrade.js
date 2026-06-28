// In-camera grade for the beauty shot: RGB split, warm grade, vignette, grain.
// Pure Canvas2D post on the grabbed frame — no shaders, runs once per goal.
// All knobs are the magic numbers below; nudge to taste.

const noise = makeNoise(256)

function makeNoise(size) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const x = c.getContext('2d')
  const img = x.createImageData(size, size)
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.random() * 255
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v
    img.data[i + 3] = 255
  }
  x.putImageData(img, 0, 0)
  return c
}

// keep a single colour channel of `src` (mask = '#ff0000' / '#00ff00' / '#0000ff')
function channel(src, w, h, mask) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const x = c.getContext('2d')
  x.drawImage(src, 0, 0)
  x.globalCompositeOperation = 'multiply'
  x.fillStyle = mask
  x.fillRect(0, 0, w, h)
  return c
}

export function gradeBeautyShot(base) {
  const w = base.width
  const h = base.height
  const out = document.createElement('canvas')
  out.width = w
  out.height = h
  const ctx = out.getContext('2d')

  // 1) RGB split — additively recombine channels with a small horizontal offset
  const d = Math.max(1, Math.round(w * 0.0018))
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, w, h)
  ctx.globalCompositeOperation = 'lighter'
  ctx.drawImage(channel(base, w, h, '#ff0000'), d, 0)
  ctx.drawImage(channel(base, w, h, '#00ff00'), 0, 0)
  ctx.drawImage(channel(base, w, h, '#0000ff'), -d, 0)
  ctx.globalCompositeOperation = 'source-over'

  // 1b) contrast — round-trip through a filtered draw (pivots around mid grey)
  const tmp = document.createElement('canvas')
  tmp.width = w
  tmp.height = h
  tmp.getContext('2d').drawImage(out, 0, 0)
  ctx.clearRect(0, 0, w, h)
  ctx.filter = 'contrast(1.1)'
  ctx.drawImage(tmp, 0, 0)
  ctx.filter = 'none'

  // 1c) deepen blacks — multiply by self (crushes shadows, keeps highlights).
  // 0 = none, 1 = full x²; raise for darker blacks.
  tmp.getContext('2d').clearRect(0, 0, w, h)
  tmp.getContext('2d').drawImage(out, 0, 0)
  ctx.globalCompositeOperation = 'multiply'
  ctx.globalAlpha = 0.6
  ctx.drawImage(tmp, 0, 0)
  ctx.globalAlpha = 1
  ctx.globalCompositeOperation = 'source-over'

  // 2) warm colour grade
  ctx.globalCompositeOperation = 'soft-light'
  ctx.fillStyle = 'rgba(92, 193, 255, 0.1)'
  ctx.fillRect(0, 0, w, h)
  ctx.globalCompositeOperation = 'source-over'

  // 3) vignette
  const grad = ctx.createRadialGradient(
    w / 2,
    h / 2,
    Math.min(w, h) * 0.32,
    w / 2,
    h / 2,
    Math.hypot(w, h) * 0.62,
  )
  grad.addColorStop(0, 'rgba(255,255,255,0)')
  grad.addColorStop(1, 'rgba(255,255,255,0.5)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  // 4) film grain
  ctx.globalAlpha = 0.15
  ctx.globalCompositeOperation = 'overlay'
  ctx.fillStyle = ctx.createPattern(noise, 'repeat')
  ctx.fillRect(0, 0, w, h)
  ctx.globalAlpha = 1
  ctx.globalCompositeOperation = 'source-over'

  return out
}
