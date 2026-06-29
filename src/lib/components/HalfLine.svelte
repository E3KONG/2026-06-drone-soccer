<script>
  import { T } from '@threlte/core'
  import {
    BufferGeometry,
    Float32BufferAttribute,
    Color,
    DoubleSide,
  } from 'three'
  import { score } from '../state/score.svelte.ts'

  const WIDTH = 6.95
  const HEIGHT = 4.5

  // 兩種狀態各自獨立設定。glow 需超過 Effects.svelte 的 BLOOM_THRESHOLD(2.0) 才會發光；
  const VIOLET = {
    color: '#cf69f7',
    cols: 6,
    rows: 4,
    glow: 20,
    faceOpacity: 0.3,
  } // 須回防(未武裝)
  const WHITE = { color: '#ffffff', cols: 1, rows: 1, glow: 5, faceOpacity: 0 } // 已回防(可得分)

  // 純格線(無對角線)：手動產生水平/垂直線段
  const makeGrid = (cols, rows) => {
    const pts = []
    for (let i = 0; i <= cols; i++) {
      const x = -WIDTH / 2 + (i * WIDTH) / cols
      pts.push(x, -HEIGHT / 2, 0, x, HEIGHT / 2, 0)
    }
    for (let j = 0; j <= rows; j++) {
      const y = -HEIGHT / 2 + (j * HEIGHT) / rows
      pts.push(-WIDTH / 2, y, 0, WIDTH / 2, y, 0)
    }
    const g = new BufferGeometry()
    g.setAttribute('position', new Float32BufferAttribute(pts, 3))
    return g
  }

  const build = (c) => ({
    ...c,
    geo: makeGrid(c.cols, c.rows),
    glowColor: new Color(c.color).multiplyScalar(c.glow),
  })
  const violet = build(VIOLET)
  const white = build(WHITE)

  const cfg = $derived(score.armed ? white : violet)
</script>

<T.Group position.y={HEIGHT / 2}>
  <!-- 發光格線：未回防為紫、已回防為白 -->
  <T.LineSegments geometry={cfg.geo}>
    <T.LineBasicMaterial
      toneMapped={false}
      transparent
      opacity={0.9}
      color={cfg.glowColor}
    />
  </T.LineSegments>

  <!-- 半透明面 -->
  {#if cfg.faceOpacity > 0}
    <T.Mesh>
      <T.PlaneGeometry args={[WIDTH, HEIGHT]} />
      <T.MeshBasicMaterial
        color={cfg.color}
        transparent
        opacity={cfg.faceOpacity}
        side={DoubleSide}
        depthWrite={false}
      />
    </T.Mesh>
  {/if}
</T.Group>
