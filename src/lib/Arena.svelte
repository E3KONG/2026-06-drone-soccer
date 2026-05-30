<script>
  import { T } from '@threlte/core'
</script>

<T.Mesh rotation.x={-Math.PI / 2} position.y={-1}>
  <T.PlaneGeometry args={[30, 30]} />
  <T.MeshStandardMaterial color="#1a1a2e" />
</T.Mesh>

<T.GridHelper args={[30, 30, '#334', '#223']} position.y={-0.99} />
