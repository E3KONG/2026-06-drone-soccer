export const goalShots = $state({ items: [] as { id: number; url: string }[] })

let nextId = 0

// Cap stored shots to bound image memory. The picker decodes every shot's <img>
// (~2-2.5MB each full-res), and embedded iOS Safari pages get killed past
// ~300-450MB. 15 keeps decoded picker memory ~35MB on touch; desktop has GBs.
const isTouch =
  typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches
const MAX_SHOTS = isTouch ? 15 : 40

export function addGoalShot(blob: Blob) {
  goalShots.items.push({ id: nextId++, url: URL.createObjectURL(blob) })
  while (goalShots.items.length > MAX_SHOTS) {
    const dropped = goalShots.items.shift()
    if (dropped) URL.revokeObjectURL(dropped.url) // free the oldest
  }
}

export function clearGoalShots() {
  for (const s of goalShots.items) URL.revokeObjectURL(s.url)
  goalShots.items = []
}
