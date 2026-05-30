<script>
  import { Grid, Edges } from '@threlte/extras'
  import { T } from '@threlte/core'
  import { colors } from '../constants/colors.ts'
</script>


<T.Mesh position={[0, 2.5, 0]}>
  <T.BoxGeometry args={[7, 5, 16]} />
  <T.MeshBasicMaterial transparent opacity={0} />
  <Edges color={colors.gray[800]} />
</T.Mesh>


<Grid
  gridSize={[7, 16]}
  cellSize={1}
  cellColor={colors.gray[800]}
  sectionSize={0}
  position.y={0.01}
/>
