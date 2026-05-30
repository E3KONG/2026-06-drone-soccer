<script>
  import { T } from '@threlte/core'
  import { colors } from './constants/colors'
</script>

<T.Mesh rotation.x={-Math.PI / 2} position.y={-1}>
  <T.PlaneGeometry args={[30, 30]} />
  <T.MeshStandardMaterial color={colors.gray[100]} />
</T.Mesh>

<T.GridHelper args={[30, 30, colors.gray[600], colors.gray[600]]} position.y={-0.99} />
